/**
 * TikTok Marketing API 数据适配器
 * 负责：OAuth令牌管理、广告数据拉取、数据标准化
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getTikTokConfig, getSupabaseCredentials, getSupabaseServiceRoleKey } from '@/storage/database/supabase-client';

// TikTok Marketing API 配置
const TIKTOK_API_BASE = 'https://business-api.tiktok.com/open_api/v1.3';

interface TikTokCredentials {
  appId: string;
  appSecret: string;
}

interface TikTokTokenResponse {
  data: {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
    advertiser_ids?: string[];
  };
  message: string;
  code: number;
}

interface TikTokAdData {
  campaign_id: string;
  campaign_name: string;
  adgroup_id: string;
  adgroup_name: string;
  ad_id: string;
  ad_name: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  cpm: number;
  roas?: number;
}

interface PlatformConnection {
  id: string;
  user_id: string;
  platform: string;
  access_token: string;
  refresh_token: string;
  token_expires_at: string;
  extra_config: Record<string, unknown>;
}

interface SyncLog {
  id: string;
}

// 获取 TikTok App 配置
export function getTikTokCredentials(): TikTokCredentials {
  const config = getTikTokConfig();
  
  if (!config) {
    throw new Error('TikTok App ID and Secret are required. Please set TIKTOK_APP_ID and TIKTOK_APP_SECRET environment variables.');
  }
  
  return config;
}

// 刷新 access_token
export async function refreshTikTokToken(
  refreshToken: string,
  credentials: TikTokCredentials
): Promise<TikTokTokenResponse> {
  const response = await fetch(`${TIKTOK_API_BASE}/oauth2/refresh_token/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: credentials.appId,
      client_secret: credentials.appSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });
  
  return response.json();
}

// 获取广告账户列表
export async function getAdvertiserIds(accessToken: string): Promise<string[]> {
  const response = await fetch(`${TIKTOK_API_BASE}/oauth2/advertiser/get/`, {
    method: 'GET',
    headers: {
      'Access-Token': accessToken,
    },
  });
  
  const data = await response.json();
  
  if (data.code !== 0) {
    throw new Error(`TikTok API error: ${data.message}`);
  }
  
  return data.data?.advertiser_ids || [];
}

// 拉取广告数据
export async function fetchTikTokAdData(
  accessToken: string,
  advertiserId: string,
  startDate: string,
  endDate: string
): Promise<TikTokAdData[]> {
  const response = await fetch(`${TIKTOK_API_BASE}/report/integrated/get/`, {
    method: 'POST',
    headers: {
      'Access-Token': accessToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      advertiser_id: advertiserId,
      start_date: startDate,
      end_date: endDate,
      report_type: 'BASIC',
      data_level: 'AU_AD',
      dimensions: ['ad_id'],
      metrics: [
        'spend',
        'impressions',
        'clicks',
        'conversions',
        'ctr',
        'cpc',
        'cpm',
        'total_purchase_value',
      ],
    }),
  });
  
  const data = await response.json();
  
  if (data.code !== 0) {
    throw new Error(`TikTok API error: ${data.message}`);
  }
  
  // 转换数据格式
  return (data.data?.list || []).map((item: Record<string, unknown>) => ({
    campaign_id: String(item.campaign_id || ''),
    campaign_name: String(item.campaign_name || ''),
    adgroup_id: String(item.adgroup_id || ''),
    adgroup_name: String(item.adgroup_name || ''),
    ad_id: String(item.ad_id || ''),
    ad_name: String(item.ad_name || ''),
    spend: Number(item.spend || 0) / 100, // TikTok 返回的是分，转换为元
    impressions: Number(item.impressions || 0),
    clicks: Number(item.clicks || 0),
    conversions: Number(item.conversions || 0),
    ctr: Number(item.ctr || 0) * 100, // 转换为百分比
    cpc: Number(item.cpc || 0) / 100,
    cpm: Number(item.cpm || 0) / 100,
    roas: item.total_purchase_value 
      ? Number(item.total_purchase_value) / Number(item.spend || 1)
      : undefined,
  }));
}

// 标准化数据到统一格式
export function normalizeTikTokData(rawData: TikTokAdData): Record<string, unknown> {
  return {
    // 通用字段映射
    campaignId: rawData.campaign_id,
    campaignName: rawData.campaign_name,
    adgroupId: rawData.adgroup_id,
    adgroupName: rawData.adgroup_name,
    adId: rawData.ad_id,
    adName: rawData.ad_name,
    spend: rawData.spend,
    impressions: rawData.impressions,
    clicks: rawData.clicks,
    conversions: rawData.conversions,
    ctr: rawData.ctr,
    cpc: rawData.cpc,
    cpm: rawData.cpm,
    roas: rawData.roas,
    
    // TikTok 平台特有指标
    platform_metrics: {
      tiktok_campaign_id: rawData.campaign_id,
      tiktok_adgroup_id: rawData.adgroup_id,
      tiktok_ad_id: rawData.ad_id,
    },
  };
}

// 创建服务端 Supabase 客户端
export function createServerSupabaseClient(): SupabaseClient {
  const { url } = getSupabaseCredentials();
  const serviceRoleKey = getSupabaseServiceRoleKey();
  
  if (!serviceRoleKey) {
    throw new Error('Service role key not configured');
  }
  
  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// 执行完整同步流程
export async function syncTikTokData(
  userId: string,
  connectionId: string,
  supabase: SupabaseClient
): Promise<{ recordsSynced: number; error?: string }> {
  try {
    // 1. 获取连接信息
    const { data: connection, error: connError } = await supabase
      .from('platform_connections')
      .select('*')
      .eq('id', connectionId)
      .eq('user_id', userId)
      .single();
    
    if (connError || !connection) {
      throw new Error('Connection not found');
    }
    
    const conn = connection as PlatformConnection;
    
    // 2. 检查 token 是否过期，需要刷新
    let accessToken = conn.access_token;
    const expiresAt = new Date(conn.token_expires_at);
    
    if (expiresAt < new Date()) {
      const credentials = getTikTokCredentials();
      const tokenData = await refreshTikTokToken(conn.refresh_token, credentials);
      
      if (tokenData.code !== 0) {
        throw new Error(`Token refresh failed: ${tokenData.message}`);
      }
      
      accessToken = tokenData.data.access_token;
      
      // 更新数据库中的 token
      await supabase
        .from('platform_connections')
        .update({
          access_token: tokenData.data.access_token,
          refresh_token: tokenData.data.refresh_token,
          token_expires_at: new Date(Date.now() + tokenData.data.expires_in * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', connectionId);
    }
    
    // 3. 获取广告账户 ID
    const advertiserIds = (conn.extra_config?.advertiser_ids as string[] | undefined) 
      || await getAdvertiserIds(accessToken);
    
    if (advertiserIds.length === 0) {
      throw new Error('No advertiser accounts found');
    }
    
    // 4. 拉取每个广告账户的数据
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    let totalRecords = 0;
    
    for (const advertiserId of advertiserIds) {
      const adData = await fetchTikTokAdData(accessToken, advertiserId, startDate, endDate);
      
      // 5. 存储到数据库
      for (const ad of adData) {
        const normalizedData = normalizeTikTokData(ad);
        
        await supabase.from('ad_snapshots').insert({
          user_id: userId,
          platform: 'tiktok',
          source: 'api',
          image_url: '', // API 数据没有图片
          analysis_result: normalizedData,
          platform_metrics: normalizedData.platform_metrics as Record<string, unknown>,
          status: 'completed',
        });
        
        totalRecords++;
      }
    }
    
    return { recordsSynced: totalRecords };
  } catch (error) {
    return { 
      recordsSynced: 0, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// 创建同步日志
export async function createSyncLog(
  userId: string,
  connectionId: string,
  syncType: 'full' | 'incremental',
  supabase: SupabaseClient
): Promise<string> {
  const { data, error } = await supabase
    .from('api_sync_log')
    .insert({
      user_id: userId,
      platform: 'tiktok',
      connection_id: connectionId,
      sync_type: syncType,
      status: 'pending',
      started_at: new Date().toISOString(),
    })
    .select('id')
    .single();
  
  if (error) {
    throw new Error(`Failed to create sync log: ${error.message}`);
  }
  
  return (data as SyncLog).id;
}

// 更新同步日志
export async function updateSyncLog(
  supabase: SupabaseClient,
  logId: string,
  status: 'success' | 'failed',
  recordsSynced: number,
  errorMessage?: string
): Promise<void> {
  await supabase
    .from('api_sync_log')
    .update({
      status,
      records_synced: recordsSynced,
      error_message: errorMessage,
      completed_at: new Date().toISOString(),
    })
    .eq('id', logId);
}
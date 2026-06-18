/**
 * TikTok Campaigns API
 * GET: 获取用户的 TikTok 广告系列数据
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/platforms/tiktok-adapter';

interface TikTokCampaign {
  campaign_id: string;
  campaign_name: string;
  objective_type: string;
  status: string;
  budget: number;
  budget_mode: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpm: number;
  cpc: number;
  start_time: string;
  end_time?: string;
}

// 从 TikTok API 获取 campaign 数据
async function fetchTikTokCampaigns(
  accessToken: string,
  advertiserId: string
): Promise<TikTokCampaign[]> {
  const response = await fetch(
    `https://business-api.tiktok.com/open_api/v1.0/campaign/get/?advertiser_ids=[${advertiserId}]`,
    {
      headers: {
        'Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    }
  );
  
  if (!response.ok) {
    throw new Error(`TikTok API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (data.code !== 0) {
    throw new Error(`TikTok API error: ${data.message}`);
  }
  
  return data.data?.list || [];
}

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.headers.get('x-session');
    
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const supabase = createServerSupabaseClient();
    
    // 验证 session
    const { data: { user }, error: authError } = await supabase.auth.getUser(sessionToken);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }
    
    // 获取用户的 TikTok 连接
    const { data: connection, error: connError } = await supabase
      .from('platform_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', 'tiktok')
      .eq('status', 'active')
      .single();
    
    if (connError || !connection) {
      return NextResponse.json({ 
        error: 'No active TikTok connection',
        message: 'Please connect your TikTok account first'
      }, { status: 404 });
    }
    
    // 检查 token 是否过期
    if (new Date(connection.expires_at) < new Date()) {
      return NextResponse.json({ 
        error: 'Token expired',
        message: 'Please reconnect your TikTok account'
      }, { status: 401 });
    }
    
    // 获取 advertiser_ids
    const advertiserIds = connection.advertiser_ids || [];
    
    if (advertiserIds.length === 0) {
      return NextResponse.json({ 
        error: 'No advertiser accounts found',
        campaigns: []
      }, { status: 200 });
    }
    
    // 获取所有 advertiser 的 campaigns
    const allCampaigns: TikTokCampaign[] = [];
    
    for (const advertiserId of advertiserIds) {
      try {
        const campaigns = await fetchTikTokCampaigns(connection.access_token, advertiserId);
        allCampaigns.push(...campaigns);
      } catch (error) {
        console.error(`Failed to fetch campaigns for advertiser ${advertiserId}:`, error);
      }
    }
    
    // 同步数据到 ad_snapshots 表
    for (const campaign of allCampaigns) {
      await supabase
        .from('ad_snapshots')
        .upsert({
          user_id: user.id,
          platform: 'tiktok',
          platform_campaign_id: campaign.campaign_id,
          campaign_name: campaign.campaign_name,
          objective_type: campaign.objective_type,
          status: campaign.status,
          budget: campaign.budget,
          budget_mode: campaign.budget_mode,
          spend: campaign.spend,
          impressions: campaign.impressions,
          clicks: campaign.clicks,
          conversions: campaign.conversions,
          ctr: campaign.ctr,
          cpm: campaign.cpm,
          cpc: campaign.cpc,
          snapshot_date: new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,platform,platform_campaign_id,snapshot_date',
        });
    }
    
    return NextResponse.json({
      success: true,
      campaigns: allCampaigns,
      count: allCampaigns.length,
      advertiserIds,
    });
  } catch (error) {
    console.error('TikTok campaigns error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
}
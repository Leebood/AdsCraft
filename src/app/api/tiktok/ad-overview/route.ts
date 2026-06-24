/**
 * TikTok 广告数据概览
 * 获取用户TikTok广告账户的数据概览（花费、曝光、点击、转化等）
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseCredentials } from '@/storage/database/supabase-client';
import { getValidAccessToken } from '@/lib/tiktok-token-manager';

function getSupabaseServerClient() {
  const { url, anonKey } = getSupabaseCredentials();
  return createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

// TikTok报表API
async function fetchTikTokReport(accessToken: string, advertiserId: string, days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const endDate = new Date();
  
  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];

  const response = await fetch('https://business-api.tiktok.com/open_api/v1.3/report/integrated/get/', {
    method: 'POST',
    headers: {
      'Access-Token': accessToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      advertiser_id: advertiserId,
      start_date: startDateStr,
      end_date: endDateStr,
      report_type: 'BASIC',
      data_level: 'AU_ADVERTISER', // 广告账户级别
      dimensions: ['advertiser_id'],
      metrics: [
        'spend',
        'impressions',
        'clicks',
        'conversions',
        'conversion_rate',
        'cost_per_conversion',
        'ctr',
        'cpm',
        'cpc'
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`TikTok API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data?.list?.[0]?.metrics || {};
}

// 获取Campaign数量
async function fetchCampaignCount(accessToken: string, advertiserId: string) {
  const response = await fetch(`https://business-api.tiktok.com/open_api/v1.0/campaign/get/?advertiser_ids=[${advertiserId}]`, {
    headers: {
      'Access-Token': accessToken
    }
  });

  if (!response.ok) {
    return { total: 0, active: 0 };
  }

  const data = await response.json();
  const campaigns = data.data?.list || [];
  
  return {
    total: campaigns.length,
    active: campaigns.filter((c: { status: string }) => c.status === 'ACTIVE').length
  };
}

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.headers.get('x-session');
    const daysParam = request.nextUrl.searchParams.get('days') || '30';
    const days = parseInt(daysParam, 10);
    
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseServerClient();
    
    // 验证用户身份
    const { data: { user }, error: userError } = await supabase.auth.getUser(sessionToken);
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // 获取TikTok连接信息
    const { data: connection, error: connError } = await supabase
      .from('platform_connections')
      .select('platform_user_id, access_token')
      .eq('user_id', user.id)
      .eq('platform', 'tiktok')
      .eq('is_active', true)
      .single();

    if (connError || !connection?.platform_user_id) {
      return NextResponse.json({ error: 'TikTok not connected' }, { status: 400 });
    }

    // 获取有效的access token（从连接记录中获取）
    const accessToken = connection.access_token;
    
    if (!accessToken) {
      return NextResponse.json({ error: 'No access token found' }, { status: 500 });
    }

    // 获取报表数据
    const metrics = await fetchTikTokReport(accessToken, connection.platform_user_id, days);
    const campaignCount = await fetchCampaignCount(accessToken, connection.platform_user_id);

    return NextResponse.json({
      total_spend: metrics.spend || 0,
      total_impressions: metrics.impressions || 0,
      total_clicks: metrics.clicks || 0,
      total_conversions: metrics.conversions || 0,
      ctr: metrics.ctr || 0,
      cpm: metrics.cpm || 0,
      cpc: metrics.cpc || 0,
      conversion_rate: metrics.conversion_rate || 0,
      cost_per_conversion: metrics.cost_per_conversion || 0,
      campaigns_count: campaignCount.total,
      active_campaigns: campaignCount.active,
      time_range: `${days}d`
    });

  } catch (error) {
    console.error('Fetch TikTok ad overview error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch ad data',
      total_spend: 0,
      total_impressions: 0,
      total_clicks: 0,
      total_conversions: 0,
      campaigns_count: 0,
      active_campaigns: 0
    }, { status: 500 });
  }
}
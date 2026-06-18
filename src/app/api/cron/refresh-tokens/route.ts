/**
 * Token 刷新 Cron Job API
 * GET /api/cron/refresh-tokens - 刷新即将过期的 OAuth token
 * 由 Vercel Cron Job 每日调用
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/platforms/tiktok-adapter';

// TikTok Token 刷新函数
async function refreshTikTokToken(refreshToken: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> {
  const clientId = process.env.TIKTOK_CLIENT_ID;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error('TikTok OAuth credentials not configured');
  }
  
  const response = await fetch('https://business-api.tiktok.com/open_api/v1.0/oauth2/token/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`TikTok token refresh failed: ${errorText}`);
  }
  
  const data = await response.json();
  
  if (data.code !== 0) {
    throw new Error(`TikTok API error: ${data.message}`);
  }
  
  return {
    access_token: data.data.access_token,
    refresh_token: data.data.refresh_token,
    expires_in: data.data.expires_in,
  };
}

export async function GET(request: NextRequest) {
  try {
    // 验证 Cron Job 调用（通过 Vercel Cron authorization header）
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // 开发环境跳过验证
      if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
    
    const supabase = createServerSupabaseClient();
    
    // 获取即将过期的连接（7天内过期）
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    const { data: connections, error: fetchError } = await supabase
      .from('platform_connections')
      .select('*')
      .eq('status', 'active')
      .lt('expires_at', sevenDaysFromNow.toISOString())
      .gt('expires_at', new Date().toISOString()); // 还未过期
    
    if (fetchError) {
      console.error('Failed to fetch connections:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }
    
    if (!connections || connections.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No tokens need refresh',
        refreshed: 0
      });
    }
    
    // 刷新每个 token
    const results = [];
    let refreshedCount = 0;
    let failedCount = 0;
    
    for (const connection of connections) {
      try {
        let newTokenData;
        
        if (connection.platform === 'tiktok') {
          newTokenData = await refreshTikTokToken(connection.refresh_token);
        } else {
          // 其他平台的刷新逻辑
          console.log(`Token refresh for ${connection.platform} not implemented yet`);
          continue;
        }
        
        // 更新 token
        const newExpiresAt = new Date(Date.now() + newTokenData.expires_in * 1000);
        
        const { error: updateError } = await supabase
          .from('platform_connections')
          .update({
            access_token: newTokenData.access_token,
            refresh_token: newTokenData.refresh_token,
            expires_at: newExpiresAt.toISOString(),
            updated_at: new Date().toISOString(),
            last_refresh_at: new Date().toISOString(),
          })
          .eq('id', connection.id);
        
        if (updateError) {
          console.error(`Failed to update connection ${connection.id}:`, updateError);
          failedCount++;
          results.push({
            connection_id: connection.id,
            platform: connection.platform,
            status: 'failed',
            error: updateError.message
          });
        } else {
          refreshedCount++;
          results.push({
            connection_id: connection.id,
            platform: connection.platform,
            status: 'success',
            new_expires_at: newExpiresAt.toISOString()
          });
        }
      } catch (error) {
        console.error(`Failed to refresh token for connection ${connection.id}:`, error);
        failedCount++;
        
        // 标记连接为需要重新授权
        await supabase
          .from('platform_connections')
          .update({
            status: 'needs_reauth',
            updated_at: new Date().toISOString(),
            error_message: error instanceof Error ? error.message : 'Token refresh failed',
          })
          .eq('id', connection.id);
        
        results.push({
          connection_id: connection.id,
          platform: connection.platform,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    // 记录同步日志
    await supabase
      .from('api_sync_log')
      .insert({
        platform: 'cron',
        sync_type: 'token_refresh',
        status: refreshedCount > 0 ? 'success' : 'failed',
        records_synced: refreshedCount,
        error_message: failedCount > 0 ? `${failedCount} tokens failed to refresh` : null,
        created_at: new Date().toISOString(),
      });
    
    return NextResponse.json({
      success: true,
      refreshed: refreshedCount,
      failed: failedCount,
      total_checked: connections.length,
      results
    });
  } catch (error) {
    console.error('Cron refresh error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
}

// 也支持 POST 调用（用于手动触发）
export async function POST(request: NextRequest) {
  return GET(request);
}
/**
 * Token 刷新 Cron Job API
 * GET /api/cron/refresh-tokens - 刷新即将过期的 OAuth token
 * 由 Vercel Cron Job 每12小时调用
 * 
 * TikTok Token 特性：
 * - access_token 24小时过期
 * - 无传统refresh_token，用当前access_token作为refresh_token
 * - 刷新端点：POST https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/refresh/
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  refreshTokenIfNeeded, 
  initializeTokenFromEnv,
  getStoredToken,
  needsRefresh 
} from '@/lib/tiktok-token-manager';
import { createServerSupabaseClient } from '@/lib/platforms/tiktok-adapter';

export async function GET(request: NextRequest) {
  try {
    // 验证 Cron Job 调用（通过 Vercel Cron authorization header）
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // 开发环境跳过验证
      if (process.env.NODE_ENV !== 'development' && process.env.COZE_PROJECT_ENV !== 'DEV') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const results = [];
    let tiktokRefreshed = false;
    let tiktokError: string | null = null;

    // 1. 处理TikTok系统Token（从环境变量）
    try {
      // 先确保Token已初始化
      await initializeTokenFromEnv();
      
      // 检查是否需要刷新
      const storedToken = await getStoredToken();
      if (storedToken && needsRefresh(storedToken.token_expires_at)) {
        const refreshResult = await refreshTokenIfNeeded();
        if (refreshResult.success) {
          tiktokRefreshed = true;
          results.push({
            platform: 'tiktok',
            type: 'system_token',
            status: 'success',
            new_expires_at: storedToken.token_expires_at,
          });
        } else {
          tiktokError = refreshResult.error ?? 'Unknown error';
          results.push({
            platform: 'tiktok',
            type: 'system_token',
            status: 'failed',
            error: tiktokError,
          });
        }
      } else {
        results.push({
          platform: 'tiktok',
          type: 'system_token',
          status: 'skipped',
          reason: 'Token does not need refresh yet',
        });
      }
    } catch (error) {
      tiktokError = error instanceof Error ? error.message : 'Unknown error';
      results.push({
        platform: 'tiktok',
        type: 'system_token',
        status: 'failed',
        error: tiktokError,
      });
    }

    // 2. 处理用户级别的Platform Connections（OAuth连接）
    const supabase = createServerSupabaseClient();
    
    // 获取即将过期的用户连接（12小时内过期）
    const twelveHoursFromNow = new Date(Date.now() + 12 * 60 * 60 * 1000);
    
    const { data: connections, error: fetchError } = await supabase
      .from('platform_connections')
      .select('*')
      .eq('is_active', true)
      .eq('platform', 'tiktok')
      .lt('token_expires_at', twelveHoursFromNow.toISOString())
      .gt('token_expires_at', new Date().toISOString()); // 还未过期
    
    if (fetchError) {
      console.error('Failed to fetch connections:', fetchError);
      // 不阻断流程，继续返回结果
    }
    
    if (connections && connections.length > 0) {
      for (const connection of connections) {
        try {
          // TODO: 实现用户级别OAuth token刷新
          console.log(`User connection ${connection.id} needs refresh, but user OAuth refresh not implemented yet`);
          results.push({
            connection_id: connection.id,
            platform: connection.platform,
            type: 'user_oauth',
            status: 'skipped',
            reason: 'User OAuth refresh not implemented',
          });
        } catch (error) {
          results.push({
            connection_id: connection.id,
            platform: connection.platform,
            type: 'user_oauth',
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    }

    // 记录同步日志
    await supabase
      .from('api_sync_log')
      .insert({
        platform: 'cron',
        sync_type: 'token_refresh',
        status: tiktokRefreshed ? 'success' : (tiktokError ? 'failed' : 'skipped'),
        records_synced: tiktokRefreshed ? 1 : 0,
        error_message: tiktokError,
        created_at: new Date().toISOString(),
      });

    const successCount = results.filter(r => r.status === 'success').length;
    const failedCount = results.filter(r => r.status === 'failed').length;
    const skippedCount = results.filter(r => r.status === 'skipped').length;

    return NextResponse.json({
      success: tiktokRefreshed || successCount > 0,
      refreshed: successCount,
      failed: failedCount,
      skipped: skippedCount,
      results,
      summary: {
        tiktok_system_token: tiktokRefreshed ? 'refreshed' : (tiktokError ? 'failed' : 'ok'),
        user_connections: connections?.length ?? 0,
      }
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
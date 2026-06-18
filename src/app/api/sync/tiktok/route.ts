/**
 * TikTok 数据同步 API
 * POST: 执行同步
 * GET: 查询同步状态
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, syncTikTokData, createSyncLog, updateSyncLog } from '@/lib/platforms/tiktok-adapter';

export async function POST(request: NextRequest) {
  try {
    // 获取 session token
    const sessionToken = request.headers.get('x-session');
    
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // 解析请求体
    const body = await request.json();
    const { connectionId, syncType = 'full' } = body;
    
    if (!connectionId) {
      return NextResponse.json({ error: 'Connection ID is required' }, { status: 400 });
    }
    
    // 创建 Supabase 客户端
    const supabase = createServerSupabaseClient();
    
    // 验证 session 并获取用户 ID
    const { data: { user }, error: authError } = await supabase.auth.getUser(sessionToken);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }
    
    // 创建同步日志
    const logId = await createSyncLog(user.id, connectionId, syncType, supabase);
    
    // 执行同步
    const result = await syncTikTokData(user.id, connectionId, supabase);
    
    // 更新同步日志
    if (result.error) {
      await updateSyncLog(supabase, logId, 'failed', result.recordsSynced, result.error);
      return NextResponse.json({ 
        error: result.error, 
        recordsSynced: result.recordsSynced 
      }, { status: 500 });
    }
    
    await updateSyncLog(supabase, logId, 'success', result.recordsSynced);
    
    return NextResponse.json({ 
      success: true, 
      recordsSynced: result.recordsSynced,
      logId 
    });
  } catch (error) {
    console.error('TikTok sync error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
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
    
    // 查询最近的同步日志
    const { data: logs, error } = await supabase
      .from('api_sync_log')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', 'tiktok')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Get sync logs error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
}
/**
 * TikTok 连接状态检查
 * 检查用户是否已连接TikTok账号
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseCredentials } from '@/storage/database/supabase-client';

function getSupabaseServerClient() {
  const { url, anonKey } = getSupabaseCredentials();
  return createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.headers.get('x-session');
    
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseServerClient();
    
    // 验证用户身份
    const { data: { user }, error: userError } = await supabase.auth.getUser(sessionToken);
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // 查询TikTok连接状态
    const { data: connection, error: connError } = await supabase
      .from('platform_connections')
      .select('platform_user_id, token_expires_at, updated_at, scopes')
      .eq('user_id', user.id)
      .eq('platform', 'tiktok')
      .eq('is_active', true)
      .single();

    if (connError || !connection) {
      return NextResponse.json({
        is_connected: false
      });
    }

    // 检查token是否过期
    const expiresAt = connection.token_expires_at ? new Date(connection.token_expires_at) : null;
    const isExpired = expiresAt && expiresAt < new Date();

    if (isExpired) {
      // Token过期，标记为需要刷新
      return NextResponse.json({
        is_connected: true,
        needs_refresh: true,
        advertiser_id: connection.platform_user_id,
        connected_at: connection.updated_at
      });
    }

    return NextResponse.json({
      is_connected: true,
      advertiser_id: connection.platform_user_id,
      advertiser_name: connection.platform_user_id, // 可以通过API获取名称
      connected_at: connection.updated_at,
      token_expires_at: connection.token_expires_at,
      scopes: connection.scopes
    });

  } catch (error) {
    console.error('Check TikTok connection error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
/**
 * 获取用户所有订阅状态 API
 * GET /api/subscription/all
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClientAsync } from '@/storage/database/supabase-client';

export async function GET(request: NextRequest) {
  try {
    // 从请求头获取 session token
    const sessionToken = request.headers.get('x-session');
    
    if (!sessionToken) {
      return NextResponse.json({ subscriptions: [] });
    }

    const supabase = await getSupabaseServerClientAsync();
    
    // 验证 session 并获取用户信息
    const { data: { user }, error: authError } = await supabase.auth.getUser(sessionToken);
    
    if (authError || !user) {
      return NextResponse.json({ subscriptions: [] });
    }

    // 从数据库获取用户的所有订阅状态
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('route, status, expire_at')
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (error) {
      return NextResponse.json({ subscriptions: [] });
    }

    return NextResponse.json({ subscriptions: subscriptions || [] });

  } catch (error) {
    console.error('获取所有订阅状态错误:', error);
    return NextResponse.json({ subscriptions: [] });
  }
}
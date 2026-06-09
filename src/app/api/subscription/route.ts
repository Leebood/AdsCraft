/**
 * 获取用户订阅状态 API
 * GET /api/subscription
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClientAsync } from '@/storage/database/supabase-client';

export async function GET(request: NextRequest) {
  try {
    // 从请求头获取 session token
    const sessionToken = request.headers.get('x-session');
    
    if (!sessionToken) {
      return NextResponse.json({ 
        subscription: { route: '', status: 'none' } 
      });
    }

    const supabase = await getSupabaseServerClientAsync();
    
    // 验证 session 并获取用户信息
    const { data: { user }, error: authError } = await supabase.auth.getUser(sessionToken);
    
    if (authError || !user) {
      return NextResponse.json({ 
        subscription: { route: '', status: 'none' } 
      });
    }

    // 从数据库获取用户的订阅状态
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error || !subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ 
        subscription: { route: '', status: 'none' } 
      });
    }

    const subscription = subscriptions[0];
    
    // 返回订阅状态
    return NextResponse.json({
      subscription: {
        route: subscription.route,
        status: subscription.status,
        expiresAt: subscription.expires_at || subscription.paid_at
      }
    });

  } catch (error) {
    console.error('获取订阅状态错误:', error);
    return NextResponse.json({ 
      subscription: { route: '', status: 'none' } 
    });
  }
}
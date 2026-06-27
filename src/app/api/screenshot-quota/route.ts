import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  try {
    // 获取用户 session
    const sessionToken = request.headers.get('x-session');
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 创建 Supabase 客户端
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 验证 token 并获取用户信息
    const { data: { user }, error: authError } = await supabase.auth.getUser(sessionToken);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Auth failed', detail: authError?.message, code: authError?.code },
        { status: 401 }
      );
    }

    // 获取用户额度信息
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('screenshot_count_used, screenshot_count_limit, screenshot_reset_at')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'Failed to get quota' },
        { status: 500 }
      );
    }

    // 检查是否需要重置额度
    const now = new Date();
    const resetAt = userData.screenshot_reset_at ? new Date(userData.screenshot_reset_at) : null;
    
    let used = userData.screenshot_count_used || 0;
    let limit = userData.screenshot_count_limit || 5;
    let resetDate = resetAt;

    // 如果重置日期已过，重置额度
    if (resetAt && now >= resetAt) {
      used = 0;
      // 设置下一个月的重置日期
      resetDate = new Date(now);
      resetDate.setMonth(resetDate.getMonth() + 1);
      
      await supabase
        .from('users')
        .update({
          screenshot_count_used: 0,
          screenshot_reset_at: resetDate.toISOString(),
        })
        .eq('id', user.id);
    }

    return NextResponse.json({
      used,
      limit,
      remaining: limit - used,
      reset_at: resetDate?.toISOString() || null,
    });

  } catch (error) {
    console.error('Screenshot quota error:', error);
    return NextResponse.json(
      { error: 'Failed to get quota' },
      { status: 500 }
    );
  }
}

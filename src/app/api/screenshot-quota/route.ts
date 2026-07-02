import { NextResponse } from 'next/server';
import { getSupabaseServerClientAsync } from '@/storage/database/supabase-client';

const SCREENSHOT_LIMITS: Record<string, number> = {
  free: 3,
  local_service: 15,
  retailer: 30,
  manufacturer: 50,
  brand: 50,
};

function getNextMonthlyReset(now = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0));
}

function normalizePlanName(route?: string | null) {
  if (!route) return 'free';
  return route.toLowerCase().replace(/[\s-]+/g, '_');
}

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

    const supabase = await getSupabaseServerClientAsync();

    // 验证 token 并获取用户信息
    const { data: { user }, error: authError } = await supabase.auth.getUser(sessionToken);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Auth failed', detail: authError?.message, code: authError?.code },
        { status: 401 }
      );
    }

    const { data: subscriptionData } = await supabase
      .from('subscriptions')
      .select('route, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    const planName = normalizePlanName(subscriptionData?.route);
    const planLimit = SCREENSHOT_LIMITS[planName] || SCREENSHOT_LIMITS.free;

    // 获取用户额度信息。没有 users 行或字段未初始化时，不阻断控制台展示。
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('screenshot_count_used, screenshot_count_limit, screenshot_reset_at')
      .eq('id', user.id)
      .maybeSingle();

    if (userError) {
      console.error('Failed to get screenshot quota, using defaults:', userError);
      return NextResponse.json({
        used: 0,
        limit: planLimit,
        remaining: planLimit,
        reset_at: getNextMonthlyReset().toISOString(),
      });
    }

    // 检查是否需要重置额度
    const now = new Date();
    const resetAt = userData?.screenshot_reset_at ? new Date(userData.screenshot_reset_at) : null;
    
    let used = userData?.screenshot_count_used || 0;
    let limit = userData?.screenshot_count_limit || planLimit;
    let resetDate = resetAt;

    // 如果重置日期已过，重置额度
    if (!resetAt || now >= resetAt) {
      used = 0;
      limit = planLimit;
      resetDate = getNextMonthlyReset(now);
      
      if (userData) {
        const { error: updateError } = await supabase
          .from('users')
          .update({
            screenshot_count_used: 0,
            screenshot_count_limit: limit,
            screenshot_reset_at: resetDate.toISOString(),
          })
          .eq('id', user.id);

        if (updateError) {
          console.error('Failed to reset screenshot quota:', updateError);
        }
      }
    }

    return NextResponse.json({
      used,
      limit,
      remaining: Math.max(0, limit - used),
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

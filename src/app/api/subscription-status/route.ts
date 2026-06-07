import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 从header中获取session token
    const sessionToken = request.headers.get('x-session');
    
    if (!sessionToken) {
      return NextResponse.json({
        subscribed: false,
        route: null,
        message: 'No session token provided'
      });
    }

    // 这里应该调用Supabase验证session并检查订阅状态
    // 由于目前没有实际的支付系统，暂时返回mock数据
    // TODO: 集成实际支付系统后替换为真实逻辑
    
    // Mock: 检查session是否有效（这里简化处理）
    // 实际应该：验证token -> 查询用户订阅记录 -> 返回订阅状态
    
    return NextResponse.json({
      subscribed: false, // 默认未订阅
      route: null,
      message: 'Subscription check completed'
    });
    
  } catch (error) {
    console.error('Subscription status check error:', error);
    return NextResponse.json({
      subscribed: false,
      route: null,
      error: 'Failed to check subscription status'
    }, { status: 500 });
  }
}
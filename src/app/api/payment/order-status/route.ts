/**
 * 查询订单支付状态API
 * GET /api/payment/order-status?out_trade_no=xxx
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClientAsync } from '@/storage/database/supabase-client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const out_trade_no = searchParams.get('out_trade_no');
    
    if (!out_trade_no) {
      return NextResponse.json({ error: '缺少订单号' }, { status: 400 });
    }
    
    // 查询订阅状态
    const supabase = await getSupabaseServerClientAsync();
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('out_trade_no', out_trade_no)
      .single();
    
    if (error || !subscription) {
      return NextResponse.json({ error: '订单不存在' }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      status: subscription.status,
      route: subscription.route,
      transaction_id: subscription.transaction_id,
      paid_at: subscription.paid_at,
    });
    
  } catch (error) {
    console.error('查询订单状态错误:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '查询失败' },
      { status: 500 }
    );
  }
}
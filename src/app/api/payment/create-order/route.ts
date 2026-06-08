/**
 * 微信支付订单创建API
 * POST /api/payment/create-order
 */

import { NextRequest, NextResponse } from 'next/server';
import { createNativeOrder, PRICING_MAP } from '@/lib/wechat-pay';
import { getSupabaseServerClientAsync } from '@/storage/database/supabase-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { route, user_id } = body;
    
    // 验证参数
    if (!route || !user_id) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }
    
    // 验证路线价格
    const pricing = PRICING_MAP[route];
    if (!pricing) {
      return NextResponse.json({ error: '无效的路线' }, { status: 400 });
    }
    
    // 生成订单号
    const out_trade_no = `SUB${Date.now()}${user_id.slice(0, 8)}`;
    
    // 创建微信支付订单
    const orderResult = await createNativeOrder(
      out_trade_no,
      pricing.price_cny,
      `AdsCraft ${route}订阅`
    );
    
    if ('error' in orderResult) {
      return NextResponse.json({ error: orderResult.error }, { status: 500 });
    }
    
    // 存储订单到数据库（pending状态）
    const supabase = await getSupabaseServerClientAsync();
    await supabase.from('subscriptions').insert({
      user_id,
      route,
      status: 'pending',
      out_trade_no,
      created_at: new Date().toISOString(),
    });
    
    return NextResponse.json({
      success: true,
      code_url: orderResult.code_url,
      out_trade_no: orderResult.out_trade_no,
      amount: pricing.price_cny,
      amount_display: `${pricing.price_cny / 100}元`,
    });
    
  } catch (error) {
    console.error('创建支付订单错误:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '创建订单失败' },
      { status: 500 }
    );
  }
}
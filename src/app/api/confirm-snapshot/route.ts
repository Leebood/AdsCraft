/**
 * 确认截图指标 API
 * POST /api/confirm-snapshot
 * 
 * 接收用户确认的指标数据，写入 ad_snapshots 表
 * 数据写入后，异步触发 Bot 分析，结果写回 analysis_result 字段
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClientAsync } from '@/storage/database/supabase-client';

// 诊断师 Bot ID
const DIAGNOSIS_BOT_ID = '7648850096180330548';

// 请求体类型
interface SnapshotData {
  campaign_name: string | null;
  snapshot_date: string | null;
  spend: number | null;
  impressions: number | null;
  clicks: number | null;
  ctr: number | null;
  cpc: number | null;
  conversions: number | null;
  cpa: number | null;
  roas: number | null;
  raw_image_url?: string;
  file_key?: string;
}

/**
 * 异步触发 Bot 分析，结果写回最新记录的 analysis_result 字段
 */
async function runBotAnalysis(historyData: Record<string, unknown>[], userId: string) {
  const cozeApiToken = process.env.COZE_API_TOKEN;
  if (!cozeApiToken) {
    console.error('[Bot分析] COZE_API_TOKEN 未配置');
    return;
  }

  const prompt = `以下是广告数据，请给出分析：\n${JSON.stringify(historyData.slice(0, 5))}`;
  
  const resp = await fetch('https://api.coze.cn/v3/chat', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${cozeApiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      bot_id: DIAGNOSIS_BOT_ID,
      user_id: userId,
      additional_messages: [{ role: 'user', content: prompt, content_type: 'text' }],
      auto_save_history: false,
      stream: false,
    }),
  });

  const body = await resp.json();
  const chatId = body.data?.id;
  const conversationId = body.data?.conversation_id;

  if (!chatId || !conversationId) {
    console.error('[Bot分析] 未获取到 chat_id，响应:', JSON.stringify(body));
    return;
  }

  // 轮询最多 60 秒
  const start = Date.now();
  while (Date.now() - start < 60000) {
    const statusResp = await fetch(
      `https://api.coze.cn/v3/chat/retrieve?chat_id=${chatId}&conversation_id=${conversationId}`,
      { headers: { 'Authorization': `Bearer ${cozeApiToken}` } }
    );
    const statusBody = await statusResp.json();

    if (statusBody.data?.status === 'completed') {
      const msgResp = await fetch(
        `https://api.coze.cn/v3/chat/message/list?chat_id=${chatId}&conversation_id=${conversationId}`,
        { headers: { 'Authorization': `Bearer ${cozeApiToken}` } }
      );
      const msgBody = await msgResp.json();
      const answer = msgBody.data?.find(
        (m: { role: string; type: string }) => m.role === 'assistant' && m.type === 'answer'
      )?.content;

      if (answer) {
        const supabase = await getSupabaseServerClientAsync();
        await supabase
          .from('ad_snapshots')
          .update({ analysis_result: { content: answer } })
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1);
      }
      return;
    }

    if (['failed', 'canceled'].includes(statusBody.data?.status)) {
      console.error('[Bot分析] Chat 状态异常:', statusBody.data?.status);
      return;
    }

    await new Promise(r => setTimeout(r, 2000));
  }

  console.error('[Bot分析] 轮询超时（60秒）');
}

export async function POST(request: NextRequest) {
  try {
    // 验证用户登录状态
    const sessionToken = request.headers.get('x-session');
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Please login first' },
        { status: 401 }
      );
    }

    const supabase = await getSupabaseServerClientAsync();
    const { data: { user }, error: authError } = await supabase.auth.getUser(sessionToken);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Session expired, please login again' },
        { status: 401 }
      );
    }

    // 解析请求体
    const body: SnapshotData = await request.json();
    
    // 验证必填字段
    if (!body.campaign_name && !body.snapshot_date) {
      return NextResponse.json(
        { error: 'Please provide at least campaign name or date' },
        { status: 400 }
      );
    }

    // 写入 ad_snapshots 表
    const { data, error: insertError } = await supabase
      .from('ad_snapshots')
      .insert({
        user_id: user.id,
        platform: 'facebook',
        campaign_name: body.campaign_name,
        snapshot_date: body.snapshot_date,
        spend: body.spend,
        impressions: body.impressions,
        clicks: body.clicks,
        ctr: body.ctr,
        cpc: body.cpc,
        conversions: body.conversions,
        cpa: body.cpa,
        roas: body.roas,
        raw_image_url: body.raw_image_url || null,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Failed to insert snapshot:', insertError);
      return NextResponse.json(
        { error: 'Failed to save data, please retry' },
        { status: 500 }
      );
    }

    // 写入成功后，查询该用户所有历史数据，异步触发 Bot 分析
    const { data: historyData } = await supabase
      .from('ad_snapshots')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Fire-and-forget：不 await，立即返回
    runBotAnalysis(historyData || [], user.id).catch(err =>
      console.error('[confirm-snapshot] Bot 分析异步失败:', err)
    );

    return NextResponse.json({
      saved: true,
      id: data?.id,
      message: 'Data saved, AI analysis is generating...',
    });

  } catch (error) {
    console.error('Confirm snapshot error:', error);
    return NextResponse.json(
      { error: 'Failed to confirm snapshot, please retry' },
      { status: 500 }
    );
  }
}

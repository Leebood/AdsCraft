/**
 * 确认截图指标 API
 * POST /api/confirm-snapshot
 * 
 * 接收用户确认的指标数据，写入数据库，拉历史数据，调 GPT-4o-mini 出诊断分析
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClientAsync } from '@/storage/database/supabase-client';

// 超时时间 30秒
const TIMEOUT_MS = 30000;

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

// 诊断分析 Prompt
function buildDiagnosisPrompt(historyData: SnapshotData[]): string {
  const dataJson = JSON.stringify(historyData, null, 2);
  
  return `以下是该用户的Facebook广告数据记录（按时间排序）：
${dataJson}

FB行业基准参考：CTR 1.0-2.0%, CPC $0.50-1.50, CPA $10-30, ROAS 2.0-4.0x

请生成诊断分析：
- 1条数据：各指标与行业基准对比，判断好坏，给出优化建议
- 2条+数据：趋势变化分析，指出异常指标，给出优化方向
- 5条+数据：异常检测、具体优化路径

用英文，分点输出，不超过300字。`;
}

export async function POST(request: NextRequest) {
  try {
    // 验证用户登录状态
    const sessionToken = request.headers.get('x-session');
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: '请先登录后再确认数据' },
        { status: 401 }
      );
    }

    const supabase = await getSupabaseServerClientAsync();
    const { data: { user }, error: authError } = await supabase.auth.getUser(sessionToken);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '登录状态已过期，请重新登录' },
        { status: 401 }
      );
    }

    // 解析请求体
    const body: SnapshotData = await request.json();
    
    // 验证必填字段
    if (!body.campaign_name && !body.snapshot_date) {
      return NextResponse.json(
        { error: '请至少提供广告系列名称或日期' },
        { status: 400 }
      );
    }

    // 写入 ad_snapshots 表
    const { error: insertError } = await supabase
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
      });

    if (insertError) {
      console.error('Failed to insert snapshot:', insertError);
      return NextResponse.json(
        { error: '保存数据失败，请重试' },
        { status: 500 }
      );
    }

    // 查询该用户所有历史记录
    const { data: historyData, error: historyError } = await supabase
      .from('ad_snapshots')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', 'facebook')
      .order('snapshot_date', { ascending: true });

    if (historyError) {
      console.error('Failed to fetch history:', historyError);
    }

    const historyCount = historyData?.length || 0;

    // 调用 OpenAI API 生成诊断分析
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return NextResponse.json({
        saved: true,
        history_count: historyCount,
        analysis: 'Data saved successfully. AI analysis is temporarily unavailable.',
      });
    }

    const prompt = buildDiagnosisPrompt(historyData || [body]);

    // 设置超时
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Analysis timeout')), TIMEOUT_MS);
    });

    // 调用 OpenAI API
    const openaiResponse = await Promise.race([
      fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'user', content: prompt },
          ],
          temperature: 0.5,
          max_tokens: 500,
        }),
      }),
      timeoutPromise,
    ]);

    let analysis = '';
    
    if (openaiResponse.ok) {
      const result = await openaiResponse.json();
      analysis = result.choices[0]?.message?.content || '';
    } else {
      console.error('OpenAI API error:', await openaiResponse.text());
      analysis = 'Data saved successfully. AI analysis is temporarily unavailable.';
    }

    return NextResponse.json({
      saved: true,
      history_count: historyCount,
      analysis,
    });

  } catch (error) {
    console.error('Confirm snapshot error:', error);
    
    if (error instanceof Error && error.message.includes('timeout')) {
      return NextResponse.json(
        { error: 'Analysis timeout, please retry' },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to confirm snapshot, please retry' },
      { status: 500 }
    );
  }
}

/**
 * 确认入库+分析 API
 * POST /api/confirm-snapshot
 * 
 * 接收用户确认后的指标，写入数据库，生成分析结论
 */

import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { getSupabaseServerClientAsync } from '@/storage/database/supabase-client';

// 分析 Prompt
function getAnalysisPrompt(dataCount: number): string {
  if (dataCount === 1) {
    return `以下是该用户的第一条广告数据记录。请生成基准诊断分析：
- 各指标与行业基准对比（CTR基准1.8%，CPA根据行业不同在$5-50）
- 判断各指标表现好坏
- 给出优化建议

用简洁的中文，分点输出，不超过300字。`;
  } else if (dataCount >= 2 && dataCount < 5) {
    return `以下是该用户的广告数据记录（有${dataCount}条数据）。请生成趋势分析：
- 指标变化趋势分析（CTR、CPC、CPA、ROAS的变化）
- 指出异常指标
- 给出优化方向

用简洁的中文，分点输出，不超过300字。`;
  } else {
    return `以下是该用户的广告数据记录（有${dataCount}条数据）。请生成深度分析：
- 异常检测（识别显著偏离的指标）
- 广告组对比分析
- 具体优化路径建议

用简洁的中文，分点输出，不超过300字。`;
  }
}

export async function POST(request: NextRequest) {
  try {
    // 验证用户登录状态
    const sessionToken = request.headers.get('x-session');
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: '请先登录后再保存数据' },
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
    const body = await request.json();
    
    // 验证必要字段
    const {
      campaign_name,
      snapshot_date,
      spend,
      impressions,
      clicks,
      ctr,
      cpc,
      conversions,
      cpa,
      roas,
      raw_image_url,
      file_key,
    } = body;

    // 写入数据库
    const { data: insertedData, error: insertError } = await supabase
      .from('ad_snapshots')
      .insert({
        user_id: user.id,
        campaign_name: campaign_name || null,
        snapshot_date: snapshot_date || null,
        spend: spend || null,
        impressions: impressions || null,
        clicks: clicks || null,
        ctr: ctr || null,
        cpc: cpc || null,
        conversions: conversions || null,
        cpa: cpa || null,
        roas: roas || null,
        raw_image_url: raw_image_url || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('数据库写入错误:', insertError);
      return NextResponse.json(
        { error: '保存数据失败' },
        { status: 500 }
      );
    }

    // 查询该用户历史数据
    const { data: historyData, error: historyError } = await supabase
      .from('ad_snapshots')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30);

    if (historyError) {
      console.error('历史数据查询错误:', historyError);
    }

    const dataCount = historyData?.length || 1;

    // 调用 LLM 生成分析结论
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const llmConfig = new Config();
    const llmClient = new LLMClient(llmConfig, customHeaders);

    // 构建分析请求
    const historyJson = JSON.stringify(historyData || [insertedData], null, 2);
    const analysisPrompt = getAnalysisPrompt(dataCount);

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content: analysisPrompt,
      },
      {
        role: 'user',
        content: `数据记录：\n${historyJson}`,
      },
    ];

    const response = await llmClient.invoke(messages, {
      model: 'doubao-seed-2-0-mini-260215',
      temperature: 0.5,
    });

    return NextResponse.json({
      saved: true,
      id: insertedData.id,
      analysis: response.content,
      dataCount: dataCount,
    });

  } catch (error) {
    console.error('确认入库错误:', error);
    return NextResponse.json(
      { error: '保存数据失败，请重试' },
      { status: 500 }
    );
  }
}
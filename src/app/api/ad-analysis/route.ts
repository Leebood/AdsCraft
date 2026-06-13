/**
 * 历史分析 API
 * GET /api/ad-analysis
 * 
 * 查询用户历史广告数据，生成趋势分析
 */

import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { getSupabaseServerClientAsync } from '@/storage/database/supabase-client';

// 分析 Prompt
function getAnalysisPrompt(dataCount: number): string {
  if (dataCount === 0) {
    return '';
  } else if (dataCount === 1) {
    return `以下是该用户的广告数据记录（只有1条）。请生成基准诊断分析：
- 各指标与行业基准对比（CTR基准1.8%，CPA根据行业不同在$5-50）
- 判断各指标表现好坏
- 给出优化建议

用简洁的中文，分点输出，不超过300字。`;
  } else if (dataCount >= 2 && dataCount < 5) {
    return `以下是该用户的广告数据记录。请生成趋势分析：
- 指标变化趋势分析（CTR、CPC、CPA、ROAS的变化）
- 指出异常指标
- 给出优化方向

用简洁的中文，分点输出，不超过300字。`;
  } else {
    return `以下是该用户的广告数据记录。请生成深度分析：
- 异常检测（识别显著偏离的指标）
- 广告组对比分析
- 具体优化路径建议

用简洁的中文，分点输出，不超过300字。`;
  }
}

export async function GET(request: NextRequest) {
  try {
    // 验证用户登录状态
    const sessionToken = request.headers.get('x-session');
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }

    const supabase = await getSupabaseServerClientAsync();
    const { data: { user }, error: authError } = await supabase.auth.getUser(sessionToken);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '登录状态已过期' },
        { status: 401 }
      );
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30', 10);

    // 查询历史数据
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: historyData, error: historyError } = await supabase
      .from('ad_snapshots')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (historyError) {
      console.error('历史数据查询错误:', historyError);
      return NextResponse.json(
        { error: '查询历史数据失败' },
        { status: 500 }
      );
    }

    const dataCount = historyData?.length || 0;

    // 如果没有数据
    if (dataCount === 0) {
      return NextResponse.json({
        data: [],
        analysis: '上传第一张截图，解锁AI分析',
        dataCount: 0,
      });
    }

    // 调用 LLM 生成分析结论
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const llmConfig = new Config();
    const llmClient = new LLMClient(llmConfig, customHeaders);

    const historyJson = JSON.stringify(historyData, null, 2);
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
      data: historyData,
      analysis: response.content,
      dataCount: dataCount,
    });

  } catch (error) {
    console.error('历史分析错误:', error);
    return NextResponse.json(
      { error: '获取分析失败' },
      { status: 500 }
    );
  }
}
/**
 * 确认入库+分析 API
 * POST /api/confirm-snapshot
 * 
 * 接收用户确认后的指标，写入数据库，生成分析结论
 * 分析时结合用户的方案信息（预算、目标、路线）
 */

import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { getSupabaseServerClientAsync } from '@/storage/database/supabase-client';

// 获取路线中文名称
function getRouteName(route: string): string {
  const routeNames: Record<string, string> = {
    'retailer': '零售商',
    'manufacturer': '制造商',
    'local_service': '本地服务商',
    'brand': '品牌方',
    'basic': '基础通用方案',
  };
  return routeNames[route] || route;
}

// 获取路线关注重点
function getRouteFocus(route: string): string {
  const routeFocus: Record<string, string> = {
    'retailer': '重点关注ROAS（广告回报率）、转化率、CPA（每次行动成本），目标是提升销售转化',
    'manufacturer': '重点关注品牌曝光、线索质量、CPA，目标是获取高质量潜在客户',
    'local_service': '重点关注本地曝光、点击率、地理位置精准度，目标是吸引本地客户',
    'brand': '重点关注品牌曝光量、互动率、品牌认知度提升，目标是扩大品牌影响力',
    'basic': '根据用户预算和目标，关注核心指标表现',
  };
  return routeFocus[route] || '关注核心广告指标表现';
}

// 分析 Prompt（带方案上下文）
function getAnalysisPrompt(dataCount: number, planInfo: { route: string; budget: string; goal: string } | null): string {
  const routeName = planInfo ? getRouteName(planInfo.route) : '通用';
  const routeFocus = planInfo ? getRouteFocus(planInfo.route) : '关注核心广告指标表现';
  const budgetInfo = planInfo?.budget || '未知';
  const goalInfo = planInfo?.goal || '未知';

  const contextInfo = planInfo 
    ? `\n\n用户背景信息：
- 用户类型：${routeName}
- 预算设定：${budgetInfo}
- 广告目标：${goalInfo}
- 关注重点：${routeFocus}`
    : '';

  if (dataCount === 1) {
    return `以下是该用户的第一条广告数据记录。${contextInfo}

请生成基准诊断分析：
- 各指标与行业基准对比（CTR基准1.8%，CPA根据行业不同在$5-50）
- 结合用户类型判断各指标表现好坏
- 给出针对性的优化建议

用简洁的中文，分点输出，不超过300字。`;
  } else if (dataCount >= 2 && dataCount < 5) {
    return `以下是该用户的广告数据记录（有${dataCount}条数据）。${contextInfo}

请生成趋势分析：
- 指标变化趋势分析（CTR、CPC、CPA、ROAS的变化）
- 结合用户类型指出异常指标
- 给出针对性的优化方向

用简洁的中文，分点输出，不超过300字。`;
  } else {
    return `以下是该用户的广告数据记录（有${dataCount}条数据）。${contextInfo}

请生成深度分析：
- 异常检测（识别显著偏离的指标）
- 结合用户类型进行广告组对比分析
- 给出具体优化路径建议

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

    // 获取用户最近的方案信息（用于分析上下文）
    const { data: userPlan } = await supabase
      .from('plans')
      .select('route, budget, goal, plan_data')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const planInfo = userPlan ? {
      route: userPlan.route,
      budget: userPlan.budget,
      goal: userPlan.goal,
    } : null;

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
      platform = 'facebook',  // 默认 Facebook，因为当前是截图上传流程
      source = 'screenshot',  // 默认截图来源
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
        platform: platform,      // 平台字段
        source: source,          // 数据来源
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

    // 构建分析请求（带方案上下文）
    const historyJson = JSON.stringify(historyData || [insertedData], null, 2);
    const analysisPrompt = getAnalysisPrompt(dataCount, planInfo);

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
      planInfo: planInfo, // 返回方案信息供前端显示
    });

  } catch (error) {
    console.error('确认入库错误:', error);
    return NextResponse.json(
      { error: '保存数据失败，请重试' },
      { status: 500 }
    );
  }
}
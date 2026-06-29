/**
 * 历史分析 API
 * GET /api/ad-analysis
 * 
 * 查询用户历史广告数据，生成趋势分析
 * 分析时结合用户的方案信息（预算、目标、路线）
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClientAsync } from '@/storage/database/supabase-client';
import { analyzeAdData, AdSnapshot } from '@/lib/ad-analysis-engine-v2';

// 诊断师 Bot ID
const DIAGNOSIS_BOT_ID = '7648850096180330548';

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
  if (dataCount === 0) {
    return '';
  }

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
    return `以下是该用户的广告数据记录（只有1条）。${contextInfo}

请生成基准诊断分析：
- 各指标与行业基准对比（CTR基准1.8%，CPA根据行业不同在$5-50）
- 结合用户类型判断各指标表现好坏
- 给出针对性的优化建议

用简洁的中文，分点输出，不超过300字。`;
  } else if (dataCount >= 2 && dataCount < 5) {
    return `以下是该用户的广告数据记录。${contextInfo}

请生成趋势分析：
- 指标变化趋势分析（CTR、CPC、CPA、ROAS的变化）
- 结合用户类型指出异常指标
- 给出针对性的优化方向

用简洁的中文，分点输出，不超过300字。`;
  } else {
    return `以下是该用户的广告数据记录。${contextInfo}

请生成深度分析：
- 异常检测（识别显著偏离的指标）
- 结合用户类型进行广告组对比分析
- 给出具体优化路径建议

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

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30', 10);
    const platform = searchParams.get('platform'); // 可选平台过滤

    // 查询历史数据
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 构建查询条件
    let query = supabase
      .from('ad_snapshots')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())
      .order('snapshot_date', { ascending: false });
    
    // 如果指定了平台，添加过滤条件
    if (platform && ['facebook', 'tiktok'].includes(platform)) {
      query = query.eq('platform', platform);
    }

    const { data: historyData, error: historyError } = await query;

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
        analysis: null,
        dataCount: 0,
        planInfo: planInfo,
      });
    }

    // 调用新的分析引擎 v2.0
    const currentSnapshot = historyData[0];
    const previousSnapshot = historyData.length > 1 ? historyData[1] : null;
    
    // 获取语言参数
    const locale = searchParams.get('locale') || 'zh';
    
    const analysis = analyzeAdData(currentSnapshot, previousSnapshot, locale);
    
    return NextResponse.json({
      data: historyData,
      analysis: analysis,
      dataCount: dataCount,
      planInfo: planInfo,
    });

  } catch (error) {
    console.error('历史分析错误:', error);
    return NextResponse.json(
      { error: '获取分析失败' },
      { status: 500 }
    );
  }
}
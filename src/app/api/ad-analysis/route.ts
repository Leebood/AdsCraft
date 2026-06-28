/**
 * 历史分析 API
 * GET /api/ad-analysis
 * 
 * 查询用户历史广告数据，生成趋势分析
 * 分析时结合用户的方案信息（预算、目标、路线）
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClientAsync } from '@/storage/database/supabase-client';

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
      .order('created_at', { ascending: false });
    
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
        analysis: '上传第一张截图，解锁AI分析',
        dataCount: 0,
        planInfo: planInfo,
      });
    }

    // 调用扣子诊断师 Bot API 生成分析结论
    const cozeApiToken = process.env.COZE_API_TOKEN;
    if (!cozeApiToken) {
      console.error('[ad-analysis] COZE_API_TOKEN 未配置');
      return NextResponse.json(
        { error: 'AI分析服务未配置' },
        { status: 500 }
      );
    }

    const historyJson = JSON.stringify(historyData, null, 2);
    const analysisPrompt = getAnalysisPrompt(dataCount, planInfo);
    
    // 构建完整的用户消息
    const userMessage = `${analysisPrompt}\n\n数据记录：\n${historyJson}`;

    // 调用扣子 Bot API
    const cozeResponse = await fetch('https://api.coze.cn/v3/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cozeApiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bot_id: DIAGNOSIS_BOT_ID,
        user_id: user.id,
        additional_messages: [
          {
            role: 'user',
            content: userMessage,
            content_type: 'text',
          },
        ],
      }),
    });

    if (!cozeResponse.ok) {
      const errorText = await cozeResponse.text();
      console.error('[ad-analysis] Coze API 调用失败:', cozeResponse.status, errorText);
      return NextResponse.json(
        { error: 'AI分析服务调用失败' },
        { status: 500 }
      );
    }

    const cozeResult = await cozeResponse.json();
    
    // DEBUG: 打印 Coze API 返回的完整结构
    console.log('[ad-analysis] Coze API 返回结构:', JSON.stringify(cozeResult, null, 2));
    
    // 获取 chat_id 和 conversation_id
    const chatId = cozeResult.data?.id;
    const conversationId = cozeResult.data?.conversation_id;
    
    if (!chatId || !conversationId) {
      console.error('[ad-analysis] 未获取到 chat_id 或 conversation_id');
      // 返回 placeholder，不报错
      return NextResponse.json({
        data: historyData,
        analysis: '分析生成中，请稍后刷新页面查看',
        dataCount: dataCount,
        planInfo: planInfo,
      });
    }
    
    // 轮询等待分析完成
    let analysisContent = '分析生成中，请稍后刷新页面查看';
    const maxPollTime = 60000; // 最多轮询 60 秒
    const pollInterval = 2000; // 每 2 秒轮询一次
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxPollTime) {
      // 查询 chat 状态
      const retrieveResponse = await fetch(`https://api.coze.cn/v3/chat/retrieve?chat_id=${chatId}&conversation_id=${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${cozeApiToken}`,
        },
      });
      
      if (retrieveResponse.ok) {
        const retrieveResult = await retrieveResponse.json();
        console.log('[ad-analysis] Chat 状态:', retrieveResult.data?.status);
        
        if (retrieveResult.data?.status === 'completed') {
          // 获取消息列表
          const messageListResponse = await fetch(`https://api.coze.cn/v3/chat/message/list?chat_id=${chatId}&conversation_id=${conversationId}`, {
            headers: {
              'Authorization': `Bearer ${cozeApiToken}`,
            },
          });
          
          if (messageListResponse.ok) {
            const messageListResult = await messageListResponse.json();
            console.log('[ad-analysis] 消息列表:', JSON.stringify(messageListResult, null, 2));
            
            // 从消息列表中提取 assistant 的回答
            if (messageListResult.data && Array.isArray(messageListResult.data)) {
              const assistantMessage = messageListResult.data.find(
                (msg: { role: string; type: string }) => msg.role === 'assistant' && msg.type === 'answer'
              );
              if (assistantMessage?.content) {
                analysisContent = assistantMessage.content;
              }
            }
          }
          break;
        }
      }
      
      // 等待 2 秒后继续轮询
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    const responseData = {
      data: historyData,
      analysis: analysisContent,
      dataCount: dataCount,
      planInfo: planInfo, // 返回方案信息供前端显示
    };
    
    // DEBUG: 打印最终返回给前端的结构
    console.log('[ad-analysis] 返回前端结构:', JSON.stringify(responseData, null, 2));

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('历史分析错误:', error);
    return NextResponse.json(
      { error: '获取分析失败' },
      { status: 500 }
    );
  }
}
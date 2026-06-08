import { NextRequest } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { route, budget, goal, planData, language } = await request.json();
    
    if (!route || !budget || !goal) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    // 构建系统提示
    const systemPrompt = `你是AdsCraft的AI广告诊断专家，专门为Facebook广告提供专业诊断分析。

你需要根据用户提供的信息，给出以下内容（使用JSON格式输出）：

{
  "score": <综合评分，0-100的数字>,
  "issues": [<潜在问题列表，数组，每个问题是一段文字>],
  "suggestions": [<优化建议列表，数组，每条建议是一段文字>],
  "strengths": [<当前优势列表，数组，每条优势是一段文字>]
}

分析要点：
1. 综合评分：根据预算、目标、路线匹配度给出整体评估
2. 潜在问题：指出当前配置可能存在的风险或不足
3. 优化建议：给出具体可执行的改进方案
4. 当前优势：指出当前配置的亮点和优势

请确保输出是纯JSON格式，不要包含其他文字说明。`;

    // 路线名称映射
    const routeNames: Record<string, string> = {
      retailer: '零售商',
      manufacturer: '制造商',
      local_service: '本地服务商',
      brand: '品牌方'
    };

    const routeName = language === 'zh' ? routeNames[route] || route : route;

    // 构建用户消息
    const userMessage = `请为以下Facebook广告配置进行诊断分析：

路线类型：${routeName}
预算范围：${budget}
营销目标：${goal}
方案配置：${JSON.stringify(planData || {})}

请用${language === 'zh' ? '中文' : '英文'}回答，输出JSON格式的诊断结果。`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];

    // 创建流式响应
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const llmStream = client.stream(messages as Array<{ role: 'system' | 'user' | 'assistant'; content: string }>, {
            model: 'doubao-seed-1-8-251228',
            temperature: 0.7
          });

          for await (const chunk of llmStream) {
            if (chunk.content) {
              const text = chunk.content.toString();
              controller.enqueue(encoder.encode(`data: ${text}\n\n`));
            }
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('LLM stream error:', error);
          controller.enqueue(encoder.encode(`data: {"error": "AI诊断失败，请稍后重试"}\n\n`));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  } catch (error) {
    console.error('AI diagnosis error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
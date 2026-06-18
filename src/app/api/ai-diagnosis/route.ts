import { NextRequest } from 'next/server';
import { formatDiagnosisPrompt, getDiagnosisTemplate } from '@/lib/platforms/diagnosis-templates';

// Coze智能体配置
const COZE_API_BASE = process.env.COZE_API_BASE_URL || 'https://api.coze.cn';
const COZE_API_TOKEN = process.env.COZE_WORKLOAD_API_TOKEN || 'pat_5D6p3jtzrjPUcw2T4Z2nHPmYpAzRhAE9fAsd8SLRkZ5bJoPEkaWpX2rAjwpd4eO1';
const COZE_BOT_ID = process.env.COZE_BOT_ID || '7648850096180330548';

interface DiagnosisRequest {
  route: string;
  budget: string;
  goal: string;
  platform?: string; // 新增平台参数
  language?: string;
  metrics?: Record<string, unknown>; // 新增指标数据
}

export async function POST(request: NextRequest) {
  try {
    const body: DiagnosisRequest = await request.json();
    const { route, budget, goal, platform = 'facebook', language = 'zh', metrics } = body;

    // 获取平台诊断模板
    const template = getDiagnosisTemplate(platform);
    const platformName = language === 'zh' 
      ? (platform === 'tiktok' ? 'TikTok' : 'Facebook')
      : template.platformName;

    // 构建诊断请求消息（使用平台专属模板）
    const systemPrompt = language === 'zh' 
      ? `你是一位专业的${platformName}广告诊断师。请根据用户提供的广告方案信息，给出专业的诊断分析。

请按以下JSON格式返回诊断结果（不要添加任何其他文字，只返回JSON）：
{
  "score": <综合评分，0-100的整数>,
  "issues": [<潜在问题列表，每个问题详细说明>],
  "suggestions": [<优化建议列表，每条建议具体可操作>],
  "strengths": [<当前方案优势列表>],
  "platform_specific": {
    "platform": "${platform}",
    "key_metrics": [<该平台关键指标建议>],
    "best_practices": [<该平台最佳实践建议>]
  }
}`
      : `You are a professional ${platformName} Ads diagnostician. Please analyze the provided ad plan information.

Return the diagnosis result in JSON format only (no other text):
{
  "score": <overall score, integer 0-100>,
  "issues": [<list of potential problems with detailed explanations>],
  "suggestions": [<list of actionable optimization suggestions>],
  "strengths": [<list of current plan advantages>],
  "platform_specific": {
    "platform": "${platform}",
    "key_metrics": [<key metrics suggestions for this platform>],
    "best_practices": [<best practices for this platform>]
  }
}`;

    // 使用平台专属prompt模板
    const diagnosisPrompt = formatDiagnosisPrompt(platform, route, goal, budget, metrics);
    
    const userMessage = language === 'zh'
      ? diagnosisPrompt
      : `Please diagnose this ${platformName} Ads plan:

Route Type: ${route}
Budget Range: ${budget}
Main Goal: ${goal}
Platform: ${platformName}
${metrics ? `Metrics:\n${Object.entries(metrics).map(([k, v]) => `${k}: ${v}`).join('\n')}` : ''}

Please provide overall score, potential issues, optimization suggestions and current strengths with platform-specific advice.`;

    // 调用Coze智能体流式API
    const response = await fetch(`${COZE_API_BASE}/v3/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COZE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bot_id: COZE_BOT_ID,
        user_id: 'adscraft_user',
        stream: true,
        additional_messages: [
          {
            role: 'user',
            content: `${systemPrompt}\n\n${userMessage}`,
            content_type: 'text',
          },
        ],
        auto_save_history: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Coze API error:', errorText);
      return new Response(JSON.stringify({ error: 'AI diagnosis failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 创建SSE流式响应
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let buffer = '';
        let currentEvent = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            // 分割buffer为完整行
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();

              // 空行标记SSE块结束
              if (trimmed === '') {
                currentEvent = '';
                continue;
              }

              // 追踪当前事件类型
              if (trimmed.startsWith('event:')) {
                currentEvent = trimmed.slice('event:'.length).trim();
                continue;
              }

              // 解析数据payload
              if (trimmed.startsWith('data:')) {
                const raw = trimmed.slice('data:'.length).trim();

                // done事件
                if (currentEvent === 'done' || raw === '[DONE]') {
                  controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
                  continue;
                }

                try {
                  const data = JSON.parse(raw);

                  if (currentEvent === 'conversation.message.delta') {
                    // 深度思考模式：reasoning_content包含思考过程
                    // 正常模式：content包含回答
                    const content = data.reasoning_content || data.content || '';
                    if (content) {
                      controller.enqueue(encoder.encode(`data: ${content}\n\n`));
                    }
                  } else if (currentEvent === 'conversation.chat.completed') {
                    // 对话完成
                    controller.enqueue(encoder.encode(`data: [COMPLETED]\n\n`));
                  } else if (currentEvent === 'conversation.chat.failed') {
                    // 对话失败
                    controller.enqueue(encoder.encode(`data: [ERROR] Chat failed\n\n`));
                  }
                } catch {
                  // 忽略无效JSON
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('AI diagnosis error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
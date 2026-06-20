import { NextRequest } from 'next/server';
import { formatDiagnosisPrompt, getDiagnosisTemplate } from '@/lib/platforms/diagnosis-templates';
import { selectModelLayer, L0_CONFIG, UserTier, TaskType } from '@/lib/model-router';
import { executeLayer0FromCheckItems, CheckItemInput, L0Result } from '@/lib/layer0-rules';
import { retrieveFromPresetKnowledge, injectKnowledgeToPrompt, extractKeywords } from '@/lib/knowledge-rag';

// Coze智能体配置
const COZE_API_BASE = process.env.COZE_API_BASE_URL || 'https://api.coze.cn';
const COZE_API_TOKEN = process.env.COZE_WORKLOAD_API_TOKEN || 'pat_5D6p3jtzrjPUcw2T4Z2nHPmYpAzRhAE9fAsd8SLRkZ5bJoPEkaWpX2rAjwpd4eO1';
const COZE_BOT_ID = process.env.COZE_BOT_ID || '7648850096180330548';

interface DiagnosisRequest {
  route: string;
  budget: string;
  goal: string;
  platform?: string;
  language?: string;
  metrics?: Record<string, unknown>;
  userTier?: UserTier; // 新增用户层级
  taskType?: TaskType; // 新增任务类型
  objective?: string; // 广告目标，用于L0判定
  checkItems?: CheckItemInput[]; // 检查项列表
}

export async function POST(request: NextRequest) {
  try {
    const body: DiagnosisRequest = await request.json();
    const {
      route,
      budget,
      goal,
      platform = 'facebook',
      language = 'zh',
      metrics,
      userTier = 'free',
      taskType = 'report',
      objective,
      checkItems
    } = body;

    // ========== L0: 纯代码判定（不调用AI）==========
    let l0Result = null;
    if (objective && checkItems) {
      l0Result = executeLayer0FromCheckItems(checkItems, objective);
      
      // 如果L0判定为阻断，直接返回结果，不调用AI
      if (l0Result.overall === 'block') {
        return new Response(JSON.stringify({
          layer: 'L0',
          result: l0Result,
          message: language === 'zh'
            ? '您的广告方案触发了硬规则阻断，请修改以下问题后重新提交'
            : 'Your ad plan triggered a hard rule block. Please fix the following issues before resubmitting'
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // ========== 选择模型层级 ==========
    const modelConfig = selectModelLayer(userTier, taskType);

    // L0不需要调用AI，直接返回
    if (modelConfig.layer === 'L0') {
      return new Response(JSON.stringify({
        layer: 'L0',
        result: l0Result || { overall: 'pass', checks: [] },
        message: language === 'zh' ? '硬规则检查通过' : 'Hard rules check passed'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ========== 知识库RAG检索 ==========
    // 提取关键词用于知识库检索
    const searchKeywords = [route, goal, objective || '', platform].filter(Boolean);
    const knowledgeResults = retrieveFromPresetKnowledge(
      searchKeywords.join(' '),  // 将关键词数组转成单个字符串
      platform,
      modelConfig.knowledge_top_k || 5
    );

    // ========== 构建诊断Prompt ==========
    const template = getDiagnosisTemplate(platform);
    const platformName = language === 'zh'
      ? (platform === 'tiktok' ? 'TikTok' : 'Facebook')
      : template.platformName;

    // 基础System Prompt（不含知识库内容）
    let baseSystemPrompt = language === 'zh'
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

    // 注入知识库内容到System Prompt
    let systemPrompt = injectKnowledgeToPrompt(baseSystemPrompt, knowledgeResults, language as 'zh' | 'en');

    // L2/L3附加推理指令
    if (modelConfig.layer === 'L2') {
      systemPrompt += language === 'zh'
        ? `\n\n你需要完成多步推理：
1. 识别违反的具体政策条款（引用编号）
2. 分析素材中触发违规的具体元素
3. 给出针对性修改方案（不是泛泛建议）
4. 评估修改后通过审核的概率`
        : `\n\nYou need to complete multi-step reasoning:
1. Identify specific policy clauses violated (quote the number)
2. Analyze specific elements in the material that triggered the violation
3. Provide targeted modification suggestions (not generic advice)
4. Estimate the probability of passing review after modification`;
    }

    if (modelConfig.layer === 'L3') {
      systemPrompt += language === 'zh'
        ? `\n\n你需要完成深度归因分析：
1. 结合账户历史数据做趋势归因
2. 交叉分析多个变量（素材/受众/出价/时段）
3. 给出可量化的优化路径和预期效果
4. 输出结构化优化方案（含优先级排序）`
        : `\n\nYou need to complete deep attribution analysis:
1. Combine account historical data for trend attribution
2. Cross-analyze multiple variables (material/audience/bidding/time)
3. Provide quantifiable optimization paths and expected results
4. Output structured optimization plan (with priority ranking)`;
    }

    // 用户消息
    const diagnosisPrompt = formatDiagnosisPrompt(platform, route, goal, budget, metrics);
    const userMessage = language === 'zh'
      ? diagnosisPrompt
      : `Please diagnose this ${platformName} Ads plan:

Route Type: ${route}
Budget Range: ${budget}
Main Goal: ${goal}
Platform: ${platformName}
${metrics ? `Metrics:\n${Object.entries(metrics).map(([k, v]) => `${k}: ${v}`).join('\n')}` : ''}
${l0Result?.checks?.length ? `L0 Check Results:\n${l0Result.checks.map((c: { id: string; result: string }) => `- ${c.id}: ${c.result}`).join('\n')}` : ''}

Please provide overall score, potential issues, optimization suggestions and current strengths with platform-specific advice.`;

    // ========== 调用Coze智能体（关闭Web Search）==========
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
        // 关闭Web Search（通过custom_variables控制）
        custom_variables: {
          enable_web_search: 'false',
          model_layer: modelConfig.layer,
          max_output_tokens: String(modelConfig.max_output_tokens),
        },
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

    // ========== 创建SSE流式响应 ==========
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

            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();

              if (trimmed === '') {
                currentEvent = '';
                continue;
              }

              if (trimmed.startsWith('event:')) {
                currentEvent = trimmed.slice('event:'.length).trim();
                continue;
              }

              if (trimmed.startsWith('data:')) {
                const raw = trimmed.slice('data:'.length).trim();

                if (currentEvent === 'done' || raw === '[DONE]') {
                  controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
                  continue;
                }

                try {
                  const data = JSON.parse(raw);

                  if (currentEvent === 'conversation.message.delta') {
                    const content = data.reasoning_content || data.content || '';
                    if (content) {
                      controller.enqueue(encoder.encode(`data: ${content}\n\n`));
                    }
                  } else if (currentEvent === 'conversation.chat.completed') {
                    controller.enqueue(encoder.encode(`data: [COMPLETED]\n\n`));
                  } else if (currentEvent === 'conversation.chat.failed') {
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
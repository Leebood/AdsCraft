/**
 * DeepSeek 智能体矩阵配置
 * 用于知识提取、深度归因分析等高级功能
 */

export interface DeepSeekConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

// DeepSeek 模型配置
export const DEEPSEEK_MODELS = {
  // DeepSeek-V3: 用于知识抓取和提取，便宜高效
  knowledgeExtract: {
    model: 'deepseek-chat',
    maxTokens: 4000,
    temperature: 0.3,
  },
  // DeepSeek-R1: 用于复杂案例深度分析，推理链长
  deepAnalysis: {
    model: 'deepseek-reasoner',
    maxTokens: 8000,
    temperature: 0.7,
  },
};

// 获取 DeepSeek 配置
export function getDeepSeekConfig(): DeepSeekConfig | null {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  
  if (!apiKey) {
    console.warn('DeepSeek API key not configured');
    return null;
  }
  
  return {
    apiKey,
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
  };
}

// 知识提取 Prompt
export const KNOWLEDGE_EXTRACT_PROMPT = `
你是一个广告知识提取专家。从以下内容中提取关键知识点：

内容来源：{source}
平台：{platform}

请提取以下信息：
1. 核心概念（3-5个关键概念）
2. 最佳实践（具体可执行的操作建议）
3. 常见问题（用户容易犯的错误）
4. 数据基准（关键指标的参考值）

输出格式（JSON）：
{
  "concepts": [...],
  "bestPractices": [...],
  "commonIssues": [...],
  "benchmarks": [...]
}
`;

// 深度归因分析 Prompt
export const DEEP_ANALYSIS_PROMPT = `
你是一个资深广告分析师。基于以下历史案例，进行深度归因分析：

用户问题：{problem}
历史案例：{cases}
平台：{platform}
线路：{route}

请分析：
1. 问题根因（可能的底层原因）
2. 关联因素（可能影响的其他因素）
3. 解决路径（推荐的解决步骤）
4. 预期结果（改进后的预期指标）

输出格式（JSON）：
{
  "rootCause": "...",
  "relatedFactors": [...],
  "solutionPath": [...],
  "expectedOutcome": {...}
}
`;

// 知识检索函数（使用 pgvector）
export async function searchKnowledge(
  query: string,
  platform: string,
  limit: number = 5
): Promise<Array<{ id: string; title: string; content: string; similarity: number }>> {
  // TODO: 实现 pgvector 语义检索
  // 需要先启用 pgvector 扩展：CREATE EXTENSION vector;
  // 然后生成 query embedding 并进行向量检索
  
  console.log('Knowledge search:', { query, platform, limit });
  return [];
}

// 案例相似度检索
export async function searchSimilarCases(
  input: Record<string, unknown>,
  platform: string,
  route: string,
  limit: number = 3
): Promise<Array<{ id: string; similarity: number; diagnosis_result: Record<string, unknown> }>> {
  // TODO: 实现案例相似度检索
  // 根据输入数据匹配历史成功案例
  
  console.log('Case search:', { input, platform, route, limit });
  return [];
}
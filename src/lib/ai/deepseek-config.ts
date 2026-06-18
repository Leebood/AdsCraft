/**
 * DeepSeek & OpenAI 智能体矩阵配置
 * 用于知识提取、深度归因分析、语义检索等高级功能
 */

export interface DeepSeekConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export interface OpenAIConfig {
  apiKey: string;
  baseUrl: string;
  embeddingModel: string;
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

// OpenAI Embedding 模型配置
export const OPENAI_EMBEDDING_MODEL = 'text-embedding-3-small';
export const EMBEDDING_DIMENSION = 1536;

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

// 获取 OpenAI 配置
export function getOpenAIConfig(): OpenAIConfig | null {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.warn('OpenAI API key not configured');
    return null;
  }
  
  return {
    apiKey,
    baseUrl: 'https://api.openai.com/v1',
    embeddingModel: OPENAI_EMBEDDING_MODEL,
  };
}

// 生成文本 Embedding 向量
export async function generateEmbedding(text: string): Promise<number[] | null> {
  const config = getOpenAIConfig();
  
  if (!config) {
    return null;
  }
  
  try {
    const response = await fetch(`${config.baseUrl}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.embeddingModel,
        input: text,
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI embedding error:', error);
      return null;
    }
    
    const data = await response.json();
    return data.data[0]?.embedding || null;
  } catch (err) {
    console.error('Generate embedding failed:', err);
    return null;
  }
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

// 知识检索函数（语义检索 + 关键词兜底）
export async function searchKnowledge(
  query: string,
  platform: string,
  limit: number = 5
): Promise<Array<{ id: string; title: string; content: string; summary: string; similarity: number; matchedCount?: number }>> {
  try {
    // 动态导入 Supabase 客户端
    const { getSupabaseServerClientAsync } = await import('@/storage/database/supabase-client');
    const supabase = await getSupabaseServerClientAsync();
    
    // 生成查询向量
    const queryEmbedding = await generateEmbedding(query);
    
    // 如果有向量，使用语义检索
    if (queryEmbedding) {
      try {
        const { data: semanticResults, error: semanticError } = await supabase.rpc(
          'match_knowledge_base',
          {
            query_embedding: queryEmbedding,
            match_platform: platform,
            match_limit: limit,
            match_threshold: 0.3,
          }
        );
        
        if (!semanticError && semanticResults && semanticResults.length > 0) {
          return semanticResults.map((item: { id: string; title: string; content: string; summary: string; similarity: number }) => ({
            id: item.id,
            title: item.title,
            content: item.content,
            summary: item.summary,
            similarity: Math.round(item.similarity * 100) / 100,
          }));
        }
      } catch (rpcError) {
        // RPC 函数不存在，使用关键词检索兜底
        console.log('Semantic search RPC not available, using keyword fallback');
      }
    }
    
    // 关键词检索兜底方案
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('id, title, content, summary, tags')
      .eq('platform', platform)
      .is('user_id', null)
      .limit(20);
    
    if (error) {
      console.error('Knowledge search error:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // 提取关键词进行匹配
    const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 1);
    
    // 在内存中进行关键词匹配
    const results = data
      .map(item => {
        const titleLower = item.title?.toLowerCase() || '';
        const contentLower = item.content?.toLowerCase() || '';
        const summaryLower = item.summary?.toLowerCase() || '';
        const tagsLower = (item.tags || []).join(' ').toLowerCase();
        
        // 计算匹配的关键词数量
        const matchedKeywords = keywords.filter(k => 
          titleLower.includes(k) ||
          contentLower.includes(k) ||
          summaryLower.includes(k) ||
          tagsLower.includes(k)
        );
        
        // 计算相似度评分
        const similarity = matchedKeywords.length / Math.max(keywords.length, 1);
        
        return {
          id: item.id,
          title: item.title,
          content: item.content,
          summary: item.summary,
          similarity: Math.round(similarity * 100) / 100,
          matchedCount: matchedKeywords.length,
        };
      })
      .filter(item => item.matchedCount > 0)
      .sort((a, b) => b.similarity - a.similarity || b.matchedCount - a.matchedCount)
      .slice(0, limit);
    
    return results;
  } catch (err) {
    console.error('Knowledge search failed:', err);
    return [];
  }
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

// 为知识库生成并存储 Embedding
export async function storeKnowledgeWithEmbedding(
  knowledge: {
    platform: string;
    source_type: string;
    title: string;
    content: string;
    summary?: string;
    tags?: string[];
    metadata?: Record<string, unknown>;
    user_id?: string;
  }
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    // 生成 embedding
    const embedding = await generateEmbedding(`${knowledge.title}\n${knowledge.content}`);
    
    if (!embedding) {
      return { success: false, error: 'Failed to generate embedding' };
    }
    
    // 动态导入 Supabase 客户端
    const { getSupabaseServerClientAsync } = await import('@/storage/database/supabase-client');
    const supabase = await getSupabaseServerClientAsync();
    
    // 存储知识库条目
    const { data, error } = await supabase
      .from('knowledge_base')
      .insert({
        platform: knowledge.platform,
        source_type: knowledge.source_type,
        title: knowledge.title,
        content: knowledge.content,
        summary: knowledge.summary || '',
        tags: knowledge.tags || [],
        metadata: knowledge.metadata || {},
        embedding: embedding,
        user_id: knowledge.user_id || null,
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('Store knowledge error:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, id: data?.id };
  } catch (err) {
    console.error('Store knowledge failed:', err);
    return { success: false, error: String(err) };
  }
}
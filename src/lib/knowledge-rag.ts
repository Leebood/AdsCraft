/**
 * 知识库RAG检索模块
 * 
 * 从 Supabase pgvector knowledge_base 表检索政策文档
 * 替代 Web Search，提高检索效率和可控性
 */

import { createClient } from '@supabase/supabase-js';

// 知识库文档接口
export interface KnowledgeDocument {
  id: string;
  title: string;
  titleZh?: string;
  content: string;
  contentZh?: string;
  category: string; // policy, case, industry, guide
  platform: string; // tiktok, facebook
  keywords: string[];
  embedding?: number[];
  similarity?: number;
  createdAt: string;
  updatedAt: string;
}

// 检索结果接口
export interface RAGResult {
  documents: KnowledgeDocument[];
  summary: string;
  summaryZh: string;
  topK: number;
  queryKeywords: string[];
}

// Supabase 客户端（服务端）
function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration missing');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

/**
 * 从查询文本中提取关键词
 */
export function extractKeywords(query: string): string[] {
  // 基础关键词提取（可扩展为更复杂的NLP）
  const stopWords = ['的', '是', '在', '有', '和', '了', '对', '要', '这', '那', 'the', 'is', 'a', 'an', 'and', 'or', 'but', 'for', 'to', 'of', 'in'];
  
  // 分词（简单实现）
  const words = query.toLowerCase()
    .replace(/[^\w\s\u4e00-\u9fa5]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 1 && !stopWords.includes(word));
  
  // 提取关键短语
  const phrases: string[] = [];
  
  // 广告相关关键词
  const adKeywords = [
    '拒审', 'rejection', '审核', 'review', '违规', 'violation',
    '素材', 'creative', '广告', 'ad', '视频', 'video', '图片', 'image',
    '受众', 'audience', '定向', 'targeting', '预算', 'budget',
    '转化', 'conversion', '点击', 'click', '展示', 'impression',
    '落地页', 'landing page', 'pixel', '事件', 'event',
    '行业', 'industry', '限制', 'restricted', '禁止', 'prohibited',
    '医疗', 'healthcare', '金融', 'financial', '美容', 'beauty',
  ];
  
  // 匹配广告相关关键词
  for (const keyword of adKeywords) {
    if (query.toLowerCase().includes(keyword.toLowerCase())) {
      phrases.push(keyword);
    }
  }
  
  // 合并结果
  return [...new Set([...phrases, ...words.slice(0, 10)])];
}

/**
 * 从知识库检索相关文档
 */
export async function retrieveFromKnowledgeBase(
  query: string,
  platform: string = 'tiktok',
  topK: number = 5,
  categories?: string[]
): Promise<RAGResult> {
  const keywords = extractKeywords(query);
  
  try {
    const supabase = getSupabaseClient();
    
    // 构建查询
    let queryBuilder = supabase
      .from('knowledge_base')
      .select('*')
      .eq('platform', platform);
    
    // 筛选类别
    if (categories && categories.length > 0) {
      queryBuilder = queryBuilder.in('category', categories);
    }
    
    // 执行查询
    const { data, error } = await queryBuilder.limit(topK * 2);
    
    if (error) {
      console.error('Knowledge base query error:', error);
      return {
        documents: [],
        summary: 'Knowledge base query failed',
        summaryZh: '知识库查询失败',
        topK,
        queryKeywords: keywords,
      };
    }
    
    // 如果没有数据，返回空结果
    if (!data || data.length === 0) {
      return {
        documents: [],
        summary: 'No relevant documents found in knowledge base',
        summaryZh: '知识库中未找到相关文档',
        topK,
        queryKeywords: keywords,
      };
    }
    
    // 基于关键词匹配度排序
    const scoredDocs = data.map(doc => {
      const docKeywords = doc.keywords || [];
      const matchCount = keywords.filter(k => 
        docKeywords.some((dk: string) => dk.toLowerCase().includes(k.toLowerCase()))
      ).length;
      
      // 内容匹配度
      const contentLower = (doc.content || '').toLowerCase();
      const contentMatchCount = keywords.filter(k => contentLower.includes(k.toLowerCase())).length;
      
      return {
        ...doc,
        similarity: (matchCount * 2 + contentMatchCount) / (keywords.length + 1),
      };
    });
    
    // 按相似度排序，取Top K
    const sortedDocs = scoredDocs
      .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
      .slice(0, topK);
    
    // 生成摘要
    const summary = generateSummary(sortedDocs, keywords);
    
    return {
      documents: sortedDocs,
      summary,
      summaryZh: summary, // 可以后续添加中文翻译
      topK,
      queryKeywords: keywords,
    };
    
  } catch (error) {
    console.error('Knowledge base retrieval error:', error);
    return {
      documents: [],
      summary: 'Knowledge base retrieval failed',
      summaryZh: '知识库检索失败',
      topK,
      queryKeywords: keywords,
    };
  }
}

/**
 * 生成知识库检索摘要
 */
function generateSummary(docs: KnowledgeDocument[], keywords: string[]): string {
  if (docs.length === 0) {
    return 'No relevant policy information found.';
  }
  
  const titles = docs.map(d => d.title).join(', ');
  return `Found ${docs.length} relevant documents: ${titles}. Keywords matched: ${keywords.join(', ')}.`;
}

/**
 * 将知识库结果注入到 System Prompt
 */
export function injectKnowledgeToPrompt(
  systemPrompt: string,
  ragResult: RAGResult,
  language: 'zh' | 'en' = 'en'
): string {
  if (ragResult.documents.length === 0) {
    return systemPrompt;
  }
  
  // 构建知识库注入内容
  const knowledgeSection = ragResult.documents.map(doc => {
    const title = language === 'zh' && doc.titleZh ? doc.titleZh : doc.title;
    const content = language === 'zh' && doc.contentZh ? doc.contentZh : doc.content;
    
    return `【${title}】\n${content}`;
  }).join('\n\n---\n\n');
  
  // 注入到 System Prompt
  const injectedPrompt = `${systemPrompt}

===== RELEVANT POLICY KNOWLEDGE (FROM KNOWLEDGE BASE) =====
${knowledgeSection}
===== END OF KNOWLEDGE BASE CONTENT =====

Based on the above policy knowledge, provide your analysis and recommendations.`;

  return injectedPrompt;
}

/**
 * 获取特定类别的政策文档
 */
export async function getPolicyByCategory(
  category: string,
  platform: string = 'tiktok'
): Promise<KnowledgeDocument[]> {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .eq('platform', platform)
      .eq('category', category)
      .order('updatedAt', { ascending: false });
    
    if (error) {
      console.error('Get policy by category error:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Get policy by category failed:', error);
    return [];
  }
}

/**
 * 获取拒审案例库
 */
export async function getRejectionCases(
  platform: string = 'tiktok',
  limit: number = 10
): Promise<KnowledgeDocument[]> {
  return getPolicyByCategory('case', platform).then(docs => docs.slice(0, limit));
}

/**
 * 预置的政策知识（用于开发测试）
 */
export const PRESET_KNOWLEDGE: KnowledgeDocument[] = [
  {
    id: 'tiktok-policy-001',
    title: 'TikTok Ads Prohibited Industries',
    titleZh: 'TikTok广告禁止行业',
    content: `TikTok Ads prohibits advertising for:
- Tobacco and smoking products
- Drugs and controlled substances
- Weapons and firearms
- Adult content and services
- Gambling and betting
- Counterfeit goods
- Hate speech and discriminatory content`,
    contentZh: `TikTok广告禁止以下行业投放：
- 烟草和吸烟产品
- 药品和受控物质
- 武器和枪支
- 成人内容和服务
- 赌博和投注
- 假冒商品
- 仇恨言论和歧视性内容`,
    category: 'policy',
    platform: 'tiktok',
    keywords: ['prohibited', '禁止', 'industry', '行业', 'tobacco', 'drugs', 'weapons', 'gambling'],
    createdAt: '2024-01-01',
    updatedAt: '2024-06-01',
  },
  {
    id: 'tiktok-policy-002',
    title: 'TikTok Ads Restricted Industries',
    titleZh: 'TikTok广告限制行业',
    content: `Restricted industries require special approval:
- Healthcare and medical services
- Pharmaceutical products
- Financial services and banking
- Cryptocurrency and blockchain
- Political advertising
- Beauty and cosmetic procedures`,
    contentZh: `限制行业需要特殊审批：
- 医疗保健和医疗服务
- 药品产品
- 金融服务和银行
- 加密货币和区块链
- 政治广告
- 美容和整容手术`,
    category: 'policy',
    platform: 'tiktok',
    keywords: ['restricted', '限制', 'healthcare', '医疗', 'financial', '金融', 'crypto', 'political'],
    createdAt: '2024-01-01',
    updatedAt: '2024-06-01',
  },
  {
    id: 'tiktok-policy-003',
    title: 'TikTok Ads Creative Guidelines',
    titleZh: 'TikTok广告素材规范',
    content: `Creative guidelines for TikTok Ads:
- Video duration: 5-60 seconds (15-30 recommended)
- Resolution: 720p minimum (1080p recommended)
- Aspect ratio: 9:16, 16:9, 1:1 supported
- No misleading claims or false promises
- Clear brand disclosure required
- Avoid excessive text overlay`,
    contentZh: `TikTok广告素材规范：
- 视频时长：5-60秒（推荐15-30秒）
- 分辨率：720p最低（推荐1080p）
- 宽高比：支持9:16、16:9、1:1
- 不得有误导性声明或虚假承诺
- 需要清晰的品牌披露
- 避免过多文字叠加`,
    category: 'policy',
    platform: 'tiktok',
    keywords: ['creative', '素材', 'video', '视频', 'resolution', '分辨率', 'duration', '时长'],
    createdAt: '2024-01-01',
    updatedAt: '2024-06-01',
  },
];

/**
 * 使用预置知识进行检索（用于开发测试）
 */
export function retrieveFromPresetKnowledge(
  query: string,
  platform: string = 'tiktok',
  topK: number = 5
): RAGResult {
  const keywords = extractKeywords(query);
  
  // 筛选匹配平台的文档
  const platformDocs = PRESET_KNOWLEDGE.filter(d => d.platform === platform);
  
  // 基于关键词匹配度排序
  const scoredDocs = platformDocs.map(doc => {
    const docKeywords = doc.keywords || [];
    const matchCount = keywords.filter(k => 
      docKeywords.some(dk => dk.toLowerCase().includes(k.toLowerCase()))
    ).length;
    
    const contentLower = (doc.content || '').toLowerCase();
    const contentMatchCount = keywords.filter(k => contentLower.includes(k.toLowerCase())).length;
    
    return {
      ...doc,
      similarity: (matchCount * 2 + contentMatchCount) / (keywords.length + 1),
    };
  });
  
  const sortedDocs = scoredDocs
    .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
    .slice(0, topK);
  
  const summary = generateSummary(sortedDocs, keywords);
  
  return {
    documents: sortedDocs,
    summary,
    summaryZh: summary,
    topK,
    queryKeywords: keywords,
  };
}
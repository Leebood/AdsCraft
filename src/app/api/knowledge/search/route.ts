import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClientAsync } from '@/storage/database/supabase-client';
import { searchKnowledge, searchSimilarCases } from '@/lib/ai/deepseek-config';

/**
 * 知识检索 API
 * POST /api/knowledge/search
 * 
 * 使用 pgvector 进行语义检索，匹配相关知识库内容
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, platform, search_type, limit } = body;

    if (!query || !platform) {
      return NextResponse.json(
        { error: 'Missing required fields: query, platform' },
        { status: 400 }
      );
    }

    const searchLimit = limit || 5;

    // 根据搜索类型选择检索方法
    let results;
    
    if (search_type === 'cases') {
      // 搜索相似案例
      results = await searchSimilarCases(query, platform, 'all', searchLimit);
    } else {
      // 搜索知识库
      results = await searchKnowledge(query, platform, searchLimit);
    }

    // 如果 pgvector 未启用，返回空结果
    // 后续可以实现基于关键词的简单检索作为兜底
    
    return NextResponse.json({
      results,
      message: results.length === 0 
        ? '知识库检索功能需要启用 pgvector 扩展' 
        : '检索完成',
    });
  } catch (error) {
    console.error('Knowledge search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * 知识向量化 API
 * POST /api/knowledge/embed
 * 
 * 为知识库内容生成向量，用于语义检索
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClientAsync();
    const body = await request.json();
    const { knowledge_id, content } = body;

    if (!knowledge_id || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: knowledge_id, content' },
        { status: 400 }
      );
    }

    // TODO: 使用 OpenAI text-embedding-3-small 生成向量
    // const embedding = await generateEmbedding(content);
    
    // 更新知识库的 embedding 字段
    // const { error } = await supabase
    //   .from('knowledge_base')
    //   .update({ embedding })
    //   .eq('id', knowledge_id);

    return NextResponse.json({
      message: '向量化功能需要配置 OpenAI Embedding API',
      status: 'pending',
    });
  } catch (error) {
    console.error('Knowledge embed error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
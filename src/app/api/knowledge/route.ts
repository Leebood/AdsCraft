import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClientAsync } from '@/storage/database/supabase-client';

// GET: 获取知识库列表
export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClientAsync();
    const searchParams = request.nextUrl.searchParams;
    
    const platform = searchParams.get('platform') || 'facebook';
    const sourceType = searchParams.get('source_type');
    const tags = searchParams.get('tags');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('knowledge_base')
      .select('id, platform, source_type, title, summary, tags, created_at')
      .eq('platform', platform)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (sourceType) {
      query = query.eq('source_type', sourceType);
    }

    if (tags) {
      query = query.contains('tags', [tags]);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: 添加新知识
export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClientAsync();
    const body = await request.json();

    const { platform, source_type, title, content, summary, tags, metadata } = body;

    if (!title || !content || !source_type) {
      return NextResponse.json(
        { error: 'Missing required fields: title, content, source_type' },
        { status: 400 }
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const knowledgeData = {
      user_id: user?.id || null,
      platform: platform || 'facebook',
      source_type,
      title,
      content,
      summary: summary || null,
      tags: tags || [],
      metadata: metadata || {},
    };

    const { data, error } = await supabase
      .from('knowledge_base')
      .insert(knowledgeData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
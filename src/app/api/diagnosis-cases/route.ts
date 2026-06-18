import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClientAsync } from '@/storage/database/supabase-client';

// GET: 获取用户的诊断案例列表
export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClientAsync();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const platform = searchParams.get('platform');
    const route = searchParams.get('route');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('diagnosis_cases')
      .select('id, platform, route, diagnosis_type, created_at, feedback_score, is_effective')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (platform) {
      query = query.eq('platform', platform);
    }

    if (route) {
      query = query.eq('route', route);
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

// POST: 创建新的诊断案例
export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClientAsync();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const body = await request.json();
    const { platform, route, diagnosis_type, input_data, diagnosis_result } = body;

    if (!platform || !route || !diagnosis_type || !input_data || !diagnosis_result) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const caseData = {
      user_id: user.id,
      platform,
      route,
      diagnosis_type,
      input_data,
      diagnosis_result,
    };

    const { data, error } = await supabase
      .from('diagnosis_cases')
      .insert(caseData)
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

// PATCH: 更新案例反馈
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClientAsync();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const body = await request.json();
    const { case_id, feedback_score, feedback_comment, is_effective } = body;

    if (!case_id) {
      return NextResponse.json(
        { error: 'Missing case_id' },
        { status: 400 }
      );
    }

    // 验证案例属于当前用户
    const { data: existingCase, error: fetchError } = await supabase
      .from('diagnosis_cases')
      .select('id')
      .eq('id', case_id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingCase) {
      return NextResponse.json(
        { error: '案例不存在或无权限' },
        { status: 404 }
      );
    }

    const updateData = {
      feedback_score,
      feedback_comment,
      is_effective,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('diagnosis_cases')
      .update(updateData)
      .eq('id', case_id)
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
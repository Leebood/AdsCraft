import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const route = searchParams.get('route');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // 从 Authorization header 获取 token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const sessionToken = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(sessionToken);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    // 查询答题结果
    const { data, error } = await supabase
      .from('diagnosis_answers')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', platform || '')
      .eq('route', route || '')
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching answers:', error);
      return NextResponse.json({ error: 'Failed to fetch answers' }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, route, answers, compliance_passed } = body;
    
    if (!platform || !route || !answers) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // 从 Authorization header 获取 token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const sessionToken = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(sessionToken);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    // 插入或更新答题结果
    const { data, error } = await supabase
      .from('diagnosis_answers')
      .upsert({
        user_id: user.id,
        platform,
        route,
        answers,
        compliance_passed: compliance_passed || false,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,platform,route'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error saving answers:', error);
      return NextResponse.json({ error: 'Failed to save answers' }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取用户的所有方案
export async function GET(request: NextRequest) {
  const sessionToken = request.headers.get('x-session');
  
  if (!sessionToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = getSupabaseClient(sessionToken);
  
  const { data, error } = await client
    .from('plans')
    .select('id, route, budget, goal, created_at, updated_at')
    .order('created_at', { ascending: false });
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ plans: data });
}

// 创建新方案
export async function POST(request: NextRequest) {
  const sessionToken = request.headers.get('x-session');
  
  if (!sessionToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = getSupabaseClient(sessionToken);
  
  const body = await request.json();
  const { route, budget, goal, plan_data } = body;
  
  if (!route || !budget || !goal || !plan_data) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const { data, error } = await client
    .from('plans')
    .insert({ route, budget, goal, plan_data })
    .select('id');
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ plan: data?.[0] });
}
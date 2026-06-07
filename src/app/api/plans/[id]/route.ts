import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取单个方案详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionToken = request.headers.get('x-session');
  const { id } = await params;
  
  if (!sessionToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = getSupabaseClient(sessionToken);
  
  const { data, error } = await client
    .from('plans')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
  }

  return NextResponse.json({ plan: data });
}

// 更新方案
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionToken = request.headers.get('x-session');
  const { id } = await params;
  
  if (!sessionToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = getSupabaseClient(sessionToken);
  
  const body = await request.json();
  const { route, budget, goal, plan_data } = body;
  
  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (route) updateData.route = route;
  if (budget) updateData.budget = budget;
  if (goal) updateData.goal = goal;
  if (plan_data) updateData.plan_data = plan_data;
  
  const { data, error } = await client
    .from('plans')
    .update(updateData)
    .eq('id', id)
    .select();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ plan: data?.[0] });
}

// 删除方案
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionToken = request.headers.get('x-session');
  const { id } = await params;
  
  if (!sessionToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = getSupabaseClient(sessionToken);
  
  const { error } = await client
    .from('plans')
    .delete()
    .eq('id', id);
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
/**
 * 分析状态查询 API
 * GET /api/analysis-status
 * 
 * 轻量接口，只读最新一条记录的 analysis_result
 * 用于前端轮询 Bot 分析进度
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClientAsync } from '@/storage/database/supabase-client';

export async function GET(request: NextRequest) {
  try {
    // 验证用户登录状态
    const sessionToken = request.headers.get('x-session');

    if (!sessionToken) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }

    const supabase = await getSupabaseServerClientAsync();
    const { data: { user }, error: authError } = await supabase.auth.getUser(sessionToken);

    if (authError || !user) {
      return NextResponse.json(
        { error: '登录状态已过期' },
        { status: 401 }
      );
    }

    // 查询最新一条记录的 analysis_result
    const { data, error } = await supabase
      .from('ad_snapshots')
      .select('analysis_result')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // 如果没有记录，返回 null
      if (error.code === 'PGRST116') {
        return NextResponse.json({ analysis: null });
      }
      console.error('查询 analysis_result 失败:', error);
      return NextResponse.json(
        { error: '查询失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      analysis: data?.analysis_result?.content || null,
    });

  } catch (error) {
    console.error('Analysis status error:', error);
    return NextResponse.json(
      { error: '查询失败' },
      { status: 500 }
    );
  }
}

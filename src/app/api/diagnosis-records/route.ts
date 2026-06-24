/**
 * 诊断记录查询
 * 获取用户的诊断记录列表（FB和TK分开）
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseCredentials } from '@/storage/database/supabase-client';

function getSupabaseServerClient() {
  const { url, anonKey } = getSupabaseCredentials();
  return createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.headers.get('x-session');
    
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseServerClient();
    
    // 验证用户身份
    const { data: { user }, error: userError } = await supabase.auth.getUser(sessionToken);
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // 查询诊断记录（如果diagnosis_cases表存在）
    // 先检查表是否存在，不存在则返回空数组
    const { data: fbRecords, error: fbError } = await supabase
      .from('diagnosis_cases')
      .select('id, platform, diagnosis_type, status, summary, created_at, time_range')
      .eq('user_id', user.id)
      .eq('platform', 'facebook')
      .order('created_at', { ascending: false })
      .limit(10);

    const { data: tkRecords, error: tkError } = await supabase
      .from('diagnosis_cases')
      .select('id, platform, diagnosis_type, status, summary, created_at, time_range')
      .eq('user_id', user.id)
      .eq('platform', 'tiktok')
      .order('created_at', { ascending: false })
      .limit(10);

    // 如果表不存在，返回空数组而不是报错
    if (fbError?.code === 'PGRST204' || fbError?.message?.includes('does not exist')) {
      // 表不存在，使用plans表作为临时替代（用于FB截图诊断）
      const { data: plansData } = await supabase
        .from('plans')
        .select('id, route, budget, goal, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      const fbPlans = (plansData || []).filter(p => p.route?.startsWith('fb'))
        .map(p => ({
          id: p.id.toString(),
          platform: 'facebook',
          diagnosis_type: 'full',
          status: 'completed',
          summary: `${p.budget} - ${p.goal}`,
          created_at: p.created_at,
          time_range: null
        }));

      return NextResponse.json({
        fb_records: fbPlans,
        tk_records: []
      });
    }

    return NextResponse.json({
      fb_records: fbRecords || [],
      tk_records: tkRecords || []
    });

  } catch (error) {
    console.error('Fetch diagnosis records error:', error);
    return NextResponse.json({ 
      fb_records: [], 
      tk_records: [],
      error: 'Internal server error'
    }, { status: 500 });
  }
}
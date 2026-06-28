/**
 * 确认截图指标 API
 * POST /api/confirm-snapshot
 * 
 * 接收用户确认的指标数据，写入 ad_snapshots 表
 * 分析由 Bot 诊断师负责，此接口只做数据入库
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClientAsync } from '@/storage/database/supabase-client';

// 请求体类型
interface SnapshotData {
  campaign_name: string | null;
  snapshot_date: string | null;
  spend: number | null;
  impressions: number | null;
  clicks: number | null;
  ctr: number | null;
  cpc: number | null;
  conversions: number | null;
  cpa: number | null;
  roas: number | null;
  raw_image_url?: string;
  file_key?: string;
}

export async function POST(request: NextRequest) {
  try {
    // 验证用户登录状态
    const sessionToken = request.headers.get('x-session');
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Please login first' },
        { status: 401 }
      );
    }

    const supabase = await getSupabaseServerClientAsync();
    const { data: { user }, error: authError } = await supabase.auth.getUser(sessionToken);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Session expired, please login again' },
        { status: 401 }
      );
    }

    // 解析请求体
    const body: SnapshotData = await request.json();
    
    // 验证必填字段
    if (!body.campaign_name && !body.snapshot_date) {
      return NextResponse.json(
        { error: 'Please provide at least campaign name or date' },
        { status: 400 }
      );
    }

    // 写入 ad_snapshots 表
    const { data, error: insertError } = await supabase
      .from('ad_snapshots')
      .insert({
        user_id: user.id,
        platform: 'facebook',
        campaign_name: body.campaign_name,
        snapshot_date: body.snapshot_date,
        spend: body.spend,
        impressions: body.impressions,
        clicks: body.clicks,
        ctr: body.ctr,
        cpc: body.cpc,
        conversions: body.conversions,
        cpa: body.cpa,
        roas: body.roas,
        raw_image_url: body.raw_image_url || null,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Failed to insert snapshot:', insertError);
      return NextResponse.json(
        { error: 'Failed to save data, please retry' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      saved: true,
      id: data?.id,
      message: 'Data saved, view your diagnosis in the chat bot',
    });

  } catch (error) {
    console.error('Confirm snapshot error:', error);
    return NextResponse.json(
      { error: 'Failed to confirm snapshot, please retry' },
      { status: 500 }
    );
  }
}

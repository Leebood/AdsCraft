/**
 * 截图识别 API
 * POST /api/analyze-screenshot
 * 
 * 接收图片文件，调用沙箱内置 LLM 提取指标
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClientAsync } from '@/storage/database/supabase-client';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

// 截图识别额度映射
const SCREENSHOT_LIMITS: Record<string, number> = {
  free: 3,
  local_service: 15,
  retailer: 30,
  manufacturer: 50,
  brand: 50,
};

// 最大文件大小 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// 支持的图片格式
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// 截图识别 Prompt
const EXTRACT_PROMPT = `这是一张Facebook Ads Manager的截图。请提取以下指标返回JSON格式：
{
  "campaign_name": "广告系列名称",
  "snapshot_date": "截图日期(YYYY-MM-DD格式)",
  "spend": 花费金额(数字),
  "impressions": 展示次数(整数),
  "clicks": 点击次数(整数),
  "ctr": 点击率(百分比数字),
  "cpc": 单次点击成本(数字),
  "conversions": 转化次数(整数),
  "cpa": 单次获取成本(数字),
  "roas": 广告支出回报率(数字)
}

找不到的指标返回null。只返回JSON，不要其他文字。`;

export async function POST(request: NextRequest) {
  try {
    // 验证用户登录状态
    const sessionToken = request.headers.get('x-session');
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: '请先登录后再上传截图' },
        { status: 401 }
      );
    }

    const supabase = await getSupabaseServerClientAsync();
    const { data: { user }, error: authError } = await supabase.auth.getUser(sessionToken);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '登录状态已过期，请重新登录' },
        { status: 401 }
      );
    }

    // 检查截图识别额度
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('screenshot_count_used, screenshot_count_limit, screenshot_reset_at')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('Failed to fetch user screenshot quota:', userError);
    }

    // 获取用户订阅等级
    const { data: subscriptionData } = await supabase
      .from('subscriptions')
      .select('plan_name, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    const planName = subscriptionData?.plan_name?.toLowerCase() || 'free';
    const limit = SCREENSHOT_LIMITS[planName] || SCREENSHOT_LIMITS.free;
    const used = userData?.screenshot_count_used || 0;
    const resetAt = userData?.screenshot_reset_at ? new Date(userData.screenshot_reset_at) : null;
    const now = new Date();

    // 每月1号自动重置
    if (!resetAt || resetAt <= now) {
      const nextReset = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      await supabase
        .from('users')
        .update({
          screenshot_count_used: 0,
          screenshot_count_limit: limit,
          screenshot_reset_at: nextReset.toISOString(),
        })
        .eq('id', user.id);
    } else if (used >= limit) {
      // 额度用完
      return NextResponse.json(
        {
          error: "You've used all your campaign reviews this month. Upgrade your plan to continue.",
          quota: { used, limit, remaining: 0 },
        },
        { status: 429 }
      );
    }

    // 消耗1次额度（不论成功失败都计数）
    await supabase
      .from('users')
      .update({
        screenshot_count_used: used + 1,
        screenshot_count_limit: limit,
      })
      .eq('id', user.id);

    // 解析 multipart/form-data
    const formData = await request.formData();
    const file = formData.get('image') as File | null;
    
    if (!file) {
      return NextResponse.json(
        { error: '请上传图片文件' },
        { status: 400 }
      );
    }

    // 验证文件类型
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: '只支持 JPG、PNG、WEBP 格式的图片' },
        { status: 400 }
      );
    }

    // 验证文件大小
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: '图片过大，请重新截图（最大5MB）' },
        { status: 400 }
      );
    }

    // 转 base64
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const base64Image = fileBuffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64Image}`;

    // 使用沙箱内置 LLM 服务（coze-coding-dev-sdk）
    const config = new Config();
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const client = new LLMClient(config, customHeaders);

    // 创建带图片的多模态消息
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const messages: any[] = [
      {
        role: 'user',
        content: [
          { type: 'text', text: EXTRACT_PROMPT },
          {
            type: 'image_url',
            image_url: {
              url: dataUrl,
              detail: 'high',
            },
          },
        ],
      },
    ];

    // 调用 LLM（使用支持视觉的模型）
    const response = await client.invoke(messages, {
      model: 'doubao-seed-1-8-251228', // 支持视觉的模型
      temperature: 0.3,
    });

    const content = response.content || '';
    
    // 打印 LLM 完整返回内容用于调试
    console.log('[Screenshot Analysis] LLM Response:', content);
    console.log('[Screenshot Analysis] Response content type:', typeof content);
    console.log('[Screenshot Analysis] Response content length:', content.length);

    // 解析 LLM 返回的 JSON
    let extractedData;
    try {
      // 清理可能的 markdown 代码块标记
      const cleanContent = content
        .replace(/```json\n?/g, '')
        .replace(/```/g, '')
        .trim();
      
      console.log('[Screenshot Analysis] Cleaned content:', cleanContent);
      
      extractedData = JSON.parse(cleanContent);
      console.log('[Screenshot Analysis] Parsed data:', JSON.stringify(extractedData, null, 2));
    } catch (parseError) {
      console.error('[Screenshot Analysis] JSON parse error:', parseError);
      console.error('[Screenshot Analysis] Raw content that failed to parse:', content);
      
      // 如果解析失败，返回原始内容让用户手动填写
      extractedData = {
        campaign_name: null,
        snapshot_date: null,
        spend: null,
        impressions: null,
        clicks: null,
        ctr: null,
        cpc: null,
        conversions: null,
        cpa: null,
        roas: null,
        raw_text: content,
      };
    }

    // 添加额度信息
    const { data: updatedUserData } = await supabase
      .from('users')
      .select('screenshot_count_used, screenshot_count_limit')
      .eq('id', user.id)
      .single();

    extractedData.quota = {
      used: updatedUserData?.screenshot_count_used || used + 1,
      limit: updatedUserData?.screenshot_count_limit || limit,
      remaining: (updatedUserData?.screenshot_count_limit || limit) - (updatedUserData?.screenshot_count_used || used + 1),
    };

    // 添加调试信息（开发环境）
    if (process.env.NODE_ENV === 'development') {
      extractedData._debug = {
        llm_response: content,
        response_length: content.length,
        parsed_successfully: content.trim().length > 0 && !content.includes('null'),
      };
    }

    return NextResponse.json(extractedData);

  } catch (error) {
    console.error('Screenshot analysis error:', error);
    
    if (error instanceof Error && error.message.includes('timeout')) {
      return NextResponse.json(
        { error: 'Recognition timeout, please retry' },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: 'Screenshot recognition failed, please retry', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

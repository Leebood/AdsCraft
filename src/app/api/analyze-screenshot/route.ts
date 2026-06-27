/**
 * 截图识别 API
 * POST /api/analyze-screenshot
 * 
 * 接收图片文件，存储到对象存储，调用LLM提取指标
 */

import { NextRequest, NextResponse } from 'next/server';
import { S3Storage, LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { getSupabaseServerClientAsync } from '@/storage/database/supabase-client';

// 多模态消息类型定义
interface ContentPart {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string;
    detail?: 'high' | 'low';
  };
}

interface MultimodalMessage {
  role: 'user' | 'system' | 'assistant';
  content: string | ContentPart[];
}

// 最大文件大小 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// 支持的图片格式
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// 超时时间 30秒（多模态模型处理图片需要更长时间）
const TIMEOUT_MS = 30000;

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

    // 上传图片到对象存储
    const storage = new S3Storage();
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileName = `screenshots/${user.id}/${Date.now()}_${file.name}`;
    
    const fileKey = await storage.uploadFile({
      fileContent: fileBuffer,
      fileName: fileName,
      contentType: file.type,
    });

    // 获取图片访问URL
    const imageUrl = await storage.generatePresignedUrl({
      key: fileKey,
      expireTime: 86400, // 24小时有效期
    });

    // 调用 LLM 提取指标（使用支持视觉的模型）
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const llmConfig = new Config();
    const llmClient = new LLMClient(llmConfig, customHeaders);

    // 创建带图片的多模态消息
    const messages: MultimodalMessage[] = [
      {
        role: 'user',
        content: [
          { type: 'text', text: EXTRACT_PROMPT },
          {
            type: 'image_url',
            image_url: {
              url: imageUrl,
              detail: 'high',
            },
          },
        ],
      },
    ];

    // 设置超时
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('识别超时，请重试')), TIMEOUT_MS);
    });

    // 调用 LLM
    const response = await Promise.race([
      llmClient.invoke(messages, {
        model: 'doubao-seed-2-0-mini-260215', // 使用成本敏感的轻量级多模态模型
        temperature: 0.3, // 低温度保证稳定输出
      }),
      timeoutPromise,
    ]);

    // 解析 LLM 返回的 JSON
    let extractedData;
    try {
      // 清理可能的 markdown 代码块标记
      const content = response.content
        .replace(/```json\n?/g, '')
        .replace(/```/g, '')
        .trim();
      extractedData = JSON.parse(content);
    } catch {
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
        raw_text: response.content,
      };
    }

    // 添加图片URL到返回结果
    extractedData.raw_image_url = imageUrl;
    extractedData.file_key = fileKey;

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
      { error: 'Screenshot recognition failed, please retry' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { PlatformId } from '@/lib/platforms/registry';

// 拒审诊断 Prompt
const REJECTION_DIAGNOSIS_PROMPT = `用户在{platform}投放的广告被拒审，以下是拒审通知内容：
{rejection_content}

请对照{platform}广告政策，逐条排查以下常见拒审原因：
1. 素材违规（虚假承诺/前后对比/低质内容/未授权素材）
2. 文案违规（绝对化用语/竞品商标/误导性表述）
3. 落地页问题（无法访问/内容不一致/禁止品类）
4. 平台特有要求（TikTok: 静图无BGM/竞品商标；FB: 前后对比图/干扰性元素）
5. 行业资质（敏感行业需额外审核）
6. 账户级问题（余额不足/账户受限）

输出格式（JSON）：
{
  "mostLikely": [{"reason": "最可能原因1", "confidence": 0.85}, {"reason": "最可能原因2", "confidence": 0.7}],
  "possible": ["其他可能原因1", "其他可能原因2"],
  "suggestions": ["具体可执行的修改步骤1", "具体可执行的修改步骤2"],
  "checklist": ["修改后的合规checklist项1", "修改后的合规checklist项2"]
}`;

// 平台政策要点
const PLATFORM_POLICY_POINTS = {
  facebook: {
    name: 'Facebook',
    policyUrl: 'https://www.facebook.com/policies/ads',
    keyPoints: [
      '禁止前后对比图展示效果',
      '禁止误导性或干扰性视觉效果（闪烁、抖动）',
      '禁止绝对化用语（最佳、第一、保证）',
      '禁止虚假或误导性声明',
      '落地页必须可访问且与广告内容一致',
      '敏感行业需额外资质审核'
    ]
  },
  tiktok: {
    name: 'TikTok',
    policyUrl: 'https://ads.tiktok.com/help/article/ad-creation-guidelines',
    keyPoints: [
      '静态图片广告必须有背景音乐',
      '禁止展示竞品商标或品牌名称',
      '视频最低720p分辨率',
      '禁止误导性产品效果声明',
      '禁止低质或模糊素材',
      '禁止敏感或成人内容',
      '移动端落地页优化要求'
    ]
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, rejectionText, rejectionImage } = body as {
      platform: PlatformId;
      rejectionText?: string;
      rejectionImage?: string;
    };
    
    if (!platform || !['facebook', 'tiktok'].includes(platform)) {
      return NextResponse.json({ error: 'Invalid platform' }, { status: 400 });
    }
    
    if (!rejectionText && !rejectionImage) {
      return NextResponse.json({ error: 'No rejection content provided' }, { status: 400 });
    }
    
    // 获取平台政策要点
    const policyPoints = PLATFORM_POLICY_POINTS[platform];
    
    // 构建拒审内容
    let rejectionContent = rejectionText || '';
    if (rejectionImage) {
      rejectionContent += '\n[用户上传了拒审通知截图]';
    }
    
    // 构建 Prompt
    const prompt = REJECTION_DIAGNOSIS_PROMPT
      .replace('{platform}', policyPoints.name)
      .replace('{rejection_content}', rejectionContent);
    
    // 获取 API 配置
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
    const apiBaseUrl = process.env.OPENROUTER_API_BASE || 'https://openrouter.ai/api/v1';
    
    if (!apiKey) {
      // 如果没有 API key，返回模拟结果
      return NextResponse.json({
        mostLikely: [
          { reason: platform === 'tiktok' ? '静态图片缺少背景音乐' : '素材包含前后对比图', confidence: 0.8 },
          { reason: '文案存在误导性表述', confidence: 0.6 }
        ],
        possible: [
          '落地页内容与广告不一致',
          '缺少行业资质证明'
        ],
        suggestions: [
          platform === 'tiktok' ? '为静态图片添加合规的背景音乐' : '移除前后对比效果展示',
          '修改文案，避免绝对化用语和误导性声明',
          '确保落地页正常访问且内容一致'
        ],
        checklist: [
          '已移除违规素材元素',
          '已修改文案措辞',
          '已验证落地页可访问',
          '已检查行业资质要求',
          '准备重新提交审核'
        ]
      });
    }
    
    // 调用 AI API
    const response = await fetch(`${apiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'https://adscraft.ai',
        'X-Title': 'AdsCraft Rejection Diagnosis'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `你是${policyPoints.name}广告政策专家。请根据用户提供的拒审通知内容，对照以下政策要点进行排查：
${policyPoints.keyPoints.join('\n')}

政策详情请参考: ${policyPoints.policyUrl}

请输出 JSON 格式的分析结果。`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      return NextResponse.json({ error: 'AI analysis failed' }, { status: 500 });
    }
    
    const aiResponse = await response.json();
    const analysisResult = JSON.parse(aiResponse.choices[0].message.content);
    
    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error('Rejection analysis error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
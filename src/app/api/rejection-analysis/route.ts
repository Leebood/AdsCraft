import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { PlatformId } from '@/lib/platforms/registry';

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
  },
  google: {
    name: 'Google Ads',
    policyUrl: 'https://support.google.com/adspolicy',
    keyPoints: [
      '禁止禁止内容（ counterfeit goods, dangerous products, dishonest behavior）',
      '禁止误导性声明或夸大效果',
      '落地页必须功能正常且相关',
      '禁止滥用广告功能（弹窗、自动下载等）',
      '敏感行业需额外资质审核',
      '版权和商标合规要求'
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
    
    const policyPoints = PLATFORM_POLICY_POINTS[platform];
    
    // 构建拒审内容
    let rejectionContent = rejectionText || '';
    if (rejectionImage) {
      rejectionContent += '\n[用户上传了拒审通知截图]';
    }
    
    // 使用 LLMClient 进行诊断
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    // 不传递任何配置，让 SDK 自动连接到沙箱内置的 Coze API
    const config = new Config();
    const client = new LLMClient(config, customHeaders);
    
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content: `你是${policyPoints.name}广告政策专家。请根据用户提供的拒审通知内容，对照以下政策要点进行排查：
${policyPoints.keyPoints.join('\n')}

政策详情请参考: ${policyPoints.policyUrl}

请输出 JSON 格式的分析结果，包含以下字段：
- mostLikely: 最可能原因列表，每个包含 reason 和 confidence
- possible: 其他可能原因列表  
- suggestions: 具体可执行的修改步骤
- checklist: 修改后的合规检查清单`
      },
      {
        role: 'user',
        content: `用户在${policyPoints.name}投放的广告被拒审，以下是拒审通知内容：
${rejectionContent}

请逐条排查常见拒审原因：
1. 素材违规（虚假承诺/前后对比/低质内容/未授权素材）
2. 文案违规（绝对化用语/竞品商标/误导性表述）
3. 落地页问题（无法访问/内容不一致/禁止品类）
4. 平台特有要求
5. 行业资质（敏感行业需额外审核）
6. 账户级问题（余额不足/账户受限）

输出 JSON 格式结果。`
      }
    ];
    
    // 调用 LLM
    const response = await client.invoke(messages, {
      model: 'deepseek-v3-2-251201',
      temperature: 0.7
    });
    
    // 解析 JSON 结果
    try {
      const result = JSON.parse(response.content);
      return NextResponse.json(result);
    } catch {
      // 如果解析失败，返回结构化结果
      return NextResponse.json({
        mostLikely: [
          { reason: platform === 'tiktok' ? '静态图片缺少背景音乐' : '素材包含前后对比图', confidence: 0.8 }
        ],
        possible: ['文案存在误导性表述', '落地页内容与广告不一致'],
        suggestions: [
          platform === 'tiktok' ? '为静态图片添加合规的背景音乐' : '移除前后对比效果展示',
          '修改文案，避免绝对化用语和误导性声明'
        ],
        checklist: [
          '已移除违规素材元素',
          '已修改文案措辞',
          '已验证落地页可访问',
          '准备重新提交审核'
        ],
        rawOutput: response.content
      });
    }
  } catch (error) {
    console.error('Rejection analysis error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
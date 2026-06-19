/**
 * TikTok 四层审查 API
 * 实现文档：AdsCraft_TK四层审查方案.md
 * 
 * 第一层：硬规则审查（阻断项检查）
 * 第二层：风险评分模型
 * 第三层：AI语义与多模态审查
 * 第四层：真实技术验证（落地页 URL 检测）
 */

import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

// ========== 类型定义 ==========

interface ReviewFormData {
  // Section 1: 基础信息
  platform: 'tiktok_ads';
  countries: string[];
  objective: 'purchase' | 'leads' | 'app_install' | 'website_traffic' | 'dm' | 'live';
  industry: string;
  subCategory?: string;  // 二级子类
  category: string;
  avgOrderValue?: number;
  marginRate?: number;
  targetCPA?: number;
  targetROAS?: number;
  accountType: 'new' | 'mature';
  hasHistoryData: 'yes' | 'no';

  // Section 2: 产品与合规风险
  sensitiveCategories: string[];
  needLicense: 'yes' | 'no' | 'unknown';
  licenseNote?: string;
  hasEffectPromise: 'yes' | 'no';
  effectPromiseExample?: string;
  hasBeforeAfter: string[];
  urgencyTypes: string[];
  landingPageConsistent: 'yes' | 'no' | 'unknown';
  mediaRights: string[];

  // Section 3: 用户与需求判断
  targetAudience: string[];
  painPoints: string[];
  painPointsNote?: string;
  solutionType: string;
  solutionNote?: string;
  purchaseReason: string[];
  competitiveAdvantage: string[];
  socialProof: string[];
  objections: string[];
  objectionsNote?: string;

  // Section 4: 素材审查
  videoUrl?: string;
  coverUrl?: string;
  adCopy?: string;
  subtitleText?: string;
  hookType: string;
  productAppearTime: string;
  creativeType: string[];
  hasCTA: 'yes' | 'no';
  ctaType?: string;
  isVertical: 'yes' | 'no' | 'unknown';
  hasSubtitleAndSound: string;
  creativeCount: number;
  creativeDiffSource: string[];

  // Section 5: 落地页与转化路径
  landingPageUrl: string;
  clickDestination: string;
  firstScreenProductVisible: 'yes' | 'no' | 'unknown';

  // Section 6: 数据与投放设置
  pixelInstalled: 'yes' | 'no' | 'unknown';
  eventsApiConfigured: 'yes' | 'no' | 'unknown';
  keyEventTested: 'yes' | 'no' | 'unknown';
  eventDuplication: 'yes' | 'no' | 'unknown';
  attributionWindow: string;
  weeklyEventCount?: number;
  dailyBudget?: number;
  adGroupCount?: number;
  audienceSize: 'broad' | 'medium' | 'narrow';
  bidStrategy: string;
}

interface ReviewResult {
  // 四维结论
  canSubmit: 'yes' | 'modify_first' | 'no';
  passProbability: 'high' | 'medium' | 'low';
  readinessScore: number;
  profitability: 'feasible' | 'pending' | 'not_feasible' | 'not_evaluated';

  // 各层结果
  layer1Result: {
    status: 'blocked' | 'high_risk' | 'passed';
    blockers: Array<{ item: string; source: string }>;
    highRisks: Array<{ item: string; source: string }>;
  };
  layer2Result: {
    scores: {
      policyCompliance: number;
      dataTracking: number;
      creativeQuality: number;
      landingPage: number;
      deliveryStrategy: number;
    };
    totalScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'very_high';
  };
  layer3Result: Array<{
    riskLevel: 'high' | 'medium' | 'low';
    finding: string;
    position: string;
    reason: string;
    confidence: number;
    suggestion: string;
  }>;
  layer4Result: {
    urlAccessible: boolean;
    redirectChain: string;
    mobileLoadTime?: number;
    httpsValid: boolean;
    pixelDetected: 'installed' | 'not_installed' | 'error';
    priceConsistent: 'consistent' | 'inconsistent' | 'unknown';
    countryReachable: boolean;
    videoSpec?: {
      width: number;
      height: number;
      duration: number;
      bitrate: number;
    };
  };

  // 建议执行顺序
  actionOrder: string[];

  // 原始数据引用
  evidenceSources: Array<{ item: string; source: string }>;
}

// ========== 第一层：硬规则审查 ==========

const BLOCKED_INDUSTRIES = ['tobacco', 'weapons', 'adult', 'illegal_drugs'];
const RESTRICTED_INDUSTRIES = ['medical', 'weight_loss', 'financial', 'crypto', 'gambling'];
const MIN_VIDEO_WIDTH = 540;
const MIN_VIDEO_HEIGHT = 960;
const MIN_BITRATE = 516;

function runLayer1Review(data: ReviewFormData, layer4Result: ReviewResult['layer4Result']): ReviewResult['layer1Result'] {
  const blockers: Array<{ item: string; source: string }> = [];
  const highRisks: Array<{ item: string; source: string }> = [];

  // 检查禁止行业
  if (BLOCKED_INDUSTRIES.some(i => data.industry.includes(i) || data.sensitiveCategories.includes(i))) {
    blockers.push({ item: '产品属于禁止投放行业', source: '用户回答·行业选择' });
  }

  // 检查限制行业资质
  if (RESTRICTED_INDUSTRIES.some(i => data.industry.includes(i) || data.sensitiveCategories.includes(i))) {
    if (data.needLicense === 'yes' && !data.licenseNote) {
      blockers.push({ item: '限制行业缺少资质证明', source: '用户回答·合规部分' });
    } else if (data.needLicense === 'unknown') {
      highRisks.push({ item: '限制行业资质状态不明', source: '用户回答·合规部分' });
    }
  }

  // 检查仿牌
  if (data.sensitiveCategories.includes('fake_brand')) {
    blockers.push({ item: '产品疑似仿牌，禁止投放', source: '用户回答·敏感类别' });
  }

  // 检查视频规格
  if (layer4Result.videoSpec) {
    if (layer4Result.videoSpec.width < MIN_VIDEO_WIDTH || layer4Result.videoSpec.height < MIN_VIDEO_HEIGHT) {
      blockers.push({ item: `视频尺寸不足：${layer4Result.videoSpec.width}×${layer4Result.videoSpec.height}，最低要求540×960`, source: '系统检测·视频规格' });
    }
    if (layer4Result.videoSpec.bitrate < MIN_BITRATE) {
      blockers.push({ item: `视频码率不足：${layer4Result.videoSpec.bitrate}kbps，最低要求516kbps`, source: '系统检测·视频规格' });
    }
  }

  // 检查落地页
  if (!layer4Result.urlAccessible) {
    blockers.push({ item: '落地页无法访问', source: '系统检测·URL可达性' });
  }

  // 检查 Pixel
  if (data.pixelInstalled === 'no') {
    highRisks.push({ item: 'Pixel 未安装，无法追踪转化', source: '用户回答·数据设置' });
  } else if (data.pixelInstalled === 'unknown') {
    highRisks.push({ item: 'Pixel 安装状态不明', source: '用户回答·数据设置' });
  }

  // 检查价格一致性
  if (layer4Result.priceConsistent === 'inconsistent') {
    highRisks.push({ item: '广告价格与落地页不一致', source: '系统检测·页面价格' });
  }

  // 确定状态
  let status: 'blocked' | 'high_risk' | 'passed';
  if (blockers.length > 0) {
    status = 'blocked';
  } else if (highRisks.length > 0) {
    status = 'high_risk';
  } else {
    status = 'passed';
  }

  return { status, blockers, highRisks };
}

// ========== 第二层：风险评分模型 ==========

function runLayer2Review(data: ReviewFormData, layer1Result: ReviewResult['layer1Result']): ReviewResult['layer2Result'] {
  // 如果第一层有阻断项，总分归零
  if (layer1Result.status === 'blocked') {
    return {
      scores: { policyCompliance: 0, dataTracking: 0, creativeQuality: 0, landingPage: 0, deliveryStrategy: 0 },
      totalScore: 0,
      riskLevel: 'very_high'
    };
  }

  // 政策合规评分 (30%)
  let policyScore = 100;
  if (data.sensitiveCategories.length > 0) policyScore -= 20;
  if (data.hasEffectPromise === 'yes') policyScore -= 15;
  if (data.hasBeforeAfter.length > 0) policyScore -= 15;
  if (data.urgencyTypes.length > 0) policyScore -= 10;
  if (data.landingPageConsistent === 'no') policyScore -= 10;
  if (data.mediaRights.includes('unknown')) policyScore -= 10;
  policyScore = Math.max(0, policyScore);

  // 数据追踪评分 (20%)
  let trackingScore = 100;
  if (data.pixelInstalled === 'no') trackingScore = 0;
  else if (data.pixelInstalled === 'unknown') trackingScore = 50;
  if (data.eventsApiConfigured === 'no') trackingScore -= 20;
  if (data.keyEventTested === 'no') trackingScore -= 30;
  if (data.eventDuplication === 'yes') trackingScore -= 15;
  trackingScore = Math.max(0, trackingScore);

  // 素材质量评分 (20%)
  let creativeScore = 100;
  if (data.hookType === 'unknown') creativeScore -= 20;
  if (data.productAppearTime === 'after_10s') creativeScore -= 25;
  if (data.hasCTA === 'no') creativeScore -= 15;
  if (data.isVertical !== 'yes') creativeScore -= 15;
  if (data.hasSubtitleAndSound === 'neither') creativeScore -= 20;
  if (data.creativeCount < 3) creativeScore -= 20;
  if (data.creativeDiffSource.includes('only_background')) creativeScore -= 15;
  creativeScore = Math.max(0, creativeScore);

  // 落地页体验评分 (15%)
  let landingScore = 100;
  if (data.firstScreenProductVisible === 'no') landingScore -= 30;
  landingScore = Math.max(0, landingScore);

  // 投放策略评分 (15%)
  let strategyScore = 100;
  if (data.audienceSize === 'narrow') strategyScore -= 20;
  if (data.dailyBudget && data.targetCPA && data.dailyBudget < data.targetCPA * 3) {
    strategyScore -= 25;
  }
  if (data.adGroupCount && data.adGroupCount > 5) strategyScore -= 15;
  strategyScore = Math.max(0, strategyScore);

  // 加权总分
  const totalScore = Math.round(
    policyScore * 0.3 +
    trackingScore * 0.2 +
    creativeScore * 0.2 +
    landingScore * 0.15 +
    strategyScore * 0.15
  );

  // 风险等级
  let riskLevel: 'low' | 'medium' | 'high' | 'very_high';
  if (totalScore >= 80) riskLevel = 'low';
  else if (totalScore >= 60) riskLevel = 'medium';
  else if (totalScore >= 40) riskLevel = 'high';
  else riskLevel = 'very_high';

  return {
    scores: {
      policyCompliance: policyScore,
      dataTracking: trackingScore,
      creativeQuality: creativeScore,
      landingPage: landingScore,
      deliveryStrategy: strategyScore
    },
    totalScore,
    riskLevel
  };
}

// ========== 第三层：AI 语义审查 ==========

async function runLayer3Review(data: ReviewFormData, customHeaders: Record<string, string>): Promise<ReviewResult['layer3Result']> {
  const findings: ReviewResult['layer3Result'] = [];

  // 如果没有素材文案，跳过 AI 审查
  if (!data.adCopy && !data.subtitleText && !data.videoUrl) {
    return findings;
  }

  try {
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const prompt = `你是 TikTok 广告政策审查专家。请根据以下素材内容进行审查：

【素材信息】
- 文案：${data.adCopy || '未提供'}
- 字幕文本：${data.subtitleText || '未提供'}
- 前三秒钩子类型：${data.hookType}
- 素材类型：${data.creativeType.join(',')}
- 行业：${data.industry}
- 敏感类别：${data.sensitiveCategories.join(',') || '无'}

【审查重点】
1. 是否包含效果承诺（Guaranteed/100%/Best等绝对化用语）
2. 是否暗示不现实效果
3. 是否存在前后对比暗示
4. 素材与受众匹配度
5. CTA 是否清晰有效

请输出 JSON 数组格式的审查结果，每条包含：
- riskLevel: "high" | "medium" | "low"
- finding: 具体发现的内容描述
- position: 出现位置（如"文案第3句"或"视频00:04")
- reason: 为什么构成风险
- confidence: 置信度百分比
- suggestion: 具体修改建议

如果未发现明显问题，返回空数组 []`;

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: '你是 TikTok 广告政策审查专家，输出必须是纯 JSON 格式。' },
      { role: 'user', content: prompt }
    ];

    const response = await client.invoke(messages, {
      model: 'doubao-seed-2-0-mini-260215',
      temperature: 0.3
    });

    // 解析结果
    try {
      const parsed = JSON.parse(response.content);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // 解析失败，返回空数组
    }
  } catch (error) {
    console.error('Layer 3 AI review error:', error);
  }

  return findings;
}

// ========== 第四层：技术验证 ==========

async function runLayer4Review(data: ReviewFormData): Promise<ReviewResult['layer4Result']> {
  const result: ReviewResult['layer4Result'] = {
    urlAccessible: false,
    redirectChain: '',
    httpsValid: false,
    pixelDetected: 'not_installed',
    priceConsistent: 'unknown',
    countryReachable: false
  };

  if (!data.landingPageUrl) {
    return result;
  }

  try {
    // 检查 URL 可访问性
    const urlResponse = await fetch(data.landingPageUrl, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(10000)
    });

    result.urlAccessible = urlResponse.ok;
    result.redirectChain = urlResponse.url || data.landingPageUrl;

    // 检查 HTTPS
    result.httpsValid = urlResponse.url?.startsWith('https://') || data.landingPageUrl.startsWith('https://');

    // 检查页面内容（模拟 Pixel 检测）
    if (urlResponse.ok) {
      const pageResponse = await fetch(data.landingPageUrl, {
        signal: AbortSignal.timeout(15000)
      });
      const pageContent = await pageResponse.text();

      // 检测 TikTok Pixel
      if (pageContent.includes('ttq') || pageContent.includes('tiktok-pixel') || pageContent.includes('tiktok')) {
        result.pixelDetected = 'installed';
      }

      // 简单的价格一致性检查（需要更复杂的解析）
      // 这里只做基础检测
    }

    // 假设目标国家可达（实际需要代理验证）
    result.countryReachable = true;

  } catch (error) {
    console.error('Layer 4 technical validation error:', error);
    result.urlAccessible = false;
  }

  return result;
}

// ========== 四维结论生成 ==========

function generateFourDimensionResults(
  layer1: ReviewResult['layer1Result'],
  layer2: ReviewResult['layer2Result'],
  layer3: ReviewResult['layer3Result'],
  data: ReviewFormData
): {
  canSubmit: 'yes' | 'modify_first' | 'no';
  passProbability: 'high' | 'medium' | 'low';
  readinessScore: number;
  profitability: 'feasible' | 'pending' | 'not_feasible' | 'not_evaluated';
  actionOrder: string[];
  evidenceSources: Array<{ item: string; source: string }>;
} {
  // 能否提交
  let canSubmit: 'yes' | 'modify_first' | 'no';
  if (layer1.status === 'blocked') {
    canSubmit = 'no';
  } else if (layer1.status === 'high_risk' || layer3.some(f => f.riskLevel === 'high')) {
    canSubmit = 'modify_first';
  } else {
    canSubmit = 'yes';
  }

  // 通过概率
  let passProbability: 'high' | 'medium' | 'low';
  if (layer2.totalScore >= 80 && layer3.every(f => f.riskLevel !== 'high')) {
    passProbability = 'high';
  } else if (layer2.totalScore >= 50) {
    passProbability = 'medium';
  } else {
    passProbability = 'low';
  }

  // 跑量准备度
  const readinessScore = layer2.totalScore;

  // 盈利可行性
  let profitability: 'feasible' | 'pending' | 'not_feasible' | 'not_evaluated';
  if (!data.avgOrderValue && !data.marginRate && !data.targetCPA) {
    profitability = 'not_evaluated';
  } else if (data.avgOrderValue && data.targetCPA) {
    if (data.avgOrderValue > data.targetCPA * 2) {
      profitability = 'feasible';
    } else if (data.avgOrderValue > data.targetCPA) {
      profitability = 'pending';
    } else {
      profitability = 'not_feasible';
    }
  } else {
    profitability = 'pending';
  }

  // 建议执行顺序
  const actionOrder: string[] = [];

  // 阻断项优先
  layer1.blockers.forEach(b => actionOrder.push(`解决阻断项：${b.item}`));

  // 高风险项
  layer1.highRisks.forEach(r => actionOrder.push(`修改高风险项：${r.item}`));

  // AI 审查发现
  layer3.filter(f => f.riskLevel === 'high').forEach(f => actionOrder.push(f.suggestion));

  // 策略建议
  if (data.pixelInstalled !== 'yes') actionOrder.push('安装并验证 TikTok Pixel');
  if (data.creativeCount < 3) actionOrder.push('增加差异化素材至少3条');
  if (data.dailyBudget && data.targetCPA && data.dailyBudget < data.targetCPA * 3) {
    actionOrder.push('日预算提升至目标CPA的3倍以上');
  }
  actionOrder.push('小预算测试验证');

  // 证据来源汇总
  const evidenceSources: Array<{ item: string; source: string }> = [
    ...layer1.blockers,
    ...layer1.highRisks,
    ...layer3.map(f => ({ item: f.finding, source: `AI识别·${f.position}·置信度${f.confidence}%` }))
  ];

  return { canSubmit, passProbability, readinessScore, profitability, actionOrder, evidenceSources };
}

// ========== 主 API 处理 ==========

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const formData: ReviewFormData = body;

    // 提取请求头用于 AI 调用
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);

    // 第四层：技术验证（独立执行）
    const layer4Result = await runLayer4Review(formData);

    // 第一层：硬规则审查
    const layer1Result = runLayer1Review(formData, layer4Result);

    // 第二层：风险评分
    const layer2Result = runLayer2Review(formData, layer1Result);

    // 第三层：AI 语义审查
    const layer3Result = await runLayer3Review(formData, customHeaders);

    // 四维结论
    const fourDimResults = generateFourDimensionResults(layer1Result, layer2Result, layer3Result, formData);

    // 组装完整结果
    const result: ReviewResult = {
      canSubmit: fourDimResults.canSubmit,
      passProbability: fourDimResults.passProbability,
      readinessScore: fourDimResults.readinessScore,
      profitability: fourDimResults.profitability,
      layer1Result,
      layer2Result,
      layer3Result,
      layer4Result,
      actionOrder: fourDimResults.actionOrder,
      evidenceSources: fourDimResults.evidenceSources
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('TikTok review API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
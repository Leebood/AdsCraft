/**
 * TikTok 四层审查 API
 * 实现文档：AdsCraft_TK四层审查方案.md
 * 
 * 优化版本：API 调用成本优化
 * - 第一层：纯代码逻辑（0次API调用）
 * - 第二层：纯数学计算（0次API调用）
 * - 第三层：唯一AI调用层（1次GPT-4o-mini调用，<3000 token）
 * - 第四层：纯HTTP请求（0次API调用）
 * 
 * 总目标：一次完整审查 ≤ 1次AI调用 ≤ 5万token
 */

import { NextRequest, NextResponse } from 'next/server';

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

// ========== 第三层：AI 语义审查（唯一AI调用层） ==========
// 使用 GPT-4o-mini，上下文限制 < 3000 token，单次调用完成

async function runLayer3Review(data: ReviewFormData): Promise<ReviewResult['layer3Result']> {
  const findings: ReviewResult['layer3Result'] = [];

  // 如果没有素材文案，跳过 AI 审查（0次API调用）
  if (!data.adCopy && !data.subtitleText) {
    return findings;
  }

  // 检查 OpenAI API Key
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('OpenAI API key not configured, skipping Layer 3 AI review');
    return findings;
  }

  // 精简上下文：只传文案和字幕文本，限制总长度 < 2000 字符（约 500 token）
  const adCopyTrimmed = (data.adCopy || '').slice(0, 800);
  const subtitleTrimmed = (data.subtitleText || '').slice(0, 800);
  
  // 精简 prompt，只传本层需要的最小上下文
  const systemPrompt = '你是 TikTok 广告政策审查专家。输出必须是纯 JSON 数组格式，不要有任何额外文字。';
  
  const userPrompt = `审查以下素材文案：
文案：${adCopyTrimmed || '未提供'}
字幕：${subtitleTrimmed || '未提供'}

仅检查：
1. 效果承诺（Guaranteed/100%/Best/必定/一定等）
2. 不现实效果暗示
3. 前后对比暗示（before/after/使用前后）

输出 JSON 数组：[{"riskLevel":"high|medium|low","finding":"发现内容","position":"位置","reason":"原因","confidence":90,"suggestion":"建议"}]
无问题则返回 []`;

  try {
    // 单次调用 GPT-4o-mini
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1000, // 限制输出 token
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return findings;
    }

    const result = await response.json();
    const content = result.choices[0]?.message?.content || '';
    
    // 记录 token 使用量（用于成本监控）
    console.log(`Layer 3 AI review tokens: prompt=${result.usage?.prompt_tokens || 0}, completion=${result.usage?.completion_tokens || 0}`);

    // 解析结果
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed.map(item => ({
          riskLevel: item.riskLevel || 'medium',
          finding: item.finding || '',
          position: item.position || '未知位置',
          reason: item.reason || '',
          confidence: item.confidence || 80,
          suggestion: item.suggestion || ''
        }));
      }
    } catch {
      // JSON 解析失败，尝试提取数组部分
      const arrayMatch = content.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        try {
          const parsed = JSON.parse(arrayMatch[0]);
          if (Array.isArray(parsed)) {
            return parsed;
          }
        } catch {
          // 提取失败，返回空数组
        }
      }
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

// ========== 诊断模式：从授权账号数据生成诊断报告 ==========

interface AdData {
  total_spend?: number;
  total_impressions?: number;
  total_clicks?: number;
  total_conversions?: number;
  active_campaigns?: number;
  ctr?: number;
  cpc?: number;
  cpa?: number;
  roas?: number;
  conversion_rate?: number;
  frequency?: number;
}

function generateDiagnosisFromAdData(adData: AdData): string {
  // 计算账号阶段
  const daysRunning = 30; // 默认值，实际应该从账号创建时间计算
  let accountStage = '新账号冷启动';
  if (daysRunning > 30) {
    accountStage = '稳定运营';
  }
  
  // 计算日均消耗
  const dailyBudget = adData.total_spend ? adData.total_spend / daysRunning : 0;
  
  // 计算 CTR
  const ctr = adData.ctr || (adData.total_clicks && adData.total_impressions 
    ? (adData.total_clicks / adData.total_impressions * 100) 
    : 0);
  
  // 计算转化率
  const conversionRate = adData.conversion_rate || (adData.total_conversions && adData.total_clicks
    ? (adData.total_conversions / adData.total_clicks * 100)
    : 0);
  
  // 计算 ROAS
  const roas = adData.roas || 0;
  
  // 计算 CPA
  const cpa = adData.cpa || (adData.total_spend && adData.total_conversions
    ? adData.total_spend / adData.total_conversions
    : 0);
  
  // 计算 CPC
  const cpc = adData.cpc || (adData.total_spend && adData.total_clicks
    ? adData.total_spend / adData.total_clicks
    : 0);
  
  // 计算频次
  const frequency = adData.frequency || (adData.total_impressions && adData.total_clicks
    ? adData.total_impressions / adData.total_clicks
    : 1);
  
  // 生成诊断报告
  let diagnosis = `# TikTok 账号诊断报告\n\n`;
  diagnosis += `## 账号状态\n`;
  diagnosis += `- 运营天数：${daysRunning} 天\n`;
  diagnosis += `- 账号阶段：${accountStage}\n`;
  diagnosis += `- 日均消耗：$${dailyBudget.toFixed(2)}\n`;
  diagnosis += `- 活跃广告系列：${adData.active_campaigns || 0} 个\n\n`;
  
  diagnosis += `## 核心指标\n`;
  diagnosis += `- CTR：${ctr.toFixed(2)}%\n`;
  diagnosis += `- CPC：$${cpc.toFixed(2)}\n`;
  diagnosis += `- CPA：$${cpa.toFixed(2)}\n`;
  diagnosis += `- 转化率：${conversionRate.toFixed(2)}%\n`;
  diagnosis += `- ROAS：${roas.toFixed(2)}x\n`;
  diagnosis += `- 频次：${frequency.toFixed(2)}\n\n`;
  
  // 生成建议
  diagnosis += `## 诊断建议\n\n`;
  
  if (ctr < 1) {
    diagnosis += `### 🔴 CTR 偏低（${ctr.toFixed(2)}%）\n`;
    diagnosis += `**问题**：素材吸引力不足或受众定位不精准\n`;
    diagnosis += `**建议**：\n`;
    diagnosis += `1. 优化素材前3秒hook，提升点击率\n`;
    diagnosis += `2. 检查受众定位是否与产品匹配\n`;
    diagnosis += `3. 测试不同创意类型（视频/图片/轮播）\n\n`;
  }
  
  if (conversionRate < 1) {
    diagnosis += `### 🔴 转化率偏低（${conversionRate.toFixed(2)}%）\n`;
    diagnosis += `**问题**：落地页体验不佳或产品与受众不匹配\n`;
    diagnosis += `**建议**：\n`;
    diagnosis += `1. 优化落地页加载速度\n`;
    diagnosis += `2. 检查CTA按钮位置和文案\n`;
    diagnosis += `3. 确保产品描述清晰、有吸引力\n\n`;
  }
  
  if (cpa > 50 && roas < 2) {
    diagnosis += `### 🔴 CPA 过高且 ROAS 偏低\n`;
    diagnosis += `**问题**：投放效率差，需要优化\n`;
    diagnosis += `**建议**：\n`;
    diagnosis += `1. 暂停当前投放，重新定义受众\n`;
    diagnosis += `2. 优化素材创意，提升点击率\n`;
    diagnosis += `3. 考虑更换产品或调整定价策略\n\n`;
  }
  
  if (frequency > 3) {
    diagnosis += `### 🟡 频次偏高（${frequency.toFixed(2)}）\n`;
    diagnosis += `**问题**：受众疲劳，素材被看腻了\n`;
    diagnosis += `**建议**：\n`;
    diagnosis += `1. 立即更换素材或扩展受众池\n`;
    diagnosis += `2. 增加新创意，避免重复展示\n\n`;
  }
  
  if (ctr > 1.5 && conversionRate > 2 && roas > 3) {
    diagnosis += `### 🟢 整体表现健康\n`;
    diagnosis += `**建议**：\n`;
    diagnosis += `1. 可加大预算放量，保持当前策略\n`;
    diagnosis += `2. 持续监控指标变化，及时调整\n\n`;
  }
  
  diagnosis += `## 下一步行动\n`;
  diagnosis += `1. 根据上述建议优化投放策略\n`;
  diagnosis += `2. 上传下一批数据对比趋势\n`;
  diagnosis += `3. 持续监控核心指标变化\n`;
  
  return diagnosis;
}

// ========== 主 API 处理 ==========

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 检查是否为诊断模式（有 ad_data 参数）
    if (body.ad_data) {
      const diagnosis = generateDiagnosisFromAdData(body.ad_data);
      return NextResponse.json({ 
        success: true, 
        diagnosis,
        mode: 'diagnosis',
        ad_data: body.ad_data
      });
    }
    
    const formData: ReviewFormData = body;

    // 第四层：技术验证（0次API调用，纯HTTP请求）
    const layer4Result = await runLayer4Review(formData);

    // 第一层：硬规则审查（0次API调用）
    const layer1Result = runLayer1Review(formData, layer4Result);

    // 第二层：风险评分（0次API调用）
    const layer2Result = runLayer2Review(formData, layer1Result);

    // 第三层：AI语义审查（1次GPT-4o-mini调用，<3000 token）
    const layer3Result = await runLayer3Review(formData);

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
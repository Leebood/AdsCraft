/**
 * AI诊断模板注册表
 * 不同平台有不同的诊断策略和建议模板
 */

// 平台诊断模板类型定义
export interface DiagnosisTemplate {
  platform: string;
  platformName: string;
  
  // 诊断维度
  dimensions: {
    id: string;
    label: string;
    labelZh: string;
    description: string;
    descriptionZh: string;
    weight: number; // 权重，用于优先级排序
  }[];
  
  // 平台特有指标
  metrics: {
    id: string;
    label: string;
    labelZh: string;
    unit?: string;
    benchmark?: {
      good: string;
      average: string;
      poor: string;
    };
  }[];
  
  // 诊断prompt模板
  promptTemplate: string;
  
  // 建议模板
  suggestionTemplate: {
    category: string;
    categoryZh: string;
    template: string;
    templateZh: string;
  }[];
}

// Facebook/Meta 广告诊断模板
export const facebookDiagnosisTemplate: DiagnosisTemplate = {
  platform: 'facebook',
  platformName: 'Facebook Ads',
  
  dimensions: [
    {
      id: 'audience',
      label: 'Audience Targeting',
      labelZh: '受众定向',
      description: 'Analyzing audience targeting strategy and effectiveness',
      descriptionZh: '分析受众定向策略和效果',
      weight: 10,
    },
    {
      id: 'creative',
      label: 'Creative Performance',
      labelZh: '素材表现',
      description: 'Evaluating ad creative quality and engagement',
      descriptionZh: '评估广告素材质量和互动情况',
      weight: 9,
    },
    {
      id: 'budget',
      label: 'Budget Allocation',
      labelZh: '预算分配',
      description: 'Budget distribution and optimization opportunities',
      descriptionZh: '预算分配和优化机会',
      weight: 8,
    },
    {
      id: 'placement',
      label: 'Placement Strategy',
      labelZh: '版位策略',
      description: 'Ad placement performance across platforms',
      descriptionZh: '跨平台广告版位表现',
      weight: 7,
    },
    {
      id: 'bidding',
      label: 'Bidding Strategy',
      labelZh: '出价策略',
      description: 'Bidding strategy effectiveness and cost control',
      descriptionZh: '出价策略效果和成本控制',
      weight: 6,
    },
  ],
  
  metrics: [
    {
      id: 'ctr',
      label: 'CTR',
      labelZh: '点击率',
      unit: '%',
      benchmark: { good: '>1.5%', average: '0.8-1.5%', poor: '<0.8%' },
    },
    {
      id: 'cpm',
      label: 'CPM',
      labelZh: '千次展示成本',
      unit: '$',
      benchmark: { good: '<$10', average: '$10-20', poor: '>$20' },
    },
    {
      id: 'cpc',
      label: 'CPC',
      labelZh: '单次点击成本',
      unit: '$',
      benchmark: { good: '<$1', average: '$1-3', poor: '>$3' },
    },
    {
      id: 'roas',
      label: 'ROAS',
      labelZh: '广告支出回报率',
      unit: 'x',
      benchmark: { good: '>3x', average: '1.5-3x', poor: '<1.5x' },
    },
    {
      id: 'conversion_rate',
      label: 'Conversion Rate',
      labelZh: '转化率',
      unit: '%',
      benchmark: { good: '>3%', average: '1-3%', poor: '<1%' },
    },
    {
      id: 'frequency',
      label: 'Frequency',
      labelZh: '频次',
      unit: 'x',
      benchmark: { good: '<2', average: '2-3', poor: '>3' },
    },
  ],
  
  promptTemplate: `
作为Facebook广告专家，根据以下数据诊断广告问题并给出优化建议：

## 线路类型
{route}

## 广告目标
{goal}

## 预算级别
{budget}

## 广告数据（如有）
{metrics}

## 请按以下维度诊断：

1. **受众定向分析**
   - 评估当前受众策略是否匹配线路特点
   - 检查受众规模是否合适
   - 建议优化方向

2. **素材表现分析**
   - 分析CTR和互动数据
   - 评估素材质量
   - 建议改进方向

3. **预算分配分析**
   - 评估预算使用效率
   - 检查CPM/CPC是否合理
   - 建议调整策略

4. **版位策略分析**
   - 评估各版位表现
   - 建议版位优化

5. **出价策略分析**
   - 评估当前出价效果
   - 建议优化方向

请用中文回复，给出具体可执行的优化建议。
`,
  
  suggestionTemplate: [
    {
      category: 'Audience Expansion',
      categoryZh: '受众扩展',
      template: 'Expand audience by adding LAA 1-2% or Broad targeting',
      templateZh: '扩展受众：添加LAA 1-2%或广泛定向',
    },
    {
      category: 'Creative Refresh',
      categoryZh: '素材更新',
      template: 'Refresh creative with new format or messaging',
      templateZh: '更新素材：尝试新格式或文案',
    },
    {
      category: 'Budget Increase',
      categoryZh: '预算增加',
      template: 'Increase budget by 20-30% for high-performing campaigns',
      templateZh: '预算增加：对高表现广告增加20-30%',
    },
    {
      category: 'Placement Focus',
      categoryZh: '版位聚焦',
      template: 'Focus on Advantage+ placement or specific platforms',
      templateZh: '版位聚焦：使用Advantage+或特定平台',
    },
    {
      category: 'Bid Adjustment',
      categoryZh: '出价调整',
      template: 'Switch to cost cap or target ROAS bidding',
      templateZh: '出价调整：切换到cost cap或target ROAS',
    },
  ],
};

// TikTok 广告诊断模板
export const tiktokDiagnosisTemplate: DiagnosisTemplate = {
  platform: 'tiktok',
  platformName: 'TikTok Ads',
  
  dimensions: [
    {
      id: 'content',
      label: 'Content Quality',
      labelZh: '内容质量',
      description: 'Video content quality and engagement analysis',
      descriptionZh: '视频内容质量和互动分析',
      weight: 10,
    },
    {
      id: 'targeting',
      label: 'Targeting Precision',
      labelZh: '定向精度',
      description: 'Audience targeting effectiveness',
      descriptionZh: '受众定向效果',
      weight: 9,
    },
    {
      id: 'creative_format',
      label: 'Creative Format',
      labelZh: '创意格式',
      description: 'Ad format optimization opportunities',
      descriptionZh: '广告格式优化机会',
      weight: 8,
    },
    {
      id: 'sound_on',
      label: 'Audio Strategy',
      labelZh: '音频策略',
      description: 'Sound-on content effectiveness',
      descriptionZh: '有声内容效果',
      weight: 7,
    },
    {
      id: 'campaign_type',
      label: 'Campaign Type',
      labelZh: '广告类型',
      description: 'Campaign objective alignment',
      descriptionZh: '广告目标匹配度',
      weight: 6,
    },
  ],
  
  metrics: [
    {
      id: 'video_play_rate',
      label: 'Video Play Rate',
      labelZh: '视频播放率',
      unit: '%',
      benchmark: { good: '>80%', average: '50-80%', poor: '<50%' },
    },
    {
      id: 'completion_rate',
      label: 'Completion Rate',
      labelZh: '完播率',
      unit: '%',
      benchmark: { good: '>30%', average: '15-30%', poor: '<15%' },
    },
    {
      id: 'engagement_rate',
      label: 'Engagement Rate',
      labelZh: '互动率',
      unit: '%',
      benchmark: { good: '>5%', average: '2-5%', poor: '<2%' },
    },
    {
      id: 'cpcv',
      label: 'CPCV',
      labelZh: '单次完播成本',
      unit: '$',
      benchmark: { good: '<$0.05', average: '$0.05-0.15', poor: '>$0.15' },
    },
    {
      id: 'ctr',
      label: 'CTR',
      labelZh: '点击率',
      unit: '%',
      benchmark: { good: '>2%', average: '0.5-2%', poor: '<0.5%' },
    },
    {
      id: 'cpm',
      label: 'CPM',
      labelZh: '千次展示成本',
      unit: '$',
      benchmark: { good: '<$5', average: '$5-15', poor: '>$15' },
    },
  ],
  
  promptTemplate: `
作为TikTok广告专家，根据以下数据诊断广告问题并给出优化建议：

## 线路类型
{route}

## 广告目标
{goal}

## 预算级别
{budget}

## 广告数据（如有）
{metrics}

## TikTok特有诊断维度：

1. **内容质量分析**
   - 视频前3秒吸引力评估
   - 内容节奏和信息密度
   - 声音使用策略
   - 建议改进方向

2. **定向精度分析**
   - 受众是否匹配TikTok用户画像
   - 年龄/性别/兴趣定向
   - 建议优化方向

3. **创意格式分析**
   - 广告格式选择（Spark Ads vs In-Feed）
   - 素材时长建议
   - 建议改进方向

4. **音频策略分析**
   - 声音设计是否吸引
   - 音乐/配音选择
   - 建议优化

5. **广告类型分析**
   - 广告目标是否匹配
   - 转化漏斗设计
   - 建议优化

请用中文回复，给出针对TikTok平台的具体优化建议。
`,
  
  suggestionTemplate: [
    {
      category: 'Hook Optimization',
      categoryZh: '开头优化',
      template: 'Improve first 3 seconds with strong hook',
      templateZh: '优化前3秒：设计强吸引力开头',
    },
    {
      category: 'Sound Enhancement',
      categoryZh: '音频增强',
      template: 'Add trending music or clear voiceover',
      templateZh: '添加热门音乐或清晰配音',
    },
    {
      category: 'Duration Adjustment',
      categoryZh: '时长调整',
      template: 'Optimize video length to 15-30 seconds',
      templateZh: '优化视频时长至15-30秒',
    },
    {
      category: 'Format Switch',
      categoryZh: '格式切换',
      template: 'Try Spark Ads with creator content',
      templateZh: '尝试Spark Ads配合创作者内容',
    },
    {
      category: 'Targeting Refinement',
      categoryZh: '定向细化',
      template: 'Use interest+behavior targeting',
      templateZh: '使用兴趣+行为定向组合',
    },
  ],
};

// 模板注册表
export const diagnosisTemplates: Record<string, DiagnosisTemplate> = {
  facebook: facebookDiagnosisTemplate,
  tiktok: tiktokDiagnosisTemplate,
};

// 获取平台诊断模板
export function getDiagnosisTemplate(platform: string): DiagnosisTemplate {
  const template = diagnosisTemplates[platform];
  if (!template) {
    // 默认使用 Facebook 模板
    return facebookDiagnosisTemplate;
  }
  return template;
}

// 格式化诊断prompt
export function formatDiagnosisPrompt(
  platform: string,
  route: string,
  goal: string,
  budget: string,
  metrics?: Record<string, unknown>
): string {
  const template = getDiagnosisTemplate(platform);
  
  let metricsText = '无具体数据';
  if (metrics && Object.keys(metrics).length > 0) {
    metricsText = Object.entries(metrics)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
  }
  
  return template.promptTemplate
    .replace('{route}', route)
    .replace('{goal}', goal)
    .replace('{budget}', budget)
    .replace('{metrics}', metricsText);
}

// 获取平台特有指标基准
export function getMetricBenchmark(
  platform: string,
  metricId: string
): { good: string; average: string; poor: string } | undefined {
  const template = getDiagnosisTemplate(platform);
  const metric = template.metrics.find(m => m.id === metricId);
  return metric?.benchmark;
}

// 获取所有平台的维度列表
export function getAllDimensions(): Array<{
  platform: string;
  platformName: string;
  dimensions: DiagnosisTemplate['dimensions'];
}> {
  return Object.values(diagnosisTemplates).map(template => ({
    platform: template.platform,
    platformName: template.platformName,
    dimensions: template.dimensions,
  }));
}
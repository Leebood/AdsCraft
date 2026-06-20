/**
 * 平台配置注册表
 * 前后端统一读取的平台配置
 */

export interface QuizStep {
  id: string;
  title: string;
  titleZh?: string;           // 中文标题
  description: string;
  descriptionZh?: string;     // 中文描述
  options: Array<{
    id: string;
    label: string;
    labelZh?: string;          // 中文标签
    value: string;
    description?: string;
    descriptionZh?: string;    // 中文描述
  }>;
}

export interface PlatformRoute {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  descriptionZh?: string;
  icon: string;
  color: string;
  price?: number;           // 价格（美元）
  priceText?: string;       // 价格显示文本
  priceTextZh?: string;     // 价格显示文本（中文）
  isFree?: boolean;         // 是否免费
  creemLink?: string;       // Creem 支付链接
  isComingSoon?: boolean;   // 是否"敬请期待"
}

// 合规检查项
export interface ComplianceItem {
  id: string;
  title: string;
  titleZh: string;
  description: string;
  descriptionZh: string;
  category: 'creative' | 'copy' | 'landing_page' | 'platform_specific' | 'industry';
  severity: 'high' | 'medium' | 'low';
}

export interface PlatformConfig {
  id: string;                    // 'facebook' | 'tiktok' | 'google_ads'
  name: string;                  // 'Facebook' | 'TikTok' | 'Google Ads'
  nameZh: string;                // 中文名
  label?: string;                // 显示标签（英文）
  labelZh?: string;              // 显示标签（中文）
  description?: string;          // 描述（英文）
  descriptionZh?: string;        // 描述（中文）
  icon: string;                  // 品牌图标 emoji 或 SVG
  color: string;                 // 品牌色

  // 数据接入方式
  dataSource: 'screenshot' | 'api';

  // OAuth配置（API类平台需要）
  oauth?: {
    authorizeUrl: string;
    tokenUrl: string;
    refreshUrl?: string;
    scopes: string[];
    callbackPath: string;        // /api/auth/{platform}/callback
  };

  // 答题分流（平台专属题目）
  quizFlow: QuizStep[];

  // 指标映射：平台原始字段 → 通用字段
  metricsMap: Record<string, string>;

  // 平台独有指标（通用字段没有的，存platform_metrics JSONB）
  extraMetrics: string[];

  // AI诊断prompt模板
  diagnosisPrompt: string;

  // 行业基准值
  benchmarks: Record<string, { good: number; avg: number; poor: number }>;

  // 路线类型（含定价和支付链接）
  routes: PlatformRoute[];
  
  // 合规检查清单（答题完成后弹出）
  complianceChecklist: ComplianceItem[];
}

/**
 * Facebook 平台配置
 */
export const facebookConfig: PlatformConfig = {
  id: 'facebook',
  name: 'Facebook',
  nameZh: 'Facebook',
  // 简洁抽象图标：蓝色方块内的F字母
  icon: `<svg viewBox="0 0 24 24" class="w-6 h-6"><rect width="24" height="24" rx="4" fill="currentColor"/><text x="12" y="17" text-anchor="middle" font-size="14" font-weight="bold" fill="white">F</text></svg>`,
  color: '#1877F2',
  dataSource: 'screenshot',
  
  quizFlow: [
    {
      id: 'budget',
      title: 'Budget Level',
      titleZh: '预算级别',
      description: 'Select your daily ad budget range',
      descriptionZh: '选择你的日预算范围',
      options: [
        { id: 'low', label: 'Low', labelZh: '低预算', value: 'low', description: '$10-30/day', descriptionZh: '$10-30/天' },
        { id: 'mid', label: 'Medium', labelZh: '中等预算', value: 'mid', description: '$30-100/day', descriptionZh: '$30-100/天' },
        { id: 'high', label: 'High', labelZh: '高预算', value: 'high', description: '$100+/day', descriptionZh: '$100+/天' }
      ]
    },
    {
      id: 'conversionPath',
      title: 'Conversion Path',
      titleZh: '转化路径',
      description: 'How do customers reach you?',
      descriptionZh: '客户如何找到你？',
      options: [
        { id: 'shopify', label: 'Shopify Store', labelZh: 'Shopify店铺', value: 'shopify' },
        { id: 'whatsapp', label: 'WhatsApp', labelZh: 'WhatsApp', value: 'whatsapp' },
        { id: 'store', label: 'Physical Store', labelZh: '实体店', value: 'store' },
        { id: 'lead', label: 'Lead Form', labelZh: '表单留资', value: 'lead' }
      ]
    },
    {
      id: 'goal',
      title: 'Campaign Goal',
      titleZh: '投放目标',
      description: 'What is your primary objective?',
      descriptionZh: '你的主要目标是什么？',
      options: [
        { id: 'sales', label: 'Sales', labelZh: '销售', value: 'sales' },
        { id: 'leads', label: 'Leads', labelZh: '留资', value: 'leads' },
        { id: 'awareness', label: 'Brand Awareness', labelZh: '品牌曝光', value: 'awareness' }
      ]
    }
  ],
  
  metricsMap: {
    'spend': 'spend',
    'impressions': 'impressions',
    'clicks': 'clicks',
    'ctr': 'ctr',
    'cpc': 'cpc',
    'conversions': 'conversions',
    'cost_per_conversion': 'cpa',
    'conversion_value': 'roas'
  },
  
  extraMetrics: ['reach', 'frequency', 'video_views', 'video_view_rate'],
  
  diagnosisPrompt: `你是Facebook广告优化专家。基于以下数据诊断广告问题并提供优化建议：

【广告数据】
- 预算级别：{budget}
- 转化路径：{conversionPath}
- 投放目标：{goal}
- 花费：{spend}
- 展示：{impressions}
- 点击：{clicks}
- CTR：{ctr}
- CPC：{cpc}
- 转化：{conversions}
- CPA：{cpa}

【分析框架】
1. 当前配置问题诊断
2. 问题原因分析
3. 优化建议
4. 预期效果区间`,
  
  benchmarks: {
    ctr: { good: 2.0, avg: 1.0, poor: 0.5 },
    cpc: { good: 0.5, avg: 1.0, poor: 2.0 },
    cpa: { good: 10, avg: 25, poor: 50 },
    roas: { good: 3.0, avg: 1.5, poor: 0.8 }
  },
  
  routes: [
    // Facebook 线路：免费通用方案+诊断 + 4个付费线路
    { 
      id: 'free', 
      name: 'Free Plan + Diagnosis', 
      nameZh: '免费通用方案+诊断', 
      description: 'Free diagnosis + basic config preview',
      descriptionZh: '免费诊断分析 + 配置预览',
      // 简洁抽象几何图标：礼物盒/免费
      icon: `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8V21"/><path d="M3 12h18"/><path d="M12 3c-2 0-4 2-4 5h8c0-3-2-5-4-5z"/></svg>`,
      color: '#22D3EE',
      price: 0,
      priceText: '$0',
      priceTextZh: '$0',
      isFree: true
    },
    { 
      id: 'local_service', 
      name: 'Local Service', 
      nameZh: '本地服务', 
      description: 'Local business / Offline store',
      descriptionZh: '线下门店/服务类商家',
      // 简洁抽象几何图标：定位/门店
      icon: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="3"/><path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z"/></svg>`,
      color: '#10B981',
      price: 9.9,
      priceText: '$9.9/mo',
      priceTextZh: '¥71/月',
      creemLink: 'https://www.creem.io/payment/prod_4iIOpYQLDR8tlnxu6Ziwz6'
    },
    { 
      id: 'retailer', 
      name: 'Retailer', 
      nameZh: '零售商', 
      description: 'E-commerce / Shopify seller',
      descriptionZh: '电商/独立站/Shopify卖货',
      // 简洁抽象几何图标：购物袋
      icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h12v14a2 2 0 01-2 2H8a2 2 0 01-2-2V6z"/><path d="M9 6V4a3 3 0 016 0v2"/><line x1="9" y1="10" x2="15" y2="10" stroke="currentColor" stroke-width="2"/></svg>`,
      color: '#F59E0B',
      price: 19.9,
      priceText: '$19.9/mo',
      priceTextZh: '¥143/月',
      creemLink: 'https://www.creem.io/payment/prod_77H9iTdPoURp4C2Le1xhE8'
    },
    { 
      id: 'manufacturer', 
      name: 'Manufacturer', 
      nameZh: '制造商', 
      description: 'Factory / B2B / Wholesale',
      descriptionZh: '工厂/B2B/批发商',
      // 简洁抽象几何图标：齿轮/制造
      icon: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>`,
      color: '#8B5CF6',
      price: 29.9,
      priceText: '$29.9/mo',
      priceTextZh: '¥215/月',
      creemLink: 'https://www.creem.io/payment/prod_2jkEL15rXCjBQxkEGpXR5v'
    },
    { 
      id: 'brand', 
      name: 'Brand', 
      nameZh: '品牌方', 
      description: 'Brand promotion / New product launch',
      descriptionZh: '品牌推广/新品上市',
      // 简洁抽象几何图标：星星/品牌
      icon: `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12,2 15,8.5 22,9 17,14 18.5,21 12,17.5 5.5,21 7,14 2,9 9,8.5"/></svg>`,
      color: '#EC4899',
      price: 29.9,
      priceText: '$29.9/mo',
      priceTextZh: '¥215/月',
      creemLink: 'https://www.creem.io/payment/prod_2B7hXzysLFhXYvP8bmTa9c'
    }
  ],
  
  // Facebook 合规检查清单
  complianceChecklist: [
    {
      id: 'fb_creative_1',
      title: 'No before/after comparisons',
      titleZh: '无前后对比图',
      description: 'Avoid showing before/after results that imply unrealistic outcomes',
      descriptionZh: '避免展示暗示不切实际效果的前后对比图',
      category: 'creative',
      severity: 'high'
    },
    {
      id: 'fb_creative_2',
      title: 'No misleading visual effects',
      titleZh: '无误导性视觉效果',
      description: 'Do not use flashing, shaking or distracting animation effects',
      descriptionZh: '不要使用闪烁、抖动或分散注意力的动画效果',
      category: 'creative',
      severity: 'high'
    },
    {
      id: 'fb_copy_1',
      title: 'No absolute claims',
      titleZh: '无绝对化用语',
      description: 'Avoid words like "best", "#1", "guaranteed" without proof',
      descriptionZh: '避免"最佳"、"第一"、"保证"等无证据的绝对化用语',
      category: 'copy',
      severity: 'medium'
    },
    {
      id: 'fb_landing_1',
      title: 'Landing page must be functional',
      titleZh: '落地页必须可访问',
      description: 'Ensure landing page loads correctly and matches ad content',
      descriptionZh: '确保落地页正常加载且与广告内容一致',
      category: 'landing_page',
      severity: 'high'
    },
    {
      id: 'fb_platform_1',
      title: 'Facebook pixel properly installed',
      titleZh: 'Facebook Pixel 正确安装',
      description: 'Verify pixel is firing correctly for conversion tracking',
      descriptionZh: '验证 Pixel 正常触发以追踪转化',
      category: 'platform_specific',
      severity: 'medium'
    }
  ]
};

/**
 * TikTok 平台配置
 */
export const tiktokConfig: PlatformConfig = {
  id: 'tiktok',
  name: 'TikTok',
  nameZh: 'TikTok',
  // 简洁抽象图标：粉色/青色方块内的T字母
  icon: `<svg viewBox="0 0 24 24" class="w-6 h-6"><rect width="24" height="24" rx="4" fill="currentColor"/><text x="12" y="17" text-anchor="middle" font-size="14" font-weight="bold" fill="white">T</text></svg>`,
  color: '#000000',
  dataSource: 'api',
  
  oauth: {
    authorizeUrl: 'https://business-api.tiktok.com/openapi/v1.3/oauth2/authorize/',
    tokenUrl: 'https://business-api.tiktok.com/openapi/v1.3/oauth2/token/',
    scopes: ['ad_account.read', 'ad.read', 'ad.report.read', 'campaign.read'],
    callbackPath: '/api/auth/tiktok/callback'
  },
  
  quizFlow: [
    {
      id: 'budget',
      title: 'Budget Level',
      titleZh: '预算级别',
      description: 'Select your daily ad budget range',
      descriptionZh: '选择你的日预算范围',
      options: [
        { id: 'low', label: 'Low', labelZh: '低预算', value: 'low', description: '$10-50/day', descriptionZh: '$10-50/天' },
        { id: 'mid', label: 'Medium', labelZh: '中等预算', value: 'mid', description: '$50-200/day', descriptionZh: '$50-200/天' },
        { id: 'high', label: 'High', labelZh: '高预算', value: 'high', description: '$200+/day', descriptionZh: '$200+/天' }
      ]
    },
    {
      id: 'conversionPath',
      title: 'Conversion Path',
      titleZh: '转化路径',
      description: 'How do customers reach you?',
      descriptionZh: '客户如何找到你？',
      options: [
        { id: 'website', label: 'Website', labelZh: '网站', value: 'website' },
        { id: 'app', label: 'App Download', labelZh: 'App下载', value: 'app' },
        { id: 'lead', label: 'Lead Form', labelZh: '表单留资', value: 'lead' }
      ]
    },
    {
      id: 'goal',
      title: 'Campaign Goal',
      titleZh: '投放目标',
      description: 'What is your primary objective?',
      descriptionZh: '你的主要目标是什么？',
      options: [
        { id: 'sales', label: 'Sales', labelZh: '销售', value: 'sales' },
        { id: 'leads', label: 'Leads', labelZh: '留资', value: 'leads' },
        { id: 'awareness', label: 'Brand Awareness', labelZh: '品牌曝光', value: 'awareness' },
        { id: 'video_views', label: 'Video Views', labelZh: '视频观看', value: 'video_views' }
      ]
    }
  ],
  
  metricsMap: {
    'spend': 'spend',
    'impressions': 'impressions',
    'clicks': 'clicks',
    'ctr': 'ctr',
    'cpc': 'cpc',
    'conversions': 'conversions',
    'cost_per_conversion': 'cpa',
    'conversion_value': 'roas'
  },
  
  extraMetrics: ['video_views', 'video_view_rate', 'profile_visit', 'follower_count', 'average_watch_time'],
  
  diagnosisPrompt: `你是TikTok广告优化专家。基于以下数据诊断广告问题并提供优化建议：

【广告数据】
- 预算级别：{budget}
- 转化路径：{conversionPath}
- 投放目标：{goal}
- 花费：{spend}
- 展示：{impressions}
- 点击：{clicks}
- CTR：{ctr}
- CPC：{cpc}
- 转化：{conversions}
- CPA：{cpa}
- 视频观看：{video_views}
- 视频观看率：{video_view_rate}

【TikTok特有指标分析】
- 完播率分析
- 内容质量评估
- 受众匹配度

【分析框架】
1. 当前配置问题诊断
2. 问题原因分析（重点关注内容质量）
3. 优化建议
4. 预期效果区间`,
  
  benchmarks: {
    ctr: { good: 1.5, avg: 0.8, poor: 0.3 },
    cpc: { good: 0.3, avg: 0.8, poor: 1.5 },
    cpa: { good: 8, avg: 20, poor: 40 },
    video_view_rate: { good: 15, avg: 8, poor: 3 }
  },
  
  routes: [
    // TikTok 线路：免费诊断+拒审排查 + 3个付费线路
    { 
      id: 'rejection_check', 
      name: 'Free Diagnosis + Rejection Check', 
      nameZh: '免费诊断+拒审排查', 
      description: 'Free diagnosis + ad rejection analysis',
      descriptionZh: '免费诊断分析 + 拒审排查',
      // 简洁抽象几何图标：放大镜/排查
      icon: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="11" cy="11" r="7"/><line x1="16" y1="16" x2="21" y2="21" stroke="currentColor" stroke-width="2"/></svg>`,
      color: '#22D3EE',
      price: 0,
      priceText: '$0',
      priceTextZh: '$0',
      isFree: true
    },
    { 
      id: 'local_service', 
      name: 'Local Service', 
      nameZh: '本地服务', 
      description: 'Local business promotion',
      descriptionZh: '本地服务推广',
      // 简洁抽象几何图标：定位/门店
      icon: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="3"/><path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z"/></svg>`,
      color: '#10B981',
      price: 14.9,
      priceText: '$14.9/mo',
      priceTextZh: '¥107/月',
      creemLink: 'https://www.creem.io/payment/prod_sOYjwKXMpsOig5VmY0R4d' 
    },
    { 
      id: 'website_conv', 
      name: 'Website Conversion', 
      nameZh: '网站转化', 
      description: 'Website conversion optimization',
      descriptionZh: '网站转化优化',
      // 简洁抽象几何图标：网页/转化
      icon: `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="2" y1="8" x2="22" y2="8" stroke="currentColor" stroke-width="2"/><circle cx="6" cy="6" r="1"/><circle cx="10" cy="6" r="1"/><path d="M8 14l3 3 5-5"/></svg>`,
      color: '#3B82F6',
      price: 24.9,
      priceText: '$24.9/mo',
      priceTextZh: '¥179/月',
      creemLink: 'https://www.creem.io/payment/prod_8D7PXxYlpaNfTQ9MgMoQ2'
    },
    { 
      id: 'brand_awareness', 
      name: 'Brand Awareness', 
      nameZh: '品牌曝光', 
      description: 'Brand awareness campaign',
      descriptionZh: '品牌知名度推广',
      // 简洁抽象几何图标：星星/品牌
      icon: `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12,2 15,8.5 22,9 17,14 18.5,21 12,17.5 5.5,21 7,14 2,9 9,8.5"/></svg>`,
      color: '#EC4899',
      price: 39.9,
      priceText: '$39.9/mo',
      priceTextZh: '¥287/月',
      creemLink: 'https://www.creem.io/payment/prod_6TrbXbote5e43Baxh87OlK'
    }
  ],
  
  // TikTok 合规检查清单
  complianceChecklist: [
    {
      id: 'tk_creative_1',
      title: 'Static images must have BGM',
      titleZh: '静图必须有背景音乐',
      description: 'TikTok requires background music for static image ads',
      descriptionZh: 'TikTok 要求静态图片广告必须有背景音乐',
      category: 'creative',
      severity: 'high'
    },
    {
      id: 'tk_creative_2',
      title: 'No competitor trademarks',
      titleZh: '无竞品商标',
      description: 'Do not show competitor logos or brand names',
      descriptionZh: '不要展示竞品logo或品牌名称',
      category: 'creative',
      severity: 'high'
    },
    {
      id: 'tk_creative_3',
      title: 'Video quality standards',
      titleZh: '视频质量标准',
      description: 'Minimum 720p resolution, proper aspect ratio (9:16, 1:1, 16:9)',
      descriptionZh: '最低720p分辨率，正确的宽高比(9:16, 1:1, 16:9)',
      category: 'creative',
      severity: 'medium'
    },
    {
      id: 'tk_copy_1',
      title: 'Clear and honest messaging',
      titleZh: '清晰诚实的文案',
      description: 'Avoid misleading claims about product effectiveness',
      descriptionZh: '避免关于产品效果的误导性声明',
      category: 'copy',
      severity: 'medium'
    },
    {
      id: 'tk_landing_1',
      title: 'Mobile-optimized landing page',
      titleZh: '移动端优化落地页',
      description: 'Ensure landing page works well on mobile devices',
      descriptionZh: '确保落地页在移动设备上正常工作',
      category: 'landing_page',
      severity: 'high'
    },
    {
      id: 'tk_platform_1',
      title: 'Proper targeting settings',
      titleZh: '正确的定向设置',
      description: 'Avoid overly narrow targeting that limits reach',
      descriptionZh: '避免过于狭窄的定向限制覆盖范围',
      category: 'platform_specific',
      severity: 'medium'
    }
  ]
};

/**
 * 平台ID类型
 */
export type PlatformId = 'facebook' | 'tiktok';

/**
 * 平台注册表
 */
export const platformRegistry: Record<PlatformId, PlatformConfig> = {
  facebook: facebookConfig,
  tiktok: tiktokConfig
  // google_ads: googleAdsConfig // 预留
};

/**
 * 平台配置列表（用于首页平台选择器）
 */
export const PLATFORM_CONFIGS: Record<PlatformId, PlatformConfig> = {
  facebook: facebookConfig,
  tiktok: tiktokConfig
};

/**
 * 获取平台配置
 */
export function getPlatformConfig(platformId: PlatformId): PlatformConfig | undefined {
  return platformRegistry[platformId];
}

/**
 * 获取所有平台列表
 */
export function getAllPlatforms(): PlatformConfig[] {
  return Object.values(platformRegistry);
}

/**
 * 获取平台的路线列表
 */
export function getPlatformRoutes(platformId: PlatformId) {
  const config = getPlatformConfig(platformId);
  return config?.routes || [];
}

// ========================================
// Quiz 配置
// ========================================

// Facebook Quiz 配置
export const FACEBOOK_QUIZ_CONFIG = {
  budget: {
    titleZh: '你的日均广告预算是多少？',
    titleEn: 'What is your daily ad budget?',
    options: [
      { id: 'low', value: 'low', labelZh: '低预算 (<$30/天)', labelEn: 'Low Budget (<$30/day)', descriptionZh: '适合测试和小规模投放', descriptionEn: 'Suitable for testing' },
      { id: 'mid', value: 'mid', labelZh: '中等预算 ($30-100/天)', labelEn: 'Medium Budget ($30-100/day)', descriptionZh: '适合稳定增长', descriptionEn: 'Suitable for growth' },
      { id: 'high', value: 'high', labelZh: '高预算 (>$100/天)', labelEn: 'High Budget (>$100/day)', descriptionZh: '适合规模化', descriptionEn: 'Suitable for scaling' }
    ]
  },
  conversionPath: {
    titleZh: '你的转化路径是什么？',
    titleEn: 'What is your conversion path?',
    options: [
      { id: 'shopify', value: 'shopify', labelZh: 'Shopify 独立站', labelEn: 'Shopify Store', descriptionZh: '电商独立站', descriptionEn: 'E-commerce store' },
      { id: 'whatsapp', value: 'whatsapp', labelZh: 'WhatsApp 联络', labelEn: 'WhatsApp Contact', descriptionZh: 'WhatsApp转化', descriptionEn: 'WhatsApp conversion' },
      { id: 'store', value: 'store', labelZh: '线下门店', labelEn: 'Physical Store', descriptionZh: '实体店', descriptionEn: 'Offline store' },
      { id: 'lead', value: 'lead', labelZh: '线索收集', labelEn: 'Lead Gen', descriptionZh: '收集客户信息', descriptionEn: 'Collect leads' }
    ]
  },
  goal: {
    titleZh: '你的广告目标是什么？',
    titleEn: 'What is your ad goal?',
    options: [
      { id: 'sales', value: 'sales', labelZh: '直接销售', labelEn: 'Direct Sales', descriptionZh: '成交转化', descriptionEn: 'Sales conversion' },
      { id: 'leads', value: 'leads', labelZh: '线索获取', labelEn: 'Lead Gen', descriptionZh: '获取客户', descriptionEn: 'Get customers' },
      { id: 'awareness', value: 'awareness', labelZh: '品牌曝光', labelEn: 'Brand Awareness', descriptionZh: '品牌知名度', descriptionEn: 'Brand awareness' }
    ]
  }
};

// TikTok 线路专属 Quiz 配置类型
export type RouteQuizStep = {
  id: string;
  titleZh: string;
  titleEn: string;
  options: {
    id: string;
    value: string;
    labelZh: string;
    labelEn: string;
    descriptionZh: string;
    descriptionEn: string;
  }[];
};

export type RouteQuizConfig = Record<string, RouteQuizStep[]>;

// TikTok 线路专属 Quiz 配置（每条线路独立答题2-3题，不交叉）
export const TIKTOK_ROUTE_QUIZ_CONFIGS: RouteQuizConfig = {
  // Local Service 线路：业务类型→目标客户→预算范围
  local_service: [
    {
      id: 'business_type',
      titleZh: '你的业务类型是什么？',
      titleEn: 'What is your business type?',
      options: [
        { id: 'restaurant', value: 'restaurant', labelZh: '餐饮/餐厅', labelEn: 'Restaurant/Food', descriptionZh: '本地餐饮服务', descriptionEn: 'Local food service' },
        { id: 'beauty', value: 'beauty', labelZh: '美容/SPA', labelEn: 'Beauty/SPA', descriptionZh: '美容美发服务', descriptionEn: 'Beauty services' },
        { id: 'fitness', value: 'fitness', labelZh: '健身/瑜伽', labelEn: 'Fitness/Yoga', descriptionZh: '健身运动服务', descriptionEn: 'Fitness services' },
        { id: 'medical', value: 'medical', labelZh: '医疗/诊所', labelEn: 'Medical/Clinic', descriptionZh: '本地医疗服务', descriptionEn: 'Local medical' },
        { id: 'education', value: 'education', labelZh: '教育/培训', labelEn: 'Education/Training', descriptionZh: '本地教育机构', descriptionEn: 'Local education' },
        { id: 'auto', value: 'auto', labelZh: '汽车服务', labelEn: 'Auto Service', descriptionZh: '汽车维修保养', descriptionEn: 'Auto repair' }
      ]
    },
    {
      id: 'target_customer',
      titleZh: '你的目标客户是谁？',
      titleEn: 'Who is your target customer?',
      options: [
        { id: 'local', value: 'local', labelZh: '附近居民（5-10km）', labelEn: 'Nearby residents (5-10km)', descriptionZh: '覆盖周边社区', descriptionEn: 'Cover nearby communities' },
        { id: 'city', value: 'city', labelZh: '城市范围（全市）', labelEn: 'City-wide', descriptionZh: '覆盖整个城市', descriptionEn: 'Cover entire city' },
        { id: 'specific', value: 'specific', labelZh: '特定人群', labelEn: 'Specific group', descriptionZh: '针对特定年龄段/兴趣', descriptionEn: 'Specific age/interest' }
      ]
    },
    {
      id: 'budget_range',
      titleZh: '你的日均预算范围？',
      titleEn: 'What is your daily budget?',
      options: [
        { id: 'low', value: 'low', labelZh: '$10-30/天', labelEn: '$10-30/day', descriptionZh: '小规模测试', descriptionEn: 'Small scale testing' },
        { id: 'mid', value: 'mid', labelZh: '$30-100/天', labelEn: '$30-100/day', descriptionZh: '稳定投放', descriptionEn: 'Stable running' },
        { id: 'high', value: 'high', labelZh: '>$100/天', labelEn: '>$100/day', descriptionZh: '规模化投放', descriptionEn: 'Scale up' }
      ]
    }
  ],
  
  // Website Conversion 线路：产品类型→转化目标→日均预算
  website_conv: [
    {
      id: 'product_type',
      titleZh: '你的产品类型是什么？',
      titleEn: 'What is your product type?',
      options: [
        { id: 'physical', value: 'physical', labelZh: '实体商品', labelEn: 'Physical Products', descriptionZh: '有物流配送的商品', descriptionEn: 'Products with shipping' },
        { id: 'digital', value: 'digital', labelZh: '数字产品', labelEn: 'Digital Products', descriptionZh: '软件/课程/电子书', descriptionEn: 'Software/Courses' },
        { id: 'subscription', value: 'subscription', labelZh: '订阅服务', labelEn: 'Subscription Service', descriptionZh: '月付/年付订阅', descriptionEn: 'Monthly/Yearly subscription' },
        { id: 'service', value: 'service', labelZh: '在线服务', labelEn: 'Online Service', descriptionZh: '咨询/设计等在线服务', descriptionEn: 'Online consulting' }
      ]
    },
    {
      id: 'conversion_goal',
      titleZh: '你的主要转化目标？',
      titleEn: 'What is your conversion goal?',
      options: [
        { id: 'purchase', value: 'purchase', labelZh: '直接购买', labelEn: 'Direct Purchase', descriptionZh: '完成下单付款', descriptionEn: 'Complete purchase' },
        { id: 'signup', value: 'signup', labelZh: '注册/订阅', labelEn: 'Sign Up', descriptionZh: '用户注册账号', descriptionEn: 'User registration' },
        { id: 'download', value: 'download', labelZh: '下载/试用', labelEn: 'Download/Trial', descriptionZh: '下载应用或试用', descriptionEn: 'Download app/trial' },
        { id: 'contact', value: 'contact', labelZh: '联系咨询', labelEn: 'Contact Us', descriptionZh: '提交联系方式', descriptionEn: 'Submit contact' }
      ]
    },
    {
      id: 'daily_budget',
      titleZh: '你的日均预算？',
      titleEn: 'What is your daily budget?',
      options: [
        { id: 'low', value: 'low', labelZh: '$20-50/天', labelEn: '$20-50/day', descriptionZh: '初期测试', descriptionEn: 'Initial testing' },
        { id: 'mid', value: 'mid', labelZh: '$50-150/天', labelEn: '$50-150/day', descriptionZh: '稳定投放', descriptionEn: 'Stable running' },
        { id: 'high', value: 'high', labelZh: '>$150/天', labelEn: '>$150/day', descriptionZh: '规模化', descriptionEn: 'Scale up' }
      ]
    }
  ],
  
  // Brand Awareness 线路：行业→目标受众→投放周期
  brand_awareness: [
    {
      id: 'industry',
      titleZh: '你所在的行业？',
      titleEn: 'What is your industry?',
      options: [
        { id: 'fashion', value: 'fashion', labelZh: '时尚/服饰', labelEn: 'Fashion/Apparel', descriptionZh: '服装鞋帽配饰', descriptionEn: 'Clothing & accessories' },
        { id: 'tech', value: 'tech', labelZh: '科技/数码', labelEn: 'Tech/Digital', descriptionZh: '电子产品数码', descriptionEn: 'Electronics' },
        { id: 'food', value: 'food', labelZh: '食品/饮料', labelEn: 'Food/Beverage', descriptionZh: '食品酒水饮料', descriptionEn: 'Food & drinks' },
        { id: 'health', value: 'health', labelZh: '健康/保健', labelEn: 'Health/Wellness', descriptionZh: '健康保健产品', descriptionEn: 'Health products' },
        { id: 'home', value: 'home', labelZh: '家居/生活', labelEn: 'Home/Lifestyle', descriptionZh: '家居日用产品', descriptionEn: 'Home products' },
        { id: 'other', value: 'other', labelZh: '其他行业', labelEn: 'Other', descriptionZh: '其他行业类型', descriptionEn: 'Other industries' }
      ]
    },
    {
      id: 'target_audience',
      titleZh: '你的目标受众？',
      titleEn: 'Who is your target audience?',
      options: [
        { id: 'young', value: 'young', labelZh: '年轻人群（18-25岁）', labelEn: 'Young (18-25)', descriptionZh: '大学生/年轻人', descriptionEn: 'College/Young adults' },
        { id: 'adult', value: 'adult', labelZh: '成年人群（25-40岁）', labelEn: 'Adults (25-40)', descriptionZh: '职场人士', descriptionEn: 'Working professionals' },
        { id: 'mature', value: 'mature', labelZh: '成熟人群（40+岁）', labelEn: 'Mature (40+)', descriptionZh: '中年及以上', descriptionEn: 'Middle-aged and above' },
        { id: 'broad', value: 'broad', labelZh: '广泛覆盖', labelEn: 'Broad Coverage', descriptionZh: '不限年龄广泛投放', descriptionEn: 'No age limit' }
      ]
    },
    {
      id: 'campaign_duration',
      titleZh: '你的投放周期？',
      titleEn: 'What is your campaign duration?',
      options: [
        { id: 'short', value: 'short', labelZh: '短期（1-2周）', labelEn: 'Short (1-2 weeks)', descriptionZh: '新品上市/活动推广', descriptionEn: 'New launch/Event' },
        { id: 'mid', value: 'mid', labelZh: '中期（1-3个月）', labelEn: 'Medium (1-3 months)', descriptionZh: '品牌认知建立', descriptionEn: 'Brand awareness' },
        { id: 'long', value: 'long', labelZh: '长期（3个月以上）', labelEn: 'Long (3+ months)', descriptionZh: '持续品牌曝光', descriptionEn: 'Continuous exposure' }
      ]
    }
  ],
  
  // 拒审排查入口：上传拒审通知截图→选拒审类型→AI排查
  rejection_check: [
    {
      id: 'rejection_type',
      titleZh: '你的广告被拒审的原因类型？',
      titleEn: 'What type of rejection did you receive?',
      options: [
        { id: 'creative', value: 'creative', labelZh: '素材问题', labelEn: 'Creative Issue', descriptionZh: '图片/视频不符合规范', descriptionEn: 'Image/video not compliant' },
        { id: 'copy', value: 'copy', labelZh: '文案问题', labelEn: 'Copy Issue', descriptionZh: '文字描述违反政策', descriptionEn: 'Text violates policy' },
        { id: 'landing', value: 'landing', labelZh: '落地页问题', labelEn: 'Landing Page Issue', descriptionZh: '网站页面不符合要求', descriptionEn: 'Website not compliant' },
        { id: 'product', value: 'product', labelZh: '产品问题', labelEn: 'Product Issue', descriptionZh: '产品类型受限', descriptionEn: 'Product type restricted' },
        { id: 'unknown', value: 'unknown', labelZh: '原因不明', labelEn: 'Unknown', descriptionZh: '不清楚具体原因', descriptionEn: 'Not sure the reason' }
      ]
    },
    {
      id: 'ad_format',
      titleZh: '被拒审的广告格式？',
      titleEn: 'What ad format was rejected?',
      options: [
        { id: 'video', value: 'video', labelZh: '视频广告', labelEn: 'Video Ad', descriptionZh: '短视频广告素材', descriptionEn: 'Short video ad' },
        { id: 'image', value: 'image', labelZh: '图片广告', labelEn: 'Image Ad', descriptionZh: '静态图片广告', descriptionEn: 'Static image ad' },
        { id: 'carousel', value: 'carousel', labelZh: '轮播广告', labelEn: 'Carousel Ad', descriptionZh: '多图轮播广告', descriptionEn: 'Carousel ad' },
        { id: 'spark', value: 'spark', labelZh: 'Spark Ads', labelEn: 'Spark Ads', descriptionZh: '达人合作广告', descriptionEn: 'Creator ad' }
      ]
    }
  ]
};

// 旧版 TikTok Quiz 配置（保留兼容）
export const TIKTOK_QUIZ_CONFIG = {
  budget: {
    titleZh: '你的日均广告预算是多少？',
    titleEn: 'What is your daily ad budget?',
    options: [
      { id: 'low', value: 'low', labelZh: '低预算 (<$50/天)', labelEn: 'Low Budget (<$50/day)', descriptionZh: '冷启动测试', descriptionEn: 'Cold start testing' },
      { id: 'mid', value: 'mid', labelZh: '中等预算 ($50-200/天)', labelEn: 'Medium Budget ($50-200/day)', descriptionZh: '稳定增长', descriptionEn: 'Stable growth' },
      { id: 'high', value: 'high', labelZh: '高预算 (>$200/天)', labelEn: 'High Budget (>$200/day)', descriptionZh: '规模化投放', descriptionEn: 'Scale up' }
    ]
  },
  conversionPath: {
    titleZh: '你的转化路径是什么？',
    titleEn: 'What is your conversion path?',
    options: [
      { id: 'shopify', value: 'shopify', labelZh: 'Shopify 独立站', labelEn: 'Shopify Store', descriptionZh: '独立站成交', descriptionEn: 'Store sales' },
      { id: 'app', value: 'app', labelZh: 'App 安装', labelEn: 'App Install', descriptionZh: '应用下载', descriptionEn: 'App download' },
      { id: 'lead', value: 'lead', labelZh: '线索收集', labelEn: 'Lead Gen', descriptionZh: '收集客户', descriptionEn: 'Collect leads' }
    ]
  },
  goal: {
    titleZh: '你的广告目标是什么？',
    titleEn: 'What is your ad goal?',
    options: [
      { id: 'sales', value: 'sales', labelZh: '销售转化', labelEn: 'Sales', descriptionZh: '最大化GMV', descriptionEn: 'Maximize GMV' },
      { id: 'app_install', value: 'app_install', labelZh: 'App安装', labelEn: 'App Install', descriptionZh: '应用下载', descriptionEn: 'App downloads' },
      { id: 'awareness', value: 'awareness', labelZh: '品牌曝光', labelEn: 'Awareness', descriptionZh: '品牌认知', descriptionEn: 'Brand awareness' },
      { id: 'live', value: 'live', labelZh: '直播引流', labelEn: 'Live Stream', descriptionZh: '直播间', descriptionEn: 'Live stream' }
    ]
  },
  // TikTok 专属：账号阶段分支（答题完成后追加）
  accountStage: {
    titleZh: '你的TikTok账号处于什么状态？',
    titleEn: 'What is your TikTok account status?',
    options: [
      { id: 'new_account', value: 'new_account', labelZh: '新账号', labelEn: 'New Account', descriptionZh: '刚创建账号，处于冷启动学习期', descriptionEn: 'Just started, in learning phase' },
      { id: 'stable_account', value: 'stable_account', labelZh: '老号平平', labelEn: 'Stable but Flat', descriptionZh: '运行稳定但效果平平无突破', descriptionEn: 'Running stable but no growth' },
      { id: 'declining_account', value: 'declining_account', labelZh: '老号掉量', labelEn: 'Declining', descriptionZh: '效果明显下滑需要诊断', descriptionEn: 'Performance dropping' }
    ]
  }
};

// 获取 Quiz 配置
export function getQuizConfig(platform: PlatformId) {
  return platform === 'tiktok' ? TIKTOK_QUIZ_CONFIG : FACEBOOK_QUIZ_CONFIG;
}
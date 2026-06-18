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

  // 路线类型
  routes: Array<{
    id: string;
    name: string;
    nameZh: string;
    description: string;
    icon: string;
    color: string;
  }>;
}

/**
 * Facebook 平台配置
 */
export const facebookConfig: PlatformConfig = {
  id: 'facebook',
  name: 'Facebook',
  nameZh: 'Facebook',
  icon: '📘',
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
    { id: 'retailer', name: 'Retailer', nameZh: '零售商', description: '电商/独立站/Shopify卖货', icon: '🛍️', color: '#F59E0B' },
    { id: 'manufacturer', name: 'Manufacturer', nameZh: '制造商', description: '工厂/B2B/批发商', icon: '⚙️', color: '#8B5CF6' },
    { id: 'local_service', name: 'Local Service', nameZh: '本地服务商', description: '线下门店/服务类商家', icon: '📍', color: '#10B981' },
    { id: 'brand', name: 'Brand', nameZh: '品牌方', description: '品牌推广/新品上市', icon: '⭐', color: '#EC4899' }
  ]
};

/**
 * TikTok 平台配置
 */
export const tiktokConfig: PlatformConfig = {
  id: 'tiktok',
  name: 'TikTok',
  nameZh: 'TikTok',
  icon: '🎵',
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
        { id: 'tiktok_shop', label: 'TikTok Shop', labelZh: 'TikTok Shop', value: 'tiktok_shop' },
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
    { id: 'tiktok_shop', name: 'TikTok Shop', nameZh: 'TikTok Shop卖家', description: '电商直播带货', icon: '🛒', color: '#FF0050' },
    { id: 'dpa', name: 'DPA', nameZh: '动态产品广告', description: '产品目录广告', icon: '📦', color: '#00F2EA' },
    { id: 'brand', name: 'Brand', nameZh: '品牌推广', description: '品牌曝光/新品发布', icon: '⭐', color: '#EC4899' },
    { id: 'app', name: 'App', nameZh: 'App推广', description: '应用下载推广', icon: '📱', color: '#3B82F6' }
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

// TikTok Quiz 配置
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
      { id: 'tiktok_shop', value: 'tiktok_shop', labelZh: 'TikTok Shop', labelEn: 'TikTok Shop', descriptionZh: '小店成交', descriptionEn: 'Shop sales' },
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
  }
};

// 获取 Quiz 配置
export function getQuizConfig(platform: PlatformId) {
  return platform === 'tiktok' ? TIKTOK_QUIZ_CONFIG : FACEBOOK_QUIZ_CONFIG;
}
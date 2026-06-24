'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n-context';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { TK_REVIEW_TOOLTIPS, getTKReviewTooltip } from '@/lib/tk-review-tooltips';
import { TikTokAuthModal } from '@/components/tiktok-auth-modal';
import { getSupabaseBrowserClientAsync } from '@/lib/supabase-browser';

// ========== 类型定义 ==========

// 字段显隐规则类型
type FieldVisibility = 'required' | 'optional' | 'hidden' | 'conditional';

// 根据推广目标的字段显隐规则
// 三层漏斗结构：品牌认知、受众意向、行为转化
type ObjectiveId = 'reach' | 'traffic' | 'video_views' | 'engagement' | 'app_promotion' | 'lead_collection' | 'sales';

// 推广目标分组（三层漏斗）
const OBJECTIVE_GROUPS = [
  {
    id: 'brand_awareness',
    labelZh: '品牌认知',
    labelEn: 'Brand Awareness',
    objectives: [
      { id: 'reach', zh: '覆盖人数', en: 'Reach' }
    ]
  },
  {
    id: 'audience_intent',
    labelZh: '受众意向',
    labelEn: 'Audience Intent',
    objectives: [
      { id: 'traffic', zh: '访问量', en: 'Traffic' },
      { id: 'video_views', zh: '视频播放量', en: 'Video Views' },
      { id: 'engagement', zh: '社区互动', en: 'Engagement' }
    ]
  },
  {
    id: 'conversion',
    labelZh: '行为转化',
    labelEn: 'Conversion',
    objectives: [
      { id: 'app_promotion', zh: '应用推广', en: 'App Promotion' },
      { id: 'lead_collection', zh: '线索收集', en: 'Lead Collection' },
      { id: 'sales', zh: '销量', en: 'Sales' }
    ]
  }
];

const OBJECTIVE_FIELD_RULES: Record<ObjectiveId, Record<string, FieldVisibility>> = {
  // 品牌认知 - 覆盖人数
  reach: {
    target_roas: 'hidden',
    target_cpa: 'hidden',
    cta_button: 'optional',
    landing_page_url: 'optional',
    app_store_url: 'hidden',
    form_type: 'hidden',
    pixel_status: 'optional',
    events_api: 'optional',
    event_verification: 'optional',
    event_duplication: 'optional',
    mmp_integration: 'hidden',
  },
  // 受众意向 - 访问量
  traffic: {
    target_roas: 'optional',
    target_cpa: 'optional',
    cta_button: 'required',
    landing_page_url: 'required',
    app_store_url: 'hidden',
    form_type: 'hidden',
    pixel_status: 'required',
    events_api: 'required',
    event_verification: 'required',
    event_duplication: 'required',
    mmp_integration: 'hidden',
  },
  // 受众意向 - 视频播放量
  video_views: {
    target_roas: 'optional',
    target_cpa: 'optional',
    cta_button: 'optional',
    landing_page_url: 'optional',
    app_store_url: 'hidden',
    form_type: 'hidden',
    pixel_status: 'optional',
    events_api: 'optional',
    event_verification: 'optional',
    event_duplication: 'optional',
    mmp_integration: 'hidden',
  },
  // 受众意向 - 社区互动
  engagement: {
    target_roas: 'optional',
    target_cpa: 'optional',
    cta_button: 'optional',
    landing_page_url: 'optional',
    app_store_url: 'hidden',
    form_type: 'hidden',
    pixel_status: 'optional',
    events_api: 'optional',
    event_verification: 'optional',
    event_duplication: 'optional',
    mmp_integration: 'hidden',
  },
  // 行为转化 - 应用推广
  app_promotion: {
    target_roas: 'optional',
    target_cpa: 'required',
    cta_button: 'required',
    landing_page_url: 'hidden',
    app_store_url: 'required',
    form_type: 'hidden',
    pixel_status: 'hidden',
    events_api: 'hidden',
    event_verification: 'hidden',
    event_duplication: 'hidden',
    mmp_integration: 'required',
  },
  // 行为转化 - 线索收集
  lead_collection: {
    target_roas: 'optional',
    target_cpa: 'required',
    cta_button: 'required',
    landing_page_url: 'conditional',
    app_store_url: 'hidden',
    form_type: 'required',
    pixel_status: 'conditional',
    events_api: 'conditional',
    event_verification: 'optional',
    event_duplication: 'optional',
    mmp_integration: 'hidden',
  },
  // 行为转化 - 销量
  sales: {
    target_roas: 'required',
    target_cpa: 'optional',
    cta_button: 'required',
    landing_page_url: 'required',
    app_store_url: 'hidden',
    form_type: 'hidden',
    pixel_status: 'required',
    events_api: 'required',
    event_verification: 'required',
    event_duplication: 'required',
    mmp_integration: 'hidden',
  },
};

// CTA按钮默认值
const CTA_DEFAULTS: Record<ObjectiveId, { value: string; labelZh: string; labelEn: string }> = {
  reach: { value: 'learn_more', labelZh: '了解更多', labelEn: 'Learn More' },
  traffic: { value: 'learn_more', labelZh: '了解更多', labelEn: 'Learn More' },
  video_views: { value: 'watch_now', labelZh: '立即观看', labelEn: 'Watch Now' },
  engagement: { value: 'send_message', labelZh: '发送私信', labelEn: 'Send Message' },
  app_promotion: { value: 'install_now', labelZh: '立即安装', labelEn: 'Install Now' },
  lead_collection: { value: 'learn_more', labelZh: '了解更多', labelEn: 'Learn More' },
  sales: { value: 'shop_now', labelZh: '立即购买', labelEn: 'Shop Now' },
};

// 获取字段显隐状态
function getFieldVisibility(objective: ObjectiveId | '', fieldId: string, formData?: FormData): FieldVisibility {
  if (!objective) return 'optional'; // 未选择目标时默认可选
  
  const rules = OBJECTIVE_FIELD_RULES[objective];
  const visibility = rules[fieldId] || 'optional';
  
  // 处理 conditional 类型
  if (visibility === 'conditional' && formData) {
    if (fieldId === 'landing_page_url' || fieldId === 'pixel_status' || fieldId === 'events_api') {
      // 线索目标：根据表单类型决定
      if (formData.formType === 'external') {
        return fieldId === 'landing_page_url' ? 'required' : 'required';
      } else {
        return 'hidden'; // 原生表单时隐藏
      }
    }
  }
  
  return visibility;
}

interface FormData {
  // Section 1: 基础信息
  platform: 'tiktok_ads' | '';
  countries: string[];
  objective: ObjectiveId | '';
  industry: string;
  subCategory?: string;  // 二级子类
  category: string;
  avgOrderValue?: number;
  marginRate?: number;
  targetCPA?: number;
  targetROAS?: number;  // 新增：目标ROAS
  accountType: 'new' | 'mature' | '';
  hasHistoryData: 'yes' | 'no' | '';

  // Section 2: 合规风险
  sensitiveCategories: string[];
  needLicense: 'yes' | 'no' | 'unknown' | '';
  hasEffectPromise: 'yes' | 'no' | '';
  hasBeforeAfter: string[];
  urgencyTypes: string[];
  landingPageConsistent: 'yes' | 'no' | 'unknown' | '';
  mediaRights: string[];

  // Section 3: 用户需求
  targetAudience: string[];
  painPoints: string[];
  solutionType: string;
  purchaseReason: string[];
  competitiveAdvantage: string[];
  socialProof: string[];
  objections: string[];

  // Section 4: 素材审查
  hookType: string;
  productAppearTime: string;
  creativeType: string[];
  hasCTA: 'yes' | 'no' | '';
  ctaButton?: string;  // 新增：CTA按钮类型
  isVertical: 'yes' | 'no' | 'unknown' | '';
  hasSubtitleAndSound: string;
  creativeCount: number;
  creativeDiffSource: string[];
  adCopy: string;
  subtitleText: string;

  // Section 5: 落地页
  landingPageUrl: string;
  appStoreUrl?: string;  // 新增：应用商店链接
  formType?: 'native' | 'external' | '';  // 新增：表单类型（原生/站外）
  clickDestination: string;
  firstScreenProductVisible: 'yes' | 'no' | 'unknown' | '';

  // Section 6: 数据设置
  pixelInstalled: 'yes' | 'no' | 'unknown' | '';
  eventsApiConfigured: 'yes' | 'no' | 'unknown' | '';
  keyEventTested: 'yes' | 'no' | 'unknown' | '';
  eventDuplication?: 'yes' | 'no' | 'unknown' | '';  // 新增：事件重复上报
  mmpIntegration?: 'yes' | 'no' | 'unknown' | '';  // 新增：MMP集成
  attributionWindow: string;
  dailyBudget?: number;
  adGroupCount?: number;
  audienceSize: 'broad' | 'medium' | 'narrow' | '';
  bidStrategy: string;
}

interface ReviewResult {
  canSubmit: 'yes' | 'modify_first' | 'no';
  passProbability: 'high' | 'medium' | 'low';
  readinessScore: number;
  profitability: 'feasible' | 'pending' | 'not_feasible' | 'not_evaluated';
  layer1Result: {
    status: 'blocked' | 'high_risk' | 'passed';
    blockers: Array<{ item: string; source: string }>;
    highRisks: Array<{ item: string; source: string }>;
  };
  layer2Result: {
    scores: Record<string, number>;
    totalScore: number;
    riskLevel: string;
  };
  layer3Result: Array<{
    riskLevel: string;
    finding: string;
    position: string;
    confidence: number;
    suggestion: string;
  }>;
  actionOrder: string[];
}

// ========== 行业选项 ==========

// 子类别类型（支持中英文）
type SubCategory = { zh: string; en: string };

// 一级行业分类（对齐TikTok官方，支持中英文）
const INDUSTRIES = [
  { id: 'retail_ecommerce', labelZh: '电商/零售', labelEn: 'Retail & E-commerce', restricted: false, subCategories: [{ zh: '实体商品', en: 'Physical Products' }, { zh: '虚拟商品', en: 'Virtual Products' }, { zh: '平台型', en: 'Platform-based' }] },
  { id: 'clothing_accessories', labelZh: '服装/配饰', labelEn: 'Clothing & Accessories', restricted: false, subCategories: [{ zh: '服饰', en: 'Apparel' }, { zh: '鞋包', en: 'Shoes & Bags' }, { zh: '珠宝饰品', en: 'Jewelry & Accessories' }] },
  { id: 'beauty_personal', labelZh: '美容/个护', labelEn: 'Beauty & Personal Care', restricted: 'partial', subCategories: [{ zh: '护肤彩妆', en: 'Skincare & Makeup' }, { zh: '美发美甲', en: 'Hair & Nail' }, { zh: '工具仪器', en: 'Tools & Devices' }] },
  { id: 'food_beverage', labelZh: '餐饮/食品饮料', labelEn: 'Food & Beverage', restricted: false, subCategories: [] as SubCategory[] },
  { id: 'consumer_electronics', labelZh: '科技/消费电子', labelEn: 'Consumer Electronics', restricted: false, subCategories: [{ zh: '3C数码', en: '3C Digital' }, { zh: '智能家居', en: 'Smart Home' }, { zh: '配件', en: 'Accessories' }] },
  { id: 'utility_software', labelZh: '工具软件/App', labelEn: 'Utility Software', restricted: false, subCategories: [] as SubCategory[] },
  { id: 'education_training', labelZh: '教育/培训', labelEn: 'Education & Training', restricted: false, subCategories: [] as SubCategory[] },
  { id: 'healthcare_pharma', labelZh: '健康/医疗', labelEn: 'Healthcare & Pharmaceutical', restricted: true, subCategories: [{ zh: '保健品', en: 'Health Supplements' }, { zh: '医疗器械', en: 'Medical Devices' }, { zh: '诊所服务', en: 'Clinic Services' }] },
  { id: 'finance_business', labelZh: '金融/商业服务', labelEn: 'Finance & Business', restricted: true, subCategories: [{ zh: '银行保险', en: 'Banking & Insurance' }, { zh: '投资加密', en: 'Investment & Crypto' }, { zh: 'B2B服务', en: 'B2B Services' }] },
  { id: 'real_estate', labelZh: '房地产', labelEn: 'Real Estate', restricted: false, subCategories: [] as SubCategory[] },
  { id: 'travel', labelZh: '旅游', labelEn: 'Travel', restricted: false, subCategories: [] as SubCategory[] },
  { id: 'automotive', labelZh: '汽车', labelEn: 'Automotive', restricted: false, subCategories: [] as SubCategory[] },
  { id: 'gaming', labelZh: '游戏', labelEn: 'Gaming', restricted: false, subCategories: [] as SubCategory[] },
  { id: 'entertainment_media', labelZh: '娱乐/媒体', labelEn: 'Entertainment & Media', restricted: false, subCategories: [] as SubCategory[] },
  { id: 'sports_fitness', labelZh: '运动/健身', labelEn: 'Sports & Fitness', restricted: 'partial', subCategories: [] as SubCategory[] },
  { id: 'home_garden', labelZh: '家居/园艺', labelEn: 'Home & Garden', restricted: false, subCategories: [] as SubCategory[] },
  { id: 'local_services', labelZh: '本地服务', labelEn: 'Local Services', restricted: false, subCategories: [{ zh: '到店型', en: 'In-store' }, { zh: '上门型', en: 'On-site' }, { zh: '线上预约', en: 'Online Booking' }] },
  { id: 'other', labelZh: '其他', labelEn: 'Other', restricted: false, subCategories: [] as SubCategory[] }
];

// 授权用户补充问题选项

// Q1: 行业细分（根据一级行业展示细分选项）
const INDUSTRY_SUBCATEGORIES: Record<string, { id: string; zh: string; en: string }[]> = {
  // 电商
  retail_ecommerce: [
    { id: 'fashion_apparel', zh: '服饰鞋包', en: 'Fashion & Apparel' },
    { id: 'beauty_cosmetics', zh: '美妆个护', en: 'Beauty & Cosmetics' },
    { id: 'electronics_digital', zh: '3C数码', en: 'Electronics & Digital' },
    { id: 'home_furnishing', zh: '家居家装', en: 'Home & Furnishing' },
    { id: 'food_beverage', zh: '食品饮料', en: 'Food & Beverage' },
    { id: 'jewelry_accessories', zh: '珠宝配饰', en: 'Jewelry & Accessories' },
    { id: 'other', zh: '其他', en: 'Other' }
  ],
  // 应用
  utility_software: [
    { id: 'gaming', zh: '游戏', en: 'Gaming' },
    { id: 'tools', zh: '工具', en: 'Tools' },
    { id: 'social', zh: '社交', en: 'Social' },
    { id: 'education', zh: '教育', en: 'Education' },
    { id: 'finance', zh: '金融', en: 'Finance' },
    { id: 'other', zh: '其他', en: 'Other' }
  ],
  // 本地服务
  local_services: [
    { id: 'restaurant', zh: '餐饮', en: 'Restaurant' },
    { id: 'beauty_salon', zh: '美业', en: 'Beauty Salon' },
    { id: 'fitness', zh: '健身', en: 'Fitness' },
    { id: 'education_training', zh: '教育培训', en: 'Education & Training' },
    { id: 'medical_dental', zh: '医疗牙科', en: 'Medical & Dental' },
    { id: 'real_estate', zh: '房产', en: 'Real Estate' },
    { id: 'other', zh: '其他', en: 'Other' }
  ],
  // 品牌制造
  consumer_electronics: [
    { id: 'consumer_electronics', zh: '消费电子', en: 'Consumer Electronics' },
    { id: 'maternal_baby', zh: '母婴', en: 'Maternal & Baby' },
    { id: 'automotive', zh: '汽车', en: 'Automotive' },
    { id: 'daily_chemical', zh: '日化', en: 'Daily Chemical' },
    { id: 'other', zh: '其他', en: 'Other' }
  ]
};

// Q2: 痛点目标（根据推广目标动态展示）
const PAIN_POINT_OPTIONS: Record<string, { id: string; zh: string; en: string }[]> = {
  // 品牌认知类
  reach: [
    { id: 'low_impression', zh: '曝光量不够', en: 'Low impression' },
    { id: 'narrow_audience', zh: '受众太窄', en: 'Audience too narrow' },
    { id: 'no_reach', zh: '花钱没触达', en: 'No reach despite spending' }
  ],
  // 受众意向类
  traffic: [
    { id: 'high_cpc', zh: '点击成本高', en: 'High CPC' },
    { id: 'low_completion', zh: '视频没人看完', en: 'Low video completion' },
    { id: 'no_engagement', zh: '没人互动私信', en: 'No engagement or DM' }
  ],
  video_views: [
    { id: 'high_cpc', zh: '点击成本高', en: 'High CPC' },
    { id: 'low_completion', zh: '视频没人看完', en: 'Low video completion' },
    { id: 'no_engagement', zh: '没人互动私信', en: 'No engagement or DM' }
  ],
  engagement: [
    { id: 'high_cpc', zh: '点击成本高', en: 'High CPC' },
    { id: 'low_completion', zh: '视频没人看完', en: 'Low video completion' },
    { id: 'no_engagement', zh: '没人互动私信', en: 'No engagement or DM' }
  ],
  // 行为转化类
  app_promotion: [
    { id: 'high_cpa', zh: '转化成本高', en: 'High CPA' },
    { id: 'no_conversion', zh: '有点击没购买注册', en: 'Clicks but no purchase/signup' },
    { id: 'low_roi', zh: 'ROI太低', en: 'Low ROI' },
    { id: 'pixel_issue', zh: 'Pixel数据不准', en: 'Pixel data inaccurate' }
  ],
  lead_collection: [
    { id: 'high_cpa', zh: '转化成本高', en: 'High CPA' },
    { id: 'no_conversion', zh: '有点击没购买注册', en: 'Clicks but no purchase/signup' },
    { id: 'low_roi', zh: 'ROI太低', en: 'Low ROI' },
    { id: 'pixel_issue', zh: 'Pixel数据不准', en: 'Pixel data inaccurate' }
  ],
  sales: [
    { id: 'high_cpa', zh: '转化成本高', en: 'High CPA' },
    { id: 'no_conversion', zh: '有点击没购买注册', en: 'Clicks but no purchase/signup' },
    { id: 'low_roi', zh: 'ROI太低', en: 'Low ROI' },
    { id: 'pixel_issue', zh: 'Pixel数据不准', en: 'Pixel data inaccurate' }
  ]
};

// Q3: 客单价范围
const PRICE_RANGE_OPTIONS = [
  { id: 'under_20', zh: '＜$20', en: '＜$20' },
  { id: '20_50', zh: '$20-$50', en: '$20-$50' },
  { id: '50_200', zh: '$50-$200', en: '$50-$200' },
  { id: 'over_200', zh: '＞$200', en: '＞$200' },
  { id: 'prefer_not', zh: '不方便透露', en: 'Prefer not to say' }
];

const SENSITIVE_CATEGORIES = [
  { id: 'medical', labelZh: '医疗相关', labelEn: 'Medical' },
  { id: 'weight_loss', labelZh: '减肥产品', labelEn: 'Weight Loss' },
  { id: 'financial', labelZh: '金融服务', labelEn: 'Financial Services' },
  { id: 'adult', labelZh: '成人内容', labelEn: 'Adult Content' },
  { id: 'fake_brand', labelZh: '仿牌产品', labelEn: 'Fake/Replica Brand' },
  { id: 'gambling', labelZh: '博彩', labelEn: 'Gambling' },
  { id: 'none', labelZh: '都不涉及', labelEn: 'None of the above' }
];

// 按地区分组的国家列表
const REGIONS = [
  {
    id: 'asia',
    labelZh: '亚太地区',
    labelEn: 'Asia Pacific',
    countries: [
      { id: 'jp', labelZh: '日本', labelEn: 'Japan' },
      { id: 'kr', labelZh: '韩国', labelEn: 'South Korea' },
      { id: 'tw', labelZh: '台湾', labelEn: 'Taiwan' },
      { id: 'hk', labelZh: '香港', labelEn: 'Hong Kong' },
      { id: 'sg', labelZh: '新加坡', labelEn: 'Singapore' },
      { id: 'my', labelZh: '马来西亚', labelEn: 'Malaysia' },
      { id: 'th', labelZh: '泰国', labelEn: 'Thailand' },
      { id: 'vn', labelZh: '越南', labelEn: 'Vietnam' },
      { id: 'kh', labelZh: '柬埔寨', labelEn: 'Cambodia' },
      { id: 'id', labelZh: '印尼', labelEn: 'Indonesia' },
      { id: 'ph', labelZh: '菲律宾', labelEn: 'Philippines' },
      { id: 'in', labelZh: '印度', labelEn: 'India' },
      { id: 'pk', labelZh: '巴基斯坦', labelEn: 'Pakistan' },
      { id: 'sa', labelZh: '沙特阿拉伯', labelEn: 'Saudi Arabia' },
      { id: 'ae', labelZh: '阿联酋', labelEn: 'United Arab Emirates' },
      { id: 'il', labelZh: '以色列', labelEn: 'Israel' },
      { id: 'au', labelZh: '澳大利亚', labelEn: 'Australia' },
      { id: 'nz', labelZh: '新西兰', labelEn: 'New Zealand' }
    ]
  },
  {
    id: 'europe',
    labelZh: '欧洲',
    labelEn: 'Europe',
    countries: [
      { id: 'uk', labelZh: '英国', labelEn: 'United Kingdom' },
      { id: 'de', labelZh: '德国', labelEn: 'Germany' },
      { id: 'fr', labelZh: '法国', labelEn: 'France' },
      { id: 'it', labelZh: '意大利', labelEn: 'Italy' },
      { id: 'es', labelZh: '西班牙', labelEn: 'Spain' },
      { id: 'nl', labelZh: '荷兰', labelEn: 'Netherlands' },
      { id: 'be', labelZh: '比利时', labelEn: 'Belgium' },
      { id: 'at', labelZh: '奥地利', labelEn: 'Austria' },
      { id: 'ch', labelZh: '瑞士', labelEn: 'Switzerland' },
      { id: 'pl', labelZh: '波兰', labelEn: 'Poland' },
      { id: 'se', labelZh: '瑞典', labelEn: 'Sweden' },
      { id: 'no', labelZh: '挪威', labelEn: 'Norway' },
      { id: 'pt', labelZh: '葡萄牙', labelEn: 'Portugal' },
      { id: 'ie', labelZh: '爱尔兰', labelEn: 'Ireland' },
      { id: 'tr', labelZh: '土耳其', labelEn: 'Turkey' },
      { id: 'ru', labelZh: '俄罗斯', labelEn: 'Russia' }
    ]
  },
  {
    id: 'north_america',
    labelZh: '北美',
    labelEn: 'North America',
    countries: [
      { id: 'us', labelZh: '美国', labelEn: 'United States' },
      { id: 'ca', labelZh: '加拿大', labelEn: 'Canada' },
      { id: 'mx', labelZh: '墨西哥', labelEn: 'Mexico' }
    ]
  },
  {
    id: 'south_america',
    labelZh: '南美',
    labelEn: 'South America',
    countries: [
      { id: 'br', labelZh: '巴西', labelEn: 'Brazil' },
      { id: 'ar', labelZh: '阿根廷', labelEn: 'Argentina' },
      { id: 'cl', labelZh: '智利', labelEn: 'Chile' },
      { id: 'co', labelZh: '哥伦比亚', labelEn: 'Colombia' }
    ]
  },
  {
    id: 'africa',
    labelZh: '非洲',
    labelEn: 'Africa',
    countries: [
      { id: 'za', labelZh: '南非', labelEn: 'South Africa' },
      { id: 'ng', labelZh: '尼日利亚', labelEn: 'Nigeria' },
      { id: 'eg', labelZh: '埃及', labelEn: 'Egypt' }
    ]
  }
];

export default function TikTokReviewPage() {
  const { locale } = useI18n();
  const router = useRouter();
  const { user } = useAuth();

  const [expandedSection, setExpandedSection] = useState<number>(1);
  const [expandedRegion, setExpandedRegion] = useState<string>(''); // 地区折叠状态
  const [formData, setFormData] = useState<FormData>({
    platform: '',
    countries: [],
    objective: '',
    industry: '',
    subCategory: undefined,
    category: '',
    accountType: '',
    hasHistoryData: '',
    sensitiveCategories: [],
    needLicense: '',
    hasEffectPromise: '',
    hasBeforeAfter: [],
    urgencyTypes: [],
    landingPageConsistent: '',
    mediaRights: [],
    targetAudience: [],
    painPoints: [],
    solutionType: '',
    purchaseReason: [],
    competitiveAdvantage: [],
    socialProof: [],
    objections: [],
    hookType: '',
    productAppearTime: '',
    creativeType: [],
    hasCTA: '',
    isVertical: '',
    hasSubtitleAndSound: '',
    creativeCount: 0,
    creativeDiffSource: [],
    adCopy: '',
    subtitleText: '',
    landingPageUrl: '',
    clickDestination: '',
    firstScreenProductVisible: '',
    pixelInstalled: '',
    eventsApiConfigured: '',
    keyEventTested: '',
    attributionWindow: '',
    audienceSize: '',
    bidStrategy: ''
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ReviewResult | null>(null);

  // 授权相关状态
  const [isTikTokConnected, setIsTikTokConnected] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showTimeRangeSelector, setShowTimeRangeSelector] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<number>(7); // 默认7天
  const [diagnosisMode, setDiagnosisMode] = useState<'light' | 'full'>('light');

  // 授权用户补充问题状态
  const [industrySubcategory, setIndustrySubcategory] = useState<string>(''); // Q1: 行业细分
  const [painPointGoal, setPainPointGoal] = useState<string[]>([]); // Q2: 痛点目标
  const [priceRange, setPriceRange] = useState<string>(''); // Q3: 客单价范围

  // 检查TikTok授权状态
  useEffect(() => {
    const checkTikTokConnection = async () => {
      if (!user) return;
      
      try {
        const client = await getSupabaseBrowserClientAsync();
        const { data: { session } } = await client.auth.getSession();
        const token = session?.access_token;
        
        if (!token) return;
        
        const res = await fetch('/api/tiktok/connection-status', {
          headers: { 'x-session': token }
        });
        
        if (res.ok) {
          const data = await res.json();
          setIsTikTokConnected(data.is_connected);
        }
      } catch (error) {
        console.error('Check TikTok connection error:', error);
      }
    };
    
    checkTikTokConnection();
  }, [user]);

  const t = (zh: string, en: string) => locale === 'zh' ? zh : en;

  // 检查 Section 是否可以展开
  const canExpandSection = (sectionNum: number): boolean => {
    // 已授权用户：只有补充问题，直接可以展开
    if (isTikTokConnected) {
      return sectionNum === 1;
    }
    // 未授权用户：完整的6个Section逻辑
    if (sectionNum === 1) return true;
    if (sectionNum === 2) return formData.platform !== '' && formData.objective !== '';
    if (sectionNum === 3) return formData.sensitiveCategories.length > 0;
    if (sectionNum === 4) return formData.targetAudience.length > 0;
    if (sectionNum === 5) return formData.hookType !== '';
    if (sectionNum === 6) return formData.pixelInstalled !== '' || formData.audienceSize !== '' || formData.bidStrategy !== '';
    return false;
  };
  // 手动展开下一个 Section（点击"继续下一步"按钮时调用）
  const goToNextSection = (currentSection: number) => {
    // 已授权用户：只有补充问题，不需要跳转
    if (isTikTokConnected) {
      return;
    }
    // 未授权用户：完整的6个Section逻辑
    const nextSection = currentSection + 1;
    if (nextSection <= 6) {
      setExpandedSection(nextSection);
    }
  };

  // 提交审查前的处理（检查授权状态）
  const handlePreSubmit = async () => {
    if (isTikTokConnected) {
      // 已授权：显示时间范围选择器
      setShowTimeRangeSelector(true);
    } else {
      // 未授权：显示授权引导弹窗
      setShowAuthModal(true);
    }
  };

  // 时间范围选择后开始完整诊断
  const handleStartFullDiagnosis = async () => {
    setShowTimeRangeSelector(false);
    setDiagnosisMode('full');
    setIsAnalyzing(true);
    
    try {
      const client = await getSupabaseBrowserClientAsync();
      const { data: { session } } = await client.auth.getSession();
      const token = session?.access_token;
      
      const response = await fetch('/api/tiktok-review', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-session': token || ''
        },
        body: JSON.stringify({
          ...formData,
          diagnosis_mode: 'full',
          time_range: selectedTimeRange
        })
      });
      const data = await response.json();
      setResult(data);
      setExpandedSection(7);
    } catch (error) {
      console.error('Review error:', error);
      alert(t('审查失败，请重试', 'Review failed, please try again'));
    }
    setIsAnalyzing(false);
  };

  // 跳过授权，使用轻量建议
  const handleSkipAuth = async () => {
    setShowAuthModal(false);
    setDiagnosisMode('light');
    setIsAnalyzing(true);
    
    try {
      const response = await fetch('/api/tiktok-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          diagnosis_mode: 'light'
        })
      });
      const data = await response.json();
      setResult(data);
      setExpandedSection(7);
    } catch (error) {
      console.error('Review error:', error);
      alert(t('审查失败，请重试', 'Review failed, please try again'));
    }
    setIsAnalyzing(false);
  };

  // 授权成功后开始完整诊断
  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setIsTikTokConnected(true);
    setShowTimeRangeSelector(true);
  };

  // 提交审查（保留原有函数名，但改为调用handlePreSubmit）
  const handleSubmit = handlePreSubmit;

  // ========== Section 渲染 ==========

  const renderSection1 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">{t('基础信息', 'Basic Information')}</h3>

      {/* 投放平台 */}
      <div>
        <label className="text-blue-200 mb-2 block">{t('投放平台', 'Ad Platform')}</label>
        <div className="flex gap-3">
          <button
            onClick={() => { setFormData(prev => ({ ...prev, platform: 'tiktok_ads' })); }}
            className={`px-4 py-2 rounded-lg border ${formData.platform === 'tiktok_ads' ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-white/5 border-white/20 text-blue-200 hover:bg-white/10'}`}
          >
            {t('TikTok Ads', 'TikTok Ads')}
          </button>
        </div>
      </div>

      {/* 投放国家 */}
      <div>
        <label className="text-blue-200 mb-2 block">{t('投放国家或地区', 'Target Countries')}</label>
        <div className="space-y-2">
          {REGIONS.map(region => (
            <div key={region.id} className="border border-white/10 rounded-lg">
              <button
                onClick={() => setExpandedRegion(expandedRegion === region.id ? '' : region.id)}
                className="w-full px-4 py-2 flex items-center justify-between text-blue-200 hover:bg-white/5"
              >
                <span className="font-medium">{locale === 'zh' ? region.labelZh : region.labelEn}</span>
                <span className="text-sm text-blue-300/50">
                  {formData.countries.filter(c => region.countries.some(rc => rc.id === c)).length > 0 
                    ? `(${formData.countries.filter(c => region.countries.some(rc => rc.id === c)).length})` 
                    : ''}
                </span>
              </button>
              {expandedRegion === region.id && (
                <div className="px-4 pb-3 grid grid-cols-3 gap-2">
                  {region.countries.map(c => (
                    <button
                      key={c.id}
                      onClick={() => {
                        const newCountries = formData.countries.includes(c.id)
                          ? formData.countries.filter(id => id !== c.id)
                          : [...formData.countries, c.id];
                        setFormData(prev => ({ ...prev, countries: newCountries }));
                      }}
                      className={`px-2 py-1 rounded border text-sm ${formData.countries.includes(c.id) ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-white/5 border-white/20 text-blue-200 hover:bg-white/10'}`}
                    >
                      {locale === 'zh' ? c.labelZh : c.labelEn}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 推广目标 - 三层漏斗结构 */}
      <div>
        <label className="text-blue-200 mb-3 block">{t('推广目标', 'Campaign Objective')}</label>
        <div className="space-y-3">
          {OBJECTIVE_GROUPS.map(group => (
            <div key={group.id} className="bg-white/5 border border-white/10 rounded-lg p-3">
              <p className="text-xs text-blue-300/60 uppercase tracking-wider mb-2">
                {locale === 'zh' ? group.labelZh : group.labelEn}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {group.objectives.map(opt => {
                  const tooltipText = getTKReviewTooltip('objective', opt.id, locale);
                  return (
                    <div key={opt.id} className="relative group">
                      <button
                        onClick={() => { setFormData(prev => ({ ...prev, objective: opt.id as any })); }}
                        className={`w-full px-3 py-2 rounded-lg border text-sm ${formData.objective === opt.id ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-white/5 border-white/20 text-blue-200 hover:bg-white/10'}`}
                      >
                        {locale === 'zh' ? opt.zh : opt.en}
                      </button>
                      {tooltipText && (
                        <div className="absolute left-0 top-full mt-1 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                          <div className="bg-slate-800/95 border border-cyan-400/50 rounded-lg px-3 py-2 text-sm text-blue-100 max-w-xs whitespace-normal shadow-lg">
                            {tooltipText}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 行业 */}
      <div>
        <label className="text-blue-200 mb-2 block">{t('产品行业', 'Industry')}</label>
        <select
          value={formData.industry}
          onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value, subCategory: undefined }))}
          className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-blue-200"
        >
          <option value="">{t('请选择', 'Please select')}</option>
          {INDUSTRIES.map(i => (
            <option key={i.id} value={i.id}>
              {locale === 'zh' ? i.labelZh : i.labelEn}
              {i.restricted === true && ' 🔴'}
              {i.restricted === 'partial' && ' ⚠️'}
            </option>
          ))}
        </select>
        {formData.industry && INDUSTRIES.find(i => i.id === formData.industry)?.restricted && (
          <p className="text-yellow-400 text-xs mt-1">
            {INDUSTRIES.find(i => i.id === formData.industry)?.restricted === true 
              ? t('🔴 受限行业：需完整合规审查', '🔴 Restricted: Full compliance review required')
              : t('⚠️ 部分受限：需审查效果承诺', '⚠️ Partially restricted: Effect claims review required')
            }
          </p>
        )}
      </div>

      {/* 二级子类 */}
      {formData.industry && (() => {
        const selectedIndustry = INDUSTRIES.find(i => i.id === formData.industry);
        if (!selectedIndustry || !selectedIndustry.subCategories || selectedIndustry.subCategories.length === 0) {
          return null;
        }
        return (
          <div>
            <label className="text-blue-200 mb-2 block">{t('具体品类', 'Sub-category')}</label>
            <div className="flex gap-2 flex-wrap">
              {selectedIndustry.subCategories.map(sub => (
                <button
                  key={sub.zh}
                  onClick={() => setFormData(prev => ({ ...prev, subCategory: locale === 'zh' ? sub.zh : sub.en }))}
                  className={`px-3 py-1.5 rounded-lg border text-sm ${formData.subCategory === (locale === 'zh' ? sub.zh : sub.en) ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-white/5 border-white/20 text-blue-200 hover:bg-white/10'}`}
                >
                  {locale === 'zh' ? sub.zh : sub.en}
                </button>
              ))}
            </div>
          </div>
        );
      })()}

      {/* 账户类型 */}
      <div>
        <label className="text-blue-200 mb-2 block">{t('账户类型', 'Account Type')}</label>
        <div className="flex gap-3">
          {[
            { id: 'new', zh: '新账户', en: 'New Account' },
            { id: 'mature', zh: '成熟账户', en: 'Mature Account' }
          ].map(opt => {
            const tooltipText = getTKReviewTooltip('account_type', opt.id, locale);
            return (
              <div key={opt.id} className="relative group">
                <button
                  onClick={() => setFormData(prev => ({ ...prev, accountType: opt.id as any }))}
                  className={`px-4 py-2 rounded-lg border ${formData.accountType === opt.id ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-white/5 border-white/20 text-blue-200 hover:bg-white/10'}`}
                >
                  {locale === 'zh' ? opt.zh : opt.en}
                </button>
                {tooltipText && (
                  <div className="absolute left-0 top-full mt-1 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <div className="bg-slate-800/95 border border-cyan-400/50 rounded-lg px-3 py-2 text-sm text-blue-100 max-w-xs whitespace-normal shadow-lg">
                      {tooltipText}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 财务数据（可选） */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <p className="text-blue-300 text-sm mb-3">{t('财务数据（可选，填了可评估盈利可行性）', 'Financial Data (Optional, helps evaluate profitability)')}</p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-blue-200/70 text-sm block mb-1">{t('客单价 ($)', 'AOV ($)')}</label>
            <input
              type="number"
              value={formData.avgOrderValue || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, avgOrderValue: parseFloat(e.target.value) || undefined }))}
              className="w-full bg-white/5 border border-white/20 rounded px-3 py-1.5 text-blue-200"
              placeholder={t('如 50', 'e.g. 50')}
            />
          </div>
          <div>
            <label className="text-blue-200/70 text-sm block mb-1">{t('毛利率 (%)', 'Margin (%)')}</label>
            <input
              type="number"
              value={formData.marginRate || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, marginRate: parseFloat(e.target.value) || undefined }))}
              className="w-full bg-white/5 border border-white/20 rounded px-3 py-1.5 text-blue-200"
              placeholder={t('如 30', 'e.g. 30')}
            />
          </div>
          {/* 目标CPA：根据objective显示，lead_gen/app_install必填 */}
          {getFieldVisibility(formData.objective, 'targetCPA') !== 'hidden' && (
            <div>
              <label className="text-blue-200/70 text-sm block mb-1">
                {t('目标CPA ($)', 'Target CPA ($)')}
                {getFieldVisibility(formData.objective, 'targetCPA') === 'required' && <span className="text-red-400 ml-1">*</span>}
              </label>
              <input
                type="number"
                value={formData.targetCPA || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, targetCPA: parseFloat(e.target.value) || undefined }))}
                className="w-full bg-white/5 border border-white/20 rounded px-3 py-1.5 text-blue-200"
                placeholder={t('如 10', 'e.g. 10')}
              />
            </div>
          )}
          {/* 目标ROAS：仅purchase目标显示，必填 */}
          {getFieldVisibility(formData.objective, 'targetROAS') !== 'hidden' && (
            <div>
              <label className="text-blue-200/70 text-sm block mb-1">
                {t('目标ROAS', 'Target ROAS')}
                {getFieldVisibility(formData.objective, 'targetROAS') === 'required' && <span className="text-red-400 ml-1">*</span>}
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.targetROAS || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, targetROAS: parseFloat(e.target.value) || undefined }))}
                className="w-full bg-white/5 border border-white/20 rounded px-3 py-1.5 text-blue-200"
                placeholder={t('如 2.0', 'e.g. 2.0')}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // 授权用户补充问题渲染
  const renderAuthorizedSupplementaryQuestions = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-2">
          {t('补充信息', 'Supplementary Information')}
        </h3>
        <p className="text-blue-200/80 text-sm mb-6">
          {t('已连接TikTok账号，部分信息将自动获取。请补充以下信息以获得更精准的诊断。', 
             'TikTok account connected. Some info will be auto-filled. Please provide the following for more accurate diagnosis.')}
        </p>

        {/* Q1: 行业细分（必选） */}
        <div className="mb-6">
          <label className="text-blue-200 mb-3 block">
            {t('Q1. 行业细分', 'Q1. Industry Subcategory')}
            <span className="text-red-400 ml-1">*</span>
          </label>
          <p className="text-blue-300/60 text-xs mb-3">
            {t('API只能获取注册大类，需要您补充具体细分领域', 
               'API only provides main category, please specify subcategory')}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(INDUSTRY_SUBCATEGORIES).map(([industryId, subcategories]) => (
              <div key={industryId} className="bg-white/5 border border-white/10 rounded-lg p-3">
                <p className="text-xs text-blue-300/60 mb-2">
                  {INDUSTRIES.find(i => i.id === industryId)?.[locale === 'zh' ? 'labelZh' : 'labelEn']}
                </p>
                <div className="space-y-1">
                  {subcategories.map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => setIndustrySubcategory(sub.id)}
                      className={`w-full text-left px-3 py-1.5 rounded text-sm ${
                        industrySubcategory === sub.id 
                          ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300' 
                          : 'bg-white/5 border border-white/10 text-blue-200 hover:bg-white/10'
                      }`}
                    >
                      {locale === 'zh' ? sub.zh : sub.en}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Q2: 痛点目标（必选，根据推广目标动态展示） */}
        <div className="mb-6">
          <label className="text-blue-200 mb-3 block">
            {t('Q2. 痛点目标', 'Q2. Pain Points')}
            <span className="text-red-400 ml-1">*</span>
          </label>
          <p className="text-blue-300/60 text-xs mb-3">
            {t('选择您当前最想解决的问题（可多选）', 
               'Select the issues you want to solve most (multiple choice)')}
          </p>
          {formData.objective ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {(PAIN_POINT_OPTIONS[formData.objective] || []).map(pain => (
                <button
                  key={pain.id}
                  onClick={() => {
                    setPainPointGoal(prev => 
                      prev.includes(pain.id) 
                        ? prev.filter(id => id !== pain.id)
                        : [...prev, pain.id]
                    );
                  }}
                  className={`px-4 py-2 rounded-lg border text-sm ${
                    painPointGoal.includes(pain.id) 
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' 
                      : 'bg-white/5 border-white/20 text-blue-200 hover:bg-white/10'
                  }`}
                >
                  {locale === 'zh' ? pain.zh : pain.en}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-yellow-400 text-sm">
              {t('请先选择推广目标', 'Please select campaign objective first')}
            </p>
          )}
        </div>

        {/* Q3: 客单价范围（选填） */}
        <div>
          <label className="text-blue-200 mb-3 block">
            {t('Q3. 客单价范围', 'Q3. Price Range')}
            <span className="text-blue-300/60 text-xs ml-2">({t('选填', 'Optional')})</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {PRICE_RANGE_OPTIONS.map(price => (
              <button
                key={price.id}
                onClick={() => setPriceRange(price.id)}
                className={`px-4 py-2 rounded-lg border text-sm ${
                  priceRange === price.id 
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' 
                    : 'bg-white/5 border-white/20 text-blue-200 hover:bg-white/10'
                }`}
              >
                {locale === 'zh' ? price.zh : price.en}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSection2 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">{t('产品与合规风险', 'Product & Compliance Risk')}</h3>

      {/* 敏感类别 */}
      <div>
        <label className="text-blue-200 mb-2 block">{t('是否涉及敏感类别', 'Sensitive Categories')}</label>
        <div className="grid grid-cols-3 gap-2">
          {SENSITIVE_CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => {
                const newCategories = c.id === 'none'
                  ? ['none']
                  : formData.sensitiveCategories.includes('none')
                    ? [c.id]
                    : formData.sensitiveCategories.includes(c.id)
                      ? formData.sensitiveCategories.filter(id => id !== c.id)
                      : [...formData.sensitiveCategories, c.id];
                setFormData(prev => ({ ...prev, sensitiveCategories: newCategories }));
              }}
              className={`px-3 py-2 rounded-lg border text-sm ${formData.sensitiveCategories.includes(c.id) ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-white/5 border-white/20 text-blue-200 hover:bg-white/10'}`}
            >
              {locale === 'zh' ? c.labelZh : c.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* 效果承诺 */}
      <div>
        <label className="text-blue-200 mb-2 block">
          {t('是否包含效果承诺', 'Contains Effect Promise')}
          <span className="text-xs text-blue-300/60 ml-2">
            {getTKReviewTooltip('effect_claims', 'label', locale)}
          </span>
        </label>
        <div className="flex gap-3">
          {[
            { id: 'yes', zh: '是', en: 'Yes' },
            { id: 'no', zh: '否', en: 'No' }
          ].map(opt => (
            <Tooltip key={opt.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setFormData(prev => ({ ...prev, hasEffectPromise: opt.id as any }))}
                  className={`px-4 py-2 rounded-lg border ${formData.hasEffectPromise === opt.id ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-white/5 border-white/20 text-blue-200 hover:bg-white/10'}`}
                >
                  {locale === 'zh' ? opt.zh : opt.en}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                {getTKReviewTooltip('effect_claims', opt.id, locale)}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
        {formData.hasEffectPromise === 'yes' && (
          <input
            type="text"
            placeholder={t('举例：Guaranteed results', 'Example: Guaranteed results')}
            className="mt-2 w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-blue-200"
          />
        )}
      </div>

      {/* 前后对比 */}
      <div>
        <label className="text-blue-200 mb-2 block">
          {t('是否使用前后对比', 'Uses Before/After')}
          <span className="text-xs text-blue-300/60 ml-2">
            {getTKReviewTooltip('before_after', 'label', locale)}
          </span>
        </label>
        <div className="flex gap-3">
          {[
            { id: 'before_after', zh: '前后对比图', en: 'Before/After' },
            { id: 'body_part', zh: '身体局部特写', en: 'Body Part Focus' },
            { id: 'none', zh: '都没有', en: 'None' }
          ].map(opt => (
            <Tooltip key={opt.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setFormData(prev => ({ ...prev, hasBeforeAfter: [opt.id] }))}
                  className={`px-4 py-2 rounded-lg border ${formData.hasBeforeAfter.includes(opt.id) ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-white/5 border-white/20 text-blue-200 hover:bg-white/10'}`}
                >
                  {locale === 'zh' ? opt.zh : opt.en}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                {getTKReviewTooltip('before_after', opt.id, locale)}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* 素材版权 */}
      <div>
        <label className="text-blue-200 mb-2 block">{t('是否拥有素材版权', 'Media Rights')}</label>
        <div className="flex gap-3">
          {[
            { id: 'music', zh: '音乐', en: 'Music' },
            { id: 'portrait', zh: '人物肖像', en: 'Portrait' },
            { id: 'brand', zh: '商标', en: 'Trademark' },
            { id: 'all', zh: '都有', en: 'All Owned' },
            { id: 'unknown', zh: '都不确定', en: 'Unknown' }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setFormData(prev => ({ ...prev, mediaRights: [opt.id] }))}
              className={`px-3 py-2 rounded-lg border text-sm ${formData.mediaRights.includes(opt.id) ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-white/5 border-white/20 text-blue-200 hover:bg-white/10'}`}
            >
              {locale === 'zh' ? opt.zh : opt.en}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSection3 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">{t('用户与需求判断', 'User & Needs Analysis')}</h3>

      {/* 核心受众 */}
      <div>
        <label className="text-blue-200 mb-2 block">{t('核心受众', 'Target Audience')}</label>
        <div className="flex gap-3">
          {[
            { id: 'age_18_34', zh: '18-34岁', en: '18-34 years' },
            { id: 'age_35_55', zh: '35-55岁', en: '35-55 years' },
            { id: 'female', zh: '女性', en: 'Female' },
            { id: 'male', zh: '男性', en: 'Male' }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => {
                const newAudience = formData.targetAudience.includes(opt.id)
                  ? formData.targetAudience.filter(id => id !== opt.id)
                  : [...formData.targetAudience, opt.id];
                setFormData(prev => ({ ...prev, targetAudience: newAudience }));
              }}
              className={`px-3 py-2 rounded-lg border text-sm ${formData.targetAudience.includes(opt.id) ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-white/5 border-white/20 text-blue-200 hover:bg-white/10'}`}
            >
              {locale === 'zh' ? opt.zh : opt.en}
            </button>
          ))}
        </div>
      </div>

      {/* 痛点 */}
      <div>
        <label className="text-blue-200 mb-2 block">{t('用户最强烈痛点', 'Strongest Pain Points')}</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'price', zh: '价格', en: 'Price' },
            { id: 'convenience', zh: '便利性', en: 'Convenience' },
            { id: 'quality', zh: '品质', en: 'Quality' },
            { id: 'social', zh: '社交', en: 'Social' },
            { id: 'health', zh: '健康', en: 'Health' }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => {
                const newPoints = formData.painPoints.includes(opt.id)
                  ? formData.painPoints.filter(id => id !== opt.id)
                  : [...formData.painPoints, opt.id];
                setFormData(prev => ({ ...prev, painPoints: newPoints }));
              }}
              className={`px-3 py-2 rounded-lg border text-sm ${formData.painPoints.includes(opt.id) ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-white/5 border-white/20 text-blue-200 hover:bg-white/10'}`}
            >
              {locale === 'zh' ? opt.zh : opt.en}
            </button>
          ))}
        </div>
      </div>

      {/* 社会证明 */}
      <div>
        <label className="text-blue-200 mb-2 block">{t('是否有社会证明', 'Social Proof')}</label>
        <div className="flex gap-3">
          {[
            { id: 'reviews', zh: '用户评论', en: 'Reviews' },
            { id: 'sales', zh: '销量数据', en: 'Sales Data' },
            { id: 'cases', zh: '案例', en: 'Cases' },
            { id: 'none', zh: '都没有', en: 'None' }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setFormData(prev => ({ ...prev, socialProof: [opt.id] }))}
              className={`px-3 py-2 rounded-lg border text-sm ${formData.socialProof.includes(opt.id) ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-white/5 border-white/20 text-blue-200 hover:bg-white/10'}`}
            >
              {locale === 'zh' ? opt.zh : opt.en}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSection4 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">{t('素材审查', 'Creative Review')}</h3>

      {/* 钩子类型 */}
      <div>
        <label className="text-blue-200 mb-2 block">{t('前三秒钩子类型', 'First 3-Second Hook')}</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'pain_point', zh: '痛点', en: 'Pain Point' },
            { id: 'suspense', zh: '悬念', en: 'Suspense' },
            { id: 'visual', zh: '视觉冲击', en: 'Visual Impact' },
            { id: 'speaking', zh: '口播', en: 'Speaking' },
            { id: 'demo', zh: '展示', en: 'Demo' }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => { setFormData(prev => ({ ...prev, hookType: opt.id })); }}
              className={`px-3 py-2 rounded-lg border text-sm ${formData.hookType === opt.id ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-white/5 border-white/20 text-blue-200 hover:bg-white/10'}`}
            >
              {locale === 'zh' ? opt.zh : opt.en}
            </button>
          ))}
        </div>
      </div>

      {/* 产品出现时间 */}
      <div>
        <label className="text-blue-200 mb-2 block">{t('产品首次出现时间', 'Product Appearance')}</label>
        <div className="flex gap-3">
          {[
            { id: 'first_3s', zh: '前3秒', en: 'First 3s' },
            { id: '3_5s', zh: '3-5秒', en: '3-5s' },
            { id: '5_10s', zh: '5-10秒', en: '5-10s' },
            { id: 'after_10s', zh: '10秒后', en: 'After 10s' }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setFormData(prev => ({ ...prev, productAppearTime: opt.id }))}
              className={`px-3 py-2 rounded-lg border text-sm ${formData.productAppearTime === opt.id ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-white/5 border-white/20 text-blue-200 hover:bg-white/10'}`}
            >
              {locale === 'zh' ? opt.zh : opt.en}
            </button>
          ))}
        </div>
      </div>

      {/* 素材类型 */}
      <div>
        <label className="text-blue-200 mb-2 block">{t('素材类型', 'Creative Type')}</label>
        <div className="flex gap-3">
          {[
            { id: 'ugc', zh: 'UGC', en: 'UGC' },
            { id: 'demo', zh: '产品演示', en: 'Demo' },
            { id: 'review', zh: '测评', en: 'Review' },
            { id: 'story', zh: '剧情', en: 'Story' }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => {
                const newTypes = formData.creativeType.includes(opt.id)
                  ? formData.creativeType.filter(id => id !== opt.id)
                  : [...formData.creativeType, opt.id];
                setFormData(prev => ({ ...prev, creativeType: newTypes }));
              }}
              className={`px-3 py-2 rounded-lg border text-sm ${formData.creativeType.includes(opt.id) ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-white/5 border-white/20 text-blue-200 hover:bg-white/10'}`}
            >
              {locale === 'zh' ? opt.zh : opt.en}
            </button>
          ))}
        </div>
      </div>

      {/* 行动引导文案 */}
      <div>
        <label className="text-blue-200 mb-2 block">{t('是否包含明确行动引导文案', 'Has Clear Call-to-Action')}</label>
        <div className="flex gap-3">
          {[
            { id: 'yes', zh: '是', en: 'Yes' },
            { id: 'no', zh: '否', en: 'No' }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setFormData(prev => ({ ...prev, hasCTA: opt.id as any }))}
              className={`px-4 py-2 rounded-lg border ${formData.hasCTA === opt.id ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-white/5 border-white/20 text-blue-200 hover:bg-white/10'}`}
            >
              {locale === 'zh' ? opt.zh : opt.en}
            </button>
          ))}
        </div>
      </div>

      {/* 素材数量 */}
      <div>
        <label className="text-blue-200 mb-2 block">{t('同广告组差异化素材数量', 'Different Creatives Count')}</label>
        <input
          type="number"
          value={formData.creativeCount || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, creativeCount: parseInt(e.target.value) || 0 }))}
          className="w-32 bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-blue-200"
          placeholder="3"
        />
      </div>

      {/* 文案 */}
      <div>
        <label className="text-blue-200 mb-2 block">{t('广告文案（可选）', 'Ad Copy (Optional)')}</label>
        <textarea
          value={formData.adCopy}
          onChange={(e) => setFormData(prev => ({ ...prev, adCopy: e.target.value }))}
          className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-blue-200 min-h-[100px]"
          placeholder={t('粘贴广告文案...', 'Paste ad copy...')}
        />
      </div>
    </div>
  );

  const renderSection5 = () => {
    const landingPageVisibility = getFieldVisibility(formData.objective, 'landing_page_url');
    const appStoreVisibility = getFieldVisibility(formData.objective, 'app_store_url');
    const formTypeVisibility = getFieldVisibility(formData.objective, 'form_type');
    
    // 表单类型为站外时需要落地页
    const showLandingPageForLeadGen = formData.formType === 'external' && landingPageVisibility === 'conditional';
    const landingPageRequired = landingPageVisibility === 'required' || showLandingPageForLeadGen;
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">{t('落地页与转化路径', 'Landing Page & Conversion')}</h3>

        {/* 表单类型 - 仅线索目标显示 */}
        {formTypeVisibility !== 'hidden' && (
          <div>
            <label className="text-blue-200 mb-2 block">
              {t('表单类型', 'Form Type')}
              {formTypeVisibility === 'required' && <span className="text-red-400 ml-1">*</span>}
              <span className="text-xs text-blue-300/60 ml-2">
                {getTKReviewTooltip('form_type', 'label', locale)}
              </span>
            </label>
            <div className="flex gap-3">
              {[
                { id: 'native', zh: '原生表单（TikTok内）', en: 'Native Form (In-App)' },
                { id: 'external', zh: '站外表单（独立页）', en: 'External Form (Web)' }
              ].map(opt => (
                <Tooltip key={opt.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, formType: opt.id as any }))}
                      className={`px-3 py-2 rounded-lg border text-sm ${formData.formType === opt.id ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-white/5 border-white/20 text-blue-200 hover:bg-white/10'}`}
                    >
                      {locale === 'zh' ? opt.zh : opt.en}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    {getTKReviewTooltip('form_type', opt.id, locale)}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        )}

        {/* 落地页 URL - 根据目标/表单类型显示 */}
        {landingPageVisibility !== 'hidden' && (
          <div>
            <label className="text-blue-200 mb-2 block">
              {t('落地页URL', 'Landing Page URL')}
              {landingPageRequired && <span className="text-red-400 ml-1">*</span>}
            </label>
            <input
              type="url"
              value={formData.landingPageUrl}
              onChange={(e) => { setFormData(prev => ({ ...prev, landingPageUrl: e.target.value })); }}
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-blue-200"
              placeholder="https://example.com/product"
            />
          </div>
        )}

        {/* 应用商店链接 - 仅App安装目标显示 */}
        {appStoreVisibility !== 'hidden' && (
          <div>
            <label className="text-blue-200 mb-2 block">
              {t('应用商店链接', 'App Store Link')}
              {appStoreVisibility === 'required' && <span className="text-red-400 ml-1">*</span>}
            </label>
            <input
              type="url"
              value={formData.appStoreUrl || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, appStoreUrl: e.target.value }))}
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-blue-200"
              placeholder={t('App Store或Google Play链接', 'App Store or Google Play URL')}
            />
          </div>
        )}

        {/* 点击目的地 */}
        <div>
          <label className="text-blue-200 mb-2 block">
            {t('点击后进入什么', 'Click Destination')}
            <span className="text-xs text-blue-300/60 ml-2">
              {getTKReviewTooltip('click_destination', 'label', locale)}
            </span>
          </label>
          <div className="flex gap-3">
            {[
              { id: 'product', zh: '商品页', en: 'Product Page' },
              { id: 'form', zh: '表单', en: 'Form' },
              { id: 'profile', zh: '主页', en: 'Profile' },
              { id: 'app', zh: 'App下载页', en: 'App Download' }
            ].map(opt => (
              <Tooltip key={opt.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, clickDestination: opt.id }))}
                    className={`px-3 py-2 rounded-lg border text-sm ${formData.clickDestination === opt.id ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-white/5 border-white/20 text-blue-200 hover:bg-white/10'}`}
                  >
                    {locale === 'zh' ? opt.zh : opt.en}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  {getTKReviewTooltip('click_destination', opt.id, locale)}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>

        {/* 首屏产品可见 */}
        <div>
          <label className="text-blue-200 mb-2 block">
            {t('首屏能否看到广告中的产品和优惠', 'Product Visible on First Screen')}
            <span className="text-xs text-blue-300/60 ml-2">
              {getTKReviewTooltip('first_screen', 'label', locale)}
            </span>
          </label>
          <div className="flex gap-3">
            {[
              { id: 'yes', zh: '能', en: 'Yes' },
              { id: 'no', zh: '不能', en: 'No' },
              { id: 'unknown', zh: '不确定', en: 'Unknown' }
            ].map(opt => (
              <Tooltip key={opt.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, firstScreenProductVisible: opt.id as any }))}
                    className={`px-3 py-2 rounded-lg border text-sm ${formData.firstScreenProductVisible === opt.id ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-white/5 border-white/20 text-blue-200 hover:bg-white/10'}`}
                  >
                    {locale === 'zh' ? opt.zh : opt.en}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  {getTKReviewTooltip('first_screen', opt.id, locale)}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderSection6 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">{t('数据与投放设置', 'Data & Delivery Settings')}</h3>

      {/* Pixel */}
      <div>
        <label className="text-blue-200 mb-2 block">{t('TikTok Pixel 是否安装', 'TikTok Pixel Installed')}</label>
        <div className="flex gap-3">
          {[
            { id: 'yes', zh: '是', en: 'Yes' },
            { id: 'no', zh: '否', en: 'No' },
            { id: 'unknown', zh: '不确定', en: 'Unknown' }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setFormData(prev => ({ ...prev, pixelInstalled: opt.id as any }))}
              className={`px-3 py-2 rounded-lg border text-sm ${formData.pixelInstalled === opt.id ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-white/5 border-white/20 text-blue-200 hover:bg-white/10'}`}
            >
              {locale === 'zh' ? opt.zh : opt.en}
            </button>
          ))}
        </div>
      </div>

      {/* 日预算 */}
      <div>
        <label className="text-blue-200 mb-2 block">{t('日预算 ($)', 'Daily Budget ($)')}</label>
        <input
          type="number"
          value={formData.dailyBudget || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, dailyBudget: parseFloat(e.target.value) || undefined }))}
          className="w-32 bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-blue-200"
          placeholder="50"
        />
      </div>

      {/* 受众规模 */}
      <div>
        <label className="text-blue-200 mb-2 block">
          {t('受众规模', 'Audience Size')}
          <span className="text-xs text-blue-300/60 ml-2">
            {getTKReviewTooltip('audience_size', 'label', locale)}
          </span>
        </label>
        <div className="flex gap-3">
          {[
            { id: 'broad', zh: '宽泛', en: 'Broad' },
            { id: 'medium', zh: '适中', en: 'Medium' },
            { id: 'narrow', zh: '窄', en: 'Narrow' }
          ].map(opt => (
            <Tooltip key={opt.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setFormData(prev => ({ ...prev, audienceSize: opt.id as any }))}
                  className={`px-3 py-2 rounded-lg border text-sm ${formData.audienceSize === opt.id ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-white/5 border-white/20 text-blue-200 hover:bg-white/10'}`}
                >
                  {locale === 'zh' ? opt.zh : opt.en}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                {getTKReviewTooltip('audience_size', opt.id, locale)}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* 出价策略 */}
      <div>
        <label className="text-blue-200 mb-2 block">
          {t('出价策略', 'Bid Strategy')}
          <span className="text-xs text-blue-300/60 ml-2">
            {getTKReviewTooltip('bid_strategy', 'label', locale)}
          </span>
        </label>
        <div className="flex gap-3">
          {[
            { id: 'lowest_cost', zh: '最低成本', en: 'Lowest Cost' },
            { id: 'cost_cap', zh: '成本上限', en: 'Cost Cap' },
            { id: 'roas_target', zh: 'ROAS控制', en: 'ROAS Target' }
          ].map(opt => (
            <Tooltip key={opt.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setFormData(prev => ({ ...prev, bidStrategy: opt.id }))}
                  className={`px-3 py-2 rounded-lg border text-sm ${formData.bidStrategy === opt.id ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-white/5 border-white/20 text-blue-200 hover:bg-white/10'}`}
                >
                  {locale === 'zh' ? opt.zh : opt.en}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                {getTKReviewTooltip('bid_strategy', opt.id, locale)}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </div>
  );

  const renderResult = () => {
    if (!result) return null;

    const getCanSubmitText = () => {
      switch (result.canSubmit) {
        case 'yes': return { text: t('可以提交', 'Can Submit'), color: 'text-green-400' };
        case 'modify_first': return { text: t('修改后提交', 'Submit After Fix'), color: 'text-yellow-400' };
        case 'no': return { text: t('不建议提交', 'Do Not Submit'), color: 'text-red-400' };
      }
    };

    const getProbabilityText = () => {
      switch (result.passProbability) {
        case 'high': return { text: t('高 (>80%)', 'High (>80%)'), color: 'text-green-400' };
        case 'medium': return { text: t('中 (50-80%)', 'Medium (50-80%)'), color: 'text-yellow-400' };
        case 'low': return { text: t('低 (<50%)', 'Low (<50%)'), color: 'text-red-400' };
      }
    };

    const getProfitabilityText = () => {
      switch (result.profitability) {
        case 'feasible': return { text: t('可行', 'Feasible'), color: 'text-green-400' };
        case 'pending': return { text: t('待验证', 'Pending'), color: 'text-yellow-400' };
        case 'not_feasible': return { text: t('不可行', 'Not Feasible'), color: 'text-red-400' };
        case 'not_evaluated': return { text: t('未评估（未提供财务数据）', 'Not Evaluated'), color: 'text-blue-300/60' };
      }
    };

    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
        <div className="text-center mb-6 border-b border-white/10 pb-4">
          <h2 className="text-2xl font-bold text-white mb-2">{t('投放诊断报告', 'Ad Review Report')}</h2>
          <p className="text-blue-200/60 text-sm">AdsCraft</p>
        </div>

        {/* 四维结论 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-blue-200/60 text-sm mb-1">{t('能否提交', 'Can Submit')}</div>
            <div className={`text-lg font-semibold ${getCanSubmitText().color}`}>{getCanSubmitText().text}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-blue-200/60 text-sm mb-1">{t('通过概率', 'Pass Probability')}</div>
            <div className={`text-lg font-semibold ${getProbabilityText().color}`}>{getProbabilityText().text}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-blue-200/60 text-sm mb-1">{t('跑量准备度', 'Readiness Score')}</div>
            <div className="text-lg font-semibold text-white">{result.readinessScore}/100</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-blue-200/60 text-sm mb-1">{t('盈利可行性', 'Profitability')}</div>
            <div className={`text-lg font-semibold ${getProfitabilityText().color}`}>{getProfitabilityText().text}</div>
          </div>
        </div>

        {/* 阻断项 */}
        {result.layer1Result.blockers.length > 0 && (
          <div className="mb-4">
            <h3 className="text-red-400 font-semibold mb-2">🔴 {t('阻断项', 'Blockers')}</h3>
            {result.layer1Result.blockers.map((b, i) => (
              <div key={i} className="bg-red-500/10 rounded-lg p-3 mb-2 border border-red-400/30">
                <div className="text-red-300">• {b.item}</div>
                <div className="text-red-300/60 text-sm">{t('来源：', 'Source: ')}{b.source}</div>
              </div>
            ))}
          </div>
        )}

        {/* 高风险项 */}
        {result.layer1Result.highRisks.length > 0 && (
          <div className="mb-4">
            <h3 className="text-yellow-400 font-semibold mb-2">🟡 {t('高风险项', 'High Risks')}</h3>
            {result.layer1Result.highRisks.map((r, i) => (
              <div key={i} className="bg-yellow-500/10 rounded-lg p-3 mb-2 border border-yellow-400/30">
                <div className="text-yellow-300">• {r.item}</div>
                <div className="text-yellow-300/60 text-sm">{t('来源：', 'Source: ')}{r.source}</div>
              </div>
            ))}
          </div>
        )}

        {/* AI 审查发现 */}
        {result.layer3Result.length > 0 && (
          <div className="mb-4">
            <h3 className="text-orange-400 font-semibold mb-2">🟠 {t('AI审查发现', 'AI Findings')}</h3>
            {result.layer3Result.map((f, i) => (
              <div key={i} className="bg-orange-500/10 rounded-lg p-3 mb-2 border border-orange-400/30">
                <div className={`font-medium ${f.riskLevel === 'high' ? 'text-red-300' : f.riskLevel === 'medium' ? 'text-yellow-300' : 'text-blue-300'}`}>
                  • {f.finding}
                </div>
                <div className="text-blue-200/60 text-sm">{t('位置：', 'Position: ')}{f.position} · {t('置信度', 'Confidence')}: {f.confidence}%</div>
                <div className="text-cyan-300 text-sm mt-1">{t('建议：', 'Suggestion: ')}{f.suggestion}</div>
              </div>
            ))}
          </div>
        )}

        {/* 建议执行顺序 */}
        <div className="mb-4">
          <h3 className="text-cyan-400 font-semibold mb-2">📋 {t('建议执行顺序', 'Action Order')}</h3>
          <div className="bg-cyan-500/10 rounded-lg p-4 border border-cyan-400/30">
            {result.actionOrder.map((action, i) => (
              <div key={i} className="text-cyan-300 mb-2">{i + 1}. {action}</div>
            ))}
          </div>
        </div>

        {/* 轻量建议提示（跳过授权时显示） */}
        {diagnosisMode === 'light' && (
          <div className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-lg p-4 border border-orange-400/30 mb-4">
            <p className="text-orange-300 text-center mb-3">
              {t('⚠️ 以上分析基于问卷信息，仅供参考。连接TikTok账号可获取真实广告数据进行完整四层审查。', 
                '⚠️ Analysis based on questionnaire only. Connect TikTok account for full 4-layer review with real ad data.')}
            </p>
            <div className="flex justify-center">
              <Button
                onClick={() => setShowAuthModal(true)}
                className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 text-white"
              >
                {t('连接TikTok账号', 'Connect TikTok Account')}
              </Button>
            </div>
          </div>
        )}

        {/* 付费提示 */}
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4 border border-purple-400/30 text-center">
          <p className="text-purple-300">{t('💡 深度优化与持续追踪 → 订阅付费方案', '💡 Deep optimization & tracking → Subscribe to premium')}</p>
        </div>

        {/* 返回按钮 */}
        <div className="mt-6 flex justify-center gap-4">
          <Button
            onClick={() => { setResult(null); setExpandedSection(1); setFormData({ ...formData, landingPageUrl: '' }); }}
            className="bg-white/10 hover:bg-white/20 text-blue-200"
          >
            {t('重新诊断', 'Re-review')}
          </Button>
          <Button
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-cyan-500 to-blue-600"
          >
            {t('返回首页', 'Back to Home')}
          </Button>
        </div>
      </div>
    );
  };

  // ========== 主渲染 ==========

  // 根据授权状态决定显示的表单内容
  const sections = isTikTokConnected
    ? [
        // 已授权用户：只显示补充问题
        { num: 1, title: t('补充信息', 'Supplementary Info'), render: renderAuthorizedSupplementaryQuestions },
      ]
    : [
        // 未授权用户：显示完整的6个Section
        { num: 1, title: t('Section 1：基础信息', 'Section 1: Basic Info'), render: renderSection1 },
        { num: 2, title: t('Section 2：产品与合规风险', 'Section 2: Compliance'), render: renderSection2 },
        { num: 3, title: t('Section 3：用户与需求判断', 'Section 3: User Needs'), render: renderSection3 },
        { num: 4, title: t('Section 4：素材审查', 'Section 4: Creative'), render: renderSection4 },
        { num: 5, title: t('Section 5：落地页与转化路径', 'Section 5: Landing Page'), render: renderSection5 },
        { num: 6, title: t('Section 6：数据与投放设置', 'Section 6: Settings'), render: renderSection6 },
      ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none"></div>

      <main className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-4">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-cyan-400">
                <rect x="3" y="3" width="18" height="18" rx="3"/>
              </svg>
              <span className="text-sm text-cyan-300">TikTok · {t('免费诊断+拒审排查', 'Free Diagnosis')}</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{t('投放前四层审查', '4-Layer Pre-Launch Review')}</h1>
            <p className="text-blue-200/70">{t('填写以下信息，获取能否提交、通过概率、跑量准备度、盈利可行性四维结论', 'Fill in the form to get can-submit, pass probability, readiness score, and profitability assessment')}</p>
          </div>

          {/* 动态表单 */}
          {expandedSection < 7 && (
            <div className="space-y-3">
              {sections.map((section) => (
                <Card
                  key={section.num}
                  className={`bg-white/10 backdrop-blur-sm border-white/30 transition-all duration-300 ${
                    expandedSection === section.num ? 'border-cyan-400 shadow-lg shadow-cyan-500/20' : ''
                  } ${expandedSection < section.num && !canExpandSection(section.num) ? 'opacity-50' : ''}`}
                >
                  <CardContent className="p-4">
                    {/* Section Header */}
                    <button
                      onClick={() => canExpandSection(section.num) && setExpandedSection(section.num)}
                      className="w-full flex items-center justify-between"
                      disabled={expandedSection < section.num && !canExpandSection(section.num)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          expandedSection === section.num ? 'bg-cyan-500 text-white' : 'bg-white/10 text-blue-200'
                        }`}>
                          {section.num}
                        </div>
                        <span className={`font-medium ${expandedSection === section.num ? 'text-cyan-300' : 'text-blue-200'}`}>
                          {section.title}
                        </span>
                      </div>
                      <svg
                        className={`w-5 h-5 transition-transform ${expandedSection === section.num ? 'rotate-180 text-cyan-400' : 'text-blue-200/60'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Section Content */}
                    {expandedSection === section.num && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        {section.render()}
                        {section.num < 6 && (
                          <Button
                            onClick={() => goToNextSection(section.num)}
                            className="mt-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-300"
                          >
                            {t('继续下一步', 'Next Step')} →
                          </Button>
                        )}
                        {section.num === 6 && (
                          <Button
                            onClick={handleSubmit}
                            disabled={isAnalyzing}
                            className="mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500"
                          >
                            {isAnalyzing ? t('正在审查...', 'Reviewing...') : t('开始审查', 'Start Review')}
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* 结果显示 */}
          {expandedSection === 7 && renderResult()}

          {/* 时间范围选择器（已授权用户） */}
          {showTimeRangeSelector && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowTimeRangeSelector(false)} />
              <div className="relative bg-gradient-to-br from-slate-900 to-indigo-900 border border-white/20 rounded-2xl shadow-xl max-w-md w-full p-6">
                <h2 className="text-xl font-bold text-white mb-4 text-center">
                  {t('选择数据时间范围', 'Select Data Time Range')}
                </h2>
                <p className="text-blue-200/80 text-center mb-6">
                  {t('选择要分析的广告数据时间范围', 'Select the time range for ad data analysis')}
                </p>
                
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[7, 14, 30].map(days => (
                    <button
                      key={days}
                      onClick={() => setSelectedTimeRange(days)}
                      className={`py-4 rounded-xl border transition-all ${
                        selectedTimeRange === days
                          ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 border-purple-400 text-white'
                          : 'bg-white/5 border-white/20 text-blue-200 hover:border-white/40'
                      }`}
                    >
                      <p className="text-lg font-bold">{days}</p>
                      <p className="text-sm">{t('天', 'days')}</p>
                    </button>
                  ))}
                </div>
                
                <Button
                  onClick={handleStartFullDiagnosis}
                  disabled={isAnalyzing}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white py-3 rounded-xl"
                >
                  {isAnalyzing 
                    ? t('正在分析...', 'Analyzing...')
                    : t('开始完整诊断', 'Start Full Diagnosis')
                  }
                </Button>
              </div>
            </div>
          )}

          {/* 授权引导弹窗 */}
          <TikTokAuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            onSkip={handleSkipAuth}
            onSuccess={handleAuthSuccess}
            source="questionnaire"
          />
        </div>
      </main>
    </div>
  );
}
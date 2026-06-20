/**
 * 双平台套餐额度映射表
 * FB: Local Service / Retailer / Manufacturer / Brand
 * TK: Local Service / Website Conversion / Brand Awareness
 */

// 套餐类型
export type TierKey = 
  // 免费层（两平台共用）
  | 'free'
  // Facebook
  | 'fb_local'
  | 'fb_retailer'
  | 'fb_manufacturer'
  | 'fb_brand'
  // TikTok
  | 'tk_local'
  | 'tk_conversion'
  | 'tk_brand';

// 平台类型
export type Platform = 'facebook' | 'tiktok';

// 知识库更新级别
export type KnowledgeLevel = 'basic' | 'full' | 'full_priority';

// 额度类型
export type CreditType = 'diagnosis' | 'creative_review' | 'deep_attribution';

// 套餐额度配置
export interface TierLimitConfig {
  diagnosis: number;              // 月度诊断额度
  creative_review: number;        // 素材审查额度
  deep_attribution: number;       // 深度归因额度 (0=不可用)
  knowledge_update: KnowledgeLevel;
  history_days: number;           // 历史记录保留天数 (Infinity=永久)
  platform: Platform;
  price?: number;                 // 月费
  label?: string;                 // 显示名称
}

/**
 * 双平台套餐额度映射表
 */
export const TIER_LIMITS: Record<TierKey, TierLimitConfig> = {
  // ========== 免费层（两平台共用）==========
  free: {
    diagnosis: 3,
    creative_review: 3,
    deep_attribution: 0,
    knowledge_update: 'basic',
    history_days: 30,
    platform: 'tiktok', // 默认平台，实际使用时根据用户选择
    price: 0,
    label: 'Free',
  },

  // ========== Facebook 套餐 ==========
  fb_local: {
    diagnosis: 15,
    creative_review: 8,
    deep_attribution: 0,
    knowledge_update: 'basic',
    history_days: 30,
    platform: 'facebook',
    price: 9.9,
    label: 'Local Service',
  },
  fb_retailer: {
    diagnosis: 40,
    creative_review: 25,
    deep_attribution: 3,
    knowledge_update: 'full',
    history_days: 90,
    platform: 'facebook',
    price: 19.9,
    label: 'Retailer',
  },
  fb_manufacturer: {
    diagnosis: 80,
    creative_review: 60,
    deep_attribution: 10,
    knowledge_update: 'full_priority',
    history_days: Infinity,
    platform: 'facebook',
    price: 29.9,
    label: 'Manufacturer',
  },
  fb_brand: {
    diagnosis: 80,
    creative_review: 60,
    deep_attribution: 10,
    knowledge_update: 'full_priority',
    history_days: Infinity,
    platform: 'facebook',
    price: 29.9,
    label: 'Brand',
  },

  // ========== TikTok 套餐 ==========
  tk_local: {
    diagnosis: 20,
    creative_review: 10,
    deep_attribution: 0,
    knowledge_update: 'basic',
    history_days: 30,
    platform: 'tiktok',
    price: 14.9,
    label: 'Local Service',
  },
  tk_conversion: {
    diagnosis: 50,
    creative_review: 30,
    deep_attribution: 5,
    knowledge_update: 'full',
    history_days: 90,
    platform: 'tiktok',
    price: 24.9,
    label: 'Website Conversion',
  },
  tk_brand: {
    diagnosis: 100,
    creative_review: 80,
    deep_attribution: 15,
    knowledge_update: 'full_priority',
    history_days: Infinity,
    platform: 'tiktok',
    price: 39.9,
    label: 'Brand Awareness',
  },
};

/**
 * 获取套餐额度配置
 */
export function getTierLimit(tierKey: TierKey): TierLimitConfig {
  return TIER_LIMITS[tierKey] || TIER_LIMITS.free;
}

/**
 * 根据平台和价格匹配套餐
 */
export function matchTierByPlatformAndPrice(
  platform: Platform,
  price: number
): TierKey | null {
  const entries = Object.entries(TIER_LIMITS) as [TierKey, TierLimitConfig][];
  
  for (const [key, config] of entries) {
    if (config.platform === platform && config.price === price) {
      return key;
    }
  }
  
  return null;
}

/**
 * 获取平台所有套餐列表
 */
export function getPlatformTiers(platform: Platform): Array<{ key: TierKey; config: TierLimitConfig }> {
  const entries = Object.entries(TIER_LIMITS) as [TierKey, TierLimitConfig][];
  
  return entries
    .filter(([key, config]) => key !== 'free' && config.platform === platform)
    .map(([key, config]) => ({ key, config }));
}

/**
 * 检查套餐是否支持某额度类型
 */
export function tierSupportsCreditType(
  tierKey: TierKey,
  creditType: CreditType
): boolean {
  const config = getTierLimit(tierKey);
  return config[creditType] > 0;
}

/**
 * 额度不足处理（MVP版）
 */
export function getCreditExhaustedUI(
  tierKey: TierKey,
  creditType: CreditType
): { message: string; actions: Array<{ label: string; link: string }> } {
  if (tierKey === 'free') {
    return {
      message: '本月免费额度已用完，升级付费套餐获取更多额度',
      actions: [
        { label: '查看付费套餐', link: '/pricing' },
      ],
    };
  }
  
  // 付费用户：不推升级，不推Pack，只提示等下月
  return {
    message: '本月额度已用完，下月1号自动重置',
    actions: [],
  };
}
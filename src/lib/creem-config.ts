// Creem支付配置 - 统一三档定价体系
// Free / Pro / Pro+
export const CREEM_PRODUCTS = {
  // Pro 套餐
  pro: {
    productId: 'prod_77H9iTdPoURp4C2Le1xhE8',
    url: 'https://www.creem.io/payment/prod_77H9iTdPoURp4C2Le1xhE8',
    price: '$19.9',
    priceValue: 19.9,
    priceCn: '¥139',
    priceCnValue: 139,
    screenshotLimit: 20,
    features: {
      en: [
        'All Free features',
        'Complete Optimization Package',
        'AI Headline / Primary Text / CTA Generation',
        'Creative Suggestions',
        '20 Reviews per month',
      ],
      zh: [
        '包含所有免费功能',
        '完整优化方案解锁',
        'AI 标题/正文/CTA 生成',
        '创意建议',
        '每月 20 次 Review',
      ],
    },
  },
  // Pro+ 套餐
  pro_plus: {
    productId: 'prod_8D7PXxYlpaNfTQ9MgMoQ2',
    url: 'https://www.creem.io/payment/prod_8D7PXxYlpaNfTQ9MgMoQ2',
    price: '$24.9',
    priceValue: 24.9,
    priceCn: '¥179',
    priceCnValue: 179,
    screenshotLimit: -1, // -1 表示无限
    features: {
      en: [
        'All Pro features',
        'Unlimited Reviews',
        'Early access to new features',
      ],
      zh: [
        '包含所有 Pro 功能',
        '更多 Review 次数',
        '新功能优先体验',
      ],
    },
  },
};

// 套餐类型
export type PlanType = 'free' | 'pro' | 'pro_plus';

// 套餐信息
export const PLAN_INFO: Record<PlanType, {
  nameEn: string;
  nameZh: string;
  priceUsd: string;
  priceCn: string;
  reviewsPerMonth: string;
  reviewsPerMonthValue: number;
}> = {
  free: {
    nameEn: 'Free',
    nameZh: '免费',
    priceUsd: '$0',
    priceCn: '¥0',
    reviewsPerMonth: '3',
    reviewsPerMonthValue: 3,
  },
  pro: {
    nameEn: 'Pro',
    nameZh: 'Pro',
    priceUsd: '$19.9',
    priceCn: '¥139',
    reviewsPerMonth: '20',
    reviewsPerMonthValue: 20,
  },
  pro_plus: {
    nameEn: 'Pro+',
    nameZh: 'Pro+',
    priceUsd: '$24.9',
    priceCn: '¥179',
    reviewsPerMonth: 'Unlimited',
    reviewsPerMonthValue: -1,
  },
};

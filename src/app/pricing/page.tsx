'use client';

import { useI18n } from '@/lib/i18n-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { CREEM_PRODUCTS, PLAN_INFO, PlanType } from '@/lib/creem-config';

export default function PricingPage() {
  const { locale } = useI18n();
  const router = useRouter();
  const { user, subscription, refreshSubscription } = useAuth();
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      'pricing.title': { en: 'Simple, Transparent Pricing', zh: '简单透明的定价' },
      'pricing.subtitle': { en: 'Choose the plan that fits your needs', zh: '选择适合您的套餐' },
      'pricing.free': { en: 'Free', zh: '免费' },
      'pricing.pro': { en: 'Pro', zh: 'Pro' },
      'pricing.proPlus': { en: 'Pro+', zh: 'Pro+' },
      'pricing.perMonth': { en: '/month', zh: '/月' },
      'pricing.reviewsPerMonth': { en: 'Reviews/month', zh: '次 Review/月' },
      'pricing.subscribe': { en: 'Subscribe', zh: '订阅' },
      'pricing.currentPlan': { en: 'Current Plan', zh: '当前套餐' },
      'pricing.upgrade': { en: 'Upgrade', zh: '升级' },
      'pricing.wechatPay': { en: 'WeChat Pay', zh: '微信支付' },
      'pricing.creemPay': { en: 'Credit Card', zh: '信用卡支付' },
      'pricing.qr.title': { en: 'WeChat Pay', zh: '微信支付' },
      'pricing.qr.instruction': { en: 'Scan QR code with WeChat to pay', zh: '使用微信扫码支付' },
      'pricing.qr.copied': { en: 'Link copied!', zh: '链接已复制！' },
      'pricing.qr.copyLink': { en: 'Copy Payment Link', zh: '复制支付链接' },
      'pricing.qr.paymentComplete': { en: 'Payment Complete', zh: '支付完成' },
      'pricing.qr.close': { en: 'Close', zh: '关闭' },
      'pricing.upgradeNote': { en: 'After upgrading, your current Pro subscription will be recalculated from today, Pro+ subscription starts from the upgrade day, remaining Pro reviews will be cleared and replaced with more reviews.', zh: '升级后，当前 Pro 订阅将从今日起重新计算，Pro+ 订阅从升级当天开始，剩余 Pro 次数将清零，替换为更多分析次数。' },
    };
    return translations[key]?.[locale] || key;
  };

  // 免费功能
  const freeFeatures = {
    en: [
      'Upload & Screenshot',
      'Health Score',
      'Top Issues & Evidence',
      'Priority Ranking',
      'Optimization suggestions preview (first 1-2 items)',
      '3 Reviews per month',
    ],
    zh: [
      '上传截图',
      '健康评分',
      '核心问题与证据',
      '优先级排序',
      '优化建议预览（前 1-2 条）',
      '每月 3 次 Review',
    ],
  };

  // Pro 功能
  const proFeatures = {
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
  };

  // Pro+ 功能
  const proPlusFeatures = {
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
  };

  const handleSubscribe = (plan: PlanType) => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (plan === 'pro') {
      window.open(CREEM_PRODUCTS.pro.url, '_blank');
    } else if (plan === 'pro_plus') {
      window.open(CREEM_PRODUCTS.pro_plus.url, '_blank');
    }
  };

  const handleWechatPay = (plan: PlanType) => {
    if (!user) {
      router.push('/login');
      return;
    }
    setSelectedPlan(plan);
    setShowQrModal(true);
  };

  const getUserPlan = (): PlanType => {
    if (!subscription) return 'free';
    if (subscription.plan === 'pro_plus') return 'pro_plus';
    if (subscription.plan === 'pro') return 'pro';
    return 'free';
  };

  const userPlan = getUserPlan();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* 网格纹理背景 */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      
      {/* 二维码弹窗 */}
      {showQrModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-white border border-gray-200 shadow-xl max-w-sm w-full">
            <CardHeader className="text-center">
              <CardTitle className="text-gray-800 text-xl">
                {selectedPlan === 'pro' ? 'AdsCraft Pro' : 'AdsCraft Pro+'}
              </CardTitle>
              <p className="text-gray-600 text-lg">
                {selectedPlan === 'pro' ? PLAN_INFO.pro.priceCn : PLAN_INFO.pro_plus.priceCn}/月
              </p>
            </CardHeader>
            <CardContent className="text-center">
              {/* 二维码显示 */}
              <div className="bg-gray-50 p-4 rounded-xl mb-4 inline-block border border-gray-200">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(selectedPlan === 'pro' ? CREEM_PRODUCTS.pro.url : CREEM_PRODUCTS.pro_plus.url)}`}
                  alt="WeChat Pay QR Code"
                  className="w-[200px] h-[200px]"
                />
              </div>
              <p className="text-gray-600 text-sm mb-4">{t('pricing.qr.instruction')}</p>
              
              {/* 复制链接按钮 */}
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(selectedPlan === 'pro' ? CREEM_PRODUCTS.pro.url : CREEM_PRODUCTS.pro_plus.url);
                  alert(t('pricing.qr.copied'));
                }}
                variant="outline"
                className="bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 mb-3"
              >
                {t('pricing.qr.copyLink')}
              </Button>
              
              {/* 支付完成按钮 */}
              <Button
                onClick={async () => {
                  await refreshSubscription();
                  setShowQrModal(false);
                  router.push('/dashboard');
                }}
                variant="outline"
                className="bg-green-50 border-green-400 text-green-600 hover:bg-green-100 mb-3 w-full"
              >
                {t('pricing.qr.paymentComplete')}
              </Button>
              
              {/* 关闭按钮 */}
              <Button
                onClick={() => setShowQrModal(false)}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
              >
                {t('pricing.qr.close')}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      
      <main className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">{t('pricing.title')}</h1>
          <p className="text-blue-200 text-lg">{t('pricing.subtitle')}</p>
        </div>

        {/* 三档定价卡片 */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free 套餐 */}
          <Card className="bg-white/5 border-white/20 backdrop-blur-xl hover:border-white/40 transition-all">
            <CardHeader>
              <CardTitle className="text-white text-2xl">{t('pricing.free')}</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold text-white">$0</span>
              </div>
              <p className="text-blue-200 text-sm mt-2">{PLAN_INFO.free.reviewsPerMonth} {t('pricing.reviewsPerMonth')}</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {freeFeatures[locale as 'en' | 'zh'].map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-blue-100 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              {userPlan === 'free' ? (
                <Button className="w-full mt-6 bg-gray-500 text-white" disabled>
                  {t('pricing.currentPlan')}
                </Button>
              ) : (
                <Button className="w-full mt-6 bg-white/10 text-white hover:bg-white/20" disabled>
                  {t('pricing.free')}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Pro 套餐 */}
          <Card className="bg-white/5 border-cyan-400/50 backdrop-blur-xl hover:border-cyan-400 transition-all relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-400 text-slate-900 px-4 py-1 rounded-full text-sm font-semibold">
              {locale === 'zh' ? '推荐' : 'Recommended'}
            </div>
            <CardHeader>
              <CardTitle className="text-cyan-400 text-2xl">{t('pricing.pro')}</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold text-white">
                  {locale === 'zh' ? PLAN_INFO.pro.priceCn : PLAN_INFO.pro.priceUsd}
                </span>
                <span className="text-blue-200 text-lg ml-2">{t('pricing.perMonth')}</span>
              </div>
              <p className="text-blue-200 text-sm mt-2">{PLAN_INFO.pro.reviewsPerMonth} {t('pricing.reviewsPerMonth')}</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {proFeatures[locale as 'en' | 'zh'].map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-blue-100 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              {userPlan === 'pro' ? (
                <Button className="w-full mt-6 bg-gray-500 text-white" disabled>
                  {t('pricing.currentPlan')}
                </Button>
              ) : (
                <div className="mt-6 space-y-2">
                  {/* Creem 支付按钮 */}
                  <Button
                    onClick={() => handleSubscribe('pro')}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    {t('pricing.subscribe')} ({PLAN_INFO.pro.priceUsd})
                  </Button>
                  {/* 微信支付按钮（仅中文模式） */}
                  {locale === 'zh' && (
                    <Button
                      onClick={() => handleWechatPay('pro')}
                      variant="outline"
                      className="w-full border-green-400 text-green-400 hover:bg-green-400/10"
                    >
                      {t('pricing.wechatPay')} ({PLAN_INFO.pro.priceCn})
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pro+ 套餐 */}
          <Card className="bg-white/5 border-purple-400/50 backdrop-blur-xl hover:border-purple-400 transition-all">
            <CardHeader>
              <CardTitle className="text-purple-400 text-2xl">{t('pricing.proPlus')}</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold text-white">
                  {locale === 'zh' ? PLAN_INFO.pro_plus.priceCn : PLAN_INFO.pro_plus.priceUsd}
                </span>
                <span className="text-blue-200 text-lg ml-2">{t('pricing.perMonth')}</span>
              </div>
              <p className="text-blue-200 text-sm mt-2">
                {PLAN_INFO.pro_plus.reviewsPerMonthValue > 0 
                  ? `${PLAN_INFO.pro_plus.reviewsPerMonth} ${t('pricing.reviewsPerMonth')}`
                  : (locale === 'zh' ? '更多 Review 次数/月' : 'Unlimited Reviews/month')
                }
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {proPlusFeatures[locale as 'en' | 'zh'].map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <span className="text-blue-100 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              {userPlan === 'pro_plus' ? (
                <Button className="w-full mt-6 bg-gray-500 text-white" disabled>
                  {t('pricing.currentPlan')}
                </Button>
              ) : (
                <div className="mt-6 space-y-2">
                  {/* Creem 支付按钮 */}
                  <Button
                    onClick={() => handleSubscribe('pro_plus')}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    {t('pricing.upgrade')} ({PLAN_INFO.pro_plus.priceUsd})
                  </Button>
                  {/* 微信支付按钮（仅中文模式） */}
                  {locale === 'zh' && (
                    <Button
                      onClick={() => handleWechatPay('pro_plus')}
                      variant="outline"
                      className="w-full border-green-400 text-green-400 hover:bg-green-400/10"
                    >
                      {t('pricing.wechatPay')} ({PLAN_INFO.pro_plus.priceCn})
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pro → Pro+ 升级提示 */}
        {userPlan === 'pro' && (
          <div className="max-w-2xl mx-auto mt-8 p-4 bg-yellow-500/10 border border-yellow-400/30 rounded-lg">
            <p className="text-yellow-200 text-sm text-center">
              ⚠️ {t('pricing.upgradeNote')}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

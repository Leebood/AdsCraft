'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n-context';
import { useAuth } from '@/lib/auth-context';

export default function PricingPage() {
  const { t } = useI18n();
  const { setPremium } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const route = searchParams.get('route') || '';

  const handleUpgrade = () => {
    // 模拟付费升级流程
    // 实际项目中这里应该调用真实的支付API（如Creem）
    console.log('Upgrading for route:', route);
    setPremium(true);
    // 跳转到Dashboard
    router.push('/dashboard');
  };

  const routePricing: Record<string, {
    title: string;
    price: string;
    roi: string;
    bgClass: string;
    borderClass: string;
    iconColor: string;
  }> = {
    retailer: {
      title: t('pricing.retailer.title'),
      price: '$19.9',
      roi: t('pricing.retailer.roi'),
      bgClass: 'from-yellow-500/20 to-orange-500/20',
      borderClass: 'border-yellow-400/50',
      iconColor: 'text-yellow-400'
    },
    manufacturer: {
      title: t('pricing.manufacturer.title'),
      price: '$29.9',
      roi: t('pricing.manufacturer.roi'),
      bgClass: 'from-violet-500/20 to-purple-500/20',
      borderClass: 'border-violet-400/50',
      iconColor: 'text-violet-400'
    },
    brand: {
      title: t('pricing.brand.title'),
      price: '$29.9',
      roi: t('pricing.brand.roi'),
      bgClass: 'from-rose-500/20 to-pink-500/20',
      borderClass: 'border-rose-400/50',
      iconColor: 'text-rose-400'
    },
    local_service: {
      title: t('pricing.localService.title'),
      price: '$9.9',
      roi: t('pricing.localService.roi'),
      bgClass: 'from-emerald-500/20 to-teal-500/20',
      borderClass: 'border-emerald-400/50',
      iconColor: 'text-emerald-400'
    }
  };

  const pricingData = routePricing[route];

  if (!pricingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <main className="container mx-auto px-4 py-12 relative z-10">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-white/5 border-white/20 backdrop-blur-xl">
              <CardContent className="p-12 text-center">
                <p className="text-blue-300 text-lg">{t('pricing.selectRoute')}</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  const features = [
    t('pricing.premium.feature1'),
    t('pricing.premium.feature2'),
    t('pricing.premium.feature3'),
    t('pricing.premium.feature4'),
    t('pricing.premium.feature5')
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* 网格纹理背景 */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      
      <main className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">{t('pricing.title')}</h1>
            <p className="text-blue-300 text-lg">{t('pricing.subtitle')}</p>
          </div>

          {/* 单一付费方案卡片 */}
          <Card className={`bg-gradient-to-br ${pricingData.bgClass} border-2 ${pricingData.borderClass} backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-300`}>
            {/* 光晕效果 */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 blur-3xl opacity-50"></div>
            
            <CardHeader className="text-center pb-4 relative z-10">
              <CardTitle className={`text-2xl font-bold ${pricingData.iconColor}`}>
                {pricingData.title}
              </CardTitle>
              <div className="mt-4">
                <span className="text-5xl font-bold text-white">{pricingData.price}</span>
                <span className="text-blue-200 text-lg ml-2">{t('pricing.premium.period')}</span>
              </div>
            </CardHeader>
            
            <CardContent className="relative z-10">
              {/* ROI预期 */}
              <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-cyan-300 font-medium">{t('pricing.roi.title')}: {pricingData.roi}</p>
              </div>
              
              {/* 功能列表 */}
              <ul className="space-y-3 mb-8">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-blue-200">{feature}</span>
                  </li>
                ))}
              </ul>
              
              {/* 升级按钮 */}
              <Button
                onClick={handleUpgrade}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold py-4 rounded-xl shadow-lg shadow-cyan-500/30 transition-all duration-300 hover:scale-105"
              >
                {t('pricing.premium.button')}
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
              
              {/* 提示 */}
              <p className="text-center text-blue-300/60 text-sm mt-4">
                {t('pricing.premium.note')}
              </p>
            </CardContent>
          </Card>

          {/* 返回按钮 */}
          <div className="text-center mt-8">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-blue-300 hover:text-white hover:bg-white/10"
            >
              {t('common.backPrevious')}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
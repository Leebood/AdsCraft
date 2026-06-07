'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n-context';
import { useAuth } from '@/lib/auth-context';

export default function PricingPage() {
  const { t } = useI18n();
  const { setPremium } = useAuth();
  const router = useRouter();

  const handleUpgrade = (route: string) => {
    // 模拟付费升级流程
    // 实际项目中这里应该调用真实的支付API（如Creem）
    // route参数用于购买对应路线的订阅
    console.log('Upgrading for route:', route);
    setPremium(true);
    // 跳转到Dashboard
    router.push('/dashboard');
  };

  const routePricing = [
    {
      route: 'retailer',
      title: t('pricing.retailer.title'),
      price: '$19.9',
      period: t('pricing.premium.period'),
      features: [
        t('pricing.premium.feature1'),
        t('pricing.premium.feature2'),
        t('pricing.premium.feature3'),
        t('pricing.premium.feature4'),
        t('pricing.premium.feature5')
      ],
      roi: t('pricing.retailer.roi'),
      bgClass: 'from-yellow-500/20 to-orange-500/20',
      borderClass: 'border-yellow-400/30'
    },
    {
      route: 'manufacturer',
      title: t('pricing.manufacturer.title'),
      price: '$29.9',
      period: t('pricing.premium.period'),
      features: [
        t('pricing.premium.feature1'),
        t('pricing.premium.feature2'),
        t('pricing.premium.feature3'),
        t('pricing.premium.feature4'),
        t('pricing.premium.feature5')
      ],
      roi: t('pricing.manufacturer.roi'),
      bgClass: 'from-violet-500/20 to-purple-500/20',
      borderClass: 'border-violet-400/30'
    },
    {
      route: 'brand',
      title: t('pricing.brand.title'),
      price: '$29.9',
      period: t('pricing.premium.period'),
      features: [
        t('pricing.premium.feature1'),
        t('pricing.premium.feature2'),
        t('pricing.premium.feature3'),
        t('pricing.premium.feature4'),
        t('pricing.premium.feature5')
      ],
      roi: t('pricing.brand.roi'),
      bgClass: 'from-rose-500/20 to-pink-500/20',
      borderClass: 'border-rose-400/30'
    },
    {
      route: 'local_service',
      title: t('pricing.localService.title'),
      price: '$9.9',
      period: t('pricing.premium.period'),
      features: [
        t('pricing.premium.feature1'),
        t('pricing.premium.feature2'),
        t('pricing.premium.feature3'),
        t('pricing.premium.feature4'),
        t('pricing.premium.feature5')
      ],
      roi: t('pricing.localService.roi'),
      bgClass: 'from-emerald-500/20 to-teal-500/20',
      borderClass: 'border-emerald-400/30'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* 网格纹理背景 */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      
      <main className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              {t('pricing.title')}
            </h1>
            <p className="text-xl text-blue-200 mb-2">
              {t('pricing.subtitle')}
            </p>
            <p className="text-lg text-blue-300">
              {t('pricing.strategy')}
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {routePricing.map((plan) => (
              <Card key={plan.route} className={`bg-gradient-to-br ${plan.bgClass} ${plan.borderClass} backdrop-blur-sm shadow-xl`}>
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl text-white mb-2">
                    {plan.title}
                  </CardTitle>
                  <p className="text-3xl font-bold text-white mb-1">
                    {plan.price}
                  </p>
                  <p className="text-sm text-blue-200">
                    {plan.period}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-2 mb-4">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-blue-100">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="text-xs text-blue-300 mb-4">
                    {plan.roi}
                  </div>
                  
                  <Button 
                    onClick={() => handleUpgrade(plan.route)}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/30 hover:scale-105 transition-all text-sm"
                  >
                    {t('pricing.premium.cta')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Free Plan Card */}
          <Card className="bg-white/5 border-white/20 backdrop-blur-sm shadow-xl mb-8">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl text-white mb-2">
                {t('pricing.free.title')}
              </CardTitle>
              <p className="text-4xl font-bold text-white">
                {t('pricing.free.price')}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-blue-300">{t('pricing.free.feature1')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-blue-300">{t('pricing.free.feature2')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-blue-300">{t('pricing.free.feature3')}</span>
                </li>
              </ul>
              <Link href="/questions">
                <Button variant="outline" className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20">
                  {t('pricing.free.cta')}
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Comparison Table */}
          <Card className="bg-white/5 border-white/20 backdrop-blur-sm shadow-xl mb-8">
            <CardHeader>
              <CardTitle className="text-white text-center">
                {t('pricing.comparison.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left py-3 text-blue-200">{t('pricing.comparison.feature')}</th>
                      <th className="text-center py-3 text-blue-200">{t('pricing.free.title')}</th>
                      <th className="text-center py-3 text-blue-200">{t('pricing.premium.title')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-white/10">
                      <td className="py-3 text-white">{t('pricing.comparison.feature1')}</td>
                      <td className="text-center py-3 text-cyan-400">✅</td>
                      <td className="text-center py-3 text-cyan-400">✅</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="py-3 text-white">{t('pricing.comparison.feature2')}</td>
                      <td className="text-center py-3 text-red-400">❌</td>
                      <td className="text-center py-3 text-cyan-400">✅</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="py-3 text-white">{t('pricing.comparison.feature3')}</td>
                      <td className="text-center py-3 text-red-400">❌</td>
                      <td className="text-center py-3 text-cyan-400">✅</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="py-3 text-white">{t('pricing.comparison.feature4')}</td>
                      <td className="text-center py-3 text-blue-300">{t('pricing.comparison.partial')}</td>
                      <td className="text-center py-3 text-cyan-400">✅</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="py-3 text-white">{t('pricing.comparison.feature5')}</td>
                      <td className="text-center py-3 text-red-400">❌</td>
                      <td className="text-center py-3 text-cyan-400">✅</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-white">{t('pricing.comparison.feature6')}</td>
                      <td className="text-center py-3 text-cyan-400">✅</td>
                      <td className="text-center py-3 text-cyan-400">✅</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Back Button */}
          <div className="text-center">
            <Link href="/">
              <Button variant="ghost" className="text-blue-200 hover:text-cyan-400 hover:bg-white/10">
                {t('common.backHome')}
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
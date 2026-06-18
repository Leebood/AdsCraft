'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n-context';
import { useAuth } from '@/lib/auth-context';
import { EngineSteps } from '@/components/engine-steps';
import { DiagnosisSection } from '@/components/diagnosis-section';
import { OptimalConfigSection } from '@/components/optimal-config-section';
import { OptimizationPathSection } from '@/components/optimization-path-section';
import { EvolutionSection } from '@/components/evolution-section';
import { PLATFORM_CONFIGS } from '@/lib/platforms/registry';

// 根据路线、预算、路径、目标生成配置预览（区间值）
const getConfigPreview = (route: string, budget: string) => {
  const previews = {
    basic: { cpaRange: '$10-25', ctrRange: '1.0-2.0%', roasRange: '1.5-3.0x' },
    free: { cpaRange: '$10-25', ctrRange: '1.0-2.0%', roasRange: '1.5-3.0x' },
    local_service: { cpaRange: '$8-15', ctrRange: '1.5-2.5%', roasRange: '2.0-4.0x' },
    retailer: { cpaRange: '$4-6', ctrRange: '1.5-2.5%', roasRange: '2.5-4.0x' },
    manufacturer: { cpaRange: '$15-30', ctrRange: '1.2-2.0%', roasRange: '1.8-3.5x' },
    brand: { cpaRange: '$20-40', ctrRange: '2.0-3.0%', roasRange: '1.5-2.5x' },
    rejection_check: { cpaRange: 'N/A', ctrRange: '1.5-2.5%', roasRange: 'N/A' },
    local_service_tk: { cpaRange: '$5-10', ctrRange: '1.5-2.5%', roasRange: '2.0-4.0x' },
    website_conv: { cpaRange: '$3-8', ctrRange: '1.8-3.0%', roasRange: '3.0-5.0x' },
    brand_awareness: { cpaRange: '$15-30', ctrRange: '2.5-4.0%', roasRange: '1.5-2.5x' },
  };
  const normalizedRoute = route === 'localService' ? 'local_service' : route;
  return previews[normalizedRoute as keyof typeof previews] || previews.basic;
};

// 获取路线定价信息
const getRoutePricing = (route: string, platform: string = 'facebook') => {
  // Facebook 线路定价
  const fbPricing: Record<string, { price: string; priceEn: string; creemLink: string }> = {
    free: { price: '免费', priceEn: 'Free', creemLink: '' },
    local_service: { price: '$9.9/月', priceEn: '$9.9/mo', creemLink: 'https://www.creem.io/payment/prod_4iIOpYQLDR8tlnxu6Ziwz6' },
    retailer: { price: '$19.9/月', priceEn: '$19.9/mo', creemLink: 'https://www.creem.io/payment/prod_77H9iTdPoURp4C2Le1xhE8' },
    manufacturer: { price: '$29.9/月', priceEn: '$29.9/mo', creemLink: 'https://www.creem.io/payment/prod_2jkEL15rXCjBQxkEGpXR5v' },
    brand: { price: '$29.9/月', priceEn: '$29.9/mo', creemLink: 'https://www.creem.io/payment/prod_2B7hXzysLFhXYvP8bmTa9c' },
  };
  
  // TikTok 线路定价（Creem链接待补充）
  const tkPricing: Record<string, { price: string; priceEn: string; creemLink: string }> = {
    rejection_check: { price: '免费', priceEn: 'Free', creemLink: '' },
    local_service: { price: '$9.9/月', priceEn: '$9.9/mo', creemLink: '' }, // TODO: 补充Creem链接
    website_conv: { price: '$19.9/月', priceEn: '$19.9/mo', creemLink: '' }, // TODO: 补充Creem链接
    brand_awareness: { price: '$29.9/月', priceEn: '$29.9/mo', creemLink: '' }, // TODO: 补充Creem链接
  };
  
  const normalizedRoute = route === 'localService' ? 'local_service' : route;
  
  if (platform === 'tiktok') {
    return tkPricing[normalizedRoute] || tkPricing.rejection_check;
  }
  return fbPricing[normalizedRoute] || fbPricing.free;
};

function PlanContent() {
  const params = useParams();
  const router = useRouter();
  const planId = params.id as string;
  const { locale } = useI18n();
  const { user, loading, isPremium, checkRouteAccess } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Parse plan ID: platform-route-budget-path-goal
  const parts = planId.split('-');
  const platform = parts[0] || 'facebook';
  const route = parts[1] || 'free';
  const budget = parts[2] || 'mid';
  const path = parts[3] || 'shopify';
  const goal = parts[4] || 'sales';

  const configPreview = getConfigPreview(route, budget);
  const pricing = getRoutePricing(route, platform);
  const isFreeRoute = route === 'free' || route === 'rejection_check';
  
  // 判断用户是否可以访问完整内容
  const canAccessPremium = !loading && user && isPremium && (isFreeRoute || checkRouteAccess(route));

  // 保存方案到数据库
  const handleSavePlan = async () => {
    if (!user || saving) return;
    
    setSaving(true);
    try {
      const response = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ route, budget, goal, plan_data: configPreview })
      });
      
      if (response.ok) setSaved(true);
    } catch (error) {
      console.error('Save plan error:', error);
    } finally {
      setSaving(false);
    }
  };

  // 解锁完整配置
  const handleUnlock = () => {
    if (!pricing.creemLink) return;
    window.open(pricing.creemLink, '_blank');
  };

  // 平台配置
  const platformConfig = PLATFORM_CONFIGS[platform as keyof typeof PLATFORM_CONFIGS];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* 网格纹理背景 */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      
      <main className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-4">
              <span className="text-lg">{platformConfig?.name}</span>
              <span className="text-blue-200">|</span>
              <span className="text-cyan-300 font-medium">{isFreeRoute ? (locale === 'zh' ? '免费方案' : 'Free Plan') : pricing.price}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {locale === 'zh' ? 'AI广告优化方案' : 'AI Ad Optimization Plan'}
            </h1>
            <p className="text-lg text-blue-200">
              {locale === 'zh' ? '四步递进：诊断 → 配置 → 优化 → 进化' : '4-Step: Diagnosis → Config → Optimize → Evolve'}
            </p>
          </div>

          {/* 四步流程可视化 */}
          <EngineSteps currentStep={1} isPremium={canAccessPremium ?? false} />

          {/* Step 1: 诊断分析（免费完整可见） */}
          <DiagnosisSection />

          {/* Step 2: 最优配置（免费预览，付费完整） */}
          <div className="mt-8">
            <OptimalConfigSection 
              configPreview={configPreview}
              isPremium={canAccessPremium ?? false}
              onUnlock={handleUnlock}
            />
          </div>

          {/* Step 3: 优化路径（付费才有） */}
          <div className="mt-8">
            <OptimizationPathSection isPremium={canAccessPremium ?? false} />
          </div>

          {/* Step 4: 持续进化（付费才有） */}
          <div className="mt-8">
            <EvolutionSection isPremium={canAccessPremium ?? false} />
          </div>

          {/* 解锁提示（仅免费用户显示） */}
          {!canAccessPremium && !isFreeRoute && (
            <Card className="mt-8 bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-400/30">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-bold text-orange-300 mb-2">
                  {locale === 'zh' ? '解锁完整优化引擎' : 'Unlock Full Optimization Engine'}
                </h3>
                <p className="text-blue-200 mb-4">
                  {locale === 'zh' 
                    ? `订阅 ${pricing.price}，解锁：精确配置参数 + 7-14天优化路径 + 持续进化循环`
                    : `Subscribe ${pricing.priceEn}, unlock: Exact config + 7-14 day path + Evolution loop`}
                </p>
                <Button 
                  onClick={handleUnlock}
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white shadow-lg shadow-orange-500/30"
                >
                  {locale === 'zh' ? '立即订阅解锁' : 'Subscribe Now'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* 底部操作栏 */}
          <div className="mt-8 flex justify-between items-center">
            {user && (
              <Button 
                onClick={handleSavePlan}
                disabled={saving || saved}
                className={`${saved ? 'bg-green-500 hover:bg-green-500' : 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500'} text-white shadow-lg`}
              >
                {saving ? (locale === 'zh' ? '保存中...' : 'Saving...') : saved ? (locale === 'zh' ? '已保存' : 'Saved') : (locale === 'zh' ? '保存方案' : 'Save Plan')}
              </Button>
            )}
            {!user && <div></div>}
            <Link href="/">
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/30">
                {locale === 'zh' ? '返回首页' : 'Back to Home'}
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PlanPage() {
  const { locale } = useI18n();
  const { user, loading } = useAuth();

  // 未登录时显示登录提示
  if (!loading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <Card className="w-full max-w-md bg-white/5 border-white/20 backdrop-blur-sm shadow-xl relative z-10">
          <CardContent className="text-center py-12">
            <p className="text-blue-200 mb-6">
              {locale === 'zh' ? '请登录以查看优化方案' : 'Please login to view optimization plan'}
            </p>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/30">
                {locale === 'zh' ? '登录' : 'Login'}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-lg">{locale === 'zh' ? '加载中...' : 'Loading...'}</div>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-lg">{locale === 'zh' ? '加载中...' : 'Loading...'}</div>
      </div>
    }>
      <PlanContent />
    </Suspense>
  );
}
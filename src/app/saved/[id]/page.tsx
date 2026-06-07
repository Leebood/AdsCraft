'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useI18n } from '@/lib/i18n-context';
import { useAuth } from '@/lib/auth-context';
import { getSupabaseBrowserClientAsync } from '@/lib/supabase-browser';
import { Paywall } from '@/components/paywall';
import { ComparisonTable } from '@/components/comparison-table';
import { StageGuide } from '@/components/stage-guide';

interface SavedPlan {
  id: number;
  user_id: string;
  route: string;
  budget: string;
  goal: string;
  plan_data: Record<string, string>;
  created_at: string;
  updated_at: string;
}

const routeLabels: Record<string, { price: string; roi: string }> = {
  retailer: { price: '$19.9/月', roi: '优化1天预算即可覆盖' },
  manufacturer: { price: '$29.9/月', roi: '1个精准询盘即可覆盖' },
  brand: { price: '$29.9/月', roi: '1次有效品牌曝光即可覆盖' },
  local_service: { price: '$9.9/月', roi: '1个到店客户即可覆盖' }
};

export default function SavedPlanPage() {
  const params = useParams();
  const router = useRouter();
  const planId = params.id as string;
  const { t, locale } = useI18n();
  const { user, isPremium, checkRouteAccess } = useAuth();
  const [plan, setPlan] = useState<SavedPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlan();
  }, [planId]);

  const fetchPlan = async () => {
    try {
      const client = await getSupabaseBrowserClientAsync();
      const { data } = await client.auth.getSession();
      const token = data.session?.access_token;
      
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/plans/${planId}`, {
        headers: { 'x-session': token }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPlan(data.plan);
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Fetch plan error:', error);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getSubscriptionRoute = (route: string): string => {
    const routeMap: Record<string, string> = {
      retailer: 'retailer',
      manufacturer: 'manufacturer',
      brand: 'brand',
      local_service: 'localService'
    };
    return routeMap[route] || 'retailer';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <p className="text-blue-200">{locale === 'zh' ? '加载中...' : 'Loading...'}</p>
      </div>
    );
  }

  if (!plan) {
    return null;
  }

  const pricing = routeLabels[plan.route] || routeLabels.retailer;
  const subscriptionRoute = getSubscriptionRoute(plan.route);
  const canAccessFullContent = user && isPremium && checkRouteAccess(subscriptionRoute);

  const planItems = [
    { key: 'objective', label: t('plan.campaign'), value: plan.plan_data?.objective || '-' },
    { key: 'budgetStrategy', label: t('plan.budget'), value: plan.plan_data?.budgetStrategy || '-' },
    { key: 'audience', label: t('plan.audience'), value: plan.plan_data?.audience || '-' },
    { key: 'placement', label: t('plan.placement'), value: plan.plan_data?.placement || '-' },
    { key: 'bid', label: t('plan.bidding'), value: plan.plan_data?.bid || '-' },
    { key: 'format', label: t('plan.format'), value: plan.plan_data?.format || '-' },
    { key: 'optimization', label: t('plan.event'), value: plan.plan_data?.optimization || '-' },
    { key: 'remarketing', label: t('plan.remarketing'), value: plan.plan_data?.remarketing || '-' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* 网格纹理背景 */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      
      <main className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">{t('plan.title')}</h1>
            <p className="text-blue-200">
              {locale === 'zh' ? `创建于 ${new Date(plan.created_at).toLocaleDateString('zh-CN')}` : `Created on ${new Date(plan.created_at).toLocaleDateString('en-US')}`}
            </p>
          </div>

          {/* Quick Reference Table */}
          <Card className="bg-white/5 border-white/20 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="text-white">{t('plan.quickRef')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-white/20 hover:bg-white/5">
                    <TableHead className="text-blue-200 w-1/3">{t('plan.decision')}</TableHead>
                    <TableHead className="text-blue-200">{t('plan.recommendation')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {planItems.map((item) => (
                    <TableRow key={item.key} className="border-white/10 hover:bg-white/5">
                      <TableCell className="text-blue-300 font-medium">{item.label}</TableCell>
                      <TableCell className="text-white">{item.value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* 付费解锁内容 */}
              {!canAccessFullContent && (
                <div className="mt-8">
                  <Paywall 
                    route={subscriptionRoute} 
                    price={pricing.price} 
                    roi={pricing.roi}
                    isLoggedIn={!!user}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* 5阶段递进指南 */}
          <div className="mt-12">
            <StageGuide route={plan.route} isPremium={canAccessFullContent ?? false} />
          </div>

          {/* Free vs Premium Comparison */}
          {!canAccessFullContent && (
            <div className="mt-12">
              <ComparisonTable />
            </div>
          )}

          {/* Buttons */}
          <div className="mt-8 flex justify-end">
            <Link href="/dashboard">
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/30">
                {locale === 'zh' ? '返回仪表板' : 'Back to Dashboard'}
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
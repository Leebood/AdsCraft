'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useI18n } from '@/lib/i18n-context';
import { useAuth } from '@/lib/auth-context';
import { Paywall } from '@/components/paywall';
import { ComparisonTable } from '@/components/comparison-table';

// 根据路线、预算、路径、目标生成精确配置
const getPlanConfig = (route: string, budget: string, path: string, goal: string) => {
  const configs = {
    retailer: {
      objective: goal === 'sales' ? 'Sales' : 'Traffic',
      budgetStrategy: budget === 'low' ? 'ABO $10-20/day' : budget === 'mid' ? 'ABO → CBO ($30-50/day)' : 'CBO ($50+/day)',
      audience: path === 'shopify' ? 'LAA 1-2% + Broad' : path === 'whatsapp' ? 'Core + Interest' : 'LAA + Core',
      placement: path === 'shopify' ? 'Advantage+ (FB+IG+AN)' : 'Manual (FB Feed + IG Feed)',
      bid: budget === 'low' ? 'Minimum cost' : 'Cost cap → Target ROAS',
      format: path === 'shopify' ? 'DPA + Collection + Carousel' : 'Single image + Video + Carousel',
      optimization: goal === 'sales' ? 'Purchase → ATC' : 'ViewContent → InitiateCheckout',
      remarketing: path === 'shopify' ? '7-day ATC + 30-day browse' : '14-day engagement + 30-day click'
    },
    manufacturer: {
      objective: goal === 'leads' ? 'Leads' : 'Traffic',
      budgetStrategy: budget === 'low' ? 'ABO long-term ($20/day)' : 'CBO testing ($50/day)',
      audience: 'Core audience (position + industry + country)',
      placement: 'Manual: FB Feed + IG Feed + AN + Messenger',
      bid: budget === 'low' ? 'Minimum cost' : 'Cost cap (Lead)',
      format: 'Carousel + Instant Form + Single image',
      optimization: 'Lead → Contact → Website leads',
      remarketing: '30-day leads + 90-day dormant + 180-day website visitors'
    },
    local_service: {
      objective: goal === 'leads' ? 'Leads' : goal === 'awareness' ? 'Awareness' : 'Traffic',
      budgetStrategy: budget === 'low' ? 'ABO ($10-20/day per service)' : 'CBO ($30-50/day)',
      audience: 'Core audience (radius 10-50km + interest + language)',
      placement: path === 'store' ? 'Manual: FB+IG+Messenger' : 'Advantage+',
      bid: budget === 'low' ? 'Minimum cost' : 'Cost cap',
      format: 'Single image/video + Before/After carousel + Instant Form',
      optimization: 'Lead → Contact → Call',
      remarketing: '14-day browse + 30-day inquiry + 60-day engagement'
    },
    brand: {
      objective: goal === 'awareness' ? 'Awareness → Traffic' : goal === 'sales' ? 'Sales' : 'Traffic → Sales',
      budgetStrategy: budget === 'low' ? 'ABO testing ($20/day)' : budget === 'mid' ? 'CBO awareness ($50/day)' : 'CBO multi-stage ($100+/day)',
      audience: goal === 'awareness' ? 'Broad + Interest' : 'Core → LAA → Broad',
      placement: 'Advantage+ (all placements)',
      bid: 'Minimum cost (brand focus)',
      format: 'Video + Spark Ads + Carousel + Single image',
      optimization: goal === 'awareness' ? 'ThruPlay → Reach' : 'ViewContent → Purchase',
      remarketing: '30-day engagement + 90-day brand interest + 180-day video viewers'
    }
  };

  return configs[route as keyof typeof configs] || configs.retailer;
};

export default function PlanPage() {
  const params = useParams();
  const planId = params.id as string;
  const { t } = useI18n();
  const { isPremium } = useAuth();

  // Parse plan ID: route-budget-path-goal
  const parts = planId.split('-');
  const route = parts[0] || 'retailer';
  const budget = parts[1] || 'mid';
  const path = parts[2] || 'shopify';
  const goal = parts[3] || 'sales';

  const config = getPlanConfig(route, budget, path, goal);

  // 基础通用方案：完整的8个决策点配置（免费）
  const basicPlanItems = [
    { key: 'campaign', label: t('plan.campaign'), value: config.objective },
    { key: 'budget', label: t('plan.budget'), value: config.budgetStrategy },
    { key: 'audience', label: t('plan.audience'), value: config.audience },
    { key: 'placement', label: t('plan.placement'), value: config.placement },
    { key: 'bidding', label: t('plan.bidding'), value: config.bid },
    { key: 'format', label: t('plan.format'), value: config.format },
    { key: 'event', label: t('plan.event'), value: config.optimization },
    { key: 'remarketing', label: t('plan.remarketing'), value: config.remarketing }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* 网格纹理背景 */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      
      <main className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              {t('plan.title')}
            </h1>
            <p className="text-blue-200">
              Route: {route} | Budget: {budget} | Path: {path} | Goal: {goal}
            </p>
          </div>

          {/* Quick Reference Table */}
          <Card className="bg-white/5 border-white/20 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="text-white">{t('plan.quickRef')}</CardTitle>
            </CardHeader>
            <CardContent>
              {/* 基础通用方案：完整的8个决策点配置 */}
              <Table>
                <TableHeader>
                  <TableRow className="border-white/20">
                    <TableHead className="w-1/3 text-blue-200">{t('plan.decision')}</TableHead>
                    <TableHead className="text-blue-200">{t('plan.recommendation')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {basicPlanItems.map((item) => (
                    <TableRow key={item.key} className="border-white/10 hover:bg-white/5">
                      <TableCell className="font-medium text-white">{item.label}</TableCell>
                      <TableCell className="text-blue-100">{item.value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* 付费解锁内容 */}
              {!isPremium && (
                <div className="mt-8">
                  <Paywall />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Back Button - 右侧 */}
          <div className="mt-8 flex justify-end">
            <Link href="/">
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 to-blue-500 text-white shadow-lg shadow-cyan-500/30">
                {t('common.back')}
              </Button>
            </Link>
          </div>

          {/* Free vs Premium Comparison - 放在页面最下面 */}
          {!isPremium && (
            <div className="mt-12">
              <ComparisonTable />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
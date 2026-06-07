'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useI18n } from '@/lib/i18n-context';
import { useAuth } from '@/lib/auth-context';
import { Paywall } from '@/components/paywall';

const routeConfigs = {
  retailer: {
    objective: 'Sales',
    budgetStrategy: 'ABO cold start → CBO expansion',
    audience: 'LAA 1% (with data) / Core audience (no data)',
    placement: 'Advantage+',
    bid: 'Minimum cost → Target ROAS',
    format: 'DPA + Collection',
    optimization: 'Purchase → Add to Cart → ViewContent',
    remarketing: '7-day add-to-cart + 14-day browse'
  },
  manufacturer: {
    objective: 'Leads',
    budgetStrategy: 'ABO long-term',
    audience: 'Core audience (position + industry + country)',
    placement: 'Manual: FB Feed + IG Feed + AN',
    bid: 'Minimum cost → Cost cap',
    format: 'Carousel + Instant Form',
    optimization: 'Lead → Contact',
    remarketing: '30-day leads + 90-day dormant'
  },
  local_service: {
    objective: 'Leads',
    budgetStrategy: 'ABO long-term',
    audience: 'Core audience (radius + interest + language)',
    placement: 'Advantage+ or Manual: FB + IG + Messenger',
    bid: 'Minimum cost → Cost cap',
    format: 'Single image/video + Before/After carousel + Instant Form',
    optimization: 'Lead → Contact',
    remarketing: '14-day browse + 30-day inquiry'
  },
  brand: {
    objective: 'Awareness → Traffic → Sales (by stage)',
    budgetStrategy: 'CBO awareness stage → ABO conversion stage',
    audience: 'Core audience → LAA → Broad',
    placement: 'Advantage+',
    bid: 'Minimum cost',
    format: 'Video + Spark Ads',
    optimization: 'ThruPlay → ViewContent → Purchase',
    remarketing: '30-day engagement + 90-day brand interest'
  }
};

export default function PlanPage() {
  const params = useParams();
  const planId = params.id as string;
  const { t } = useI18n();
  const { user, isPremium } = useAuth();

  // Parse plan ID: route-budget-path
  const [route, budget, path] = planId.split('-');
  const config = routeConfigs[route as keyof typeof routeConfigs] || routeConfigs.retailer;

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
              Route: {route} | Budget: {budget} | Path: {path}
            </p>
          </div>

          {/* Quick Reference Table */}
          <Card className="bg-white/5 border-white/20 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="text-white">{t('plan.quickRef')}</CardTitle>
            </CardHeader>
            <CardContent>
              {isPremium ? (
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/20">
                      <TableHead className="w-1/3 text-blue-200">{t('plan.decision')}</TableHead>
                      <TableHead className="text-blue-200">{t('plan.recommendation')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="border-white/10 hover:bg-white/5">
                      <TableCell className="font-medium text-white">{t('plan.campaign')}</TableCell>
                      <TableCell className="text-blue-100">{config.objective}</TableCell>
                    </TableRow>
                    <TableRow className="border-white/10 hover:bg-white/5">
                      <TableCell className="font-medium text-white">{t('plan.budget')}</TableCell>
                      <TableCell className="text-blue-100">{config.budgetStrategy}</TableCell>
                    </TableRow>
                    <TableRow className="border-white/10 hover:bg-white/5">
                      <TableCell className="font-medium text-white">{t('plan.audience')}</TableCell>
                      <TableCell className="text-blue-100">{config.audience}</TableCell>
                    </TableRow>
                    <TableRow className="border-white/10 hover:bg-white/5">
                      <TableCell className="font-medium text-white">{t('plan.placement')}</TableCell>
                      <TableCell className="text-blue-100">{config.placement}</TableCell>
                    </TableRow>
                    <TableRow className="border-white/10 hover:bg-white/5">
                      <TableCell className="font-medium text-white">{t('plan.bidding')}</TableCell>
                      <TableCell className="text-blue-100">{config.bid}</TableCell>
                    </TableRow>
                    <TableRow className="border-white/10 hover:bg-white/5">
                      <TableCell className="font-medium text-white">{t('plan.format')}</TableCell>
                      <TableCell className="text-blue-100">{config.format}</TableCell>
                    </TableRow>
                    <TableRow className="border-white/10 hover:bg-white/5">
                      <TableCell className="font-medium text-white">{t('plan.event')}</TableCell>
                      <TableCell className="text-blue-100">{config.optimization}</TableCell>
                    </TableRow>
                    <TableRow className="border-white/10 hover:bg-white/5">
                      <TableCell className="font-medium text-white">{t('plan.remarketing')}</TableCell>
                      <TableCell className="text-blue-100">{config.remarketing}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              ) : (
                <Paywall />
              )}
            </CardContent>
          </Card>

          {/* Back Button */}
          <div className="mt-8 text-center">
            <Link href="/">
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 to-blue-500 text-white shadow-lg shadow-cyan-500/30">
                {t('common.back')}
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
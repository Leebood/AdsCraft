'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useI18n } from '@/lib/i18n-context';

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

  // Parse plan ID: route-budget-path
  const [route, budget, path] = planId.split('-');
  const config = routeConfigs[route as keyof typeof routeConfigs] || routeConfigs.retailer;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {t('plan.title')}
            </h1>
            <p className="text-gray-600">
              Route: {route} | Budget: {budget} | Path: {path}
            </p>
          </div>

          {/* Quick Reference Table */}
          <Card>
            <CardHeader>
              <CardTitle>{t('plan.quickRef')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/3">{t('plan.decision')}</TableHead>
                    <TableHead>{t('plan.recommendation')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">{t('plan.campaign')}</TableCell>
                    <TableCell>{config.objective}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">{t('plan.budget')}</TableCell>
                    <TableCell>{config.budgetStrategy}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">{t('plan.audience')}</TableCell>
                    <TableCell>{config.audience}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">{t('plan.placement')}</TableCell>
                    <TableCell>{config.placement}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">{t('plan.bidding')}</TableCell>
                    <TableCell>{config.bid}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">{t('plan.format')}</TableCell>
                    <TableCell>{config.format}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">{t('plan.event')}</TableCell>
                    <TableCell>{config.optimization}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">{t('plan.remarketing')}</TableCell>
                    <TableCell>{config.remarketing}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Back Button */}
          <div className="mt-8 text-center">
            <Link href="/">
              <Button variant="outline">
                {t('common.back')}
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
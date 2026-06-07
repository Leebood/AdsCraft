'use client';

import {useTranslations} from 'next-intl';
import {useParams} from 'next/navigation';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Link} from '@/i18n/routing';

// Decision point configurations for each route
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
  const t = useTranslations();
  const params = useParams();
  const planId = params.id as string;
  
  // Parse plan ID to get route
  const [route] = planId.split('-');
  const config = routeConfigs[route as keyof typeof routeConfigs] || routeConfigs.retailer;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">{t('plan.title')}</h1>
            <p className="text-gray-600">{t('plan.routes.' + route)}</p>
          </div>

          {/* Quick Reference Table */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{t('plan.quickRef')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/3">决策点</TableHead>
                    <TableHead>推荐配置</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">{t('plan.decisionPoints.objective')}</TableCell>
                    <TableCell>{config.objective}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">{t('plan.decisionPoints.budgetStrategy')}</TableCell>
                    <TableCell>{config.budgetStrategy}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">{t('plan.decisionPoints.audience')}</TableCell>
                    <TableCell>{config.audience}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">{t('plan.decisionPoints.placement')}</TableCell>
                    <TableCell>{config.placement}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">{t('plan.decisionPoints.bid')}</TableCell>
                    <TableCell>{config.bid}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">{t('plan.decisionPoints.format')}</TableCell>
                    <TableCell>{config.format}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">{t('plan.decisionPoints.optimization')}</TableCell>
                    <TableCell>{config.optimization}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">{t('plan.decisionPoints.remarketing')}</TableCell>
                    <TableCell>{config.remarketing}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Upgrade Prompt */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-800">解锁完整分析</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{t('plan.upgradePrompt')}</p>
              <div className="flex gap-4">
                <Link href="/pricing">
                  <Button variant="default">
                    查看定价
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline">
                    返回首页
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
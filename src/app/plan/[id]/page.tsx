'use client';

import {useParams} from 'next/navigation';
import Link from 'next/link';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';

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
  
  const [route] = planId.split('-');
  const config = routeConfigs[route as keyof typeof routeConfigs] || routeConfigs.retailer;

  const routeNames = {
    retailer: '零售商',
    manufacturer: '制造商',
    local_service: '本地服务商',
    brand: '品牌方'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">你的广告配置</h1>
            <p className="text-gray-600">{routeNames[route as keyof typeof routeNames] || '零售商'}</p>
          </div>

          {/* Quick Reference Table */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>速查表</CardTitle>
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
                    <TableCell className="font-medium">Campaign目标</TableCell>
                    <TableCell>{config.objective}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">预算策略</TableCell>
                    <TableCell>{config.budgetStrategy}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">受众类型</TableCell>
                    <TableCell>{config.audience}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">版位选择</TableCell>
                    <TableCell>{config.placement}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">出价策略</TableCell>
                    <TableCell>{config.bid}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">广告格式</TableCell>
                    <TableCell>{config.format}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">优化事件</TableCell>
                    <TableCell>{config.optimization}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">再营销窗口</TableCell>
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
              <p className="text-gray-600 mb-4">升级以解锁完整分析和定制推荐</p>
              <div className="flex gap-4">
                <Link href="/pricing">
                  <Button variant="default">查看定价</Button>
                </Link>
                <Link href="/">
                  <Button variant="outline">返回首页</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
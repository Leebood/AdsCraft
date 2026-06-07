'use client';

import Link from 'next/link';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">隐私政策</CardTitle>
              <p className="text-gray-500">最后更新: 2026年6月</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3">数据收集</h2>
                <p className="text-gray-600">
                  我们收集邮箱地址、问答数据、广告数据等信息,用于生成方案、阶段追踪和诊断分析。
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">数据用途</h2>
                <p className="text-gray-600">
                  您的数据用于生成个性化的广告方案、追踪阶段进度、提供AI诊断建议。
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">数据存储</h2>
                <p className="text-gray-600">
                  数据存储在Supabase(美国/新加坡节点),采用加密存储方式保护您的隐私。
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">第三方服务</h2>
                <p className="text-gray-600">
                  我们使用以下第三方服务:Creem(支付处理)、Google/GitHub(OAuth登录)、Resend(邮件服务)、Coze API(AI诊断)。
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">用户权利</h2>
                <p className="text-gray-600">
                  您有权查看、导出和删除个人数据。可通过Dashboard设置页进行数据管理操作。
                </p>
              </section>

              <div className="mt-8 pt-6 border-t">
                <Link href="/" className="text-blue-600 hover:underline">返回首页</Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
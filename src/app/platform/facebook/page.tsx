'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n-context';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PLATFORM_CONFIGS } from '@/lib/platforms/registry';

export default function FacebookPlatformPage() {
  const { locale } = useI18n();
  const { user, loading } = useAuth();
  const config = PLATFORM_CONFIGS.facebook;

  // 未登录时显示登录提示
  if (!loading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="w-full max-w-md bg-white/5 border-white/20">
          <CardContent className="text-center py-12">
            <p className="text-blue-200 mb-6">
              {locale === 'zh' ? '请登录以访问 Facebook 广告诊断' : 'Please login to access Facebook diagnosis'}
            </p>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600">
                {locale === 'zh' ? '登录' : 'Login'}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      
      <main className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* 标题区 */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 bg-white/10 px-6 py-3 rounded-full mb-6">
              <span className="text-3xl">{config?.icon}</span>
              <span className="text-2xl font-bold text-white">
                {locale === 'zh' ? config?.nameZh : config?.name}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {locale === 'zh' ? 'Facebook 广告诊断引擎' : 'Facebook Ads Diagnosis Engine'}
            </h1>
            <p className="text-xl text-blue-200/80 max-w-2xl mx-auto">
              {locale === 'zh' 
                ? '选择你的业务类型，获取个性化配置方案和诊断建议'
                : 'Select your business type to get personalized configuration and diagnosis'}
            </p>
          </div>

          {/* 线路选择 */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {config?.routes?.map((route) => (
              <Link
                key={route.id}
                href={`/questions?platform=facebook&route=${route.id}`}
                className="group"
              >
                <Card className="bg-white/5 border-white/20 hover:border-cyan-400/50 hover:bg-white/10 transition-all duration-300 h-full">
                  <CardContent className="p-6">
                    {/* 图标 */}
                    <div className="flex items-center gap-4 mb-4">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ 
                          background: `linear-gradient(135deg, ${route.color}30, ${route.color}10)`,
                          border: `1px solid ${route.color}50`
                        }}
                      >
                        <span className="text-2xl" dangerouslySetInnerHTML={{ __html: route.icon }} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-cyan-300 transition-colors">
                          {locale === 'zh' ? route.nameZh : route.name}
                        </h3>
                        {route.priceText && (
                          <p className="text-sm text-blue-300/60">
                            {locale === 'zh' ? route.priceTextZh || route.priceText : route.priceText}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* 描述 */}
                    <p className="text-blue-200/70 text-sm mb-4">
                      {locale === 'zh' ? route.descriptionZh || route.description : route.description}
                    </p>
                    
                    {/* 操作提示 */}
                    <div className="flex items-center gap-2 text-cyan-400/70 group-hover:text-cyan-300 transition-colors">
                      <span className="text-sm">
                        {locale === 'zh' ? '开始诊断' : 'Start Diagnosis'}
                      </span>
                      <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
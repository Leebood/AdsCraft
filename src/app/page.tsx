'use client';

import { useI18n } from '@/lib/i18n-context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { tiktokPixel } from '@/lib/tiktok-pixel';
import { PLATFORM_CONFIGS, PlatformId, PlatformRoute } from '@/lib/platforms/registry';

export default function HomePage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformId | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<{ platform: PlatformId; route: PlatformRoute } | null>(null);
  
  // TikTok Pixel: 页面浏览追踪
  useEffect(() => {
    tiktokPixel.viewContent();
  }, []);
  
  // 处理需要登录的操作
  const handleAuthRequiredAction = (targetPath: string) => {
    if (loading) return;
    if (user) {
      router.push(targetPath);
    } else {
      router.push('/login');
    }
  };

  // 处理线路卡片点击
  const handleRouteClick = (platform: PlatformId, route: PlatformRoute) => {
    tiktokPixel.addToCart();
    
    // 如果是付费线路且有支付链接，跳转到 Creem
    if (!route.isFree && route.creemLink) {
      window.open(route.creemLink, '_blank');
      return;
    }
    
    // 否则进入答题流程
    if (route.isFree) {
      handleAuthRequiredAction(`/questions?route=${route.id}&platform=${platform}`);
    } else {
      // 付费线路但暂无支付链接（如 TikTok 新产品）
      setSelectedRoute({ platform, route });
    }
  };

  // 获取线路图标颜色对应的 Tailwind 样式
  const getRouteStyles = (color: string) => {
    const styles: Record<string, { bg: string; border: string; text: string; hoverBorder: string }> = {
      '#22D3EE': { bg: 'bg-cyan-500/20', border: 'border-cyan-400/30', text: 'text-cyan-400', hoverBorder: 'hover:border-cyan-400/50' },
      '#10B981': { bg: 'bg-emerald-500/20', border: 'border-emerald-400/30', text: 'text-emerald-400', hoverBorder: 'hover:border-emerald-400/50' },
      '#F59E0B': { bg: 'bg-yellow-500/20', border: 'border-yellow-400/30', text: 'text-yellow-400', hoverBorder: 'hover:border-yellow-400/50' },
      '#8B5CF6': { bg: 'bg-violet-500/20', border: 'border-violet-400/30', text: 'text-violet-400', hoverBorder: 'hover:border-violet-400/50' },
      '#EC4899': { bg: 'bg-rose-500/20', border: 'border-rose-400/30', text: 'text-rose-400', hoverBorder: 'hover:border-rose-400/50' },
      '#3B82F6': { bg: 'bg-blue-500/20', border: 'border-blue-400/30', text: 'text-blue-400', hoverBorder: 'hover:border-blue-400/50' },
      '#FF0050': { bg: 'bg-pink-500/20', border: 'border-pink-400/30', text: 'text-pink-400', hoverBorder: 'hover:border-pink-400/50' },
      '#00F2EA': { bg: 'bg-teal-500/20', border: 'border-teal-400/30', text: 'text-teal-400', hoverBorder: 'hover:border-teal-400/50' }
    };
    return styles[color] || styles['#22D3EE'];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 opacity-10 pointer-events-none z-0">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-block mb-6 px-6 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full border border-cyan-400/30">
            <span className="text-cyan-300 font-medium text-sm tracking-wide">
              AI-Powered Decision Engine
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            {t('home.title')}
          </h1>
          <h2 className="text-2xl md:text-3xl text-blue-200 mb-6 font-light">
            {t('home.subtitle')}
          </h2>
          <p className="text-blue-300/80 max-w-2xl mx-auto text-lg leading-relaxed">
            {t('home.description')}
          </p>
        </div>

        {/* Dual Platform Section - 双平台分列 */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold text-white mb-8 text-center">
            {locale === 'zh' ? '选择你的广告平台和业务类型' : 'Select Your Platform & Business Type'}
          </h3>
          
          {/* 双平台分列布局 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Facebook Platform Column */}
            <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 rounded-2xl border border-blue-400/20 p-6">
              {/* Platform Header */}
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-blue-400/20">
                <div className="text-4xl">{PLATFORM_CONFIGS.facebook.icon}</div>
                <div>
                  <h4 className="text-xl font-semibold text-white">
                    {PLATFORM_CONFIGS.facebook.name}
                  </h4>
                  <p className="text-blue-200/70 text-sm">
                    {locale === 'zh' ? 'Facebook & Instagram 广告' : 'Facebook & Instagram Ads'}
                  </p>
                </div>
              </div>
              
              {/* Route Cards */}
              <div className="space-y-3">
                {PLATFORM_CONFIGS.facebook.routes.map((route) => {
                  const styles = getRouteStyles(route.color);
                  return (
                    <button
                      key={route.id}
                      onClick={() => handleRouteClick('facebook', route)}
                      disabled={loading}
                      className={`group w-full p-4 rounded-xl border transition-all duration-300 flex items-center gap-4 ${
                        selectedRoute?.route.id === route.id && selectedRoute?.platform === 'facebook'
                          ? 'bg-white/15 border-cyan-400 shadow-lg shadow-cyan-500/20'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      } ${styles.hoverBorder} disabled:opacity-70 disabled:cursor-wait`}
                    >
                      {/* Icon - SVG */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${styles.bg} ${styles.border} group-hover:scale-105 transition-transform`}>
                        <div 
                          className={`w-6 h-6 ${styles.text}`}
                          dangerouslySetInnerHTML={{ __html: route.icon }}
                        />
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1">
                        <h5 className="text-base font-semibold text-white group-hover:text-cyan-300 transition-colors">
                          {locale === 'zh' ? route.nameZh : route.name}
                        </h5>
                        <p className="text-blue-200/60 text-sm">
                          {locale === 'zh' ? route.descriptionZh : route.description}
                        </p>
                      </div>
                      
                      {/* Price */}
                      <div className="text-right">
                        <div className={`text-lg font-bold ${route.isFree ? 'text-cyan-400' : styles.text}`}>
                          {locale === 'zh' ? route.priceTextZh : route.priceText}
                        </div>
                        {!route.isFree && route.creemLink && (
                          <div className="text-xs text-blue-300/50">
                            {locale === 'zh' ? '订阅' : 'Subscribe'}
                          </div>
                        )}
                      </div>
                      
                      {/* Arrow */}
                      <svg className="w-5 h-5 text-blue-300/50 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TikTok Platform Column */}
            <div className="bg-gradient-to-br from-slate-800/40 to-pink-900/40 rounded-2xl border border-pink-400/20 p-6">
              {/* Platform Header */}
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-pink-400/20">
                <div className="text-4xl">{PLATFORM_CONFIGS.tiktok.icon}</div>
                <div>
                  <h4 className="text-xl font-semibold text-white">
                    {PLATFORM_CONFIGS.tiktok.name}
                  </h4>
                  <p className="text-pink-200/70 text-sm">
                    {locale === 'zh' ? 'TikTok 广告 & TikTok Shop' : 'TikTok Ads & TikTok Shop'}
                  </p>
                </div>
              </div>
              
              {/* Route Cards */}
              <div className="space-y-3">
                {PLATFORM_CONFIGS.tiktok.routes.map((route) => {
                  const styles = getRouteStyles(route.color);
                  const hasPaymentLink = route.creemLink && route.creemLink.length > 0;
                  const isPaidButNoLink = !route.isFree && !hasPaymentLink;
                  
                  return (
                    <button
                      key={route.id}
                      onClick={() => hasPaymentLink && handleRouteClick('tiktok', route)}
                      disabled={loading || isPaidButNoLink}
                      className={`group w-full p-4 rounded-xl border transition-all duration-300 flex items-center gap-4 ${
                        selectedRoute?.route.id === route.id && selectedRoute?.platform === 'tiktok'
                          ? 'bg-white/15 border-cyan-400 shadow-lg shadow-cyan-500/20'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      } ${styles.hoverBorder} ${isPaidButNoLink ? 'opacity-60 cursor-not-allowed' : ''} disabled:opacity-70 disabled:cursor-wait`}
                    >
                      {/* Icon - SVG */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${styles.bg} ${styles.border} group-hover:scale-105 transition-transform`}>
                        <div 
                          className={`w-6 h-6 ${styles.text}`}
                          dangerouslySetInnerHTML={{ __html: route.icon }}
                        />
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1">
                        <h5 className="text-base font-semibold text-white group-hover:text-cyan-300 transition-colors">
                          {locale === 'zh' ? route.nameZh : route.name}
                        </h5>
                        <p className="text-blue-200/60 text-sm">
                          {locale === 'zh' ? route.descriptionZh : route.description}
                        </p>
                      </div>
                      
                      {/* Price */}
                      <div className="text-right">
                        <div className={`text-lg font-bold ${route.isFree ? 'text-cyan-400' : styles.text}`}>
                          {locale === 'zh' ? route.priceTextZh : route.priceText}
                        </div>
                        {isPaidButNoLink && (
                          <div className="text-xs text-blue-300/50">
                            {locale === 'zh' ? '即将上线' : 'Coming Soon'}
                          </div>
                        )}
                        {!route.isFree && hasPaymentLink && (
                          <div className="text-xs text-blue-300/50">
                            {locale === 'zh' ? '订阅' : 'Subscribe'}
                          </div>
                        )}
                      </div>
                      
                      {/* Arrow */}
                      {!isPaidButNoLink && (
                        <svg className="w-5 h-5 text-blue-300/50 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* 注释：各平台线路独立，不交叉映射 */}
          <p className="text-blue-300/50 text-sm text-center mt-6">
            {locale === 'zh' 
              ? '💡 各平台线路独立配置，点击付费线路跳转 Creem 完成订阅'
              : '💡 Each platform has independent routes. Click paid routes to subscribe via Creem'}
          </p>
        </div>

        {/* Selected Route Action Button */}
        {selectedRoute && !selectedRoute.route.creemLink && (
          <div className="mb-8 flex justify-center">
            <button
              onClick={() => handleAuthRequiredAction(`/questions?route=${selectedRoute.route.id}&platform=${selectedRoute.platform}`)}
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white font-semibold shadow-lg shadow-cyan-500/30 hover:from-cyan-400 hover:to-blue-500 hover:scale-105 transition-all duration-300 flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Loading...
                </span>
              ) : (
                <>
                  {t('home.startNow')}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </div>
        )}

        {/* Value Proposition */}
        <div className="mt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Configuration Recommendation */}
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-cyan-400/10 blur-xl rounded-full group-hover:bg-cyan-400/20 transition-all duration-300" />
                <div className="relative w-20 h-20 mx-auto bg-gradient-to-br from-cyan-500/30 to-cyan-400/20 rounded-2xl border border-cyan-400/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-10 h-10 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 3v18h18V3H3zm16 16H5V5h14v14zM7 7h2v2H7V7zm0 4h2v2H7v-2zm0 4h2v2H7v-2zm4-8h2v2h-2V7zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2zm4-8h2v2h-2V7zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z"/>
                  </svg>
                </div>
              </div>
              <h4 className="text-xl font-semibold text-white mb-3 group-hover:text-cyan-300 transition-colors">
                {t('home.value1.title')}
              </h4>
              <p className="text-blue-300/70 leading-relaxed">
                {t('home.value1.desc')}
              </p>
            </div>

            {/* Reason Analysis */}
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-purple-400/10 blur-xl rounded-full group-hover:bg-purple-400/20 transition-all duration-300" />
                <div className="relative w-20 h-20 mx-auto bg-gradient-to-br from-purple-500/30 to-purple-400/20 rounded-2xl border border-purple-400/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-10 h-10 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 21c0 .5.4 1 1 1h4c.6 0 1-.5 1-1v-1H9v1zm3-19C8.1 2 5 5.1 5 9c0 2.4 1.2 4.5 3 5.7V17c0 .5.4 1 1 1h6c.6 0 1-.5 1-1v-2.3c1.8-1.3 3-3.4 3-5.7 0-3.9-3.1-7-7-7zm2.9 11.1l-.9.6V16h-4v-2.3l-.9-.6C7.8 12.2 7 10.6 7 9c0-2.8 2.2-5 5-5s5 2.2 5 5c0 1.6-.8 3.2-2.1 4.1z"/>
                  </svg>
                </div>
              </div>
              <h4 className="text-xl font-semibold text-white mb-3 group-hover:text-purple-300 transition-colors">
                {t('home.value2.title')}
              </h4>
              <p className="text-blue-300/70 leading-relaxed">
                {t('home.value2.desc')}
              </p>
            </div>

            {/* Diagnosis & Optimization */}
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-orange-400/10 blur-xl rounded-full group-hover:bg-orange-400/20 transition-all duration-300" />
                <div className="relative w-20 h-20 mx-auto bg-gradient-to-br from-orange-500/30 to-orange-400/20 rounded-2xl border border-orange-400/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-10 h-10 text-orange-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.54 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.46 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
                  </svg>
                </div>
              </div>
              <h4 className="text-xl font-semibold text-white mb-3 group-hover:text-orange-300 transition-colors">
                {t('home.value3.title')}
              </h4>
              <p className="text-blue-300/70 leading-relaxed">
                {t('home.value3.desc')}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-20 pt-8 border-t border-white/10 text-center">
          <p className="text-blue-300/60 text-sm mb-2">
            {t('footer.rights')}
          </p>
          <p className="text-blue-300/60 text-sm">
            {t('footer.support')}: <a href="mailto:leo.tikboost@gmail.com" className="text-cyan-400 hover:text-cyan-300 transition-colors">leo.tikboost@gmail.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
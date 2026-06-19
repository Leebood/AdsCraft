'use client';

import { useI18n } from '@/lib/i18n-context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { tiktokPixel } from '@/lib/tiktok-pixel';
import { PLATFORM_CONFIGS, PlatformId, PlatformRoute } from '@/lib/platforms/registry';

// 订阅状态类型
interface SubscriptionStatus {
  route: string;
  status: string;
}

export default function HomePage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [selectedRoute, setSelectedRoute] = useState<{ platform: PlatformId; route: PlatformRoute } | null>(null);
  const [subscriptions, setSubscriptions] = useState<SubscriptionStatus[]>([]);
  
  // TikTok Pixel: 页面浏览追踪
  useEffect(() => {
    tiktokPixel.viewContent();
  }, []);
  
  // 获取用户订阅状态
  useEffect(() => {
    if (!user) return;
    
    const fetchSubscriptions = async () => {
      try {
        const session = localStorage.getItem('supabase_session');
        if (!session) return;
        
        const sessionData = JSON.parse(session);
        const token = sessionData?.access_token;
        if (!token) return;
        
        const res = await fetch('/api/subscription/all', {
          headers: { 'x-session': token }
        });
        
        if (res.ok) {
          const data = await res.json();
          setSubscriptions(data.subscriptions || []);
        }
      } catch (e) {
        console.error('获取订阅状态失败:', e);
      }
    };
    
    fetchSubscriptions();
  }, [user]);
  
  // 检查用户是否已订阅某线路
  const isRouteSubscribed = (routeId: string): boolean => {
    // TikTok 线路 ID 映射到数据库中的 route 字段
    const routeMapping: Record<string, string> = {
      'tiktok_local_service': 'tiktok_local_service',
      'tiktok_website_conv': 'tiktok_website_conv',
      'tiktok_brand_awareness': 'tiktok_brand_awareness',
    };
    
    const dbRoute = routeMapping[routeId] || routeId;
    return subscriptions.some(s => s.route === dbRoute && s.status === 'active');
  };
  
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
    
    // TikTok 免费诊断入口直接跳转到四层审查页面
    if (platform === 'tiktok' && route.id === 'rejection_check') {
      handleAuthRequiredAction('/rejection-check');
      return;
    }
    
    // 如果是付费线路，检查是否已订阅
    if (!route.isFree) {
      // 如果用户已订阅该线路，直接进入答题流程
      if (isRouteSubscribed(route.id)) {
        handleAuthRequiredAction(`/questions?route=${route.id}&platform=${platform}`);
        return;
      }
      
      // 如果未订阅且有支付链接，跳转到 Creem
      if (route.creemLink) {
        window.open(route.creemLink, '_blank');
        return;
      }
      
      // 付费线路但暂无支付链接
      setSelectedRoute({ platform, route });
      return;
    }
    
    // 免费线路直接进入答题流程
    handleAuthRequiredAction(`/questions?route=${route.id}&platform=${platform}`);
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

  // 四步流程数据
  const engineSteps = [
    { num: 1, title: locale === 'zh' ? '诊断分析' : 'Diagnosis', desc: locale === 'zh' ? '识别问题根因' : 'Identify root causes' },
    { num: 2, title: locale === 'zh' ? '最优配置' : 'Optimal Config', desc: locale === 'zh' ? 'AI推荐配置' : 'AI recommended setup' },
    { num: 3, title: locale === 'zh' ? '动态优化' : 'Dynamic Opt', desc: locale === 'zh' ? '7-14天调整路径' : '7-14 day adjustment' },
    { num: 4, title: locale === 'zh' ? '持续进化' : 'Evolution', desc: locale === 'zh' ? '新数据再优化' : 'Re-optimize with data' },
  ];

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
        {/* 产品定位区 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            AdsCraft — {locale === 'zh' ? 'AI广告优化引擎' : 'AI Ad Optimization Engine'}
          </h1>
          <h2 className="text-xl md:text-2xl text-blue-200 mb-8 font-light">
            {locale === 'zh' ? '让你的 Facebook & TikTok 广告更精准' : 'Make your Facebook & TikTok ads more precise'}
          </h2>
          
          {/* 四步流程可视化 */}
          <div className="flex flex-wrap justify-center items-center gap-3 md:gap-6 mb-8">
            {engineSteps.map((step, idx) => (
              <div key={step.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border border-cyan-400/50 flex items-center justify-center text-cyan-300 font-bold text-lg md:text-xl">
                    {step.num}
                  </div>
                  <div className="mt-2 text-center">
                    <div className="text-white font-medium text-sm md:text-base">{step.title}</div>
                    <div className="text-blue-300/60 text-xs md:text-sm">{step.desc}</div>
                  </div>
                </div>
                {idx < engineSteps.length - 1 && (
                  <svg className="w-6 h-6 md:w-8 md:h-8 text-cyan-400/50 mx-2 md:mx-4 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Dual Platform Section - 双平台分列 */}
        <div className="mb-16">
          {/* 双平台分列布局 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Facebook Platform Column */}
            <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 rounded-2xl border border-blue-400/20 p-6">
              {/* Platform Header */}
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-blue-400/20">
                <div 
                  className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400"
                  dangerouslySetInnerHTML={{ __html: PLATFORM_CONFIGS.facebook.icon }}
                />
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
                      className={`group w-full p-4 rounded-xl border transition-all duration-300 flex items-center gap-4 bg-white/5 border-white/10 hover:bg-white/10 ${styles.hoverBorder} disabled:opacity-70 disabled:cursor-wait`}
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
                <div 
                  className="w-12 h-12 rounded-xl bg-pink-500/20 border border-pink-400/30 flex items-center justify-center text-pink-400"
                  dangerouslySetInnerHTML={{ __html: PLATFORM_CONFIGS.tiktok.icon }}
                />
                <div>
                  <h4 className="text-xl font-semibold text-white">
                    {PLATFORM_CONFIGS.tiktok.name}
                  </h4>
                  <p className="text-pink-200/70 text-sm">
                    {locale === 'zh' ? 'TikTok 广告' : 'TikTok Ads'}
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
                      onClick={() => handleRouteClick('tiktok', route)}
                      disabled={loading || isPaidButNoLink}
                      className={`group w-full p-4 rounded-xl border transition-all duration-300 flex items-center gap-4 bg-white/5 border-white/10 hover:bg-white/10 ${styles.hoverBorder} ${isPaidButNoLink ? 'opacity-60 cursor-not-allowed' : ''} disabled:opacity-70 disabled:cursor-wait`}
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
          
          {/* 注释 */}
          <p className="text-blue-300/50 text-sm text-center mt-6">
            {locale === 'zh' 
              ? '💡 点击付费线路跳转 Creem 完成订阅'
              : '💡 Click paid routes to subscribe via Creem'}
          </p>
        </div>

        {/* Selected Route Action Button - 仅用于暂无支付链接的付费线路 */}
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
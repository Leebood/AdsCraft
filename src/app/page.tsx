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
  const isRouteSubscribed = (platform: PlatformId, routeId: string): boolean => {
    const routeMapping: Record<string, string> = {
      'fb_local_service': 'local_service',
      'fb_retailer': 'retailer',
      'fb_manufacturer': 'manufacturer',
      'fb_brand': 'brand',
      'tiktok_local_service': 'tiktok_local_service',
      'tiktok_website_conv': 'tiktok_website_conv',
      'tiktok_brand_awareness': 'tiktok_brand_awareness',
      'local_service': 'local_service',
      'retailer': 'retailer',
      'manufacturer': 'manufacturer',
      'brand': 'brand',
    };
    
    const platformPrefix = platform === 'facebook' ? 'fb' : 'tiktok';
    const routeKey = `${platformPrefix}_${routeId}`;
    const dbRoute = routeMapping[routeKey] || routeMapping[routeId] || routeId;
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
      if (isRouteSubscribed(platform, route.id)) {
        handleAuthRequiredAction(`/questions?route=${route.id}&platform=${platform}`);
        return;
      }
      
      if (locale === 'zh') {
        const platformPrefix = platform === 'facebook' ? 'fb' : 'tiktok';
        const routeKey = `${platformPrefix}_${route.id}`;
        handleAuthRequiredAction(`/pricing?route=${routeKey}`);
      } else if (route.creemLink) {
        window.open(route.creemLink, '_blank');
      } else {
        setSelectedRoute({ platform, route });
      }
      return;
    }
    
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

  // 处理免费诊断按钮点击
  const handleFreeDiagnosis = (platform: 'facebook' | 'tiktok') => {
    tiktokPixel.track('StartFreeDiagnosis');
    if (platform === 'tiktok') {
      handleAuthRequiredAction('/rejection-check');
    } else {
      handleAuthRequiredAction('/questions?route=free&platform=facebook');
    }
  };

  // 示例诊断报告内容
  const sampleOutputs = [
    { icon: '🔍', titleEn: 'Campaign Problem Diagnosis', titleZh: '广告问题诊断', descEn: 'Identify why your ads are not converting', descZh: '识别广告为什么不转化' },
    { icon: '🎯', titleEn: 'Audience Targeting Recommendation', titleZh: '受众定向推荐', descEn: 'Find your ideal customer segments', descZh: '找到你的理想客户群体' },
    { icon: '💰', titleEn: 'Budget Allocation', titleZh: '预算分配建议', descEn: 'Optimize spend across campaigns', descZh: '优化各广告系列的预算' },
    { icon: '🎨', titleEn: 'Creative Angle Suggestions', titleZh: '创意角度建议', descEn: 'Improve ad visuals and copy', descZh: '改进广告视觉和文案' },
    { icon: '📅', titleEn: '7-Day Optimization Plan', titleZh: '7天优化计划', descEn: 'Step-by-step improvement roadmap', descZh: '逐步改进路线图' },
  ];

  // 适合谁使用
  const useCases = [
    { icon: '🏪', titleEn: 'Local Stores', titleZh: '本地门店', descEn: 'Offline businesses targeting nearby customers', descZh: '面向附近顾客的线下商家' },
    { icon: '🛒', titleEn: 'Shopify Sellers', titleZh: 'Shopify卖家', descEn: 'E-commerce stores needing better ROAS', descZh: '需要更好ROAS的电商店铺' },
    { icon: '🏭', titleEn: 'B2B Manufacturers', titleZh: 'B2B制造商', descEn: 'Factory/wholesale generating leads', descZh: '获取询盘的工厂/批发商' },
    { icon: '🚀', titleEn: 'New Product Launches', titleZh: '新品上市', descEn: 'Brands launching new products', descZh: '推广新品的品牌方' },
    { icon: '👤', titleEn: 'Solo Operators', titleZh: '个人运营者', descEn: 'Small brands without a media buyer', descZh: '没有专业投手的小品牌' },
  ];

  // FAQ 内容
  const faqs = [
    {
      qEn: 'Is this a tutorial or a decision tool?',
      qZh: '这是教程还是决策工具？',
      aEn: 'AdsCraft does not teach you generic ad theory. It gives campaign-level decisions based on your business type, goal, budget, and platform.',
      aZh: 'AdsCraft不教泛泛的广告理论，而是根据你的业务类型、目标、预算和平台，给出广告系列级别的决策建议。',
    },
    {
      qEn: 'What do I get from the free diagnosis?',
      qZh: '免费诊断能得到什么？',
      aEn: 'You get a basic diagnosis of your current campaign issues and a preview of recommended settings.',
      aZh: '你会得到当前广告问题的基础诊断和推荐配置预览。',
    },
    {
      qEn: 'How does the paid plan differ?',
      qZh: '付费方案有什么不同？',
      aEn: 'Paid plans include full optimization plan, audience structure, budget split, retargeting setup, and 7-day checklist.',
      aZh: '付费方案包含完整优化计划、受众结构、预算分配、再营销设置和7天检查清单。',
    },
    {
      qEn: 'Do I need to share my ad account data?',
      qZh: '需要分享广告账户数据吗？',
      aEn: 'No. You answer questions about your business and goals, and we provide recommendations based on that.',
      aZh: '不需要。你只需回答关于业务和目标的问题，我们据此提供推荐。',
    },
  ];

  // 四步流程数据（保留）
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
        {/* ========== Hero 首屏 ========== */}
        <div className="text-center mb-16">
          {/* AI 标签 */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/20 border border-cyan-400/30 mb-6">
            <span className="text-cyan-400 font-medium text-sm">AI-Powered</span>
          </div>
          
          {/* 主标题 */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            {locale === 'zh' 
              ? 'Facebook、Instagram 和 TikTok 广告的 AI 诊断工具' 
              : 'AI Ad Diagnosis for Facebook, Instagram & TikTok Ads'}
          </h1>
          
          {/* 副标题 */}
          <p className="text-xl md:text-2xl text-blue-200 mb-6 font-light max-w-3xl mx-auto">
            {locale === 'zh'
              ? '找出广告为什么不转化，获取 AI 推荐的广告配置，在 7-14 天内优化你的预算。'
              : 'Find why your ads are not converting, get AI-recommended campaign settings, and optimize your budget in 7-14 days.'}
          </p>
          
          {/* CTA 按钮 */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {/* Facebook 免费诊断 */}
            <button
              onClick={() => handleFreeDiagnosis('facebook')}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-white font-semibold shadow-lg shadow-blue-500/30 hover:from-blue-400 hover:to-blue-500 hover:scale-105 transition-all duration-300 flex items-center gap-2 disabled:opacity-70"
            >
              <div className="w-5 h-5 text-white" dangerouslySetInnerHTML={{ __html: PLATFORM_CONFIGS.facebook.icon }} />
              {locale === 'zh' ? 'Facebook 免费诊断' : 'Facebook Free Diagnosis'}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            
            {/* TikTok 免费诊断 */}
            <button
              onClick={() => handleFreeDiagnosis('tiktok')}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl text-white font-semibold shadow-lg shadow-pink-500/30 hover:from-pink-400 hover:to-rose-500 hover:scale-105 transition-all duration-300 flex items-center gap-2 disabled:opacity-70"
            >
              <div className="w-5 h-5 text-white" dangerouslySetInnerHTML={{ __html: PLATFORM_CONFIGS.tiktok.icon }} />
              {locale === 'zh' ? 'TikTok 免费诊断' : 'TikTok Free Diagnosis'}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            
            {/* 查看示例报告 */}
            <button
              onClick={() => {
                const sampleSection = document.getElementById('sample-output');
                sampleSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white font-semibold hover:bg-white/15 hover:border-cyan-400/50 transition-all duration-300 flex items-center gap-2"
            >
              {locale === 'zh' ? '查看示例报告' : 'View Sample Report'}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          
          {/* 结果承诺 */}
          <p className="text-blue-300/70 text-sm max-w-2xl mx-auto">
            {locale === 'zh'
              ? '获取广告诊断、受众建议、预算分配、创意方向和下一步优化计划。'
              : 'Get a campaign diagnosis, audience suggestion, budget split, creative direction, and next-step optimization plan.'}
          </p>
        </div>

        {/* ========== How It Works ========== */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-white text-center mb-8">
            {locale === 'zh' ? '工作流程' : 'How It Works'}
          </h2>
          <div className="flex flex-wrap justify-center items-center gap-3 md:gap-6">
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

        {/* ========== Sample Diagnosis Output ========== */}
        <div id="sample-output" className="mb-16">
          <h2 className="text-2xl font-semibold text-white text-center mb-4">
            {locale === 'zh' ? '示例诊断报告' : 'Sample Diagnosis Report'}
          </h2>
          <p className="text-blue-300/70 text-center mb-8 max-w-2xl mx-auto">
            {locale === 'zh'
              ? '提交广告信息后，你会得到以下诊断结果'
              : 'After submitting your ad info, you will receive the following diagnosis results'}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {sampleOutputs.map((item, idx) => (
              <div 
                key={idx}
                className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-cyan-400/30 transition-all duration-300"
              >
                <div className="text-2xl mb-2">{item.icon}</div>
                <h3 className="text-white font-semibold mb-1">
                  {locale === 'zh' ? item.titleZh : item.titleEn}
                </h3>
                <p className="text-blue-300/60 text-sm">
                  {locale === 'zh' ? item.descZh : item.descEn}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ========== Use Cases ========== */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-white text-center mb-4">
            {locale === 'zh' ? '适合谁使用' : 'Who Should Use AdsCraft'}
          </h2>
          <p className="text-blue-300/70 text-center mb-8 max-w-2xl mx-auto">
            {locale === 'zh'
              ? '专为没有专业营销团队的小商家和个人运营者打造'
              : 'Built for small businesses and solo operators running paid ads without a full marketing team.'}
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
            {useCases.map((item, idx) => (
              <div 
                key={idx}
                className="bg-white/5 border border-white/10 rounded-xl p-4 text-center hover:bg-white/10 hover:border-cyan-400/30 transition-all duration-300"
              >
                <div className="text-3xl mb-2">{item.icon}</div>
                <h3 className="text-white font-semibold text-sm mb-1">
                  {locale === 'zh' ? item.titleZh : item.titleEn}
                </h3>
                <p className="text-blue-300/60 text-xs">
                  {locale === 'zh' ? item.descZh : item.descEn}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ========== Pricing（保留原有双平台线路展示） ========== */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-white text-center mb-8">
            {locale === 'zh' ? '选择你的方案' : 'Choose Your Plan'}
          </h2>
          
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
                    {locale === 'zh' ? '转化导向、受众定向、预算结构' : 'Conversion-focused, audience targeting, budget structure'}
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
                      {/* Icon */}
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
                    {locale === 'zh' ? '内容角度、拒审检查、素材方向' : 'Content angles, rejection check, creative direction'}
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
                      {/* Icon */}
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
              ? '💡 点击付费线路跳转支付页面完成订阅'
              : '💡 Click paid routes to subscribe via Creem'}
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

        {/* ========== FAQ ========== */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-white text-center mb-8">
            {locale === 'zh' ? '常见问题' : 'FAQ'}
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="bg-white/5 border border-white/10 rounded-xl p-4"
              >
                <h3 className="text-white font-semibold mb-2">
                  {locale === 'zh' ? faq.qZh : faq.qEn}
                </h3>
                <p className="text-blue-300/70 text-sm leading-relaxed">
                  {locale === 'zh' ? faq.aZh : faq.aEn}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ========== Bottom CTA ========== */}
        <div className="text-center mb-12 p-8 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl border border-cyan-400/20">
          <p className="text-blue-200 mb-4">
            {locale === 'zh'
              ? '不确定哪个方案适合你？'
              : 'Not sure which plan fits?'}
          </p>
          <button
            onClick={() => handleFreeDiagnosis('facebook')}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white font-semibold shadow-lg shadow-cyan-500/30 hover:from-cyan-400 hover:to-blue-500 hover:scale-105 transition-all duration-300 disabled:opacity-70"
          >
            {locale === 'zh' ? '先试试免费诊断' : 'Start with a free diagnosis'}
          </button>
        </div>

        {/* ========== Footer ========== */}
        <div className="mt-20 pt-8 border-t border-white/10 text-center">
          <p className="text-blue-300/60 text-sm mb-2">
            {t('footer.rights')}
          </p>
          <p className="text-blue-300/60 text-sm mb-4">
            {locale === 'zh'
              ? 'AI Ad Decision Engine for Facebook, Instagram & TikTok'
              : 'AI Ad Decision Engine for Facebook, Instagram & TikTok'}
          </p>
          <p className="text-blue-300/60 text-sm">
            {t('footer.support')}: <a href="mailto:leo.tikboost@gmail.com" className="text-cyan-400 hover:text-cyan-300 transition-colors">leo.tikboost@gmail.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
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

  // 处理付费线路支付（英文模式下直接跳转 Creem）
  const handlePayment = (route: PlatformRoute) => {
    tiktokPixel.clickSubscribe();
    if (route.creemLink) {
      window.open(route.creemLink, '_blank');
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

  // 每个套餐的交付内容（中英文）
  const routeDeliverables: Record<string, { items: Array<{ en: string; zh: string }> }> = {
    // Facebook 免费方案
    'fb_free': {
      items: [
        { en: 'Basic campaign diagnosis', zh: '基础广告诊断' },
        { en: 'Problem identification', zh: '问题识别' },
        { en: 'Config preview', zh: '配置预览' },
      ]
    },
    // Facebook 付费方案
    'fb_local_service': {
      items: [
        { en: 'Local audience structure', zh: '本地受众结构' },
        { en: 'Campaign objective recommendation', zh: '广告目标推荐' },
        { en: 'Budget split for local reach', zh: '本地触达预算分配' },
        { en: 'Geo-targeting setup', zh: '地理定向设置' },
        { en: '7-day optimization checklist', zh: '7天优化清单' },
      ]
    },
    'fb_retailer': {
      items: [
        { en: 'Product audience structure', zh: '产品受众结构' },
        { en: 'Campaign objective recommendation', zh: '广告目标推荐' },
        { en: 'Budget split', zh: '预算分配' },
        { en: 'Retargeting setup', zh: '再营销设置' },
        { en: '7-day optimization checklist', zh: '7天优化清单' },
      ]
    },
    'fb_manufacturer': {
      items: [
        { en: 'B2B lead audience structure', zh: 'B2B询盘受众结构' },
        { en: 'Campaign objective recommendation', zh: '广告目标推荐' },
        { en: 'Budget split for lead generation', zh: '询盘预算分配' },
        { en: 'Lead form optimization', zh: '表单优化建议' },
        { en: '7-day optimization checklist', zh: '7天优化清单' },
      ]
    },
    'fb_brand': {
      items: [
        { en: 'Brand audience structure', zh: '品牌受众结构' },
        { en: 'Campaign objective recommendation', zh: '广告目标推荐' },
        { en: 'Budget split for brand awareness', zh: '品牌曝光预算分配' },
        { en: 'Creative direction', zh: '创意方向建议' },
        { en: '7-day optimization checklist', zh: '7天优化清单' },
      ]
    },
    // TikTok 免费方案
    'tiktok_rejection_check': {
      items: [
        { en: 'Free ad diagnosis', zh: '免费广告诊断' },
        { en: 'Rejection risk analysis', zh: '拒审风险分析' },
        { en: 'Compliance check preview', zh: '合规检查预览' },
      ]
    },
    // TikTok 付费方案
    'tiktok_local_service': {
      items: [
        { en: 'Local audience structure', zh: '本地受众结构' },
        { en: 'Campaign objective recommendation', zh: '广告目标推荐' },
        { en: 'Budget split for local reach', zh: '本地触达预算分配' },
        { en: 'Creative angle suggestions', zh: '创意角度建议' },
        { en: '7-day optimization checklist', zh: '7天优化清单' },
      ]
    },
    'tiktok_website_conv': {
      items: [
        { en: 'Website conversion audience', zh: '网站转化受众' },
        { en: 'Campaign objective recommendation', zh: '广告目标推荐' },
        { en: 'Budget split', zh: '预算分配' },
        { en: 'Landing page optimization', zh: '落地页优化' },
        { en: '7-day optimization checklist', zh: '7天优化清单' },
      ]
    },
    'tiktok_brand_awareness': {
      items: [
        { en: 'Brand audience structure', zh: '品牌受众结构' },
        { en: 'Campaign objective recommendation', zh: '广告目标推荐' },
        { en: 'Budget split for brand awareness', zh: '品牌曝光预算分配' },
        { en: 'Creative direction', zh: '创意方向建议' },
        { en: '7-day optimization checklist', zh: '7天优化清单' },
      ]
    },
  };

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
              ? 'Facebook 和 TikTok 广告的 AI 诊断工具' 
              : 'AI Ad Diagnosis for Facebook & TikTok Ads'}
          </h1>
          
          {/* 副标题 */}
          <p className="text-xl md:text-2xl text-blue-200 mb-6 font-light max-w-3xl mx-auto">
            {locale === 'zh'
              ? '找出广告为什么不转化，获取 AI 推荐的广告配置，在 7-14 天内优化你的预算。'
              : 'Find why your ads are not converting, get AI-recommended campaign settings, and optimize your budget in 7-14 days.'}
          </p>
          
          {/* CTA 按钮 - 简洁 */}
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <button
              onClick={() => handleFreeDiagnosis('facebook')}
              disabled={loading}
              className="px-4 py-2 border border-blue-500/50 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-colors text-sm"
            >
              Facebook
            </button>
            <button
              onClick={() => handleFreeDiagnosis('tiktok')}
              disabled={loading}
              className="px-4 py-2 border border-cyan-500/50 rounded-lg text-cyan-400 hover:bg-cyan-500/10 transition-colors text-sm"
            >
              TikTok
            </button>
            <button
              onClick={() => document.getElementById('sample-output')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-4 py-2 border border-white/20 rounded-lg text-slate-400 hover:text-white hover:border-white/40 transition-colors text-sm"
            >
              {locale === 'zh' ? '示例' : 'Sample'}
            </button>
          </div>
          
          {/* 结果承诺 - 简洁 */}
          <p className="text-slate-400 text-xs max-w-xl mx-auto">
            {locale === 'zh'
              ? '诊断 → 受众建议 → 预算分配 → 创意方向 → 优化计划'
              : 'Diagnosis → Audience → Budget → Creative → Optimization'}
          </p>
        </div>

        {/* ========== How It Works - 简洁 ========== */}
        <div className="mb-8 py-4">
          <div className="flex flex-wrap justify-center items-center gap-2 px-4">
            {engineSteps.map((step, idx) => (
              <div key={step.num} className="flex items-center">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-cyan-400 font-bold text-sm">{step.num}</span>
                  <span className="text-slate-300 text-sm">{step.title}</span>
                </div>
                {idx < engineSteps.length - 1 && (
                  <span className="text-slate-500 mx-1">→</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ========== Sample Output - 简洁列表 ========== */}
        <div id="sample-output" className="mb-8 py-4">
          {/* 简洁列表 */}
          <div className="flex flex-wrap justify-center gap-2 px-4">
            {sampleOutputs.map((item, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10"
              >
                <span className="text-cyan-400 text-sm">●</span>
                <span className="text-slate-300 text-sm">{locale === 'zh' ? item.titleZh : item.titleEn}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ========== Use Cases - 简洁标签 ========== */}
        <div className="mb-8 py-4">
          {/* 简洁标签 */}
          <div className="flex flex-wrap justify-center gap-2 px-4">
            {useCases.map((item, idx) => (
              <div 
                key={idx}
                className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-sm"
              >
                {locale === 'zh' ? item.titleZh : item.titleEn}
              </div>
            ))}
          </div>
        </div>

        {/* ========== Pricing - 简洁 ========== */}
        <div className="mb-12 py-4">
          {/* 双平台分列布局 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto px-4">
            {/* Facebook Platform Column */}
            <div className="border border-white/10 rounded-xl p-4">
              {/* Platform Header - 简洁 */}
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                <span className="text-blue-400 text-sm font-medium">Facebook</span>
              </div>
              
              {/* Route Cards - 简洁 */}
              <div className="space-y-2">
                {PLATFORM_CONFIGS.facebook.routes.map((route) => {
                  const routeKey = `fb_${route.id}`;
                  const deliverables = routeDeliverables[routeKey]?.items || [];
                  
                  return (
                    <div
                      key={route.id}
                      onClick={() => handleRouteClick('facebook', route)}
                      className="group cursor-pointer p-3 rounded-lg border border-white/10 hover:border-cyan-400/30 transition-colors"
                    >
                      {/* Header - 简洁 */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                            {locale === 'zh' ? route.nameZh : route.name}
                          </span>
                          {route.isFree && (
                            <span className="text-xs text-cyan-400">Free</span>
                          )}
                        </div>
                        <span className={`text-sm font-medium ${route.isFree ? 'text-cyan-400' : 'text-slate-300'}`}>
                          {locale === 'zh' ? route.priceTextZh : route.priceText}
                        </span>
                      </div>
                      
                      {/* Deliverables - 简洁 */}
                      <div className="flex flex-wrap gap-1">
                        {deliverables.slice(0, 3).map((item, idx) => (
                          <span key={idx} className="text-xs text-slate-500 px-1.5 py-0.5 bg-white/5 rounded">
                            {locale === 'zh' ? item.zh : item.en}
                          </span>
                        ))}
                      </div>
                      
                      {/* Action */}
                      {route.isFree && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRouteClick('facebook', route);
                          }}
                          disabled={loading}
                          className="mt-2 px-3 py-1 text-xs rounded bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 disabled:opacity-50"
                        >
                          {locale === 'zh' ? '开始' : 'Start'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* TikTok - 简洁 */}
            <div className="flex-1">
              <div className="mb-3">
                <span className="text-sm font-medium text-slate-300">{PLATFORM_CONFIGS.tiktok.name}</span>
                <span className="ml-2 text-xs text-slate-500">{locale === 'zh' ? '内容角度、拒审检查' : 'Content, Rejection'}</span>
              </div>
              
              {/* Route Cards - 简洁 */}
              <div className="space-y-2">
                {PLATFORM_CONFIGS.tiktok.routes.map((route) => {
                  const routeKey = `tiktok_${route.id}`;
                  const deliverables = routeDeliverables[routeKey]?.items || [];
                  
                  return (
                    <div
                      key={route.id}
                      onClick={() => handleRouteClick('tiktok', route)}
                      className="group cursor-pointer p-3 rounded-lg border border-white/10 hover:border-cyan-400/30 transition-colors"
                    >
                      {/* Header - 简洁 */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                            {locale === 'zh' ? route.nameZh : route.name}
                          </span>
                          {route.isFree && (
                            <span className="text-xs text-cyan-400">Free</span>
                          )}
                        </div>
                        <span className={`text-sm font-medium ${route.isFree ? 'text-cyan-400' : 'text-slate-300'}`}>
                          {locale === 'zh' ? route.priceTextZh : route.priceText}
                        </span>
                      </div>
                      
                      {/* Deliverables - 简洁 */}
                      <div className="flex flex-wrap gap-1">
                        {deliverables.slice(0, 3).map((item, idx) => (
                          <span key={idx} className="text-xs text-slate-500 px-1.5 py-0.5 bg-white/5 rounded">
                            {locale === 'zh' ? item.zh : item.en}
                          </span>
                        ))}
                      </div>
                      
                      {/* Action */}
                      {route.isFree && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRouteClick('tiktok', route);
                          }}
                          disabled={loading}
                          className="mt-2 px-3 py-1 text-xs rounded bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 disabled:opacity-50"
                        >
                          {locale === 'zh' ? '开始' : 'Start'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* FAQ - 简洁 */}
        <div className="mb-8 pt-6 border-t border-white/10">
          <h2 className="text-base font-medium text-slate-300 mb-4">{locale === 'zh' ? '常见问题' : 'FAQ'}</h2>
          <div className="space-y-2">
            {faqs.slice(0, 3).map((faq, idx) => (
              <div key={idx} className="text-sm">
                <span className="text-slate-400">{locale === 'zh' ? faq.qZh : faq.qEn}</span>
                <span className="text-slate-500 ml-2">— {locale === 'zh' ? faq.aZh : faq.aEn}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer - 简洁 */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <p className="text-slate-500 text-xs">
            AI Ad Decision Engine for Facebook & TikTok
          </p>
          <p className="text-slate-400 text-xs mt-1">
            {t('footer.support')}: <a href="mailto:leo.tikboost@gmail.com" className="text-cyan-400 hover:text-cyan-300">leo.tikboost@gmail.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
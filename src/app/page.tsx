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

  // 简洁抽象图标组件
  const AbstractIcon = ({ type, className = 'w-5 h-5' }: { type: string; className?: string }) => {
    const iconMap: Record<string, React.ReactNode> = {
      // Sample Output 图标
      diagnosis: (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      ),
      target: (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
        </svg>
      ),
      budget: (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <line x1="7" y1="12" x2="17" y2="12" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
        </svg>
      ),
      creative: (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" fill="currentColor" opacity="0.3" />
        </svg>
      ),
      plan: (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <line x1="8" y1="9" x2="16" y2="9" />
          <line x1="8" y1="12" x2="16" y2="12" />
          <line x1="8" y1="15" x2="12" y2="15" />
        </svg>
      ),
      // Use Cases 图标
      store: (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 9l9-6 9 6" />
          <rect x="3" y="9" width="18" height="12" />
          <rect x="8" y="14" width="8" height="7" />
        </svg>
      ),
      shopify: (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="9" cy="21" r="1" fill="currentColor" />
          <circle cx="20" cy="21" r="1" fill="currentColor" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      ),
      factory: (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="10" width="20" height="10" />
          <polygon points="6,10 6,4 10,4 10,10" />
          <circle cx="8" cy="15" r="1" fill="currentColor" />
          <circle cx="14" cy="15" r="1" fill="currentColor" />
        </svg>
      ),
      launch: (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polygon points="12,2 15,10 12,8 9,10" fill="currentColor" opacity="0.3" />
          <line x1="12" y1="22" x2="12" y2="8" />
          <line x1="8" y1="22" x2="16" y2="22" />
        </svg>
      ),
      person: (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="7" r="4" />
          <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
        </svg>
      ),
    };
    return iconMap[type] || null;
  };

  // 示例诊断报告内容
  const sampleOutputs = [
    { iconType: 'diagnosis', titleEn: 'Campaign Problem Diagnosis', titleZh: '广告问题诊断', descEn: 'Identify why your ads are not converting', descZh: '识别广告为什么不转化' },
    { iconType: 'target', titleEn: 'Audience Targeting Recommendation', titleZh: '受众定向推荐', descEn: 'Find your ideal customer segments', descZh: '找到你的理想客户群体' },
    { iconType: 'budget', titleEn: 'Budget Allocation', titleZh: '预算分配建议', descEn: 'Optimize spend across campaigns', descZh: '优化各广告系列的预算' },
    { iconType: 'creative', titleEn: 'Creative Angle Suggestions', titleZh: '创意角度建议', descEn: 'Improve ad visuals and copy', descZh: '改进广告视觉和文案' },
    { iconType: 'plan', titleEn: '7-Day Optimization Plan', titleZh: '7天优化计划', descEn: 'Step-by-step improvement roadmap', descZh: '逐步改进路线图' },
  ];

  // 适合谁使用
  const useCases = [
    { iconType: 'store', titleEn: 'Local Stores', titleZh: '本地门店', descEn: 'Offline businesses targeting nearby customers', descZh: '面向附近顾客的线下商家' },
    { iconType: 'shopify', titleEn: 'Shopify Sellers', titleZh: 'Shopify卖家', descEn: 'E-commerce stores needing better ROAS', descZh: '需要更好ROAS的电商店铺' },
    { iconType: 'factory', titleEn: 'B2B Manufacturers', titleZh: 'B2B制造商', descEn: 'Factory/wholesale generating leads', descZh: '获取询盘的工厂/批发商' },
    { iconType: 'launch', titleEn: 'New Product Launches', titleZh: '新品上市', descEn: 'Brands launching new products', descZh: '推广新品的品牌方' },
    { iconType: 'person', titleEn: 'Solo Operators', titleZh: '个人运营者', descEn: 'Small brands without a media buyer', descZh: '没有专业投手的小品牌' },
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
        { en: '3 Monthly Diagnosis Credits', zh: '每月3次诊断额度' },
        { en: '3 Creative Review Credits', zh: '每月3条素材审查额度' },
        { en: 'Basic campaign diagnosis', zh: '基础广告诊断' },
        { en: 'Problem identification', zh: '问题识别' },
        { en: 'Config preview', zh: '配置预览' },
      ]
    },
    // Facebook 付费方案
    'fb_local_service': {
      items: [
        { en: '15 Monthly Diagnosis Credits', zh: '每月15次诊断额度' },
        { en: '8 Creative Review Credits', zh: '每月8条素材审查额度' },
        { en: 'Local audience structure', zh: '本地受众结构' },
        { en: 'Campaign objective recommendation', zh: '广告目标推荐' },
        { en: '7-day optimization checklist', zh: '7天优化清单' },
      ]
    },
    'fb_retailer': {
      items: [
        { en: '40 Monthly Diagnosis Credits', zh: '每月40次诊断额度' },
        { en: '25 Creative Review Credits', zh: '每月25条素材审查额度' },
        { en: '3 Deep Attribution Credits', zh: '每月3次深度归因额度' },
        { en: 'Product audience structure', zh: '产品受众结构' },
        { en: 'Retargeting setup', zh: '再营销设置' },
      ]
    },
    'fb_manufacturer': {
      items: [
        { en: '80 Monthly Diagnosis Credits', zh: '每月80次诊断额度' },
        { en: '60 Creative Review Credits', zh: '每月60条素材审查额度' },
        { en: '10 Deep Attribution Credits', zh: '每月10次深度归因额度' },
        { en: 'B2B lead audience structure', zh: 'B2B询盘受众结构' },
        { en: 'Lead form optimization', zh: '表单优化建议' },
        { en: 'Unlimited history', zh: '无限历史记录' },
      ]
    },
    'fb_brand': {
      items: [
        { en: '80 Monthly Diagnosis Credits', zh: '每月80次诊断额度' },
        { en: '60 Creative Review Credits', zh: '每月60条素材审查额度' },
        { en: '10 Deep Attribution Credits', zh: '每月10次深度归因额度' },
        { en: 'Brand audience structure', zh: '品牌受众结构' },
        { en: 'Creative direction', zh: '创意方向建议' },
        { en: 'Unlimited history', zh: '无限历史记录' },
      ]
    },
    // TikTok 免费方案
    'tiktok_rejection_check': {
      items: [
        { en: '3 Monthly Diagnosis Credits', zh: '每月3次诊断额度' },
        { en: '3 Creative Review Credits', zh: '每月3条素材审查额度' },
        { en: 'Free ad diagnosis', zh: '免费广告诊断' },
        { en: 'Rejection risk analysis', zh: '拒审风险分析' },
        { en: 'Compliance check preview', zh: '合规检查预览' },
      ]
    },
    // TikTok 付费方案
    'tiktok_local_service': {
      items: [
        { en: '20 Monthly Diagnosis Credits', zh: '每月20次诊断额度' },
        { en: '10 Creative Review Credits', zh: '每月10条素材审查额度' },
        { en: 'Local audience structure', zh: '本地受众结构' },
        { en: 'Creative angle suggestions', zh: '创意角度建议' },
        { en: '7-day optimization checklist', zh: '7天优化清单' },
      ]
    },
    'tiktok_website_conv': {
      items: [
        { en: '50 Monthly Diagnosis Credits', zh: '每月50次诊断额度' },
        { en: '30 Creative Review Credits', zh: '每月30条素材审查额度' },
        { en: '5 Deep Attribution Credits', zh: '每月5次深度归因额度' },
        { en: 'Website conversion audience', zh: '网站转化受众' },
        { en: 'Landing page optimization', zh: '落地页优化' },
      ]
    },
    'tiktok_brand_awareness': {
      items: [
        { en: '100 Monthly Diagnosis Credits', zh: '每月100次诊断额度' },
        { en: '80 Creative Review Credits', zh: '每月80条素材审查额度' },
        { en: '15 Deep Attribution Credits', zh: '每月15次深度归因额度' },
        { en: 'Brand audience structure', zh: '品牌受众结构' },
        { en: 'Creative direction', zh: '创意方向建议' },
        { en: 'Unlimited history', zh: '无限历史记录' },
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
        <div className="mb-16 py-8 rounded-2xl bg-slate-800/30">
          {/* Section Label */}
          <div className="text-center mb-6">
            <span className="inline-block px-3 py-1 rounded text-xs font-medium tracking-wider uppercase bg-white/5 text-slate-400 border border-white/10">
              {locale === 'zh' ? '工作流程' : 'HOW IT WORKS'}
            </span>
          </div>
          
          <h2 className="text-2xl font-semibold text-white text-center mb-8">
            {locale === 'zh' ? '四步完成优化' : '4 Steps to Optimize'}
          </h2>
          <div className="flex flex-wrap justify-center items-center gap-3 md:gap-6 px-4">
            {engineSteps.map((step, idx) => (
              <div key={step.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 font-bold text-lg md:text-xl">
                    {step.num}
                  </div>
                  <div className="mt-2 text-center">
                    <div className="text-white font-medium text-sm md:text-base">{step.title}</div>
                    <div className="text-slate-400 text-xs md:text-sm">{step.desc}</div>
                  </div>
                </div>
                {idx < engineSteps.length - 1 && (
                  <svg className="w-6 h-6 md:w-8 md:h-8 text-slate-500 mx-2 md:mx-4 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ========== Sample Diagnosis Output ========== */}
        <div id="sample-output" className="mb-16 py-8 rounded-2xl bg-slate-800/50">
          {/* Section Label */}
          <div className="text-center mb-6">
            <span className="inline-block px-3 py-1 rounded text-xs font-medium tracking-wider uppercase bg-white/5 text-slate-400 border border-white/10">
              {locale === 'zh' ? '示例诊断报告' : 'SAMPLE OUTPUT'}
            </span>
          </div>
          
          <h2 className="text-2xl font-semibold text-white text-center mb-4">
            {locale === 'zh' ? '提交后你会得到' : 'What You Will Get'}
          </h2>
          <p className="text-slate-400 text-center mb-8 max-w-2xl mx-auto">
            {locale === 'zh'
              ? '提交广告信息后，你会得到以下诊断结果'
              : 'After submitting your ad info, you will receive the following diagnosis results'}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto px-4">
            {sampleOutputs.map((item, idx) => (
              <div 
                key={idx}
                className="bg-white/[0.04] border border-white/10 rounded-xl p-4 hover:bg-white/[0.07] hover:border-cyan-400/30 transition-all duration-300"
              >
                <div className="mb-2 text-cyan-400">
                  <AbstractIcon type={item.iconType} className="w-6 h-6" />
                </div>
                <h3 className="text-white font-semibold mb-1">
                  {locale === 'zh' ? item.titleZh : item.titleEn}
                </h3>
                <p className="text-slate-400 text-sm">
                  {locale === 'zh' ? item.descZh : item.descEn}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ========== Use Cases ========== */}
        <div className="mb-16 py-8 rounded-2xl bg-slate-800/30">
          {/* Section Label */}
          <div className="text-center mb-6">
            <span className="inline-block px-3 py-1 rounded text-xs font-medium tracking-wider uppercase bg-white/5 text-slate-400 border border-white/10">
              {locale === 'zh' ? '适合谁使用' : 'USE CASES'}
            </span>
          </div>
          
          <h2 className="text-2xl font-semibold text-white text-center mb-4">
            {locale === 'zh' ? '专为商家和运营者打造' : 'Built for Businesses & Operators'}
          </h2>
          <p className="text-slate-400 text-center mb-8 max-w-2xl mx-auto">
            {locale === 'zh'
              ? '没有专业营销团队也能高效投放广告'
              : 'Run paid ads effectively without a full marketing team.'}
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-4xl mx-auto px-4">
            {useCases.map((item, idx) => (
              <div 
                key={idx}
                className="bg-white/[0.04] border border-white/10 rounded-xl p-4 text-center hover:bg-white/[0.07] transition-all duration-300"
              >
                <div className="mb-2 text-cyan-400">
                  <AbstractIcon type={item.iconType} className="w-7 h-7" />
                </div>
                <h3 className="text-white font-semibold text-base mb-1">
                  {locale === 'zh' ? item.titleZh : item.titleEn}
                </h3>
                <p className="text-slate-400 text-sm">
                  {locale === 'zh' ? item.descZh : item.descEn}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ========== Pricing（保留原有双平台线路展示 + 交付内容） ========== */}
        <div className="mb-16 py-8">
          {/* Section Label */}
          <div className="text-center mb-6">
            <span className="inline-block px-3 py-1 rounded text-xs font-medium tracking-wider uppercase bg-white/5 text-slate-400 border border-white/10">
              {locale === 'zh' ? '选择你的方案' : 'PRICING'}
            </span>
          </div>
          
          <h2 className="text-2xl font-semibold text-white text-center mb-2">
            {locale === 'zh' ? '定价方案' : 'Choose Your Plan'}
          </h2>
          <p className="text-slate-400 text-center mb-8 max-w-xl mx-auto">
            {locale === 'zh'
              ? '免费诊断 + 专业方案，按需选择'
              : 'Free diagnosis + Professional plans, choose what fits your needs'}
          </p>
          
          {/* 双平台分列布局 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto px-4">
            {/* Facebook Platform Column */}
            <div className="bg-slate-800/50 rounded-2xl p-6 border-t-2 border-t-blue-500 border-x border-b border-white/10">
              {/* Platform Header */}
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/10">
                <div 
                  className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400"
                  dangerouslySetInnerHTML={{ __html: PLATFORM_CONFIGS.facebook.icon }}
                />
                <div>
                  <h4 className="text-lg font-semibold text-white">
                    {PLATFORM_CONFIGS.facebook.name}
                  </h4>
                  <p className="text-slate-400 text-sm">
                    {locale === 'zh' ? '转化导向、受众定向、预算结构' : 'Conversion-focused, audience targeting, budget structure'}
                  </p>
                </div>
              </div>
              
              {/* Route Cards with Deliverables */}
              <div className="space-y-3">
                {PLATFORM_CONFIGS.facebook.routes.map((route) => {
                  const styles = getRouteStyles(route.color);
                  const routeKey = `fb_${route.id}`;
                  const deliverables = routeDeliverables[routeKey]?.items || [];
                  
                  return (
                    <div
                      key={route.id}
                      onClick={() => handleRouteClick('facebook', route)}
                      className={`group cursor-pointer p-4 rounded-xl border transition-all duration-300 bg-white/[0.04] border-white/10 hover:bg-white/[0.07] hover:border-white/18 ${styles.hoverBorder}`}
                    >
                      {/* Header Row */}
                      <div className="flex items-center gap-4 mb-3">
                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${styles.bg} ${styles.border} group-hover:scale-105 transition-transform`}>
                          <div 
                            className={`w-5 h-5 ${styles.text}`}
                            dangerouslySetInnerHTML={{ __html: route.icon }}
                          />
                        </div>
                        
                        {/* Name & Badge */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h5 className="text-base font-semibold text-white group-hover:text-cyan-300 transition-colors">
                              {locale === 'zh' ? route.nameZh : route.name}
                            </h5>
                            {route.isFree && (
                              <span className="px-2 py-0.5 text-xs bg-cyan-500/20 text-cyan-400 rounded-full">
                                {locale === 'zh' ? '首次使用推荐' : 'Best for first-time users'}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Price */}
                        <div className="text-right">
                          <div className={`text-lg font-bold ${route.isFree ? 'text-cyan-400' : styles.text}`}>
                            {locale === 'zh' ? route.priceTextZh : route.priceText}
                          </div>
                        </div>
                      </div>
                      
                      {/* Deliverables List */}
                      <div className="ml-14 space-y-1">
                        {deliverables.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-blue-300/70">
                            <svg className="w-3 h-3 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {locale === 'zh' ? item.zh : item.en}
                          </div>
                        ))}
                      </div>
                      
                      {/* Action Area */}
                      <div className="mt-3 ml-14">
                        {route.isFree ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRouteClick('facebook', route);
                            }}
                            disabled={loading}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-all bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 disabled:opacity-50"
                          >
                            {locale === 'zh' ? '开始免费诊断' : 'Start Free Diagnosis'}
                          </button>
                        ) : (
                          locale === 'zh' ? (
                            <div className="flex items-center gap-2 text-xs text-blue-300/60">
                              <span className="px-2 py-1 rounded bg-green-500/10 text-green-400">微信支付</span>
                              <span className="text-blue-300/40">/</span>
                              <span className="px-2 py-1 rounded bg-white/5 text-blue-300">Creem订阅</span>
                              <span className="ml-2 text-blue-300/50">→ 点击查看详情</span>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePayment(route);
                              }}
                              disabled={loading}
                              className="px-4 py-2 rounded-lg text-sm font-medium transition-all bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
                            >
                              Subscribe via Creem
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* TikTok Platform Column */}
            <div className="bg-slate-800/50 rounded-2xl p-6 border-t-2 border-t-cyan-500 border-x border-b border-white/10">
              {/* Platform Header */}
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/10">
                <div 
                  className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400"
                  dangerouslySetInnerHTML={{ __html: PLATFORM_CONFIGS.tiktok.icon }}
                />
                <div>
                  <h4 className="text-lg font-semibold text-white">
                    {PLATFORM_CONFIGS.tiktok.name}
                  </h4>
                  <p className="text-slate-400 text-sm">
                    {locale === 'zh' ? '内容角度、拒审检查、素材方向' : 'Content angles, rejection check, creative direction'}
                  </p>
                </div>
              </div>
              
              {/* Route Cards with Deliverables */}
              <div className="space-y-3">
                {PLATFORM_CONFIGS.tiktok.routes.map((route) => {
                  const styles = getRouteStyles(route.color);
                  const routeKey = `tiktok_${route.id}`;
                  const deliverables = routeDeliverables[routeKey]?.items || [];
                  const hasPaymentLink = route.creemLink && route.creemLink.length > 0;
                  const isPaidButNoLink = !route.isFree && !hasPaymentLink;
                  
                  return (
                    <div
                      key={route.id}
                      onClick={() => !isPaidButNoLink && handleRouteClick('tiktok', route)}
                      className={`group ${isPaidButNoLink ? 'opacity-60' : 'cursor-pointer'} p-4 rounded-xl border transition-all duration-300 bg-white/[0.04] border-white/10 hover:bg-white/[0.07] hover:border-white/18 ${styles.hoverBorder}`}
                    >
                      {/* Header Row */}
                      <div className="flex items-center gap-4 mb-3">
                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${styles.bg} ${styles.border} group-hover:scale-105 transition-transform`}>
                          <div 
                            className={`w-5 h-5 ${styles.text}`}
                            dangerouslySetInnerHTML={{ __html: route.icon }}
                          />
                        </div>
                        
                        {/* Name & Badge */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h5 className="text-base font-semibold text-white group-hover:text-cyan-300 transition-colors">
                              {locale === 'zh' ? route.nameZh : route.name}
                            </h5>
                            {route.isFree && (
                              <span className="px-2 py-0.5 text-xs bg-cyan-500/20 text-cyan-400 rounded-full border border-cyan-400/30">
                                {locale === 'zh' ? '首次使用推荐' : 'Best for first-time users'}
                              </span>
                            )}
                            {isPaidButNoLink && (
                              <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded-full">
                                {locale === 'zh' ? '即将上线' : 'Coming Soon'}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Price */}
                        <div className="text-right">
                          <div className={`text-lg font-bold ${route.isFree ? 'text-cyan-400' : styles.text}`}>
                            {locale === 'zh' ? route.priceTextZh : route.priceText}
                          </div>
                        </div>
                      </div>
                      
                      {/* Deliverables List */}
                      <div className="ml-14 space-y-1">
                        {deliverables.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-blue-300/70">
                            <svg className="w-3 h-3 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {locale === 'zh' ? item.zh : item.en}
                          </div>
                        ))}
                      </div>
                      
                      {/* Action Area */}
                      <div className="mt-3 ml-14">
                        {route.isFree ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRouteClick('tiktok', route);
                            }}
                            disabled={loading}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-all bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 disabled:opacity-50"
                          >
                            {locale === 'zh' ? '开始免费诊断' : 'Start Free Diagnosis'}
                          </button>
                        ) : isPaidButNoLink ? (
                          <button
                            disabled
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-all bg-white/10 text-white/50 disabled:opacity-50"
                          >
                            {locale === 'zh' ? '即将上线' : 'Coming Soon'}
                          </button>
                        ) : (
                          locale === 'zh' ? (
                            <div className="flex items-center gap-2 text-xs text-blue-300/60">
                              <span className="px-2 py-1 rounded bg-green-500/10 text-green-400">微信支付</span>
                              <span className="text-blue-300/40">/</span>
                              <span className="px-2 py-1 rounded bg-white/5 text-blue-300">Creem订阅</span>
                              <span className="ml-2 text-blue-300/50">→ 点击查看详情</span>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePayment(route);
                              }}
                              disabled={loading}
                              className="px-4 py-2 rounded-lg text-sm font-medium transition-all bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
                            >
                              Subscribe via Creem
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* 注释 */}
          <p className="text-blue-300/50 text-sm text-center mt-6">
            {locale === 'zh'
              ? '免费方案点击即开始，付费方案支持微信或 Creem 安全支付'
              : 'Free plan starts instantly, subscribe securely via Creem'}
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
        <div className="mb-16 py-8 rounded-2xl bg-slate-800/50">
          {/* Section Label */}
          <div className="text-center mb-6">
            <span className="inline-block px-3 py-1 rounded text-xs font-medium tracking-wider uppercase bg-white/5 text-slate-400 border border-white/10">
              {locale === 'zh' ? '常见问题' : 'FAQ'}
            </span>
          </div>
          
          <h2 className="text-2xl font-semibold text-white text-center mb-8">
            {locale === 'zh' ? '常见问题解答' : 'Frequently Asked Questions'}
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-3 px-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="bg-white/[0.04] border border-white/10 rounded-xl p-4 hover:bg-white/[0.07] transition-all duration-300"
              >
                <h3 className="text-white font-semibold mb-2">
                  {locale === 'zh' ? faq.qZh : faq.qEn}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {locale === 'zh' ? faq.aZh : faq.aEn}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ========== Footer ========== */}
        <div className="mt-20 pt-8 border-t border-white/10 text-center bg-slate-900/80 -mx-4 px-4 pb-8 rounded-b-xl">
          <p className="text-slate-400 text-sm mb-4">
            © 2026 AdsCraft. {locale === 'zh' ? 'AI Ad Decision Engine for Facebook & TikTok' : 'AI Ad Decision Engine for Facebook & TikTok'}
          </p>
          <p className="text-slate-500 text-sm">
            {t('footer.support')}: <a href="mailto:leo.tikboost@gmail.com" className="text-cyan-400 hover:text-cyan-300 transition-colors">leo.tikboost@gmail.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
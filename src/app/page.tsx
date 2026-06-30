'use client';

import { useI18n } from '@/lib/i18n-context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { tiktokPixel } from '@/lib/tiktok-pixel';
import { PLATFORM_CONFIGS, PlatformId, PlatformRoute } from '@/lib/platforms/registry';
import { motion, useInView } from 'framer-motion';

// 订阅状态类型
interface SubscriptionStatus {
  route: string;
  status: string;
}

// Hero 动态模拟组件
function HeroSimulation() {
  const { locale } = useI18n();
  const [phase, setPhase] = useState<'facebook' | 'tiktok' | 'google' | 'pause'>('facebook');
  const [step, setStep] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setStep(s => {
        if (phase === 'facebook') {
          if (s >= 4) {
            setPhase('tiktok');
            return 0;
          }
          return s + 1;
        } else if (phase === 'tiktok') {
          if (s >= 4) {
            setPhase('google');
            return 0;
          }
          return s + 1;
        } else if (phase === 'google') {
          if (s >= 6) {
            setPhase('pause');
            return 0;
          }
          return s + 1;
        } else {
          setPhase('facebook');
          return 0;
        }
      });
    }, 500);
    return () => clearInterval(timer);
  }, [phase]);

  const facebookSteps = [
    { text: locale === 'zh' ? '截图已上传' : 'Screenshot Uploaded', done: step >= 1 || phase !== 'facebook' },
    { text: locale === 'zh' ? '读取广告系列' : 'Reading Campaign', done: step >= 2 || phase !== 'facebook' },
    { text: locale === 'zh' ? '检查指标' : 'Checking Metrics', done: step >= 3 || phase !== 'facebook' },
    { text: locale === 'zh' ? '生成报告' : 'Building Report', done: step >= 4 || phase !== 'facebook' },
  ];

  const tiktokSteps = [
    { text: locale === 'zh' ? '合规检查' : 'Compliance', done: step >= 1 || phase === 'pause' || phase === 'google' },
    { text: locale === 'zh' ? '素材审查' : 'Creative', done: step >= 2 || phase === 'pause' || phase === 'google' },
    { text: locale === 'zh' ? '落地页检查' : 'Landing Page', done: step >= 3 || phase === 'pause' || phase === 'google' },
    { text: locale === 'zh' ? '追踪验证' : 'Tracking', done: step >= 4 || phase === 'pause' || phase === 'google' },
  ];

  const googleSteps = [
    { text: locale === 'zh' ? '政策合规检查' : 'Compliance', done: step >= 1 || phase === 'pause' },
    { text: locale === 'zh' ? '广告素材审查' : 'Creative', done: step >= 2 || phase === 'pause' },
    { text: locale === 'zh' ? '落地页检查' : 'Landing Page', done: step >= 3 || phase === 'pause' },
    { text: locale === 'zh' ? '转化追踪验证' : 'Tracking', done: step >= 4 || phase === 'pause' },
    { text: locale === 'zh' ? '质量得分分析' : 'Quality Score', done: step >= 5 || phase === 'pause' },
    { text: locale === 'zh' ? '出价策略优化' : 'Bid Strategy', done: step >= 6 || phase === 'pause' },
  ];

  const showFacebook = phase === 'facebook' || phase === 'pause';
  const showTiktok = phase === 'tiktok' || phase === 'pause' || phase === 'google';
  const showGoogle = phase === 'google' || phase === 'pause';

  return (
    <div className="space-y-4">
      {/* Facebook Section */}
      <motion.div 
        animate={{ opacity: showFacebook ? 1 : 0.3 }}
        transition={{ duration: 0.3 }}
        className="rounded-xl border border-white/10 bg-[#101827] p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 overflow-hidden flex-shrink-0" dangerouslySetInnerHTML={{ __html: PLATFORM_CONFIGS.facebook.icon.replace('w-10 h-10', 'w-5 h-5') }} />
          <span className="text-sm font-medium text-white/80">Facebook</span>
        </div>
        <div className="space-y-2">
          {facebookSteps.map((s, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: s.done ? 1 : 0.3, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex items-center gap-2"
            >
              {s.done ? (
                <motion.svg 
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="w-4 h-4 text-green-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </motion.svg>
              ) : (
                <div className="w-4 h-4 rounded-full border border-white/20" />
              )}
              <span className="text-sm text-white/70">{s.text}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* TikTok Section */}
      <motion.div 
        animate={{ opacity: showTiktok ? 1 : 0.3 }}
        transition={{ duration: 0.3 }}
        className="rounded-xl border border-white/10 bg-[#101827] p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 overflow-hidden flex-shrink-0" dangerouslySetInnerHTML={{ __html: PLATFORM_CONFIGS.tiktok.icon.replace('w-10 h-10', 'w-5 h-5') }} />
          <span className="text-sm font-medium text-white/80">{locale === 'zh' ? 'TikTok 6步审查' : 'TikTok 6-Step Audit'}</span>
        </div>
        <div className="space-y-2">
          {tiktokSteps.map((s, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: s.done ? 1 : 0.3, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex items-center gap-2"
            >
              {s.done ? (
                <motion.svg 
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="w-4 h-4 text-green-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </motion.svg>
              ) : (
                <div className="w-4 h-4 rounded-full border border-white/20" />
              )}
              <span className="text-sm text-white/70">{s.text}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Google Ads Section */}
      <motion.div 
        animate={{ opacity: showGoogle ? 1 : 0.3 }}
        transition={{ duration: 0.3 }}
        className="rounded-xl border border-white/10 bg-[#101827] p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 overflow-hidden flex-shrink-0" dangerouslySetInnerHTML={{ __html: PLATFORM_CONFIGS.google.icon.replace('w-10 h-10', 'w-5 h-5') }} />
          <span className="text-sm font-medium text-white/80">{locale === 'zh' ? 'Google Ads 6步审查' : 'Google Ads 6-Step Audit'}</span>
        </div>
        <div className="space-y-2">
          {googleSteps.map((s, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: s.done ? 1 : 0.3, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex items-center gap-2"
            >
              {s.done ? (
                <motion.svg 
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="w-4 h-4 text-green-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </motion.svg>
              ) : (
                <div className="w-4 h-4 rounded-full border border-white/20" />
              )}
              <span className="text-sm text-white/70">{s.text}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// 分数动画组件
function AnimatedScore({ target, duration = 2 }: { target: number; duration?: number }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    
    let start = 0;
    const increment = target / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setValue(target);
        clearInterval(timer);
      } else {
        setValue(Math.floor(start));
      }
    }, 1000 / 60);
    
    return () => clearInterval(timer);
  }, [isInView, target, duration]);

  return <span ref={ref}>{value}</span>;
}

// 进度条动画组件
function AnimatedBar({ value, color }: { value: number; color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="h-2 rounded-full bg-white/10 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={isInView ? { width: `${value}%` } : {}}
        transition={{ duration: 2, ease: "easeOut" }}
        className={`h-full rounded-full ${color}`}
      />
    </div>
  );
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
    } else {
      setSelectedRoute({ platform: 'facebook', route });
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

  // 处理免费诊断按钮点击
  const handleFreeDiagnosis = (platform: 'facebook' | 'tiktok' | 'google') => {
    tiktokPixel.track('StartFreeDiagnosis');
    if (platform === 'tiktok') {
      handleAuthRequiredAction('/rejection-check');
    } else if (platform === 'google') {
      // Google 跳转截图分析页面
      handleAuthRequiredAction('/google-review');
    } else {
      // Facebook 跳转截图分析页面
      handleAuthRequiredAction('/dashboard/analysis');
    }
  };

  // FAQ 数据
  const faqs = [
    {
      qEn: 'What does AdsCraft analyze?',
      qZh: 'AdsCraft 分析什么？',
      aEn: 'AdsCraft reviews your Facebook or TikTok ad campaigns — including campaign structure, targeting, creative assets, landing pages, and tracking setup.',
      aZh: 'AdsCraft 审查您的 Facebook 或 TikTok 广告系列 — 包括广告结构、受众定向、创意素材、落地页和追踪设置。',
    },
    {
      qEn: 'How does Facebook screenshot analysis work?',
      qZh: 'Facebook 截图分析如何工作？',
      aEn: 'Upload screenshots of your campaign. Our system extracts campaign structure, metrics, and targeting information automatically, then generates a review report.',
      aZh: '上传您的广告系列截图。我们的系统自动提取广告结构、指标和受众信息，然后生成审查报告。',
    },
    {
      qEn: 'How is TikTok different from Facebook?',
      qZh: 'TikTok 与 Facebook 有何不同？',
      aEn: 'TikTok uses a guided audit format — you answer structured questions about your campaign, and AdsCraft applies TikTok-specific review rules across 4 layers: Compliance, Risk, AI, and Validation.',
      aZh: 'TikTok 使用引导式审查格式 — 您回答关于广告系列的结构化问题，AdsCraft 应用 TikTok 特定的审查规则，涵盖 4 个层级：合规、风险、AI 和验证。',
    },
    {
      qEn: 'Is there a free plan?',
      qZh: '有免费方案吗？',
      aEn: 'Yes. You can start with a free diagnosis. Upgrade when you need deeper recommendations and export features.',
      aZh: '是的。您可以从免费诊断开始。当您需要更深入的推荐和导出功能时再升级。',
    },
    {
      qEn: 'Can I use AdsCraft before launching my ads?',
      qZh: '我可以在投放广告前使用 AdsCraft 吗？',
      aEn: 'Yes — that\'s the whole point. Review your campaign setup before spending budget, so you can fix issues before they cost you money.',
      aZh: '是的 — 这正是重点。在花费预算之前审查您的广告设置，这样您可以在问题造成损失之前修复它们。',
    },
    {
      qEn: 'What platforms are supported?',
      qZh: '支持哪些平台？',
      aEn: 'Currently Facebook and TikTok. Google Ads is coming soon.',
      aZh: '目前支持 Facebook 和 TikTok。Google Ads 即将推出。',
    },
  ];

  return (
    <div className="min-h-screen bg-[#08111F]">
      {/* Hero 渐变背景 */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full bg-[#00D4FF] opacity-[0.03] blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* ========== 第一屏：Hero ========== */}
      <section className="relative z-10 max-w-[1200px] mx-auto px-6 pt-24 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* 左侧文案 */}
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#F8FAFC] leading-tight mb-6"
            >
              {locale === 'zh' 
                ? 'Your Ads, Reviewed.' 
                : 'Your Ads, Reviewed.'}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg md:text-xl text-[#94A3B8] mb-4 leading-relaxed"
            >
              {locale === 'zh'
                ? '多平台广告审查，支持 Facebook、TikTok 和 Google Ads。上传截图，几分钟内获取诊断和行动计划。'
                : 'Multi-platform ad review for Facebook, TikTok & Google Ads. Upload a screenshot, get diagnosis and action plan in minutes.'}
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-sm text-[#64748B] mb-8"
            >
              {locale === 'zh'
                ? '支持 Facebook、TikTok 和 Google Ads 截图。'
                : 'Works with Facebook, TikTok & Google Ads screenshots.'}
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-wrap gap-4"
            >
              <button
                onClick={() => {
                  const platformSection = document.getElementById('platform-entry');
                  platformSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                disabled={loading}
                className="px-6 py-3 bg-[#00D4FF] text-[#08111F] font-semibold rounded-lg hover:bg-[#35E1FF] transition-all disabled:opacity-50"
              >
                {locale === 'zh' ? '开始免费审查' : 'Start Free Review'}
              </button>
            </motion.div>
          </div>

          {/* 右侧产品模拟 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <HeroSimulation />
          </motion.div>
        </div>
      </section>

      {/* ========== 第二屏：How AdsCraft Works ========== */}
      <section id="how-it-works" className="relative z-10 max-w-[1200px] mx-auto px-6 py-24">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-[#F8FAFC] text-center mb-16"
        >
          {locale === 'zh' ? 'AdsCraft 如何工作' : 'How AdsCraft Works'}
        </motion.h2>

        {/* 流程图 */}
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8 mb-12">
          {[
            { icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>, label: locale === 'zh' ? '上传截图' : 'Upload Screenshot', desc: locale === 'zh' ? '上传您的 Facebook、TikTok 或 Google Ads 截图' : 'Upload your Facebook, TikTok, or Google Ads screenshot' },
            { icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>, label: locale === 'zh' ? '自动分析' : 'Auto Analysis', desc: locale === 'zh' ? 'AI 读取您的广告数据并识别问题' : 'AI reads your ad data and identifies issues' },
            { icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>, label: locale === 'zh' ? '获取诊断' : 'Get Diagnosis', desc: locale === 'zh' ? '了解哪些有效、哪些无效以及原因' : 'See what\'s working, what\'s not, and why' },
            { icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>, label: locale === 'zh' ? '行动计划' : 'Action Plan', desc: locale === 'zh' ? '获取提升效果的具体建议' : 'Get specific recommendations to improve performance' },
            { icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>, label: locale === 'zh' ? '导出分享' : 'Export & Share', desc: locale === 'zh' ? '下载 PDF/PPT 或通过邮件发送报告给团队' : 'Download PDF/PPT or email report to your team' },
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative"
            >
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl bg-[#101827] border border-white/10 flex flex-col items-center justify-center hover:border-[#00D4FF]/50 transition-all">
                <div className="text-[#00D4FF] mb-2">{step.icon}</div>
                <span className="text-sm md:text-base text-white/80 font-medium">{step.label}</span>
              </div>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-2 bg-[#101827] border border-white/10 rounded-lg text-sm text-white/70 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {step.desc}
              </div>
              {/* Arrow */}
              {i < 4 && (
                <svg className="hidden md:block absolute top-1/2 -right-6 w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </motion.div>
          ))}
        </div>

        <p className="text-center text-[#94A3B8] max-w-2xl mx-auto">
          {locale === 'zh'
            ? '上传您的广告截图，获取即时诊断和可执行的建议。'
            : 'Upload your ad screenshot, get instant diagnosis and actionable insights.'}
        </p>
      </section>

      {/* ========== 第三屏：What You Get ========== */}
      <section className="relative z-10 max-w-[1200px] mx-auto px-6 py-24">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-[#F8FAFC] text-center mb-16"
        >
          {locale === 'zh' ? '您将获得' : 'What You Get'}
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
              title: locale === 'zh' ? '诊断' : 'Diagnosis',
              desc: locale === 'zh' ? '您的广告有什么问题？获取清晰的问题诊断 — 低 CTR、高 CPC、转化率差。' : 'What\'s wrong with your ads? Get clear diagnosis of issues — low CTR, high CPC, poor conversion rate.'
            },
            {
              icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
              title: locale === 'zh' ? '趋势' : 'Trends',
              desc: locale === 'zh' ? '您的指标如何变化？将当前表现与历史时期进行比较。' : 'How are your metrics changing? Compare current performance with previous periods.'
            },
            {
              icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
              title: locale === 'zh' ? '行动计划' : 'Action Plan',
              desc: locale === 'zh' ? '下一步该做什么？获取具体建议 — 优化落地页、调整定位、更换素材。' : 'What should you do next? Get specific recommendations — optimize landing page, adjust targeting, change creative.'
            },
            {
              icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
              title: locale === 'zh' ? '证据' : 'Evidence',
              desc: locale === 'zh' ? '为什么信任这个诊断？每个洞察都有从广告截图中提取的数据支持。没有猜测。' : 'Why trust this diagnosis? Every insight is backed by data extracted from your ad screenshot. No guessing.'
            },
            {
              icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
              title: locale === 'zh' ? '导出' : 'Export',
              desc: locale === 'zh' ? '与团队分享。下载 PDF 或 PPT 报告。专业格式，可直接用于演示。' : 'Share with your team. Download PDF or PPT report. Professional format, ready for presentations.'
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-xl bg-[#101827] border border-white/10 hover:border-[#00D4FF]/30 transition-all"
            >
              <div className="text-[#00D4FF] mb-4">{item.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-[#94A3B8]">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========== 第四屏：Why AdsCraft Is Different ========== */}
      <section className="relative z-10 max-w-[1200px] mx-auto px-6 py-24">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-[#F8FAFC] text-center mb-16"
        >
          {locale === 'zh' ? '为什么选择 AdsCraft' : 'Why AdsCraft Is Different'}
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
              title: locale === 'zh' ? '基于证据，非 AI 猜测' : 'Evidence-Based, Not AI Guesswork',
              desc: locale === 'zh' ? '每个诊断都有实际数据支持。AI 只负责解释 — 不会编造数字。' : 'Every diagnosis is backed by actual data. AI only explains — it doesn\'t make up numbers.'
            },
            {
              icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
              title: locale === 'zh' ? '多平台，统一标准' : 'Multi-Platform, One Standard',
              desc: locale === 'zh' ? '支持 Facebook、TikTok 和 Google Ads。标准化的审查流程。' : 'Works with Facebook, TikTok, and Google Ads. Same standardized review process.'
            },
            {
              icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
              title: locale === 'zh' ? '标准化审查流程' : 'Standardized Review Process',
              desc: locale === 'zh' ? '指标分析 → 规则检查 → 分数计算 → AI 解释。' : 'Metric Analysis → Rule Checking → Score Calculation → AI Explanation.'
            },
            {
              icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
              title: locale === 'zh' ? '可执行，非仅提供信息' : 'Actionable, Not Just Informational',
              desc: locale === 'zh' ? '不只是获取报告 — 获取清晰的行动计划。' : 'Don\'t just get a report — get a clear action plan.'
            },
            {
              icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
              title: locale === 'zh' ? '专业导出' : 'Professional Export',
              desc: locale === 'zh' ? '下载 PDF 或 PPT。专业格式，可直接用于演示。' : 'Download PDF or PPT. Professional format, ready for presentations.'
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-xl bg-[#101827] border border-white/10 hover:border-[#00D4FF]/30 transition-all"
            >
              <div className="text-[#00D4FF] mb-4">{item.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-[#94A3B8]">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========== 第五屏：Platform Entry ========== */}
      <section id="platform-entry" className="relative z-10 max-w-[1200px] mx-auto px-6 py-24">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-[#F8FAFC] text-center mb-16"
        >
          {locale === 'zh' ? '选择您的平台' : 'Choose Your Platform'}
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Facebook */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-xl bg-[#101827] border border-white/8 hover:border-[#1877F2]/30 transition-all text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#1877F2]/10 flex items-center justify-center overflow-hidden">
              <div className="w-10 h-10" dangerouslySetInnerHTML={{ __html: PLATFORM_CONFIGS.facebook.icon }} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Facebook</h3>
            <p className="text-[#94A3B8] text-sm mb-6">
              {locale === 'zh' 
                ? '上传广告截图。获取完整分析报告。' 
                : 'Upload campaign screenshots. Get a full analysis report.'}
            </p>
            <button
              onClick={() => handleFreeDiagnosis('facebook')}
              disabled={loading}
              className="px-6 py-2 bg-[#00D4FF] text-[#08111F] font-semibold rounded-lg hover:bg-[#35E1FF] transition-all disabled:opacity-50"
            >
              {locale === 'zh' ? '分析 Facebook' : 'Analyze Facebook'}
            </button>
          </motion.div>

          {/* TikTok */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="p-8 rounded-xl bg-[#101827] border border-white/8 hover:border-[#FE2C55]/30 transition-all text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center overflow-hidden">
              <div className="w-10 h-10" dangerouslySetInnerHTML={{ __html: PLATFORM_CONFIGS.tiktok.icon }} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">TikTok</h3>
            <p className="text-[#94A3B8] text-sm mb-6">
              {locale === 'zh'
                ? '完成引导式广告审查。获取平台特定推荐。'
                : 'Complete a guided campaign audit. Get platform-specific recommendations.'}
            </p>
            <button
              onClick={() => handleFreeDiagnosis('tiktok')}
              disabled={loading}
              className="px-6 py-2 bg-[#00D4FF] text-[#08111F] font-semibold rounded-lg hover:bg-[#35E1FF] transition-all disabled:opacity-50"
            >
              {locale === 'zh' ? '分析 TikTok' : 'Analyze TikTok'}
            </button>
          </motion.div>

          {/* Google Ads */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="p-8 rounded-xl bg-[#101827] border border-white/8 hover:border-[#4285F4]/30 transition-all text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#4285F4]/10 flex items-center justify-center overflow-hidden">
              <div className="w-10 h-10" dangerouslySetInnerHTML={{ __html: PLATFORM_CONFIGS.google.icon }} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Google Ads</h3>
            <p className="text-[#94A3B8] text-sm mb-6">
              {locale === 'zh' 
                ? '上传广告截图。获取完整分析报告。' 
                : 'Upload campaign screenshots. Get a full analysis report.'}
            </p>
            <button
              onClick={() => handleFreeDiagnosis('google')}
              disabled={loading}
              className="px-6 py-2 bg-[#00D4FF] text-[#08111F] font-semibold rounded-lg hover:bg-[#35E1FF] transition-all disabled:opacity-50"
            >
              {locale === 'zh' ? '分析 Google' : 'Analyze Google'}
            </button>
          </motion.div>
        </div>
      </section>

      {/* ========== 第六屏：Everything You Need ========== */}
      <section className="relative z-10 max-w-[1200px] mx-auto px-6 py-24">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-[#F8FAFC] text-center mb-16"
        >
          {locale === 'zh' ? '您所需的一切' : 'Everything You Need'}
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {[
            {
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
              title: locale === 'zh' ? '广告诊断' : 'Ad Diagnosis',
              desc: locale === 'zh' ? '识别问题' : 'Identify issues',
            },
            {
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
              title: locale === 'zh' ? '趋势分析' : 'Trend Analysis',
              desc: locale === 'zh' ? '比较不同时期的表现' : 'Compare performance over time',
            },
            {
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
              title: locale === 'zh' ? '行动计划' : 'Action Plan',
              desc: locale === 'zh' ? '具体建议' : 'Specific recommendations',
            },
            {
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
              title: locale === 'zh' ? '多平台支持' : 'Multi-Platform Support',
              desc: locale === 'zh' ? 'FB / TikTok / Google' : 'FB / TikTok / Google',
            },
            {
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
              title: locale === 'zh' ? '专业报告' : 'Professional Reports',
              desc: locale === 'zh' ? 'PDF / PPT 导出' : 'PDF / PPT export',
            },
            {
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
              title: locale === 'zh' ? '截图上传' : 'Screenshot Upload',
              desc: locale === 'zh' ? '无需 API' : 'No API required',
            },
            {
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
              title: locale === 'zh' ? '历史追踪' : 'History Tracking',
              desc: locale === 'zh' ? '保存并追踪进度' : 'Save and track progress',
            },
            {
              icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
              title: locale === 'zh' ? '快速上手' : 'Quick Start',
              desc: locale === 'zh' ? '注册后即可开始分析' : 'Sign up and start analyzing',
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-[#00D4FF]/10 flex items-center justify-center text-[#00D4FF]">
                {feature.icon}
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-[#94A3B8] text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========== 第七屏：Pricing ========== */}
      <section className="relative z-10 max-w-[1200px] mx-auto px-6 py-24">
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-[#94A3B8] mb-12"
        >
          {locale === 'zh' 
            ? '免费开始。需要更深推荐时再升级。' 
            : 'Start for free. Upgrade when you need deeper recommendations.'}
        </motion.p>

        {/* 这里保留原有的 Pricing 逻辑，但简化展示 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Facebook */}
          <div className="rounded-xl bg-[#101827] border border-white/8 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8" dangerouslySetInnerHTML={{ __html: PLATFORM_CONFIGS.facebook.icon }} />
              <h3 className="text-lg font-semibold text-white">Facebook</h3>
            </div>
            <div className="space-y-3">
              {PLATFORM_CONFIGS.facebook.routes.map((route) => (
                <div
                  key={route.id}
                  onClick={() => handleRouteClick('facebook', route)}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/8 hover:border-white/20 cursor-pointer transition-all"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-medium">
                        {locale === 'zh' ? route.nameZh : route.name}
                      </span>
                      {route.isFree && (
                        <span className="px-2 py-0.5 text-xs bg-[#00D4FF]/20 text-[#00D4FF] rounded">
                          {locale === 'zh' ? '免费' : 'Free'}
                        </span>
                      )}
                      {route.screenshotLimit && (
                        <span className="px-2 py-0.5 text-xs bg-white/10 text-[#94A3B8] rounded">
                          {route.screenshotLimit}{locale === 'zh' ? '次截图/月' : ' screenshots/mo'}
                        </span>
                      )}
                    </div>
                    <p className="text-[#94A3B8] text-xs mt-1">
                      {locale === 'zh' ? route.descriptionZh : route.description}
                    </p>
                  </div>
                  <span className="text-[#94A3B8] text-sm ml-4">
                    {locale === 'zh' ? route.priceTextZh : route.priceText}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* TikTok */}
          <div className="rounded-xl bg-[#101827] border border-white/8 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8" dangerouslySetInnerHTML={{ __html: PLATFORM_CONFIGS.tiktok.icon }} />
              <h3 className="text-lg font-semibold text-white">TikTok</h3>
            </div>
            <div className="space-y-3">
              {PLATFORM_CONFIGS.tiktok.routes.map((route) => (
                <div
                  key={route.id}
                  onClick={() => handleRouteClick('tiktok', route)}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/8 hover:border-white/20 cursor-pointer transition-all"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-medium">
                        {locale === 'zh' ? route.nameZh : route.name}
                      </span>
                      {route.isFree && (
                        <span className="px-2 py-0.5 text-xs bg-[#00D4FF]/20 text-[#00D4FF] rounded">
                          {locale === 'zh' ? '免费' : 'Free'}
                        </span>
                      )}
                      {route.screenshotLimit && (
                        <span className="px-2 py-0.5 text-xs bg-white/10 text-[#94A3B8] rounded">
                          {route.screenshotLimit}{locale === 'zh' ? '次截图/月' : ' screenshots/mo'}
                        </span>
                      )}
                    </div>
                    <p className="text-[#94A3B8] text-xs mt-1">
                      {locale === 'zh' ? route.descriptionZh : route.description}
                    </p>
                  </div>
                  <span className="text-[#94A3B8] text-sm ml-4">
                    {locale === 'zh' ? route.priceTextZh : route.priceText}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Selected Route Action Button */}
      {selectedRoute && !selectedRoute.route.creemLink && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={() => handleAuthRequiredAction(`/questions?route=${selectedRoute.route.id}&platform=${selectedRoute.platform}`)}
            disabled={loading}
            className="px-8 py-3 bg-[#00D4FF] text-[#08111F] font-semibold rounded-lg shadow-lg hover:bg-[#35E1FF] transition-all disabled:opacity-50"
          >
            {loading ? 'Loading...' : t('home.startNow')}
          </button>
        </div>
      )}
    </div>
  );
}

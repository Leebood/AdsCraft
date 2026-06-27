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
  const [step, setStep] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setStep(s => (s + 1) % 12);
    }, 800);
    return () => clearInterval(timer);
  }, []);

  const facebookSteps = [
    { text: 'Screenshot Uploaded', done: step >= 1 },
    { text: 'Reading Campaign', done: step >= 2 },
    { text: 'Checking Metrics', done: step >= 3 },
    { text: 'Building Report', done: step >= 4 },
  ];

  const tiktokSteps = [
    { text: 'Compliance', done: step >= 6 },
    { text: 'Creative', done: step >= 7 },
    { text: 'Landing Page', done: step >= 8 },
    { text: 'Tracking', done: step >= 9 },
  ];

  return (
    <div className="space-y-4">
      {/* Facebook Section */}
      <div className="rounded-xl border border-white/10 bg-[#101827] p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5" dangerouslySetInnerHTML={{ __html: PLATFORM_CONFIGS.facebook.icon }} />
          <span className="text-sm font-medium text-white/80">Facebook</span>
        </div>
        <div className="space-y-2">
          {facebookSteps.map((s, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: s.done ? 1 : 0.3, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2"
            >
              {s.done ? (
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <div className="w-4 h-4 rounded-full border border-white/20" />
              )}
              <span className="text-sm text-white/70">{s.text}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* TikTok Section */}
      <div className="rounded-xl border border-white/10 bg-[#101827] p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5" dangerouslySetInnerHTML={{ __html: PLATFORM_CONFIGS.tiktok.icon }} />
          <span className="text-sm font-medium text-white/80">TikTok 6-Step Audit</span>
        </div>
        <div className="space-y-2">
          {tiktokSteps.map((s, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: s.done ? 1 : 0.3, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2"
            >
              {s.done ? (
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <div className="w-4 h-4 rounded-full border border-white/20" />
              )}
              <span className="text-sm text-white/70">{s.text}</span>
            </motion.div>
          ))}
        </div>
      </div>
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
  const handleFreeDiagnosis = (platform: 'facebook' | 'tiktok') => {
    tiktokPixel.track('StartFreeDiagnosis');
    if (platform === 'tiktok') {
      handleAuthRequiredAction('/rejection-check');
    } else {
      handleAuthRequiredAction('/questions?route=free&platform=facebook');
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
                ? 'Launch Better Ads Before Spending Your Budget.' 
                : 'Launch Better Ads Before Spending Your Budget.'}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg md:text-xl text-[#94A3B8] mb-8 leading-relaxed"
            >
              {locale === 'zh'
                ? 'AdsCraft 在您投放前审查 Facebook 和 TikTok 广告 — 结合 AI 分析、平台特定规则和技术验证。'
                : 'AdsCraft reviews your Facebook and TikTok campaigns before you launch—combining AI analysis, platform-specific rules, and technical validation.'}
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-wrap gap-4"
            >
              <button
                onClick={() => handleFreeDiagnosis('facebook')}
                disabled={loading}
                className="px-6 py-3 bg-[#00D4FF] text-[#08111F] font-semibold rounded-lg hover:bg-[#35E1FF] transition-all disabled:opacity-50"
              >
                {locale === 'zh' ? '开始免费诊断' : 'Start Free Diagnosis'}
              </button>
              <button
                onClick={() => {
                  const demoSection = document.getElementById('how-it-works');
                  demoSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3 border border-[#00D4FF] text-[#00D4FF] font-semibold rounded-lg hover:bg-[#00D4FF]/10 transition-all"
              >
                {locale === 'zh' ? '观看演示' : 'Watch Demo'}
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
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 mb-8">
          {[
            { icon: '📷', label: locale === 'zh' ? '广告系列' : 'Campaign', desc: locale === 'zh' ? '上传截图或完成引导审查' : 'Upload screenshots or complete a guided audit' },
            { icon: '📋', label: locale === 'zh' ? '平台规则' : 'Platform Rules', desc: locale === 'zh' ? '检查 Facebook 和 TikTok 广告政策' : 'Check against Facebook and TikTok advertising policies' },
            { icon: '🤖', label: locale === 'zh' ? 'AI 审查' : 'AI Review', desc: locale === 'zh' ? 'AI 分析广告结构和指标' : 'AI reasoning analyzes your campaign structure and metrics' },
            { icon: '✅', label: locale === 'zh' ? '技术验证' : 'Technical Validation', desc: locale === 'zh' ? '验证追踪、像素和落地页健康' : 'Verify tracking, pixels, and landing page health' },
            { icon: '⚙️', label: locale === 'zh' ? '优化引擎' : 'Optimization Engine', desc: locale === 'zh' ? '生成优先级建议' : 'Generate prioritized recommendations' },
            { icon: '📊', label: locale === 'zh' ? '行动计划' : 'Action Plan', desc: locale === 'zh' ? '获取具体下一步行动' : 'Get specific next actions, not just problems' },
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-[#101827] border border-white/10 flex flex-col items-center justify-center hover:border-[#00D4FF]/50 transition-all">
                <span className="text-2xl md:text-3xl mb-1">{step.icon}</span>
                <span className="text-xs md:text-sm text-white/80 font-medium">{step.label}</span>
              </div>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#101827] border border-white/10 rounded-lg text-xs text-white/70 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {step.desc}
              </div>
              {/* Arrow */}
              {i < 5 && (
                <svg className="hidden md:block absolute top-1/2 -right-4 w-6 h-6 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </motion.div>
          ))}
        </div>

        <p className="text-center text-[#94A3B8] max-w-2xl mx-auto">
          {locale === 'zh'
            ? '您的广告系列在生成报告前会经过 4 层审查 — 平台规则、AI 推理、技术检查和优化逻辑。'
            : 'Your campaign goes through 4 layers of review — platform rules, AI reasoning, technical checks, and optimization logic — before you see the report.'}
        </p>
      </section>

      {/* ========== 第三屏：Sample Report ========== */}
      <section className="relative z-10 max-w-[1200px] mx-auto px-6 py-24">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-[#F8FAFC] text-center mb-16"
        >
          {locale === 'zh' ? '您将获得' : 'What You Get'}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto rounded-xl bg-[#101827] border border-white/10 overflow-hidden"
        >
          {/* Report Header */}
          <div className="p-6 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Campaign Review</h3>
            <div className="flex items-center gap-4">
              <span className="text-[#94A3B8]">Overall Score:</span>
              <span className="text-3xl font-bold text-[#3B82F6]">
                <AnimatedScore target={78} />
                <span className="text-[#94A3B8] text-lg">/100</span>
              </span>
            </div>
          </div>

          {/* Score Bars */}
          <div className="p-6 space-y-4 border-b border-white/10">
            {[
              { label: locale === 'zh' ? '合规性' : 'Compliance', value: 92, color: 'bg-green-500' },
              { label: locale === 'zh' ? '创意' : 'Creative', value: 74, color: 'bg-blue-500' },
              { label: locale === 'zh' ? '落地页' : 'Landing Page', value: 68, color: 'bg-orange-500' },
              { label: locale === 'zh' ? '追踪' : 'Tracking', value: 81, color: 'bg-blue-500' },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-white/80">{item.label}</span>
                  <span className="text-sm text-white/60"><AnimatedScore target={item.value} /></span>
                </div>
                <AnimatedBar value={item.value} color={item.color} />
              </div>
            ))}
          </div>

          {/* Next Actions */}
          <div className="p-6">
            <h4 className="text-sm font-semibold text-white mb-4">Next Actions</h4>
            <div className="space-y-3">
              {[
                locale === 'zh' ? '修复结账页面的像素触发' : 'Fix pixel firing on checkout page',
                locale === 'zh' ? '降低频率 — 当前 4.2x' : 'Reduce frequency — currently 4.2x',
                locale === 'zh' ? '为所有广告链接添加 UTM 参数' : 'Add UTM parameters to all ad links',
              ].map((action, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.3 }}
                  className="flex items-start gap-3"
                >
                  <span className="text-[#00D4FF] font-medium">{i + 1}</span>
                  <span className="text-sm text-white/70">{action}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {[
            {
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ),
              title: locale === 'zh' ? 'Facebook 截图分析' : 'Facebook Screenshot Analysis',
              desc: locale === 'zh' 
                ? '上传广告截图。系统自动提取结构、指标和受众 — 无需手动输入数据。'
                : 'Upload your campaign screenshots. System extracts structure, metrics, and targeting automatically — no manual data entry.',
            },
            {
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              ),
              title: locale === 'zh' ? 'TikTok 4层审查引擎' : 'TikTok 4-Layer Review Engine',
              desc: locale === 'zh'
                ? '每个广告系列都经过合规、风险、AI 和验证层。基于真实 TikTok 广告政策构建。'
                : 'Every campaign goes through Compliance, Risk, AI, and Validation layers. Built on real TikTok advertising policies.',
              note: locale === 'zh' ? '专业媒体代理机构使用的相同 4 层框架。' : 'The same 4-layer framework used by professional media agencies.',
            },
            {
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ),
              title: locale === 'zh' ? '平台特定逻辑' : 'Platform-Specific Logic',
              desc: locale === 'zh'
                ? 'Facebook 和 TikTok 遵循不同的优化规则。AdsCraft 为每个平台应用正确的框架。'
                : 'Facebook and TikTok follow different optimization rules. AdsCraft applies the right framework for each platform.',
            },
            {
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              ),
              title: locale === 'zh' ? '可执行报告' : 'Actionable Report',
              desc: locale === 'zh'
                ? '不仅仅是问题 — 带有优先级的具体下一步行动。确切知道先修复什么。'
                : 'Not just problems — specific next actions with priority levels. Know exactly what to fix first.',
            },
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-xl bg-[#101827] border border-white/8 hover:border-white/20 hover:-translate-y-0.5 transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-[#00D4FF]/10 flex items-center justify-center text-[#00D4FF] mb-4">
                {card.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{card.title}</h3>
              <p className="text-[#94A3B8] text-sm leading-relaxed">{card.desc}</p>
              {card.note && (
                <p className="text-[#94A3B8]/60 text-xs mt-2 italic">{card.note}</p>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========== 第五屏：Platform Entry ========== */}
      <section className="relative z-10 max-w-[1200px] mx-auto px-6 py-24">
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
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#1877F2]/10 flex items-center justify-center" dangerouslySetInnerHTML={{ __html: PLATFORM_CONFIGS.facebook.icon }} />
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
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center" dangerouslySetInnerHTML={{ __html: PLATFORM_CONFIGS.tiktok.icon }} />
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

          {/* Google Ads - Coming Soon */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="p-8 rounded-xl bg-[#101827]/50 border border-white/5 opacity-60 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white/60 mb-2">Google Ads</h3>
            <p className="text-[#94A3B8]/60 text-sm mb-6">
              {locale === 'zh' ? '即将推出' : 'Coming Soon'}
            </p>
            <button
              disabled
              className="px-6 py-2 bg-white/5 text-white/40 font-semibold rounded-lg cursor-not-allowed"
            >
              {locale === 'zh' ? '即将推出' : 'Coming Soon'}
            </button>
          </motion.div>
        </div>
      </section>

      {/* ========== 第六屏：Features ========== */}
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
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              ),
              title: locale === 'zh' ? 'AI 分析' : 'AI Analysis',
              desc: locale === 'zh' 
                ? 'AI 推理分析广告结构和效果' 
                : 'Campaign structure and performance analyzed by AI reasoning',
            },
            {
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              title: locale === 'zh' ? '合规审查' : 'Compliance Review',
              desc: locale === 'zh'
                ? '投放前检查平台广告政策'
                : 'Check against platform advertising policies before launch',
            },
            {
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              ),
              title: locale === 'zh' ? '优化报告' : 'Optimization Report',
              desc: locale === 'zh'
                ? '优先级推荐和具体行动项'
                : 'Prioritized recommendations with specific action items',
            },
            {
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              ),
              title: locale === 'zh' ? '报告导出' : 'Report Export',
              desc: locale === 'zh'
                ? '下载完整报告为 PDF'
                : 'Download your full report as PDF',
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
                  <div>
                    <span className="text-white text-sm font-medium">
                      {locale === 'zh' ? route.nameZh : route.name}
                    </span>
                    {route.isFree && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-[#00D4FF]/20 text-[#00D4FF] rounded">
                        {locale === 'zh' ? '免费' : 'Free'}
                      </span>
                    )}
                  </div>
                  <span className="text-[#94A3B8] text-sm">
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
                  <div>
                    <span className="text-white text-sm font-medium">
                      {locale === 'zh' ? route.nameZh : route.name}
                    </span>
                    {route.isFree && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-[#00D4FF]/20 text-[#00D4FF] rounded">
                        {locale === 'zh' ? '免费' : 'Free'}
                      </span>
                    )}
                  </div>
                  <span className="text-[#94A3B8] text-sm">
                    {locale === 'zh' ? route.priceTextZh : route.priceText}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========== 第八屏：FAQ ========== */}
      <section className="relative z-10 max-w-[1200px] mx-auto px-6 py-24">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-[#F8FAFC] text-center mb-16"
        >
          {locale === 'zh' ? '常见问题' : 'FAQ'}
        </motion.h2>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, i) => (
            <motion.details
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group rounded-xl bg-[#101827] border border-white/8 overflow-hidden"
            >
              <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                <span className="text-white font-medium">
                  {locale === 'zh' ? faq.qZh : faq.qEn}
                </span>
                <svg className="w-5 h-5 text-[#94A3B8] group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-5 pb-5 text-[#94A3B8] text-sm leading-relaxed">
                {locale === 'zh' ? faq.aZh : faq.aEn}
              </div>
            </motion.details>
          ))}
        </div>
      </section>

      {/* ========== Footer ========== */}
      <footer className="relative z-10 border-t border-white/8 py-12">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-white">AdsCraft</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-[#94A3B8] text-sm hover:text-white transition-colors">
                {locale === 'zh' ? '隐私政策' : 'Privacy Policy'}
              </Link>
              <Link href="/terms" className="text-[#94A3B8] text-sm hover:text-white transition-colors">
                {locale === 'zh' ? '服务条款' : 'Terms of Service'}
              </Link>
            </div>
            <p className="text-[#94A3B8] text-sm">
              © 2026 AdsCraft. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

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

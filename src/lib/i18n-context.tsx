'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Locale = 'en' | 'zh';
type TranslationKey = keyof typeof translations['en'];

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

const translations = {
  en: {
    // 导航
    'nav.home': 'Home',
    'nav.setup': 'Pre-Setup',
    'nav.questions': 'Get Plan',
    'nav.login': 'Login',
    'nav.privacy': 'Privacy Policy',
    
    // Footer
    'footer.rights': 'Facebook Ads Decision Engine.',
    
    // 首页
    'home.title': 'AdsCraft',
    'home.subtitle': 'Facebook Ads Decision Engine',
    'home.description': 'Not a tutorial, but a decision tool. Know what to choose, why to choose it, and how to adjust when things go wrong.',
    'home.selectRoute': 'Select Your Route',
    
    // 路线选择
    'route.retailer.title': 'Retailer',
    'route.retailer.desc': 'E-commerce/Shopify, sell products online',
    'route.manufacturer.title': 'Manufacturer',
    'route.manufacturer.desc': 'B2B export, find wholesale customers',
    'route.localService.title': 'Local Service',
    'route.localService.desc': 'Local business within few kilometers',
    'route.brand.title': 'Brand',
    'route.brand.desc': 'Build brand awareness first, then convert',
    
    // 首页价值主张
    'home.value1.title': 'Configuration Recommendation',
    'home.value1.desc': 'Tell you which option to choose for each setting',
    'home.value2.title': 'Reason Analysis',
    'home.value2.desc': 'Explain why to choose this over others',
    'home.value3.title': 'Diagnosis & Optimization',
    'home.value3.desc': 'Judge what went wrong and how to adjust',
    
    // 前期设置
    'setup_checklist.title': 'Confirm Your Facebook Ads Setup',
    'setup_checklist.step': 'Step 2 of 4',
    'setup_checklist.required': 'Required — you need this to run ads',
    'setup_checklist.recommended': 'Recommended — complete before launching',
    'setup_checklist.optional': 'Optional — needed for specific routes',
    'setup_checklist.items.page': 'Facebook Page + Instagram Account',
    'setup_checklist.items.page_desc': 'You can\'t run ads without a Page',
    'setup_checklist.items.ad_account': 'Ad Account',
    'setup_checklist.items.ad_account_desc': 'Set timezone & currency (can\'t change later)',
    'setup_checklist.items.pixel': 'Meta Pixel + CAPI',
    'setup_checklist.items.pixel_desc': 'Browser + server tracking, both required (iOS 14.5+ loses 40%+ data without CAPI)',
    'setup_checklist.items.domain': 'Domain Verification',
    'setup_checklist.items.domain_desc': 'Business Settings → Brand Safety → Domains',
    'setup_checklist.items.events': 'Web Event Configuration',
    'setup_checklist.items.events_desc': 'Set up conversion events (Purchase/Lead/Contact)',
    'setup_checklist.items.bm': 'Meta Business Suite',
    'setup_checklist.items.bm_desc': 'Only needed for multiple Pages or ad accounts',
    'setup_checklist.items.whatsapp': 'WhatsApp Business API',
    'setup_checklist.items.whatsapp_desc': 'Required for WhatsApp order route; via BSP, not just the app',
    'setup_checklist.view_steps': 'View detailed steps',
    'setup_checklist.next': 'Next',
    'setup_checklist.next_disabled': 'Complete the 3 required items to continue',
    
    // 问答页
    'questions.title': 'Answer 3 Questions',
    'questions.subtitle': 'Get your customized Facebook ads plan in seconds',
    'questions.step': 'Step',
    'questions.of': 'of',
    'questions.q1': 'What is your daily budget range?',
    'questions.budget.title': 'Budget Range',
    'questions.q2': 'How do customers order/contact you?',
    'questions.path.title': 'Conversion Path',
    'questions.q3': 'What\'s your primary advertising goal?',
    'questions.goal.title': 'Primary Goal',
    'questions.generate': 'Generate Plan',
    'questions.next': 'Next',
    'questions.budget.low': 'Less than $20',
    'questions.budget.mid': '$20-50',
    'questions.budget.high': '$50 or more',
    'questions.path.shopify': 'Website/Shopify online order',
    'questions.path.whatsapp': 'WhatsApp/Line contact',
    'questions.path.store': 'Visit store/Phone call',
    'questions.path.lead': 'Fill form for information',
    'questions.goal.sales': 'Direct sales/revenue',
    'questions.goal.leads': 'Lead generation/contacts',
    'questions.goal.awareness': 'Brand awareness/traffic',
    
    // 方案页
    'plan.title': 'Your Facebook Ads Plan',
    'plan.quickRef': 'Quick Reference Table',
    'plan.decision': 'Decision Point',
    'plan.recommendation': 'Recommendation',
    'plan.campaign': 'Campaign Objective',
    'plan.budget': 'Budget Strategy',
    'plan.audience': 'Audience Type',
    'plan.placement': 'Placement',
    'plan.bidding': 'Bidding Strategy',
    'plan.format': 'Ad Format',
    'plan.event': 'Optimization Event',
    'plan.remarketing': 'Remarketing Window',
    
    // 付费墙
    'paywall.title': 'Premium Feature',
    'paywall.description': 'Unlock personalized recommendations, detailed analysis, and AI-powered diagnostics.',
    'paywall.feature1': 'Customized ad strategy based on your specific situation',
    'paywall.feature2': '5-stage progression guide with actionable steps',
    'paywall.feature3': 'AI data diagnostics to optimize your campaigns',
    'paywall.cta': 'Upgrade to Premium',
    
    // 登录页
    'login.title': 'Login',
    'login.subtitle': 'Access your personalized ads plans',
    'login.email': 'Email',
    'login.password': 'Password',
    'login.submit': 'Login',
    'login.noAccount': 'Don\'t have an account?',
    'login.signup': 'Sign up',
    'login.success': 'Login successful!',
    'login.error': 'Login failed. Please check your credentials.',
    'login.loading': 'Logging in...',
    
    // 注册页
    'signup.title': 'Sign Up',
    'signup.subtitle': 'Start your AdsCraft journey',
    'signup.email': 'Email',
    'signup.password': 'Password',
    'signup.submit': 'Sign Up',
    'signup.hasAccount': 'Already have an account?',
    'signup.login': 'Login',
    'signup.success': 'Account created! Please login.',
    'signup.error': 'Signup failed. Please try again.',
    'signup.loading': 'Creating account...',
    'signup.fullName': 'Full Name',
    
    // 订阅页
    'pricing.title': 'Choose Your Plan',
    'pricing.subtitle': 'Unlock the power of Facebook Ads decision engine',
    'pricing.strategy': 'Pricing by route: different ROI and budget levels',
    'pricing.free.title': 'Free Plan',
    'pricing.free.price': '$0',
    'pricing.free.feature1': 'Basic 3-question plan generator',
    'pricing.free.feature2': 'Quick reference table + operation steps',
    'pricing.free.feature3': 'Route-specific configuration preview',
    'pricing.free.cta': 'Start Free',
    'pricing.premium.title': 'Premium',
    'pricing.premium.period': 'per month',
    'pricing.premium.feature1': '8-question customized plan',
    'pricing.premium.feature2': 'Reason analysis (why A not B)',
    'pricing.premium.feature3': 'Cold start strategy',
    'pricing.premium.feature4': '5-stage progressive guide',
    'pricing.premium.feature5': 'AI data diagnosis',
    'pricing.premium.cta': 'Upgrade Now',
    'pricing.retailer.title': 'Retailer',
    'pricing.retailer.roi': '1 day budget optimization covers subscription',
    'pricing.manufacturer.title': 'Manufacturer',
    'pricing.manufacturer.roi': '1 precise inquiry covers subscription',
    'pricing.brand.title': 'Brand',
    'pricing.brand.roi': '1 effective brand exposure covers subscription',
    'pricing.localService.title': 'Local Service',
    'pricing.localService.roi': '1 in-store customer covers subscription',
    'pricing.comparison.title': 'Free vs Premium',
    'pricing.comparison.feature': 'Feature',
    'pricing.comparison.feature1': '3-question basic plan',
    'pricing.comparison.feature2': '8-question customized plan',
    'pricing.comparison.feature3': 'Reason analysis',
    'pricing.comparison.feature4': '5-stage progressive guide',
    'pricing.comparison.feature5': 'AI data diagnosis',
    'pricing.comparison.feature6': 'Quick reference table',
    'pricing.comparison.partial': 'Partial',
    
    // 隐私政策
    'privacy.title': 'Privacy Policy',
    'privacy.lastUpdate': 'Last updated: June 2026',
    'privacy.collect.title': 'Data Collection',
    'privacy.collect.desc': 'We collect email addresses, Q&A data, and ad data for generating plans, tracking progress, and diagnostic analysis.',
    'privacy.usage.title': 'Data Usage',
    'privacy.usage.desc': 'Your data is used to generate personalized ad plans, track stage progress, and provide AI diagnostic suggestions.',
    'privacy.storage.title': 'Data Storage',
    'privacy.storage.desc': 'Data is stored in Supabase (US/Singapore nodes) with encryption.',
    'privacy.thirdparty.title': 'Third-party Services',
    'privacy.thirdparty.desc': 'We use Creem (payment), Google/GitHub (OAuth), Resend (email), and Coze API (AI diagnosis).',
    'privacy.rights.title': 'Your Rights',
    'privacy.rights.desc': 'You can view, export, or delete your personal data at any time.',
    'privacy.retention.title': 'Data Retention',
    'privacy.retention.desc': 'Active user data is retained; deleted accounts are removed within 30 days.',
    'privacy.children.title': 'Children',
    'privacy.children.desc': 'This service is not for users under 18 years old.',
    
    // 通用
    'common.loading': 'Loading...',
    'common.back': 'Back',
    'common.backHome': 'Back to Home',
    'common.backPrevious': 'Back to Previous',
  },
  zh: {
    // 导航
    'nav.home': '首页',
    'nav.questions': '获取方案',
    'nav.login': '登录',
    'nav.setup': '前期设置',
    'nav.privacy': '隐私政策',
    
    // Footer
    'footer.rights': 'Facebook广告决策引擎',
    
    // 首页
    'home.title': 'AdsCraft',
    'home.subtitle': 'Facebook广告决策引擎',
    'home.description': '不是教程，是决策工具。知道每个选项该选什么、为什么、跑偏了怎么调。',
    'home.selectRoute': '选择你的路线',
    
    // 路线选择
    'route.retailer.title': '零售商',
    'route.retailer.desc': '电商/独立站/Shopify卖货',
    'route.manufacturer.title': '制造商',
    'route.manufacturer.desc': 'B2B出口，找批发客户',
    'route.localService.title': '本地服务',
    'route.localService.desc': '方圆几公里的生意',
    'route.brand.title': '品牌方',
    'route.brand.desc': '先种草，后转化',
    
    // 首页价值主张
    'home.value1.title': '配置推荐',
    'home.value1.desc': '告诉您每个设置该选择哪个选项',
    'home.value2.title': '原因分析',
    'home.value2.desc': '解释为什么选择这个而不是其他选项',
    'home.value3.title': '诊断优化',
    'home.value3.desc': '判断哪里出了问题以及如何调整',
    
    // 前期设置
    'setup_checklist.title': '确认你的Facebook广告基础设置',
    'setup_checklist.step': '第2步 / 共4步',
    'setup_checklist.required': '必须完成 — 没有这些跑不了广告',
    'setup_checklist.recommended': '建议完成 — 投放前完成更好',
    'setup_checklist.optional': '可选 — 特定路线或规模才需要',
    'setup_checklist.items.page': 'Facebook Page + Instagram账号',
    'setup_checklist.items.page_desc': '没有Page跑不了广告，这是最基础的前提',
    'setup_checklist.items.ad_account': '创建广告账户',
    'setup_checklist.items.ad_account_desc': '设好时区+币种（改不了），在Page后台或Business Settings里创建',
    'setup_checklist.items.pixel': '安装Meta Pixel + CAPI',
    'setup_checklist.items.pixel_desc': 'Pixel浏览器端追踪，CAPI服务器端追踪，缺一不可（iOS 14.5后单靠Pixel数据丢40%+）',
    'setup_checklist.items.domain': '验证域名',
    'setup_checklist.items.domain_desc': 'Business Settings → Brand Safety → Domains',
    'setup_checklist.items.events': '配置Web事件',
    'setup_checklist.items.events_desc': '设置转化事件（Purchase/Lead/Contact等）',
    'setup_checklist.items.bm': '创建Meta Business Suite',
    'setup_checklist.items.bm_desc': '单个Page可以直接投，BM是管理多主页/多广告账户时才需要',
    'setup_checklist.items.whatsapp': '注册WhatsApp Business API',
    'setup_checklist.items.whatsapp_desc': '通过BSP接入，不是下个App就完了；WhatsApp接单路线必须',
    'setup_checklist.view_steps': '查看详细步骤',
    'setup_checklist.next': '下一步',
    'setup_checklist.next_disabled': '完成3项必选项才能继续',
    
    // 问答页
    'questions.title': '回答3个问题',
    'questions.subtitle': '几秒钟获取你的Facebook广告方案',
    'questions.step': '第',
    'questions.of': '步，共',
    'questions.q1': '你的日均预算范围是多少？',
    'questions.budget.title': '预算范围',
    'questions.q2': '客户如何下单/联系你？',
    'questions.path.title': '转化路径',
    'questions.q3': '你的主要广告目标是什么？',
    'questions.goal.title': '主要目标',
    'questions.generate': '生成方案',
    'questions.next': '下一步',
    'questions.budget.low': '低于$20',
    'questions.budget.mid': '$20-50',
    'questions.budget.high': '$50以上',
    'questions.path.shopify': '网站/Shopify在线下单',
    'questions.path.whatsapp': 'WhatsApp/Line联系',
    'questions.path.store': '到店/电话联系',
    'questions.path.lead': '填写表单获取信息',
    'questions.goal.sales': '直接销售/收入',
    'questions.goal.leads': '线索生成/联系方式',
    'questions.goal.awareness': '品牌知名度/流量',
    
    // 方案页
    'plan.title': '你的Facebook广告方案',
    'plan.quickRef': '速查表',
    'plan.decision': '决策点',
    'plan.recommendation': '推荐配置',
    'plan.campaign': 'Campaign目标',
    'plan.budget': '预算策略',
    'plan.audience': '受众类型',
    'plan.placement': '版位选择',
    'plan.bidding': '出价策略',
    'plan.format': '广告格式',
    'plan.event': '优化事件',
    'plan.remarketing': '再营销窗口',
    
    // 付费墙
    'paywall.title': '付费功能',
    'paywall.description': '解锁个性化推荐、详细分析和AI诊断功能。',
    'paywall.feature1': '根据你的具体情况定制的广告策略',
    'paywall.feature2': '5阶段递进指南，每阶段可执行步骤',
    'paywall.feature3': 'AI数据诊断，优化你的广告效果',
    'paywall.cta': '升级到付费版',
    
    // 登录页
    'login.title': '登录',
    'login.subtitle': '访问你的个性化广告方案',
    'login.email': '邮箱',
    'login.password': '密码',
    'login.submit': '登录',
    'login.noAccount': '没有账号？',
    'login.signup': '注册',
    'login.success': '登录成功！',
    'login.error': '登录失败，请检查你的登录信息。',
    'login.loading': '正在登录...',
    
    // 注册页
    'signup.title': '注册',
    'signup.subtitle': '开始你的AdsCraft之旅',
    'signup.email': '邮箱',
    'signup.password': '密码',
    'signup.submit': '注册',
    'signup.hasAccount': '已有账号？',
    'signup.login': '登录',
    'signup.success': '账户创建成功！请登录。',
    'signup.error': '注册失败，请重试。',
    'signup.loading': '正在创建账户...',
    'signup.fullName': '姓名',
    
    // 订阅页
    'pricing.title': '选择你的方案',
    'pricing.subtitle': '解锁Facebook广告决策引擎的强大功能',
    'pricing.strategy': '按路线定价：不同ROI和预算水平',
    'pricing.free.title': '免费方案',
    'pricing.free.price': '$0',
    'pricing.free.feature1': '基础3问方案生成器',
    'pricing.free.feature2': '速查表 + 操作步骤',
    'pricing.free.feature3': '路线专属配置预览',
    'pricing.free.cta': '免费开始',
    'pricing.premium.title': '高级',
    'pricing.premium.period': '每月',
    'pricing.premium.feature1': '8问定制方案',
    'pricing.premium.feature2': '原因分析（为什么选A不选B）',
    'pricing.premium.feature3': '冷启动策略',
    'pricing.premium.feature4': '5阶段递进指南',
    'pricing.premium.feature5': 'AI数据诊断',
    'pricing.premium.cta': '立即升级',
    'pricing.retailer.title': '零售商',
    'pricing.retailer.roi': '优化1天预算即可覆盖订阅费',
    'pricing.manufacturer.title': '制造商',
    'pricing.manufacturer.roi': '1个精准询盘即可覆盖订阅费',
    'pricing.brand.title': '品牌方',
    'pricing.brand.roi': '1次有效品牌曝光即可覆盖订阅费',
    'pricing.localService.title': '本地服务商',
    'pricing.localService.roi': '1个到店客户即可覆盖订阅费',
    'pricing.comparison.title': '免费 vs 高级对比',
    'pricing.comparison.feature': '功能',
    'pricing.comparison.feature1': '3问基础方案',
    'pricing.comparison.feature2': '8问定制方案',
    'pricing.comparison.feature3': '原因分析',
    'pricing.comparison.feature4': '5阶段递进指南',
    'pricing.comparison.feature5': 'AI数据诊断',
    'pricing.comparison.feature6': '速查表',
    'pricing.comparison.partial': '部分',
    
    // 隐私政策
    'privacy.title': '隐私政策',
    'privacy.lastUpdate': '最后更新：2026年6月',
    'privacy.collect.title': '数据收集',
    'privacy.collect.desc': '我们收集邮箱地址、问答数据、广告数据等信息，用于生成方案、阶段追踪和诊断分析。',
    'privacy.usage.title': '数据用途',
    'privacy.usage.desc': '您的数据用于生成个性化的广告方案、追踪阶段进度、提供AI诊断建议。',
    'privacy.storage.title': '数据存储',
    'privacy.storage.desc': '数据存储在Supabase（美国/新加坡节点），加密存储。',
    'privacy.thirdparty.title': '第三方服务',
    'privacy.thirdparty.desc': '我们使用Creem（支付）、Google/GitHub（OAuth）、Resend（邮件）、Coze API（AI诊断）。',
    'privacy.rights.title': '用户权利',
    'privacy.rights.desc': '您可以随时查看、导出或删除您的个人数据。',
    'privacy.retention.title': '数据保留',
    'privacy.retention.desc': '活跃用户数据保留；注销后30天内完全删除。',
    'privacy.children.title': '未成年人',
    'privacy.children.desc': '本服务不面向18岁以下用户。',
    
    // 通用
    'common.loading': '加载中...',
    'common.back': '返回',
    'common.backHome': '返回首页',
    'common.backPrevious': '返回上一页',
  },
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en');

  useEffect(() => {
    // 从localStorage读取语言偏好，默认英文
    const savedLocale = localStorage.getItem('locale') as Locale;
    if (savedLocale && (savedLocale === 'en' || savedLocale === 'zh')) {
      setLocale(savedLocale);
    }
  }, []);

  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  const t = (key: TranslationKey): string => {
    return translations[locale][key] || key;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale: handleSetLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
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
    
    // 问答页
    'questions.title': 'Answer 3 Questions',
    'questions.subtitle': 'Get your customized Facebook ads plan in seconds',
    'questions.step': 'Step',
    'questions.of': 'of',
    'questions.q1': 'What is your daily budget range?',
    'questions.budget.title': 'Budget Range',
    'questions.q2': 'How do customers order/contact you?',
    'questions.path.title': 'Conversion Path',
    'questions.generate': 'Generate Plan',
    'questions.next': 'Next',
    'questions.budget.low': 'Less than $20',
    'questions.budget.mid': '$20-50',
    'questions.budget.high': '$50 or more',
    'questions.path.shopify': 'Website/Shopify online order',
    'questions.path.whatsapp': 'WhatsApp/Line contact',
    'questions.path.store': 'Visit store/Phone call',
    'questions.path.lead': 'Fill form for information',
    
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
    
    // 登录页
    'login.title': 'Login',
    'login.subtitle': 'Access your personalized ads plans',
    'login.email': 'Email',
    'login.password': 'Password',
    'login.submit': 'Login',
    'login.noAccount': 'Don\'t have an account?',
    'login.signup': 'Sign up',
    
    // 注册页
    'signup.title': 'Sign Up',
    'signup.email': 'Email',
    'signup.password': 'Password',
    'signup.submit': 'Sign Up',
    'signup.hasAccount': 'Already have an account?',
    'signup.login': 'Login',
    
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
    'common.back': 'Back to Home',
    'common.backHome': 'Back to Home',
  },
  zh: {
    // 导航
    'nav.home': '首页',
    'nav.questions': '获取方案',
    'nav.login': '登录',
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
    
    // 问答页
    'questions.title': '回答3个问题',
    'questions.subtitle': '秒出定制化Facebook广告方案',
    'questions.step': '步骤',
    'questions.of': '共',
    'questions.q1': '每天广告预算大概多少？',
    'questions.budget.title': '预算范围',
    'questions.q2': '客户怎么下单/联系你？',
    'questions.path.title': '转化路径',
    'questions.generate': '生成方案',
    'questions.next': '下一步',
    'questions.budget.low': '不到$20',
    'questions.budget.mid': '$20-50',
    'questions.budget.high': '$50以上',
    'questions.path.shopify': '网站/Shopify在线下单',
    'questions.path.whatsapp': 'WhatsApp/Line联系下单',
    'questions.path.store': '到店/电话',
    'questions.path.lead': '填表留下信息',
    
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
    
    // 登录页
    'login.title': '登录',
    'login.subtitle': '访问你的个性化广告方案',
    'login.email': '邮箱',
    'login.password': '密码',
    'login.submit': '登录',
    'login.noAccount': '没有账号？',
    'login.signup': '注册',
    
    // 注册页
    'signup.title': '注册',
    'signup.email': '邮箱',
    'signup.password': '密码',
    'signup.submit': '注册',
    'signup.hasAccount': '已有账号？',
    'signup.login': '登录',
    
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
    'common.back': '返回首页',
    'common.backHome': '返回首页',
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
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
    
    // 问答页
    'questions.title': 'Answer 3 Questions',
    'questions.subtitle': 'Get your customized Facebook ads plan in seconds',
    'questions.q1': 'What do you sell/do?',
    'questions.q2': 'Daily budget range?',
    'questions.q3': 'How do customers order/contact you?',
    'questions.generate': 'Generate Plan',
    
    // 方案页
    'plan.title': 'Your Facebook Ads Plan',
    'plan.quickRef': 'Quick Reference Table',
    'plan.decision': 'Decision Point',
    'plan.recommendation': 'Recommendation',
    
    // 登录页
    'login.title': 'Login',
    'login.email': 'Email',
    'login.password': 'Password',
    'login.submit': 'Login',
    'login.noAccount': 'Don\'t have an account?',
    'login.signup': 'Sign up',
    
    // 隐私政策
    'privacy.title': 'Privacy Policy',
    'privacy.lastUpdate': 'Last updated: June 2026',
    
    // 通用
    'common.loading': 'Loading...',
    'common.back': 'Back to Home',
  },
  zh: {
    // 导航
    'nav.home': '首页',
    'nav.questions': '获取方案',
    'nav.login': '登录',
    'nav.privacy': '隐私政策',
    
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
    
    // 问答页
    'questions.title': '回答3个问题',
    'questions.subtitle': '秒出定制化Facebook广告方案',
    'questions.q1': '你卖什么/做什么？',
    'questions.q2': '每天广告预算大概多少？',
    'questions.q3': '客户怎么下单/联系你？',
    'questions.generate': '生成方案',
    
    // 方案页
    'plan.title': '你的Facebook广告方案',
    'plan.quickRef': '速查表',
    'plan.decision': '决策点',
    'plan.recommendation': '推荐配置',
    
    // 登录页
    'login.title': '登录',
    'login.email': '邮箱',
    'login.password': '密码',
    'login.submit': '登录',
    'login.noAccount': '没有账号？',
    'login.signup': '注册',
    
    // 隐私政策
    'privacy.title': '隐私政策',
    'privacy.lastUpdate': '最后更新：2026年6月',
    
    // 通用
    'common.loading': '加载中...',
    'common.back': '返回首页',
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
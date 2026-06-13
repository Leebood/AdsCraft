'use client';

import { useI18n } from '@/lib/i18n-context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';

export default function HomePage() {
  const { t } = useI18n();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  
  // 处理需要登录的操作
  const handleAuthRequiredAction = (targetPath: string) => {
    if (loading) return; // 加载中不操作
    if (user) {
      router.push(targetPath);
    } else {
      router.push('/login');
    }
  };

  const routes = [
    {
      id: 'retailer',
      title: t('route.retailer.title'),
      desc: t('route.retailer.desc'),
      icon: (
        <svg className="w-12 h-12 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm6 16H6V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h4v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z"/>
        </svg>
      )
    },
    {
      id: 'manufacturer',
      title: t('route.manufacturer.title'),
      desc: t('route.manufacturer.desc'),
      icon: (
        <svg className="w-12 h-12 text-violet-400" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
        </svg>
      )
    },
    {
      id: 'local_service',
      title: t('route.localService.title'),
      desc: t('route.localService.desc'),
      icon: (
        <svg className="w-12 h-12 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      )
    },
    {
      id: 'brand',
      title: t('route.brand.title'),
      desc: t('route.brand.desc'),
      icon: (
        <svg className="w-12 h-12 text-rose-400" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
      )
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
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

        {/* Route Selection */}
        <div className="mb-8">
          {/* Start Button - Above Route Selection */}
          {selectedRoute && (
            <div className="mb-6 flex justify-center">
              <button
                onClick={() => handleAuthRequiredAction(`/setup-checklist?route=${selectedRoute}`)}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white font-semibold shadow-lg shadow-cyan-500/30 hover:from-cyan-400 hover:to-blue-500 hover:scale-105 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? '...' : t('home.startNow')}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          )}
          
          <h3 className="text-2xl font-semibold text-white mb-6 text-center">
            {t('home.selectRoute')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {routes.map((route) => (
              <button
                key={route.id}
                onClick={() => setSelectedRoute(route.id)}
                className={`group relative p-4 rounded-2xl border transition-all duration-300 ${
                  selectedRoute === route.id
                    ? 'bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border-cyan-400 shadow-xl shadow-cyan-500/30 scale-[1.02]'
                    : 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-cyan-500/30 hover:border-cyan-400 hover:from-slate-700/80 hover:to-slate-800/80 hover:shadow-lg hover:shadow-cyan-500/10'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`transition-transform duration-300 ${
                    selectedRoute === route.id ? 'scale-110' : 'group-hover:scale-105'
                  }`}>
                    {route.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                      {route.title}
                    </h4>
                    <p className="text-blue-200/80 text-sm leading-relaxed">
                      {route.desc}
                    </p>
                  </div>
                  {selectedRoute === route.id && (
                    <div className="absolute top-3 right-3">
                      <div className="w-5 h-5 bg-cyan-400 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Plans Section */}
        <div className="mt-8 mb-12">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-white mb-2">{t('home.pricing.title')}</h3>
            <p className="text-sm text-blue-200">{t('home.pricing.subtitle')}</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4 hover:border-cyan-400/30 transition-all w-[180px]">
              <div className="text-center">
                <h4 className="text-base font-semibold text-white mb-1">{t('home.pricing.free.name')}</h4>
                <div className="text-xl font-bold text-cyan-400 mb-3">{t('home.pricing.free.price')}</div>
                <ul className="text-xs text-blue-200 space-y-1 mb-4">
                  <li>{t('home.pricing.free.feature1')}</li>
                  <li>{t('home.pricing.free.feature2')}</li>
                  <li>{t('home.pricing.free.feature3')}</li>
                </ul>
                <button
                  onClick={() => handleAuthRequiredAction('/questions?route=basic')}
                  disabled={loading}
                  className="block w-full py-1.5 px-3 bg-cyan-500/20 text-cyan-400 rounded-md text-sm font-medium hover:bg-cyan-500/30 transition-colors disabled:opacity-50"
                >
                  {loading ? '...' : t('home.pricing.getStarted')}
                </button>
              </div>
            </div>

            {/* Local Service Plan */}
            <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4 hover:border-emerald-400/30 transition-all w-[180px]">
              <div className="text-center">
                <h4 className="text-base font-semibold text-white mb-1">{t('home.pricing.localService.name')}</h4>
                <div className="text-xl font-bold text-emerald-400 mb-3">{t('home.pricing.localService.price')}</div>
                <ul className="text-xs text-blue-200 space-y-1 mb-4">
                  <li>{t('home.pricing.localService.feature1')}</li>
                  <li>{t('home.pricing.localService.feature2')}</li>
                  <li>{t('home.pricing.localService.feature3')}</li>
                </ul>
                <a
                  href="https://www.creem.io/payment/prod_4iIOpYQLDR8tlnxu6Ziwz6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-1.5 px-3 bg-emerald-500/20 text-emerald-400 rounded-md text-sm font-medium hover:bg-emerald-500/30 transition-colors"
                >
                  {t('home.pricing.getStarted')}
                </a>
              </div>
            </div>

            {/* Retailer Plan */}
            <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4 hover:border-yellow-400/30 transition-all w-[180px]">
              <div className="text-center">
                <h4 className="text-base font-semibold text-white mb-1">{t('home.pricing.retailer.name')}</h4>
                <div className="text-xl font-bold text-yellow-400 mb-3">{t('home.pricing.retailer.price')}</div>
                <ul className="text-xs text-blue-200 space-y-1 mb-4">
                  <li>{t('home.pricing.retailer.feature1')}</li>
                  <li>{t('home.pricing.retailer.feature2')}</li>
                  <li>{t('home.pricing.retailer.feature3')}</li>
                </ul>
                <a
                  href="https://www.creem.io/payment/prod_77H9iTdPoURp4C2Le1xhE8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-1.5 px-3 bg-yellow-500/20 text-yellow-400 rounded-md text-sm font-medium hover:bg-yellow-500/30 transition-colors"
                >
                  {t('home.pricing.getStarted')}
                </a>
              </div>
            </div>

            {/* Manufacturer Plan */}
            <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4 hover:border-violet-400/30 transition-all w-[180px]">
              <div className="text-center">
                <h4 className="text-base font-semibold text-white mb-1">{t('home.pricing.manufacturer.name')}</h4>
                <div className="text-xl font-bold text-violet-400 mb-3">{t('home.pricing.manufacturer.price')}</div>
                <ul className="text-xs text-blue-200 space-y-1 mb-4">
                  <li>{t('home.pricing.manufacturer.feature1')}</li>
                  <li>{t('home.pricing.manufacturer.feature2')}</li>
                  <li>{t('home.pricing.manufacturer.feature3')}</li>
                </ul>
                <a
                  href="https://www.creem.io/payment/prod_2jkEL15rXCjBQxkEGpXR5v"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-1.5 px-3 bg-violet-500/20 text-violet-400 rounded-md text-sm font-medium hover:bg-violet-500/30 transition-colors"
                >
                  {t('home.pricing.getStarted')}
                </a>
              </div>
            </div>

            {/* Brand Plan */}
            <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4 hover:border-rose-400/30 transition-all w-[180px]">
              <div className="text-center">
                <h4 className="text-base font-semibold text-white mb-1">{t('home.pricing.brand.name')}</h4>
                <div className="text-xl font-bold text-rose-400 mb-3">{t('home.pricing.brand.price')}</div>
                <ul className="text-xs text-blue-200 space-y-1 mb-4">
                  <li>{t('home.pricing.brand.feature1')}</li>
                  <li>{t('home.pricing.brand.feature2')}</li>
                  <li>{t('home.pricing.brand.feature3')}</li>
                </ul>
                <a
                  href="https://www.creem.io/payment/prod_2B7hXzysLFhXYvP8bmTa9c"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-1.5 px-3 bg-rose-500/20 text-rose-400 rounded-md text-sm font-medium hover:bg-rose-500/30 transition-colors"
                >
                  {t('home.pricing.getStarted')}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Value Proposition */}
        <div className="mt-20">
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
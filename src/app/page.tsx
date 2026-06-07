'use client';

import { useI18n } from '@/lib/i18n-context';
import Link from 'next/link';
import { useState } from 'react';

export default function HomePage() {
  const { t } = useI18n();
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);

  const routes = [
    { id: 'retailer', title: t('route.retailer.title'), desc: t('route.retailer.desc'), icon: '🛒' },
    { id: 'manufacturer', title: t('route.manufacturer.title'), desc: t('route.manufacturer.desc'), icon: '🏭' },
    { id: 'localService', title: t('route.localService.title'), desc: t('route.localService.desc'), icon: '📍' },
    { id: 'brand', title: t('route.brand.title'), desc: t('route.brand.desc'), icon: '✨' },
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
        <div className="mb-12">
          <h3 className="text-2xl font-semibold text-white mb-8 text-center">
            {t('home.selectRoute')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {routes.map((route) => (
              <button
                key={route.id}
                onClick={() => setSelectedRoute(route.id)}
                className={`group relative p-8 rounded-xl border-2 transition-all duration-300 ${
                  selectedRoute === route.id
                    ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-400 shadow-lg shadow-cyan-500/20 scale-105'
                    : 'bg-white/5 border-white/20 hover:border-cyan-400/50 hover:bg-white/10 hover:shadow-xl'
                }`}
              >
                <div className="flex items-start gap-6">
                  <div className={`text-4xl transition-transform duration-300 ${
                    selectedRoute === route.id ? 'scale-110' : 'group-hover:scale-105'
                  }`}>
                    {route.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                      {route.title}
                    </h4>
                    <p className="text-blue-200/80 text-sm leading-relaxed">
                      {route.desc}
                    </p>
                  </div>
                  {selectedRoute === route.id && (
                    <div className="absolute top-4 right-4">
                      <div className="w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
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

        {/* Action Button */}
        {selectedRoute && (
          <div className="text-center mt-12 mb-16">
            <Link
              href="/questions"
              className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold text-lg hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 hover:scale-105"
            >
              {t('questions.generate')}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        )}

        {/* Value Proposition */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Configuration Recommendation */}
          <div className="text-center group">
            <div className="relative mb-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-2xl flex items-center justify-center border border-cyan-400/30 group-hover:border-cyan-400/60 transition-all duration-300 group-hover:scale-110">
                <svg className="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
              </div>
              <div className="absolute inset-0 w-20 h-20 mx-auto bg-cyan-400/10 rounded-2xl blur-xl group-hover:bg-cyan-400/20 transition-all duration-300" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-cyan-300 transition-colors">
              {t('home.value1.title')}
            </h3>
            <p className="text-blue-200/70 text-sm leading-relaxed">
              {t('home.value1.desc')}
            </p>
          </div>

          {/* Reason Analysis */}
          <div className="text-center group">
            <div className="relative mb-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-2xl flex items-center justify-center border border-purple-400/30 group-hover:border-purple-400/60 transition-all duration-300 group-hover:scale-110">
                <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.042-6.364l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M12 21v-1a9 9 0 11-6.364-2.636L4.5 17.5" />
                </svg>
              </div>
              <div className="absolute inset-0 w-20 h-20 mx-auto bg-purple-400/10 rounded-2xl blur-xl group-hover:bg-purple-400/20 transition-all duration-300" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-purple-300 transition-colors">
              {t('home.value2.title')}
            </h3>
            <p className="text-blue-200/70 text-sm leading-relaxed">
              {t('home.value2.desc')}
            </p>
          </div>

          {/* Diagnosis & Optimization */}
          <div className="text-center group">
            <div className="relative mb-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-500/30 to-red-500/30 rounded-2xl flex items-center justify-center border border-orange-400/30 group-hover:border-orange-400/60 transition-all duration-300 group-hover:scale-110">
                <svg className="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div className="absolute inset-0 w-20 h-20 mx-auto bg-orange-400/10 rounded-2xl blur-xl group-hover:bg-orange-400/20 transition-all duration-300" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-orange-300 transition-colors">
              {t('home.value3.title')}
            </h3>
            <p className="text-blue-200/70 text-sm leading-relaxed">
              {t('home.value3.desc')}
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-20 text-center">
          <p className="text-blue-300/50 text-sm">
            AdsCraft © 2024 — Facebook广告决策引擎
          </p>
        </div>
      </div>
    </div>
  );
}
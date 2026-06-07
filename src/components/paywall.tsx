'use client';

import { useI18n } from '@/lib/i18n-context';
import Link from 'next/link';

export function Paywall() {
  const { t } = useI18n();
  
  return (
    <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-lg flex items-center justify-center border border-cyan-400/30">
          <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white">
          {t('paywall.title')}
        </h3>
      </div>
      
      <p className="text-blue-300/80 mb-6 leading-relaxed">
        {t('paywall.description')}
      </p>
      
      <ul className="space-y-3 mb-6">
        <li className="flex items-start gap-2">
          <svg className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-blue-300/70">{t('paywall.feature1')}</span>
        </li>
        <li className="flex items-start gap-2">
          <svg className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-blue-300/70">{t('paywall.feature2')}</span>
        </li>
        <li className="flex items-start gap-2">
          <svg className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-blue-300/70">{t('paywall.feature3')}</span>
        </li>
      </ul>
      
      <Link 
        href="/pricing"
        className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 hover:scale-105 shadow-lg shadow-cyan-500/30"
      >
        {t('paywall.cta')}
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </Link>
    </div>
  );
}
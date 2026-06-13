'use client';

import { useI18n } from '@/lib/i18n-context';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

interface PaywallProps {
  route?: string;
  price?: string;
  roi?: string;
  isLoggedIn?: boolean;
}

export function Paywall({ route, price, roi, isLoggedIn }: PaywallProps) {
  const { t } = useI18n();
  const { user, loading } = useAuth();
  
  // 等待 loading 结束后再判断，避免状态不一致
  // 优先使用传入的 isLoggedIn prop，如果没有传入则使用 useAuth 的 user
  const isUserLoggedIn = loading ? null : (isLoggedIn !== undefined ? isLoggedIn : !!user);
  
  // loading 时显示加载状态
  if (isUserLoggedIn === null) {
    return (
      <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 backdrop-blur-sm">
        <div className="flex items-center justify-center">
          <div className="text-blue-200">{t('common.loading') || 'Loading...'}</div>
        </div>
      </div>
    );
  }
  
  // 根据登录状态决定跳转链接
  const actionLink = isUserLoggedIn ? `/pricing?route=${route || 'retailer'}` : '/login';
  const actionText = isUserLoggedIn ? t('paywall.cta') : t('nav.login');
  
  return (
    <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-6 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-lg flex items-center justify-center border border-cyan-400/30">
          <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white">
          {isUserLoggedIn ? t('paywall.title') : t('paywall.loginTitle')}
        </h3>
      </div>
      
      {/* 价格和ROI信息 */}
      {isUserLoggedIn && price && (
        <div className="mb-4 p-3 bg-cyan-500/10 rounded-lg border border-cyan-400/20">
          <div className="flex items-center justify-between">
            <span className="text-cyan-300 font-medium">{price}</span>
            <span className="text-blue-200 text-sm">{roi}</span>
          </div>
        </div>
      )}
      
      <p className="text-blue-300/80 mb-6 leading-relaxed">
        {isUserLoggedIn ? t('paywall.description') : t('paywall.loginDescription')}
      </p>
      
      {isUserLoggedIn && (
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
      )}
      
      <Link 
        href={actionLink}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 hover:scale-105 shadow-lg shadow-cyan-500/30"
      >
        {actionText}
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </Link>
    </div>
  );
}
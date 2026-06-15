'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n-context';
import { useAuth } from '@/lib/auth-context';

export function Navigation() {
  const { t } = useI18n();
  const { user, loading, isPremium, signOut } = useAuth();
  const router = useRouter();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // 需要登录才能访问的链接
  const authRequiredLinks = [
    { href: '/setup-checklist', label: t('nav.setup') },
    { href: '/questions', label: t('nav.questions') },
    { href: '/dashboard', label: t('nav.dashboard') }
  ];
  
  // 点击分析链接的处理函数
  const handleAnalysisClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isPremium) {
      // 已订阅，直接跳转分析页面
      router.push('/dashboard/analysis');
    } else {
      // 未订阅，显示升级提示弹窗
      setShowUpgradeModal(true);
    }
  };
  
  return (
    <>
      <nav className="flex gap-6 items-center">
        <Link href="/" className="text-blue-200/80 hover:text-cyan-300 transition-colors font-medium">
          {t('nav.home')}
        </Link>
        {/* 需要登录才能访问的链接 */}
        {!loading && authRequiredLinks.map((link) => (
          user ? (
            <Link key={link.href} href={link.href} className="text-blue-200/80 hover:text-cyan-300 transition-colors font-medium">
              {link.label}
            </Link>
          ) : (
            <Link key={link.href} href="/login" className="text-blue-200/80 hover:text-cyan-300 transition-colors font-medium">
              {link.label}
            </Link>
          )
        ))}
        {/* 分析链接：登录用户可见，点击时检查订阅状态 */}
        {user && (
          <button 
            onClick={handleAnalysisClick}
            className="text-blue-200/80 hover:text-cyan-300 transition-colors font-medium"
          >
            {t('nav.analysis')}
          </button>
        )}
        {!loading && (
          user ? (
            <button 
              onClick={signOut}
              className="text-blue-200/80 hover:text-cyan-300 transition-colors font-medium"
            >
              {t('nav.logout')}
            </button>
          ) : (
            <Link href="/login" className="text-blue-200/80 hover:text-cyan-300 transition-colors font-medium">
              {t('nav.login')}
            </Link>
          )
        )}
      </nav>
      
      {/* 升级提示弹窗 */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900/95 border border-cyan-400/30 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-xl shadow-cyan-500/20 mt-16 sm:mt-0">
            <h3 className="text-2xl font-bold text-white mb-4">需要订阅升级</h3>
            <p className="text-blue-200/80 mb-6 leading-relaxed">
              分析功能需要订阅才能使用。升级后您可以：
            </p>
            <ul className="text-blue-300/70 mb-8 space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-cyan-400">✓</span>
                上传广告截图进行 AI 分析
              </li>
              <li className="flex items-center gap-2">
                <span className="text-cyan-400">✓</span>
                获取专业诊断和优化建议
              </li>
              <li className="flex items-center gap-2">
                <span className="text-cyan-400">✓</span>
                解锁全部线路的高级功能
              </li>
            </ul>
            <div className="flex gap-4">
              <button
                onClick={() => router.push('/#pricing')}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/30"
              >
                去升级
              </button>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="px-6 py-3 rounded-xl border border-white/20 text-blue-200/80 hover:border-cyan-400/50 hover:text-cyan-300 transition-all duration-300"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
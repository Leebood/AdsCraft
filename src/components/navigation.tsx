'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n-context';
import { useAuth } from '@/lib/auth-context';

export function Navigation() {
  const { t, locale } = useI18n();
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();

  // 判断是否在首页
  const isHomePage = pathname === '/';
  
  // Tab 配置（仅非首页时显示）
  const tabs = [
    { 
      id: 'overview', 
      label: locale === 'zh' ? '概览' : 'Overview', 
      href: '/dashboard',
      icon: '📊'
    },
    { 
      id: 'facebook', 
      label: locale === 'zh' ? 'FB' : 'FB', 
      href: '/platform/facebook',
      icon: '📘'
    },
    { 
      id: 'tiktok', 
      label: locale === 'zh' ? 'TikTok' : 'TikTok', 
      href: '/platform/tiktok',
      icon: '🎵'
    },
    { 
      id: 'settings', 
      label: locale === 'zh' ? '设置' : 'Settings', 
      href: '/settings',
      icon: '⚙️'
    },
  ];

  // 判断当前激活的 Tab
  const getActiveTab = () => {
    if (pathname === '/' || pathname === '/dashboard') return 'overview';
    if (pathname.startsWith('/platform/facebook') || pathname.startsWith('/questions') || pathname.startsWith('/plan')) return 'facebook';
    if (pathname.startsWith('/platform/tiktok') || pathname.startsWith('/rejection-check')) return 'tiktok';
    if (pathname.startsWith('/settings')) return 'settings';
    return 'overview';
  };

  const activeTab = getActiveTab();

  // 未登录时显示简化导航
  if (!loading && !user) {
    return (
      <nav className="flex gap-6 items-center">
        <Link href="/" className="text-blue-200/80 hover:text-cyan-300 transition-colors font-medium">
          {t('nav.home')}
        </Link>
        <Link href="/login" className="text-blue-200/80 hover:text-cyan-300 transition-colors font-medium">
          {t('nav.login')}
        </Link>
      </nav>
    );
  }

  // 首页时显示简化导航（避免与首页线路选择重复）
  if (isHomePage) {
    return (
      <nav className="flex items-center gap-4">
        <Link 
          href="/dashboard" 
          className="text-blue-200/80 hover:text-cyan-300 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-white/5"
        >
          {locale === 'zh' ? '我的方案' : 'My Plans'}
        </Link>
        <div className="w-px h-6 bg-white/20" />
        {!loading && (
          <button 
            onClick={signOut}
            className="text-blue-200/60 hover:text-red-400 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-red-500/10"
          >
            {t('nav.logout')}
          </button>
        )}
      </nav>
    );
  }

  return (
    <nav className="flex items-center gap-1">
      {/* Tab 导航 */}
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                : 'text-blue-200/70 hover:text-cyan-300 hover:bg-white/5'
            }`}
          >
            {tab.icon && (
              <span className={`text-sm ${isActive ? '' : 'opacity-70'}`}>
                {tab.icon}
              </span>
            )}
            <span className="font-medium">{tab.label}</span>
            {isActive && (
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            )}
          </Link>
        );
      })}
      
      {/* 分隔线 */}
      <div className="w-px h-6 bg-white/20 mx-2" />
      
      {/* 登录/退出 */}
      {!loading && (
        <button 
          onClick={signOut}
          className="text-blue-200/60 hover:text-red-400 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-red-500/10"
        >
          {t('nav.logout')}
        </button>
      )}
    </nav>
  );
}
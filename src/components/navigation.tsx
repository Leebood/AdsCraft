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
  
  // Tab 配置（仅非首页时显示）- 只保留概览和设置
  const tabs = [
    { 
      id: 'overview', 
      label: locale === 'zh' ? '概览' : 'Overview', 
      href: '/dashboard',
      icon: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`
    },
    { 
      id: 'settings', 
      label: locale === 'zh' ? '设置' : 'Settings', 
      href: '/settings',
      icon: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>`
    },
  ];

  // 判断当前激活的 Tab
  const getActiveTab = () => {
    if (pathname === '/' || pathname === '/dashboard') return 'overview';
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
          {locale === 'zh' ? '概览' : 'Overview'}
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
              <span 
                className={`text-sm ${isActive ? 'text-cyan-300' : 'text-blue-200/70'}`}
                dangerouslySetInnerHTML={{ __html: tab.icon }}
              />
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
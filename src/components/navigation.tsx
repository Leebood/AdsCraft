'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n-context';
import { useAuth } from '@/lib/auth-context';
import { tiktokPixel } from '@/lib/tiktok-pixel';
import { SmartDiagnosisButton } from '@/components/smart-diagnosis-button';

export function Navigation() {
  const { t, locale } = useI18n();
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // 判断是否显示简化导航（首页和诊断相关页面）
  const isSimpleNavPage = pathname === '/' || 
    pathname.startsWith('/questions') ||
    pathname.startsWith('/rejection-check') ||
    pathname.startsWith('/saved') ||
    pathname.startsWith('/platform') ||
    pathname.startsWith('/plan') &&
    !pathname.startsWith('/dashboard/plans');
  
  // Tab 配置（仅仪表盘页面显示）
  const tabs = [
    { 
      id: 'overview', 
      label: locale === 'zh' ? '概览' : 'Overview', 
      href: '/dashboard',
      icon: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`
    },
    { 
      id: 'plans', 
      label: locale === 'zh' ? '我的方案' : 'My Plans', 
      href: '/dashboard/plans',
      icon: `<svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>`
    },
  ];

  // 判断当前激活的 Tab
  const getActiveTab = () => {
    if (pathname === '/' || pathname === '/dashboard') return 'overview';
    if (pathname.startsWith('/dashboard/plans')) return 'plans';
    return 'overview'; // 默认显示概览
  };

  const activeTab = getActiveTab();

  // 未登录时显示智能诊断按钮（点击跳转登录页）
  if (!loading && !user) {
    return <SmartDiagnosisButton isHomePage={isSimpleNavPage} />;
  }

  // 首页和诊断相关页面显示简化导航（避免与页面内容重复）
  if (isSimpleNavPage) {
    return (
      <nav className="flex items-center gap-4">
        <SmartDiagnosisButton isHomePage={true} />
        <div className="w-px h-6 bg-white/20" />
        {!loading && user && (
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
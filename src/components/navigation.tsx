'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n-context';
import { useAuth } from '@/lib/auth-context';

export function Navigation() {
  const { t } = useI18n();
  const { user, loading, isPremium, signOut } = useAuth();
  
  // 需要登录才能访问的链接
  const authRequiredLinks = [
    { href: '/setup-checklist', label: t('nav.setup') },
    { href: '/questions', label: t('nav.questions') },
    { href: '/dashboard', label: t('nav.dashboard') }
  ];
  
  return (
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
      {user && isPremium && (
        <Link href="/dashboard/analysis" className="text-blue-200/80 hover:text-cyan-300 transition-colors font-medium">
          {t('nav.analysis')}
        </Link>
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
  );
}
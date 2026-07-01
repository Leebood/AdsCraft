'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n-context';
import { useAuth } from '@/lib/auth-context';
import { Globe } from 'lucide-react';

export function Navigation() {
  const { t, locale, setLocale } = useI18n();
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const toggleLocale = () => {
    setLocale(locale === 'zh' ? 'en' : 'zh');
  };

  return (
    <nav className="flex items-center gap-2">
      {/* Home */}
      <Link 
        href="/"
        className={`px-3 py-2 rounded-lg transition-colors font-medium text-sm ${
          pathname === '/' 
            ? 'text-cyan-300 bg-cyan-500/10' 
            : 'text-blue-200/70 hover:text-cyan-300 hover:bg-white/5'
        }`}
      >
        {locale === 'zh' ? '首页' : 'Home'}
      </Link>

      {/* Pricing */}
      <Link 
        href="/pricing"
        className={`px-3 py-2 rounded-lg transition-colors font-medium text-sm ${
          pathname === '/pricing' 
            ? 'text-cyan-300 bg-cyan-500/10' 
            : 'text-blue-200/70 hover:text-cyan-300 hover:bg-white/5'
        }`}
      >
        {locale === 'zh' ? '价格' : 'Pricing'}
      </Link>

      {/* FAQ */}
      <Link 
        href="/faq"
        className={`px-3 py-2 rounded-lg transition-colors font-medium text-sm ${
          pathname === '/faq' 
            ? 'text-cyan-300 bg-cyan-500/10' 
            : 'text-blue-200/70 hover:text-cyan-300 hover:bg-white/5'
        }`}
      >
        {locale === 'zh' ? '帮助' : 'FAQ'}
      </Link>

      {/* Dashboard */}
      {user && (
        <Link 
          href="/dashboard"
          className={`px-3 py-2 rounded-lg transition-colors font-medium text-sm ${
            pathname.startsWith('/dashboard') 
              ? 'text-cyan-300 bg-cyan-500/10' 
              : 'text-blue-200/70 hover:text-cyan-300 hover:bg-white/5'
          }`}
        >
          {locale === 'zh' ? '控制台' : 'Dashboard'}
        </Link>
      )}

      {/* 分隔线 */}
      <div className="w-px h-5 bg-white/20 mx-1" />

      {/* Login / Logout */}
      {user && !loading ? (
        <button 
          onClick={handleSignOut}
          className="px-3 py-2 rounded-lg transition-colors font-medium text-sm text-blue-200/70 hover:text-red-400 hover:bg-red-500/10"
        >
          {locale === 'zh' ? '退出' : 'Logout'}
        </button>
      ) : !loading ? (
        <Link 
          href="/login"
          className="px-3 py-2 rounded-lg transition-colors font-medium text-sm text-blue-200/70 hover:text-cyan-300 hover:bg-white/5"
        >
          {locale === 'zh' ? '登录' : 'Login'}
        </Link>
      ) : null}

      {/* 语言切换 */}
      <button
        onClick={toggleLocale}
        className="p-2 rounded-lg transition-colors text-blue-200/70 hover:text-cyan-300 hover:bg-white/5"
        title={locale === 'zh' ? 'Switch to English' : '切换到中文'}
      >
        <Globe className="w-4 h-4" />
      </button>
    </nav>
  );
}

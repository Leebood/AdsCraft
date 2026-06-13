'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n-context';
import { useAuth } from '@/lib/auth-context';

export function Navigation() {
  const { t } = useI18n();
  const { user, loading, signOut } = useAuth();
  
  return (
    <nav className="flex gap-6 items-center">
      <Link href="/" className="text-blue-200/80 hover:text-cyan-300 transition-colors font-medium">
        {t('nav.home')}
      </Link>
      <Link href="/setup-checklist" className="text-blue-200/80 hover:text-cyan-300 transition-colors font-medium">
        {t('nav.setup')}
      </Link>
      <Link href="/questions" className="text-blue-200/80 hover:text-cyan-300 transition-colors font-medium">
        {t('nav.questions')}
      </Link>
      <Link href="/dashboard" className="text-blue-200/80 hover:text-cyan-300 transition-colors font-medium">
        {t('nav.dashboard')}
      </Link>
      {user && (
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
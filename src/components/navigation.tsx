'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n-context';

export function Navigation() {
  const { t } = useI18n();
  
  return (
    <nav className="flex gap-6">
      <Link href="/" className="text-blue-200/80 hover:text-cyan-300 transition-colors font-medium">
        {t('nav.home')}
      </Link>
      <Link href="/setup-checklist" className="text-blue-200/80 hover:text-cyan-300 transition-colors font-medium">
        {t('nav.setup')}
      </Link>
      <Link href="/questions" className="text-blue-200/80 hover:text-cyan-300 transition-colors font-medium">
        {t('nav.questions')}
      </Link>
      <Link href="/privacy" className="text-blue-200/80 hover:text-cyan-300 transition-colors font-medium">
        {t('nav.privacy')}
      </Link>
    </nav>
  );
}
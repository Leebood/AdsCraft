'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n-context';

export function Navigation() {
  const { t } = useI18n();
  
  return (
    <nav className="flex gap-6">
      <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
        {t('nav.home')}
      </Link>
      <Link href="/questions" className="text-gray-600 hover:text-gray-900 transition-colors">
        {t('nav.questions')}
      </Link>
      <Link href="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors">
        {t('nav.privacy')}
      </Link>
    </nav>
  );
}
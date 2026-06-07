'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n-context';

export function Footer() {
  const { t } = useI18n();
  
  return (
    <footer className="border-t border-gray-200 bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 text-center text-gray-500">
        <p>&copy; 2026 AdsCraft. {t('footer.rights')}</p>
        <div className="mt-2 flex justify-center gap-4">
          <Link href="/privacy" className="text-sm hover:text-gray-700">
            {t('nav.privacy')}
          </Link>
        </div>
      </div>
    </footer>
  );
}
'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n-context';

export function Footer() {
  const { t, locale } = useI18n();
  
  return (
    <footer className="border-t border-white/10 bg-gradient-to-br from-slate-900 to-blue-900 py-8">
      <div className="max-w-7xl mx-auto px-4 text-center">
        {/* 版权 */}
        <p className="text-blue-300/50 text-sm mb-4">
          &copy; 2026 AdsCraft. AI Ad Decision Engine for Facebook & TikTok
        </p>
        
        {/* 链接 */}
        <div className="flex justify-center gap-4">
          <Link href="/terms" className="text-sm text-blue-300/70 hover:text-cyan-400 transition-colors">
            {t('nav.terms')}
          </Link>
          <Link href="/privacy" className="text-sm text-blue-300/70 hover:text-cyan-400 transition-colors">
            {t('nav.privacy')}
          </Link>
        </div>
        
        {/* 联系 */}
        <p className="text-blue-300/50 text-sm mt-4">
          {t('footer.support')}: <a href="mailto:leo.tikboost@gmail.com" className="text-cyan-400 hover:text-cyan-300 transition-colors">leo.tikboost@gmail.com</a>
        </p>
      </div>
    </footer>
  );
}
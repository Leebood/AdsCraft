'use client';

import { useI18n } from '@/lib/i18n-context';

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <button
      onClick={() => setLocale(locale === 'en' ? 'zh' : 'en')}
      className="px-3 py-1.5 rounded-md bg-cyan-500/20 border border-cyan-400/50 text-cyan-400 text-sm font-medium hover:bg-cyan-500/30 hover:border-cyan-400 transition-colors"
    >
      {locale === 'en' ? 'EN/中' : '中/EN'}
    </button>
  );
}
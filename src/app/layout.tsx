import type { Metadata } from 'next';
import './globals.css';
import { SupabaseConfigProvider } from '@/lib/supabase-config-inject';
import { AuthProvider } from '@/lib/auth-context';
import { I18nProvider } from '@/lib/i18n-context';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'AdsCraft - Facebook Ads Decision Engine',
  description: 'Not a tutorial, but a decision tool',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SupabaseConfigProvider>
          <AuthProvider>
            <I18nProvider>
            {/* Header - 增强背景对比度确保可见 */}
            <header className="border-b border-cyan-400/20 bg-slate-900/95 sticky top-0 z-50 backdrop-blur-md shadow-lg shadow-cyan-500/5">
              <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                <Link href="/" className="text-xl font-bold text-white hover:text-cyan-400 transition-colors">
                  AdsCraft
                </Link>
                <div className="flex items-center gap-6">
                  <Navigation />
                  <LanguageSwitcher />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="min-h-screen">
            {children}
          </main>

          {/* Footer */}
          <Footer />
            </I18nProvider>
          </AuthProvider>
        </SupabaseConfigProvider>
      </body>
    </html>
  );
}
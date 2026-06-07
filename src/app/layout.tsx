import type { Metadata } from 'next';
import './globals.css';
import { I18nProvider } from '@/lib/i18n-context';
import { LanguageSwitcher } from '@/components/language-switcher';
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
        <I18nProvider>
          {/* Header */}
          <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                AdsCraft
              </Link>
              <div className="flex items-center gap-6">
                <nav className="flex gap-6">
                  <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Home
                  </Link>
                  <Link href="/questions" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Get Plan
                  </Link>
                  <Link href="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Privacy Policy
                  </Link>
                </nav>
                <LanguageSwitcher />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="min-h-screen">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t border-gray-200 bg-white py-8">
            <div className="max-w-7xl mx-auto px-4 text-center text-gray-500">
              <p>&copy; 2026 AdsCraft. Facebook Ads Decision Engine.</p>
              <div className="mt-2 flex justify-center gap-4">
                <Link href="/privacy" className="text-sm hover:text-gray-700">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </footer>
        </I18nProvider>
      </body>
    </html>
  );
}
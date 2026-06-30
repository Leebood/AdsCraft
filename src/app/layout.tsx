import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { SupabaseConfigProvider } from '@/lib/supabase-config-inject';
import { AuthProvider } from '@/lib/auth-context';
import { I18nProvider } from '@/lib/i18n-context';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'AdsCraft | AI Ad Diagnosis for Facebook & TikTok',
  description: 'AdsCraft helps small businesses diagnose and optimize Facebook and TikTok ad campaigns with AI-powered recommendations.',
  alternates: {
    canonical: 'https://www.adscraft.cn',
  },
  openGraph: {
    title: 'AdsCraft | AI Ad Diagnosis for Facebook & TikTok',
    description: 'AdsCraft helps small businesses diagnose and optimize Facebook and TikTok ad campaigns with AI-powered recommendations.',
    url: 'https://www.adscraft.cn',
    type: 'website',
    siteName: 'AdsCraft',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {/* TikTok Pixel */}
        <Script
          id="tiktok-pixel"
          strategy="afterInteractive"
        >
          {`
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;
              var ttq=w[t]=w[t]||[];
              ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"];
              ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
              for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
              ttq.instance=function(t){
                for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);
                return e
              };
              ttq.load=function(e,n){
                var r="https://analytics.tiktok.com/i18n/pixel/events.js",
                o=n&&n.partner;
                ttq._i=ttq._i||{};
                ttq._i[e]=[];
                ttq._i[e]._u=r;
                ttq._t=ttq._t||{};
                ttq._t[e]=+new Date;
                ttq._o=ttq._o||{};
                ttq._o[e]=n||{};
                n=document.createElement("script");
                n.type="text/javascript";
                n.async=!0;
                n.src=r+"?sdkid="+e+"&lib="+t;
                e=document.getElementsByTagName("script")[0];
                e.parentNode.insertBefore(n,e)
              };
              ttq.load('D8P47EBC77UFDL0U7RV0');
              ttq.page();
            }(window, document, 'ttq');
          `}
        </Script>
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
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/lib/i18n-context';

export default function PrivacyPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* 网格纹理背景 */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      
      <main className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/5 border-white/20 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="text-3xl text-white">{t('privacy.title')}</CardTitle>
              <p className="text-blue-300">{t('privacy.lastUpdate')}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3 text-white">{t('privacy.collect.title')}</h2>
                <p className="text-blue-200">{t('privacy.collect.desc')}</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-white">{t('privacy.usage.title')}</h2>
                <p className="text-blue-200">{t('privacy.usage.desc')}</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-white">{t('privacy.storage.title')}</h2>
                <p className="text-blue-200">{t('privacy.storage.desc')}</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-white">{t('privacy.thirdparty.title')}</h2>
                <p className="text-blue-200">{t('privacy.thirdparty.desc')}</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-white">{t('privacy.rights.title')}</h2>
                <p className="text-blue-200">{t('privacy.rights.desc')}</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-white">{t('privacy.retention.title')}</h2>
                <p className="text-blue-200">{t('privacy.retention.desc')}</p>
              </section>

              <div className="pt-6 border-t border-white/20">
                <Link href="/">
                  <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 to-blue-500 text-white shadow-lg shadow-cyan-500/30">
                    {t('common.backHome')}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
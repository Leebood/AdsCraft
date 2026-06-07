'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/lib/i18n-context';

export default function PrivacyPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">{t('privacy.title')}</CardTitle>
              <p className="text-gray-500">{t('privacy.lastUpdate')}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3">{t('privacy.collect.title')}</h2>
                <p className="text-gray-600">{t('privacy.collect.desc')}</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">{t('privacy.usage.title')}</h2>
                <p className="text-gray-600">{t('privacy.usage.desc')}</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">{t('privacy.storage.title')}</h2>
                <p className="text-gray-600">{t('privacy.storage.desc')}</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">{t('privacy.thirdparty.title')}</h2>
                <p className="text-gray-600">{t('privacy.thirdparty.desc')}</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">{t('privacy.rights.title')}</h2>
                <p className="text-gray-600">{t('privacy.rights.desc')}</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">{t('privacy.retention.title')}</h2>
                <p className="text-gray-600">{t('privacy.retention.desc')}</p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">{t('privacy.children.title')}</h2>
                <p className="text-gray-600">{t('privacy.children.desc')}</p>
              </section>

              <div className="pt-4">
                <Link href="/">
                  <Button variant="outline">
                    {t('common.back')}
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
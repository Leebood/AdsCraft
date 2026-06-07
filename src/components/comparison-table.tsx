'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/lib/i18n-context';

export function ComparisonTable() {
  const { t } = useI18n();

  const features = [
    { label: t('pricing.comparison.feature1'), free: true, premium: true },
    { label: t('pricing.comparison.feature2'), free: false, premium: true },
    { label: t('pricing.comparison.feature3'), free: false, premium: true },
    { label: t('pricing.comparison.feature4'), free: false, premium: true },
    { label: t('pricing.comparison.feature5'), free: false, premium: true },
    { label: t('pricing.comparison.feature6'), free: t('pricing.comparison.partial'), premium: true }
  ];

  return (
    <Card className="bg-white/5 border-white/20 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-white text-center">
          {t('pricing.comparison.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-3 px-4 text-blue-200 font-medium">
                  {t('pricing.comparison.feature')}
                </th>
                <th className="text-center py-3 px-4 text-blue-200 font-medium">
                  {t('pricing.free.title')}
                </th>
                <th className="text-center py-3 px-4 text-cyan-300 font-medium">
                  {t('pricing.premium.title')}
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr key={index} className="border-b border-white/10">
                  <td className="py-3 px-4 text-blue-300">
                    {feature.label}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {typeof feature.free === 'boolean' ? (
                      feature.free ? (
                        <svg className="w-5 h-5 text-green-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-red-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )
                    ) : (
                      <span className="text-blue-300 text-sm">{feature.free}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <svg className="w-5 h-5 text-cyan-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
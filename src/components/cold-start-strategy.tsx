'use client';

import { useI18n } from '@/lib/i18n-context';
import { useAuth } from '@/lib/auth-context';
import { Lock } from 'lucide-react';

interface ColdStartStrategyProps {
  route: string;
  isPremium: boolean;
}

export function ColdStartStrategy({ route, isPremium }: ColdStartStrategyProps) {
  const { t } = useI18n();
  const { user } = useAuth();

  // 冷启动策略数据
  const coldStartStrategies: Record<string, { title: string; steps: string[]; premiumTips: string[] }> = {
    retailer: {
      title: t('coldStart.retailer.title'),
      steps: [
        t('coldStart.retailer.step1'),
        t('coldStart.retailer.step2'),
      ],
      premiumTips: [
        t('coldStart.retailer.tip1'),
        t('coldStart.retailer.tip2'),
        t('coldStart.retailer.tip3'),
      ],
    },
    manufacturer: {
      title: t('coldStart.manufacturer.title'),
      steps: [
        t('coldStart.manufacturer.step1'),
        t('coldStart.manufacturer.step2'),
      ],
      premiumTips: [
        t('coldStart.manufacturer.tip1'),
        t('coldStart.manufacturer.tip2'),
        t('coldStart.manufacturer.tip3'),
      ],
    },
    localService: {
      title: t('coldStart.localService.title'),
      steps: [
        t('coldStart.localService.step1'),
        t('coldStart.localService.step2'),
      ],
      premiumTips: [
        t('coldStart.localService.tip1'),
        t('coldStart.localService.tip2'),
        t('coldStart.localService.tip3'),
      ],
    },
    brand: {
      title: t('coldStart.brand.title'),
      steps: [
        t('coldStart.brand.step1'),
        t('coldStart.brand.step2'),
      ],
      premiumTips: [
        t('coldStart.brand.tip1'),
        t('coldStart.brand.tip2'),
        t('coldStart.brand.tip3'),
      ],
    },
  };

  const strategy = coldStartStrategies[route] || coldStartStrategies.retailer;

  return (
    <div className="bg-white/5 border border-white/20 rounded-xl p-6 mt-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/30 to-teal-500/30 rounded-xl border border-emerald-400/30 flex items-center justify-center">
          <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white">{t('coldStart.title')}</h3>
      </div>

      <p className="text-blue-200/80 mb-4">{strategy.title}</p>

      {/* 基础步骤（所有人可见） */}
      <div className="space-y-3 mb-4">
        {strategy.steps.map((step, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 text-sm font-semibold">
              {index + 1}
            </div>
            <p className="text-blue-200/80">{step}</p>
          </div>
        ))}
      </div>

      {/* 高级技巧（付费解锁） */}
      <div className="relative mt-6">
        {!isPremium && (
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
            <div className="text-center">
              <Lock className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-white font-semibold mb-1">{t('coldStart.locked')}</p>
              <p className="text-blue-200/70 text-sm">{t('coldStart.unlockHint')}</p>
            </div>
          </div>
        )}
        
        <div className={`space-y-3 ${!isPremium ? 'opacity-30' : ''}`}>
          <h4 className="text-lg font-semibold text-emerald-400">{t('coldStart.premiumTips')}</h4>
          {strategy.premiumTips.map((tip, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2" />
              <p className="text-blue-200/80">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
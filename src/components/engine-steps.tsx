'use client';

import { useI18n } from '@/lib/i18n-context';

interface EngineStepsProps {
  currentStep: number;
  isPremium: boolean;
}

export function EngineSteps({ currentStep, isPremium }: EngineStepsProps) {
  const { locale } = useI18n();
  
  const steps = [
    { num: 1, title: locale === 'zh' ? '诊断分析' : 'Diagnosis', desc: locale === 'zh' ? '识别问题根因' : 'Identify root causes', free: true },
    { num: 2, title: locale === 'zh' ? '最优配置' : 'Optimal Config', desc: locale === 'zh' ? 'AI推荐配置' : 'AI recommended setup', free: false },
    { num: 3, title: locale === 'zh' ? '优化路径' : 'Optimization', desc: locale === 'zh' ? '7-14天调整' : '7-14 day adjustment', free: false },
    { num: 4, title: locale === 'zh' ? '持续进化' : 'Evolution', desc: locale === 'zh' ? '新数据再优化' : 'Re-optimize', free: false },
  ];

  return (
    <div className="flex justify-center items-center gap-2 md:gap-4 mb-8">
      {steps.map((step, idx) => {
        const isActive = currentStep === step.num;
        const isAccessible = step.free || isPremium;
        const isPast = currentStep > step.num;
        
        return (
          <div key={step.num} className="flex items-center">
            <div className={`flex flex-col items-center ${isAccessible ? '' : 'opacity-50'}`}>
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-lg md:text-xl transition-all ${
                isActive 
                  ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30' 
                  : isPast 
                    ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/50' 
                    : 'bg-white/10 text-blue-300/70 border border-white/20'
              }`}>
                {isPast && isAccessible ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : step.num}
              </div>
              <div className="mt-2 text-center">
                <div className={`font-medium text-sm md:text-base ${isActive ? 'text-cyan-300' : 'text-white/80'}`}>
                  {step.title}
                </div>
                <div className={`text-xs md:text-sm ${isActive ? 'text-cyan-300/70' : 'text-blue-300/50'}`}>
                  {step.desc}
                </div>
                {!isAccessible && (
                  <div className="text-xs text-orange-400/70">
                    {locale === 'zh' ? '付费解锁' : 'Premium'}
                  </div>
                )}
              </div>
            </div>
            {idx < steps.length - 1 && (
              <svg className={`w-6 h-6 md:w-8 md:h-8 mx-1 md:mx-3 ${isPast ? 'text-cyan-400' : 'text-blue-400/30'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
}
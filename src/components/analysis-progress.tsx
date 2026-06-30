'use client';

import React, { useEffect, useState } from 'react';

export type AnalysisStage =
  | 'upload_complete'
  | 'ocr_complete'
  | 'rule_engine'
  | 'issues_identified'
  | 'generating_plan'
  | 'complete';

interface AnalysisProgressProps {
  currentStage: AnalysisStage;
  metricsCount?: number;
  issuesCount?: number;
  isVisible: boolean;
}

const stageMessages = {
  upload_complete: {
    en: 'Identifying ad elements...',
    zh: '正在识别广告元素...',
    icon: '📤',
  },
  ocr_complete: {
    en: 'Found {N} key metrics ✓',
    zh: '已发现 {N} 个关键指标 ✓',
    icon: '✓',
  },
  rule_engine: {
    en: 'Comparing with industry benchmarks...',
    zh: '正在与行业基准比对...',
    icon: '📊',
  },
  issues_identified: {
    en: 'Identified {N} core issues',
    zh: '已识别 {N} 个核心问题',
    icon: '⚠️',
  },
  generating_plan: {
    en: 'Generating optimization plan...',
    zh: '正在生成优化方案...',
    icon: '🎯',
  },
  complete: {
    en: 'Analysis complete',
    zh: '分析完成',
    icon: '✅',
  },
};

export function AnalysisProgress({
  currentStage,
  metricsCount = 0,
  issuesCount = 0,
  isVisible,
}: AnalysisProgressProps) {
  const [locale, setLocale] = useState<'en' | 'zh'>('en');

  useEffect(() => {
    const savedLocale = localStorage.getItem('locale');
    if (savedLocale === 'zh' || savedLocale === 'en') {
      setLocale(savedLocale);
    }
  }, []);

  if (!isVisible) return null;

  const getMessage = (stage: AnalysisStage) => {
    const message = stageMessages[stage][locale];
    if (stage === 'ocr_complete') {
      return message.replace('{N}', metricsCount.toString());
    }
    if (stage === 'issues_identified') {
      return message.replace('{N}', issuesCount.toString());
    }
    return message;
  };

  const stages: AnalysisStage[] = [
    'upload_complete',
    'ocr_complete',
    'rule_engine',
    'issues_identified',
    'generating_plan',
    'complete',
  ];

  const currentIndex = stages.indexOf(currentStage);

  return (
    <div className="fixed inset-0 bg-[#08111F]/95 flex items-center justify-center z-50">
      <div className="max-w-md w-full mx-4">
        {/* Progress Card */}
        <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-white mb-2">
              {locale === 'zh' ? '正在分析您的广告' : 'Analyzing Your Ad'}
            </h2>
            <p className="text-sm text-slate-400">
              {locale === 'zh' ? '请稍候，正在处理...' : 'Please wait while we process...'}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="space-y-4">
            {stages.map((stage, index) => {
              const isCompleted = index < currentIndex;
              const isCurrent = index === currentIndex;
              const isPending = index > currentIndex;

              return (
                <div
                  key={stage}
                  className={`flex items-center gap-4 transition-all duration-300 ${
                    isPending ? 'opacity-30' : 'opacity-100'
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                      isCompleted
                        ? 'bg-green-500/20 text-green-400'
                        : isCurrent
                        ? 'bg-blue-500/20 text-blue-400 animate-pulse'
                        : 'bg-slate-700/50 text-slate-500'
                    }`}
                  >
                    {isCompleted ? '✓' : stageMessages[stage].icon}
                  </div>

                  {/* Message */}
                  <div className="flex-1">
                    <p
                      className={`text-sm font-medium ${
                        isCompleted
                          ? 'text-green-400'
                          : isCurrent
                          ? 'text-white'
                          : 'text-slate-500'
                      }`}
                    >
                      {getMessage(stage)}
                    </p>
                  </div>

                  {/* Status */}
                  {isCompleted && (
                    <span className="text-xs text-green-400">
                      {locale === 'zh' ? '完成' : 'Done'}
                    </span>
                  )}
                  {isCurrent && (
                    <span className="text-xs text-blue-400 animate-pulse">
                      {locale === 'zh' ? '进行中...' : 'Processing...'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="mt-8">
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500 ease-out"
                style={{ width: `${((currentIndex + 1) / stages.length) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2 text-center">
              {Math.round(((currentIndex + 1) / stages.length) * 100)}%{' '}
              {locale === 'zh' ? '完成' : 'Complete'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalysisProgress;

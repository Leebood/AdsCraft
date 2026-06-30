'use client';

import React, { useEffect, useState } from 'react';
import { Upload, CheckCircle, BarChart3, AlertTriangle, Target, CheckCircle2 } from 'lucide-react';

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
  },
  ocr_complete: {
    en: 'Found {N} key metrics',
    zh: '已发现 {N} 个关键指标',
  },
  rule_engine: {
    en: 'Comparing with industry benchmarks...',
    zh: '正在与行业基准比对...',
  },
  issues_identified: {
    en: 'Identified {N} core issues',
    zh: '已识别 {N} 个核心问题',
  },
  generating_plan: {
    en: 'Generating optimization plan...',
    zh: '正在生成优化方案...',
  },
  complete: {
    en: 'Analysis complete',
    zh: '分析完成',
  },
};

const stageIcons = {
  upload_complete: Upload,
  ocr_complete: CheckCircle,
  rule_engine: BarChart3,
  issues_identified: AlertTriangle,
  generating_plan: Target,
  complete: CheckCircle2,
};

export default function AnalysisProgress({
  currentStage,
  metricsCount = 0,
  issuesCount = 0,
  isVisible,
}: AnalysisProgressProps) {
  const [locale, setLocale] = useState<'en' | 'zh'>('en');

  useEffect(() => {
    const saved = localStorage.getItem('adsCraft_locale');
    if (saved === 'zh' || saved === 'en') {
      setLocale(saved);
    }
  }, []);

  const getMessage = (stage: AnalysisStage) => {
    let message = stageMessages[stage][locale];
    if (stage === 'ocr_complete') {
      message = message.replace('{N}', metricsCount.toString());
    } else if (stage === 'issues_identified') {
      message = message.replace('{N}', issuesCount.toString());
    }
    return message;
  };

  const getStageIndex = (stage: AnalysisStage) => {
    const stages: AnalysisStage[] = [
      'upload_complete',
      'ocr_complete',
      'rule_engine',
      'issues_identified',
      'generating_plan',
      'complete',
    ];
    return stages.indexOf(stage);
  };

  const currentIndex = getStageIndex(currentStage);

  if (!isVisible) return null;

  const IconComponent = stageIcons[currentStage];

  return (
    <div className="fixed inset-0 bg-[#08111F]/95 z-50 flex items-center justify-center">
      <div className="max-w-md w-full px-6">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`w-8 h-1 rounded-full transition-all duration-300 ${
                  i <= currentIndex ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
          <div className="text-center text-sm text-slate-400">
            {currentIndex + 1} / 6
          </div>
        </div>

        {/* Current Stage */}
        <div className="text-center">
          {/* Icon with animation */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-cyan-500/10 flex items-center justify-center animate-pulse">
                <IconComponent className="w-10 h-10 text-cyan-400" />
              </div>
              {/* Spinning ring */}
              {currentStage !== 'complete' && (
                <div className="absolute inset-0 w-20 h-20 rounded-full border-2 border-cyan-500/30 border-t-cyan-500 animate-spin" />
              )}
            </div>
          </div>

          {/* Message */}
          <h3 className="text-xl font-semibold text-white mb-2">
            {getMessage(currentStage)}
          </h3>

          {/* Stage list */}
          <div className="mt-8 space-y-3">
            {Object.keys(stageMessages).map((stage, index) => {
              const stageKey = stage as AnalysisStage;
              const isActive = index === currentIndex;
              const isCompleted = index < currentIndex;
              const StageIcon = stageIcons[stageKey];

              return (
                <div
                  key={stage}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-cyan-500/10 border border-cyan-500/30'
                      : isCompleted
                      ? 'bg-slate-800/50'
                      : 'opacity-40'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? 'bg-green-500/20'
                        : isActive
                        ? 'bg-cyan-500/20'
                        : 'bg-slate-700'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : (
                      <StageIcon
                        className={`w-3 h-3 ${
                          isActive ? 'text-cyan-400' : 'text-slate-500'
                        }`}
                      />
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      isActive ? 'text-white' : isCompleted ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {getMessage(stageKey)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

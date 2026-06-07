'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n-context';
import { useAuth } from '@/lib/auth-context';
import { Lock, Sparkles, BarChart3, AlertCircle, CheckCircle, Lightbulb } from 'lucide-react';

interface AIDiagnosisProps {
  route: string;
  isPremium: boolean;
}

export function AIDiagnosis({ route, isPremium }: AIDiagnosisProps) {
  const { t } = useI18n();
  const { user } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleAnalyze = () => {
    if (!isPremium) return;
    setIsAnalyzing(true);
    // 模拟AI分析过程
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResults(true);
    }, 2000);
  };

  // 模拟的诊断结果
  const diagnosisResults = {
    score: 72,
    issues: [
      { type: 'warning', message: t('diagnosis.issue1') },
      { type: 'warning', message: t('diagnosis.issue2') },
    ],
    suggestions: [
      t('diagnosis.suggestion1'),
      t('diagnosis.suggestion2'),
    ],
    strengths: [
      t('diagnosis.strength1'),
      t('diagnosis.strength2'),
    ],
  };

  return (
    <div className="bg-white/5 border border-white/20 rounded-xl p-6 mt-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-violet-500/30 to-purple-500/30 rounded-xl border border-violet-400/30 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-violet-400" />
        </div>
        <h3 className="text-xl font-semibold text-white">{t('diagnosis.title')}</h3>
      </div>

      <p className="text-blue-200/80 mb-4">{t('diagnosis.description')}</p>

      {!isPremium ? (
        // 未付费状态
        <div className="bg-white/10 rounded-xl p-6 text-center">
          <Lock className="w-10 h-10 text-violet-400 mx-auto mb-3" />
          <p className="text-white font-semibold mb-2">{t('diagnosis.locked')}</p>
          <p className="text-blue-200/70 text-sm mb-4">{t('diagnosis.unlockHint')}</p>
          <button 
            onClick={() => window.location.href = `/pricing?route=${route}`}
            className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-violet-400 to-purple-500 transition-all"
          >
            {t('diagnosis.unlockButton')}
          </button>
        </div>
      ) : !showResults ? (
        // 付费但未分析状态
        <div className="text-center">
          <button 
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-violet-400 to-purple-500 transition-all disabled:opacity-50 flex items-center gap-2 mx-auto"
          >
            {isAnalyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t('diagnosis.analyzing')}
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                {t('diagnosis.startButton')}
              </>
            )}
          </button>
          <p className="text-blue-200/60 text-sm mt-3">{t('diagnosis.note')}</p>
        </div>
      ) : (
        // 分析结果
        <div className="space-y-4">
          {/* 总分 */}
          <div className="bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-xl p-4 flex items-center gap-4">
            <BarChart3 className="w-8 h-8 text-violet-400" />
            <div>
              <p className="text-white font-semibold">{t('diagnosis.scoreLabel')}</p>
              <p className="text-3xl font-bold text-violet-400">{diagnosisResults.score}/100</p>
            </div>
          </div>

          {/* 问题 */}
          <div>
            <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-400" />
              {t('diagnosis.issues')}
            </h4>
            <div className="space-y-2">
              {diagnosisResults.issues.map((issue, index) => (
                <div key={index} className="bg-orange-500/10 border border-orange-400/30 rounded-lg p-3 text-orange-200">
                  {issue.message}
                </div>
              ))}
            </div>
          </div>

          {/* 建议 */}
          <div>
            <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-cyan-400" />
              {t('diagnosis.suggestions')}
            </h4>
            <div className="space-y-2">
              {diagnosisResults.suggestions.map((suggestion, index) => (
                <div key={index} className="bg-cyan-500/10 border border-cyan-400/30 rounded-lg p-3 text-cyan-200">
                  {suggestion}
                </div>
              ))}
            </div>
          </div>

          {/* 优势 */}
          <div>
            <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              {t('diagnosis.strengths')}
            </h4>
            <div className="space-y-2">
              {diagnosisResults.strengths.map((strength, index) => (
                <div key={index} className="bg-emerald-500/10 border border-emerald-400/30 rounded-lg p-3 text-emerald-200">
                  {strength}
                </div>
              ))}
            </div>
          </div>

          {/* 重新分析按钮 */}
          <button 
            onClick={() => setShowResults(false)}
            className="text-violet-400 hover:text-violet-300 text-sm underline"
          >
            {t('diagnosis.reanalyze')}
          </button>
        </div>
      )}
    </div>
  );
}
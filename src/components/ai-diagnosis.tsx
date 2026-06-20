'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n-context';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { ScoreBar } from '@/components/ui/score-bar';

interface AIDiagnosisProps {
  route: string;
  budget: string;
  goal: string;
  planData?: Record<string, unknown>;
  isPremium?: boolean;
}

interface DiagnosisResult {
  score: number;
  issues: string[];
  suggestions: string[];
  strengths: string[];
}

export function AIDiagnosis({ route, budget, goal, planData, isPremium = false }: AIDiagnosisProps) {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const router = useRouter();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runDiagnosis = async () => {
    if (!isPremium) {
      // 未付费用户跳转到定价页面
      const routeParam = route === 'retailer' ? 'retailer' : 
                         route === 'manufacturer' ? 'manufacturer' : 
                         route === 'local_service' ? 'local_service' : 'brand';
      router.push(`/pricing?route=${routeParam}`);
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/ai-diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          route,
          budget,
          goal,
          planData,
          locale,
          userId: user?.id,
          tierKey: 'free', // 默认免费层，实际应根据用户订阅状态设置
        })
      });

      if (!response.ok) {
        // 处理额度不足(402)
        if (response.status === 402) {
          try {
            const errorData = await response.json();
            if (errorData.error === 'credits_exhausted') {
              setError(errorData.message);
              // 如果有actions，显示升级引导
              if (errorData.actions && errorData.actions.length > 0) {
                // 免费用户显示升级按钮
                const upgradeAction = errorData.actions.find((a: { label: string; link: string }) => a.link === '/pricing');
                if (upgradeAction) {
                  // 3秒后自动跳转到pricing
                  setTimeout(() => {
                    router.push('/pricing');
                  }, 3000);
                }
              }
            } else {
              setError(t('aiDiagnosis.error'));
            }
          } catch {
            setError(t('aiDiagnosis.error'));
          }
        } else {
          throw new Error(t('aiDiagnosis.error'));
        }
        setIsAnalyzing(false);
        return;
      }

      // 处理流式响应
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ') && !line.includes('[DONE]')) {
            const data = line.slice(6);
            if (data && !data.includes('error')) {
              fullContent += data;
            }
          }
        }
      }

      // 解析JSON结果
      // 清理可能的额外字符，提取JSON部分
      let jsonStr = fullContent.trim();
      
      // 尝试找到JSON的开始和结束位置
      const jsonStart = jsonStr.indexOf('{');
      const jsonEnd = jsonStr.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        jsonStr = jsonStr.slice(jsonStart, jsonEnd + 1);
      }

      try {
        const parsed = JSON.parse(jsonStr);
        setResult({
          score: parsed.score || 75,
          issues: parsed.issues || [],
          suggestions: parsed.suggestions || [],
          strengths: parsed.strengths || []
        });
      } catch {
        // 如果JSON解析失败，使用默认值
        setResult({
          score: 75,
          issues: [t('aiDiagnosis.defaultIssue')],
          suggestions: [t('aiDiagnosis.defaultSuggestion')],
          strengths: [t('aiDiagnosis.defaultStrength')]
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('aiDiagnosis.error'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/20 rounded-xl p-6 mt-8">
      {/* 标题 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-lg flex items-center justify-center border border-purple-400/30">
          <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.727.727M21 12h-1M4 12H3m3.343-5.657l-.727-.727m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white">{t('diagnosis.title')}</h3>
      </div>

      {!isPremium ? (
        /* 未付费用户 - 显示解锁提示 */
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-white/70 mb-2">{t('diagnosis.unlockHint')}</p>
          <button
            onClick={runDiagnosis}
            className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-400 to-blue-500 transition-all duration-300 shadow-lg shadow-purple-500/30"
          >
            {t('diagnosis.unlockButton')}
          </button>
        </div>
      ) : (
        /* 付费用户 - 显示AI诊断功能 */
        <div>
          {/* 运行诊断按钮 */}
          {!result && !isAnalyzing && (
            <div className="text-center py-8">
              <p className="text-white/70 mb-2">{t('diagnosis.description')}</p>
              <p className="text-white/50 text-sm mb-4">{t('diagnosis.note')}</p>
              <button
                onClick={runDiagnosis}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:from-cyan-400 to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/30 flex items-center gap-2 mx-auto"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {t('diagnosis.startButton')}
              </button>
            </div>
          )}

          {/* 加载状态 */}
          {isAnalyzing && (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white/70">{t('diagnosis.analyzing')}</p>
            </div>
          )}

          {/* 错误状态 */}
          {error && (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-red-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.542 0 2.282-1.037 2.282-2.084V9.084C21 8.037 20.26 7 18.718 7H5.282C3.74 7 3 8.037 3 9.084v7.832C3 18.963 3.74 20 5.282 20z" />
                </svg>
              </div>
              <p className="text-red-400">{error}</p>
              <button
                onClick={runDiagnosis}
                className="mt-4 text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                {t('diagnosis.reanalyze')}
              </button>
            </div>
          )}

          {/* 诊断结果 */}
          {result && (
            <div className="space-y-6">
              {/* 综合评分 */}
              <div className="bg-black/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/80">{t('diagnosis.scoreLabel')}</span>
                  <span className={`text-2xl font-bold ${
                    result.score >= 80 ? 'text-green-400' : 
                    result.score >= 60 ? 'text-yellow-400' : 'text-red-400'
                  }`}>{result.score}</span>
                </div>
                <ScoreBar score={result.score} />
              </div>

              {/* 潜在问题 */}
              {result.issues.length > 0 && (
                <div className="bg-red-500/10 border border-red-400/20 rounded-lg p-4">
                  <h4 className="text-red-400 font-medium mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.542 0 2.282-1.037 2.282-2.084V9.084C21 8.037 20.26 7 18.718 7H5.282C3.74 7 3 8.037 3 9.084v7.832C3 18.963 3.74 20 5.282 20z" />
                    </svg>
                    {t('diagnosis.issues')}
                  </h4>
                  <ul className="space-y-2">
                    {result.issues.map((issue, index) => (
                      <li key={index} className="text-white/70 text-sm flex items-start gap-2">
                        <span className="text-red-400 mt-1">•</span>
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 优化建议 */}
              {result.suggestions.length > 0 && (
                <div className="bg-cyan-500/10 border border-cyan-400/20 rounded-lg p-4">
                  <h4 className="text-cyan-400 font-medium mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t('diagnosis.suggestions')}
                  </h4>
                  <ul className="space-y-2">
                    {result.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-white/70 text-sm flex items-start gap-2">
                        <span className="text-cyan-400 mt-1">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 当前优势 */}
              {result.strengths.length > 0 && (
                <div className="bg-green-500/10 border border-green-400/20 rounded-lg p-4">
                  <h4 className="text-green-400 font-medium mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t('diagnosis.strengths')}
                  </h4>
                  <ul className="space-y-2">
                    {result.strengths.map((strength, index) => (
                      <li key={index} className="text-white/70 text-sm flex items-start gap-2">
                        <span className="text-green-400 mt-1">•</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 重新分析按钮 */}
              <div className="text-center">
                <button
                  onClick={runDiagnosis}
                  className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-2 mx-auto"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {t('diagnosis.reanalyze')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
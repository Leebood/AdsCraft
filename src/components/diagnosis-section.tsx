'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/lib/i18n-context';

interface DiagnosisSectionProps {
  diagnosisData?: {
    issues: string[];
    reasons: string[];
    severity: string;
  };
}

export function DiagnosisSection({ diagnosisData }: DiagnosisSectionProps) {
  const { locale } = useI18n();
  
  // 默认诊断数据（示例）
  const defaultDiagnosis = {
    issues: [
      locale === 'zh' ? 'CTR偏低（0.8%），低于行业平均1.5%' : 'Low CTR (0.8%), below industry avg 1.5%',
      locale === 'zh' ? 'CPA偏高（$45），目标应为$15-25' : 'High CPA ($45), target should be $15-25',
      locale === 'zh' ? '受众定向过宽，浪费预算' : 'Audience targeting too broad, wasting budget',
    ],
    reasons: [
      locale === 'zh' ? '广告素材吸引力不足，缺少前3秒hook' : 'Ad creative lacks appeal, missing first 3s hook',
      locale === 'zh' ? '出价策略过于保守，导致竞争劣势' : 'Bid strategy too conservative, losing competition',
      locale === 'zh' ? '转化事件设置不精准，影响算法学习' : 'Conversion event not precise, affecting algorithm learning',
    ],
    severity: locale === 'zh' ? '中高风险' : 'Medium-High Risk'
  };
  
  const data = diagnosisData || defaultDiagnosis;

  return (
    <Card className="bg-white/5 border-white/20 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border border-cyan-400/50 flex items-center justify-center text-cyan-300 font-bold">
            1
          </div>
          <CardTitle className="text-white">
            {locale === 'zh' ? '诊断分析' : 'Diagnosis Analysis'}
          </CardTitle>
          <span className={`px-3 py-1 rounded-full text-sm ${
            data.severity.includes('高') || data.severity.includes('High')
              ? 'bg-red-500/20 text-red-400 border border-red-400/30'
              : 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/30'
          }`}>
            {data.severity}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 问题诊断 */}
        <div>
          <h4 className="text-cyan-300 font-medium mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {locale === 'zh' ? '核心问题' : 'Core Issues'}
          </h4>
          <ul className="space-y-2">
            {data.issues.map((issue, idx) => (
              <li key={idx} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                <span className="text-red-400 font-bold text-sm">{idx + 1}.</span>
                <span className="text-blue-100">{issue}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* 原因分析 */}
        <div>
          <h4 className="text-purple-300 font-medium mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.586 13H16v2a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd" />
            </svg>
            {locale === 'zh' ? '问题根因' : 'Root Causes'}
          </h4>
          <ul className="space-y-2">
            {data.reasons.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                <span className="text-purple-400 font-bold text-sm">{idx + 1}.</span>
                <span className="text-blue-100">{reason}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* 免费提示 */}
        <div className="p-4 bg-cyan-500/10 rounded-lg border border-cyan-400/30">
          <p className="text-cyan-300 text-sm">
            {locale === 'zh' 
              ? '✅ 诊断分析完整可见。下方「最优配置」给出关键参数区间，完整参数需订阅解锁。' 
              : '✅ Full diagnosis visible. Below shows key parameter ranges, full config requires subscription.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
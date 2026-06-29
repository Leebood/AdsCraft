'use client';

/**
 * Facebook Review Report Component
 * 5-Page Report based on AOS.md
 */

import { useState } from 'react';
import type { AOSReport, Diagnosis, MetricAnalysis, ActionPlanItem } from '@/lib/are';
import { getScoreColor, getScoreGrade, getScoreStatus } from '@/lib/are';

interface FacebookReportProps {
  report: AOSReport;
  locale?: 'en' | 'zh';
}

type PageType = 'summary' | 'comparison' | 'metrics' | 'diagnosis' | 'actions';

export function FacebookReport({ report, locale = 'en' }: FacebookReportProps) {
  const [activePage, setActivePage] = useState<PageType>('summary');
  
  const t = locale === 'en' ? en : zh;
  
  const pages: { id: PageType; label: string }[] = [
    { id: 'summary', label: t.summary },
    { id: 'comparison', label: t.comparison },
    { id: 'metrics', label: t.metrics },
    { id: 'diagnosis', label: t.diagnosis },
    { id: 'actions', label: t.actions },
  ];
  
  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Navigation */}
      <div className="flex border-b border-white/10 mb-6">
        {pages.map(page => (
          <button
            key={page.id}
            onClick={() => setActivePage(page.id)}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activePage === page.id
                ? 'text-[#00D4FF] border-b-2 border-[#00D4FF]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {page.label}
          </button>
        ))}
      </div>
      
      {/* Content */}
      <div className="min-h-[500px]">
        {activePage === 'summary' && <SummaryPage report={report} locale={locale} />}
        {activePage === 'comparison' && <ComparisonPage report={report} locale={locale} />}
        {activePage === 'metrics' && <MetricsPage report={report} locale={locale} />}
        {activePage === 'diagnosis' && <DiagnosisPage report={report} locale={locale} />}
        {activePage === 'actions' && <ActionsPage report={report} locale={locale} />}
      </div>
    </div>
  );
}

// ==================== Page 1: Executive Summary ====================

function SummaryPage({ report, locale }: { report: AOSReport; locale: 'en' | 'zh' }) {
  const t = locale === 'en' ? en : zh;
  const scoreColor = getScoreColor(report.scores.overall);
  const scoreGrade = getScoreGrade(report.scores.overall);
  
  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="bg-[#101827] border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{t.overallScore}</h2>
            <p className="text-slate-400 mt-1">{report.campaign_name}</p>
          </div>
          <div className="text-right">
            <div 
              className="text-5xl font-bold"
              style={{ color: scoreColor }}
            >
              {report.scores.overall}
            </div>
            <div className="text-slate-400 text-sm">/ 100</div>
          </div>
        </div>
        
        {/* Dimension Scores */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <DimensionScore label={t.performance} score={report.scores.performance} />
          <DimensionScore label={t.efficiency} score={report.scores.efficiency} />
          <DimensionScore label={t.delivery} score={report.scores.delivery} />
          <DimensionScore label={t.risk} score={report.scores.risk} />
        </div>
      </div>
      
      {/* Key Findings */}
      <div className="bg-[#101827] border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">{t.keyFindings}</h3>
        <div className="prose prose-inverse prose-sm max-w-none">
          <p className="text-slate-300 leading-relaxed">
            {report.llm_explanation.executive_summary}
          </p>
        </div>
      </div>
      
      {/* Warnings */}
      {report.warnings.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-amber-400 mb-2">{t.warnings}</h3>
          <ul className="space-y-2">
            {report.warnings.map((warning, i) => (
              <li key={i} className="text-amber-200 text-sm flex items-start gap-2">
                <span className="text-amber-400">⚠️</span>
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Report Metadata */}
      <div className="bg-[#101827] border border-white/10 rounded-xl p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-slate-400">{t.reportId}</span>
            <p className="text-white font-mono text-xs mt-1">{report.report_id}</p>
          </div>
          <div>
            <span className="text-slate-400">{t.dateRange}</span>
            <p className="text-white mt-1">{report.date_range}</p>
          </div>
          <div>
            <span className="text-slate-400">{t.generatedAt}</span>
            <p className="text-white mt-1">{new Date(report.generated_at).toLocaleDateString()}</p>
          </div>
          <div>
            <span className="text-slate-400">{t.analysisTime}</span>
            <p className="text-white mt-1">{report.metadata.analysis_duration_ms}ms</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== Page 2: Campaign Comparison ====================

function ComparisonPage({ report, locale }: { report: AOSReport; locale: 'en' | 'zh' }) {
  const t = locale === 'en' ? en : zh;
  
  // Group evidence by campaign
  const campaigns = new Map<string, {
    metrics: Map<string, { value: string; status: string }>;
    score: number;
  }>();
  
  for (const ev of report.evidence) {
    if (!campaigns.has(ev.campaign)) {
      campaigns.set(ev.campaign, { metrics: new Map(), score: 0 });
    }
    const campaign = campaigns.get(ev.campaign)!;
    campaign.metrics.set(ev.metric, {
      value: ev.value_formatted,
      status: ev.status,
    });
  }
  
  // Calculate score per campaign based on diagnoses
  for (const d of report.diagnosis) {
    const campaign = campaigns.get(d.campaign);
    if (campaign) {
      if (d.status === 'critical') campaign.score -= 20;
      else if (d.status === 'warning') campaign.score -= 10;
      else if (d.status === 'good') campaign.score += 5;
    }
  }
  
  // Normalize scores
  for (const [, campaign] of campaigns) {
    campaign.score = Math.max(0, Math.min(100, 80 + campaign.score));
  }
  
  return (
    <div className="bg-[#101827] border border-white/10 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-white/10">
        <h3 className="text-lg font-semibold text-white">{t.campaignComparison}</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-white/5">
              <th className="text-left px-6 py-3 text-sm font-medium text-slate-400">{t.campaign}</th>
              <th className="text-center px-4 py-3 text-sm font-medium text-slate-400">{t.score}</th>
              <th className="text-center px-4 py-3 text-sm font-medium text-slate-400">CTR</th>
              <th className="text-center px-4 py-3 text-sm font-medium text-slate-400">CPC</th>
              <th className="text-center px-4 py-3 text-sm font-medium text-slate-400">ROAS</th>
              <th className="text-center px-4 py-3 text-sm font-medium text-slate-400">Frequency</th>
            </tr>
          </thead>
          <tbody>
            {Array.from(campaigns.entries()).map(([name, data]) => (
              <tr key={name} className="border-t border-white/5 hover:bg-white/5">
                <td className="px-6 py-4 text-white font-medium">{name}</td>
                <td className="px-4 py-4 text-center">
                  <span 
                    className="inline-block px-2 py-1 rounded text-sm font-bold"
                    style={{ 
                      color: getScoreColor(data.score),
                      backgroundColor: `${getScoreColor(data.score)}20`
                    }}
                  >
                    {data.score}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <MetricCell value={data.metrics.get('CTR')?.value || '-'} status={data.metrics.get('CTR')?.status} />
                </td>
                <td className="px-4 py-4 text-center">
                  <MetricCell value={data.metrics.get('CPC')?.value || '-'} status={data.metrics.get('CPC')?.status} />
                </td>
                <td className="px-4 py-4 text-center">
                  <MetricCell value={data.metrics.get('ROAS')?.value || '-'} status={data.metrics.get('ROAS')?.status} />
                </td>
                <td className="px-4 py-4 text-center">
                  <MetricCell value={data.metrics.get('Frequency')?.value || '-'} status={data.metrics.get('Frequency')?.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==================== Page 3: Metric Analysis ====================

function MetricsPage({ report, locale }: { report: AOSReport; locale: 'en' | 'zh' }) {
  const t = locale === 'en' ? en : zh;
  
  return (
    <div className="space-y-4">
      {report.metric_analysis.map((analysis, i) => (
        <MetricCard key={i} analysis={analysis} report={report} locale={locale} />
      ))}
    </div>
  );
}

function MetricCard({ analysis, report, locale }: { analysis: MetricAnalysis; report: AOSReport; locale: 'en' | 'zh' }) {
  const t = locale === 'en' ? en : zh;
  const evidence = report.evidence.find(e => e.evidence_id === analysis.evidence_id);
  const diagnosis = report.diagnosis.find(d => d.evidence_id === analysis.evidence_id);
  
  const statusColors: Record<string, string> = {
    on_target: 'text-green-400 bg-green-500/10 border-green-500/30',
    above_benchmark: 'text-green-400 bg-green-500/10 border-green-500/30',
    below_benchmark: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    insufficient_data: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
  };
  
  const statusLabels: Record<string, string> = {
    on_target: t.onTarget,
    above_benchmark: t.onTarget,
    below_benchmark: t.belowBenchmark,
    insufficient_data: t.insufficientData,
  };
  
  return (
    <div className="bg-[#101827] border border-white/10 rounded-xl p-6">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-lg font-semibold text-white">{analysis.metric}</h4>
          {evidence && (
            <p className="text-xs text-slate-500 font-mono mt-1">
              Evidence: {evidence.evidence_id}
            </p>
          )}
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[analysis.status]}`}>
          {statusLabels[analysis.status]}
        </span>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div>
          <span className="text-slate-400 text-sm">{t.value}</span>
          <p className="text-2xl font-bold text-white mt-1">{analysis.value_formatted}</p>
        </div>
        <div>
          <span className="text-slate-400 text-sm">{t.benchmark}</span>
          <p className="text-2xl font-bold text-slate-300 mt-1">{analysis.benchmark_formatted}</p>
        </div>
        <div>
          <span className="text-slate-400 text-sm">{t.deviation}</span>
          <p className={`text-2xl font-bold mt-1 ${analysis.deviation_percentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {analysis.deviation_percentage > 0 ? '+' : ''}{analysis.deviation_percentage}%
          </p>
        </div>
      </div>
      
      {/* Trend */}
      {analysis.trend && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <span className="text-slate-400 text-sm">{t.trend}:</span>
          <span className={`ml-2 text-sm font-medium ${
            analysis.trend === 'increasing' ? 'text-green-400' :
            analysis.trend === 'declining' ? 'text-red-400' : 'text-slate-300'
          }`}>
            {analysis.trend === 'increasing' ? '📈' : analysis.trend === 'declining' ? '📉' : '➡️'}
            {' '}{analysis.trend.charAt(0).toUpperCase() + analysis.trend.slice(1)}
          </span>
        </div>
      )}
      
      {/* Relationships */}
      {analysis.relationships && analysis.relationships.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <span className="text-slate-400 text-sm">{t.relatedIssues}:</span>
          <div className="mt-2 space-y-2">
            {analysis.relationships.map((rel, i) => (
              <div key={i} className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-blue-300 text-sm font-medium">{rel.diagnosis}</p>
                {rel.explanation && (
                  <p className="text-slate-400 text-xs mt-1">{rel.explanation}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Diagnosis */}
      {diagnosis && diagnosis.status !== 'good' && diagnosis.status !== 'excellent' && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <div className={`rounded-lg p-3 ${
            diagnosis.status === 'critical' ? 'bg-red-500/10 border border-red-500/30' :
            diagnosis.status === 'warning' ? 'bg-amber-500/10 border border-amber-500/30' :
            'bg-blue-500/10 border border-blue-500/30'
          }`}>
            <p className="text-sm font-medium text-white">
              {diagnosis.rule_id}: {diagnosis.condition}
            </p>
            <p className="text-xs text-slate-300 mt-1">{diagnosis.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== Page 4: Diagnosis ====================

function DiagnosisPage({ report, locale }: { report: AOSReport; locale: 'en' | 'zh' }) {
  const t = locale === 'en' ? en : zh;
  
  // Filter out good/excellent diagnoses
  const issues = report.diagnosis.filter(d => d.status !== 'good' && d.status !== 'excellent');
  
  return (
    <div className="space-y-6">
      {/* LLM Diagnosis Text */}
      <div className="bg-[#101827] border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">{t.diagnosisAnalysis}</h3>
        <div className="prose prose-inverse prose-sm max-w-none">
          {report.llm_explanation.diagnosis.split('\n\n').map((paragraph, i) => (
            <p key={i} className="text-slate-300 leading-relaxed mb-4">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
      
      {/* Diagnosis List */}
      {issues.length > 0 && (
        <div className="bg-[#101827] border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">{t.diagnosisList}</h3>
          <div className="space-y-3">
            {issues.map((d, i) => (
              <DiagnosisItem key={i} diagnosis={d} />
            ))}
          </div>
        </div>
      )}
      
      {issues.length === 0 && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">
          <p className="text-green-400 text-lg font-medium">{t.noIssues}</p>
        </div>
      )}
    </div>
  );
}

function DiagnosisItem({ diagnosis }: { diagnosis: Diagnosis }) {
  const statusStyles = {
    critical: 'bg-red-500/10 border-red-500/30 text-red-400',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    good: 'bg-green-500/10 border-green-500/30 text-green-400',
    excellent: 'bg-green-500/10 border-green-500/30 text-green-400',
  };
  
  const severityLabels = {
    high: '🔴 High',
    medium: '🟡 Medium',
    low: '🔵 Low',
    none: '',
  };
  
  return (
    <div className={`border rounded-lg p-4 ${statusStyles[diagnosis.status]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-sm font-medium">{diagnosis.rule_id}</p>
          <p className="text-white mt-1">{diagnosis.condition}</p>
        </div>
        <span className="text-xs">{severityLabels[diagnosis.severity]}</span>
      </div>
      <div className="mt-2 text-sm">
        <span className="text-slate-400">Value: </span>
        <span className="text-white">{diagnosis.value_formatted}</span>
        <span className="text-slate-400 ml-4">Evidence: </span>
        <span className="text-white font-mono text-xs">{diagnosis.evidence_id}</span>
      </div>
      <p className="text-slate-300 text-sm mt-2">{diagnosis.recommendation}</p>
    </div>
  );
}

// ==================== Page 5: Action Plan ====================

function ActionsPage({ report, locale }: { report: AOSReport; locale: 'en' | 'zh' }) {
  const t = locale === 'en' ? en : zh;
  
  return (
    <div className="space-y-6">
      {/* LLM Action Plan Text */}
      <div className="bg-[#101827] border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">{t.actionPlan}</h3>
        <div className="prose prose-inverse prose-sm max-w-none whitespace-pre-line">
          <p className="text-slate-300 leading-relaxed">
            {report.llm_explanation.action_plan}
          </p>
        </div>
      </div>
      
      {/* Action Items */}
      {report.action_plan.length > 0 && (
        <div className="bg-[#101827] border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">{t.actionItems}</h3>
          <div className="space-y-4">
            {report.action_plan.map((action, i) => (
              <ActionItem key={i} action={action} />
            ))}
          </div>
        </div>
      )}
      
      {report.action_plan.length === 0 && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">
          <p className="text-green-400 text-lg font-medium">{t.noActions}</p>
        </div>
      )}
    </div>
  );
}

function ActionItem({ action }: { action: ActionPlanItem }) {
  const priorityStyles = {
    P0: 'bg-red-500/10 border-red-500/30',
    P1: 'bg-amber-500/10 border-amber-500/30',
    P2: 'bg-blue-500/10 border-blue-500/30',
  };
  
  const priorityColors = {
    P0: 'text-red-400',
    P1: 'text-amber-400',
    P2: 'text-blue-400',
  };
  
  return (
    <div className={`border rounded-lg p-4 ${priorityStyles[action.priority]}`}>
      <div className="flex items-start gap-3">
        <span className={`text-sm font-bold ${priorityColors[action.priority]}`}>
          {action.priority}
        </span>
        <div className="flex-1">
          <h4 className="text-white font-medium">{action.action}</h4>
          <p className="text-slate-400 text-sm mt-1">{action.issue}</p>
          <p className="text-slate-300 text-sm mt-2">{action.details}</p>
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className="text-slate-500">Expected Impact:</span>
            <span className="text-green-400">{action.expected_impact}</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className="text-slate-500">Evidence:</span>
            {action.related_evidence.map(id => (
              <span key={id} className="text-slate-400 font-mono">{id}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== Helper Components ====================

function DimensionScore({ label, score }: { label: string; score: number }) {
  const color = getScoreColor(score);
  
  return (
    <div className="text-center">
      <div 
        className="text-2xl font-bold"
        style={{ color }}
      >
        {score}
      </div>
      <div className="text-slate-400 text-xs mt-1">{label}</div>
    </div>
  );
}

function MetricCell({ value, status }: { value: string; status?: string }) {
  const color = status === 'above' ? 'text-green-400' : 
                status === 'below' ? 'text-amber-400' : 
                'text-white';
  
  return <span className={`${color} text-sm`}>{value}</span>;
}

// ==================== Translations ====================

const en = {
  summary: 'Executive Summary',
  comparison: 'Campaign Comparison',
  metrics: 'Metric Analysis',
  diagnosis: 'Diagnosis',
  actions: 'Action Plan',
  overallScore: 'Overall Score',
  performance: 'Performance',
  efficiency: 'Efficiency',
  delivery: 'Delivery',
  risk: 'Risk',
  keyFindings: 'Key Findings',
  warnings: 'Warnings',
  reportId: 'Report ID',
  dateRange: 'Date Range',
  generatedAt: 'Generated At',
  analysisTime: 'Analysis Time',
  campaignComparison: 'Campaign Comparison',
  campaign: 'Campaign',
  score: 'Score',
  value: 'Value',
  benchmark: 'Benchmark',
  deviation: 'Deviation',
  trend: 'Trend',
  relatedIssues: 'Related Issues',
  onTarget: 'On Target',
  belowBenchmark: 'Below Benchmark',
  insufficientData: 'Insufficient Data',
  diagnosisAnalysis: 'Diagnosis Analysis',
  diagnosisList: 'Diagnosis List',
  noIssues: 'No issues detected. Campaign is performing well!',
  actionPlan: 'Action Plan',
  actionItems: 'Action Items',
  noActions: 'No immediate actions required. Continue monitoring.',
};

const zh = {
  summary: '执行摘要',
  comparison: '广告系列对比',
  metrics: '指标分析',
  diagnosis: '诊断结果',
  actions: '行动计划',
  overallScore: '综合评分',
  performance: '效果',
  efficiency: '效率',
  delivery: '投放',
  risk: '风险',
  keyFindings: '主要发现',
  warnings: '警告',
  reportId: '报告 ID',
  dateRange: '日期范围',
  generatedAt: '生成时间',
  analysisTime: '分析耗时',
  campaignComparison: '广告系列对比',
  campaign: '广告系列',
  score: '评分',
  value: '数值',
  benchmark: '基准值',
  deviation: '偏差',
  trend: '趋势',
  relatedIssues: '关联问题',
  onTarget: '达标',
  belowBenchmark: '低于基准',
  insufficientData: '数据不足',
  diagnosisAnalysis: '诊断分析',
  diagnosisList: '诊断列表',
  noIssues: '未发现问题，广告系列表现良好！',
  actionPlan: '行动计划',
  actionItems: '行动项',
  noActions: '暂无需要立即执行的行动。继续监控。',
};

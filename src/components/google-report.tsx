/**
 * Google Ads Report Component
 * 
 * 5-Page Report 格式：
 * 1. Executive Summary（执行摘要）
 * 2. Campaign Comparison（Campaign 对比）
 * 3. Metric Analysis（指标分析）
 * 4. Diagnosis（诊断结果）
 * 5. Action Plan（行动建议）
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  Target,
  DollarSign,
  MousePointerClick,
  BarChart3,
  Award,
  Lightbulb
} from 'lucide-react';
import { Evidence, MetricAnalysis, Diagnosis, Scores, ActionPlanItem, LLMExplanation } from '@/lib/are/types';

// ============================================================================
// Types
// ============================================================================

export interface GoogleReportData {
  report_id: string;
  platform: 'google';
  campaign_name: string;
  generated_at: string;
  date_range: string;
  scores: Scores;
  evidence: Evidence[];
  metric_analysis: MetricAnalysis[];
  diagnosis: Diagnosis[];
  action_plan: ActionPlanItem[];
  llm_explanation: LLMExplanation;
  warnings?: Array<{ type: string; message: string }>;
}

interface GoogleReportProps {
  report: GoogleReportData;
  locale?: 'en' | 'zh';
}

// ============================================================================
// Main Component
// ============================================================================

export function GoogleReport({ report, locale = 'en' }: GoogleReportProps) {
  const t = locale === 'en' ? translations.en : translations.zh;
  
  return (
    <div className="space-y-6">
      {/* Page 1: Executive Summary */}
      <ExecutiveSummary report={report} t={t} />
      
      {/* Page 2: Campaign Comparison */}
      <CampaignComparison report={report} t={t} />
      
      {/* Page 3: Metric Analysis */}
      <MetricAnalysisPage report={report} t={t} />
      
      {/* Page 4: Diagnosis */}
      <DiagnosisPage report={report} t={t} />
      
      {/* Page 5: Action Plan */}
      <ActionPlanPage report={report} t={t} />
      
      {/* Footer */}
      <ReportFooter report={report} t={t} />
    </div>
  );
}

// ============================================================================
// Page 1: Executive Summary
// ============================================================================

function ExecutiveSummary({ report, t }: { report: GoogleReportData; t: typeof translations.en }) {
  const { scores, diagnosis, warnings } = report;
  
  // 统计问题数量
  const criticalCount = diagnosis.filter(d => d.status === 'critical').length;
  const warningCount = diagnosis.filter(d => d.status === 'warning').length;
  const goodCount = diagnosis.filter(d => d.status === 'good' || d.status === 'excellent').length;
  
  return (
    <Card className="bg-slate-900/50 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl text-white flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-blue-400" />
              {t.executiveSummary}
            </CardTitle>
            <p className="text-slate-400 text-sm mt-1">
              {report.campaign_name} · {report.date_range}
            </p>
          </div>
          <OverallScore score={scores.overall} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ScoreCard label={t.performance} score={scores.performance} icon={<Target className="h-4 w-4" />} />
          <ScoreCard label={t.efficiency} score={scores.efficiency} icon={<MousePointerClick className="h-4 w-4" />} />
          <ScoreCard label={t.delivery} score={scores.delivery} icon={<BarChart3 className="h-4 w-4" />} />
          <ScoreCard label={t.risk} score={scores.risk} icon={<AlertCircle className="h-4 w-4" />} />
        </div>
        
        {/* Key Findings */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">{t.keyFindings}</h3>
          <div className="grid grid-cols-3 gap-4">
            <FindingCard 
              type="critical" 
              count={criticalCount} 
              label={t.critical}
              color="red"
            />
            <FindingCard 
              type="warning" 
              count={warningCount} 
              label={t.warning}
              color="yellow"
            />
            <FindingCard 
              type="good" 
              count={goodCount} 
              label={t.good}
              color="green"
            />
          </div>
        </div>
        
        {/* Warnings */}
        {warnings && warnings.length > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 text-yellow-400 mb-2">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">{t.warnings}</span>
            </div>
            <ul className="space-y-1">
              {warnings.map((w, i) => (
                <li key={i} className="text-yellow-300 text-sm">{w.message}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Executive Summary Text */}
        <div className="bg-slate-800/50 rounded-lg p-4">
          <p className="text-slate-300 text-sm leading-relaxed">
            {report.llm_explanation.executive_summary}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Page 2: Campaign Comparison
// ============================================================================

function CampaignComparison({ report, t }: { report: GoogleReportData; t: typeof translations.en }) {
  const { evidence } = report;
  
  // 提取关键指标
  const metrics = {
    CTR: evidence.find(e => e.metric === 'CTR'),
    CPC: evidence.find(e => e.metric === 'CPC'),
    CVR: evidence.find(e => e.metric === 'CVR'),
    ROAS: evidence.find(e => e.metric === 'ROAS'),
    QualityScore: evidence.find(e => e.metric === 'Quality Score'),
  };
  
  return (
    <Card className="bg-slate-900/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-xl text-white flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-400" />
          {t.campaignComparison}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-slate-400 font-medium">{t.metric}</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">{t.value}</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">{t.benchmark}</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">{t.status}</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(metrics).map(([key, metric]) => (
                metric && (
                  <tr key={key} className="border-b border-slate-800">
                    <td className="py-3 px-4 text-white font-medium">{metric.metric}</td>
                    <td className="py-3 px-4 text-right text-white">{metric.value_formatted}</td>
                    <td className="py-3 px-4 text-right text-slate-400">{metric.benchmark_formatted}</td>
                    <td className="py-3 px-4 text-right">
                      <StatusBadge status={metric.status} />
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Page 3: Metric Analysis
// ============================================================================

function MetricAnalysisPage({ report, t }: { report: GoogleReportData; t: typeof translations.en }) {
  const { metric_analysis, evidence } = report;
  
  return (
    <Card className="bg-slate-900/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-xl text-white flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-400" />
          {t.metricAnalysis}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {metric_analysis.map((metric, index) => {
          const ev = evidence.find(e => e.evidence_id === metric.evidence_id);
          return (
            <MetricCard key={index} metric={metric} evidence={ev} t={t} />
          );
        })}
      </CardContent>
    </Card>
  );
}

function MetricCard({ metric, evidence, t }: { metric: MetricAnalysis; evidence?: Evidence; t: typeof translations.en }) {
  const isPositive = metric.status === 'above_benchmark' || metric.status === 'on_target';
  const isNegative = metric.status === 'below_benchmark';
  
  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h4 className="text-white font-medium">{metric.metric}</h4>
          {evidence && (
            <Badge variant="outline" className="text-xs text-slate-400 border-slate-600">
              {evidence.evidence_id}
            </Badge>
          )}
        </div>
        <StatusBadge status={metric.status} />
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-3">
        <div>
          <p className="text-slate-400 text-xs">{t.value}</p>
          <p className="text-white font-medium">{metric.value_formatted}</p>
        </div>
        <div>
          <p className="text-slate-400 text-xs">{t.benchmark}</p>
          <p className="text-slate-300">{metric.benchmark_formatted}</p>
        </div>
        <div>
          <p className="text-slate-400 text-xs">{t.deviation}</p>
          <p className={`font-medium ${isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-slate-300'}`}>
            {metric.deviation_percentage > 0 ? '+' : ''}{metric.deviation_percentage}%
          </p>
        </div>
      </div>
      
      {metric.trend && (
        <div className="flex items-center gap-2 text-sm">
          {metric.trend === 'increasing' && <TrendingUp className="h-4 w-4 text-green-400" />}
          {metric.trend === 'declining' && <TrendingDown className="h-4 w-4 text-red-400" />}
          {metric.trend === 'stable' && <Minus className="h-4 w-4 text-slate-400" />}
          <span className="text-slate-400">
            {t.trend}: {metric.trend}
          </span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Page 4: Diagnosis
// ============================================================================

function DiagnosisPage({ report, t }: { report: GoogleReportData; t: typeof translations.en }) {
  const { diagnosis, llm_explanation } = report;
  
  return (
    <Card className="bg-slate-900/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-xl text-white flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-blue-400" />
          {t.diagnosis}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* LLM Explanation */}
        {llm_explanation.diagnosis && (
          <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
              {llm_explanation.diagnosis}
            </p>
          </div>
        )}
        
        {/* Diagnosis List */}
        <div className="space-y-3">
          {diagnosis.map((d, index) => (
            <DiagnosisCard key={index} diagnosis={d} t={t} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function DiagnosisCard({ diagnosis, t }: { diagnosis: Diagnosis; t: typeof translations.en }) {
  const statusColors = {
    critical: 'border-red-500/50 bg-red-500/10',
    warning: 'border-yellow-500/50 bg-yellow-500/10',
    info: 'border-blue-500/50 bg-blue-500/10',
    good: 'border-green-500/50 bg-green-500/10',
    excellent: 'border-green-500/50 bg-green-500/10',
  };
  
  const statusIcons = {
    critical: <XCircle className="h-5 w-5 text-red-400" />,
    warning: <AlertCircle className="h-5 w-5 text-yellow-400" />,
    info: <AlertCircle className="h-5 w-5 text-blue-400" />,
    good: <CheckCircle2 className="h-5 w-5 text-green-400" />,
    excellent: <CheckCircle2 className="h-5 w-5 text-green-400" />,
  };
  
  return (
    <div className={`rounded-lg p-4 border ${statusColors[diagnosis.status]}`}>
      <div className="flex items-start gap-3">
        {statusIcons[diagnosis.status]}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white font-medium">{diagnosis.metric}</span>
            <Badge variant="outline" className="text-xs text-slate-400 border-slate-600">
              {diagnosis.rule_id}
            </Badge>
            <Badge variant="outline" className="text-xs text-slate-400 border-slate-600">
              {diagnosis.evidence_id}
            </Badge>
          </div>
          <p className="text-slate-300 text-sm mb-2">{diagnosis.recommendation}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Page 5: Action Plan
// ============================================================================

function ActionPlanPage({ report, t }: { report: GoogleReportData; t: typeof translations.en }) {
  const { action_plan, llm_explanation } = report;
  
  return (
    <Card className="bg-slate-900/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-xl text-white flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-blue-400" />
          {t.actionPlan}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* LLM Action Plan */}
        {llm_explanation.action_plan && (
          <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
              {llm_explanation.action_plan}
            </p>
          </div>
        )}
        
        {/* Action Items */}
        <div className="space-y-3">
          {action_plan.map((action, index) => (
            <ActionCard key={index} action={action} t={t} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ActionCard({ action, t }: { action: ActionPlanItem; t: typeof translations.en }) {
  const priorityColors = {
    P0: 'border-red-500/50 bg-red-500/10',
    P1: 'border-yellow-500/50 bg-yellow-500/10',
    P2: 'border-blue-500/50 bg-blue-500/10',
  };
  
  return (
    <div className={`rounded-lg p-4 border ${priorityColors[action.priority as keyof typeof priorityColors] || priorityColors.P2}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <Badge className={
            action.priority === 'P0' ? 'bg-red-500/20 text-red-300 border-red-500/50' :
            action.priority === 'P1' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50' :
            'bg-blue-500/20 text-blue-300 border-blue-500/50'
          }>
            {action.priority}
          </Badge>
        </div>
        <div className="flex-1">
          <h4 className="text-white font-medium mb-1">{action.action}</h4>
          <p className="text-slate-300 text-sm mb-2">{action.details}</p>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              {action.expected_impact}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Helper Components
// ============================================================================

function OverallScore({ score }: { score: number }) {
  const getColor = (s: number) => {
    if (s >= 90) return 'text-green-400';
    if (s >= 70) return 'text-blue-400';
    if (s >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };
  
  return (
    <div className="text-center">
      <div className={`text-4xl font-bold ${getColor(score)}`}>
        {score}
      </div>
      <div className="text-xs text-slate-400">Overall Score</div>
    </div>
  );
}

function ScoreCard({ label, score, icon }: { label: string; score: number; icon: React.ReactNode }) {
  const getColor = (s: number) => {
    if (s >= 90) return 'text-green-400';
    if (s >= 70) return 'text-blue-400';
    if (s >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };
  
  return (
    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-slate-400">{icon}</span>
        <span className="text-slate-400 text-xs">{label}</span>
      </div>
      <div className={`text-2xl font-bold ${getColor(score)}`}>
        {score}
      </div>
    </div>
  );
}

function FindingCard({ type, count, label, color }: { type: string; count: number; label: string; color: string }) {
  const colors = {
    red: 'border-red-500/50 bg-red-500/10',
    yellow: 'border-yellow-500/50 bg-yellow-500/10',
    green: 'border-green-500/50 bg-green-500/10',
  };
  
  const textColors = {
    red: 'text-red-400',
    yellow: 'text-yellow-400',
    green: 'text-green-400',
  };
  
  return (
    <div className={`rounded-lg p-4 border ${colors[color as keyof typeof colors]}`}>
      <div className={`text-3xl font-bold ${textColors[color as keyof typeof textColors]}`}>
        {count}
      </div>
      <div className="text-slate-400 text-sm">{label}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    above_benchmark: { label: 'Above', className: 'bg-green-500/20 text-green-300 border-green-500/50' },
    below_benchmark: { label: 'Below', className: 'bg-red-500/20 text-red-300 border-red-500/50' },
    on_target: { label: 'On Target', className: 'bg-blue-500/20 text-blue-300 border-blue-500/50' },
    insufficient_data: { label: 'N/A', className: 'bg-slate-500/20 text-slate-300 border-slate-500/50' },
  };
  
  const { label, className } = config[status] || config.insufficient_data;
  
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}

function ReportFooter({ report, t }: { report: GoogleReportData; t: typeof translations.en }) {
  return (
    <div className="text-center text-slate-500 text-xs py-4">
      <p>{t.generatedAt}: {new Date(report.generated_at).toLocaleString()}</p>
      <p>{t.reportId}: {report.report_id}</p>
      <p className="mt-2">Powered by AdsCraft Review Engine</p>
    </div>
  );
}

// ============================================================================
// Translations
// ============================================================================

const translations = {
  en: {
    executiveSummary: 'Executive Summary',
    campaignComparison: 'Campaign Comparison',
    metricAnalysis: 'Metric Analysis',
    diagnosis: 'Diagnosis',
    actionPlan: 'Action Plan',
    keyFindings: 'Key Findings',
    critical: 'Critical Issues',
    warning: 'Warnings',
    good: 'Good Performance',
    warnings: 'Warnings',
    metric: 'Metric',
    value: 'Value',
    benchmark: 'Benchmark',
    status: 'Status',
    deviation: 'Deviation',
    trend: 'Trend',
    performance: 'Performance',
    efficiency: 'Efficiency',
    delivery: 'Delivery',
    risk: 'Risk',
    generatedAt: 'Generated at',
    reportId: 'Report ID',
  },
  zh: {
    executiveSummary: '执行摘要',
    campaignComparison: 'Campaign 对比',
    metricAnalysis: '指标分析',
    diagnosis: '诊断结果',
    actionPlan: '行动建议',
    keyFindings: '关键发现',
    critical: '严重问题',
    warning: '警告',
    good: '表现良好',
    warnings: '警告',
    metric: '指标',
    value: '数值',
    benchmark: '基准值',
    status: '状态',
    deviation: '偏差',
    trend: '趋势',
    performance: '效果',
    efficiency: '效率',
    delivery: '投放',
    risk: '风险',
    generatedAt: '生成时间',
    reportId: '报告 ID',
  },
};

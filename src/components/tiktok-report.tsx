'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  AlertCircle, 
  CheckCircle2, 
  TrendingDown, 
  TrendingUp, 
  Minus,
  Video,
  AlertTriangle,
  Target,
  Zap,
  Shield,
  DollarSign
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

interface Evidence {
  evidence_id: string;
  metric: string;
  value: number;
  value_formatted: string;
  benchmark: number;
  benchmark_formatted: string;
  status: 'above' | 'below' | 'on_target';
  campaign: string;
}

interface MetricAnalysis {
  metric: string;
  evidence_id: string;
  value: number;
  value_formatted: string;
  benchmark: number;
  benchmark_formatted: string;
  status: 'above_benchmark' | 'below_benchmark' | 'on_target' | 'insufficient_data';
  deviation: number;
  deviation_percentage: number;
  trend?: 'increasing' | 'decreasing' | 'stable';
}

interface Diagnosis {
  rule_id: string;
  metric: string;
  evidence_id: string;
  value: number;
  value_formatted: string;
  condition: string;
  status: 'critical' | 'warning' | 'info' | 'good' | 'excellent';
  severity: 'high' | 'medium' | 'low' | 'none';
  recommendation: string;
  description: string;
  campaign: string;
}

interface Scores {
  overall: number;
  performance: number;
  efficiency: number;
  delivery: number;
  risk: number;
}

interface ActionPlan {
  priority: string;
  action: string;
  issue: string;
  details: string;
  expected_impact: string;
  related_evidence: string[];
  related_diagnosis: string[];
}

interface LLMExplanation {
  executive_summary: string;
  diagnosis: string;
  action_plan: string;
}

export interface TikTokReportData {
  report_id: string;
  platform: string;
  campaign_name: string;
  generated_at: string;
  date_range: string;
  scores: Scores;
  evidence: Evidence[];
  metric_analysis: MetricAnalysis[];
  diagnosis: Diagnosis[];
  action_plan: ActionPlan[];
  llm_explanation: LLMExplanation;
  warnings: Array<{ type: string; message: string }>;
  metadata: {
    has_video_data: boolean;
    data_sufficient: boolean;
  };
}

interface TikTokReportProps {
  data: TikTokReportData;
  locale?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

function getStatusColor(status: string): string {
  switch (status) {
    case 'critical': return 'text-red-500';
    case 'warning': return 'text-yellow-500';
    case 'info': return 'text-blue-500';
    case 'good':
    case 'excellent': return 'text-green-500';
    default: return 'text-gray-500';
  }
}

function getStatusBgColor(status: string): string {
  switch (status) {
    case 'critical': return 'bg-red-500/10 border-red-500/20';
    case 'warning': return 'bg-yellow-500/10 border-yellow-500/20';
    case 'info': return 'bg-blue-500/10 border-blue-500/20';
    case 'good':
    case 'excellent': return 'bg-green-500/10 border-green-500/20';
    default: return 'bg-gray-500/10 border-gray-500/20';
  }
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-yellow-500';
  return 'text-red-500';
}

function getTrendIcon(trend?: string) {
  switch (trend) {
    case 'increasing': return <TrendingUp className="h-4 w-4 text-green-500" />;
    case 'decreasing': return <TrendingDown className="h-4 w-4 text-red-500" />;
    default: return <Minus className="h-4 w-4 text-gray-500" />;
  }
}

// ============================================================================
// Components
// ============================================================================

function ScoreCard({ title, score, icon: Icon }: { title: string; score: number; icon: React.ElementType }) {
  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">{title}</p>
            <p className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}</p>
          </div>
          <Icon className="h-8 w-8 text-slate-600" />
        </div>
        <Progress value={score} className="mt-4 h-2" />
      </CardContent>
    </Card>
  );
}

function MetricCard({ analysis }: { analysis: MetricAnalysis }) {
  const statusLabels = {
    above_benchmark: 'Above Benchmark',
    below_benchmark: 'Below Benchmark',
    on_target: 'On Target',
    insufficient_data: 'Insufficient Data',
  };

  return (
    <Card className={`border ${getStatusBgColor(analysis.status)}`}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-white">{analysis.metric}</h3>
          {getTrendIcon(analysis.trend)}
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-400">Value</span>
            <span className="text-white font-mono">{analysis.value_formatted}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Benchmark</span>
            <span className="text-slate-300 font-mono">{analysis.benchmark_formatted}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Status</span>
            <Badge variant="outline" className={getStatusColor(analysis.status)}>
              {statusLabels[analysis.status]}
            </Badge>
          </div>
          {analysis.deviation_percentage !== 0 && (
            <div className="flex justify-between">
              <span className="text-slate-400">Deviation</span>
              <span className={`font-mono ${analysis.deviation_percentage > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {analysis.deviation_percentage > 0 ? '+' : ''}{analysis.deviation_percentage.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-2">Evidence: {analysis.evidence_id}</p>
      </CardContent>
    </Card>
  );
}

function DiagnosisCard({ diagnosis }: { diagnosis: Diagnosis }) {
  const statusIcons = {
    critical: <AlertCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
    info: <AlertCircle className="h-5 w-5 text-blue-500" />,
    good: <CheckCircle2 className="h-5 w-5 text-green-500" />,
    excellent: <CheckCircle2 className="h-5 w-5 text-green-500" />,
  };

  return (
    <Card className={`border ${getStatusBgColor(diagnosis.status)}`}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          {statusIcons[diagnosis.status]}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-white">{diagnosis.metric}</h3>
              <Badge variant="outline" className="text-xs">
                {diagnosis.rule_id}
              </Badge>
            </div>
            <p className="text-slate-300 text-sm mb-2">{diagnosis.description}</p>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span>Value: {diagnosis.value_formatted}</span>
              <span>Condition: {diagnosis.condition}</span>
            </div>
            <p className="text-sm text-slate-300 mt-2">
              <strong>Recommendation:</strong> {diagnosis.recommendation}
            </p>
            <p className="text-xs text-slate-500 mt-1">Evidence: {diagnosis.evidence_id}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActionPlanCard({ action }: { action: ActionPlan }) {
  const priorityColors = {
    P0: 'bg-red-500/10 border-red-500/20 text-red-400',
    P1: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
    P2: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
    P3: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  };

  return (
    <Card className={`border ${priorityColors[action.priority as keyof typeof priorityColors] || 'bg-slate-900/50 border-slate-800'}`}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <Badge variant="outline" className={priorityColors[action.priority as keyof typeof priorityColors]}>
            {action.priority}
          </Badge>
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-1">{action.action}</h3>
            <p className="text-sm text-slate-400 mb-2">{action.issue}</p>
            <p className="text-sm text-slate-300 mb-2">{action.details}</p>
            <p className="text-xs text-green-400">
              <strong>Expected Impact:</strong> {action.expected_impact}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Main Report Component
// ============================================================================

export function TikTokReport({ data, locale = 'en' }: TikTokReportProps) {
  const { scores, metric_analysis, diagnosis, action_plan, llm_explanation, warnings, metadata } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">TikTok Ads Review</h1>
          <p className="text-slate-400 mt-1">
            {data.campaign_name} • {data.date_range}
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          Report ID: {data.report_id}
        </Badge>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-400 mb-1">Warnings</h3>
                <ul className="space-y-1">
                  {warnings.map((warning, index) => (
                    <li key={index} className="text-sm text-yellow-300/80">
                      • {warning.message}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Video Data Status */}
      <Card className="border-slate-800 bg-slate-900/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Video className={`h-5 w-5 ${metadata.has_video_data ? 'text-green-500' : 'text-slate-500'}`} />
            <div>
              <p className="text-sm font-medium text-white">
                Video Data: {metadata.has_video_data ? 'Available' : 'Not Available'}
              </p>
              <p className="text-xs text-slate-400">
                {metadata.has_video_data 
                  ? 'Hook and Creative Quality analysis enabled'
                  : 'Hook analysis skipped (requires video data)'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Page 1: Executive Summary */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Executive Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <ScoreCard title="Overall" score={scores.overall} icon={Target} />
          <ScoreCard title="Performance" score={scores.performance} icon={Zap} />
          <ScoreCard title="Efficiency" score={scores.efficiency} icon={TrendingUp} />
          <ScoreCard title="Delivery" score={scores.delivery} icon={Shield} />
          <ScoreCard title="Risk" score={scores.risk} icon={DollarSign} />
        </div>
        <Card className="mt-4 bg-slate-900/50 border-slate-800">
          <CardContent className="pt-6">
            <p className="text-slate-300">{llm_explanation.executive_summary}</p>
          </CardContent>
        </Card>
      </section>

      {/* Page 3: Metric Analysis */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Metric Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metric_analysis.map((analysis, index) => (
            <MetricCard key={index} analysis={analysis} />
          ))}
        </div>
      </section>

      {/* Page 4: Diagnosis */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Diagnosis</h2>
        <Card className="bg-slate-900/50 border-slate-800 mb-4">
          <CardContent className="pt-6">
            <p className="text-slate-300 whitespace-pre-wrap">{llm_explanation.diagnosis}</p>
          </CardContent>
        </Card>
        <div className="space-y-4">
          {diagnosis.map((d, index) => (
            <DiagnosisCard key={index} diagnosis={d} />
          ))}
        </div>
      </section>

      {/* Page 5: Action Plan */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Action Plan</h2>
        <Card className="bg-slate-900/50 border-slate-800 mb-4">
          <CardContent className="pt-6">
            <p className="text-slate-300 whitespace-pre-wrap">{llm_explanation.action_plan}</p>
          </CardContent>
        </Card>
        <div className="space-y-4">
          {action_plan.map((action, index) => (
            <ActionPlanCard key={index} action={action} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <div className="text-center text-sm text-slate-500 pt-8 border-t border-slate-800">
        <p>Generated at: {new Date(data.generated_at).toLocaleString()}</p>
        <p className="mt-1">
          ARS Version: v1 • ARE Version: v1
        </p>
      </div>
    </div>
  );
}

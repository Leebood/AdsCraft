/**
 * Report Generator (AOS - Analysis Output System)
 * 统一的报告生成引擎
 * 
 * 负责：
 * 1. 生成统一的报告格式
 * 2. 支持 PDF 导出
 * 3. 支持 PPT 导出
 * 4. 支持邮件发送
 */

import type {
  Evidence,
  MetricAnalysis,
  Diagnosis,
  Scores,
  LLMExplanation,
  ActionPlanItem,
} from './types';

// ============================================================================
// Types
// ============================================================================

export type ReportFormat = 'pdf' | 'ppt' | 'email';
export type Platform = 'facebook' | 'tiktok' | 'google';

export interface UnifiedReport {
  report_id: string;
  platform: Platform;
  campaign_name: string;
  generated_at: string;
  date_range: string;
  
  // Executive Summary
  executive_summary: string;
  
  // Scores
  scores: Scores;
  
  // Evidence Summary
  evidence_summary: EvidenceSummary[];
  
  // Key Findings
  key_findings: KeyFinding[];
  
  // Diagnosis
  diagnosis: DiagnosisSummary[];
  
  // Action Plan
  action_plan: ActionPlanSummary[];
  
  // Recommendations
  recommendations: Recommendation[];
  
  // Metadata
  metadata: ReportMetadata;
}

export interface EvidenceSummary {
  metric: string;
  value: string;
  status: string;
  source: string;
}

export interface KeyFinding {
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info' | 'good';
  metric?: string;
}

export interface DiagnosisSummary {
  metric: string;
  status: string;
  severity: string;
  recommendation: string;
  impact: string;
}

export interface ActionPlanSummary {
  priority: 'P0' | 'P1' | 'P2';
  action: string;
  expected_impact: string;
  timeline: string;
}

export interface Recommendation {
  category: string;
  items: string[];
}

export interface ReportMetadata {
  analysis_duration_ms: number;
  model_used: string;
  ars_version: string;
  are_version: string;
  data_source: string;
}

export interface ExportOptions {
  format: ReportFormat;
  locale: 'en' | 'zh';
  include_executive_summary?: boolean;
  include_evidence?: boolean;
  include_action_plan?: boolean;
  branding?: {
    logo_url?: string;
    company_name?: string;
    primary_color?: string;
  };
}

// ============================================================================
// Report Generator
// ============================================================================

/**
 * Generate unified report from analysis results
 */
export function generateUnifiedReport(
  platform: Platform,
  campaignName: string,
  dateRange: string,
  evidence: Evidence[],
  metricAnalyses: MetricAnalysis[],
  diagnoses: Diagnosis[],
  scores: Scores,
  llmExplanation: LLMExplanation,
  actionPlan: ActionPlanItem[],
  metadata: {
    analysis_duration_ms: number;
    model_used: string;
    ars_version: string;
    are_version: string;
    data_source: string;
  }
): UnifiedReport {
  // Generate executive summary
  const executiveSummary = generateExecutiveSummary(scores, diagnoses, campaignName);
  
  // Generate evidence summary
  const evidenceSummary = generateEvidenceSummary(evidence);
  
  // Generate key findings
  const keyFindings = generateKeyFindings(diagnoses, metricAnalyses);
  
  // Generate diagnosis summary
  const diagnosisSummary = generateDiagnosisSummary(diagnoses);
  
  // Generate action plan summary
  const actionPlanSummary = generateActionPlanSummary(actionPlan);
  
  // Generate recommendations
  const recommendations = generateRecommendations(diagnoses, scores);
  
  return {
    report_id: `rpt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    platform,
    campaign_name: campaignName,
    generated_at: new Date().toISOString(),
    date_range: dateRange,
    executive_summary: executiveSummary,
    scores,
    evidence_summary: evidenceSummary,
    key_findings: keyFindings,
    diagnosis: diagnosisSummary,
    action_plan: actionPlanSummary,
    recommendations,
    metadata,
  };
}

/**
 * Generate executive summary
 */
function generateExecutiveSummary(
  scores: Scores,
  diagnoses: Diagnosis[],
  campaignName: string
): string {
  const overallScore = scores.overall || 0;
  const criticalCount = diagnoses.filter(d => d.status === 'critical').length;
  const warningCount = diagnoses.filter(d => d.status === 'warning').length;
  
  let summary = `Campaign "${campaignName}" analysis complete. Overall score: ${overallScore}/100. `;
  
  if (criticalCount > 0) {
    summary += `Found ${criticalCount} critical issue${criticalCount > 1 ? 's' : ''} requiring immediate attention. `;
  }
  
  if (warningCount > 0) {
    summary += `Found ${warningCount} warning${warningCount > 1 ? 's' : ''} that should be addressed. `;
  }
  
  if (overallScore >= 80) {
    summary += 'Campaign is performing well overall.';
  } else if (overallScore >= 60) {
    summary += 'Campaign has room for improvement.';
  } else {
    summary += 'Campaign requires significant optimization.';
  }
  
  return summary;
}

/**
 * Generate evidence summary
 */
function generateEvidenceSummary(evidence: Evidence[]): EvidenceSummary[] {
  return evidence.map(e => ({
    metric: e.metric,
    value: e.value_formatted,
    status: e.status || 'unknown',
    source: `${e.source.type}${e.source.column ? ` - ${e.source.column}` : ''}`,
  }));
}

/**
 * Generate key findings
 */
function generateKeyFindings(
  diagnoses: Diagnosis[],
  metricAnalyses: MetricAnalysis[]
): KeyFinding[] {
  const findings: KeyFinding[] = [];
  
  // Sort diagnoses by severity
  const sortedDiagnoses = [...diagnoses].sort((a, b) => {
    const severityOrder: Record<string, number> = { high: 0, medium: 1, low: 2, none: 3 };
    return (severityOrder[a.severity] || 3) - (severityOrder[b.severity] || 3);
  });
  
  // Take top 5 findings
  for (const d of sortedDiagnoses.slice(0, 5)) {
    const severity = d.status === 'critical' ? 'critical' : 
                     d.status === 'warning' ? 'warning' : 
                     d.status === 'good' || d.status === 'excellent' ? 'good' : 'info';
    
    findings.push({
      title: `${d.metric} ${d.status === 'critical' ? 'Issue' : d.status === 'good' ? 'Performance' : 'Status'}`,
      description: d.recommendation,
      severity,
      metric: d.metric,
    });
  }
  
  return findings;
}

/**
 * Generate diagnosis summary
 */
function generateDiagnosisSummary(diagnoses: Diagnosis[]): DiagnosisSummary[] {
  return diagnoses.map(d => ({
    metric: d.metric,
    status: d.status,
    severity: d.severity,
    recommendation: d.recommendation,
    impact: getImpactDescription(d.metric, d.status),
  }));
}

/**
 * Get impact description for a metric status
 */
function getImpactDescription(metric: string, status: string): string {
  const impactMap: Record<string, Record<string, string>> = {
    'CTR': {
      'critical': 'Very low click-through rate, significantly impacting campaign performance',
      'warning': 'Below-average CTR, needs improvement',
      'good': 'Healthy CTR, good ad relevance',
    },
    'CPC': {
      'critical': 'Very high cost per click, budget inefficiency',
      'warning': 'Above-benchmark CPC, optimization needed',
      'good': 'Efficient cost per click',
    },
    'ROAS': {
      'critical': 'Poor return on ad spend, campaign may not be profitable',
      'warning': 'Below-target ROAS, needs optimization',
      'good': 'Strong return on ad spend',
    },
    'Quality Score': {
      'critical': 'Very low quality score, affecting ad rank and costs',
      'warning': 'Below-average quality score',
      'good': 'Good quality score, beneficial for ad rank',
    },
  };
  
  return impactMap[metric]?.[status] || 'Performance metric';
}

/**
 * Generate action plan summary
 */
function generateActionPlanSummary(actionPlan: ActionPlanItem[]): ActionPlanSummary[] {
  return actionPlan.map(item => ({
    priority: item.priority as 'P0' | 'P1' | 'P2',
    action: item.action,
    expected_impact: item.expected_impact || 'Performance improvement',
    timeline: getTimeline(item.priority),
  }));
}

/**
 * Get timeline based on priority
 */
function getTimeline(priority: string): string {
  switch (priority) {
    case 'P0': return 'Immediate (within 24 hours)';
    case 'P1': return 'Short-term (within 1 week)';
    case 'P2': return 'Medium-term (within 1 month)';
    default: return 'As needed';
  }
}

/**
 * Generate recommendations
 */
function generateRecommendations(diagnoses: Diagnosis[], scores: Scores): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  // Performance recommendations
  const perfItems: string[] = [];
  if (scores.performance < 70) {
    perfItems.push('Improve ad copy and creative to increase CTR');
    perfItems.push('Review targeting and audience segmentation');
  }
  if (scores.efficiency < 70) {
    perfItems.push('Optimize bidding strategy');
    perfItems.push('Improve Quality Score to reduce CPC');
  }
  if (perfItems.length > 0) {
    recommendations.push({ category: 'Performance Optimization', items: perfItems });
  }
  
  // Creative recommendations
  const creativeItems: string[] = [];
  const creativeDiagnoses = diagnoses.filter(d => d.metric.toLowerCase().includes('creative'));
  if (creativeDiagnoses.some(d => d.status === 'critical' || d.status === 'warning')) {
    creativeItems.push('Refresh ad creative with new visuals and copy');
    creativeItems.push('A/B test different creative variations');
  }
  if (creativeItems.length > 0) {
    recommendations.push({ category: 'Creative Optimization', items: creativeItems });
  }
  
  // Tracking recommendations
  const trackingItems: string[] = [];
  const trackingDiagnoses = diagnoses.filter(d => d.metric.toLowerCase().includes('tracking') || d.metric.toLowerCase().includes('pixel'));
  if (trackingDiagnoses.some(d => d.status === 'critical' || d.status === 'warning')) {
    trackingItems.push('Verify tracking pixel installation');
    trackingItems.push('Check conversion tracking setup');
  }
  if (trackingItems.length > 0) {
    recommendations.push({ category: 'Tracking & Measurement', items: trackingItems });
  }
  
  return recommendations;
}

// ============================================================================
// Export Functions
// ============================================================================

/**
 * Export report to PDF format
 */
export async function exportToPDF(report: UnifiedReport, options: ExportOptions): Promise<Blob> {
  // This will be implemented with a PDF generation library
  // For now, return a placeholder
  throw new Error('PDF export not yet implemented');
}

/**
 * Export report to PPT format
 */
export async function exportToPPT(report: UnifiedReport, options: ExportOptions): Promise<Blob> {
  // This will be implemented with a PPT generation library
  // For now, return a placeholder
  throw new Error('PPT export not yet implemented');
}

/**
 * Generate email content
 */
export function generateEmailContent(report: UnifiedReport, options: ExportOptions): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `${report.platform === 'facebook' ? 'Facebook' : report.platform === 'tiktok' ? 'TikTok' : 'Google'} Ads Diagnosis Report - ${report.campaign_name}`;
  
  const html = generateEmailHTML(report, options);
  const text = generateEmailText(report, options);
  
  return { subject, html, text };
}

/**
 * Generate email HTML content
 */
function generateEmailHTML(report: UnifiedReport, options: ExportOptions): string {
  const { branding } = options;
  const primaryColor = branding?.primary_color || '#00D4FF';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AdsCraft Diagnosis Report</title>
  <style>
    body { font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #0F172A; margin: 0; padding: 0; background-color: #F8FAFC; }
    .container { max-width: 600px; margin: 0 auto; background-color: #FFFFFF; }
    .header { background: linear-gradient(135deg, #08111F 0%, #101827 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: #FFFFFF; margin: 0; font-size: 24px; font-weight: 700; }
    .header p { color: #94A3B8; margin: 10px 0 0; font-size: 14px; }
    .content { padding: 30px; }
    .score-card { background: #F8FAFC; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px; }
    .score-value { font-size: 48px; font-weight: 700; color: ${primaryColor}; }
    .score-label { font-size: 14px; color: #64748B; margin-top: 8px; }
    .section { margin-bottom: 24px; }
    .section h2 { font-size: 18px; font-weight: 600; color: #0F172A; margin: 0 0 16px; border-bottom: 2px solid ${primaryColor}; padding-bottom: 8px; }
    .finding { background: #F8FAFC; border-left: 4px solid ${primaryColor}; padding: 12px 16px; margin-bottom: 12px; border-radius: 0 8px 8px 0; }
    .finding.critical { border-left-color: #EF4444; }
    .finding.warning { border-left-color: #F59E0B; }
    .finding.good { border-left-color: #22C55E; }
    .finding-title { font-weight: 600; margin-bottom: 4px; }
    .finding-desc { font-size: 14px; color: #64748B; }
    .action { display: flex; align-items: flex-start; margin-bottom: 12px; }
    .action-priority { background: ${primaryColor}; color: #08111F; font-weight: 600; font-size: 12px; padding: 4px 8px; border-radius: 4px; margin-right: 12px; flex-shrink: 0; }
    .action-priority.P0 { background: #EF4444; color: #FFFFFF; }
    .action-priority.P1 { background: #F59E0B; color: #08111F; }
    .action-text { font-size: 14px; }
    .footer { background: #F8FAFC; padding: 24px 30px; text-align: center; border-top: 1px solid #E2E8F0; }
    .footer p { font-size: 12px; color: #64748B; margin: 0; }
    .cta-button { display: inline-block; background: ${primaryColor}; color: #08111F; font-weight: 600; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>AdsCraft Diagnosis Report</h1>
      <p>${report.platform === 'facebook' ? 'Facebook' : report.platform === 'tiktok' ? 'TikTok' : 'Google'} Ads - ${report.campaign_name}</p>
    </div>
    
    <div class="content">
      <div class="score-card">
        <div class="score-value">${report.scores.overall || 0}</div>
        <div class="score-label">Overall Score</div>
      </div>
      
      <div class="section">
        <h2>Executive Summary</h2>
        <p>${report.executive_summary}</p>
      </div>
      
      <div class="section">
        <h2>Key Findings</h2>
        ${report.key_findings.map(f => `
          <div class="finding ${f.severity}">
            <div class="finding-title">${f.title}</div>
            <div class="finding-desc">${f.description}</div>
          </div>
        `).join('')}
      </div>
      
      <div class="section">
        <h2>Recommended Actions</h2>
        ${report.action_plan.slice(0, 5).map(a => `
          <div class="action">
            <span class="action-priority ${a.priority}">${a.priority}</span>
            <span class="action-text">${a.action}</span>
          </div>
        `).join('')}
      </div>
      
      <div style="text-align: center;">
        <a href="#" class="cta-button">View Full Report</a>
      </div>
    </div>
    
    <div class="footer">
      <p>Generated by AdsCraft - ${new Date(report.generated_at).toLocaleDateString()}</p>
      <p>Report ID: ${report.report_id}</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate email plain text content
 */
function generateEmailText(report: UnifiedReport, options: ExportOptions): string {
  let text = `AdsCraft Diagnosis Report\n`;
  text += `${'='.repeat(50)}\n\n`;
  text += `Platform: ${report.platform}\n`;
  text += `Campaign: ${report.campaign_name}\n`;
  text += `Date Range: ${report.date_range}\n`;
  text += `Generated: ${new Date(report.generated_at).toLocaleDateString()}\n\n`;
  
  text += `Overall Score: ${report.scores.overall || 0}/100\n\n`;
  
  text += `Executive Summary\n`;
  text += `${'-'.repeat(30)}\n`;
  text += `${report.executive_summary}\n\n`;
  
  text += `Key Findings\n`;
  text += `${'-'.repeat(30)}\n`;
  for (const finding of report.key_findings) {
    text += `• ${finding.title}\n  ${finding.description}\n\n`;
  }
  
  text += `Recommended Actions\n`;
  text += `${'-'.repeat(30)}\n`;
  for (const action of report.action_plan.slice(0, 5)) {
    text += `[${action.priority}] ${action.action}\n`;
    text += `  Expected Impact: ${action.expected_impact}\n\n`;
  }
  
  text += `\nReport ID: ${report.report_id}\n`;
  text += `Generated by AdsCraft\n`;
  
  return text;
}

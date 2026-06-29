/**
 * AdsCraft Review Engine (ARE) - Main Entry
 * 整合所有引擎模块，提供完整的分析流程
 * 
 * 流程：
 * 1. Parser（截图 → JSON）
 * 2. Evidence Engine（构建 Evidence，带 Provenance）
 * 3. Metric Engine（计算指标，对比 Benchmarks）
 * 4. Rule Engine（触发诊断规则）
 * 5. Score Engine（计算评分）
 * 6. LLM Explanation（生成诊断和 Action Plan）
 */

import type {
  FacebookParsedData,
  AOSReport,
  Evidence,
  MetricAnalysis,
  Diagnosis,
  Scores,
  ActionPlanItem,
  LLMExplanation,
  IndustryType,
  DataSource,
} from './types';

import { parseFacebookManual, parseFacebookFromData } from './facebook-parser';
import type { ManualInputData } from './facebook-parser';
import { buildEvidence, isDataSufficient } from './evidence-engine';
import { analyzeMetrics, analyzeTrend } from './metric-engine';
import { applyRules, checkDataSufficiency, getDiagnosisSummary } from './rule-engine';
import { calculateScores, getScoreColor, getScoreStatus, getScoreGrade } from './score-engine';
import { generateExplanation, generateActionPlan } from './llm-explanation';

// ==================== Main Analysis Function ====================

/**
 * Run complete Facebook analysis pipeline
 */
export async function runFacebookAnalysis(
  inputData: ManualInputData,
  options: {
    industry?: IndustryType;
    locale?: 'en' | 'zh';
    historicalData?: Evidence[];
  } = {}
): Promise<AOSReport> {
  const startTime = Date.now();
  const { industry = 'ecommerce', locale = 'en', historicalData } = options;
  
  // Step 1: Parse input data
  const parsedData = parseFacebookManual(inputData);
  
  // Step 2: Build Evidence
  const evidence = buildEvidence(parsedData);
  
  // Step 3: Check data sufficiency
  const sufficiencyCheck = checkDataSufficiency(evidence);
  const warnings: string[] = [...sufficiencyCheck.warnings];
  
  // Step 4: Analyze metrics
  let metricAnalyses = analyzeMetrics(evidence);
  
  // Add trend analysis if historical data is available
  if (historicalData && historicalData.length > 0) {
    const trends = analyzeTrend(evidence, historicalData);
    metricAnalyses = metricAnalyses.map(m => {
      const trend = trends.get(m.metric);
      return trend ? { ...m, trend: trend.trend } : m;
    });
  }
  
  // Step 5: Apply rules
  let diagnoses = applyRules(metricAnalyses, evidence);
  
  // Add data sufficiency diagnoses
  diagnoses = [...sufficiencyCheck.diagnoses, ...diagnoses];
  
  // Step 6: Calculate scores
  const scores = calculateScores(diagnoses, metricAnalyses);
  
  // Step 7: Generate action plan
  const actionPlan = generateActionPlan(diagnoses, metricAnalyses);
  
  // Step 8: Generate LLM explanation
  const campaignName = parsedData.campaigns[0]?.name || 'Unknown Campaign';
  const llmExplanation = generateExplanation(
    evidence,
    metricAnalyses,
    diagnoses,
    scores,
    campaignName,
    locale
  );
  
  // Calculate duration
  const duration = Date.now() - startTime;
  
  // Build final report
  const report: AOSReport = {
    report_id: generateReportId(),
    platform: 'facebook',
    campaign_name: campaignName,
    generated_at: new Date().toISOString(),
    data_source: parsedData.data_source,
    date_range: parsedData.date_range,
    snapshot_date: parsedData.snapshot_date,
    scores,
    evidence,
    metric_analysis: metricAnalyses,
    diagnosis: diagnoses,
    action_plan: actionPlan,
    llm_explanation: llmExplanation,
    warnings,
    metadata: {
      analysis_duration_ms: duration,
      model_used: 'ARE v1',
      ars_version: 'v1',
      are_version: 'v1',
    },
  };
  
  return report;
}

/**
 * Run analysis for multiple campaigns
 */
export async function runMultiCampaignAnalysis(
  inputData: ManualInputData,
  options: {
    industry?: IndustryType;
    locale?: 'en' | 'zh';
  } = {}
): Promise<AOSReport[]> {
  const reports: AOSReport[] = [];
  
  for (const campaign of inputData.campaigns) {
    const singleInput: ManualInputData = {
      date_range: inputData.date_range,
      snapshot_date: inputData.snapshot_date,
      campaigns: [campaign],
    };
    
    const report = await runFacebookAnalysis(singleInput, options);
    reports.push(report);
  }
  
  return reports;
}

// ==================== Utility Functions ====================

/**
 * Generate a unique report ID
 */
function generateReportId(): string {
  const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  const random = Math.random().toString(36).substring(2, 8);
  return `rpt_${timestamp}_${random}`;
}

/**
 * Get summary statistics from a report
 */
export function getReportSummary(report: AOSReport): {
  overallScore: number;
  scoreGrade: string;
  scoreStatus: string;
  scoreColor: string;
  criticalCount: number;
  warningCount: number;
  actionCount: number;
} {
  const summary = getDiagnosisSummary(report.diagnosis);
  
  return {
    overallScore: report.scores.overall,
    scoreGrade: getScoreGrade(report.scores.overall),
    scoreStatus: getScoreStatus(report.scores.overall),
    scoreColor: getScoreColor(report.scores.overall),
    criticalCount: summary.critical,
    warningCount: summary.warning,
    actionCount: report.action_plan.length,
  };
}

/**
 * Compare two reports
 */
export function compareReports(
  current: AOSReport,
  previous: AOSReport
): {
  scoreChange: number;
  scoreTrend: 'improving' | 'stable' | 'declining';
  newIssues: number;
  resolvedIssues: number;
} {
  const scoreChange = current.scores.overall - previous.scores.overall;
  const scoreTrend = Math.abs(scoreChange) < 5
    ? 'stable' as const
    : scoreChange > 0
      ? 'improving' as const
      : 'declining' as const;
  
  const currentRuleIds = new Set(current.diagnosis.map(d => d.rule_id));
  const previousRuleIds = new Set(previous.diagnosis.map(d => d.rule_id));
  
  const newIssues = current.diagnosis.filter(
    d => !previousRuleIds.has(d.rule_id)
  ).length;
  
  const resolvedIssues = previous.diagnosis.filter(
    d => !currentRuleIds.has(d.rule_id)
  ).length;
  
  return {
    scoreChange,
    scoreTrend,
    newIssues,
    resolvedIssues,
  };
}

// ==================== Re-exports ====================

export * from './types';
export * from './facebook-parser';
export * from './evidence-engine';
export * from './metric-engine';
export * from './rule-engine';
export * from './score-engine';
export * from './llm-explanation';
export * from './ars-facebook';

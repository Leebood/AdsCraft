/**
 * Metric Engine
 * 读取 Evidence，计算指标状态，对比 Benchmarks，分析指标关系和趋势
 * 参考 ARE.md Section 5
 * 
 * 关键区别：
 * - Metric Engine 回答："指标是什么状态？"（计算 + 对比）
 * - Metric Engine 不做诊断判断，只做数据计算和对比
 */

import type {
  Evidence,
  MetricAnalysis,
  MetricRelationship,
} from './types';
import { DEFAULT_BENCHMARKS } from './types';

// ==================== Main Functions ====================

/**
 * Analyze all metrics from evidence
 */
export function analyzeMetrics(evidence: Evidence[]): MetricAnalysis[] {
  const analyses: MetricAnalysis[] = [];
  
  for (const ev of evidence) {
    const analysis = analyzeSingleMetric(ev);
    if (analysis) {
      analyses.push(analysis);
    }
  }
  
  // Analyze metric relationships
  const relationships = analyzeRelationships(evidence);
  
  // Attach relationships to relevant metrics
  for (const rel of relationships) {
    const targetMetric = analyses.find(a => a.metric === rel.primaryMetric);
    if (targetMetric) {
      if (!targetMetric.relationships) {
        targetMetric.relationships = [];
      }
      targetMetric.relationships.push({
        type: rel.type,
        related_metric: rel.relatedMetric,
        diagnosis: rel.diagnosis,
        explanation: rel.explanation,
      });
    }
  }
  
  return analyses;
}

/**
 * Analyze a single metric
 */
function analyzeSingleMetric(evidence: Evidence): MetricAnalysis | null {
  const { metric, value, benchmark, evidence_id } = evidence;
  
  if (!benchmark || benchmark === 0) {
    return null;
  }
  
  // Calculate deviation
  const deviation = value - benchmark;
  const deviationPercentage = benchmark !== 0
    ? Math.round((deviation / benchmark) * 100)
    : 0;
  
  // Determine status
  const status = determineMetricStatus(metric, value, benchmark);
  
  // Format values
  const valueFormatted = formatMetricValue(metric, value);
  const benchmarkFormatted = formatMetricValue(metric, benchmark);
  
  return {
    metric,
    evidence_id,
    value,
    value_formatted: valueFormatted,
    benchmark,
    benchmark_formatted: benchmarkFormatted,
    status,
    deviation,
    deviation_percentage: deviationPercentage,
  };
}

/**
 * Determine metric status based on metric type
 */
function determineMetricStatus(
  metric: string,
  value: number,
  benchmark: number
): 'above_benchmark' | 'below_benchmark' | 'on_target' | 'insufficient_data' {
  // Metrics where lower is better
  const lowerIsBetter = ['CPC', 'CPM', 'CPR', 'Frequency'];
  
  // Data sufficiency metrics
  if (metric === 'Spend') {
    if (value < 50) return 'insufficient_data';
    return 'on_target';
  }
  
  if (metric === 'Results') {
    if (value < 50) return 'insufficient_data';
    return 'on_target';
  }
  
  if (lowerIsBetter.includes(metric)) {
    if (value <= benchmark) return 'on_target';
    if (value <= benchmark * 1.5) return 'below_benchmark';
    return 'below_benchmark';
  }
  
  // Metrics where higher is better
  if (value >= benchmark) return 'on_target';
  if (value >= benchmark * 0.7) return 'below_benchmark';
  return 'below_benchmark';
}

/**
 * Format metric value for display
 */
function formatMetricValue(metric: string, value: number): string {
  switch (metric) {
    case 'CTR':
      return `${value.toFixed(2)}%`;
    case 'CPC':
    case 'CPM':
    case 'CPR':
      return `$${value.toFixed(2)}`;
    case 'ROAS':
      return `${value.toFixed(2)}x`;
    case 'Frequency':
      return value.toFixed(2);
    case 'Spend':
      return `$${value.toFixed(2)}`;
    case 'Results':
    case 'Impressions':
    case 'Reach':
      return Math.round(value).toLocaleString();
    default:
      return String(value);
  }
}

// ==================== Relationship Analysis ====================

interface RelationshipResult {
  type: string;
  primaryMetric: string;
  relatedMetric: string;
  diagnosis: string;
  explanation: string;
}

/**
 * Analyze relationships between metrics
 * Key patterns:
 * - High CTR + Low CVR = Landing Page Issue
 * - High Impressions + Low CTR = Creative Issue
 * - High Frequency + Low ROAS = Ad Fatigue
 * - High Spend + Low Results = Insufficient Optimization
 */
function analyzeRelationships(evidence: Evidence[]): RelationshipResult[] {
  const relationships: RelationshipResult[] = [];
  
  // Get evidence by metric
  const ctrEvidence = evidence.find(e => e.metric === 'CTR');
  const cpcEvidence = evidence.find(e => e.metric === 'CPC');
  const roasEvidence = evidence.find(e => e.metric === 'ROAS');
  const freqEvidence = evidence.find(e => e.metric === 'Frequency');
  const impressionsEvidence = evidence.find(e => e.metric === 'Impressions');
  const resultsEvidence = evidence.find(e => e.metric === 'Results');
  const spendEvidence = evidence.find(e => e.metric === 'Spend');
  const cprEvidence = evidence.find(e => e.metric === 'CPR');
  
  // Pattern 1: High CTR + Low ROAS = Landing Page Issue
  if (ctrEvidence && roasEvidence) {
    const ctrGood = ctrEvidence.value >= DEFAULT_BENCHMARKS.ctr;
    const roasBad = roasEvidence.value < DEFAULT_BENCHMARKS.roas;
    
    if (ctrGood && roasBad) {
      relationships.push({
        type: 'high_ctr_low_roas',
        primaryMetric: 'CTR',
        relatedMetric: 'ROAS',
        diagnosis: 'Landing Page Issue',
        explanation: `High CTR (${ctrEvidence.value_formatted}) but low ROAS (${roasEvidence.value_formatted}) suggests the creative is effective at attracting clicks, but the landing page or offer is not converting visitors.`,
      });
    }
  }
  
  // Pattern 2: High Impressions + Low CTR = Creative Issue
  if (impressionsEvidence && ctrEvidence) {
    const highImpressions = impressionsEvidence.value >= 10000;
    const lowCTR = ctrEvidence.value < DEFAULT_BENCHMARKS.ctr;
    
    if (highImpressions && lowCTR) {
      relationships.push({
        type: 'high_impressions_low_ctr',
        primaryMetric: 'Impressions',
        relatedMetric: 'CTR',
        diagnosis: 'Creative Issue',
        explanation: `High impressions (${impressionsEvidence.value_formatted}) but low CTR (${ctrEvidence.value_formatted}) indicates the creative is not resonating with the audience. Consider testing new ad creative.`,
      });
    }
  }
  
  // Pattern 3: High Frequency + Low ROAS = Ad Fatigue
  if (freqEvidence && roasEvidence) {
    const highFreq = freqEvidence.value > 2.0;
    const lowROAS = roasEvidence.value < DEFAULT_BENCHMARKS.roas;
    
    if (highFreq && lowROAS) {
      relationships.push({
        type: 'high_frequency_low_roas',
        primaryMetric: 'Frequency',
        relatedMetric: 'ROAS',
        diagnosis: 'Ad Fatigue',
        explanation: `High frequency (${freqEvidence.value_formatted}) combined with low ROAS (${roasEvidence.value_formatted}) indicates ad fatigue. The audience has seen the ad too many times, leading to diminishing returns.`,
      });
    }
  }
  
  // Pattern 4: High Spend + Low Results = Insufficient Optimization
  if (spendEvidence && resultsEvidence) {
    const highSpend = spendEvidence.value >= 100;
    const lowResults = resultsEvidence.value < 50;
    
    if (highSpend && lowResults) {
      relationships.push({
        type: 'high_spend_low_results',
        primaryMetric: 'Spend',
        relatedMetric: 'Results',
        diagnosis: 'Insufficient Optimization',
        explanation: `High spend (${spendEvidence.value_formatted}) but low results (${resultsEvidence.value_formatted}) suggests the campaign is not properly optimized. Review targeting, creative, and landing page.`,
      });
    }
  }
  
  // Pattern 5: High CPC + Low CTR = Audience Mismatch
  if (cpcEvidence && ctrEvidence) {
    const highCPC = cpcEvidence.value > DEFAULT_BENCHMARKS.cpc * 1.5;
    const lowCTR = ctrEvidence.value < DEFAULT_BENCHMARKS.ctr;
    
    if (highCPC && lowCTR) {
      relationships.push({
        type: 'high_cpc_low_ctr',
        primaryMetric: 'CPC',
        relatedMetric: 'CTR',
        diagnosis: 'Audience Mismatch',
        explanation: `High CPC (${cpcEvidence.value_formatted}) combined with low CTR (${ctrEvidence.value_formatted}) suggests the audience targeting may not match the creative. Review audience segments and creative alignment.`,
      });
    }
  }
  
  // Pattern 6: High CPR + Low Results = Funnel Issue
  if (cprEvidence && resultsEvidence) {
    const highCPR = cprEvidence.value > DEFAULT_BENCHMARKS.cpr * 1.5;
    const lowResults = resultsEvidence.value < 100;
    
    if (highCPR && lowResults) {
      relationships.push({
        type: 'high_cpr_low_results',
        primaryMetric: 'CPR',
        relatedMetric: 'Results',
        diagnosis: 'Funnel Issue',
        explanation: `High cost per result (${cprEvidence.value_formatted}) with low results (${resultsEvidence.value_formatted}) indicates potential issues in the conversion funnel. Review landing page experience and offer.`,
      });
    }
  }
  
  return relationships;
}

// ==================== Trend Analysis ====================

/**
 * Analyze trend by comparing current evidence with historical evidence
 */
export function analyzeTrend(
  currentEvidence: Evidence[],
  historicalEvidence: Evidence[]
): Map<string, { trend: 'declining' | 'stable' | 'increasing'; change: number; changePercentage: number }> {
  const trends = new Map<string, { trend: 'declining' | 'stable' | 'increasing'; change: number; changePercentage: number }>();
  
  if (historicalEvidence.length === 0) {
    return trends;
  }
  
  // Compare metrics
  const metrics = ['CTR', 'CPC', 'ROAS', 'Frequency', 'CPM', 'CPR'];
  
  for (const metric of metrics) {
    const current = currentEvidence.find(e => e.metric === metric);
    const historical = historicalEvidence.find(e => e.metric === metric);
    
    if (current && historical && historical.value !== 0) {
      const change = current.value - historical.value;
      const changePercentage = Math.round((change / historical.value) * 100);
      
      // Determine trend direction
      // For metrics where higher is better (CTR, ROAS)
      const higherIsBetter = ['CTR', 'ROAS'];
      // For metrics where lower is better (CPC, CPM, CPR, Frequency)
      const lowerIsBetter = ['CPC', 'CPM', 'CPR', 'Frequency'];
      
      let trend: 'declining' | 'stable' | 'increasing';
      
      if (Math.abs(changePercentage) < 10) {
        trend = 'stable';
      } else if (higherIsBetter.includes(metric)) {
        trend = change > 0 ? 'increasing' : 'declining';
      } else if (lowerIsBetter.includes(metric)) {
        trend = change < 0 ? 'increasing' : 'declining'; // For lower-is-better, decrease is good
      } else {
        trend = change > 0 ? 'increasing' : 'declining';
      }
      
      trends.set(metric, { trend, change, changePercentage });
    }
  }
  
  return trends;
}

// ==================== Utility Functions ====================

/**
 * Get metrics that are below benchmark
 */
export function getBelowBenchmarkMetrics(analyses: MetricAnalysis[]): MetricAnalysis[] {
  return analyses.filter(a => a.status === 'below_benchmark');
}

/**
 * Get metrics that are on or above target
 */
export function getOnTargetMetrics(analyses: MetricAnalysis[]): MetricAnalysis[] {
  return analyses.filter(a => a.status === 'on_target');
}

/**
 * Get metrics with insufficient data
 */
export function getInsufficientDataMetrics(analyses: MetricAnalysis[]): MetricAnalysis[] {
  return analyses.filter(a => a.status === 'insufficient_data');
}

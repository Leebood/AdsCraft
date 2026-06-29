/**
 * Rule Engine
 * 读取 Metric Engine 的结果，应用 ARS Rules，触发诊断规则
 * 参考 ARE.md Section 6 和 ARS.md
 * 
 * 关键区别：
 * - Rule Engine 回答："需要触发什么诊断？"（规则判断）
 * - Rule Engine 不做数据计算，只做规则匹配和诊断触发
 */

import type {
  Evidence,
  MetricAnalysis,
  Diagnosis,
  FacebookRule,
} from './types';
import {
  ALL_FACEBOOK_RULES,
  getRulesForMetric,
  DATA_SUFFICIENCY,
} from './ars-facebook';

// ==================== Main Functions ====================

/**
 * Apply all rules to metric analyses and generate diagnoses
 */
export function applyRules(
  metricAnalyses: MetricAnalysis[],
  evidence: Evidence[]
): Diagnosis[] {
  const diagnoses: Diagnosis[] = [];
  
  for (const analysis of metricAnalyses) {
    const metricDiagnoses = applyRulesForMetric(analysis, evidence);
    diagnoses.push(...metricDiagnoses);
  }
  
  // Sort by severity (critical first)
  return sortDiagnosesBySeverity(diagnoses);
}

/**
 * Apply rules for a specific metric
 */
function applyRulesForMetric(
  analysis: MetricAnalysis,
  evidence: Evidence[]
): Diagnosis[] {
  const diagnoses: Diagnosis[] = [];
  const { metric, value, value_formatted, benchmark, evidence_id } = analysis;
  
  // Get the evidence for this analysis
  const ev = evidence.find(e => e.evidence_id === evidence_id);
  if (!ev) return diagnoses;
  
  // Get rules for this metric
  const rules = getRulesForMetric(metric);
  
  // Check each rule
  for (const rule of rules) {
    // For metrics that use benchmark comparison
    const needsBenchmark = ['CPC', 'CPM', 'CPR', 'ROAS'].includes(metric);
    
    let triggered = false;
    
    if (needsBenchmark) {
      triggered = rule.check(value, benchmark);
    } else {
      triggered = rule.check(value);
    }
    
    if (triggered) {
      diagnoses.push({
        rule_id: rule.rule_id,
        metric: rule.metric,
        evidence_id: evidence_id,
        value,
        value_formatted,
        condition: rule.condition,
        status: rule.status,
        severity: rule.severity,
        recommendation: rule.recommendation,
        campaign: ev.campaign,
      });
      break; // Only trigger the first matching rule per metric
    }
  }
  
  return diagnoses;
}

/**
 * Check data sufficiency and add warnings
 */
export function checkDataSufficiency(evidence: Evidence[]): {
  sufficient: boolean;
  warnings: string[];
  diagnoses: Diagnosis[];
} {
  const warnings: string[] = [];
  const diagnoses: Diagnosis[] = [];
  
  const spendEvidence = evidence.find(e => e.metric === 'Spend');
  const resultsEvidence = evidence.find(e => e.metric === 'Results');
  
  // Check spend
  if (spendEvidence) {
    if (spendEvidence.value < DATA_SUFFICIENCY.MIN_SPEND) {
      warnings.push('Insufficient data: Spend < $50. Wait for more spend before analysis.');
      
      // Find the spend rule
      const spendRules = getRulesForMetric('Spend');
      for (const rule of spendRules) {
        if (rule.check(spendEvidence.value)) {
          diagnoses.push({
            rule_id: rule.rule_id,
            metric: 'Spend',
            evidence_id: spendEvidence.evidence_id,
            value: spendEvidence.value,
            value_formatted: spendEvidence.value_formatted,
            condition: rule.condition,
            status: rule.status,
            severity: rule.severity,
            recommendation: rule.recommendation,
            campaign: spendEvidence.campaign,
          });
          break;
        }
      }
    }
  }
  
  // Check results
  if (resultsEvidence) {
    if (resultsEvidence.value < DATA_SUFFICIENCY.MIN_RESULTS) {
      warnings.push('Learning phase: Results < 50. Wait for more results before analysis.');
      
      // Find the results rule
      const resultsRules = getRulesForMetric('Results');
      for (const rule of resultsRules) {
        if (rule.check(resultsEvidence.value)) {
          diagnoses.push({
            rule_id: rule.rule_id,
            metric: 'Results',
            evidence_id: resultsEvidence.evidence_id,
            value: resultsEvidence.value,
            value_formatted: resultsEvidence.value_formatted,
            condition: rule.condition,
            status: rule.status,
            severity: rule.severity,
            recommendation: rule.recommendation,
            campaign: resultsEvidence.campaign,
          });
          break;
        }
      }
    }
  }
  
  const sufficient = warnings.length === 0;
  
  return { sufficient, warnings, diagnoses };
}

// ==================== Utility Functions ====================

/**
 * Sort diagnoses by severity (critical first)
 */
function sortDiagnosesBySeverity(diagnoses: Diagnosis[]): Diagnosis[] {
  const severityOrder = { high: 0, medium: 1, low: 2, none: 3 };
  
  return [...diagnoses].sort((a, b) => {
    const aOrder = severityOrder[a.severity] ?? 4;
    const bOrder = severityOrder[b.severity] ?? 4;
    return aOrder - bOrder;
  });
}

/**
 * Get diagnoses by severity
 */
export function getDiagnosesBySeverity(
  diagnoses: Diagnosis[],
  severity: 'high' | 'medium' | 'low'
): Diagnosis[] {
  return diagnoses.filter(d => d.severity === severity);
}

/**
 * Get diagnoses by status
 */
export function getDiagnosesByStatus(
  diagnoses: Diagnosis[],
  status: 'critical' | 'warning' | 'info' | 'good'
): Diagnosis[] {
  return diagnoses.filter(d => d.status === status);
}

/**
 * Get critical diagnoses (high severity)
 */
export function getCriticalDiagnoses(diagnoses: Diagnosis[]): Diagnosis[] {
  return diagnoses.filter(d => d.status === 'critical' || d.severity === 'high');
}

/**
 * Get warning Diagnoses
 */
export function getWarningDiagnoses(diagnoses: Diagnosis[]): Diagnosis[] {
  return diagnoses.filter(d => d.status === 'warning' || d.severity === 'medium');
}

/**
 * Check if there are any critical issues
 */
export function hasCriticalIssues(diagnoses: Diagnosis[]): boolean {
  return diagnoses.some(d => d.status === 'critical' || d.severity === 'high');
}

/**
 * Get summary of diagnoses
 */
export function getDiagnosisSummary(diagnoses: Diagnosis[]): {
  critical: number;
  warning: number;
  info: number;
  good: number;
} {
  return {
    critical: diagnoses.filter(d => d.status === 'critical').length,
    warning: diagnoses.filter(d => d.status === 'warning').length,
    info: diagnoses.filter(d => d.status === 'info').length,
    good: diagnoses.filter(d => d.status === 'good' || d.status === 'excellent').length,
  };
}

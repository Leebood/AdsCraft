/**
 * Score Engine
 * 读取 Rule Engine 和 Metric Engine 的结果，计算评分
 * 参考 ARE.md Section 7
 * 
 * 关键设计：
 * - 评分完全由程序计算
 * - AI 不参与打分
 * - 评分算法可配置（按行业/按平台）
 */

import type {
  Diagnosis,
  MetricAnalysis,
  Scores,
} from './types';

// ==================== Scoring Algorithm ====================

/**
 * Calculate all scores based on diagnoses and metric analyses
 * 
 * Score Categories:
 * - Performance: ROAS, CPR, Results (how well the campaign achieves goals)
 * - Efficiency: CTR, CPC, CPM (how efficiently the budget is used)
 * - Delivery: Spend, Budget Utilization, Learning Phase (data sufficiency)
 * - Risk: Frequency, Policy Compliance, Data Sufficiency (potential issues)
 */
export function calculateScores(
  diagnoses: Diagnosis[],
  metricAnalyses: MetricAnalysis[]
): Scores {
  // Calculate each dimension score
  const performance = calculatePerformanceScore(diagnoses, metricAnalyses);
  const efficiency = calculateEfficiencyScore(diagnoses, metricAnalyses);
  const delivery = calculateDeliveryScore(diagnoses, metricAnalyses);
  const risk = calculateRiskScore(diagnoses, metricAnalyses);
  
  // Calculate overall score (weighted average)
  const overall = calculateOverallScore(performance, efficiency, delivery, risk);
  
  return {
    overall,
    performance,
    efficiency,
    delivery,
    risk,
  };
}

/**
 * Calculate Performance Score
 * Based on: ROAS, CPR, Results
 */
function calculatePerformanceScore(
  diagnoses: Diagnosis[],
  metricAnalyses: MetricAnalysis[]
): number {
  let score = 100;
  
  // Check diagnoses for performance metrics
  const performanceMetrics = ['ROAS', 'CPR', 'Results'];
  
  for (const d of diagnoses) {
    if (performanceMetrics.includes(d.metric)) {
      if (d.status === 'critical') {
        score -= 30;
      } else if (d.status === 'warning') {
        score -= 15;
      } else if (d.status === 'info') {
        score -= 5;
      }
    }
  }
  
  // Bonus for excellent performance
  const roasAnalysis = metricAnalyses.find(m => m.metric === 'ROAS');
  if (roasAnalysis && roasAnalysis.status === 'on_target') {
    const roasValue = roasAnalysis.value;
    const benchmark = roasAnalysis.benchmark;
    
    if (roasValue >= benchmark * 1.5) {
      score += 10; // Excellent ROAS bonus
    }
  }
  
  return clampScore(score);
}

/**
 * Calculate Efficiency Score
 * Based on: CTR, CPC, CPM
 */
function calculateEfficiencyScore(
  diagnoses: Diagnosis[],
  metricAnalyses: MetricAnalysis[]
): number {
  let score = 100;
  
  // Check diagnoses for efficiency metrics
  const efficiencyMetrics = ['CTR', 'CPC', 'CPM'];
  
  for (const d of diagnoses) {
    if (efficiencyMetrics.includes(d.metric)) {
      if (d.status === 'critical') {
        score -= 30;
      } else if (d.status === 'warning') {
        score -= 15;
      } else if (d.status === 'info') {
        score -= 5;
      }
    }
  }
  
  // Additional penalty for severe below-benchmark metrics
  for (const m of metricAnalyses) {
    if (efficiencyMetrics.includes(m.metric)) {
      if (m.status === 'below_benchmark') {
        const deviationPct = Math.abs(m.deviation_percentage);
        if (deviationPct > 50) {
          score -= 10; // Severe deviation
        }
      }
    }
  }
  
  return clampScore(score);
}

/**
 * Calculate Delivery Score
 * Based on: Spend, Budget Utilization, Learning Phase
 */
function calculateDeliveryScore(
  diagnoses: Diagnosis[],
  metricAnalyses: MetricAnalysis[]
): number {
  let score = 100;
  
  // Check data sufficiency
  const spendAnalysis = metricAnalyses.find(m => m.metric === 'Spend');
  const resultsAnalysis = metricAnalyses.find(m => m.metric === 'Results');
  
  if (spendAnalysis && spendAnalysis.status === 'insufficient_data') {
    score -= 30; // Insufficient spend
  }
  
  if (resultsAnalysis && resultsAnalysis.status === 'insufficient_data') {
    score -= 20; // Learning phase
  }
  
  // Check diagnoses for delivery metrics
  const deliveryMetrics = ['Spend', 'Results'];
  
  for (const d of diagnoses) {
    if (deliveryMetrics.includes(d.metric)) {
      if (d.status === 'warning') {
        score -= 15;
      } else if (d.status === 'info') {
        score -= 5;
      }
    }
  }
  
  return clampScore(score);
}

/**
 * Calculate Risk Score
 * Based on: Frequency, Policy Compliance, Data Sufficiency
 * Note: Higher score = lower risk
 */
function calculateRiskScore(
  diagnoses: Diagnosis[],
  metricAnalyses: MetricAnalysis[]
): number {
  let score = 100;
  
  // Check frequency risk
  const freqAnalysis = metricAnalyses.find(m => m.metric === 'Frequency');
  if (freqAnalysis) {
    if (freqAnalysis.value > 3.0) {
      score -= 40; // Severe ad fatigue risk
    } else if (freqAnalysis.value > 2.0) {
      score -= 20; // Moderate ad fatigue risk
    } else if (freqAnalysis.value > 1.5) {
      score -= 10; // Monitor frequency
    }
  }
  
  // Check diagnoses for risk metrics
  const riskMetrics = ['Frequency'];
  
  for (const d of diagnoses) {
    if (riskMetrics.includes(d.metric)) {
      if (d.status === 'critical') {
        score -= 30;
      } else if (d.status === 'warning') {
        score -= 15;
      }
    }
  }
  
  return clampScore(score);
}

/**
 * Calculate Overall Score (weighted average)
 */
function calculateOverallScore(
  performance: number,
  efficiency: number,
  delivery: number,
  risk: number
): number {
  // Weights: Performance 30%, Efficiency 25%, Delivery 20%, Risk 25%
  const weights = {
    performance: 0.30,
    efficiency: 0.25,
    delivery: 0.20,
    risk: 0.25,
  };
  
  const overall =
    performance * weights.performance +
    efficiency * weights.efficiency +
    delivery * weights.delivery +
    risk * weights.risk;
  
  return Math.round(overall);
}

/**
 * Clamp score to 0-100 range
 */
function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

// ==================== Utility Functions ====================

/**
 * Get score color based on value
 */
export function getScoreColor(score: number): string {
  if (score >= 90) return '#22C55E'; // Green
  if (score >= 70) return '#3B82F6'; // Blue
  if (score >= 50) return '#F59E0B'; // Orange
  return '#EF4444'; // Red
}

/**
 * Get score status text
 */
export function getScoreStatus(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Needs Improvement';
  return 'Critical';
}

/**
 * Get score grade
 */
export function getScoreGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Compare scores and determine trend
 */
export function compareScores(
  current: Scores,
  previous: Scores
): { trend: 'improving' | 'stable' | 'declining'; change: number } {
  const change = current.overall - previous.overall;
  
  if (Math.abs(change) < 5) {
    return { trend: 'stable', change };
  }
  
  return {
    trend: change > 0 ? 'improving' : 'declining',
    change,
  };
}

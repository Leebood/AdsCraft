/**
 * TikTok AdsCraft Review Standard (ARS)
 * 
 * 定义 TikTok 的审查规则（Rules）、基准值（Benchmarks）、证据要求（Evidence Requirements）
 * 
 * TikTok 采用 4-Layer Review Standard:
 * - Layer 1: Policy Compliance（程序判断）
 * - Layer 2: Creative Quality（程序判断 + AI）- 需要视频数据
 * - Layer 3: Marketing Effectiveness（AI 判断）
 * - Layer 4: Performance Metrics（程序判断）
 */

import { Rule, Benchmark, RuleStatus, RuleSeverity } from './types';

// ============================================================================
// TikTok Benchmarks（基准值）
// ============================================================================

export const TIKTOK_BENCHMARKS: Record<string, Benchmark> = {
  // 视频指标
  '6s_view_rate': {
    metric: '6s_view_rate',
    value: 25, // 25%
    unit: 'percent',
    description: '6-second view rate benchmark',
  },
  'avg_watch_time': {
    metric: 'avg_watch_time',
    value: 4.5, // 4.5 seconds
    unit: 'seconds',
    description: 'Average watch time benchmark',
  },
  
  // 效果指标
  'ctr': {
    metric: 'ctr',
    value: 1.5, // 1.5%
    unit: 'percent',
    description: 'Click-through rate benchmark',
  },
  'cvr': {
    metric: 'cvr',
    value: 3.5, // 3.5%
    unit: 'percent',
    description: 'Conversion rate benchmark',
  },
  'cpc': {
    metric: 'cpc',
    value: 0.80, // $0.80
    unit: 'currency',
    description: 'Cost per click benchmark',
  },
  'cpm': {
    metric: 'cpm',
    value: 10.00, // $10.00
    unit: 'currency',
    description: 'Cost per mille benchmark',
  },
  'cpa': {
    metric: 'cpa',
    value: 8.00, // $8.00
    unit: 'currency',
    description: 'Cost per acquisition benchmark',
  },
  'roas': {
    metric: 'roas',
    value: 2.5, // 2.5x
    unit: 'ratio',
    description: 'Return on ad spend benchmark',
  },
};

// ============================================================================
// Layer 1: Policy Compliance Rules（政策合规）
// ============================================================================

export const TIKTOK_POLICY_RULES: Rule[] = [
  {
    id: 'TK-POLICY-001',
    metric: 'policy_compliance',
    condition: 'contains_prohibited_content',
    status: 'critical',
    severity: 'high',
    recommendation: 'Remove content immediately',
    description: 'Contains prohibited content',
  },
  {
    id: 'TK-POLICY-002',
    metric: 'policy_compliance',
    condition: 'unverified_claims',
    status: 'warning',
    severity: 'medium',
    recommendation: 'Add disclaimers or remove claims',
    description: 'Unverified health/financial claims',
  },
  {
    id: 'TK-POLICY-003',
    metric: 'policy_compliance',
    condition: 'copyrighted_music',
    status: 'warning',
    severity: 'medium',
    recommendation: 'Replace with licensed music',
    description: 'Copyrighted music without license',
  },
  {
    id: 'TK-POLICY-004',
    metric: 'policy_compliance',
    condition: 'misleading_content',
    status: 'info',
    severity: 'low',
    recommendation: 'Add disclaimers',
    description: 'Misleading before/after content',
  },
];

// ============================================================================
// Layer 2: Creative Quality Rules（创意质量）
// ⚠️ 重要：只有在有视频数据时才能分析 Hook
// ============================================================================

export const TIKTOK_CREATIVE_RULES: Rule[] = [
  // 6s View Rate Rules
  {
    id: 'TK-CREATIVE-001',
    metric: '6s_view_rate',
    condition: 'value < 15',
    status: 'critical',
    severity: 'high',
    recommendation: 'Hook is very weak, rewrite first 3 seconds',
    description: '6s view rate is critically low',
  },
  {
    id: 'TK-CREATIVE-002',
    metric: '6s_view_rate',
    condition: '15 <= value < 25',
    status: 'warning',
    severity: 'medium',
    recommendation: 'Hook needs improvement',
    description: '6s view rate is below benchmark',
  },
  {
    id: 'TK-CREATIVE-003',
    metric: '6s_view_rate',
    condition: '25 <= value < 35',
    status: 'good',
    severity: 'none',
    recommendation: 'Hook is effective',
    description: '6s view rate is on target',
  },
  {
    id: 'TK-CREATIVE-004',
    metric: '6s_view_rate',
    condition: 'value >= 35',
    status: 'excellent',
    severity: 'none',
    recommendation: 'Hook is very strong',
    description: '6s view rate is excellent',
  },
  
  // Average Watch Time Rules
  {
    id: 'TK-CREATIVE-005',
    metric: 'avg_watch_time',
    condition: 'value < 3',
    status: 'critical',
    severity: 'high',
    recommendation: 'Video too short or boring',
    description: 'Average watch time is critically low',
  },
  {
    id: 'TK-CREATIVE-006',
    metric: 'avg_watch_time',
    condition: '3 <= value < 5',
    status: 'warning',
    severity: 'medium',
    recommendation: 'Improve pacing and engagement',
    description: 'Average watch time is below benchmark',
  },
  {
    id: 'TK-CREATIVE-007',
    metric: 'avg_watch_time',
    condition: 'value >= 5',
    status: 'good',
    severity: 'none',
    recommendation: 'Good engagement',
    description: 'Average watch time is on target',
  },
];

// ============================================================================
// Layer 4: Performance Metrics Rules（效果指标）
// ============================================================================

export const TIKTOK_PERFORMANCE_RULES: Rule[] = [
  // CTR Rules
  {
    id: 'TK-PERF-001',
    metric: 'ctr',
    condition: 'value < 1.0',
    status: 'critical',
    severity: 'high',
    recommendation: 'Urgent: Creative or landing page issue',
    description: 'CTR is critically low',
  },
  {
    id: 'TK-PERF-002',
    metric: 'ctr',
    condition: '1.0 <= value < 1.5',
    status: 'warning',
    severity: 'medium',
    recommendation: 'Below benchmark, review creative',
    description: 'CTR is below benchmark',
  },
  {
    id: 'TK-PERF-003',
    metric: 'ctr',
    condition: 'value >= 1.5',
    status: 'good',
    severity: 'none',
    recommendation: 'On track',
    description: 'CTR is on target',
  },
  
  // CVR Rules
  {
    id: 'TK-PERF-004',
    metric: 'cvr',
    condition: 'value < 2.0',
    status: 'critical',
    severity: 'high',
    recommendation: 'Landing page or offer issue',
    description: 'Conversion rate is critically low',
  },
  {
    id: 'TK-PERF-005',
    metric: 'cvr',
    condition: '2.0 <= value < 3.5',
    status: 'warning',
    severity: 'medium',
    recommendation: 'Below benchmark, optimize funnel',
    description: 'Conversion rate is below benchmark',
  },
  {
    id: 'TK-PERF-006',
    metric: 'cvr',
    condition: 'value >= 3.5',
    status: 'good',
    severity: 'none',
    recommendation: 'On track',
    description: 'Conversion rate is on target',
  },
  
  // CPA Rules
  {
    id: 'TK-PERF-007',
    metric: 'cpa',
    condition: 'value > benchmark * 2.0',
    status: 'critical',
    severity: 'high',
    recommendation: 'Cost too high, optimize or pause',
    description: 'CPA is critically high',
  },
  {
    id: 'TK-PERF-008',
    metric: 'cpa',
    condition: 'benchmark * 1.5 < value <= benchmark * 2.0',
    status: 'warning',
    severity: 'medium',
    recommendation: 'Above target, review funnel',
    description: 'CPA is above benchmark',
  },
  {
    id: 'TK-PERF-009',
    metric: 'cpa',
    condition: 'value <= benchmark',
    status: 'good',
    severity: 'none',
    recommendation: 'On target',
    description: 'CPA is on target',
  },
  
  // ROAS Rules
  {
    id: 'TK-PERF-010',
    metric: 'roas',
    condition: 'value < benchmark * 0.5',
    status: 'critical',
    severity: 'high',
    recommendation: 'Not profitable, pause or major optimization',
    description: 'ROAS is critically low',
  },
  {
    id: 'TK-PERF-011',
    metric: 'roas',
    condition: 'benchmark * 0.5 <= value < benchmark',
    status: 'warning',
    severity: 'medium',
    recommendation: 'Below target, optimize',
    description: 'ROAS is below benchmark',
  },
  {
    id: 'TK-PERF-012',
    metric: 'roas',
    condition: 'value >= benchmark',
    status: 'good',
    severity: 'none',
    recommendation: 'On track',
    description: 'ROAS is on target',
  },
];

// ============================================================================
// Data Sufficiency Rules（数据充分性）
// ============================================================================

export const TIKTOK_DATA_SUFFICIENCY_RULES: Rule[] = [
  {
    id: 'TK-SPEND-001',
    metric: 'spend',
    condition: 'value < 50',
    status: 'warning',
    severity: 'medium',
    recommendation: 'Insufficient data, wait for more spend',
    description: 'Spend is too low for reliable analysis',
  },
  {
    id: 'TK-SPEND-002',
    metric: 'spend',
    condition: '50 <= value < 100',
    status: 'info',
    severity: 'low',
    recommendation: 'Limited data, results may not be reliable',
    description: 'Spend is limited',
  },
  {
    id: 'TK-SPEND-003',
    metric: 'spend',
    condition: 'value >= 100',
    status: 'good',
    severity: 'none',
    recommendation: 'Sufficient data for analysis',
    description: 'Spend is sufficient',
  },
  {
    id: 'TK-RESULT-001',
    metric: 'results',
    condition: 'value < 50',
    status: 'warning',
    severity: 'medium',
    recommendation: 'Learning phase, wait for more results',
    description: 'Results count is too low',
  },
  {
    id: 'TK-RESULT-002',
    metric: 'results',
    condition: '50 <= value < 100',
    status: 'info',
    severity: 'low',
    recommendation: 'Early data, monitor closely',
    description: 'Results count is limited',
  },
  {
    id: 'TK-RESULT-003',
    metric: 'results',
    condition: 'value >= 100',
    status: 'good',
    severity: 'none',
    recommendation: 'Sufficient data for analysis',
    description: 'Results count is sufficient',
  },
];

// ============================================================================
// All TikTok Rules
// ============================================================================

export const ALL_TIKTOK_RULES: Rule[] = [
  ...TIKTOK_POLICY_RULES,
  ...TIKTOK_CREATIVE_RULES,
  ...TIKTOK_PERFORMANCE_RULES,
  ...TIKTOK_DATA_SUFFICIENCY_RULES,
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * 获取指定指标的基准值
 */
export function getTikTokBenchmark(metric: string): Benchmark | undefined {
  return TIKTOK_BENCHMARKS[metric];
}

/**
 * 获取指定指标的所有规则
 */
export function getTikTokRulesForMetric(metric: string): Rule[] {
  return ALL_TIKTOK_RULES.filter(rule => rule.metric === metric);
}

/**
 * 检查是否有视频数据（用于判断是否可以分析 Hook）
 */
export function hasVideoData(data: {
  video_views?: number;
  six_second_views?: number;
  six_second_view_rate?: number;
  avg_watch_time?: number;
}): boolean {
  return (
    data.video_views !== undefined && data.video_views !== null &&
    data.six_second_view_rate !== undefined && data.six_second_view_rate !== null &&
    data.avg_watch_time !== undefined && data.avg_watch_time !== null
  );
}

/**
 * 检查数据是否充分
 */
export function hasSufficientData(data: {
  spend?: number;
  results?: number;
}): { sufficient: boolean; warning?: string } {
  if (data.spend === undefined || data.spend === null) {
    return { sufficient: false, warning: 'Spend data not available' };
  }
  if (data.spend < 50) {
    return { sufficient: false, warning: 'Insufficient data, wait for more spend (>$50)' };
  }
  if (data.results === undefined || data.results === null) {
    return { sufficient: false, warning: 'Results data not available' };
  }
  if (data.results < 50) {
    return { sufficient: false, warning: 'Learning phase, wait for more results (>50)' };
  }
  return { sufficient: true };
}

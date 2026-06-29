/**
 * Facebook ARS (AdsCraft Review Standard)
 * 定义 Facebook 平台的审查规则、基准值、证据要求
 * 参考 ARS.md
 */

import type { FacebookRule } from './types';

// ==================== Facebook Rules ====================

/**
 * CTR (Click-Through Rate) Rules
 */
export const FACEBOOK_CTR_RULES: FacebookRule[] = [
  {
    rule_id: 'FB-CTR-001',
    metric: 'CTR',
    condition: 'CTR < 0.5%',
    check: (value: number) => value < 0.5,
    status: 'critical',
    severity: 'high',
    recommendation: 'Urgent: Review creative and audience targeting immediately',
  },
  {
    rule_id: 'FB-CTR-002',
    metric: 'CTR',
    condition: '0.5% ≤ CTR < 1.0%',
    check: (value: number) => value >= 0.5 && value < 1.0,
    status: 'warning',
    severity: 'medium',
    recommendation: 'Review creative and audience targeting',
  },
  {
    rule_id: 'FB-CTR-003',
    metric: 'CTR',
    condition: '1.0% ≤ CTR < 1.5%',
    check: (value: number) => value >= 1.0 && value < 1.5,
    status: 'info',
    severity: 'low',
    recommendation: 'Below benchmark, monitor closely',
  },
  {
    rule_id: 'FB-CTR-004',
    metric: 'CTR',
    condition: 'CTR ≥ 1.5%',
    check: (value: number) => value >= 1.5,
    status: 'good',
    severity: 'none',
    recommendation: 'On track, continue monitoring',
  },
];

/**
 * CPC (Cost Per Click) Rules
 * CPC rules compare against benchmark
 */
export const FACEBOOK_CPC_RULES: FacebookRule[] = [
  {
    rule_id: 'FB-CPC-001',
    metric: 'CPC',
    condition: 'CPC > Benchmark × 2.0',
    check: (value: number, benchmark?: number) => benchmark !== undefined && value > benchmark * 2.0,
    status: 'critical',
    severity: 'high',
    recommendation: 'Urgent: Optimize bidding strategy or audience',
  },
  {
    rule_id: 'FB-CPC-002',
    metric: 'CPC',
    condition: 'Benchmark × 1.5 < CPC ≤ Benchmark × 2.0',
    check: (value: number, benchmark?: number) => benchmark !== undefined && value > benchmark * 1.5 && value <= benchmark * 2.0,
    status: 'warning',
    severity: 'medium',
    recommendation: 'Review bidding strategy and audience quality',
  },
  {
    rule_id: 'FB-CPC-003',
    metric: 'CPC',
    condition: 'Benchmark × 1.0 < CPC ≤ Benchmark × 1.5',
    check: (value: number, benchmark?: number) => benchmark !== undefined && value > benchmark && value <= benchmark * 1.5,
    status: 'info',
    severity: 'low',
    recommendation: 'Slightly above benchmark, monitor',
  },
  {
    rule_id: 'FB-CPC-004',
    metric: 'CPC',
    condition: 'CPC ≤ Benchmark',
    check: (value: number, benchmark?: number) => benchmark !== undefined && value <= benchmark,
    status: 'good',
    severity: 'none',
    recommendation: 'On track',
  },
];

/**
 * Frequency Rules
 */
export const FACEBOOK_FREQUENCY_RULES: FacebookRule[] = [
  {
    rule_id: 'FB-FREQ-001',
    metric: 'Frequency',
    condition: 'Frequency > 3.0',
    check: (value: number) => value > 3.0,
    status: 'critical',
    severity: 'high',
    recommendation: 'Urgent: Ad fatigue detected, refresh creative immediately',
  },
  {
    rule_id: 'FB-FREQ-002',
    metric: 'Frequency',
    condition: '2.0 < Frequency ≤ 3.0',
    check: (value: number) => value > 2.0 && value <= 3.0,
    status: 'warning',
    severity: 'medium',
    recommendation: 'Ad fatigue risk, consider refreshing creative',
  },
  {
    rule_id: 'FB-FREQ-003',
    metric: 'Frequency',
    condition: '1.5 < Frequency ≤ 2.0',
    check: (value: number) => value > 1.5 && value <= 2.0,
    status: 'info',
    severity: 'low',
    recommendation: 'Monitor frequency trend',
  },
  {
    rule_id: 'FB-FREQ-004',
    metric: 'Frequency',
    condition: 'Frequency ≤ 1.5',
    check: (value: number) => value <= 1.5,
    status: 'good',
    severity: 'none',
    recommendation: 'Healthy frequency',
  },
];

/**
 * ROAS (Return on Ad Spend) Rules
 * ROAS rules compare against target (benchmark)
 */
export const FACEBOOK_ROAS_RULES: FacebookRule[] = [
  {
    rule_id: 'FB-ROAS-001',
    metric: 'ROAS',
    condition: 'ROAS < Target × 0.5',
    check: (value: number, benchmark?: number) => benchmark !== undefined && value < benchmark * 0.5,
    status: 'critical',
    severity: 'high',
    recommendation: 'Urgent: Campaign not profitable, pause or major optimization',
  },
  {
    rule_id: 'FB-ROAS-002',
    metric: 'ROAS',
    condition: 'Target × 0.5 ≤ ROAS < Target',
    check: (value: number, benchmark?: number) => benchmark !== undefined && value >= benchmark * 0.5 && value < benchmark,
    status: 'warning',
    severity: 'medium',
    recommendation: 'Below target, optimize landing page and creative',
  },
  {
    rule_id: 'FB-ROAS-003',
    metric: 'ROAS',
    condition: 'Target ≤ ROAS < Target × 1.5',
    check: (value: number, benchmark?: number) => benchmark !== undefined && value >= benchmark && value < benchmark * 1.5,
    status: 'good',
    severity: 'none',
    recommendation: 'On target',
  },
  {
    rule_id: 'FB-ROAS-004',
    metric: 'ROAS',
    condition: 'ROAS ≥ Target × 1.5',
    check: (value: number, benchmark?: number) => benchmark !== undefined && value >= benchmark * 1.5,
    status: 'excellent',
    severity: 'none',
    recommendation: 'Excellent performance, consider scaling',
  },
];

/**
 * Cost per Result (CPR) Rules
 */
export const FACEBOOK_CPR_RULES: FacebookRule[] = [
  {
    rule_id: 'FB-CPR-001',
    metric: 'CPR',
    condition: 'CPR > Target × 2.0',
    check: (value: number, benchmark?: number) => benchmark !== undefined && value > benchmark * 2.0,
    status: 'critical',
    severity: 'high',
    recommendation: 'Urgent: Cost too high, optimize or pause',
  },
  {
    rule_id: 'FB-CPR-002',
    metric: 'CPR',
    condition: 'Target × 1.5 < CPR ≤ Target × 2.0',
    check: (value: number, benchmark?: number) => benchmark !== undefined && value > benchmark * 1.5 && value <= benchmark * 2.0,
    status: 'warning',
    severity: 'medium',
    recommendation: 'Above target, review funnel',
  },
  {
    rule_id: 'FB-CPR-003',
    metric: 'CPR',
    condition: 'Target × 1.0 < CPR ≤ Target × 1.5',
    check: (value: number, benchmark?: number) => benchmark !== undefined && value > benchmark && value <= benchmark * 1.5,
    status: 'info',
    severity: 'low',
    recommendation: 'Slightly above target',
  },
  {
    rule_id: 'FB-CPR-004',
    metric: 'CPR',
    condition: 'CPR ≤ Target',
    check: (value: number, benchmark?: number) => benchmark !== undefined && value <= benchmark,
    status: 'good',
    severity: 'none',
    recommendation: 'On target',
  },
];

/**
 * Spend Rules (Data Sufficiency)
 */
export const FACEBOOK_SPEND_RULES: FacebookRule[] = [
  {
    rule_id: 'FB-SPEND-001',
    metric: 'Spend',
    condition: 'Spend < $50',
    check: (value: number) => value < 50,
    status: 'warning',
    severity: 'medium',
    recommendation: 'Insufficient data, wait for more spend',
  },
  {
    rule_id: 'FB-SPEND-002',
    metric: 'Spend',
    condition: '$50 ≤ Spend < $100',
    check: (value: number) => value >= 50 && value < 100,
    status: 'info',
    severity: 'low',
    recommendation: 'Limited data, results may not be reliable',
  },
  {
    rule_id: 'FB-SPEND-003',
    metric: 'Spend',
    condition: 'Spend ≥ $100',
    check: (value: number) => value >= 100,
    status: 'good',
    severity: 'none',
    recommendation: 'Sufficient data for analysis',
  },
];

/**
 * Results Rules (Data Sufficiency)
 */
export const FACEBOOK_RESULTS_RULES: FacebookRule[] = [
  {
    rule_id: 'FB-RESULT-001',
    metric: 'Results',
    condition: 'Results < 50',
    check: (value: number) => value < 50,
    status: 'warning',
    severity: 'medium',
    recommendation: 'Learning phase, wait for more results',
  },
  {
    rule_id: 'FB-RESULT-002',
    metric: 'Results',
    condition: '50 ≤ Results < 100',
    check: (value: number) => value >= 50 && value < 100,
    status: 'info',
    severity: 'low',
    recommendation: 'Early data, monitor closely',
  },
  {
    rule_id: 'FB-RESULT-003',
    metric: 'Results',
    condition: 'Results ≥ 100',
    check: (value: number) => value >= 100,
    status: 'good',
    severity: 'none',
    recommendation: 'Sufficient data for analysis',
  },
];

/**
 * CPM (Cost Per Mille) Rules
 */
export const FACEBOOK_CPM_RULES: FacebookRule[] = [
  {
    rule_id: 'FB-CPM-001',
    metric: 'CPM',
    condition: 'CPM > Benchmark × 2.0',
    check: (value: number, benchmark?: number) => benchmark !== undefined && value > benchmark * 2.0,
    status: 'critical',
    severity: 'high',
    recommendation: 'Urgent: Audience too narrow or competition high',
  },
  {
    rule_id: 'FB-CPM-002',
    metric: 'CPM',
    condition: 'Benchmark × 1.5 < CPM ≤ Benchmark × 2.0',
    check: (value: number, benchmark?: number) => benchmark !== undefined && value > benchmark * 1.5 && value <= benchmark * 2.0,
    status: 'warning',
    severity: 'medium',
    recommendation: 'Above benchmark, review audience and bidding',
  },
  {
    rule_id: 'FB-CPM-003',
    metric: 'CPM',
    condition: 'Benchmark × 1.0 < CPM ≤ Benchmark × 1.5',
    check: (value: number, benchmark?: number) => benchmark !== undefined && value > benchmark && value <= benchmark * 1.5,
    status: 'info',
    severity: 'low',
    recommendation: 'Slightly above benchmark',
  },
  {
    rule_id: 'FB-CPM-004',
    metric: 'CPM',
    condition: 'CPM ≤ Benchmark',
    check: (value: number, benchmark?: number) => benchmark !== undefined && value <= benchmark,
    status: 'good',
    severity: 'none',
    recommendation: 'On track',
  },
];

// ==================== All Facebook Rules ====================

export const ALL_FACEBOOK_RULES: FacebookRule[] = [
  ...FACEBOOK_CTR_RULES,
  ...FACEBOOK_CPC_RULES,
  ...FACEBOOK_FREQUENCY_RULES,
  ...FACEBOOK_ROAS_RULES,
  ...FACEBOOK_CPR_RULES,
  ...FACEBOOK_SPEND_RULES,
  ...FACEBOOK_RESULTS_RULES,
  ...FACEBOOK_CPM_RULES,
];

/**
 * Get rules for a specific metric
 */
export function getRulesForMetric(metric: string): FacebookRule[] {
  const metricMap: Record<string, FacebookRule[]> = {
    'CTR': FACEBOOK_CTR_RULES,
    'CPC': FACEBOOK_CPC_RULES,
    'Frequency': FACEBOOK_FREQUENCY_RULES,
    'ROAS': FACEBOOK_ROAS_RULES,
    'CPR': FACEBOOK_CPR_RULES,
    'Spend': FACEBOOK_SPEND_RULES,
    'Results': FACEBOOK_RESULTS_RULES,
    'CPM': FACEBOOK_CPM_RULES,
  };
  return metricMap[metric] || [];
}

/**
 * Data sufficiency thresholds
 */
export const DATA_SUFFICIENCY = {
  MIN_SPEND: 50, // Minimum $50 spend for reliable analysis
  MIN_RESULTS: 50, // Minimum 50 results for reliable analysis
  LEARNING_PHASE_RESULTS: 100, // 100 results for stable optimization
};

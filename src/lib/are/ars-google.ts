/**
 * Google Ads Review Standard (ARS)
 * 
 * 定义 Google Ads 的诊断规则（Rules）和基准值（Benchmarks）
 * 
 * 参考文档：ARS.md
 */

import { Benchmark, Rule, RuleSeverity } from './types';

// ============================================================================
// Google Ads Benchmarks（基准值）
// ============================================================================

/**
 * Google Ads 通用基准值
 * 
 * 数据来源：Google Ads 官方文档、行业报告
 * 按广告类型区分：搜索广告、展示广告、购物广告
 */
export const GOOGLE_BENCHMARKS: Record<string, Benchmark> = {
  // CTR（点击率）
  ctr: {
    metric: 'CTR',
    value: 3.17, // Google 搜索广告平均 CTR
    unit: '%',
    description: 'Click-Through Rate',
    source: 'Google Ads Benchmark 2024',
  },
  
  // CPC（单次点击成本）
  cpc: {
    metric: 'CPC',
    value: 2.69, // Google 搜索广告平均 CPC
    unit: '$',
    description: 'Cost Per Click',
    source: 'Google Ads Benchmark 2024',
  },
  
  // CPM（千次展示成本）
  cpm: {
    metric: 'CPM',
    value: 12.00, // Google 展示广告平均 CPM
    unit: '$',
    description: 'Cost Per Mille',
    source: 'Google Ads Benchmark 2024',
  },
  
  // CVR（转化率）
  cvr: {
    metric: 'CVR',
    value: 3.75, // Google 搜索广告平均转化率
    unit: '%',
    description: 'Conversion Rate',
    source: 'Google Ads Benchmark 2024',
  },
  
  // CPA（单次转化成本）
  cpa: {
    metric: 'CPA',
    value: 30.00, // Google 搜索广告平均 CPA
    unit: '$',
    description: 'Cost Per Acquisition',
    source: 'Google Ads Benchmark 2024',
  },
  
  // ROAS（广告支出回报率）
  roas: {
    metric: 'ROAS',
    value: 3.0, // Google 广告通常要求更高的 ROAS
    unit: 'x',
    description: 'Return On Ad Spend',
    source: 'Google Ads Benchmark 2024',
  },
  
  // Quality Score（质量得分）
  quality_score: {
    metric: 'Quality Score',
    value: 5, // 质量得分范围 1-10
    unit: '',
    description: 'Quality Score (1-10)',
    source: 'Google Ads Best Practice',
  },
};

/**
 * 按广告类型区分的基准值
 */
export const GOOGLE_BENCHMARKS_BY_AD_TYPE = {
  search: {
    ctr: 3.17,
    cpc: 2.69,
    cvr: 3.75,
    roas: 3.0,
  },
  display: {
    ctr: 0.47,
    cpc: 0.65,
    cvr: 0.5,
    roas: 1.5,
  },
  shopping: {
    ctr: 1.5,
    cpc: 1.2,
    cvr: 2.5,
    roas: 4.0,
  },
};

// ============================================================================
// Google Ads Rules（诊断规则）
// ============================================================================

/**
 * CTR（点击率）规则
 * 
 * Google 搜索广告通常 CTR 更高（平均 3.17%）
 */
export const GOOGLE_CTR_RULES: Rule[] = [
  {
    rule_id: 'GOOG-CTR-001',
    metric: 'CTR',
    condition: 'CTR < 1%',
    status: 'critical',
    severity: 'high',
    recommendation: 'Urgent: CTR is very low. Review ad copy, keywords, and targeting immediately.',
    description: 'CTR below 1% indicates serious issues with ad relevance or targeting.',
  },
  {
    rule_id: 'GOOG-CTR-002',
    metric: 'CTR',
    condition: '1% ≤ CTR < 2%',
    status: 'warning',
    severity: 'medium',
    recommendation: 'CTR is below benchmark. Improve ad copy and keyword relevance.',
    description: 'CTR between 1-2% needs improvement.',
  },
  {
    rule_id: 'GOOG-CTR-003',
    metric: 'CTR',
    condition: '2% ≤ CTR < 3%',
    status: 'info',
    severity: 'low',
    recommendation: 'CTR is slightly below benchmark. Monitor and optimize.',
    description: 'CTR between 2-3% is acceptable but can be improved.',
  },
  {
    rule_id: 'GOOG-CTR-004',
    metric: 'CTR',
    condition: 'CTR ≥ 3%',
    status: 'good',
    severity: 'none',
    recommendation: 'CTR is on track. Continue monitoring.',
    description: 'CTR is at or above benchmark.',
  },
];

/**
 * CPC（单次点击成本）规则
 */
export const GOOGLE_CPC_RULES: Rule[] = [
  {
    rule_id: 'GOOG-CPC-001',
    metric: 'CPC',
    condition: 'CPC > Benchmark × 2.0',
    status: 'critical',
    severity: 'high',
    recommendation: 'Urgent: CPC is very high. Optimize bidding strategy or review keyword quality.',
    description: 'CPC more than double the benchmark indicates cost issues.',
  },
  {
    rule_id: 'GOOG-CPC-002',
    metric: 'CPC',
    condition: 'Benchmark × 1.5 < CPC ≤ Benchmark × 2.0',
    status: 'warning',
    severity: 'medium',
    recommendation: 'CPC is above benchmark. Review bidding strategy and keyword quality.',
    description: 'CPC is moderately high.',
  },
  {
    rule_id: 'GOOG-CPC-003',
    metric: 'CPC',
    condition: 'Benchmark × 1.0 < CPC ≤ Benchmark × 1.5',
    status: 'info',
    severity: 'low',
    recommendation: 'CPC is slightly above benchmark. Monitor closely.',
    description: 'CPC is acceptable but can be optimized.',
  },
  {
    rule_id: 'GOOG-CPC-004',
    metric: 'CPC',
    condition: 'CPC ≤ Benchmark',
    status: 'good',
    severity: 'none',
    recommendation: 'CPC is on track.',
    description: 'CPC is at or below benchmark.',
  },
];

/**
 * CVR（转化率）规则
 */
export const GOOGLE_CVR_RULES: Rule[] = [
  {
    rule_id: 'GOOG-CVR-001',
    metric: 'CVR',
    condition: 'CVR < 1%',
    status: 'critical',
    severity: 'high',
    recommendation: 'Urgent: Conversion rate is very low. Review landing page and offer.',
    description: 'CVR below 1% indicates serious issues.',
  },
  {
    rule_id: 'GOOG-CVR-002',
    metric: 'CVR',
    condition: '1% ≤ CVR < 2%',
    status: 'warning',
    severity: 'medium',
    recommendation: 'CVR is below benchmark. Optimize landing page and CTA.',
    description: 'CVR between 1-2% needs improvement.',
  },
  {
    rule_id: 'GOOG-CVR-003',
    metric: 'CVR',
    condition: '2% ≤ CVR < 3.5%',
    status: 'info',
    severity: 'low',
    recommendation: 'CVR is acceptable. Monitor and optimize.',
    description: 'CVR between 2-3.5% is acceptable.',
  },
  {
    rule_id: 'GOOG-CVR-004',
    metric: 'CVR',
    condition: 'CVR ≥ 3.5%',
    status: 'good',
    severity: 'none',
    recommendation: 'CVR is on track.',
    description: 'CVR is at or above benchmark.',
  },
];

/**
 * ROAS（广告支出回报率）规则
 * 
 * Google 通常要求更高的 ROAS（3.0x+）
 */
export const GOOGLE_ROAS_RULES: Rule[] = [
  {
    rule_id: 'GOOG-ROAS-001',
    metric: 'ROAS',
    condition: 'ROAS < 1.5',
    status: 'critical',
    severity: 'high',
    recommendation: 'Urgent: ROAS is very low. Campaign may not be profitable. Pause or major optimization needed.',
    description: 'ROAS below 1.5 indicates poor profitability.',
  },
  {
    rule_id: 'GOOG-ROAS-002',
    metric: 'ROAS',
    condition: '1.5 ≤ ROAS < 2.5',
    status: 'warning',
    severity: 'medium',
    recommendation: 'ROAS is below benchmark. Optimize landing page and creative.',
    description: 'ROAS between 1.5-2.5 needs improvement.',
  },
  {
    rule_id: 'GOOG-ROAS-003',
    metric: 'ROAS',
    condition: '2.5 ≤ ROAS < 4.0',
    status: 'good',
    severity: 'none',
    recommendation: 'ROAS is on track.',
    description: 'ROAS between 2.5-4.0 is acceptable.',
  },
  {
    rule_id: 'GOOG-ROAS-004',
    metric: 'ROAS',
    condition: 'ROAS ≥ 4.0',
    status: 'excellent',
    severity: 'none',
    recommendation: 'ROAS is excellent. Consider scaling.',
    description: 'ROAS is above 4.0, excellent performance.',
  },
];

/**
 * Quality Score（质量得分）规则
 * 
 * Google Ads 特有指标，范围 1-10
 */
export const GOOGLE_QUALITY_SCORE_RULES: Rule[] = [
  {
    rule_id: 'GOOG-QS-001',
    metric: 'Quality Score',
    condition: 'Quality Score < 3',
    status: 'critical',
    severity: 'high',
    recommendation: 'Urgent: Quality Score is very low. Improve ad relevance, landing page experience, and expected CTR.',
    description: 'Quality Score below 3 indicates serious issues.',
  },
  {
    rule_id: 'GOOG-QS-002',
    metric: 'Quality Score',
    condition: '3 ≤ Quality Score < 5',
    status: 'warning',
    severity: 'medium',
    recommendation: 'Quality Score is below average. Focus on improving ad relevance and landing page.',
    description: 'Quality Score between 3-5 needs improvement.',
  },
  {
    rule_id: 'GOOG-QS-003',
    metric: 'Quality Score',
    condition: '5 ≤ Quality Score < 7',
    status: 'good',
    severity: 'none',
    recommendation: 'Quality Score is average. Continue optimizing.',
    description: 'Quality Score between 5-7 is acceptable.',
  },
  {
    rule_id: 'GOOG-QS-004',
    metric: 'Quality Score',
    condition: 'Quality Score ≥ 7',
    status: 'excellent',
    severity: 'none',
    recommendation: 'Quality Score is excellent. Maintain current strategy.',
    description: 'Quality Score 7+ is excellent.',
  },
];

/**
 * 统一的 Google Ads 规则集合
 */
export const GOOGLE_RULES: Rule[] = [
  ...GOOGLE_CTR_RULES,
  ...GOOGLE_CPC_RULES,
  ...GOOGLE_ROAS_RULES,
  ...GOOGLE_QUALITY_SCORE_RULES,
];

/**
 * CPA（单次转化成本）规则
 */
export const GOOGLE_CPA_RULES: Rule[] = [
  {
    rule_id: 'GOOG-CPA-001',
    metric: 'CPA',
    condition: 'CPA > Target × 2.0',
    status: 'critical',
    severity: 'high',
    recommendation: 'Urgent: CPA is very high. Optimize or pause campaign.',
    description: 'CPA more than double the target indicates cost issues.',
  },
  {
    rule_id: 'GOOG-CPA-002',
    metric: 'CPA',
    condition: 'Target × 1.5 < CPA ≤ Target × 2.0',
    status: 'warning',
    severity: 'medium',
    recommendation: 'CPA is above target. Review funnel and optimization.',
    description: 'CPA is moderately high.',
  },
  {
    rule_id: 'GOOG-CPA-003',
    metric: 'CPA',
    condition: 'Target × 1.0 < CPA ≤ Target × 1.5',
    status: 'info',
    severity: 'low',
    recommendation: 'CPA is slightly above target.',
    description: 'CPA is acceptable but can be optimized.',
  },
  {
    rule_id: 'GOOG-CPA-004',
    metric: 'CPA',
    condition: 'CPA ≤ Target',
    status: 'good',
    severity: 'none',
    recommendation: 'CPA is on target.',
    description: 'CPA is at or below target.',
  },
];

// ============================================================================
// 所有 Google Ads 规则汇总
// ============================================================================

export const GOOGLE_ALL_RULES: Rule[] = [
  ...GOOGLE_CTR_RULES,
  ...GOOGLE_CPC_RULES,
  ...GOOGLE_CVR_RULES,
  ...GOOGLE_ROAS_RULES,
  ...GOOGLE_QUALITY_SCORE_RULES,
  ...GOOGLE_CPA_RULES,
];

/**
 * 根据指标名称获取对应的规则
 */
export function getGoogleRulesForMetric(metric: string): Rule[] {
  const metricLower = metric.toLowerCase();
  
  if (metricLower === 'ctr' || metricLower === 'click-through rate') {
    return GOOGLE_CTR_RULES;
  }
  if (metricLower === 'cpc' || metricLower === 'cost per click') {
    return GOOGLE_CPC_RULES;
  }
  if (metricLower === 'cvr' || metricLower === 'conversion rate') {
    return GOOGLE_CVR_RULES;
  }
  if (metricLower === 'roas' || metricLower === 'return on ad spend') {
    return GOOGLE_ROAS_RULES;
  }
  if (metricLower === 'quality score' || metricLower === 'quality_score') {
    return GOOGLE_QUALITY_SCORE_RULES;
  }
  if (metricLower === 'cpa' || metricLower === 'cost per acquisition') {
    return GOOGLE_CPA_RULES;
  }
  
  return [];
}

/**
 * 获取 Google Ads 基准值
 */
export function getGoogleBenchmark(metric: string): Benchmark | undefined {
  const metricLower = metric.toLowerCase().replace(/\s+/g, '_');
  return GOOGLE_BENCHMARKS[metricLower];
}

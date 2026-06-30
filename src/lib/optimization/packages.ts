/**
 * Core Issue Packages
 * 
 * 6 个核心 Issue 的 Package 定义
 * - CTR_LOW: 点击率低于基准
 * - FREQUENCY_HIGH: 频次过高
 * - COST_PER_RESULT_HIGH: 单次结果成本过高
 * - ROAS_LOW: 广告支出回报率低
 * - SPEND_TOO_LOW: 花费过低
 * - NO_RESULTS: 无转化结果
 */

import { OptimizationIssue, RecommendedAction } from './types';

/**
 * CTR_LOW - 点击率低于基准
 * 
 * 推荐：headline_generation, copy_generation, cta_generation
 * 禁止：audience_targeting, bid_strategy
 */
export const CTR_LOW_PACKAGE: OptimizationIssue = {
  issue_id: 'CTR_LOW',
  severity: 'High',
  confidence: 85,
  description: 'Click-through rate is below benchmark. Ad creative may not be engaging enough.',
  recommended_actions: [
    {
      action_id: 'ctr_low_001',
      capability: 'headline_generation',
      title: 'Generate New Headlines',
      reason: 'Low CTR often indicates weak headlines. Fresh headlines can improve engagement.',
      impact: 'High',
      status: 'pending',
      required_inputs: ['product_name', 'value_proposition'],
      forbidden_actions: ['audience_targeting', 'bid_strategy'],
    },
    {
      action_id: 'ctr_low_002',
      capability: 'copy_generation',
      title: 'Optimize Ad Copy',
      reason: 'Compelling copy can increase click-through rates.',
      impact: 'High',
      status: 'pending',
      required_inputs: ['product_name', 'target_audience', 'value_proposition'],
      forbidden_actions: ['audience_targeting', 'bid_strategy'],
    },
    {
      action_id: 'ctr_low_003',
      capability: 'cta_generation',
      title: 'Improve Call-to-Action',
      reason: 'Stronger CTA can drive more clicks.',
      impact: 'Medium',
      status: 'pending',
      required_inputs: ['campaign_goal'],
      forbidden_actions: ['audience_targeting', 'bid_strategy'],
    },
  ],
};

/**
 * FREQUENCY_HIGH - 频次过高
 * 
 * 推荐：creative_generation, creative_rotation
 * 禁止：audience_expansion
 */
export const FREQUENCY_HIGH_PACKAGE: OptimizationIssue = {
  issue_id: 'FREQUENCY_HIGH',
  severity: 'Medium',
  confidence: 90,
  description: 'Ad frequency is too high. Audience may be experiencing ad fatigue.',
  recommended_actions: [
    {
      action_id: 'freq_high_001',
      capability: 'creative_generation',
      title: 'Generate New Creatives',
      reason: 'Fresh creatives can combat ad fatigue and re-engage audience.',
      impact: 'High',
      status: 'pending',
      required_inputs: ['product_name', 'target_audience'],
      forbidden_actions: ['audience_expansion'],
    },
    {
      action_id: 'freq_high_002',
      capability: 'creative_rotation',
      title: 'Implement Creative Rotation',
      reason: 'Rotating creatives prevents audience fatigue.',
      impact: 'High',
      status: 'pending',
      required_inputs: ['current_creatives', 'frequency_data'],
      forbidden_actions: ['audience_expansion'],
    },
  ],
};

/**
 * COST_PER_RESULT_HIGH - 单次结果成本过高
 * 
 * 推荐：offer_optimization, copy_optimization, landing_page_checklist
 * 禁止：bid_strategy_modification
 */
export const COST_PER_RESULT_HIGH_PACKAGE: OptimizationIssue = {
  issue_id: 'COST_PER_RESULT_HIGH',
  severity: 'High',
  confidence: 80,
  description: 'Cost per result is above benchmark. Conversion efficiency needs improvement.',
  recommended_actions: [
    {
      action_id: 'cpr_high_001',
      capability: 'offer_optimization',
      title: 'Optimize Offer',
      reason: 'A more compelling offer can improve conversion rates and reduce cost per result.',
      impact: 'High',
      status: 'pending',
      required_inputs: ['current_offer'],
      forbidden_actions: ['bid_strategy_modification'],
    },
    {
      action_id: 'cpr_high_002',
      capability: 'copy_optimization',
      title: 'Optimize Ad Copy',
      reason: 'Better copy can improve conversion rates.',
      impact: 'Medium',
      status: 'pending',
      required_inputs: ['current_copy'],
      forbidden_actions: ['bid_strategy_modification'],
    },
    {
      action_id: 'cpr_high_003',
      capability: 'landing_page_checklist',
      title: 'Review Landing Page',
      reason: 'Landing page issues may be causing low conversion rates.',
      impact: 'High',
      status: 'pending',
      required_inputs: ['landing_page_url', 'campaign_goal'],
      forbidden_actions: ['bid_strategy_modification'],
    },
  ],
};

/**
 * ROAS_LOW - 广告支出回报率低
 * 
 * 推荐：value_proposition_optimization, priority_optimization
 * 禁止：budget_increase（无证据支撑）
 */
export const ROAS_LOW_PACKAGE: OptimizationIssue = {
  issue_id: 'ROAS_LOW',
  severity: 'High',
  confidence: 75,
  description: 'Return on ad spend is below target. Revenue efficiency needs improvement.',
  recommended_actions: [
    {
      action_id: 'roas_low_001',
      capability: 'value_proposition_optimization',
      title: 'Strengthen Value Proposition',
      reason: 'Clearer value proposition can improve conversion value.',
      impact: 'High',
      status: 'pending',
      required_inputs: ['current_value_prop', 'target_audience'],
      forbidden_actions: ['budget_increase'],
    },
    {
      action_id: 'roas_low_002',
      capability: 'priority_optimization',
      title: 'Optimize Campaign Priorities',
      reason: 'Reallocating budget to best-performing campaigns can improve overall ROAS.',
      impact: 'High',
      status: 'pending',
      required_inputs: ['campaigns', 'total_budget'],
      forbidden_actions: ['budget_increase'],
    },
  ],
};

/**
 * SPEND_TOO_LOW - 花费过低
 * 
 * 推荐：budget_increase_suggestion, campaign_expansion
 * 禁止：audience_narrowing
 */
export const SPEND_TOO_LOW_PACKAGE: OptimizationIssue = {
  issue_id: 'SPEND_TOO_LOW',
  severity: 'Medium',
  confidence: 85,
  description: 'Campaign spend is too low to reach meaningful results.',
  recommended_actions: [
    {
      action_id: 'spend_low_001',
      capability: 'budget_increase_suggestion',
      title: 'Suggest Budget Increase',
      reason: 'Increasing budget can help reach more audience and generate more results.',
      impact: 'High',
      status: 'pending',
      required_inputs: ['current_budget', 'performance_metrics', 'evidence'],
      forbidden_actions: ['audience_narrowing'],
    },
    {
      action_id: 'spend_low_002',
      capability: 'campaign_expansion',
      title: 'Expand Campaign Reach',
      reason: 'Expanding to new audiences or markets can increase spend efficiency.',
      impact: 'Medium',
      status: 'pending',
      required_inputs: ['current_campaigns'],
      forbidden_actions: ['audience_narrowing'],
    },
  ],
};

/**
 * NO_RESULTS - 无转化结果
 * 
 * 推荐：offer_review, landing_page_review, tracking_check
 * 禁止：creative_change（先检查基础问题）
 */
export const NO_RESULTS_PACKAGE: OptimizationIssue = {
  issue_id: 'NO_RESULTS',
  severity: 'High',
  confidence: 95,
  description: 'No conversion results detected. Fundamental issues need to be addressed first.',
  recommended_actions: [
    {
      action_id: 'no_results_001',
      capability: 'tracking_check',
      title: 'Verify Tracking Setup',
      reason: 'Tracking issues may be causing results to not be recorded.',
      impact: 'High',
      status: 'pending',
      required_inputs: ['platform'],
      forbidden_actions: ['creative_change'],
    },
    {
      action_id: 'no_results_002',
      capability: 'landing_page_review',
      title: 'Review Landing Page',
      reason: 'Landing page issues may be preventing conversions.',
      impact: 'High',
      status: 'pending',
      required_inputs: ['landing_page_url'],
      forbidden_actions: ['creative_change'],
    },
    {
      action_id: 'no_results_003',
      capability: 'offer_review',
      title: 'Review Offer',
      reason: 'Offer may not be compelling enough to drive conversions.',
      impact: 'Medium',
      status: 'pending',
      required_inputs: ['offer_details', 'target_audience'],
      forbidden_actions: ['creative_change'],
    },
  ],
};

/**
 * Get all core issue packages
 */
export function getAllCoreIssuePackages(): OptimizationIssue[] {
  return [
    CTR_LOW_PACKAGE,
    FREQUENCY_HIGH_PACKAGE,
    COST_PER_RESULT_HIGH_PACKAGE,
    ROAS_LOW_PACKAGE,
    SPEND_TOO_LOW_PACKAGE,
    NO_RESULTS_PACKAGE,
  ];
}

/**
 * Get issue package by ID
 */
export function getIssuePackage(issueId: string): OptimizationIssue | undefined {
  const packages = getAllCoreIssuePackages();
  return packages.find(p => p.issue_id === issueId);
}

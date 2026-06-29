/**
 * AdsCraft Review Engine (ARE) - Type Definitions
 * 统一类型定义，供所有引擎模块使用
 */

// ==================== Data Source ====================

export type DataSourceType = 'OCR' | 'Meta API' | 'TikTok API' | 'CSV' | 'Manual';

export interface DataSource {
  type: DataSourceType;
  screenshot_url?: string;
  ocr_confidence?: number;
  api_version?: string;
  advertiser_id?: string;
  file_name?: string;
}

// ==================== Facebook Campaign Data ====================

export interface FacebookCampaign {
  name: string;
  delivery: string; // Active / Paused
  budget: number;
  spent: number;
  results: number;
  cpr: number; // Cost per Result
  impressions: number;
  reach: number;
  ctr: number; // percentage, e.g., 2.34 means 2.34%
  cpc: number;
  frequency: number;
  roas: number;
  cpm?: number;
  // Optional Ad Set Level
  audience?: string;
  placement?: string;
  learning_phase?: string;
  // Optional Ad Level
  creative_type?: string;
  hook?: string;
  cta?: string;
  landing_page?: string;
}

export interface FacebookParsedData {
  platform: 'facebook';
  data_source: DataSource;
  date_range: string;
  snapshot_date?: string;
  campaigns: FacebookCampaign[];
}

// ==================== Evidence ====================

export interface EvidenceSource {
  type: DataSourceType;
  column?: string;
  row?: string;
  confidence?: number;
  field?: string;
  api_version?: string;
  advertiser_id?: string;
  file_name?: string;
}

export interface Evidence {
  evidence_id: string;
  metric: string;
  value: number;
  value_formatted: string;
  benchmark?: number;
  benchmark_formatted?: string;
  status: 'above' | 'below' | 'on_target' | 'insufficient_data';
  campaign: string;
  source: EvidenceSource;
  timestamp: string;
}

// ==================== Metric Analysis ====================

export interface MetricRelationship {
  type: string;
  related_metric: string;
  diagnosis: string;
  explanation?: string;
}

export interface MetricAnalysis {
  metric: string;
  evidence_id: string;
  value: number;
  value_formatted: string;
  benchmark: number;
  benchmark_formatted: string;
  status: 'above_benchmark' | 'below_benchmark' | 'on_target' | 'insufficient_data';
  deviation: number;
  deviation_percentage: number;
  trend?: 'declining' | 'stable' | 'increasing';
  relationships?: MetricRelationship[];
}

// ==================== Rule Engine ====================

export type RuleStatus = 'critical' | 'warning' | 'info' | 'good' | 'excellent';
export type RuleSeverity = 'high' | 'medium' | 'low' | 'none';

export interface FacebookRule {
  rule_id: string;
  metric: string;
  condition: string;
  check: (value: number, benchmark?: number, target?: number) => boolean;
  status: RuleStatus;
  severity: RuleSeverity;
  recommendation: string;
}

export interface Diagnosis {
  rule_id: string;
  metric: string;
  evidence_id: string;
  value: number;
  value_formatted: string;
  condition: string;
  status: RuleStatus;
  severity: RuleSeverity;
  recommendation: string;
  campaign: string;
}

// ==================== Score Engine ====================

export interface Scores {
  overall: number;
  performance: number;
  efficiency: number;
  delivery: number;
  risk: number;
}

// ==================== Action Plan ====================

export interface ActionPlanItem {
  priority: 'P0' | 'P1' | 'P2';
  action: string;
  issue: string;
  details: string;
  expected_impact: string;
  related_evidence: string[];
  related_diagnosis: string[];
}

// ==================== LLM Explanation ====================

export interface LLMExplanation {
  executive_summary: string;
  diagnosis: string;
  action_plan: string;
}

// ==================== AOS Report (Full Output) ====================

export interface AOSReport {
  report_id: string;
  platform: 'facebook' | 'tiktok' | 'google' | 'linkedin';
  campaign_name: string;
  generated_at: string;
  data_source: DataSource;
  date_range: string;
  snapshot_date?: string;

  scores: Scores;

  evidence: Evidence[];
  metric_analysis: MetricAnalysis[];
  diagnosis: Diagnosis[];
  action_plan: ActionPlanItem[];

  llm_explanation: LLMExplanation;

  warnings: string[];

  metadata: {
    analysis_duration_ms: number;
    model_used: string;
    ars_version: string;
    are_version: string;
  };
}

// ==================== Benchmarks ====================

export interface FacebookBenchmarks {
  ctr: number;
  cpc: number;
  cpm: number;
  frequency: number;
  roas: number;
  cpr: number;
}

export type IndustryType = 'ecommerce' | 'saas' | 'local_service' | 'gaming';

export const FACEBOOK_BENCHMARKS: Record<IndustryType, FacebookBenchmarks> = {
  ecommerce: {
    ctr: 1.5,
    cpc: 1.50,
    cpm: 12.00,
    frequency: 1.5,
    roas: 2.5,
    cpr: 15.00,
  },
  saas: {
    ctr: 1.2,
    cpc: 2.50,
    cpm: 18.00,
    frequency: 1.3,
    roas: 3.0,
    cpr: 50.00,
  },
  local_service: {
    ctr: 1.8,
    cpc: 1.20,
    cpm: 10.00,
    frequency: 1.8,
    roas: 2.0,
    cpr: 20.00,
  },
  gaming: {
    ctr: 1.0,
    cpc: 0.80,
    cpm: 8.00,
    frequency: 2.0,
    roas: 1.5,
    cpr: 5.00,
  },
};

// Default benchmarks (e-commerce as default)
export const DEFAULT_BENCHMARKS = FACEBOOK_BENCHMARKS.ecommerce;

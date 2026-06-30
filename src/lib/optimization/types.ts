/**
 * Optimization Package Schema
 * 
 * 遵循 Principle 5: Package 不绑定具体 AI，使用 capability 而不是 tool
 * 遵循 Principle 4: 每个 action 必须有 status 字段
 * 遵循 Principle 3: 每个 capability 必须声明 required_inputs
 */

// Capability 标识符类型
export type CapabilityId =
  | 'headline_generation'
  | 'copy_generation'
  | 'cta_generation'
  | 'creative_generation'
  | 'creative_rotation'
  | 'offer_optimization'
  | 'copy_optimization'
  | 'landing_page_checklist'
  | 'value_proposition_optimization'
  | 'priority_optimization'
  | 'budget_increase_suggestion'
  | 'campaign_expansion'
  | 'offer_review'
  | 'landing_page_review'
  | 'tracking_check'
  | 'audience_targeting'
  | 'bid_strategy'
  | 'audience_expansion'
  | 'bid_strategy_modification'
  | 'budget_increase'
  | 'audience_narrowing'
  | 'creative_change';

// 严重程度
export type Severity = 'High' | 'Medium' | 'Low';

// 预期影响
export type Impact = 'High' | 'Medium' | 'Low';

// 完成状态
export type ActionStatus = 'pending' | 'completed';

// 置信度 (0-100)
export type Confidence = number;

// 前置条件输入类型
export type InputType = 'string' | 'number' | 'boolean' | 'array' | 'object';

// 输入定义
export interface InputDefinition {
  name: string;
  type: InputType;
  description: string;
  required: boolean;
  example?: string;
}

// Capability 定义
export interface CapabilityDefinition {
  id: CapabilityId;
  name: string;
  description: string;
  required_inputs: InputDefinition[];
  // V1 阶段占位，后续接入具体 AI 服务
  service_router?: string;
}

// 推荐行动
export interface RecommendedAction {
  action_id: string;
  capability: CapabilityId;
  title: string;
  reason: string;
  impact: Impact;
  status: ActionStatus;
  required_inputs: string[]; // 前置条件数组（输入字段名）
  forbidden_actions: CapabilityId[]; // 禁止行动数组
}

// Issue 定义
export interface OptimizationIssue {
  issue_id: string;
  severity: Severity;
  confidence: Confidence;
  description: string;
  recommended_actions: RecommendedAction[];
}

// Optimization Package
export interface OptimizationPackage {
  platform: 'facebook' | 'tiktok' | 'google';
  campaign_id?: string;
  issues: OptimizationIssue[];
  generated_at: string;
  version: string;
}

// Capability 校验结果
export interface CapabilityValidationResult {
  valid: boolean;
  missing_inputs: string[];
  capability: CapabilityId;
}

// Package 生成结果
export interface PackageGenerationResult {
  success: boolean;
  package?: OptimizationPackage;
  errors?: string[];
}

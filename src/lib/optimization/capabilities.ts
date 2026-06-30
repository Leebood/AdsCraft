/**
 * Capability Definitions
 * 
 * 每个 capability 声明需要的输入
 * V1 阶段先占位，后续接入具体 AI 服务
 */

import { CapabilityDefinition } from './types';

export const CAPABILITIES: Record<string, CapabilityDefinition> = {
  // 文案生成类
  headline_generation: {
    id: 'headline_generation',
    name: 'Headline Generation',
    description: 'Generate optimized headlines for ads',
    required_inputs: [
      { name: 'product_name', type: 'string', description: 'Product or service name', required: true },
      { name: 'value_proposition', type: 'string', description: 'Main value proposition', required: true },
    ],
    service_router: 'text-generation',
  },

  copy_generation: {
    id: 'copy_generation',
    name: 'Copy Generation',
    description: 'Generate ad copy (primary text, description)',
    required_inputs: [
      { name: 'product_name', type: 'string', description: 'Product or service name', required: true },
      { name: 'target_audience', type: 'string', description: 'Target audience description', required: true },
      { name: 'value_proposition', type: 'string', description: 'Main value proposition', required: true },
    ],
    service_router: 'text-generation',
  },

  cta_generation: {
    id: 'cta_generation',
    name: 'CTA Generation',
    description: 'Generate call-to-action suggestions',
    required_inputs: [
      { name: 'campaign_goal', type: 'string', description: 'Campaign goal (e.g., purchase, sign-up)', required: true },
      { name: 'industry', type: 'string', description: 'Industry or business type', required: false },
    ],
    service_router: 'text-generation',
  },

  // 素材生成类
  creative_generation: {
    id: 'creative_generation',
    name: 'Creative Generation',
    description: 'Generate new ad creative concepts',
    required_inputs: [
      { name: 'product_name', type: 'string', description: 'Product or service name', required: true },
      { name: 'target_audience', type: 'string', description: 'Target audience description', required: true },
      { name: 'brand_tone', type: 'string', description: 'Brand tone (e.g., professional, casual)', required: false },
    ],
    service_router: 'image-generation',
  },

  creative_rotation: {
    id: 'creative_rotation',
    name: 'Creative Rotation',
    description: 'Suggest creative rotation strategy',
    required_inputs: [
      { name: 'current_creatives', type: 'array', description: 'List of current creative IDs', required: true },
      { name: 'frequency_data', type: 'object', description: 'Frequency data per creative', required: true },
    ],
    service_router: 'strategy',
  },

  // 优化类
  offer_optimization: {
    id: 'offer_optimization',
    name: 'Offer Optimization',
    description: 'Optimize offer and promotion strategy',
    required_inputs: [
      { name: 'current_offer', type: 'string', description: 'Current offer description', required: true },
      { name: 'competitor_offers', type: 'array', description: 'Competitor offers (optional)', required: false },
    ],
    service_router: 'strategy',
  },

  copy_optimization: {
    id: 'copy_optimization',
    name: 'Copy Optimization',
    description: 'Optimize existing ad copy',
    required_inputs: [
      { name: 'current_copy', type: 'string', description: 'Current ad copy text', required: true },
      { name: 'performance_data', type: 'object', description: 'Performance metrics', required: false },
    ],
    service_router: 'text-optimization',
  },

  landing_page_checklist: {
    id: 'landing_page_checklist',
    name: 'Landing Page Checklist',
    description: 'Generate landing page optimization checklist',
    required_inputs: [
      { name: 'landing_page_url', type: 'string', description: 'Landing page URL', required: true },
      { name: 'campaign_goal', type: 'string', description: 'Campaign goal', required: true },
    ],
    service_router: 'analysis',
  },

  value_proposition_optimization: {
    id: 'value_proposition_optimization',
    name: 'Value Proposition Optimization',
    description: 'Optimize value proposition messaging',
    required_inputs: [
      { name: 'current_value_prop', type: 'string', description: 'Current value proposition', required: true },
      { name: 'target_audience', type: 'string', description: 'Target audience', required: true },
    ],
    service_router: 'text-optimization',
  },

  priority_optimization: {
    id: 'priority_optimization',
    name: 'Priority Optimization',
    description: 'Optimize campaign priorities and budget allocation',
    required_inputs: [
      { name: 'campaigns', type: 'array', description: 'List of campaigns with performance data', required: true },
      { name: 'total_budget', type: 'number', description: 'Total budget', required: true },
    ],
    service_router: 'strategy',
  },

  budget_increase_suggestion: {
    id: 'budget_increase_suggestion',
    name: 'Budget Increase Suggestion',
    description: 'Suggest budget increase with evidence',
    required_inputs: [
      { name: 'current_budget', type: 'number', description: 'Current budget', required: true },
      { name: 'performance_metrics', type: 'object', description: 'Performance metrics (ROAS, CPA, etc.)', required: true },
      { name: 'evidence', type: 'object', description: 'Evidence supporting increase', required: true },
    ],
    service_router: 'strategy',
  },

  campaign_expansion: {
    id: 'campaign_expansion',
    name: 'Campaign Expansion',
    description: 'Suggest campaign expansion strategies',
    required_inputs: [
      { name: 'current_campaigns', type: 'array', description: 'Current campaign list', required: true },
      { name: 'target_markets', type: 'array', description: 'Potential target markets', required: false },
    ],
    service_router: 'strategy',
  },

  // 审查类
  offer_review: {
    id: 'offer_review',
    name: 'Offer Review',
    description: 'Review and analyze current offer',
    required_inputs: [
      { name: 'offer_details', type: 'string', description: 'Offer details', required: true },
      { name: 'target_audience', type: 'string', description: 'Target audience', required: true },
    ],
    service_router: 'analysis',
  },

  landing_page_review: {
    id: 'landing_page_review',
    name: 'Landing Page Review',
    description: 'Review landing page for conversion issues',
    required_inputs: [
      { name: 'landing_page_url', type: 'string', description: 'Landing page URL', required: true },
    ],
    service_router: 'analysis',
  },

  tracking_check: {
    id: 'tracking_check',
    name: 'Tracking Check',
    description: 'Check tracking setup and configuration',
    required_inputs: [
      { name: 'platform', type: 'string', description: 'Ad platform (facebook, tiktok, google)', required: true },
      { name: 'pixel_id', type: 'string', description: 'Pixel or tag ID', required: false },
    ],
    service_router: 'analysis',
  },
};

/**
 * Get capability by ID
 */
export function getCapability(id: string): CapabilityDefinition | undefined {
  return CAPABILITIES[id];
}

/**
 * Get all capability IDs
 */
export function getAllCapabilityIds(): string[] {
  return Object.keys(CAPABILITIES);
}

/**
 * Validate required inputs for a capability
 */
export function validateCapabilityInputs(
  capabilityId: string,
  inputs: Record<string, unknown>
): { valid: boolean; missingInputs: string[] } {
  const capability = CAPABILITIES[capabilityId];
  if (!capability) {
    return { valid: false, missingInputs: [`Unknown capability: ${capabilityId}`] };
  }

  const missingInputs: string[] = [];
  for (const input of capability.required_inputs) {
    if (input.required && !(input.name in inputs)) {
      missingInputs.push(input.name);
    }
  }

  return {
    valid: missingInputs.length === 0,
    missingInputs,
  };
}

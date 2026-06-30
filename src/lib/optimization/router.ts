/**
 * Capability Router
 * 
 * capability → Service Router → 具体 AI 服务
 * 
 * V1 阶段先占位，后续接入具体 AI 服务
 */

import { CapabilityId, CapabilityValidationResult } from './types';
import { CAPABILITIES, validateCapabilityInputs } from './capabilities';

// Service Router 类型
export type ServiceRouterType = 
  | 'text-generation'
  | 'text-optimization'
  | 'image-generation'
  | 'strategy'
  | 'analysis';

// Service Router 配置
interface ServiceRouterConfig {
  type: ServiceRouterType;
  endpoint?: string;
  model?: string;
  enabled: boolean;
}

// V1 阶段占位配置
const SERVICE_ROUTERS: Record<ServiceRouterType, ServiceRouterConfig> = {
  'text-generation': {
    type: 'text-generation',
    endpoint: '/api/services/text-generation',
    model: 'placeholder',
    enabled: false, // V1 阶段禁用
  },
  'text-optimization': {
    type: 'text-optimization',
    endpoint: '/api/services/text-optimization',
    model: 'placeholder',
    enabled: false,
  },
  'image-generation': {
    type: 'image-generation',
    endpoint: '/api/services/image-generation',
    model: 'placeholder',
    enabled: false,
  },
  'strategy': {
    type: 'strategy',
    endpoint: '/api/services/strategy',
    model: 'placeholder',
    enabled: false,
  },
  'analysis': {
    type: 'analysis',
    endpoint: '/api/services/analysis',
    model: 'placeholder',
    enabled: false,
  },
};

/**
 * Get service router for a capability
 */
export function getServiceRouter(capabilityId: CapabilityId): ServiceRouterConfig | null {
  const capability = CAPABILITIES[capabilityId];
  if (!capability) {
    return null;
  }

  const routerType = capability.service_router as ServiceRouterType;
  return SERVICE_ROUTERS[routerType] || null;
}

/**
 * Check if a capability is available (service router enabled)
 */
export function isCapabilityAvailable(capabilityId: CapabilityId): boolean {
  const router = getServiceRouter(capabilityId);
  return router?.enabled ?? false;
}

/**
 * Route capability to service
 * V1 阶段返回占位信息
 */
export async function routeCapability(
  capabilityId: CapabilityId,
  inputs: Record<string, unknown>
): Promise<{
  success: boolean;
  result?: unknown;
  error?: string;
  router?: ServiceRouterConfig;
}> {
  // 1. Validate capability exists
  const capability = CAPABILITIES[capabilityId];
  if (!capability) {
    return {
      success: false,
      error: `Unknown capability: ${capabilityId}`,
    };
  }

  // 2. Validate required inputs
  const validation = validateCapabilityInputs(capabilityId, inputs);
  if (!validation.valid) {
    return {
      success: false,
      error: `Missing required inputs: ${validation.missingInputs.join(', ')}`,
    };
  }

  // 3. Get service router
  const router = getServiceRouter(capabilityId);
  if (!router) {
    return {
      success: false,
      error: `No service router configured for capability: ${capabilityId}`,
    };
  }

  // 4. Check if service is enabled
  if (!router.enabled) {
    return {
      success: false,
      error: `Service router not enabled for capability: ${capabilityId}. This feature is coming soon.`,
      router,
    };
  }

  // 5. Route to service (V1 阶段占位)
  // TODO: 后续接入具体 AI 服务
  return {
    success: false,
    error: 'Service not yet implemented. Coming in V2.',
    router,
  };
}

/**
 * Validate capability inputs
 */
export function validateCapability(
  capabilityId: string,
  inputs: Record<string, unknown>
): CapabilityValidationResult {
  const validation = validateCapabilityInputs(capabilityId, inputs);
  return {
    valid: validation.valid,
    missing_inputs: validation.missingInputs,
    capability: capabilityId as CapabilityId,
  };
}

/**
 * Get all available capabilities
 */
export function getAvailableCapabilities(): CapabilityId[] {
  return Object.keys(CAPABILITIES).filter(id => isCapabilityAvailable(id as CapabilityId)) as CapabilityId[];
}

/**
 * Get all capabilities (including unavailable)
 */
export function getAllCapabilities(): CapabilityId[] {
  return Object.keys(CAPABILITIES) as CapabilityId[];
}

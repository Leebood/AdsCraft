/**
 * 模型分层方案 - 模型路由模块
 * 
 * L0: 纯代码判定，不调用AI（第一层硬规则审查）
 * L1: 基础诊断报告（gpt-4o-mini，免费用户）
 * L2: 拒审分析/素材诊断（gpt-4o-mini深入，付费基础）
 * L3: 深度归因（deepseek-reasoner，付费Pro）
 */

// 用户层级类型
export type UserTier = 'free' | 'paid_basic' | 'paid_pro';

// 任务类型
export type TaskType = 'rule_check' | 'report' | 'rejection_analysis' | 'deep_attribution';

// 模型配置接口
export interface ModelConfig {
  layer: 'L0' | 'L1' | 'L2' | 'L3';
  model: string;
  max_input_tokens: number;
  max_output_tokens: number;
  enable_web_search: boolean;
  knowledge_base_retrieval: boolean;
  knowledge_top_k: number;
  temperature: number;
  system_prompt_extra?: string;
}

// L0: 纯代码判定（不调用AI）
export const L0_CONFIG: ModelConfig = {
  layer: 'L0',
  model: 'none', // 不使用模型
  max_input_tokens: 0,
  max_output_tokens: 0,
  enable_web_search: false,
  knowledge_base_retrieval: false,
  knowledge_top_k: 0,
  temperature: 0,
  system_prompt_extra: '纯代码判定，不调用AI',
};

// L1: 基础诊断报告（免费用户）
export const L1_CONFIG: ModelConfig = {
  layer: 'L1',
  model: 'gpt-4o-mini',
  max_input_tokens: 10000,
  max_output_tokens: 2000,
  enable_web_search: false, // 统一关闭Web Search
  knowledge_base_retrieval: true, // 走知识库RAG
  knowledge_top_k: 5,
  temperature: 0.3,
  system_prompt_extra: '',
};

// L2: 拒审分析/素材诊断（付费基础）
export const L2_CONFIG: ModelConfig = {
  layer: 'L2',
  model: 'gpt-4o-mini',
  max_input_tokens: 30000,
  max_output_tokens: 4000,
  enable_web_search: false, // 统一关闭Web Search
  knowledge_base_retrieval: true, // 走知识库RAG
  knowledge_top_k: 10, // L1默认5条，L2取10条
  temperature: 0.2,
  system_prompt_extra: `
你需要完成多步推理：
1. 识别违反的具体政策条款（引用编号）
2. 分析素材中触发违规的具体元素
3. 给出针对性修改方案（不是泛泛建议）
4. 评估修改后通过审核的概率
`,
};

// L3: 深度归因（付费Pro）
export const L3_CONFIG: ModelConfig = {
  layer: 'L3',
  model: 'deepseek-reasoner',
  max_input_tokens: 60000,
  max_output_tokens: 8000,
  enable_web_search: false, // 统一关闭Web Search
  knowledge_base_retrieval: true, // 走知识库RAG
  knowledge_top_k: 20,
  temperature: 0.1,
  system_prompt_extra: `
你需要完成深度归因分析：
1. 结合账户历史数据做趋势归因
2. 交叉分析多个变量（素材/受众/出价/时段）
3. 给出可量化的优化路径和预期效果
4. 输出结构化优化方案（含优先级排序）
`,
};

/**
 * 模型路由函数
 * 根据用户层级和任务类型选择合适的模型配置
 */
export function selectModelLayer(
  tier: UserTier,
  taskType: TaskType
): ModelConfig {
  // L0: 规则检查任何用户都不走AI
  if (taskType === 'rule_check') {
    return L0_CONFIG;
  }

  // 免费用户：只走L1
  if (tier === 'free') {
    return L1_CONFIG;
  }

  // 付费基础：报告L1，拒审走L2
  if (tier === 'paid_basic') {
    return taskType === 'rejection_analysis' ? L2_CONFIG : L1_CONFIG;
  }

  // 付费Pro：报告L1，拒审L2，深度归因L3
  if (tier === 'paid_pro') {
    if (taskType === 'deep_attribution') return L3_CONFIG;
    if (taskType === 'rejection_analysis') return L2_CONFIG;
    return L1_CONFIG;
  }

  // 默认降级到L1
  return L1_CONFIG;
}

/**
 * 获取用户层级
 * 根据订阅状态判断用户层级
 */
export function getUserTier(isSubscribed: boolean, subscriptionPlan?: string): UserTier {
  if (!isSubscribed) return 'free';
  
  // 根据订阅计划判断层级
  if (subscriptionPlan === 'pro' || subscriptionPlan === 'brand_awareness') {
    return 'paid_pro';
  }
  
  return 'paid_basic';
}

/**
 * 检查是否需要调用AI
 * L0层不需要调用AI
 */
export function needsAICall(config: ModelConfig): boolean {
  return config.layer !== 'L0';
}

/**
 * 获取模型调用参数
 * 用于实际的API调用
 */
export function getModelCallParams(config: ModelConfig): {
  model: string;
  maxTokens: number;
  temperature: number;
  enableWebSearch: boolean;
} {
  return {
    model: config.model,
    maxTokens: config.max_output_tokens,
    temperature: config.temperature,
    enableWebSearch: config.enable_web_search,
  };
}
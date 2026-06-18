/**
 * TikTok 账号阶段诊断配置
 * 仅 TikTok 出现，FB 不受影响
 */

// 账号阶段类型
export type AccountStage = 'new_account' | 'stable_account' | 'declining_account';

// 账号阶段配置
export interface AccountStageConfig {
  id: AccountStage;
  name: string;
  nameZh: string;
  description: string;
  descriptionZh: string;
  icon: string;
  color: string;
  diagnosisPrompt: string;
}

// 新账号诊断 Prompt
const NEW_ACCOUNT_PROMPT = `你是TikTok新账号冷启动专家。用户刚创建TikTok广告账号，处于冷启动阶段。

【账号状态】
- 阶段：新账号冷启动
- 投放天数：{days_running}
- 日预算：{daily_budget}
- 目标：{goal}

【冷启动关键指标分析】
1. 学习期完成情况（7天7转化）
2. 素材质量评估（视频完播率、点击率）
3. 受众定向宽度（是否过窄导致无法学习）
4. 出价策略（是否需要提高出价加速学习）

【诊断框架】
1. 当前冷启动进展评估
2. 学习期瓶颈识别
3. 冷启动优化建议（素材、受众、出价）
4. 预期学习期完成时间

【输出格式】
{
  "stage_assessment": "账号阶段评估结果",
  "key_metrics": ["关键指标分析1", "关键指标分析2"],
  "bottlenecks": ["瓶颈1", "瓶颈2"],
  "optimization_suggestions": [
    {"category": "素材", "suggestion": "具体建议"},
    {"category": "受众", "suggestion": "具体建议"},
    {"category": "出价", "suggestion": "具体建议"}
  ],
  "expected_learning_completion": "预计学习期完成时间",
  "risk_warnings": ["风险提示1", "风险提示2"]
}`;

// 老号平平诊断 Prompt
const STABLE_ACCOUNT_PROMPT = `你是TikTok广告优化专家。用户账号运行稳定但效果平平，没有明显增长。

【账号状态】
- 阶段：老号平平（效果稳定但无突破）
- 投放天数：{days_running}
- 日预算：{daily_budget}
- 当前CTR：{ctr}
- 当前CPC：{cpc}
- 当前转化率：{conversion_rate}

【平平状态关键分析】
1. 素材老化检测（是否需要更新素材）
2. 受众饱和度分析（是否需要拓展受众）
3. 出价竞争力分析（是否需要调整出价策略）
4. 广告结构评估（是否需要优化广告组结构）

【诊断框架】
1. 当前效果停滞原因诊断
2. 突破瓶颈识别
3. 效果突破建议（素材迭代、受众拓展、结构调整）
4. 预期效果提升区间

【输出格式】
{
  "stage_assessment": "账号阶段评估结果",
  "stagnation_reasons": ["停滞原因1", "停滞原因2"],
  "key_metrics": ["关键指标分析1", "关键指标分析2"],
  "breakthrough_suggestions": [
    {"category": "素材迭代", "suggestion": "具体建议"},
    {"category": "受众拓展", "suggestion": "具体建议"},
    {"category": "结构优化", "suggestion": "具体建议"}
  ],
  "expected_improvement": "预计效果提升区间",
  "priority_actions": ["优先行动1", "优先行动2"]
}`;

// 老号掉量诊断 Prompt
const DECLINING_ACCOUNT_PROMPT = `你是TikTok广告诊断专家。用户账号效果下滑明显，需要诊断掉量原因。

【账号状态】
- 阶段：老号掉量（效果下滑）
- 投放天数：{days_running}
- 日预算：{daily_budget}
- 效果变化：CTR从{ctr_old}降至{ctr_new}，转化率从{conv_old}降至{conv_new}
- 掉量开始时间：{decline_start}

【掉量关键分析】
1. 素材疲劳检测（素材是否已经疲劳）
2. 受众变化分析（是否有竞争对手抢占流量）
3. 平台政策变化检查（是否有政策影响）
4. 算法调整检测（是否有算法更新）
5. 账户健康度检查（是否有账户限制）

【诊断框架】
1. 掉量原因诊断（最可能原因排序）
2. 关键影响因子识别
3. 恢复建议（素材更新、受众调整、账户优化）
4. 预期恢复时间

【输出格式】
{
  "stage_assessment": "账号阶段评估结果",
  "decline_reasons": [{"reason": "掉量原因", "confidence": 0.8}, {"reason": "掉量原因2", "confidence": 0.6}],
  "impact_factors": ["影响因子1", "影响因子2"],
  "recovery_suggestions": [
    {"category": "素材更新", "suggestion": "具体建议"},
    {"category": "受众调整", "suggestion": "具体建议"},
    {"category": "账户优化", "suggestion": "具体建议"}
  ],
  "expected_recovery_time": "预计恢复时间",
  "urgent_actions": ["紧急行动1", "紧急行动2"]
}`;

// 账号阶段配置
export const ACCOUNT_STAGE_CONFIGS: Record<AccountStage, AccountStageConfig> = {
  new_account: {
    id: 'new_account',
    name: 'New Account',
    nameZh: '新账号',
    description: 'New TikTok ad account in cold start phase',
    descriptionZh: 'TikTok新广告账号，处于冷启动阶段',
    icon: '🌱',
    color: '#22D3EE',
    diagnosisPrompt: NEW_ACCOUNT_PROMPT
  },
  stable_account: {
    id: 'stable_account',
    name: 'Stable Account',
    nameZh: '老号平平',
    description: 'Account running stable but no growth',
    descriptionZh: '账号运行稳定但效果平平，没有明显突破',
    icon: '📊',
    color: '#F59E0B',
    diagnosisPrompt: STABLE_ACCOUNT_PROMPT
  },
  declining_account: {
    id: 'declining_account',
    name: 'Declining Account',
    nameZh: '老号掉量',
    description: 'Account performance declining significantly',
    descriptionZh: '账号效果下滑明显，需要诊断掉量原因',
    icon: '📉',
    color: '#EF4444',
    diagnosisPrompt: DECLINING_ACCOUNT_PROMPT
  }
};

// 账号阶段选择问题配置
export const ACCOUNT_STAGE_QUIZ = {
  id: 'account_stage',
  title: 'Account Stage',
  titleZh: '账号阶段',
  description: 'What is your TikTok account status?',
  descriptionZh: '你的TikTok广告账号处于什么状态？',
  options: [
    {
      id: 'new_account',
      label: 'New Account',
      labelZh: '新账号',
      value: 'new_account',
      description: 'Just started, in learning phase',
      descriptionZh: '刚创建账号，处于冷启动学习期'
    },
    {
      id: 'stable_account',
      label: 'Stable but Flat',
      labelZh: '老号平平',
      value: 'stable_account',
      description: 'Running stable but no growth',
      descriptionZh: '运行稳定但效果平平无突破'
    },
    {
      id: 'declining_account',
      label: 'Declining Performance',
      labelZh: '老号掉量',
      value: 'declining_account',
      description: 'Performance dropping significantly',
      descriptionZh: '效果明显下滑需要诊断'
    }
  ]
};

// 获取账号阶段配置
export function getAccountStageConfig(stage: AccountStage): AccountStageConfig {
  return ACCOUNT_STAGE_CONFIGS[stage];
}

// 获取账号阶段诊断 Prompt
export function getAccountStageDiagnosisPrompt(stage: AccountStage): string {
  return ACCOUNT_STAGE_CONFIGS[stage].diagnosisPrompt;
}

// 合并诊断建议模板
export const COMBINED_DIAGNOSIS_TEMPLATE = `【TikTok账号+广告综合诊断】

账号阶段：{account_stage}
账号诊断：{account_diagnosis}

广告诊断：{ad_diagnosis}

【综合优化建议】
1. 账号层面优化（账号阶段相关问题）
2. 广告层面优化（素材、受众、出价）
3. 协同优化建议（账号+广告联动）

【优先级排序】
- P0 紧急：{urgent_actions}
- P1 重要：{important_actions}
- P2 常规：{regular_actions}

【预期效果】
账号恢复时间：{account_recovery}
广告优化效果：{ad_improvement}`;
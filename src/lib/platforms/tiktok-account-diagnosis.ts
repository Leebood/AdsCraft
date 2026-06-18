/**
 * TikTok 全生命周期运营诊断 SOP 配置
 * 从"个性化诊断"调整为"运营SOP指引"
 * 仅 TikTok 出现，FB 不受影响
 */

// 账号阶段类型
export type AccountStage = 'new_account' | 'stable_account' | 'declining_account';

// SOP 配置结构
export interface SOPConfig {
  id: AccountStage;
  name: string;
  nameZh: string;
  icon: string;
  color: string;
  // SOP 标准结构：阶段→核心任务→关键指标→常见坑→推荐动作
  sop: {
    stage: string;
    stageZh: string;
    coreTasks: string[];
    coreTasksZh: string[];
    keyMetrics: string[];
    keyMetricsZh: string[];
    commonPitfalls: string[];
    commonPitfallsZh: string[];
    recommendedActions: string[];
    recommendedActionsZh: string[];
  };
  // 详细诊断 Prompt（用于 AI 诊断）
  diagnosisPrompt: string;
}

// ========================================
// 新账号冷启动 SOP
// ========================================
const NEW_ACCOUNT_SOP: SOPConfig = {
  id: 'new_account',
  name: 'New Account Cold Start SOP',
  nameZh: '新账号冷启动SOP',
  icon: '🌱',
  color: '#22D3EE',
  sop: {
    stage: 'Cold Start Phase (0-14 days)',
    stageZh: '冷启动阶段（0-14天）',
    coreTasks: [
      'Complete learning phase: achieve 7 conversions in 7 days',
      'Test 3-5 creative variations to identify best performers',
      'Set up proper tracking (pixel, events, attribution)',
      'Establish baseline metrics for future optimization'
    ],
    coreTasksZh: [
      '完成学习期：7天内获得7次转化',
      '测试3-5个素材变体找出最佳表现',
      '建立正确追踪（像素、事件、归因）',
      '建立基准指标供后续优化参考'
    ],
    keyMetrics: [
      'Learning phase completion rate',
      'Video completion rate > 25%',
      'CTR > 1.5%',
      'CPA within 2x of target'
    ],
    keyMetricsZh: [
      '学习期完成率',
      '视频完播率 > 25%',
      '点击率 CTR > 1.5%',
      'CPA 在目标2倍以内'
    ],
    commonPitfalls: [
      'Overly narrow targeting limits learning',
      'Too many ad sets compete for same budget',
      'Low-quality creatives slow learning',
      'Incorrect tracking setup'
    ],
    commonPitfallsZh: [
      '定向过窄导致无法学习',
      '广告组太多争夺同一预算',
      '低质量素材拖慢学习进度',
      '追踪设置不正确'
    ],
    recommendedActions: [
      'Start with broad targeting +兴趣定向',
      'Focus budget on 2-3 best creatives',
      'Increase bid 10-20% to accelerate learning',
      'Check pixel firing daily for first week'
    ],
    recommendedActionsZh: [
      '起步用宽定向+兴趣定向',
      '预算集中到2-3个最佳素材',
      '出价提高10-20%加速学习',
      '首周每天检查像素触发情况'
    ]
  },
  diagnosisPrompt: `你是TikTok新账号冷启动专家。请基于以下SOP框架进行诊断：

【冷启动SOP框架】
阶段：冷启动期（0-14天）
核心任务：完成学习期（7天7转化）、测试素材变体、建立追踪
关键指标：学习期完成率、视频完播率>25%、CTR>1.5%、CPA在目标2倍内
常见坑：定向过窄、广告组过多、低质量素材、追踪错误
推荐动作：宽定向+兴趣、预算集中2-3素材、出价提高10-20%、首周每天检查像素

【账号当前状态】
投放天数：{days_running}
日预算：{daily_budget}
目标：{goal}
当前CTR：{ctr}
当前转化数：{conversions}

【诊断任务】
1. 对照SOP核心任务，评估完成进度
2. 对照关键指标，识别差距
3. 对照常见坑，检测是否踩坑
4. 输出符合SOP框架的优化建议

【输出格式】
{
  "sop_progress": {
    "core_tasks_status": [{"task": "任务名", "status": "完成/进行中/未开始", "gap": "差距分析"}],
    "metrics_status": [{"metric": "指标名", "current": "当前值", "target": "目标值", "gap": "差距"}]
  },
  "pitfalls_detected": [{"pitfall": "坑名", "detected": true/false, "severity": "高/中/低"}],
  "recommended_actions": [{"action": "动作", "priority": "P0/P1/P2", "timeline": "建议执行时间"}],
  "expected_outcome": "执行SOP后的预期效果"
}`
};

// ========================================
// 老号平平突破瓶颈 SOP
// ========================================
const STABLE_ACCOUNT_SOP: SOPConfig = {
  id: 'stable_account',
  name: 'Stable Account Breakthrough SOP',
  nameZh: '老号平平突破瓶颈SOP',
  icon: '📊',
  color: '#F59E0B',
  sop: {
    stage: 'Stable but Flat Phase (15-60 days)',
    stageZh: '稳定但平平阶段（15-60天）',
    coreTasks: [
      'Refresh creative library every 2 weeks',
      'Expand audience testing incrementally',
      'Test new ad formats (Spark Ads, Carousel)',
      'Analyze competitor strategies for inspiration'
    ],
    coreTasksZh: [
      '每2周更新素材库',
      '渐进式拓展受众测试',
      '测试新广告格式（Spark Ads、轮播）',
      '分析竞品策略获取灵感'
    ],
    keyMetrics: [
      'Creative freshness score > 70%',
      'Audience reach expansion > 20%',
      'CPA improvement potential 15-30%',
      'ROAS baseline vs industry benchmark'
    ],
    keyMetricsZh: [
      '素材新鲜度评分 > 70%',
      '受众覆盖拓展 > 20%',
      'CPA改善潜力 15-30%',
      'ROAS基准 vs 行业标准'
    ],
    commonPitfalls: [
      'Running same creatives for >30 days',
      'Targeting too narrow, audience fatigue',
      'Not testing new ad formats',
      'Ignoring competitor insights'
    ],
    commonPitfallsZh: [
      '同一素材投放超过30天',
      '定向过窄，受众疲劳',
      '不测试新广告格式',
      '忽视竞品洞察'
    ],
    recommendedActions: [
      'Launch 2-3 new creatives per week',
      'Add 10-15% new audience segments',
      'Test Spark Ads with local creators',
      'Audit competitor ads weekly'
    ],
    recommendedActionsZh: [
      '每周上线2-3个新素材',
      '增加10-15%新受众人群',
      '与本地达人测试Spark Ads',
      '每周审查竞品广告'
    ]
  },
  diagnosisPrompt: `你是TikTok广告优化专家。请基于以下突破瓶颈SOP框架进行诊断：

【突破瓶颈SOP框架】
阶段：稳定但平平期（15-60天）
核心任务：每2周更新素材、渐进拓展受众、测试新格式、分析竞品
关键指标：素材新鲜度>70%、受众拓展>20%、CPA改善潜力15-30%
常见坑：素材老化>30天、定向过窄受众疲劳、不测试新格式、忽视竞品
推荐动作：每周2-3新素材、增加10-15%受众、测试Spark Ads、每周审查竞品

【账号当前状态】
投放天数：{days_running}
日预算：{daily_budget}
当前CTR：{ctr}
当前CPC：{cpc}
当前转化率：{conversion_rate}
素材使用天数：{creative_age}

【诊断任务】
1. 对照SOP核心任务，识别未执行项
2. 对照关键指标，量化差距
3. 对照常见坑，检测瓶颈根源
4. 输出突破瓶颈的优先行动

【输出格式】
{
  "sop_progress": {
    "core_tasks_status": [{"task": "任务名", "status": "执行状态", "last_action": "上次执行时间"}],
    "metrics_status": [{"metric": "指标名", "current": "当前值", "potential": "改善潜力"}]
  },
  "bottlenecks_identified": [{"bottleneck": "瓶颈", "root_cause": "根因", "severity": "严重度"}],
  "breakthrough_actions": [{"action": "动作", "priority": "P0/P1/P2", "expected_impact": "预期效果"}],
  "expected_breakthrough": "突破后的预期指标提升"
}`
};

// ========================================
// 老号掉量恢复 SOP
// ========================================
const DECLINING_ACCOUNT_SOP: SOPConfig = {
  id: 'declining_account',
  name: 'Declining Account Recovery SOP',
  nameZh: '老号掉量恢复SOP',
  icon: '📉',
  color: '#EF4444',
  sop: {
    stage: 'Declining Phase (Performance Drop)',
    stageZh: '掉量阶段（效果下滑）',
    coreTasks: [
      'Identify decline trigger point (policy change/algorithm update)',
      'Audit creative fatigue immediately',
      'Check pixel/tracking integrity',
      'Review account health status'
    ],
    coreTasksZh: [
      '识别掉量触发点（政策变化/算法更新）',
      '立即审查素材疲劳情况',
      '检查像素/追踪完整性',
      '审查账号健康状态'
    ],
    keyMetrics: [
      'Decline onset date identification',
      'Creative fatigue score',
      'Pixel firing rate > 95%',
      'Account restriction status'
    ],
    keyMetricsZh: [
      '掉量起始日期识别',
      '素材疲劳评分',
      '像素触发率 > 95%',
      '账号限制状态'
    ],
    commonPitfalls: [
      'Not identifying decline trigger quickly',
      'Continuing same creatives during decline',
      'Ignoring pixel/tracking issues',
      'Not checking account restrictions'
    ],
    commonPitfallsZh: [
      '未快速识别掉量触发点',
      '掉量期间继续使用原素材',
      '忽视像素/追踪问题',
      '未检查账号限制'
    ],
    recommendedActions: [
      'Timeline analysis: When did decline start?',
      'Pause top 50% fatigued creatives',
      'Verify pixel events firing correctly',
      'Check TikTok Ads Manager for restrictions',
      'Launch 3-5 fresh creatives immediately'
    ],
    recommendedActionsZh: [
      '时间线分析：何时开始掉量？',
      '暂停50%最疲劳的素材',
      '验证像素事件正确触发',
      '检查TikTok Ads Manager限制',
      '立即上线3-5个新素材'
    ]
  },
  diagnosisPrompt: `你是TikTok广告诊断专家。请基于以下恢复SOP框架进行诊断：

【恢复SOP框架】
阶段：掉量期（效果下滑）
核心任务：识别掉量触发点、审查素材疲劳、检查追踪完整性、审查账号健康
关键指标：掉量起始日期、素材疲劳评分、像素触发率>95%、账号限制状态
常见坑：未识别触发点、继续原素材、忽视追踪问题、未检查限制
推荐动作：时间线分析、暂停50%疲劳素材、验证像素、检查限制、上线新素材

【账号当前状态】
投放天数：{days_running}
日预算：{daily_budget}
效果变化：CTR从{ctr_old}降至{ctr_new}
转化率从{conv_old}降至{conv_new}
掉量开始时间：{decline_start}

【诊断任务】
1. 对照SOP核心任务，紧急排查
2. 对照关键指标，定位问题
3. 对照常见坑，识别根因
4. 输出恢复行动优先级

【输出格式】
{
  "sop_progress": {
    "core_tasks_status": [{"task": "任务名", "status": "排查结果", "finding": "发现"}],
    "metrics_status": [{"metric": "指标名", "before": "掉量前", "after": "掉量后", "change": "变化幅度"}]
  },
  "decline_triggers": [{"trigger": "触发原因", "confidence": 0.8, "evidence": "证据"}],
  "recovery_actions": [{"action": "动作", "priority": "P0/P1/P2", "timeline": "执行时间"}],
  "expected_recovery": "恢复时间和预期效果"
}`
};

// ========================================
// SOP 配置注册表
// ========================================
export const ACCOUNT_STAGE_SOP_CONFIGS: Record<AccountStage, SOPConfig> = {
  new_account: NEW_ACCOUNT_SOP,
  stable_account: STABLE_ACCOUNT_SOP,
  declining_account: DECLINING_ACCOUNT_SOP
};

// ========================================
// 账号阶段选择问题配置（用于 Quiz）
// ========================================
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

// ========================================
// 辅助函数
// ========================================

// 获取账号阶段 SOP 配置
export function getAccountStageSOPConfig(stage: AccountStage): SOPConfig {
  return ACCOUNT_STAGE_SOP_CONFIGS[stage];
}

// 获取账号阶段诊断 Prompt（基于 SOP）
export function getAccountStageDiagnosisPrompt(stage: AccountStage): string {
  return ACCOUNT_STAGE_SOP_CONFIGS[stage].diagnosisPrompt;
}

// 获取 SOP 概要（用于诊断结果页前置展示）
export function getSOPSummary(stage: AccountStage, locale: 'zh' | 'en'): {
  stage: string;
  coreTasks: string[];
  keyMetrics: string[];
  commonPitfalls: string[];
  recommendedActions: string[];
} {
  const config = ACCOUNT_STAGE_SOP_CONFIGS[stage];
  const sop = config.sop;
  return {
    stage: locale === 'zh' ? sop.stageZh : sop.stage,
    coreTasks: locale === 'zh' ? sop.coreTasksZh : sop.coreTasks,
    keyMetrics: locale === 'zh' ? sop.keyMetricsZh : sop.keyMetrics,
    commonPitfalls: locale === 'zh' ? sop.commonPitfallsZh : sop.commonPitfalls,
    recommendedActions: locale === 'zh' ? sop.recommendedActionsZh : sop.recommendedActions
  };
}

// ========================================
// 合并诊断输出模板
// SOP作为前置背景段，广告诊断作为重点段
// ========================================
export const COMBINED_DIAGNOSIS_TEMPLATE = `【TikTok账号+广告综合诊断】

## 前置：账号运营SOP指引
阶段：{sop_stage}
核心任务：{sop_core_tasks}
关键指标：{sop_key_metrics}
常见坑：{sop_common_pitfalls}
推荐动作：{sop_recommended_actions}

## 重点：广告诊断分析
{ad_diagnosis}

## 综合优化建议
1. 账号层面优化（基于SOP框架）
2. 广告层面优化（基于诊断分析）
3. 协同优化建议（账号+广告联动）

## 优先级排序
- P0 紧急（24小时内）：{urgent_actions}
- P1 重要（本周内）：{important_actions}
- P2 常规（持续优化）：{regular_actions}

## 预期效果
账号恢复时间：{account_recovery}
广告优化效果：{ad_improvement}`;
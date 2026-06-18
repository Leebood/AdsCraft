/**
 * TikTok 全生命周期运营诊断 SOP 配置
 * 定位：运营SOP指引，标准化操作清单，不给个性化诊断
 * 仅 TikTok 出现，FB 不受影响
 */

// 账号阶段类型
export type AccountStage = 'new_account' | 'stable_account' | 'declining_account';

// SOP 配置结构（统一格式）
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
    stageDays: string; // 天数范围
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
// 新账号（0-30天）冷启动 SOP
// ========================================
const NEW_ACCOUNT_SOP: SOPConfig = {
  id: 'new_account',
  name: 'New Account Cold Start SOP',
  nameZh: '新账号冷启动SOP',
  icon: '🌱',
  color: '#22D3EE',
  sop: {
    stage: 'Cold Start Phase',
    stageZh: '冷启动阶段',
    stageDays: '0-30 days',
    coreTasks: [
      'Set up Pixel events (≥50 conversions for learning)',
      'Accumulate initial engagement data',
      'Test creative variations to find best performers',
      'Complete learning phase (7 conversions in 7 days)'
    ],
    coreTasksZh: [
      '建立Pixel事件（≥50个转化完成学习期）',
      '积累初始互动数据',
      '测试素材变体找出最佳表现',
      '完成学习期（7天内获得7次转化）'
    ],
    keyMetrics: [
      'Pixel events ≥ 50',
      'CTR ≥ 1.2%',
      'Ad approval rate',
      'Learning phase completion'
    ],
    keyMetricsZh: [
      'Pixel事件 ≥ 50个',
      '点击率 CTR ≥ 1.2%',
      '广告通过率',
      '学习期完成状态'
    ],
    commonPitfalls: [
      'Too many ad sets competing',
      'Not testing enough creatives',
      'Switching to CBO too early',
      'Scaling budget before learning completes'
    ],
    commonPitfallsZh: [
      '定向太多广告组争夺预算',
      '素材测试不够',
      '过早切换CBO',
      '学习期未完成就放大'
    ],
    recommendedActions: [
      'Start with ABO, $10-20/day per ad set',
      'Test 3 ad sets with different creatives',
      'Scale only after learning phase completes',
      'Scale budget after creative stabilizes'
    ],
    recommendedActionsZh: [
      'ABO起步，每组$10-20/天',
      '测3个广告组用不同素材',
      '学完再缩',
      '素材稳定再放量'
    ]
  },
  diagnosisPrompt: `你是TikTok新账号冷启动专家。请基于以下SOP框架进行诊断：

【冷启动SOP框架】
阶段：冷启动期（0-30天）
核心任务：建立Pixel事件≥50个、积累初始互动数据、测试素材变体、完成学习期
关键指标：Pixel事件≥50、CTR≥1.2%、广告通过率、学习期完成
常见坑：定向太多广告组、素材测试不够、过早切CBO、放大过快
推荐动作：ABO起步$10-20/天→3组、学完再缩、素材稳定再放量

【账号当前状态】
投放天数：{days_running}
日预算：{daily_budget}
Pixel事件数：{pixel_events}
CTR：{ctr}
转化数：{conversions}

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
// 老号平平（30-90天）突破瓶颈 SOP
// ========================================
const STABLE_ACCOUNT_SOP: SOPConfig = {
  id: 'stable_account',
  name: 'Stable Account Breakthrough SOP',
  nameZh: '老号平平突破瓶颈SOP',
  icon: '📊',
  color: '#F59E0B',
  sop: {
    stage: 'Stable but Flat Phase',
    stageZh: '稳定但平平阶段',
    stageDays: '30-90 days',
    coreTasks: [
      'Find winning creative + audience combination',
      'Optimize conversion funnel',
      'Refresh creatives regularly',
      'Test new ad formats'
    ],
    coreTasksZh: [
      '找到最佳素材+受众组合',
      '优化转化链路',
      '定期刷新素材',
      '测试新广告格式'
    ],
    keyMetrics: [
      'CPA trend (stable or improving)',
      'Campaign cycle duration',
      'Frequency control (frequency < 3)',
      'Creative freshness'
    ],
    keyMetricsZh: [
      'CPA趋势（稳定或改善）',
      '投放周期',
      '频次控制（频次<3）',
      '素材新鲜度'
    ],
    commonPitfalls: [
      'Adding budget without testing',
      'Frequency too high without action',
      'Audience fatigue from narrow targeting',
      'Not rotating creatives'
    ],
    commonPitfallsZh: [
      '持续加预算不测试',
      '频次过高不处理',
      '定向过窄导致受众疲劳',
      '素材不轮换'
    ],
    recommendedActions: [
      'Run creative rotation tests',
      'Switch to CBO after stable performance',
      'Expand audience when frequency > 3',
      'Add 10-15% new audience segments weekly'
    ],
    recommendedActionsZh: [
      '素材轮测→CBO过渡',
      '频次>3时扩受众',
      '每周增加10-15%新受众',
      '测试Spark Ads/轮播广告'
    ]
  },
  diagnosisPrompt: `你是TikTok广告优化专家。请基于以下突破瓶颈SOP框架进行诊断：

【突破瓶颈SOP框架】
阶段：稳定但平平期（30-90天）
核心任务：找到最佳组合、优化转化链路、定期刷新素材、测试新格式
关键指标：CPA趋势、投放周期、频次控制<3、素材新鲜度
常见坑：加预算不测试、频次过高不处理、受众疲劳、素材不轮换
推荐动作：素材轮测→CBO过渡、频次>3扩受众、每周增加新受众

【账号当前状态】
投放天数：{days_running}
日预算：{daily_budget}
当前CTR：{ctr}
当前频次：{frequency}
CPA趋势：{cpa_trend}
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
// 老号掉量（90天+）恢复 SOP
// ========================================
const DECLINING_ACCOUNT_SOP: SOPConfig = {
  id: 'declining_account',
  name: 'Declining Account Recovery SOP',
  nameZh: '老号掉量恢复SOP',
  icon: '📉',
  color: '#EF4444',
  sop: {
    stage: 'Declining Phase',
    stageZh: '掉量阶段',
    stageDays: '90+ days',
    coreTasks: [
      'Diagnose decline cause → Stop bleeding → Rebuild',
      'Identify decline trigger point',
      'Audit creative and audience fatigue',
      'Check policy and account health'
    ],
    coreTasksZh: [
      '诊断掉量原因→止血→重建',
      '识别掉量触发点',
      '审查素材和受众疲劳',
      '检查政策和账号健康'
    ],
    keyMetrics: [
      'CPA spike magnitude',
      'Impression volume change',
      'Competitor activity changes',
      'Account restriction status'
    ],
    keyMetricsZh: [
      'CPA飙升幅度',
      '展示量变化',
      '竞品变化',
      '账号限制状态'
    ],
    commonPitfalls: [
      'Adding budget to force performance',
      'Major creative changes without testing',
      'Ignoring policy changes',
      'Not diagnosing root cause before action'
    ],
    commonPitfallsZh: [
      '加预算硬扛',
      '素材大改不测试',
      '忽略政策变化',
      '不诊断根因就行动'
    ],
    recommendedActions: [
      'Diagnose first: creative fatigue / audience fatigue / competitor',
      'Adjust based on diagnosis',
      'Gradual recovery, not drastic changes',
      'Pause 50% most fatigued creatives',
      'Launch 3-5 fresh creatives'
    ],
    recommendedActionsZh: [
      '先诊断：素材疲劳/受众疲劳/竞品影响',
      '根据诊断结果调整',
      '逐步恢复不要大改',
      '暂停50%最疲劳素材',
      '上线3-5个新素材'
    ]
  },
  diagnosisPrompt: `你是TikTok广告诊断专家。请基于以下恢复SOP框架进行诊断：

【恢复SOP框架】
阶段：掉量期（90天+）
核心任务：诊断掉量原因→止血→重建、识别触发点、审查疲劳、检查政策
关键指标：CPA飙升幅度、展示量变化、竞品变化、账号限制状态
常见坑：加预算硬扛、素材大改不测试、忽略政策变化、不诊断就行动
推荐动作：先诊断素材/受众/竞品→调整方向→逐步恢复不要大改

【账号当前状态】
投放天数：{days_running}
日预算：{daily_budget}
效果变化：CTR从{ctr_old}降至{ctr_new}
CPA变化：从{cpa_old}升至{cpa_new}
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
      label: 'New Account (0-30 days)',
      labelZh: '新账号（0-30天）',
      value: 'new_account',
      description: 'Just started, in learning phase',
      descriptionZh: '刚创建账号，处于冷启动学习期'
    },
    {
      id: 'stable_account',
      label: 'Stable but Flat (30-90 days)',
      labelZh: '老号平平（30-90天）',
      value: 'stable_account',
      description: 'Running stable but no growth',
      descriptionZh: '运行稳定但效果平平无突破'
    },
    {
      id: 'declining_account',
      label: 'Declining (90+ days)',
      labelZh: '老号掉量（90天+）',
      value: 'declining_account',
      description: 'Performance dropping significantly',
      descriptionZh: '效果明显下滑需要诊断恢复'
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
  stageDays: string;
  coreTasks: string[];
  keyMetrics: string[];
  commonPitfalls: string[];
  recommendedActions: string[];
} {
  const config = ACCOUNT_STAGE_SOP_CONFIGS[stage];
  const sop = config.sop;
  return {
    stage: locale === 'zh' ? sop.stageZh : sop.stage,
    stageDays: sop.stageDays,
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

## 前置：账号运营SOP指引（你这个阶段应该做什么）
阶段：{sop_stage}（{sop_stage_days}）
核心任务：{sop_core_tasks}
关键指标：{sop_key_metrics}
常见坑：{sop_common_pitfalls}
推荐动作：{sop_recommended_actions}

## 重点：广告诊断分析（你的广告具体问题）
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
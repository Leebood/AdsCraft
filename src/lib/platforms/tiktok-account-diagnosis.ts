/**
 * TikTok 全生命周期运营诊断 SOP 配置
 * 定位：运营SOP指引，标准化操作清单，不给个性化诊断
 * 仅 TikTok 出现，FB 不受影响
 */

// 账号阶段类型
export type AccountStage = 'new_account' | 'stable_account' | 'declining_account';

// 子阶段配置（用于起号详细阶段）
export interface SubStage {
  name: string;
  nameZh: string;
  days: string;
  checklist: string[];
  checklistZh: string[];
  kpi: string;
  kpiZh: string;
}

// SOP 配置结构（统一格式）
export interface SOPConfig {
  id: AccountStage;
  name: string;
  nameZh: string;
  icon: string;
  color: string;
  // 子阶段（仅新账号有）
  subStages?: SubStage[];
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
// 包含详细子阶段：养号→内容冷启动→投流加速
// ========================================
const NEW_ACCOUNT_SOP: SOPConfig = {
  id: 'new_account',
  name: 'New Account Cold Start SOP',
  nameZh: '新账号冷启动SOP',
  icon: '🌱',
  color: '#22D3EE',
  // 起号详细子阶段
  subStages: [
    {
      name: 'Account Setup & Labeling',
      nameZh: '养号打标签',
      days: 'Day 1-5',
      checklist: [
        'Complete profile (avatar, bio, category tags)',
        'Follow 10-20 accounts in your niche, watch fully + engage',
        'Find niche content in For You feed, like + comment + save',
        'Do NOT post content, do NOT change ID, avoid frequent actions',
        'Goal: Let algorithm recognize your content preferences'
      ],
      checklistZh: [
        '完善Profile（头像/简介/分类标签）',
        '关注10-20个同赛道账号，完整观看+互动',
        'For You页刷到同赛道内容，点赞+评论+收藏',
        '不要发内容，不要改ID，不要频繁操作',
        '目标：让算法识别你的内容偏好和创作者方向'
      ],
      kpi: 'For You feed 80%+ niche content = labeling complete',
      kpiZh: 'For You页80%内容与目标赛道相关 = 标签打好'
    },
    {
      name: 'Content Cold Start',
      nameZh: '内容冷启动',
      days: 'Day 6-30',
      checklist: [
        'Post 1 video daily, fixed time (local 7-10pm peak)',
        'First 3 seconds must have hook (conflict/suspense/visual impact)',
        'First 5 videos: adapt proven templates (NOT copy)',
        'Use 3-5 precise tags + 2 broad tags',
        'Reply to every comment, create engagement signals'
      ],
      checklistZh: [
        '每天发1条，固定时间（当地晚7-10点高峰）',
        '前3秒必须有钩子（冲突/悬念/视觉冲击）',
        '前5条用同赛道爆款模板改编（不是搬运）',
        '标签用3-5个精准标签+2个宽标签',
        '回复每条评论，制造互动信号'
      ],
      kpi: '70% completion rate = advanced traffic pool; 1 video >1000 views in 5 = cold start success',
      kpiZh: '70%完播率 = 进入高级流量池；5条内有1条过1000播放 = 冷启动成功'
    },
    {
      name: 'Ads Acceleration',
      nameZh: '投流加速',
      days: 'Day 15+ (after organic traffic)',
      checklist: [
        'Select highest organic view video for Spark Ads',
        'Budget $20-50/day, Community Interaction objective',
        'Run 3-5 days, CPL <$0.5 = acceptable',
        'After 500+ followers, switch to Traffic objective for landing page'
      ],
      checklistZh: [
        '选自然播放最高的视频投Spark Ads',
        '预算$20-50/天，Community Interaction目标',
        '投3-5天看数据，CPL(每粉丝成本)<$0.5算合格',
        '有500+粉丝后切Traffic目标引流落地页'
      ],
      kpi: 'Fan cost <$0.5 / Organic traffic >60% = healthy',
      kpiZh: '粉丝成本<$0.5 / 自然流量占比>60% = 健康'
    }
  ],
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
  diagnosisPrompt: `你是TikTok新账号冷启动专家。用户是TikTok新号（0-30天），请评估起号阶段健康度：

【起号SOP框架】
阶段：冷启动期（0-30天）
子阶段：
- Day 1-5 养号打标签：完善Profile→关注同赛道→互动→不打扰→For You页80%同赛道
- Day 6-30 内容冷启动：每天1条→前3秒钩子→爆款模板改编→标签策略→回复评论
- Day 15+ 投流加速：选高播放投Spark→$20-50/天→CPL<$0.5→500粉后切Traffic

【账号当前状态】
投放天数：{days_running}
日预算：{daily_budget}
Pixel事件数：{pixel_events}
CTR：{ctr}
转化数：{conversions}
粉丝数：{followers}
完播率：{completion_rate}

【诊断任务】
1. 标签是否精准（For You页是否80%+同赛道）
2. 内容发布频率和节奏
3. 前3秒钩子效果（完播率）
4. 是否过早投流（自然流量未验证就花钱 = 浪费）
5. 互动率（评论/分享比单纯点赞更有价值）

【输出格式】
{
  "current_sub_stage": "Day X-X / 养号/内容冷启动/投流加速",
  "stage_health": {"metric": "指标", "status": "健康/注意/危险", "value": "当前值"},
  "checklist_progress": [{"item": "清单项", "completed": true/false}],
  "next_actions": [{"action": "下一步动作", "priority": "P0/P1/P2", "timeline": "建议时间"}],
  "pitfalls_warning": ["常见坑提醒"],
  "expected_milestone": "下一个里程碑"`
};

// ========================================
// 老号平平（30-90天）突破瓶颈 SOP
// 5步提升：找爆款公式→砍不工作→重做钩子→SEO优化→旧内容造新流量
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
  diagnosisPrompt: `你是TikTok广告优化专家。用户的TikTok账号已运营一段时间但反响平平，请诊断：

【老号提升5步SOP】
1. 找爆款公式：分析账号Top 5播放视频的共同特征（主题/节奏/开头/标签）
2. 砍不工作内容：暂停与Top 5特征差异大的方向（连续3条<500播放 = 停止）
3. 重做3秒钩子：把表现最好的3条视频，只用前3秒框架，换内容重做（完播率权重40-50%）
4. SEO优化：标题/文案/标签加入搜索关键词（2026年40%流量来自搜索）
5. 旧内容造新流量：6个月前爆款，换开头/BGM/标题重发（间隔>90天，改动>30%）

【账号当前状态】
投放天数：{days_running}
日预算：{daily_budget}
当前CTR：{ctr}
当前频次：{frequency}
CPA趋势：{cpa_trend}
素材使用天数：{creative_age}
Top 5平均播放：{top5_avg_views}
完播率：{completion_rate}

【诊断任务】
1. 先判断是内容问题还是Shadowban：
   - Shadowban特征：播放量突然从千级降到个位数、所有视频同时低迷、搜索搜不到账号
   - 内容问题特征：有高有低、新视频偶尔过千
2. 分析内容方向是否聚焦（泛内容比垂类低45%触达）
3. 检查3秒钩子质量（完播率<40% = 钩子不行）
4. 是否利用搜索流量（40%流量来自搜索，关键词是否覆盖）
5. 发布节奏是否稳定（断更>7天会掉权重）

【输出格式】
{
  "shadowban_check": {"is_shadowban": true/false, "evidence": "证据"},
  "content_focus_score": 0-100,
  "hook_quality": {"completion_rate": "数值", "rating": "优秀/合格/需改进"},
  "seo_coverage": {"keywords_found": [], "coverage_score": 0-100},
  "posting_rhythm": {"last_post_days": "天数", "stable": true/false},
  "5_step_plan": [{"step": "步骤名", "priority": "P0/P1/P2", "action": "具体动作"}],
  "2_week_schedule": [{"week": 1/2, "tasks": []}],
  "expected_breakthrough": "预期效果"`
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
  diagnosisPrompt: `你是TikTok广告诊断专家。用户的TikTok老号之前有流量但现在掉量，请诊断：

【掉量诊断SOP】
1. 掉量时间线：突然掉（可能是违规/算法更新）vs 渐渐掉（内容疲劳）
2. 检查是否违规（社区准则警告/内容被限流/账号受限）
3. 同赛道竞品是否也掉（行业性 vs 账号独有问题）
4. 内容是否同质化（观众审美疲劳，需要内容升级）
5. 是否被Shadowban（搜索账号名看能否搜到）

【账号当前状态】
投放天数：{days_running}
日预算：{daily_budget}
效果变化：CTR从{ctr_old}降至{ctr_new}
CPA变化：从{cpa_old}升至{cpa_new}
掉量开始时间：{decline_start}
掉量幅度：{decline_magnitude}
账号状态：{account_status}

【诊断任务】
1. 掉量时间线：突然掉 vs 渐渐掉
2. 检查是否违规（社区准则警告/内容被限流/账号受限）
3. 同赛道竞品是否也掉（行业性 vs 账号独有问题）
4. 内容是否同质化（观众审美疲劳）
5. 是否被Shadowban（搜索账号名看能否搜到）

【输出格式】
{
  "decline_type": "突然/渐渐",
  "decline_cause": [{"cause": "原因", "confidence": 0.8, "evidence": "证据"}],
  "violation_check": {"has_violation": true/false, "type": "违规类型"},
  "competitor_analysis": {"industry_decline": true/false, "competitors_affected": []},
  "shadowban_check": {"is_shadowban": true/false, "searchable": true/false},
  "recovery_strategy": [{"step": "步骤", "priority": "P0/P1/P2", "action": "具体动作"}],
  "expected_recovery": "预计恢复周期和效果"`
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

// 获取新账号子阶段（Day 1-5/6-30/15+）
export function getNewAccountSubStages(): SubStage[] {
  return NEW_ACCOUNT_SOP.subStages || [];
}

// 获取 SOP 概要（用于诊断结果页前置展示）
export function getSOPSummary(stage: AccountStage, locale: 'zh' | 'en'): {
  stage: string;
  stageDays: string;
  coreTasks: string[];
  keyMetrics: string[];
  commonPitfalls: string[];
  recommendedActions: string[];
  subStages?: SubStage[];
} {
  const config = ACCOUNT_STAGE_SOP_CONFIGS[stage];
  const sop = config.sop;
  return {
    stage: locale === 'zh' ? sop.stageZh : sop.stage,
    stageDays: sop.stageDays,
    coreTasks: locale === 'zh' ? sop.coreTasksZh : sop.coreTasks,
    keyMetrics: locale === 'zh' ? sop.keyMetricsZh : sop.keyMetrics,
    commonPitfalls: locale === 'zh' ? sop.commonPitfallsZh : sop.commonPitfalls,
    recommendedActions: locale === 'zh' ? sop.recommendedActionsZh : sop.recommendedActions,
    subStages: config.subStages
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
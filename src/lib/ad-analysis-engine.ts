/**
 * 广告分析规则引擎
 * 基于行业基准进行指标评估和诊断
 */

export interface AdSnapshot {
  ctr?: number | null;
  cpc?: number | null;
  cpa?: number | null;
  roas?: number | null;
  conversion_rate?: number | null;
  frequency?: number | null;
  spend?: number | null;
  impressions?: number | null;
  clicks?: number | null;
  conversions?: number | null;
  snapshot_date?: string | null;
}

export interface MetricEvaluation {
  name: string;
  value: number | null;
  rating: string;
  benchmark: string;
  level: 'excellent' | 'good' | 'average' | 'poor' | 'unknown';
}

export interface RiskAlert {
  level: 'urgent' | 'warning' | 'info';
  message: string;
  metric: string;
  value: number;
  threshold: number;
}

export interface ActionPriority {
  priority: number;
  metric: string;
  action: string;
  impact: 'high' | 'medium' | 'low';
}

export interface AnalysisResult {
  overall_score: string;
  metrics: MetricEvaluation[];
  issues: string[];
  trends: string[];
  recommendations: string[];
  risks: RiskAlert[];
  action_priorities: ActionPriority[];
}

/**
 * 行业基准数据
 */
const BENCHMARKS = {
  ctr: {
    thresholds: [0.8, 1.5, 2.5],
    ratings: ['差', '一般', '好', '优秀'],
    benchmark: {
      poor: '< 0.8%',
      average: '0.8-1.5%',
      good: '1.5-2.5%',
      excellent: '> 2.5%',
    },
    lowerBetter: false,
  },
  cpc: {
    thresholds: [3, 1.5, 0.8],
    ratings: ['差', '一般', '好', '优秀'],
    benchmark: {
      poor: '> $3',
      average: '$1.5-3',
      good: '$0.8-1.5',
      excellent: '< $0.8',
    },
    lowerBetter: true,
  },
  cpa: {
    thresholds: [50, 25, 10],
    ratings: ['差', '一般', '好', '优秀'],
    benchmark: {
      poor: '> $50',
      average: '$25-50',
      good: '$10-25',
      excellent: '< $10',
    },
    lowerBetter: true,
  },
  roas: {
    thresholds: [1.5, 3, 5],
    ratings: ['差', '一般', '好', '优秀'],
    benchmark: {
      poor: '< 1.5x',
      average: '1.5-3x',
      good: '3-5x',
      excellent: '> 5x',
    },
    lowerBetter: false,
  },
  conversion_rate: {
    thresholds: [1, 2, 4],
    ratings: ['差', '一般', '好', '优秀'],
    benchmark: {
      poor: '< 1%',
      average: '1-2%',
      good: '2-4%',
      excellent: '> 4%',
    },
    lowerBetter: false,
  },
  frequency: {
    thresholds: [4, 2, 1],
    ratings: ['差', '一般', '好', '优秀'],
    benchmark: {
      poor: '> 4',
      average: '2-4',
      good: '1-2',
      excellent: '< 1',
    },
    lowerBetter: true,
  },
};

type MetricKey = keyof typeof BENCHMARKS;

/**
 * 评估单个指标
 */
function evaluateMetric(key: MetricKey, value: number | null): { rating: string; benchmark: string; level: 'excellent' | 'good' | 'average' | 'poor' | 'unknown' } {
  if (value === null || value === undefined) {
    return { rating: '无数据', benchmark: '-', level: 'unknown' };
  }

  const benchmark = BENCHMARKS[key];
  const { thresholds, ratings, lowerBetter } = benchmark;

  let level: 'excellent' | 'good' | 'average' | 'poor';
  let rating: string;

  if (lowerBetter) {
    // 越低越好的指标（CPC, CPA, frequency）
    if (value > thresholds[0]) {
      rating = ratings[0];
      level = 'poor';
    } else if (value > thresholds[1]) {
      rating = ratings[1];
      level = 'average';
    } else if (thresholds.length > 2 && value > thresholds[2]) {
      rating = ratings[2];
      level = 'good';
    } else {
      rating = ratings[ratings.length - 1];
      level = 'excellent';
    }
  } else {
    // 越高越好的指标（CTR, ROAS, conversion_rate）
    if (value < thresholds[0]) {
      rating = ratings[0];
      level = 'poor';
    } else if (value < thresholds[1]) {
      rating = ratings[1];
      level = 'average';
    } else if (thresholds.length > 2 && value < thresholds[2]) {
      rating = ratings[2];
      level = 'good';
    } else {
      rating = ratings[ratings.length - 1];
      level = 'excellent';
    }
  }

  const benchmarkText = level === 'excellent' ? benchmark.benchmark.excellent
    : level === 'good' ? benchmark.benchmark.good
    : level === 'average' ? benchmark.benchmark.average
    : benchmark.benchmark.poor;

  return { rating, benchmark: benchmarkText, level };
}

/**
 * 评分映射
 */
const RATING_SCORES: Record<string, number> = {
  '优秀': 4,
  '好': 3,
  '一般': 2,
  '差': 1,
  '无数据': 0,
  '未知': 0,
};

/**
 * 计算整体评分
 */
function calculateOverallScore(metrics: Array<{ rating: string }>): string {
  const validMetrics = metrics.filter(m => m.rating !== '无数据' && m.rating !== '未知');
  if (validMetrics.length === 0) return '无数据';

  const totalScore = validMetrics.reduce((sum, m) => sum + (RATING_SCORES[m.rating] || 0), 0);
  const avgScore = totalScore / validMetrics.length;

  if (avgScore >= 3.5) return '优秀';
  if (avgScore >= 2.5) return '好';
  if (avgScore >= 1.5) return '一般';
  return '差';
}

/**
 * 生成风险提示
 */
function generateRisks(metrics: MetricEvaluation[]): RiskAlert[] {
  const risks: RiskAlert[] = [];
  const metricMap = new Map(metrics.map(m => [m.name, m]));

  // CPC 风险
  const cpc = metricMap.get('CPC');
  if (cpc && cpc.value && cpc.level === 'poor') {
    const threshold = 3;
    const multiplier = cpc.value / 1.15; // 基准中位数
    risks.push({
      level: multiplier > 2 ? 'urgent' : 'warning',
      message: `CPC $${cpc.value.toFixed(2)} 偏高（基准 $0.8-1.5），每天都在浪费预算`,
      metric: 'CPC',
      value: cpc.value,
      threshold,
    });
  }

  // ROAS 风险
  const roas = metricMap.get('ROAS');
  if (roas && roas.value && roas.level === 'poor') {
    risks.push({
      level: roas.value < 1 ? 'urgent' : 'warning',
      message: `ROAS ${roas.value.toFixed(1)}x 未达到 3x 盈利线`,
      metric: 'ROAS',
      value: roas.value,
      threshold: 3,
    });
  }

  // CPA 风险
  const cpa = metricMap.get('CPA');
  if (cpa && cpa.value && cpa.level === 'poor') {
    risks.push({
      level: cpa.value > 50 ? 'urgent' : 'warning',
      message: `CPA $${cpa.value.toFixed(2)} 过高，获客成本失控`,
      metric: 'CPA',
      value: cpa.value,
      threshold: 25,
    });
  }

  // 频次风险
  const frequency = metricMap.get('频次');
  if (frequency && frequency.value && frequency.value > 3) {
    risks.push({
      level: frequency.value > 4 ? 'urgent' : 'warning',
      message: `频次 ${frequency.value.toFixed(1)} 偏高，受众可能疲劳`,
      metric: '频次',
      value: frequency.value,
      threshold: 3,
    });
  }

  // CTR 风险
  const ctr = metricMap.get('CTR');
  if (ctr && ctr.value && ctr.level === 'poor') {
    risks.push({
      level: 'warning',
      message: `CTR ${ctr.value.toFixed(2)}% 偏低，素材吸引力不足`,
      metric: 'CTR',
      value: ctr.value,
      threshold: 0.8,
    });
  }

  return risks;
}

/**
 * 生成行动优先级
 */
function generateActionPriorities(metrics: MetricEvaluation[]): ActionPriority[] {
  const priorities: ActionPriority[] = [];
  const metricMap = new Map(metrics.map(m => [m.name, m]));

  // 按影响程度排序
  const actions: Array<{ metric: string; action: string; impact: 'high' | 'medium' | 'low'; score: number }> = [];

  // CPC 问题 - 高影响
  const cpc = metricMap.get('CPC');
  if (cpc && cpc.level === 'poor') {
    actions.push({
      metric: 'CPC',
      action: `暂停当前广告组，测试新素材降低 CPC（当前 $${cpc.value?.toFixed(2)}，目标 < $1.5）`,
      impact: 'high',
      score: 100,
    });
  }

  // ROAS 问题 - 高影响
  const roas = metricMap.get('ROAS');
  if (roas && (roas.level === 'poor' || roas.level === 'average')) {
    actions.push({
      metric: 'ROAS',
      action: `暂时不要加预算，先优化转化路径提升 ROAS（当前 ${roas.value?.toFixed(1)}x，目标 > 3x）`,
      impact: roas.level === 'poor' ? 'high' : 'medium',
      score: roas.level === 'poor' ? 90 : 60,
    });
  }

  // CPA 问题 - 高影响
  const cpa = metricMap.get('CPA');
  if (cpa && cpa.level === 'poor') {
    actions.push({
      metric: 'CPA',
      action: `优化受众定位或调整出价策略（当前 $${cpa.value?.toFixed(2)}，目标 < $25）`,
      impact: 'high',
      score: 85,
    });
  }

  // 频次问题 - 中影响
  const frequency = metricMap.get('频次');
  if (frequency && frequency.value && frequency.value > 3) {
    actions.push({
      metric: '频次',
      action: `扩展受众或更换素材降低频次（当前 ${frequency.value.toFixed(1)}，目标 < 2）`,
      impact: 'medium',
      score: 70,
    });
  }

  // CTR 问题 - 中影响
  const ctr = metricMap.get('CTR');
  if (ctr && ctr.level === 'poor') {
    actions.push({
      metric: 'CTR',
      action: `优化素材创意，测试不同文案和视觉元素（当前 ${ctr.value?.toFixed(2)}%，目标 > 1.5%）`,
      impact: 'medium',
      score: 65,
    });
  }

  // 转化率问题 - 中影响
  const conversionRate = metricMap.get('转化率');
  if (conversionRate && conversionRate.level === 'poor') {
    actions.push({
      metric: '转化率',
      action: `优化落地页体验，提升转化率（当前 ${conversionRate.value?.toFixed(2)}%，目标 > 2%）`,
      impact: 'medium',
      score: 60,
    });
  }

  // 排序并添加优先级
  actions.sort((a, b) => b.score - a.score);
  actions.forEach((action, index) => {
    priorities.push({
      priority: index + 1,
      metric: action.metric,
      action: action.action,
      impact: action.impact,
    });
  });

  return priorities.slice(0, 5); // 最多5条
}

/**
 * 组合诊断
 */
function generateIssues(metrics: MetricEvaluation[]): string[] {
  const issues: string[] = [];
  const metricMap = new Map(metrics.map(m => [m.name, m]));

  const ctr = metricMap.get('CTR');
  const cpa = metricMap.get('CPA');
  const roas = metricMap.get('ROAS');
  const frequency = metricMap.get('频次');
  const conversionRate = metricMap.get('转化率');

  // CTR 高 + 转化低 → 素材好但落地页有问题
  if (ctr && (ctr.level === 'good' || ctr.level === 'excellent') && 
      conversionRate && (conversionRate.level === 'poor' || conversionRate.level === 'average')) {
    issues.push('CTR 表现良好但转化率偏低，素材吸引力强但落地页需优化');
  }

  // CTR 低 + CPA 高 → 素材/受众不匹配
  if (ctr && ctr.level === 'poor' && cpa && cpa.level === 'poor') {
    issues.push('CTR 低且 CPA 高，素材/受众不匹配，建议暂停或调整');
  }

  // CPA 高 + ROAS 低 → 整体亏损
  if (cpa && cpa.level === 'poor' && roas && roas.level === 'poor') {
    issues.push('CPA 高且 ROAS 低，整体亏损，需大幅调整投放策略');
  }

  // 频次 > 3 → 受众疲劳
  if (frequency && frequency.value && frequency.value > 3) {
    issues.push(`频次偏高（${frequency.value.toFixed(1)}），建议扩展受众或更换素材`);
  }

  // 单独指标问题
  if (ctr && ctr.level === 'poor') {
    issues.push('CTR 偏低，建议优化素材创意或调整受众定位');
  }

  if (roas && roas.level === 'poor') {
    issues.push('ROAS 偏低，广告回报率不足，需优化转化路径');
  }

  return issues;
}

/**
 * 趋势分析
 */
function analyzeTrends(data: AdSnapshot[]): string[] {
  const trends: string[] = [];
  
  if (data.length < 2) return trends;

  // 按日期排序
  const sorted = [...data].sort((a, b) => {
    const dateA = a.snapshot_date ? new Date(a.snapshot_date).getTime() : 0;
    const dateB = b.snapshot_date ? new Date(b.snapshot_date).getTime() : 0;
    return dateA - dateB;
  });

  const latest = sorted[sorted.length - 1];
  const previous = sorted[sorted.length - 2];

  // 对比关键指标变化
  const metricsToCheck: Array<{ name: string; key: keyof AdSnapshot; unit: string }> = [
    { name: 'CTR', key: 'ctr', unit: '%' },
    { name: 'CPA', key: 'cpa', unit: '$' },
    { name: 'ROAS', key: 'roas', unit: 'x' },
    { name: 'CPC', key: 'cpc', unit: '$' },
  ];

  for (const metric of metricsToCheck) {
    const currentValue = latest[metric.key] as number | undefined;
    const previousValue = previous[metric.key] as number | undefined;

    if (currentValue !== undefined && previousValue !== undefined && previousValue !== 0) {
      const change = ((currentValue - previousValue) / previousValue) * 100;
      
      if (Math.abs(change) > 20) {
        const direction = change > 0 ? '上升' : '下降';
        const isPositiveChange = (metric.name === 'CTR' || metric.name === 'ROAS') ? change > 0 : change < 0;
        
        if (isPositiveChange) {
          trends.push(`${metric.name} 较上期${direction} ${Math.abs(change).toFixed(1)}%，表现改善`);
        } else {
          trends.push(`${metric.name} 较上期${direction} ${Math.abs(change).toFixed(1)}%，需关注`);
        }
      }
    }
  }

  return trends;
}

/**
 * 生成行动建议
 */
function generateRecommendations(metrics: MetricEvaluation[]): string[] {
  const recommendations: string[] = [];
  const metricMap = new Map(metrics.map(m => [m.name, m]));

  const ctr = metricMap.get('CTR');
  const cpa = metricMap.get('CPA');
  const roas = metricMap.get('ROAS');

  // 针对优秀指标给予肯定
  if (ctr && (ctr.level === 'good' || ctr.level === 'excellent')) {
    recommendations.push('CTR 表现良好，继续保持当前素材策略');
  }

  if (cpa && (cpa.level === 'good' || cpa.level === 'excellent')) {
    recommendations.push('CPA 控制得当，可适当增加预算扩大投放');
  }

  if (roas && (roas.level === 'good' || roas.level === 'excellent')) {
    recommendations.push('ROAS 表现优秀，广告回报率健康');
  }

  // 针对差指标给出建议
  if (ctr && ctr.level === 'poor') {
    recommendations.push('建议优化素材创意，测试不同文案和视觉元素');
  }

  if (cpa && cpa.level === 'poor') {
    recommendations.push('CPA 偏高，建议优化受众定位或调整出价策略');
  }

  if (roas && roas.level === 'poor') {
    recommendations.push('ROAS 偏低，建议优化落地页转化路径');
  }

  // 如果没有任何建议，给出通用建议
  if (recommendations.length === 0) {
    recommendations.push('建议持续监控关键指标，根据数据变化及时调整策略');
  }

  return recommendations.slice(0, 5); // 最多5条建议
}

/**
 * 主分析函数
 */
export function analyzeAdData(data: AdSnapshot[]): AnalysisResult {
  if (!data || data.length === 0) {
    return {
      overall_score: '无数据',
      metrics: [],
      issues: [],
      trends: [],
      recommendations: ['上传第一张截图，解锁AI分析'],
      risks: [],
      action_priorities: [],
    };
  }

  // 使用最新一条数据进行指标分析
  const latest = data[data.length - 1];

  // 评估各指标
  const metrics: MetricEvaluation[] = [
    { name: 'CTR', value: latest.ctr ?? null, ...evaluateMetric('ctr', latest.ctr ?? null) },
    { name: 'CPC', value: latest.cpc ?? null, ...evaluateMetric('cpc', latest.cpc ?? null) },
    { name: 'CPA', value: latest.cpa ?? null, ...evaluateMetric('cpa', latest.cpa ?? null) },
    { name: 'ROAS', value: latest.roas ?? null, ...evaluateMetric('roas', latest.roas ?? null) },
    { name: '转化率', value: latest.conversion_rate ?? null, ...evaluateMetric('conversion_rate', latest.conversion_rate ?? null) },
    { name: '频次', value: latest.frequency ?? null, ...evaluateMetric('frequency', latest.frequency ?? null) },
  ];

  // 计算整体评分
  const overall_score = calculateOverallScore(metrics);

  // 生成问题诊断
  const issues = generateIssues(metrics);

  // 趋势分析
  const trends = analyzeTrends(data);

  // 生成行动建议
  const recommendations = generateRecommendations(metrics);

  // 生成风险提示
  const risks = generateRisks(metrics);

  // 生成行动优先级
  const action_priorities = generateActionPriorities(metrics);

  return {
    overall_score,
    metrics,
    issues,
    trends,
    recommendations,
    risks,
    action_priorities,
  };
}

/**
 * 预留的 AI 分析函数（暂时返回规则分析结果）
 */
export async function runAIAnalysis(summary: AnalysisResult): Promise<string> {
  // TODO: 后续接入 AI API
  // 暂时将规则分析结果转为自然语言
  const lines: string[] = [];
  
  lines.push(`【整体评分】${summary.overall_score}`);
  lines.push('');
  
  if (summary.metrics.length > 0) {
    lines.push('【指标分析】');
    for (const m of summary.metrics) {
      if (m.value !== null) {
        lines.push(`- ${m.name}: ${m.value} (${m.rating})`);
      }
    }
  }
  
  if (summary.issues.length > 0) {
    lines.push('');
    lines.push('【问题诊断】');
    for (const issue of summary.issues) {
      lines.push(`- ${issue}`);
    }
  }
  
  if (summary.trends.length > 0) {
    lines.push('');
    lines.push('【趋势分析】');
    for (const trend of summary.trends) {
      lines.push(`- ${trend}`);
    }
  }
  
  if (summary.recommendations.length > 0) {
    lines.push('');
    lines.push('【优化建议】');
    for (const rec of summary.recommendations) {
      lines.push(`- ${rec}`);
    }
  }
  
  return lines.join('\n');
}

/**
 * 规则分析引擎
 * 纯代码分析函数，不依赖任何外部 API
 */

// 指标基准定义
interface MetricBenchmark {
  poor: string;      // 差
  average: string;   // 一般
  good: string;      // 好
  excellent: string; // 优秀
}

// 分析结果接口
export interface AnalysisResult {
  overall_score: string;
  metrics: Array<{
    name: string;
    value: number | null;
    rating: string;
    benchmark: string;
  }>;
  issues: string[];
  trends: string[];
  recommendations: string[];
}

// 广告数据接口
export interface AdSnapshot {
  campaign_name?: string;
  snapshot_date?: string;
  spend?: number;
  impressions?: number;
  clicks?: number;
  ctr?: number;
  cpc?: number;
  conversions?: number;
  cpa?: number;
  roas?: number;
  frequency?: number;
  conversion_rate?: number;
}

// 指标基准表
const BENCHMARKS: Record<string, { thresholds: number[]; ratings: string[]; benchmark: MetricBenchmark; unit: string; lowerBetter?: boolean }> = {
  ctr: {
    thresholds: [0.8, 1.5, 2.5],
    ratings: ['差', '一般', '好', '优秀'],
    benchmark: { poor: '< 0.8%', average: '0.8-1.5%', good: '1.5-2.5%', excellent: '> 2.5%' },
    unit: '%',
  },
  cpc: {
    thresholds: [3, 1.5, 0.8],
    ratings: ['差', '一般', '好', '优秀'],
    benchmark: { poor: '> $3', average: '$1.5-3', good: '$0.8-1.5', excellent: '< $0.8' },
    unit: '$',
    lowerBetter: true,
  },
  cpa: {
    thresholds: [50, 25, 10],
    ratings: ['差', '一般', '好', '优秀'],
    benchmark: { poor: '> $50', average: '$25-50', good: '$10-25', excellent: '< $10' },
    unit: '$',
    lowerBetter: true,
  },
  roas: {
    thresholds: [1.5, 3, 5],
    ratings: ['差', '一般', '好', '优秀'],
    benchmark: { poor: '< 1.5x', average: '1.5-3x', good: '3-5x', excellent: '> 5x' },
    unit: 'x',
  },
  conversion_rate: {
    thresholds: [1, 2, 4],
    ratings: ['差', '一般', '好', '优秀'],
    benchmark: { poor: '< 1%', average: '1-2%', good: '2-4%', excellent: '> 4%' },
    unit: '%',
  },
  frequency: {
    thresholds: [4, 2],
    ratings: ['差', '一般', '好'],
    benchmark: { poor: '> 4', average: '2-4', good: '1-2', excellent: '-' },
    unit: '',
    lowerBetter: true,
  },
};

/**
 * 评估单个指标
 */
function evaluateMetric(name: string, value: number | null): { rating: string; benchmark: string } {
  if (value === null || value === undefined) {
    return { rating: '无数据', benchmark: '-' };
  }

  const benchmark = BENCHMARKS[name];
  if (!benchmark) {
    return { rating: '未知', benchmark: '-' };
  }

  const { thresholds, ratings, lowerBetter } = benchmark;

  if (lowerBetter) {
    // 越低越好的指标（CPC, CPA, frequency）
    if (value > thresholds[0]) return { rating: ratings[0], benchmark: benchmark.benchmark.poor };
    if (value > thresholds[1]) return { rating: ratings[1], benchmark: benchmark.benchmark.average };
    if (thresholds.length > 2 && value > thresholds[2]) return { rating: ratings[2], benchmark: benchmark.benchmark.good };
    return { rating: ratings[ratings.length - 1], benchmark: benchmark.benchmark.excellent };
  } else {
    // 越高越好的指标（CTR, ROAS, conversion_rate）
    if (value < thresholds[0]) return { rating: ratings[0], benchmark: benchmark.benchmark.poor };
    if (value < thresholds[1]) return { rating: ratings[1], benchmark: benchmark.benchmark.average };
    if (thresholds.length > 2 && value < thresholds[2]) return { rating: ratings[2], benchmark: benchmark.benchmark.good };
    return { rating: ratings[ratings.length - 1], benchmark: benchmark.benchmark.excellent };
  }
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
 * 组合诊断
 */
function generateIssues(metrics: Array<{ name: string; value: number | null; rating: string }>): string[] {
  const issues: string[] = [];
  const metricMap = new Map(metrics.map(m => [m.name, m]));

  const ctr = metricMap.get('ctr');
  const cpa = metricMap.get('cpa');
  const roas = metricMap.get('roas');
  const frequency = metricMap.get('frequency');
  const conversionRate = metricMap.get('conversion_rate');

  // CTR 高 + 转化低 → 素材好但落地页有问题
  if (ctr && (ctr.rating === '好' || ctr.rating === '优秀') && 
      conversionRate && (conversionRate.rating === '差' || conversionRate.rating === '一般')) {
    issues.push('CTR 表现良好但转化率偏低，素材吸引力强但落地页需优化');
  }

  // CTR 低 + 花费高 → 素材/受众不匹配
  if (ctr && ctr.rating === '差' && cpa && cpa.rating === '差') {
    issues.push('CTR 低且 CPA 高，素材/受众不匹配，建议暂停或调整');
  }

  // CPA 高 + ROAS 低 → 整体亏损
  if (cpa && cpa.rating === '差' && roas && roas.rating === '差') {
    issues.push('CPA 高且 ROAS 低，整体亏损，需大幅调整投放策略');
  }

  // 频次 > 3 → 受众疲劳
  if (frequency && frequency.value && frequency.value > 3) {
    issues.push(`频次偏高（${frequency.value.toFixed(1)}），建议扩展受众或更换素材`);
  }

  // 单独指标问题
  if (ctr && ctr.rating === '差') {
    issues.push('CTR 偏低，建议优化素材创意或调整受众定位');
  }

  if (roas && roas.rating === '差') {
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
function generateRecommendations(metrics: Array<{ name: string; value: number | null; rating: string }>): string[] {
  const recommendations: string[] = [];
  const metricMap = new Map(metrics.map(m => [m.name, m]));

  const ctr = metricMap.get('ctr');
  const cpa = metricMap.get('cpa');
  const roas = metricMap.get('roas');

  // 针对优秀指标给予肯定
  if (ctr && (ctr.rating === '好' || ctr.rating === '优秀')) {
    recommendations.push('CTR 表现良好，继续保持当前素材策略');
  }

  if (cpa && (cpa.rating === '好' || cpa.rating === '优秀')) {
    recommendations.push('CPA 控制得当，可适当增加预算扩大投放');
  }

  if (roas && (roas.rating === '好' || roas.rating === '优秀')) {
    recommendations.push('ROAS 表现优秀，广告回报率健康');
  }

  // 针对差指标给出建议
  if (ctr && ctr.rating === '差') {
    recommendations.push('建议优化素材创意，测试不同文案和视觉元素');
  }

  if (cpa && cpa.rating === '差') {
    recommendations.push('CPA 偏高，建议优化受众定位或调整出价策略');
  }

  if (roas && roas.rating === '差') {
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
    };
  }

  // 使用最新一条数据进行指标分析
  const latest = data[data.length - 1];

  // 评估各指标
  const metrics = [
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

  return {
    overall_score,
    metrics,
    issues,
    trends,
    recommendations,
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
    lines.push('');
  }
  
  if (summary.issues.length > 0) {
    lines.push('【问题诊断】');
    for (const issue of summary.issues) {
      lines.push(`- ${issue}`);
    }
    lines.push('');
  }
  
  if (summary.trends.length > 0) {
    lines.push('【趋势变化】');
    for (const trend of summary.trends) {
      lines.push(`- ${trend}`);
    }
    lines.push('');
  }
  
  if (summary.recommendations.length > 0) {
    lines.push('【优化建议】');
    for (const rec of summary.recommendations) {
      lines.push(`- ${rec}`);
    }
  }
  
  return lines.join('\n');
}

/**
 * 广告分析引擎 v2.0
 * 基于指标关系诊断 + 趋势对比
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

// 第1层：指标关系诊断
export interface Diagnosis {
  pattern: string;
  conclusion: string;
  confidence: 'high' | 'medium' | 'low';
}

// 第2层：趋势对比
export interface TrendChange {
  metric: string;
  prev: number | null;
  curr: number | null;
  change_pct: number | null;
  direction: 'up' | 'down' | 'stable';
  quality: 'good' | 'bad' | 'neutral';
}

export interface Trends {
  has_history: boolean;
  previous_date?: string;
  changes: TrendChange[];
  summary: string;
}

// 行动建议
export interface Action {
  priority: number;
  type: 'STOP' | 'FIX' | 'SCALE';
  metric: string;
  action: string;
  evidence: string;
}

// 完整分析结果
export interface AnalysisResultV2 {
  diagnosis: Diagnosis;
  trends: Trends;
  actions: Action[];
}

// 指标高低判断标准（仅用于组合诊断）
const THRESHOLDS = {
  ctr: { high: 1.5, low: 1.0 },
  conversion_rate: { high: 2.0, low: 1.0 },
  roas: { high: 3.0, low: 2.0 },
  frequency: { high: 3.0 },
};

/**
 * 第1层：指标关系诊断
 */
function diagnoseMetrics(snapshot: AdSnapshot, locale: string): Diagnosis {
  const ctr = snapshot.ctr ?? 0;
  const conversionRate = snapshot.conversion_rate ?? 0;
  const roas = snapshot.roas ?? 0;
  const cpa = snapshot.cpa ?? 0;
  const cpc = snapshot.cpc ?? 0;
  const frequency = snapshot.frequency ?? 0;

  const isCtrHigh = ctr > THRESHOLDS.ctr.high;
  const isCtrLow = ctr < THRESHOLDS.ctr.low;
  const isConvHigh = conversionRate > THRESHOLDS.conversion_rate.high;
  const isConvLow = conversionRate < THRESHOLDS.conversion_rate.low;
  const isRoasHigh = roas > THRESHOLDS.roas.high;
  const isRoasLow = roas < THRESHOLDS.roas.low;
  const isFrequencyHigh = frequency > THRESHOLDS.frequency.high;

  // CTR高 + 转化率低
  if (isCtrHigh && isConvLow) {
    return {
      pattern: locale === 'zh' ? 'CTR高+转化率低' : 'High CTR + Low Conv. Rate',
      conclusion: locale === 'zh' 
        ? '素材吸引力强，但落地页/产品页有问题' 
        : 'Strong creative appeal, but landing page/product page has issues',
      confidence: 'high'
    };
  }

  // CTR低 + 转化率高
  if (isCtrLow && isConvHigh) {
    return {
      pattern: locale === 'zh' ? 'CTR低+转化率高' : 'Low CTR + High Conv. Rate',
      conclusion: locale === 'zh' 
        ? '素材不够吸引人，但看到产品的人会买' 
        : 'Creative not engaging enough, but viewers convert well',
      confidence: 'high'
    };
  }

  // CPA高 + ROAS低
  if (cpa > 0 && isRoasLow) {
    return {
      pattern: locale === 'zh' ? 'CPA高+ROAS低' : 'High CPA + Low ROAS',
      conclusion: locale === 'zh' 
        ? '花钱多但产出少，整体效率差' 
        : 'High spend with low returns, poor overall efficiency',
      confidence: 'high'
    };
  }

  // CPC高 + CTR低
  if (cpc > 3 && isCtrLow) {
    return {
      pattern: locale === 'zh' ? 'CPC高+CTR低' : 'High CPC + Low CTR',
      conclusion: locale === 'zh' 
        ? '单次点击贵且点击率低，素材和受众匹配度差' 
        : 'Expensive clicks with low CTR, poor creative-audience fit',
      confidence: 'high'
    };
  }

  // 频次高 + CTR下降（需要历史数据判断，这里简化处理）
  if (isFrequencyHigh) {
    return {
      pattern: locale === 'zh' ? '频次高' : 'High Frequency',
      conclusion: locale === 'zh' 
        ? '受众疲劳，素材被看腻了' 
        : 'Audience fatigue, creative overexposed',
      confidence: 'medium'
    };
  }

  // CPA低 + ROAS高
  if (cpa > 0 && cpa < 20 && isRoasHigh) {
    return {
      pattern: locale === 'zh' ? 'CPA低+ROAS高' : 'Low CPA + High ROAS',
      conclusion: locale === 'zh' 
        ? '整体表现健康' 
        : 'Overall performance is healthy',
      confidence: 'high'
    };
  }

  // 无明显异常
  return {
    pattern: locale === 'zh' ? '指标平稳' : 'Metrics Stable',
    conclusion: locale === 'zh' 
      ? '表现稳定，继续观察' 
      : 'Performance stable, continue monitoring',
    confidence: 'medium'
  };
}

/**
 * 第2层：趋势对比
 */
function analyzeTrends(
  current: AdSnapshot, 
  previous: AdSnapshot | null, 
  locale: string
): Trends {
  if (!previous) {
    return {
      has_history: false,
      changes: [],
      summary: locale === 'zh' 
        ? '上传第2次数据后将自动显示趋势对比' 
        : 'Upload again to see trend comparison'
    };
  }

  const changes: TrendChange[] = [];
  const metrics = ['ctr', 'cpc', 'cpa', 'roas', 'conversion_rate'] as const;
  const metricNames: Record<string, Record<string, string>> = {
    ctr: { zh: 'CTR', en: 'CTR' },
    cpc: { zh: 'CPC', en: 'CPC' },
    cpa: { zh: 'CPA', en: 'CPA' },
    roas: { zh: 'ROAS', en: 'ROAS' },
    conversion_rate: { zh: '转化率', en: 'Conv. Rate' },
  };

  for (const metric of metrics) {
    const prev = previous[metric];
    const curr = current[metric];
    
    if (prev !== null && prev !== undefined && curr !== null && curr !== undefined) {
      const changePct = prev !== 0 ? ((curr - prev) / prev) * 100 : 0;
      const direction = changePct > 5 ? 'up' : changePct < -5 ? 'down' : 'stable';
      
      // 判断变化质量（不同指标方向含义不同）
      let quality: 'good' | 'bad' | 'neutral' = 'neutral';
      if (metric === 'ctr' || metric === 'conversion_rate' || metric === 'roas') {
        quality = direction === 'up' ? 'good' : direction === 'down' ? 'bad' : 'neutral';
      } else if (metric === 'cpc' || metric === 'cpa') {
        quality = direction === 'down' ? 'good' : direction === 'up' ? 'bad' : 'neutral';
      }

      changes.push({
        metric: metricNames[metric][locale === 'zh' ? 'zh' : 'en'],
        prev,
        curr,
        change_pct: Math.round(changePct),
        direction,
        quality
      });
    }
  }

  // 生成趋势摘要
  const goodChanges = changes.filter(c => c.quality === 'good').length;
  const badChanges = changes.filter(c => c.quality === 'bad').length;
  
  let summary = '';
  if (goodChanges > badChanges) {
    summary = locale === 'zh' 
      ? '整体趋势向好，关键指标有所改善' 
      : 'Overall trend positive, key metrics improved';
  } else if (badChanges > goodChanges) {
    summary = locale === 'zh' 
      ? '整体趋势下滑，需要关注并优化' 
      : 'Overall trend declining, needs attention';
  } else {
    summary = locale === 'zh' 
      ? '指标波动不大，保持稳定' 
      : 'Metrics stable with minor fluctuations';
  }

  return {
    has_history: true,
    previous_date: previous.snapshot_date || undefined,
    changes,
    summary
  };
}

/**
 * 生成行动建议
 */
function generateActions(diagnosis: Diagnosis, snapshot: AdSnapshot, locale: string): Action[] {
  const actions: Action[] = [];
  const pattern = diagnosis.pattern;

  // CTR高+转化率低
  if (pattern.includes('CTR') && pattern.includes(locale === 'zh' ? '转化' : 'Conv')) {
    actions.push({
      priority: 1,
      type: 'FIX',
      metric: locale === 'zh' ? '转化率' : 'Conv. Rate',
      action: locale === 'zh' 
        ? '优化落地页：检查加载速度、CTA按钮位置、产品描述是否清晰' 
        : 'Optimize landing page: check load speed, CTA button placement, product description clarity',
      evidence: locale === 'zh' 
        ? `CTR ${snapshot.ctr?.toFixed(2)}%说明素材有效吸引了点击，但转化率低意味着用户到了落地页后流失` 
        : `CTR ${snapshot.ctr?.toFixed(2)}% shows creative attracts clicks, but low conversion means users leave after landing`
    });
  }

  // CTR低+转化率高
  if (pattern.includes('CTR') && pattern.includes(locale === 'zh' ? '转化' : 'Conv')) {
    actions.push({
      priority: 1,
      type: 'SCALE',
      metric: locale === 'zh' ? '预算' : 'Budget',
      action: locale === 'zh' 
        ? '增加预算扩大曝光，同时优化素材提升CTR' 
        : 'Increase budget for more exposure while optimizing creative to improve CTR',
      evidence: locale === 'zh' 
        ? `转化率 ${(snapshot.conversion_rate ?? 0).toFixed(2)}%说明产品有吸引力，但CTR低限制了规模` 
        : `Conv. rate ${(snapshot.conversion_rate ?? 0).toFixed(2)}% shows product appeal, but low CTR limits scale`
    });
  }

  // CPA高+ROAS低
  if (pattern.includes('CPA') && pattern.includes('ROAS')) {
    actions.push({
      priority: 1,
      type: 'STOP',
      metric: locale === 'zh' ? '投放策略' : 'Campaign',
      action: locale === 'zh' 
        ? '暂停当前投放，重新定义受众和素材' 
        : 'Pause current campaign, redefine audience and creative',
      evidence: locale === 'zh' 
        ? `CPA $${snapshot.cpa?.toFixed(2)} 且 ROAS ${snapshot.roas?.toFixed(1)}x，当前策略整体无效` 
        : `CPA $${snapshot.cpa?.toFixed(2)} with ROAS ${snapshot.roas?.toFixed(1)}x, current strategy ineffective`
    });
  }

  // CPC高+CTR低
  if (pattern.includes('CPC') && pattern.includes('CTR')) {
    actions.push({
      priority: 1,
      type: 'FIX',
      metric: locale === 'zh' ? '素材' : 'Creative',
      action: locale === 'zh' 
        ? '更换视频前3秒hook，或调整受众定位' 
        : 'Change video first 3 seconds hook, or adjust audience targeting',
      evidence: locale === 'zh' 
        ? `CPC $${snapshot.cpc?.toFixed(2)} 且 CTR ${snapshot.ctr?.toFixed(2)}%，素材和受众匹配度差` 
        : `CPC $${snapshot.cpc?.toFixed(2)} with CTR ${snapshot.ctr?.toFixed(2)}%, poor creative-audience fit`
    });
  }

  // 频次高
  if (pattern.includes(locale === 'zh' ? '频次' : 'Frequency')) {
    actions.push({
      priority: 1,
      type: 'FIX',
      metric: locale === 'zh' ? '素材' : 'Creative',
      action: locale === 'zh' 
        ? '立即更换素材或扩展受众池' 
        : 'Replace creative immediately or expand audience pool',
      evidence: locale === 'zh' 
        ? `频次 ${snapshot.frequency?.toFixed(1)} 说明受众已疲劳` 
        : `Frequency ${snapshot.frequency?.toFixed(1)} indicates audience fatigue`
    });
  }

  // CPA低+ROAS高
  if (pattern.includes(locale === 'zh' ? '健康' : 'healthy')) {
    actions.push({
      priority: 1,
      type: 'SCALE',
      metric: locale === 'zh' ? '预算' : 'Budget',
      action: locale === 'zh' 
        ? '可加大预算放量，保持当前策略' 
        : 'Can increase budget to scale, maintain current strategy',
      evidence: locale === 'zh' 
        ? `CPA $${snapshot.cpa?.toFixed(2)} 且 ROAS ${snapshot.roas?.toFixed(1)}x，整体表现健康` 
        : `CPA $${snapshot.cpa?.toFixed(2)} with ROAS ${snapshot.roas?.toFixed(1)}x, overall performance healthy`
    });
  }

  // 如果没有特定建议，添加通用建议
  if (actions.length === 0) {
    actions.push({
      priority: 1,
      type: 'FIX',
      metric: locale === 'zh' ? '整体' : 'Overall',
      action: locale === 'zh' 
        ? '继续观察，建议上传下一批数据对比趋势' 
        : 'Continue monitoring, upload next batch for trend comparison',
      evidence: locale === 'zh' 
        ? '当前指标无明显异常，保持稳定' 
        : 'No significant anomalies in current metrics'
    });
  }

  return actions;
}

/**
 * 主分析函数
 */
export function analyzeAdData(
  currentSnapshot: AdSnapshot,
  previousSnapshot: AdSnapshot | null,
  locale: string = 'zh'
): AnalysisResultV2 {
  const diagnosis = diagnoseMetrics(currentSnapshot, locale);
  const trends = analyzeTrends(currentSnapshot, previousSnapshot, locale);
  const actions = generateActions(diagnosis, currentSnapshot, locale);

  return {
    diagnosis,
    trends,
    actions
  };
}

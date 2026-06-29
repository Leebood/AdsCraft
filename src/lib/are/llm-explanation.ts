/**
 * LLM Explanation Layer
 * 基于 Evidence 和诊断结果，生成自然语言报告和行動建议
 * 参考 ARE.md Section 8
 * 
 * AI 可以做什么：
 * 1. 解释规则判断结果
 * 2. 分析指标关系
 * 3. 生成行动建议
 * 4. 生成自然语言报告
 * 
 * AI 不能做什么：
 * 1. 不能创造规则
 * 2. 不能猜测数据
 * 3. 不能修改评分
 * 4. 不能生成没有 Evidence 支撑的结论
 */

import type {
  Evidence,
  MetricAnalysis,
  Diagnosis,
  Scores,
  ActionPlanItem,
  LLMExplanation,
} from './types';

// ==================== Main Functions ====================

/**
 * Generate complete LLM explanation based on analysis results
 */
export function generateExplanation(
  evidence: Evidence[],
  metricAnalyses: MetricAnalysis[],
  diagnoses: Diagnosis[],
  scores: Scores,
  campaignName: string,
  locale: 'en' | 'zh' = 'en'
): LLMExplanation {
  const executiveSummary = generateExecutiveSummary(
    scores,
    metricAnalyses,
    diagnoses,
    campaignName,
    locale
  );
  
  const diagnosisText = generateDiagnosisText(
    evidence,
    metricAnalyses,
    diagnoses,
    campaignName,
    locale
  );
  
  const actionPlanText = generateActionPlanText(
    diagnoses,
    metricAnalyses,
    locale
  );
  
  return {
    executive_summary: executiveSummary,
    diagnosis: diagnosisText,
    action_plan: actionPlanText,
  };
}

/**
 * Generate action plan items based on diagnoses
 */
export function generateActionPlan(
  diagnoses: Diagnosis[],
  metricAnalyses: MetricAnalysis[]
): ActionPlanItem[] {
  const actions: ActionPlanItem[] = [];
  
  // Group diagnoses by priority
  const criticalDiagnoses = diagnoses.filter(d => d.status === 'critical' || d.severity === 'high');
  const warningDiagnoses = diagnoses.filter(d => d.status === 'warning' || d.severity === 'medium');
  const infoDiagnoses = diagnoses.filter(d => d.status === 'info' || d.severity === 'low');
  
  // Generate P0 actions (Critical)
  for (const d of criticalDiagnoses) {
    const action = createActionItem('P0', d, metricAnalyses);
    if (action) actions.push(action);
  }
  
  // Generate P1 actions (Warning)
  for (const d of warningDiagnoses) {
    const action = createActionItem('P1', d, metricAnalyses);
    if (action) actions.push(action);
  }
  
  // Generate P2 actions (Info)
  for (const d of infoDiagnoses) {
    const action = createActionItem('P2', d, metricAnalyses);
    if (action) actions.push(action);
  }
  
  // Limit to 5 actions
  return actions.slice(0, 5);
}

// ==================== Executive Summary ====================

function generateExecutiveSummary(
  scores: Scores,
  metricAnalyses: MetricAnalysis[],
  diagnoses: Diagnosis[],
  campaignName: string,
  locale: 'en' | 'zh'
): string {
  const criticalCount = diagnoses.filter(d => d.status === 'critical').length;
  const warningCount = diagnoses.filter(d => d.status === 'warning').length;
  
  // Find key findings
  const keyFindings: string[] = [];
  
  // CTR finding
  const ctrAnalysis = metricAnalyses.find(m => m.metric === 'CTR');
  if (ctrAnalysis) {
    if (ctrAnalysis.status === 'below_benchmark') {
      keyFindings.push(
        locale === 'en'
          ? `CTR is ${ctrAnalysis.value_formatted}, below benchmark ${ctrAnalysis.benchmark_formatted}`
          : `CTR 为 ${ctrAnalysis.value_formatted}，低于基准值 ${ctrAnalysis.benchmark_formatted}`
      );
    } else if (ctrAnalysis.status === 'on_target') {
      keyFindings.push(
        locale === 'en'
          ? `CTR is ${ctrAnalysis.value_formatted}, on target`
          : `CTR 为 ${ctrAnalysis.value_formatted}，达到目标`
      );
    }
  }
  
  // ROAS finding
  const roasAnalysis = metricAnalyses.find(m => m.metric === 'ROAS');
  if (roasAnalysis) {
    if (roasAnalysis.status === 'on_target' && roasAnalysis.value >= roasAnalysis.benchmark) {
      keyFindings.push(
        locale === 'en'
          ? `ROAS is ${roasAnalysis.value_formatted}, above target ${roasAnalysis.benchmark_formatted}`
          : `ROAS 为 ${roasAnalysis.value_formatted}，高于目标 ${roasAnalysis.benchmark_formatted}`
      );
    } else if (roasAnalysis.status === 'below_benchmark') {
      keyFindings.push(
        locale === 'en'
          ? `ROAS is ${roasAnalysis.value_formatted}, below target ${roasAnalysis.benchmark_formatted}`
          : `ROAS 为 ${roasAnalysis.value_formatted}，低于目标 ${roasAnalysis.benchmark_formatted}`
      );
    }
  }
  
  // Frequency finding
  const freqAnalysis = metricAnalyses.find(m => m.metric === 'Frequency');
  if (freqAnalysis && freqAnalysis.value > 2.0) {
    keyFindings.push(
      locale === 'en'
        ? `Frequency is ${freqAnalysis.value_formatted}, indicating ad fatigue risk`
        : `频次为 ${freqAnalysis.value_formatted}，存在广告疲劳风险`
    );
  }
  
  // Build summary
  if (locale === 'en') {
    let summary = `The ${campaignName} campaign has an overall score of ${scores.overall}/100. `;
    
    if (criticalCount > 0) {
      summary += `There are ${criticalCount} critical issue(s) requiring immediate attention. `;
    }
    if (warningCount > 0) {
      summary += `There are ${warningCount} warning(s) that should be addressed. `;
    }
    
    if (keyFindings.length > 0) {
      summary += `Key findings: ${keyFindings.join('; ')}.`;
    }
    
    return summary;
  } else {
    let summary = `${campaignName} 广告系列的综合评分为 ${scores.overall}/100。`;
    
    if (criticalCount > 0) {
      summary += `有 ${criticalCount} 个严重问题需要立即关注。`;
    }
    if (warningCount > 0) {
      summary += `有 ${warningCount} 个警告需要处理。`;
    }
    
    if (keyFindings.length > 0) {
      summary += `主要发现：${keyFindings.join('；')}。`;
    }
    
    return summary;
  }
}

// ==================== Diagnosis Text ====================

function generateDiagnosisText(
  evidence: Evidence[],
  metricAnalyses: MetricAnalysis[],
  diagnoses: Diagnosis[],
  campaignName: string,
  locale: 'en' | 'zh'
): string {
  const paragraphs: string[] = [];
  
  // Generate diagnosis for each triggered rule
  for (const d of diagnoses) {
    if (d.status === 'good' || d.status === 'excellent') continue;
    
    const ev = evidence.find(e => e.evidence_id === d.evidence_id);
    const analysis = metricAnalyses.find(m => m.evidence_id === d.evidence_id);
    
    if (!ev || !analysis) continue;
    
    const paragraph = generateDiagnosisParagraph(d, ev, analysis, locale);
    if (paragraph) paragraphs.push(paragraph);
  }
  
  // Add relationship analysis
  for (const analysis of metricAnalyses) {
    if (analysis.relationships && analysis.relationships.length > 0) {
      for (const rel of analysis.relationships) {
        paragraphs.push(rel.explanation || '');
      }
    }
  }
  
  return paragraphs.join('\n\n');
}

function generateDiagnosisParagraph(
  diagnosis: Diagnosis,
  evidence: Evidence,
  analysis: MetricAnalysis,
  locale: 'en' | 'zh'
): string {
  const { metric, value_formatted, condition, status, recommendation, rule_id } = diagnosis;
  const { benchmark_formatted, deviation_percentage } = analysis;
  
  if (locale === 'en') {
    let text = `The ${metric} is ${value_formatted} (Evidence: ${evidence.evidence_id})`;
    
    if (analysis.status === 'below_benchmark') {
      text += `, which is below the benchmark of ${benchmark_formatted} (${deviation_percentage}%)`;
    } else if (analysis.status === 'on_target') {
      text += `, which meets the benchmark of ${benchmark_formatted}`;
    }
    
    text += `. `;
    
    // Add status explanation
    switch (status) {
      case 'critical':
        text += `This is a critical issue. `;
        break;
      case 'warning':
        text += `This requires attention. `;
        break;
      case 'info':
        text += `This should be monitored. `;
        break;
    }
    
    text += recommendation;
    
    return text;
  } else {
    let text = `${metric} 为 ${value_formatted}（证据：${evidence.evidence_id}）`;
    
    if (analysis.status === 'below_benchmark') {
      text += `，低于基准值 ${benchmark_formatted}（偏差 ${deviation_percentage}%）`;
    } else if (analysis.status === 'on_target') {
      text += `，达到基准值 ${benchmark_formatted}`;
    }
    
    text += `。`;
    
    // Add status explanation
    switch (status) {
      case 'critical':
        text += `这是一个严重问题。`;
        break;
      case 'warning':
        text += `这需要关注。`;
        break;
      case 'info':
        text += `这需要监控。`;
        break;
    }
    
    text += recommendation;
    
    return text;
  }
}

// ==================== Action Plan Text ====================

function generateActionPlanText(
  diagnoses: Diagnosis[],
  metricAnalyses: MetricAnalysis[],
  locale: 'en' | 'zh'
): string {
  const actions = generateActionPlan(diagnoses, metricAnalyses);
  
  if (actions.length === 0) {
    return locale === 'en'
      ? 'No immediate actions required. Continue monitoring performance.'
      : '暂无需要立即执行的行动。继续监控表现。';
  }
  
  const lines: string[] = [];
  
  for (const action of actions) {
    lines.push(`**${action.priority}: ${action.action}**`);
    lines.push(`- Issue: ${action.issue}`);
    lines.push(`- Action: ${action.details}`);
    lines.push(`- Expected Impact: ${action.expected_impact}`);
    lines.push('');
  }
  
  return lines.join('\n');
}

// ==================== Action Item Creation ====================

function createActionItem(
  priority: 'P0' | 'P1' | 'P2',
  diagnosis: Diagnosis,
  metricAnalyses: MetricAnalysis[]
): ActionPlanItem | null {
  const { metric, rule_id, recommendation, evidence_id, value_formatted } = diagnosis;
  const analysis = metricAnalyses.find(m => m.evidence_id === evidence_id);
  
  if (!analysis) return null;
  
  // Generate specific action based on metric and rule
  const actionConfig = getActionConfig(metric, rule_id, diagnosis);
  
  return {
    priority,
    action: actionConfig.action,
    issue: `${metric} is ${value_formatted} (${diagnosis.condition})`,
    details: actionConfig.details,
    expected_impact: actionConfig.expectedImpact,
    related_evidence: [evidence_id],
    related_diagnosis: [rule_id],
  };
}

interface ActionConfig {
  action: string;
  details: string;
  expectedImpact: string;
}

function getActionConfig(
  metric: string,
  ruleId: string,
  diagnosis: Diagnosis
): ActionConfig {
  const configs: Record<string, ActionConfig> = {
    // CTR Actions
    'FB-CTR-001': {
      action: 'Urgent: Improve Ad Creative',
      details: 'Test new ad creative with stronger hook, clearer value proposition, and more compelling CTA. Consider A/B testing different visual styles and messaging.',
      expectedImpact: 'CTR improvement to 1.0%+',
    },
    'FB-CTR-002': {
      action: 'Improve Ad Creative',
      details: 'Review and test new ad creative. Focus on improving the hook and call-to-action. Test different audience segments.',
      expectedImpact: 'CTR improvement to 1.5%+',
    },
    'FB-CTR-003': {
      action: 'Monitor CTR',
      details: 'CTR is slightly below benchmark. Continue monitoring and consider minor creative optimizations.',
      expectedImpact: 'CTR improvement to benchmark level',
    },
    
    // CPC Actions
    'FB-CPC-001': {
      action: 'Urgent: Reduce CPC',
      details: 'Review bidding strategy immediately. Consider switching to cost cap bidding, expanding audience, or improving creative relevance.',
      expectedImpact: 'CPC reduction to 2x benchmark or below',
    },
    'FB-CPC-002': {
      action: 'Optimize CPC',
      details: 'Review bidding strategy and audience quality. Test broader audiences and optimize creative for relevance.',
      expectedImpact: 'CPC reduction to 1.5x benchmark',
    },
    
    // Frequency Actions
    'FB-FREQ-001': {
      action: 'Urgent: Refresh Creative',
      details: 'Ad fatigue detected. Immediately refresh creative assets, expand audience, or exclude users who have seen the ad 3+ times.',
      expectedImpact: 'Frequency reduction to below 2.0',
    },
    'FB-FREQ-002': {
      action: 'Refresh Creative',
      details: 'Ad fatigue risk detected. Consider refreshing creative, expanding audience segments, or implementing frequency caps.',
      expectedImpact: 'Frequency reduction to below 2.0',
    },
    
    // ROAS Actions
    'FB-ROAS-001': {
      action: 'Urgent: Improve ROAS',
      details: 'Campaign is not profitable. Review landing page, offer, and targeting. Consider pausing if no improvement after optimization.',
      expectedImpact: 'ROAS improvement to break-even or better',
    },
    'FB-ROAS-002': {
      action: 'Optimize ROAS',
      details: 'ROAS is below target. Optimize landing page experience, improve offer, and refine audience targeting.',
      expectedImpact: 'ROAS improvement to target level',
    },
    'FB-ROAS-004': {
      action: 'Scale Campaign',
      details: 'Excellent ROAS performance. Consider increasing budget gradually (20% every 2-3 days) to scale successful campaign.',
      expectedImpact: 'Increased revenue while maintaining ROAS',
    },
    
    // CPR Actions
    'FB-CPR-001': {
      action: 'Urgent: Reduce Cost per Result',
      details: 'Cost per result is too high. Review entire funnel from creative to landing page. Consider pausing if no improvement.',
      expectedImpact: 'CPR reduction to 2x target or below',
    },
    'FB-CPR-002': {
      action: 'Optimize Cost per Result',
      details: 'Review conversion funnel. Optimize landing page, improve offer clarity, and refine targeting.',
      expectedImpact: 'CPR reduction to target level',
    },
    
    // Spend Actions
    'FB-SPEND-001': {
      action: 'Wait for More Data',
      details: 'Insufficient spend for reliable analysis. Wait until spend reaches $50+ before making major decisions.',
      expectedImpact: 'More reliable analysis data',
    },
    
    // Results Actions
    'FB-RESULT-001': {
      action: 'Wait for Learning Phase',
      details: 'Campaign is still in learning phase. Wait for 50+ results before evaluating performance.',
      expectedImpact: 'Stable optimization after learning phase',
    },
    
    // CPM Actions
    'FB-CPM-001': {
      action: 'Urgent: Reduce CPM',
      details: 'CPM is too high. Expand audience targeting, review bidding strategy, or check for high competition in your market.',
      expectedImpact: 'CPM reduction to 2x benchmark or below',
    },
    'FB-CPM-002': {
      action: 'Optimize CPM',
      details: 'Review audience breadth and bidding strategy. Consider broader audiences or different placement options.',
      expectedImpact: 'CPM reduction to 1.5x benchmark',
    },
  };
  
  return configs[ruleId] || {
    action: `Address ${metric} Issue`,
    details: diagnosis.recommendation,
    expectedImpact: `Improve ${metric} performance`,
  };
}

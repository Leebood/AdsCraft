/**
 * Google Ads Review API
 * 
 * 处理 Google Ads 截图分析请求
 * 
 * 流程：
 * 1. 接收 Google Ads 数据（手动输入或 OCR 结果）
 * 2. 构建 Evidence
 * 3. 运行 ARE 引擎（Metric/Rule/Score/LLM）
 * 4. 返回分析报告
 */

import { NextRequest, NextResponse } from 'next/server';
import { Evidence, MetricAnalysis, Diagnosis, Scores, LLMExplanation, GoogleParsedData, GoogleCampaign } from '@/lib/are/types';
import { buildGoogleEvidence, parseGoogleAdsManualInput, hasGoogleSufficientData } from '@/lib/are/google-parser';
import { GOOGLE_RULES, GOOGLE_BENCHMARKS } from '@/lib/are/ars-google';
import { analyzeMetrics } from '@/lib/are/metric-engine';
import { applyRules } from '@/lib/are/rule-engine';
import { calculateScores } from '@/lib/are/score-engine';
import { generateExplanation } from '@/lib/are/llm-explanation';

export const dynamic = 'force-dynamic';

// ============================================================================
// API Route Handler
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { campaigns, date_range, locale = 'en' } = body;
    
    if (!campaigns || !Array.isArray(campaigns) || campaigns.length === 0) {
      return NextResponse.json(
        { error: 'Invalid campaigns data' },
        { status: 400 }
      );
    }
    
    // Step 1: 解析数据
    const parsedData: GoogleParsedData = parseGoogleAdsManualInput({
      campaigns: campaigns as GoogleCampaign[],
      date_range,
    });
    
    // Step 2: 检查数据是否充足
    const dataCheck = hasGoogleSufficientData(parsedData);
    if (!dataCheck.sufficient) {
      return NextResponse.json({
        success: true,
        data: {
          report_id: `rpt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          platform: 'google',
          campaign_name: parsedData.campaigns[0]?.name || 'Unknown Campaign',
          generated_at: new Date().toISOString(),
          data_source: parsedData.data_source,
          date_range: parsedData.date_range,
          warnings: [{ type: 'insufficient_data', message: dataCheck.warning || 'Insufficient data' }],
          scores: { overall: 0, performance: 0, efficiency: 0, delivery: 0, risk: 0 },
          evidence: [],
          metric_analysis: [],
          diagnosis: [],
          action_plan: [],
          llm_explanation: {
            executive_summary: dataCheck.warning || 'Insufficient data for analysis.',
            diagnosis: '',
            action_plan: '',
          },
        },
      });
    }
    
    // Step 3: 构建 Evidence
    const evidenceList = buildGoogleEvidence(parsedData);
    
    // Step 4: 运行 Metric Engine
    const metricAnalysis = analyzeMetrics(evidenceList);
    
    // Step 5: 运行 Rule Engine
    const diagnosis = applyRules(metricAnalysis, evidenceList);
    
    // Step 6: 运行 Score Engine
    const scores = calculateScores(diagnosis, metricAnalysis);
    
    // Step 7: 生成 LLM 解释
    const llmExplanation = generateExplanation(
      evidenceList,
      metricAnalysis,
      diagnosis,
      scores,
      parsedData.campaigns[0]?.name || 'Unknown Campaign',
      locale
    );
    
    // Step 8: 构建 Action Plan
    const actionPlan = buildActionPlan(diagnosis, metricAnalysis);
    
    // Step 9: 构建报告
    const report = {
      report_id: `rpt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      platform: 'google',
      campaign_name: parsedData.campaigns[0]?.name || 'Unknown Campaign',
      generated_at: new Date().toISOString(),
      data_source: parsedData.data_source,
      date_range: parsedData.date_range,
      scores,
      evidence: evidenceList,
      metric_analysis: metricAnalysis,
      diagnosis,
      action_plan: actionPlan,
      llm_explanation: llmExplanation,
      warnings: [],
      metadata: {
        analysis_duration_ms: 0,
        model_used: 'gpt-4',
        ars_version: 'v1',
        are_version: 'v1',
      },
    };
    
    return NextResponse.json({
      success: true,
      data: report,
    });
    
  } catch (error) {
    console.error('Google review error:', error);
    return NextResponse.json(
      { error: 'Analysis failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function buildActionPlan(diagnosis: Diagnosis[], metricAnalysis: MetricAnalysis[]) {
  const actions: Array<{
    priority: string;
    action: string;
    issue: string;
    details: string;
    expected_impact: string;
    related_evidence: string[];
    related_diagnosis: string[];
  }> = [];
  
  // 按严重程度排序
  const sortedDiagnosis = [...diagnosis].sort((a, b) => {
    const severityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
    return (severityOrder[a.severity] || 2) - (severityOrder[b.severity] || 2);
  });
  
  for (const d of sortedDiagnosis) {
    if (d.status === 'good' || d.status === 'excellent') continue;
    
    const metric = metricAnalysis.find(m => m.evidence_id === d.evidence_id);
    
    let action = '';
    let details = '';
    let expectedImpact = '';
    
    switch (d.metric) {
      case 'CTR':
        action = 'Improve CTR';
        details = 'Review ad copy, add relevant keywords, improve ad extensions';
        expectedImpact = 'CTR improvement to 3%+';
        break;
      case 'CPC':
        action = 'Reduce CPC';
        details = 'Optimize keyword bids, improve Quality Score, refine targeting';
        expectedImpact = 'CPC reduction by 20-30%';
        break;
      case 'CVR':
        action = 'Improve Conversion Rate';
        details = 'Optimize landing page, improve ad relevance, add clear CTAs';
        expectedImpact = 'CVR improvement to 4%+';
        break;
      case 'ROAS':
        action = 'Improve ROAS';
        details = 'Focus on high-converting keywords, optimize budget allocation';
        expectedImpact = 'ROAS improvement to 3x+';
        break;
      case 'Quality Score':
        action = 'Improve Quality Score';
        details = 'Improve ad relevance, landing page experience, expected CTR';
        expectedImpact = 'Quality Score improvement to 6+/10';
        break;
      case 'CPA':
        action = 'Reduce CPA';
        details = 'Optimize targeting, improve conversion funnel, refine bidding';
        expectedImpact = 'CPA reduction by 20-30%';
        break;
      default:
        action = `Address ${d.metric} issue`;
        details = d.recommendation;
        expectedImpact = 'Performance improvement';
    }
    
    actions.push({
      priority: d.severity === 'high' ? 'P0' : d.severity === 'medium' ? 'P1' : 'P2',
      action,
      issue: d.recommendation,
      details,
      expected_impact: expectedImpact,
      related_evidence: [d.evidence_id],
      related_diagnosis: [d.rule_id],
    });
  }
  
  return actions;
}

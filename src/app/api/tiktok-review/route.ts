/**
 * TikTok Review API
 * POST /api/tiktok-review
 * 
 * 接收 TikTok 广告数据，执行完整分析流程
 * 支持：API 数据、手动输入、截图 OCR 数据
 */

import { NextRequest, NextResponse } from 'next/server';
import { buildEvidence } from '@/lib/are/evidence-engine';
import { analyzeMetrics } from '@/lib/are/metric-engine';
import { applyRules } from '@/lib/are/rule-engine';
import { calculateScores } from '@/lib/are/score-engine';
import { generateExplanation } from '@/lib/are/llm-explanation';
import { parseTikTokManualInput, parseTikTokScreenshot } from '@/lib/are/tiktok-parser';
import { TIKTOK_BENCHMARKS, ALL_TIKTOK_RULES, hasVideoData, hasSufficientData } from '@/lib/are/ars-tiktok';
import type { Evidence, MetricAnalysis, Diagnosis, Scores, LLMExplanation, TikTokParsedData, TikTokCampaign } from '@/lib/are/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      campaigns, 
      date_range, 
      locale = 'en',
      screenshot_data, // 截图 OCR 数据
    } = body;

    // 解析数据
    let parsedData: TikTokParsedData;
    
    if (screenshot_data) {
      // 截图 OCR 数据
      parsedData = parseTikTokScreenshot(screenshot_data);
    } else if (campaigns && Array.isArray(campaigns)) {
      // 手动输入或 API 数据
      parsedData = parseTikTokManualInput({
        campaigns: campaigns.map((c: any) => ({
          name: c.name || c.campaign_name || 'Unknown',
          status: c.status || c.delivery || 'Active',
          budget: c.budget || 0,
          spend: c.spend || c.spent || 0,
          impressions: c.impressions || 0,
          clicks: c.clicks || 0,
          ctr: c.ctr || 0,
          cpc: c.cpc || 0,
          cpm: c.cpm || 0,
          conversions: c.conversions || c.results || 0,
          cvr: c.cvr || 0,
          cpa: c.cpa || c.cpr || 0,
          roas: c.roas || 0,
          video_views: c.video_views,
          six_second_views: c.six_second_views,
          six_second_view_rate: c.six_second_view_rate,
          avg_watch_time: c.avg_watch_time,
        })),
        date_range: date_range,
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'No data provided' },
        { status: 400 }
      );
    }

    // 检查数据充分性
    const firstCampaign = parsedData.campaigns[0];
    const dataSufficiency = hasSufficientData({
      spend: firstCampaign.spend,
      results: firstCampaign.conversions,
    });

    // 检查是否有视频数据
    const hasVideo = hasVideoData({
      video_views: firstCampaign.video_views,
      six_second_views: firstCampaign.six_second_views,
      six_second_view_rate: firstCampaign.six_second_view_rate,
      avg_watch_time: firstCampaign.avg_watch_time,
    });

    // Step 1: Build Evidence
    const evidenceList: Evidence[] = [];
    for (const campaign of parsedData.campaigns) {
      // 为 TikTok 构建 Evidence
      const timestamp = new Date().toISOString();
      const source = {
        type: parsedData.data_source.type as any,
        confidence: parsedData.data_source.ocr_confidence,
        column: '',
        row: campaign.name,
      };
      
      // CTR
      if (campaign.ctr !== undefined) {
        const benchmark = TIKTOK_BENCHMARKS.ctr.value;
        evidenceList.push({
          evidence_id: `CTR-${String(evidenceList.length + 1).padStart(3, '0')}`,
          metric: 'CTR',
          value: campaign.ctr,
          value_formatted: `${campaign.ctr.toFixed(2)}%`,
          benchmark,
          benchmark_formatted: `${benchmark.toFixed(2)}%`,
          status: campaign.ctr >= benchmark ? 'above' : 'below',
          campaign: campaign.name,
          source: { ...source, column: 'CTR' },
          timestamp,
        });
      }
      
      // CPC
      if (campaign.cpc !== undefined) {
        const benchmark = TIKTOK_BENCHMARKS.cpc.value;
        evidenceList.push({
          evidence_id: `CPC-${String(evidenceList.length + 1).padStart(3, '0')}`,
          metric: 'CPC',
          value: campaign.cpc,
          value_formatted: `$${campaign.cpc.toFixed(2)}`,
          benchmark,
          benchmark_formatted: `$${benchmark.toFixed(2)}`,
          status: campaign.cpc <= benchmark ? 'below' : 'above',
          campaign: campaign.name,
          source: { ...source, column: 'CPC' },
          timestamp,
        });
      }
      
      // CVR
      if (campaign.cvr !== undefined) {
        const benchmark = TIKTOK_BENCHMARKS.cvr.value;
        evidenceList.push({
          evidence_id: `CVR-${String(evidenceList.length + 1).padStart(3, '0')}`,
          metric: 'CVR',
          value: campaign.cvr,
          value_formatted: `${campaign.cvr.toFixed(2)}%`,
          benchmark,
          benchmark_formatted: `${benchmark.toFixed(2)}%`,
          status: campaign.cvr >= benchmark ? 'above' : 'below',
          campaign: campaign.name,
          source: { ...source, column: 'CVR' },
          timestamp,
        });
      }
      
      // CPA
      if (campaign.cpa !== undefined) {
        const benchmark = TIKTOK_BENCHMARKS.cpa.value;
        evidenceList.push({
          evidence_id: `CPA-${String(evidenceList.length + 1).padStart(3, '0')}`,
          metric: 'CPA',
          value: campaign.cpa,
          value_formatted: `$${campaign.cpa.toFixed(2)}`,
          benchmark,
          benchmark_formatted: `$${benchmark.toFixed(2)}`,
          status: campaign.cpa <= benchmark ? 'below' : 'above',
          campaign: campaign.name,
          source: { ...source, column: 'CPA' },
          timestamp,
        });
      }
      
      // ROAS
      if (campaign.roas !== undefined) {
        const benchmark = TIKTOK_BENCHMARKS.roas.value;
        evidenceList.push({
          evidence_id: `ROAS-${String(evidenceList.length + 1).padStart(3, '0')}`,
          metric: 'ROAS',
          value: campaign.roas,
          value_formatted: `${campaign.roas.toFixed(2)}x`,
          benchmark,
          benchmark_formatted: `${benchmark.toFixed(2)}x`,
          status: campaign.roas >= benchmark ? 'above' : 'below',
          campaign: campaign.name,
          source: { ...source, column: 'ROAS' },
          timestamp,
        });
      }
      
      // 6s View Rate (TikTok specific)
      if (campaign.six_second_view_rate !== undefined) {
        const benchmark = TIKTOK_BENCHMARKS.six_second_view_rate.value;
        evidenceList.push({
          evidence_id: `6SVIEWRATE-${String(evidenceList.length + 1).padStart(3, '0')}`,
          metric: '6s View Rate',
          value: campaign.six_second_view_rate,
          value_formatted: `${campaign.six_second_view_rate.toFixed(2)}%`,
          benchmark,
          benchmark_formatted: `${benchmark.toFixed(2)}%`,
          status: campaign.six_second_view_rate >= benchmark ? 'above' : 'below',
          campaign: campaign.name,
          source: { ...source, column: '6s View Rate' },
          timestamp,
        });
      }
    }

    // Step 2: Analyze Metrics
    const metricAnalysis: MetricAnalysis[] = analyzeMetrics(evidenceList);

    // Step 3: Apply Rules
    const diagnosis: Diagnosis[] = applyRules(metricAnalysis, ALL_TIKTOK_RULES as any);

    // 如果没有视频数据，过滤掉 Creative Quality 规则
    const filteredDiagnosis = hasVideo
      ? diagnosis
      : diagnosis.filter(d => !d.rule_id.startsWith('TK-CREATIVE-'));

    // Step 4: Calculate Scores
    const scores: Scores = calculateScores(filteredDiagnosis, metricAnalysis);

    // Step 5: Generate LLM Explanation
    const llmExplanation: LLMExplanation = await generateExplanation(
      evidenceList,
      metricAnalysis,
      filteredDiagnosis,
      scores,
      locale
    );

    // 构建 Action Plan
    const actionPlan = filteredDiagnosis
      .filter(d => d.status === 'critical' || d.status === 'warning')
      .sort((a, b) => {
        const severityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      })
      .slice(0, 5)
      .map((d, index) => ({
        priority: `P${index + 1}` as 'P1' | 'P2' | 'P3',
        action: d.recommendation,
        issue: `${d.metric} is ${d.status}`,
        details: `${d.metric} is ${d.value_formatted} (${d.condition})`,
        expected_impact: `Improve ${d.metric} to meet benchmark`,
        related_evidence: [d.evidence_id],
        related_diagnosis: [d.rule_id],
      }));

    // 构建警告
    const warnings: string[] = [];
    if (!dataSufficiency.sufficient && dataSufficiency.warning) {
      warnings.push(dataSufficiency.warning);
    }
    if (!hasVideo) {
      warnings.push('Video data not available. Hook analysis skipped.');
    }

    // 构建报告
    const report = {
      report_id: `rpt_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      platform: parsedData.platform,
      campaign_name: parsedData.campaigns[0]?.name || 'Unknown',
      generated_at: new Date().toISOString(),
      data_source: parsedData.data_source,
      date_range: parsedData.date_range,
      snapshot_date: parsedData.snapshot_date,
      scores,
      evidence: evidenceList,
      metric_analysis: metricAnalysis,
      diagnosis: filteredDiagnosis,
      action_plan: actionPlan,
      llm_explanation: llmExplanation,
      warnings,
      metadata: {
        analysis_duration_ms: 0,
        model_used: 'rule-engine',
        ars_version: 'v1',
        are_version: 'v1',
      },
    };

    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('TikTok review error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Analysis failed' 
      },
      { status: 500 }
    );
  }
}

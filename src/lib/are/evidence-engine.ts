/**
 * Evidence Engine
 * 在 Parser 之后、Metric/Rule Engine 之前，将原始数据标准化为带 Provenance 的 Evidence
 * 参考 ARE.md Section 4
 */

import type {
  FacebookParsedData,
  FacebookCampaign,
  Evidence,
  EvidenceSource,
  DEFAULT_BENCHMARKS,
} from './types';
import { DEFAULT_BENCHMARKS as BENCHMARKS } from './types';

// ==================== Evidence Builder ====================

let evidenceCounter = 0;

/**
 * Reset evidence counter (for testing)
 */
export function resetEvidenceCounter(): void {
  evidenceCounter = 0;
}

/**
 * Generate a unique evidence ID
 */
function generateEvidenceId(metric: string): string {
  evidenceCounter++;
  const seq = String(evidenceCounter).padStart(3, '0');
  return `${metric.toUpperCase().replace(/\s+/g, '')}-${seq}`;
}

/**
 * Format metric value for display
 */
function formatValue(metric: string, value: number): string {
  switch (metric) {
    case 'CTR':
      return `${value.toFixed(2)}%`;
    case 'CPC':
    case 'CPM':
    case 'CPR':
      return `$${value.toFixed(2)}`;
    case 'ROAS':
      return `${value.toFixed(2)}x`;
    case 'Frequency':
      return value.toFixed(2);
    case 'Spend':
      return `$${value.toFixed(2)}`;
    case 'Results':
    case 'Impressions':
    case 'Reach':
      return value.toLocaleString();
    default:
      return String(value);
  }
}

/**
 * Format benchmark value for display
 */
function formatBenchmark(metric: string, value: number): string {
  return formatValue(metric, value);
}

/**
 * Determine status based on value and benchmark
 */
function determineStatus(
  metric: string,
  value: number,
  benchmark: number
): 'above' | 'below' | 'on_target' {
  // For metrics where lower is better (CPC, CPM, CPR, Frequency)
  const lowerIsBetter = ['CPC', 'CPM', 'CPR', 'Frequency'];
  
  if (lowerIsBetter.includes(metric)) {
    if (value <= benchmark) return 'on_target';
    if (value > benchmark) return 'below'; // Below target (worse)
    return 'above';
  }
  
  // For metrics where higher is better (CTR, ROAS, Results, Impressions, Reach)
  if (value >= benchmark) return 'above';
  if (value < benchmark) return 'below';
  return 'on_target';
}

// ==================== Main Functions ====================

/**
 * Build evidence list from parsed Facebook data
 */
export function buildEvidence(parsedData: FacebookParsedData): Evidence[] {
  // Reset counter for each analysis
  resetEvidenceCounter();
  
  const evidenceList: Evidence[] = [];
  const timestamp = new Date().toISOString();
  
  for (const campaign of parsedData.campaigns) {
    const source: EvidenceSource = {
      type: parsedData.data_source.type,
      confidence: parsedData.data_source.ocr_confidence,
      column: '',
      row: campaign.name,
    };
    
    // Build evidence for each metric
    const campaignEvidence = buildCampaignEvidence(
      campaign,
      source,
      timestamp
    );
    
    evidenceList.push(...campaignEvidence);
  }
  
  return evidenceList;
}

/**
 * Build evidence for a single campaign
 */
function buildCampaignEvidence(
  campaign: FacebookCampaign,
  source: EvidenceSource,
  timestamp: string
): Evidence[] {
  const evidenceList: Evidence[] = [];
  
  // CTR
  evidenceList.push(createEvidence(
    'CTR',
    campaign.ctr,
    BENCHMARKS.ctr,
    campaign.name,
    { ...source, column: 'CTR' },
    timestamp
  ));
  
  // CPC
  evidenceList.push(createEvidence(
    'CPC',
    campaign.cpc,
    BENCHMARKS.cpc,
    campaign.name,
    { ...source, column: 'CPC' },
    timestamp
  ));
  
  // Frequency
  evidenceList.push(createEvidence(
    'Frequency',
    campaign.frequency,
    BENCHMARKS.frequency,
    campaign.name,
    { ...source, column: 'Frequency' },
    timestamp
  ));
  
  // ROAS
  evidenceList.push(createEvidence(
    'ROAS',
    campaign.roas,
    BENCHMARKS.roas,
    campaign.name,
    { ...source, column: 'ROAS' },
    timestamp
  ));
  
  // CPR (Cost per Result)
  evidenceList.push(createEvidence(
    'CPR',
    campaign.cpr,
    BENCHMARKS.cpr,
    campaign.name,
    { ...source, column: 'Cost per Result' },
    timestamp
  ));
  
  // Spend
  evidenceList.push(createEvidence(
    'Spend',
    campaign.spent,
    100, // $100 is threshold for sufficient data
    campaign.name,
    { ...source, column: 'Amount Spent' },
    timestamp
  ));
  
  // Results
  evidenceList.push(createEvidence(
    'Results',
    campaign.results,
    100, // 100 results is threshold for stable optimization
    campaign.name,
    { ...source, column: 'Results' },
    timestamp
  ));
  
  // Impressions
  evidenceList.push(createEvidence(
    'Impressions',
    campaign.impressions,
    10000, // 10k impressions as baseline
    campaign.name,
    { ...source, column: 'Impressions' },
    timestamp
  ));
  
  // Reach
  evidenceList.push(createEvidence(
    'Reach',
    campaign.reach,
    8000, // 8k reach as baseline
    campaign.name,
    { ...source, column: 'Reach' },
    timestamp
  ));
  
  // CPM (if available)
  if (campaign.cpm !== undefined && campaign.cpm > 0) {
    evidenceList.push(createEvidence(
      'CPM',
      campaign.cpm,
      BENCHMARKS.cpm,
      campaign.name,
      { ...source, column: 'CPM' },
      timestamp
    ));
  }
  
  return evidenceList;
}

/**
 * Create a single evidence item
 */
function createEvidence(
  metric: string,
  value: number,
  benchmark: number,
  campaign: string,
  source: EvidenceSource,
  timestamp: string
): Evidence {
  const evidenceId = generateEvidenceId(metric);
  const status = determineStatus(metric, value, benchmark);
  
  return {
    evidence_id: evidenceId,
    metric,
    value,
    value_formatted: formatValue(metric, value),
    benchmark,
    benchmark_formatted: formatBenchmark(metric, benchmark),
    status,
    campaign,
    source,
    timestamp,
  };
}

// ==================== Utility Functions ====================

/**
 * Get evidence by ID
 */
export function getEvidenceById(evidence: Evidence[], id: string): Evidence | undefined {
  return evidence.find(e => e.evidence_id === id);
}

/**
 * Get evidence by metric and campaign
 */
export function getEvidenceByMetricAndCampaign(
  evidence: Evidence[],
  metric: string,
  campaign: string
): Evidence | undefined {
  return evidence.find(e => e.metric === metric && e.campaign === campaign);
}

/**
 * Get all evidence for a specific campaign
 */
export function getEvidenceForCampaign(
  evidence: Evidence[],
  campaign: string
): Evidence[] {
  return evidence.filter(e => e.campaign === campaign);
}

/**
 * Get all evidence for a specific metric
 */
export function getEvidenceForMetric(
  evidence: Evidence[],
  metric: string
): Evidence[] {
  return evidence.filter(e => e.metric === metric);
}

/**
 * Check if data is sufficient for analysis
 */
export function isDataSufficient(evidence: Evidence[]): { sufficient: boolean; reason?: string } {
  const spendEvidence = evidence.find(e => e.metric === 'Spend');
  const resultsEvidence = evidence.find(e => e.metric === 'Results');
  
  if (!spendEvidence || spendEvidence.value < 50) {
    return {
      sufficient: false,
      reason: 'Insufficient data: Spend < $50. Wait for more spend before analysis.',
    };
  }
  
  if (!resultsEvidence || resultsEvidence.value < 50) {
    return {
      sufficient: false,
      reason: 'Learning phase: Results < 50. Wait for more results before analysis.',
    };
  }
  
  return { sufficient: true };
}

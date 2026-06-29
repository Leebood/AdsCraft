/**
 * Facebook Parser
 * 将 OCR 识别的原始数据或手动输入的数据结构化为标准的 JSON 格式
 * 参考 ARE.md Section 3.2
 */

import type { FacebookCampaign, FacebookParsedData, DataSource } from './types';

// ==================== Input Types ====================

/**
 * Raw OCR data from OCR Engine
 */
export interface OCRTextBlock {
  text: string;
  confidence: number;
  bounding_box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface OCRResult {
  text_blocks: OCRTextBlock[];
  overall_confidence: number;
}

/**
 * Manual input data (for testing or direct input)
 */
export interface ManualInputData {
  date_range: string;
  snapshot_date?: string;
  campaigns: Array<{
    name: string;
    delivery: string;
    budget: number;
    spent: number;
    results: number;
    cpr: number;
    impressions: number;
    reach: number;
    ctr: number;
    cpc: number;
    frequency: number;
    roas: number;
    cpm?: number;
    audience?: string;
    placement?: string;
    learning_phase?: string;
    creative_type?: string;
    hook?: string;
    cta?: string;
    landing_page?: string;
  }>;
}

// ==================== Parser Functions ====================

/**
 * Parse OCR result into structured Facebook data
 * This is a simplified parser that assumes the OCR has already extracted
 * the relevant fields. In production, this would need more sophisticated
 * table detection and field mapping.
 */
export function parseFacebookOCR(
  ocrResult: OCRResult,
  screenshotUrl: string
): FacebookParsedData {
  // Extract text blocks and organize by rows
  const blocks = ocrResult.text_blocks;
  
  // Find header row to identify columns
  const headerKeywords = [
    'Campaign Name', 'Delivery', 'Budget', 'Amount Spent', 'Results',
    'Cost per Result', 'Impressions', 'Reach', 'CTR', 'CPC', 'Frequency', 'ROAS'
  ];
  
  // Group blocks by Y coordinate (rows)
  const rows = groupBlocksByRow(blocks);
  
  // Find header row
  const headerRow = findHeaderRow(rows, headerKeywords);
  
  if (!headerRow) {
    throw new Error('Could not find header row in OCR result');
  }
  
  // Parse data rows
  const campaigns: FacebookCampaign[] = [];
  
  for (const row of rows) {
    if (row === headerRow) continue;
    
    const campaign = parseCampaignRow(row, headerRow);
    if (campaign) {
      campaigns.push(campaign);
    }
  }
  
  return {
    platform: 'facebook',
    data_source: {
      type: 'OCR',
      screenshot_url: screenshotUrl,
      ocr_confidence: ocrResult.overall_confidence,
    },
    date_range: extractDateRange(blocks),
    campaigns,
  };
}

/**
 * Parse manual input data into structured Facebook data
 */
export function parseFacebookManual(
  input: ManualInputData,
  source: DataSource = { type: 'Manual' }
): FacebookParsedData {
  const campaigns: FacebookCampaign[] = input.campaigns.map(c => ({
    name: c.name,
    delivery: c.delivery,
    budget: c.budget,
    spent: c.spent,
    results: c.results,
    cpr: c.cpr,
    impressions: c.impressions,
    reach: c.reach,
    ctr: c.ctr,
    cpc: c.cpc,
    frequency: c.frequency,
    roas: c.roas,
    cpm: c.cpm,
    audience: c.audience,
    placement: c.placement,
    learning_phase: c.learning_phase,
    creative_type: c.creative_type,
    hook: c.hook,
    cta: c.cta,
    landing_page: c.landing_page,
  }));
  
  return {
    platform: 'facebook',
    data_source: source,
    date_range: input.date_range,
    snapshot_date: input.snapshot_date,
    campaigns,
  };
}

/**
 * Parse from existing structured data (e.g., from database or API)
 */
export function parseFacebookFromData(
  data: Partial<FacebookParsedData>,
  source: DataSource
): FacebookParsedData {
  return {
    platform: 'facebook',
    data_source: source,
    date_range: data.date_range || 'Unknown',
    snapshot_date: data.snapshot_date,
    campaigns: data.campaigns || [],
  };
}

// ==================== Helper Functions ====================

interface BlockRow {
  y: number;
  blocks: OCRTextBlock[];
}

/**
 * Group OCR blocks by Y coordinate (rows)
 */
function groupBlocksByRow(blocks: OCRTextBlock[]): BlockRow[] {
  const rowThreshold = 10; // pixels
  const sortedBlocks = [...blocks].sort((a, b) => a.bounding_box.y - b.bounding_box.y);
  
  const rows: BlockRow[] = [];
  let currentRow: BlockRow | null = null;
  
  for (const block of sortedBlocks) {
    const y = block.bounding_box.y;
    
    if (!currentRow || Math.abs(y - currentRow.y) > rowThreshold) {
      currentRow = { y, blocks: [] };
      rows.push(currentRow);
    }
    
    currentRow.blocks.push(block);
  }
  
  // Sort blocks within each row by X coordinate
  for (const row of rows) {
    row.blocks.sort((a, b) => a.bounding_box.x - b.bounding_box.x);
  }
  
  return rows;
}

/**
 * Find the header row containing column names
 */
function findHeaderRow(rows: BlockRow[], keywords: string[]): BlockRow | null {
  for (const row of rows) {
    const rowText = row.blocks.map(b => b.text).join(' ').toLowerCase();
    const matchCount = keywords.filter(k => rowText.includes(k.toLowerCase())).length;
    
    // If at least 3 keywords match, consider it the header row
    if (matchCount >= 3) {
      return row;
    }
  }
  
  return null;
}

/**
 * Parse a campaign row using header mapping
 */
function parseCampaignRow(row: BlockRow, headerRow: BlockRow): FacebookCampaign | null {
  const headerTexts = headerRow.blocks.map(b => b.text.toLowerCase());
  const rowTexts = row.blocks.map(b => b.text);
  
  // Map column indices
  const getColumnIndex = (keyword: string): number => {
    return headerTexts.findIndex(h => h.includes(keyword.toLowerCase()));
  };
  
  const nameIdx = getColumnIndex('campaign');
  const deliveryIdx = getColumnIndex('delivery');
  const budgetIdx = getColumnIndex('budget');
  const spentIdx = getColumnIndex('spent');
  const resultsIdx = getColumnIndex('results');
  const cprIdx = getColumnIndex('cost per result');
  const impressionsIdx = getColumnIndex('impressions');
  const reachIdx = getColumnIndex('reach');
  const ctrIdx = getColumnIndex('ctr');
  const cpcIdx = getColumnIndex('cpc');
  const freqIdx = getColumnIndex('frequency');
  const roasIdx = getColumnIndex('roas');
  
  // Extract values
  const getText = (idx: number): string => {
    if (idx >= 0 && idx < rowTexts.length) {
      return rowTexts[idx];
    }
    return '';
  };
  
  const getNumber = (idx: number): number => {
    const text = getText(idx);
    if (!text) return 0;
    
    // Remove currency symbols, commas, and percentage signs
    const cleaned = text.replace(/[$,%]/g, '').trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };
  
  const name = getText(nameIdx);
  if (!name) return null;
  
  return {
    name,
    delivery: getText(deliveryIdx) || 'Active',
    budget: getNumber(budgetIdx),
    spent: getNumber(spentIdx),
    results: getNumber(resultsIdx),
    cpr: getNumber(cprIdx),
    impressions: getNumber(impressionsIdx),
    reach: getNumber(reachIdx),
    ctr: getNumber(ctrIdx),
    cpc: getNumber(cpcIdx),
    frequency: getNumber(freqIdx),
    roas: getNumber(roasIdx),
  };
}

/**
 * Extract date range from OCR blocks
 */
function extractDateRange(blocks: OCRTextBlock[]): string {
  // Look for common date range patterns
  const datePatterns = [
    /Last \d+ days/i,
    /\d{1,2}\/\d{1,2}\/\d{4}\s*-\s*\d{1,2}\/\d{1,2}\/\d{4}/,
    /Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/i,
  ];
  
  for (const block of blocks) {
    for (const pattern of datePatterns) {
      const match = block.text.match(pattern);
      if (match) {
        return match[0];
      }
    }
  }
  
  return 'Unknown';
}

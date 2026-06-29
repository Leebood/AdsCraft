/**
 * Google Ads Parser
 * 
 * 解析 Google Ads 截图 OCR 结果或手动输入的数据，转换为标准 Evidence 格式
 * 
 * 参考文档：ARE.md - Parser
 */

import { Evidence, GoogleParsedData, GoogleCampaign } from './types';

// ============================================================================
// Google Ads Parser
// ============================================================================

/**
 * 解析 Google Ads 截图 OCR 结果
 * 
 * @param ocrResult OCR 识别结果
 * @returns 解析后的 Google Ads 数据
 */
export function parseGoogleAdsScreenshot(ocrResult: string): GoogleParsedData {
  // 这里应该实现具体的 OCR 解析逻辑
  // 目前返回空数据，实际使用时需要根据 OCR 结果解析
  
  return {
    platform: 'google',
    date_range: 'Last 7 days',
    campaigns: [],
    data_source: {
      type: 'OCR',
      ocr_confidence: 0.95,
    },
  };
}

/**
 * 解析手动输入的 Google Ads 数据
 * 
 * @param data 手动输入的数据
 * @returns 解析后的 Google Ads 数据
 */
export function parseGoogleAdsManualInput(data: {
  campaigns: GoogleCampaign[];
  date_range?: string;
}): GoogleParsedData {
  return {
    platform: 'google',
    date_range: data.date_range || 'Last 7 days',
    campaigns: data.campaigns,
    data_source: {
      type: 'Manual',
    },
  };
}

/**
 * 从 Google Ads 数据构建 Evidence
 * 
 * @param data 解析后的 Google Ads 数据
 * @returns Evidence 列表
 */
export function buildGoogleEvidence(data: GoogleParsedData): Evidence[] {
  const evidenceList: Evidence[] = [];
  let evidenceCounter = 1;
  
  for (const campaign of data.campaigns) {
    const campaignName = campaign.name || 'Unknown Campaign';
    
    // CTR Evidence
    if (campaign.ctr !== undefined && campaign.ctr !== null) {
      evidenceList.push({
        evidence_id: `CTR-${String(evidenceCounter).padStart(3, '0')}`,
        metric: 'CTR',
        value: campaign.ctr,
        value_formatted: `${campaign.ctr.toFixed(2)}%`,
        benchmark: 3.17, // Google 搜索广告平均 CTR
        benchmark_formatted: '3.17%',
        status: campaign.ctr >= 3.17 ? 'above' : 'below',
        campaign: campaignName,
        source: {
          type: data.data_source.type,
          column: 'CTR',
          row: campaignName,
        },
        timestamp: new Date().toISOString(),
      });
      evidenceCounter++;
    }
    
    // CPC Evidence
    if (campaign.cpc !== undefined && campaign.cpc !== null) {
      evidenceList.push({
        evidence_id: `CPC-${String(evidenceCounter).padStart(3, '0')}`,
        metric: 'CPC',
        value: campaign.cpc,
        value_formatted: `$${campaign.cpc.toFixed(2)}`,
        benchmark: 2.69, // Google 搜索广告平均 CPC
        benchmark_formatted: '$2.69',
        status: campaign.cpc <= 2.69 ? 'below' : 'above',
        campaign: campaignName,
        source: {
          type: data.data_source.type,
          column: 'CPC',
          row: campaignName,
        },
        timestamp: new Date().toISOString(),
      });
      evidenceCounter++;
    }
    
    // CVR Evidence
    if (campaign.cvr !== undefined && campaign.cvr !== null) {
      evidenceList.push({
        evidence_id: `CVR-${String(evidenceCounter).padStart(3, '0')}`,
        metric: 'CVR',
        value: campaign.cvr,
        value_formatted: `${campaign.cvr.toFixed(2)}%`,
        benchmark: 3.75, // Google 搜索广告平均 CVR
        benchmark_formatted: '3.75%',
        status: campaign.cvr >= 3.75 ? 'above' : 'below',
        campaign: campaignName,
        source: {
          type: data.data_source.type,
          column: 'CVR',
          row: campaignName,
        },
        timestamp: new Date().toISOString(),
      });
      evidenceCounter++;
    }
    
    // ROAS Evidence
    if (campaign.roas !== undefined && campaign.roas !== null) {
      evidenceList.push({
        evidence_id: `ROAS-${String(evidenceCounter).padStart(3, '0')}`,
        metric: 'ROAS',
        value: campaign.roas,
        value_formatted: `${campaign.roas.toFixed(1)}x`,
        benchmark: 3.0, // Google 广告通常要求更高的 ROAS
        benchmark_formatted: '3.0x',
        status: campaign.roas >= 3.0 ? 'above' : 'below',
        campaign: campaignName,
        source: {
          type: data.data_source.type,
          column: 'ROAS',
          row: campaignName,
        },
        timestamp: new Date().toISOString(),
      });
      evidenceCounter++;
    }
    
    // Quality Score Evidence
    if (campaign.quality_score !== undefined && campaign.quality_score !== null) {
      evidenceList.push({
        evidence_id: `QS-${String(evidenceCounter).padStart(3, '0')}`,
        metric: 'Quality Score',
        value: campaign.quality_score,
        value_formatted: `${campaign.quality_score}/10`,
        benchmark: 5, // 质量得分平均 5
        benchmark_formatted: '5/10',
        status: campaign.quality_score >= 5 ? 'above' : 'below',
        campaign: campaignName,
        source: {
          type: data.data_source.type,
          column: 'Quality Score',
          row: campaignName,
        },
        timestamp: new Date().toISOString(),
      });
      evidenceCounter++;
    }
    
    // CPA Evidence
    if (campaign.cpa !== undefined && campaign.cpa !== null) {
      evidenceList.push({
        evidence_id: `CPA-${String(evidenceCounter).padStart(3, '0')}`,
        metric: 'CPA',
        value: campaign.cpa,
        value_formatted: `$${campaign.cpa.toFixed(2)}`,
        benchmark: 30.00, // Google 搜索广告平均 CPA
        benchmark_formatted: '$30.00',
        status: campaign.cpa <= 30.00 ? 'below' : 'above',
        campaign: campaignName,
        source: {
          type: data.data_source.type,
          column: 'CPA',
          row: campaignName,
        },
        timestamp: new Date().toISOString(),
      });
      evidenceCounter++;
    }
    
    // Impressions Evidence
    if (campaign.impressions !== undefined && campaign.impressions !== null) {
      evidenceList.push({
        evidence_id: `IMPRESSIONS-${String(evidenceCounter).padStart(3, '0')}`,
        metric: 'Impressions',
        value: campaign.impressions,
        value_formatted: campaign.impressions.toLocaleString(),
        status: 'on_target',
        campaign: campaignName,
        source: {
          type: data.data_source.type,
          column: 'Impressions',
          row: campaignName,
        },
        timestamp: new Date().toISOString(),
      });
      evidenceCounter++;
    }
    
    // Clicks Evidence
    if (campaign.clicks !== undefined && campaign.clicks !== null) {
      evidenceList.push({
        evidence_id: `CLICKS-${String(evidenceCounter).padStart(3, '0')}`,
        metric: 'Clicks',
        value: campaign.clicks,
        value_formatted: campaign.clicks.toLocaleString(),
        status: 'on_target',
        campaign: campaignName,
        source: {
          type: data.data_source.type,
          column: 'Clicks',
          row: campaignName,
        },
        timestamp: new Date().toISOString(),
      });
      evidenceCounter++;
    }
    
    // Conversions Evidence
    if (campaign.conversions !== undefined && campaign.conversions !== null) {
      evidenceList.push({
        evidence_id: `CONVERSIONS-${String(evidenceCounter).padStart(3, '0')}`,
        metric: 'Conversions',
        value: campaign.conversions,
        value_formatted: campaign.conversions.toLocaleString(),
        status: 'on_target',
        campaign: campaignName,
        source: {
          type: data.data_source.type,
          column: 'Conversions',
          row: campaignName,
        },
        timestamp: new Date().toISOString(),
      });
      evidenceCounter++;
    }
    
    // Spend Evidence
    if (campaign.cost !== undefined && campaign.cost !== null) {
      evidenceList.push({
        evidence_id: `SPEND-${String(evidenceCounter).padStart(3, '0')}`,
        metric: 'Spend',
        value: campaign.cost,
        value_formatted: `$${campaign.cost.toFixed(2)}`,
        status: 'on_target',
        campaign: campaignName,
        source: {
          type: data.data_source.type,
          column: 'Spend',
          row: campaignName,
        },
        timestamp: new Date().toISOString(),
      });
      evidenceCounter++;
    }
  }
  
  return evidenceList;
}

/**
 * 检查 Google Ads 数据是否充足
 * 
 * @param data Google Ads 数据
 * @returns 是否充足
 */
export function hasGoogleSufficientData(data: GoogleParsedData): { sufficient: boolean; warning?: string } {
  if (data.campaigns.length === 0) {
    return { sufficient: false, warning: 'No campaign data available' };
  }
  
  const campaign = data.campaigns[0];
  
  // 检查是否有足够的展示量
  if (campaign.impressions !== undefined && campaign.impressions < 1000) {
    return { sufficient: false, warning: 'Insufficient impressions (< 1000). Wait for more data.' };
  }
  
  // 检查是否有足够的点击量
  if (campaign.clicks !== undefined && campaign.clicks < 50) {
    return { sufficient: false, warning: 'Insufficient clicks (< 50). Wait for more data.' };
  }
  
  return { sufficient: true };
}

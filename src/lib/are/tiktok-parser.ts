/**
 * TikTok Parser
 * 
 * 将 TikTok Ads API 数据或截图 OCR 数据解析为标准化格式
 * 支持两种输入：
 * 1. TikTok API 数据（通过 OAuth 获取 access_token）
 * 2. 截图 OCR 数据（复用现有的截图识别功能）
 */

import { TikTokParsedData, DataSource } from './types';

// ============================================================================
// TikTok API Response Types
// ============================================================================

export interface TikTokAPICampaign {
  campaign_id: string;
  campaign_name: string;
  status: string;
  budget: number;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  conversions: number;
  cvr: number;
  cpa: number;
  roas: number;
  // 视频指标（可选）
  video_views?: number;
  six_second_views?: number;
  six_second_view_rate?: number;
  avg_watch_time?: number;
  // 日期范围
  date_range?: {
    start_date: string;
    end_date: string;
  };
}

export interface TikTokAPIResponse {
  code: number;
  message: string;
  data: {
    campaigns: TikTokAPICampaign[];
    date_range?: {
      start_date: string;
      end_date: string;
    };
  };
}

// ============================================================================
// TikTok Parser
// ============================================================================

/**
 * 解析 TikTok API 响应
 */
export function parseTikTokAPIResponse(
  response: TikTokAPIResponse,
  source: DataSource = { type: 'TikTok API' }
): TikTokParsedData {
  if (response.code !== 0) {
    throw new Error(`TikTok API error: ${response.message}`);
  }

  const campaigns = response.data.campaigns.map((campaign) => ({
    name: campaign.campaign_name,
    status: campaign.status,
    budget: campaign.budget,
    spend: campaign.spend,
    impressions: campaign.impressions,
    clicks: campaign.clicks,
    ctr: campaign.ctr,
    cpc: campaign.cpc,
    cpm: campaign.cpm,
    conversions: campaign.conversions,
    cvr: campaign.cvr,
    cpa: campaign.cpa,
    roas: campaign.roas,
    // TikTok 特有指标
    video_views: campaign.video_views,
    six_second_views: campaign.six_second_views,
    six_second_view_rate: campaign.six_second_view_rate,
    avg_watch_time: campaign.avg_watch_time,
  }));

  const dateRange = response.data.date_range
    ? `${response.data.date_range.start_date} to ${response.data.date_range.end_date}`
    : 'Unknown';

  return {
    platform: 'tiktok',
    data_source: {
      type: source.type,
      screenshot_url: source.type === 'OCR' ? 'screenshot' : undefined,
      ocr_confidence: source.type === 'OCR' ? 0.95 : undefined,
    },
    date_range: dateRange,
    campaigns,
  };
}

/**
 * 解析截图 OCR 数据（复用现有的截图识别功能）
 */
export function parseTikTokScreenshot(
  ocrData: {
    campaign_name?: string;
    snapshot_date?: string;
    spend?: number;
    impressions?: number;
    clicks?: number;
    ctr?: number;
    cpc?: number;
    conversions?: number;
    cvr?: number;
    cpa?: number;
    roas?: number;
    cpm?: number;
    // 视频指标
    video_views?: number;
    six_second_views?: number;
    six_second_view_rate?: number;
    avg_watch_time?: number;
  },
  screenshotUrl?: string
): TikTokParsedData {
  const campaign = {
    name: ocrData.campaign_name || 'Unknown Campaign',
    status: 'Active',
    budget: 0,
    spend: ocrData.spend || 0,
    impressions: ocrData.impressions || 0,
    clicks: ocrData.clicks || 0,
    ctr: ocrData.ctr || 0,
    cpc: ocrData.cpc || 0,
    cpm: ocrData.cpm || 0,
    conversions: ocrData.conversions || 0,
    cvr: ocrData.cvr || 0,
    cpa: ocrData.cpa || 0,
    roas: ocrData.roas || 0,
    // TikTok 特有指标
    video_views: ocrData.video_views,
    six_second_views: ocrData.six_second_views,
    six_second_view_rate: ocrData.six_second_view_rate,
    avg_watch_time: ocrData.avg_watch_time,
  };

  return {
    platform: 'tiktok',
    data_source: {
      type: 'OCR',
      screenshot_url: screenshotUrl,
      ocr_confidence: 0.95,
    },
    date_range: ocrData.snapshot_date || 'Unknown',
    campaigns: [campaign],
  };
}

/**
 * 从手动输入数据创建 TikTokParsedData
 */
export function parseTikTokManualInput(data: {
  campaigns: Array<{
    name: string;
    status?: string;
    budget?: number;
    spend: number;
    impressions?: number;
    clicks?: number;
    ctr?: number;
    cpc?: number;
    cpm?: number;
    conversions?: number;
    cvr?: number;
    cpa?: number;
    roas?: number;
    video_views?: number;
    six_second_views?: number;
    six_second_view_rate?: number;
    avg_watch_time?: number;
  }>;
  date_range?: string;
}): TikTokParsedData {
  const campaigns = data.campaigns.map(c => ({
    name: c.name,
    status: c.status || 'Active',
    budget: c.budget || 0,
    spend: c.spend,
    impressions: c.impressions || 0,
    clicks: c.clicks || 0,
    ctr: c.ctr || 0,
    cpc: c.cpc || 0,
    cpm: c.cpm || 0,
    conversions: c.conversions || 0,
    cvr: c.cvr || 0,
    cpa: c.cpa || 0,
    roas: c.roas || 0,
    video_views: c.video_views,
    six_second_views: c.six_second_views,
    six_second_view_rate: c.six_second_view_rate,
    avg_watch_time: c.avg_watch_time,
  }));

  return {
    platform: 'tiktok',
    data_source: {
      type: 'Manual',
    },
    date_range: data.date_range || 'Unknown',
    campaigns,
  };
}

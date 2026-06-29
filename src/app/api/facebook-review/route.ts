/**
 * Facebook Review API Route
 * 处理 Facebook 广告分析请求
 */

import { NextRequest, NextResponse } from 'next/server';
import { runFacebookAnalysis } from '@/lib/are';
import type { ManualInputData, IndustryType } from '@/lib/are';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const { campaigns, date_range, snapshot_date, industry, locale } = body;
    
    if (!campaigns || !Array.isArray(campaigns) || campaigns.length === 0) {
      return NextResponse.json(
        { error: 'Campaigns data is required' },
        { status: 400 }
      );
    }
    
    // Build input data
    const inputData: ManualInputData = {
      date_range: date_range || 'Last 7 days',
      snapshot_date: snapshot_date,
      campaigns,
    };
    
    // Run analysis
    const report = await runFacebookAnalysis(inputData, {
      industry: (industry as IndustryType) || 'ecommerce',
      locale: locale === 'zh' ? 'zh' : 'en',
    });
    
    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Facebook review error:', error);
    
    return NextResponse.json(
      { 
        error: 'Analysis failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for health check
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Facebook Review API is running',
    version: 'v1',
  });
}

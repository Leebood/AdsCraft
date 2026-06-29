import { NextRequest, NextResponse } from 'next/server';
import PptxGenJS from 'pptxgenjs';
import type { UnifiedReport } from '@/lib/are/report-generator';

/**
 * POST /api/export/ppt
 * Export report to PPT format
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { report, locale = 'en' } = body as { report: UnifiedReport; locale?: 'en' | 'zh' };
    
    if (!report) {
      return NextResponse.json(
        { error: 'Report data is required' },
        { status: 400 }
      );
    }
    
    // Create PPT
    const pptx = new PptxGenJS();
    
    // Set layout
    pptx.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5 inches
    
    // Define colors
    const colors = {
      primary: '00D4FF',
      darkBg: '08111F',
      cardBg: '101827',
      text: 'F8FAFC',
      secondaryText: '94A3B8',
      success: '22C55E',
      warning: 'F59E0B',
      danger: 'EF4444',
      info: '3B82F6',
    };
    
    const platformName = report.platform === 'facebook' ? 'Facebook' : report.platform === 'tiktok' ? 'TikTok' : 'Google';
    
    // ============================================================================
    // Slide 1: Title Slide
    // ============================================================================
    const slide1 = pptx.addSlide();
    slide1.background = { color: colors.darkBg };
    
    // Add gradient accent
    slide1.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: '100%', h: 0.1,
      fill: { color: colors.primary },
    });
    
    // Title
    slide1.addText('AdsCraft', {
      x: 0.5, y: 1.5, w: 12, h: 0.8,
      fontSize: 48, fontFace: 'Arial', bold: true,
      color: colors.primary,
    });
    
    slide1.addText('Diagnosis Report', {
      x: 0.5, y: 2.3, w: 12, h: 0.6,
      fontSize: 32, fontFace: 'Arial',
      color: colors.text,
    });
    
    // Campaign info
    slide1.addText(`${platformName} Ads`, {
      x: 0.5, y: 3.5, w: 12, h: 0.5,
      fontSize: 20, fontFace: 'Arial',
      color: colors.secondaryText,
    });
    
    slide1.addText(report.campaign_name, {
      x: 0.5, y: 4.0, w: 12, h: 0.5,
      fontSize: 24, fontFace: 'Arial', bold: true,
      color: colors.text,
    });
    
    // Date and ID
    slide1.addText([
      { text: `Report ID: ${report.report_id}\n`, options: { fontSize: 12, color: colors.secondaryText } },
      { text: `Generated: ${new Date(report.generated_at).toLocaleDateString()}\n`, options: { fontSize: 12, color: colors.secondaryText } },
      { text: `Date Range: ${report.date_range}`, options: { fontSize: 12, color: colors.secondaryText } },
    ], {
      x: 0.5, y: 5.5, w: 12, h: 1,
      fontFace: 'Arial',
    });
    
    // ============================================================================
    // Slide 2: Overall Score
    // ============================================================================
    const slide2 = pptx.addSlide();
    slide2.background = { color: colors.darkBg };
    
    // Header
    slide2.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: '100%', h: 0.8,
      fill: { color: colors.cardBg },
    });
    
    slide2.addText('Overall Performance', {
      x: 0.5, y: 0.15, w: 12, h: 0.5,
      fontSize: 24, fontFace: 'Arial', bold: true,
      color: colors.text,
    });
    
    // Score circle
    const overallScore = report.scores.overall || 0;
    const scoreColor = overallScore >= 80 ? colors.success : 
                       overallScore >= 60 ? colors.primary : 
                       overallScore >= 40 ? colors.warning : colors.danger;
    
    slide2.addShape(pptx.ShapeType.ellipse, {
      x: 5.5, y: 1.5, w: 2.5, h: 2.5,
      fill: { color: colors.cardBg },
      line: { color: scoreColor, width: 8 },
    });
    
    slide2.addText(`${overallScore}`, {
      x: 5.5, y: 2.0, w: 2.5, h: 1.2,
      fontSize: 60, fontFace: 'Arial', bold: true,
      color: scoreColor, align: 'center', valign: 'middle',
    });
    
    slide2.addText('/100', {
      x: 5.5, y: 3.0, w: 2.5, h: 0.5,
      fontSize: 16, fontFace: 'Arial',
      color: colors.secondaryText, align: 'center',
    });
    
    // Executive Summary
    slide2.addText(report.executive_summary, {
      x: 1, y: 4.5, w: 11, h: 1.5,
      fontSize: 14, fontFace: 'Arial',
      color: colors.secondaryText, align: 'center',
    });
    
    // ============================================================================
    // Slide 3: Dimension Scores
    // ============================================================================
    const slide3 = pptx.addSlide();
    slide3.background = { color: colors.darkBg };
    
    // Header
    slide3.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: '100%', h: 0.8,
      fill: { color: colors.cardBg },
    });
    
    slide3.addText('Dimension Scores', {
      x: 0.5, y: 0.15, w: 12, h: 0.5,
      fontSize: 24, fontFace: 'Arial', bold: true,
      color: colors.text,
    });
    
    // Dimension cards
    const dimensions = [
      { name: 'Performance', score: report.scores.performance || 0, icon: '📊' },
      { name: 'Efficiency', score: report.scores.efficiency || 0, icon: '💰' },
      { name: 'Delivery', score: report.scores.delivery || 0, icon: '📈' },
      { name: 'Risk', score: report.scores.risk || 0, icon: '⭐' },
    ].filter(d => d.score > 0);
    
    const cardWidth = 2.8;
    const cardHeight = 3.5;
    const startX = (13.33 - (dimensions.length * cardWidth + (dimensions.length - 1) * 0.3)) / 2;
    
    dimensions.forEach((dim, index) => {
      const x = startX + index * (cardWidth + 0.3);
      const y = 1.5;
      
      const dimScoreColor = dim.score >= 80 ? colors.success : 
                            dim.score >= 60 ? colors.primary : 
                            dim.score >= 40 ? colors.warning : colors.danger;
      
      // Card background
      slide3.addShape(pptx.ShapeType.roundRect, {
        x, y, w: cardWidth, h: cardHeight,
        fill: { color: colors.cardBg },
        line: { color: 'FFFFFF', width: 0.5, transparency: 90 },
        rectRadius: 0.1,
      });
      
      // Icon
      slide3.addText(dim.icon, {
        x, y: y + 0.3, w: cardWidth, h: 0.5,
        fontSize: 24, align: 'center',
      });
      
      // Dimension name
      slide3.addText(dim.name, {
        x, y: y + 0.9, w: cardWidth, h: 0.4,
        fontSize: 14, fontFace: 'Arial', bold: true,
        color: colors.text, align: 'center',
      });
      
      // Score
      slide3.addText(`${dim.score}`, {
        x, y: y + 1.5, w: cardWidth, h: 0.8,
        fontSize: 36, fontFace: 'Arial', bold: true,
        color: dimScoreColor, align: 'center',
      });
      
      // Progress bar background
      slide3.addShape(pptx.ShapeType.roundRect, {
        x: x + 0.3, y: y + 2.5, w: cardWidth - 0.6, h: 0.2,
        fill: { color: 'FFFFFF', transparency: 90 },
        rectRadius: 0.1,
      });
      
      // Progress bar fill
      slide3.addShape(pptx.ShapeType.roundRect, {
        x: x + 0.3, y: y + 2.5, w: (cardWidth - 0.6) * (dim.score / 100), h: 0.2,
        fill: { color: dimScoreColor },
        rectRadius: 0.1,
      });
      
      // Status text
      const statusText = dim.score >= 80 ? 'Excellent' : 
                         dim.score >= 60 ? 'Good' : 
                         dim.score >= 40 ? 'Needs Work' : 'Critical';
      
      slide3.addText(statusText, {
        x, y: y + 2.9, w: cardWidth, h: 0.3,
        fontSize: 10, fontFace: 'Arial',
        color: dimScoreColor, align: 'center',
      });
    });
    
    // ============================================================================
    // Slide 4: Key Findings
    // ============================================================================
    const slide4 = pptx.addSlide();
    slide4.background = { color: colors.darkBg };
    
    // Header
    slide4.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: '100%', h: 0.8,
      fill: { color: colors.cardBg },
    });
    
    slide4.addText('Key Findings', {
      x: 0.5, y: 0.15, w: 12, h: 0.5,
      fontSize: 24, fontFace: 'Arial', bold: true,
      color: colors.text,
    });
    
    // Findings
    const findingsY = 1.2;
    report.key_findings.slice(0, 5).forEach((finding, index) => {
      const y = findingsY + index * 1.1;
      
      const borderColor = finding.severity === 'critical' ? colors.danger : 
                          finding.severity === 'warning' ? colors.warning : 
                          finding.severity === 'good' ? colors.success : colors.primary;
      
      // Finding card
      slide4.addShape(pptx.ShapeType.roundRect, {
        x: 0.5, y, w: 12.33, h: 0.9,
        fill: { color: colors.cardBg },
        line: { color: borderColor, width: 2 },
        rectRadius: 0.05,
      });
      
      // Left accent
      slide4.addShape(pptx.ShapeType.rect, {
        x: 0.5, y, w: 0.08, h: 0.9,
        fill: { color: borderColor },
      });
      
      // Title
      slide4.addText(finding.title, {
        x: 0.8, y: y + 0.1, w: 11, h: 0.3,
        fontSize: 14, fontFace: 'Arial', bold: true,
        color: colors.text,
      });
      
      // Description
      slide4.addText(finding.description, {
        x: 0.8, y: y + 0.45, w: 11, h: 0.35,
        fontSize: 11, fontFace: 'Arial',
        color: colors.secondaryText,
      });
    });
    
    // ============================================================================
    // Slide 5: Action Plan
    // ============================================================================
    const slide5 = pptx.addSlide();
    slide5.background = { color: colors.darkBg };
    
    // Header
    slide5.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: '100%', h: 0.8,
      fill: { color: colors.cardBg },
    });
    
    slide5.addText('Recommended Actions', {
      x: 0.5, y: 0.15, w: 12, h: 0.5,
      fontSize: 24, fontFace: 'Arial', bold: true,
      color: colors.text,
    });
    
    // Action items
    const actionsY = 1.2;
    report.action_plan.slice(0, 6).forEach((action, index) => {
      const y = actionsY + index * 0.9;
      
      const priorityColor = action.priority === 'P0' ? colors.danger : 
                            action.priority === 'P1' ? colors.warning : colors.primary;
      
      // Priority badge
      slide5.addShape(pptx.ShapeType.roundRect, {
        x: 0.5, y: y + 0.1, w: 0.6, h: 0.3,
        fill: { color: priorityColor },
        rectRadius: 0.05,
      });
      
      slide5.addText(action.priority, {
        x: 0.5, y: y + 0.1, w: 0.6, h: 0.3,
        fontSize: 10, fontFace: 'Arial', bold: true,
        color: colors.darkBg, align: 'center', valign: 'middle',
      });
      
      // Action text
      slide5.addText(action.action, {
        x: 1.3, y: y + 0.05, w: 10, h: 0.35,
        fontSize: 13, fontFace: 'Arial', bold: true,
        color: colors.text,
      });
      
      // Expected impact
      slide5.addText(`Expected Impact: ${action.expected_impact}`, {
        x: 1.3, y: y + 0.4, w: 10, h: 0.3,
        fontSize: 10, fontFace: 'Arial',
        color: colors.secondaryText,
      });
      
      // Timeline
      slide5.addText(action.timeline, {
        x: 10.5, y: y + 0.1, w: 2.5, h: 0.3,
        fontSize: 10, fontFace: 'Arial', italic: true,
        color: colors.secondaryText, align: 'right',
      });
    });
    
    // ============================================================================
    // Slide 6: Thank You / Contact
    // ============================================================================
    const slide6 = pptx.addSlide();
    slide6.background = { color: colors.darkBg };
    
    slide6.addText('Thank You', {
      x: 0, y: 2.5, w: 13.33, h: 1,
      fontSize: 48, fontFace: 'Arial', bold: true,
      color: colors.primary, align: 'center',
    });
    
    slide6.addText('Generated by AdsCraft', {
      x: 0, y: 3.8, w: 13.33, h: 0.5,
      fontSize: 16, fontFace: 'Arial',
      color: colors.secondaryText, align: 'center',
    });
    
    slide6.addText(`Report ID: ${report.report_id}`, {
      x: 0, y: 4.5, w: 13.33, h: 0.4,
      fontSize: 12, fontFace: 'Arial',
      color: colors.secondaryText, align: 'center',
    });
    
    // Generate PPT buffer
    const pptBuffer = await pptx.write({ outputType: 'arraybuffer' });
    
    return new NextResponse(pptBuffer as ArrayBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="adscraft-report-${report.report_id}.pptx"`,
      },
    });
    
  } catch (error) {
    console.error('PPT export error:', error);
    return NextResponse.json(
      { error: 'PPT export failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

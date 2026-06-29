import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import type { UnifiedReport } from '@/lib/are/report-generator';

/**
 * POST /api/export/pdf
 * Export report to PDF format
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
    
    // Create PDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let yPos = margin;
    
    // Colors
    const primaryColor = [0, 212, 255] as const; // #00D4FF
    const darkBg = [8, 17, 31] as const; // #08111F
    const textColor = [15, 23, 42] as const; // #0F172A
    const secondaryText = [100, 116, 139] as const; // #64748B
    const successColor = [34, 197, 94] as const; // #22C55E
    const warningColor = [245, 158, 11] as const; // #F59E0B
    const dangerColor = [239, 68, 68] as const; // #EF4444
    
    // Helper functions
    const addText = (text: string, x: number, y: number, options: { fontSize?: number; fontStyle?: string; color?: readonly number[]; maxWidth?: number } = {}) => {
      const { fontSize = 12, fontStyle = 'normal', color = textColor, maxWidth } = options;
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', fontStyle);
      doc.setTextColor(color[0], color[1], color[2]);
      
      if (maxWidth) {
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return lines.length * (fontSize * 0.35);
      } else {
        doc.text(text, x, y);
        return fontSize * 0.35;
      }
    };
    
    const addNewPageIfNeeded = (requiredSpace: number) => {
      if (yPos + requiredSpace > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
        return true;
      }
      return false;
    };
    
    // ============================================================================
    // Page 1: Cover Page
    // ============================================================================
    
    // Header bar
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 8, 'F');
    
    // Logo / Brand
    yPos = 30;
    addText('AdsCraft', margin, yPos, { fontSize: 24, fontStyle: 'bold', color: primaryColor });
    yPos += 10;
    addText('Campaign Review Report', margin, yPos, { fontSize: 14, color: secondaryText });
    
    // Platform info
    yPos += 20;
    const platformName = report.platform === 'facebook' ? 'Facebook Ads' : 
                         report.platform === 'tiktok' ? 'TikTok Ads' : 'Google Ads';
    addText(platformName, margin, yPos, { fontSize: 18, fontStyle: 'bold', color: textColor });
    
    // Date
    yPos += 10;
    const date = new Date(report.generated_at).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    addText(`Generated: ${date}`, margin, yPos, { fontSize: 10, color: secondaryText });
    
    // Overall Score Box
    yPos += 20;
    addNewPageIfNeeded(60);
    
    doc.setFillColor(darkBg[0], darkBg[1], darkBg[2]);
    doc.roundedRect(margin, yPos, contentWidth, 50, 3, 3, 'F');
    
    // Score
    const scoreColor = report.scores.overall >= 80 ? successColor :
                       report.scores.overall >= 60 ? warningColor : dangerColor;
    
    addText('Overall Score', margin + 10, yPos + 15, { fontSize: 12, color: secondaryText });
    addText(`${report.scores.overall}`, margin + 10, yPos + 35, { fontSize: 36, fontStyle: 'bold', color: scoreColor });
    addText('/ 100', margin + 35, yPos + 35, { fontSize: 14, color: secondaryText });
    
    // Score breakdown on the right
    const dimensions = [
      { key: 'compliance', label: 'Compliance' },
      { key: 'campaign_strategy', label: 'Strategy' },
      { key: 'creative', label: 'Creative' },
      { key: 'landing_page', label: 'Landing Page' },
      { key: 'tracking', label: 'Tracking' },
    ];
    
    let dimY = yPos + 10;
    for (const dim of dimensions) {
      const score = report.scores[dim.key as keyof typeof report.scores];
      const dimColor = score >= 80 ? successColor : score >= 60 ? warningColor : dangerColor;
      
      addText(dim.label, pageWidth - margin - 60, dimY, { fontSize: 9, color: secondaryText });
      addText(`${score}`, pageWidth - margin - 15, dimY, { fontSize: 12, fontStyle: 'bold', color: dimColor });
      dimY += 8;
    }
    
    yPos += 60;
    
    // ============================================================================
    // Page 2: Executive Summary
    // ============================================================================
    doc.addPage();
    yPos = margin;
    
    // Section header
    addText('Executive Summary', margin, yPos, { fontSize: 18, fontStyle: 'bold', color: textColor });
    yPos += 10;
    
    // Divider
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, margin + 40, yPos);
    yPos += 10;
    
    // Summary text
    const summaryHeight = addText(report.executive_summary, margin, yPos, { 
      fontSize: 11, 
      color: textColor,
      maxWidth: contentWidth 
    });
    yPos += summaryHeight + 15;
    
    // ============================================================================
    // Key Findings Section
    // ============================================================================
    addNewPageIfNeeded(40);
    addText('Key Findings', margin, yPos, { fontSize: 16, fontStyle: 'bold', color: textColor });
    yPos += 10;
    
    for (const finding of report.key_findings) {
      addNewPageIfNeeded(20);
      
      // Severity indicator
      const severityColor = finding.severity === 'critical' ? dangerColor :
                            finding.severity === 'warning' ? warningColor : 
                            finding.severity === 'good' ? successColor : [59, 130, 246] as const; // info = blue
      
      doc.setFillColor(severityColor[0], severityColor[1], severityColor[2]);
      doc.circle(margin + 3, yPos + 2, 2, 'F');
      
      // Finding title
      addText(finding.title, margin + 10, yPos, { fontSize: 11, fontStyle: 'bold', color: textColor });
      yPos += 6;
      
      // Finding description
      const descHeight = addText(finding.description, margin + 10, yPos, { 
        fontSize: 9, 
        color: secondaryText,
        maxWidth: contentWidth - 10 
      });
      yPos += descHeight + 8;
    }
    
    // ============================================================================
    // Page 3: Action Plan
    // ============================================================================
    doc.addPage();
    yPos = margin;
    
    addText('Action Plan', margin, yPos, { fontSize: 18, fontStyle: 'bold', color: textColor });
    yPos += 10;
    
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, margin + 40, yPos);
    yPos += 15;
    
    for (let i = 0; i < report.action_plan.length; i++) {
      const action = report.action_plan[i];
      addNewPageIfNeeded(30);
      
      // Action number
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.circle(margin + 4, yPos + 2, 4, 'F');
      addText(`${i + 1}`, margin + 2.5, yPos + 3.5, { fontSize: 8, fontStyle: 'bold', color: [255, 255, 255] });
      
      // Priority badge
      const priorityColor = action.priority === 'P0' ? dangerColor :
                            action.priority === 'P1' ? warningColor : successColor;
      const priorityLabel = action.priority;
      
      doc.setFillColor(priorityColor[0], priorityColor[1], priorityColor[2]);
      doc.roundedRect(margin + 12, yPos, 12, 5, 1, 1, 'F');
      addText(priorityLabel, margin + 14, yPos + 3.5, { fontSize: 7, fontStyle: 'bold', color: [255, 255, 255] });
      
      // Action text
      yPos += 8;
      const actionHeight = addText(action.action, margin + 12, yPos, { 
        fontSize: 11, 
        color: textColor,
        maxWidth: contentWidth - 12 
      });
      yPos += actionHeight + 5;
      
      // Expected impact
      if (action.expected_impact) {
        addText(`Expected Impact: ${action.expected_impact}`, margin + 12, yPos, { 
          fontSize: 8, 
          fontStyle: 'italic',
          color: primaryColor,
          maxWidth: contentWidth - 12 
        });
        yPos += 6;
      }
      
      // Timeline
      if (action.timeline) {
        addText(`Timeline: ${action.timeline}`, margin + 12, yPos, { 
          fontSize: 8, 
          color: secondaryText,
          maxWidth: contentWidth - 12 
        });
        yPos += 6;
      }
      
      yPos += 8;
    }
    
    // ============================================================================
    // Footer on all pages
    // ============================================================================
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Footer line
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.2);
      doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
      
      // Footer text
      addText(`Page ${i} of ${pageCount}`, margin, pageHeight - 10, { 
        fontSize: 8, 
        color: secondaryText 
      });
      
      addText('AdsCraft - Campaign Review Platform', pageWidth - margin - 60, pageHeight - 10, { 
        fontSize: 8, 
        color: secondaryText 
      });
      
      addText(`Generated: ${date}`, pageWidth / 2 - 25, pageHeight - 10, { 
        fontSize: 8, 
        color: secondaryText 
      });
    }
    
    // Generate PDF buffer
    const pdfBuffer = doc.output('arraybuffer');
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="adscraft-report-${report.platform}-${Date.now()}.pdf"`,
      },
    });
    
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'PDF generation failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

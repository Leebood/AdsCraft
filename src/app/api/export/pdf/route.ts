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
        return lines.length * fontSize * 0.35;
      }
      doc.text(text, x, y);
      return fontSize * 0.35;
    };
    
    const checkPageBreak = (requiredSpace: number) => {
      if (yPos + requiredSpace > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
      }
    };
    
    // Header
    doc.setFillColor(darkBg[0], darkBg[1], darkBg[2]);
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    // Header gradient accent
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 48, pageWidth, 2, 'F');
    
    // Title
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('AdsCraft Diagnosis Report', margin, 25);
    
    // Subtitle
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    const platformName = report.platform === 'facebook' ? 'Facebook' : report.platform === 'tiktok' ? 'TikTok' : 'Google';
    doc.text(`${platformName} Ads - ${report.campaign_name}`, margin, 38);
    
    yPos = 60;
    
    // Report info
    doc.setFontSize(10);
    doc.setTextColor(secondaryText[0], secondaryText[1], secondaryText[2]);
    doc.text(`Report ID: ${report.report_id}`, margin, yPos);
    doc.text(`Generated: ${new Date(report.generated_at).toLocaleDateString()}`, margin + 80, yPos);
    doc.text(`Date Range: ${report.date_range}`, margin + 140, yPos);
    
    yPos += 15;
    
    // Overall Score Section
    checkPageBreak(50);
    
    // Score box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, yPos, contentWidth, 40, 3, 3, 'F');
    
    // Score value
    const scoreColor = (report.scores.overall || 0) >= 80 ? successColor : 
                       (report.scores.overall || 0) >= 60 ? primaryColor : 
                       (report.scores.overall || 0) >= 40 ? warningColor : dangerColor;
    
    doc.setFontSize(36);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.text(`${report.scores.overall || 0}`, pageWidth / 2, yPos + 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(secondaryText[0], secondaryText[1], secondaryText[2]);
    doc.text('Overall Score', pageWidth / 2, yPos + 30, { align: 'center' });
    
    yPos += 50;
    
    // Dimension Scores
    checkPageBreak(30);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text('Dimension Scores', margin, yPos);
    yPos += 8;
    
    // Draw score bars
    const dimensions = [
      { name: 'Performance', score: report.scores.performance || 0 },
      { name: 'Efficiency', score: report.scores.efficiency || 0 },
      { name: 'Delivery', score: report.scores.delivery || 0 },
      { name: 'Risk', score: report.scores.risk || 0 },
    ].filter(d => d.score > 0);
    
    for (const dim of dimensions) {
      checkPageBreak(15);
      
      // Label
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text(dim.name, margin, yPos + 4);
      
      // Bar background
      doc.setFillColor(226, 232, 240);
      doc.roundedRect(margin + 40, yPos, 100, 8, 2, 2, 'F');
      
      // Bar fill
      const barColor = dim.score >= 80 ? successColor : 
                       dim.score >= 60 ? primaryColor : 
                       dim.score >= 40 ? warningColor : dangerColor;
      doc.setFillColor(barColor[0], barColor[1], barColor[2]);
      doc.roundedRect(margin + 40, yPos, dim.score, 8, 2, 2, 'F');
      
      // Score text
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text(`${dim.score}`, margin + 145, yPos + 6);
      
      yPos += 15;
    }
    
    yPos += 10;
    
    // Executive Summary
    checkPageBreak(40);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text('Executive Summary', margin, yPos);
    yPos += 8;
    
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, margin + 40, yPos);
    yPos += 8;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    const summaryLines = doc.splitTextToSize(report.executive_summary, contentWidth);
    doc.text(summaryLines, margin, yPos);
    yPos += summaryLines.length * 5 + 10;
    
    // Key Findings
    checkPageBreak(30);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Key Findings', margin, yPos);
    yPos += 8;
    
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.line(margin, yPos, margin + 40, yPos);
    yPos += 10;
    
    for (const finding of report.key_findings) {
      checkPageBreak(25);
      
      // Finding box
      const borderColor = finding.severity === 'critical' ? dangerColor : 
                          finding.severity === 'warning' ? warningColor : 
                          finding.severity === 'good' ? successColor : primaryColor;
      
      doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
      doc.setLineWidth(1);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, yPos, contentWidth, 20, 2, 2, 'FD');
      
      // Accent bar
      doc.setFillColor(borderColor[0], borderColor[1], borderColor[2]);
      doc.rect(margin, yPos, 3, 20, 'F');
      
      // Title
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text(finding.title, margin + 8, yPos + 7);
      
      // Description
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(secondaryText[0], secondaryText[1], secondaryText[2]);
      const descLines = doc.splitTextToSize(finding.description, contentWidth - 16);
      doc.text(descLines.slice(0, 2), margin + 8, yPos + 14);
      
      yPos += 25;
    }
    
    yPos += 5;
    
    // Action Plan
    checkPageBreak(30);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text('Recommended Actions', margin, yPos);
    yPos += 8;
    
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.line(margin, yPos, margin + 40, yPos);
    yPos += 10;
    
    for (const action of report.action_plan.slice(0, 5)) {
      checkPageBreak(20);
      
      // Priority badge
      const priorityColor = action.priority === 'P0' ? dangerColor : 
                            action.priority === 'P1' ? warningColor : primaryColor;
      
      doc.setFillColor(priorityColor[0], priorityColor[1], priorityColor[2]);
      doc.roundedRect(margin, yPos, 12, 6, 1, 1, 'F');
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(action.priority, margin + 6, yPos + 4, { align: 'center' });
      
      // Action text
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      const actionLines = doc.splitTextToSize(action.action, contentWidth - 20);
      doc.text(actionLines[0], margin + 16, yPos + 4);
      
      // Expected impact
      doc.setFontSize(9);
      doc.setTextColor(secondaryText[0], secondaryText[1], secondaryText[2]);
      doc.text(`Expected: ${action.expected_impact}`, margin + 16, yPos + 10);
      
      yPos += 18;
    }
    
    // Footer
    const footerY = pageHeight - 15;
    doc.setFillColor(248, 250, 252);
    doc.rect(0, footerY - 5, pageWidth, 20, 'F');
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(secondaryText[0], secondaryText[1], secondaryText[2]);
    doc.text(`Generated by AdsCraft | Report ID: ${report.report_id}`, margin, footerY);
    doc.text(`Page ${doc.getNumberOfPages()}`, pageWidth - margin, footerY, { align: 'right' });
    
    // Get PDF as buffer
    const pdfBuffer = doc.output('arraybuffer');
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="adscraft-report-${report.report_id}.pdf"`,
      },
    });
    
  } catch (error) {
    console.error('PDF export error:', error);
    return NextResponse.json(
      { error: 'PDF export failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

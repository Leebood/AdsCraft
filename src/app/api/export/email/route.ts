import { NextRequest, NextResponse } from 'next/server';
import { generateEmailContent } from '@/lib/are/report-generator';
import type { UnifiedReport } from '@/lib/are/report-generator';

/**
 * POST /api/export/email
 * Generate email content for report
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { report, locale = 'en', options = {} } = body as { 
      report: UnifiedReport; 
      locale?: 'en' | 'zh';
      options?: {
        include_executive_summary?: boolean;
        include_evidence?: boolean;
        include_action_plan?: boolean;
        branding?: {
          logo_url?: string;
          company_name?: string;
          primary_color?: string;
        };
      };
    };
    
    if (!report) {
      return NextResponse.json(
        { error: 'Report data is required' },
        { status: 400 }
      );
    }
    
    // Generate email content
    const emailContent = generateEmailContent(report, {
      format: 'email',
      locale,
      ...options,
    });
    
    return NextResponse.json({
      success: true,
      data: {
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
        // For mailto link
        mailto_link: generateMailtoLink(emailContent.subject, emailContent.text),
      },
    });
    
  } catch (error) {
    console.error('Email generation error:', error);
    return NextResponse.json(
      { error: 'Email generation failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Generate mailto link
 */
function generateMailtoLink(subject: string, body: string): string {
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);
  return `mailto:?subject=${encodedSubject}&body=${encodedBody}`;
}

/**
 * POST /api/export/email/send
 * Send report email (requires email service integration)
 */
export async function POST_SEND(request: NextRequest) {
  try {
    const body = await request.json();
    const { report, recipient_email, locale = 'en', options = {} } = body as { 
      report: UnifiedReport; 
      recipient_email: string;
      locale?: 'en' | 'zh';
      options?: Record<string, unknown>;
    };
    
    if (!report || !recipient_email) {
      return NextResponse.json(
        { error: 'Report data and recipient email are required' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipient_email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Generate email content
    const emailContent = generateEmailContent(report, {
      format: 'email',
      locale,
      ...options,
    });
    
    // Note: Actual email sending requires integration with an email service
    // (e.g., SendGrid, AWS SES, Mailgun, etc.)
    // For now, return the email content for client-side handling
    
    return NextResponse.json({
      success: true,
      data: {
        message: 'Email content generated successfully. Please integrate with an email service to send.',
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
        recipient: recipient_email,
      },
    });
    
  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json(
      { error: 'Email send failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

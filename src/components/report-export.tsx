'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, Presentation, Mail, Loader2, CheckCircle } from 'lucide-react';
import type { UnifiedReport } from '@/lib/are/report-generator';

interface ReportExportProps {
  report: UnifiedReport;
  locale?: 'en' | 'zh';
}

const translations = {
  en: {
    exportReport: 'Export Report',
    downloadPDF: 'Download PDF',
    downloadPPT: 'Download PPT',
    sendEmail: 'Send via Email',
    copying: 'Copying...',
    copied: 'Copied!',
    copyEmail: 'Copy Email Content',
    emailSubject: 'Email Subject',
    generating: 'Generating...',
    exportFailed: 'Export failed',
  },
  zh: {
    exportReport: '导出报告',
    downloadPDF: '下载 PDF',
    downloadPPT: '下载 PPT',
    sendEmail: '通过邮件发送',
    copying: '复制中...',
    copied: '已复制！',
    copyEmail: '复制邮件内容',
    emailSubject: '邮件主题',
    generating: '生成中...',
    exportFailed: '导出失败',
  },
};

export function ReportExport({ report, locale = 'en' }: ReportExportProps) {
  const t = translations[locale];
  
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingPPT, setIsExportingPPT] = useState(false);
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [emailContent, setEmailContent] = useState<{ subject: string; text: string; mailto_link: string } | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Export to PDF
  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      const response = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report, locale }),
      });
      
      if (!response.ok) {
        throw new Error('PDF export failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `adscraft-report-${report.report_id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('PDF export error:', error);
      alert(t.exportFailed);
    } finally {
      setIsExportingPDF(false);
    }
  };
  
  // Export to PPT
  const handleExportPPT = async () => {
    setIsExportingPPT(true);
    try {
      const response = await fetch('/api/export/ppt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report, locale }),
      });
      
      if (!response.ok) {
        throw new Error('PPT export failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `adscraft-report-${report.report_id}.pptx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('PPT export error:', error);
      alert(t.exportFailed);
    } finally {
      setIsExportingPPT(false);
    }
  };
  
  // Generate email content
  const handleGenerateEmail = async () => {
    setIsGeneratingEmail(true);
    try {
      const response = await fetch('/api/export/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report, locale }),
      });
      
      if (!response.ok) {
        throw new Error('Email generation failed');
      }
      
      const data = await response.json();
      setEmailContent(data.data);
    } catch (error) {
      console.error('Email generation error:', error);
      alert(t.exportFailed);
    } finally {
      setIsGeneratingEmail(false);
    }
  };
  
  // Copy email content to clipboard
  const handleCopyEmail = async () => {
    if (!emailContent) return;
    
    try {
      await navigator.clipboard.writeText(emailContent.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };
  
  return (
    <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Download className="h-5 w-5 text-blue-400" />
        {t.exportReport}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* PDF Export */}
        <Button
          onClick={handleExportPDF}
          disabled={isExportingPDF}
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
        >
          {isExportingPDF ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t.generating}
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 mr-2" />
              {t.downloadPDF}
            </>
          )}
        </Button>
        
        {/* PPT Export */}
        <Button
          onClick={handleExportPPT}
          disabled={isExportingPPT}
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
        >
          {isExportingPPT ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t.generating}
            </>
          ) : (
            <>
              <Presentation className="h-4 w-4 mr-2" />
              {t.downloadPPT}
            </>
          )}
        </Button>
        
        {/* Email Export */}
        <Button
          onClick={handleGenerateEmail}
          disabled={isGeneratingEmail}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
        >
          {isGeneratingEmail ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t.generating}
            </>
          ) : (
            <>
              <Mail className="h-4 w-4 mr-2" />
              {t.sendEmail}
            </>
          )}
        </Button>
      </div>
      
      {/* Email Content Preview */}
      {emailContent && (
        <div className="mt-6 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-white">{t.emailSubject}</h4>
            <div className="flex gap-2">
              <Button
                onClick={handleCopyEmail}
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                {copied ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1 text-green-400" />
                    {t.copied}
                  </>
                ) : (
                  t.copyEmail
                )}
              </Button>
              <a
                href={emailContent.mailto_link}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Mail className="h-3 w-3 mr-1" />
                {t.sendEmail}
              </a>
            </div>
          </div>
          <p className="text-sm text-white mb-2">{emailContent.subject}</p>
          <pre className="text-xs text-slate-400 whitespace-pre-wrap max-h-40 overflow-y-auto">
            {emailContent.text}
          </pre>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, Presentation, Mail, Loader2, CheckCircle, ChevronDown } from 'lucide-react';
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
  
  const [isOpen, setIsOpen] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingPPT, setIsExportingPPT] = useState(false);
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [emailContent, setEmailContent] = useState<{ subject: string; text: string; mailto_link: string } | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Export to PDF
  const handleExportPDF = async () => {
    setIsOpen(false);
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
    setIsOpen(false);
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
    setIsOpen(false);
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
      setEmailContent(data);
    } catch (error) {
      console.error('Email generation error:', error);
      alert(t.exportFailed);
    } finally {
      setIsGeneratingEmail(false);
    }
  };
  
  // Copy email content
  const handleCopyEmail = async () => {
    if (!emailContent) return;
    
    const text = `Subject: ${emailContent.subject}\n\n${emailContent.text}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const isLoading = isExportingPDF || isExportingPPT || isGeneratingEmail;
  
  return (
    <div className="bg-[#101827] border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Download className="h-5 w-5 text-blue-400" />
          {t.exportReport}
        </h3>
        
        <div className="relative">
          <Button
            onClick={() => setIsOpen(!isOpen)}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t.generating}
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                {t.exportReport}
                <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </>
            )}
          </Button>
          
          {/* Dropdown Menu */}
          {isOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-[#1E293B] border border-white/10 rounded-lg shadow-xl z-20">
                <button
                  onClick={handleExportPDF}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-white hover:bg-white/5 transition-colors rounded-t-lg"
                >
                  <FileText className="h-5 w-5 text-red-400" />
                  <div>
                    <div className="font-medium">{t.downloadPDF}</div>
                    <div className="text-xs text-slate-400">Professional PDF format</div>
                  </div>
                </button>
                <div className="border-t border-white/5" />
                <button
                  onClick={handleExportPPT}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-white hover:bg-white/5 transition-colors"
                >
                  <Presentation className="h-5 w-5 text-orange-400" />
                  <div>
                    <div className="font-medium">{t.downloadPPT}</div>
                    <div className="text-xs text-slate-400">Presentation slides</div>
                  </div>
                </button>
                <div className="border-t border-white/5" />
                <button
                  onClick={handleGenerateEmail}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-white hover:bg-white/5 transition-colors rounded-b-lg"
                >
                  <Mail className="h-5 w-5 text-blue-400" />
                  <div>
                    <div className="font-medium">{t.sendEmail}</div>
                    <div className="text-xs text-slate-400">Generate email content</div>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
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

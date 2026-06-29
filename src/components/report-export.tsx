'use client';

import { useState } from 'react';
import { FileText, Presentation, Download, Loader2, ChevronDown } from 'lucide-react';
import type { UnifiedReport } from '@/lib/are/report-generator';

interface ReportExportProps {
  report: UnifiedReport;
  locale?: 'en' | 'zh';
}

export function ReportExport({ report, locale = 'en' }: ReportExportProps) {
  const [isExporting, setIsExporting] = useState<'pdf' | 'ppt' | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleExportPDF = async () => {
    setIsOpen(false);
    setIsExporting('pdf');
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
      a.download = `adscraft-report-${report.platform}-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('PDF export error:', error);
      alert(locale === 'zh' ? 'PDF 导出失败' : 'PDF export failed');
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportPPT = async () => {
    setIsOpen(false);
    setIsExporting('ppt');
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
      a.download = `adscraft-report-${report.platform}-${Date.now()}.pptx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('PPT export error:', error);
      alert(locale === 'zh' ? 'PPT 导出失败' : 'PPT export failed');
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="bg-gradient-to-r from-slate-900/50 to-slate-800/50 border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Download className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {locale === 'zh' ? '导出报告' : 'Export Report'}
            </h3>
            <p className="text-sm text-slate-400">
              {locale === 'zh' 
                ? '下载 PDF 或 PPT 格式的报告' 
                : 'Download your report in PDF or PPT format'}
            </p>
          </div>
        </div>
        
        {/* Export Button with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            disabled={isExporting !== null}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {locale === 'zh' ? '导出中...' : 'Exporting...'}
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                {locale === 'zh' ? '导出报告' : 'Export Report'}
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </>
            )}
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-white/10 rounded-lg shadow-xl z-20 overflow-hidden">
                <button
                  onClick={handleExportPDF}
                  disabled={isExporting !== null}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left disabled:opacity-50"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-red-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">
                      {locale === 'zh' ? '下载 PDF' : 'Download PDF'}
                    </div>
                    <div className="text-xs text-slate-400">
                      {locale === 'zh' ? '适合打印和分享' : 'Best for printing and sharing'}
                    </div>
                  </div>
                </button>
                
                <div className="border-t border-white/5" />
                
                <button
                  onClick={handleExportPPT}
                  disabled={isExporting !== null}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left disabled:opacity-50"
                >
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                    <Presentation className="w-4 h-4 text-orange-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">
                      {locale === 'zh' ? '下载 PPT' : 'Download PPT'}
                    </div>
                    <div className="text-xs text-slate-400">
                      {locale === 'zh' ? '适合演示和汇报' : 'Best for presentations'}
                    </div>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

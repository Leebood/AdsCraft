'use client';

/**
 * Facebook Review Report Page
 * 展示 Facebook 广告分析报告
 */

import { useState, useEffect } from 'react';
import { FacebookReport } from '@/components/facebook-report';
import type { AOSReport, ManualInputData } from '@/lib/are';

// Sample data for testing
const SAMPLE_DATA: ManualInputData = {
  date_range: 'Last 7 days',
  snapshot_date: '2026-06-30',
  campaigns: [
    {
      name: 'Summer Sale 2026',
      delivery: 'Active',
      budget: 100.00,
      spent: 342.18,
      results: 89,
      cpr: 3.84,
      impressions: 89234,
      reach: 75621,
      ctr: 2.34,
      cpc: 1.52,
      frequency: 1.18,
      roas: 3.2,
      cpm: 12.50,
    },
    {
      name: 'Brand Awareness',
      delivery: 'Active',
      budget: 50.00,
      spent: 156.42,
      results: 12,
      cpr: 13.03,
      impressions: 45678,
      reach: 38912,
      ctr: 0.87,
      cpc: 3.84,
      frequency: 2.3,
      roas: 1.2,
      cpm: 15.20,
    },
    {
      name: 'Retargeting - Cart Abandoners',
      delivery: 'Active',
      budget: 30.00,
      spent: 89.50,
      results: 45,
      cpr: 1.99,
      impressions: 23456,
      reach: 18923,
      ctr: 1.95,
      cpc: 1.25,
      frequency: 1.24,
      roas: 4.5,
      cpm: 9.80,
    },
  ],
};

export default function FacebookReviewPage() {
  const [report, setReport] = useState<AOSReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locale, setLocale] = useState<'en' | 'zh'>('en');
  
  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/facebook-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...SAMPLE_DATA,
          locale,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Analysis failed');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setReport(result.data);
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };
  
  // Run analysis on mount
  useEffect(() => {
    runAnalysis();
  }, []);
  
  return (
    <div className="min-h-screen bg-[#08111F] text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-[#00D4FF]">AdsCraft</h1>
            <span className="text-slate-400">|</span>
            <h2 className="text-lg text-white">Facebook Review Report</h2>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Language Toggle */}
            <button
              onClick={() => setLocale(locale === 'en' ? 'zh' : 'en')}
              className="px-3 py-1.5 text-sm border border-white/20 rounded-lg hover:bg-white/5 transition-colors"
            >
              {locale === 'en' ? '中文' : 'English'}
            </button>
            
            {/* Re-run Analysis */}
            <button
              onClick={runAnalysis}
              disabled={loading}
              className="px-4 py-1.5 text-sm bg-[#00D4FF] text-[#08111F] font-medium rounded-lg hover:bg-[#35E1FF] transition-colors disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : 'Re-analyze'}
            </button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading && (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[#00D4FF] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-slate-400 mt-4">Analyzing campaign data...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
            <p className="text-red-400 text-lg font-medium">Analysis Failed</p>
            <p className="text-slate-400 mt-2">{error}</p>
            <button
              onClick={runAnalysis}
              className="mt-4 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors"
            >
              Retry
            </button>
          </div>
        )}
        
        {report && !loading && (
          <FacebookReport report={report} locale={locale} />
        )}
      </main>
      
      {/* Footer */}
      <footer className="border-t border-white/10 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-slate-500 text-sm">
          <p>Powered by AdsCraft Review Engine v1 | ARS v1</p>
          <p className="mt-1">All diagnoses are backed by evidence. Scores are calculated by rules, not AI.</p>
        </div>
      </footer>
    </div>
  );
}

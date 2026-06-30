'use client';

/**
 * Facebook Review Report Page
 * Facebook 广告截图分析和报告展示
 * 
 * 流程：Upload → Preview → Result
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, AlertCircle, X, CheckCircle2, ArrowLeft } from 'lucide-react';
import { FacebookReport } from '@/components/facebook-report';
import { ReportExport } from '@/components/report-export';
import { StepIndicator } from '@/components/step-indicator';
import AnalysisProgress, { type AnalysisStage } from '@/components/analysis-progress';
import { generateUnifiedReport } from '@/lib/are/report-generator';
import type { AOSReport, UnifiedReport } from '@/lib/are';
import { getSupabaseBrowserClientAsync } from '@/lib/supabase-browser';

type Step = 'upload' | 'preview' | 'result';

interface ExtractedData {
  campaign_name: string | null;
  snapshot_date: string | null;
  spend: number | null;
  impressions: number | null;
  reach: number | null;
  clicks: number | null;
  ctr: number | null;
  cpc: number | null;
  frequency: number | null;
  cpm: number | null;
  results: number | null;
  cpr: number | null;
  roas: number | null;
  [key: string]: string | number | null | undefined;
}

export default function FacebookReviewPage() {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [report, setReport] = useState<AOSReport | null>(null);
  const [unifiedReport, setUnifiedReport] = useState<UnifiedReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysisStage, setAnalysisStage] = useState<AnalysisStage | null>(null);
  const [metricsCount, setMetricsCount] = useState(0);
  const [issuesCount, setIssuesCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = useCallback((selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('Image size cannot exceed 10MB');
      return;
    }
    setError(null);
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(selectedFile);
  }, []);

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFileSelect(droppedFile);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Upload and analyze screenshot
  const handleUploadAndAnalyze = async () => {
    if (!file) return;
    
    setUploading(true);
    setError(null);

    try {
      // 获取 session token
      const client = await getSupabaseBrowserClientAsync();
      const { data: { session } } = await client.auth.getSession();
      
      if (!session) {
        setError('Please login first');
        setUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append('image', file);
      formData.append('platform', 'facebook');

      const response = await fetch('/api/analyze-screenshot', {
        method: 'POST',
        body: formData,
        headers: {
          'x-session': session.access_token,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Screenshot recognition failed');
      }

      setExtractedData(result.data);
      setStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Recognition failed, please try again');
    } finally {
      setUploading(false);
    }
  };

  // Run full analysis
  const handleAnalyze = async () => {
    if (!extractedData) return;

    setAnalyzing(true);
    setError(null);
    
    // Start analysis progress
    setAnalysisStage('upload_complete');
    
    // Simulate progress stages
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    try {
      // Stage 1: Upload complete (already done)
      await delay(800);
      
      // Stage 2: OCR complete - count metrics
      const metricsFound = Object.values(extractedData).filter(v => v !== null && v !== undefined).length;
      setMetricsCount(metricsFound);
      setAnalysisStage('ocr_complete');
      await delay(1000);
      
      // Stage 3: Rule engine analysis
      setAnalysisStage('rule_engine');
      
      // Make API call
      const response = await fetch('/api/facebook-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date_range: 'Last 7 days',
          snapshot_date: extractedData.snapshot_date || new Date().toISOString().split('T')[0],
          campaigns: [{
            name: extractedData.campaign_name || 'Unknown Campaign',
            delivery: 'Active',
            budget: 100,
            spent: extractedData.spend || 0,
            results: extractedData.results || 0,
            cpr: extractedData.cpr || 0,
            impressions: extractedData.impressions || 0,
            reach: extractedData.reach || 0,
            ctr: extractedData.ctr || 0,
            cpc: extractedData.cpc || 0,
            frequency: extractedData.frequency || 0,
            roas: extractedData.roas || 0,
            cpm: extractedData.cpm || 0,
          }],
          locale: 'en',
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Analysis failed');
      }

      const aosReport = result.data as AOSReport;
      
      // Stage 4: Issues identified
      const issuesFound = aosReport.diagnosis?.length || 0;
      setIssuesCount(issuesFound);
      setAnalysisStage('issues_identified');
      await delay(800);
      
      // Stage 5: Generating plan
      setAnalysisStage('generating_plan');
      await delay(800);
      
      setReport(aosReport);
      
      // Generate unified report for export
      const unified = generateUnifiedReport(
        'facebook',
        aosReport.campaign_name,
        aosReport.date_range,
        aosReport.evidence,
        aosReport.metric_analysis,
        aosReport.diagnosis,
        aosReport.scores,
        aosReport.llm_explanation,
        aosReport.action_plan,
        {
          analysis_duration_ms: aosReport.metadata.analysis_duration_ms,
          model_used: aosReport.metadata.model_used,
          ars_version: aosReport.metadata.ars_version,
          are_version: aosReport.metadata.are_version,
          data_source: aosReport.data_source.type,
        }
      );
      setUnifiedReport(unified);
      
      // Stage 6: Complete
      setAnalysisStage('complete');
      await delay(500);
      
      setStep('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setAnalyzing(false);
      setAnalysisStage(null);
    }
  };

  // Reset to upload step
  const handleReset = () => {
    setStep('upload');
    setFile(null);
    setPreview(null);
    setExtractedData(null);
    setReport(null);
    setUnifiedReport(null);
    setError(null);
  };

  // Go back to previous step
  const handleBack = () => {
    if (step === 'result') {
      setStep('preview');
    } else if (step === 'preview') {
      setStep('upload');
      setExtractedData(null);
    }
    setError(null);
  };

  const currentStepNum = step === 'upload' ? 1 : step === 'preview' ? 2 : 3;

  return (
    <div className="min-h-screen bg-[#08111F] text-white p-6">
      {/* Analysis Progress Overlay */}
      <AnalysisProgress
        currentStage={analysisStage || 'upload_complete'}
        metricsCount={metricsCount}
        issuesCount={issuesCount}
        isVisible={analysisStage !== null}
      />
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-white">Facebook Ads Review</h1>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-8">
          <StepIndicator step={1} currentStep={currentStepNum} label="Upload" icon={<Upload className="h-4 w-4" />} />
          <div className="flex-1 h-px bg-slate-700" />
          <StepIndicator step={2} currentStep={currentStepNum} label="Preview" icon={<CheckCircle2 className="h-4 w-4" />} />
          <div className="flex-1 h-px bg-slate-700" />
          <StepIndicator step={3} currentStep={currentStepNum} label="Result" icon={<CheckCircle2 className="h-4 w-4" />} />
        </div>
      
      {/* Main Content */}
      <main className="max-w-4xl mx-auto">
        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-400">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 1: Upload */}
        {step === 'upload' && (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="py-12">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center border border-blue-400/30">
                  <Upload className="w-10 h-10 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Upload Facebook Ads Screenshot
                </h3>
                <p className="text-slate-400 mb-8 max-w-md mx-auto">
                  Upload a screenshot of your Facebook Ads Manager to get a professional diagnosis report.
                </p>
                
                {/* Upload area */}
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className="border-2 border-dashed border-white/20 rounded-xl p-12 hover:border-[#00D4FF]/50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {preview ? (
                    <div className="space-y-4">
                      <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                      <p className="text-sm text-slate-400">{file?.name}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="w-12 h-12 mx-auto text-slate-500" />
                      <div>
                        <p className="text-white font-medium">Click to upload or drag and drop</p>
                        <p className="text-sm text-slate-500 mt-1">PNG, JPG, WEBP up to 10MB</p>
                      </div>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileSelect(f);
                    }}
                  />
                </div>
                
                {/* Upload button */}
                {file && (
                  <div className="mt-6 flex justify-center gap-4">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setFile(null);
                        setPreview(null);
                      }}
                      className="border border-white/20 text-white hover:bg-white/10 bg-transparent"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUploadAndAnalyze}
                      disabled={uploading}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Recognizing...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Upload & Recognize
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Preview extracted data */}
        {step === 'preview' && extractedData && (
          <div className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  Data Recognized
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(extractedData).map(([key, value]) => {
                    if (value === null || value === undefined || value === '') return null;
                    return (
                      <div key={key} className="bg-white/5 rounded-lg p-3">
                        <p className="text-xs text-slate-400 capitalize">{key.replace(/_/g, ' ')}</p>
                        <p className="text-white font-medium mt-1">
                          {typeof value === 'number' 
                            ? key.includes('ctr') || key.includes('cvr') || key.includes('roas') 
                              ? `${value}%` 
                              : key.includes('spend') || key.includes('cpc') || key.includes('cpm') || key.includes('cpr') || key.includes('cpa')
                                ? `$${value.toFixed(2)}`
                                : value.toLocaleString()
                            : value}
                        </p>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-6 flex justify-center gap-4">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="border-white/20 text-white hover:bg-white/5"
                  >
                    Re-upload
                  </Button>
                  <Button
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Start Diagnosis
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Result */}
        {step === 'result' && report && (
          <div className="space-y-6">
            <FacebookReport report={report} locale="en" />
            
            {/* Export Section */}
            {unifiedReport && (
              <ReportExport report={unifiedReport} locale="en" />
            )}
          </div>
        )}

        {/* Loading state */}
        {(uploading || analyzing) && !error && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#101827] border border-white/10 rounded-xl p-8 text-center">
              <Loader2 className="w-12 h-12 text-[#00D4FF] animate-spin mx-auto" />
              <p className="text-white mt-4 font-medium">
                {uploading ? 'Recognizing screenshot...' : 'Analyzing campaign data...'}
              </p>
              <p className="text-slate-400 text-sm mt-2">
                {uploading ? 'Extracting metrics from your screenshot' : 'Running diagnosis rules'}
              </p>
            </div>
          </div>
        )}
      </main>
      </div>
    </div>
  );
}

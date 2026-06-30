'use client';

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Loader2, AlertCircle, X, CheckCircle2, TrendingUp, Target, Lightbulb, Image as ImageIcon } from 'lucide-react';
import { TikTokReport, type TikTokReportData } from '@/components/tiktok-report';
import { ReportExport } from '@/components/report-export';
import { StepIndicator } from '@/components/step-indicator';
import AnalysisProgress, { type AnalysisStage } from '@/components/analysis-progress';
import { generateUnifiedReport, type UnifiedReport } from '@/lib/are/report-generator';
import { getSupabaseBrowserClientAsync } from '@/lib/supabase-browser';

type Step = 'upload' | 'preview' | 'result';

interface ExtractedData {
  campaign_name: string | null;
  snapshot_date: string | null;
  spend: number | null;
  impressions: number | null;
  clicks: number | null;
  ctr: number | null;
  cpc: number | null;
  conversions: number | null;
  cvr: number | null;
  cpa: number | null;
  roas: number | null;
  video_views: number | null;
  six_second_views: number | null;
  six_second_view_rate: number | null;
  avg_watch_time: number | null;
}

export default function TikTokReviewPage() {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [reportData, setReportData] = useState<TikTokReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysisStage, setAnalysisStage] = useState<AnalysisStage | null>(null);
  const [metricsCount, setMetricsCount] = useState(0);
  const [issuesCount, setIssuesCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFileSelect(droppedFile);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

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
      formData.append('platform', 'tiktok');

      const response = await fetch('/api/analyze-screenshot', {
        method: 'POST',
        body: formData,
        headers: {
          'x-session': session.access_token,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Screenshot recognition failed');
      }

      setExtractedData(result);
      setStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Recognition failed, please try again');
    } finally {
      setUploading(false);
    }
  };

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
      
      const response = await fetch('/api/tiktok-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaigns: [{
            name: extractedData.campaign_name || 'Unknown Campaign',
            spend: extractedData.spend || 0,
            impressions: extractedData.impressions || 0,
            clicks: extractedData.clicks || 0,
            ctr: extractedData.ctr || 0,
            cpc: extractedData.cpc || 0,
            conversions: extractedData.conversions || 0,
            cvr: extractedData.cvr || 0,
            cpa: extractedData.cpa || 0,
            roas: extractedData.roas || 0,
            video_views: extractedData.video_views || undefined,
            six_second_views: extractedData.six_second_views || undefined,
            six_second_view_rate: extractedData.six_second_view_rate || undefined,
            avg_watch_time: extractedData.avg_watch_time || undefined,
          }],
          date_range: extractedData.snapshot_date || 'Last 7 days',
          locale: 'en',
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Analysis failed');
      }

      // Stage 4: Issues identified
      const report = result.data as TikTokReportData;
      const issuesFound = report.diagnosis?.length || 0;
      setIssuesCount(issuesFound);
      setAnalysisStage('issues_identified');
      await delay(800);
      
      // Stage 5: Generating plan
      setAnalysisStage('generating_plan');
      await delay(800);
      
      setReportData(report);
      
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

  const handleReset = () => {
    setStep('upload');
    setFile(null);
    setPreview(null);
    setExtractedData(null);
    setReportData(null);
    setError(null);
  };

  const handleDataChange = (field: keyof ExtractedData, value: string) => {
    if (!extractedData) return;
    
    let parsedValue: string | number | null = value;
    if (value === '') {
      parsedValue = null;
    } else if (typeof extractedData[field] === 'number') {
      parsedValue = parseFloat(value);
    }
    
    setExtractedData({ ...extractedData, [field]: parsedValue });
  };

  // Generate unified report for export
  const unifiedReport: UnifiedReport | null = useMemo(() => {
    if (!reportData) return null;
    
    return generateUnifiedReport(
      'tiktok',
      reportData.campaign_name,
      reportData.date_range,
      reportData.evidence as any,
      reportData.metric_analysis as any,
      reportData.diagnosis as any,
      reportData.scores,
      {
        executive_summary: `TikTok campaign "${reportData.campaign_name}" analysis complete. Overall score: ${reportData.scores.overall}/100.`,
        diagnosis: '',
        action_plan: '',
      },
      reportData.action_plan.map(a => ({
        priority: a.priority as 'P0' | 'P1' | 'P2',
        action: a.action,
        issue: a.issue,
        details: a.details,
        expected_impact: a.expected_impact,
        related_evidence: a.related_evidence || [],
        related_diagnosis: a.related_diagnosis || [],
      })),
      {
        analysis_duration_ms: 0,
        model_used: 'gpt-4',
        ars_version: 'v1',
        are_version: 'v1',
        data_source: 'OCR',
      }
    );
  }, [reportData]);

  const currentStepNum = step === 'upload' ? 1 : step === 'preview' ? 2 : 3;

  // Show result
  if (step === 'result' && reportData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">TikTok Ads Review</h1>
          </div>

          {/* Stepper */}
          <div className="flex items-center gap-2 mb-8">
            <StepIndicator step={1} currentStep={currentStepNum} label="Upload" icon={<Upload className="h-4 w-4" />} />
            <div className="flex-1 h-px bg-slate-700" />
            <StepIndicator step={2} currentStep={currentStepNum} label="Preview" icon={<CheckCircle2 className="h-4 w-4" />} />
            <div className="flex-1 h-px bg-slate-700" />
            <StepIndicator step={3} currentStep={currentStepNum} label="Result" icon={<CheckCircle2 className="h-4 w-4" />} />
          </div>

          <TikTokReport data={reportData} />
          
          {/* Export Section */}
          {unifiedReport && (
            <div className="mt-8">
              <ReportExport report={unifiedReport} locale="en" />
            </div>
          )}

          {/* New Diagnosis button */}
          <div className="mt-8 flex justify-center">
            <Button onClick={handleReset} variant="outline" className="border-white/20 text-white hover:bg-white/5">
              New Diagnosis
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show preview (edit extracted data)
  if (step === 'preview' && extractedData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">TikTok Ads Review</h1>
          </div>

          {/* Stepper */}
          <div className="flex items-center gap-2 mb-8">
            <StepIndicator step={1} currentStep={currentStepNum} label="Upload" icon={<Upload className="h-4 w-4" />} />
            <div className="flex-1 h-px bg-slate-700" />
            <StepIndicator step={2} currentStep={currentStepNum} label="Preview" icon={<CheckCircle2 className="h-4 w-4" />} />
            <div className="flex-1 h-px bg-slate-700" />
            <StepIndicator step={3} currentStep={currentStepNum} label="Result" icon={<CheckCircle2 className="h-4 w-4" />} />
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Confirm Extracted Data</h2>
            <p className="text-slate-400">Please verify the extracted data and make any necessary corrections</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Screenshot Preview */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Screenshot Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {preview && (
                  <img src={preview} alt="Screenshot" className="w-full rounded-lg" />
                )}
              </CardContent>
            </Card>

            {/* Edit Extracted Data */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Extracted Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-slate-300">Campaign Name</Label>
                  <Input
                    value={extractedData.campaign_name || ''}
                    onChange={(e) => handleDataChange('campaign_name', e.target.value)}
                    placeholder="Campaign name"
                    className="bg-slate-800 border-slate-700 text-white mt-1"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Snapshot Date</Label>
                  <Input
                    value={extractedData.snapshot_date || ''}
                    onChange={(e) => handleDataChange('snapshot_date', e.target.value)}
                    placeholder="YYYY-MM-DD"
                    className="bg-slate-800 border-slate-700 text-white mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">Spend ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={extractedData.spend ?? ''}
                      onChange={(e) => handleDataChange('spend', e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Impressions</Label>
                    <Input
                      type="number"
                      value={extractedData.impressions ?? ''}
                      onChange={(e) => handleDataChange('impressions', e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Clicks</Label>
                    <Input
                      type="number"
                      value={extractedData.clicks ?? ''}
                      onChange={(e) => handleDataChange('clicks', e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">CTR (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={extractedData.ctr ?? ''}
                      onChange={(e) => handleDataChange('ctr', e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">CPC ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={extractedData.cpc ?? ''}
                      onChange={(e) => handleDataChange('cpc', e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Conversions</Label>
                    <Input
                      type="number"
                      value={extractedData.conversions ?? ''}
                      onChange={(e) => handleDataChange('conversions', e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">CVR (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={extractedData.cvr ?? ''}
                      onChange={(e) => handleDataChange('cvr', e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">CPA ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={extractedData.cpa ?? ''}
                      onChange={(e) => handleDataChange('cpa', e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">ROAS</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={extractedData.roas ?? ''}
                      onChange={(e) => handleDataChange('roas', e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white mt-1"
                    />
                  </div>
                </div>

                {/* Video Metrics */}
                <div className="pt-4 border-t border-slate-700">
                  <h3 className="text-sm font-medium text-slate-400 mb-3">Video Metrics (Optional)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-300">Video Views</Label>
                      <Input
                        type="number"
                        value={extractedData.video_views ?? ''}
                        onChange={(e) => handleDataChange('video_views', e.target.value)}
                        className="bg-slate-800 border-slate-700 text-white mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">6s Views</Label>
                      <Input
                        type="number"
                        value={extractedData.six_second_views ?? ''}
                        onChange={(e) => handleDataChange('six_second_views', e.target.value)}
                        className="bg-slate-800 border-slate-700 text-white mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">6s View Rate (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={extractedData.six_second_view_rate ?? ''}
                        onChange={(e) => handleDataChange('six_second_view_rate', e.target.value)}
                        className="bg-slate-800 border-slate-700 text-white mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">Avg Watch Time (s)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={extractedData.avg_watch_time ?? ''}
                        onChange={(e) => handleDataChange('avg_watch_time', e.target.value)}
                        className="bg-slate-800 border-slate-700 text-white mt-1"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <p className="text-red-400">{error}</p>
                  </div>
                )}

                <Button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-semibold"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Confirm and Analyze'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Show upload
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Analysis Progress */}
        {analysisStage && (
          <AnalysisProgress
            currentStage={analysisStage}
            metricsCount={metricsCount}
            issuesCount={issuesCount}
            isVisible={!!analysisStage}
          />
        )}

        {/* Header with Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">TikTok Ads Review</h1>
              <p className="text-slate-400 mt-1">Upload a screenshot of your TikTok Ads Manager to get a comprehensive analysis</p>
            </div>
          </div>

          {/* Stepper */}
          <div className="flex items-center gap-2">
            <StepIndicator step={1} currentStep={currentStepNum} label="Upload" icon={<Upload className="h-4 w-4" />} />
            <div className="flex-1 h-px bg-slate-700" />
            <StepIndicator step={2} currentStep={currentStepNum} label="Preview" icon={<CheckCircle2 className="h-4 w-4" />} />
            <div className="flex-1 h-px bg-slate-700" />
            <StepIndicator step={3} currentStep={currentStepNum} label="Result" icon={<CheckCircle2 className="h-4 w-4" />} />
          </div>
        </div>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="py-12">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center border border-cyan-400/30">
                <Upload className="w-10 h-10 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Upload TikTok Ads Screenshot
              </h3>
              <p className="text-slate-400 mb-8 max-w-md mx-auto">
                Upload a screenshot of your TikTok Ads Manager to get a professional diagnosis report.
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
                    className="bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white"
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
      </div>
    </div>
  );
}

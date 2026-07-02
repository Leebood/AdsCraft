'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Loader2, AlertCircle, CheckCircle2, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import { TikTokReport, type TikTokReportData } from '@/components/tiktok-report';
import { ReportExport } from '@/components/report-export';
import { StepIndicator } from '@/components/step-indicator';
import AnalysisProgress, { type AnalysisStage } from '@/components/analysis-progress';
import { generateUnifiedReport, type UnifiedReport } from '@/lib/are/report-generator';
import type { Diagnosis, Evidence, MetricAnalysis } from '@/lib/are';
import { useScreenshotAnalysis } from '@/hooks/use-screenshot-analysis';
import { useI18n } from '@/lib/i18n-context';

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
  const { locale } = useI18n();
  const isZh = locale === 'zh';
  const [step, setStep] = useState<Step>('upload');
  const [analyzing, setAnalyzing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [reportData, setReportData] = useState<TikTokReportData | null>(null);
  const [analysisStage, setAnalysisStage] = useState<AnalysisStage | null>(null);
  const [metricsCount, setMetricsCount] = useState(0);
  const [issuesCount, setIssuesCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    file,
    preview,
    uploading,
    error,
    platformWarning,
    setError,
    selectFile,
    clearFile,
    uploadAndAnalyze,
  } = useScreenshotAnalysis('tiktok', locale);

  const copy = {
    title: isZh ? 'TikTok 广告审查与诊断' : 'TikTok Ads Review',
    subtitle: isZh ? '上传 TikTok 广告后台截图，先检查拒审风险，再诊断优化空间。' : 'Upload a TikTok Ads Manager screenshot for review and diagnosis.',
    upload: isZh ? '上传' : 'Upload',
    preview: isZh ? '预览' : 'Preview',
    result: isZh ? '结果' : 'Result',
    uploadTitle: isZh ? '上传 TikTok 广告截图' : 'Upload TikTok Ads Screenshot',
    uploadDesc: isZh ? '识别素材、投放与成效指标，生成审查和诊断结果。' : 'Upload a screenshot of your TikTok Ads Manager to get a professional diagnosis report.',
    clickUpload: isZh ? '点击上传或拖拽文件' : 'Click to upload or drag and drop',
    support: isZh ? '支持 PNG、JPG、WEBP，最大 10MB' : 'PNG, JPG, WEBP up to 10MB',
    cancel: isZh ? '取消' : 'Cancel',
    recognizing: isZh ? '识别中...' : 'Recognizing...',
    uploadRecognize: isZh ? '上传并识别' : 'Upload & Recognize',
    platformMismatch: isZh ? '平台不匹配' : 'Platform Mismatch',
    confirmTitle: isZh ? '确认识别数据' : 'Confirm Extracted Data',
    confirmDesc: isZh ? '请核对识别结果，必要时手动修正。' : 'Please verify the extracted data and make any necessary corrections',
    screenshotPreview: isZh ? '截图预览' : 'Screenshot Preview',
    extractedData: isZh ? '识别数据' : 'Extracted Data',
    reupload: isZh ? '重新上传' : 'Re-upload',
    analyzing: isZh ? '诊断中...' : 'Analyzing...',
    confirmAnalyze: isZh ? '确认并诊断' : 'Confirm and Analyze',
    newDiagnosis: isZh ? '新建诊断' : 'New Diagnosis',
    analysisFailed: isZh ? '诊断失败，请重试' : 'Analysis failed',
    unknownCampaign: isZh ? '未命名广告系列' : 'Unknown Campaign',
    videoMetrics: isZh ? '视频指标（可选）' : 'Video Metrics (Optional)',
  };

  const label = {
    campaignName: isZh ? '广告系列名称' : 'Campaign Name',
    snapshotDate: isZh ? '截图日期' : 'Snapshot Date',
    spend: isZh ? '花费 ($)' : 'Spend ($)',
    impressions: isZh ? '展示' : 'Impressions',
    clicks: isZh ? '点击' : 'Clicks',
    conversions: isZh ? '转化' : 'Conversions',
    videoViews: isZh ? '视频播放量' : 'Video Views',
    sixViews: isZh ? '6秒播放量' : '6s Views',
    sixRate: isZh ? '6秒播放率 (%)' : '6s View Rate (%)',
    avgWatch: isZh ? '平均观看时长 (秒)' : 'Avg Watch Time (s)',
  };

  const handleFileSelect = useCallback((selectedFile: File) => {
    void selectFile(selectedFile);
  }, [selectFile]);

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

    const result = await uploadAndAnalyze();
    if (result) {
      setExtractedData(result as unknown as ExtractedData);
      setStep('preview');
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
            name: extractedData.campaign_name || copy.unknownCampaign,
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
          locale,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || copy.analysisFailed);
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
      setError(err instanceof Error ? err.message : copy.analysisFailed);
    } finally {
      setAnalyzing(false);
      setAnalysisStage(null);
    }
  };

  const handleReset = () => {
    setStep('upload');
    clearFile();
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
      reportData.evidence as Evidence[],
      reportData.metric_analysis as MetricAnalysis[],
      reportData.diagnosis as Diagnosis[],
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
            <h1 className="text-2xl font-bold text-white">{copy.title}</h1>
          </div>

          {/* Stepper */}
          <div className="flex items-center gap-2 mb-8">
            <StepIndicator step={1} currentStep={currentStepNum} label={copy.upload} icon={<Upload className="h-4 w-4" />} />
            <div className="flex-1 h-px bg-slate-700" />
            <StepIndicator step={2} currentStep={currentStepNum} label={copy.preview} icon={<CheckCircle2 className="h-4 w-4" />} />
            <div className="flex-1 h-px bg-slate-700" />
            <StepIndicator step={3} currentStep={currentStepNum} label={copy.result} icon={<CheckCircle2 className="h-4 w-4" />} />
          </div>

          <TikTokReport data={reportData} locale={locale} />
          
          {/* Export Section */}
          {unifiedReport && (
            <div className="mt-8">
              <ReportExport report={unifiedReport} locale={locale} />
            </div>
          )}

          {/* New Diagnosis button */}
          <div className="mt-8 flex justify-center">
            <Button onClick={handleReset} variant="outline" className="border-white/20 text-white hover:bg-white/5">
              {copy.newDiagnosis}
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
            <h1 className="text-2xl font-bold text-white">{copy.title}</h1>
          </div>

          {/* Stepper */}
          <div className="flex items-center gap-2 mb-8">
            <StepIndicator step={1} currentStep={currentStepNum} label={copy.upload} icon={<Upload className="h-4 w-4" />} />
            <div className="flex-1 h-px bg-slate-700" />
            <StepIndicator step={2} currentStep={currentStepNum} label={copy.preview} icon={<CheckCircle2 className="h-4 w-4" />} />
            <div className="flex-1 h-px bg-slate-700" />
            <StepIndicator step={3} currentStep={currentStepNum} label={copy.result} icon={<CheckCircle2 className="h-4 w-4" />} />
          </div>

          {/* Platform mismatch warning */}
          {platformWarning && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex items-start gap-3 mb-6">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-200 font-medium">{copy.platformMismatch}</p>
                <p className="text-amber-200/80 text-sm mt-1">{platformWarning}</p>
              </div>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">{copy.confirmTitle}</h2>
            <p className="text-slate-400">{copy.confirmDesc}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Screenshot Preview */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  {copy.screenshotPreview}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {preview && (
                  <img src={preview} alt={copy.screenshotPreview} className="w-full rounded-lg" />
                )}
              </CardContent>
            </Card>

            {/* Edit Extracted Data */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  {copy.extractedData}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-slate-300">{label.campaignName}</Label>
                  <Input
                    value={extractedData.campaign_name || ''}
                    onChange={(e) => handleDataChange('campaign_name', e.target.value)}
                    placeholder={label.campaignName}
                    className="bg-slate-800 border-slate-700 text-white mt-1"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">{label.snapshotDate}</Label>
                  <Input
                    value={extractedData.snapshot_date || ''}
                    onChange={(e) => handleDataChange('snapshot_date', e.target.value)}
                    placeholder="YYYY-MM-DD"
                    className="bg-slate-800 border-slate-700 text-white mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">{label.spend}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={extractedData.spend ?? ''}
                      onChange={(e) => handleDataChange('spend', e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">{label.impressions}</Label>
                    <Input
                      type="number"
                      value={extractedData.impressions ?? ''}
                      onChange={(e) => handleDataChange('impressions', e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">{label.clicks}</Label>
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
                    <Label className="text-slate-300">{label.conversions}</Label>
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
                  <h3 className="text-sm font-medium text-slate-400 mb-3">{copy.videoMetrics}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-300">{label.videoViews}</Label>
                      <Input
                        type="number"
                        value={extractedData.video_views ?? ''}
                        onChange={(e) => handleDataChange('video_views', e.target.value)}
                        className="bg-slate-800 border-slate-700 text-white mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">{label.sixViews}</Label>
                      <Input
                        type="number"
                        value={extractedData.six_second_views ?? ''}
                        onChange={(e) => handleDataChange('six_second_views', e.target.value)}
                        className="bg-slate-800 border-slate-700 text-white mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">{label.sixRate}</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={extractedData.six_second_view_rate ?? ''}
                        onChange={(e) => handleDataChange('six_second_view_rate', e.target.value)}
                        className="bg-slate-800 border-slate-700 text-white mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">{label.avgWatch}</Label>
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

                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      clearFile();
                      setExtractedData(null);
                      setStep('upload');
                    }}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white border border-slate-600"
                  >
                    {copy.reupload}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-semibold"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {copy.analyzing}
                      </>
                    ) : (
                      copy.confirmAnalyze
                    )}
                  </Button>
                </div>
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
              <h1 className="text-2xl font-bold text-white">{copy.title}</h1>
              <p className="text-slate-400 mt-1">{copy.subtitle}</p>
            </div>
          </div>

          {/* Stepper */}
          <div className="flex items-center gap-2">
            <StepIndicator step={1} currentStep={currentStepNum} label={copy.upload} icon={<Upload className="h-4 w-4" />} />
            <div className="flex-1 h-px bg-slate-700" />
            <StepIndicator step={2} currentStep={currentStepNum} label={copy.preview} icon={<CheckCircle2 className="h-4 w-4" />} />
            <div className="flex-1 h-px bg-slate-700" />
            <StepIndicator step={3} currentStep={currentStepNum} label={copy.result} icon={<CheckCircle2 className="h-4 w-4" />} />
          </div>
        </div>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="py-12">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center border border-cyan-400/30">
                <Upload className="w-10 h-10 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {copy.uploadTitle}
              </h3>
              <p className="text-slate-400 mb-8 max-w-md mx-auto">
                {copy.uploadDesc}
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
                    <img src={preview} alt={copy.preview} className="max-h-64 mx-auto rounded-lg" />
                    <p className="text-sm text-slate-400">{file?.name}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-12 h-12 mx-auto text-slate-500" />
                    <div>
                      <p className="text-white font-medium">{copy.clickUpload}</p>
                      <p className="text-sm text-slate-500 mt-1">{copy.support}</p>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onClick={(e) => {
                    e.currentTarget.value = '';
                  }}
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
                      clearFile();
                    }}
                    className="border border-white/20 text-white hover:bg-white/10 bg-transparent"
                  >
                    {copy.cancel}
                  </Button>
                  <Button
                    onClick={handleUploadAndAnalyze}
                    disabled={uploading}
                    className="bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {copy.recognizing}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        {copy.uploadRecognize}
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

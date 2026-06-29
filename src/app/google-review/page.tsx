/**
 * Google Ads Review Page
 * 
 * 二级页面：Upload → Preview → Result
 * 与 Facebook/TikTok 保持一致的交互模式
 */

'use client';

import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  Loader2, 
  ArrowLeft,
  Image as ImageIcon,
  AlertCircle
} from 'lucide-react';
import { GoogleReport, GoogleReportData } from '@/components/google-report';
import { ReportExport } from '@/components/report-export';
import { StepIndicator } from '@/components/step-indicator';
import { generateUnifiedReport, UnifiedReport } from '@/lib/are';
import { useRouter } from 'next/navigation';

// ============================================================================
// Types
// ============================================================================

interface GoogleCampaignData {
  name: string;
  campaign_type?: 'search' | 'display' | 'shopping';
  spend: number;
  impressions?: number;
  clicks?: number;
  ctr?: number;
  cpc?: number;
  cpm?: number;
  conversions?: number;
  cvr?: number;
  roas?: number;
  quality_score?: number;
}

// ============================================================================
// Main Component
// ============================================================================

export default function GoogleReviewPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setShowPreview] = useState(false);
  const [extractedData, setExtractedData] = useState<GoogleCampaignData | null>(null);
  const [report, setReport] = useState<GoogleReportData | null>(null);
  const [unifiedReport, setUnifiedReport] = useState<UnifiedReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理截图上传
  const handleScreenshotUpload = useCallback(async (file: File) => {
    setScreenshotFile(file);
    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('platform', 'google');

      const response = await fetch('/api/analyze-screenshot', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Screenshot recognition failed');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        // 将识别结果转换为 Google Campaign 数据
        const data: GoogleCampaignData = {
          name: result.data.campaign_name || 'Google Ads Campaign',
          campaign_type: result.data.campaign_type || 'search',
          spend: result.data.spend || 0,
          impressions: result.data.impressions,
          clicks: result.data.clicks,
          ctr: result.data.ctr,
          cpc: result.data.cpc,
          cpm: result.data.cpm,
          conversions: result.data.conversions,
          cvr: result.data.cvr,
          roas: result.data.roas,
          quality_score: result.data.quality_score,
        };
        setExtractedData(data);
        setStep(2);
      } else {
        throw new Error(result.error || 'Failed to extract data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }, []);

  // 处理文件选择
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleScreenshotUpload(file);
    }
  };

  // 处理拖放
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleScreenshotUpload(file);
    }
  };

  // 处理分析
  const handleAnalyze = async () => {
    if (!extractedData) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/google-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaigns: [extractedData],
          date_range: 'Last 7 days',
          locale: 'en',
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setReport(result.data);
        // 生成统一报告用于导出
        const unified = generateUnifiedReport(
          'google',
          result.data.campaign_name,
          result.data.date_range,
          result.data.evidence,
          result.data.metric_analysis,
          result.data.diagnosis,
          result.data.scores,
          result.data.llm_explanation,
          result.data.action_plan,
          {
            analysis_duration_ms: 0,
            model_used: 'unknown',
            ars_version: '1.0.0',
            are_version: '1.0.0',
            data_source: 'screenshot',
          }
        );
        setUnifiedReport(unified);
        setStep(3);
      } else {
        throw new Error(result.error || 'Analysis failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 返回 Dashboard
  const handleBack = () => {
    router.push('/dashboard/plans');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-white">Google Ads Review</h1>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-8">
          <StepIndicator step={1} currentStep={step} label="Upload" icon={<Upload className="h-4 w-4" />} />
          <div className="flex-1 h-px bg-slate-700" />
          <StepIndicator step={2} currentStep={step} label="Preview" icon={<FileText className="h-4 w-4" />} />
          <div className="flex-1 h-px bg-slate-700" />
          <StepIndicator step={3} currentStep={step} label="Result" icon={<CheckCircle className="h-4 w-4" />} />
        </div>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 bg-red-500/10 border-red-500/30">
            <CardContent className="py-4">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 1: Upload */}
        {step === 1 && (
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Upload className="h-5 w-5 text-blue-400" />
                Upload Google Ads Screenshot
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="border-2 border-dashed border-slate-700 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 text-blue-400 animate-spin" />
                    <p className="text-slate-400">Uploading and recognizing...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <ImageIcon className="h-12 w-12 text-slate-500" />
                    <div>
                      <p className="text-white font-medium mb-1">
                        Drag & drop or click to upload
                      </p>
                      <p className="text-slate-400 text-sm">
                        Google Ads Manager screenshot
                      </p>
                    </div>
                    <p className="text-slate-500 text-xs">
                      Supported: PNG, JPG
                    </p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </CardContent>
          </Card>
        )}

        {/* Step 2: Preview */}
        {step === 2 && extractedData && (
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-400" />
                Preview & Edit Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Screenshot Preview */}
              {screenshotFile && (
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPreview(!screenshotPreview)}
                    className="text-slate-400 hover:text-white"
                  >
                    {screenshotPreview ? 'Hide' : 'Show'} Screenshot
                  </Button>
                  {screenshotPreview && (
                    <div className="border border-slate-700 rounded-lg overflow-hidden">
                      <img
                        src={URL.createObjectURL(screenshotFile)}
                        alt="Screenshot"
                        className="max-h-96 w-auto mx-auto"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Data Edit Form */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-400">Campaign Name</Label>
                  <Input
                    value={extractedData.name}
                    onChange={(e) => setExtractedData({ ...extractedData, name: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-400">Campaign Type</Label>
                  <select
                    value={extractedData.campaign_type || 'search'}
                    onChange={(e) => setExtractedData({ ...extractedData, campaign_type: e.target.value as 'search' | 'display' | 'shopping' })}
                    className="w-full h-10 px-3 rounded-md bg-slate-800 border border-slate-700 text-white"
                  >
                    <option value="search">Search</option>
                    <option value="display">Display</option>
                    <option value="shopping">Shopping</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-400">Spend ($)</Label>
                  <Input
                    type="number"
                    value={extractedData.spend || ''}
                    onChange={(e) => setExtractedData({ ...extractedData, spend: parseFloat(e.target.value) || 0 })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-400">Impressions</Label>
                  <Input
                    type="number"
                    value={extractedData.impressions || ''}
                    onChange={(e) => setExtractedData({ ...extractedData, impressions: parseInt(e.target.value) || undefined })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-400">Clicks</Label>
                  <Input
                    type="number"
                    value={extractedData.clicks || ''}
                    onChange={(e) => setExtractedData({ ...extractedData, clicks: parseInt(e.target.value) || undefined })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-400">CTR (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={extractedData.ctr || ''}
                    onChange={(e) => setExtractedData({ ...extractedData, ctr: parseFloat(e.target.value) || undefined })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-400">CPC ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={extractedData.cpc || ''}
                    onChange={(e) => setExtractedData({ ...extractedData, cpc: parseFloat(e.target.value) || undefined })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-400">Conversions</Label>
                  <Input
                    type="number"
                    value={extractedData.conversions || ''}
                    onChange={(e) => setExtractedData({ ...extractedData, conversions: parseInt(e.target.value) || undefined })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-400">CVR (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={extractedData.cvr || ''}
                    onChange={(e) => setExtractedData({ ...extractedData, cvr: parseFloat(e.target.value) || undefined })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-400">ROAS</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={extractedData.roas || ''}
                    onChange={(e) => setExtractedData({ ...extractedData, roas: parseFloat(e.target.value) || undefined })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-400">Quality Score (1-10)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={extractedData.quality_score || ''}
                    onChange={(e) => setExtractedData({ ...extractedData, quality_score: parseInt(e.target.value) || undefined })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Back
                </Button>
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Result */}
        {step === 3 && report && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Analysis Result</h2>
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                New Analysis
              </Button>
            </div>
            <GoogleReport report={report} locale="en" />
            
            {/* Export Report */}
            {unifiedReport && (
              <ReportExport report={unifiedReport} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Helper Components
// ============================================================================


'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n-context';
import { FileText, Upload, Zap, CheckCircle, Loader2, X } from 'lucide-react';
import { TikTokReport, type TikTokReportData } from '@/components/tiktok-report';

interface DiagnosisRecord {
  id: string;
  campaign_name: string;
  campaign_type: string;
  overall_score: number;
  created_at: string;
  spend?: number;
}

interface TikTokAuth {
  is_connected: boolean;
  advertiser_id?: string;
  advertiser_info?: {
    advertiser_name?: string;
  };
}

export default function PlansPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { locale } = useI18n();

  const [activeTab, setActiveTab] = useState<'fb' | 'tk' | 'google'>('fb');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showTkPreview, setShowTkPreview] = useState(false);

  // TikTok 截图上传状态
  const [tkScreenshotFile, setTkScreenshotFile] = useState<File | null>(null);
  const [tkScreenshotPreview, setTkScreenshotPreview] = useState<string | null>(null);
  const [tkRecognizedData, setTkRecognizedData] = useState<Record<string, unknown> | null>(null);
  const [tkReport, setTkReport] = useState<TikTokReportData | null>(null);
  const [tkStep, setTkStep] = useState<1 | 2 | 3>(1);

  // Google 诊断历史
  const [googleDiagnosisHistory] = useState<Array<{ id: string; created_at: string; report?: { scores?: { overall?: number } } }>>([]);

  // 处理 TikTok 截图上传
  const handleTkScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setTkScreenshotFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setTkScreenshotPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // 调用截图识别 API
    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/analyze-screenshot', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.data) {
        setTkRecognizedData(data.data);
        setTkStep(2);
      } else {
        alert(locale === 'zh' ? '截图识别失败，请重试' : 'Screenshot recognition failed, please try again');
      }
    } catch (error) {
      console.error('Screenshot analysis error:', error);
      alert(locale === 'zh' ? '截图识别失败，请重试' : 'Screenshot recognition failed, please try again');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 处理 TikTok 诊断
  const handleTkDiagnosis = async () => {
    if (!tkRecognizedData) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/tiktok-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaigns: [tkRecognizedData],
          date_range: 'Last 7 days',
          locale,
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        setTkReport(data.data);
        setTkStep(3);
      } else {
        alert(locale === 'zh' ? '诊断失败，请重试' : 'Diagnosis failed, please try again');
      }
    } catch (error) {
      console.error('Diagnosis error:', error);
      alert(locale === 'zh' ? '诊断失败，请重试' : 'Diagnosis failed, please try again');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 重置 TikTok 截图上传
  const resetTkScreenshot = () => {
    setTkScreenshotFile(null);
    setTkScreenshotPreview(null);
    setTkRecognizedData(null);
    setTkReport(null);
    setTkStep(1);
    setShowTkPreview(false);
  };

  // 开始截图诊断 - 跳转到 TikTok 报告页面
  const handleStartDiagnosis = () => {
    router.push('/tiktok-review');
  };

  // 开始 Google 截图诊断
  const handleStartGoogleDiagnosis = () => {
    router.push('/google-review');
  };

  // 连接 TikTok
  const handleConnectTikTok = () => {
    // TODO: 实现 TikTok OAuth 连接
    alert(locale === 'zh' ? 'TikTok 连接功能开发中...' : 'TikTok connection feature is under development...');
  };

  // TK Tab内容 - 与 FB Tab 保持一致
  const renderTKTab = () => {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center border border-purple-400/30">
            <Upload className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {locale === 'zh' ? 'TikTok 广告诊断' : 'TikTok Ad Diagnosis'}
          </h3>
          <p className="text-blue-200/70 mb-6 max-w-md mx-auto">
            {locale === 'zh' 
              ? '上传 TikTok Ads Manager 截图，自动识别数据并进行诊断分析' 
              : 'Upload TikTok Ads Manager screenshot for automatic data recognition and diagnosis'}
          </p>
          <Button
            onClick={handleStartDiagnosis}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white"
          >
            {locale === 'zh' ? '开始截图诊断' : 'Start Screenshot Diagnosis'}
          </Button>
        </CardContent>
      </Card>
    );
  };

  // FB Tab内容
  const renderFBTab = () => {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500/30 to-indigo-500/30 flex items-center justify-center border border-blue-400/30">
            <Upload className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {locale === 'zh' ? 'Facebook 广告诊断' : 'Facebook Ad Diagnosis'}
          </h3>
          <p className="text-blue-200/70 mb-6 max-w-md mx-auto">
            {locale === 'zh'  
              ? '上传 Facebook Ads Manager 截图，自动识别数据并进行诊断分析' 
              : 'Upload Facebook Ads Manager screenshot for automatic data recognition and diagnosis'}
          </p>
          <Button
            onClick={() => router.push('/facebook-review')}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white"
          >
            {locale === 'zh' ? '开始截图诊断' : 'Start Screenshot Diagnosis'}
          </Button>
        </CardContent>
      </Card>
    );
  };

  // Google 标签页内容
  const renderGoogleTab = () => {
    return (
      <div className="space-y-6">
        {/* 连接状态 */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
              G
            </div>
            <div>
              <h3 className="text-white font-medium">Google Ads</h3>
              <p className="text-sm text-white/60">
                {locale === 'zh' ? '截图诊断' : 'Screenshot Diagnosis'}
              </p>
            </div>
          </div>
          <p className="text-white/70 text-sm mb-4">
            {locale === 'zh' 
              ? '上传 Google Ads 截图，获取专业的广告诊断报告。' 
              : 'Upload Google Ads screenshot for professional ad diagnosis report.'}
          </p>
          <Button
            onClick={handleStartGoogleDiagnosis}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
          >
            <Upload className="w-4 h-4 mr-2" />
            {locale === 'zh' ? '开始截图诊断' : 'Start Screenshot Diagnosis'}
          </Button>
        </div>

        {/* 历史记录 */}
        {googleDiagnosisHistory.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-white font-medium mb-4">
              {locale === 'zh' ? '历史诊断记录' : 'Diagnosis History'}
            </h3>
            <div className="space-y-3">
              {googleDiagnosisHistory.map((record: { id: string; created_at: string; report?: { scores?: { overall?: number } } }, index: number) => (
                <div
                  key={record.id}
                  className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-white text-sm">
                      {locale === 'zh' ? '诊断' : 'Diagnosis'} #{googleDiagnosisHistory.length - index}
                    </p>
                    <p className="text-white/60 text-xs">
                      {new Date(record.created_at).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {record.report?.scores?.overall !== undefined && (
                      <span className="text-blue-400 font-medium">
                        {record.report.scores.overall}/100
                      </span>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/google-review?history=${record.id}`)}
                      className="border-white/20 text-white/70 hover:bg-white/5"
                    >
                      {locale === 'zh' ? '查看' : 'View'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* 网格纹理背景 */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      
      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">
              {locale === 'zh' ? '我的方案' : 'My Plans'}
            </h1>
            <p className="text-blue-200/70">
              {locale === 'zh' ? '查看和管理您的诊断记录' : 'View and manage your diagnosis records'}
            </p>
          </div>

          {/* Tab切换 */}
          <div className="flex border-b border-white/20 mb-6">
            <button 
              onClick={() => setActiveTab('fb')} 
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                activeTab === 'fb' 
                  ? 'text-blue-400 border-b-2 border-blue-400' 
                  : 'text-blue-200/70 hover:text-white'
              }`}
            >
              <span className="w-5 h-5 rounded bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold">FB</span>
              Facebook
            </button>
            <button 
              onClick={() => setActiveTab('tk')} 
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                activeTab === 'tk' 
                  ? 'text-purple-400 border-b-2 border-purple-400' 
                  : 'text-blue-200/70 hover:text-white'
              }`}
            >
              <span className="w-5 h-5 rounded bg-purple-500/20 flex items-center justify-center text-purple-400 text-xs font-bold">TK</span>
              TikTok
            </button>
            <button 
              onClick={() => setActiveTab('google')} 
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                activeTab === 'google' 
                  ? 'text-orange-400 border-b-2 border-orange-400' 
                  : 'text-blue-200/70 hover:text-white'
              }`}
            >
              <span className="w-5 h-5 rounded bg-orange-500/20 flex items-center justify-center text-orange-400 text-xs font-bold">G</span>
              Google Ads
            </button>
          </div>

          {/* Tab内容 */}
          {activeTab === 'fb' ? renderFBTab() : activeTab === 'tk' ? renderTKTab() : renderGoogleTab()}
        </div>
      </main>

      {/* TikTok 截图预览弹窗 */}
      {showTkPreview && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-900 border-b border-white/10 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {locale === 'zh' ? 'TikTok 广告诊断' : 'TikTok Ad Diagnosis'}
              </h2>
              <button
                onClick={resetTkScreenshot}
                className="text-blue-200/70 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* 步骤指示器 */}
              <div className="flex items-center justify-center mb-8">
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-2 ${tkStep >= 1 ? 'text-purple-400' : 'text-blue-200/30'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      tkStep >= 1 ? 'bg-purple-500/20 border border-purple-400/30' : 'bg-white/5 border border-white/10'
                    }`}>
                      {tkStep > 1 ? <CheckCircle className="w-4 h-4" /> : <span className="text-sm">1</span>}
                    </div>
                    <span className="text-sm font-medium">
                      {locale === 'zh' ? '上传截图' : 'Upload'}
                    </span>
                  </div>
                  <div className={`w-12 h-px ${tkStep >= 2 ? 'bg-purple-400' : 'bg-white/10'}`}></div>
                  <div className={`flex items-center gap-2 ${tkStep >= 2 ? 'text-purple-400' : 'text-blue-200/30'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      tkStep >= 2 ? 'bg-purple-500/20 border border-purple-400/30' : 'bg-white/5 border border-white/10'
                    }`}>
                      {tkStep > 2 ? <CheckCircle className="w-4 h-4" /> : <span className="text-sm">2</span>}
                    </div>
                    <span className="text-sm font-medium">
                      {locale === 'zh' ? '预览数据' : 'Preview'}
                    </span>
                  </div>
                  <div className={`w-12 h-px ${tkStep >= 3 ? 'bg-purple-400' : 'bg-white/10'}`}></div>
                  <div className={`flex items-center gap-2 ${tkStep >= 3 ? 'text-purple-400' : 'text-blue-200/30'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      tkStep >= 3 ? 'bg-purple-500/20 border border-purple-400/30' : 'bg-white/5 border border-white/10'
                    }`}>
                      <span className="text-sm">3</span>
                    </div>
                    <span className="text-sm font-medium">
                      {locale === 'zh' ? '查看结果' : 'Result'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Step 1: 上传截图 */}
              {tkStep === 1 && (
                <div className="space-y-6">
                  <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-purple-400/50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleTkScreenshotUpload}
                      className="hidden"
                      id="tk-screenshot-upload"
                      disabled={isAnalyzing}
                    />
                    <label htmlFor="tk-screenshot-upload" className="cursor-pointer">
                      {isAnalyzing ? (
                        <div className="space-y-4">
                          <Loader2 className="w-12 h-12 mx-auto text-purple-400 animate-spin" />
                          <p className="text-white">
                            {locale === 'zh' ? '正在识别截图...' : 'Recognizing screenshot...'}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Upload className="w-12 h-12 mx-auto text-purple-400" />
                          <div>
                            <p className="text-white font-medium">
                              {locale === 'zh' ? '点击或拖拽上传 TikTok 截图' : 'Click or drag to upload TikTok screenshot'}
                            </p>
                            <p className="text-blue-200/70 text-sm mt-1">
                              {locale === 'zh' ? '支持 PNG、JPG 格式' : 'Supports PNG, JPG format'}
                            </p>
                          </div>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              )}

              {/* Step 2: 预览数据 */}
              {tkStep === 2 && tkRecognizedData && (
                <div className="space-y-6">
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="py-6">
                      <h3 className="text-lg font-semibold text-white mb-4">
                        {locale === 'zh' ? '识别结果' : 'Recognized Data'}
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(tkRecognizedData).map(([key, value]) => (
                          <div key={key} className="p-3 bg-white/5 rounded-lg">
                            <p className="text-blue-200/70 text-sm">{key}</p>
                            <p className="text-white font-medium">{String(value)}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <div className="flex gap-4">
                    <Button
                      onClick={resetTkScreenshot}
                      variant="outline"
                      className="flex-1 border-white/20 text-blue-200 hover:bg-white/5"
                    >
                      {locale === 'zh' ? '重新上传' : 'Re-upload'}
                    </Button>
                    <Button
                      onClick={handleTkDiagnosis}
                      disabled={isAnalyzing}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {locale === 'zh' ? '诊断中...' : 'Diagnosing...'}
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          {locale === 'zh' ? '开始诊断' : 'Start Diagnosis'}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: 查看结果 */}
              {tkStep === 3 && tkReport && (
                <div className="space-y-6">
                  <TikTokReport data={tkReport} locale={locale} />
                  <div className="flex gap-4">
                    <Button
                      onClick={resetTkScreenshot}
                      variant="outline"
                      className="flex-1 border-white/20 text-blue-200 hover:bg-white/5"
                    >
                      {locale === 'zh' ? '新的诊断' : 'New Diagnosis'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useI18n } from '@/lib/i18n-context';
import { useAuth } from '@/lib/auth-context';
import { getSupabaseBrowserClientAsync } from '@/lib/supabase-browser';
import { Upload, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { TikTokReport } from '@/components/tiktok-report';

interface DiagnosisRecord {
  id: string;
  platform: 'facebook' | 'tiktok';
  diagnosis_type: 'light' | 'full' | 'deep_attribution';
  status: 'completed' | 'pending';
  summary: string;
  created_at: string;
  time_range?: string;
}

interface TikTokConnection {
  is_connected: boolean;
  advertiser_id?: string;
  advertiser_name?: string;
  connected_at?: string;
  token_expires_at?: string;
}

interface AdDataOverview {
  total_spend: number;
  total_impressions: number;
  total_clicks: number;
  total_conversions: number;
  campaigns_count: number;
  active_campaigns: number;
}

export default function PlansPage() {
  const { locale } = useI18n();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'fb' | 'tk'>('fb');
  const [tiktokConnection, setTiktokConnection] = useState<TikTokConnection | null>(null);
  const [fbRecords, setFbRecords] = useState<DiagnosisRecord[]>([]);
  const [tkRecords, setTkRecords] = useState<DiagnosisRecord[]>([]);
  const [adDataOverview, setAdDataOverview] = useState<AdDataOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTimeRangeModal, setShowTimeRangeModal] = useState(false);
  
  // TikTok 截图上传相关状态
  const [tkScreenshot, setTkScreenshot] = useState<string | null>(null);
  const [tkScreenshotFile, setTkScreenshotFile] = useState<File | null>(null);
  const [tkRecognizedData, setTkRecognizedData] = useState<any>(null);
  const [tkAnalyzing, setTkAnalyzing] = useState(false);
  const [tkRecognizing, setTkRecognizing] = useState(false);
  const [tkAnalysisResult, setTkAnalysisResult] = useState<any>(null);
  const [tkStep, setTkStep] = useState<'upload' | 'preview' | 'result'>('upload');
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7' | '14' | '30'>('7');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showTkPreview, setShowTkPreview] = useState(false);

  // 获取TikTok连接状态和诊断记录
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const client = await getSupabaseBrowserClientAsync();
      const { data: { session } } = await client.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        setLoading(false);
        return;
      }

      // 获取TikTok连接状态
      const connectionRes = await fetch('/api/tiktok/connection-status', {
        headers: { 'x-session': token }
      });
      if (connectionRes.ok) {
        const data = await connectionRes.json();
        setTiktokConnection(data);
        
        // 如果已连接，获取广告数据概览
        if (data.is_connected) {
          const overviewRes = await fetch('/api/tiktok/ad-overview', {
            headers: { 'x-session': token }
          });
          if (overviewRes.ok) {
            const overviewData = await overviewRes.json();
            setAdDataOverview(overviewData);
          }
        }
      }

      // 获取诊断记录
      const recordsRes = await fetch('/api/diagnosis-records', {
        headers: { 'x-session': token }
      });
      if (recordsRes.ok) {
        const recordsData = await recordsRes.json();
        setFbRecords(recordsData.fb_records || []);
        setTkRecords(recordsData.tk_records || []);
      }
    } catch (error) {
      console.error('Fetch data error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 开始TikTok授权
  const handleConnectTikTok = async () => {
    try {
      const client = await getSupabaseBrowserClientAsync();
      const { data: { session } } = await client.auth.getSession();
      const token = session?.access_token;
      
      if (!token) return;

      const res = await fetch('/api/auth/tiktok', {
        headers: { 'x-session': token }
      });
      
      if (res.ok) {
        const data = await res.json();
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('Connect TikTok error:', error);
    }
  };

  // 开始诊断（FB跳转截图上传，TK跳转审查问卷）
  const handleStartDiagnosis = () => {
    if (activeTab === 'fb') {
      router.push('/dashboard/analysis');
    } else {
      router.push('/rejection-check');
    }
  };

  // 重新诊断（已授权用户直接分析，无问卷）
  const handleTKRediagnosis = () => {
    setShowTimeRangeModal(true);
  };

  // 时间范围选择后执行诊断
  const handleConfirmTimeRange = async () => {
    setShowTimeRangeModal(false);
    setIsAnalyzing(true);
    
    try {
      const client = await getSupabaseBrowserClientAsync();
      const { data: { session } } = await client.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        router.push('/login');
        return;
      }

      // 调用诊断API，直接分析（复用上次问卷配置）
      const res = await fetch('/api/tiktok-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session': token
        },
        body: JSON.stringify({
          mode: 'full',
          time_range: selectedTimeRange,
          use_saved_config: true,  // 使用保存的配置，跳过问卷
          ad_data: adDataOverview  // 传递授权账号的广告数据
        })
      });

      if (res.ok) {
        const data = await res.json();
        // 跳转到结果页面或刷新记录
        fetchData();
      } else {
        const error = await res.json();
        console.error('Diagnosis error:', error);
      }
    } catch (error) {
      console.error('Diagnosis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 未登录状态
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <p className="text-blue-200">{locale === 'zh' ? '加载中...' : 'Loading...'}</p>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  // Tab按钮样式
  const tabButtonClass = (tab: 'fb' | 'tk') => `
    px-6 py-3 rounded-t-xl font-medium transition-all
    ${activeTab === tab 
      ? 'bg-white/10 text-white border-t border-l border-r border-white/20' 
      : 'bg-white/5 text-blue-200/70 hover:text-white hover:bg-white/8'
    }
  `;

  // TikTok 截图上传处理
  const handleTkScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setTkScreenshotFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setTkScreenshot(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // 识别截图
    setTkRecognizing(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('platform', 'tiktok');
      
      const res = await fetch('/api/analyze-screenshot', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      if (data.success) {
        setTkRecognizedData(data.data);
        setTkStep('preview');
      } else {
        alert(data.error || 'Screenshot recognition failed');
      }
    } catch (error) {
      console.error('Screenshot recognition error:', error);
      alert('Screenshot recognition failed');
    } finally {
      setTkRecognizing(false);
    }
  };

  // TikTok 分析处理
  const handleTkAnalyze = async () => {
    if (!tkRecognizedData) return;
    
    setTkAnalyzing(true);
    try {
      const res = await fetch('/api/tiktok-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaigns: [{
            name: tkRecognizedData.campaign_name || 'TikTok Campaign',
            spend: tkRecognizedData.spend || 0,
            impressions: tkRecognizedData.impressions || 0,
            clicks: tkRecognizedData.clicks || 0,
            ctr: tkRecognizedData.ctr || 0,
            cpc: tkRecognizedData.cpc || 0,
            conversions: tkRecognizedData.conversions || 0,
            cvr: tkRecognizedData.cvr || 0,
            cpa: tkRecognizedData.cpa || 0,
            roas: tkRecognizedData.roas || 0,
            video_views: tkRecognizedData.video_views || 0,
            '6s_views': tkRecognizedData['6s_views'] || 0,
            avg_watch_time: tkRecognizedData.avg_watch_time || 0,
          }],
          date_range: tkRecognizedData.date_range || 'Last 7 days',
          locale: locale,
        }),
      });
      
      const data = await res.json();
      if (data.success) {
        setTkAnalysisResult(data.data);
        setTkStep('result');
      } else {
        alert(data.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Analysis failed');
    } finally {
      setTkAnalyzing(false);
    }
  };

  // 重置 TikTok 截图上传
  const resetTkScreenshot = () => {
    setTkScreenshot(null);
    setTkScreenshotFile(null);
    setTkRecognizedData(null);
    setTkAnalysisResult(null);
    setTkStep('upload');
  };

  // FB Tab内容
  const renderFBTab = () => (
    <div className="space-y-6">
      {/* 历史诊断记录 */}
      {fbRecords.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">
            {locale === 'zh' ? '截图诊断记录' : 'Screenshot Diagnosis Records'}
          </h3>
          {fbRecords.map((record) => (
            <Card key={record.id} className="bg-white/5 border-white/10 hover:border-cyan-400/30 transition-all">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium truncate">{record.summary}</p>
                    <p className="text-blue-300/70 text-sm">
                      {new Date(record.created_at).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')}
                    </p>
                  </div>
                  <Link href={`/diagnosis/${record.id}`}>
                    <Button size="sm" className="bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30">
                      {locale === 'zh' ? '查看' : 'View'}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="py-8 text-center">
            <p className="text-blue-200/70 mb-4">
              {locale === 'zh' ? '完成Facebook截图诊断后，结果将显示在这里' : 'Facebook diagnosis results will appear here'}
            </p>
            <Button 
              onClick={handleStartDiagnosis}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white"
            >
              {locale === 'zh' ? '开始截图诊断' : 'Start Screenshot Diagnosis'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // TK Tab内容 - 截图上传诊断
  const renderTKTab = () => {
    return (
      <div className="space-y-6">
        {/* 步骤指示器 */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`flex items-center gap-2 ${tkStep === 'upload' ? 'text-purple-400' : 'text-blue-300/50'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tkStep === 'upload' ? 'bg-purple-500/20 border border-purple-400/30' : 'bg-white/5 border border-white/10'}`}>
              <Upload className="w-4 h-4" />
            </div>
            <span className="text-sm">{locale === 'zh' ? '上传截图' : 'Upload'}</span>
          </div>
          <div className="w-8 h-px bg-white/20"></div>
          <div className={`flex items-center gap-2 ${tkStep === 'preview' ? 'text-purple-400' : 'text-blue-300/50'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tkStep === 'preview' ? 'bg-purple-500/20 border border-purple-400/30' : 'bg-white/5 border border-white/10'}`}>
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-sm">{locale === 'zh' ? '预览数据' : 'Preview'}</span>
          </div>
          <div className="w-8 h-px bg-white/20"></div>
          <div className={`flex items-center gap-2 ${tkStep === 'result' ? 'text-purple-400' : 'text-blue-300/50'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tkStep === 'result' ? 'bg-purple-500/20 border border-purple-400/30' : 'bg-white/5 border border-white/10'}`}>
              <CheckCircle className="w-4 h-4" />
            </div>
            <span className="text-sm">{locale === 'zh' ? '分析结果' : 'Result'}</span>
          </div>
        </div>

        {/* Step 1: 上传截图 */}
        {tkStep === 'upload' && (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="py-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center border border-purple-400/30">
                  <Upload className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {locale === 'zh' ? '上传 TikTok 广告截图' : 'Upload TikTok Ads Screenshot'}
                </h3>
                <p className="text-blue-200/70 mb-6">
                  {locale === 'zh' 
                    ? '上传 TikTok Ads Manager 截图，自动识别数据并进行诊断分析' 
                    : 'Upload TikTok Ads Manager screenshot for automatic data recognition and diagnosis'}
                </p>
                
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleTkScreenshotUpload}
                    className="hidden"
                    disabled={tkRecognizing}
                  />
                  <div className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white rounded-lg inline-flex items-center gap-2 transition-all">
                    {tkRecognizing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {locale === 'zh' ? '识别中...' : 'Recognizing...'}
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        {locale === 'zh' ? '选择截图' : 'Choose Screenshot'}
                      </>
                    )}
                  </div>
                </label>
                <p className="text-blue-300/50 text-sm mt-4">
                  {locale === 'zh' ? '支持 PNG, JPG 格式' : 'Supports PNG, JPG'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: 预览数据 */}
        {tkStep === 'preview' && tkRecognizedData && (
          <div className="space-y-4">
            {/* 截图预览 */}
            {tkScreenshot && (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-medium flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-400" />
                      {locale === 'zh' ? '截图预览' : 'Screenshot Preview'}
                    </h4>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowTkPreview(!showTkPreview)}
                      className="text-blue-300/70 hover:text-white"
                    >
                      {showTkPreview ? (locale === 'zh' ? '收起' : 'Collapse') : (locale === 'zh' ? '展开' : 'Expand')}
                    </Button>
                  </div>
                  {showTkPreview && (
                    <div className="rounded-lg overflow-hidden border border-white/10">
                      <img src={tkScreenshot} alt="TikTok Screenshot" className="w-full h-auto" />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 识别结果 */}
            <Card className="bg-white/5 border-white/10">
              <CardContent className="py-4">
                <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  {locale === 'zh' ? '识别结果（可修正）' : 'Recognized Data (Editable)'}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-blue-300/70 text-xs">{locale === 'zh' ? '花费' : 'Spend'}</label>
                    <input
                      type="number"
                      value={tkRecognizedData.spend || ''}
                      onChange={(e) => setTkRecognizedData({...tkRecognizedData, spend: parseFloat(e.target.value) || 0})}
                      className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-blue-300/70 text-xs">{locale === 'zh' ? '展示量' : 'Impressions'}</label>
                    <input
                      type="number"
                      value={tkRecognizedData.impressions || ''}
                      onChange={(e) => setTkRecognizedData({...tkRecognizedData, impressions: parseInt(e.target.value) || 0})}
                      className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-blue-300/70 text-xs">{locale === 'zh' ? '点击量' : 'Clicks'}</label>
                    <input
                      type="number"
                      value={tkRecognizedData.clicks || ''}
                      onChange={(e) => setTkRecognizedData({...tkRecognizedData, clicks: parseInt(e.target.value) || 0})}
                      className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-blue-300/70 text-xs">CTR</label>
                    <input
                      type="number"
                      step="0.01"
                      value={tkRecognizedData.ctr || ''}
                      onChange={(e) => setTkRecognizedData({...tkRecognizedData, ctr: parseFloat(e.target.value) || 0})}
                      className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-blue-300/70 text-xs">CVR</label>
                    <input
                      type="number"
                      step="0.01"
                      value={tkRecognizedData.cvr || ''}
                      onChange={(e) => setTkRecognizedData({...tkRecognizedData, cvr: parseFloat(e.target.value) || 0})}
                      className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-blue-300/70 text-xs">ROAS</label>
                    <input
                      type="number"
                      step="0.1"
                      value={tkRecognizedData.roas || ''}
                      onChange={(e) => setTkRecognizedData({...tkRecognizedData, roas: parseFloat(e.target.value) || 0})}
                      className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-blue-300/70 text-xs">{locale === 'zh' ? '视频播放量' : 'Video Views'}</label>
                    <input
                      type="number"
                      value={tkRecognizedData.video_views || ''}
                      onChange={(e) => setTkRecognizedData({...tkRecognizedData, video_views: parseInt(e.target.value) || 0})}
                      className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-blue-300/70 text-xs">{locale === 'zh' ? '6秒观看率' : '6s View Rate'}</label>
                    <input
                      type="number"
                      step="0.1"
                      value={tkRecognizedData['6s_views'] || ''}
                      onChange={(e) => setTkRecognizedData({...tkRecognizedData, '6s_views': parseFloat(e.target.value) || 0})}
                      className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={handleTkAnalyze}
                    disabled={tkAnalyzing}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white"
                  >
                    {tkAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {locale === 'zh' ? '分析中...' : 'Analyzing...'}
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {locale === 'zh' ? '开始分析' : 'Start Analysis'}
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetTkScreenshot}
                    className="border-white/20 text-blue-200 hover:bg-white/5"
                  >
                    {locale === 'zh' ? '重新上传' : 'Re-upload'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: 分析结果 */}
        {tkStep === 'result' && tkAnalysisResult && (
          <div className="space-y-4">
            <Card className="bg-white/5 border-white/10">
              <CardContent className="py-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white font-medium flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    {locale === 'zh' ? '分析结果' : 'Analysis Result'}
                  </h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={resetTkScreenshot}
                    className="border-white/20 text-blue-200 hover:bg-white/5"
                  >
                    {locale === 'zh' ? '新的分析' : 'New Analysis'}
                  </Button>
                </div>
                {/* 显示 TikTok 报告 */}
                <div className="mt-4">
                  <TikTokReport data={tkAnalysisResult} locale={locale} />
                </div>
              </CardContent>
            </Card>
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
          <div className="flex border-b border-white/20">
            <button onClick={() => setActiveTab('fb')} className={tabButtonClass('fb')}>
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold">FB</span>
                Facebook
              </span>
            </button>
            <button onClick={() => setActiveTab('tk')} className={tabButtonClass('tk')}>
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-purple-500/20 flex items-center justify-center text-purple-400 text-xs font-bold">TK</span>
                TikTok
              </span>
            </button>
          </div>

          {/* Tab内容 */}
          <div className="bg-white/5 border border-white/10 border-t-0 rounded-b-xl p-6">
            {loading ? (
              <div className="py-12 text-center">
                <p className="text-blue-200">{locale === 'zh' ? '加载中...' : 'Loading...'}</p>
              </div>
            ) : (
              activeTab === 'fb' ? renderFBTab() : renderTKTab()
            )}
          </div>

          {/* 返回首页 */}
          <div className="mt-6 text-center">
            <Link href="/">
              <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-cyan-400">
                {locale === 'zh' ? '返回首页' : 'Back to Home'}
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* 时间范围选择弹窗 */}
      {showTimeRangeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-indigo-900 rounded-2xl p-6 max-w-md w-full border border-white/20 shadow-xl">
            {/* 图标 */}
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center border border-purple-400/30">
              <svg className="w-7 h-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 002-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            
            {/* 标题 */}
            <h3 className="text-xl font-semibold text-white text-center mb-2">
              {locale === 'zh' ? '选择数据时间范围' : 'Select Data Time Range'}
            </h3>
            <p className="text-blue-200/70 text-center mb-6">
              {locale === 'zh' ? '选择要分析的广告数据时间范围' : 'Select the time range for ad data analysis'}
            </p>

            {/* 时间选项 */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {(['7', '14', '30'] as const).map((days) => (
                <button
                  key={days}
                  onClick={() => setSelectedTimeRange(days)}
                  className={`p-4 rounded-xl border transition-all ${
                    selectedTimeRange === days 
                      ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400 shadow-lg shadow-purple-500/20 scale-105' 
                      : 'bg-white/5 border-white/20 hover:border-purple-400/50 hover:bg-white/10'
                  }`}
                >
                  <div className={`text-2xl font-bold ${selectedTimeRange === days ? 'text-purple-300' : 'text-white'}`}>
                    {days}
                  </div>
                  <div className={`text-sm ${selectedTimeRange === days ? 'text-purple-200' : 'text-blue-200/70'}`}>
                    {locale === 'zh' ? '天' : 'days'}
                  </div>
                </button>
              ))}
            </div>

            {/* 按钮 */}
            <div className="space-y-3">
              <Button 
                onClick={handleConfirmTimeRange}
                disabled={isAnalyzing}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white py-3"
              >
                {isAnalyzing 
                  ? (locale === 'zh' ? '分析中...' : 'Analyzing...') 
                  : (locale === 'zh' ? '开始诊断' : 'Start Diagnosis')
                }
              </Button>
              <Button 
                onClick={() => setShowTimeRangeModal(false)}
                variant="outline"
                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                {locale === 'zh' ? '取消' : 'Cancel'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
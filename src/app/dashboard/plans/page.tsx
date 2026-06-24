'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useI18n } from '@/lib/i18n-context';
import { useAuth } from '@/lib/auth-context';
import { getSupabaseBrowserClientAsync } from '@/lib/supabase-browser';

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
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7' | '14' | '30'>('7');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
          use_saved_config: true  // 使用保存的配置，跳过问卷
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

  // TK Tab内容 - 根据授权状态显示不同内容
  const renderTKTab = () => {
    // 已授权状态
    if (tiktokConnection?.is_connected) {
      return (
        <div className="space-y-6">
          {/* 连接状态卡片 */}
          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400/30">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white font-bold">TK</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {tiktokConnection.advertiser_name || tiktokConnection.advertiser_id}
                    </p>
                    <p className="text-purple-300/70 text-sm">
                      {locale === 'zh' ? '已连接' : 'Connected'}
                    </p>
                  </div>
                </div>
                <Button 
                  size="sm"
                  onClick={handleConnectTikTok}
                  className="bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
                >
                  {locale === 'zh' ? '刷新授权' : 'Refresh'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 广告数据概览 */}
          {adDataOverview && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-white/5 border-white/10">
                <CardContent className="py-4 text-center">
                  <p className="text-2xl font-bold text-white">${adDataOverview.total_spend.toFixed(2)}</p>
                  <p className="text-blue-300/70 text-sm">{locale === 'zh' ? '总花费' : 'Total Spend'}</p>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10">
                <CardContent className="py-4 text-center">
                  <p className="text-2xl font-bold text-white">{adDataOverview.total_impressions.toLocaleString()}</p>
                  <p className="text-blue-300/70 text-sm">{locale === 'zh' ? '曝光量' : 'Impressions'}</p>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10">
                <CardContent className="py-4 text-center">
                  <p className="text-2xl font-bold text-white">{adDataOverview.active_campaigns}</p>
                  <p className="text-blue-300/70 text-sm">{locale === 'zh' ? '活跃广告' : 'Active Campaigns'}</p>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10">
                <CardContent className="py-4 text-center">
                  <p className="text-2xl font-bold text-cyan-400">{adDataOverview.total_conversions}</p>
                  <p className="text-blue-300/70 text-sm">{locale === 'zh' ? '转化数' : 'Conversions'}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 历史诊断记录 */}
          {tkRecords.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">
                {locale === 'zh' ? 'TikTok诊断记录' : 'TikTok Diagnosis Records'}
              </h3>
              {tkRecords.map((record) => (
                <Card key={record.id} className="bg-white/5 border-white/10 hover:border-purple-400/30 transition-all">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            record.diagnosis_type === 'full' 
                              ? 'bg-purple-500/20 text-purple-400' 
                              : 'bg-cyan-500/20 text-cyan-400'
                          }`}>
                            {record.diagnosis_type === 'full' 
                              ? (locale === 'zh' ? '完整诊断' : 'Full Diagnosis')
                              : (locale === 'zh' ? '轻量建议' : 'Light Advice')
                            }
                          </span>
                          <span className="text-blue-300/70 text-xs">
                            {record.time_range || '7d'}
                          </span>
                        </div>
                        <p className="text-white font-medium truncate mt-1">{record.summary}</p>
                        <p className="text-blue-300/70 text-sm">
                          {new Date(record.created_at).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')}
                        </p>
                      </div>
                      <Link href={`/diagnosis/${record.id}`}>
                        <Button size="sm" className="bg-purple-500/20 text-purple-400 hover:bg-purple-500/30">
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
                  {locale === 'zh' ? '已连接TikTok账号，可直接进行完整诊断' : 'TikTok connected, ready for full diagnosis'}
                </p>
                <Button 
                  onClick={handleTKRediagnosis}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white"
                >
                  {locale === 'zh' ? '重新诊断' : 'Re-Diagnosis'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      );
    }

    // 未授权 + 有使用记录
    if (tkRecords.length > 0) {
      return (
        <div className="space-y-6">
          {/* 授权提示 */}
          <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-400/30">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                    <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {locale === 'zh' ? '连接TikTok账号获取完整诊断' : 'Connect TikTok for full diagnosis'}
                    </p>
                    <p className="text-blue-300/70 text-sm">
                      {locale === 'zh' ? '获取真实广告数据，进行完整四层审查' : 'Get real ad data for complete 4-layer review'}
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={handleConnectTikTok}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white"
                >
                  {locale === 'zh' ? '连接账号' : 'Connect'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 历史轻量建议记录 */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">
              {locale === 'zh' ? '轻量建议记录' : 'Light Advice Records'}
            </h3>
            {tkRecords.map((record) => (
              <Card key={record.id} className="bg-white/5 border-white/10 hover:border-cyan-400/30 transition-all">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded text-xs bg-cyan-500/20 text-cyan-400">
                        {locale === 'zh' ? '轻量建议' : 'Light Advice'}
                      </span>
                      <p className="text-white font-medium truncate mt-1">{record.summary}</p>
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
        </div>
      );
    }

    // 未授权 + 无使用记录
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center border border-purple-400/30">
            <span className="text-2xl font-bold text-purple-400">TK</span>
          </div>
          <p className="text-blue-200/70 mb-6">
            {locale === 'zh' 
              ? '完成TikTok诊断后，结果将显示在这里' 
              : 'TikTok diagnosis results will appear here after completion'}
          </p>
          <Button 
            onClick={handleStartDiagnosis}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white"
          >
            {locale === 'zh' ? '开始诊断' : 'Start Diagnosis'}
          </Button>
        </CardContent>
      </Card>
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
'use client';

import { useEffect, useState, useCallback, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/lib/i18n-context';
import { useAuth } from '@/lib/auth-context';
import { getSupabaseBrowserClientAsync } from '@/lib/supabase-browser';
import { Download, BarChart3, LineChart, Target, Wallet, AlertTriangle } from 'lucide-react';

// 截图数据类型
interface SnapshotData {
  campaign_name: string | null;
  snapshot_date: string | null;
  spend: number | null;
  impressions: number | null;
  clicks: number | null;
  ctr: number | null;
  cpc: number | null;
  conversions: number | null;
  cpa: number | null;
  roas: number | null;
  raw_image_url?: string;
  file_key?: string;
}

// 历史数据类型
interface HistorySnapshot {
  id: string;
  campaign_name: string | null;
  snapshot_date: string | null;
  spend: number | null;
  impressions: number | null;
  clicks: number | null;
  ctr: number | null;
  cpc: number | null;
  conversions: number | null;
  cpa: number | null;
  roas: number | null;
  created_at: string;
}

// 规则分析结果类型
interface AnalysisResult {
  overall_score: string;
  metrics: Array<{
    name: string;
    value: number | null;
    rating: string;
    benchmark: string;
    level: string;
  }>;
  issues: string[];
  trends: string[];
  recommendations: string[];
  risks?: Array<{
    level: 'urgent' | 'warning' | 'info';
    message: string;
    metric: string;
    value: number;
    threshold: number;
  }>;
  action_priorities?: Array<{
    priority: number;
    metric: string;
    action: string;
    impact: 'high' | 'medium' | 'low';
  }>;
}

// 用户方案类型
interface UserPlan {
  route: string;
  budget: string;
  goal: string;
}

// 获取路线中文名称
function getRouteName(route: string, locale: string): string {
  const routeNames: Record<string, Record<string, string>> = {
    'retailer': { zh: '零售商', en: 'Retailer' },
    'manufacturer': { zh: '制造商', en: 'Manufacturer' },
    'local_service': { zh: '本地服务商', en: 'Local Service' },
    'brand': { zh: '品牌方', en: 'Brand Owner' },
    'basic': { zh: '基础通用方案', en: 'Basic Plan' },
  };
  return routeNames[route]?.[locale] || route;
}

// 翻译函数：将中文分析结果翻译为英文
function translateAnalysisResult(result: AnalysisResult, locale: string): AnalysisResult {
  if (locale === 'zh') return result;
  
  // 评分翻译
  const ratingMap: Record<string, string> = {
    '优秀': 'Excellent',
    '好': 'Good',
    '一般': 'Average',
    '差': 'Poor',
    '无数据': 'No Data',
    '未知': 'Unknown',
  };
  
  // 指标名称翻译
  const metricNameMap: Record<string, string> = {
    'CTR': 'CTR',
    'CPC': 'CPC',
    'CPA': 'CPA',
    'ROAS': 'ROAS',
    '转化率': 'Conv. Rate',
    '频次': 'Frequency',
  };
  
  // 翻译指标
  const translatedMetrics = result.metrics.map(m => ({
    ...m,
    name: metricNameMap[m.name] || m.name,
    rating: ratingMap[m.rating] || m.rating,
  }));
  
  // 翻译问题
  const translateIssue = (issue: string): string => {
    if (issue.includes('CTR 表现良好但转化率偏低')) return 'CTR is good but conversion rate is low - creative works but landing page needs optimization';
    if (issue.includes('CTR 低且 CPA 高')) return 'Low CTR and high CPA - creative/audience mismatch, consider pausing or adjusting';
    if (issue.includes('CPA 高且 ROAS 低')) return 'High CPA and low ROAS - overall loss, need major strategy adjustment';
    if (issue.includes('频次偏高')) return 'Frequency is high, consider expanding audience or refreshing creative';
    if (issue.includes('CTR 偏低')) return 'CTR is low, optimize creative or adjust audience targeting';
    if (issue.includes('ROAS 偏低')) return 'ROAS is low, ad return is insufficient, optimize conversion path';
    return issue;
  };
  
  // 翻译趋势
  const translateTrend = (trend: string): string => {
    return trend.replace('上升', 'increased').replace('下降', 'decreased')
      .replace('表现改善', 'improvement').replace('需关注', 'needs attention')
      .replace('较上期', 'vs previous period ');
  };
  
  // 翻译建议
  const translateRecommendation = (rec: string): string => {
    if (rec.includes('上传第一张截图')) return 'Upload your first screenshot to unlock AI analysis';
    if (rec.includes('CTR 表现良好')) return 'CTR is performing well, maintain current creative strategy';
    if (rec.includes('CPA 控制得当')) return 'CPA is well controlled, consider increasing budget to scale';
    if (rec.includes('ROAS 表现优秀')) return 'ROAS is excellent, ad return is healthy';
    if (rec.includes('优化素材创意')) return 'Optimize creative, test different copy and visual elements';
    if (rec.includes('CPA 偏高')) return 'CPA is high, optimize audience targeting or adjust bidding strategy';
    if (rec.includes('ROAS 偏低')) return 'ROAS is low, optimize landing page conversion path';
    if (rec.includes('持续监控')) return 'Continue monitoring key metrics and adjust strategy based on data changes';
    return rec;
  };
  
  // 翻译风险提示
  const translateRisk = (risk: { level: 'urgent' | 'warning' | 'info'; message: string; metric: string; value: number; threshold: number }): { level: 'urgent' | 'warning' | 'info'; message: string; metric: string; value: number; threshold: number } => {
    let message = risk.message;
    let metric = risk.metric;
    // 翻译 metric 名称
    if (metric === '频次') metric = 'Frequency';
    if (metric === '转化率') metric = 'Conv. Rate';
    // 翻译 message
    if (risk.metric === 'CPC') message = `CPC $${risk.value.toFixed(2)} is high (benchmark $0.8-1.5), wasting budget daily`;
    else if (risk.metric === 'ROAS') message = `ROAS ${risk.value.toFixed(1)}x below 3x profitability line`;
    else if (risk.metric === 'CPA') message = `CPA $${risk.value.toFixed(2)} is too high, acquisition cost out of control`;
    else if (risk.metric === '频次') message = `Frequency ${risk.value.toFixed(1)} is high, audience may be fatigued`;
    else if (risk.metric === 'CTR') message = `CTR ${risk.value.toFixed(2)}% is low, low creative appeal`;
    return { ...risk, message, metric };
  };
  
  // 翻译行动优先级
  const translateAction = (action: { priority: number; metric: string; action: string; impact: 'high' | 'medium' | 'low' }): { priority: number; metric: string; action: string; impact: 'high' | 'medium' | 'low' } => {
    let translatedAction = action.action;
    let translatedMetric = action.metric;
    // 翻译 metric 名称
    if (translatedMetric === '频次') translatedMetric = 'Frequency';
    if (translatedMetric === '转化率') translatedMetric = 'Conv. Rate';
    // 提取数值
    const cpcMatch = action.action.match(/\$[\d.]+/);
    const roasMatch = action.action.match(/[\d.]+x/);
    const rateMatch = action.action.match(/[\d.]+%/);
    const freqMatch = action.action.match(/[\d.]+/);
    
    if (action.metric === 'CPC') translatedAction = `Pause current ad sets, test new creative to lower CPC (current $${cpcMatch?.[0]?.replace('$', '') || ''}, target < $1.5)`;
    else if (action.metric === 'ROAS') translatedAction = `Don't increase budget yet, optimize conversion path to improve ROAS (current ${roasMatch?.[0] || ''}, target > 3x)`;
    else if (action.metric === 'CPA') translatedAction = `Optimize audience targeting or adjust bidding (current $${cpcMatch?.[0]?.replace('$', '') || ''}, target < $25)`;
    else if (action.metric === '频次') translatedAction = `Expand audience or refresh creative to lower frequency (current ${freqMatch?.[0] || ''}, target < 2)`;
    else if (action.metric === 'CTR') translatedAction = `Optimize creative, test different copy and visuals (current ${rateMatch?.[0] || ''}, target > 1.5%)`;
    else if (action.metric === '转化率') translatedAction = `Optimize landing page experience to improve conversion rate (current ${rateMatch?.[0] || ''}, target > 2%)`;
    return { ...action, action: translatedAction, metric: translatedMetric };
  };
  
  return {
    ...result,
    overall_score: ratingMap[result.overall_score] || result.overall_score,
    metrics: translatedMetrics,
    issues: result.issues.map(translateIssue),
    trends: result.trends.map(translateTrend),
    recommendations: result.recommendations.map(translateRecommendation),
    risks: result.risks?.map(translateRisk),
    action_priorities: result.action_priorities?.map(translateAction),
  };
}

function AnalysisContent() {
  const { locale } = useI18n();
  const { user, isPremium, subscription } = useAuth();
  const searchParams = useSearchParams();
  const daysFilter = searchParams.get('days') || '30';
  
  // 状态管理
  const [uploading, setUploading] = useState(false);
  const [extractedData, setExtractedData] = useState<SnapshotData | null>(null);
  const [saving, setSaving] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | string | null>(null);
  const [historyData, setHistoryData] = useState<HistorySnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState(daysFilter);
  const [error, setError] = useState<string>('');
  const [dragOver, setDragOver] = useState(false);
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [checkingPlan, setCheckingPlan] = useState(true);
  const [quota, setQuota] = useState<{ used: number; limit: number; remaining: number } | null>(null);

  // 检查用户是否有保存的方案
  const checkUserPlan = useCallback(async () => {
    if (!user) {
      setCheckingPlan(false);
      return;
    }
    
    try {
      const client = await getSupabaseBrowserClientAsync();
      const { data: plans } = await client
        .from('plans')
        .select('route, budget, goal')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (plans && plans.length > 0) {
        setUserPlan(plans[0]);
      }
    } catch (err) {
      console.error('检查方案错误:', err);
    } finally {
      setCheckingPlan(false);
    }
  }, [user?.id]);

  // 用户是否有访问权限（有方案 OR 有订阅）
  const hasAccess = userPlan !== null || isPremium;

  // 获取截图识别额度
  const fetchQuota = useCallback(async () => {
    if (!user) return;
    
    try {
      const client = await getSupabaseBrowserClientAsync();
      const { data: sessionData } = await client.auth.getSession();
      const token = sessionData.session?.access_token;
      
      if (!token) return;

      const response = await fetch('/api/screenshot-quota', {
        headers: { 'x-session': token }
      });

      if (response.ok) {
        const data = await response.json();
        setQuota(data);
      }
    } catch (err) {
      console.error('获取额度错误:', err);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      checkUserPlan();
      fetchQuota();
    }
  }, [user?.id]);

  // 获取历史数据和分析
  const fetchHistoryAndAnalysis = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const client = await getSupabaseBrowserClientAsync();
      const { data: sessionData } = await client.auth.getSession();
      const token = sessionData.session?.access_token;
      
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/ad-analysis?days=${selectedDays}`, {
        headers: { 'x-session': token }
      });

      if (response.ok) {
        const data = await response.json();
        setHistoryData(data.data || []);
        setAnalysis(data.analysis || null);
        // 如果API返回了方案信息，更新本地状态
        if (data.planInfo) {
          setUserPlan(data.planInfo);
        }
      }
    } catch (err) {
      console.error('获取历史数据错误:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, selectedDays]);

  // 使用 ref 跟踪是否已经执行过
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (user && hasAccess && !checkingPlan && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchHistoryAndAnalysis();
    }
  }, [user?.id, hasAccess, checkingPlan]);

  // 处理文件上传
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    
    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError(locale === 'zh' ? '只支持 JPG、PNG、WEBP 格式' : 'Only JPG, PNG, WEBP formats supported');
      return;
    }

    // 验证文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError(locale === 'zh' ? '图片过大，请重新截图（最大5MB）' : 'Image too large, max 5MB');
      return;
    }

    setUploading(true);
    setError('');
    setExtractedData(null);

    try {
      const client = await getSupabaseBrowserClientAsync();
      const { data: sessionData } = await client.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        setError(locale === 'zh' ? '请先登录' : 'Please login first');
        setUploading(false);
        return;
      }

      // 创建 FormData
      const formData = new FormData();
      formData.append('image', file);

      // 调用截图识别 API
      const response = await fetch('/api/analyze-screenshot', {
        method: 'POST',
        headers: { 'x-session': token },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === 'QUOTA_EXCEEDED') {
          // 额度用完，显示升级提示
          setError(data.message || (locale === 'zh' ? '本月截图识别次数已用完，请升级套餐' : "You've used all your campaign reviews this month. Upgrade your plan to continue."));
        } else {
          setError(data.error || (locale === 'zh' ? '识别失败，请重试' : 'Recognition failed, please retry'));
        }
      } else {
        setExtractedData(data);
        // 更新额度信息
        if (data.quota) {
          setQuota(data.quota);
        }
      }
    } catch (err) {
      console.error('上传错误:', err);
      setError(locale === 'zh' ? '上传失败，请重试' : 'Upload failed, please retry');
    } finally {
      setUploading(false);
    }
  };

  // 拖拽上传处理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // 确认保存
  const handleConfirm = async () => {
    if (!extractedData) return;
    
    setSaving(true);
    setError('');

    try {
      const client = await getSupabaseBrowserClientAsync();
      const { data: sessionData } = await client.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        setError(locale === 'zh' ? '请先登录' : 'Please login first');
        setSaving(false);
        return;
      }

      const response = await fetch('/api/confirm-snapshot', {
        method: 'POST',
        headers: {
          'x-session': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(extractedData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || (locale === 'zh' ? '保存失败' : 'Save failed'));
      } else {
        // 保存成功，显示"AI 分析中..."
        setExtractedData(null);
        setAnalysis(locale === 'zh' ? 'AI 分析中...' : 'AI analysis is generating...');
        // 如果API返回了方案信息，更新本地状态
        if (data.planInfo) {
          setUserPlan(data.planInfo);
        }
        fetchHistoryAndAnalysis();
        
        // 开始轮询 /api/analysis-status，每 3 秒一次，最多 60 秒
        const maxPollTime = 60000;
        const pollInterval = 3000;
        const startTime = Date.now();
        
        const pollAnalysis = async () => {
          if (Date.now() - startTime >= maxPollTime) {
            // 超时，显示提示信息
            setAnalysis(locale === 'zh' ? '分析超时，请稍后刷新' : 'Analysis timeout, please refresh later');
            return;
          }
          
          try {
            const statusResponse = await fetch('/api/analysis-status', {
              headers: { 'x-session': token },
            });
            
            if (statusResponse.ok) {
              const statusData = await statusResponse.json();
              
              if (statusData.analysis) {
                // 拿到结果，停止轮询，渲染到 AI Analysis 区域
                setAnalysis(statusData.analysis);
                return;
              }
            }
          } catch (err) {
            console.error('轮询分析状态失败:', err);
          }
          
          // 继续轮询
          setTimeout(pollAnalysis, pollInterval);
        };
        
        // 延迟 3 秒后开始第一次轮询
        setTimeout(pollAnalysis, pollInterval);
      }
    } catch (err) {
      console.error('保存错误:', err);
      setError(locale === 'zh' ? '保存失败，请重试' : 'Save failed, please retry');
    } finally {
      setSaving(false);
    }
  };

  // 更新提取数据
  const updateField = (field: keyof SnapshotData, value: string | number | null) => {
    if (!extractedData) return;
    setExtractedData({
      ...extractedData,
      [field]: value === '' ? null : value,
    });
  };

  // Loading状态
  if (checkingPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <Card className="w-full max-w-md bg-white/5 border-white/20 backdrop-blur-sm shadow-xl relative z-10">
          <CardContent className="text-center py-12">
            <p className="text-blue-200 mb-6">{locale === 'zh' ? '请登录以使用分析功能' : 'Please login to use analysis features'}</p>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 to-blue-500 text-white shadow-lg shadow-cyan-500/30">
                {locale === 'zh' ? '登录' : 'Login'}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* 网格纹理背景 */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      
      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* 页面标题 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {locale === 'zh' ? '广告截图分析' : 'Ad Snapshot Analysis'}
            </h1>
            <p className="text-blue-200">
              {locale === 'zh' ? '上传截图，AI自动提取指标并分析' : 'Upload snapshots, AI extracts metrics and analyzes'}
            </p>
          </div>

          {/* 用户方案信息卡片 */}
          {userPlan && (
            <Card className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-cyan-400/30 backdrop-blur-sm shadow-xl mb-6">
              <CardContent className="py-4">
                <div className="flex items-center gap-6 justify-center flex-wrap">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-cyan-400" />
                    <span className="text-blue-200">
                      {locale === 'zh' ? '路线：' : 'Route: '}
                    </span>
                    <span className="text-white font-semibold">
                      {getRouteName(userPlan.route, locale)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-cyan-400" />
                    <span className="text-blue-200">
                      {locale === 'zh' ? '预算：' : 'Budget: '}
                    </span>
                    <span className="text-white font-semibold">{userPlan.budget}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-cyan-400" />
                    <span className="text-blue-200">
                      {locale === 'zh' ? '目标：' : 'Goal: '}
                    </span>
                    <span className="text-white font-semibold">{userPlan.goal}</span>
                  </div>
                </div>
                <p className="text-center text-blue-300/70 text-sm mt-3">
                  {locale === 'zh' 
                    ? 'AI分析将基于您的策略设置给出针对性建议'
                    : 'AI analysis will provide tailored suggestions based on your strategy settings'}
                </p>
              </CardContent>
            </Card>
          )}

          {/* 区域1：上传区 */}
          <Card className="bg-white/5 border-white/20 backdrop-blur-sm shadow-xl mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Download className="w-5 h-5 text-cyan-400" />
                {locale === 'zh' ? '上传截图' : 'Upload Snapshot'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* 拖拽上传区域 */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  dragOver 
                    ? 'border-cyan-400 bg-cyan-400/10' 
                    : 'border-white/20 bg-white/5 hover:border-cyan-400/50 hover:bg-white/10'
                }`}
              >
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  {uploading ? (
                    <div className="text-blue-200">
                      <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                      {locale === 'zh' ? '正在识别...' : 'Analyzing...'}
                    </div>
                  ) : (
                    <div className="text-blue-200">
                      <Download className="w-10 h-10 mx-auto mb-4 text-cyan-400" />
                      <p className="text-lg mb-2">
                        {locale === 'zh' ? '拖拽或点击上传截图' : 'Drag or click to upload'}
                      </p>
                      <p className="text-sm">
                        {locale === 'zh' ? '支持 JPG、PNG、WEBP，最大 5MB' : 'JPG, PNG, WEBP, max 5MB'}
                      </p>
                    </div>
                  )}
                </label>
              </div>

              {/* 错误提示 */}
              {error && (
                <div className="mt-4 p-4 bg-red-500/20 border-red-400/30 rounded-xl text-red-400 text-center">
                  {error}
                </div>
              )}

              {/* AI提取结果（可编辑） */}
              {extractedData && (
                <div className="mt-6 p-6 bg-white/5 border-white/20 rounded-xl">
                  <h3 className="text-white font-semibold mb-4">
                    {locale === 'zh' ? 'AI提取结果（可编辑修正）' : 'AI Extracted Results (Editable)'}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-blue-200 text-sm mb-1 block">
                        {locale === 'zh' ? '广告系列名称' : 'Campaign Name'}
                      </label>
                      <Input
                        value={extractedData.campaign_name || ''}
                        onChange={(e) => updateField('campaign_name', e.target.value)}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-blue-200 text-sm mb-1 block">
                        {locale === 'zh' ? '截图日期' : 'Snapshot Date'}
                      </label>
                      <Input
                        type="date"
                        value={extractedData.snapshot_date || ''}
                        onChange={(e) => updateField('snapshot_date', e.target.value)}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-blue-200 text-sm mb-1 block">
                        {locale === 'zh' ? '花费 ($)' : 'Spend ($)'}
                      </label>
                      <Input
                        type="number"
                        value={extractedData.spend || ''}
                        onChange={(e) => updateField('spend', e.target.value ? parseFloat(e.target.value) : null)}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-blue-200 text-sm mb-1 block">
                        {locale === 'zh' ? '展示次数' : 'Impressions'}
                      </label>
                      <Input
                        type="number"
                        value={extractedData.impressions || ''}
                        onChange={(e) => updateField('impressions', e.target.value ? parseInt(e.target.value) : null)}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-blue-200 text-sm mb-1 block">
                        {locale === 'zh' ? '点击次数' : 'Clicks'}
                      </label>
                      <Input
                        type="number"
                        value={extractedData.clicks || ''}
                        onChange={(e) => updateField('clicks', e.target.value ? parseInt(e.target.value) : null)}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-blue-200 text-sm mb-1 block">
                        {locale === 'zh' ? 'CTR (%)' : 'CTR (%)'}
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={extractedData.ctr || ''}
                        onChange={(e) => updateField('ctr', e.target.value ? parseFloat(e.target.value) : null)}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-blue-200 text-sm mb-1 block">
                        {locale === 'zh' ? 'CPC ($)' : 'CPC ($)'}
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={extractedData.cpc || ''}
                        onChange={(e) => updateField('cpc', e.target.value ? parseFloat(e.target.value) : null)}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-blue-200 text-sm mb-1 block">
                        {locale === 'zh' ? '转化次数' : 'Conversions'}
                      </label>
                      <Input
                        type="number"
                        value={extractedData.conversions || ''}
                        onChange={(e) => updateField('conversions', e.target.value ? parseInt(e.target.value) : null)}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-blue-200 text-sm mb-1 block">
                        {locale === 'zh' ? 'CPA ($)' : 'CPA ($)'}
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={extractedData.cpa || ''}
                        onChange={(e) => updateField('cpa', e.target.value ? parseFloat(e.target.value) : null)}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-blue-200 text-sm mb-1 block">
                        {locale === 'zh' ? 'ROAS' : 'ROAS'}
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={extractedData.roas || ''}
                        onChange={(e) => updateField('roas', e.target.value ? parseFloat(e.target.value) : null)}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                  </div>
                  
                  {/* 确认按钮 */}
                  <div className="mt-6 flex justify-center">
                    <Button
                      onClick={handleConfirm}
                      disabled={saving}
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/30 px-8"
                    >
                      {saving ? (
                        <span className="flex items-center gap-2">
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                          {locale === 'zh' ? '保存中...' : 'Saving...'}
                        </span>
                      ) : (
                        locale === 'zh' ? '确认入库' : 'Confirm & Save'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 区域2：数据区 */}
          <Card className="bg-white/5 border-white/20 backdrop-blur-sm shadow-xl mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                  {locale === 'zh' ? '历史数据' : 'Historical Data'}
                </span>
                {/* 时间范围筛选 */}
                <select
                  value={selectedDays}
                  onChange={(e) => setSelectedDays(e.target.value)}
                  className="bg-white/10 border-white/20 text-white rounded-lg px-3 py-1"
                >
                  <option value="7">{locale === 'zh' ? '最近7天' : 'Last 7 days'}</option>
                  <option value="30">{locale === 'zh' ? '最近30天' : 'Last 30 days'}</option>
                  <option value="90">{locale === 'zh' ? '最近90天' : 'Last 90 days'}</option>
                </select>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-blue-200">{locale === 'zh' ? '加载中...' : 'Loading...'}</p>
                </div>
              ) : historyData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-blue-200">
                    {locale === 'zh' ? '暂无历史数据，上传第一张截图开始分析' : 'No data yet, upload your first snapshot'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/20">
                        <th className="text-left py-3 px-4 text-blue-200">{locale === 'zh' ? '日期' : 'Date'}</th>
                        <th className="text-left py-3 px-4 text-blue-200">{locale === 'zh' ? '广告系列' : 'Campaign'}</th>
                        <th className="text-right py-3 px-4 text-blue-200">{locale === 'zh' ? '花费' : 'Spend'}</th>
                        <th className="text-right py-3 px-4 text-blue-200">{locale === 'zh' ? 'CTR' : 'CTR'}</th>
                        <th className="text-right py-3 px-4 text-blue-200">{locale === 'zh' ? 'CPC' : 'CPC'}</th>
                        <th className="text-right py-3 px-4 text-blue-200">{locale === 'zh' ? 'CPA' : 'CPA'}</th>
                        <th className="text-right py-3 px-4 text-blue-200">{locale === 'zh' ? 'ROAS' : 'ROAS'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyData.map((snapshot) => (
                        <tr key={snapshot.id} className="border-b border-white/10 hover:bg-white/5">
                          <td className="py-3 px-4 text-white">
                            {snapshot.snapshot_date || new Date(snapshot.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-white truncate max-w-[150px]">
                            {snapshot.campaign_name || '-'}
                          </td>
                          <td className="py-3 px-4 text-right text-white">
                            ${snapshot.spend?.toFixed(2) || '-'}
                          </td>
                          <td className="py-3 px-4 text-right text-white">
                            {snapshot.ctr?.toFixed(2)}%
                          </td>
                          <td className="py-3 px-4 text-right text-white">
                            ${snapshot.cpc?.toFixed(2) || '-'}
                          </td>
                          <td className="py-3 px-4 text-right text-white">
                            ${snapshot.cpa?.toFixed(2) || '-'}
                          </td>
                          <td className="py-3 px-4 text-right text-white">
                            {snapshot.roas?.toFixed(2) || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 区域3：分析区 - 渐变背景 */}
          <Card className="bg-transparent border-white/20 backdrop-blur-sm shadow-xl" style={{ background: 'linear-gradient(to bottom right, rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.1))' }}>
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <LineChart className="w-5 h-5 text-cyan-400" />
                {locale === 'zh' ? 'AI分析结论' : 'AI Analysis'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto"></div>
                </div>
              ) : typeof analysis === 'string' ? (
                <div className="text-blue-100 leading-relaxed whitespace-pre-wrap">
                  {analysis}
                </div>
              ) : analysis ? (
                (() => {
                  // 新的分析结果格式 v2.0
                  const v2Analysis = analysis as unknown as {
                    diagnosis?: { pattern: string; conclusion: string; confidence: string };
                    trends?: { has_history: boolean; previous_date?: string; changes: Array<{ metric: string; prev: number; curr: number; change_pct: number; direction: string; quality: string }>; summary: string };
                    actions?: Array<{ priority: number; type: string; metric: string; action: string; evidence: string }>;
                  };
                  
                  // 如果是旧格式，使用旧的翻译函数
                  if ('overall_score' in analysis) {
                    const translatedAnalysis = translateAnalysisResult(analysis, locale);
                    return (
                      <div className="space-y-6">
                        {/* 总体评分 */}
                        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                          <span className="text-blue-300">{locale === 'zh' ? '总体评分：' : 'Overall: '}</span>
                          <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                            translatedAnalysis.overall_score === '优秀' || translatedAnalysis.overall_score === 'Excellent' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                            translatedAnalysis.overall_score === '好' || translatedAnalysis.overall_score === 'Good' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                            translatedAnalysis.overall_score === '一般' || translatedAnalysis.overall_score === 'Average' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                            'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}>
                            {translatedAnalysis.overall_score}
                          </span>
                        </div>
                        
                        {/* 指标卡片 */}
                        <div className="space-y-3">
                          <h4 className="text-blue-200 font-medium flex items-center gap-2">
                            <BarChart3 className="w-4 h-4" />
                            {locale === 'zh' ? '指标评分' : 'Metrics'}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {translatedAnalysis.metrics.map((m, i) => (
                              <div key={i} className="bg-slate-800/50 border border-white/10 rounded-lg p-3 flex items-center justify-between">
                                <span className="text-blue-200 text-sm font-medium">{m.name}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-white text-sm font-semibold">
                                    {m.value !== null ? (m.name === 'CTR' || m.name === '转化率' || m.name === 'Conv. Rate' ? `${m.value.toFixed(2)}%` : m.name === 'ROAS' ? `${m.value.toFixed(1)}x` : `$${m.value.toFixed(2)}`) : '-'}
                                  </span>
                                  <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                                    {m.rating}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  // 新格式 v2.0
                  return (
                    <div className="space-y-6">
                      {/* 诊断卡片 */}
                      {v2Analysis.diagnosis && (
                        <div className="space-y-3">
                          <h4 className="text-blue-200 font-medium flex items-center gap-2">
                            <Target className="w-4 h-4 text-cyan-400" />
                            {locale === 'zh' ? '诊断结论' : 'Diagnosis'}
                          </h4>
                          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-cyan-300 font-semibold">{v2Analysis.diagnosis.pattern}</span>
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                v2Analysis.diagnosis.confidence === 'high' ? 'bg-green-500/20 text-green-300' :
                                v2Analysis.diagnosis.confidence === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                                'bg-slate-500/20 text-slate-300'
                              }`}>
                                {v2Analysis.diagnosis.confidence === 'high' ? (locale === 'zh' ? '高置信度' : 'High') :
                                 v2Analysis.diagnosis.confidence === 'medium' ? (locale === 'zh' ? '中置信度' : 'Medium') :
                                 (locale === 'zh' ? '低置信度' : 'Low')}
                              </span>
                            </div>
                            <p className="text-blue-100 text-sm">{v2Analysis.diagnosis.conclusion}</p>
                          </div>
                        </div>
                      )}
                      
                      {/* 趋势对比 */}
                      {v2Analysis.trends && (
                        <div className="space-y-3">
                          <h4 className="text-blue-200 font-medium flex items-center gap-2">
                            <LineChart className="w-4 h-4 text-blue-400" />
                            {locale === 'zh' ? '趋势对比' : 'Trends'}
                          </h4>
                          {v2Analysis.trends.has_history ? (
                            <div className="bg-slate-800/50 border border-white/10 rounded-lg p-4">
                              <p className="text-blue-200 text-xs mb-3">
                                {locale === 'zh' ? `vs 上次上传：${v2Analysis.trends.previous_date}` : `vs Last upload: ${v2Analysis.trends.previous_date}`}
                              </p>
                              <div className="space-y-2">
                                {v2Analysis.trends.changes.map((change, i) => (
                                  <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                    <span className="text-blue-200 text-sm font-medium w-20">{change.metric}</span>
                                    <div className="flex items-center gap-4">
                                      <span className="text-slate-400 text-xs">{typeof change.prev === 'number' ? change.prev.toFixed(2) : '-'}</span>
                                      <span className="text-white text-sm font-semibold">{typeof change.curr === 'number' ? change.curr.toFixed(2) : '-'}</span>
                                      <span className={`text-xs px-2 py-0.5 rounded ${
                                        change.quality === 'good' ? 'bg-green-500/20 text-green-300' :
                                        change.quality === 'bad' ? 'bg-red-500/20 text-red-300' :
                                        'bg-slate-500/20 text-slate-300'
                                      }`}>
                                        {change.direction === 'up' ? '↑' : change.direction === 'down' ? '↓' : '→'} {Math.abs(change.change_pct)}%
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <p className="text-blue-200 text-sm mt-3 pt-3 border-t border-white/10">{v2Analysis.trends.summary}</p>
                            </div>
                          ) : (
                            <div className="bg-slate-800/50 border border-white/10 rounded-lg p-4 text-center">
                              <p className="text-blue-200 text-sm">{v2Analysis.trends.summary}</p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* 行动建议 */}
                      {v2Analysis.actions && v2Analysis.actions.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-blue-200 font-medium flex items-center gap-2">
                            <Target className="w-4 h-4 text-cyan-400" />
                            {locale === 'zh' ? '行动建议' : 'Actions'}
                          </h4>
                          <div className="space-y-2">
                            {v2Analysis.actions.map((action, i) => (
                              <div key={i} className="bg-slate-800/50 border border-white/10 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                                    action.type === 'STOP' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                                    action.type === 'FIX' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                                    'bg-green-500/20 text-green-300 border border-green-500/30'
                                  }`}>
                                    {action.type}
                                  </span>
                                  <span className="text-blue-200 text-sm font-medium">{action.metric}</span>
                                </div>
                                <p className="text-blue-100 text-sm mb-2">{action.action}</p>
                                <p className="text-slate-400 text-xs italic">{action.evidence}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div className="text-blue-100 leading-relaxed whitespace-pre-wrap">
                  {locale === 'zh' ? '上传第一张截图，解锁AI分析' : 'Upload your first snapshot to unlock AI analysis'}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function AnalysisPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full"></div>
      </div>
    }>
      <AnalysisContent />
    </Suspense>
  );
}
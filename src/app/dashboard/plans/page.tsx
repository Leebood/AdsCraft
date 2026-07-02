'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n-context';
import { Upload } from 'lucide-react';

export default function PlansPage() {
  const router = useRouter();
  const { locale } = useI18n();

  const [activeTab, setActiveTab] = useState<'fb' | 'tk' | 'google'>('fb');

  // Google 诊断历史
  const [googleDiagnosisHistory] = useState<Array<{ id: string; created_at: string; report?: { scores?: { overall?: number } } }>>([]);

  // 开始截图诊断 - 跳转到 TikTok 报告页面
  const handleStartDiagnosis = () => {
    router.push('/tiktok-review');
  };

  // 开始 Google 截图诊断
  const handleStartGoogleDiagnosis = () => {
    router.push('/google-review');
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
            {locale === 'zh' ? 'TikTok 广告审查与诊断' : 'TikTok Review & Diagnosis'}
          </h3>
          <p className="text-blue-200/70 mb-6 max-w-md mx-auto">
            {locale === 'zh' 
              ? '上传 TikTok 广告后台截图，检查拒审风险并诊断优化空间。'
              : 'Upload a TikTok Ads Manager screenshot to review approval risk and diagnose optimization opportunities.'}
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
            {locale === 'zh' ? 'Facebook 广告策略诊断' : 'Facebook Strategy Diagnosis'}
          </h3>
          <p className="text-blue-200/70 mb-6 max-w-md mx-auto">
            {locale === 'zh'  
              ? '上传 Facebook 广告后台截图，识别投放问题并给出持续优化方向。'
              : 'Upload a Facebook Ads Manager screenshot to identify strategy issues and optimization actions.'}
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
              {locale === 'zh' ? '选择平台上传截图，查看诊断结果与优化路径。' : 'Choose a platform, upload screenshots, and review diagnosis results and optimization paths.'}
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

    </div>
  );
}

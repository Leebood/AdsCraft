'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n-context';
import { useAuth } from '@/lib/auth-context';
import { PLATFORM_CONFIGS, PlatformId } from '@/lib/platforms/registry';

export default function RejectionCheckPage() {
  const { locale } = useI18n();
  const router = useRouter();
  const { user } = useAuth();
  
  const [step, setStep] = useState<'platform' | 'input' | 'analyzing' | 'result'>('platform');
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformId | null>(null);
  const [inputType, setInputType] = useState<'text' | 'image'>('text');
  const [rejectionText, setRejectionText] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{
    mostLikely: Array<{ reason: string; confidence: number }>;
    possible: string[];
    suggestions: string[];
    checklist: string[];
  } | null>(null);
  
  // 处理平台选择
  const handlePlatformSelect = (platform: PlatformId) => {
    setSelectedPlatform(platform);
    setStep('input');
  };
  
  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // 执行拒审分析
  const handleAnalyze = async () => {
    if (!selectedPlatform) return;
    
    setStep('analyzing');
    
    try {
      const response = await fetch('/api/rejection-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: selectedPlatform,
          rejectionText: inputType === 'text' ? rejectionText : null,
          rejectionImage: inputType === 'image' ? uploadedImage : null
        })
      });
      
      if (!response.ok) {
        throw new Error('Analysis failed');
      }
      
      const result = await response.json();
      setAnalysisResult(result);
      setStep('result');
    } catch (error) {
      console.error('Rejection analysis error:', error);
      setStep('input');
      alert(locale === 'zh' ? '分析失败，请重试' : 'Analysis failed, please try again');
    }
  };
  
  // 返回首页
  const handleBackToHome = () => {
    router.push('/');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-10 pointer-events-none z-0">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>
      
      <div className="relative max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {locale === 'zh' ? '广告拒审诊断' : 'Ad Rejection Diagnosis'}
          </h1>
          <p className="text-blue-200/70">
            {locale === 'zh' 
              ? '上传拒审通知或粘贴拒审原因，AI帮您排查问题'
              : 'Upload rejection notice or paste rejection reason, AI will diagnose for you'}
          </p>
        </div>
        
        {/* Step 1: Platform Selection */}
        {step === 'platform' && (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-6 text-center">
              {locale === 'zh' ? '选择被拒审的广告平台' : 'Select the platform where your ad was rejected'}
            </h2>
            
            <div className="flex justify-center gap-6">
              {(['facebook', 'tiktok'] as PlatformId[]).map((platform) => {
                const config = PLATFORM_CONFIGS[platform];
                return (
                  <button
                    key={platform}
                    onClick={() => handlePlatformSelect(platform)}
                    className="group p-8 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-cyan-400/50 transition-all duration-300 min-w-[180px]"
                  >
                    <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                      {config.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-cyan-300 transition-colors">
                      {config.name}
                    </h3>
                    <p className="text-sm text-blue-200/60 mt-2">
                      {locale === 'zh' ? config.nameZh + '广告' : config.name + ' Ads'}
                    </p>
                  </button>
                );
              })}
            </div>
            
            {/* Back Button */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleBackToHome}
                className="text-blue-300/60 hover:text-blue-300 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {locale === 'zh' ? '返回首页' : 'Back to Home'}
              </button>
            </div>
          </div>
        )}
        
        {/* Step 2: Input Rejection Info */}
        {step === 'input' && selectedPlatform && (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            {/* Platform Header */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
              <div className="text-3xl">{PLATFORM_CONFIGS[selectedPlatform].icon}</div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {PLATFORM_CONFIGS[selectedPlatform].name}
                </h2>
                <p className="text-sm text-blue-200/60">
                  {locale === 'zh' ? '拒审诊断' : 'Rejection Diagnosis'}
                </p>
              </div>
            </div>
            
            {/* Input Type Selection */}
            <div className="mb-6">
              <h3 className="text-base font-medium text-white mb-3">
                {locale === 'zh' ? '选择输入方式' : 'Select input method'}
              </h3>
              <div className="flex gap-4">
                <button
                  onClick={() => setInputType('text')}
                  className={`flex-1 p-4 rounded-xl border transition-all ${
                    inputType === 'text'
                      ? 'bg-cyan-500/20 border-cyan-400'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl">📝</span>
                    <span className={`font-medium ${inputType === 'text' ? 'text-cyan-300' : 'text-white'}`}>
                      {locale === 'zh' ? '粘贴拒审文字' : 'Paste Rejection Text'}
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => setInputType('image')}
                  className={`flex-1 p-4 rounded-xl border transition-all ${
                    inputType === 'image'
                      ? 'bg-cyan-500/20 border-cyan-400'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl">🖼️</span>
                    <span className={`font-medium ${inputType === 'image' ? 'text-cyan-300' : 'text-white'}`}>
                      {locale === 'zh' ? '上传拒审截图' : 'Upload Rejection Screenshot'}
                    </span>
                  </div>
                </button>
              </div>
            </div>
            
            {/* Text Input */}
            {inputType === 'text' && (
              <div className="mb-6">
                <label className="block text-sm text-blue-200 mb-2">
                  {locale === 'zh' ? '拒审通知内容' : 'Rejection Notice Content'}
                </label>
                <textarea
                  value={rejectionText}
                  onChange={(e) => setRejectionText(e.target.value)}
                  placeholder={locale === 'zh' 
                    ? '请粘贴平台发送的拒审通知内容...'
                    : 'Paste the rejection notice content from the platform...'
                  }
                  className="w-full h-32 p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-blue-300/40 focus:border-cyan-400 focus:outline-none resize-none"
                />
              </div>
            )}
            
            {/* Image Upload */}
            {inputType === 'image' && (
              <div className="mb-6">
                <label className="block text-sm text-blue-200 mb-2">
                  {locale === 'zh' ? '拒审通知截图' : 'Rejection Notice Screenshot'}
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="rejection-image"
                  />
                  {uploadedImage ? (
                    <div className="relative">
                      <img 
                        src={uploadedImage} 
                        alt="Rejection notice" 
                        className="w-full max-h-64 object-contain rounded-xl border border-white/10"
                      />
                      <button
                        onClick={() => setUploadedImage(null)}
                        className="absolute top-2 right-2 p-2 rounded-lg bg-slate-900/80 text-white hover:bg-slate-900 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="rejection-image"
                      className="block w-full h-32 p-4 rounded-xl bg-white/5 border border-white/10 text-blue-300/60 cursor-pointer hover:bg-white/10 hover:border-cyan-400/30 transition-all flex items-center justify-center gap-3"
                    >
                      <span className="text-2xl">📷</span>
                      <span>{locale === 'zh' ? '点击上传截图' : 'Click to upload screenshot'}</span>
                    </label>
                  )}
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => setStep('platform')}
                className="px-4 py-2 rounded-xl border border-white/20 text-blue-200 hover:bg-white/5 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {locale === 'zh' ? '返回' : 'Back'}
              </button>
              
              <button
                onClick={handleAnalyze}
                disabled={inputType === 'text' ? !rejectionText.trim() : !uploadedImage}
                className={`px-8 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  (inputType === 'text' && rejectionText.trim()) || (inputType === 'image' && uploadedImage)
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/30'
                    : 'bg-white/10 text-blue-300/50 cursor-not-allowed'
                }`}
              >
                {locale === 'zh' ? '开始分析' : 'Start Analysis'}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        )}
        
        {/* Step 3: Analyzing */}
        {step === 'analyzing' && (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-12 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-cyan-500/20 flex items-center justify-center animate-pulse">
                <svg className="w-8 h-8 text-cyan-400 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              {locale === 'zh' ? '正在分析拒审原因...' : 'Analyzing rejection reasons...'}
            </h2>
            <p className="text-blue-200/60">
              {locale === 'zh' 
                ? 'AI正在对照平台广告政策逐条排查'
                : 'AI is checking against platform advertising policies'}
            </p>
          </div>
        )}
        
        {/* Step 4: Analysis Result */}
        {step === 'result' && analysisResult && (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            {/* Header */}
            <div className="mb-6 pb-4 border-b border-white/10">
              <h2 className="text-xl font-semibold text-white">
                {locale === 'zh' ? '拒审诊断结果' : 'Rejection Diagnosis Result'}
              </h2>
              <p className="text-sm text-blue-200/60 mt-1">
                {selectedPlatform && PLATFORM_CONFIGS[selectedPlatform].name}
              </p>
            </div>
            
            {/* Most Likely Reasons */}
            <div className="mb-6">
              <h3 className="flex items-center gap-2 text-lg font-medium text-red-400 mb-3">
                <span>🔴</span>
                {locale === 'zh' ? '最可能原因' : 'Most Likely Reasons'}
              </h3>
              <div className="space-y-2">
                {analysisResult.mostLikely.map((item, index) => (
                  <div key={index} className="p-4 rounded-xl bg-red-500/10 border border-red-400/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{item.reason}</span>
                      <span className="text-sm text-red-300/70">
                        {locale === 'zh' ? `置信度 ${Math.round(item.confidence * 100)}%` : `${Math.round(item.confidence * 100)}% confidence`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Possible Reasons */}
            {analysisResult.possible.length > 0 && (
              <div className="mb-6">
                <h3 className="flex items-center gap-2 text-lg font-medium text-yellow-400 mb-3">
                  <span>🟡</span>
                  {locale === 'zh' ? '可能原因' : 'Possible Reasons'}
                </h3>
                <ul className="space-y-2">
                  {analysisResult.possible.map((reason, index) => (
                    <li key={index} className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-400/30 text-yellow-200">
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Suggestions */}
            <div className="mb-6">
              <h3 className="flex items-center gap-2 text-lg font-medium text-green-400 mb-3">
                <span>✅</span>
                {locale === 'zh' ? '修改建议' : 'Modification Suggestions'}
              </h3>
              <ul className="space-y-2">
                {analysisResult.suggestions.map((suggestion, index) => (
                  <li key={index} className="p-3 rounded-lg bg-green-500/10 border border-green-400/30 text-green-200 flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Resubmit Checklist */}
            <div className="mb-6">
              <h3 className="flex items-center gap-2 text-lg font-medium text-cyan-400 mb-3">
                <span>📋</span>
                {locale === 'zh' ? '重新提交前检查清单' : 'Checklist Before Resubmitting'}
              </h3>
              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-400/30">
                <ul className="space-y-2">
                  {analysisResult.checklist.map((item, index) => (
                    <li key={index} className="flex items-center gap-2 text-cyan-200">
                      <div className="w-4 h-4 rounded border border-cyan-400/50" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/10">
              <button
                onClick={() => setStep('input')}
                className="px-4 py-2 rounded-xl border border-white/20 text-blue-200 hover:bg-white/5 transition-colors"
              >
                {locale === 'zh' ? '重新分析' : 'Re-analyze'}
              </button>
              <button
                onClick={handleBackToHome}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/30 transition-all"
              >
                {locale === 'zh' ? '返回首页' : 'Back to Home'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n-context';
import { useAuth } from '@/lib/auth-context';
import { getSupabaseBrowserClientAsync } from '@/lib/supabase-browser';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSkip?: () => void;
  onSuccess?: () => void;
  source?: 'questionnaire' | 'result_page' | 'tk_tab';
}

export function TikTokAuthModal({ 
  isOpen, 
  onClose, 
  onSkip,
  onSuccess,
  source = 'questionnaire'
}: AuthModalProps) {
  const { locale } = useI18n();
  const { user } = useAuth();
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);

  // 处理授权
  const handleConnect = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setIsConnecting(true);
    try {
      const client = await getSupabaseBrowserClientAsync();
      const { data: { session } } = await client.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        router.push('/login');
        return;
      }

      // 获取授权URL
      const res = await fetch('/api/auth/tiktok', {
        headers: { 'x-session': token }
      });

      if (res.ok) {
        const data = await res.json();
        // 保存当前状态到localStorage，授权成功后恢复
        localStorage.setItem('tiktok_auth_source', source);
        window.location.href = data.authUrl;
      } else {
        console.error('Failed to get auth URL');
        setIsConnecting(false);
      }
    } catch (error) {
      console.error('Connect TikTok error:', error);
      setIsConnecting(false);
    }
  };

  // 跳过授权
  const handleSkip = () => {
    onClose();
    if (onSkip) {
      onSkip();
    }
  };

  // ESC键关闭
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, onClose]);

  // 不显示时不渲染
  if (!isOpen) return null;

  // 根据来源显示不同文案
  const getTitle = () => {
    if (source === 'result_page') {
      return locale === 'zh' ? '升级完整诊断' : 'Upgrade to Full Diagnosis';
    }
    return locale === 'zh' ? '连接TikTok账号' : 'Connect TikTok Account';
  };

  const getDescription = () => {
    if (source === 'result_page') {
      return locale === 'zh' 
        ? '连接TikTok账号后，可获取真实广告数据进行完整四层审查，包括政策合规、风险评分、AI语义审查和技术验证。'
        : 'Connect TikTok to get real ad data for complete 4-layer review: policy compliance, risk scoring, AI semantic review, and technical validation.';
    }
    if (source === 'tk_tab') {
      return locale === 'zh'
        ? '连接TikTok广告账户后，可查看真实广告数据并进行完整诊断分析。'
        : 'Connect TikTok ad account to view real ad data and perform complete diagnosis.';
    }
    return locale === 'zh'
      ? '连接TikTok账号后，系统可自动获取您的广告数据，进行完整的四层审查分析。'
      : 'Connect TikTok to allow system to fetch your ad data for complete 4-layer review analysis.';
  };

  const getFeatures = () => [
    {
      icon: '📊',
      title: locale === 'zh' ? '真实广告数据' : 'Real Ad Data',
      desc: locale === 'zh' ? '自动获取花费、曝光、转化等数据' : 'Auto fetch spend, impressions, conversions'
    },
    {
      icon: '🔍',
      title: locale === 'zh' ? '完整四层审查' : 'Full 4-Layer Review',
      desc: locale === 'zh' ? '政策合规+风险评分+AI审查+技术验证' : 'Policy + Risk + AI + Tech validation'
    },
    {
      icon: '📈',
      title: locale === 'zh' ? '数据趋势分析' : 'Trend Analysis',
      desc: locale === 'zh' ? '7/14/30天数据对比分析' : '7/14/30 day comparison'
    },
    {
      icon: '🎯',
      title: locale === 'zh' ? '深度归因' : 'Deep Attribution',
      desc: locale === 'zh' ? '归因失败原因，精准优化建议' : 'Attribute failure, precise optimization'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 弹窗内容 */}
      <div className="relative bg-gradient-to-br from-slate-900 to-indigo-900 border border-white/20 rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
        {/* 顶部装饰 */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500" />

        {/* 关闭按钮 */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* 内容 */}
        <div className="p-6">
          {/* TikTok图标 */}
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">TK</span>
          </div>

          {/* 标题 */}
          <h2 className="text-xl font-bold text-white text-center mb-2">
            {getTitle()}
          </h2>

          {/* 描述 */}
          <p className="text-blue-200/80 text-center text-sm mb-6">
            {getDescription()}
          </p>

          {/* 功能列表 */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {getFeatures().map((feature, i) => (
              <div key={i} className="bg-white/5 rounded-lg p-3 border border-white/10">
                <span className="text-lg">{feature.icon}</span>
                <p className="text-white font-medium text-sm mt-1">{feature.title}</p>
                <p className="text-blue-300/70 text-xs">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* 按钮 */}
          <div className="space-y-3">
            <Button 
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white font-medium py-3 rounded-xl shadow-lg shadow-purple-500/30"
            >
              {isConnecting 
                ? (locale === 'zh' ? '正在连接...' : 'Connecting...')
                : (locale === 'zh' ? '连接TikTok账号' : 'Connect TikTok Account')
              }
            </Button>

            {/* 跳过按钮（仅问卷末尾显示） */}
            {source === 'questionnaire' && onSkip && (
              <Button 
                onClick={handleSkip}
                variant="outline"
                className="w-full bg-white/10 border-white/20 text-blue-200 hover:bg-white/15 hover:text-white py-2 rounded-xl"
              >
                {locale === 'zh' ? '跳过，使用轻量建议' : 'Skip, use light advice'}
              </Button>
            )}
          </div>

          {/* 提示 */}
          {source === 'questionnaire' && (
            <p className="text-blue-300/60 text-xs text-center mt-4">
              {locale === 'zh' 
                ? '跳过授权将基于问卷信息提供轻量建议，不包含真实数据分析'
                : 'Skipping will provide light advice based on questionnaire, without real data'
              }
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
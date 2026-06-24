'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n-context';
import { getSupabaseBrowserClientWithRetry } from '@/lib/supabase-browser';

interface Plan {
  id: string;
  route: string;
  budget: string;
  goal: string;
  created_at: string;
}

interface SmartDiagnosisButtonProps {
  isHomePage?: boolean;
}

export function SmartDiagnosisButton({ isHomePage = false }: SmartDiagnosisButtonProps) {
  const { user, loading, isPremium, subscription } = useAuth();
  const { locale } = useI18n();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 获取方案记录
  const fetchPlans = async () => {
    if (!user) return;
    setPlansLoading(true);
    try {
      const client = await getSupabaseBrowserClientWithRetry();
      const { data: { session } } = await client.auth.getSession();
      if (!session) {
        setPlansLoading(false);
        return;
      }

      const response = await fetch('/api/plans', {
        headers: { 'x-session': session.access_token }
      });

      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans || []);
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    } finally {
      setPlansLoading(false);
    }
  };

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 打开下拉菜单时获取方案
  useEffect(() => {
    if (isOpen && user) {
      fetchPlans();
    }
  }, [isOpen, user]);

  // 未登录状态：点击跳转登录页
  const handleUnauthClick = () => {
    router.push('/login');
  };

  // 已登录状态：打开下拉菜单
  const handleAuthClick = () => {
    setIsOpen(!isOpen);
  };

  // 开始新诊断
  const handleStartDiagnosis = () => {
    setIsOpen(false);
    router.push('/rejection-check');
  };

  // 获取线路名称
  const getRouteName = (route: string): string => {
    const routeNames: Record<string, string> = {
      'free': locale === 'zh' ? '免费诊断' : 'Free Diagnosis',
      'fb_local': locale === 'zh' ? '本地服务商' : 'Local Service',
      'fb_retailer': locale === 'zh' ? '零售商' : 'Retailer',
      'fb_manufacturer': locale === 'zh' ? '制造商' : 'Manufacturer',
      'fb_brand': locale === 'zh' ? '品牌方' : 'Brand',
      'tk_local': locale === 'zh' ? '本地服务商' : 'Local Service',
      'tk_conversion': locale === 'zh' ? '网站转化' : 'Website Conversion',
      'tk_brand': locale === 'zh' ? '品牌认知' : 'Brand Awareness',
    };
    return routeNames[route] || route;
  };

  // 格式化日期
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // 加载中状态
  if (loading) {
    return (
      <button className="px-4 py-2 bg-gradient-to-r from-cyan-500/50 to-blue-600/50 rounded-lg text-white/50 font-medium">
        {locale === 'zh' ? '加载中...' : 'Loading...'}
      </button>
    );
  }

  // 未登录状态
  if (!user) {
    // 首页已有免费诊断按钮，导航栏只显示登录
    if (isHomePage) {
      return (
        <Link 
          href="/login" 
          className="text-blue-200/80 hover:text-cyan-300 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-white/5"
        >
          {locale === 'zh' ? '登录' : 'Login'}
        </Link>
      );
    }
    // 非首页：显示登录 + 免费诊断按钮
    return (
      <div className="flex gap-3 items-center">
        <Link 
          href="/login" 
          className="text-blue-200/80 hover:text-cyan-300 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-white/5"
        >
          {locale === 'zh' ? '登录' : 'Login'}
        </Link>
        <button 
          onClick={handleUnauthClick}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg text-white font-medium hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20"
        >
          {locale === 'zh' ? '免费诊断' : 'Start Free'}
        </button>
      </div>
    );
  }

  // 已登录状态：显示下拉菜单
  // 按钮文字恢复为"我的方案"
  const buttonText = locale === 'zh' ? '方案快速诊断' : 'Quick Diagnosis';

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={handleAuthClick}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg text-white font-medium hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20"
      >
        {buttonText}
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-slate-900/95 border border-white/20 rounded-xl shadow-xl z-50 overflow-hidden">
          {/* 账户信息 */}
          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">{user?.email || 'User'}</p>
                <p className="text-xs text-blue-300/60 truncate">
                  {subscription?.route || 'free'} · {locale === 'zh' ? '已订阅' : 'Subscribed'}
                </p>
              </div>
            </div>
          </div>

          {/* 未订阅用户升级提示 */}
          {(!isPremium || !subscription?.route) && (
            <div className="px-4 py-2 border-b border-white/10 bg-gradient-to-r from-violet-500/10 to-cyan-500/10">
              <Link 
                href="/pricing"
                onClick={() => setIsOpen(false)}
                className="w-full py-2 text-sm text-violet-300 hover:text-violet-200 font-medium text-left flex items-center gap-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                {locale === 'zh' ? '升级订阅获取更多功能' : 'Upgrade for more features'}
              </Link>
            </div>
          )}

          {/* FB/TK方案快速诊断 */}
          <div className="px-4 py-2 border-b border-white/10">
            <Link 
              href="/dashboard/plans"
              onClick={() => setIsOpen(false)}
              className="w-full py-2 text-sm text-blue-200 hover:text-cyan-300 font-medium text-left flex items-center gap-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              {locale === 'zh' ? 'FB/TK 方案快速诊断' : 'FB/TK Quick Diagnosis'}
            </Link>
          </div>

          {/* 方案记录 */}
          <div className="px-4 py-2">
            <p className="text-xs text-blue-300/60 uppercase tracking-wider mb-2">
              {locale === 'zh' ? '方案记录' : 'Recent Plans'}
            </p>
            
            {plansLoading ? (
              <p className="text-sm text-blue-200/50 py-2">
                {locale === 'zh' ? '加载中...' : 'Loading...'}
              </p>
            ) : plans.length === 0 ? (
              <p className="text-sm text-blue-200/50 py-2">
                {locale === 'zh' ? '暂无方案记录' : 'No plans yet'}
              </p>
            ) : (
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {plans.slice(0, 5).map((plan) => (
                  <Link
                    key={plan.id}
                    href={`/plan/${plan.id}`}
                    onClick={() => setIsOpen(false)}
                    className="block py-1.5 px-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-200 truncate">{getRouteName(plan.route)}</span>
                      <span className="text-xs text-blue-300/60">{formatDate(plan.created_at)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 查看全部 */}
          <div className="px-4 py-2 border-t border-white/10">
            <Link
              href="/dashboard/plans"
              onClick={() => setIsOpen(false)}
              className="w-full py-2 text-sm text-cyan-400 hover:text-cyan-300 font-medium text-left flex items-center justify-center gap-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              {locale === 'zh' ? '查看全部' : 'View All'}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
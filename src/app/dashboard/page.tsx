'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/lib/i18n-context';
import { useAuth } from '@/lib/auth-context';
import { getSupabaseBrowserClientAsync } from '@/lib/supabase-browser';

interface SavedPlan {
  id: number;
  route: string;
  budget: string;
  goal: string;
  created_at: string;
  updated_at: string;
}

const routeLabels: Record<string, { en: string; zh: string; icon: string }> = {
  retailer: { en: 'Retailer', zh: '零售商', icon: '🛍️' },
  manufacturer: { en: 'Manufacturer', zh: '制造商', icon: '⚙️' },
  local_service: { en: 'Local Service', zh: '本地服务商', icon: '📍' },
  brand: { en: 'Brand', zh: '品牌方', icon: '⭐' }
};

export default function DashboardPage() {
  const { t, locale } = useI18n();
  const { user, isPremium, signOut } = useAuth();
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPlans();
    }
  }, [user]);

  const fetchPlans = async () => {
    try {
      const client = await getSupabaseBrowserClientAsync();
      const { data } = await client.auth.getSession();
      const token = data.session?.access_token;
      
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/plans', {
        headers: { 'x-session': token }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans || []);
      }
    } catch (error) {
      console.error('Fetch plans error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const deletePlan = async (planId: number) => {
    try {
      const client = await getSupabaseBrowserClientAsync();
      const { data } = await client.auth.getSession();
      const token = data.session?.access_token;
      
      if (!token) return;

      const response = await fetch(`/api/plans/${planId}`, {
        method: 'DELETE',
        headers: { 'x-session': token }
      });
      
      if (response.ok) {
        setPlans(plans.filter(p => p.id !== planId));
      }
    } catch (error) {
      console.error('Delete plan error:', error);
    }
  };

  const getRouteLabel = (route: string) => {
    const info = routeLabels[route] || routeLabels.retailer;
    return locale === 'zh' ? info.zh : info.en;
  };

  const getRouteIcon = (route: string) => {
    const info = routeLabels[route] || routeLabels.retailer;
    return info.icon;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <Card className="w-full max-w-md bg-white/5 border-white/20 backdrop-blur-sm shadow-xl relative z-10">
          <CardContent className="text-center py-12">
            <p className="text-blue-200 mb-6">{locale === 'zh' ? '请登录以访问仪表板' : 'Please login to access your dashboard'}</p>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 to-blue-500 text-white shadow-lg shadow-cyan-500/30">
                {t('login.title')}
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
      
      <main className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              {locale === 'zh' ? `欢迎, ${user.user_metadata?.full_name || user.email}` : `Welcome, ${user.user_metadata?.full_name || user.email}`}
            </h1>
            <p className="text-blue-200">
              {isPremium ? (locale === 'zh' ? '付费会员' : 'Premium Member') : (locale === 'zh' ? '免费会员' : 'Free Member')}
            </p>
          </div>

          {/* User Info Card */}
          <Card className="bg-white/5 border-white/20 backdrop-blur-sm shadow-xl mb-6">
            <CardHeader>
              <CardTitle className="text-white">{locale === 'zh' ? '账户信息' : 'Account Information'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-blue-200">{locale === 'zh' ? '邮箱' : 'Email'}:</span>
                <span className="text-white">{user.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-200">{locale === 'zh' ? '状态' : 'Status'}:</span>
                <span className={isPremium ? 'text-cyan-400' : 'text-blue-300'}>
                  {isPremium ? (locale === 'zh' ? '付费' : 'Premium') : (locale === 'zh' ? '免费' : 'Free')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Saved Plans */}
          <Card className="bg-white/5 border-white/20 backdrop-blur-sm shadow-xl mb-6">
            <CardHeader>
              <CardTitle className="text-white">{locale === 'zh' ? '已保存的方案' : 'Saved Plans'}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-blue-200 text-center">{locale === 'zh' ? '加载中...' : 'Loading...'}</p>
              ) : plans.length === 0 ? (
                <div className="text-center">
                  <p className="text-blue-200 mb-4">{locale === 'zh' ? '暂无已保存的方案' : 'No saved plans yet'}</p>
                  <Link href="/">
                    <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/30">
                      {locale === 'zh' ? '创建新方案' : 'Create New Plan'}
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {plans.map((plan) => (
                    <div key={plan.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">{getRouteIcon(plan.route)}</span>
                        <div>
                          <p className="text-white font-medium">{getRouteLabel(plan.route)}</p>
                          <p className="text-blue-300 text-sm">
                            {locale === 'zh' ? `预算: ${plan.budget} | 目标: ${plan.goal}` : `Budget: ${plan.budget} | Goal: ${plan.goal}`}
                          </p>
                          <p className="text-blue-400 text-xs">
                            {new Date(plan.created_at).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/saved/${plan.id}`}>
                          <Button size="sm" className="bg-cyan-500/20 border-cyan-400/30 text-cyan-400 hover:bg-cyan-500/30">
                            {locale === 'zh' ? '查看' : 'View'}
                          </Button>
                        </Link>
                        <Button 
                          size="sm" 
                          onClick={() => deletePlan(plan.id)}
                          className="bg-red-500/20 border-red-400/30 text-red-400 hover:bg-red-500/30"
                        >
                          {locale === 'zh' ? '删除' : 'Delete'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upgrade Card */}
          {!isPremium && (
            <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-400/30 backdrop-blur-sm shadow-xl mb-6">
              <CardContent className="text-center py-8">
                <p className="text-white mb-4">{locale === 'zh' ? '升级付费解锁完整方案详情' : 'Unlock full plan details with Premium'}</p>
                <Link href="/pricing">
                  <Button 
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/30"
                  >
                    {locale === 'zh' ? '升级到付费' : 'Upgrade to Premium'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <Link href="/">
              <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-cyan-400">
                {t('common.backHome')}
              </Button>
            </Link>
            <Button 
              onClick={handleSignOut}
              variant="outline" 
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-red-400"
            >
              {locale === 'zh' ? '退出登录' : 'Sign Out'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
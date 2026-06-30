'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/lib/i18n-context';
import { useAuth } from '@/lib/auth-context';
import { getSupabaseBrowserClientAsync } from '@/lib/supabase-browser';

interface DiagnosisRecord {
  id: string;
  platform: 'facebook' | 'tiktok' | 'google';
  diagnosis_type: 'full' | 'light' | 'screenshot';
  status: string;
  created_at: string;
  config_summary?: string;
}

type DashboardTab = 'platforms' | 'history' | 'plans' | 'settings';

export default function DashboardPage() {
  const { locale } = useI18n();
  const { user, isPremium, signOut } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DashboardTab>('platforms');
  const [records, setRecords] = useState<DiagnosisRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRecords();
    }
  }, [user]);

  const fetchRecords = async () => {
    try {
      const client = await getSupabaseBrowserClientAsync();
      const { data } = await client.auth.getSession();
      const token = data.session?.access_token;
      
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/diagnosis-records', {
        headers: { 'x-session': token }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecords(data.records || []);
      }
    } catch (error) {
      console.error('Fetch records error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const fbRecords = records.filter(r => r.platform === 'facebook');
  const tkRecords = records.filter(r => r.platform === 'tiktok');
  const googleRecords = records.filter(r => r.platform === 'google');

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <Card className="w-full max-w-md bg-white/5 border-white/20 backdrop-blur-sm shadow-xl relative z-10">
          <CardContent className="text-center py-12">
            <p className="text-blue-200 mb-6">{locale === 'zh' ? '请登录以访问控制台' : 'Please login to access your dashboard'}</p>
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

  const tabs = [
    { id: 'platforms' as DashboardTab, label: locale === 'zh' ? '平台入口' : 'Platforms' },
    { id: 'history' as DashboardTab, label: locale === 'zh' ? '分析历史' : 'History' },
    { id: 'plans' as DashboardTab, label: locale === 'zh' ? '我的套餐' : 'My Plans' },
    { id: 'settings' as DashboardTab, label: locale === 'zh' ? '账户设置' : 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      
      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">
                {locale === 'zh' ? '控制台' : 'Dashboard'}
              </h1>
              <p className="text-blue-200/70">
                {user.user_metadata?.full_name || user.email}
                {isPremium && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-400/30">
                    {locale === 'zh' ? '付费会员' : 'Premium'}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 p-1 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-2.5 rounded-lg transition-all font-medium text-sm ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                    : 'text-blue-200/70 hover:text-cyan-300 hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'platforms' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Facebook */}
              <Card className="bg-white/5 border-white/20 backdrop-blur-sm hover:border-blue-400/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500/30 to-indigo-500/30 rounded-2xl flex items-center justify-center border border-blue-400/30">
                      <svg className="w-8 h-8 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </div>
                    <h3 className="text-white font-semibold mb-2">Facebook Ads</h3>
                    <p className="text-blue-200/70 text-sm mb-4">
                      {locale === 'zh' ? '截图分析' : 'Screenshot Analysis'}
                    </p>
                    <Link href="/facebook-review">
                      <Button className="w-full bg-blue-500/20 border-blue-400/30 text-blue-400 hover:bg-blue-500/30">
                        {locale === 'zh' ? '开始分析' : 'Start Analysis'}
                      </Button>
                    </Link>
                    <p className="text-blue-200/50 text-xs mt-3">
                      {fbRecords.length} {locale === 'zh' ? '条记录' : 'records'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* TikTok */}
              <Card className="bg-white/5 border-white/20 backdrop-blur-sm hover:border-pink-400/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-pink-500/30 to-purple-500/30 rounded-2xl flex items-center justify-center border border-pink-400/30">
                      <svg className="w-8 h-8 text-pink-400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13a2.89 2.89 0 0 1-5.89 0c0-.06 0-.12 0-.17a2.89 2.89 0 0 1 2.89-2.72c.24 0 .48.03.71.08V8.32a6.23 6.23 0 0 0-3.6.34A6.19 6.19 0 0 0 5 14.5a6.19 6.19 0 0 0 6.19 6.19h.1a6.19 6.19 0 0 0 6.18-6.19V9.12a9.5 9.5 0 0 0 3.77.83V6.69h-.65z"/>
                      </svg>
                    </div>
                    <h3 className="text-white font-semibold mb-2">TikTok Ads</h3>
                    <p className="text-blue-200/70 text-sm mb-4">
                      {locale === 'zh' ? '截图分析' : 'Screenshot Analysis'}
                    </p>
                    <Link href="/tiktok-review">
                      <Button className="w-full bg-pink-500/20 border-pink-400/30 text-pink-400 hover:bg-pink-500/30">
                        {locale === 'zh' ? '开始分析' : 'Start Analysis'}
                      </Button>
                    </Link>
                    <p className="text-blue-200/50 text-xs mt-3">
                      {tkRecords.length} {locale === 'zh' ? '条记录' : 'records'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Google */}
              <Card className="bg-white/5 border-white/20 backdrop-blur-sm hover:border-green-400/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500/30 to-emerald-500/30 rounded-2xl flex items-center justify-center border border-green-400/30">
                      <svg className="w-8 h-8 text-green-400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    </div>
                    <h3 className="text-white font-semibold mb-2">Google Ads</h3>
                    <p className="text-blue-200/70 text-sm mb-4">
                      {locale === 'zh' ? '截图分析' : 'Screenshot Analysis'}
                    </p>
                    <Link href="/google-review">
                      <Button className="w-full bg-green-500/20 border-green-400/30 text-green-400 hover:bg-green-500/30">
                        {locale === 'zh' ? '开始分析' : 'Start Analysis'}
                      </Button>
                    </Link>
                    <p className="text-blue-200/50 text-xs mt-3">
                      {googleRecords.length} {locale === 'zh' ? '条记录' : 'records'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'history' && (
            <Card className="bg-white/5 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">
                  {locale === 'zh' ? '分析历史' : 'Analysis History'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-blue-200 text-center py-8">{locale === 'zh' ? '加载中...' : 'Loading...'}</p>
                ) : records.length === 0 ? (
                  <p className="text-blue-200/70 text-center py-8">
                    {locale === 'zh' ? '暂无分析记录' : 'No analysis records yet'}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {records.map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            record.platform === 'facebook' ? 'bg-blue-500/20' :
                            record.platform === 'tiktok' ? 'bg-pink-500/20' : 'bg-green-500/20'
                          }`}>
                            {record.platform === 'facebook' && (
                              <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                              </svg>
                            )}
                            {record.platform === 'tiktok' && (
                              <svg className="w-5 h-5 text-pink-400" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13a2.89 2.89 0 0 1-5.89 0c0-.06 0-.12 0-.17a2.89 2.89 0 0 1 2.89-2.72c.24 0 .48.03.71.08V8.32a6.23 6.23 0 0 0-3.6.34A6.19 6.19 0 0 0 5 14.5a6.19 6.19 0 0 0 6.19 6.19h.1a6.19 6.19 0 0 0 6.18-6.19V9.12a9.5 9.5 0 0 0 3.77.83V6.69h-.65z"/>
                              </svg>
                            )}
                            {record.platform === 'google' && (
                              <svg className="w-5 h-5 text-green-400" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className="text-white font-medium capitalize">
                              {record.platform} - {
                                record.diagnosis_type === 'screenshot' 
                                  ? (locale === 'zh' ? '截图分析' : 'Screenshot Analysis')
                                  : record.diagnosis_type === 'full'
                                  ? (locale === 'zh' ? '完整诊断' : 'Full Diagnosis')
                                  : (locale === 'zh' ? '轻量分析' : 'Light Analysis')
                              }
                            </p>
                            <p className="text-blue-200/70 text-sm">
                              {new Date(record.created_at).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300">
                          {locale === 'zh' ? '查看' : 'View'}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'plans' && (
            <Card className="bg-white/5 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">
                  {locale === 'zh' ? '我的套餐' : 'My Plans'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                    isPremium 
                      ? 'bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border-cyan-400/30' 
                      : 'bg-white/10 border-white/20'
                  } border`}>
                    {isPremium ? (
                      <svg className="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    ) : (
                      <svg className="w-10 h-10 text-blue-200/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                      </svg>
                    )}
                  </div>
                  <h3 className="text-white text-xl font-semibold mb-2">
                    {isPremium 
                      ? (locale === 'zh' ? '付费会员' : 'Premium Member')
                      : (locale === 'zh' ? '免费会员' : 'Free Member')
                    }
                  </h3>
                  <p className="text-blue-200/70 mb-6">
                    {isPremium
                      ? (locale === 'zh' ? '您已解锁所有高级功能' : 'You have unlocked all premium features')
                      : (locale === 'zh' ? '升级以解锁更多功能' : 'Upgrade to unlock more features')
                    }
                  </p>
                  {!isPremium && (
                    <Link href="/pricing">
                      <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white">
                        {locale === 'zh' ? '查看套餐' : 'View Plans'}
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'settings' && (
            <Card className="bg-white/5 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">
                  {locale === 'zh' ? '账户设置' : 'Account Settings'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* User Info */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-white/10">
                    <span className="text-blue-200/70">{locale === 'zh' ? '邮箱' : 'Email'}</span>
                    <span className="text-white">{user.email}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-white/10">
                    <span className="text-blue-200/70">{locale === 'zh' ? '用户ID' : 'User ID'}</span>
                    <span className="text-white font-mono text-sm">{user.id.slice(0, 8)}...</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-white/10">
                    <span className="text-blue-200/70">{locale === 'zh' ? '会员状态' : 'Membership'}</span>
                    <span className={isPremium ? 'text-cyan-400' : 'text-blue-300'}>
                      {isPremium ? (locale === 'zh' ? '付费会员' : 'Premium') : (locale === 'zh' ? '免费会员' : 'Free')}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 space-y-3">
                  <Button 
                    onClick={handleSignOut}
                    variant="outline" 
                    className="w-full bg-white/5 border-white/20 text-white hover:bg-red-500/20 hover:border-red-400/50 hover:text-red-400"
                  >
                    {locale === 'zh' ? '退出登录' : 'Sign Out'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

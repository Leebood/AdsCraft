'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/lib/i18n-context';
import { useAuth } from '@/lib/auth-context';
import { getSupabaseBrowserClientAsync } from '@/lib/supabase-browser';

interface DiagnosisRecord {
  id: string;
  platform: 'facebook' | 'tiktok';
  diagnosis_type: 'full' | 'light';
  status: string;
  created_at: string;
  config_summary?: string;
}

const routeLabels: Record<string, { en: string; zh: string }> = {
  retailer: { en: 'Retailer', zh: '零售商' },
  manufacturer: { en: 'Manufacturer', zh: '制造商' },
  local_service: { en: 'Local Service', zh: '本地服务商' },
  brand: { en: 'Brand', zh: '品牌方' }
};

export default function DashboardPage() {
  const { t, locale } = useI18n();
  const { user, isPremium, signOut } = useAuth();
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
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // 分离FB和TK记录
  const fbRecords = records.filter(r => r.platform === 'facebook');
  const tkRecords = records.filter(r => r.platform === 'tiktok');

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

          {/* Facebook 方案记录 */}
          <Card className="bg-white/5 border-white/20 backdrop-blur-sm shadow-xl mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500/30 to-indigo-500/30 rounded-xl flex items-center justify-center border border-blue-400/30">
                  <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <CardTitle className="text-white">
                  {locale === 'zh' ? 'Facebook 方案记录' : 'Facebook Records'}
                </CardTitle>
              </div>
              <Link href="/questions?route=free&platform=facebook">
                <Button size="sm" className="bg-blue-500/20 border-blue-400/30 text-blue-400 hover:bg-blue-500/30">
                  {locale === 'zh' ? '开始诊断' : 'Start Diagnosis'}
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-blue-200 text-center py-4">{locale === 'zh' ? '加载中...' : 'Loading...'}</p>
              ) : fbRecords.length === 0 ? (
                <p className="text-blue-200/70 text-center py-4">{locale === 'zh' ? '暂无Facebook诊断记录' : 'No Facebook records'}</p>
              ) : (
                <div className="space-y-3">
                  {fbRecords.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {record.diagnosis_type === 'full' 
                              ? (locale === 'zh' ? '完整诊断' : 'Full Diagnosis')
                              : (locale === 'zh' ? '截图分析' : 'Screenshot Analysis')}
                          </p>
                          <p className="text-blue-300 text-xs">
                            {new Date(record.created_at).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')}
                          </p>
                        </div>
                      </div>
                      <Link href={`/dashboard/plans?tab=fb&record=${record.id}`}>
                        <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300">
                          {locale === 'zh' ? '查看' : 'View'}
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* TikTok 方案记录 */}
          <Card className="bg-white/5 border-white/20 backdrop-blur-sm shadow-xl mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500/30 to-purple-500/30 rounded-xl flex items-center justify-center border border-pink-400/30">
                  <svg className="w-5 h-5 text-pink-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13a2.89 2.89 0 0 1-5.89 0c0-.06 0-.12 0-.17a2.89 2.89 0 0 1 2.89-2.72c.24 0 .48.03.71.08V8.32a6.23 6.23 0 0 0-3.6.34A6.19 6.19 0 0 0 5 14.5a6.19 6.19 0 0 0 6.19 6.19h.1a6.19 6.19 0 0 0 6.18-6.19V9.12a9.5 9.5 0 0 0 3.77.83V6.69h-.65z"/>
                  </svg>
                </div>
                <CardTitle className="text-white">
                  {locale === 'zh' ? 'TikTok 方案记录' : 'TikTok Records'}
                </CardTitle>
              </div>
              <Link href="/rejection-check">
                <Button size="sm" className="bg-pink-500/20 border-pink-400/30 text-pink-400 hover:bg-pink-500/30">
                  {locale === 'zh' ? '开始诊断' : 'Start Diagnosis'}
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-blue-200 text-center py-4">{locale === 'zh' ? '加载中...' : 'Loading...'}</p>
              ) : tkRecords.length === 0 ? (
                <p className="text-blue-200/70 text-center py-4">{locale === 'zh' ? '暂无TikTok诊断记录' : 'No TikTok records'}</p>
              ) : (
                <div className="space-y-3">
                  {tkRecords.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {record.diagnosis_type === 'full' 
                              ? (locale === 'zh' ? '完整四层审查' : 'Full 4-Layer Review')
                              : (locale === 'zh' ? '轻量建议' : 'Light Advice')}
                          </p>
                          <p className="text-blue-300 text-xs">
                            {new Date(record.created_at).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')}
                          </p>
                        </div>
                      </div>
                      <Link href={`/dashboard/plans?tab=tk&record=${record.id}`}>
                        <Button size="sm" variant="ghost" className="text-pink-400 hover:text-pink-300">
                          {locale === 'zh' ? '查看' : 'View'}
                        </Button>
                      </Link>
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
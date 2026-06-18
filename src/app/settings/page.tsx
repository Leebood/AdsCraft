'use client';

import { useI18n } from '@/lib/i18n-context';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/language-switcher';
import Link from 'next/link';

export default function SettingsPage() {
  const { locale } = useI18n();
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="w-full max-w-md bg-white/5 border-white/20">
          <CardContent className="text-center py-12">
            <p className="text-blue-200 mb-6">
              {locale === 'zh' ? '请登录以访问设置' : 'Please login to access settings'}
            </p>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600">
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
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      
      <main className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-2xl mx-auto">
          {/* 标题 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {locale === 'zh' ? '设置' : 'Settings'}
            </h1>
            <p className="text-blue-200/70">
              {locale === 'zh' ? '管理你的账户和偏好设置' : 'Manage your account and preferences'}
            </p>
          </div>

          {/* 用户信息 */}
          <Card className="bg-white/5 border-white/20 mb-6">
            <CardHeader>
              <CardTitle className="text-white">
                {locale === 'zh' ? '账户信息' : 'Account Information'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-200/60">
                      {locale === 'zh' ? '邮箱' : 'Email'}
                    </p>
                    <p className="text-white">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-200/60">
                      {locale === 'zh' ? '用户ID' : 'User ID'}
                    </p>
                    <p className="text-white/70 text-sm">
                      {user.id}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 语言设置 */}
          <Card className="bg-white/5 border-white/20 mb-6">
            <CardHeader>
              <CardTitle className="text-white">
                {locale === 'zh' ? '语言设置' : 'Language Settings'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-200/60">
                    {locale === 'zh' ? '当前语言' : 'Current Language'}
                  </p>
                  <p className="text-white">
                    {locale === 'zh' ? '中文' : 'English'}
                  </p>
                </div>
                <LanguageSwitcher />
              </div>
            </CardContent>
          </Card>

          {/* 平台连接 */}
          <Card className="bg-white/5 border-white/20 mb-6">
            <CardHeader>
              <CardTitle className="text-white">
                {locale === 'zh' ? '平台连接' : 'Platform Connections'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* TikTok 连接 */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎵</span>
                    <div>
                      <p className="text-white font-medium">TikTok</p>
                      <p className="text-sm text-blue-200/60">
                        {locale === 'zh' ? '连接以获取实时广告数据' : 'Connect for real-time ad data'}
                      </p>
                    </div>
                  </div>
                  <Link href="/api/auth/tiktok">
                    <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-blue-600">
                      {locale === 'zh' ? '连接' : 'Connect'}
                    </Button>
                  </Link>
                </div>

                {/* Facebook 连接 */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📘</span>
                    <div>
                      <p className="text-white font-medium">Facebook</p>
                      <p className="text-sm text-blue-200/60">
                        {locale === 'zh' ? '截图上传模式' : 'Screenshot upload mode'}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="bg-white/10 border-white/30 text-blue-200">
                    {locale === 'zh' ? '已启用' : 'Enabled'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 退出登录 */}
          <div className="text-center">
            <Button 
              onClick={signOut}
              variant="outline"
              className="bg-red-500/10 border-red-400/30 text-red-400 hover:bg-red-500/20 hover:border-red-400/50"
            >
              {locale === 'zh' ? '退出登录' : 'Sign Out'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
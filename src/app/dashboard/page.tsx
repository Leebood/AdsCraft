'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/lib/i18n-context';
import { useAuth } from '@/lib/auth-context';

export default function DashboardPage() {
  const { t } = useI18n();
  const { user, isPremium, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <Card className="w-full max-w-md bg-white/5 border-white/20 backdrop-blur-sm shadow-xl relative z-10">
          <CardContent className="text-center py-12">
            <p className="text-blue-200 mb-6">Please login to access your dashboard</p>
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
              Welcome, {user.user_metadata?.full_name || user.email}
            </h1>
            <p className="text-blue-200">
              {isPremium ? 'Premium Member' : 'Free Member'}
            </p>
          </div>

          {/* User Info Card */}
          <Card className="bg-white/5 border-white/20 backdrop-blur-sm shadow-xl mb-6">
            <CardHeader>
              <CardTitle className="text-white">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-blue-200">Email:</span>
                <span className="text-white">{user.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-200">Status:</span>
                <span className={isPremium ? 'text-cyan-400' : 'text-blue-300'}>
                  {isPremium ? 'Premium' : 'Free'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Upgrade Card */}
          {!isPremium && (
            <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-400/30 backdrop-blur-sm shadow-xl mb-6">
              <CardContent className="text-center py-8">
                <p className="text-white mb-4">Unlock full plan details with Premium</p>
                <Link href="/pricing">
                  <Button 
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 to-blue-500 text-white shadow-lg shadow-cyan-500/30"
                  >
                    Upgrade to Premium
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
              Sign Out
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
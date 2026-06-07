'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/lib/i18n-context';
import { useAuth } from '@/lib/auth-context';

export default function SignupPage() {
  const { t } = useI18n();
  const { signUp } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signUp(email, password, fullName);
      setSuccess(true);
      // 注册成功后跳转到登录页
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError(t('signup.error'));
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <Card className="w-full max-w-md bg-white/5 border-white/20 backdrop-blur-sm shadow-xl relative z-10">
          <CardContent className="text-center py-12">
            <p className="text-green-400 text-xl">{t('signup.success')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* 网格纹理背景 */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      
      <main className="container mx-auto px-4 py-12 relative z-10 flex items-center justify-center">
        <Card className="w-full max-w-md bg-white/5 border-white/20 backdrop-blur-sm shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">{t('signup.title')}</CardTitle>
            <p className="text-blue-200 mt-2">{t('signup.subtitle')}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-white">{t('signup.fullName')}</Label>
                <Input 
                  id="fullName" 
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-white/10 border-white/30 text-white placeholder:text-blue-300/50 focus:border-cyan-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">{t('signup.email')}</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/10 border-white/30 text-white placeholder:text-blue-300/50 focus:border-cyan-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">{t('signup.password')}</Label>
                <Input 
                  id="password" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-white/10 border-white/30 text-white placeholder:text-blue-300/50 focus:border-cyan-400"
                />
              </div>
              
              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}
              
              <Button 
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 to-blue-500 text-white shadow-lg shadow-cyan-500/30 disabled:opacity-50"
              >
                {loading ? t('signup.loading') : t('signup.submit')}
              </Button>
            </form>
            
            <div className="text-center pt-4 border-t border-white/20">
              <p className="text-blue-200 mb-3">{t('signup.hasAccount')}</p>
              <Link href="/login">
                <Button variant="outline" className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-cyan-400">
                  {t('signup.login')}
                </Button>
              </Link>
            </div>
            
            <div className="text-center">
              <Link href="/">
                <Button variant="ghost" className="text-blue-200 hover:text-cyan-400 hover:bg-white/10">
                  {t('common.backHome')}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
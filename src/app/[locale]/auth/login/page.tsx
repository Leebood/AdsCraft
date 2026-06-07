'use client';

import {useTranslations} from 'next-intl';
import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Link} from '@/i18n/routing';

export default function LoginPage() {
  const t = useTranslations();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement login logic
    console.log('Login:', {email, password});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">{t('auth.login.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">{t('auth.login.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">{t('auth.login.password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              {t('auth.login.submit')}
            </Button>
          </form>

          <div className="mt-4 space-y-2">
            <Button variant="outline" className="w-full">
              {t('auth.login.google')}
            </Button>
            <Button variant="outline" className="w-full">
              {t('auth.login.github')}
            </Button>
          </div>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">{t('auth.login.noAccount')}</span>
            <Link href="/auth/signup" className="ml-2 text-blue-600 hover:underline">
              {t('auth.login.signup')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
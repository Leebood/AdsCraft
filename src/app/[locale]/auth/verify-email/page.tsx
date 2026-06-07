'use client';

import {useTranslations} from 'next-intl';
import {useState, useEffect} from 'react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {InputOTP, InputOTPGroup, InputOTPSlot} from '@/components/ui/input-otp';

export default function VerifyEmailPage() {
  const t = useTranslations();
  const [code, setCode] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleVerify = () => {
    if (code.length === 6) {
      // TODO: Implement verification logic
      console.log('Verify:', code);
    }
  };

  const handleResend = () => {
    if (canResend) {
      // TODO: Implement resend logic
      console.log('Resend code');
      setCountdown(60);
      setCanResend(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">{t('auth.verify.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600">{t('auth.verify.codeSent')}</p>
            <p className="font-semibold">your@email.com</p>
          </div>

          <div className="flex justify-center">
            <InputOTP maxLength={6} value={code} onChange={setCode}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button 
            className="w-full" 
            onClick={handleVerify}
            disabled={code.length !== 6}
          >
            Verify
          </Button>

          <div className="text-center">
            {canResend ? (
              <Button variant="ghost" onClick={handleResend}>
                {t('auth.verify.resend')}
              </Button>
            ) : (
              <p className="text-sm text-gray-500">
                {t('auth.verify.resendIn')} {countdown} {t('auth.verify.seconds')}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
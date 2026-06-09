'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n-context';
import { useAuth } from '@/lib/auth-context';
import { CREEM_PRODUCTS } from '@/lib/creem-config';

function PricingContent() {
  const { t } = useI18n();
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const route = searchParams.get('route') || '';
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'creem' | 'wechat'>('creem');
  const [error, setError] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);

  // Creem支付：直接跳转到Creem支付页面
  const handleCreemPayment = () => {
    if (!user) {
      router.push('/login');
      return;
    }

    const product = CREEM_PRODUCTS[route as keyof typeof CREEM_PRODUCTS];
    if (product) {
      window.location.href = product.url;
    } else {
      setError('Invalid route');
    }
  };

  // 微信支付：调用API创建订单，显示二维码
  const handleWechatPayment = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          route,
          user_id: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment creation failed');
      }

      // Native支付返回code_url（二维码链接）
      if (data.code_url) {
        setQrCodeUrl(data.code_url);
        setShowQrModal(true);
      } else {
        throw new Error('Payment link not received');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Payment failed, please try again');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = () => {
    if (paymentMethod === 'creem') {
      handleCreemPayment();
    } else {
      handleWechatPayment();
    }
  };

  const routePricing: Record<string, {
    title: string;
    price: string;
    roi: string;
    bgClass: string;
    borderClass: string;
    iconColor: string;
  }> = {
    retailer: {
      title: t('pricing.retailer.title'),
      price: '$19.9',
      roi: t('pricing.retailer.roi'),
      bgClass: 'from-yellow-500/20 to-orange-500/20',
      borderClass: 'border-yellow-400/50',
      iconColor: 'text-yellow-400'
    },
    manufacturer: {
      title: t('pricing.manufacturer.title'),
      price: '$29.9',
      roi: t('pricing.manufacturer.roi'),
      bgClass: 'from-violet-500/20 to-purple-500/20',
      borderClass: 'border-violet-400/50',
      iconColor: 'text-violet-400'
    },
    brand: {
      title: t('pricing.brand.title'),
      price: '$29.9',
      roi: t('pricing.brand.roi'),
      bgClass: 'from-rose-500/20 to-pink-500/20',
      borderClass: 'border-rose-400/50',
      iconColor: 'text-rose-400'
    },
    local_service: {
      title: t('pricing.localService.title'),
      price: '$9.9',
      roi: t('pricing.localService.roi'),
      bgClass: 'from-emerald-500/20 to-teal-500/20',
      borderClass: 'border-emerald-400/50',
      iconColor: 'text-emerald-400'
    }
  };

  const pricingData = routePricing[route];

  if (!pricingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <main className="container mx-auto px-4 py-12 relative z-10">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-white/5 border-white/20 backdrop-blur-xl">
              <CardContent className="p-12 text-center">
                <p className="text-blue-300 text-lg">{t('pricing.selectRoute')}</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  const features = [
    t('pricing.premium.feature1'),
    t('pricing.premium.feature2'),
    t('pricing.premium.feature3'),
    t('pricing.premium.feature4'),
    t('pricing.premium.feature5')
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* 网格纹理背景 */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      
      {/* 二维码弹窗 */}
      {showQrModal && qrCodeUrl && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-white/10 border-white/20 backdrop-blur-xl max-w-sm w-full">
            <CardHeader className="text-center">
              <CardTitle className="text-white text-xl">{t('pricing.qr.title')}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              {/* 二维码显示 - 使用第三方服务生成二维码图片 */}
              <div className="bg-white p-4 rounded-xl mb-4 inline-block">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeUrl)}`}
                  alt="WeChat Pay QR Code"
                  className="w-[200px] h-[200px]"
                />
              </div>
              <p className="text-white/80 text-sm mb-4">{t('pricing.qr.instruction')}</p>
              
              {/* 复制链接按钮 */}
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(qrCodeUrl);
                  alert(t('pricing.qr.copied'));
                }}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 mb-3"
              >
                {t('pricing.qr.copyLink')}
              </Button>
              
              {/* 关闭按钮 */}
              <Button
                onClick={() => setShowQrModal(false)}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white"
              >
                {t('pricing.qr.close')}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      
      <main className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">{t('pricing.title')}</h1>
            <p className="text-blue-300 text-lg">{t('pricing.subtitle')}</p>
          </div>

          {/* 单一付费方案卡片 */}
          <Card className={`bg-gradient-to-br ${pricingData.bgClass} border-2 ${pricingData.borderClass} backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-300`}>
            {/* 光晕效果 */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 blur-3xl opacity-50"></div>
            
            <CardHeader className="text-center pb-4 relative z-10">
              <CardTitle className={`text-2xl font-bold ${pricingData.iconColor}`}>
                {pricingData.title}
              </CardTitle>
              <div className="mt-4">
                <span className="text-5xl font-bold text-white">{pricingData.price}</span>
                <span className="text-blue-200 text-lg ml-2">{t('pricing.premium.period')}</span>
              </div>
            </CardHeader>
            
            <CardContent className="relative z-10">
              {/* ROI预期 */}
              <div className="mb-6 p-4 bg-black/20 rounded-lg border border-white/20">
                <p className="text-white font-medium">{t('pricing.roi.title')}: {pricingData.roi}</p>
              </div>
              
              {/* 功能列表 */}
              <ul className="space-y-3 mb-8">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-white mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-white">{feature}</span>
                  </li>
                ))}
              </ul>
              
              {/* 支付方式选择 */}
              <div className="mb-6">
                <p className="text-white/80 text-sm mb-3">{t('pricing.payment.select')}</p>
                <div className="grid grid-cols-2 gap-3">
                  {/* Creem支付 */}
                  <button
                    onClick={() => setPaymentMethod('creem')}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      paymentMethod === 'creem'
                        ? 'bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border-cyan-400 shadow-lg shadow-cyan-500/20'
                        : 'bg-white/5 border-white/20 hover:border-white/40'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <span className="text-white font-medium">{t('pricing.payment.creem')}</span>
                    </div>
                    <p className="text-white/60 text-xs mt-2">{t('pricing.payment.creemDesc')}</p>
                  </button>
                  
                  {/* 微信支付 */}
                  <button
                    onClick={() => setPaymentMethod('wechat')}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      paymentMethod === 'wechat'
                        ? 'bg-gradient-to-br from-green-500/30 to-emerald-500/30 border-green-400 shadow-lg shadow-green-500/20'
                        : 'bg-white/5 border-white/20 hover:border-white/40'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.3c0 1.785.794 3.415 2.127 4.638l-.826 2.463 2.553-1.185c.954.303 1.993.465 3.037.462 4.8 0 8.691-3.288 8.691-7.378 0-4.09-3.891-7.378-8.691-7.378zm4.033 6.052c.044.477-.144.943-.5 1.22-.357.277-.82.358-1.234.205-.413-.152-.713-.5-.775-.945-.062-.444.1-.887.427-1.152.327-.266.77-.324 1.174-.149.404.174.688.545.708.971zm-5.4 0c.044.477-.144.943-.5 1.22-.357.277-.82.358-1.234.205-.413-.152-.713-.5-.775-.945-.062-.444.1-.887.427-1.152.327-.266.77-.324 1.174-.149.404.174.688.545.708.971z"/>
                      </svg>
                      <span className="text-white font-medium">{t('pricing.payment.wechat')}</span>
                    </div>
                    <p className="text-white/60 text-xs mt-2">{t('pricing.payment.wechatDesc')}</p>
                  </button>
                </div>
              </div>
              
              {/* 升级按钮 */}
              <Button
                onClick={handleUpgrade}
                disabled={isLoading && paymentMethod === 'wechat'}
                className={`w-full font-semibold py-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                  paymentMethod === 'creem'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-cyan-500/30'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 shadow-green-500/30'
                }`}
              >
                {isLoading && paymentMethod === 'wechat' ? (
                  <span className="flex items-center">
                    <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('pricing.premium.processing')}
                  </span>
                ) : (
                  <>
                    {paymentMethod === 'creem' ? t('pricing.payment.creemButton') : t('pricing.premium.button')}
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </Button>

              {/* 错误提示 */}
              {error && (
                <p className="text-center text-red-400 text-sm mt-4">{error}</p>
              )}
              
              {/* 提示 */}
              <p className="text-center text-white/70 text-sm mt-4">
                {t('pricing.premium.note')}
              </p>
            </CardContent>
          </Card>

          {/* 返回按钮 */}
          <div className="text-center mt-8">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-blue-300 hover:text-white hover:bg-white/10"
            >
              {t('common.backPrevious')}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    }>
      <PricingContent />
    </Suspense>
  );
}
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
  const { user, refreshSubscription } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const route = searchParams.get('route') || '';
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'creem' | 'wechat'>('creem');
  const [error, setError] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);

  // Creem支付：直接跳转到Creem支付页面（无需登录验证，Creem会处理）
  const handleCreemPayment = () => {
    const product = CREEM_PRODUCTS[route as keyof typeof CREEM_PRODUCTS];
    if (product) {
      window.open(product.url, '_blank');
    } else {
      setError(t('pricing.error.invalidRoute'));
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
    borderColor: string;
    iconColor: string;
    buttonBg: string;
    buttonHover: string;
    shadowColor: string;
  }> = {
    retailer: {
      title: t('pricing.retailer.title'),
      price: '$19.9',
      roi: t('pricing.retailer.roi'),
      borderColor: 'border-yellow-400',
      iconColor: 'text-yellow-600',
      buttonBg: 'bg-yellow-500',
      buttonHover: 'hover:bg-yellow-600',
      shadowColor: 'shadow-yellow-500/20'
    },
    manufacturer: {
      title: t('pricing.manufacturer.title'),
      price: '$29.9',
      roi: t('pricing.manufacturer.roi'),
      borderColor: 'border-violet-400',
      iconColor: 'text-violet-600',
      buttonBg: 'bg-violet-500',
      buttonHover: 'hover:bg-violet-600',
      shadowColor: 'shadow-violet-500/20'
    },
    brand: {
      title: t('pricing.brand.title'),
      price: '$29.9',
      roi: t('pricing.brand.roi'),
      borderColor: 'border-rose-400',
      iconColor: 'text-rose-600',
      buttonBg: 'bg-rose-500',
      buttonHover: 'hover:bg-rose-600',
      shadowColor: 'shadow-rose-500/20'
    },
    local_service: {
      title: t('pricing.localService.title'),
      price: '$9.9',
      roi: t('pricing.localService.roi'),
      borderColor: 'border-emerald-400',
      iconColor: 'text-emerald-600',
      buttonBg: 'bg-emerald-500',
      buttonHover: 'hover:bg-emerald-600',
      shadowColor: 'shadow-emerald-500/20'
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-white border border-gray-200 shadow-xl max-w-sm w-full">
            <CardHeader className="text-center">
              <CardTitle className="text-gray-800 text-xl">{t('pricing.qr.title')}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              {/* 二维码显示 */}
              <div className="bg-gray-50 p-4 rounded-xl mb-4 inline-block border border-gray-200">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeUrl)}`}
                  alt="WeChat Pay QR Code"
                  className="w-[200px] h-[200px]"
                />
              </div>
              <p className="text-gray-600 text-sm mb-4">{t('pricing.qr.instruction')}</p>
              
              {/* 复制链接按钮 */}
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(qrCodeUrl);
                  alert(t('pricing.qr.copied'));
                }}
                variant="outline"
                className="bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 mb-3"
              >
                {t('pricing.qr.copyLink')}
              </Button>
              
              {/* 支付完成按钮 */}
              <Button
                onClick={async () => {
                  await refreshSubscription();
                  setShowQrModal(false);
                  router.push('/dashboard');
                }}
                variant="outline"
                className="bg-green-50 border-green-400 text-green-600 hover:bg-green-100 mb-3 w-full"
              >
                {t('pricing.qr.paymentComplete')}
              </Button>
              
              {/* 关闭按钮 */}
              <Button
                onClick={() => setShowQrModal(false)}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
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
            <p className="text-blue-200 text-lg">{t('pricing.subtitle')}</p>
          </div>

          {/* 单一付费方案卡片 - 白底配色 */}
          <Card className={`bg-white border-2 ${pricingData.borderColor} shadow-xl ${pricingData.shadowColor} hover:shadow-2xl transition-all duration-300`}>
            <CardHeader className="text-center pb-4">
              <CardTitle className={`text-2xl font-bold ${pricingData.iconColor}`}>
                {pricingData.title}
              </CardTitle>
              <div className="mt-4">
                <span className="text-5xl font-bold text-gray-800">{pricingData.price}</span>
                <span className="text-gray-500 text-lg ml-2">{t('pricing.premium.period')}</span>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* ROI预期 */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-700 font-medium">{t('pricing.roi.title')}: {pricingData.roi}</p>
              </div>
              
              {/* 功能列表 */}
              <ul className="space-y-3 mb-8">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              {/* 支付方式选择 */}
              <div className="mb-6">
                <p className="text-gray-600 text-sm mb-3">{t('pricing.payment.select')}</p>
                <div className="grid grid-cols-2 gap-3">
                  {/* Creem支付 */}
                  <button
                    onClick={() => setPaymentMethod('creem')}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      paymentMethod === 'creem'
                        ? 'bg-blue-50 border-blue-400 shadow-lg'
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <span className="text-gray-700 font-medium">{t('pricing.payment.creem')}</span>
                    </div>
                    <p className="text-gray-500 text-xs mt-2">{t('pricing.payment.creemDesc')}</p>
                  </button>
                  
                  {/* 微信支付 */}
                  <button
                    onClick={() => setPaymentMethod('wechat')}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      paymentMethod === 'wechat'
                        ? 'bg-green-50 border-green-400 shadow-lg'
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.3c0 1.785.794 3.415 2.127 4.638l-.826 2.463 2.553-1.185c.954.303 1.993.465 3.037.462 4.8 0 8.691-3.288 8.691-7.378 0-4.09-3.891-7.378-8.691-7.378zm4.033 6.052c.044.477-.144.943-.5 1.22-.357.277-.82.358-1.234.205-.413-.152-.713-.5-.775-.945-.062-.444.1-.887.427-1.152.327-.266.77-.324 1.174-.149.404.174.688.545.708.971zm-5.4 0c.044.477-.144.943-.5 1.22-.357.277-.82.358-1.234.205-.413-.152-.713-.5-.775-.945-.062-.444.1-.887.427-1.152.327-.266.77-.324 1.174-.149.404.174.688.545.708.971z"/>
                      </svg>
                      <span className="text-gray-700 font-medium">{t('pricing.payment.wechat')}</span>
                    </div>
                    <p className="text-gray-500 text-xs mt-2">{t('pricing.payment.wechatDesc')}</p>
                  </button>
                </div>
              </div>
              
              {/* 升级按钮 */}
              <Button
                onClick={handleUpgrade}
                disabled={isLoading && paymentMethod === 'wechat'}
                className={`w-full font-semibold py-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-white ${
                  paymentMethod === 'creem'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
                    : `${pricingData.buttonBg} ${pricingData.buttonHover}`
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
                <p className="text-center text-red-500 text-sm mt-4">{error}</p>
              )}
              
              {/* 提示 */}
              <p className="text-center text-gray-500 text-sm mt-4">
                {t('pricing.premium.note')}
              </p>
            </CardContent>
          </Card>

          {/* 返回按钮 */}
          <div className="text-center mt-8">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
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
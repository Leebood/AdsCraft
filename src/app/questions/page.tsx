'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/lib/i18n-context';

export default function QuestionsPage() {
  const searchParams = useSearchParams();
  const route = searchParams.get('route') || 'retailer';
  const { t } = useI18n();

  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState({
    route: route,
    budget: '',
    conversionPath: ''
  });

  const budgetOptions = [
    { key: 'low', value: 'low', label: t('questions.budget.low') },
    { key: 'mid', value: 'mid', label: t('questions.budget.mid') },
    { key: 'high', value: 'high', label: t('questions.budget.high') }
  ];

  const pathOptions = [
    { key: 'shopify', value: 'shopify', label: t('questions.path.shopify') },
    { key: 'whatsapp', value: 'whatsapp', label: t('questions.path.whatsapp') },
    { key: 'store', value: 'store', label: t('questions.path.store') },
    { key: 'lead', value: 'lead', label: t('questions.path.lead') }
  ];

  const handleNext = () => {
    if (currentStep === 1 && answers.budget) {
      setCurrentStep(2);
    } else if (currentStep === 2 && answers.conversionPath) {
      const planId = `${answers.route}-${answers.budget}-${answers.conversionPath}`;
      window.location.href = `/plan/${planId}`;
    }
  };

  const isStep1Complete = answers.budget !== '';
  const isStep2Complete = answers.conversionPath !== '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* 网格纹理背景 */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      
      <main className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-2xl mx-auto">
          {/* 标题 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {t('questions.title')}
            </h1>
            <p className="text-lg text-blue-200">
              {t('questions.subtitle')}
            </p>
          </div>

          {/* 进度指示器 */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                currentStep >= 1 
                  ? 'bg-cyan-500 border-cyan-400 text-white' 
                  : 'bg-white/10 border-white/30 text-white/50'
              }`}>
                1
              </div>
              <div className="w-16 h-1 bg-white/20 rounded">
                <div className={`h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all ${
                  currentStep >= 2 ? 'w-full' : 'w-0'
                }`}></div>
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                currentStep >= 2 
                  ? 'bg-cyan-500 border-cyan-400 text-white' 
                  : 'bg-white/10 border-white/30 text-white/50'
              }`}>
                2
              </div>
            </div>
          </div>

          {/* 问题卡片 */}
          <Card className="bg-white/5 border-white/20 backdrop-blur-sm shadow-xl">
            <CardContent className="p-6">
              {currentStep === 1 && (
                <div>
                  <h2 className="text-xl font-semibold text-white mb-6">
                    {t('questions.budget.title')}
                  </h2>
                  <RadioGroup
                    value={answers.budget}
                    onValueChange={(value) => setAnswers({ ...answers, budget: value })}
                    className="space-y-4"
                  >
                    {budgetOptions.map((option) => (
                      <div key={option.key} className="flex items-center space-x-3">
                        <RadioGroupItem value={option.value} id={option.key} className="border-cyan-400 text-cyan-400" />
                        <Label htmlFor={option.key} className="text-blue-100 cursor-pointer hover:text-cyan-400 transition-colors">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {currentStep === 2 && (
                <div>
                  <h2 className="text-xl font-semibold text-white mb-6">
                    {t('questions.path.title')}
                  </h2>
                  <RadioGroup
                    value={answers.conversionPath}
                    onValueChange={(value) => setAnswers({ ...answers, conversionPath: value })}
                    className="space-y-4"
                  >
                    {pathOptions.map((option) => (
                      <div key={option.key} className="flex items-center space-x-3">
                        <RadioGroupItem value={option.value} id={option.key} className="border-cyan-400 text-cyan-400" />
                        <Label htmlFor={option.key} className="text-blue-100 cursor-pointer hover:text-cyan-400 transition-colors">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {/* 按钮组 */}
              <div className="flex justify-between mt-8">
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-cyan-400"
                  >
                    {t('common.back')}
                  </Button>
                )}
                
                <Button
                  onClick={handleNext}
                  disabled={currentStep === 1 ? !isStep1Complete : !isStep2Complete}
                  className={`${
                    currentStep === 1 ? isStep1Complete : isStep2Complete
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                      : 'bg-white/10 border-white/30 text-white/50 cursor-not-allowed'
                  }`}
                >
                  {currentStep === 2 ? t('questions.generate') : t('questions.next')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 返回首页 */}
          <div className="text-center mt-8">
            <Link href="/">
              <Button variant="ghost" className="text-blue-200 hover:text-cyan-400 hover:bg-white/10">
                {t('common.backHome')}
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
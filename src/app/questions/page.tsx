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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('questions.title')}
            </h1>
            <p className="text-gray-600">
              {t('questions.subtitle')}
            </p>
          </div>

          {/* Progress */}
          <div className="mb-6 flex justify-center">
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                  1
                </div>
                <span className="text-sm">{t('questions.step')} 1 {t('questions.of')} 2</span>
              </div>
              <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                  2
                </div>
                <span className="text-sm">{t('questions.step')} 2 {t('questions.of')} 2</span>
              </div>
            </div>
          </div>

          {/* Step 1: Budget */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>{t('questions.q1')}</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={answers.budget}
                  onValueChange={(value) => setAnswers({ ...answers, budget: value })}
                  className="space-y-3"
                >
                  {budgetOptions.map((option) => (
                    <div key={option.key} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={option.key} />
                      <Label htmlFor={option.key} className="cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <div className="mt-6 flex justify-between">
                  <Link href="/">
                    <Button variant="outline">
                      {t('common.back')}
                    </Button>
                  </Link>
                  <Button
                    onClick={handleNext}
                    disabled={!isStep1Complete}
                  >
                    {t('questions.next')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Conversion Path */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>{t('questions.q2')}</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={answers.conversionPath}
                  onValueChange={(value) => setAnswers({ ...answers, conversionPath: value })}
                  className="space-y-3"
                >
                  {pathOptions.map((option) => (
                    <div key={option.key} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={option.key} />
                      <Label htmlFor={option.key} className="cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <div className="mt-6 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                  >
                    {t('common.back')}
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!isStep2Complete}
                  >
                    {t('questions.generate')}
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
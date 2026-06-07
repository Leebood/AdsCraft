'use client';

import {useTranslations} from 'next-intl';
import {useRouter, useSearchParams} from 'next/navigation';
import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group';
import {Label} from '@/components/ui/label';

export default function QuestionsPage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const router = useRouter();
  const route = searchParams.get('route') || 'retailer';

  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState({
    route: route,
    budget: '',
    conversionPath: ''
  });

  const budgetOptions = [
    {key: 'low', value: 'low'},
    {key: 'mid', value: 'mid'},
    {key: 'high', value: 'high'}
  ];

  const pathOptions = [
    {key: 'shopify', value: 'shopify'},
    {key: 'whatsapp', value: 'whatsapp'},
    {key: 'store', value: 'store'},
    {key: 'lead', value: 'lead'}
  ];

  const handleBudgetSelect = (value: string) => {
    setAnswers({...answers, budget: value});
  };

  const handlePathSelect = (value: string) => {
    setAnswers({...answers, conversionPath: value});
  };

  const handleNext = () => {
    if (currentStep === 1 && answers.budget) {
      setCurrentStep(2);
    } else if (currentStep === 2 && answers.conversionPath) {
      // Generate plan ID from answers
      const planId = `${answers.route}-${answers.budget}-${answers.conversionPath}`;
      router.push(`/plan/${planId}`);
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
            <h1 className="text-3xl font-bold mb-2">{t('questions.free.title')}</h1>
            <p className="text-gray-600">{t('questions.free.subtitle')}</p>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex gap-2">
              <div className={`w-12 h-2 rounded-full ${currentStep >= 1 ? 'bg-blue-600' : 'bg-gray-300'}`} />
              <div className={`w-12 h-2 rounded-full ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
            </div>
          </div>

          {/* Question Cards */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>{t('questions.free.budget.question')}</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={answers.budget} onValueChange={handleBudgetSelect}>
                  {budgetOptions.map(({key, value}) => (
                    <div key={value} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value={value} id={value} />
                      <Label htmlFor={value} className="cursor-pointer flex-1">
                        {t(`questions.free.budget.${key}`)}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                <Button 
                  className="w-full mt-6" 
                  disabled={!isStep1Complete}
                  onClick={handleNext}
                >
                  {t('questions.next')}
                </Button>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>{t('questions.free.conversionPath.question')}</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={answers.conversionPath} onValueChange={handlePathSelect}>
                  {pathOptions.map(({key, value}) => (
                    <div key={value} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value={value} id={value} />
                      <Label htmlFor={value} className="cursor-pointer flex-1">
                        {t(`questions.free.conversionPath.${key}`)}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                <Button 
                  className="w-full mt-6" 
                  disabled={!isStep2Complete}
                  onClick={handleNext}
                >
                  {t('questions.generatePlan')}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
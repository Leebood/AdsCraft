'use client';

import {useSearchParams} from 'next/navigation';
import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group';
import {Label} from '@/components/ui/label';

export default function QuestionsPage() {
  const searchParams = useSearchParams();
  const route = searchParams.get('route') || 'retailer';

  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState({
    route: route,
    budget: '',
    conversionPath: ''
  });

  const budgetOptions = [
    {key: 'low', value: 'low', label: '不到$20'},
    {key: 'mid', value: 'mid', label: '$20-50'},
    {key: 'high', value: 'high', label: '$50以上'}
  ];

  const pathOptions = [
    {key: 'shopify', value: 'shopify', label: '网站/Shopify在线下单'},
    {key: 'whatsapp', value: 'whatsapp', label: 'WhatsApp/Line联系下单'},
    {key: 'store', value: 'store', label: '到店/电话'},
    {key: 'lead', value: 'lead', label: '填表留下信息'}
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
            <h1 className="text-3xl font-bold mb-2">回答3个问题获得通用方案</h1>
            <p className="text-gray-600">回答3个问题,几秒钟获得可用的配置</p>
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
                <CardTitle>你的日预算范围是多少?</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={answers.budget} onValueChange={(value) => setAnswers({...answers, budget: value})}>
                  {budgetOptions.map(({key, value, label}) => (
                    <div key={value} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value={value} id={value} />
                      <Label htmlFor={value} className="cursor-pointer flex-1">{label}</Label>
                    </div>
                  ))}
                </RadioGroup>
                <Button className="w-full mt-6" disabled={!isStep1Complete} onClick={handleNext}>下一步</Button>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>客户怎么下单或联系你?</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={answers.conversionPath} onValueChange={(value) => setAnswers({...answers, conversionPath: value})}>
                  {pathOptions.map(({key, value, label}) => (
                    <div key={value} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value={value} id={value} />
                      <Label htmlFor={value} className="cursor-pointer flex-1">{label}</Label>
                    </div>
                  ))}
                </RadioGroup>
                <Button className="w-full mt-6" disabled={!isStep2Complete} onClick={handleNext}>生成我的方案</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
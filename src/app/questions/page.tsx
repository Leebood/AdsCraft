'use client';

import { useSearchParams } from 'next/navigation';
import { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/lib/i18n-context';
import { useAuth } from '@/lib/auth-context';
import { tiktokPixel } from '@/lib/tiktok-pixel';
import { PLATFORM_CONFIGS, PlatformId, QuizStep, ComplianceItem, TIKTOK_ROUTE_QUIZ_CONFIGS, FACEBOOK_QUIZ_CONFIG, RouteQuizConfig } from '@/lib/platforms/registry';
import { ComplianceChecklist } from '@/components/compliance-checklist';
import { ACCOUNT_STAGE_QUIZ } from '@/lib/platforms/tiktok-account-diagnosis';

// 线路 ID 映射到 Quiz 配置 key
const TIKTOK_ROUTE_MAP: Record<string, string> = {
  'rejection_check': 'rejection_check',
  'local_service': 'local_service',
  'website_conv': 'website_conv',
  'brand_awareness': 'brand_awareness',
  // 兼容旧名称
  'free': 'rejection_check',
  'local-service': 'local_service',
  'website-conversion': 'website_conv',
  'brand': 'brand_awareness'
};

function QuizContent() {
  const searchParams = useSearchParams();
  const platform = (searchParams.get('platform') || 'facebook') as PlatformId;
  const route = searchParams.get('route') || 'free';
  const { t, locale } = useI18n();

  // 获取平台配置
  const platformConfig = PLATFORM_CONFIGS[platform];
  
  // 根据平台和线路获取 Quiz 配置
  const getQuizFlow = (): QuizStep[] => {
    if (platform === 'tiktok') {
      // TikTok 使用线路专属配置
      const routeKey = TIKTOK_ROUTE_MAP[route] || 'rejection_check';
      const routeQuiz = TIKTOK_ROUTE_QUIZ_CONFIGS[routeKey as keyof typeof TIKTOK_ROUTE_QUIZ_CONFIGS];
      // 转换 RouteQuizStep[] 为 QuizStep[]
      if (routeQuiz) {
        return routeQuiz.map((step): QuizStep => ({
          id: step.id,
          title: step.titleEn,
          titleZh: step.titleZh,
          description: '',
          descriptionZh: '',
          options: step.options.map(opt => ({
            id: opt.id,
            value: opt.value,
            label: opt.labelEn,
            labelZh: opt.labelZh,
            description: opt.descriptionEn,
            descriptionZh: opt.descriptionZh
          }))
        }));
      }
      return [];
    }
    // Facebook 使用通用配置
    const fbQuiz = platformConfig?.quizFlow || [];
    // 转换 FACEBOOK_QUIZ_CONFIG 格式为 QuizStep 格式
    const convertedQuiz: QuizStep[] = [];
    const budgetConfig = FACEBOOK_QUIZ_CONFIG.budget;
    if (budgetConfig) {
      convertedQuiz.push({
        id: 'budget',
        title: budgetConfig.titleEn,
        titleZh: budgetConfig.titleZh,
        description: '',
        descriptionZh: '',
        options: budgetConfig.options.map(opt => ({
          id: opt.id,
          value: opt.value,
          label: opt.labelEn,
          labelZh: opt.labelZh,
          description: opt.descriptionEn,
          descriptionZh: opt.descriptionZh
        }))
      });
    }
    const goalConfig = FACEBOOK_QUIZ_CONFIG.goal;
    if (goalConfig) {
      convertedQuiz.push({
        id: 'goal',
        title: goalConfig.titleEn,
        titleZh: goalConfig.titleZh,
        description: '',
        descriptionZh: '',
        options: goalConfig.options.map(opt => ({
          id: opt.id,
          value: opt.value,
          label: opt.labelEn,
          labelZh: opt.labelZh,
          description: opt.descriptionEn,
          descriptionZh: opt.descriptionZh
        }))
      });
    }
    return convertedQuiz.length > 0 ? convertedQuiz : fbQuiz;
  };
  
  const quizFlow = getQuizFlow();
  
  // TikTok 账号阶段问题（仅付费线路需要）
  const isPaidRoute = route !== 'free' && route !== 'rejection_check';
  const accountStageQuiz = platform === 'tiktok' && isPaidRoute ? ACCOUNT_STAGE_QUIZ : null;
  const totalSteps = quizFlow.length + (accountStageQuiz ? 1 : 0);

  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({
    route: route,
  });
  const [showCompliance, setShowCompliance] = useState(false);
  const [compliancePassed, setCompliancePassed] = useState(false);

  // 获取当前步骤的配置
  const getCurrentStepConfig = (): QuizStep | null => {
    if (currentStep <= quizFlow.length) {
      return quizFlow[currentStep - 1];
    }
    // TikTok 账号阶段问题
    if (accountStageQuiz && currentStep === quizFlow.length + 1) {
      return accountStageQuiz;
    }
    return null;
  };

  const currentStepConfig = getCurrentStepConfig();
  const isLastQuizStep = currentStep === totalSteps;
  const isAnswered = currentStepConfig ? answers[currentStepConfig.id] !== undefined && answers[currentStepConfig.id] !== '' : false;

  const handleNext = () => {
    if (!isAnswered) return;

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else if (isLastQuizStep) {
      // 最后一步，显示合规检查
      if (platformConfig?.complianceChecklist?.length > 0 && !compliancePassed) {
        setShowCompliance(true);
      } else {
        // 已通过合规检查或无合规检查，直接跳转
        proceedToPlan();
      }
    }
  };

  const handleCompliancePass = () => {
    setCompliancePassed(true);
    setShowCompliance(false);
    proceedToPlan();
  };

  const handleComplianceSkip = () => {
    setShowCompliance(false);
    proceedToPlan();
  };

  const proceedToPlan = () => {
    tiktokPixel.initiateCheckout(); // TikTok Pixel: 提交诊断追踪
    
    // 构建 planId，包含平台信息
    const answerKeys = Object.keys(answers).filter(k => k !== 'route');
    const answerValues = answerKeys.map(k => answers[k]).join('-');
    const planId = `${platform}-${route}-${answerValues}`;
    
    window.location.href = `/plan/${planId}`;
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      window.history.back();
    }
  };

  // 渲染选项
  const renderOptions = (step: QuizStep) => {
    return step.options.map((option) => (
      <div key={option.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors">
        <RadioGroupItem 
          value={option.value} 
          id={option.id} 
          className="border-cyan-400 text-cyan-400" 
        />
        <Label htmlFor={option.id} className="flex-1 cursor-pointer">
          <span className="text-blue-100 hover:text-cyan-400 transition-colors">
            {locale === 'zh' ? option.labelZh || option.label : option.label}
          </span>
          {option.description && (
            <span className="text-blue-300/60 text-sm ml-2">
              ({locale === 'zh' ? option.descriptionZh || option.description : option.description})
            </span>
          )}
        </Label>
      </div>
    ));
  };

  // 获取线路名称
  const getRouteName = () => {
    const routeConfig = platformConfig?.routes?.find(r => r.id === route);
    return locale === 'zh' ? routeConfig?.nameZh : routeConfig?.name;
  };

  // 渲染合规检查弹窗
  if (showCompliance) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <Card className="w-full max-w-2xl bg-white/5 border-white/20 backdrop-blur-sm shadow-xl relative z-10">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">
              {locale === 'zh' ? '合规预检' : 'Compliance Checklist'}
            </h2>
            <p className="text-blue-200 mb-6 text-center">
              {locale === 'zh' 
                ? '请确认以下合规要点，避免广告被拒审' 
                : 'Please confirm these compliance points to avoid ad rejection'}
            </p>
            
            <ComplianceChecklist 
              platform={platform}
              onComplete={handleCompliancePass}
              onSkip={handleComplianceSkip}
            />
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
        <div className="max-w-2xl mx-auto">
          {/* 标题 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-4">
              <div 
                className="w-5 h-5 flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: platformConfig?.icon || '' }}
              />
              <span className="text-blue-200 font-medium">
                {locale === 'zh' ? platformConfig?.nameZh || platformConfig?.name : platformConfig?.name}
              </span>
              {route && (
                <span className="text-cyan-400 ml-2">
                  · {getRouteName()}
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {locale === 'zh' ? '诊断配置' : 'Diagnostic Configuration'}
            </h1>
            <p className="text-lg text-blue-200">
              {locale === 'zh' 
                ? `回答 ${totalSteps} 个问题，获取个性化诊断方案` 
                : `Answer ${totalSteps} questions to get personalized diagnosis`}
            </p>
          </div>

          {/* 进度指示器 */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
              {Array.from({ length: totalSteps }).map((_, idx) => (
                <div key={idx} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    currentStep >= idx + 1 
                      ? 'bg-cyan-500 border-cyan-400 text-white' 
                      : 'bg-white/10 border-white/30 text-white/50'
                  }`}>
                    {idx + 1}
                  </div>
                  {idx < totalSteps - 1 && (
                    <div className="w-8 h-1 bg-white/20 rounded">
                      <div className={`h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all ${
                        currentStep > idx + 1 ? 'w-full' : 'w-0'
                      }`}></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 问题卡片 */}
          {currentStepConfig && (
            <Card className="bg-white/5 border-white/20 backdrop-blur-sm shadow-xl">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-white mb-2">
                  {locale === 'zh' 
                    ? currentStepConfig.titleZh || currentStepConfig.title 
                    : currentStepConfig.title}
                </h2>
                <p className="text-blue-300/70 mb-6">
                  {locale === 'zh' 
                    ? currentStepConfig.descriptionZh || currentStepConfig.description 
                    : currentStepConfig.description}
                </p>

                <RadioGroup
                  value={answers[currentStepConfig.id] || ''}
                  onValueChange={(value) => setAnswers({ ...answers, [currentStepConfig.id]: value })}
                  className="space-y-2"
                >
                  {renderOptions(currentStepConfig)}
                </RadioGroup>

                {/* 按钮组 */}
                <div className="flex justify-between mt-8">
                  <Button
                    onClick={handleNext}
                    disabled={!isAnswered}
                    className={`${
                      isAnswered
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                        : 'bg-white/10 border-white/30 text-white/50 cursor-not-allowed'
                    }`}
                  >
                    {isLastQuizStep 
                      ? (locale === 'zh' ? '获取方案' : 'Get Plan') 
                      : (locale === 'zh' ? '下一步' : 'Next')}
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    onClick={handleBack}
                    className="text-blue-200 hover:text-cyan-400 hover:bg-white/10"
                  >
                    {locale === 'zh' ? '返回' : 'Back'}
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

export default function QuizPage() {
  const { t, locale } = useI18n();
  const { user, loading } = useAuth();

  // 未登录时显示登录提示
  if (!loading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <Card className="w-full max-w-md bg-white/5 border-white/20 backdrop-blur-sm shadow-xl relative z-10">
          <CardContent className="text-center py-12">
            <p className="text-blue-200 mb-6">
              {locale === 'zh' ? '请登录以访问诊断方案' : 'Please login to access diagnosis'}
            </p>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/30">
                {t('login.title')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 加载中时显示加载状态
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    }>
      <QuizContent />
    </Suspense>
  );
}
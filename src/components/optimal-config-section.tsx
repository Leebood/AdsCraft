'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n-context';

interface OptimalConfigSectionProps {
  configPreview: {
    // 免费层：区间值（可信但不完整）
    cpaRange?: string;
    ctrRange?: string;
    roasRange?: string;
  };
  configFull?: {
    // 付费层：精确值
    bidStrategy?: string;
    audienceConfig?: string;
    budgetAllocation?: string;
    optimizationEvents?: string;
  };
  isPremium: boolean;
  onUnlock?: () => void;
}

export function OptimalConfigSection({ configPreview, configFull, isPremium, onUnlock }: OptimalConfigSectionProps) {
  const { locale } = useI18n();
  
  // 默认预览数据（区间值）
  const preview = configPreview || {
    cpaRange: '$4-6',
    ctrRange: '1.5-2.5%',
    roasRange: '2.5-4.0x'
  };
  
  // 默认完整配置（付费层）
  const full = configFull || {
    bidStrategy: locale === 'zh' ? 'Cost Cap $8, 逐步降至$5' : 'Cost Cap $8, gradually to $5',
    audienceConfig: locale === 'zh' ? '核心受众(25-45岁) + LAA 1-2% + 兴趣扩展' : 'Core (25-45) + LAA 1-2% + Interest expansion',
    budgetAllocation: locale === 'zh' ? '60%测试期 → 40%稳定期' : '60% testing → 40% stable',
    optimizationEvents: locale === 'zh' ? 'ViewContent → AddToCart → Purchase' : 'ViewContent → AddToCart → Purchase'
  };

  return (
    <Card className={`bg-white/5 backdrop-blur-sm shadow-xl transition-all ${
      isPremium ? 'border-cyan-400/30' : 'border-orange-400/30'
    }`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              isPremium 
                ? 'bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border border-cyan-400/50 text-cyan-300' 
                : 'bg-orange-500/20 border border-orange-400/30 text-orange-400'
            }`}>
              2
            </div>
            <CardTitle className="text-white">
              {locale === 'zh' ? '最优配置' : 'Optimal Configuration'}
            </CardTitle>
          </div>
          {!isPremium && (
            <span className="px-3 py-1 rounded-full text-xs bg-orange-500/20 text-orange-400 border border-orange-400/30">
              {locale === 'zh' ? '预览模式' : 'Preview Mode'}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 免费层：预览区间 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg border ${isPremium ? 'bg-cyan-500/10 border-cyan-400/30' : 'bg-white/5 border-white/10'}`}>
            <div className="text-blue-300/70 text-sm mb-2">{locale === 'zh' ? 'CPA目标区间' : 'CPA Target Range'}</div>
            <div className={`font-bold text-xl ${isPremium ? 'text-cyan-400' : 'text-blue-200'}`}>
              {preview.cpaRange}
            </div>
            {!isPremium && (
              <div className="text-xs text-blue-300/50 mt-1">
                {locale === 'zh' ? '精确出价$X需解锁' : 'Exact bid $X requires unlock'}
              </div>
            )}
          </div>
          
          <div className={`p-4 rounded-lg border ${isPremium ? 'bg-cyan-500/10 border-cyan-400/30' : 'bg-white/5 border-white/10'}`}>
            <div className="text-blue-300/70 text-sm mb-2">{locale === 'zh' ? 'CTR提升区间' : 'CTR Improvement Range'}</div>
            <div className={`font-bold text-xl ${isPremium ? 'text-cyan-400' : 'text-blue-200'}`}>
              {preview.ctrRange}
            </div>
            {!isPremium && (
              <div className="text-xs text-blue-300/50 mt-1">
                {locale === 'zh' ? '精确定向配置需解锁' : 'Exact targeting requires unlock'}
              </div>
            )}
          </div>
          
          <div className={`p-4 rounded-lg border ${isPremium ? 'bg-cyan-500/10 border-cyan-400/30' : 'bg-white/5 border-white/10'}`}>
            <div className="text-blue-300/70 text-sm mb-2">{locale === 'zh' ? 'ROAS预期区间' : 'Expected ROAS Range'}</div>
            <div className={`font-bold text-xl ${isPremium ? 'text-cyan-400' : 'text-blue-200'}`}>
              {preview.roasRange}
            </div>
            {!isPremium && (
              <div className="text-xs text-blue-300/50 mt-1">
                {locale === 'zh' ? '预算分配方案需解锁' : 'Budget allocation requires unlock'}
              </div>
            )}
          </div>
        </div>
        
        {/* 付费层：完整配置 */}
        {isPremium ? (
          <div className="space-y-4 mt-6">
            <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-400/30">
              <div className="text-cyan-300/70 text-sm mb-2">{locale === 'zh' ? '出价策略' : 'Bid Strategy'}</div>
              <div className="text-white font-medium">{full.bidStrategy}</div>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-400/30">
              <div className="text-cyan-300/70 text-sm mb-2">{locale === 'zh' ? '受众配置' : 'Audience Configuration'}</div>
              <div className="text-white font-medium">{full.audienceConfig}</div>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-400/30">
              <div className="text-cyan-300/70 text-sm mb-2">{locale === 'zh' ? '预算分配' : 'Budget Allocation'}</div>
              <div className="text-white font-medium">{full.budgetAllocation}</div>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-400/30">
              <div className="text-cyan-300/70 text-sm mb-2">{locale === 'zh' ? '优化事件链' : 'Optimization Events'}</div>
              <div className="text-white font-medium">{full.optimizationEvents}</div>
            </div>
          </div>
        ) : (
          <div className="p-8 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg border border-orange-400/30 text-center">
            <div className="text-orange-300 font-medium mb-2">
              {locale === 'zh' ? '🔒 完整配置已锁定' : '🔒 Full Configuration Locked'}
            </div>
            <p className="text-blue-300/70 text-sm mb-4">
              {locale === 'zh' 
                ? '订阅解锁：精确出价金额、完整定向配置、预算分配方案' 
                : 'Subscribe to unlock: Exact bid amounts, full targeting config, budget allocation'}
            </p>
            <Button 
              onClick={onUnlock}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white shadow-lg shadow-orange-500/30"
            >
              {locale === 'zh' ? '解锁完整配置' : 'Unlock Full Configuration'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
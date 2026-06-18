'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/lib/i18n-context';

interface OptimizationPathSectionProps {
  isPremium: boolean;
  pathData?: {
    days: number[];
    actions: string[];
    triggers: string[];
  };
}

export function OptimizationPathSection({ isPremium, pathData }: OptimizationPathSectionProps) {
  const { locale } = useI18n();
  
  // 默认优化路径（7-14天）
  const defaultPath = {
    days: [1, 3, 7, 10, 14],
    actions: [
      locale === 'zh' ? '启动测试，观察CTR和CPC' : 'Start testing, monitor CTR & CPC',
      locale === 'zh' ? '根据CTR调整素材，高CTR保留' : 'Adjust creatives based on CTR, keep high performers',
      locale === 'zh' ? '切换到Cost Cap，设置目标CPA' : 'Switch to Cost Cap, set target CPA',
      locale === 'zh' ? '扩展受众，增加LAA受众组' : 'Expand audience, add LAA groups',
      locale === 'zh' ? '稳定投放，每周复盘优化' : 'Stable phase, weekly review',
    ],
    triggers: [
      locale === 'zh' ? 'CTR > 1% → 保持；CTR < 0.8% → 替换素材' : 'CTR > 1% → keep; CTR < 0.8% → replace creative',
      locale === 'zh' ? 'CPC > $1.5 → 检查定向；CPC < $0.8 → 扩展受众' : 'CPC > $1.5 → check targeting; CPC < $0.8 → expand',
      locale === 'zh' ? 'CPA达标 → 保持出价；CPA偏高 → 降低Cost Cap' : 'CPA met → keep bid; CPA high → lower Cost Cap',
      locale === 'zh' ? 'ROAS > 3x → 加预算；ROAS < 2x → 优化受众' : 'ROAS > 3x → add budget; ROAS < 2x → optimize audience',
      locale === 'zh' ? '持续监控，每周调整一次' : 'Continuous monitoring, weekly adjustment',
    ]
  };
  
  const data = pathData || defaultPath;

  if (!isPremium) {
    return (
      <Card className="bg-white/5 border-orange-400/30 backdrop-blur-sm shadow-xl opacity-60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-500/20 border border-orange-400/30 flex items-center justify-center text-orange-400 font-bold">
              3
            </div>
            <CardTitle className="text-white/80">
              {locale === 'zh' ? '优化路径' : 'Optimization Path'}
            </CardTitle>
            <span className="px-3 py-1 rounded-full text-xs bg-orange-500/20 text-orange-400 border border-orange-400/30">
              {locale === 'zh' ? '付费解锁' : 'Premium Only'}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-6 text-center">
            <div className="text-orange-300/70 mb-2">
              {locale === 'zh' ? '🔒 7-14天动态优化路径已锁定' : '🔒 7-14 Day Dynamic Path Locked'}
            </div>
            <p className="text-blue-300/50 text-sm">
              {locale === 'zh' ? '订阅解锁：关键节点决策规则、CTR/CPA触发动作' : 'Subscribe: Decision rules, CTR/CPA triggers'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 border-cyan-400/30 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border border-cyan-400/50 flex items-center justify-center text-cyan-300 font-bold">
            3
          </div>
          <CardTitle className="text-white">
            {locale === 'zh' ? '优化路径（7-14天）' : 'Optimization Path (7-14 Days)'}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.days.map((day, idx) => (
            <div key={day} className="flex gap-4 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-400/20">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 font-bold">
                  D{day}
                </div>
              </div>
              <div className="flex-1">
                <div className="text-white font-medium mb-1">{data.actions[idx]}</div>
                <div className="text-cyan-300/70 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  {locale === 'zh' ? '触发规则' : 'Trigger'}: {data.triggers[idx]}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
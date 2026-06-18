'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/lib/i18n-context';

interface EvolutionSectionProps {
  isPremium: boolean;
}

export function EvolutionSection({ isPremium }: EvolutionSectionProps) {
  const { locale } = useI18n();
  
  if (!isPremium) {
    return (
      <Card className="bg-white/5 border-orange-400/30 backdrop-blur-sm shadow-xl opacity-60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-500/20 border border-orange-400/30 flex items-center justify-center text-orange-400 font-bold">
              4
            </div>
            <CardTitle className="text-white/80">
              {locale === 'zh' ? '持续进化' : 'Evolution'}
            </CardTitle>
            <span className="px-3 py-1 rounded-full text-xs bg-orange-500/20 text-orange-400 border border-orange-400/30">
              {locale === 'zh' ? '付费解锁' : 'Premium Only'}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-6 text-center">
            <div className="text-orange-300/70 mb-2">
              {locale === 'zh' ? '🔒 持续进化循环已锁定' : '🔒 Evolution Loop Locked'}
            </div>
            <p className="text-blue-300/50 text-sm">
              {locale === 'zh' ? '订阅解锁：新数据重新算最优解、周期性复盘机制' : 'Subscribe: Re-optimize with new data, periodic review'}
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
            4
          </div>
          <CardTitle className="text-white">
            {locale === 'zh' ? '持续进化循环' : 'Evolution Loop'}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 循环1：数据收集 */}
          <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-400/20">
            <div className="text-cyan-400 font-bold mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                <path d="M12 2a8 8 0 018 8h-8V2z" />
              </svg>
              {locale === 'zh' ? '数据收集' : 'Data Collection'}
            </div>
            <ul className="text-blue-200 text-sm space-y-1">
              <li>• {locale === 'zh' ? '每日同步广告数据' : 'Daily ad data sync'}</li>
              <li>• {locale === 'zh' ? '追踪CTR/CPA/ROAS变化' : 'Track CTR/CPA/ROAS changes'}</li>
              <li>• {locale === 'zh' ? '识别趋势和异常' : 'Identify trends & anomalies'}</li>
            </ul>
          </div>
          
          {/* 循环2：重新计算 */}
          <div className="p-4 bg-gradient-to-br from-purple-500/10 to-violet-500/10 rounded-lg border border-purple-400/20">
            <div className="text-purple-400 font-bold mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.54 20 12c0-4.42-3.58-8-8-8z" />
                <path d="M12 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.46 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" />
              </svg>
              {locale === 'zh' ? '重新计算' : 'Re-calculate'}
            </div>
            <ul className="text-blue-200 text-sm space-y-1">
              <li>• {locale === 'zh' ? 'AI重新分析数据' : 'AI re-analyze data'}</li>
              <li>• {locale === 'zh' ? '更新最优配置参数' : 'Update optimal config'}</li>
              <li>• {locale === 'zh' ? '生成新优化建议' : 'Generate new suggestions'}</li>
            </ul>
          </div>
          
          {/* 循环3：执行调整 */}
          <div className="p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg border border-orange-400/20">
            <div className="text-orange-400 font-bold mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.574l-7 10A1 1 0 018 17v-5H4a1 1 0 01-.82-1.574l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              {locale === 'zh' ? '执行调整' : 'Execute'}
            </div>
            <ul className="text-blue-200 text-sm space-y-1">
              <li>• {locale === 'zh' ? '应用新配置建议' : 'Apply new config'}</li>
              <li>• {locale === 'zh' ? '监控调整效果' : 'Monitor results'}</li>
              <li>• {locale === 'zh' ? '进入下一轮循环' : 'Enter next cycle'}</li>
            </ul>
          </div>
        </div>
        
        {/* 循环周期 */}
        <div className="mt-6 p-4 bg-cyan-500/10 rounded-lg border border-cyan-400/30">
          <div className="flex items-center justify-between">
            <div className="text-cyan-300 font-medium">
              {locale === 'zh' ? '建议复盘周期' : 'Recommended Review Cycle'}
            </div>
            <div className="text-white font-bold">
              {locale === 'zh' ? '每周一次完整复盘，每日数据监控' : 'Weekly full review, daily data monitoring'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
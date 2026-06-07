'use client';

import { useI18n } from '@/lib/i18n-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface StageGuideProps {
  route: string;
  isPremium: boolean;
}

// 5阶段递进指南数据
const getStageGuide = (route: string, locale: string) => {
  const guides: Record<string, Array<{
    stage: string;
    stageEn: string;
    action: string;
    actionEn: string;
    metrics: string;
    metricsEn: string;
    duration: string;
    durationEn: string;
  }>> = {
    retailer: [
      {
        stage: '第1阶段：冷启动',
        stageEn: 'Stage 1: Cold Start',
        action: '投放LAA 1-2% + Broad，测试素材，收集数据',
        actionEn: 'Run LAA 1-2% + Broad, test creatives, collect data',
        metrics: 'CPC < $0.5, CTR > 1.5%, Purchase ROAS > 1.0',
        metricsEn: 'CPC < $0.5, CTR > 1.5%, Purchase ROAS > 1.0',
        duration: '3-7天',
        durationEn: '3-7 days'
      },
      {
        stage: '第2阶段：素材优化',
        stageEn: 'Stage 2: Creative Optimization',
        action: '基于第1阶段数据，保留高CTR素材，淘汰低效素材',
        actionEn: 'Based on Stage 1 data, keep high CTR creatives, drop low performers',
        metrics: 'CTR > 2%, CPATC < $3',
        metricsEn: 'CTR > 2%, CPATC < $3',
        duration: '5-10天',
        durationEn: '5-10 days'
      },
      {
        stage: '第3阶段：受众扩展',
        stageEn: 'Stage 3: Audience Expansion',
        action: '扩展到LAA 3-5% + Interest叠加，逐步扩大预算',
        actionEn: 'Expand to LAA 3-5% + Interest stacking, gradually increase budget',
        metrics: 'ROAS稳定 > 1.5, CAC下降',
        metricsEn: 'ROAS stable > 1.5, CAC decreasing',
        duration: '7-14天',
        durationEn: '7-14 days'
      },
      {
        stage: '第4阶段：规模化',
        stageEn: 'Stage 4: Scale Up',
        action: '切换CBO，预算增加20%/周，监控ROAS波动',
        actionEn: 'Switch to CBO, increase budget 20%/week, monitor ROAS fluctuation',
        metrics: 'ROAS > 2.0, 日销售额增长稳定',
        metricsEn: 'ROAS > 2.0, daily sales growth stable',
        duration: '持续进行',
        durationEn: 'Ongoing'
      },
      {
        stage: '第5阶段：再营销',
        stageEn: 'Stage 5: Remarketing',
        action: '针对ATC/浏览未购用户投放DPA，提升转化率',
        actionEn: 'Target ATC/browse-no-purchase users with DPA, improve conversion rate',
        metrics: 'ROAS > 3.0, 转化率 > 5%',
        metricsEn: 'ROAS > 3.0, conversion rate > 5%',
        duration: '持续进行',
        durationEn: 'Ongoing'
      }
    ],
    manufacturer: [
      {
        stage: '第1阶段：精准定位',
        stageEn: 'Stage 1: Precise Targeting',
        action: '投放Core Audience（职位+行业+国家），测试Instant Form',
        actionEn: 'Run Core Audience (position + industry + country), test Instant Form',
        metrics: 'CPL < $20, 表单填写率 > 15%',
        metricsEn: 'CPL < $20, form fill rate > 15%',
        duration: '7-14天',
        durationEn: '7-14 days'
      },
      {
        stage: '第2阶段：内容优化',
        stageEn: 'Stage 2: Content Optimization',
        action: '优化表单字段（减少必填项），测试不同CTA文案',
        actionEn: 'Optimize form fields (reduce required fields), test different CTA copy',
        metrics: 'CPL下降20%, 询盘质量提升',
        metricsEn: 'CPL decrease 20%, inquiry quality improve',
        duration: '5-10天',
        durationEn: '5-10 days'
      },
      {
        stage: '第3阶段：渠道扩展',
        stageEn: 'Stage 3: Channel Expansion',
        action: '添加Messenger/AN渠道，测试LinkedIn导流',
        actionEn: 'Add Messenger/AN channels, test LinkedIn traffic',
        metrics: '多渠道CPL稳定, 总询盘量增长',
        metricsEn: 'Multi-channel CPL stable, total inquiries increase',
        duration: '7-14天',
        durationEn: '7-14 days'
      },
      {
        stage: '第4阶段：规模化',
        stageEn: 'Stage 4: Scale Up',
        action: '切换CBO，预算增加30%/月，监控询盘质量',
        actionEn: 'Switch to CBO, increase budget 30%/month, monitor inquiry quality',
        metrics: '月询盘量 > 50, 有效询盘率 > 60%',
        metricsEn: 'Monthly inquiries > 50, valid inquiry rate > 60%',
        duration: '持续进行',
        durationEn: 'Ongoing'
      },
      {
        stage: '第5阶段：再营销',
        stageEn: 'Stage 5: Remarketing',
        action: '针对90天沉睡询盘再营销，测试邮件/电话跟进',
        actionEn: 'Remarket to 90-day dormant inquiries, test email/phone follow-up',
        metrics: '唤醒率 > 10%, 转化率提升',
        metricsEn: 'Reactivation rate > 10%, conversion rate improve',
        duration: '持续进行',
        durationEn: 'Ongoing'
      }
    ],
    local_service: [
      {
        stage: '第1阶段：本地定位',
        stageEn: 'Stage 1: Local Targeting',
        action: '投放半径10-30km Core Audience，测试Before/After素材',
        actionEn: 'Run radius 10-30km Core Audience, test Before/After creatives',
        metrics: 'CPL < $10, 到店率 > 20%',
        metricsEn: 'CPL < $10, store visit rate > 20%',
        duration: '5-10天',
        durationEn: '5-10 days'
      },
      {
        stage: '第2阶段：服务推广',
        stageEn: 'Stage 2: Service Promotion',
        action: '添加服务类型细分受众，测试优惠信息',
        actionEn: 'Add service type细分 audience, test promotional offers',
        metrics: '不同服务CPL稳定, 预约率提升',
        metricsEn: 'Different service CPL stable, booking rate improve',
        duration: '7-14天',
        durationEn: '7-14 days'
      },
      {
        stage: '第3阶段：受众扩展',
        stageEn: 'Stage 3: Audience Expansion',
        action: '扩展半径到50km，添加Interest叠加',
        actionEn: 'Expand radius to 50km, add Interest stacking',
        metrics: '覆盖人群增长, CPL稳定',
        metricsEn: 'Coverage increase, CPL stable',
        duration: '7-14天',
        durationEn: '7-14 days'
      },
      {
        stage: '第4阶段：规模化',
        stageEn: 'Stage 4: Scale Up',
        action: '切换CBO，预算增加20%/月，监控ROI',
        actionEn: 'Switch to CBO, increase budget 20%/month, monitor ROI',
        metrics: '月到店客户 > 20, ROI > 3',
        metricsEn: 'Monthly store visits > 20, ROI > 3',
        duration: '持续进行',
        durationEn: 'Ongoing'
      },
      {
        stage: '第5阶段：口碑营销',
        stageEn: 'Stage 5: Word of Mouth',
        action: '针对老客户投放评价激励，测试UGC素材',
        actionEn: 'Target existing customers for review incentives, test UGC creatives',
        metrics: '好评率 > 80%, 老客复购率提升',
        metricsEn: 'Review rate > 80%, repeat customer rate improve',
        duration: '持续进行',
        durationEn: 'Ongoing'
      }
    ],
    brand: [
      {
        stage: '第1阶段：品牌曝光',
        stageEn: 'Stage 1: Brand Exposure',
        action: '投放Broad + Interest，测试品牌视频素材',
        actionEn: 'Run Broad + Interest, test brand video creatives',
        metrics: 'ThruPlay > 3秒, CPM < $5',
        metricsEn: 'ThruPlay > 3s, CPM < $5',
        duration: '7-14天',
        durationEn: '7-14 days'
      },
      {
        stage: '第2阶段：互动优化',
        stageEn: 'Stage 2: Engagement Optimization',
        action: '基于第1阶段数据，优化视频时长和内容',
        actionEn: 'Based on Stage 1 data, optimize video duration and content',
        metrics: '完整观看率 > 20%, 分享率 > 2%',
        metricsEn: 'Complete view rate > 20%, share rate > 2%',
        duration: '5-10天',
        durationEn: '5-10 days'
      },
      {
        stage: '第3阶段：流量转化',
        stageEn: 'Stage 3: Traffic Conversion',
        action: '添加Traffic目标，引导到官网/落地页',
        actionEn: 'Add Traffic objective, guide to website/landing page',
        metrics: 'CTR > 1.5%, CPC < $0.8',
        metricsEn: 'CTR > 1.5%, CPC < $0.8',
        duration: '7-14天',
        durationEn: '7-14 days'
      },
      {
        stage: '第4阶段：销售转化',
        stageEn: 'Stage 4: Sales Conversion',
        action: '切换Sales目标，测试不同优惠力度',
        actionEn: 'Switch to Sales objective, test different promotional levels',
        metrics: 'ROAS > 1.5, 转化率 > 2%',
        metricsEn: 'ROAS > 1.5, conversion rate > 2%',
        duration: '持续进行',
        durationEn: 'Ongoing'
      },
      {
        stage: '第5阶段：品牌忠诚',
        stageEn: 'Stage 5: Brand Loyalty',
        action: '针对购买用户投放会员激励，测试UGC',
        actionEn: 'Target purchase users with membership incentives, test UGC',
        metrics: '复购率 > 15%, 品牌搜索增长',
        metricsEn: 'Repeat purchase rate > 15%, brand search growth',
        duration: '持续进行',
        durationEn: 'Ongoing'
      }
    ]
  };

  return guides[route] || guides.retailer;
};

export function StageGuide({ route, isPremium }: StageGuideProps) {
  const { t, locale } = useI18n();
  const stages = getStageGuide(route, locale);

  return (
    <Card className="bg-white/5 border-white/20 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          {t('stageGuide.title')}
          {!isPremium && (
            <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-400/30">
              {t('stageGuide.locked')}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {stages.map((stage, index) => (
            <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10">
              {/* 阶段标题 */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-lg flex items-center justify-center text-cyan-300 font-bold">
                  {index + 1}
                </div>
                <h4 className="text-lg font-medium text-white">
                  {locale === 'zh' ? stage.stage : stage.stageEn}
                </h4>
              </div>

              {/* 操作内容 */}
              <div className="mb-3">
                <p className="text-sm text-blue-200 mb-1">{t('stageGuide.action')}</p>
                <p className="text-blue-100">
                  {isPremium 
                    ? (locale === 'zh' ? stage.action : stage.actionEn)
                    : (locale === 'zh' ? stage.action.split('，')[0] + '...' : stage.actionEn.split(',')[0] + '...')
                  }
                </p>
              </div>

              {/* 指标阈值 */}
              {isPremium && (
                <div className="mb-3">
                  <p className="text-sm text-blue-200 mb-1">{t('stageGuide.metrics')}</p>
                  <p className="text-cyan-300 font-medium">
                    {locale === 'zh' ? stage.metrics : stage.metricsEn}
                  </p>
                </div>
              )}

              {/* 持续时间 */}
              <div>
                <p className="text-sm text-blue-200 mb-1">{t('stageGuide.duration')}</p>
                <p className="text-blue-100">
                  {locale === 'zh' ? stage.duration : stage.durationEn}
                </p>
              </div>

              {/* 未付费时的锁定提示 */}
              {!isPremium && index === 0 && (
                <div className="mt-4 p-3 bg-cyan-500/10 rounded-lg border border-cyan-400/20">
                  <p className="text-cyan-300 text-sm">
                    {t('stageGuide.unlockHint')}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
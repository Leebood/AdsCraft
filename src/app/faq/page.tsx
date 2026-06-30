'use client';

import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n-context';

export default function FAQPage() {
  const { locale } = useI18n();

  // FAQ 数据
  const faqs = [
    {
      qEn: 'Which platforms does AdsCraft support?',
      qZh: 'AdsCraft 支持哪些平台？',
      aEn: 'AdsCraft supports Facebook Ads, TikTok Ads, and Google Ads. Upload a screenshot from any of these platforms to get instant diagnosis.',
      aZh: 'AdsCraft 支持 Facebook 广告、TikTok 广告和 Google 广告。上传任意平台的截图即可获取即时诊断。',
    },
    {
      qEn: 'How does it work?',
      qZh: '它是如何工作的？',
      aEn: 'Upload → Extract → Analyze → Report. Simply upload your ad screenshot, and we\'ll extract the data, analyze it against platform benchmarks, and generate a comprehensive report.',
      aZh: '上传 → 提取 → 分析 → 报告。只需上传您的广告截图，我们将提取数据、对照平台基准进行分析，并生成全面的报告。',
    },
    {
      qEn: 'Do I need API access?',
      qZh: '需要 API 访问吗？',
      aEn: 'No, just upload a screenshot. No API keys or account connections required. This makes it perfect for reviewing any ad, including competitors\' or examples you find.',
      aZh: '不需要，只需上传截图。无需 API 密钥或账户连接。这使其非常适合审查任何广告，包括竞争对手的广告或您找到的示例。',
    },
    {
      qEn: 'What metrics are analyzed?',
      qZh: '分析哪些指标？',
      aEn: 'We analyze key metrics including CTR, CPC, CPA, ROAS, conversion rate, and more. Each platform has its own benchmark standards for comparison.',
      aZh: '我们分析关键指标，包括 CTR、CPC、CPA、ROAS、转化率等。每个平台都有自己的基准标准用于比较。',
    },
    {
      qEn: 'Is my data secure?',
      qZh: '我的数据安全吗？',
      aEn: 'Yes, your screenshots are processed securely and deleted after analysis. We never store your ad data or share it with third parties.',
      aZh: '是的，您的截图会安全处理，分析后会被删除。我们从不存储您的广告数据或与第三方共享。',
    },
    {
      qEn: 'Can I export the report?',
      qZh: '可以导出报告吗？',
      aEn: 'Yes, you can download your report as PDF or PPT. Professional format, ready for presentations or sharing with your team.',
      aZh: '是的，您可以将报告下载为 PDF 或 PPT。专业格式，可直接用于演示或与团队分享。',
    },
    {
      qEn: 'Is it free?',
      qZh: '免费吗？',
      aEn: 'Free plan includes limited analyses per month. Login required. For more analyses and advanced features like history tracking and team collaboration, you can upgrade to a paid plan.',
      aZh: '免费版每月有分析次数限制，需要登录注册。如需更多分析次数和高级功能（如历史追踪和团队协作），可升级到付费计划。',
    },
    {
      qEn: 'How accurate is the diagnosis?',
      qZh: '诊断有多准确？',
      aEn: 'Our diagnosis is based on actual data extracted from your screenshot. AI only explains the findings — it doesn\'t make up numbers. Every insight is backed by evidence.',
      aZh: '我们的诊断基于从您的截图中提取的实际数据。AI 只解释发现——它不会编造数字。每个洞察都有证据支持。',
    },
    {
      qEn: 'Can I use it for client work?',
      qZh: '可以用于客户工作吗？',
      aEn: 'Yes, AdsCraft is designed for agencies too. Review client ads, generate professional reports, and share with your team or clients.',
      aZh: '是的，AdsCraft 也专为代理商设计。审查客户广告，生成专业报告，并与您的团队或客户分享。',
    },
    {
      qEn: 'What if I have issues with my ads?',
      qZh: '如果我的广告有问题怎么办？',
      aEn: 'AdsCraft identifies issues and provides specific recommendations. You\'ll get a clear action plan with prioritized steps to improve your ad performance.',
      aZh: 'AdsCraft 会识别问题并提供具体建议。您将获得一个清晰的行动计划，包含优先步骤来改善您的广告效果。',
    },
  ];

  return (
    <div className="min-h-screen bg-[#08111F]">
      <div className="max-w-[1200px] mx-auto px-6 py-24">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold text-[#F8FAFC] text-center mb-16"
        >
          {locale === 'zh' ? '常见问题' : 'Frequently Asked Questions'}
        </motion.h1>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, i) => (
            <motion.details
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group rounded-xl bg-[#101827] border border-white/8 overflow-hidden"
            >
              <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                <span className="text-white font-medium">
                  {locale === 'zh' ? faq.qZh : faq.qEn}
                </span>
                <svg className="w-5 h-5 text-[#94A3B8] group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-5 pb-5 text-[#94A3B8] text-sm leading-relaxed">
                {locale === 'zh' ? faq.aZh : faq.aEn}
              </div>
            </motion.details>
          ))}
        </div>

        {/* 联系客服 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 max-w-3xl mx-auto"
        >
          <div className="rounded-xl bg-[#101827] border border-white/8 p-8 text-center">
            <h2 className="text-xl font-semibold text-white mb-3">
              {locale === 'zh' ? '还有其他问题？' : 'Still have questions?'}
            </h2>
            <p className="text-[#94A3B8] text-sm mb-6">
              {locale === 'zh' 
                ? '我们的技术支持团队随时为您服务。发送邮件后，我们会在 24 小时内尽快回复您。' 
                : 'Our technical support team is here to help. Send us an email and we\'ll get back to you within 24 hours.'}
            </p>
            <a
              href="mailto:support@adscraft.com"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium rounded-lg transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {locale === 'zh' ? '联系技术支持' : 'Contact Support'}
            </a>
            <p className="mt-4 text-[#64748B] text-xs">
              support@adscraft.com
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

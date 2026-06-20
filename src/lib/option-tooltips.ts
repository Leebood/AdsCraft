// 选项说明文案配置 - 支持中英文
// hover/focus显示tooltip，选中后2秒淡出

export interface OptionTooltip {
  textEn: string; // 英文选项文本
  textZh: string; // 中文选项文本
  descEn: string; // 英文说明文案
  descZh: string; // 中文说明文案
}

// FB专属 - What type of business do you run?
export const FB_BUSINESS_TYPE_TOOLTIPS: OptionTooltip[] = [
  {
    textEn: 'I sell products online',
    textZh: '在线卖货',
    descEn: 'E-commerce/Retailer, sell online, optimize ROAS and conversion',
    descZh: '电商/零售商，在线卖货，优化ROAS和转化',
  },
  {
    textEn: 'I\'m a manufacturer/supplier',
    textZh: '制造商/供应商',
    descEn: 'Manufacturer/Supplier, get B2B leads, optimize CPA',
    descZh: '制造商/供应商，获取B2B线索，优化CPA',
  },
  {
    textEn: 'I\'m building a brand',
    textZh: '品牌方',
    descEn: 'Brand owner, build awareness, optimize Reach and frequency',
    descZh: '品牌方，做曝光和认知，优化Reach和频次',
  },
  {
    textEn: 'I run a local business',
    textZh: '本地实体店',
    descEn: 'Local business (restaurant/salon/repair), drive foot traffic',
    descZh: '本地实体店（餐厅/美容院/维修等），引流到店',
  },
];

// TK专属 - How do you sell on TikTok?
export const TK_SELL_METHOD_TOOLTIPS: OptionTooltip[] = [
  {
    textEn: 'My own website / SaaS',
    textZh: '独立站/SaaS',
    descEn: 'Own website or SaaS product, drive users to website conversion',
    descZh: '有独立站或SaaS产品，引导用户到网站转化',
  },
  {
    textEn: 'Brand awareness only',
    textZh: '仅品牌曝光',
    descEn: 'Not selling products, just building brand awareness',
    descZh: '不卖货，只做品牌曝光和认知',
  },
  {
    textEn: 'I run a local business',
    textZh: '本地实体店',
    descEn: 'Local business (restaurant/salon/repair), drive foot traffic',
    descZh: '本地实体店（餐厅/美容院/维修等），引流到店',
  },
];

// TK专属 - Do you have video creatives ready?
export const TK_VIDEO_READY_TOOLTIPS: OptionTooltip[] = [
  {
    textEn: 'Yes, I create my own',
    textZh: '已有素材',
    descEn: 'Have video creatives ready, can start running ads directly',
    descZh: '已有视频素材，可以直接投放',
  },
  {
    textEn: 'No, I need guidance',
    textZh: '需要指导',
    descEn: 'No video yet, need guidance on how to create them',
    descZh: '还没做视频，需要指导如何制作',
  },
];

// TK专属 - What's your monthly ad budget?
export const TK_BUDGET_TOOLTIPS: OptionTooltip[] = [
  {
    textEn: 'Under $500',
    textZh: '低于$500',
    descEn: 'Small budget testing, suggest running 1-2 ad sets first',
    descZh: '小预算试水，建议先跑1-2个广告组',
  },
  {
    textEn: '$500 - $2,000',
    textZh: '$500 - $2,000',
    descEn: 'Medium budget, can test multiple creatives and audiences',
    descZh: '中等预算，可以测试多条素材和受众',
  },
  {
    textEn: 'Over $2,000',
    textZh: '超过$2,000',
    descEn: 'Sufficient budget, can run multiple campaigns in parallel',
    descZh: '充足预算，可以多线路并行测试',
  },
];

// 通用 - 广告目标
export const OBJECTIVE_TOOLTIPS: OptionTooltip[] = [
  {
    textEn: 'Purchases',
    textZh: '购买',
    descEn: 'Drive users to purchase on your website',
    descZh: '让用户在你的网站下单购买',
  },
  {
    textEn: 'Leads',
    textZh: '线索',
    descEn: 'Collect user contact info (form/inquiry)',
    descZh: '收集用户联系方式（表单/咨询）',
  },
  {
    textEn: 'App Installs',
    textZh: 'App安装',
    descEn: 'Drive users to download your App',
    descZh: '引导用户下载你的App',
  },
  {
    textEn: 'Traffic',
    textZh: '网站流量',
    descEn: 'Drive users to visit your website',
    descZh: '引导用户访问你的网站',
  },
  {
    textEn: 'Messages',
    textZh: '私信',
    descEn: 'Let users chat with you inside TikTok',
    descZh: '让用户在TikTok内和你聊天',
  },
  {
    textEn: 'Live Stream',
    textZh: '直播引流',
    descEn: 'Drive users to your TikTok live stream',
    descZh: '把用户拉进你的TikTok直播间',
  },
];

// 通用 - 产品行业（🔴=需资质审核 ⚠️=部分限制 无标记=无特殊限制）
export const INDUSTRY_TOOLTIPS: OptionTooltip[] = [
  {
    textEn: 'Beauty & Skincare',
    textZh: '美容护肤 🔴',
    descEn: '🔴 Requires verification: cosmetics/skincare need relevant licenses',
    descZh: '🔴 需资质审核：化妆品、护肤品需提供相关许可证',
  },
  {
    textEn: 'Health & Weight Loss',
    textZh: '健康减肥 🔴',
    descEn: '🔴 Requires verification: weight loss products need medical/health licenses',
    descZh: '🔴 需资质审核：减肥产品需提供医疗/保健相关资质',
  },
  {
    textEn: 'Financial Services',
    textZh: '金融服务 🔴',
    descEn: '🔴 Requires verification: financial products need financial licenses',
    descZh: '🔴 需资质审核：金融产品需提供金融牌照',
  },
  {
    textEn: 'Education',
    textZh: '教育培训 ⚠️',
    descEn: '⚠️ Partial restriction: vocational training needs permits, language training usually allowed',
    descZh: '⚠️ 部分限制：职业培训需提供办学资质，语言培训通常可投放',
  },
  {
    textEn: 'Gaming & Entertainment',
    textZh: '游戏娱乐 ⚠️',
    descEn: '⚠️ Partial restriction: games need registration number, entertainment content strictly reviewed',
    descZh: '⚠️ 部分限制：游戏需版号，娱乐类内容审核较严格',
  },
  {
    textEn: 'E-commerce & Retail',
    textZh: '电商零售',
    descEn: 'No special restriction: regular e-commerce products can run directly',
    descZh: '无特殊限制：常规电商产品可直接投放',
  },
  {
    textEn: 'Fashion & Accessories',
    textZh: '服装配饰',
    descEn: 'No special restriction: clothing/shoes/accessories can run directly',
    descZh: '无特殊限制：服装、鞋帽、饰品可直接投放',
  },
  {
    textEn: 'Home & Electronics',
    textZh: '家居数码',
    descEn: 'No special restriction: home goods/digital products can run directly',
    descZh: '无特殊限制：家居用品、数码产品可直接投放',
  },
];

// 通用 - 账户类型
export const ACCOUNT_TYPE_TOOLTIPS: OptionTooltip[] = [
  {
    textEn: 'New Account',
    textZh: '新账户',
    descEn: 'Never ran TikTok ads, or account less than 30 days',
    descZh: '从未投过TikTok广告，或账户不到30天',
  },
  {
    textEn: 'Established Account',
    textZh: '成熟账户',
    descEn: 'Has ad history, account over 30 days',
    descZh: '已有投放历史，账户超过30天',
  },
];

// 通用 - 效果承诺
export const PROMISE_TOOLTIPS: OptionTooltip[] = [
  {
    textEn: 'Yes',
    textZh: '是',
    descEn: 'Specific result promises like "lose 10 lbs in 7 days" or "earn $10k/month"',
    descZh: '如"7天瘦10斤""月入过万"等具体结果承诺',
  },
  {
    textEn: 'No',
    textZh: '否',
    descEn: 'No specific result promises',
    descZh: '没有具体的效果承诺',
  },
];

// 通用 - 前后对比
export const BEFORE_AFTER_TOOLTIPS: OptionTooltip[] = [
  {
    textEn: 'Before/After',
    textZh: '前后对比',
    descEn: 'Before and after comparison images or videos',
    descZh: '使用前后的对比图或视频',
  },
  {
    textEn: 'Body Part Close-up',
    textZh: '身体局部特写',
    descEn: 'Close-up showing changes in a specific body part',
    descZh: '近距离展示身体某部位的变化',
  },
  {
    textEn: 'Negative Shame',
    textZh: '负面羞辱',
    descEn: 'Using negative imagery to create anxiety',
    descZh: '用负面形象制造焦虑感',
  },
  {
    textEn: 'None',
    textZh: '无',
    descEn: 'No before/after comparison content',
    descZh: '没有前后对比内容',
  },
];

// 通用 - 紧迫性描述
export const URGENCY_TOOLTIPS: OptionTooltip[] = [
  {
    textEn: 'Limited Time',
    textZh: '限时',
    descEn: 'Like "only 24 hours left" or "last day today"',
    descZh: '如"仅剩24小时""今天最后一天"',
  },
  {
    textEn: 'Low Stock',
    textZh: '库存紧张',
    descEn: 'Like "only 3 left" or "selling out soon"',
    descZh: '如"只剩3件""即将售罄"',
  },
  {
    textEn: 'Price Countdown',
    textZh: '价格倒计时',
    descEn: 'Like "price returns to original after countdown"',
    descZh: '如"倒计时结束后恢复原价"',
  },
  {
    textEn: 'None',
    textZh: '无',
    descEn: 'No urgency descriptions',
    descZh: '没有紧迫性描述',
  },
];

// 通用 - CTA按钮
export const CTA_TOOLTIPS: OptionTooltip[] = [
  {
    textEn: 'Shop Now',
    textZh: 'Shop Now',
    descEn: 'Direct purchase, suitable for e-commerce',
    descZh: '直接引导购买，适合电商',
  },
  {
    textEn: 'Learn More',
    textZh: 'Learn More',
    descEn: 'Learn details, suitable for high-value/services',
    descZh: '引导了解详情，适合高客单价/服务',
  },
  {
    textEn: 'Install Now',
    textZh: 'Install Now',
    descEn: 'Download App',
    descZh: '引导下载App',
  },
  {
    textEn: 'Send Message',
    textZh: 'Send Message',
    descEn: 'Direct message consultation, suitable for local services',
    descZh: '引导私信咨询，适合本地服务',
  },
  {
    textEn: 'Watch Now',
    textZh: 'Watch Now',
    descEn: 'Watch live stream/video',
    descZh: '引导观看直播/视频',
  },
];

// 通用 - 点击后进入什么
export const LANDING_PAGE_TYPE_TOOLTIPS: OptionTooltip[] = [
  {
    textEn: 'Product Page',
    textZh: '商品页',
    descEn: 'Product detail/purchase page',
    descZh: '产品详情/购买页面',
  },
  {
    textEn: 'Form',
    textZh: '表单',
    descEn: 'Contact info/inquiry form page',
    descZh: '留联系方式/咨询的填写页面',
  },
  {
    textEn: 'Homepage',
    textZh: '主页',
    descEn: 'Website homepage or brand introduction page',
    descZh: '网站首页或品牌介绍页',
  },
  {
    textEn: 'App Download Page',
    textZh: 'App下载页',
    descEn: 'App store download page',
    descZh: '应用商店下载页',
  },
];

// 通用 - 首屏能否看到产品和优惠
export const FIRST_SCREEN_TOOLTIPS: OptionTooltip[] = [
  {
    textEn: 'Yes',
    textZh: '能',
    descEn: 'Users can see ad promised content without scrolling',
    descZh: '用户不用滑动就能看到广告承诺的内容',
  },
  {
    textEn: 'No',
    textZh: '不能',
    descEn: 'Users need to scroll or click to find content',
    descZh: '用户需要下滑或点击才能找到',
  },
  {
    textEn: 'Not sure',
    textZh: '不确定',
    descEn: 'Need system to help detect',
    descZh: '需要系统帮你检测',
  },
];

// 通用 - 出价策略
export const BID_STRATEGY_TOOLTIPS: OptionTooltip[] = [
  {
    textEn: 'Lowest Cost',
    textZh: '最低成本',
    descEn: 'Platform auto-bids, spend budget for maximum results',
    descZh: '平台自动出价，花完预算获得最多结果',
  },
  {
    textEn: 'Cost Cap',
    textZh: '成本上限',
    descEn: 'Set your acceptable maximum cost per conversion',
    descZh: '设置你能接受的最高单次转化成本',
  },
  {
    textEn: 'Bid Cap',
    textZh: '出价上限',
    descEn: 'Set your maximum bid for each auction',
    descZh: '设置每次竞价的最高出价',
  },
];

// 通用 - 受众规模
export const AUDIENCE_SIZE_TOOLTIPS: OptionTooltip[] = [
  {
    textEn: 'Broad',
    textZh: '宽泛',
    descEn: 'Platform finds audience automatically, suitable for cold start',
    descZh: '平台自动找人群，适合冷启动',
  },
  {
    textEn: 'Narrow',
    textZh: '精准',
    descEn: 'You specify age/interest/behavior conditions',
    descZh: '你指定年龄/兴趣/行为等条件',
  },
  {
    textEn: 'Lookalike',
    textZh: '类似受众',
    descEn: 'Find similar audience based on existing customers',
    descZh: '基于现有客户找相似人群',
  },
];

// 通用 - 表单类型（仅线索目标显示）
export const FORM_TYPE_TOOLTIPS: OptionTooltip[] = [
  {
    textEn: 'TikTok Native Form',
    textZh: 'TikTok原生表单',
    descEn: 'Users fill directly in TikTok, no redirect, high conversion rate',
    descZh: '用户在TikTok内直接填写，不用跳转，转化率高',
  },
  {
    textEn: 'External Form',
    textZh: '站外表单',
    descEn: 'Users jump to your website to fill, needs landing page and Pixel',
    descZh: '用户跳转到你的网站填写，需要落地页和Pixel',
  },
];

// 根据问题类型和选项文本获取说明
export function getOptionDescription(
  questionLabel: string,
  optionText: string,
  platform: 'facebook' | 'tiktok',
  language: 'en' | 'zh'
): string | null {
  const isEn = language === 'en';
  
  // 根据问题标签匹配对应的配置数组
  let tooltips: OptionTooltip[] = [];
  
  // FB专属问题
  if (questionLabel.includes('business') || questionLabel.includes('业务类型')) {
    tooltips = FB_BUSINESS_TYPE_TOOLTIPS;
  }
  // TK专属问题
  else if (questionLabel.includes('sell') || questionLabel.includes('销售方式')) {
    tooltips = TK_SELL_METHOD_TOOLTIPS;
  }
  else if (questionLabel.includes('video') || questionLabel.includes('视频素材')) {
    tooltips = TK_VIDEO_READY_TOOLTIPS;
  }
  else if (questionLabel.includes('budget') || questionLabel.includes('预算')) {
    tooltips = TK_BUDGET_TOOLTIPS;
  }
  // 通用问题
  else if (questionLabel.includes('objective') || questionLabel.includes('目标')) {
    tooltips = OBJECTIVE_TOOLTIPS;
  }
  else if (questionLabel.includes('industry') || questionLabel.includes('行业')) {
    tooltips = INDUSTRY_TOOLTIPS;
  }
  else if (questionLabel.includes('account') || questionLabel.includes('账户类型')) {
    tooltips = ACCOUNT_TYPE_TOOLTIPS;
  }
  else if (questionLabel.includes('promise') || questionLabel.includes('效果承诺')) {
    tooltips = PROMISE_TOOLTIPS;
  }
  else if (questionLabel.includes('before') || questionLabel.includes('前后对比')) {
    tooltips = BEFORE_AFTER_TOOLTIPS;
  }
  else if (questionLabel.includes('urgency') || questionLabel.includes('紧迫性')) {
    tooltips = URGENCY_TOOLTIPS;
  }
  else if (questionLabel.includes('cta') || questionLabel.includes('CTA')) {
    tooltips = CTA_TOOLTIPS;
  }
  else if (questionLabel.includes('landing') || questionLabel.includes('落地页') || questionLabel.includes('进入')) {
    tooltips = LANDING_PAGE_TYPE_TOOLTIPS;
  }
  else if (questionLabel.includes('first screen') || questionLabel.includes('首屏')) {
    tooltips = FIRST_SCREEN_TOOLTIPS;
  }
  else if (questionLabel.includes('bid') || questionLabel.includes('出价')) {
    tooltips = BID_STRATEGY_TOOLTIPS;
  }
  else if (questionLabel.includes('audience') || questionLabel.includes('受众')) {
    tooltips = AUDIENCE_SIZE_TOOLTIPS;
  }
  else if (questionLabel.includes('form') || questionLabel.includes('表单类型')) {
    tooltips = FORM_TYPE_TOOLTIPS;
  }
  
  // 匹配选项文本（同时匹配中英文）
  const tooltip = tooltips.find(t => 
    t.textEn === optionText || t.textZh === optionText || t.textZh.replace('🔴', '').replace('⚠️', '').trim() === optionText
  );
  
  if (!tooltip) return null;
  
  return isEn ? tooltip.descEn : tooltip.descZh;
}
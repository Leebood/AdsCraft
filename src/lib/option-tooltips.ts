// 选项说明文案配置
// hover/focus显示tooltip，选中后2秒淡出

export interface OptionTooltip {
  text: string; // 选项文本
  description: string; // 说明文案
}

// FB专属 - What type of business do you run?
export const FB_BUSINESS_TYPE_TOOLTIPS: OptionTooltip[] = [
  {
    text: 'I sell products online',
    description: '电商/零售商，在线卖货，优化ROAS和转化',
  },
  {
    text: 'I\'m a manufacturer/supplier',
    description: '制造商/供应商，获取B2B线索，优化CPA',
  },
  {
    text: 'I\'m building a brand',
    description: '品牌方，做曝光和认知，优化Reach和频次',
  },
  {
    text: 'I run a local business',
    description: '本地实体店（餐厅/美容院/维修等），引流到店',
  },
];

// TK专属 - How do you sell on TikTok?
export const TK_SELL_METHOD_TOOLTIPS: OptionTooltip[] = [
  {
    text: 'My own website / SaaS',
    description: '有独立站或SaaS产品，引导用户到网站转化',
  },
  {
    text: 'Brand awareness only',
    description: '不卖货，只做品牌曝光和认知',
  },
  {
    text: 'I run a local business',
    description: '本地实体店（餐厅/美容院/维修等），引流到店',
  },
];

// TK专属 - Do you have video creatives ready?
export const TK_VIDEO_READY_TOOLTIPS: OptionTooltip[] = [
  {
    text: 'Yes, I create my own',
    description: '已有视频素材，可以直接投放',
  },
  {
    text: 'No, I need guidance',
    description: '还没做视频，需要指导如何制作',
  },
];

// TK专属 - What's your monthly ad budget?
export const TK_BUDGET_TOOLTIPS: OptionTooltip[] = [
  {
    text: 'Under $500',
    description: '小预算试水，建议先跑1-2个广告组',
  },
  {
    text: '$500 - $2,000',
    description: '中等预算，可以测试多条素材和受众',
  },
  {
    text: 'Over $2,000',
    description: '充足预算，可以多线路并行测试',
  },
];

// 通用 - 广告目标
export const OBJECTIVE_TOOLTIPS: OptionTooltip[] = [
  {
    text: '购买',
    description: '让用户在你的网站下单购买',
  },
  {
    text: '线索',
    description: '收集用户联系方式（表单/咨询）',
  },
  {
    text: 'App安装',
    description: '引导用户下载你的App',
  },
  {
    text: '网站流量',
    description: '引导用户访问你的网站',
  },
  {
    text: '私信',
    description: '让用户在TikTok内和你聊天',
  },
  {
    text: '直播引流',
    description: '把用户拉进你的TikTok直播间',
  },
];

// 通用 - 产品行业（🔴=需资质审核 ⚠️=部分限制 无标记=无特殊限制）
export const INDUSTRY_TOOLTIPS: OptionTooltip[] = [
  {
    text: '美容护肤 🔴',
    description: '需资质审核：化妆品、护肤品需提供相关许可证',
  },
  {
    text: '健康减肥 🔴',
    description: '需资质审核：减肥产品需提供医疗/保健相关资质',
  },
  {
    text: '金融服务 🔴',
    description: '需资质审核：金融产品需提供金融牌照',
  },
  {
    text: '教育培训 ⚠️',
    description: '部分限制：职业培训需提供办学资质，语言培训通常可投放',
  },
  {
    text: '游戏娱乐 ⚠️',
    description: '部分限制：游戏需版号，娱乐类内容审核较严格',
  },
  {
    text: '电商零售',
    description: '无特殊限制：常规电商产品可直接投放',
  },
  {
    text: '服装配饰',
    description: '无特殊限制：服装、鞋帽、饰品可直接投放',
  },
  {
    text: '家居数码',
    description: '无特殊限制：家居用品、数码产品可直接投放',
  },
];

// 通用 - 账户类型
export const ACCOUNT_TYPE_TOOLTIPS: OptionTooltip[] = [
  {
    text: '新账户',
    description: '从未投过TikTok广告，或账户不到30天',
  },
  {
    text: '成熟账户',
    description: '已有投放历史，账户超过30天',
  },
];

// 通用 - 效果承诺
export const PROMISE_TOOLTIPS: OptionTooltip[] = [
  {
    text: '是',
    description: '如"7天瘦10斤""月入过万"等具体结果承诺',
  },
  {
    text: '否',
    description: '没有具体的效果承诺',
  },
];

// 通用 - 前后对比
export const BEFORE_AFTER_TOOLTIPS: OptionTooltip[] = [
  {
    text: 'Before/After',
    description: '使用前后的对比图或视频',
  },
  {
    text: '身体局部特写',
    description: '近距离展示身体某部位的变化',
  },
  {
    text: '负面羞辱',
    description: '用负面形象制造焦虑感',
  },
  {
    text: '无',
    description: '没有前后对比内容',
  },
];

// 通用 - 紧迫性描述
export const URGENCY_TOOLTIPS: OptionTooltip[] = [
  {
    text: '限时',
    description: '如"仅剩24小时""今天最后一天"',
  },
  {
    text: '库存紧张',
    description: '如"只剩3件""即将售罄"',
  },
  {
    text: '价格倒计时',
    description: '如"倒计时结束后恢复原价"',
  },
  {
    text: '无',
    description: '没有紧迫性描述',
  },
];

// 通用 - CTA按钮
export const CTA_TOOLTIPS: OptionTooltip[] = [
  {
    text: 'Shop Now',
    description: '直接引导购买，适合电商',
  },
  {
    text: 'Learn More',
    description: '引导了解详情，适合高客单价/服务',
  },
  {
    text: 'Install Now',
    description: '引导下载App',
  },
  {
    text: 'Send Message',
    description: '引导私信咨询，适合本地服务',
  },
  {
    text: 'Watch Now',
    description: '引导观看直播/视频',
  },
];

// 通用 - 点击后进入什么
export const LANDING_PAGE_TYPE_TOOLTIPS: OptionTooltip[] = [
  {
    text: '商品页',
    description: '产品详情/购买页面',
  },
  {
    text: '表单',
    description: '留联系方式/咨询的填写页面',
  },
  {
    text: '主页',
    description: '网站首页或品牌介绍页',
  },
  {
    text: 'App下载页',
    description: '应用商店下载页',
  },
];

// 通用 - 首屏能否看到产品和优惠
export const FIRST_SCREEN_TOOLTIPS: OptionTooltip[] = [
  {
    text: '能',
    description: '用户不用滑动就能看到广告承诺的内容',
  },
  {
    text: '不能',
    description: '用户需要下滑或点击才能找到',
  },
  {
    text: '不确定',
    description: '需要系统帮你检测',
  },
];

// 通用 - 出价策略
export const BID_STRATEGY_TOOLTIPS: OptionTooltip[] = [
  {
    text: '最低成本',
    description: '平台自动出价，花完预算获得最多结果',
  },
  {
    text: '成本上限',
    description: '设置你能接受的最高单次转化成本',
  },
  {
    text: '出价上限',
    description: '设置每次竞价的最高出价',
  },
];

// 通用 - 受众规模
export const AUDIENCE_SIZE_TOOLTIPS: OptionTooltip[] = [
  {
    text: '宽泛',
    description: '平台自动找人群，适合冷启动',
  },
  {
    text: '精准',
    description: '你指定年龄/兴趣/行为等条件',
  },
  {
    text: '类似受众',
    description: '基于现有客户找相似人群',
  },
];

// 通用 - 表单类型（仅线索目标显示）
export const FORM_TYPE_TOOLTIPS: OptionTooltip[] = [
  {
    text: 'TikTok原生表单',
    description: '用户在TikTok内直接填写，不用跳转，转化率高',
  },
  {
    text: '站外表单',
    description: '用户跳转到你的网站填写，需要落地页和Pixel',
  },
];

// 获取选项说明的辅助函数（支持platform参数）
export function getOptionDescription(
  questionId: string,
  platform: 'facebook' | 'tiktok',
  optionText?: string
): string | undefined {
  // 获取该问题的tooltip配置
  const tooltips = getTooltipConfigByQuestion(questionId, platform);
  
  // 如果有optionText，查找匹配的说明
  if (optionText && tooltips.length > 0) {
    const found = tooltips.find((t) => 
      t.text === optionText || 
      t.text.includes(optionText) || 
      optionText.includes(t.text.split(' ')[0]) // 匹配首词（如"I sell"匹配"I sell products online")
    );
    return found?.description;
  }
  
  return undefined;
}

// 根据问题ID获取对应的tooltip配置
export function getTooltipConfigByQuestion(questionId: string, platform: 'facebook' | 'tiktok'): OptionTooltip[] {
  // FB专属
  if (platform === 'facebook') {
    if (questionId === 'businessType' || questionId.includes('business')) {
      return FB_BUSINESS_TYPE_TOOLTIPS;
    }
  }

  // TK专属
  if (platform === 'tiktok') {
    if (questionId === 'sellMethod' || questionId.includes('sell')) {
      return TK_SELL_METHOD_TOOLTIPS;
    }
    if (questionId === 'videoReady' || questionId.includes('video')) {
      return TK_VIDEO_READY_TOOLTIPS;
    }
    if (questionId === 'budget' || questionId.includes('budget')) {
      return TK_BUDGET_TOOLTIPS;
    }
  }

  // 通用
  if (questionId === 'objective' || questionId.includes('目标')) {
    return OBJECTIVE_TOOLTIPS;
  }
  if (questionId === 'industry' || questionId.includes('行业')) {
    return INDUSTRY_TOOLTIPS;
  }
  if (questionId === 'accountType' || questionId.includes('账户')) {
    return ACCOUNT_TYPE_TOOLTIPS;
  }
  if (questionId === 'promise' || questionId.includes('承诺')) {
    return PROMISE_TOOLTIPS;
  }
  if (questionId === 'beforeAfter' || questionId.includes('对比')) {
    return BEFORE_AFTER_TOOLTIPS;
  }
  if (questionId === 'urgency' || questionId.includes('紧迫')) {
    return URGENCY_TOOLTIPS;
  }
  if (questionId === 'cta' || questionId.includes('CTA') || questionId.includes('按钮')) {
    return CTA_TOOLTIPS;
  }
  if (questionId === 'landingPage' || questionId.includes('落地') || questionId.includes('进入')) {
    return LANDING_PAGE_TYPE_TOOLTIPS;
  }
  if (questionId === 'firstScreen' || questionId.includes('首屏')) {
    return FIRST_SCREEN_TOOLTIPS;
  }
  if (questionId === 'bidStrategy' || questionId.includes('出价')) {
    return BID_STRATEGY_TOOLTIPS;
  }
  if (questionId === 'audience' || questionId.includes('受众')) {
    return AUDIENCE_SIZE_TOOLTIPS;
  }
  if (questionId === 'formType' || questionId.includes('表单')) {
    return FORM_TYPE_TOOLTIPS;
  }

  return [];
}
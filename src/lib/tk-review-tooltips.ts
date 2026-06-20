// TikTok 投放前审查页面选项说明配置

interface TooltipOption {
  id: string;
  zh: string;
  en: string;
  descZh: string;
  descEn: string;
}

interface TooltipConfig {
  questionId: string;
  questionZh: string;
  questionEn: string;
  options: TooltipOption[];
}

export const TK_REVIEW_TOOLTIPS: TooltipConfig[] = [
  // Section 1: 基础信息
  {
    questionId: 'objective',
    questionZh: '广告目标',
    questionEn: 'Campaign Objective',
    options: [
      { id: 'purchase', zh: '转化/销售', en: 'Conversions', descZh: '让用户在你的网站下单购买', descEn: 'Drive purchases on your website' },
      { id: 'leads', zh: '线索/留资', en: 'Leads', descZh: '收集用户联系方式（表单/咨询）', descEn: 'Collect user contact info (form/inquiry)' },
      { id: 'app_install', zh: 'App安装', en: 'App Install', descZh: '引导用户下载你的App', descEn: 'Drive app downloads' },
      { id: 'website_traffic', zh: '网站流量', en: 'Website Traffic', descZh: '引导用户访问你的网站', descEn: 'Drive traffic to your website' },
      { id: 'dm', zh: '私信', en: 'Direct Message', descZh: '让用户在TikTok内和你聊天', descEn: 'Start conversations in TikTok' },
      { id: 'live', zh: '直播引流', en: 'Live Stream', descZh: '把用户拉进你的TikTok直播间', descEn: 'Drive viewers to your live stream' }
    ]
  },
  {
    questionId: 'industry',
    questionZh: '产品行业',
    questionEn: 'Product Category',
    options: [
      { id: 'beauty_skincare', zh: '美容护肤', en: 'Beauty & Skincare', descZh: '🔴需资质审核：化妆品/护肤品需提供备案证明', descEn: '🔴Requires license: Cosmetics need registration certificate' },
      { id: 'health_fitness', zh: '健康减肥', en: 'Health & Fitness', descZh: '🔴需资质审核：减肥产品需提供食品安全证明', descEn: '🔴Requires license: Weight loss products need food safety certificate' },
      { id: 'finance_investment', zh: '金融理财', en: 'Finance', descZh: '🔴需资质审核：金融广告需提供牌照证明', descEn: '🔴Requires license: Financial ads need license certificate' },
      { id: 'education_training', zh: '教育培训', en: 'Education', descZh: '⚠️部分限制：学历/职业培训需资质审核', descEn: '⚠️Partial restriction: Education/training needs review' },
      { id: 'gaming_apps', zh: '游戏应用', en: 'Gaming & Apps', descZh: '⚠️部分限制：部分游戏类型需审核', descEn: '⚠️Partial restriction: Some game types need review' },
      { id: 'ecommerce_shopping', zh: '电商购物', en: 'E-commerce', descZh: '无特殊限制，正常投放', descEn: 'No special restrictions' },
      { id: 'fashion_clothing', zh: '服装时尚', en: 'Fashion', descZh: '无特殊限制，正常投放', descEn: 'No special restrictions' },
      { id: 'home_goods', zh: '家居生活', en: 'Home & Living', descZh: '无特殊限制，正常投放', descEn: 'No special restrictions' },
      { id: 'food_drinks', zh: '食品饮料', en: 'Food & Drinks', descZh: '无特殊限制，正常投放', descEn: 'No special restrictions' },
      { id: 'tech_electronics', zh: '科技数码', en: 'Tech & Electronics', descZh: '无特殊限制，正常投放', descEn: 'No special restrictions' }
    ]
  },
  {
    questionId: 'accountType',
    questionZh: '账户类型',
    questionEn: 'Account Type',
    options: [
      { id: 'new', zh: '新账户', en: 'New Account', descZh: '从未投过TikTok广告，或账户不到30天', descEn: 'Never run TikTok ads, or account under 30 days' },
      { id: 'mature', zh: '成熟账户', en: 'Mature Account', descZh: '已有投放历史，账户超过30天', descEn: 'Has ad history, account over 30 days' }
    ]
  },

  // Section 2: 合规风险
  {
    questionId: 'effect_claims',
    questionZh: '效果承诺',
    questionEn: 'Effect Promise',
    options: [
      { id: 'label', zh: '是否有效果承诺', en: 'Contains effect promise', descZh: '如"7天瘦10斤"、"月入过万"等具体结果承诺', descEn: 'Specific promises like "lose 10 lbs in 7 days"' },
      { id: 'yes', zh: '是', en: 'Yes', descZh: '如"7天瘦10斤"、"月入过万"等具体结果承诺，可能被拒审', descEn: 'Specific promises like "lose 10 lbs in 7 days", may be rejected' },
      { id: 'no', zh: '否', en: 'No', descZh: '无效果承诺内容，符合审核要求', descEn: 'No effect promise content, compliant with review' }
    ]
  },
  {
    questionId: 'before_after',
    questionZh: '前后对比',
    questionEn: 'Before/After',
    options: [
      { id: 'label', zh: '是否使用前后对比', en: 'Uses before/after comparison', descZh: '前后对比类型，部分类型可能违规', descEn: 'Before/after types, some may violate policy' },
      { id: 'before_after', zh: '前后对比图', en: 'Before/After', descZh: '使用前后的对比图或视频，需注意真实性', descEn: 'Comparison images or videos before/after, must be authentic' },
      { id: 'body_part', zh: '身体局部特写', en: 'Body Part Focus', descZh: '近距离展示身体某部位的变化，可能被判定违规', descEn: 'Close-up showing body part changes, may violate policy' },
      { id: 'none', zh: '都没有', en: 'None', descZh: '不使用前后对比内容，符合审核要求', descEn: 'No before/after content, compliant with review' }
    ]
  },

  // Section 5: 落地页
  {
    questionId: 'click_destination',
    questionZh: '点击后进入什么',
    questionEn: 'Click Destination',
    options: [
      { id: 'label', zh: '广告点击后的落地页类型', en: 'Landing page type after ad click', descZh: '选择用户点击广告后进入的页面类型', descEn: 'Select the page type users go to after clicking' },
      { id: 'product', zh: '商品页', en: 'Product Page', descZh: '产品详情/购买页面', descEn: 'Product detail/purchase page' },
      { id: 'form', zh: '表单', en: 'Form', descZh: '留联系方式/咨询的填写页面', descEn: 'Contact info/inquiry form page' },
      { id: 'profile', zh: '主页', en: 'Profile', descZh: '网站首页或品牌介绍页', descEn: 'Website homepage or brand intro' },
      { id: 'app', zh: 'App下载页', en: 'App Download', descZh: '应用商店下载页', descEn: 'App store download page' }
    ]
  },
  {
    questionId: 'first_screen',
    questionZh: '首屏能否看到产品和优惠',
    questionEn: 'First Screen Visibility',
    options: [
      { id: 'label', zh: '用户首屏能否看到广告承诺的内容', en: 'Can users see promised content on first screen', descZh: '首屏可见性直接影响转化率和审核通过率', descEn: 'First screen visibility affects conversion and approval rate' },
      { id: 'yes', zh: '能', en: 'Yes', descZh: '用户不用滑动就能看到广告承诺的内容', descEn: 'Users can see promised content without scrolling' },
      { id: 'no', zh: '不能', en: 'No', descZh: '用户需要下滑或点击才能找到，可能影响转化', descEn: 'Users need to scroll or click to find, may affect conversion' },
      { id: 'unknown', zh: '不确定', en: 'Unknown', descZh: '需要系统帮你检测', descEn: 'Need system to check' }
    ]
  },

  // Section 6: 数据设置
  {
    questionId: 'bid_strategy',
    questionZh: '出价策略',
    questionEn: 'Bid Strategy',
    options: [
      { id: 'label', zh: '选择适合你的出价策略', en: 'Choose your bid strategy', descZh: '出价策略影响成本控制和投放效果', descEn: 'Bid strategy affects cost control and delivery results' },
      { id: 'lowest_cost', zh: '最低成本', en: 'Lowest Cost', descZh: '平台自动出价，花完预算获得最多结果', descEn: 'Auto bid, maximize results within budget' },
      { id: 'cost_cap', zh: '成本上限', en: 'Cost Cap', descZh: '设置你能接受的最高单次转化成本', descEn: 'Set max acceptable cost per conversion' },
      { id: 'roas_target', zh: 'ROAS控制', en: 'ROAS Target', descZh: '设置目标ROAS，平台优化达成目标', descEn: 'Set target ROAS, platform optimizes to achieve' }
    ]
  },
  {
    questionId: 'audience_size',
    questionZh: '受众规模',
    questionEn: 'Audience Size',
    options: [
      { id: 'label', zh: '选择受众规模', en: 'Choose audience size', descZh: '受众规模影响投放覆盖和精准度', descEn: 'Audience size affects reach and precision' },
      { id: 'broad', zh: '宽泛', en: 'Broad', descZh: '平台自动找人群，适合冷启动', descEn: 'Platform finds audience, good for cold start' },
      { id: 'medium', zh: '适中', en: 'Medium', descZh: '适度精准，平衡覆盖和转化', descEn: 'Moderate precision, balance reach and conversion' },
      { id: 'narrow', zh: '窄', en: 'Narrow', descZh: '高度精准，指定年龄/兴趣/行为等条件', descEn: 'Highly precise, specify age/interest/behavior' }
    ]
  },
  {
    questionId: 'form_type',
    questionZh: '表单类型',
    questionEn: 'Form Type',
    options: [
      { id: 'label', zh: '选择表单类型', en: 'Choose form type', descZh: '表单类型影响转化率和数据追踪能力', descEn: 'Form type affects conversion rate and data tracking' },
      { id: 'native', zh: '原生表单（TikTok内）', en: 'Native Form (In-App)', descZh: '用户在TikTok内直接填写，不用跳转，转化率高', descEn: 'Fill within TikTok, no redirect, high conversion' },
      { id: 'external', zh: '站外表单（独立页）', en: 'External Form (Web)', descZh: '用户跳转到你的网站填写，需要落地页和Pixel', descEn: 'Redirect to your site, needs landing page & Pixel' }
    ]
  }
];

// 获取选项说明
export function getTKReviewTooltip(
  questionId: string,
  optionId: string,
  language: 'zh' | 'en'
): string | null {
  const config = TK_REVIEW_TOOLTIPS.find(c => c.questionId === questionId);
  if (!config) return null;
  
  const option = config.options.find(o => o.id === optionId);
  if (!option) return null;
  
  return language === 'zh' ? option.descZh : option.descEn;
}
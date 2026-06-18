---
AIGC:
    Label: "1"
    ContentProducer: 001191110102MACQD9K64018705
    ProduceID: 7634029171441664308-data_volume/files/所有对话/主对话/recent_memory/project/AdsCraft_架构文档_v2.md
    ReservedCode1: ""
    ContentPropagator: 001191110102MACQD9K64028705
    PropagateID: 3476033405197864#1781777934213
    ReservedCode2: ""
---
# AdsCraft 架构文档（v2 — 多平台扩展）

> 本文档替代原"截图识别架构"，是扣子编程执行的唯一架构源。
> 原文档保留备查但不再作为开发依据。

---

## 一、产品目标

AdsCraft是AI广告优化引擎。用户输入约束条件（产品+预算+目标+账户状态）→ AI诊断当前问题 → 计算最优投放配置 → 输出动态优化路径。

核心定位升级：从"诊断报告"升级为"优化引擎"——不只是帮你找问题，而是直接算出最优解。

**产品逻辑**：先诊断（你为什么不行），再优化（最优配置是什么），再进化（持续算最优解）。

```
输入约束条件
    ↓
① 诊断分析：当前配置的问题 + 原因（免费完整可见）
    ↓
② 最优配置：最优投放参数 + 预期效果区间（付费完整版，免费预览）
    ↓
③ 优化路径：7-14天动态调整节奏 + 关键节点决策规则（付费）
    ↓
④ 持续进化：新数据反馈 → 重新计算最优解（付费）
```

**诊断是最优解的论据**：如果只给最优解，用户会困惑"凭啥你说的对"。诊断分析让用户先理解问题，再接受方案。

**双平台统一框架**：FB和TK推流机制不同（FB竞价拍卖+互动深度权重，TK完播率驱动+内容权重），但"给定条件算最优解"的范式一致。同一套优化框架，不同平台用不同的机制模型和参数。

核心扩展：从"Facebook截图识别"升级为"多平台广告优化引擎"，首期支持Facebook+TikTok，预留Google Ads。

## 二、设计原则：最小改动 + 平台可插拔

1. **平台是可插拔模块** — 加新平台 = 加1个配置 + 1个数据适配器，不碰已有代码
2. **现有FB流程零改动** — 截图上传、4条线路答题、诊断逻辑全部保持
3. **答题分流由平台配置驱动** — 前端通用Quiz组件，读配置渲染，不同平台不同题
4. **数据层统一** — 同一张ad_snapshots表，platform字段区分，JSONB存平台独有指标

## 三、平台注册表

每个平台一个配置对象，前后端统一读取：

```typescript
// lib/platforms/registry.ts

export interface PlatformConfig {
  id: string;                    // 'facebook' | 'tiktok' | 'google_ads'
  name: string;                  // 'Facebook' | 'TikTok' | 'Google Ads'
  icon: string;                  // 品牌图标
  color: string;                 // 品牌色

  // 数据接入方式
  dataSource: 'screenshot' | 'api';

  // OAuth配置（API类平台需要）
  oauth?: {
    authorizeUrl: string;
    tokenUrl: string;
    refreshUrl?: string;
    scopes: string[];
    callbackPath: string;        // /api/auth/{platform}/callback
  };

  // 答题分流（平台专属题目）
  quizFlow: QuizStep[];

  // 指标映射：平台原始字段 → 通用字段
  metricsMap: Record<string, string>;

  // 平台独有指标（通用字段没有的，存platform_metrics JSONB）
  extraMetrics: string[];

  // AI诊断prompt模板
  diagnosisPrompt: string;

  // 行业基准值
  benchmarks: Record<string, { good: number; avg: number; poor: number }>;
}
```

### 当前各平台配置

| | Facebook | TikTok | Google Ads（预留） |
|---|---|---|---|
| 状态 | ✅ 已上线 | 🔜 开发中 | 📋 预留 |
| dataSource | screenshot | api | api |
| OAuth | 不需要 | TikTok Marketing API | Google Ads API |
| 独有指标 | reach, frequency | video_views, video_view_rate, profile_visit, follower_count | search_impression_share, quality_score |
| 答题线路数 | 4 | 4 | 待定 |

---

## 四、数据流

### Facebook（现有，不改）

```
上传截图 → Vercel调GPT-4o-mini提取指标 → 用户确认 → 写入Supabase(platform=facebook)
→ 拉历史数据调GPT-4o-mini出分析 → 页面展示数据+结论
```

### TikTok（新增）

```
OAuth授权 → 获取access_token → 调TikTok Marketing API拉数据
→ 写入Supabase(platform=tiktok, source=api) → 调GPT-4o-mini出分析 → 页面展示
```

### 通用数据流

```
答题选平台 → 平台专属quiz → 确定线路 → 数据接入(截图/API) → 入库 → AI诊断 → 展示
```

---

## 五、技术栈

| 组件 | 选型 | 说明 |
|---|---|---|
| 前端 | Bolt.new | 现有基础上扩展 |
| 后端 | Vercel API Route (App Router) | 现有基础上扩展 |
| 视觉/分析模型 | GPT-4o-mini | 不变 |
| 数据库 | Supabase（已有） | 改造ad_snapshots + 新增2表 |
| 用户系统 | Supabase Auth（已有） | 不变 |
| 图片存储 | Cloudflare R2 或 Vercel Blob | 仅FB截图用，不变 |

---

## 六、数据库

### 6.1 ad_snapshots 表（改造现有表）

**改动最小化**：只加3列，不加CHECK约束，不用改现有数据。

```sql
-- 仅新增3列
ALTER TABLE ad_snapshots ADD COLUMN platform TEXT NOT NULL DEFAULT 'facebook';
ALTER TABLE ad_snapshots ADD COLUMN source TEXT NOT NULL DEFAULT 'screenshot' 
  CHECK (source IN ('screenshot', 'api'));
ALTER TABLE ad_snapshots ADD COLUMN platform_metrics JSONB DEFAULT '{}';

-- platform: 不设CHECK，新平台直接写入，不用改表
-- platform_metrics: 平台独有指标统一存JSONB
--   TikTok: {"video_views": 1200, "video_view_rate": 15.3}
--   Google Ads: {"search_impression_share": 0.35, "quality_score": 7}
--   Facebook: {"reach": 50000, "frequency": 2.3}
-- 通用指标（spend/impressions/clicks/ctr/cpc/conversions/cpa/roas）仍用独立列，不改

-- RLS策略不变，仍按user_id隔离
```

### 6.2 新增表：platform_connections（平台OAuth授权）

```sql
CREATE TABLE platform_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,               -- 'tiktok' | 'google_ads' | ...
  access_token TEXT NOT NULL,           -- 加密存储
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  platform_user_id TEXT,               -- 对方平台广告账号ID
  platform_user_name TEXT,             -- 对方平台广告账号名
  scopes TEXT[],
  extra_config JSONB DEFAULT '{}',     -- 平台特有配置
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE platform_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "用户只能访问自己的平台连接"
ON platform_connections FOR ALL USING (auth.uid() = user_id);
```

### 6.3 新增表：api_sync_log（API数据同步日志）

```sql
CREATE TABLE api_sync_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  sync_type TEXT NOT NULL CHECK (sync_type IN ('manual', 'scheduled')),
  date_range_start DATE,
  date_range_end DATE,
  records_fetched INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'success', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE api_sync_log ENABLE ROW LEVEL SECURITY;
```

---

## 七、答题分流设计

### 7.1 入口：先选平台

用户进入AdsCraft后第一步选平台，选完走对应quiz分支：

```
首页 → "你在哪个平台投广告？"
  [ Facebook ]  [ TikTok ]  [ Google Ads（敬请期待）]
```

### 7.2 Facebook答题（现有，提取为配置，行为零改动）

4条线路，1题分流：

```typescript
export const facebookQuiz: QuizStep[] = [
  {
    id: 'fb_q1',
    question: 'What type of business do you run?',
    type: 'single',
    options: [
      { id: 'retailer', label: 'I sell products online', route: 'retailer' },
      { id: 'manufacturer', label: "I'm a manufacturer/supplier", route: 'manufacturer' },
      { id: 'brand', label: "I'm building a brand", route: 'brand' },
      { id: 'local', label: 'I run a local business', route: 'local_service' },
    ]
  }
];
```

| 线路 | 定价 | 诊断重点 | FB | TK | 说明 |
|---|---|---|---|---|---|
| 本地服务 / Local Service | $9.9/月 | 到店成本/半径覆盖 | ✅ | ✅ | 两边独立线路 |
| 零售商 | $19.9/月 | CTR/CPC/ROAS优化 | ✅ | ❌ | 仅FB |
| Website Conversion | $19.9/月 | 点击→转化全链路 | ❌ | ✅ | 仅TK |
| 制造商 | $29.9/月 | CPA/Lead质量 | ✅ | ❌ | 仅FB |
| 品牌方 / Brand Awareness | $29.9/月 | Reach/频次/品牌lift | ✅ | ✅ | 两边独立线路 |

**双平台线路独立**：FB和TK各自一套线路，不交叉映射，点卡片直接跳对应Creem支付链接。
**一次订阅=一个平台一条线路**：想用两个平台需分别订阅。

### 7.3 TikTok答题（新增）

4条线路，3题分流：

```typescript
export const tiktokQuiz: QuizStep[] = [
  {
    id: 'tk_q1',
    question: 'How do you sell on TikTok?',
    type: 'single',
    options: [
      { id: 'website', label: 'My own website / SaaS', route: 'website_conversion', nextStep: 'tk_q2' },
      { id: 'tk_shop', label: 'TikTok Shop', route: 'tiktok_shop', nextStep: 'tk_q2' },
      { id: 'brand', label: 'Brand awareness only', route: 'brand_awareness', nextStep: 'tk_q2' },
      { id: 'local', label: 'I run a local business (store/restaurant/service)', route: 'local_service', nextStep: 'tk_q2' },
    ]
  },
  {
    id: 'tk_q2',
    question: 'Do you have video creatives ready?',
    type: 'single',
    options: [
      { id: 'yes', label: "Yes, I create my own", nextStep: 'tk_q3' },
      { id: 'no', label: "No, I need guidance", nextStep: 'tk_q3', flag: 'needs_creative_help' },
    ]
  },
  {
    id: 'tk_q3',
    question: "What's your monthly ad budget?",
    type: 'single',
    options: [
      { id: 'low', label: 'Under $500' },
      { id: 'mid', label: '$500 - $2,000' },
      { id: 'high', label: 'Over $2,000' },
    ]
  }
];
```

| 线路 | 对标定价 | 诊断重点 | TikTok特有关注 | FB对应线路 |
|---|---|---|---|---|
| Website Conversion | $19.9/月 | 点击→落地页→转化全链路 | 视频完播率=钩子效果；落地页匹配度 | 零售商/Retailer |
| TikTok Shop | 暂不开设 | — | — | — |
| Brand Awareness | $29.9/月 | 曝光/触达/视频传播力 | 完播率/评论分享率/素材创意评分 | 品牌方/Brand |
| Local Service | $9.9/月 | 曝光→到店转化/半径覆盖 | Community Interaction指标；地理位置定向效果 | 本地服务/Local Service |

> TikTok Shop线路暂不开设，TikTok Shop卖家可通过Website Conversion线路获得通用诊断。
> 制造商/Manufacturer无TK对应线路，TK不显示该选项。

**为什么TikTok不复用FB 4条线路：**
- Manufacturer → TK没有B2B场景，工厂不在TK投广告
- 核心区别：FB是"你是什么生意"，TikTok是"你在TikTok上怎么卖"
- 但Local Service两边都有 → FB侧重地域半径+到店闭环，TK侧重内容曝光+账号增长+引流到店

### 7.3.1 TikTok Local Service 线路详解

> 定位：帮本地实体店（餐厅/美容院/健身房/零售店/服务商）通过TikTok曝光引流到店。
> 柬埔寨首发场景：金边本地商户通过TikTok内容+广告获客 → LiveOverlay落地页展示+KHQR支付。

**与其他3条TikTok线路的核心区别：**

| | 其他3条TikTok线路 | Local Service |
|---|---|---|
| 目标 | Website Conversion / TikTok Shop / Brand Awareness | Community Interaction + Traffic |
| 定向 | 国家级+兴趣 | **城市级+半径(3-10km)+本地兴趣** |
| CTA | Shop Now / Learn More | **Visit Us / Get Directions / Follow** |
| 素材风格 | 产品展示/品牌故事 | **店铺实拍+后厨/展厅/顾客反应+真人出镜** |
| 落地页 | 产品页/店铺页 | **LiveOverlay店铺页（带KHQR+店铺信息）** |
| 优化目标 | Purchase / Add to Cart | **Profile Visit / Click / Follow** |
| 核心指标 | ROAS / CPA | **CPV(每次到店成本) / 覆盖半径 / 粉丝增长** |

**TikTok Local Service投放策略（2026最新标准）：**

1. **Campaign目标选择**
   - 冷启动：**Community Interaction**（涨粉+主页访问，积累账号权重）
   - 有粉丝基础后：**Traffic**（引流到LiveOverlay落地页）
   - TikTok没有FB的Store Visit目标，用上述替代

2. **定向策略**
   - 位置：店铺地址半径3-10km（城市区域级）
   - 兴趣：叠加本地相关兴趣（美食/健身/美容等）
   - 语言：本地语言+英语（柬埔寨场景：高棉语+英语）
   - 暂不用Lookalike（本地商户客户数据不足）

3. **素材要求**
   - 9:16竖屏视频，15-30秒
   - 前3秒必须出现**店铺实景/产品特写/真人反应**
   - 文案包含：店铺名+地址/区域+行动号召
   - 背景音乐强制要求（TikTok静图广告也必须加BGM）
   - 推荐Spark Ads（推广已有帖子，带社交证明）

4. **预算建议**
   - 最低：$20/天（TikTok广告组最低阈值）
   - 推荐：$50/天起（$50为Campaign级最低，$20为Ad Group级）
   - 冷启动14天，跑Click积累数据，不急于切Conversion

5. **落地页 → LiveOverlay闭环**
   ```
   TikTok广告 → 点击CTA → LiveOverlay店铺页
                                   ├── 商品展示
                                   ├── 店铺信息+地图
                                   ├── KHQR扫码支付（在线支付）
                                   └── COD到店付款
   ```

6. **效果衡量（替代Store Visit）**
   - 主指标：Profile Visit增长 / 网站Click / Follower增长
   - 代理指标：KHQR支付笔数 / LiveOverlay订单数
   - 本地特殊：TikTok Pixel追踪到落地页行为 → 对接到店支付确认

### 7.4 合规预检机制

> 所有平台答题完成后、进入诊断前，弹出平台专属合规检查清单。**配置驱动，每个平台在PlatformConfig中声明complianceChecklist**。

**触发时机**：用户答完最后一题 → 点击"获取诊断"前 → 弹出合规预检卡片

**各平台清单**：

**Facebook合规清单**：
```
⚠️ 提交前检查，这些是Facebook最常见的拒审原因：

□ 广告文案没有过度承诺或误导性表述
□ 落地页能正常打开、内容与广告一致
□ 没有使用前后对比图（减肥/美容等前后对比 = 必拒）
□ 如涉及受限行业（酒精/加密货币/金融），已准备特殊资质
□ 没有使用未授权的音乐/图片/视频素材
□ 没有低质或干扰性内容（闪烁/虚假关闭按钮）

[✓ 我已检查，继续诊断]
```

**TikTok合规清单**：
```
⚠️ 提交前检查，这些是TikTok最常见的拒审原因：

□ 广告文案没有提及其他社交平台名称（Facebook/Instagram/Meta商标禁止出现）
□ 素材前3秒没有虚假承诺（"7天瘦10斤""月入百万"→必拒）
□ 落地页能正常打开、内容与广告一致（链接挂了=直接拒）
□ 静图广告已添加背景音乐（TikTok强制要求）
□ 如果是敏感行业（医疗/减肥/酒精/金融），已准备特殊资质
□ 没有使用未授权的音乐/图片/视频素材
□ 视频中没有未说明的广告性质的合作内容
□ 没有使用绝对化用语（"best""#1""guaranteed"）

[✓ 我已检查，继续诊断]
```

**配置结构**（写入PlatformConfig）：
```typescript
// lib/platforms/registry.ts 新增字段

export interface PlatformConfig {
  // ...现有字段...
  
  // 合规预检清单
  complianceChecklist: {
    title: string;              // "⚠️ 提交前检查"
    subtitle: string;           // "这些是TikTok最常见的拒审原因"
    items: ComplianceItem[];
    confirmLabel: string;       // "✓ 我已检查，继续诊断"
  };
}

interface ComplianceItem {
  id: string;
  text: string;                 // 检查项文案
  severity: 'blocker' | 'warning';  // blocker=必拒, warning=高风险
  appliesTo?: string[];         // 适用线路，空=全部适用
}
```

**TikTok示例配置**：
```typescript
complianceChecklist: {
  title: '⚠️ 提交前检查',
  subtitle: '这些是TikTok最常见的拒审原因',
  confirmLabel: '✓ 我已检查，继续诊断',
  items: [
    { id: 'tk_no_competitor', text: '广告文案没有提及其他社交平台名称（Facebook/Instagram/Meta商标禁止出现）', severity: 'blocker' },
    { id: 'tk_no_fake_promise', text: '素材前3秒没有虚假承诺（"7天瘦10斤""月入百万"→必拒）', severity: 'blocker' },
    { id: 'tk_landing_page', text: '落地页能正常打开、内容与广告一致（链接挂了=直接拒）', severity: 'blocker' },
    { id: 'tk_bgm_required', text: '静图广告已添加背景音乐（TikTok强制要求）', severity: 'blocker' },
    { id: 'tk_sensitive_industry', text: '如果是敏感行业（医疗/减肥/酒精/金融），已准备特殊资质', severity: 'warning' },
    { id: 'tk_copyright', text: '没有使用未授权的音乐/图片/视频素材', severity: 'blocker' },
    { id: 'tk_undisclosed_ad', text: '视频中没有未说明的广告性质的合作内容', severity: 'warning' },
    { id: 'tk_absolute_claims', text: '没有使用绝对化用语（"best""#1""guaranteed"）', severity: 'warning' },
  ]
}
```

### 7.4.1 TikTok全生命周期运营诊断

> AdsCraft定位升级为"TikTok全生命周期运营诊断"：不只是广告诊断，而是覆盖起号→老号提升→广告投放的完整生命周期。
> 在TikTok答题入口增加账号阶段分支，不同阶段给不同诊断策略。

**账号阶段分流（追加在TikTok答题完成后、合规预检前）**：

```
TikTok线路答题完成后，追问账号阶段：
  "你的TikTok账号是什么状态？"
  [ 🆕 新号，还没开始发内容 ] → 起号SOP诊断
  [ 😐 老号，反响平平 ] → 老号提升诊断
  [ 📉 老号，之前有流量现在掉量 ] → 流量恢复诊断
```

**只有选了TikTok才出现这个分支，FB不受影响。**

**阶段1：起号SOP诊断（新号 Day1-30）**

```typescript
const tiktokNewAccountDiagnosis = {
  stages: [
    {
      name: '养号打标签',
      days: 'Day 1-5',
      checklist: [
        '完善Profile（头像/简介/分类标签）',
        '关注10-20个同赛道账号，完整观看+互动',
        'For You页刷到同赛道内容，点赞+评论+收藏',
        '不要发内容，不要改ID，不要频繁操作',
        '目标：让算法识别你的内容偏好和创作者方向'
      ],
      kpi: 'For You页80%内容与目标赛道相关 = 标签打好'
    },
    {
      name: '内容冷启动',
      days: 'Day 6-30',
      checklist: [
        '每天发1条，固定时间（当地晚7-10点高峰）',
        '前3秒必须有钩子（冲突/悬念/视觉冲击）',
        '前5条用同赛道爆款模板改编（不是搬运）',
        '标签用3-5个精准标签+2个宽标签',
        '回复每条评论，制造互动信号'
      ],
      kpi: '70%完播率 = 进入高级流量池；5条内有1条过1000播放 = 冷启动成功'
    },
    {
      name: '投流加速',
      days: 'Day 15+（内容有自然流量后）',
      checklist: [
        '选自然播放最高的视频投Spark Ads',
        '预算$20-50/天，Community Interaction目标',
        '投3-5天看数据，CPL(每粉丝成本)<$0.5算合格',
        '有500+粉丝后切Traffic目标引流落地页'
      ],
      kpi: '粉丝成本<$0.5 / 自然流量占比>60% = 健康'
    }
  ],
  diagnosisPrompt: `用户是TikTok新号（0-30天），请评估起号阶段健康度：
1. 标签是否精准（For You页是否80%+同赛道）
2. 内容发布频率和节奏
3. 前3秒钩子效果（完播率）
4. 是否过早投流（自然流量未验证就花钱 = 浪费）
5. 互动率（评论/分享比单纯点赞更有价值）
输出：当前阶段 + 下一步行动清单 + 常见坑提醒`
};
```

**阶段2：老号提升诊断（反响平平）**

```typescript
const tiktokStaleAccountDiagnosis = {
  steps: [
    {
      name: '找爆款公式',
      action: '分析账号Top 5播放视频的共同特征（主题/节奏/开头/标签）',
      tool: 'AI分析历史内容，识别共同模式'
    },
    {
      name: '砍不工作内容',
      action: '暂停与Top 5特征差异大的内容方向',
      rule: '连续3条<500播放的方向 = 停止'
    },
    {
      name: '重做3秒钩子',
      action: '把表现最好的3条视频，只用前3秒框架，换内容重做',
      why: '2026年完播率权重40-50%，3秒决定一切'
    },
    {
      name: 'SEO优化',
      action: '标题/文案/标签加入搜索关键词',
      data: '2026年TikTok 40%流量来自搜索，泛内容比垂类低45%触达'
    },
    {
      name: '旧内容造新流量',
      action: '把6个月前的爆款内容，换开头/换BGM/换标题重新发布',
      rule: '间隔>90天，改动>30%，标注"by popular demand"'
    }
  ],
  diagnosisPrompt: `用户的TikTok账号已运营一段时间但反响平平，请诊断：
1. 先判断是内容问题还是Shadowban：
   - Shadowban特征：播放量突然从千级降到个位数、所有视频同时低迷、搜索搜不到账号
   - 内容问题特征：有高有低、新视频偶尔过千
2. 分析内容方向是否聚焦（泛内容比垂类低45%触达）
3. 检查3秒钩子质量（完播率<40% = 钩子不行）
4. 是否利用搜索流量（40%流量来自搜索，关键词是否覆盖）
5. 发布节奏是否稳定（断更>7天会掉权重）
输出：问题诊断 + 5步提升优先级排序 + 2周执行计划`
};
```

**阶段3：老号掉量诊断（之前有流量现在掉量）**

```typescript
const tiktokDecliningAccountDiagnosis = {
  diagnosisPrompt: `用户的TikTok老号之前有流量但现在掉量，请诊断：
1. 掉量时间线：突然掉（可能是违规/算法更新）vs 渐渐掉（内容疲劳）
2. 检查是否违规（社区准则警告/内容被限流/账号受限）
3. 同赛道竞品是否也掉（行业性 vs 账号独有问题）
4. 内容是否同质化（观众审美疲劳，需要内容升级）
5. 是否被Shadowban（搜索账号名看能否搜到）
输出：掉量原因 + 恢复策略 + 预计恢复周期`
};
```

**与现有答题的关系**：
- 账号阶段问题追加在TikTok答题完成后、合规预检前
- 只有选了TikTok才出现这个分支，FB不受影响
- 账号阶段诊断结果与广告诊断结果合并输出，给出"账号健康度+广告效果"的综合建议

**新增诊断Prompt模板**：

```
TikTok全生命周期诊断 — {account_stage}阶段：

[账号诊断]
{对应阶段的diagnosisPrompt}

[广告诊断]
{现有的TikTok诊断Prompt，根据线路不同选择}

[综合建议]
基于账号阶段和广告表现，给出：
1. 当前最该做的1件事（优先级最高）
2. 本周执行清单（3-5项）
3. 2周后复查指标

⚠️ 合规风险扫描（同TikTok通用扫描）
```

### 7.5 Google Ads答题（预留）

```typescript
export const googleAdsQuiz: QuizStep[] = [
  {
    id: 'ga_q1',
    question: 'What type of Google Ads do you run?',
    type: 'single',
    options: [
      { id: 'search', label: 'Search ads', route: 'search', nextStep: 'ga_q2' },
      { id: 'shopping', label: 'Shopping ads', route: 'shopping', nextStep: 'ga_q2' },
      { id: 'pmax', label: 'Performance Max', route: 'pmax', nextStep: 'ga_q2' },
    ]
  },
  // Q2/Q3 同TikTok的预算+行业题
];
```

### 7.6 前端改动点

**改**：
- 首页加"选平台"步骤（1个组件，读registry渲染按钮）
- 答题页改为通用Quiz组件，接收quizFlow配置渲染
- **新增**：答题完成后弹出合规预检卡片（通用ComplianceChecklist组件，读PlatformConfig.complianceChecklist渲染，可跳过）
- **新增**：首页入口增加问题类型分流（详见7.7）

**不改**：
- FB 4条线路答题行为 → 只是提取为配置，逻辑不变
- 截图上传流程 → 完全不动
- 付费/订阅/定价 → 线路定价不变

### 7.7 拒审诊断入口

> 用户广告被平台拒审后来AdsCraft问原因，这是高刚需场景。在答题入口增加问题类型分流。
> 与现有"效果不好"链路完全隔离，纯增量，不改动任何已有流程。

**入口改版**：

```
首页（双平台分列）：
┌──── Facebook ──────────┐  ┌──── TikTok ───────────┐
│ [免费通用方案 $0]       │  │ [免费拒审排查 免费]     │
│ [本地服务 $9.9]        │  │ [Local Service $9.9]   │
│ [零售商 $19.9]         │  │ [Website Conv $19.9]   │
│ [制造商 $29.9]         │  │ [Brand Awareness $29.9]│
│ [品牌方 $29.9]         │  │                        │
└────────────────────────┘  └────────────────────────┘

各平台线路独立，不交叉映射
FB 5个入口（1免费+4付费），TK 4个入口（1免费+3付费）
点卡片直接跳对应Creem支付链接，无需中间选平台步骤
FB付费产品Creem已有，TK 3个付费产品需在Creem新建（加产品无需重新审核）
价格直出满足Creem审核要求
```

**拒审诊断流程**：

```
选"广告被拒审" → 选平台（FB/TK）→ 上传拒审通知截图或粘贴拒审原因文字
→ AI对照平台广告政策逐条排查
→ 输出：最可能的拒审原因 + 修改建议 + 重新提交checklist
```

**拒审诊断Prompt**：

```
用户在{platform}投放的广告被拒审，以下是拒审通知内容：
{用户上传的拒审通知文字/截图提取}

请对照{platform}广告政策，逐条排查以下常见拒审原因：
1. 素材违规（虚假承诺/前后对比/低质内容/未授权素材）
2. 文案违规（绝对化用语/竞品商标/误导性表述）
3. 落地页问题（无法访问/内容不一致/禁止品类）
4. 平台特有要求（TikTok: 静图无BGM/竞品商标；FB: 前后对比图/干扰性元素）
5. 行业资质（敏感行业需额外审核）
6. 账户级问题（余额不足/账户受限）

输出格式：
🔴 最可能原因：[1-2个最可能的拒审原因，带置信度]
🟡 可能原因：[其他可能原因]
✅ 修改建议：[具体可执行的修改步骤]
📋 重新提交前检查清单：[修改后的合规checklist]
```

**拒审诊断不收费**：作为获客手段，免费提供基础拒审诊断（原因排查+方向性修改建议）；深度诊断报告（详细原因分析+行业对标+优化方向指引）需订阅对应线路。

> ⚠️ 当前广告诊断能力尚在养成阶段，不提供"一键生成修改方案"功能。诊断做到位，方案执行由用户自己完成或找专业服务商。避免过度承诺砸口碑。

---

## 八、前端页面结构

### 8.1 Tab导航

```
[ 概览 ]  [ Facebook ]  [ TikTok ]  [ 设置 ]
```

- **概览Tab**：双平台关键指标并列 + AI跨平台综合建议
- **Facebook Tab**：现有截图上传+数据+诊断，零改动
- **TikTok Tab**：OAuth连接 → 数据表格 → AI诊断
- **设置Tab**：平台连接管理（授权/断开）

### 8.2 未连接平台

TikTok Tab在未连接时显示引导页："连接TikTok账号，解锁AI诊断"，点击跳OAuth。

### 8.3 概览页布局

```
┌─────────────────────────────────────────┐
│  总花费趋势（双平台堆叠折线图）           │
│  ——— Facebook  ┅┅┅ TikTok              │
├──────────────────┬──────────────────────┤
│  Facebook        │  TikTok              │
│  本周花费 $XXX   │  本周花费 $XXX       │
│  CTR X.X%       │  CTR X.X%           │
│  ROAS X.X       │  ROAS X.X           │
│  → 进入详情      │  → 进入详情          │
├──────────────────┴──────────────────────┤
│  AI综合建议                              │
│  "FB的CTR更高，但TikTok的CPC更低         │
│   建议将部分预算转到TikTok测试..."        │
└─────────────────────────────────────────┘
```

---

## 九、API设计

### 9.1 现有API（不改）

| 接口 | 方法 | 说明 |
|---|---|---|
| `/api/analyze-screenshot` | POST | FB截图识别（现有） |
| `/api/confirm-snapshot` | POST | 确认入库+分析（现有，入库时自动填platform=facebook） |
| `/api/ad-analysis` | GET | 历史分析（现有，加platform过滤参数） |

### 9.2 新增API

**统一OAuth路由（通用，未来Google Ads复用）：**

| 接口 | 方法 | 说明 |
|---|---|---|
| `/api/auth/[platform]` | GET | 发起OAuth授权，按platform读配置拼URL |
| `/api/auth/[platform]/callback` | GET | OAuth回调，换token存platform_connections |
| `/api/[platform]/sync` | POST | 手动触发数据拉取 |
| `/api/[platform]/campaigns` | GET | 获取广告系列列表 |
| `/api/[platform]/disconnect` | POST | 断开授权 |
| `/api/connections` | GET | 查询已连接平台列表 |
| `/api/overview` | GET | 多平台概览数据 |

### 9.3 现有接口改动点

**`/api/confirm-snapshot`**：
- 入库时自动填 `platform: 'facebook'`, `source: 'screenshot'`
- FB独有指标存 `platform_metrics` JSONB

**`/api/ad-analysis`**：
- 新增可选参数 `?platform=facebook|tiktok`，默认返回全部
- 查询时按platform字段过滤

---

## 十、TikTok Marketing API

### 10.1 OAuth参数

| 参数 | 值 |
|---|---|
| 授权URL | `https://business-api.tiktok.com/portal/auth` |
| Token URL | `https://business-api.tiktok.com/openapi/v1.3/oauth2/access_token` |
| Refresh URL | `https://business-api.tiktok.com/openapi/v1.3/oauth2/refresh_token/` |
| 所需Scopes | `ad.management`, `ad.read`, `analytics.read`, `user.info.basic` |
| 回调URL | `https://adscraft.cn/api/auth/tiktok/callback` |

**前置条件：**
- TikTok for Business开发者后台注册应用，获取app_id + app_secret
- 已有Business Center（Li bo, ID: 7652033063211319312）
- 已有Ads Manager（Adscraft_2101bi, ID: 7652033047588438033）

### 10.2 数据拉取

```
# 广告系列列表
GET https://business-api.tiktok.com/openapi/v1.3/campaign/get/
  ?advertiser_id={advertiser_id}
  &fields=["campaign_id","campaign_name","objective","status","budget"]

# 广告数据报表
GET https://business-api.tiktok.com/openapi/v1.3/report/integrated/get/
  ?advertiser_id={advertiser_id}
  &report_type=BASIC
  &data_level=AUCTION_CAMPAIGN
  &dimensions=["campaign_id"]
  &metrics=["spend","impressions","clicks","ctr","cpm","cpc","conversions","cost_per_conversion","roas","video_play_2s","video_watched_100"]
  &start_date={start}
  &end_date={end}
```

### 10.3 Token刷新

TikTok access_token约30天过期。Vercel Cron Job每日检查 `platform_connections` 中3天内过期的token并刷新。

---

## 十一、AI优化引擎逻辑

### 11.0 优化引擎范式

**核心转变**：从"诊断问题"升级为"计算最优解"。

平台推流机制是确定的（FB竞价拍卖+互动深度权重，TK完播率驱动+内容权重），给定约束条件，理论上存在最优投放配置。优化引擎的任务就是算出这个最优解。

**输入变量矩阵**：
```
可控变量（优化引擎直接算）：
├── 出价策略（CBO/ABO、出价金额）
├── 定向范围（宽/窄/排除）
├── 投放结构（campaign层级、广告组数量）
├── 预算分配
└── 投放时段

半可控变量（引擎给策略，用户执行）：
├── 素材质量（前3秒钩子、CTA、节奏）
├── 落地页体验
└── 产品本身的吸引力

不可控变量（引擎识别并规避）：
├── 同时刻竞品出价
├── 用户当下情绪
└── 平台算法微调
```

**关键洞察**：素材质量不可直接计算，但可以算"给定当前素材水平，最优的测试/轮换策略"。其他所有变量可计算。

**雷同问题的解法**：免费层通用最优解会雷同；付费层接入账户数据（Pixel成熟度/历史CTR/投放阶段），个性化最优解不雷同。静态配置会雷同，动态优化路径不会。

### 11.1 优化流程（四步递进）

```
① 诊断分析：当前配置的问题 + 原因
    → 用户理解"为什么不行"
    → 免费完整可见

② 最优配置计算：给定约束条件，算出最优投放参数 + 预期效果区间
    → 直接给答案
    → 免费预览（关键参数区间），付费完整版

③ 优化路径：7-14天动态调整节奏 + 关键节点决策规则
    → 不是一份配置，是一条路径
    → 每个阶段最优解不同，取决于上一阶段实际数据
    → 付费

④ 持续进化：新数据反馈 → 重新计算最优解
    → 每个人的数据走向不同，路径分叉
    → 付费
```

```
数据入库 → 读platform字段 → 选对应平台诊断prompt → 读benchmarks → 生成诊断 → 计算最优配置 → 生成优化路径
```

### 11.2 各平台行业基准

| 指标 | Facebook | TikTok |
|---|---|---|
| CTR | 1.0-2.0%（avg） | 0.8-1.5%（avg） |
| CPC | $0.50-1.50 | $0.20-0.80 |
| CPA | $10-30 | $5-20 |
| ROAS | 2.0-4.0x | 1.5-3.0x |

> 基准值随行业/地区差异大，首次诊断时让用户选行业细分

### 11.3 诊断Prompt模板

**FB诊断**（现有，不改）：
```
这是一组Facebook广告数据...与FB行业基准对比...给出优化建议...

⚠️ 合规风险扫描（内置，每条诊断报告自动输出）：
扫描用户提交的广告素材/文案，检查以下Facebook常见拒审风险：
- 是否有前后对比图（减肥/美容等）→ 🔴必拒
- 是否有过度承诺或误导性表述 → 🟡高风险
- 是否有低质/干扰性内容（闪烁/虚假关闭按钮）→ 🔴必拒
- 落地页是否可访问且内容一致 → 🔴必拒
- 是否有未授权素材 → 🟡高风险
无风险则输出 🟢合规检查通过
```

**TikTok诊断**（新增）：
```
这是一组TikTok广告数据，来自Marketing API。与TikTok行业基准对比。
注意TikTok特有指标：
- video_view_rate > 15%为优秀，< 10%说明前3秒钩子不行
- 2s_video_view反映钩子效果，低=素材不够吸引
- TikTok是内容驱动，CTR低不一定是受众问题，可能是素材问题
如果video_view_rate低，建议优化前3秒钩子/测试不同开头...

⚠️ 合规风险扫描（内置，每条诊断报告自动输出）：
扫描用户提交的广告素材/文案，检查以下TikTok常见拒审风险：
- 是否包含竞品平台商标/名称（Facebook/Instagram/Meta）→ 🔴必拒
- 是否有虚假承诺/绝对化用语（best/#1/guaranteed）→ 🟡高风险
- 静图广告是否缺少BGM → 🔴必拒
- 落地页是否可访问且内容一致 → 🔴必拒
- 是否有未授权素材 → 🟡高风险
无风险则输出 🟢合规检查通过
```

**TikTok Local Service诊断**（新增）：
```
这是一组TikTok本地业务广告数据，目标为曝光引流到店。
注意本地业务特有指标和逻辑：
- TikTok没有Store Visit目标，用Community Interaction(涨粉/主页访问)+Traffic(引流落地页)替代
- 核心指标：profile_visit增长 / website_click / follower增长 / 覆盖半径
- 代理转化指标：LiveOverlay订单数 / KHQR支付笔数（如果接入了LiveOverlay）
- 本地业务CPC通常低于电商，但CPV(每次到店)更难追踪
- 素材诊断重点：前3秒是否有店铺实景/本地地标/真人出镜 → 本地用户需要"看到真实店铺"
- 定向诊断：覆盖半径是否合理（3-10km为佳，太广浪费预算，太窄触达不够）
- 如果profile_visit高但website_click低 → 素材吸引人但CTA不够明确，建议加"Link in Bio"引导
- 如果website_click高但到店/订单低 → 落地页问题，检查LiveOverlay加载速度+商品展示+支付流程
- 冷启动建议：前14天跑Community Interaction积累粉丝，再切Traffic引流落地页

⚠️ 合规风险扫描（内置，每条诊断报告自动输出）：
同TikTok通用合规扫描，另增本地业务专项：
- 素材中是否有店铺实景/本地地标 → 本地广告无实景=审核降权
- 是否包含竞品平台商标/名称 → 🔴必拒
- 静图广告是否缺少BGM → 🔴必拒
无风险则输出 🟢合规检查通过
```

**跨平台综合诊断**（概览页，双平台都有数据时）：
```
用户在Facebook和TikTok都有广告投放，以下是双平台数据对比：
[FB数据] [TikTok数据]
请给出：1.各平台表现评价 2.预算分配建议 3.跨平台协同策略
```

---

## 十二、定价与交付物

### 12.1 免费层 vs 付费层

| | 免费层 | 付费层 |
|---|---|---|
| 诊断分析 | ✅ 完整可见 | ✅ 完整可见 |
| 最优配置预览 | ✅ 关键参数区间（粗略） | ✅ 完整最优配置参数 |
| 优化路径 | ❌ | ✅ 7-14天动态调整节奏 |
| 决策规则 | ❌ | ✅ 关键节点判断规则（CTR降到X就做Y） |
| 持续进化 | ❌ | ✅ 新数据进来重新算最优解 |

**免费层价值**：诊断完整可见 + 最优解预览（可信但不完整），让用户知道"我的CPA可以降到$4"，但要看完整配置和路径需付费。
**付费层价值**：直接给答案——可执行的完整配置 + 动态路径 + 持续更新。

### 12.2 线路定价

| 层级 | 月价 | FB | TK | 交付物 |
|---|---|---|---|---|
| 免费层 | $0 | 通用方案+设置清单+诊断 | 拒审排查+广告诊断+最优配置预览 | 诊断+最优解预览 |
| Local Service | $9.9 | ✅ | ✅ | 完整最优配置+7天优化路径 |
| Retailer / Website Conversion | $19.9 | ✅ Retailer | ✅ Website Conv | 完整最优配置+14天优化路径+决策规则 |
| Manufacturer | $29.9 | ✅ | ❌ | 完整最优配置+14天优化路径+决策规则+持续进化 |
| Brand / Brand Awareness | $29.9 | ✅ | ✅ | 完整最优配置+14天优化路径+决策规则+持续进化 |

**FB和TK分列独立**，点卡片直接跳对应Creem支付链接，无需中间选平台。
FB付费产品Creem已有（4个），TK付费产品需在Creem新建3个（Local Service / Website Conversion / Brand Awareness），加产品无需重新审核。

### 12.3 最优解的雷同问题

免费层只输入产品+预算+目标，同类产品最优解会雷同（通用最优解）。
付费层接入账户数据（Pixel成熟度/历史CTR/投放阶段），个性化最优解不会雷同。
**静态配置会雷同，动态优化路径不会**——每个人数据走向不同，路径分叉。
付费交付物不是一份配置，是一个持续优化过程。

---

## 十三、开发步骤

### Step 1：数据库迁移
新增3列(ad_snapshots) + 2个新表(platform_connections, api_sync_log)，验证RLS

### Step 2：平台注册表
实现 `lib/platforms/registry.ts`，含FB和TikTok的PlatformConfig；实现 `lib/platforms/quiz-configs.ts`

### Step 3：TikTok开发者应用注册
TikTok for Business后台创建应用，获取app_id + app_secret，配回调URL（需人工操作）

### Step 4：统一OAuth路由
实现 `/api/auth/[platform]` + `/api/auth/[platform]/callback`，通用入口，按platform读配置

### Step 5：TikTok数据拉取
实现 `/api/tiktok/sync` + `/api/tiktok/campaigns`，拉数据写ad_snapshots(platform=tiktok)

### Step 6：首页平台选择器
加"选平台"步骤，读registry渲染按钮，选中后跳对应quiz

### Step 7：答题配置化
现有FB答题提取为quiz配置，通用Quiz组件按配置渲染，FB行为100%不变；新增TikTok quiz配置

### Step 7.5：合规预检组件
通用ComplianceChecklist组件，读PlatformConfig.complianceChecklist渲染；答题完成后、诊断前弹出，可跳过；各平台清单配置化

### Step 7.6：拒审诊断入口
首页增加问题类型分流（广告诊断/广告被拒审）；拒审流程：选平台→上传拒审通知→AI排查→输出原因+方向性修改建议；拒审诊断完整免费，作为获客引流入口；不提供一键生成方案，避免过度承诺

### Step 7.7：TikTok全生命周期运营诊断（详见Step 15）
仅TikTok出现，FB不受影响。开发时与Step 15一起实现。

### Step 8：前端Tab改造
导航改为Tab结构（概览/FB/TikTok/设置），FB Tab零改动

### Step 9：AI诊断适配
TikTok诊断prompt + 跨平台综合诊断prompt + 基准值配置

### Step 10：现有接口适配
`/api/confirm-snapshot`入库时填platform=facebook；`/api/ad-analysis`加platform过滤

### Step 11：Token刷新Cron
Vercel Cron Job每日检查+刷新即将过期的token

### Step 12：首页双平台分列布局 + 优化引擎定位展示

- 首页顶部加产品定位区：标题"AdsCraft — AI广告优化引擎"，副标题"给定条件，算出你的最优投放配置"，四步流程可视化：①诊断分析 → ②最优配置 → ③动态优化 → ④持续进化
- 首页改为双平台分列布局，左侧Facebook右侧TikTok：
  - FB 5个入口：免费通用方案+诊断$0 / 本地服务$9.9 / 零售商$19.9 / 制造商$29.9 / 品牌方$29.9
  - TK 4个入口：免费诊断+拒审排查$0 / Local Service$9.9 / Website Conversion$19.9 / Brand Awareness$29.9
- 每个卡片=线路+价格，点击直接跳对应Creem Checkout链接
- 价格直出，满足Creem审核要求
- TK免费入口文案写"免费诊断+拒审排查"，不单独提最优配置
- 移动端双列变上下堆叠，FB在上TK在下
- TK 3个付费卡片的Creem链接暂用占位符，后续填入

### Step 13：优化引擎四步递进逻辑

- 诊断结果页面改为四步递进结构：①诊断分析 → ②最优配置 → ③优化路径 → ④持续进化
- 免费层交付：诊断完整可见 + 最优配置预览（给关键参数区间如"CPA可降至$4-6"，可信但不完整）+ 下方CTA"解锁完整配置"
- 付费层交付：完整最优配置参数（具体出价/定向/预算分配）+ 7-14天动态优化路径 + 关键节点决策规则（CTR降到X就做Y）+ 持续进化（新数据重新算最优解）
- 诊断是最优解的论据：先让用户理解问题，再接受方案
- FB和TK统一四步框架，只是具体参数和基准值不同
- 免费预览不暴露具体参数值，给区间不给精确数字

### Step 14：TikTok答题重新设计

- 删除所有TikTok Shop相关题目（暂不开设）
- 删除路由分流题（不需要先选广告类型再分流）
- 每条线路独立答题2-3题，不交叉：
  - Local Service：业务类型→目标客户→预算范围
  - Website Conversion：产品类型→转化目标→日均预算
  - Brand Awareness：行业→目标受众→投放周期
- 免费入口（拒审排查+诊断）：上传拒审通知截图→选拒审类型→AI排查

### Step 15：TikTok全生命周期运营诊断 — SOP指引

> 定位从"个性化诊断"改为"运营SOP指引"，标准化操作清单，不给个性化结论给行动清单。
> 根据阶段匹配固定SOP模板，输出标准化行动清单，不走个性化推理。

3个阶段各输出统一格式的SOP（核心任务→关键指标→常见坑→推荐动作）：

**新号（0-30天）冷启动SOP**
- 核心任务：建立Pixel数据基线+积累初始互动数据
- 关键指标：Pixel事件≥50/周、CTR≥1.2%、学习期通过率
- 常见坑：预算分散太多广告组、素材测试不够就放大、过早切CBO
- 推荐动作：ABO起步每组$20/天→3-5组→学完再缩→素材跑出再放量

**老号平平（30-90天）突破瓶颈SOP**
- 核心任务：找到跑量素材模型+优化转化链路
- 关键指标：CPA趋势、素材衰减周期、频次控制
- 常见坑：持续加预算不换素材、频次过高不处理、忽略受众疲劳
- 推荐动作：素材3天一轮测→CBO+宽定向→频次>3换素材或扩受众

**老号掉量（90天+）恢复SOP**
- 核心任务：诊断掉量原因+止血+重建
- 关键指标：CPA飙升幅度、展示下降比例、竞品变化
- 常见坑：直接加预算硬扛、素材全换大改、忽略政策变化
- 推荐动作：先诊断是素材衰减/受众疲劳/竞品冲击→针对性调整→逐步恢复不要大改

与广告诊断合并输出时：SOP作为前置背景段（"你这个阶段应该做什么"），广告诊断作为重点段（"你的具体问题是什么"）。仅TikTok出现，FB不受影响。

### Step 16：联调测试

- OAuth→数据拉取→前端展示→AI诊断→全流程跑通
- FB流程零回归验证
- TK完整流程验证（OAuth授权→数据同步→答题→诊断→最优配置预览）
- 双平台首页交互验证
- 免费层/付费层交付边界验证

### Step 17：分析师智能进化架构（P2，可后置）

Supabase知识库表(knowledge_base)+案例记忆表(diagnosis_cases)+CodeAct抓取脚本+Bot工作流升级+反馈闭环

### Step 18：智能体矩阵接入（P2，可后置）

DeepSeek API接入（知识提取+深度归因）+ Supabase pgvector扩展（语义检索）+ Bot升级接入知识库

---

## 十四、优先级

| Step | 优先级 | 理由 |
|---|---|---|
| 1 数据库迁移 | P0 | 基础依赖 |
| 2 平台注册表 | P0 | 驱动后续所有逻辑 |
| 3 TikTok应用注册 | P0 | 前置条件，需人工 |
| 4-5 OAuth+数据 | P0 | 核心功能 |
| 6-7 选平台+答题 | P1 | 产品体验 |
| 7.5 合规预检 | P1 | 降低用户拒审率，提升体验 |
| 7.6 拒审诊断 | P1 | 高刚需获客入口，免费引流 |
| 7.7 TK全生命周期SOP | P1 | 标准化运营指引，覆盖起号到投流全阶段 |
| 8 Tab改造 | P1 | UI升级 |
| 9 诊断适配 | P1 | 差异化，含合规风险扫描 |
| 10 现有接口适配 | P1 | 兼容性 |
| 11 Cron刷新 | P2 | 可先手动 |
| 12 首页双平台布局 | P1 | 产品定位展示+双平台入口 |
| 13 优化引擎递进逻辑 | P1 | 核心产品升级，诊断→优化→进化 |
| 14 TK答题重设计 | P1 | 删Shop+独立答题，简化流程 |
| 15 TK全生命周期SOP | P1 | 标准化运营指引 |
| 16 联调测试 | P1 | 全流程验证 |
| 17 分析师智能进化架构 | P2 | 知识库+案例库+反馈闭环，非首期必须 |
| 18 智能体矩阵接入 | P2 | DeepSeek+pgvector，依赖Step 17，可后置 |

---

## 十五、成本

| 项目 | 费用 |
|---|---|
| TikTok Marketing API | 免费 |
| GPT-4o-mini | ~$0.003/次分析，不变 |
| Vercel Cron | 免费版2个/天 |
| Supabase | 免费版500MB |

**新增成本约等于零。**

分析师进化架构月成本（详见19.3）：
| 项目 | 月成本 |
|---|---|
| DeepSeek-V3（知识提取） | ~$0.01 |
| text-embedding（语义检索） | ~$0.05 |
| DeepSeek-R1（深度归因） | ~$0.1 |
| **分析师合计** | **~$0.2/月** |

---

## 十六、前置条件与异常处理

| 场景 | 处理方式 |
|---|---|
| 未登录 | 401跳登录 |
| 0条数据 | "连接账号/上传截图，解锁AI诊断" |
| TikTok未授权 | TikTok Tab显示引导页 |
| Token过期 | 自动刷新，刷新失败提示重新授权 |
| API拉取失败 | 写sync_log(status=failed)，提示重试 |
| 截图识别超时 | 7秒超时，提示重试（现有逻辑不变） |

---

## 十七、与Coze Bot的关系

- 不涉及Bot改动
- Bot通过Supabase REST API读取ad_snapshots，做深度多轮对话诊断
- Bot查询时加platform过滤：`?platform=eq.facebook` 或 `?platform=eq.tiktok`

```
GET https://{project}.supabase.co/rest/v1/ad_snapshots
  ?user_id=eq.{用户ID}
  &platform=eq.tiktok
  &order=created_at.desc&limit=30

Headers:
  apikey: {Supabase Anon Key}
  Authorization: Bearer {Supabase Anon Key}
```

---

## 十八、开发需要提供的配置

| 配置项 | 说明 |
|---|---|
| Supabase Project URL | 现有 |
| Supabase Anon Key | 现有 |
| GPT-4o-mini API Key | 现有 |
| R2/Blob 存储配置 | 现有（仅FB截图用） |
| TikTok App ID | **新增**，Step 3获取 |
| TikTok App Secret | **新增**，Step 3获取 |
| DeepSeek API Key | **新增**，Step 17/18，platform.deepseek.com注册 |
| Supabase pgvector扩展 | **新增**，Step 17，`CREATE EXTENSION vector;` |
| text-embedding API Key | 复用OpenAI Key |

---

## 十九、智能体矩阵与分析师进化架构

### 19.1 智能体选型矩阵

| 任务 | 推荐智能体 | 理由 | 备选 |
|---|---|---|---|
| 广告诊断分析 | GPT-4o-mini | 已在用，分析质量够，成本低 | DeepSeek-V3（更便宜，质量接近） |
| 截图识别（OCR） | GPT-4o-mini | 已在用，视觉能力够 | GPT-4o（更准但贵3倍） |
| 知识抓取+提取 | DeepSeek-V3 | 便宜，文本提取够用，$0.27/M tokens | Qwen-Plus（中文更强） |
| 拒审排查 | GPT-4o-mini | 需对照政策逐条排查，准确性要求高 | Claude Haiku（长上下文更强） |
| Bot多轮对话 | 豆包（Coze平台） | Coze原生，工作流集成最顺 | GPT-4o-mini（需API调用） |
| 知识库语义检索 | text-embedding-3-small | OpenAI嵌入模型，检索质量好 | BGE-M3（开源免费，需自部署） |
| 复杂案例深度分析 | DeepSeek-R1 | 推理链长，适合复杂归因分析 | GPT-4o（贵但最强） |

### 19.2 前后台分工

```
┌─ 前台（用户直接交互）────────────────┐
│                                       │
│ 网站诊断报告：GPT-4o-mini             │
│   → 快、便宜、质量够                  │
│                                       │
│ 截图识别：GPT-4o-mini                 │
│   → 已验证，不改                      │
│                                       │
│ Bot对话：豆包（Coze原生）              │
│   → 工作流+工具集成最顺               │
│   → 复杂问题升级到GPT-4o-mini        │
│                                       │
│ 拒审排查：GPT-4o-mini                 │
│   → 准确性优先                        │
└───────────────────────────────────────┘

┌─ 后台（自动进化）────────────────────┐
│                                       │
│ 知识抓取：DeepSeek-V3                 │
│   → 便宜，每周跑1次，成本可忽略       │
│                                       │
│ 语义检索：text-embedding-3-small      │
│   → 存向量，检索相似案例和知识         │
│                                       │
│ 深度归因：DeepSeek-R1（按需调用）     │
│   → 遇到异常案例时启用，走推理链       │
│   → 结果存入案例库，下次不用重算       │
└───────────────────────────────────────┘
```

### 19.3 成本预估

| 智能体 | 单次成本 | 月调用量预估 | 月成本 |
|---|---|---|---|
| GPT-4o-mini（诊断+截图） | ~$0.003 | 500次 | ~$1.5 |
| DeepSeek-V3（知识提取） | ~$0.0005 | 20次 | ~$0.01 |
| 豆包（Bot对话） | Coze平台内，按Coze计费 | — | 已含 |
| text-embedding（检索） | ~$0.0001 | 500次 | ~$0.05 |
| DeepSeek-R1（深度归因） | ~$0.01 | 10次 | ~$0.1 |
| **合计** | | | **~$2/月** |

### 19.4 接入方式

| 智能体 | 接入方式 | 难度 |
|---|---|---|
| GPT-4o-mini | Vercel API Route调用（已接） | ✅ 已完成 |
| DeepSeek-V3 | Vercel API Route调用，OpenAI兼容格式，改base_url+key | 🟢 改配置 |
| 豆包 | Coze Bot工作流（已有） | ✅ 已完成 |
| text-embedding | Vercel API Route + Supabase pgvector | 🟡 需建向量表 |
| DeepSeek-R1 | 同DeepSeek-V3，换model名 | 🟢 改参数 |

### 19.5 分析师三层智能架构

#### 第一层：知识智能（Supabase知识库 + 自动抓取）

**绕开Coze知识库的原因**：Coze知识库不支持API上传，无法自动更新。改用Supabase当知识库，Bot通过API检索。

**知识库表**：
```sql
CREATE TABLE knowledge_base (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL,           -- 'facebook' | 'tiktok' | 'cross_platform'
  category TEXT NOT NULL,           -- 'policy' | 'best_practice' | 'algorithm' | 'case_study' | 'benchmark'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source_url TEXT,
  effective_date DATE,              -- 政策类标注生效日期
  embedding VECTOR(1536),           -- pgvector向量，用于语义检索
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 向量索引
CREATE INDEX idx_knowledge_embedding ON knowledge_base USING ivfflat (embedding vector_cosine_ops);

-- 按平台+分类检索
CREATE INDEX idx_knowledge_platform_category ON knowledge_base(platform, category);
```

**知识库目录结构**：
```
/AdsCraft知识库/
├── Facebook/
│   ├── 广告政策/
│   ├── 投放最佳实践/
│   ├── 算法与分发/
│   ├── 行业基准/
│   └── 案例库/
├── TikTok/
│   ├── 广告政策/
│   ├── 投放最佳实践/
│   ├── 算法与分发/
│   ├── 行业基准/
│   └── 案例库/
└── 跨平台/
    ├── 对比策略/
    └── 预算分配/
```

**自动抓取链路**：
```
CodeAct定时脚本（每周1次）
  → 抓取官方政策页+社区精华帖
  → DeepSeek-V3提取关键信息+去重
  → text-embedding-3-small生成向量
  → 写入Supabase knowledge_base
  → 自动标记旧知识为过期（policy类按effective_date判断）
```

**冷启动**：FB知识库优先搭建（已有用户，诊断质量直接影响留存），手动整理50-100篇核心文档上传。

#### 第二层：分析智能（诊断框架Prompt + 案例记忆）

**案例记忆表**：
```sql
CREATE TABLE diagnosis_cases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL,
  route TEXT NOT NULL,              -- 对应首页线路
  user_scenario TEXT NOT NULL,      -- 用户场景描述
  key_metrics JSONB,                -- 关键指标数据
  diagnosis_result TEXT NOT NULL,   -- 诊断结论
  suggestions TEXT NOT NULL,        -- 优化建议
  user_feedback TEXT,               -- 用户反馈（采纳/未采纳/效果如何）
  effectiveness_score INTEGER,      -- 建议有效性评分 1-5
  embedding VECTOR(1536),           -- 场景向量，用于相似案例检索
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cases_embedding ON diagnosis_cases USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_cases_platform_route ON diagnosis_cases(platform, route);
```

**Bot诊断工作流（5步）**：
```
1. 读用户数据 → Supabase ad_snapshots + 用户自报信息
2. 检索知识库 → Supabase knowledge_base 向量检索，找相关政策和最佳实践
3. 检索相似案例 → Supabase diagnosis_cases 向量检索，找历史相似案例
4. 按框架分析 → GPT-4o-mini + diagnosisPrompt + 知识库上下文 + 案例参考 → 生成诊断
5. 存案例 → 本次诊断结果写入diagnosis_cases，积累案例库
```

#### 第三层：进化智能（反馈闭环 + 案例积累自动反哺）

分析师进化方向：不是"越来越会诊断"，而是"越来越会算最优解"。

**反馈闭环**：
```
用户收到最优配置 → 照着执行 → 7天后推送反馈
  → "实际效果如何？CPA多少？CTR多少？" + 1-5分
  → 反馈写入diagnosis_cases.user_feedback + effectiveness_score
  → 实际效果 vs 预期效果的偏差 → 校准优化模型
  → 评分高的配置权重提升，评分低的权重降低
  → 案例积累越多 → 最优解计算越准确 → 预期效果区间越窄
```

**进化路径**：
| 阶段 | 案例数 | 能力 |
|---|---|---|
| 冷启动 | 0-20 | 种子案例，通用最优解，预期效果区间宽（±40%） |
| 成长 | 20-100 | 有反馈校准，个性化最优解可用，区间收窄到±25% |
| 成熟 | 100-500 | 案例覆盖常见场景，区间收窄到±15%，接近真实最优 |
| 专家 | 500+ | 罕见场景也有参考，区间±10%，跨平台归因分析 |

**冷启动方案**：搜集20-30个FB/TK真实广告优化案例，脱敏后写入diagnosis_cases，让分析师上线就有"经验"。

### 19.6 Bot与网站定位区分

| | 网站 | Bot |
|---|---|---|
| 定位 | 标准化优化引擎，算最优解 | 深度追问，持续优化陪伴 |
| 交互 | 输入约束→诊断+最优配置+路径 | 多轮对话，可追问优化细节 |
| 付费 | 订阅制，按线路收费 | 包含在订阅内，引流入口 |
| 数据源 | 截图/API自动拉取 | 读网站已有数据+用户自述 |
| 知识库 | 不直接用 | 检索knowledge_base+diagnosis_cases |
| 典型场景 | "卖防晒衣$20/天，给我最优配置" | "为什么你建议宽定向？我的CPA还是高怎么办" |

### 19.7 需要准备的配置

| 配置项 | 获取方式 | 难度 |
|---|---|---|
| DeepSeek API Key | platform.deepseek.com 注册，5分钟 | 🟢 |
| Supabase pgvector扩展 | SQL: `CREATE EXTENSION vector;` | 🟢 |
| text-embedding API Key | 复用OpenAI Key（已有） | ✅ 已有 |
| 冷启动种子案例 | 人工整理20-30个真实案例脱敏写入 | 🟡 需时间 |

---

> 本内容由 Coze AI 生成，请遵循相关法律法规及《人工智能生成合成内容标识办法》使用与传播。

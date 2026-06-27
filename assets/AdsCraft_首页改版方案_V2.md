---
AIGC:
    Label: "1"
    ContentProducer: 001191110102MACQD9K64018705
    ProduceID: 7634029171441664308-data_volume/files/所有对话/主对话/用户上传/AdsCraft_首页改版方案_V2.md
    ReservedCode1: ""
    ContentPropagator: 001191110102MACQD9K64028705
    PropagateID: 3476033405197864#1782550191335
    ReservedCode2: ""
---
# AdsCraft 首页改版方案 V2

> 定位：Campaign Review Platform
> 品牌语言：Review. Validate. Optimize.
> 目标：7屏以内，砍掉空洞AI话术，用产品和流程说服用户

---

## 全局设计规范

### 风格
- 干净、专业、有信任感
- 不要渐变背景、不要插画、不要stock photo
- 产品展示用真实截图/数据，不用示意图
- 配色保持现有品牌色，不要大改

### 排版层级
- H1: Hero 标题，大字加粗
- H2: 每屏标题，统一样式
- H3: 卡片标题
- Body: 简洁短句，每段不超过3行

### 导航栏
- Logo（左）
- Features / Pricing / FAQ（中）
- Start Free Diagnosis 按钮（右）
- 滚动时固定顶部，背景变白/毛玻璃

### 响应式
- 桌面端优先设计
- 移动端：卡片改竖排，Engine图改为纵向流程，动态图简化

---

## 第一屏：Hero

### 标题
**Launch Better Ads Before Spending Your Budget.**

### 副标题
> AdsCraft reviews your Facebook and TikTok campaigns before you launch—combining AI analysis, platform-specific rules, and technical validation.

### 按钮（两个，并排）
- `Start Free Diagnosis`（主按钮，实心）
- `Watch Demo`（次按钮，描边）

### 右侧内容（不要插画，放产品实时效果）
左右分栏，左侧文案，右侧产品展示。

右侧做一个动态模拟：

```
┌─ Facebook ─────────────────────┐
│ 📷 Screenshot Uploaded         │
│ ✓ Reading Campaign             │
│ ✓ Checking Metrics             │
│ ✓ Building Report              │
├────────────────────────────────┤
│ TikTok 6-Step Audit            │
│ ✓ Compliance                   │
│ ✓ Creative                     │
│ ✓ Landing Page                 │
│ ✓ Tracking                     │
└────────────────────────────────┘
```

**动态效果**：
- 逐行出现，带打勾动画
- Facebook部分先播放完，再播放TikTok部分
- 循环播放，每轮间隔3秒
- 用Framer Motion，不要复杂，简洁干净
- 每个checkmark出现时带轻微弹跳

### 关键原则
- 首屏不要出现"AI"作为主语
- 核心信息：你花钱投广告之前，先让AdsCraft帮你检查一遍
- 右侧让用户一眼看到"这是一个真实产品"

---

## 第二屏：How AdsCraft Works

### 标题
**How AdsCraft Works**

### 内容
画一个横向流程图（桌面端横向，移动端纵向）：

```
Campaign → Platform Rules → AI Review → Technical Validation → Optimization Engine → Action Plan
```

设计要求：
- 每个节点用图标+名称
- 节点之间用箭头连接
- 鼠标hover到每个节点时，下方出现一行说明文字：
  - Campaign: "Upload screenshots or complete a guided audit"
  - Platform Rules: "Check against Facebook and TikTok advertising policies"
  - AI Review: "AI reasoning analyzes your campaign structure and metrics"
  - Technical Validation: "Verify tracking, pixels, and landing page health"
  - Optimization Engine: "Generate prioritized recommendations"
  - Action Plan: "Get specific next actions, not just problems"

### 流程图下方，一句话：
> Your campaign goes through 4 layers of review — platform rules, AI reasoning, technical checks, and optimization logic — before you see the report.

### 底部CTA
`See How It Works →`（链接到Watch Demo或展开更多）

---

## 第三屏：Sample Report

### 标题
**What You Get**

### 内容
直接展示一份真实报告的样子（不要介绍，不要解释）：

```
┌─ Campaign Review ──────────────────────────┐
│                                            │
│  Overall Score:  78/100                    │
│                                            │
│  Compliance      ████████░░  92            │
│  Creative        ███████░░░  74            │
│  Landing Page    ██████░░░░  68            │
│  Tracking        ████████░░  81            │
│                                            │
│  Optimization Level: High Priority         │
│                                            │
├────────────────────────────────────────────┤
│  Next Actions                              │
│                                            │
│  ① Fix pixel firing on checkout page       │
│  ② Reduce frequency — currently 4.2x       │
│  ③ Add UTM parameters to all ad links      │
└────────────────────────────────────────────┘
```

设计要求：
- 用卡片包裹，带阴影
- 分数用进度条可视化
- Next Actions用编号列表，像真实产品输出
- 不要放"Sample"水印，让用户感觉这就是真实结果

**动态效果**：
- 页面滚动到这一屏时，分数从0开始增长到最终值
- 进度条从0填充到对应长度
- Next Actions逐条淡入
- 整个动画持续2-3秒，不要太快

---

## 第四屏：Why AdsCraft Is Different

### 标题
**Why AdsCraft Is Different**

### 内容
四张卡片，2x2网格（移动端竖排）：

#### Card 1: Facebook Screenshot Analysis
- 图标：相机/截图图标
- 标题：Facebook Screenshot Analysis
- 描述：Upload your campaign screenshots. AI extracts structure, metrics, and targeting automatically — no manual data entry.

#### Card 2: TikTok 4-Layer Review Engine
- 图标：盾牌/检查图标
- 标题：TikTok 4-Layer Review Engine
- 描述：Every campaign goes through Compliance, Risk, AI, and Validation layers. Built on real TikTok advertising policies.
- 小字注释：The same 4-layer framework used by professional media agencies.

#### Card 3: Platform Rules
- 图标：规则/设置图标
- 标题：Platform-Specific Logic
- 描述：Facebook and TikTok follow different optimization rules. AdsCraft applies the right framework for each platform.

#### Card 4: Actionable Report
- 图标：清单/动作图标
- 标题：Actionable Report
- 描述：Not just problems — specific next actions with priority levels. Know exactly what to fix first.

### 设计要点
- 卡片有hover效果（轻微上浮+阴影加深）
- 不要写"Our AI is the best"之类的话
- 每张卡片的核心是"你得到什么"，不是"我们用了什么技术"

---

## 第五屏：Platform Entry（平台入口）

### 标题
**Choose Your Platform**

### 内容
左右两张大卡片（或三个，预留Google位置）：

#### 左侧：Facebook
- 图标：Facebook图标
- 标题：Facebook
- 描述：Upload campaign screenshots. Get a full analysis report.
- 按钮：`Analyze Facebook`

#### 右侧：TikTok
- 图标：TikTok图标
- 描述：Complete a guided campaign audit. Get platform-specific recommendations.
- 按钮：`Analyze TikTok`

### 设计要点
- 卡片用平台品牌色做细微区分（Facebook蓝、TikTok黑/红）
- 预留第三个空位，显示为灰色卡片+"Google Ads — Coming Soon"
- 按钮点击直接跳转到对应平台的诊断流程

---

## 第六屏：Features（精简版）

### 标题
**Everything You Need**

### 内容
四个功能，用图标+标题+一行描述的格式：

| 图标 | 标题 | 描述 |
|------|------|------|
| 🔍 | AI Analysis | Campaign structure and performance analyzed by AI reasoning |
| ✅ | Compliance Review | Check against platform advertising policies before launch |
| 📊 | Optimization Report | Prioritized recommendations with specific action items |
| 📥 | Report Export | Download your full report as PDF |

### 设计要点
- 简洁，不要超过4个
- 不要展开详细描述——用户已经在前面几屏理解了产品价值
- 这一屏的作用是"快速回顾"，不是"详细介绍"

---

## 第七屏：Pricing

### 顶部一句话
> Start for free. Upgrade when you need deeper recommendations.

### 内容
保持现有Creem方案不变。

### 设计要点
- 免费方案和付费方案并列展示
- 付费方案高亮标记（推荐/Popular）
- 每个方案下列出包含的功能
- CTA按钮直接链接到Creem支付

---

## 第八屏：FAQ

### 内容（5-6条，可折叠）

1. **What does AdsCraft analyze?**
   AdsCraft reviews your Facebook or TikTok ad campaigns — including campaign structure, targeting, creative assets, landing pages, and tracking setup.

2. **How does Facebook screenshot analysis work?**
   Upload screenshots of your campaign. Our AI extracts campaign structure, metrics, and targeting information automatically, then generates a review report.

3. **How is TikTok different from Facebook?**
   TikTok uses a guided audit format — you answer structured questions about your campaign, and AdsCraft applies TikTok-specific review rules across 4 layers: Compliance, Risk, AI, and Validation.

4. **Is there a free plan?**
   Yes. You can start with a free diagnosis. Upgrade when you need deeper recommendations and export features.

5. **Can I use AdsCraft before launching my ads?**
   Yes — that's the whole point. Review your campaign setup before spending budget, so you can fix issues before they cost you money.

6. **What platforms are supported?**
   Currently Facebook and TikTok. Google Ads is coming soon.

---

## 页脚
- Logo
- 链接：Features / Pricing / FAQ / Contact
- Copyright © 2026 AdsCraft
- Privacy Policy / Terms of Service

---

## 删除清单（从现有首页移除）

| 要删的内容 | 原因 |
|-----------|------|
| "AI Diagnosis" / "AI Marketing" / "AI Optimization" 作为Hero标题 | 没有记忆点，和别人一样 |
| "Our AI is powerful" 相关段落 | 没人信 |
| "Professional Analysis" | 太空 |
| "Best Marketing Tool" 相关描述 | 没有意义 |
| 所有插画/stock image | 用真实产品截图代替 |
| 过长的功能介绍段落 | 首页不是说明书 |
| 公司介绍/团队介绍 | 首页不是About页面 |

---

## 三个动态效果详细规格

### 动态1：Hero 产品模拟
- 位置：第一屏右侧
- 效果：模拟产品运行过程，逐行打勾
- 技术：Framer Motion，CSS动画即可
- 时长：单轮约4秒，循环播放
- 交互：纯展示，不需要点击

### 动态2：Report 分数动画
- 位置：第三屏（Sample Report）
- 触发：滚动到该屏时触发（Intersection Observer）
- 效果：
  - Overall Score 从0增长到78
  - 各维度进度条从0填充
  - Next Actions 逐条淡入（每条间隔0.3秒）
- 时长：总计2-3秒
- 只触发一次（不重复播放）

### 动态3（可选）：Engine 流程图
- 位置：第二屏
- 效果：节点依次点亮，数据从上游流向下游
- 如果开发量大可降级为静态图+hover交互
- 优先级低于动态1和动态2

---

## 执行优先级

### P0（必须）
- [ ] 新Hero文案+右侧产品模拟
- [ ] How AdsCraft Works 流程图
- [ ] Sample Report 展示（静态版至少要有）
- [ ] Why AdsCraft Is Different 四张卡片
- [ ] Platform Entry 两个按钮
- [ ] Pricing 保持现有

### P1（重要）
- [ ] Report 分数动画
- [ ] Hero 动态效果
- [ ] FAQ 折叠交互

### P2（锦上添花）
- [ ] Engine 流程图动态效果
- [ ] Platform卡片hover高级效果

---

## 给扣子的执行说明

1. 首页整体用React + Tailwind CSS
2. 动画用 Framer Motion（`framer-motion`）
3. 响应式断点：mobile < 768px, tablet 768-1024px, desktop > 1024px
4. 所有文案严格按本文档执行，不要自行修改措辞
5. 配色沿用现有品牌色，不要大改
6. 导航栏和页脚保持现有逻辑（登录/注册按钮位置不变）
7. 每个平台的入口按钮链接到现有诊断流程，不要改路由

---

> 本内容由 Coze AI 生成，请遵循相关法律法规及《人工智能生成合成内容标识办法》使用与传播。

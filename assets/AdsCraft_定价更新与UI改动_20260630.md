---
AIGC:
    Label: "1"
    ContentProducer: 001191110102MACQD9K64018705
    ProduceID: 7634029171441664308-data_volume/files/所有对话/主对话/上传给扣子/AdsCraft_定价更新与UI改动_20260630.md
    ReservedCode1: ""
    ContentPropagator: 001191110102MACQD9K64028705
    PropagateID: 3476033405197864#1782823533016
    ReservedCode2: ""
---
# AdsCraft 定价体系更新 & UI改动

## 一、新增顶部导航入口
- 在现有导航（Logo | Overview | Help | Dashboard | Logout | EN/中）中插入 Pricing 入口
- 最终导航结构：`Logo | Overview | Pricing | Help | Dashboard | Logout | EN/中`
- Pricing 入口链接到独立的 Pricing 页面

---

## 二、首页改动
- 去除旧版 Facebook 专属价格表（4档：Local Service / Retailer / Manufacturer / Brand）
- 去除旧版 TikTok 专属价格表（3档：Local Service / Website Conversion / Brand Awareness）
- 首页展示新的统一三档定价（Free / Pro / Pro+），与 Pricing 页面保持一致
- 首页价格表仅做展示，无订阅/升级按钮；用户通过顶部导航 Pricing 入口进入详情页完成订阅

---

## 三、Pricing 页面（新增独立页面）

### 新定价体系（统一，不按平台分）

| Plan | Price | Review 次数/月 | Optimization Package | AI 生成 | 新功能优先体验 |
|------|-------|--------------|---------------------|---------|--------------|
| Free | $0 | 3次 | ❌ | ❌ | ❌ |
| Pro | $19.9/月 | 20次 | ✅ | ✅ | ❌ |
| Pro+ | $24.9/月 | 无限 | ✅ | ✅ | ✅ |

### 功能说明

**Pricing 页面订阅按钮：**
- Free 栏：无按钮（免费直接使用）
- Pro 栏：[Subscribe to Pro] 按钮 → https://www.creem.io/payment/prod_77H9iTdPoURp4C2Le1xhE8
- Pro+ 栏：[Subscribe to Pro+] 按钮 → https://www.creem.io/payment/prod_8D7PXxYlpaNfTQ9MgMoQ2
- 中文模式下，每个付费栏额外展示微信支付按钮，弹窗显示人民币价格和功能说明

**Free（免费发现）：**
- Upload & Screenshot
- Health Score
- Top Issues & Evidence
- Priority Ranking
- 优化建议预览：展示前 1-2 条建议（含标题和说明），下方锁定区域显示还有更多建议，升级查看完整优化方案
- 每月 3 次 Review
- 升级按钮引导查看完整优化建议

**Free 用户体验示意：**
```
Issue: CTR Low
Evidence: CTR 0.8% vs 行业 2.1%

建议 1: Generate New Headlines
  - Reason: CTR is below benchmark.
  - Impact: High

建议 2: Generate Primary Text
  - Reason: Current copy lacks urgency.
  - Impact: Medium

━━━━━━━━━━━━━━━━━━━━━━━━━━
🔒 还有 3 条优化建议，升级查看完整方案

  Pro $19.9/月                    Pro+ $24.9/月
  20次/月 Review                  无限 Review
  完整优化建议 + AI 生成           完整优化建议 + AI 生成 + 新功能优先

  [Upgrade to Pro]               [Upgrade to Pro+]
```

**Pro 用户（次数用完）体验示意：**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━
本月 Review 次数已用完，升级 Pro+ 继续优化

  Pro+ $24.9/月
  无限 Review + 新功能优先体验

  [Upgrade to Pro+]
```

**Pro（解决问题）：**
- 全部 Free 功能
- Optimization Package 完整解锁（含所有建议详情）
- AI Headline / Primary Text / CTA 生成
- Creative Suggestions
- 每月 20 次 Review

**Pro+（无限优化）：**
- 全部 Pro 功能
- 无限 Review 次数
- 新功能优先体验

---

## 四、Creem 支付链接

| Plan | Creem 链接 |
|------|-----------|
| Pro | https://www.creem.io/payment/prod_77H9iTdPoURp4C2Le1xhE8 |
| Pro+ | https://www.creem.io/payment/prod_8D7PXxYlpaNfTQ9MgMoQ2 |

- Pricing 页面的 Pro / Pro+ "Upgrade" 按钮链接到对应 Creem 链接
- 三平台分析结果页的升级按钮同样链接到对应 Creem 链接

---

## 五、清除旧数据

### 清除内容
- 旧的按平台分档的 7 档价格表（FB 4档 + TK 3档）
- 旧的次数统计逻辑（FB: 15/40/80次，TK: 20/50/100次）

### 新额度逻辑
- Free：每月 3 次 Review（按月重置，非按天）
- Pro：每月 20 次 Review
- Pro+：无限制
- 次数用完后显示升级按钮，引导用户升级到更高套餐

---

### 升级按钮逻辑

**Pricing 页面：**
- 所有用户看到相同内容，统一展示 Free / Pro / Pro+ 三档，不做区别展示

**升级弹窗中的订阅提示：**
- ⚠️ 仅 Pro → Pro+ 升级时展示以下提示：
  > 升级后，当前 Pro 订阅将从今日起重新计算，Pro+ 订阅从升级当天开始，剩余 Pro 次数将清零，替换为无限次数。
- Free → Pro、Free → Pro+ 不展示此提示

**升级按钮展示逻辑：**

**场景 1：未订阅用户（Free）**
- 分析结果页中：Optimization Package 区域，展示前 1-2 条建议，下方锁定 + 升级区域（展示 Pro 和 Pro+ 两个价格及说明）
- 分析结果页底部：再展示一次升级区域（Pro + Pro+，含价格、次数、功能说明）
- Pro 按钮 → https://www.creem.io/payment/prod_77H9iTdPoURp4C2Le1xhE8
- Pro+ 按钮 → https://www.creem.io/payment/prod_8D7PXxYlpaNfTQ9MgMoQ2

**场景 2：Pro 用户，次数未用完**
- 不展示任何升级按钮，正常显示完整优化方案

**场景 3：Pro 用户，当月次数用完**
- 分析结果页底部展示升级区域：仅展示 Pro+ $24.9（无限 Review + 新功能优先体验）
- Pro+ 按钮 → https://www.creem.io/payment/prod_8D7PXxYlpaNfTQ9MgMoQ2

**场景 4：Pro+ 用户**
- 不展示任何升级按钮，无限使用

---

## 七、中文模式适配

### 人民币价格显示
- $19.9/月 → ¥139/月
- $24.9/月 → ¥179/月
- （人民币价格需确认，此处为建议值）

### 支付按钮展示逻辑

**英文模式：**
- 仅展示 Creem 支付按钮（1 个）
- 价格显示：$19.9 / $24.9

**中文模式：**
- 展示两种支付方式，价格分别显示：
  - 微信支付按钮 → ¥139 / ¥179（人民币）
  - Creem 支付按钮 → $19.9 / $24.9（美元）
- ⚠️ **严禁混淆**：微信支付只显示人民币，Creem 只显示美元，不能混用

### 微信支付
- 中文模式下，所有升级按钮区域同时展示微信支付入口
- 支付方式切换仅影响按钮展示，套餐内容和价格不变
- 点击微信支付按钮后，弹出支付弹窗：
  - 套餐名称 + 人民币价格
  - 确认支付按钮 + 微信支付二维码
  - 不重复展示功能说明（Pricing 页已有）

**微信支付弹窗示意：**
```
┌─────────────────────────┐
│    AdsCraft Pro          │
│      ¥139/月             │
│                          │
│     [确认支付]           │
│   (弹出微信二维码)       │
└─────────────────────────┘
```

---

## 执行清单

- [ ] 顶部导航添加 Pricing 入口
- [ ] 新建独立 Pricing 页面（含三档展示 + Creem 链接）
- [ ] 首页去除 TikTok 价格表
- [ ] 清除旧 7 档价格表和旧次数统计逻辑
- [ ] 建立新额度逻辑（Free 3次/月，Pro 20次/月，Pro+ 无限）
- [ ] 三平台分析结果页配置升级按钮（Optimization Package 锁定处）
- [ ] 中文模式：人民币价格显示 + 微信支付页面

---

> 本内容由 Coze AI 生成，请遵循相关法律法规及《人工智能生成合成内容标识办法》使用与传播。

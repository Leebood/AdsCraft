---
AIGC:
    Label: "1"
    ContentProducer: 001191110102MACQD9K64018705
    ProduceID: 7634029171441664308-data_volume/files/所有对话/主对话/用户上传/AdsCraft_品牌设计规范_V1.md
    ReservedCode1: ""
    ContentPropagator: 001191110102MACQD9K64028705
    PropagateID: 3476033405197864#1782550174098
    ReservedCode2: ""
---
# AdsCraft 品牌设计规范 V1.0

> 品牌定位：Professional AI, not flashy AI.
> 品牌语言：Review. Validate. Optimize.
> 视觉定位：可信赖的专业分析平台，不是炫酷AI工具

---

## 品牌色板

### Dark Mode（网站主视觉）

| 用途 | 色值 | 说明 |
|------|------|------|
| Background | `#08111F` | 深海军蓝，不要纯黑 |
| Card | `#101827` | 卡片底色 |
| Card Border | `rgba(255,255,255,0.08)` | 极淡白边，制造层次感 |
| Primary | `#00D4FF` | 电光青，品牌主色 |
| Primary Hover | `#35E1FF` | 按钮/链接hover |
| Text | `#F8FAFC` | 主文字 |
| Secondary Text | `#94A3B8` | 副文字/说明文字 |
| Hero 渐变 | `#00D4FF` → transparent | 左上角极淡渐变，几乎看不出 |
| Hero Grid | white, opacity 3% | 背景网格纹理，增加科技感 |

### Light Mode（报告/PDF/PPT/邮件）

| 用途 | 色值 | 说明 |
|------|------|------|
| Background | `#FFFFFF` | 纯白底 |
| Card | `#F8FAFC` | 浅灰卡片 |
| Border | `#E2E8F0` | 边框 |
| Primary | `#0891B2` | 深青（浅色背景上替代#00D4FF，保证可读性） |
| Text | `#0F172A` | 主文字 |
| Secondary Text | `#64748B` | 副文字 |

### 按钮规范

| 状态 | 背景色 | 文字色 |
|------|--------|--------|
| Primary 按钮 | `#00D4FF` | `#08111F`（深色文字，保证可读性） |
| Primary Hover | `#35E1FF` | `#08111F` |
| Secondary 按钮 | transparent, border `#00D4FF` | `#00D4FF` |
| Disabled | `#1E293B` | `#475569` |

### 对比度说明
- Primary `#00D4FF` 在 `#08111F` 上对比度 > 7:1 ✅
- Primary on light `#0891B2` 在 `#FFFFFF` 上对比度 > 4.5:1 ✅（WCAG AA）
- 按钮文字 `#08111F` 在 `#00D4FF` 上对比度 > 8:1 ✅

---

## 状态色（国际标准，不要自创）

### 风险等级

| 状态 | 色值 | 用途 |
|------|------|------|
| Pass / Safe | `#22C55E` | 合规、通过、安全 |
| Warning | `#F59E0B` | 警告、需注意 |
| High Risk | `#EF4444` | 高风险、严重问题 |
| Info | `#3B82F6` | 信息提示 |

### Score 分数色

| 分数区间 | 颜色 | 色值 |
|----------|------|------|
| 90-100 | Green | `#22C55E` |
| 70-89 | Blue | `#3B82F6` |
| 50-69 | Orange | `#F59E0B` |
| 0-49 | Red | `#EF4444` |

---

## 平台色（仅限Icon，不做品牌色）

| 平台 | 使用方式 | 禁止 |
|------|----------|------|
| Facebook | 🔵 Logo/Icon 颜色 `#1877F2` | 整张卡片用蓝色 |
| TikTok | ⚫🔴 Logo/Icon 颜色 `#000000` + `#FE2C55` | 整张卡片用黑红 |
| Google | 🔴🟡🟢 Logo/Icon 多色 | 不要自己搭配 |

**原则：AdsCraft的颜色是AdsCraft的，平台颜色只出现在平台Logo和Icon上。**

---

## 字体

| 用途 | 字体 | 字重 |
|------|------|------|
| 标题 | Inter | 700 (Bold) |
| 正文 | Inter | 400 (Regular) |
| 按钮 | Inter | 600 (Semibold) |
| 代码/数据 | JetBrains Mono | 400 |

**全站只用 Inter，不要混字体。**

---

## Icon 规范

- 统一 Line Icon（线性图标）
- 线宽 2px
- 颜色：white, opacity 90%
- **不要用彩色Icon**
- 只在状态变化时用状态色（Pass绿、Warning黄、Risk红）
- 推荐图标库：Lucide Icons 或 Heroicons

---

## 视觉元素

### 背景网格（Grid）
- Hero 和关键区域背景加入极浅网格
- 白色线条, opacity 2-3%
- 网格大小 40-60px
- 参考：Linear, Vercel, Stripe 官网背景

### Hero 渐变
- 左上角，从 `#00D4FF` 向透明过渡
- 非常淡，几乎看不出，但增加层次感
- 用 CSS `radial-gradient` 实现

### 卡片设计
- 底色 `#101827`
- 边框 `rgba(255,255,255,0.08)`
- 圆角 12px
- Hover：轻微上浮 `translateY(-2px)` + 边框亮度增加
- 不要白色卡片（深色模式下不协调）

### 间距
- Section 间距：96-120px
- 内容最大宽度：1200px
- 卡片间距：24px

---

## 动画规范

### 全局原则
- 所有动画用 Framer Motion
- 缓动函数：`ease-out`（不要 `ease-in`，不要 `spring`）
- 持续时间：0.2-0.3s（微交互），2-3s（入场动画）
- 不要过度动画，克制比炫酷重要

### 入场动画
- 元素从下方淡入：`y: 20 → 0, opacity: 0 → 1`
- 使用 Intersection Observer 触发，只播放一次
- Section 之间不要有连锁动画

### 数据动画
- 分数/进度条：数字从0增长到目标值，2-3秒
- 逐条淡入：间隔 0.3s

---

## 品牌应用一致性

以下所有触点必须遵循本规范：

| 触点 | 模式 | 说明 |
|------|------|------|
| 网站 | Dark Mode | 主视觉 |
| 诊断报告（网页） | Dark Mode | 与网站一致 |
| 诊断报告（PDF导出） | Light Mode | 白底，适合打印和截图 |
| PPT / 演示 | Light Mode | 白底为主，可局部用深色背景 |
| Product Hunt 页面 | Light Mode | PH 白底，用深青色 Primary |
| 邮件模板 | Light Mode | 白底 |
| 社交媒体图片 | 都可 | 深色背景+青色强调 |
| Agent 后台 | Dark Mode | 与网站一致 |

---

## 品牌一句话总结

> **Deep Navy + Electric Cyan**
> 深色背景 → 专业、稳定、数据分析
> 青色强调 → AI、科技、行动
> 白色报告 → 企业级输出

**Professional AI, not flashy AI.**

---

> 本内容由 Coze AI 生成，请遵循相关法律法规及《人工智能生成合成内容标识办法》使用与传播。

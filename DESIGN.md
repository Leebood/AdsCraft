# DESIGN.md

## 产品定位
AdsCraft - Campaign Review Platform
品牌语言：Review. Validate. Optimize.
定位：Professional AI, not flashy AI.

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
| Hero 渐变 | `#00D4FF` → transparent | 左上角极淡渐变 |
| Hero Grid | white, opacity 3% | 背景网格纹理 |

### Light Mode（报告/PDF/PPT/邮件）
| 用途 | 色值 | 说明 |
|------|------|------|
| Background | `#FFFFFF` | 纯白底 |
| Card | `#F8FAFC` | 浅灰卡片 |
| Border | `#E2E8F0` | 边框 |
| Primary | `#0891B2` | 深青（浅色背景上替代#00D4FF） |
| Text | `#0F172A` | 主文字 |
| Secondary Text | `#64748B` | 副文字 |

### 按钮规范
| 状态 | 背景色 | 文字色 |
|------|--------|--------|
| Primary 按钮 | `#00D4FF` | `#08111F`（深色文字） |
| Primary Hover | `#35E1FF` | `#08111F` |
| Secondary 按钮 | transparent, border `#00D4FF` | `#00D4FF` |
| Disabled | `#1E293B` | `#475569` |

## 状态色（国际标准）
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

## 平台色（仅限Icon）
| 平台 | 使用方式 | 禁止 |
|------|----------|------|
| Facebook | Logo/Icon 颜色 `#1877F2` | 整张卡片用蓝色 |
| TikTok | Logo/Icon 颜色 `#000000` + `#FE2C55` | 整张卡片用黑红 |
| Google | Logo/Icon 多色 | 不要自己搭配 |

## 字体
| 用途 | 字体 | 字重 |
|------|------|------|
| 标题 | Inter | 700 (Bold) |
| 正文 | Inter | 400 (Regular) |
| 按钮 | Inter | 600 (Semibold) |
| 代码/数据 | JetBrains Mono | 400 |

全站只用 Inter，不要混字体。

## Icon 规范
- 统一 Line Icon（线性图标）
- 线宽 2px
- 颜色：white, opacity 90%
- 不要用彩色Icon
- 只在状态变化时用状态色
- 推荐图标库：Lucide Icons

## 视觉元素

### 背景网格（Grid）
- Hero 和关键区域背景加入极浅网格
- 白色线条, opacity 2-3%
- 网格大小 40-60px

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

## 动画规范

### 全局原则
- 所有动画用 Framer Motion
- 缓动函数：`ease-out`（禁止 `ease-in`、`spring`）
- 微交互动画：0.2-0.3s
- 入场动画：2-3s
- 触发方式：Intersection Observer，进入视口时触发
- 重复策略：营销区域只触发一次；用户操作结果每次都触发

### 动画1：Hero 产品模拟
- 位置：首页第一屏右侧
- 效果：模拟产品运行过程，逐行打勾
- 内容序列：
  - 第一轮（Facebook）：Screenshot Uploaded → Reading Campaign → Checking Metrics → Building Report
  - 第二轮（TikTok）：TikTok 6-Step Audit → Compliance → Creative → Landing Page → Tracking
- 技术细节：
  - 每行出现：`opacity: 0→1, y: 5→0`，duration 0.3s
  - 打勾动画：SVG path `stroke-dashoffset` 从完整到0，duration 0.3s
  - 单轮总时长：约4秒
  - 两轮间隔：1.5秒
  - 循环播放，无限循环
- 交互：纯展示，不需要点击

### 动画2：Score 分数动画
- 位置：首页第三屏（Sample Report）+ 诊断结果页
- 效果：
  - Overall Score 从 0 增长到目标值
  - 5个维度进度条依次填充，间隔 0.15s
  - Next Actions 逐条淡入，间隔 0.3s
- 触发条件：
  - 首页：Intersection Observer 进入视口，只触发一次
  - 诊断结果页：报告数据加载完成，每次都播放

### 动画3：卡片 Hover（全局）
- 适用：所有 Card 组件
- 效果：
  - `translateY: 0 → -4px`（轻微上浮）
  - `box-shadow` 加深
  - `border-color: rgba(255,255,255,0.08) → rgba(255,255,255,0.15)`
  - duration: 0.2s, ease-out

### 动画4：Section 入场（全局）
- 效果：`opacity: 0→1, y: 30→0`，duration 0.6s, ease-out
- 触发：Intersection Observer，`threshold: 0.15`
- 每个 Section 只触发一次

### 动画5：按钮交互
- Primary 按钮：Hover `bg #35E1FF, scale 1.02`，Active `scale 0.98`
- Secondary 按钮：Hover `bg rgba(0,212,255,0.1)`，Active `scale 0.98`

### 禁止的动画
- Spring 弹性动画
- 彩虹色渐变
- 页面转场动画
- 全屏 spinner（用骨架屏代替）
- Parallax 滚动视差

## 评分框架

### 5维度通用框架（所有平台共用）
| # | 维度 | 英文 | 核心问题 | 图标 |
|---|------|------|----------|------|
| 1 | 合规 | Compliance | 能不能投出去？ | shield-check |
| 2 | 投放策略 | Campaign Strategy | 钱花得对不对？ | target |
| 3 | 素材 | Creative | 素材够不够好？ | image |
| 4 | 落地页 | Landing Page | 点了之后转不转化？ | layout |
| 5 | 追踪 | Tracking | 数据准不准？ | activity |

### 分数规则
- 每个维度 0-100 分
- Overall Score = 5个维度的加权平均（默认等权重）
- 分数颜色：90+ 绿 / 70-89 蓝 / 50-69 橙 / <50 红
- Next Actions 按优先级排序：High → Medium → Low

### Next Actions 格式
```
① [High] 具体动作
② [Medium] 具体动作
③ [Low] 具体动作
```
- 最多显示 5 条
- High 优先级永远排最前
- 每条必须是可执行的具体动作

## 首页结构（8屏）
1. **Hero** - 标题 + 右侧产品动态模拟
2. **How AdsCraft Works** - 横向流程图
3. **Sample Report** - 报告展示 + 5维度分数动画
4. **Why AdsCraft Is Different** - 4张卡片
5. **Platform Entry** - Facebook/TikTok 入口
6. **Features** - 精简版功能列表
7. **Pricing** - 保持现有
8. **FAQ** - 折叠交互

## 设计禁忌
- ✅ 深海军蓝背景，不要纯黑或渐变蓝
- ✅ 电光青主色，不要其他颜色
- ✅ 线性图标，不要彩色Icon
- ✅ Inter字体，不要混字体
- ✅ 真实产品截图，不要插画/stock photo
- ✅ 克制动画，不要过度炫酷
- ❌ 不要"AI"作为主语
- ❌ 不要"Our AI is the best"之类的话
- ❌ 不要白色卡片（深色模式下）
- ❌ 不要平台色作为卡片主色

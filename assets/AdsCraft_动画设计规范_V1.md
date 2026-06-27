---
AIGC:
    Label: "1"
    ContentProducer: 001191110102MACQD9K64018705
    ProduceID: 7634029171441664308-data_volume/files/所有对话/主对话/用户上传/AdsCraft_动画设计规范_V1.md
    ReservedCode1: ""
    ContentPropagator: 001191110102MACQD9K64028705
    PropagateID: 3476033405197864#1782551699197
    ReservedCode2: ""
---
# AdsCraft 动画设计规范 V1.0

> 依赖库：Framer Motion（React）
> 全局缓动：ease-out
> 核心原则：克制比炫酷重要

---

## 全局规则

| 属性 | 值 |
|------|-----|
| 缓动函数 | `ease-out`（禁止 `ease-in`、`spring`） |
| 微交互动画 | 0.2-0.3s |
| 入场动画 | 2-3s |
| 触发方式 | Intersection Observer，进入视口时触发 |
| 重复策略 | 营销区域只触发一次；用户操作结果每次都触发 |
| 实现库 | `framer-motion` |

---

## 动画1：Hero 产品模拟

### 位置
首页第一屏右侧

### 效果
模拟产品运行过程，逐行打勾，展示"AI正在工作"的感觉。

### 内容序列
第一轮（Facebook）：
```
📷 Screenshot Uploaded        → 淡入
✓ Reading Campaign            → 0.5s后出现，带打勾动画
✓ Checking Metrics            → 0.5s后出现
✓ Building Report             → 0.5s后出现
```

第二轮（TikTok）：
```
TikTok 6-Step Audit           → 淡入
✓ Compliance                  → 0.5s后出现
✓ Creative                    → 0.5s后出现
✓ Landing Page                → 0.5s后出现
✓ Tracking                    → 0.5s后出现
```

### 技术细节
- 每行出现：`opacity: 0→1, y: 5→0`，duration 0.3s
- 打勾动画：SVG path `stroke-dashoffset` 从完整到0，duration 0.3s
- 单轮总时长：约4秒
- 两轮间隔：1.5秒
- 循环播放，无限循环
- 第二轮开始时，第一轮内容淡出（0.3s）

### 交互
纯展示，不需要点击。用户鼠标悬停不暂停。

---

## 动画2：Score 分数动画

### 位置
- 首页第三屏（Sample Report）
- Facebook 诊断结果页（`/result/facebook`）
- TikTok 诊断结果页（`/result/tiktok`）

### 共用组件
`<ScoreAnimation scores={data} />`
- 首页传入 mock 数据
- 诊断结果页传入真实计算结果

### 效果

#### 阶段1：Overall Score（0-1.5s）
- 数字从 0 增长到目标值（如 78）
- 用 `requestAnimationFrame` 做数字滚动
- 缓动：ease-out，数字增长先快后慢
- 同时圆形进度环从 0° 填充到对应角度

#### 阶段2：维度进度条（0.5-2.5s，与阶段1有重叠）
- 5个维度依次开始填充，间隔 0.15s
- 填充顺序：Compliance → Campaign Strategy → Creative → Landing Page → Tracking
- 进度条颜色根据分数自动匹配（绿/蓝/橙/红）
- 每个维度分数出现在进度条右侧

#### 阶段3：Next Actions 逐条出现（1.5-3.5s）
- 每条 Action 从下方淡入：`opacity: 0→1, y: 10→0`
- 间隔 0.3s
- 编号 ①②③④ 先出现，描述文字紧随
- Next Actions 按优先级排序（High → Medium → Low）

### 触发条件
| 场景 | 触发方式 | 重复策略 |
|------|----------|----------|
| 首页 Sample Report | Intersection Observer 进入视口 | 只触发一次 |
| FB 诊断结果 | 报告数据加载完成 | 每次诊断完成都播放 |
| TikTok 诊断结果 | 报告数据加载完成 | 每次诊断完成都播放 |

### 分数→颜色映射
```javascript
const scoreColor = (score) => {
  if (score >= 90) return '#22C55E'  // Green
  if (score >= 70) return '#3B82F6'  // Blue
  if (score >= 50) return '#F59E0B'  // Orange
  return '#EF4444'                    // Red
}
```

### 评分维度（5维度通用框架）
```javascript
const dimensions = [
  { key: 'compliance',        label: 'Compliance',        icon: 'shield-check' },
  { key: 'campaignStrategy',  label: 'Campaign Strategy', icon: 'target' },
  { key: 'creative',          label: 'Creative',          icon: 'image' },
  { key: 'landingPage',       label: 'Landing Page',      icon: 'layout' },
  { key: 'tracking',          label: 'Tracking',          icon: 'activity' },
]
```

---

## 动画3：Engine 流程图（可选）

### 位置
首页第二屏

### 效果（完整版）
6个节点依次点亮，数据从左向右流动：
```
Campaign → Platform Rules → AI Review → Technical Validation → Optimization Engine → Action Plan
```

- 节点初始状态：暗色（`#1E293B`），边框暗淡
- 依次点亮：边框变为 `#00D4FF`，内部图标从灰变白
- 间隔：每个节点间隔 0.3s
- 连接线：点亮节点后，到下一个节点的箭头出现虚线流动效果
- 全部点亮后保持高亮状态

### 降级版（开发量小时）
- 静态流程图，所有节点常亮
- Hover 单个节点时：该节点边框变亮 `#00D4FF`，下方展开说明文字
- 不实现依次点亮效果

### 优先级
**低于动画1和动画2。** 如果开发时间紧张，先用降级版。

---

## 动画4：卡片 Hover（全局）

### 适用
所有 Card 组件（Why Different 四张卡、Platform 入口卡、Feature 卡）

### 效果
```
默认 → Hover：
  - translateY: 0 → -4px（轻微上浮）
  - box-shadow: 加深
  - border-color: rgba(255,255,255,0.08) → rgba(255,255,255,0.15)
  - duration: 0.2s, ease-out
```

### 技术
```jsx
<motion.div
  whileHover={{ y: -4, borderColor: 'rgba(255,255,255,0.15)' }}
  transition={{ duration: 0.2, ease: 'easeOut' }}
>
```

---

## 动画5：Section 入场（全局）

### 适用
每个 Section（每屏内容）

### 效果
```
进入视口时：
  - opacity: 0 → 1
  - y: 30 → 0
  - duration: 0.6s, ease-out
```

### 触发
Intersection Observer，`threshold: 0.15`（元素15%进入视口时触发）

### 规则
- 每个 Section 只触发一次
- 子元素可以有 stagger 效果（间隔 0.1s），但不要过度
- 首页只触发一次；诊断结果页每次数据加载后触发

### 技术
```jsx
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: 'easeOut' }
  }
}

<motion.section
  variants={fadeInUp}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.15 }}
>
```

---

## 动画6：按钮交互

### Primary 按钮
```
默认：  bg #00D4FF, text #08111F
Hover： bg #35E1FF, scale 1.02, duration 0.2s
Active：scale 0.98, duration 0.1s
```

### Secondary 按钮（描边）
```
默认：  border #00D4FF, text #00D4FF, bg transparent
Hover： bg rgba(0,212,255,0.1), duration 0.2s
Active：scale 0.98, duration 0.1s
```

---

## 不要做的动画

| 禁止 | 原因 |
|------|------|
| Spring 弹性动画 | 太活泼，不符合"专业分析"定位 |
| 彩虹色渐变 | 廉价感 |
| 页面转场动画 | 拖慢节奏，用户不想等 |
| 加载时全屏 spinner | 用骨架屏（Skeleton）代替 |
| 无限旋转/弹跳 | 分散注意力 |
| Parallax 滚动视差 | 过度设计 |

---

## 性能要求

- 所有动画使用 `transform` 和 `opacity`，不触发 reflow
- 动画元素加 `will-change: transform`
- 移动端减少动画复杂度：
  - Hero 模拟简化为静态展示
  - Engine 流程图用降级版
  - Score 动画保留（核心体验）
- Lighthouse Animation 评分目标 > 90

---

## 组件清单

| 组件名 | 用途 | 使用位置 |
|--------|------|----------|
| `<HeroSimulation />` | 产品运行模拟 | 首页第一屏 |
| `<ScoreAnimation />` | 分数+进度条+Actions | 首页+FB结果+TK结果 |
| `<EngineFlow />` | 流程图依次点亮 | 首页第二屏 |
| `<AnimatedCard />` | 卡片hover效果 | 全局卡片 |
| `<FadeInSection />` | Section入场 | 全局每屏 |
| `<ButtonAnimated />` | 按钮交互 | 全局按钮 |

---

> 本内容由 Coze AI 生成，请遵循相关法律法规及《人工智能生成合成内容标识办法》使用与传播。

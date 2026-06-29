---
AIGC:
    Label: "1"
    ContentProducer: 001191110102MACQD9K64018705
    ProduceID: 7634029171441664308-data_volume/files/所有对话/主对话/上传给扣子/ARS.md
    ReservedCode1: ""
    ContentPropagator: 001191110102MACQD9K64028705
    PropagateID: 3476033405197864#1782759373783
    ReservedCode2: ""
---
# AdsCraft Review Standard (ARS)

> 版本：v1
> 更新日期：2026-06-30
> 职责：定义每个平台的审查规则（Rules）、基准值（Benchmarks）、证据要求（Evidence Requirements）

---

## 1. ARS 概述

ARS（AdsCraft Review Standard）是 AdsCraft 的诊断标准和规则库，是核心资产。

**结构：**
```
ARS
├── Facebook ARS
│   ├── Rules
│   ├── Benchmarks
│   └── Evidence Requirements
├── TikTok ARS
│   ├── Rules (4-Layer)
│   ├── Benchmarks
│   └── Evidence Requirements
├── Google ARS（未来）
└── LinkedIn ARS（未来）
```

**关键原则：**
- 每个平台的 ARS 独立维护
- ARS 是 AdsCraft 的核心资产，不依赖外部
- 即使换 LLM（GPT → Claude → Gemini），ARS 不变

---

## 2. Facebook ARS

### 2.1 Facebook Rules（规则库）

#### 2.1.1 CTR（点击率）规则

| Rule ID | Condition | Status | Severity | Recommendation |
|---------|-----------|--------|----------|----------------|
| FB-CTR-001 | CTR < 0.5% | Critical | High | Urgent: Review creative and audience targeting immediately |
| FB-CTR-002 | 0.5% ≤ CTR < 1.0% | Warning | Medium | Review creative and audience targeting |
| FB-CTR-003 | 1.0% ≤ CTR < 1.5% | Info | Low | Below benchmark, monitor closely |
| FB-CTR-004 | CTR ≥ 1.5% | Good | None | On track, continue monitoring |

**诊断逻辑：**
- CTR 低于 1% 表示创意不够吸引人或受众不匹配
- CTR 低于 0.5% 表示严重问题，需要立即优化

---

#### 2.1.2 CPC（单次点击成本）规则

| Rule ID | Condition | Status | Severity | Recommendation |
|---------|-----------|--------|----------|----------------|
| FB-CPC-001 | CPC > Benchmark × 2.0 | Critical | High | Urgent: Optimize bidding strategy or audience |
| FB-CPC-002 | Benchmark × 1.5 < CPC ≤ Benchmark × 2.0 | Warning | Medium | Review bidding strategy and audience quality |
| FB-CPC-003 | Benchmark × 1.0 < CPC ≤ Benchmark × 1.5 | Info | Low | Slightly above benchmark, monitor |
| FB-CPC-004 | CPC ≤ Benchmark | Good | None | On track |

**诊断逻辑：**
- CPC 高于基准值 1.5 倍以上表示成本过高
- 需要对比行业基准值（见 Benchmarks）

---

#### 2.1.3 Frequency（频次）规则

| Rule ID | Condition | Status | Severity | Recommendation |
|---------|-----------|--------|----------|----------------|
| FB-FREQ-001 | Frequency > 3.0 | Critical | High | Urgent: Ad fatigue detected, refresh creative immediately |
| FB-FREQ-002 | 2.0 < Frequency ≤ 3.0 | Warning | Medium | Ad fatigue risk, consider refreshing creative |
| FB-FREQ-003 | 1.5 < Frequency ≤ 2.0 | Info | Low | Monitor frequency trend |
| FB-FREQ-004 | Frequency ≤ 1.5 | Good | None | Healthy frequency |

**诊断逻辑：**
- Frequency > 2.0 表示用户看到广告次数过多，可能产生疲劳
- Frequency > 3.0 表示严重疲劳，CTR 和 ROAS 会明显下降

---

#### 2.1.4 ROAS（广告支出回报率）规则

| Rule ID | Condition | Status | Severity | Recommendation |
|---------|-----------|--------|----------|----------------|
| FB-ROAS-001 | ROAS < Target × 0.5 | Critical | High | Urgent: Campaign not profitable, pause or major optimization |
| FB-ROAS-002 | Target × 0.5 ≤ ROAS < Target | Warning | Medium | Below target, optimize landing page and creative |
| FB-ROAS-003 | Target ≤ ROAS < Target × 1.5 | Good | None | On target |
| FB-ROAS-004 | ROAS ≥ Target × 1.5 | Excellent | None | Excellent performance, consider scaling |

**诊断逻辑：**
- ROAS 低于目标值 50% 表示广告不盈利
- Target 通常是 2.0x 或 3.0x（根据行业和业务）

---

#### 2.1.5 Cost per Result（单次结果成本）规则

| Rule ID | Condition | Status | Severity | Recommendation |
|---------|-----------|--------|----------|----------------|
| FB-CPR-001 | CPR > Target × 2.0 | Critical | High | Urgent: Cost too high, optimize or pause |
| FB-CPR-002 | Target × 1.5 < CPR ≤ Target × 2.0 | Warning | Medium | Above target, review funnel |
| FB-CPR-003 | Target × 1.0 < CPR ≤ Target × 1.5 | Info | Low | Slightly above target |
| FB-CPR-004 | CPR ≤ Target | Good | None | On target |

**诊断逻辑：**
- CPR 高于目标值 2 倍以上表示成本过高
- 需要对比目标 CPR（根据业务设定）

---

#### 2.1.6 Spend（花费）规则

| Rule ID | Condition | Status | Severity | Recommendation |
|---------|-----------|--------|----------|----------------|
| FB-SPEND-001 | Spend < $50 | Warning | Medium | Insufficient data, wait for more spend |
| FB-SPEND-002 | $50 ≤ Spend < $100 | Info | Low | Limited data, results may not be reliable |
| FB-SPEND-003 | Spend ≥ $100 | Good | None | Sufficient data for analysis |

**诊断逻辑：**
- 花费低于 $50 表示数据不足，分析结果不可靠
- 建议等待更多花费后再做诊断

---

#### 2.1.7 Results（结果数）规则

| Rule ID | Condition | Status | Severity | Recommendation |
|---------|-----------|--------|----------|----------------|
| FB-RESULT-001 | Results < 50 | Warning | Medium | Learning phase, wait for more results |
| FB-RESULT-002 | 50 ≤ Results < 100 | Info | Low | Early data, monitor closely |
| FB-RESULT-003 | Results ≥ 100 | Good | None | Sufficient data for analysis |

**诊断逻辑：**
- 结果数低于 50 表示处于学习阶段，数据不可靠
- Facebook 通常需要 50-100 个转化才能稳定优化

---

#### 2.1.8 CPM（千次展示成本）规则

| Rule ID | Condition | Status | Severity | Recommendation |
|---------|-----------|--------|----------|----------------|
| FB-CPM-001 | CPM > Benchmark × 2.0 | Critical | High | Urgent: Audience too narrow or competition high |
| FB-CPM-002 | Benchmark × 1.5 < CPM ≤ Benchmark × 2.0 | Warning | Medium | Above benchmark, review audience and bidding |
| FB-CPM-003 | Benchmark × 1.0 < CPM ≤ Benchmark × 1.5 | Info | Low | Slightly above benchmark |
| FB-CPM-004 | CPM ≤ Benchmark | Good | None | On track |

**诊断逻辑：**
- CPM 高于基准值 1.5 倍以上表示受众太窄或竞争激烈
- 需要对比行业基准值（见 Benchmarks）

---

### 2.2 Facebook Benchmarks（基准值）

#### 2.2.1 V1 Benchmarks（第一版，通用基准）

| Metric | E-commerce | SaaS | Local Service | Gaming |
|--------|------------|------|---------------|--------|
| CTR | 1.5% | 1.2% | 1.8% | 1.0% |
| CPC | $1.50 | $2.50 | $1.20 | $0.80 |
| CPM | $12.00 | $18.00 | $10.00 | $8.00 |
| Frequency | 1.5 | 1.3 | 1.8 | 2.0 |
| ROAS | 2.5x | 3.0x | 2.0x | 1.5x |
| CPR | $15.00 | $50.00 | $20.00 | $5.00 |

**说明：**
- V1 只做通用基准，不按地区、Campaign 类型、漏斗阶段细分
- 数据不足时（Spend < $50 或 Results < 50），提示用户等待更多数据
- 基准值可以根据实际数据迭代更新

---

#### 2.2.2 数据不足规则

| Condition | Action |
|-----------|--------|
| Spend < $50 | 不生成诊断，提示"Insufficient data, wait for more spend" |
| Results < 50 | 不生成诊断，提示"Learning phase, wait for more results" |
| 缺少关键指标 | 不分析该指标，提示"Data not available" |

---

### 2.3 Facebook Evidence Requirements（证据要求）

#### 2.3.1 Campaign Level（必须字段）

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Campaign Name | String | ✅ | 广告系列名称 |
| Delivery | String | ✅ | 状态（Active/Paused） |
| Budget | Number | ✅ | 预算 |
| Amount Spent | Number | ✅ | 花费 |
| Results | Number | ✅ | 结果数 |
| Cost per Result | Number | ✅ | 单次结果成本 |
| Impressions | Number | ✅ | 展示数 |
| Reach | Number | ✅ | 覆盖人数 |
| CTR | Number | ✅ | 点击率 |
| CPC | Number | ✅ | 单次点击成本 |
| Frequency | Number | ✅ | 频次 |
| ROAS | Number | ✅ | 广告支出回报率 |
| Date Range | String | ✅ | 日期范围 |

#### 2.3.2 Ad Set Level（可选字段）

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Audience | String | ⚠️ | 受众定义 |
| Placement | String | ⚠️ | 投放位置 |
| Learning Phase | String | ⚠️ | 学习阶段状态 |

#### 2.3.3 Ad Level（可选字段）

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Creative Type | String | ⚠️ | 创意类型（Image/Video/Carousel） |
| Hook | String | ⚠️ | 广告开头 |
| CTA | String | ⚠️ | 行动号召 |
| Landing Page | String | ⚠️ | 落地页 URL |

---

## 3. TikTok ARS

### 3.1 TikTok Rules（4-Layer Review Standard）

TikTok 的 ARS 采用 4-Layer 审查标准：

```
Layer 1: Policy Compliance（程序判断）
Layer 2: Creative Quality（程序判断 + AI）
Layer 3: Marketing Effectiveness（AI 判断）
Layer 4: Performance Metrics（程序判断）
```

---

#### 3.1.1 Layer 1: Policy Compliance（政策合规）

| Rule ID | Condition | Status | Severity | Recommendation |
|---------|-----------|--------|----------|----------------|
| TK-POLICY-001 | Contains prohibited content | Critical | High | Remove content immediately |
| TK-POLICY-002 | Unverified health/financial claims | Warning | Medium | Add disclaimers or remove claims |
| TK-POLICY-003 | Copyrighted music without license | Warning | Medium | Replace with licensed music |
| TK-POLICY-004 | Misleading before/after | Info | Low | Add disclaimers |

**诊断逻辑：**
- 程序自动检测敏感词和违规内容
- AI 辅助判断是否存在误导性声明

---

#### 3.1.2 Layer 2: Creative Quality（创意质量）

⚠️ **重要限制：**
**只有在有视频数据（6s view rate、average watch time）或视频文件时，才能分析 Hook。**
如果只有普通截图，没有视频数据，**禁止**说"Hook is weak"或进行任何 Hook 相关分析。

| Rule ID | Condition | Status | Severity | Recommendation |
|---------|-----------|--------|----------|----------------|
| TK-CREATIVE-001 | 6s View Rate < 15% | Critical | High | Hook is very weak, rewrite first 3 seconds |
| TK-CREATIVE-002 | 15% ≤ 6s View Rate < 25% | Warning | Medium | Hook needs improvement |
| TK-CREATIVE-003 | 25% ≤ 6s View Rate < 35% | Good | None | Hook is effective |
| TK-CREATIVE-004 | 6s View Rate ≥ 35% | Excellent | None | Hook is very strong |
| TK-CREATIVE-005 | Avg Watch Time < 3s | Critical | High | Video too short or boring |
| TK-CREATIVE-006 | 3s ≤ Avg Watch Time < 5s | Warning | Medium | Improve pacing and engagement |
| TK-CREATIVE-007 | Avg Watch Time ≥ 5s | Good | None | Good engagement |

**诊断逻辑：**
- 6s View Rate 低于 25% 表示 Hook 不够强
- Average Watch Time 低于 3s 表示视频内容不够吸引
- **必须有视频数据才能分析，否则禁止分析 Hook**

---

#### 3.1.3 Layer 3: Marketing Effectiveness（营销效果）

| Rule ID | Condition | Status | Severity | Recommendation |
|---------|-----------|--------|----------|----------------|
| TK-MARKETING-001 | No clear offer | Warning | Medium | Add clear offer or promotion |
| TK-MARKETING-002 | Weak CTA | Warning | Medium | Strengthen call-to-action |
| TK-MARKETING-003 | No pain point addressed | Info | Low | Address customer pain points |
| TK-MARKETING-004 | Low emotional resonance | Info | Low | Add emotional triggers |

**诊断逻辑：**
- AI 分析视频脚本和创意，判断 Offer、CTA、Pain Point、Emotion
- 必须引用 Evidence（如脚本内容、视频描述）

---

#### 3.1.4 Layer 4: Performance Metrics（效果指标）

| Rule ID | Condition | Status | Severity | Recommendation |
|---------|-----------|--------|----------|----------------|
| TK-PERF-001 | CTR < 1.0% | Critical | High | Urgent: Creative or landing page issue |
| TK-PERF-002 | 1.0% ≤ CTR < 1.5% | Warning | Medium | Below benchmark, review creative |
| TK-PERF-003 | CTR ≥ 1.5% | Good | None | On track |
| TK-PERF-004 | CVR < 2.0% | Critical | High | Landing page or offer issue |
| TK-PERF-005 | 2.0% ≤ CVR < 3.5% | Warning | Medium | Below benchmark, optimize funnel |
| TK-PERF-006 | CVR ≥ 3.5% | Good | None | On track |
| TK-PERF-007 | CPA > Target × 2.0 | Critical | High | Cost too high, optimize or pause |
| TK-PERF-008 | Target × 1.5 < CPA ≤ Target × 2.0 | Warning | Medium | Above target, review funnel |
| TK-PERF-009 | CPA ≤ Target | Good | None | On target |
| TK-PERF-010 | ROAS < Target × 0.5 | Critical | High | Not profitable, pause or major optimization |
| TK-PERF-011 | Target × 0.5 ≤ ROAS < Target | Warning | Medium | Below target, optimize |
| TK-PERF-012 | ROAS ≥ Target | Good | None | On track |

---

### 3.2 TikTok Benchmarks（基准值）

#### 3.2.1 V1 Benchmarks（第一版，通用基准）

| Metric | E-commerce | App Install | Game | Local Service |
|--------|------------|-------------|------|---------------|
| 6s View Rate | 25% | 30% | 20% | 28% |
| Avg Watch Time | 4.5s | 5.0s | 3.5s | 4.0s |
| CTR | 1.5% | 2.0% | 1.2% | 1.8% |
| CVR | 3.5% | 5.0% | 2.5% | 4.0% |
| CPA | $8.00 | $3.00 | $5.00 | $10.00 |
| ROAS | 2.5x | N/A | 1.5x | 2.0x |

**说明：**
- V1 只做通用基准，不按地区、视频类型细分
- 数据不足时（Spend < $50 或 Results < 50），提示用户等待更多数据
- 基准值可以根据实际数据迭代更新

---

#### 3.2.2 数据不足规则

| Condition | Action |
|-----------|--------|
| Spend < $50 | 不生成诊断，提示"Insufficient data, wait for more spend" |
| Results < 50 | 不生成诊断，提示"Learning phase, wait for more results" |
| 缺少视频数据 | 不分析 Hook 和 Creative Quality，提示"Video data not available" |
| 缺少关键指标 | 不分析该指标，提示"Data not available" |

---

### 3.3 TikTok Evidence Requirements（证据要求）

#### 3.3.1 视频数据（分析 Hook 必须）

⚠️ **重要限制：**
**只有在有视频数据时，才能分析 Hook 和 Creative Quality。**

| Field | Type | Required for Hook Analysis | Description |
|-------|------|---------------------------|-------------|
| Video Views | Number | ✅ | 视频播放量 |
| 6s Views | Number | ✅ | 前 6 秒观看数 |
| 6s View Rate | Number | ✅ | 6s Views / Video Views |
| Average Watch Time | Number | ✅ | 平均观看时长 |

**没有这些字段时，禁止分析 Hook，禁止说"Hook is weak"。**

---

#### 3.3.2 效果数据（必须字段）

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Campaign Name | String | ✅ | 广告系列名称 |
| Status | String | ✅ | 状态（Active/Paused） |
| Budget | Number | ✅ | 预算 |
| Spend | Number | ✅ | 花费 |
| CTR | Number | ✅ | 点击率 |
| CVR | Number | ✅ | 转化率 |
| CPA | Number | ✅ | 单次转化成本 |
| ROAS | Number | ✅ | 广告支出回报率 |
| Clicks | Number | ✅ | 点击数 |
| Results | Number | ✅ | 结果数 |
| Date Range | String | ✅ | 日期范围 |

---

#### 3.3.3 创意数据（可选字段）

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Video URL | String | ⚠️ | 视频链接（用于 AI 分析） |
| Thumbnail | String | ⚠️ | 封面图 |
| Script | String | ⚠️ | 脚本内容 |

---

## 4. ARS 演进计划

### V1（当前）
- Facebook 通用 Benchmark
- TikTok 通用 Benchmark
- 数据不足规则
- 8-10 个核心指标规则

### V2（未来）
- 按地区细分 Benchmark（US / EU / SEA）
- 按 Campaign 类型细分 Benchmark
- 按漏斗阶段细分 Benchmark（TOF / MOF / BOF）

### V3（长期）
- 动态 Benchmark（基于用户历史数据）
- 行业特定 Benchmark（更细分的行业）
- 竞争对比 Benchmark（与同行业对比）

---

## 5. 附录

### 5.1 Rule ID 命名规范

```
FB-{METRIC}-{NUMBER}  → Facebook 规则
TK-{LAYER}-{NUMBER}   → TikTok 规则

示例：
FB-CTR-001  → Facebook CTR 规则 1
TK-CREATIVE-001  → TikTok Creative 规则 1
TK-PERF-001  → TikTok Performance 规则 1
```

### 5.2 Status 定义

| Status | 含义 | 颜色 |
|--------|------|------|
| Critical | 严重问题，需要立即处理 | 🔴 Red |
| Warning | 警告，需要优化 | 🟡 Yellow |
| Info | 信息，可以改进 | 🔵 Blue |
| Good | 表现良好 | 🟢 Green |
| Excellent | 表现优秀 | 🟢 Green |

### 5.3 Severity 定义

| Severity | 含义 | 优先级 |
|----------|------|--------|
| High | 高优先级，影响核心指标 | P0 |
| Medium | 中优先级，影响效率 | P1 |
| Low | 低优先级，可以改进 | P2 |
| None | 无需处理 | - |

---

> 本内容由 Coze AI 生成，请遵循相关法律法规及《人工智能生成合成内容标识办法》使用与传播。

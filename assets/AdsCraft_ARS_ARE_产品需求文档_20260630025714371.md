---
AIGC:
    Label: "1"
    ContentProducer: 001191110102MACQD9K64018705
    ProduceID: 7634029171441664308-data_volume/files/所有对话/主对话/上传给扣子/AdsCraft_ARS_ARE_产品需求文档.md
    ReservedCode1: ""
    ContentPropagator: 001191110102MACQD9K64028705
    PropagateID: 3476033405197864#1782759351447
    ReservedCode2: ""
---
# AdsCraft Review Platform 产品需求文档

> 版本：v6
> 更新日期：2026-06-30
> 核心升级：ARP → AOS（Output Specification），Metric/Rule 职责分离，Stark 对比移到附录

---

## 1. 产品定位升级

### 从"Facebook 分析工具"到"AdsCraft Review Platform"

AdsCraft 不是一个 Facebook 产品，也不是一个 TikTok 产品。

**AdsCraft 是一个统一的广告审查平台（Review Platform）。**

```
AdsCraft Review Platform
│
├── Facebook Connector（Parser + Facebook ARS）
├── TikTok Connector（Parser + TikTok ARS）
├── Google Ads Connector（未来）
└── LinkedIn Ads Connector（未来）
```

**核心引擎全部复用：**
- Evidence Engine（证据引擎）
- Rule Engine（规则引擎）
- Metric Engine（指标分析引擎）
- Score Engine（评分引擎）
- LLM Explanation（AI 解释层）

**真正变化的只有：**
- Parser（不同平台的数据结构不同）
- ARS（不同平台的规则和基准值不同）

这意味着：
- 不是"开发 Facebook 产品 + TikTok 产品"
- 而是"开发 AdsCraft Platform + Facebook Connector + TikTok Connector"

**长期价值：**
未来新增 Google Ads、LinkedIn Ads，开发量极小——只需新增一个 Parser + 一套 ARS，核心引擎全部复用。

---

## 2. AdsCraft 三层标准架构

AdsCraft 的技术体系由三个标准组成：

### 2.1 ARS（AdsCraft Review Standard）

**定义：** 诊断标准、规则、基准值的知识库。

**职责：**
- 定义每个平台的审查规则（Rules）
- 定义每个平台的基准值（Benchmarks）
- 定义每个平台需要的证据类型（Evidence Requirements）

**结构：**
```
ARS
├── Facebook
│   ├── Rules（CTR < 1% = Warning）
│   ├── Benchmarks（行业 CTR = 1.5%）
│   └── Evidence Requirements（需要 CTR、CPC、ROAS...）
├── TikTok
│   ├── Rules（Hook < 3s = Warning）
│   ├── Benchmarks（行业 6s View Rate = 25%）
│   └── Evidence Requirements（需要 Video Views、6s Views...）
├── Google（未来）
└── LinkedIn（未来）
```

**演进方式：**
- 按平台扩展
- 每个平台的 ARS 独立维护
- ARS 是 AdsCraft 的核心资产

**详细规则、Benchmark、Evidence Requirements 见：** [ARS.md](./ARS.md)

---

### 2.2 ARE（AdsCraft Review Engine）

**定义：** 执行引擎，负责从原始数据到最终评分的完整处理流程。

**职责：**
- OCR（识别截图文字）
- Parser（结构化 → JSON）
- Evidence Engine（构建可追溯证据）
- Metric Engine（计算和对比指标）
- Rule Engine（触发诊断规则）
- Score Engine（计算评分）

**架构：**
```
ARE（执行引擎）
│
├── OCR Engine（Google Vision / Azure OCR）
├── Parser（平台特定：Facebook Parser / TikTok Parser）
├── Evidence Engine（构建证据，带 Provenance）
├── Metric Engine（读 Evidence，计算指标，对比 Benchmarks）
├── Rule Engine（读 Metric 结果，触发诊断规则）
└── Score Engine（程序打分，AI 不改）
```

**Metric Engine vs Rule Engine 职责分离：**

| 引擎 | 职责 | 输入 | 输出 | 示例 |
|------|------|------|------|------|
| **Metric Engine** | 计算和对比指标 | Evidence + Benchmarks | 指标状态（数值、趋势、对比） | CTR = 0.87%，Below Benchmark，Declining |
| **Rule Engine** | 触发诊断规则 | Metric 结果 + Rules | 诊断结论（规则 ID、状态、严重程度） | Rule FB-CTR-001 triggered: Warning |

**关键区别：**
- Metric Engine 回答："指标是什么状态？"（计算 + 对比）
- Rule Engine 回答："需要触发什么诊断？"（规则判断）

**详细引擎设计见：** [ARE.md](./ARE.md)

---

### 2.3 AOS（AdsCraft Output Specification）

**定义：** 统一输出规范，定义所有输出格式（网页报告、PDF、API、邮件、历史记录）。

**职责：**
- 定义统一的 JSON 输出结构
- 定义网页报告的渲染格式（5-Page Report）
- 定义 PDF 导出格式
- 定义 API 响应格式
- 定义邮件摘要格式
- 定义历史记录存储格式

**核心设计：**
所有输出（网页、PDF、API、邮件）都读取同一份 JSON，只是渲染方式不同。

```
ARE（执行引擎）
     ↓
统一 JSON 输出（AOS Core）
     ↓
┌────────┬────────┬────────┬────────┐
│        │        │        │        │
▼        ▼        ▼        ▼        ▼
网页    PDF      API     邮件    历史记录
报告    导出     响应    摘要     存储
```

**统一 JSON 结构（AOS Core）：**
```json
{
  "report_id": "rpt_20260630_001",
  "platform": "facebook",
  "campaign_name": "Brand Awareness",
  "generated_at": "2026-06-30T02:00:00Z",
  
  "scores": {
    "overall": 78,
    "performance": 75,
    "efficiency": 82,
    "delivery": 90,
    "risk": 65
  },
  
  "evidence": [
    {
      "evidence_id": "CTR-001",
      "metric": "CTR",
      "value": "0.87%",
      "benchmark": "1.5%",
      "status": "below",
      "source": {
        "type": "OCR",
        "confidence": 0.98
      }
    }
  ],
  
  "metric_analysis": [
    {
      "metric": "CTR",
      "value": "0.87%",
      "benchmark": "1.5%",
      "status": "below_benchmark",
      "trend": "declining"
    }
  ],
  
  "diagnosis": [
    {
      "rule_id": "FB-CTR-001",
      "status": "warning",
      "severity": "medium",
      "evidence_id": "CTR-001",
      "explanation": "CTR is below benchmark, suggesting creative issues."
    }
  ],
  
  "action_plan": [
    {
      "priority": "P1",
      "action": "Test new ad creative with stronger hook",
      "expected_impact": "CTR improvement to 1.5%+"
    }
  ]
}
```

**详细输出格式见：** [AOS.md](./AOS.md)

---

### 2.4 三层架构的关系

```
ARS（标准）
↓ 提供规则和基准值
ARE（执行）
↓ 执行分析，生成统一 JSON
AOS（输出）
↓ 渲染为不同格式（网页/PDF/API/邮件）
用户
```

**关键原则：**
- ARS 定义"怎么判断"
- ARE 负责"怎么执行"
- AOS 定义"怎么输出"

**三层独立演进：**
- ARS 可以更新规则（不影响 ARE 和 AOS）
- ARE 可以优化引擎（不影响 ARS 和 AOS）
- AOS 可以新增输出格式（不影响 ARS 和 ARE）

---

## 3. 技术原则（六条铁律）

### 原则一：所有结论必须有证据（Evidence Engine）

每一句诊断，都必须能够追溯到 Evidence Engine。

**实现：**
- Parser 提取数据后，Evidence Engine 构建 Evidence
- 每条 Evidence 包含：指标名称、数值、来源、置信度、关联对象（Campaign/Ad Set/Ad）
- Rule Engine 判断后，结论关联 Evidence ID
- LLM 生成报告时，必须引用 Evidence ID

**示例：**
```
错误：CTR is low.
正确：CTR is 0.87% (Evidence: CTR-001), below benchmark of 1.5%.
```

---

### 原则二：所有评分由程序完成（Score Engine）

AI 不参与打分。程序根据规则计算评分。

**实现：**
- Score Engine 读取 Rule Engine 的判断结果
- 根据预定义算法计算评分
- 评分结果不可被 AI 修改

**示例：**
```
CTR = 0.87%
Rule: CTR < 1% → Warning
Score: 60/100（程序计算）
AI: 不能改为 70/100
```

---

### 原则三：AI 只负责解释（LLM 边界）

AI 可以解释规则，不能创造规则。不能猜测不存在的数据。

**实现：**
- LLM 输入 = Evidence JSON + Rule 判断结果 + Score
- LLM 输出 = 自然语言解释 + 行动建议
- LLM 不允许生成没有 Evidence 支撑的结论

**示例：**
```
有证据：CTR = 0.87%，Benchmark = 1.5%
AI 可以说：CTR is below benchmark, suggesting the creative is not attracting enough clicks.

无证据：没有 Video Data
AI 不能说：Hook is weak.（禁止）
```

---

### 原则四：平台统一，Parser 分离（多平台扩展）

Facebook、TikTok、Google Ads 未来都只是不同的 Parser。Evidence、Rule、Score、LLM 全部复用。

**实现：**
- ARE 核心引擎统一（Evidence、Metric、Rule、Score、LLM）
- 每个平台独立 Parser（Facebook Parser、TikTok Parser）
- 每个平台独立 ARS（Facebook ARS、TikTok ARS）

**示例：**
```
Facebook Screenshot → Facebook Parser → Evidence → ARE → Report
TikTok Screenshot → TikTok Parser → Evidence → ARE → Report
（ARE 核心引擎完全相同）
```

---

### 原则五：数据源解耦，支持演进（Provenance）

Evidence Engine 与数据来源解耦。今天来源是截图 OCR，明天来源是 Meta API，后天来源是 CSV 导入，但 Rule Engine、Score Engine、LLM 完全不用修改。

**实现：**
- Evidence 包含 Provenance（来源信息）
- Provenance 包含：数据来源类型（OCR / API / CSV）、字段映射、置信度
- 下游引擎只消费 Evidence，不关心来源

**示例：**
```
来源 = OCR：
{
  "metric": "CTR",
  "value": "0.87%",
  "source": {
    "type": "OCR",
    "column": "CTR",
    "row": "Brand Awareness",
    "confidence": 0.98
  }
}

来源 = Meta API：
{
  "metric": "CTR",
  "value": "0.87%",
  "source": {
    "type": "Meta API",
    "field": "ctr",
    "api_version": "v18.0"
  }
}

（下游引擎看到的 Evidence 格式完全相同）
```

---

### 原则六：动态显示，无数据不展示（体验质量）

报告内容必须根据实际可用的数据动态调整。没有数据支持的维度不显示，避免 AI 编造或误导。

**实现：**
- Evidence Engine 标记哪些指标有数据、哪些无数据
- 报告生成时，只展示有 Evidence 的指标
- 无数据的维度（如 Hook 分析）不显示，不打分

**示例：**
```
有 Video Data：显示 Hook Analysis
无 Video Data：不显示 Hook Analysis（不显示"Hook is weak"）

有 CTR 数据：显示 CTR 分析
无 CTR 数据：不显示 CTR 分析
```

---

## 4. 数据流

### 4.1 Facebook 数据流

```
Facebook Ads Manager Screenshot
│
▼
OCR Engine（Google Vision / Azure OCR）
│
▼
Raw Text + Coordinates
│
▼
Facebook Parser（结构化 → JSON）
│
▼
Evidence Engine（构建 Evidence，带 Provenance）
│
▼
Metric Engine（计算指标，对比 Benchmarks）
│
▼
Rule Engine（触发诊断规则）
│
▼
Score Engine（计算评分）
│
▼
统一 JSON 输出（AOS Core）
│
├────────┬────────┬────────┬────────┐
▼        ▼        ▼        ▼        ▼
网页    PDF      API     邮件    历史记录
报告    导出     响应    摘要     存储
```

### 4.2 TikTok 数据流

```
TikTok Ads Manager（Screenshot / API）
│
▼
OCR Engine（截图） / API Parser（API 数据）
│
▼
Raw Text + Coordinates / API JSON
│
▼
TikTok Parser（结构化 → JSON）
│
▼
Evidence Engine（构建 Evidence，带 Provenance）
│
▼
Metric Engine（计算指标，对比 Benchmarks）
│
▼
Rule Engine（触发诊断规则）
│
▼
Score Engine（计算评分）
│
▼
统一 JSON 输出（AOS Core）
│
├────────┬────────┬────────┬────────┐
▼        ▼        ▼        ▼        ▼
网页    PDF      API     邮件    历史记录
报告    导出     响应    摘要     存储
```

---

## 5. ARE 引擎层详解

### 5.1 Evidence Engine（证据引擎）

**职责：** 在 Parser 之后、Metric/Rule Engine 之前，将原始数据标准化为带 Provenance 的 Evidence。

**输入：** Parser 输出的 JSON
**输出：** Evidence 列表（每条 Evidence 包含：指标名称、数值、来源、置信度、关联对象）

**示例：**
```json
{
  "evidence_id": "CTR-001",
  "metric": "CTR",
  "value": "0.87%",
  "campaign": "Brand Awareness",
  "source": {
    "type": "OCR",
    "column": "CTR",
    "row": "Brand Awareness",
    "confidence": 0.98
  },
  "timestamp": "2026-06-30T02:00:00Z"
}
```

**关键设计：**
- Evidence 是不可变的（Immutable）
- 每条 Evidence 必须有唯一 ID
- Evidence 包含完整的 Provenance（来源信息）
- 下游引擎只消费 Evidence，不关心数据来源

---

### 5.2 Metric Engine（指标分析引擎）

**职责：** 读取 Evidence，计算指标状态，对比 Benchmarks，分析指标关系和趋势。

**输入：** Evidence 列表 + ARS Benchmarks
**输出：** 指标分析报告（指标状态、与基准对比、指标关系、趋势分析）

**核心功能：**

1. **单指标状态判断**
   - 计算指标数值
   - 对比 Benchmark
   - 判断状态（Above / Below / On Target）

2. **指标关系分析**
   - High CTR + Low CVR = Landing Page Issue
   - High Impressions + Low CTR = Creative Issue
   - High Frequency + Low ROAS = Ad Fatigue

3. **趋势对比**
   - CTR 从 1.2% 降到 0.87% → Declining Trend
   - ROAS 从 2.5x 升到 3.2x → Improving Trend

**示例输出：**
```json
{
  "metric_analysis": [
    {
      "metric": "CTR",
      "value": "0.87%",
      "benchmark": "1.5%",
      "status": "below_benchmark",
      "trend": "declining",
      "related_issues": ["Creative Issue", "Audience Mismatch"]
    }
  ]
}
```

**关键区别：**
- Metric Engine 回答："指标是什么状态？"（计算 + 对比）
- Metric Engine 不做诊断判断，只做数据计算和对比

---

### 5.3 Rule Engine（规则引擎）

**职责：** 读取 Metric Engine 的结果，应用 ARS Rules，触发诊断规则。

**输入：** Metric 分析结果 + ARS Rules
**输出：** 诊断结论（规则 ID、状态、严重程度、关联 Evidence）

**核心功能：**

1. **触发诊断规则**
   - CTR Below Benchmark → Trigger Rule FB-CTR-001
   - Frequency > 2.0 → Trigger Rule FB-FREQ-001
   - Spend < $50 → Trigger Rule FB-SPEND-001（Insufficient Data）

2. **判断严重程度**
   - Critical / Warning / Info

3. **关联 Evidence**
   - 每个诊断结论必须关联 Evidence ID

**示例规则：**
```
Rule ID: FB-CTR-001
Condition: CTR < 1%
Status: Warning
Severity: Medium
Recommendation: Review creative and audience targeting
```

**示例输出：**
```json
{
  "diagnosis": [
    {
      "rule_id": "FB-CTR-001",
      "metric": "CTR",
      "value": "0.87%",
      "condition": "CTR < 1%",
      "status": "warning",
      "severity": "medium",
      "evidence_id": "CTR-001",
      "recommendation": "Review creative and audience targeting"
    }
  ]
}
```

**关键区别：**
- Rule Engine 回答："需要触发什么诊断？"（规则判断）
- Rule Engine 不做数据计算，只做规则匹配和诊断触发

---

### 5.4 Score Engine（评分引擎）

**职责：** 读取 Rule Engine 和 Metric Engine 的结果，计算评分。

**输入：** Rule 诊断结果 + Metric 分析结果
**输出：** 评分（Overall Score + 维度评分）

**评分算法：**
```
Overall Score = (Performance + Efficiency + Delivery + Risk) / 4

Performance = f(ROAS, CPA, Results)
Efficiency = f(CTR, CPC, CPM)
Delivery = f(Spend, Budget Utilization, Learning Phase)
Risk = f(Frequency, Policy Compliance, Data Sufficiency)
```

**示例输出：**
```json
{
  "scores": {
    "overall": 78,
    "performance": 75,
    "efficiency": 82,
    "delivery": 90,
    "risk": 65
  }
}
```

**关键设计：**
- 评分完全由程序计算
- AI 不参与打分
- 评分算法可配置（按行业/按平台）

---

## 6. AI (LLM) 的使用边界

### 6.1 AI 可以做什么

1. **解释规则判断结果**
   - 输入：CTR = 0.87%，Below Benchmark
   - 输出：CTR is below benchmark, suggesting the creative is not attracting enough clicks relative to impressions.

2. **分析指标关系**
   - 输入：High CTR + Low CVR
   - 输出：High click-through rate but low conversion rate indicates a potential landing page issue.

3. **生成行动建议**
   - 输入：CTR Warning, Creative Issue
   - 输出：P1: Test new ad creative with stronger hook and clearer CTA.

4. **生成自然语言报告**
   - 输入：Evidence JSON + Rule Results + Scores
   - 输出：5-Page Report（Executive Summary, Diagnosis, Action Plan）

---

### 6.2 AI 不能做什么

1. **不能创造规则**
   - AI 不能说："I think CTR should be above 2%."
   - 只能说："According to ARS, CTR benchmark is 1.5%."

2. **不能猜测数据**
   - 没有 Video Data，不能说："Hook is weak."
   - 没有 CVR Data，不能说："Conversion rate is low."

3. **不能修改评分**
   - Score Engine 计算 78/100，AI 不能改为 85/100

4. **不能生成没有 Evidence 支撑的结论**
   - 每句诊断必须引用 Evidence ID
   - 例如："CTR is 0.87% (Evidence: CTR-001), below benchmark."

---

### 6.3 AI 输入格式

```json
{
  "evidence": [
    {
      "evidence_id": "CTR-001",
      "metric": "CTR",
      "value": "0.87%",
      "benchmark": "1.5%",
      "status": "below"
    }
  ],
  "metric_analysis": [
    {
      "metric": "CTR",
      "value": "0.87%",
      "benchmark": "1.5%",
      "status": "below_benchmark",
      "trend": "declining"
    }
  ],
  "diagnosis": [
    {
      "rule_id": "FB-CTR-001",
      "status": "warning",
      "severity": "medium"
    }
  ],
  "scores": {
    "overall": 78,
    "performance": 75,
    "efficiency": 82
  },
  "platform": "facebook",
  "campaign_name": "Brand Awareness"
}
```

---

### 6.4 AI 输出格式

```markdown
## Diagnosis

The Brand Awareness campaign shows a CTR of 0.87% (Evidence: CTR-001), which is below the industry benchmark of 1.5%. This suggests that the creative is not attracting enough attention relative to the number of impressions.

Additionally, the campaign has a high frequency of 2.3 (Evidence: FREQ-001), indicating potential ad fatigue among the target audience.

## Action Plan

**P1: Improve Creative**
- Test new ad creative with stronger hook and clearer CTA
- A/B test different visual styles and messaging

**P2: Refresh Audience**
- Exclude audiences who have seen the ad 3+ times
- Test new audience segments to reduce frequency
```

---

## 7. TikTok 分析架构

### 7.1 TikTok Review Standard（4-Layer）

TikTok 的 ARS 采用 4-Layer 审查标准：

```
Layer 1: Policy Compliance（程序判断）
- 违规内容检测
- 敏感词检查
- 政策合规性

Layer 2: Creative Quality（程序判断 + AI）
- Hook（前 3 秒）⚠️ 必须有视频数据才能分析
- 视频结构
- 字幕和封面
- 创意格式

Layer 3: Marketing Effectiveness（AI 判断）
- Offer 清晰度
- CTA 强度
- Pain Point 触达
- 情感共鸣

Layer 4: Performance Metrics（程序判断）
- Video Views
- 6s View Rate
- Average Watch Time
- CTR
- CVR
- CPA
- ROAS
```

**关键设计：**
- Layer 1, 2, 4 = 程序判断（基于 Evidence）
- Layer 3 = AI 判断（但必须引用 Evidence）
- 所有判断都必须有 Evidence 支撑

---

### 7.2 TikTok Evidence Requirements

**视频数据（必须有才能分析 Hook）：**
- Video Views
- 6s Views（前 6 秒观看数）
- Average Watch Time（平均观看时长）
- 6s View Rate（6s Views / Video Views）

⚠️ **重要限制：**
**只有在有视频数据（6s view rate、average watch time）或视频文件时，才能分析 Hook。**
如果只有普通截图，没有视频数据，**禁止**说"Hook is weak"或进行任何 Hook 相关分析。

这是 Evidence Engine 的核心价值：没有证据就不能下结论。

**效果数据：**
- CTR（点击率）
- CVR（转化率）
- CPA（单次转化成本）
- ROAS（广告支出回报率）

**创意数据：**
- Video URL（用于 AI 分析）
- Thumbnail（封面）
- Script（脚本）

---

### 7.3 TikTok 数据流

```
TikTok Ads Manager（Screenshot / API）
│
▼
OCR Engine（截图） / API Parser（API 数据）
│
▼
TikTok Parser（结构化 → JSON）
│
▼
Evidence Engine（构建 Evidence，带 Provenance）
│
▼
Metric Engine（计算指标，对比 Benchmarks）
│
▼
Rule Engine（触发诊断规则）
│
▼
Score Engine（计算评分）
│
▼
统一 JSON 输出（AOS Core）
│
├────────┬────────┬────────┬────────┐
▼        ▼        ▼        ▼        ▼
网页    PDF      API     邮件    历史记录
报告    导出     响应    摘要     存储
```

---

### 7.4 TikTok 报告示例

**Page 1: Executive Summary**
```
Overall Score: 72/100

Performance: 70/100
Efficiency: 75/100
Delivery: 85/100
Risk: 60/100

Key Findings:
1. 6s View Rate is 18%, below benchmark of 25% (Evidence: 6S-001)
2. CTR is 1.85%, above benchmark of 1.5% (Evidence: CTR-001)
3. Average Watch Time is 4.2s, indicating decent engagement (Evidence: AWT-001)
```

**Page 3: Metric Analysis**
```
6s View Rate
Value: 18%
Benchmark: 25%
Status: Warning
Evidence: 6S-001

Analysis: 6s View Rate is below benchmark, suggesting the hook (first 3 seconds) is not strong enough to retain viewers.
```

**Page 4: Diagnosis**
```
The campaign shows a 6s View Rate of 18% (Evidence: 6S-001), which is below the TikTok benchmark of 25%. This indicates that the hook (first 3 seconds) is not strong enough to retain viewers.

However, the CTR of 1.85% (Evidence: CTR-001) is above the benchmark of 1.5%, suggesting that viewers who watch the video are interested in the offer. This combination of low 6s View Rate but high CTR indicates that the video content is relevant, but the hook needs improvement.
```

**Page 5: Action Plan**
```
P0: Strengthen the Hook
- Issue: Low 6s View Rate (18% vs 25% benchmark)
- Action: Test new hooks with stronger visual impact, curiosity gap, or pain point addressal in the first 3 seconds
- Expected Impact: 6s View Rate improvement to 25%+

P1: Maintain CTR Performance
- Issue: None (CTR is above benchmark)
- Action: Continue testing different offers and CTAs to maintain high CTR
- Expected Impact: CTR maintenance at 1.5%+
```

---

## 8. 开发优先级

### Phase 1：核心引擎（2-3 周）

**目标：** 建立 ARE 核心引擎 + Facebook ARS

**任务：**
1. Evidence Engine（构建 Evidence，带 Provenance）
2. Metric Engine（指标分析：对比 Benchmarks，分析关系和趋势）
3. Rule Engine（8 个指标的程序判断）
4. Score Engine（综合评分算法）
5. Facebook Parser（截图 → JSON）

**交付物：**
- 程序化的指标判断和评分
- 统一 JSON 输出（AOS Core）
- 网页报告（5-Page Report 的 Page 1-3）

---

### Phase 2：AI 解释层（1-2 周）

**目标：** 接入 LLM，生成诊断和行动建议

**任务：**
1. LLM 解释层（基于 Evidence 生成诊断）
2. Action Plan 生成（基于诊断生成行动清单）
3. 5-Page Report 的 Page 4-5（Diagnosis, Action Plan）

**交付物：**
- 完整的 5-Page Report
- 每句诊断都有 Evidence 支撑

---

### Phase 3：TikTok Connector（2-3 周）

**目标：** 接入 TikTok，复用 ARE 核心引擎

**任务：**
1. TikTok Parser（截图/API → JSON）
2. TikTok ARS（4-Layer Review Standard）
3. TikTok-specific Rules 和 Benchmarks

**交付物：**
- TikTok 分析报告
- 与 Facebook 报告风格统一（AOS）

---

### Phase 4：平台扩展（未来）

**目标：** 新增 Google Ads、LinkedIn Ads Connector

**任务：**
1. Google Ads Parser
2. Google Ads ARS
3. LinkedIn Ads Parser
4. LinkedIn Ads ARS

**交付物：**
- 多平台统一的广告审查平台

---

## 9. 核心资产清单

### 9.1 ARS（AdsCraft Review Standard）

**价值：** AdsCraft 的诊断标准和规则库，是核心资产。

**内容：**
- Facebook ARS：Rules + Benchmarks + Evidence Requirements
- TikTok ARS：4-Layer Review Standard + Benchmarks + Evidence Requirements
- Google ARS（未来）
- LinkedIn ARS（未来）

**护城河：**
- ARS 是 AdsCraft 独有的诊断标准
- 即使换 LLM（GPT → Claude → Gemini），ARS 不变
- 这是 AdsCraft 的核心差异化

**详见：** [ARS.md](./ARS.md)

---

### 9.2 ARE（AdsCraft Review Engine）

**价值：** AdsCraft 的执行引擎，是技术壁垒。

**内容：**
- Evidence Engine（证据引擎）
- Metric Engine（指标分析引擎）
- Rule Engine（规则引擎）
- Score Engine（评分引擎）
- Parser Framework（Parser 框架）

**护城河：**
- ARE 是平台无关的统一引擎
- 新增平台只需新增 Parser，核心引擎复用
- 这是 AdsCraft 长期扩展的技术基础

**详见：** [ARE.md](./ARE.md)

---

### 9.3 AOS（AdsCraft Output Specification）

**价值：** AdsCraft 的统一输出规范，是用户体验标准。

**内容：**
- 统一 JSON 输出结构（AOS Core）
- 网页报告格式（5-Page Report）
- PDF 导出格式
- API 响应格式
- 邮件摘要格式
- 历史记录存储格式

**护城河：**
- AOS 确保所有输出格式统一
- 所有输出读取同一份 JSON，只是渲染方式不同
- 这是 AdsCraft 专业性和一致性的体现

**详见：** [AOS.md](./AOS.md)

---

## 10. 总结

### AdsCraft Review Platform 的核心价值

1. **ARS（AdsCraft Review Standard）**
   - 自有诊断标准，不依赖外部
   - 按平台组织（Facebook / TikTok / Google / LinkedIn）
   - 是 AdsCraft 的核心资产

2. **ARE（AdsCraft Review Engine）**
   - 统一执行引擎，平台无关
   - Metric Engine 负责计算和对比指标
   - Rule Engine 负责触发诊断规则
   - Evidence Engine 确保证据可追溯
   - 新增平台只需新增 Parser

3. **AOS（AdsCraft Output Specification）**
   - 统一输出规范，所有输出读取同一份 JSON
   - 支持网页、PDF、API、邮件、历史记录
   - 每句诊断都有 Evidence 支撑

4. **六条技术原则**
   - 所有结论必须有证据
   - 所有评分由程序完成
   - AI 只负责解释
   - 平台统一，Parser 分离
   - 数据源解耦，支持演进
   - 动态显示，无数据不展示

### 长期愿景

AdsCraft 不是一个 Facebook 产品，也不是一个 TikTok 产品。

**AdsCraft 是一个统一的广告审查平台，未来可以覆盖所有广告平台。**

每一句诊断都有证据，每一个评分都可追溯，每一套规则都是专业标准。

这就是 AdsCraft 的护城河。

---

## 附录 A：与 Stark 的差异化（内部战略参考）

### Stark 的做法

- 底层标准：WCAG（Web Content Accessibility Guidelines）
- AI 角色：检查 WCAG 合规性
- 核心卖点：Accessibility Compliance

### AdsCraft 的做法

- 底层标准：ARS（AdsCraft Review Standard）
- AI 角色：基于 ARS 解释诊断结果
- 核心卖点：Every diagnosis is backed by evidence

### 核心差异

| 维度 | Stark | AdsCraft |
|------|-------|----------|
| 底层标准 | WCAG（公开标准） | ARS（自有标准） |
| AI 角色 | 检查合规性 | 解释诊断结果 |
| 证据追踪 | 无 | 有（Evidence Engine） |
| 评分方式 | AI 打分 | 程序打分 |
| 多平台扩展 | 困难 | 容易（Parser 分离） |
| 核心资产 | WCAG 检查规则 | ARS + ARE + AOS |

**AdsCraft 的护城河：**
- ARS 是自有标准，不依赖外部
- ARE 是统一引擎，扩展性强
- AOS 是统一输出，用户体验一致
- Evidence Engine 确保证据可追溯，AI 不能编造

---

## 附录 B：详细文档索引

- **ARS.md**：规则、Benchmark、Evidence Requirements 的详细定义
- **ARE.md**：OCR、Parser、Evidence、Metric、Rule、Score、LLM 流程的详细设计
- **AOS.md**：统一 JSON 输出结构和报告格式的详细规范

---

> 本内容由 Coze AI 生成，请遵循相关法律法规及《人工智能生成合成内容标识办法》使用与传播。

---
AIGC:
    Label: "1"
    ContentProducer: 001191110102MACQD9K64018705
    ProduceID: 7634029171441664308-data_volume/files/所有对话/主对话/上传给扣子/AOS.md
    ReservedCode1: ""
    ContentPropagator: 001191110102MACQD9K64028705
    PropagateID: 3476033405197864#1782759391238
    ReservedCode2: ""
---
# AdsCraft Output Specification (AOS)

> 版本：v1
> 更新日期：2026-06-30
> 职责：定义统一输出规范，包括 JSON 结构、网页报告、PDF、API、邮件、历史记录

---

## 1. AOS 概述

AOS（AdsCraft Output Specification）是 AdsCraft 的统一输出规范，定义所有输出格式。

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

**关键原则：**
- 统一 JSON 结构（AOS Core）
- 所有输出读取同一份 JSON
- 渲染方式不同，数据源相同
- 每句诊断都有 Evidence 支撑

---

## 2. 统一 JSON 结构（AOS Core）

### 2.1 完整 JSON 结构

```json
{
  "report_id": "rpt_20260630_001",
  "platform": "facebook",
  "campaign_name": "Brand Awareness",
  "generated_at": "2026-06-30T02:00:00Z",
  "data_source": {
    "type": "OCR",
    "screenshot_url": "xxx.png",
    "ocr_confidence": 0.96
  },
  "date_range": "Last 7 days",
  
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
      "value": 0.87,
      "value_formatted": "0.87%",
      "benchmark": 1.5,
      "benchmark_formatted": "1.5%",
      "status": "below",
      "campaign": "Brand Awareness",
      "source": {
        "type": "OCR",
        "column": "CTR",
        "row": "Brand Awareness",
        "confidence": 0.98
      },
      "timestamp": "2026-06-30T02:00:00Z"
    },
    {
      "evidence_id": "ROAS-001",
      "metric": "ROAS",
      "value": 3.2,
      "value_formatted": "3.2x",
      "benchmark": 2.5,
      "benchmark_formatted": "2.5x",
      "status": "above",
      "campaign": "Summer Sale",
      "source": {
        "type": "OCR",
        "column": "ROAS",
        "row": "Summer Sale",
        "confidence": 0.95
      },
      "timestamp": "2026-06-30T02:00:00Z"
    },
    {
      "evidence_id": "FREQ-001",
      "metric": "Frequency",
      "value": 2.3,
      "value_formatted": "2.3",
      "benchmark": 1.5,
      "benchmark_formatted": "1.5",
      "status": "above",
      "campaign": "Brand Awareness",
      "source": {
        "type": "OCR",
        "column": "Frequency",
        "row": "Brand Awareness",
        "confidence": 0.96
      },
      "timestamp": "2026-06-30T02:00:00Z"
    }
  ],
  
  "metric_analysis": [
    {
      "metric": "CTR",
      "evidence_id": "CTR-001",
      "value": 0.87,
      "value_formatted": "0.87%",
      "benchmark": 1.5,
      "benchmark_formatted": "1.5%",
      "status": "below_benchmark",
      "deviation": -0.63,
      "deviation_percentage": -42,
      "trend": "declining",
      "relationships": [
        {
          "type": "high_impressions_low_ctr",
          "related_metric": "Impressions",
          "diagnosis": "Creative Issue"
        }
      ]
    },
    {
      "metric": "ROAS",
      "evidence_id": "ROAS-001",
      "value": 3.2,
      "value_formatted": "3.2x",
      "benchmark": 2.5,
      "benchmark_formatted": "2.5x",
      "status": "above_benchmark",
      "deviation": 0.7,
      "deviation_percentage": 28,
      "trend": "stable"
    },
    {
      "metric": "Frequency",
      "evidence_id": "FREQ-001",
      "value": 2.3,
      "value_formatted": "2.3",
      "benchmark": 1.5,
      "benchmark_formatted": "1.5",
      "status": "above_benchmark",
      "deviation": 0.8,
      "deviation_percentage": 53,
      "trend": "increasing"
    }
  ],
  
  "diagnosis": [
    {
      "rule_id": "FB-CTR-002",
      "metric": "CTR",
      "evidence_id": "CTR-001",
      "value": 0.87,
      "value_formatted": "0.87%",
      "condition": "0.5% ≤ CTR < 1.0%",
      "status": "warning",
      "severity": "medium",
      "recommendation": "Review creative and audience targeting",
      "campaign": "Brand Awareness"
    },
    {
      "rule_id": "FB-FREQ-002",
      "metric": "Frequency",
      "evidence_id": "FREQ-001",
      "value": 2.3,
      "value_formatted": "2.3",
      "condition": "2.0 < Frequency ≤ 3.0",
      "status": "warning",
      "severity": "medium",
      "recommendation": "Ad fatigue risk, consider refreshing creative",
      "campaign": "Brand Awareness"
    }
  ],
  
  "action_plan": [
    {
      "priority": "P1",
      "action": "Improve Creative",
      "issue": "Low CTR (0.87% vs 1.5% benchmark)",
      "details": "Test new ad creative with stronger hook and clearer CTA",
      "expected_impact": "CTR improvement to 1.5%+",
      "related_evidence": ["CTR-001"],
      "related_diagnosis": ["FB-CTR-002"]
    },
    {
      "priority": "P2",
      "action": "Refresh Audience",
      "issue": "High Frequency (2.3)",
      "details": "Exclude audiences who have seen the ad 3+ times",
      "expected_impact": "Frequency reduction to < 2.0",
      "related_evidence": ["FREQ-001"],
      "related_diagnosis": ["FB-FREQ-002"]
    }
  ],
  
  "llm_explanation": {
    "executive_summary": "The Brand Awareness campaign shows mixed performance with a CTR of 0.87% (below benchmark) but ROAS of 3.2x (above benchmark). High frequency indicates potential ad fatigue.",
    "diagnosis": "The Brand Awareness campaign shows a CTR of 0.87% (Evidence: CTR-001), which is below the industry benchmark of 1.5%. This suggests that the creative is not attracting enough attention relative to the number of impressions. Additionally, the campaign has a high frequency of 2.3 (Evidence: FREQ-001), indicating potential ad fatigue among the target audience.",
    "action_plan": "P1: Improve Creative - Test new ad creative with stronger hook and clearer CTA. P2: Refresh Audience - Exclude audiences who have seen the ad 3+ times."
  },
  
  "warnings": [],
  "metadata": {
    "analysis_duration_ms": 2340,
    "model_used": "gpt-4",
    "ars_version": "v1",
    "are_version": "v1"
  }
}
```

### 2.2 JSON 字段说明

#### 2.2.1 基础信息

| Field | Type | Description |
|-------|------|-------------|
| report_id | String | 报告唯一 ID |
| platform | String | 平台（facebook / tiktok / google / linkedin） |
| campaign_name | String | 广告系列名称 |
| generated_at | String | 生成时间（ISO 8601） |
| data_source | Object | 数据来源（OCR / API / CSV） |
| date_range | String | 日期范围 |

#### 2.2.2 评分

| Field | Type | Description |
|-------|------|-------------|
| scores.overall | Number | 综合评分（0-100） |
| scores.performance | Number | 效果评分 |
| scores.efficiency | Number | 效率评分 |
| scores.delivery | Number | 投放评分 |
| scores.risk | Number | 风险评分 |

#### 2.2.3 证据

| Field | Type | Description |
|-------|------|-------------|
| evidence[].evidence_id | String | 证据唯一 ID |
| evidence[].metric | String | 指标名称 |
| evidence[].value | Number | 数值 |
| evidence[].value_formatted | String | 格式化数值（用于显示） |
| evidence[].benchmark | Number | 基准值 |
| evidence[].benchmark_formatted | String | 格式化基准值 |
| evidence[].status | String | 状态（above / below / on_target） |
| evidence[].campaign | String | 关联 Campaign |
| evidence[].source | Object | 来源信息（Provenance） |
| evidence[].timestamp | String | 时间戳 |

#### 2.2.4 指标分析

| Field | Type | Description |
|-------|------|-------------|
| metric_analysis[].metric | String | 指标名称 |
| metric_analysis[].evidence_id | String | 关联证据 ID |
| metric_analysis[].value | Number | 数值 |
| metric_analysis[].benchmark | Number | 基准值 |
| metric_analysis[].status | String | 状态（above_benchmark / below_benchmark / on_target） |
| metric_analysis[].deviation | Number | 偏差值 |
| metric_analysis[].deviation_percentage | Number | 偏差百分比 |
| metric_analysis[].trend | String | 趋势（declining / stable / increasing） |
| metric_analysis[].relationships | Array | 指标关系分析 |

#### 2.2.5 诊断

| Field | Type | Description |
|-------|------|-------------|
| diagnosis[].rule_id | String | 规则 ID |
| diagnosis[].metric | String | 指标名称 |
| diagnosis[].evidence_id | String | 关联证据 ID |
| diagnosis[].value | Number | 数值 |
| diagnosis[].condition | String | 触发条件 |
| diagnosis[].status | String | 状态（critical / warning / info / good） |
| diagnosis[].severity | String | 严重程度（high / medium / low） |
| diagnosis[].recommendation | String | 建议 |
| diagnosis[].campaign | String | 关联 Campaign |

#### 2.2.6 行动清单

| Field | Type | Description |
|-------|------|-------------|
| action_plan[].priority | String | 优先级（P0 / P1 / P2） |
| action_plan[].action | String | 行动名称 |
| action_plan[].issue | String | 关联问题 |
| action_plan[].details | String | 详细步骤 |
| action_plan[].expected_impact | String | 预期效果 |
| action_plan[].related_evidence | Array | 关联证据 ID |
| action_plan[].related_diagnosis | Array | 关联诊断 ID |

#### 2.2.7 LLM 解释

| Field | Type | Description |
|-------|------|-------------|
| llm_explanation.executive_summary | String | 执行摘要 |
| llm_explanation.diagnosis | String | 诊断说明（Markdown） |
| llm_explanation.action_plan | String | 行动清单（Markdown） |

#### 2.2.8 警告和元数据

| Field | Type | Description |
|-------|------|-------------|
| warnings | Array | 警告信息（数据不足、缺少视频数据等） |
| metadata.analysis_duration_ms | Number | 分析耗时（毫秒） |
| metadata.model_used | String | 使用的 AI 模型 |
| metadata.ars_version | String | ARS 版本 |
| metadata.are_version | String | ARE 版本 |

---

## 3. 网页报告格式（5-Page Report）

### 3.1 Page 1: Executive Summary

**布局：**
```
┌─────────────────────────────────────────┐
│  Overall Score: 78/100                  │
├─────────────────────────────────────────┤
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐│
│  │Perf  │  │Effic │  │Deliv │  │Risk  ││
│  │ 75   │  │ 82   │  │ 90   │  │ 65   ││
│  └──────┘  └──────┘  └──────┘  └──────┘│
├─────────────────────────────────────────┤
│  Key Findings:                          │
│  1. CTR is 0.87%, below benchmark 1.5% │
│  2. ROAS is 3.2x, above target 2.5x    │
│  3. Frequency is 2.3, ad fatigue risk  │
└─────────────────────────────────────────┘
```

**数据来源：**
- scores.overall → Overall Score
- scores.performance/efficiency/delivery/risk → 四个维度评分
- llm_explanation.executive_summary → Key Findings

---

### 3.2 Page 2: Campaign Comparison

**布局：**
```
┌─────────────────────────────────────────┐
│  Campaign Comparison                    │
├─────────────────────────────────────────┤
│  Campaign      │ Score │ CTR  │ ROAS   │
│  ──────────────┼───────┼──────┼────────│
│  Summer Sale   │ 89    │ 2.34%│ 3.2x   │
│  Brand Aware   │ 58    │ 0.87%│ 1.2x   │
│  Retargeting   │ 81    │ 1.95%│ 4.5x   │
└─────────────────────────────────────────┘
```

**数据来源：**
- 遍历所有 Campaign，展示 scores.overall 和关键指标

---

### 3.3 Page 3: Metric Analysis

**布局：**
```
┌─────────────────────────────────────────┐
│  Metric Analysis                        │
├─────────────────────────────────────────┤
│  CTR (Click-Through Rate)               │
│  Value: 0.87%  Benchmark: 1.5%          │
│  Status: ⚠️ Warning                     │
│  Evidence: CTR-001                      │
│  Trend: 📉 Declining (-42%)             │
│                                         │
│  Analysis: CTR is below benchmark...    │
├─────────────────────────────────────────┤
│  ROAS (Return on Ad Spend)              │
│  Value: 3.2x   Benchmark: 2.5x          │
│  Status: ✅ Good                        │
│  Evidence: ROAS-001                     │
│  Trend: ➡️ Stable (+28%)                │
└─────────────────────────────────────────┘
```

**数据来源：**
- metric_analysis[] → 每个指标的详细信息
- evidence[] → 证据 ID 和来源
- llm_explanation.diagnosis → 分析说明

---

### 3.4 Page 4: Diagnosis

**布局：**
```
┌─────────────────────────────────────────┐
│  Diagnosis                              │
├─────────────────────────────────────────┤
│  The Brand Awareness campaign shows a   │
│  CTR of 0.87% (Evidence: CTR-001),      │
│  which is below the industry benchmark  │
│  of 1.5%. This suggests that the        │
│  creative is not attracting enough      │
│  attention relative to impressions.     │
│                                         │
│  Additionally, the campaign has a high  │
│  frequency of 2.3 (Evidence: FREQ-001), │
│  indicating potential ad fatigue.       │
└─────────────────────────────────────────┘
```

**数据来源：**
- llm_explanation.diagnosis → 诊断说明（Markdown）
- diagnosis[] → 诊断结论（可展开查看详情）

---

### 3.5 Page 5: Action Plan

**布局：**
```
┌─────────────────────────────────────────┐
│  Action Plan                            │
├─────────────────────────────────────────┤
│  P1: Improve Creative                   │
│  Issue: Low CTR (0.87% vs 1.5%)         │
│  Action: Test new ad creative with      │
│          stronger hook and clearer CTA  │
│  Impact: CTR improvement to 1.5%+       │
│                                         │
│  P2: Refresh Audience                   │
│  Issue: High Frequency (2.3)            │
│  Action: Exclude audiences who have     │
│          seen the ad 3+ times           │
│  Impact: Frequency reduction to < 2.0   │
└─────────────────────────────────────────┘
```

**数据来源：**
- action_plan[] → 行动清单
- llm_explanation.action_plan → 行动说明（Markdown）

---

## 4. PDF 导出格式

### 4.1 PDF 结构

```
Page 1: Cover Page
- Report Title
- Campaign Name
- Platform
- Date Range
- Generated At
- Overall Score

Page 2: Executive Summary
- 同网页报告 Page 1

Page 3: Campaign Comparison
- 同网页报告 Page 2

Page 4: Metric Analysis
- 同网页报告 Page 3

Page 5: Diagnosis
- 同网页报告 Page 4

Page 6: Action Plan
- 同网页报告 Page 5

Page 7: Appendix
- Full Evidence List
- Rule Details
- Technical Metadata
```

### 4.2 PDF 样式

- 字体：Inter / Roboto
- 颜色：
  - Critical: #EF4444 (Red)
  - Warning: #F59E0B (Yellow)
  - Good: #10B981 (Green)
  - Info: #3B82F6 (Blue)
- 页面尺寸：A4
- 页眉：AdsCraft Logo + Report ID
- 页脚：Page Number + Generated At

---

## 5. API 响应格式

### 5.1 获取报告

**Endpoint:** `GET /api/reports/{report_id}`

**Response:**
```json
{
  "success": true,
  "data": {
    // 完整 JSON 结构（AOS Core）
  }
}
```

### 5.2 获取报告列表

**Endpoint:** `GET /api/reports`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "report_id": "rpt_20260630_001",
      "platform": "facebook",
      "campaign_name": "Brand Awareness",
      "generated_at": "2026-06-30T02:00:00Z",
      "overall_score": 78
    },
    {
      "report_id": "rpt_20260629_002",
      "platform": "tiktok",
      "campaign_name": "Summer Collection",
      "generated_at": "2026-06-29T15:30:00Z",
      "overall_score": 72
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "per_page": 10
  }
}
```

### 5.3 创建报告

**Endpoint:** `POST /api/reports`

**Request:**
```json
{
  "platform": "facebook",
  "data_source": {
    "type": "OCR",
    "screenshot_url": "https://xxx.png"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "report_id": "rpt_20260630_003",
    "status": "processing",
    "message": "Report is being generated"
  }
}
```

---

## 6. 邮件摘要格式

### 6.1 邮件结构

```
Subject: AdsCraft Report: Brand Awareness (Score: 78/100)

Body:

Hi [User Name],

Your AdsCraft report for "Brand Awareness" is ready.

Overall Score: 78/100

Key Findings:
- CTR is 0.87%, below benchmark of 1.5%
- ROAS is 3.2x, above target of 2.5x
- Frequency is 2.3, indicating ad fatigue risk

Top Actions:
P1: Improve Creative - Test new ad creative with stronger hook
P2: Refresh Audience - Exclude audiences who have seen the ad 3+ times

View Full Report: [Link]

Best,
AdsCraft Team
```

### 6.2 邮件数据来源

- scores.overall → Overall Score
- llm_explanation.executive_summary → Key Findings
- action_plan[0:2] → Top Actions（只取前 2 个）

---

## 7. 历史记录存储格式

### 7.1 数据库表结构

**Table: reports**
```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id),
  platform VARCHAR(20) NOT NULL,
  campaign_name VARCHAR(255),
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_source JSONB,
  date_range VARCHAR(50),
  overall_score INTEGER,
  performance_score INTEGER,
  efficiency_score INTEGER,
  delivery_score INTEGER,
  risk_score INTEGER,
  full_json JSONB,  -- 完整 JSON 结构
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Table: evidence**
```sql
CREATE TABLE evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id VARCHAR(50) REFERENCES reports(report_id),
  evidence_id VARCHAR(50) NOT NULL,
  metric VARCHAR(50) NOT NULL,
  value DECIMAL,
  value_formatted VARCHAR(50),
  benchmark DECIMAL,
  benchmark_formatted VARCHAR(50),
  status VARCHAR(20),
  campaign VARCHAR(255),
  source JSONB,
  timestamp TIMESTAMP WITH TIME ZONE,
  UNIQUE(report_id, evidence_id)
);
```

**Table: diagnosis**
```sql
CREATE TABLE diagnosis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id VARCHAR(50) REFERENCES reports(report_id),
  rule_id VARCHAR(50) NOT NULL,
  metric VARCHAR(50),
  evidence_id VARCHAR(50),
  value DECIMAL,
  condition VARCHAR(255),
  status VARCHAR(20),
  severity VARCHAR(20),
  recommendation TEXT,
  campaign VARCHAR(255)
);
```

### 7.2 查询示例

**获取用户所有报告：**
```sql
SELECT report_id, platform, campaign_name, overall_score, generated_at
FROM reports
WHERE user_id = $1
ORDER BY generated_at DESC;
```

**获取报告详情：**
```sql
SELECT full_json FROM reports WHERE report_id = $1;
```

**获取报告的所有证据：**
```sql
SELECT * FROM evidence WHERE report_id = $1 ORDER BY metric;
```

**获取报告的所有诊断：**
```sql
SELECT * FROM diagnosis WHERE report_id = $1 ORDER BY severity, status;
```

---

## 8. 错误输出格式

### 8.1 API 错误

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_DATA",
    "message": "Not enough data for reliable analysis",
    "details": {
      "spend": 32.50,
      "required_spend": 50.00,
      "results": 12,
      "required_results": 50
    },
    "suggestion": "Wait for more spend and results before generating diagnosis"
  }
}
```

### 8.2 警告输出

```json
{
  "warnings": [
    {
      "code": "INSUFFICIENT_DATA",
      "message": "Not enough data for reliable analysis",
      "metrics": ["Spend", "Results"],
      "suggestion": "Wait for more spend and results"
    },
    {
      "code": "VIDEO_DATA_NOT_AVAILABLE",
      "message": "Video data not available, Hook analysis disabled",
      "missing_fields": ["6s View Rate", "Average Watch Time"],
      "suggestion": "Please provide video data for Hook analysis"
    }
  ]
}
```

---

## 9. AOS 演进计划

### V1（当前）
- 统一 JSON 结构
- 网页报告（5-Page Report）
- 基础 API 响应
- 邮件摘要
- 历史记录存储

### V2（未来）
- PDF 导出
- 多语言支持
- 自定义报告模板
- 报告对比功能

### V3（长期）
- 实时 Dashboard
- 自动报告调度（每天/每周自动生成）
- 报告分享和协作
- 报告版本管理

---

> 本内容由 Coze AI 生成，请遵循相关法律法规及《人工智能生成合成内容标识办法》使用与传播。

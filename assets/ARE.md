---
AIGC:
    Label: "1"
    ContentProducer: 001191110102MACQD9K64018705
    ProduceID: 7634029171441664308-data_volume/files/所有对话/主对话/上传给扣子/ARE.md
    ReservedCode1: ""
    ContentPropagator: 001191110102MACQD9K64028705
    PropagateID: 3476033405197864#1782759382833
    ReservedCode2: ""
---
# AdsCraft Review Engine (ARE)

> 版本：v1
> 更新日期：2026-06-30
> 职责：执行引擎，负责从原始数据到最终评分的完整处理流程

---

## 1. ARE 概述

ARE（AdsCraft Review Engine）是 AdsCraft 的执行引擎，负责从原始数据到最终评分的完整处理流程。

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

**关键设计：**
- ARE 是平台无关的（除了 Parser）
- Evidence Engine 在 Parser 之后，Metric/Rule Engine 之前
- Metric Engine 负责计算和对比指标
- Rule Engine 负责触发诊断规则
- 下游引擎只消费统一的 Evidence，不关心数据来源

---

## 2. OCR Engine

### 2.1 职责

识别截图中的文字和坐标，输出 Raw Text + Coordinates。

### 2.2 技术选型

| 方案 | 优点 | 缺点 | 推荐 |
|------|------|------|------|
| Google Vision API | 准确率高，支持多语言 | 收费 | ✅ 推荐 |
| Azure OCR | 准确率高，支持表格 | 收费 | ✅ 备选 |
| Tesseract | 免费 | 准确率较低 | ❌ 不推荐 |

### 2.3 输入输出

**输入：**
- 截图文件（PNG/JPG）

**输出：**
```json
{
  "text_blocks": [
    {
      "text": "Campaign Name",
      "confidence": 0.98,
      "bounding_box": {
        "x": 100,
        "y": 50,
        "width": 200,
        "height": 30
      }
    },
    {
      "text": "CTR",
      "confidence": 0.96,
      "bounding_box": {
        "x": 300,
        "y": 50,
        "width": 50,
        "height": 30
      }
    },
    {
      "text": "2.34%",
      "confidence": 0.95,
      "bounding_box": {
        "x": 300,
        "y": 100,
        "width": 60,
        "height": 30
      }
    }
  ]
}
```

---

## 3. Parser

### 3.1 职责

将 OCR 输出的 Raw Text + Coordinates 结构化，识别字段并映射为 JSON。

### 3.2 Facebook Parser

**识别逻辑：**
1. 识别表头（Campaign Name, Delivery, Budget, Amount Spent, Results, Cost per Result, CTR, CPC, Frequency, ROAS）
2. 根据表头位置识别每一列
3. 根据行位置识别每个 Campaign
4. 将数值转换为标准格式（百分比、金额、数字）

**输入：** OCR 输出（Raw Text + Coordinates）

**输出：**
```json
{
  "platform": "facebook",
  "data_source": {
    "type": "OCR",
    "screenshot_url": "xxx.png",
    "ocr_confidence": 0.96
  },
  "date_range": "Last 7 days",
  "campaigns": [
    {
      "name": "Summer Sale",
      "delivery": "Active",
      "budget": 50.00,
      "spent": 342.18,
      "results": 89,
      "cpr": 3.84,
      "impressions": 89234,
      "reach": 75621,
      "ctr": 2.34,
      "cpc": 3.84,
      "frequency": 1.18,
      "roas": 3.2
    },
    {
      "name": "Brand Awareness",
      "delivery": "Active",
      "budget": 30.00,
      "spent": 156.42,
      "results": 12,
      "cpr": 13.03,
      "impressions": 45678,
      "reach": 38912,
      "ctr": 0.87,
      "cpc": 5.23,
      "frequency": 1.17,
      "roas": 1.2
    }
  ]
}
```

### 3.3 TikTok Parser

**识别逻辑：**
1. 识别表头（Campaign Name, Status, Budget, Spend, Video Views, 6s Views, Avg Watch Time, CTR, CVR, CPA, ROAS）
2. 根据表头位置识别每一列
3. 根据行位置识别每个 Campaign
4. 将数值转换为标准格式

**输入：** OCR 输出 或 TikTok API 数据

**输出：**
```json
{
  "platform": "tiktok",
  "data_source": {
    "type": "OCR",
    "screenshot_url": "xxx.png",
    "ocr_confidence": 0.94
  },
  "date_range": "Last 7 days",
  "campaigns": [
    {
      "name": "Summer Collection",
      "status": "Active",
      "budget": 100.00,
      "spend": 523.45,
      "video_views": 125000,
      "6s_views": 31250,
      "6s_view_rate": 25.0,
      "avg_watch_time": 4.2,
      "ctr": 1.85,
      "cvr": 3.2,
      "cpa": 8.50,
      "roas": 2.8,
      "clicks": 2312,
      "results": 62
    }
  ]
}
```

---

## 4. Evidence Engine（证据引擎）

### 4.1 职责

在 Parser 之后、Metric/Rule Engine 之前，将原始数据标准化为带 Provenance 的 Evidence。

### 4.2 核心设计

- Evidence 是不可变的（Immutable）
- 每条 Evidence 必须有唯一 ID
- Evidence 包含完整的 Provenance（来源信息）
- 下游引擎只消费 Evidence，不关心数据来源

### 4.3 输入输出

**输入：** Parser 输出的 JSON

**输出：** Evidence 列表

```json
{
  "evidence_list": [
    {
      "evidence_id": "CTR-001",
      "metric": "CTR",
      "value": 0.87,
      "value_formatted": "0.87%",
      "campaign": "Brand Awareness",
      "platform": "facebook",
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
      "campaign": "Summer Sale",
      "platform": "facebook",
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
      "campaign": "Brand Awareness",
      "platform": "facebook",
      "source": {
        "type": "OCR",
        "column": "Frequency",
        "row": "Brand Awareness",
        "confidence": 0.96
      },
      "timestamp": "2026-06-30T02:00:00Z"
    }
  ]
}
```

### 4.4 Evidence ID 命名规范

```
{METRIC}-{SEQUENCE}

示例：
CTR-001  → 第 1 条 CTR 证据
ROAS-001 → 第 1 条 ROAS 证据
FREQ-001 → 第 1 条 Frequency 证据
6S-001   → 第 1 条 6s View Rate 证据
```

### 4.5 Provenance 设计

**数据来源 = OCR：**
```json
{
  "source": {
    "type": "OCR",
    "column": "CTR",
    "row": "Brand Awareness",
    "confidence": 0.98
  }
}
```

**数据来源 = Meta API：**
```json
{
  "source": {
    "type": "Meta API",
    "field": "ctr",
    "api_version": "v18.0",
    "advertiser_id": "xxx"
  }
}
```

**数据来源 = TikTok API：**
```json
{
  "source": {
    "type": "TikTok API",
    "field": "ctr",
    "api_version": "v1.2",
    "advertiser_id": "xxx"
  }
}
```

**数据来源 = CSV：**
```json
{
  "source": {
    "type": "CSV",
    "file_name": "campaign_data.csv",
    "column": "CTR",
    "row": 5
  }
}
```

**关键：** 下游引擎（Metric/Rule/Score/LLM）看到的 Evidence 格式完全相同，不需要修改。

---

## 5. Metric Engine（指标分析引擎）

### 5.1 职责

读取 Evidence，计算指标状态，对比 Benchmarks，分析指标关系和趋势。

**关键区别：**
- Metric Engine 回答："指标是什么状态？"（计算 + 对比）
- Metric Engine 不做诊断判断，只做数据计算和对比

### 5.2 核心功能

#### 5.2.1 单指标状态判断

- 计算指标数值
- 对比 Benchmark
- 判断状态（Above / Below / On Target）

**示例：**
```json
{
  "metric": "CTR",
  "value": 0.87,
  "value_formatted": "0.87%",
  "benchmark": 1.5,
  "benchmark_formatted": "1.5%",
  "status": "below_benchmark",
  "deviation": -0.63,
  "deviation_percentage": -42
}
```

#### 5.2.2 指标关系分析

- High CTR + Low CVR = Landing Page Issue
- High Impressions + Low CTR = Creative Issue
- High Frequency + Low ROAS = Ad Fatigue
- High Spend + Low Results = Insufficient Optimization

**示例：**
```json
{
  "relationship": "high_ctr_low_cvr",
  "metrics": [
    { "metric": "CTR", "status": "above_benchmark" },
    { "metric": "CVR", "status": "below_benchmark" }
  ],
  "diagnosis": "Landing Page Issue",
  "explanation": "High click-through rate but low conversion rate indicates a potential landing page issue."
}
```

#### 5.2.3 趋势对比

- CTR 从 1.2% 降到 0.87% → Declining Trend
- ROAS 从 2.5x 升到 3.2x → Improving Trend
- Frequency 从 1.5 升到 2.3 → Increasing Trend（可能是负面）

**示例：**
```json
{
  "metric": "CTR",
  "current_value": 0.87,
  "previous_value": 1.2,
  "trend": "declining",
  "change": -0.33,
  "change_percentage": -27.5
}
```

### 5.3 输入输出

**输入：**
- Evidence 列表
- ARS Benchmarks

**输出：** 指标分析报告

```json
{
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
    }
  ]
}
```

---

## 6. Rule Engine（规则引擎）

### 6.1 职责

读取 Metric Engine 的结果，应用 ARS Rules，触发诊断规则。

**关键区别：**
- Rule Engine 回答："需要触发什么诊断？"（规则判断）
- Rule Engine 不做数据计算，只做规则匹配和诊断触发

### 6.2 核心功能

#### 6.2.1 触发诊断规则

- CTR Below Benchmark → Trigger Rule FB-CTR-002
- Frequency > 2.0 → Trigger Rule FB-FREQ-002
- Spend < $50 → Trigger Rule FB-SPEND-001（Insufficient Data）

#### 6.2.2 判断严重程度

- Critical / Warning / Info

#### 6.2.3 关联 Evidence

- 每个诊断结论必须关联 Evidence ID

### 6.3 输入输出

**输入：**
- Metric 分析结果
- ARS Rules

**输出：** 诊断结论

```json
{
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
  ]
}
```

### 6.4 规则匹配逻辑

```python
def match_rules(metric_analysis, ars_rules):
    diagnosis = []
    
    for metric in metric_analysis:
        # 获取该指标的所有规则
        rules = ars_rules.get_rules_for_metric(metric['metric'])
        
        for rule in rules:
            # 检查是否满足规则条件
            if rule.check_condition(metric['value']):
                diagnosis.append({
                    'rule_id': rule.id,
                    'metric': metric['metric'],
                    'evidence_id': metric['evidence_id'],
                    'value': metric['value'],
                    'condition': rule.condition,
                    'status': rule.status,
                    'severity': rule.severity,
                    'recommendation': rule.recommendation
                })
    
    return diagnosis
```

---

## 7. Score Engine（评分引擎）

### 7.1 职责

读取 Rule Engine 和 Metric Engine 的结果，计算评分。

### 7.2 核心设计

- 评分完全由程序计算
- AI 不参与打分
- 评分算法可配置（按行业/按平台）

### 7.3 评分算法

```
Overall Score = (Performance + Efficiency + Delivery + Risk) / 4

Performance = f(ROAS, CPA, Results)
Efficiency = f(CTR, CPC, CPM)
Delivery = f(Spend, Budget Utilization, Learning Phase)
Risk = f(Frequency, Policy Compliance, Data Sufficiency)
```

**评分计算逻辑：**

```python
def calculate_scores(diagnosis, metric_analysis):
    # Performance Score
    performance_score = 100
    for d in diagnosis:
        if d['metric'] in ['ROAS', 'CPA', 'Results']:
            if d['status'] == 'critical':
                performance_score -= 30
            elif d['status'] == 'warning':
                performance_score -= 15
    
    # Efficiency Score
    efficiency_score = 100
    for d in diagnosis:
        if d['metric'] in ['CTR', 'CPC', 'CPM']:
            if d['status'] == 'critical':
                efficiency_score -= 30
            elif d['status'] == 'warning':
                efficiency_score -= 15
    
    # Delivery Score
    delivery_score = 100
    for d in diagnosis:
        if d['metric'] in ['Spend', 'Results']:
            if d['status'] == 'warning':  # Insufficient data
                delivery_score -= 20
    
    # Risk Score
    risk_score = 100
    for d in diagnosis:
        if d['metric'] in ['Frequency']:
            if d['status'] == 'critical':
                risk_score -= 40
            elif d['status'] == 'warning':
                risk_score -= 20
    
    # Overall Score
    overall_score = (performance_score + efficiency_score + delivery_score + risk_score) / 4
    
    return {
        'overall': round(overall_score),
        'performance': round(performance_score),
        'efficiency': round(efficiency_score),
        'delivery': round(delivery_score),
        'risk': round(risk_score)
    }
```

### 7.4 输入输出

**输入：**
- Rule 诊断结果
- Metric 分析结果

**输出：**

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

---

## 8. LLM Explanation（AI 解释层）

### 8.1 职责

基于 Evidence 和诊断结果，生成自然语言报告和行動建议。

### 8.2 AI 可以做什么

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

### 8.3 AI 不能做什么

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

### 8.4 AI 输入格式

```json
{
  "evidence": [
    {
      "evidence_id": "CTR-001",
      "metric": "CTR",
      "value": 0.87,
      "value_formatted": "0.87%",
      "benchmark": 1.5,
      "status": "below"
    }
  ],
  "metric_analysis": [
    {
      "metric": "CTR",
      "value": 0.87,
      "benchmark": 1.5,
      "status": "below_benchmark",
      "trend": "declining"
    }
  ],
  "diagnosis": [
    {
      "rule_id": "FB-CTR-002",
      "status": "warning",
      "severity": "medium",
      "recommendation": "Review creative and audience targeting"
    }
  ],
  "scores": {
    "overall": 78,
    "performance": 75,
    "efficiency": 82,
    "delivery": 90,
    "risk": 65
  },
  "platform": "facebook",
  "campaign_name": "Brand Awareness"
}
```

### 8.5 AI 输出格式

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

## 9. 完整数据流

```
Screenshot / API Data
│
▼
OCR Engine（截图） / API Parser（API 数据）
│
▼
Raw Text + Coordinates / API JSON
│
▼
Parser（结构化 → JSON）
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

## 10. 错误处理

### 10.1 OCR 失败

```json
{
  "error": "OCR_FAILED",
  "message": "Failed to recognize text from screenshot",
  "suggestion": "Please upload a clearer screenshot or try API integration"
}
```

### 10.2 Parser 失败

```json
{
  "error": "PARSER_FAILED",
  "message": "Failed to parse structured data",
  "suggestion": "Please ensure the screenshot contains a valid Ads Manager table"
}
```

### 10.3 数据不足

```json
{
  "warning": "INSUFFICIENT_DATA",
  "message": "Not enough data for reliable analysis",
  "details": {
    "spend": 32.50,
    "required_spend": 50.00,
    "results": 12,
    "required_results": 50
  },
  "suggestion": "Wait for more spend and results before generating diagnosis"
}
```

### 10.4 缺少视频数据（TikTok）

```json
{
  "warning": "VIDEO_DATA_NOT_AVAILABLE",
  "message": "Video data not available, Hook analysis disabled",
  "missing_fields": ["6s View Rate", "Average Watch Time"],
  "suggestion": "Please provide video data or upload video for Hook analysis"
}
```

---

> 本内容由 Coze AI 生成，请遵循相关法律法规及《人工智能生成合成内容标识办法》使用与传播。

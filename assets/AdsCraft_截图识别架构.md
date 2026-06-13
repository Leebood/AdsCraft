---
AIGC:
    Label: "1"
    ContentProducer: 001191110102MACQD9K64018705
    ProduceID: 7634029171441664308-data_volume/files/所有对话/主对话/recent_memory/project/AdsCraft_截图识别架构.md
    ReservedCode1: ""
    ContentPropagator: 001191110102MACQD9K64028705
    PropagateID: 3476033405197864#1781335263681
    ReservedCode2: ""
---
# AdsCraft 截图识别与AI分析 — 架构文档

## 产品目标

用户上传Facebook Ads Manager截图，AI自动提取广告指标，结合历史数据出分析结论，一个页面完成全部操作。

## 数据流

```
上传截图 → Vercel调GPT-4o-mini提取指标 → 用户确认 → 写入Supabase
→ 拉历史数据调GPT-4o-mini出分析 → 页面展示数据+结论
```

## 技术栈

| 组件 | 选型 | 说明 |
|---|---|---|
| 前端 | Bolt.new | 新增分析功能页 |
| 后端 | Vercel API Route (App Router) | 截图识别+入库+分析 |
| 视觉/分析模型 | GPT-4o-mini | 提取指标+生成分析结论 |
| 数据库 | Supabase（已有） | 新增ad_snapshots表 |
| 用户系统 | Supabase Auth（已有） | 复用现有登录注册 |
| 图片存储 | Cloudflare R2 或 Vercel Blob | 原始截图暂存 |

## 数据库

### 新增表：ad_snapshots

```sql
CREATE TABLE ad_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_name TEXT,
  snapshot_date DATE,
  spend DECIMAL(10,2),
  impressions INTEGER,
  clicks INTEGER,
  ctr DECIMAL(5,2),
  cpc DECIMAL(10,2),
  conversions INTEGER,
  cpa DECIMAL(10,2),
  roas DECIMAL(10,2),
  raw_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ad_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户只能访问自己的广告数据"
ON ad_snapshots FOR ALL
USING (auth.uid() = user_id);
```

## API设计

### 1. 截图识别接口

```
POST /api/analyze-screenshot
```

请求：multipart/form-data，图片文件（≤5MB，JPG/PNG/WEBP）

处理：
1. 图片存对象存储，获取URL
2. 调GPT-4o-mini提取指标

提取Prompt：
```
这是一张Facebook Ads Manager的截图。请提取以下指标返回JSON：
campaign_name, snapshot_date, spend, impressions, clicks, ctr, cpc, conversions, cpa, roas
找不到的指标返回null。
```

返回示例：
```json
{
  "campaign_name": "Summer Sale 2026",
  "snapshot_date": "2026-06-12",
  "spend": 156.30,
  "impressions": 28400,
  "clicks": 892,
  "ctr": 3.14,
  "cpc": 0.18,
  "conversions": 23,
  "cpa": 6.79,
  "roas": 2.8,
  "raw_image_url": "https://xxx.r2.dev/abc.jpg"
}
```

### 2. 确认入库+分析接口

```
POST /api/confirm-snapshot
```

请求：用户确认后的指标JSON（允许修正后提交）

处理：
1. 写入Supabase ad_snapshots表
2. 查询该用户历史数据
3. 调GPT-4o-mini生成分析结论一并返回

分析Prompt：
```
以下是该用户的广告数据记录：
[从Supabase查询的结构化JSON]

请生成分析结论：
- 1条数据时：各指标与行业基准对比，判断好坏，给出建议
- 2条+数据时：趋势变化分析，指出异常指标，给出优化方向
- 5条+数据时：异常检测、广告组对比、具体优化路径

用简洁的中文，分点输出，不超过300字。
```

返回示例：
```json
{
  "saved": true,
  "analysis": "CTR 3.2%高于行业均值1.8%，表现不错。但近7天CTR从3.2%降至2.1%，CPC从$0.18涨至$0.27，广告正在衰退。建议：1.刷新广告素材；2.测试新受众包；3.降低日耗观察CPA变化。"
}
```

### 3. 历史分析接口

```
GET /api/ad-analysis?days=30
```

请求：用户session自动获取user_id，days为查询天数（默认30）

处理：从Supabase拉历史数据，调GPT-4o-mini出趋势分析

返回：历史数据列表 + 分析结论

## 前端页面

### 分析功能页（/dashboard/analysis）

一个页面完成全部操作，分三个区域从上到下：

**区域1：上传区**
- 拖拽/点击上传截图
- 上传后显示AI提取结果，每项可编辑修正
- 确认按钮

**区域2：数据区**
- 历史数据表格（日期、花费、CTR、CPC、CPA、ROAS）
- 时间范围筛选

**区域3：分析区**
- 每次入库后自动刷新分析结论
- 历史分析记录可回看

## 前置条件与异常处理

| 场景 | 处理方式 |
|---|---|
| 未登录 | 所有接口返回401，前端跳登录页 |
| 0条数据 | 分析区显示"上传第一张截图，解锁AI分析" |
| 1条数据 | 出基准诊断（与行业基准对比） |
| 2条+数据 | 出趋势分析 |
| 图片超过5MB | 接口拒绝，前端提示"图片过大，请重新截图" |
| 识别超时 | 7秒超时，返回提示让用户重试 |

## 与Coze Bot的关系

- 本次开发不涉及Bot改动
- Bot后续通过Supabase REST API读取ad_snapshots数据，做深度多轮对话诊断
- 配置方式：Coze工作流加HTTP请求节点，用anon key + RLS保证数据隔离
- 两条线共享同一份数据，互不依赖

### Bot连接Supabase配置

```
请求方式：GET
URL：https://{project}.supabase.co/rest/v1/ad_snapshots?user_id=eq.{用户ID}&order=created_at.desc&limit=30

Headers：
  apikey: {Supabase Anon Key}
  Authorization: Bearer {Supabase Anon Key}
```

注意：只用anon key，不用service_role key。

## 开发需要提供的配置

| 配置项 | 说明 | 获取位置 |
|---|---|---|
| Supabase Project URL | https://xxxx.supabase.co | Supabase后台 → Settings → API |
| Supabase Anon Key | eyJ开头长字符串 | Supabase后台 → Settings → API |
| GPT-4o-mini API Key | sk-开头 | OpenAI后台 |
| R2/Blob 存储配置 | 按实际选型提供 | 对应平台后台 |

## 成本

| 项目 | 费用 |
|---|---|
| Vercel免费版 | $0 |
| GPT-4o-mini | 约$0.003/次截图 + $0.003/次分析 |
| Supabase免费版 | $0 |
| 图片存储 | $0（R2免费10GB） |

单次完整流程（上传+分析）约0.6分钱人民币。

## 开发步骤

### Step 1：Supabase建表
执行上方SQL，创建ad_snapshots表+RLS策略，验证表结构和权限

### Step 2：截图识别API
实现 POST /api/analyze-screenshot，接收图片→存对象存储→调GPT-4o-mini→返回结构化JSON，7秒超时兜底

### Step 3：确认入库+分析API
实现 POST /api/confirm-snapshot，写入Supabase→查询历史→调GPT-4o-mini分析→返回结论

### Step 4：历史分析API
实现 GET /api/ad-analysis，查询历史数据→生成趋势分析→返回

### Step 5：前端分析页
实现 /dashboard/analysis 页面，上传区+数据区+分析区三区域布局，对接上述API

### Step 6：联调测试
验证截图识别准确率、入库流程、分析输出质量、异常处理

### Step 7：上线

---

> 本内容由 Coze AI 生成，请遵循相关法律法规及《人工智能生成合成内容标识办法》使用与传播。

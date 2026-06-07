---
AIGC:
    Label: "1"
    ContentProducer: 001191110102MACQD9K64018705
    ProduceID: 7634029171441664308-data_volume/files/所有对话/主对话/recent_memory/project/AdsCraft_前期设置Checklist.md
    ReservedCode1: ""
    ContentPropagator: 001191110102MACQD9K64028705
    PropagateID: 3476033405197864#1780823265190
    ReservedCode2: ""
---
# AdsCraft — 前期设置Checklist

## 功能说明

在主流程"选路线"和"回答3问"之间插入一个前期设置检查步骤。用户必须确认3项关键前置条件已完成，才能进入问答生成方案。

## 流程位置

```
首页 → 选路线（4选1）→ 前期设置Checklist → 回答3问 → 拿通用方案
```

## Checklist内容

### 🔴 必须完成（未勾选时"下一步"按钮disabled）

| 序号 | 步骤 | 说明 |
|------|------|------|
| 1 | 创建/连接Facebook Page + Instagram账号 | 没有Page跑不了广告，这是最基础的前提 |
| 2 | 创建广告账户 | 设好时区+币种（改不了），在Page后台或Business Settings里创建 |
| 3 | 安装Meta Pixel + CAPI | Pixel浏览器端追踪，CAPI服务器端追踪，缺一不可（iOS 14.5后单靠Pixel数据丢40%+） |

### 🟡 建议完成（不阻断，提示"投放前建议完成"）

| 序号 | 步骤 | 说明 |
|------|------|------|
| 4 | 验证域名 | Business Settings → Brand Safety → Domains |
| 5 | 配置Web事件 | 设置转化事件（Purchase/Lead/Contact等） |

### 🟢 可选（特定路线或规模才需要）

| 序号 | 步骤 | 说明 |
|------|------|------|
| 6 | 创建Meta Business Suite | 单个Page可以直接投，BM是管理多主页/多广告账户时才需要 |
| 7 | 注册WhatsApp Business API | 通过BSP接入，不是下个App就完了；WhatsApp接单路线必须 |

## UI交互逻辑

1. 页面顶部显示进度提示："第2步 / 共4步 — 确认你的Facebook广告基础设置"
2. 7项以Checklist形式展示，🔴项带红色标记，🟡项带黄色标记，🟢项带灰色标记
3. 🔴3项全部勾选✓后，"下一步"按钮从disabled变为可点击
4. 🟡🟢项未勾选不影响继续，但显示提示文字："投放前建议完成"
5. 每项右侧有"查看详细步骤"链接，点击跳转到前期设置详情页
6. 已有Page/Pixel的用户直接勾选✓跳过，不需要重新操作

## 组件

- 组件名：`PreSetupChecklist`
- 位置：`components/shared/PreSetupChecklist.tsx`
- 路由：`app/[locale]/setup-checklist/page.tsx`

## 数据模型

勾选状态存入`user_checklist`表：

| 字段 | 值 |
|------|-----|
| item_key | `pre_setup_page` / `pre_setup_ad_account` / `pre_setup_pixel` / `pre_setup_domain` / `pre_setup_events` / `pre_setup_bm` / `pre_setup_whatsapp` |
| checked | boolean |

## 国际化

翻译key示例（messages/en.json）：

```json
{
  "setup_checklist": {
    "title": "Confirm Your Facebook Ads Setup",
    "step": "Step 2 of 4",
    "required": "Required — you need this to run ads",
    "recommended": "Recommended — complete before launching",
    "optional": "Optional — needed for specific routes",
    "items": {
      "page": "Facebook Page + Instagram Account",
      "page_desc": "You can't run ads without a Page",
      "ad_account": "Ad Account",
      "ad_account_desc": "Set timezone & currency (can't change later)",
      "pixel": "Meta Pixel + CAPI",
      "pixel_desc": "Browser + server tracking, both required (iOS 14.5+ loses 40%+ data without CAPI)",
      "domain": "Domain Verification",
      "domain_desc": "Business Settings → Brand Safety → Domains",
      "events": "Web Event Configuration",
      "events_desc": "Set up conversion events (Purchase/Lead/Contact)",
      "bm": "Meta Business Suite",
      "bm_desc": "Only needed for multiple Pages or ad accounts",
      "whatsapp": "WhatsApp Business API",
      "whatsapp_desc": "Required for WhatsApp order route; via BSP, not just the app"
    },
    "view_steps": "View detailed steps",
    "next": "Next",
    "next_disabled": "Complete the 3 required items to continue"
  }
}
```

---

> 本内容由 Coze AI 生成，请遵循相关法律法规及《人工智能生成合成内容标识办法》使用与传播。

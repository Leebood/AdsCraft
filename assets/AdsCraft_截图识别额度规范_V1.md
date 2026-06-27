---
AIGC:
    Label: "1"
    ContentProducer: 001191110102MACQD9K64018705
    ProduceID: 7634029171441664308-data_volume/files/所有对话/主对话/用户上传/AdsCraft_截图识别额度规范_V1.md
    ReservedCode1: ""
    ContentPropagator: 001191110102MACQD9K64028705
    PropagateID: 3476033405197864#1782563812447
    ReservedCode2: ""
---
# AdsCraft 截图识别次数限制规范 V1

> 本文档定义截图识别功能的使用次数限制规则，供扣子编程执行。

---

## 一、FB 订阅等级与截图识别额度

| 等级 | 价格 | 截图识别次数 | 重置周期 |
|------|------|-------------|----------|
| 注册用户（Free） | $0 | 3次 | 每月1号重置 |
| Local Service | $9.9/月 | 15次 | 每月1号重置 |
| Retailer | $19.9/月 | 30次 | 每月1号重置 |
| Manufacturer | $29.9/月 | 50次 | 每月1号重置 |
| Brand | $29.9/月 | 50次 | 每月1号重置 |

---

## 二、规则说明

1. **按自然月重置**：每月1号 00:00 UTC 自动归零
2. **不论成功失败都计数**：每次提交识别请求即消耗1次额度，防止接口被刷
3. **到上限不报错，引导升级**：
   - 提示文案：`"You've used all your campaign reviews this month. Upgrade your plan to continue analyzing campaigns."`
   - 按钮：`Upgrade Plan` → 跳转 Pricing 页
4. **免费用户的3次是获客入口**：不要求先有 userPlan，注册即可用
5. **截图识别是 FB 平台功能**：TK 诊断走 Quiz 流程，不消耗截图识别额度

---

## 三、数据库字段

在用户表或订阅表中增加：

```sql
-- 截图识别使用记录
screenshot_count_used    INTEGER DEFAULT 0    -- 当月已使用次数
screenshot_count_limit   INTEGER DEFAULT 3    -- 当月额度上限（随套餐变化）
screenshot_reset_at      TIMESTAMP            -- 下次重置时间（每月1号 00:00 UTC）
```

---

## 四、检查逻辑（伪代码）

```typescript
async function canUseScreenshotRecognition(userId: string) {
  const user = await getUser(userId);
  
  // 每月1号自动重置
  if (user.screenshot_reset_at <= now()) {
    await resetScreenshotCount(userId);
  }
  
  // 检查额度
  if (user.screenshot_count_used >= user.screenshot_count_limit) {
    return {
      allowed: false,
      message: "You've used all your campaign reviews this month. Upgrade your plan to continue.",
      used: user.screenshot_count_used,
      limit: user.screenshot_count_limit
    };
  }
  
  // 消耗1次
  await incrementScreenshotCount(userId);
  return { allowed: true };
}
```

---

## 五、等级对应额度映射

订阅等级变更时，同步更新 `screenshot_count_limit`：

```typescript
const SCREENSHOT_LIMITS = {
  free: 3,
  local_service: 15,
  retailer: 30,
  manufacturer: 50,
  brand: 50,
};
```

用户升级/降级时：
- **升级**：立即生效，`screenshot_count_limit` 更新为新等级额度，已使用次数不变
- **降级**：下个计费周期生效，当前周期保持原额度

---

## 六、前端展示建议

在截图识别页面展示剩余额度：

```
Reviews remaining: 12/30          ← 付费用户
Reviews remaining: 1/3  Upgrade →  ← 免费用户
Reviews used up    Upgrade →       ← 额度用完
```

---

## 七、TK 平台说明

TK 诊断走 Quiz 流程（6步引导式问答），不走截图识别，不受此额度限制。
TK 的额度控制由订阅线路本身决定（订阅了就能用对应线路的诊断）。

---

> 本内容由 Coze AI 生成，请遵循相关法律法规及《人工智能生成合成内容标识办法》使用与传播。

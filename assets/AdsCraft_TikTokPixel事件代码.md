---
AIGC:
    Label: "1"
    ContentProducer: 001191110102MACQD9K64018705
    ProduceID: 7634029171441664308-data_volume/files/所有对话/主对话/recent_memory/project/AdsCraft_TikTokPixel事件代码.md
    ReservedCode1: ""
    ContentPropagator: 001191110102MACQD9K64028705
    PropagateID: 3476033405197864#1781680929683
    ReservedCode2: ""
---
# TikTok Pixel 事件追踪代码 — 给扣子编程执行

## 说明

在现有Pixel基础代码（已安装在app/layout.tsx）之上，添加事件追踪代码。基础代码不要删不要改。

## 1. 创建工具函数文件

新建文件 `lib/tiktok-pixel.ts`：

```typescript
// lib/tiktok-pixel.ts

declare global {
  interface Window {
    ttq: any;
  }
}

export const tiktokPixel = {
  // 页面浏览（首页/落地页加载时调用）
  viewContent: () => {
    if (typeof window !== 'undefined' && window.ttq) {
      window.ttq.track('ViewContent');
    }
  },

  // 用户开始答题/点击Start按钮时调用
  addToCart: () => {
    if (typeof window !== 'undefined' && window.ttq) {
      window.ttq.track('AddToCart');
    }
  },

  // 用户提交诊断/点击Submit按钮时调用
  initiateCheckout: () => {
    if (typeof window !== 'undefined' && window.ttq) {
      window.ttq.track('InitiateCheckout');
    }
  },

  // 用户付费成功时调用（后续接入，先留好）
  purchase: (value?: number) => {
    if (typeof window !== 'undefined' && window.ttq) {
      window.ttq.track('Purchase', {
        value: value || 0,
        currency: 'USD',
      });
    }
  },
};
```

## 2. 在首页调用 ViewContent

在首页组件（landing page）中，页面加载时触发：

```typescript
// 首页/落地页组件（具体文件名按项目实际结构）
import { tiktokPixel } from '@/lib/tiktok-pixel';
import { useEffect } from 'react';

export default function HomePage() {
  useEffect(() => {
    tiktokPixel.viewContent();
  }, []);

  // ... 其余代码不变
}
```

## 3. 在"开始"按钮点击时调用 AddToCart

找到用户点击"Start"或"Get Started"按钮的地方，加上：

```typescript
import { tiktokPixel } from '@/lib/tiktok-pixel';

// 在按钮点击处理函数里加一行
const handleStart = () => {
  tiktokPixel.addToCart();
  // ... 其余原有逻辑不变
};
```

## 4. 在提交诊断时调用 InitiateCheckout

找到用户提交问卷/答题的地方，加上：

```typescript
import { tiktokPixel } from '@/lib/tiktok-pixel';

// 在提交处理函数里加一行
const handleSubmit = () => {
  tiktokPixel.initiateCheckout();
  // ... 其余原有逻辑不变
};
```

## 5. 付费成功（预留，暂不接入）

将来支付接入后，在付费成功页面加：

```typescript
import { tiktokPixel } from '@/lib/tiktok-pixel';

// 支付成功回调里
tiktokPixel.purchase(19.9);  // 传入实际金额
```

---

## 改动汇总

| 文件 | 改动 |
|---|---|
| `lib/tiktok-pixel.ts` | **新建**，工具函数 |
| 首页组件 | **新增** useEffect 调 viewContent |
| Start按钮组件 | **新增** 一行调 addToCart |
| Submit按钮组件 | **新增** 一行调 initiateCheckout |
| `app/layout.tsx` | **不动**，Pixel基础代码保持原样 |

---

> 本内容由 Coze AI 生成，请遵循相关法律法规及《人工智能生成合成内容标识办法》使用与传播。

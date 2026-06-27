---
AIGC:
    Label: "1"
    ContentProducer: 001191110102MACQD9K64018705
    ProduceID: 7634029171441664308-data_volume/files/所有对话/主对话/用户上传/AdsCraft_评分框架规范_V1.md
    ReservedCode1: ""
    ContentPropagator: 001191110102MACQD9K64028705
    PropagateID: 3476033405197864#1782551702964
    ReservedCode2: ""
---
# AdsCraft 评分框架规范 V1.0

> 5维度通用框架，平台差异化评分项
> 框架统一，内容分化

---

## 评分维度定义

### 通用5维度（所有平台共用）

| # | 维度 | 英文 | 核心问题 | 图标 |
|---|------|------|----------|------|
| 1 | 合规 | Compliance | 能不能投出去？ | shield-check |
| 2 | 投放策略 | Campaign Strategy | 钱花得对不对？ | target |
| 3 | 素材 | Creative | 素材够不够好？ | image |
| 4 | 落地页 | Landing Page | 点了之后转不转化？ | layout |
| 5 | 追踪 | Tracking | 数据准不准？ | activity |

### 分数规则
- 每个维度 0-100 分
- Overall Score = 5个维度的加权平均（默认等权重，未来可按平台调整）
- 分数颜色：90+ 绿 / 70-89 蓝 / 50-69 橙 / <50 红
- Next Actions 按优先级排序：High → Medium → Low

---

## Facebook 评分项

### Compliance（合规）
| 评分项 | 检查内容 | 严重度 |
|--------|----------|--------|
| 广告政策合规 | 是否违反Facebook广告政策（禁用内容、误导性声明） | High |
| 素材规范 | 图片/视频比例、文字占比（原20%规则参考）、分辨率 | Medium |
| 文案合规 | 禁用词检查、个性化声明合规、政治/社会议题声明 | High |
| 落地页政策 | 落地页是否包含必要披露、是否跳转违规页面 | High |
| 品牌安全 | 是否使用他人品牌素材、版权风险 | Medium |

### Campaign Strategy（投放策略）
| 评分项 | 检查内容 | 严重度 |
|--------|----------|--------|
| 受众定向精度 | 受众是否过宽/过窄、是否匹配产品目标人群 | High |
| Lookalike 设置 | LAL 来源质量、百分比设置是否合理 | Medium |
| 受众重叠检测 | 多个Ad Set之间是否存在受众重叠、导致自我竞价 | High |
| 预算分配 | 各Ad Set预算是否合理、是否有预算集中在低效组 | Medium |
| Bid 策略 | 自动/手动Bid选择是否合理、是否设置了Bid Cap | Medium |
| 优化目标 | 选择的优化目标（转化/流量/互动）是否匹配业务目标 | High |
| 投放排期 | 是否设置了广告排期、是否利用时区优化 | Low |

### Creative（素材）
| 评分项 | 检查内容 | 严重度 |
|--------|----------|--------|
| 素材规格 | 图片/视频尺寸是否符合推荐规格 | Medium |
| CTA 按钮 | CTA选择是否与转化目标匹配 | Medium |
| 文案质量 | 标题+正文是否清晰、有无CTA引导、长度是否合理 | Medium |
| 素材疲劳度 | 同一素材投放时长、频率是否过高（如frequency > 3） | High |
| 素材多样性 | 是否有多组素材做A/B测试 | Low |
| 首屏吸引力 | 图片/视频前几秒是否有明确信息点 | Medium |

### Landing Page（落地页）
| 评分项 | 检查内容 | 严重度 |
|--------|----------|--------|
| 加载速度 | 页面加载时间（<3s 通过，3-5s 警告，>5s 高风险） | High |
| 移动端适配 | 响应式布局、字体可读性、按钮可点击 | High |
| 广告-落地页一致性 | 落地页内容是否匹配广告承诺（文案/视觉/offer） | High |
| 转化元素 | 是否有明确CTA、表单是否简洁、信任标识 | Medium |
| HTTPS | 是否使用安全连接 | Medium |

### Tracking（追踪）
| 评分项 | 检查内容 | 严重度 |
|--------|----------|--------|
| Pixel 安装 | Meta Pixel 是否正确安装、能否触发 | High |
| 事件配置 | 关键事件（PageView/Purchase/Lead等）是否配置 | High |
| Conversions API | 是否配置CAPI（服务端追踪） | Medium |
| UTM 参数 | 广告链接是否携带UTM参数 | Medium |
| 归因窗口 | 归因设置是否合理 | Low |
| 域配置 | 是否完成Aggregated Event Measurement配置 | Medium |

---

## TikTok 评分项

### Compliance（合规）
| 评分项 | 检查内容 | 严重度 |
|--------|----------|--------|
| 广告政策合规 | 是否违反TikTok广告政策 | High |
| 音乐版权 | 使用的音乐/音效是否有商业授权 | High |
| 挑战/话题规则 | 引用的Challenge/Hashtag是否有使用限制 | Medium |
| 素材规范 | 视频格式、时长、分辨率是否符合TikTok要求 | Medium |
| 落地页政策 | 落地页是否符合TikTok广告落地页要求 | High |

### Campaign Strategy（投放策略）
| 评分项 | 检查内容 | 严重度 |
|--------|----------|--------|
| 受众选择 | 受众定位是否合理（年龄/地区/兴趣） | Medium |
| 投放模式 | 自动/手动投放选择是否合理 | Medium |
| 投放时段 | 是否设置了分时段投放、是否匹配目标受众活跃时间 | Medium |
| 预算分配 | 各广告组预算分配是否合理 | Medium |
| 优化目标 | 优化目标是否匹配业务需求（转化/流量/视频浏览） | High |
| 出价策略 | 出价是否合理（过低无法竞争、过高浪费预算） | Medium |

### Creative（素材）
| 评分项 | 检查内容 | 严重度 |
|--------|----------|--------|
| 前3秒 Hook | 视频前3秒是否有明确吸引点（提问/冲突/悬念/价值承诺） | High |
| 原生感 | 素材是否像TikTok原生内容（非硬广感） | High |
| 竖版适配 | 是否为9:16竖版、是否充分利用全屏 | Medium |
| 音乐/音效 | 使用的音乐/音效是否与内容匹配、是否热门 | Medium |
| Hashtag 策略 | 是否使用相关Hashtag、数量是否合理（3-5个） | Medium |
| CTA 引导 | 视频内/文案中是否有明确行动引导 | Medium |
| 视频时长 | 时长是否合理（建议15-60s，过长影响完播率） | Low |

### Landing Page（落地页）
| 评分项 | 检查内容 | 严重度 |
|--------|----------|--------|
| 加载速度 | 页面加载时间（TikTok用户更偏移动端，速度更重要） | High |
| 移动端适配 | 响应式布局、字体可读性、按钮可点击（TikTok 95%+ 移动端） | High |
| 广告-落地页一致性 | 视频内容与落地页是否一致 | High |
| 转化元素 | CTA清晰度、表单简洁度、信任标识 | Medium |
| HTTPS | 是否使用安全连接 | Medium |

### Tracking（追踪）
| 评分项 | 检查内容 | 严重度 |
|--------|----------|--------|
| Pixel 安装 | TikTok Pixel 是否正确安装 | High |
| 事件配置 | 关键事件是否配置（CompleteRegistration/Purchase/PlaceOrder等） | High |
| UTM 参数 | 广告链接是否携带UTM参数 | Medium |
| 归因设置 | 归因窗口和归因类型设置是否合理 | Medium |
| Events Manager | Events Manager中事件状态是否正常（Active/No Issues） | Medium |

---

## 未来平台扩展

### Google Ads（预留）
| 维度 | 特色评分项 |
|------|-----------|
| Compliance | 广告政策、商标使用、编辑规范 |
| Campaign Strategy | 关键词质量分、Quality Score、匹配类型分布、出价策略 |
| Creative | 响应式搜索广告标题数量、扩展文案、广告附加信息 |
| Landing Page | 同通用 |
| Tracking | Google Tag安装、转化跟踪、G Ads Link |

### Shopify Landing Page（预留）
| 维度 | 特色评分项 |
|------|-----------|
| Compliance | 产品声明合规、价格透明、退换货政策 |
| Campaign Strategy | N/A（落地页诊断无投放策略） |
| Creative | 产品图质量、产品描述、社会证明 |
| Landing Page | 页面速度、移动适配、结账流程、信任标识、评价展示 |
| Tracking | Shopify Analytics、Facebook/TikTok Pixel集成 |

---

## Overall Score 计算

### 默认算法
```
Overall = (Compliance + Campaign Strategy + Creative + Landing Page + Tracking) / 5
```

### 未来可扩展为加权
```
# Facebook 权重示例（更重策略）
Overall = Compliance*0.20 + Strategy*0.25 + Creative*0.20 + Landing*0.20 + Tracking*0.15

# TikTok 权重示例（更重素材）
Overall = Compliance*0.15 + Strategy*0.20 + Creative*0.30 + Landing*0.20 + Tracking*0.15
```

V1.0 使用等权重，后续根据数据验证是否需要调整。

---

## Next Actions 生成规则

### 优先级排序
1. **High**：合规问题、追踪缺失 → 必须先修
2. **Medium**：策略/素材/落地页明显问题 → 建议修改
3. **Low**：优化建议 → 有时间再改

### Action 格式
```
① [优先级] 具体动作
```

示例：
```
Next Actions

① [High] Fix pixel firing — checkout page event not detected
② [High] Reduce audience overlap — 3 ad sets share 68% overlap
③ [Medium] Add hook in first 3 seconds of video
④ [Medium] Landing page load time 4.8s — optimize images
⑤ [Low] Add 2 more ad variations for A/B testing
```

### 规则
- 最多显示 5 条 Next Actions
- High 优先级永远排最前
- 每条必须是可执行的具体动作，不要笼统建议
- 报告导出PDF时保留优先级标记

---

> 本内容由 Coze AI 生成，请遵循相关法律法规及《人工智能生成合成内容标识办法》使用与传播。

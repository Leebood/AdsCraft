# DESIGN.md

## 产品定位
AdsCraft - Facebook广告决策引擎。不是教程,是决策工具。

## 设计思考

### 氮质与意象
- **关键词**: 专业、现代、吸引力、科技感、权威
- **具象场景**: 深色背景下的现代科技界面,带有微妙的网格纹理和渐变光晕,体现广告策划的专业性和科技感

### 视觉策略
- **背景**: 深色渐变(slate-900 → blue-900 → indigo-900),营造专业科技氛围
- **纹理**: 微妙的网格点阵纹理,增加层次感
- **光晕**: 渐变光晕效果(blur-xl),增强视觉吸引力
- **卡片**: 半透明背景(white/5-10),边框使用半透明白色或彩色

### 配色方案
- **主色调**: 
  - 深蓝色系(slate-900, blue-900, indigo-900) - 专业权威
  - 青蓝色系(cyan-400, cyan-500) - 科技感、吸引力
- **强调色系**:
  - Cyan(青蓝): 主要强调色,按钮、选中状态、主要图标
  - Purple(紫色): 辅助强调,次要功能图标
  - Orange(橙色): 辅助强调,诊断优化图标
- **文字**: 
  - 主标题: text-white - 高对比
  - 副标题: text-blue-200 - 柔和对比
  - 正文: text-blue-300/70-80 - 可读性
- **透明度**: 使用大量半透明效果(white/5-20, cyan/10-30)营造现代感

### 图形语言
- **图标风格**: 简洁抽象几何SVG图标
  - 配置推荐: 网格方块图形 - 代表结构化配置
  - 原因分析: 思维发散图形 - 代表分析思考
  - 诊断优化: 循环箭头图形 - 代表优化迭代
- **图标容器**: 
  - 渐变背景容器(from-cyan/purple/orange-500/30)
  - 半透明边框(border-cyan/purple/orange-400/30)
  - 圆角矩形(rounded-2xl)
  - 光晕效果(bg-cyan/purple/orange-400/10 blur-xl)
- **路线图标**: 使用emoji图标(🛒 🏭 📍 ✨),简洁直观

### 字体排版
- **字体**: 系统默认字体(antialiased)
- **标题层级**: 
  - Hero: text-5xl-6xl font-bold leading-tight
  - 页面标题: text-2xl font-semibold
  - 副标题: text-xl-2xl font-light
- **文字效果**: 
  - 主标题: text-white - 高对比
  - 描述: text-blue-300/70-80 leading-relaxed - 可读性

### 动效与交互
- **悬停效果**: 
  - scale(105-110) - 放大反馈
  - border-color变化 - 边框高亮
  - bg-opacity变化 - 背景加深
  - shadow变化 - 阴影增强
  - text-color变化 - 文字变色
- **过渡动画**: transition-all duration-300 - 流畅过渡
- **光晕动画**: blur-xl背景光晕,hover时增强opacity
- **选中状态**: 
  - 渐变背景(from-cyan-500/20 to-blue-500/20)
  - 边框高亮(border-cyan-400)
  - 阴影增强(shadow-lg shadow-cyan-500/20)
  - scale(105)放大
  - 右上角勾选图标

### 页面结构
- **首页**: 
  - Hero区(AI标签 + 大标题 + 副标题 + 描述)
  - 路线选择卡片(2列网格 + emoji图标 + 半透明背景)
  - 动作按钮(渐变背景 + 箭头图标)
  - 三层价值展示(抽象几何图标 + 光晕效果)
  - Footer(版权信息)
- **问答页**: 进度指示器 + 问题卡片 + 选项列表
- **方案页**: 配置表格 + 升级提示
- **登录/注册页**: 简洁的卡片式表单

### 组件规范
- **按钮**: 
  - 主按钮: bg-gradient-to-r from-cyan-500 to-blue-600, rounded-xl, shadow-lg shadow-cyan-500/30
  - hover: from-cyan-400 to-blue-500, scale-105, shadow增强
- **卡片**: 
  - bg-white/5-10, border-white/20, rounded-xl
  - hover: border-cyan-400/50, bg-white/10, shadow-xl
  - 选中: bg-gradient-to-br from-cyan-500/20 to-blue-500/20, border-cyan-400
- **图标容器**: 
  - w-20 h-20, bg-gradient-to-br, rounded-2xl, border, flex items-center justify-center
  - 光晕层: absolute inset-0, bg-color/10-20, blur-xl

### 设计禁忌
- ✅ 使用深色渐变背景,不要浅色平淡背景
- ✅ 使用抽象几何图标,不要emoji图标(路线选择除外)
- ✅ 使用半透明效果和光晕,不要纯色块
- ✅ 使用渐变和阴影增强吸引力,不要过于简洁
- ✅ 添加hover动画,不要静态无反馈
- ❌ 不要使用过于传统的商务配色(纯蓝+白)
- ❌ 不要使用emoji图标用于价值展示
- ❌ 不要使用过于简洁的卡片(无渐变/阴影)
- ❌ 不要使用过于平淡的背景(无纹理/层次)
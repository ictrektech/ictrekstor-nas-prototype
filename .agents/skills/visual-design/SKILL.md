---
name: visual-design
description: >
  强制执行 ICTrek NAS 视觉设计语言规范。
  当用户请求涉及以下场景时自动激活：
  1. 修改/优化现有页面的视觉样式、布局、颜色、字体
  2. 创建新页面、新组件
  3. 调整卡片、按钮、图标、进度条等 UI 元素外观
  4. 重构页面的 HTML/CSS/Vue 模板结构以改善视觉效果
  5. 任何可能改变页面外观的代码变更
  
  激活后，必须先读取 docs/visual-design/ 下的全部规范文档，再执行设计修改。
  禁止在未读取规范的情况下直接修改视觉相关代码。
license: MIT
compatibility: Vue 3 + Vben Admin 5.x + Ant Design Vue + Tailwind CSS
metadata:
  author: ictrekstor
  version: "1.0"
---

# Visual Design Skill — ICTrek NAS 视觉设计语言规范

本 Skill 强制要求：在进行任何涉及页面视觉的修改前，**必须先完整阅读** `docs/visual-design/` 目录下的所有规范文档。

## 触发条件（满足任一即激活）

- 用户要求"美化页面"、"优化视觉效果"、"调整样式"
- 用户要求创建新页面、新组件
- 用户要求修改现有页面的布局、颜色、字体、间距
- 用户要求调整卡片、按钮、图标、进度条等 UI 元素
- 任何涉及 `.vue` 文件中 `<template>` 或 `<style>` 的修改
- 任何涉及 CSS/SCSS/Tailwind 类名的变更

## 执行步骤（必须按顺序执行）

### Step 1: 读取全部视觉设计规范文档

**必须先执行，禁止跳过。** 使用 `read_file` 工具依次读取以下文件：

| 文件 | 主题 | 说明 |
|------|------|------|
| `docs/visual-design/README.md` | 文档总览、设计原则、Vben CSS 变量速查 | **必须首先读取**，了解全局原则 |
| `docs/visual-design/01-color-system.md` | 色彩系统 | CSS 变量优先、语义色、容量分段、渐变、阴影 |
| `docs/visual-design/02-typography.md` | 字体规范 | 字号层级、等宽字体强制规则 |
| `docs/visual-design/03-layout-spacing.md` | 布局与间距 | 页面结构、头部规范、Grid、响应式 |
| `docs/visual-design/04-components.md` | 组件规范 | 卡片、图标盒、标签、进度条、按钮、下拉菜单 |
| `docs/visual-design/05-interactions.md` | 交互规范 | 过渡曲线、悬浮态、点击态、状态反馈 |
| `docs/visual-design/06-page-patterns.md` | 页面模式 | 6种标准页面模式模板 + 页面类型映射 |

> **注意**：如果上下文窗口紧张，至少必须读取 `README.md` + 与当前任务直接相关的 2-3 个专题文档。但强烈建议全部读取以确保设计一致性。

### Step 2: 分析当前页面/组件的视觉现状

- 读取需要修改的目标文件
- 识别当前页面属于哪种**页面类型**（参考 `06-page-patterns.md` §8）
- 识别当前违反规范的问题（如：缺少页面头部、emoji 图标、非等宽字体、硬编码颜色等）

### Step 3: 制定修改方案

根据规范文档，确定：

1. **页面模式**：该页面应使用哪种标准模式（文件管理器 / Hero+分区 / 资源管理 / 配置列表 / 详情页）
2. **色彩方案**：哪些颜色应使用 CSS 变量，哪些可硬编码
3. **字体方案**：标题/正文/数据分别用什么字号和字重，数据是否使用等宽字体
4. **布局方案**：头部结构、卡片网格、间距系统
5. **组件方案**：卡片样式、图标盒、进度条、标签、按钮
6. **交互方案**：悬浮效果、过渡动画、状态反馈

### Step 4: 执行修改并自我检查

修改代码时，逐条核对以下**强制检查清单**：

#### 色彩检查
- [ ] 通用 UI（背景、边框、文字）使用 `hsl(var(--xxx))` 而非硬编码颜色
- [ ] 容量进度条按 `<70%`→`--primary` / `70-90%`→`--warning` / `>90%`→`--destructive` 着色
- [ ] 仅硬件类型（SSD紫 `#722ed1`、NVMe粉 `#eb2f96`）和渐变色使用硬编码

#### 字体检查
- [ ] 容量、百分比、序列号、MAC 地址等数据使用等宽字体：`font-family: 'SF Mono', 'Fira Code', monospace`
- [ ] 页面标题 16px/600，卡片标题 15-16px/600-700，正文 13-14px/400-500
- [ ] 描述/标签使用 `hsl(var(--muted-foreground))`

#### 布局检查
- [ ] 页面有统一头部：图标盒(44px) + 标题(16px/600) + 描述(12px，可选) + 统计卡片
- [ ] 头部背景 `hsl(var(--card))`，底部边框 `hsl(var(--border))`
- [ ] 页面容器 `padding: 0 20px 16px`，背景 `hsl(var(--background))`
- [ ] 卡片网格 `grid-template-columns: repeat(auto-fill, minmax(380px, 1fr))`，`gap: 12px`

#### 卡片检查
- [ ] 卡片背景 `hsl(var(--card))`，边框 `hsl(var(--border))`
- [ ] 圆角基于 `var(--radius)` 计算（内容卡片 `*1.5`=12px）
- [ ] 卡片有悬浮效果：`translateY(-2px)` + 阴影加深 + 边框高亮
- [ ] 过渡使用 `0.3s cubic-bezier(0.4, 0, 0.2, 1)`

#### 图标检查
- [ ] 使用 lucide 系列 Iconify 图标：`<IconifyIcon icon="lucide:xxx" />`
- [ ] 禁止使用 emoji 作为图标
- [ ] 图标语义着色：存储→primary/蓝，成功→success/绿，警告→warning/橙，危险→destructive/红

#### 交互检查
- [ ] 卡片/按钮有明确的悬浮态和点击态反馈
- [ ] 空状态有大图标(48-64px) + 描述 + 可选操作按钮
- [ ] 操作成功用 `message.success()`，失败用 `message.error()`

### Step 5: 输出修改摘要

修改完成后，向用户说明：
- 应用了哪种页面模式
- 主要视觉改进点（色彩、字体、布局、交互）
- 是否引入了新的 CSS 变量用法
- 是否遵循了容量分段色彩规则

## 禁止事项（绝对不可违反）

1. **禁止**使用 emoji 作为图标 — 必须使用 lucide Iconify 图标
2. **禁止**自定义容量颜色分段 — 必须遵循 `<70%=primary / 70-90%=warning / >90%=destructive`
3. **禁止**省略页面头部 — 所有页面必须有统一的头部结构
4. **禁止**混用不同圆角层级 — 同一页面内卡片圆角必须一致
5. **禁止**数值使用非等宽字体 — 所有数据型内容必须使用等宽字体
6. **禁止**卡片无悬浮效果 — 所有可交互卡片必须有悬浮态
7. **禁止**空状态仅有文字 — 必须配合图标展示
8. **禁止**硬编码通用颜色 — 页面背景、卡片背景、边框、文字必须使用 CSS 变量

## 快速参考

### 页面类型 → 模式映射

| 页面类型 | 适用模式 | 参考文档 |
|---------|---------|---------|
| 文件管理 | 文件管理器模式 | `06-page-patterns.md` §4 |
| 设备概览 | Hero + 分区卡片 + 卡片网格 | `06-page-patterns.md` §2,3,5 |
| 资源管理 | 标准头部 + 卡片网格/列表 | `06-page-patterns.md` §1,5 |
| 配置列表 | 标准头部 + 动作栏 + 表格 | `06-page-patterns.md` §1,6 |
| 详情页 | 标准头部 + 信息面板 + 图表 | `06-page-patterns.md` §1 |

### 核心 CSS 变量速查

```
--primary     → hsl(var(--primary))      主色（蓝）
--success     → hsl(var(--success))      成功（绿）
--warning     → hsl(var(--warning))      警告（橙）
--destructive → hsl(var(--destructive))  危险（红）
--foreground  → hsl(var(--foreground))   前景文字
--background  → hsl(var(--background))   页面背景
--card        → hsl(var(--card))         卡片背景
--border      → hsl(var(--border))       边框
--accent      → hsl(var(--accent))       次要背景
--muted-foreground → hsl(var(--muted-foreground)) 次要文字
--radius      → var(--radius)            圆角基准
```

### 容量颜色函数

```ts
function getCapacityColorVar(percent: number): string {
  if (percent >= 90) return 'destructive';
  if (percent >= 70) return 'warning';
  return 'primary';
}
```

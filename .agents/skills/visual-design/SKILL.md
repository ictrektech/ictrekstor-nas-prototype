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

本 Skill 强制要求：在进行任何涉及页面视觉的修改，**必须先完整阅读** 所有规范文档。
执行全局修改后，不要做任何批注。

## 触发条件（满足任一即激活）

- 用户要求"美化页面"、"优化视觉效果"、"调整样式"
- 用户要求创建新页面、新组件
- 用户要求修改现有页面的布局、颜色、字体、间距
- 用户要求调整卡片、按钮、图标、进度条等 UI 元素
- 任何涉及 `.vue` 文件中 `<template>` 或 `<style>` 的修改
- 任何涉及 CSS/SCSS/Tailwind 类名的变更

## 执行步骤（必须按顺序执行）

### Step 1: 读取全部视觉设计规范文档
## 1. 设计原则

### 1.1 核心目标
- **统一视觉语言**：消除页面间视觉跳跃，确保用户切换页面时感知一致
- **降低维护成本**：通过 CSS 变量和可复用组件，避免颜色/间距/阴影在数十个文件中硬编码
- **提升信息层次**：通过规范化的色彩语义和间距节奏，让用户快速定位关键信息

### 1.2 设计约束
- 基于 Vben Admin 5.x + Ant Design Vue + Tailwind CSS
- 支持响应式（断点：576px / 768px / 992px / 1200px / 1400px）
- 图标统一使用 `lucide:` 前缀的 Iconify 图标

---

## 2. 设计令牌（Design Tokens）

### 2.1 色彩系统

#### 主色与品牌色

基于品牌色阶梯（Brand1 → Brand10）定义：

| 名称 | 色值 | 来源 | 用途 |
|------|------|------|------|
| `primary` | `#006BE6` | Brand6 | 品牌主色、主按钮、链接、选中态、图标强调（常规态） |
| `primary-hover` | `#2B8BEB` | Brand5 | 主色悬浮态（Hover） |
| `primary-active` | `#0053C0` | Brand7 | 主色点击态（Active / Press） |
| `primary-light` | `#E8F7FF` | Brand1 | 主色浅色背景、图标容器背景、浅色填充场景 |
| `primary-disabled` | `#86C5F5` | Brand3 | 主色禁用态 |
| `primary-bg` | `#B6DFFA` | Brand2 | 特殊场景背景 |

> **品牌色阶梯完整映射**：Brand1 `#E8F7FF` → Brand2 `#B6DFFA` → Brand3 `#86C5F5` → Brand4 `#57A9F0` → Brand5 `#2B8BEB` → Brand6 `#006BE6` → Brand7 `#0053C0` → Brand8 `#003D99` → Brand9 `#002A73` → Brand10 `#001A4D`

#### 语义色（状态色）

基于语义色阶梯定义（Success / Warning / Danger）：

| 名称 | 色值 | 来源 | 用途 |
|------|------|------|------|
| `success` | `#10BA64` | Succes6 | 成功、正常、已启用、健康（常规态） |
| `success-hover` | `#32C878` | Succes5 | 成功态悬浮（Hover） |
| `success-active` | `#0A9F59` | Succes7 | 成功态点击（Active / Press） |
| `success-light` | `#E8FFF0` | Succes1 | 成功态浅色背景 |
| `success-disabled` | `#84E3AA` | Succes3 | 成功态禁用 |
| `success-bg` | `#B4F1CA` | Succes2 | 成功态特殊场景背景 |
| `warning` | `#F77234` | Warning6 | 警告、休眠、注意（常规态） |
| `warning-hover` | `#F99057` | Warning5 | 警告态悬浮（Hover） |
| `warning-active` | `#CC5120` | Warning7 | 警告态点击（Active / Press） |
| `warning-light` | `#FFF3E8` | Warning1 | 警告态浅色背景 |
| `warning-disabled` | `#FCC59F` | Warning3 | 警告态禁用 |
| `warning-bg` | `#FDDDC3` | Warning2 | 警告态特殊场景背景 |
| `danger` | `#F53F3F` | Danger6 | 错误、危险操作、异常（常规态） |
| `danger-hover` | `#F76560` | Danger5 | 危险态悬浮（Hover） |
| `danger-active` | `#CB272D` | Danger7 | 危险态点击（Active / Press） |
| `danger-light` | `#FFECE8` | Danger1 | 危险态浅色背景 |
| `danger-disabled` | `#FBACA3` | Danger3 | 危险态禁用 |
| `danger-bg` | `#FDCDC5` | Danger2 | 危险态特殊场景背景 |
| `info` | `#722ED1` | — | 信息提示、紫色强调 |
| `info-light` | `#F9F0FF` | — | 信息态轻背景 |

> **语义色阶梯完整映射**：
> - **Success**：Succes1 `#E8FFF0` → Succes2 `#B4F1CA` → Succes3 `#84E3AA` → Succes4 `#59D68F` → Succes5 `#32C878` → Succes6 `#10BA64` → Succes7 `#0A9F59` → Succes8 `#06834D` → Succes9 `#02683F` → Succes10 `#004D30`
> - **Warning**：Warning1 `#FFF3E8` → Warning2 `#FDDDC3` → Warning3 `#FCC59F` → Warning4 `#FAAC7B` → Warning5 `#F99057` → Warning6 `#F77234` → Warning7 `#CC5120` → Warning8 `#A23511` → Warning9 `#771F06` → Warning10 `#4D0E00`
> - **Danger**：Danger1 `#FFECE8` → Danger2 `#FDCDC5` → Danger3 `#FBACA3` → Danger4 `#F98981` → Danger5 `#F76560` → Danger6 `#F53F3F` → Danger7 `#CB272D` → Danger8 `#A1151E` → Danger9 `#770813` → Danger10 `#4D000A`

#### 中性色
| 名称 | 色值 | 用途 |
|------|------|------|
| `text-emphasis` | `#0f172a` | 强调：标题、核心数据 |
| `text-primary` | `#1e293b` | 主要：正文、列表项 |
| `text-secondary` | `#64748b` | 辅助：描述、提示、标签 |
| `text-disabled` | `#45484B` | 禁用：空状态、不可用 |
| `text-tertiary` | `#8C8C8C` | 兜底三级灰（旧值保留兼容） |
| `border` | `#E9ECEF` | 卡片边框 |
| `deliver` | `#F0F0F0` | 分割线 |
| `border-light` | `#F0F0F0` | 内部边框、表头底边 |
| `bg-page` | `#FBFBFB` | 页面背景 |
| `bg-card` | `#FFFFFF` | 卡片背景 |
| `bg-section` | `#FAFAFA` | 卡片内部区块背景（如表头） |

### 2.2 间距系统（Spacing Scale）

以 **4px** 为基准单位：

| Token | 值 | 用途 |
|-------|-----|------|
| `space-1` | 4px | 极小程序间距 |
| `space-2` | 8px | 图标与文本间距、按钮内边距 |
| `space-3` | 12px | 卡片内部小间距、网格 gap |
| `space-4` | 16px | 卡片 padding、模块间距 |
| `space-5` | 20px | 页面水平 padding、卡片大间距 |
| `space-6` | 24px | 大模块间距、Hero padding |

> **规则**：所有 margin/padding/gap 必须使用以上 6 个值之一，禁止出现 6px/10px/14px 等非标准值。

### 2.3 阴影系统（Shadow Scale）

| Token | 值 | 用途 |
|-------|-----|------|
| `shadow-1` | `0 1px 10px rgba(0,0,0,0.05), 0 4px 5px rgba(0,0,0,0.08), 0 2px 4px -1px rgba(0,0,0,0.12)` | 基础投影：组件 Hover 状态、表格和树拖动 |
| `shadow-2` | `0 3px 14px 2px rgba(0,0,0,0.05), 0 8px 10px 1px rgba(0,0,0,0.06), 0 5px 5px -3px rgba(0,0,0,0.10)` | 中层投影：下拉菜单、气泡确认框、选择器等下拉组件 |
| `shadow-3` | `0 6px 30px 5px rgba(0,0,0,0.05), 0 16px 24px 2px rgba(0,0,0,0.04), 0 8px 10px -5px rgba(0,0,0,0.08)` | 上层投影：全局提示、消息通知、弹窗、Drawer 等浮层 |

### 2.4 圆角系统（Radius Scale）

| Token | 值 | 用途 |
|-------|-----|------|
| `radius-sm` | 4px | 标签 |
| `radius-md` | 8px | 按钮、图标容器、小卡片 |
| `radius-lg` | 16px | 中等卡片、弹窗、页面级容器 |

### 2.5 字体系统（Typography）

#### 字体栈
```css
font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
```
- 优先使用系统字体，确保各平台原生体验
- 中文优先 `PingFang SC`（macOS/iOS）→ `Hiragino Sans GB`（部分日/中场景）→ `Microsoft YaHei`（Windows）
- 西文回退 `Helvetica Neue` → `Helvetica` → `Arial`
- 最终兜底 `sans-serif`

#### 字号 Token

| Token | 大小 | 字重 | 用途 |
|-------|------|------|------|
| `headline-large` | 36px | 700 | 页面级大标题、Hero 标题 |
| `headline-medium` | 28px | 700 | 区块大标题 |
| `headline-small` | 24px | 700 | 模块标题 |
| `title-large` | 20px | 600 | 卡片标题、页面分区标题 |
| `title-medium` | 16px | 600 | 子区块标题 |
| `title-small` | 14px | 600 | 表单标签、列表标题 |
| `body-large` | 16px | 400 | 强调正文 |
| `body-medium` | 14px | 400 | 主要文本：正文、列表项 |
| `body-small` | 12px | 400 | 辅助提示文本、描述、时间戳 |
| `mark-medium` | 14px | 600 | 卡片内属性名、数值、标记 |
| `mark-small` | 12px | 600 | 角标、极小标签 |
| `link-large` | 16px | 400 | 大链接 |
| `link-medium` | 14px | 400 | 常规链接 |
| `link-small` | 12px | 400 | 小链接 |

> **规则**：禁止使用以上标准字号以外的非标准字号（如 13.5px）。

---

## 3. 组件规范

### 3.1 Checkbox 多选框

#### 基础尺寸

| 属性 | 值 | Token |
|------|-----|-------|
| 宽 × 高 | 16px × 16px | — |
| 圆角 | 4px | `--ict-radius-sm` |
| 边框宽度 | 1.5px | — |

#### 单行多选框状态（无文本）

| 状态 | 背景色 | 边框色 | 图标/标记色 |
|------|--------|--------|-------------|
| 默认未选中 | `--ict-bg-card` | `--ict-border` | — |
| 悬浮未选中（Hover） | `--ict-bg-card` | `--ict-primary` | — |
| 选中（Checked） | `--ict-primary` | `--ict-primary` | `--ict-bg-card` |
| 禁用未选中 | `--ict-bg-page` | `--ict-border` | — |
| 禁用选中 | `--ict-bg-page` | `--ict-border` | `--ict-text-tertiary` |
| 半选（Indeterminate） | `--ict-primary` | `--ict-primary` | `--ict-bg-card` |
| 禁用半选 | `--ict-bg-page` | `--ict-border` | `--ict-text-tertiary` |

#### 多选组（框 + 文本）

| 属性 | 值 | Token |
|------|-----|-------|
| 框与文本间距 | 8px | `--ict-space-2` |
| 文本字号 | 14px / 400 | `--ict-body-medium` |
| 文本颜色 | `#1e293b` | `--ict-text-primary` |
| 禁用态文本颜色 | `#45484B` | `--ict-text-disabled` |

#### 使用规范

1. **横向组合间距**：多个独立多选框横向排列时，项与项之间最小间距为 `24px`（`--ict-space-6`）。
2. **纵向组合间距**：多选框组纵向排列时，行与行之间间距为 `12px`（`--ict-space-3`）。
3. **框文对齐**：多选框与关联文本垂直居中对齐。
4. **表单场景**：多选框组整体与表单标签左对齐，组内首项与输入框顶对齐。
5. **禁用态说明**：禁用态多选框不可响应点击，且关联文本同步置灰。

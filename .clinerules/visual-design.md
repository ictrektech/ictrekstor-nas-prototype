# 视觉设计语言规范（强制执行）

> 本规则用于指导所有页面设计和组件开发，确保风格统一、现代美观、交互友好、布局主次分明。
>
> 详细规范文档位于 `docs/visual-design/`，AI 在设计/修改页面前必须阅读该目录下的相关文档。

## 0. Vben CSS 变量优先原则

本项目基于 Vben Admin 5.x，框架通过 CSS 自定义属性（CSS Variables）管理主题。所有通用场景**必须优先使用 CSS 变量**，而非硬编码颜色，以确保主题切换时颜色自动适配。

### 0.1 核心 CSS 变量

| CSS 变量 | 默认值 (Light) | 说明 | 使用方式 |
|----------|---------------|------|---------|
| `--primary` | `212 100% 45%` | 主题主色 | `hsl(var(--primary))` |
| `--success` | `144 57% 58%` | 成功色 | `hsl(var(--success))` |
| `--warning` | `42 84% 61%` | 警告色 | `hsl(var(--warning))` |
| `--destructive` | `348 100% 61%` | 危险/错误色 | `hsl(var(--destructive))` |
| `--foreground` | `240 10% 4%` | 前景文字色 | `hsl(var(--foreground))` |
| `--background` | `0 0% 96%` | 页面背景色 | `hsl(var(--background))` |
| `--card` | `0 0% 100%` | 卡片背景色 | `hsl(var(--card))` |
| `--border` | `240 6% 90%` | 边框色 | `hsl(var(--border))` |
| `--accent` | `240 5% 96%` | 次要背景/填充色 | `hsl(var(--accent))` |
| `--muted-foreground` | `240 4% 46%` | 次要文字色 | `hsl(var(--muted-foreground))` |
| `--radius` | `0.5rem` | 全局圆角基准 | `var(--radius)` |

### 0.2 使用原则

| 场景 | 推荐方式 | 原因 |
|------|---------|------|
| 通用 UI（按钮、卡片、边框、文字） | **CSS 变量** | 跟随主题切换自动适配 |
| 主色/成功/警告/错误状态 | **CSS 变量** | 主题自定义时联动变化 |
| 容量分段颜色 | **CSS 变量语义映射** | 蓝=primary, 橙=warning, 红=destructive |
| 硬件类型标识（SSD紫/NVMe粉） | **硬编码** | 业务语义，与主题无关 |
| 渐变色 | **硬编码** | 固定视觉设计 |

## 1. 设计原则（必须遵守）

1. **现代简洁**：扁平化设计 + 微阴影层级，避免过度装饰
2. **主次分明**：通过色彩对比、字号差异、间距留白建立清晰信息层级
3. **语义着色**：使用颜色传达状态含义，降低用户认知成本
4. **交互友好**：所有可交互元素均有明确状态反馈（悬浮、点击、禁用）
5. **一致性**：相同类型页面/组件采用统一视觉模式

## 2. 色彩系统（强制）

### 2.1 主题色（通过 CSS 变量）

| 语义 | CSS 变量 | 默认 Hex | 用途 |
|------|---------|---------|------|
| 主色 | `--primary` | `#1677ff` | 主要操作、存储图标、链接、进度条正常态 |
| 成功 | `--success` | `#52c41a` | 正常状态、成功提示、已启用、运行中 |
| 警告 | `--warning` | `#faad14` | 警告状态、容量中等使用率 |
| 危险 | `--destructive` | `#ff4d4f` | 危险/错误、删除操作、容量高使用率 |

### 2.2 扩展语义色（业务硬编码）

| 颜色 | Hex | 用途 |
|------|-----|------|
| 信息紫 | `#722ed1` | SSD标识、分享、WebDAV |
| 粉色 | `#eb2f96` | NVMe标识、远程连接 |

### 2.3 容量分段色彩（绝对禁止自定义）

容量使用率进度条/百分比必须按以下规则着色：

```ts
/**
 * 根据容量使用率返回对应的 CSS 变量名。
 * 使用 CSS 变量而非硬编码颜色，确保主题切换时颜色自动适配。
 */
function getCapacityColorVar(percent: number): string {
  if (percent >= 90) return 'destructive';   // 危险：使用主题错误色
  if (percent >= 70) return 'warning';       // 警告：使用主题警告色
  return 'primary';                           // 健康：使用主题主色
}
```

## 3. 页面头部模式（所有页面必须统一）

### 3.1 标准头部结构

每个内容页面顶部必须有统一的页面头部：

```
┌──────────────────────────────────────────┐
│ ┌────┐                                   │
│ │图标│  页面标题 (16px/600)              │
│ └────┘  页面描述 (12px，可选)            │
│                                [统计卡片] │
└──────────────────────────────────────────┘
    背景 hsl(var(--card))，border-bottom: 1px solid hsl(var(--border))
    padding: 16px 20px
```

### 3.2 头部 CSS 模板（必须复制使用）

```css
/* 页面头部使用 CSS 变量定义背景和边框，
   确保暗色主题下背景色自动适配为深色。 */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: hsl(var(--card));
  border-bottom: 1px solid hsl(var(--border));
  gap: 16px;
  flex-shrink: 0;
  margin: 0 -20px 16px;
}
.page-header-left { display: flex; align-items: center; gap: 12px; }
.page-icon-box {
  width: 44px; height: 44px; border-radius: calc(var(--radius));
  background: hsl(var(--primary) / 0.1); /* 主色 10% 透明度 */
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.page-title { font-size: 16px; font-weight: 600; color: hsl(var(--foreground)); margin: 0; line-height: 1.4; }
.page-desc { font-size: 12px; color: hsl(var(--muted-foreground)); margin: 2px 0 0; }
.page-header-right { display: flex; align-items: center; gap: 12px; }
```

### 3.3 统计概览卡片

```css
/* 统计卡片使用 accent 色作为背景，
   在不同主题下与头部背景形成层次。 */
.stat-card {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 14px; background: hsl(var(--accent));
  border-radius: calc(var(--radius));
  min-width: 90px;
}
.stat-label { font-size: 11px; color: hsl(var(--muted-foreground)); }
.stat-value { font-size: 16px; font-weight: 600; color: hsl(var(--foreground));
  font-family: 'SF Mono', 'Fira Code', monospace; }
```

## 4. 字体规范（强制）

### 4.1 等宽字体强制规则

所有容量、百分比、序列号、MAC 地址等纯数据型内容必须使用等宽字体：

```css
font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
```

### 4.2 字号层级

| 层级 | 字号 | 字重 | 颜色 | 用途 |
|------|------|------|------|------|
| 页面标题 | `16px` | `600` | `hsl(var(--foreground))` | 页面头部标题 |
| 卡片标题 | `15-16px` | `600-700` | `hsl(var(--foreground))` | 卡片内名称 |
| 正文 | `13-14px` | `400-500` | `hsl(var(--foreground))` | 普通文字 |
| 描述 | `12px` | `400` | `hsl(var(--muted-foreground))` | 辅助说明 |
| 标签 | `10-11px` | `500` | `hsl(var(--muted-foreground))` | 元数据标签 |

## 5. 卡片设计规范（强制）

### 5.1 基础卡片样式

```css
/* 卡片使用 CSS 变量确保背景、边框在暗色主题下正确。
   border-radius 基于 var(--radius) 计算，支持主题圆角调整。 */
.base-card {
  background: hsl(var(--card));
  border-radius: calc(var(--radius) * 1.5);
  border: 1px solid hsl(var(--border));
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}
.base-card:hover {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
  border-color: hsl(var(--border) / 1.2);
  transform: translateY(-2px);
}
```

### 5.2 圆角层级

| 类型 | 计算方式 | 默认值 |
|------|---------|--------|
| 页面级大卡片 | `calc(var(--radius) * 1.75)` | `14px` |
| 内容卡片 | `calc(var(--radius) * 1.5)` | `12px` |
| 嵌套卡片 | `calc(var(--radius) * 1.25)` | `10px` |
| 内部元素 | `calc(var(--radius))` | `8px` |

## 6. 图标规范（强制）

### 6.1 图标库

统一使用 **lucide** 系列的 Iconify 图标：

```vue
<IconifyIcon icon="lucide:hard-drive" />
```

### 6.2 图标语义着色

| 语义 | CSS 变量/颜色 | 背景色 |
|------|--------------|--------|
| 存储/信息 | `hsl(var(--primary))` | `hsl(var(--primary) / 0.1)` |
| 正常/成功 | `hsl(var(--success))` | `hsl(var(--success) / 0.1)` |
| 警告 | `hsl(var(--warning))` | `hsl(var(--warning) / 0.1)` |
| 危险 | `hsl(var(--destructive))` | `hsl(var(--destructive) / 0.1)` |
| 紫色（硬件） | `#722ed1` | `#f9f0ff` |
| 粉色（硬件） | `#eb2f96` | `#fff0f6` |

## 7. 布局规范（强制）

### 7.1 页面容器

```css
.page-container {
  padding: 0 20px 16px;
  width: 100%;
  background: hsl(var(--background));
  min-height: 100%;
}
```

### 7.2 卡片网格

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 12px;
}
```

### 7.3 响应式断点

| 断点 | 宽度 | 调整 |
|------|------|------|
| 平板 | `≤ 992px` | 头部垂直堆叠 |
| 小平板 | `≤ 768px` | 双栏变单栏 |
| 手机 | `≤ 576px` | 全部单列，padding 缩小 |

## 8. 交互规范（强制）

### 8.1 过渡曲线

```css
/* 主要过渡 — Material Design 标准曲线，快速启动、缓慢结束 */
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
/* 快速反馈 — 浏览器默认曲线，简洁快速 */
transition: all 0.2s ease;
```

### 8.2 卡片悬浮效果

```css
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
  border-color: hsl(var(--border) / 1.2);
}
```

### 8.3 状态反馈

- 操作成功：`message.success('...')`
- 操作失败：`message.error('...')`
- 空状态：大图标（48-64px，`hsl(var(--muted-foreground))`）+ 描述文字 + 可选操作按钮

## 9. 禁止事项

1. **禁止使用 emoji 作为图标** — 必须使用 lucide Iconify 图标
2. **禁止自定义容量颜色分段** — 必须遵循 `<70%=primary / 70-90%=warning / >90%=destructive`
3. **禁止省略页面头部** — 所有页面必须有统一的头部结构
4. **禁止混用不同圆角层级** — 同一页面内卡片圆角必须一致
5. **禁止数值使用非等宽字体** — 所有数据型内容必须使用等宽字体
6. **禁止卡片无悬浮效果** — 所有可交互卡片必须有悬浮态
7. **禁止空状态仅有文字** — 必须配合图标展示
8. **禁止硬编码通用颜色** — 页面背景、卡片背景、边框、文字必须使用 CSS 变量

## 10. 页面类型模式速查

| 页面类型 | 适用模式 | 参考文档 |
|---------|---------|---------|
| 文件管理 | 文件管理器模式 | `06-page-patterns.md` §4 |
| 设备概览 | Hero + 分区卡片 + 卡片网格 | `06-page-patterns.md` §2,3,5 |
| 资源管理 | 标准头部 + 卡片网格/列表 | `06-page-patterns.md` §1,5 |
| 配置列表 | 标准头部 + 动作栏 + 表格 | `06-page-patterns.md` §1,6 |
| 详情页 | 标准头部 + 信息面板 + 图表 | `06-page-patterns.md` §1 |

## 11. 参考文档

| 文件 | 主题 |
|------|------|
| `docs/visual-design/01-color-system.md` | 色彩系统完整定义（含 Vben CSS 变量详解） |
| `docs/visual-design/02-typography.md` | 字体规范完整定义 |
| `docs/visual-design/03-layout-spacing.md` | 布局与间距完整定义 |
| `docs/visual-design/04-components.md` | 组件规范完整定义 |
| `docs/visual-design/05-interactions.md` | 交互规范完整定义 |
| `docs/visual-design/06-page-patterns.md` | 页面模式完整定义 |

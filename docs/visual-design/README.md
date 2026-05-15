# ICTrek NAS 视觉设计语言规范

> 本文档用于指导 ictrekstor NAS 前端原型的页面设计，确保风格统一、现代美观、交互友好、布局主次分明。
>
> 最后更新：2025-05-14

## 设计原则

1. **现代简洁**：扁平化设计 + 微阴影层级，避免过度装饰
2. **主次分明**：通过色彩对比、字号差异、间距留白建立清晰信息层级
3. **语义着色**：使用颜色传达状态含义，降低用户认知成本
4. **交互友好**：所有可交互元素均有明确状态反馈（悬浮、点击、禁用）
5. **一致性**：相同类型页面/组件采用统一视觉模式

## Vben CSS 变量优先

本项目基于 Vben Admin 5.x，框架通过 CSS 自定义属性管理主题。所有通用场景**必须优先使用 CSS 变量**，而非硬编码颜色，以确保主题切换时颜色自动适配。

核心变量速查：

| CSS 变量 | 说明 | 使用方式 |
|----------|------|---------|
| `--primary` | 主题主色 | `hsl(var(--primary))` |
| `--success` | 成功色 | `hsl(var(--success))` |
| `--warning` | 警告色 | `hsl(var(--warning))` |
| `--destructive` | 危险色 | `hsl(var(--destructive))` |
| `--foreground` | 前景文字色 | `hsl(var(--foreground))` |
| `--background` | 页面背景色 | `hsl(var(--background))` |
| `--card` | 卡片背景色 | `hsl(var(--card))` |
| `--border` | 边框色 | `hsl(var(--border))` |
| `--accent` | 次要背景/填充色 | `hsl(var(--accent))` |
| `--muted-foreground` | 次要文字色 | `hsl(var(--muted-foreground))` |
| `--radius` | 全局圆角基准 | `var(--radius)` |

## 文档目录

| 文件 | 主题 | 适用场景 |
|------|------|----------|
| [01-color-system.md](./01-color-system.md) | 色彩系统 | 定义主题色、语义色、中性色、渐变色、阴影层级 |
| [02-typography.md](./02-typography.md) | 字体规范 | 字号层级、字重、行高、等宽字体强制规则 |
| [03-layout-spacing.md](./03-layout-spacing.md) | 布局与间距 | 页面结构、头部规范、间距系统、Grid、响应式 |
| [04-components.md](./04-components.md) | 组件规范 | 卡片、图标盒、标签、进度条、按钮、下拉菜单 |
| [05-interactions.md](./05-interactions.md) | 交互规范 | 过渡曲线、悬浮态、点击态、状态反馈、禁用态 |
| [06-page-patterns.md](./06-page-patterns.md) | 页面模式 | 页面头部、Hero区、内容区、空状态、页面类型映射 |


## 关键设计决策

1. **CSS 变量优先**：通用 UI 使用 `hsl(var(--xxx))`，仅硬件语义（SSD紫/NVMe粉）和渐变使用硬编码
2. **页面头部**：100%统一的白色头部 + 44px图标盒 + 统计概览卡片
3. **等宽字体**：所有容量、百分比、序列号等数据强制使用等宽字体
4. **容量分段**：`<70%`→`--primary`蓝 / `70-90%`→`--warning`橙 / `>90%`→`--destructive`红
5. **卡片悬浮**：`translateY(-2px)` + 阴影加深 + 边框高亮
6. **圆角层级**：基于 `var(--radius)` 计算 — 14px/12px/10px/8px
7. **图标库**：统一使用 lucide 系列的 Iconify 图标，语义着色
8. **页面模式**：定义了5种标准页面模式覆盖全部场景

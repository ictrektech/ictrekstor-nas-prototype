# 当前任务：分析存储相关页面视觉设计语言并制定规范

## 任务来源
- 触发方式：用户指令
- 关联变更：无

## 目标与范围
- [x] 获取所有存储相关页面URL
- [x] 截图所有相关页面（文件管理、系统设置、存储模块）
- [x] 代码分析：提取视觉设计元素（颜色、布局、卡片、字体、间距等）
- [x] 撰写视觉设计文档到 docs/visual-design/
- [x] 在 .clinerules 中新增视觉设计规则

## 已完成工作

### 1. 截图分析（13个页面）
已对所有存储相关页面进行截图：
- **文件管理**（7页）：我的文件、公共文件、他人分享、我的分享、外接设备、回收站、设备全部文件
- **系统设置**（4页）：设备管理、用户管理、存储空间管理、服务设置
- **存储详情**（2页）：磁盘详情、存储池详情

### 2. 代码分析
已读取并分析以下关键组件的代码：
- `file/my-files/index.vue` — 文件管理器模式
- `system/device/index.vue` — 设备概览页
- `system/services/index.vue` — 服务配置页
- `storage/volumes/index.vue` — 存储空间管理
- `storage/recycle-bin/index.vue` — 回收站
- `file/shared-files/index.vue` — 分享列表
- `storage/all-files/index.vue` — 全部文件
- 子组件：DeviceInfoHero、DiskCard、PoolCard、VolumeNestCard 等

### 3. Vben 主题系统分析
深入分析了 Vben 的 CSS 变量主题系统：
- `packages/@core/preferences/src/update-css-variables.ts` — CSS 变量生成与更新逻辑
- `packages/@core/preferences/src/config.ts` — 默认主题配置（colorPrimary 等）
- `packages/@core/preferences/src/constants.ts` — 内置主题预设
- `packages/effects/hooks/src/use-design-tokens.ts` — Ant Design 设计令牌适配
- `packages/@core/base/shared/src/color/generator.ts` — 颜色变量生成器

核心发现：Vben 将主题色转换为 HSL 格式 CSS 变量（如 `--primary`、`--success`），通过 `hsl(var(--xxx))` 使用，支持亮色/暗色/自定义主题切换。

### 4. 文档产出

#### docs/visual-design/ 目录
| 文件 | 内容 | 大小 |
|------|------|------|
| `README.md` | 文档总览、设计原则、Vben CSS 变量速查 | 2.5KB |
| `01-color-system.md` | 色彩系统（CSS 变量优先、语义色、容量分段、渐变、阴影） | 14KB |
| `02-typography.md` | 字体规范（字号层级、等宽字体、CSS 变量颜色） | 4.5KB |
| `03-layout-spacing.md` | 布局与间距（页面结构、头部规范、Grid、响应式） | 6.5KB |
| `04-components.md` | 组件规范（卡片、图标盒、标签、进度条、按钮、下拉菜单） | 12KB |
| `05-interactions.md` | 交互规范（过渡曲线、悬浮态、状态反馈） | 7KB |
| `06-page-patterns.md` | 页面模式（6种标准模式模板 + 页面类型映射） | 15KB |
| `screenshots/` | 13张页面截图 | - |

#### .clinerules/visual-design.md
- 9KB 的强制执行规则
- 包含：Vben CSS 变量优先原则、设计原则、色彩系统、页面头部、字体、卡片、图标、布局、交互、禁止事项
- 明确引用 `docs/visual-design/` 目录下的详细文档

## 关键设计决策

1. **CSS 变量优先**：通用 UI 使用 `hsl(var(--xxx))`，仅硬件语义和渐变使用硬编码
2. **页面头部**：100%统一的卡片色背景头部 + 44px图标盒 + 统计概览卡片
3. **等宽字体**：所有容量、百分比、序列号等数据强制使用等宽字体
4. **容量分段**：`<70%`→`--primary`蓝 / `70-90%`→`--warning`橙 / `>90%`→`--destructive`红
5. **卡片悬浮**：`translateY(-2px)` + 阴影加深 + 边框高亮
6. **圆角层级**：基于 `var(--radius)` 计算 — 14px/12px/10px/8px
7. **图标库**：统一使用 lucide 系列的 Iconify 图标，语义着色
8. **页面模式**：定义了5种标准页面模式覆盖全部场景

## 文档特色

- **每个 CSS 代码块都附带详细的中文注释**，说明设计意图和使用场景
- **每个代码示例都解释了"为什么这样写"**，而不仅仅是"怎么写"
- **所有通用颜色替换为 CSS 变量**（`hsl(var(--primary))` 替代 `#1677ff`）
- **保留了必要的硬编码颜色**（硬件语义色、渐变色、阴影 rgba）
- **提供了 Vue 模板完整示例**，可直接复制使用

# ICTrek NAS UI KIT 规范文档

> 版本：v1.0
> 日期：2026-05-14
> 适用范围：ictrekstor-nas-prototype 前端原型项目

---

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
| `bg-page` | `#F5F5F5` | 页面背景 |
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

### 2.3 圆角系统（Radius Scale）

| Token | 值 | 用途 |
|-------|-----|------|
| `radius-sm` | 4px | 标签 |
| `radius-md` | 8px | 按钮、图标容器、小卡片 |
| `radius-lg` | 16px | 中等卡片、弹窗、页面级容器 |

### 2.4 阴影系统（Shadow Scale）

| Token | 值 | 用途 |
|-------|-----|------|
| `shadow-1` | `0 1px 10px rgba(0,0,0,0.05), 0 4px 5px rgba(0,0,0,0.08), 0 2px 4px -1px rgba(0,0,0,0.12)` | 基础投影：组件 Hover 状态、表格和树拖动 |
| `shadow-2` | `0 3px 14px 2px rgba(0,0,0,0.05), 0 8px 10px 1px rgba(0,0,0,0.06), 0 5px 5px -3px rgba(0,0,0,0.10)` | 中层投影：下拉菜单、气泡确认框、选择器等下拉组件 |
| `shadow-3` | `0 6px 30px 5px rgba(0,0,0,0.05), 0 16px 24px 2px rgba(0,0,0,0.04), 0 8px 10px -5px rgba(0,0,0,0.08)` | 上层投影：全局提示、消息通知、弹窗、Drawer 等浮层 |

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

### 3.1 PageHeader（页面头部）

**用途**：统一所有页面的顶部标题区域。

#### 结构
```
┌─────────────────────────────────────────────────────────────┐
│ [IconBox]  页面标题                    [右侧概览/操作区]    │
│            页面描述                                         │
└─────────────────────────────────────────────────────────────┘
```

#### Props 接口
```ts
interface PageHeaderProps {
  /** 页面图标（Iconify 图标名） */
  icon: string;
  /** 图标颜色（默认 primary #006BE6） */
  iconColor?: string;
  /** 页面主标题 */
  title: string;
  /** 页面描述 */
  description?: string;
  /** 是否显示底部边框（默认 true） */
  showBorder?: boolean;
}
```

#### 样式规范
- 容器：`display: flex; align-items: center; justify-content: space-between;`
- 背景：`var(--bg-card)`（白色）
- padding：`space-3 space-5`（12px 20px）
- 底部边框：`1px solid var(--border-light)`（当 showBorder=true）
- 负边距：`margin: 0 -20px space-4`（与页面容器 padding 对齐）

---

### 3.2 PageIconBox（页面图标容器）

**用途**：页面头部左侧的图标容器。

#### 样式规范
- 尺寸：`44px × 44px`
- 圆角：`radius-lg`（10px）
- 背景：`var(--primary-light)`（#E6F2FF）
- 图标大小：`20px`
- 图标颜色：跟随传入的 `iconColor`，默认 `var(--primary)`（#006BE6）

#### 变体
| 场景 | 背景色 | 图标色 |
|------|--------|--------|
| 默认（存储/文件） | `primary-light` | `primary` |
| 成功态（健康/启用） | `success-light` | `success` |
| 警告态（休眠/注意） | `warning-light` | `warning` |
| 危险态（异常/错误） | `danger-light` | `danger` |
| 信息态（网络/紫色） | `info-light` | `info` |

---

### 3.3 SectionCard（内容区块卡片）

**用途**：页面内部的内容分组容器，替代裸用 `a-card`。

#### 样式规范
- 圆角：`radius-xl`（12px）
- 边框：`1px solid var(--border)`
- 阴影：`shadow-1`
- hover 阴影：`shadow-3`
- 底部间距：`space-4`（16px）
- body padding：`space-4`（16px）

#### 标题栏规范
```
┌────────────────────────────────────────┐
│ [Icon]  区块标题          [CountTag]   │
└────────────────────────────────────────┘
```
- 标题字号：`text-lg`（15px, font-weight: 600）
- 标题颜色：`var(--text-primary)`
- CountTag：小型标签，`bg: var(--bg-page)`，`color: var(--text-secondary)`
- 图标大小：`16px`，颜色跟随区块语义色

---

### 3.4 StatusBadge（状态标签）

**用途**：统一所有状态展示（健康、运行、警告、异常、启用、禁用等）。

#### Props 接口
```ts
interface StatusBadgeProps {
  /** 状态文本 */
  status: string;
  /** 预设状态类型（自动着色） */
  type?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  /** 是否显示状态圆点（默认 true） */
  showDot?: boolean;
  /** 自定义尺寸：sm / md */
  size?: 'sm' | 'md';
}
```

#### 状态映射表
| 状态文本 | type | 圆点色 | 边框色 | 背景色 | 文字色 |
|----------|------|--------|--------|--------|--------|
| 正常 / 运行中 / 已启用 / 健康 | success | #52C41A | `#52C41A50` | `#52C41A10` | #52C41A |
| 警告 / 休眠 / 注意 | warning | #FAAD14 | `#FAAD1450` | `#FAAD1410` | #FAAD14 |
| 异常 / 错误 / 危险 | danger | #FF4D4F | `#FF4D4F50` | `#FF4D4F10` | #FF4D4F |
| 信息 / 配置中 | info | #722ED1 | `#722ED150` | `#722ED110` | #722ED1 |
| 未使用 / 未知 / 禁用 | default | #BFBFBF | `#BFBFBF50` | `#BFBFBF10` | #8C8C8C |

#### 样式规范
- 圆角：`radius-sm`（6px）
- padding：`2px 8px`（sm）/ `4px 10px`（md）
- 字号：`text-xs`（11px, font-weight: 500）
- 边框：`1px solid`（透明度 31%）
- 圆点：`6px × 6px`，border-radius 50%

---

### 3.5 InfoChip（信息芯片）

**用途**：设备信息 Hero 中的紧凑信息展示（如 CPU 4核 / 内存 8GB）。

#### 样式规范
- 布局：`display: flex; align-items: center; gap: space-2;`
- 内边距：`space-2 space-3`（8px 12px）
- 背景：`var(--bg-card)`（白色）
- 边框：`1px solid var(--border-light)`
- 圆角：`radius-md`（8px）
- 阴影：`shadow-1`
- hover：`shadow-2`，`transform: translateY(-1px)`

#### 内部结构
```
┌────────────────────────┐
│ [IconBox]  值          │
│            标签        │
└────────────────────────┘
```
- 内部 IconBox：`32px × 32px`，`radius-sm`（6px）
- 值字号：`text-base-bold`（13px, 600）
- 标签字号：`text-xs`（11px）

---

## 4. 页面迁移清单

### 4.1 需替换的硬编码值汇总

以下是在页面文件中发现的、需要替换为 CSS 变量的硬编码值：

| 硬编码值 | 替换为 | 出现文件数 |
|----------|--------|-----------|
| `#1677ff` | `var(--ict-primary)` | 20+ |
| `#52c41a` | `var(--ict-success)` | 10+ |
| `#faad14` | `var(--ict-warning)` | 8+ |
| `#ff4d4f` | `var(--ict-danger)` | 5+ |
| `#722ed1` | `var(--ict-info)` | 4+ |
| `#e6f4ff` | `var(--ict-primary-light)` | 15+ |
| `#f6ffed` | `var(--ict-success-light)` | 6+ |
| `#fff7e6` | `var(--ict-warning-light)` | 4+ |
| `#fff1f0` | `var(--ict-danger-light)` | 2+ |
| `#f9f0ff` | `var(--ict-info-light)` | 2+ |
| `#0f172a` | `var(--ict-text-emphasis)` | 新增 |
| `#1e293b` | `var(--ict-text-primary)` | 新增 |
| `#262626` | `var(--ict-text-emphasis)` 或 `var(--ict-text-primary)` | 旧值迁移 |
| `#595959` | `var(--ict-text-secondary)` | 8+ |
| `#64748b` | `var(--ict-text-secondary)` | 新增 |
| `#8c8c8c` | `var(--ict-text-tertiary)` | 15+ |
| `#45484B` | `var(--ict-text-disabled)` | 新增 |
| `#bfbfbf` | `var(--ict-text-disabled)` | 10+ |
| `#e8e8e8` | `var(--ict-border)` | 12+ |
| `#f0f0f0` | `var(--ict-border-light)` | 10+ |
| `#f5f5f5` | `var(--ict-bg-page)` | 8+ |
| `#fafafa` | `var(--ict-bg-section)` | 6+ |

### 4.2 组件替换路径

| 原实现 | 替换为 | 涉及页面 |
|--------|--------|----------|
| 各页面自行写的 `.page-header` | `PageHeader` 组件 | 全部 20+ 页面 |
| 各页面自行写的 `.page-icon-box` | `PageIconBox` 组件 | 全部 20+ 页面 |
| 裸用 `a-card` 包裹内容区块 | `SectionCard` 组件 | device, disks, volumes 等 |
| 自行封装的 Tag 状态标签 | `StatusBadge` 组件 | disks, device 等 |
| 设备 Hero 中的 `.info-chip` | `InfoChip` 组件 | device |

---

## 5. 文件结构

```
apps/web-antd/src/
├── styles/
│   └── design-tokens.css          # CSS 变量定义
├── components/ui-kit/
│   ├── PageHeader.vue             # 页面头部
│   ├── PageIconBox.vue            # 图标容器
│   ├── SectionCard.vue            # 内容区块卡片
│   ├── StatusBadge.vue            # 状态标签
│   ├── InfoChip.vue               # 信息芯片
│   └── index.ts                   # 统一导出
```

---

## 6. 实施节奏建议

| 阶段 | 内容 | 预计工时 |
|------|------|----------|
| **Phase 1** | 创建 Design Tokens CSS + PageHeader + PageIconBox | 2h |
| **Phase 2** | 创建 SectionCard + StatusBadge + InfoChip | 1.5h |
| **Phase 3** | 替换所有页面的 page-header/page-icon-box | 2h |
| **Phase 4** | 替换硬编码颜色为 CSS 变量 | 1.5h |
| **Phase 5** | 视觉回归验证（截图对比） | 1h |

---

## 7. 附录：响应式断点规范

| 断点名 | 宽度 | 适用场景 |
|--------|------|----------|
| `sm` | 576px | 手机横屏 |
| `md` | 768px | 平板竖屏 |
| `lg` | 992px | 平板横屏/小笔记本 |
| `xl` | 1200px | 标准桌面 |
| `2xl` | 1400px | 大屏桌面 |

> **规则**：所有页面的响应式必须统一使用以上断点，禁止自定义其他断点值。

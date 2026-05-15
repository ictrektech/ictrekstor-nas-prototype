# 色彩系统

## 0. Vben 主题 CSS 变量系统（优先使用）

本项目基于 Vben Admin 5.x，框架提供了完整的 CSS 自定义属性（CSS Variables）主题系统。所有通用场景**必须优先使用 CSS 变量**，而非硬编码颜色，以确保主题切换时颜色自动适配。

### 0.1 核心 CSS 变量一览

Vben 在运行时通过 `generatorColorVariables` 将主题色转换为 HSL 格式的 CSS 变量并注入到 `:root`。以下为常用变量：

| CSS 变量 | 默认值 (Light) | 说明 | 使用方式 |
|----------|---------------|------|---------|
| `--primary` | `212 100% 45%` | 主题主色（蓝） | `hsl(var(--primary))` |
| `--primary-50` ~ `--primary-950` | 自动生成的色阶 | 主色的 10 级色阶 | `hsl(var(--primary-500))` |
| `--success` | `144 57% 58%` | 成功色（绿） | `hsl(var(--success))` |
| `--warning` | `42 84% 61%` | 警告色（橙） | `hsl(var(--warning))` |
| `--destructive` | `348 100% 61%` | 错误/危险色（红） | `hsl(var(--destructive))` |
| `--foreground` | `240 10% 4%` | 前景文字色（近黑） | `hsl(var(--foreground))` |
| `--background` | `0 0% 96%` | 页面背景色（浅灰） | `hsl(var(--background))` |
| `--card` | `0 0% 100%` | 卡片背景色（白） | `hsl(var(--card))` |
| `--popover` | `0 0% 100%` | 弹窗背景色 | `hsl(var(--popover))` |
| `--border` | `240 6% 90%` | 边框色 | `hsl(var(--border))` |
| `--accent` | `240 5% 96%` | 强调/填充色 | `hsl(var(--accent))` |
| `--muted` | `240 5% 96%` | 次要背景色 | `hsl(var(--muted))` |
| `--muted-foreground` | `240 4% 46%` | 次要文字色 | `hsl(var(--muted-foreground))` |
| `--radius` | `0.5rem` | 全局圆角基准 | `var(--radius)` |

### 0.2 使用 CSS 变量的两种写法

**方式一：原生 CSS `hsl()` 函数（推荐）**

Vben 的 CSS 变量值是纯 HSL 分量（如 `212 100% 45%`），使用时需要包裹在 `hsl()` 函数中：

```css
/* 正确：将 CSS 变量作为 hsl() 的参数 */
.my-button {
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

/* 正确：使用色阶变量 */
.my-button:hover {
  background-color: hsl(var(--primary-600));
}
```

**方式二：Tailwind CSS 工具类**

如果项目中启用了 Tailwind，可直接使用 Vben 预设的工具类：

```html
<!-- 文字颜色 -->
<span class="text-primary">主题色文字</span>
<span class="text-foreground">正文文字</span>
<span class="text-muted-foreground">次要文字</span>

<!-- 背景颜色 -->
<div class="bg-background">页面背景</div>
<div class="bg-card">卡片背景</div>
<div class="bg-primary text-primary-foreground">主色按钮</div>

<!-- 边框颜色 -->
<div class="border-border">默认边框</div>
```

### 0.3 CSS 变量 vs 硬编码颜色的使用原则

| 场景 | 推荐方式 | 原因 |
|------|---------|------|
| 通用 UI 元素（按钮、卡片、边框、文字） | **CSS 变量** | 跟随主题切换自动适配 |
| 页面背景、卡片背景 | **CSS 变量** | 暗色模式需要反转 |
| 主色、成功、警告、错误状态 | **CSS 变量** | 主题自定义时联动变化 |
| 容量分段颜色（蓝/橙/红） | **CSS 变量语义映射** | 见下方第 4 节 |
| 硬件类型标识（SSD紫/NVMe粉） | **硬编码** | 业务语义，与主题无关 |
| 渐变色的具体色值 | **硬编码** | 渐变是固定视觉设计 |

---

## 1. 主题色（通过 CSS 变量使用）

### 1.1 主要语义色

这些颜色通过 Vben 的 CSS 变量系统统一管理，支持主题切换和自定义：

| 语义 | CSS 变量 | 默认 Hex 参考 | 用途 | 浅色背景（CSS 写法） |
|------|---------|--------------|------|-------------------|
| 主色 | `--primary` | `#1677ff` | 主要操作、存储相关图标、链接、进度条正常态 | `hsl(var(--primary) / 0.1)` |
| 成功 | `--success` | `#52c41a` | 正常状态、成功提示、已启用、运行中 | `hsl(var(--success) / 0.1)` |
| 警告 | `--warning` | `#faad14` | 警告状态、容量中等使用率、注意提示 | `hsl(var(--warning) / 0.1)` |
| 危险 | `--destructive` | `#ff4d4f` | 危险/错误状态、删除操作、容量高使用率 | `hsl(var(--destructive) / 0.1)` |

**代码示例 — 使用 CSS 变量的按钮样式：**

```css
/* 这是一个主色按钮的样式定义。
   使用 hsl(var(--primary)) 而非 #1677ff，
   这样当用户切换主题时，按钮颜色会自动跟随变化。 */
.btn-primary {
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border: 1px solid hsl(var(--primary));
  border-radius: var(--radius);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background-color: hsl(var(--primary-600));
}
```

### 1.2 扩展语义色（业务硬编码）

以下颜色具有特定业务语义，不随主题变化：

| 颜色 | Hex | 用途 | 浅色背景 |
|------|-----|------|---------|
| 信息紫 | `#722ed1` | SSD类型标识、分享相关、WebDAV服务 | `#f9f0ff` |
| 粉色 | `#eb2f96` | NVMe类型标识、远程连接、管理HTTP服务 | `#fff0f6` |
| 深灰 | `#595959` | 次要文字、分类标签 | `#f5f5f5` |

**代码示例 — SSD/NVMe 类型标识（硬编码，因是硬件语义）：**

```css
/* SSD 硬盘使用紫色图标，这是硬件类型的固定语义，不随主题变化 */
.disk-icon-ssd {
  color: #722ed1;
  background-color: #f9f0ff;
}

/* NVMe 硬盘使用粉色图标 */
.disk-icon-nvme {
  color: #eb2f96;
  background-color: #fff0f6;
}
```

## 2. 中性色（优先使用 CSS 变量）

### 2.1 通用中性色

| 用途 | CSS 变量 | 默认 Hex 参考 | 说明 |
|------|---------|--------------|------|
| 页面背景 | `--background` | `#f5f5f5` | 整个页面底层背景 |
| 卡片背景 | `--card` | `#ffffff` | 卡片、面板、弹窗背景 |
| 次级背景 | `--accent` / `--muted` | `#f5f5f5` | 嵌套卡片容器内部 |
| 边框浅色 | `--border` | `#f0f0f0` | 卡片边框、分割线 |
| 主标题 | `--foreground` | `#262626` | 页面标题、卡片标题、重要文字 |
| 正文 | - | `#434343` | 普通正文、属性值（硬编码，因文字对比度要求） |
| 次要文字 | `--muted-foreground` | `#8c8c8c` | 描述、标签、占位符 |
| 禁用/占位 | - | `#bfbfbf` | 禁用状态、空状态图标、分割线 |

**代码示例 — 页面容器（使用 CSS 变量）：**

```css
/* 页面容器使用 CSS 变量定义背景和文字颜色。
   这样当用户切换到暗色主题时，
   background 会自动变为深色，foreground 变为浅色。 */
.page-container {
  padding: 0 20px 16px;
  width: 100%;
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  min-height: 100%;
}
```

**代码示例 — 卡片基础样式（使用 CSS 变量）：**

```css
/* 卡片使用 CSS 变量定义背景和边框，
   确保在暗色主题下卡片背景与页面背景有足够对比度 */
.base-card {
  background-color: hsl(var(--card));
  border-radius: calc(var(--radius) * 1.5);  /* 12px，基于 0.5rem 基准 */
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

## 3. 健康状态色彩（通过 CSS 变量使用）

健康状态使用语义化的 CSS 变量，支持主题切换：

| 状态 | CSS 变量 | 默认 Hex | 圆点背景写法 | Tag 组件使用 |
|------|---------|---------|-------------|-------------|
| 正常 | `--success` | `#52c41a` | `hsl(var(--success) / 0.07)` | `<Tag color="success">` |
| 警告 | `--warning` | `#faad14` | `hsl(var(--warning) / 0.07)` | `<Tag color="warning">` |
| 异常/错误 | `--destructive` | `#ff4d4f` | `hsl(var(--destructive) / 0.07)` | `<Tag color="error">` |
| 未知/未使用 | `--muted-foreground` | `#8c8c8c` | `hsl(var(--muted-foreground) / 0.07)` | `<Tag>` |

**代码示例 — 健康状态徽章（使用 CSS 变量）：**

```css
/* 健康状态徽章使用 CSS 变量，
   文字颜色使用语义变量，背景使用对应颜色的 7% 透明度版本 */
.health-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
}

/* 正常状态：绿色文字 + 绿色半透明背景 */
.health-badge.normal {
  color: hsl(var(--success));
  background-color: hsl(var(--success) / 0.07);
  border: 1px solid hsl(var(--success) / 0.16);
}

/* 警告状态：橙色文字 + 橙色半透明背景 */
.health-badge.warning {
  color: hsl(var(--warning));
  background-color: hsl(var(--warning) / 0.07);
  border: 1px solid hsl(var(--warning) / 0.16);
}

/* 异常状态：红色文字 + 红色半透明背景 */
.health-badge.error {
  color: hsl(var(--destructive));
  background-color: hsl(var(--destructive) / 0.07);
  border: 1px solid hsl(var(--destructive) / 0.16);
}
```

## 4. 容量分段色彩（强制遵循，使用 CSS 变量语义映射）

容量使用率必须通过颜色传达风险等级。使用 CSS 变量语义映射，既保证业务规则正确，又支持主题切换：

| 使用率范围 | 语义 | CSS 变量 | 默认颜色 | 状态含义 |
|-----------|------|---------|---------|---------|
| `< 70%` | 健康 | `--primary` | `#1677ff`（蓝）| 健康、安全 |
| `70% ~ 90%` | 警告 | `--warning` | `#faad14`（橙）| 警告、关注 |
| `> 90%` | 危险 | `--destructive` | `#ff4d4f`（红）| 危险、立即处理 |

**代码示例 — 容量颜色计算函数（使用 CSS 变量语义）：**

```ts
/**
 * 根据容量使用率返回对应的 CSS 变量名。
 * 使用 CSS 变量而非硬编码颜色，确保主题切换时颜色自动适配。
 * 
 * @param percent - 使用率百分比（0-100）
 * @returns CSS 变量名，用于 hsl(var(--xxx)) 中
 */
function getCapacityColorVar(percent: number): string {
  if (percent >= 90) return 'destructive';   // 危险：使用主题错误色
  if (percent >= 70) return 'warning';       // 警告：使用主题警告色
  return 'primary';                           // 健康：使用主题主色
}

/**
 * 获取容量对应的 HSL 颜色字符串，可直接用于 style 绑定
 * @param percent - 使用率百分比
 * @returns 完整的 hsl() 颜色字符串，如 "hsl(212 100% 45%)"
 */
function getCapacityColor(percent: number): string {
  const varName = getCapacityColorVar(percent);
  return `hsl(var(--${varName}))`;
}
```

**代码示例 — 容量进度条（使用 CSS 变量）：**

```vue
<!-- Vue 模板中使用 CSS 变量绑定进度条颜色 -->
<template>
  <Progress
    :percent="usagePercent"
    :stroke-color="`hsl(var(--${capacityColorVar}))`"
    :show-info="false"
    :stroke-width="5"
    size="small"
  />
</template>

<script setup>
const usagePercent = 75; // 75%，属于警告范围
const capacityColorVar = getCapacityColorVar(usagePercent); // 返回 "warning"
</script>
```

## 5. 渐变色（Hero/Header 区域，硬编码）

渐变色是固定的视觉设计，使用硬编码：

| 场景 | 渐变值 | 用途 |
|------|--------|------|
| 设备信息 Hero | `linear-gradient(135deg, #f0f5ff 0%, #e6f4ff 50%, #f6ffed 100%)` | 设备管理页顶部信息区 |
| 存储池头部 | `linear-gradient(135deg, #f0f5ff 0%, #e6f0ff 100%)` | 存储池卡片头部 |
| 目录存储空间 | `linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)` | 基于目录的存储空间头部 |

**代码示例 — Hero 区渐变背景：**

```css
/* Hero 区使用固定的渐变背景色，
   这是视觉设计的一部分，不随主题变化。
   使用蓝→绿渐变传达"科技+安全"的视觉感受。 */
.device-hero {
  background: linear-gradient(135deg, #f0f5ff 0%, #e6f4ff 50%, #f6ffed 100%);
  border-radius: 14px;
  border: 1px solid hsl(var(--border));
  padding: 20px 24px;
}
```

## 6. 阴影层级

阴影使用固定的 rgba 值，不随主题变化（阴影是物理光照效果）：

| 层级 | 阴影值 | 用途 |
|------|--------|------|
| 静态卡片 | `0 2px 10px rgba(0, 0, 0, 0.06)` | 默认卡片阴影 |
| 悬浮卡片 | `0 6px 24px rgba(0, 0, 0, 0.1)` | 鼠标悬浮时的卡片 |
| 信息芯片 | `0 1px 3px rgba(0, 0, 0, 0.04)` | 设备信息芯片默认 |
| 芯片悬浮 | `0 4px 12px rgba(0, 0, 0, 0.08)` | 信息芯片悬浮 |
| 下拉菜单 | `0 4px 16px rgba(0, 0, 0, 0.12)` | 操作下拉菜单 |
| 内联卡片 | `0 1px 3px rgba(0, 0, 0, 0.04)` | 表格内嵌卡片 |

**代码示例 — 卡片阴影层级：**

```css
/* 卡片阴影是物理光照效果，使用固定的 rgba 值，不随主题变化。
   悬浮时阴影加深 + 位移，营造"浮起"的层次感。 */
.card {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card:hover {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
}
```

## 7. Ant Design Vue 主题适配

Vben 通过 `useAntdDesignTokens` 将 CSS 变量同步到 Ant Design Vue 的 `ConfigProvider`。因此，使用 Ant Design 组件时，其默认颜色会自动跟随主题：

```vue
<template>
  <!-- Ant Design 的 Button 会自动使用 --primary 作为主题色 -->
  <Button type="primary">主色按钮</Button>

  <!-- Tag 组件的 color="success" 会自动映射到 --success -->
  <Tag color="success">正常</Tag>
  <Tag color="warning">警告</Tag>
  <Tag color="error">错误</Tag>

  <!-- Progress 组件配合动态 CSS 变量 -->
  <Progress :percent="50" :stroke-color="strokeColor" />
</template>

<script setup>
import { computed } from 'vue';

// 容量进度条颜色：使用 CSS 变量字符串
const strokeColor = computed(() => {
  return 'hsl(var(--primary))';  // 或 --warning / --destructive
});
</script>
```

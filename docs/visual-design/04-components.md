# 组件规范

## 1. 卡片（Card）

### 1.1 基础卡片

```css
/* 基础卡片样式。
   background 使用 hsl(var(--card)) 确保暗色主题下卡片背景正确。
   border 使用 hsl(var(--border)) 确保边框颜色跟随主题。
   border-radius 使用 calc(var(--radius) * 1.5) 基于主题圆角基准计算（默认 0.5rem * 1.5 = 12px）。
   transition 使用 cubic-bezier 曲线，营造流畅的悬浮动效。 */
.base-card {
  background: hsl(var(--card));
  border-radius: calc(var(--radius) * 1.5);
  border: 1px solid hsl(var(--border));
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

/* 卡片悬浮态：向上位移 2px + 阴影加深 + 边框变亮。
   这种"浮起"效果给用户明确的交互反馈。 */
.base-card:hover {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
  border-color: hsl(var(--border) / 1.2);
  transform: translateY(-2px);
}
```

### 1.2 带区隔的卡片（如存储池包裹卡片）

```css
/* 包裹卡片：边框略深，用于区分外层容器与内部内容。
   border-color 使用 hsl(var(--border)) 但视觉上略深。 */
.wrapper-card {
  background: hsl(var(--card));
  border-radius: calc(var(--radius) * 1.5);
  border: 1px solid hsl(var(--border));
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}

.wrapper-card:hover {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
  border-color: hsl(var(--border) / 1.2);
  transform: translateY(-1px);
}
```

### 1.3 嵌套卡片（存储空间卡片）

```css
/* 嵌套卡片：圆角略小，边框略浅。
   悬浮时边框变为主色，提供视觉焦点。 */
.nest-card {
  background: hsl(var(--card));
  border-radius: calc(var(--radius) * 1.25); /* 10px，基于 0.5rem */
  border: 1px solid hsl(var(--border));
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 嵌套卡片悬浮时边框变为主色，明确指示可交互性 */
.nest-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  border-color: hsl(var(--primary));
}
```

### 1.4 卡片圆角层级

| 类型 | 圆角 | 计算方式 | 示例 |
|------|------|---------|------|
| 页面级大卡片 | `14px` | `calc(var(--radius) * 1.75)` | 硬件示意图面板、资源使用卡片 |
| 内容卡片 | `12px` | `calc(var(--radius) * 1.5)` | 存储池包裹、设备信息卡片 |
| 嵌套卡片 | `10px` | `calc(var(--radius) * 1.25)` | 存储空间卡片、硬盘卡片 |
| 内部元素 | `8px` | `calc(var(--radius))` | 图标盒、信息芯片、按钮 |

## 2. 图标盒（Icon Box）

图标盒用于页面头部、卡片头部、信息芯片等场景，提供一致的视觉锚点。

### 2.1 页面头部图标盒

```css
/* 页面头部图标盒：44×44px，圆角 10px。
   背景使用主色的 10% 透明度版本，
   这样在不同主题下，图标盒背景始终与主色协调。
   图标使用 hsl(var(--primary)) 作为主色。 */
.page-icon-box {
  width: 44px;
  height: 44px;
  border-radius: calc(var(--radius)); /* 8px 或基于主题 */
  background: hsl(var(--primary) / 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.page-icon-box .icon {
  font-size: 20px;
  color: hsl(var(--primary));
}
```

### 2.2 卡片内图标盒

```css
/* 卡片内小图标盒：32×32px，圆角 8px。
   使用主色 8% 透明度背景，比头部图标盒略淡，形成层次。 */
.card-icon-box {
  width: 32px;
  height: 32px;
  border-radius: calc(var(--radius));
  background: hsl(var(--primary) / 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-icon-box .icon {
  font-size: 16px;
  color: hsl(var(--primary));
}
```

### 2.3 大图标盒（Hero区）

```css
/* Hero 区大图标盒：56×56px，圆角 14px。
   白色背景 + 主色边框，营造"徽章"视觉效果。
   box-shadow 增加立体感。 */
.hero-icon-box {
  width: 56px;
  height: 56px;
  border-radius: calc(var(--radius) * 1.75);
  background: hsl(var(--card));
  border: 2px solid hsl(var(--primary) / 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px hsl(var(--primary) / 0.12);
}

.hero-icon-box .icon {
  font-size: 28px;
  color: hsl(var(--primary));
}
```

### 2.4 图标着色规范

根据内容语义选择图标颜色，使用 CSS 变量语义：

| 语义 | CSS 变量 | 背景色写法 | 使用场景 |
|------|---------|-----------|---------|
| 存储/信息 | `--primary` | `hsl(var(--primary) / 0.1)` | 存储空间、硬盘、SMB |
| 正常/成功 | `--success` | `hsl(var(--success) / 0.1)` | 健康状态、NFS、运行中 |
| 警告 | `--warning` | `hsl(var(--warning) / 0.1)` | 容量警告、USB/外部设备 |
| 危险 | `--destructive` | `hsl(var(--destructive) / 0.1)` | 错误、删除操作 |
| 紫色（硬件） | `#722ed1`（硬编码） | `#f9f0ff` | WebDAV、分享、SSD |
| 粉色（硬件） | `#eb2f96`（硬编码） | `#fff0f6` | 远程连接、管理HTTP |

**代码示例 — 语义化图标盒：**

```vue
<template>
  <!-- 存储相关：使用主色（蓝色系）-->
  <div class="icon-box" style="background: hsl(var(--primary) / 0.1);">
    <IconifyIcon icon="lucide:hard-drive" style="color: hsl(var(--primary));" />
  </div>

  <!-- 健康状态：使用成功色（绿色系）-->
  <div class="icon-box" style="background: hsl(var(--success) / 0.1);">
    <IconifyIcon icon="lucide:check-circle" style="color: hsl(var(--success));" />
  </div>

  <!-- 警告状态：使用警告色（橙色系）-->
  <div class="icon-box" style="background: hsl(var(--warning) / 0.1);">
    <IconifyIcon icon="lucide:alert-triangle" style="color: hsl(var(--warning));" />
  </div>

  <!-- SSD 硬件类型：紫色（硬编码，业务语义）-->
  <div class="icon-box" style="background: #f9f0ff;">
    <IconifyIcon icon="lucide:cpu" style="color: #722ed1;" />
  </div>
</template>
```

## 3. 标签与徽章

### 3.1 状态标签（Ant Design Vue Tag）

使用 Ant Design Vue 的 `Tag` 组件，配合 `color` 属性。
Ant Design 的颜色会通过 Vben 的 `useAntdDesignTokens` 自动映射到 CSS 变量：

```vue
<template>
  <!-- 正常状态 — Tag color="success" 映射到 --success -->
  <Tag color="success" size="small">
    <span class="status-dot" style="background: hsl(var(--success));" />
    正常
  </Tag>

  <!-- 警告状态 — Tag color="warning" 映射到 --warning -->
  <Tag color="warning" size="small">
    <span class="status-dot" style="background: hsl(var(--warning));" />
    警告
  </Tag>

  <!-- 错误状态 — Tag color="error" 映射到 --destructive -->
  <Tag color="error" size="small">
    <span class="status-dot" style="background: hsl(var(--destructive));" />
    异常
  </Tag>
</template>
```

### 3.2 元数据芯片（Meta Chip）

```css
/* 元数据芯片：用于展示 RAID 类型、硬盘数量等元信息。
   背景使用 accent 色（主题次要背景），
   文字使用 muted-foreground（次要文字色）。
   半透明边框增加精致感。 */
.meta-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  background: hsl(var(--accent));
  padding: 3px 10px;
  border-radius: calc(var(--radius) * 0.5);
  border: 1px solid hsl(var(--border) / 0.5);
}
```

### 3.3 数量徽章

```css
/* 数量徽章：小圆角胶囊形状，使用主色背景。
   白色文字在彩色背景上对比度足够。 */
.count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  font-size: 11px;
  font-weight: 700;
  color: hsl(var(--primary-foreground));
  background: hsl(var(--primary));
  border-radius: 9px;
}
```

## 4. 进度条

### 4.1 容量进度条

使用 Ant Design Vue 的 `Progress` 组件，配合动态 CSS 变量颜色：

```vue
<template>
  <!-- 容量进度条：stroke-color 绑定 CSS 变量颜色。
       当使用率变化时，颜色自动跟随语义（蓝→橙→红）。 -->
  <Progress
    :percent="usagePercent"
    :stroke-color="`hsl(var(--${capacityColorVar}))`"
    :show-info="false"
    :stroke-width="5"
    size="small"
  />
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({ used: String, total: String });

// 计算使用率百分比
const usagePercent = computed(() => {
  // 解析容量字符串...
  return 75;
});

// 根据使用率返回对应的 CSS 变量名
const capacityColorVar = computed(() => {
  const p = usagePercent.value;
  if (p >= 90) return 'destructive';
  if (p >= 70) return 'warning';
  return 'primary';
});
</script>
```

### 4.2 进度条颜色规则

容量进度条必须根据使用率动态变色：

| 使用率范围 | CSS 变量 | 语义 | 状态含义 |
|-----------|---------|------|---------|
| `< 70%` | `--primary` | 健康 | 安全 |
| `70% ~ 90%` | `--warning` | 警告 | 关注 |
| `> 90%` | `--destructive` | 危险 | 立即处理 |

## 5. 按钮规范

### 5.1 主要操作按钮

使用 Ant Design Vue 的 `Button` 组件，`type="primary"` 会自动使用 `--primary` 颜色：

```vue
<template>
  <!-- 主要按钮：type="primary" 自动映射到 CSS 变量 --primary -->
  <Button type="primary" size="small">
    <IconifyIcon icon="lucide:plus" style="font-size: 13px;" />
    创建
  </Button>
</template>
```

### 5.2 次要操作按钮

```vue
<template>
  <!-- 次要按钮：默认样式，用于非主要操作 -->
  <Button size="small">
    <IconifyIcon icon="lucide:settings" style="font-size: 12px;" />
    高级动作
  </Button>
</template>
```

### 5.3 图标按钮（表格/卡片内）

```css
/* 小图标按钮：26×26px，用于卡片内的紧凑操作。
   圆角使用主题圆角基准的 75%（默认 6px）。 */
.action-btn {
  width: 26px;
  height: 26px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: calc(var(--radius) * 0.75);
  border: 1px solid hsl(var(--border));
  background: hsl(var(--card));
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: hsl(var(--accent));
  color: hsl(var(--foreground));
  border-color: hsl(var(--border) / 1.2);
}
```

### 5.4 按钮样式要求

- 卡片内部操作按钮使用 `size="small"`
- 文字 + 图标组合按钮使用 `display: inline-flex; gap: 4px;`
- 危险操作使用 `danger` 属性或红色图标提示

## 6. 图标规范

### 6.1 图标库

统一使用 **lucide** 系列的 Iconify 图标：

```vue
<!-- 基础用法：IconifyIcon 组件 + lucide: 前缀 -->
<IconifyIcon icon="lucide:hard-drive" />

<!-- 带样式：通过 style 属性控制颜色和大小 -->
<IconifyIcon icon="lucide:hard-drive" style="font-size: 20px; color: hsl(var(--primary));" />
```

### 6.2 图标尺寸

| 场景 | 尺寸 | 示例 |
|------|------|------|
| 页面标题 | `20-22px` | 头部图标盒内 |
| 卡片标题 | `16px` | 区域标题旁 |
| 列表/表格 | `14px` | 表格列头、列表项 |
| 操作按钮 | `11-13px` | 按钮内图标 |
| 状态指示 | `10px` | 芯片内小图标 |

### 6.3 文件类型图标映射

| 类型 | 图标 | 颜色 |
|------|------|------|
| 文件夹 | `lucide:folder` | `hsl(var(--warning))` |
| 文档 | `lucide:file-text` | `hsl(var(--primary))` |
| 图片 | `lucide:image` | `hsl(var(--success))` |
| 视频 | `lucide:video` | `#eb2f96` |
| 音频 | `lucide:music` | `#722ed1` |
| 压缩包 | `lucide:archive` | `hsl(var(--warning))` |
| 代码/配置 | `lucide:code` | `hsl(var(--muted-foreground))` |

## 7. 下拉菜单

### 7.1 操作下拉菜单样式

```css
/* 下拉菜单容器：白色背景 + 圆角 + 阴影。
   使用 CSS 变量确保暗色主题下背景正确。 */
.action-menu {
  background: hsl(var(--popover));
  border-radius: calc(var(--radius) * 1.25);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  border: 1px solid hsl(var(--border));
  padding: 4px;
  min-width: 120px;
}

/* 菜单项：flex 布局，圆角，hover 时背景变化。
   使用 accent 色作为 hover 背景。 */
.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: calc(var(--radius) * 0.75);
  cursor: pointer;
  font-size: 13px;
  color: hsl(var(--foreground));
  transition: all 0.2s ease;
}

.menu-item:hover {
  background: hsl(var(--accent));
}

/* 危险操作菜单项：hover 时使用 destructive 色的半透明背景 */
.menu-item.danger:hover {
  background: hsl(var(--destructive) / 0.08);
  color: hsl(var(--destructive));
}

/* 菜单分割线：使用边框色 */
.menu-divider {
  height: 1px;
  background: hsl(var(--border));
  margin: 4px 0;
}
```

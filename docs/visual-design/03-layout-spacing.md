# 布局与间距

## 1. 页面结构

所有内容页面遵循统一的结构模式：

```
┌─────────────────────────────────────┐
│  页面头部 (Page Header)              │  ← 白色/卡片色背景，border-bottom
├─────────────────────────────────────┤
│                                     │
│  主体内容区 (Main Content)           │  ← hsl(var(--background)) 背景
│  ┌─────────────────────────────┐   │
│  │  Hero / 概览区 (可选)        │   │
│  ├─────────────────────────────┤   │
│  │  内容卡片 / 表格 / 列表      │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

## 2. 页面头部规范（所有页面必须统一）

### 2.1 基础样式（使用 CSS 变量）

```css
/* 页面头部使用 CSS 变量定义背景和边框。
   background 使用 hsl(var(--card)) 确保暗色主题下为深色卡片背景。
   border-bottom 使用 hsl(var(--border)) 确保与主题一致的边框色。
   margin: 0 -20px 16px 用于抵消父容器的 padding，使头部与页面边缘对齐。 */
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
```

### 2.2 左侧结构

```css
/* 头部左侧：图标盒 + 标题文字区域，水平排列，间距 12px */
.page-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 图标盒：44×44px，圆角 10px，使用主色的 10% 透明度作为背景。
   图标盒为页面提供视觉锚点，让用户快速识别当前页面主题。 */
.page-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: hsl(var(--primary) / 0.1);  /* 主色 10% 透明度背景 */
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* 图标使用主题主色 */
.page-icon-box .icon {
  font-size: 20px;
  color: hsl(var(--primary));
}

/* 页面标题：16px，字重 600，使用前景文字色 */
.page-title {
  font-size: 16px;
  font-weight: 600;
  color: hsl(var(--foreground));
  margin: 0;
  line-height: 1.4;
}

/* 页面描述：12px，使用次要文字色，与标题形成层次对比 */
.page-desc {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  margin: 2px 0 0;
}
```

### 2.3 右侧统计概览

头部右侧放置统计概览卡片组，每个卡片结构：

```css
/* 统计概览卡片：使用 accent 色（主题次要背景）作为卡片背景。
   这样在不同主题下，统计卡片与页面头部背景有微妙的层次区分。 */
.stat-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: hsl(var(--accent));
  border-radius: 8px;
  min-width: 90px;
}

/* 统计标签：11px，次要文字色 */
.stat-label {
  font-size: 11px;
  color: hsl(var(--muted-foreground));
}

/* 统计数值：16px，字重 600，前景色，等宽字体确保数字对齐 */
.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: hsl(var(--foreground));
  font-family: 'SF Mono', 'Fira Code', monospace;
}
```

**Vue 模板示例 — 页面头部完整实现：**

```vue
<template>
  <div class="page-header">
    <div class="page-header-left">
      <div class="page-icon-box">
        <IconifyIcon icon="lucide:hard-drive" style="font-size: 20px; color: hsl(var(--primary));" />
      </div>
      <div>
        <h1 class="page-title">存储空间管理</h1>
        <p class="page-desc">管理基于存储池或目录的存储空间分配与使用</p>
      </div>
    </div>
    <div class="page-header-right">
      <div class="stat-card">
        <IconifyIcon icon="lucide:database" style="font-size: 16px; color: hsl(var(--primary));" />
        <div style="display: flex; flex-direction: column; gap: 1px;">
          <span class="stat-label">存储池</span>
          <span class="stat-value">{{ poolCount }}</span>
        </div>
      </div>
      <div class="stat-card">
        <IconifyIcon icon="lucide:box" style="font-size: 16px; color: hsl(var(--primary));" />
        <div style="display: flex; flex-direction: column; gap: 1px;">
          <span class="stat-label">存储空间</span>
          <span class="stat-value">{{ volumeCount }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
```

## 3. 页面容器

```css
/* 页面容器使用 CSS 变量定义背景色。
   在亮色主题下为浅灰 (#f5f5f5)，暗色主题下为深色。
   padding: 0 20px 16px 提供左右留白和底部间距。 */
.page-container {
  padding: 0 20px 16px;
  width: 100%;
  background: hsl(var(--background));
  min-height: 100%;
}
```

## 4. 间距系统

| Token | 值 | 用途 |
|-------|-----|------|
| xs | `4px` | 图标与文字间距、极小间隙 |
| sm | `8px` | 按钮内间距、标签间距 |
| md | `12px` | 卡片内部 padding、grid gap |
| lg | `16px` | 卡片间距、section 间距 |
| xl | `20px` | 页面水平 padding、头部 padding |
| 2xl | `24px` | Hero 区 padding、大卡片 padding |

## 5. Grid 布局

### 5.1 卡片网格

```css
/* 默认自适应卡片网格。
   每列最小宽度 380px，当空间不足时自动换行。
   gap: 12px 提供卡片之间的间距。 */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 12px;
}

/* 大卡片网格：每列最小宽度 420px，适用于网络接口等宽卡片 */
.card-grid-large {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
  gap: 12px;
}

/* 紧凑卡片网格：每列最小宽度 300px，适用于存储空间等紧凑卡片 */
.card-grid-compact {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
}
```

### 5.2 双栏布局

```css
/* 双栏资源布局：CPU/内存使用率等并排展示。
   auto-fit 确保在窄屏幕上自动变为单列。 */
.resource-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 16px;
}
```

## 6. 响应式断点

| 断点 | 宽度 | 调整 |
|------|------|------|
| 桌面 | `≥ 1200px` | 默认布局 |
| 平板 | `≤ 992px` | 头部垂直堆叠、grid 列减少 |
| 小平板 | `≤ 768px` | 双栏变单栏、文件管理器垂直堆叠 |
| 手机 | `≤ 576px` | 全部单列、padding 缩小 |

### 响应式代码模板

```css
/* 平板断点：头部垂直堆叠，统计卡片换行 */
@media (max-width: 992px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .page-header-right {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }
}

/* 小平板断点：文件管理器垂直堆叠，卡片网格单列 */
@media (max-width: 768px) {
  .fm-body {
    flex-direction: column;
  }
  .card-grid {
    grid-template-columns: 1fr;
  }
}

/* 手机断点：缩小页面 padding */
@media (max-width: 576px) {
  .page-container {
    padding: 0 12px 12px;
  }
}
```

# 页面模式

本文档定义项目中反复出现的页面级视觉模式，所有新页面应遵循这些模式以保持风格统一。

## 1. 页面头部模式（Page Header Pattern）

### 1.1 标准头部（所有页面必须遵循）

所有内容页面必须在顶部使用统一的页面头部：

```
┌────────────────────────────────────────────────────────────┐
│  ┌────┐                                                    │
│  │图标│  页面标题 (16px/600)                    统计卡片1  │
│  └────┘  页面描述 (12px/muted-foreground)   统计卡片2 卡片3│
│                                                            │
└────────────────────────────────────────────────────────────┘
         背景 hsl(var(--card))，border-bottom: 1px solid hsl(var(--border))
         padding: 16px 20px
```

### 1.2 头部左侧

- **图标盒**：44×44px，圆角 `calc(var(--radius))`，背景 `hsl(var(--primary) / 0.1)`
- **页面标题**：16px，font-weight 600，颜色 `hsl(var(--foreground))`
- **页面描述**：12px，颜色 `hsl(var(--muted-foreground))`，可选

### 1.3 头部右侧（统计概览）

右侧放置 2-4 个统计概览卡片，每个卡片：

```css
/* 统计概览卡片：使用 accent 色作为背景。
   图标使用语义化颜色（如 primary/success/warning）。
   数值使用等宽字体，确保数字对齐。 */
.overview-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: hsl(var(--accent));
  border-radius: calc(var(--radius));
  min-width: 90px;
}
```

**统计卡片包含**：
- 小图标（16px，语义着色，使用 CSS 变量如 `hsl(var(--primary))`）
- 标签（11px，`hsl(var(--muted-foreground))`）
- 数值（16px，font-weight 600，等宽字体）

### 1.4 代码实现模板

```vue
<template>
  <div class="page-header">
    <div class="page-header-left">
      <!-- 图标盒：使用主色 10% 透明度背景 + 主色图标 -->
      <div class="page-icon-box">
        <IconifyIcon
          icon="lucide:xxx"
          style="font-size: 20px; color: hsl(var(--primary));"
        />
      </div>
      <div>
        <h1 class="page-title">页面标题</h1>
        <p class="page-desc">页面描述文字</p>
      </div>
    </div>
    <div class="page-header-right">
      <!-- 统计概览卡片组 -->
      <OverviewCard v-for="stat in stats" :key="stat.label" v-bind="stat" />
    </div>
  </div>
</template>

<style scoped>
/* 页面头部容器：flex 布局，左右对齐。
   使用 CSS 变量确保暗色主题下背景正确。 */
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

.page-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 图标盒：44×44px，主色半透明背景 */
.page-icon-box {
  width: 44px;
  height: 44px;
  border-radius: calc(var(--radius));
  background: hsl(var(--primary) / 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.page-title {
  font-size: 16px;
  font-weight: 600;
  color: hsl(var(--foreground));
  margin: 0;
  line-height: 1.4;
}

.page-desc {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  margin: 2px 0 0;
}

.page-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
```

## 2. Hero 信息区模式（Hero Pattern）

用于设备管理页等需要突出展示关键信息的页面：

```
┌────────────────────────────────────────────────────────────┐
│  ┌────┐  设备名称 (20px/700)                               │
│  │大  │  [系统版本] [运行时间]                    信息芯片组 │
│  │图标│  [CPU芯片] [内存芯片] [硬盘芯片] [设备ID] [远程连接]│
│  └────┘                                                    │
│         渐变背景 linear-gradient(135deg, #f0f5ff, #f6ffed) │
│         border-radius: 14px                                │
│         padding: 20px 24px                                 │
└────────────────────────────────────────────────────────────┘
```

### 2.1 Hero 区左侧

- **大图标盒**：56×56px，圆角 `calc(var(--radius) * 1.75)`，白色背景，带主色边框和阴影
- **设备名称**：20px，font-weight 700，颜色 `#141414`
- **状态标签**：使用 Ant Design Vue Tag 组件（自动映射到 CSS 变量）

### 2.2 Hero 区右侧（信息芯片组）

```css
/* 信息芯片：白色背景 + 圆角 + 阴影。
   悬浮时阴影增强 + 轻微上浮。 */
.info-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: hsl(var(--card));
  border-radius: calc(var(--radius) * 1.25);
  border: 1px solid hsl(var(--border));
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.info-chip:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}
```

每个芯片包含：32×32px 图标盒 + 数值（13px/600）+ 标签（10px/`hsl(var(--muted-foreground))`）

## 3. 分区卡片模式（Section Card Pattern）

用于将页面内容划分为多个独立区域：

```
┌────────────────────────────────────────────────────────────┐
│  ┌──┐ 分区标题 (15px/600)                    数量标签       │
│  └──┘                                                      │
├────────────────────────────────────────────────────────────┤
│                                                            │
│                    内容区域                                 │
│                                                            │
│                                                            │
└────────────────────────────────────────────────────────────┘
         border-radius: calc(var(--radius) * 1.75)
         body-padding: 16px
```

使用 Ant Design Vue 的 `Card` 组件：

```vue
<template>
  <!-- Card 组件：使用 CSS 变量确保暗色主题下样式正确。
       :bordered="true" 显示边框。
       :body-style 设置内部 padding。 -->
  <Card
    class="section-card"
    :bordered="true"
    :body-style="{ padding: '16px' }"
  >
    <template #title>
      <div class="section-title-bar">
        <div class="section-title-left">
          <IconifyIcon
            icon="lucide:xxx"
            style="font-size: 16px; color: hsl(var(--primary));"
          />
          <span class="section-title-text">分区标题</span>
          <Tag size="small" class="count-tag">{{ count }} 个</Tag>
        </div>
      </div>
    </template>
    <!-- 内容区域 -->
  </Card>
</template>
```

## 4. 文件管理器模式（File Manager Pattern）

用于我的文件、回收站、设备全部文件等页面：

```
┌────────────────────────────────────────────────────────────┐
│  页面头部                                                  │
├────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌─────────────────────────────────────┐ │
│  │              │  │ 面包屑导航                            │ │
│  │   文件目录    │  ├─────────────────────────────────────┤ │
│  │   (Tree)     │  │                                     │ │
│  │              │  │           文件列表/网格                │ │
│  │              │  │                                     │ │
│  │              │  │                                     │ │
│  └──────────────┘  └─────────────────────────────────────┘ │
│       240px宽             flex: 1                          │
│       左侧面板              右侧面板                        │
│  gap: 12px                                                 │
└────────────────────────────────────────────────────────────┘
```

### 4.1 布局要求

- 左侧 Tree 面板宽度约 240px，可折叠
- 右侧文件面板占据剩余空间
- 两面板之间 gap: 12px
- 整体 padding: 12px
- 背景色：`hsl(var(--background))`

### 4.2 响应式

在 `≤ 768px` 时，左右面板垂直堆叠：

```css
/* 小平板及以下：文件管理器垂直堆叠。
   左侧 Tree 面板变为顶部折叠面板。 */
@media (max-width: 768px) {
  .fm-body {
    flex-direction: column;
  }
}
```

## 5. 卡片网格模式（Card Grid Pattern）

用于硬盘、网络接口、外接设备等网格展示：

```
┌────────────────────────────────────────────────────────────┐
│  页面头部                                                  │
├────────────────────────────────────────────────────────────┤
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │   卡片1     │  │   卡片2     │  │   卡片3     │           │
│  └────────────┘  └────────────┘  └────────────┘           │
│  ┌────────────┐                                            │
│  │   卡片4     │                                            │
│  └────────────┘                                            │
│         grid-template-columns: repeat(auto-fill, minmax(380px, 1fr))
│         gap: 12px
└────────────────────────────────────────────────────────────┘
```

## 6. 列表+动作栏模式（List + Action Bar Pattern）

用于我的分享、公共文件等表格/列表页：

```
┌────────────────────────────────────────────────────────────┐
│  页面头部                                                  │
├────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐  │
│  │ [主要按钮]                              [搜索框🔍]   │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                                                      │  │
│  │                   表格/列表内容                       │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│         动作栏：padding: 12px 20px                         │
│         表格区：border-radius: calc(var(--radius) * 1.5)   │
└────────────────────────────────────────────────────────────┘
```

### 6.1 动作栏样式

```css
/* 动作栏：白色背景 + 底部分割线。
   左右 flex 布局，左侧放主要操作按钮，右侧放搜索/筛选。 */
.action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: hsl(var(--card));
  border-bottom: 1px solid hsl(var(--border));
  gap: 12px;
  flex-shrink: 0;
}
```

## 7. 空状态模式（Empty State Pattern）

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│                          🗂️                                │
│                       (大图标 48-64px)                      │
│                                                            │
│                      "暂无数据"                             │
│                    (14px, muted-foreground)                │
│                                                            │
│                   [立即创建]                                │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**代码示例 — 空状态组件：**

```vue
<template>
  <div class="empty-state">
    <!-- 大图标：48-64px，使用 muted-foreground 色，表示"空"状态 -->
    <IconifyIcon
      icon="lucide:inbox"
      style="font-size: 48px; color: hsl(var(--muted-foreground));"
    />
    <!-- 描述文字：14px，次要文字色 -->
    <p>暂无数据</p>
    <!-- 可选操作按钮 -->
    <Button type="primary" size="small">立即创建</Button>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 20px;
  background: hsl(var(--card));
  border-radius: calc(var(--radius) * 1.5);
  border: 1px solid hsl(var(--border));
}

.empty-state p {
  margin-top: 12px;
  font-size: 14px;
  color: hsl(var(--muted-foreground));
}
</style>
```

## 8. 页面类型映射

| 页面类型 | 适用模式 | 示例页面 |
|---------|---------|---------|
| 文件管理 | 文件管理器模式 | 我的文件、回收站、设备全部文件 |
| 设备概览 | Hero + 分区卡片 + 卡片网格 | 设备管理 |
| 资源管理 | 标准头部 + 卡片网格/列表 | 存储空间管理、外接设备 |
| 配置列表 | 标准头部 + 动作栏 + 表格 | 我的分享、服务设置 |
| 详情页 | 标准头部 + 信息面板 + 图表 | 磁盘详情、存储池详情 |

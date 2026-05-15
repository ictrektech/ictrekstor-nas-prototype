# 交互规范

## 1. 过渡动画

### 1.1 全局过渡曲线

```css
/* 主要过渡曲线 — 用于悬浮、展开、状态变化。
   cubic-bezier(0.4, 0, 0.2, 1) 是 Material Design 标准曲线，
   特点是：快速启动、缓慢结束，给人"顺滑"的感觉。 */
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

/* 快速反馈 — 用于按钮点击、小状态切换。
   ease 是浏览器默认曲线，简洁快速。 */
transition: all 0.2s ease;
```

### 1.2 各元素过渡时长

| 元素 | 时长 | 曲线 | 说明 |
|------|------|------|------|
| 卡片悬浮 | `0.3s` | `cubic-bezier(0.4, 0, 0.2, 1)` | 阴影 + 位移 + 边框 |
| 按钮悬浮 | `0.2s` | `ease` | 背景色、阴影变化 |
| 下拉菜单 | `0.2s` | `ease` | 展开/收起 |
| 图标缩放 | `0.2s` | `ease` | 图标盒悬浮时放大 |
| 进度条 | `0.3s` | `ease` | 百分比变化时的宽度动画 |
| 页面切换 | `0.3s` | `ease` | 路由切换时的淡入淡出 |

## 2. 悬浮态（Hover）

### 2.1 卡片悬浮

所有内容卡片必须实现统一的悬浮效果：

```css
/* 卡片悬浮效果：向上浮起 + 阴影加深 + 边框高亮。
   translateY(-2px) 营造"浮起"感。
   box-shadow 从 2px 提升到 6px，增加层次感。
   border-color 变亮，提供视觉反馈。 */
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
  border-color: hsl(var(--border) / 1.2);
}
```

**特殊变体**：

```css
/* 嵌套卡片悬浮时边框变为主色，明确指示可交互性 */
.nest-card:hover {
  border-color: hsl(var(--primary));
}

/* 目录类型卡片悬浮时边框变为成功色 */
.directory-card:hover {
  border-color: hsl(var(--success));
}
```

### 2.2 图标盒悬浮

```css
/* 图标盒悬浮效果：放大 + 亮度提升。
   scale(1.08) 给用户明确的可点击暗示。
   brightness(1.1) 增加视觉吸引力。 */
.icon-box {
  cursor: pointer;
  transition: transform 0.2s ease, filter 0.2s ease;
}

.icon-box:hover {
  transform: scale(1.08);
  filter: brightness(1.1);
}
```

### 2.3 信息芯片悬浮

```css
/* 信息芯片悬浮：轻微浮起 + 阴影增强。
   translateY(-1px) 比卡片更微妙，因为芯片更小。 */
.info-chip {
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}

.info-chip:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}
```

### 2.4 磁盘标签悬浮（可点击标签）

```css
/* 可点击磁盘标签：hover 时背景加深 + 边框加亮。
   使用 CSS 变量主色的半透明版本。 */
.disk-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 0.08);
  padding: 3px 10px;
  border-radius: calc(var(--radius) * 0.5);
  border: 1px solid hsl(var(--primary) / 0.15);
  cursor: pointer;
  transition: all 0.2s ease;
}

.disk-tag:hover {
  background: hsl(var(--primary) / 0.15);
  border-color: hsl(var(--primary) / 0.3);
}
```

### 2.5 表格行悬浮

表格行悬浮时使用浅色背景高亮：

```css
/* 表格行悬浮：使用 accent 色作为高亮背景。
   accent 色在不同主题下自动适配。 */
.table-row:hover {
  background: hsl(var(--accent));
}
```

## 3. 点击态（Active）

### 3.1 按钮点击

```css
/* 按钮点击效果：轻微缩小，给用户"按下"的物理反馈。
   scale(0.98) 幅度很小，不会影响布局。 */
.btn:active {
  transform: scale(0.98);
}
```

### 3.2 卡片点击

```css
/* 可点击卡片：点击时取消浮起 + 轻微缩小。
   传达"被按下"的感觉。 */
.card-clickable:active {
  transform: translateY(0) scale(0.995);
}
```

## 4. 焦点态（Focus）

输入框、按钮等可聚焦元素：

```css
/* 焦点态：使用主色的 outline，确保键盘导航可见性。
   outline-offset 让 outline 与元素有间隙，更醒目。 */
.input:focus,
.btn:focus-visible {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 2px;
}
```

## 5. 状态反馈

### 5.1 加载状态

- 卡片/区域加载时使用骨架屏（Skeleton）或 Spin 组件
- 按钮加载时使用 `loading` 属性，禁用点击

```vue
<template>
  <!-- 骨架屏：在数据加载时显示灰色占位块 -->
  <Skeleton active :paragraph="{ rows: 4 }" />

  <!-- 加载按钮：loading 状态自动显示转圈图标并禁用点击 -->
  <Button type="primary" :loading="isLoading" @click="handleSubmit">
    保存
  </Button>
</template>
```

### 5.2 空状态

空状态必须包含三个要素：

```vue
<template>
  <!-- 空状态组件：大图标 + 描述文字 + 可选操作按钮。
       图标使用 muted-foreground 色（次要文字色），与背景对比适中。
       文字使用 muted-foreground，表明这是"无数据"状态。 -->
  <div class="empty-state">
    <IconifyIcon icon="lucide:inbox" style="font-size: 48px; color: hsl(var(--muted-foreground));" />
    <p style="font-size: 14px; color: hsl(var(--muted-foreground)); margin-top: 12px;">
      暂无数据
    </p>
    <Button type="primary" size="small" style="margin-top: 16px;">
      立即创建
    </Button>
  </div>
</template>

<style>
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
</style>
```

### 5.3 操作成功/失败反馈

使用 Ant Design Vue 的 `message` 组件，其颜色自动映射到 CSS 变量：

```ts
// 操作成功：绿色提示，自动映射到 --success
message.success('操作成功');

// 操作失败：红色提示，自动映射到 --destructive
message.error('操作失败');

// 警告提示：橙色提示，自动映射到 --warning
message.warning('请注意');

// 普通提示：蓝色提示，自动映射到 --primary
message.info('提示信息');
```

## 6. 禁用态（Disabled）

禁用元素必须满足三个条件：

```css
/* 禁用态：降低透明度 + 禁用鼠标指针 + 禁止交互事件。
   这三个属性同时使用，确保用户明确知道该元素不可用。 */
.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
```

## 7. 开关/切换动画

Toggle 开关切换时应有平滑过渡：

```css
/* 开关切换：背景色和滑块位置同时过渡。
   过渡时长 0.3s，与卡片悬浮一致。 */
.toggle-switch {
  transition: background-color 0.3s ease, transform 0.3s ease;
}
```

## 8. 滚动行为

- 页面内容区使用 `overflow: auto` 实现内部滚动
- 表格区域支持水平滚动时显示自定义滚动条样式
- 长列表使用虚拟滚动（如数据量 > 100 条）

## 9. 响应式交互

- 移动端（`≤ 768px`）卡片网格变为单列
- 触摸设备上悬浮效果可改为点击态反馈
- 小屏幕下隐藏非关键信息，通过展开/折叠查看

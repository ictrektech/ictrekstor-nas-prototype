# 08 内置组件

> 源文件：`docs/src/components/introduction.md`（15 行）、`docs/src/components/common-ui/*.md`、`docs/src/components/layout-ui/*.md`

---

## 8.1 组件体系概述

Vben Admin 提供两类组件：

- **布局组件**：页面内容区域的顶层容器，提供统一布局样式和基本功能
- **通用组件**：基于 Tailwind CSS 实现的常用组件（弹窗、抽屉、表单等），可适用于不同 UI 组件库的应用

## 8.2 布局组件

### Page 页面容器

位于 `@vben/layout-ui` 下的 `Page` 组件，是页面的顶层容器。

### 布局系统

框架支持多种布局方式，通过 `preferences.ts` 配置：

```ts
export const overridesPreferences = defineOverridesPreferences({
  app: {
    layout: 'sidebar-nav', // 'sidebar-nav' | 'header-nav' | 'mixed-nav' | 'full-content'
  },
});
```

## 8.3 通用组件（@vben/common-ui）

### VbenAlert 提示框

### VbenApiComponent API 组件

用于根据接口数据动态渲染组件内容。

### VbenCountToAnimator 数字动画

数字递增/递减动画效果组件。

### VbenDrawer 抽屉

基于框架封装的抽屉组件，提供更便捷的使用方式。

### VbenEllipsisText 文本省略

自动处理文本溢出显示省略号。

### VbenForm 表单

高级表单组件，支持动态配置、验证等。

### VbenModal 弹窗

基于框架封装的弹窗组件，提供更便捷的使用方式。

### VbenVxeTable 表格

基于 VxeTable 封装的表格组件，提供强大的表格功能。

## 8.4 组件使用原则

> 如果你觉得现有组件的封装不够理想，或者不完全符合你的需求，大可以直接使用原生组件，亦或亲手封装一个适合的组件。框架提供的组件并非束缚，使用与否，完全取决于你的需求与自由。

## 8.5 在 ictrekstor 项目中使用组件

- 优先使用 Vben 提供的内置组件和工具（如 `@vben/common-ui`、`@vben/hooks`）
- 遵循 Vben 的目录结构和编码约定
- 如需自定义通用组件，优先在 `apps/web-antd/src/components/` 下创建
- 样式优先使用 Tailwind CSS 工具类，复杂样式可使用 `<style scoped>`

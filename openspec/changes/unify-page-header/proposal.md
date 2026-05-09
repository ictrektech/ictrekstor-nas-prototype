## Why

当前文件管理和存储管理的各个子页面顶部 header 风格不一致：部分页面（如"我的文件"、"团队文件管理"）已采用统一的 `page-header` 布局（左侧图标+标题+描述，右侧统计概览卡片），但仍有大量子页面使用原生 `Card` 标题、自定义 `overview-section` 或完全缺失顶部信息区。这种不一致降低了产品的专业感和用户体验，需要通过统一的顶部布局规范进行改造。

## What Changes

- 统一所有文件管理子页面的顶部布局为标准的 `page-header` 风格：
  - `file/external-device/index.vue` — 将 `overview-section` 改造为 `page-header`
  - `file/external-device/manage.vue` — 将 `top-toolbar` 改造为 `page-header` + 操作栏
  - `file/library/index.vue` — 新增 `page-header`，替换原生 `Card` 标题
  - `file/share-links/index.vue` — 新增 `page-header`，替换原生 `Card` 标题
  - `file/external/index.vue` — 新增 `page-header`，替换原生 `Card` 标题

- 统一所有存储管理子页面的顶部布局为标准的 `page-header` 风格：
  - `storage/disks/index.vue` — 在 NAS 示意图上方新增 `page-header`
  - `storage/disks/detail.vue` — 将面包屑+设备概览改造为 `page-header`
  - `storage/pools/detail.vue` — 将返回栏+池头卡片改造为 `page-header`
  - `storage/volumes/index.vue` — 将 `overview-section` 改造为 `page-header`
  - `storage/team-files/detail.vue` — 新增 `page-header`（当前仅有面包屑）
  - `storage/public-dirs/index.vue` — 新增 `page-header`
  - `storage/recycle-bin/index.vue` — 新增 `page-header`
  - `storage/all-files/detail.vue` — 新增 `page-header`

- 制定统一的 `page-header` CSS 规范，确保图标、标题、描述、统计卡片的样式完全一致。

## Capabilities

### New Capabilities
<!-- 本变更为纯 UI 样式统一，不引入新的功能能力 -->

### Modified Capabilities
<!-- 本变更为纯 UI 样式统一，不修改已有 spec 的需求定义 -->

## Impact

- **前端页面**：涉及约 14 个 Vue 页面文件的顶部布局改造
- **样式文件**：各页面的 `<style scoped>` 区块需同步更新
- **Mock 数据**：部分页面的统计概览需要补充或调整计算属性
- **无 API 变更**：纯前端展示层调整，不影响后端接口
- **无 breaking change**：仅视觉层面的布局统一，不影响功能逻辑

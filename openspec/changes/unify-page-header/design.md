## Context

当前项目中，文件管理和存储管理模块包含约 20 个子页面。其中仅 "我的文件" (`file/my-files`) 和 "团队文件管理" (`storage/team-files`) 采用了统一的 `page-header` 顶部布局风格（左侧：图标 + 标题 + 描述，右侧：统计概览卡片），其余页面各自为政：

- 部分页面使用原生 Ant Design Vue `Card` 组件作为标题容器（如 `library/index.vue`、`share-links/index.vue`、`external/index.vue`），缺乏图标和描述
- 部分页面使用自定义的 `overview-section`（如 `external-device/index.vue`、`volumes/index.vue`），样式与标准 `page-header` 不一致
- 部分页面使用 `top-toolbar` 工具栏风格（如 `external-device/manage.vue`），信息密度低且无统计概览
- 部分详情页仅有面包屑返回行（如 `disks/detail.vue`、`pools/detail.vue`、`team-files/detail.vue`），缺少页面级别的标题和概览信息

## Goals / Non-Goals

**Goals:**
- 制定统一的 `page-header` 组件化布局规范，覆盖所有文件管理和存储管理子页面
- 确保每个页面的顶部包含：页面图标、标题、简要描述、关键统计概览（数量/容量/状态等）
- 保留各页面原有的功能操作按钮（新建、上传、刷新、筛选等），将其置于 `page-header` 下方或集成到右侧区域
- 所有改造页面的视觉风格与 "我的文件" 页面保持一致

**Non-Goals:**
- 不引入新的 Vue 通用组件（如抽离 `PageHeader` 组件），仅在各页面内统一 HTML 结构和 CSS 类名
- 不修改页面的核心功能逻辑、路由配置或 API 接口
- 不修改 `file/network/index.vue`，该页面已具有类似 `page-header` 的布局，当前风格基本可接受
- 不修改 `storage/all-files/index.vue` 和 `storage/team-files/index.vue`，这两个页面已符合标准

## Decisions

### 1. 统一的 page-header HTML 结构

采用 "我的文件" 页面已验证的结构作为标准：

```html
<div class="page-header">
  <div class="page-header-left">
    <div class="page-icon-box">
      <IconifyIcon :icon="pageIcon" style="font-size: 20px; color: #1677ff;" />
    </div>
    <div class="page-title-area">
      <h1 class="page-title">页面标题</h1>
      <p class="page-desc">页面描述文字</p>
    </div>
  </div>
  <div class="page-header-right">
    <!-- 1~3 个统计概览卡片 -->
    <div class="overview-card" v-for="stat in stats" :key="stat.label">
      <IconifyIcon :icon="stat.icon" style="font-size: 16px; color: stat.color;" />
      <div class="overview-info">
        <span class="overview-label">{{ stat.label }}</span>
        <span class="overview-value">{{ stat.value }}</span>
      </div>
    </div>
  </div>
</div>
```

**Rationale**：该结构已在 "我的文件" 和 "团队文件管理" 中稳定运行，用户反馈良好，直接复用可降低改造成本。

### 2. 统一的 CSS 样式

将以下 CSS 规范作为各页面 `<style scoped>` 的标配：

```css
.page-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; background: #fff; border-bottom: 1px solid #f0f0f0; gap: 16px; flex-shrink: 0; }
.page-header-left { display: flex; align-items: center; gap: 12px; }
.page-icon-box { width: 44px; height: 44px; border-radius: 10px; background: #e6f4ff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.page-title { font-size: 16px; font-weight: 600; color: #262626; margin: 0; line-height: 1.4; }
.page-desc { font-size: 12px; color: #8c8c8c; margin: 2px 0 0; }
.page-header-right { display: flex; align-items: center; gap: 12px; }
.overview-card { display: flex; align-items: center; gap: 8px; padding: 8px 14px; background: #f5f5f5; border-radius: 8px; min-width: 90px; }
.overview-info { display: flex; flex-direction: column; gap: 1px; }
.overview-label { font-size: 11px; color: #8c8c8c; }
.overview-value { font-size: 16px; font-weight: 600; color: #262626; font-family: 'SF Mono', 'Fira Code', monospace; }
```

**Rationale**：与现有标准页面的 CSS 完全一致，确保跨页面的像素级对齐。

### 3. 操作按钮的位置

- 对于以文件管理为主的页面（如 `library`、`share-links`、`external`）：在 `page-header` 右侧统计卡片旁添加操作按钮（如"新建"），或保留在主体内容区的工具栏中
- 对于 `external-device/manage.vue`：将 `top-toolbar` 中的"返回"按钮保留在左上角（作为面包屑导航的一部分），右侧保留连接状态和本地文件管理器开关，将 `page-header` 作为新增的独立信息层置于工具栏下方
- 对于详情页（如 `disks/detail`、`pools/detail`）：将返回按钮融入 `page-header` 左侧的 `page-title-area` 上方，或使用面包屑组件替代

### 4. 分批实施策略

按模块分批实施，每批完成后截图验证：
- **批次 1**：文件管理改造（`external-device/index`、`external-device/manage`、`library`、`share-links`、`external`）
- **批次 2**：存储管理列表页（`disks/index`、`volumes/index`、`public-dirs`、`recycle-bin`）
- **批次 3**：存储管理详情页（`disks/detail`、`pools/detail`、`team-files/detail`、`all-files/detail`）

**Rationale**：降低单次变更范围，便于逐步验证和回滚。

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| 大量文件同时变更可能导致样式冲突或遗漏 | 分批实施，每批完成后浏览器截图验证 |
| 详情页原有的复杂布局（如 NAS 示意图、设备卡片）与新增 `page-header` 叠加后显得拥挤 | 调整 `page-header` 的 padding 和下方内容的 margin，确保留白充足 |
| 部分页面的统计概览需要从 mock 数据中新增计算属性 | 使用现有数据结构计算，不引入新数据源；如数据不足则简化统计卡片数量 |
| 用户可能认为改造后的布局"信息密度降低"（部分页面的原生 `Card` 布局将标题置于卡片内部） | 保持原有内容区域不变，仅在页面最顶部新增/替换 header，不影响主体内容 |

## Migration Plan

1. 按批次逐步修改各页面的 template 和 style
2. 每批次完成后执行 `pnpm run build:antd` 确保无构建错误
3. 每批次完成后浏览器截图对比改造前后的效果
4. 全部完成后一次性提交 commit

## Open Questions

- `file/network/index.vue` 的顶部布局已较为规范，是否需要严格对齐 `page-header` 的 CSS 类名？（建议维持现状，避免过度改造）
- `storage/disks/index.vue` 的 NAS 设备示意图区域高度较大，新增的 `page-header` 是否会导致首屏内容被挤压？（建议保持 `page-header` 紧凑，`padding: 12px 20px`）

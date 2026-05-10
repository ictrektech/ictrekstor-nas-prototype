# 当前任务：unify-page-header（统一页面顶部 Header 风格）

## 任务来源
- 触发方式：用户指令
- 关联变更：openspec/changes/unify-page-header/

## 目标与范围
按 OpenSpec tasks.md 分 3 个批次改造 14 个页面，统一 page-header 风格

### 批次 1：文件管理子页面改造
- [x] 1.1 file/library/index.vue — 移除 Card 标题，新增 page-header
- [x] 1.2 file/share-links/index.vue — 移除 Card 标题，新增 page-header
- [x] 1.3 file/external/index.vue — 移除 Card 标题，新增 page-header
- [x] 1.4 file/external-device/index.vue — overview-section → page-header
- [x] 1.5 file/external-device/manage.vue — top-toolbar 下方新增 page-header
- [ ] 1.6 批次 1 截图验证

### 批次 2：存储管理列表页改造
- [ ] 2.1 storage/disks/index.vue — NAS 示意图上方新增 page-header
- [ ] 2.2 storage/volumes/index.vue — overview-section → page-header
- [ ] 2.3 storage/public-dirs/index.vue — 新增 page-header
- [ ] 2.4 storage/recycle-bin/index.vue — 新增 page-header
- [ ] 2.5 批次 2 截图验证

### 批次 3：存储管理详情页改造
- [ ] 3.1 storage/disks/detail.vue — 面包屑+概览 → page-header
- [ ] 3.2 storage/pools/detail.vue — 返回栏+池头卡片 → page-header
- [ ] 3.3 storage/team-files/detail.vue — 新增 page-header
- [ ] 3.4 storage/all-files/detail.vue — 新增 page-header
- [ ] 3.5 批次 3 截图验证

### 验收与提交
- [ ] 4.1 pnpm run build:antd 确认无构建错误
- [ ] 4.2 汇总截图确认风格一致性
- [ ] 4.3 git commit 提交

## 参考模板
- file/my-files/index.vue — page-header 标准结构来源
- storage/team-files/index.vue — page-header 已标准化

## 关键上下文
- 统一 HTML 结构和 CSS 类名，不抽离通用组件
- page-header 标准结构：左侧图标+标题+描述，右侧 1~3 个统计概览卡片
- 不修改核心功能逻辑、路由、API
- 不修改 file/network/index.vue、storage/all-files/index.vue、storage/team-files/index.vue

## 设计决策
1. page-header HTML 结构采用 my-files 已验证的标准
2. CSS 规范直接复用现有标准页面的样式
3. 操作按钮保留在 page-header 下方或集成到右侧
4. 分批实施，每批完成后截图验证
5. disks/index.vue 的 page-header 保持紧凑 padding: 12px 20px

## 1. 文件管理子页面改造（批次 1）

- [ ] 1.1 改造 `file/external-device/index.vue`：将 `overview-section` 替换为标准 `page-header`（图标+标题"外接设备"+描述+统计卡片：设备总数/已连接/未连接）
- [ ] 1.2 改造 `file/external-device/manage.vue`：在 `top-toolbar` 下方新增 `page-header`，保留返回按钮和本地文件管理器开关在工具栏中
- [ ] 1.3 改造 `file/library/index.vue`：移除原生 `Card` 标题，新增 `page-header`（图标+标题"文件库"+描述+统计卡片）
- [ ] 1.4 改造 `file/share-links/index.vue`：移除原生 `Card` 标题，新增 `page-header`（图标+标题"外链管理"+描述+统计卡片）
- [ ] 1.5 改造 `file/external/index.vue`：移除原生 `Card` 标题，新增 `page-header`（图标+标题"外部设备"+描述+统计卡片）
- [ ] 1.6 批次 1 截图验证：检查所有文件管理子页面的 page-header 渲染效果

## 2. 存储管理列表页改造（批次 2）

- [ ] 2.1 改造 `storage/disks/index.vue`：在 NAS 设备示意图上方新增 `page-header`（图标+标题"硬盘管理"+描述+统计卡片：总容量/类型分布/健康状态）
- [ ] 2.2 改造 `storage/volumes/index.vue`：将 `overview-section` 替换为标准 `page-header`（图标+标题"存储空间管理"+描述+统计卡片）
- [ ] 2.3 改造 `storage/public-dirs/index.vue`：新增 `page-header`（图标+标题"公共目录"+描述+统计卡片）
- [ ] 2.4 改造 `storage/recycle-bin/index.vue`：新增 `page-header`（图标+标题"回收站"+描述+统计卡片）
- [ ] 2.5 批次 2 截图验证：检查所有存储管理列表页的 page-header 渲染效果

## 3. 存储管理详情页改造（批次 3）

- [ ] 3.1 改造 `storage/disks/detail.vue`：将面包屑返回栏+设备概览改造为 `page-header`（图标+标题+型号描述+状态统计）
- [ ] 3.2 改造 `storage/pools/detail.vue`：将返回栏+池头卡片改造为 `page-header`（图标+标题+RAID信息+容量统计）
- [ ] 3.3 改造 `storage/team-files/detail.vue`：新增 `page-header`（图标+标题"团队文件夹详情"+描述+统计卡片）
- [ ] 3.4 改造 `storage/all-files/detail.vue`：新增 `page-header`（图标+标题+描述+统计卡片）
- [ ] 3.5 批次 3 截图验证：检查所有存储管理详情页的 page-header 渲染效果

## 4. 验收与提交

- [ ] 4.1 执行 `pnpm run build:antd` 确认无构建错误
- [ ] 4.2 汇总所有批次截图，确认风格一致性
- [ ] 4.3 提交代码：`git commit` 包含所有变更

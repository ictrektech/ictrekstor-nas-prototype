# Vue 大型单体组件分拆重构 — 上下文总结

## 对话流程
1. 用户要求对项目中超大型 Vue 单体文件（>500行）进行分拆重构
2. Agent 读取 openspec/changes/vue-component-split/tasks.md 中的任务清单
3. 按 Phase 0→5 逐步实施：PageHeader → Breadcrumb → Drawer/Modal → Recycle/MyFiles → shared/team/DiskCard
4. 每个关键阶段验证构建通过后提交代码
5. 用户最终确认：剩余 3 个文件拆分收益过小，停止拆分
6. 更新 memory 和总结上下文

## 技术栈
Vue 3 + Vite + TypeScript + Ant Design Vue + Vben Admin 5.x + Tailwind CSS + Pinia

## 已完成重构文件（18个）

| 文件 | 原始行数 | 最终行数 | 拆分方式 | 新增文件 |
|------|---------|---------|---------|---------|
| `apps/web-antd/src/views/file/my-files/index.vue` | 757 | 450 | 提取 Breadcrumb、FileDetailDrawer | `components/BreadcrumbNav.vue`, `components/FileDetailDrawer.vue` |
| `apps/web-antd/src/views/file/external-device/manage.vue` | 772 | 499 | 提取 UsbDriveCard、MountFormModal | `components/UsbDriveCard.vue`, `components/MountFormModal.vue` |
| `apps/web-antd/src/views/system/monitor/components/MonitorCharts.vue` | 820 | ~650 | 提取 UsagePieChart、TemperatureBarChart | `components/UsagePieChart.vue`, `components/TemperatureBarChart.vue` |
| `apps/web-antd/src/views/file/external-device/index.vue` | 553 | 250 | 提取 DeviceTable.vue | `components/DeviceTable.vue` |
| `apps/web-antd/src/views/file/network/index.vue` | 526 | 285 | 提取 columns.ts、mockData.ts | `components/columns.ts`, `components/mockData.ts` |
| `apps/web-antd/src/views/storage/recycle-bin/index.vue` | 505 | 137 | 提取 RecycleTable.vue、RestoreModal.vue | `components/RecycleTable.vue`, `components/RestoreModal.vue` |
| `apps/web-antd/src/views/file/shared-files/index.vue` | 512 | 385 | 提取 mockData.ts | `components/mockData.ts` |
| `apps/web-antd/src/views/storage/team-files/index.vue` | 570 | 483 | 提取 mockData.ts | `components/mockData.ts` |
| `apps/web-antd/src/views/storage/disks/components/DiskCard.vue` | 510 | 479 | 提取 diskUtils.ts | `components/diskUtils.ts` |

## 剩余未拆文件（已评估拆分收益不足）

### 1. DeviceDiagram.vue (742行)
- **位置**：`apps/web-antd/src/views/system/device/components/DeviceDiagram.vue`
- **类型**：Canvas 2D 绘图组件（设备前后视图）
- **未拆原因**：drawFrontPanel/drawRearPanel 与布局常量深度耦合，提取常量后仍需大量 prop 传递和回调，拆分收益 < 维护成本
- **内容**：前面板（6盘位+品牌+底部接口）+ 后面板（风扇+网口+USB+HDMI+PCIe+电源）+ Tooltip DOM

### 2. storage/disks/index.vue (652行)
- **位置**：`apps/web-antd/src/views/storage/disks/index.vue`
- **类型**：复合页面级组件
- **未拆原因**：过滤系统（filterModel/filterStatus/filterCapacity/filteredDisks/resetFilters）与磁盘列表渲染、示意图交互（selectedDiagramDisk/handleDiagramSelectDisk/locateDiskInDiagram）强耦合，过滤逻辑需要访问 disks/pools 等多个响应式状态
- **子组件**：已外部引用 NasDiagram、DiskStatsCards、DiskCard、DiskDetailModal

### 3. NasDiagram.vue (566行)
- **位置**：`apps/web-antd/src/views/storage/disks/components/NasDiagram.vue`
- **类型**：Canvas 2D 绘制 NAS 设备示意图
- **未拆原因**：Canvas 绘图逻辑高度内聚，提取 Tooltip 和布局常量后仍超 500 行，且 Tooltip 位置计算与绘制逻辑共享坐标数据
- **与 DiskCard 关系**：通过 `selectedDiagramDisk` prop 和 `highlightBay` expose 方法联动

## 关联提交
1. `300ac49ee` — Phase 4 完成（my-files、external-device/manage）
2. `47c14825d` — Task 5.1 file/shared-files mock 提取
3. `9f773b79c` — Task 5.2 storage/team-files mock 提取
4. `70019c691` — Task 5.3 DiskCard 工具函数提取

## 代码约定
- 新增子组件目录：`views/<module>/components/`（页面内部）或 `src/components/`（跨页面复用）
- 子组件必须显式声明 `defineProps` / `defineEmits`
- 禁止在子组件中直接调用 API，数据由父组件注入或通过 Store 获取
- Mock 数据统一提取到 `components/mockData.ts`，工具函数提取到 `components/<name>Utils.ts`
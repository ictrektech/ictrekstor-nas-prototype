# Vue 组件分拆实施任务清单

> 关联变更：`openspec/changes/vue-component-split/`
> 基于设计文档：`design.md`

---

## Phase 0: 基础设施（前置准备）

### Task 0.1 创建通用工具函数
- [ ] 创建 `apps/web-antd/src/utils/format.ts`
  - 迁移 `formatSpeed`、`formatBytes`、`parseCapacity`（来自 system/device）
- [ ] 创建 `apps/web-antd/src/utils/svgChart.ts`
  - 迁移 `generateLinePath`、`generateAreaPath`（来自 system/device）
- [ ] 创建 `apps/web-antd/src/utils/treeIcons.ts`
  - 迁移 `treeNodeIconResolver`（来自 FileTreePanel / ShareConfigModal）

### Task 0.2 创建组合式函数
- [ ] 创建 `apps/web-antd/src/composables/useResizePanel.ts`
  - 提取 FileTreePanel 中的拖拽调整大小逻辑
- [ ] 创建 `apps/web-antd/src/composables/useFileIcons.ts`
  - 统一文件图标映射逻辑

### Task 0.3 创建全局复用基础组件
- [ ] 创建 `apps/web-antd/src/components/common/RenameModal.vue`
  - 合并 all-files/detail 和 external-device/manage 中的重命名弹窗
- [ ] 创建 `apps/web-antd/src/components/common/SvgMiniChart.vue`
  - 提取 system/device 中的 SVG 迷你折线图

---

## Phase 1: P0 最高优先级（4个大文件）

### Task 1.1 拆分 `system/device/index.vue` (1719行)
**目标文件结构**：
```
views/system/device/
├── index.vue                    # ≤300行
└── components/
    ├── DeviceHeroCard.vue       # ~120行
    ├── ResourceMonitorCard.vue  # ~150行
    ├── DiskGrid.vue             # ~180行
    ├── NetworkGrid.vue          # ~160行
    ├── NetworkConfigModal.vue   # ~120行
    └── SvgMiniChart.vue         # ~80行（引用全局组件）
```

**步骤**：
1. [ ] 创建 `DeviceHeroCard.vue`：设备头像、名称、标签、芯片信息
2. [ ] 创建 `ResourceMonitorCard.vue`：CPU/内存通用监控卡片
3. [ ] 创建 `DiskGrid.vue`：硬盘卡片网格 + 操作
4. [ ] 创建 `NetworkGrid.vue`：网卡卡片网格 + 配置触发
5. [ ] 创建 `NetworkConfigModal.vue`：IPv4/掩码/网关/DNS/MTU 表单
6. [ ] 重构 `index.vue`：移除所有内联代码，引用子组件

### Task 1.2 拆分 `file/shared-files/index.vue` (1695行)
**目标文件结构**：
```
views/file/shared-files/
├── index.vue                    # ≤300行
└── components/
    ├── ShareList.vue            # ~200行
    ├── ShareListItem.vue        # ~150行
    └── CreateShareModal.vue     # ~250行（复用 ShareConfigModal）
```

**步骤**：
1. [ ] 创建 `ShareList.vue`：分享数据表格/列表
2. [ ] 创建 `ShareListItem.vue`：单个分享项展示
3. [ ] 创建 `CreateShareModal.vue`：复用 `ShareConfigModal` 并扩展
4. [ ] 重构 `index.vue`：移除所有内联代码，引用子组件

### Task 1.3 拆分 `storage/volumes/index.vue` (1498行)
**目标文件结构**：
```
views/storage/volumes/
├── index.vue                    # ≤300行
└── components/
    ├── VolumeStatsCards.vue     # ~80行
    ├── StoragePoolCard.vue      # ~150行
    ├── VolumeCard.vue           # ~150行
    ├── CreateVolumeModal.vue    # ~180行
    └── ExtendVolumeModal.vue    # ~150行
```

**步骤**：
1. [ ] 创建 `VolumeStatsCards.vue`：容量/健康状态统计
2. [ ] 创建 `StoragePoolCard.vue`：存储池卡片
3. [ ] 创建 `VolumeCard.vue`：存储卷卡片
4. [ ] 创建 `CreateVolumeModal.vue`：创建卷表单
5. [ ] 创建 `ExtendVolumeModal.vue`：扩容表单
6. [ ] 重构 `index.vue`：移除所有内联代码，引用子组件

### Task 1.4 拆分 `FileExplorer/FileManagerPanel.vue` (1387行)
**目标文件结构**：
```
components/FileExplorer/
├── FileManagerPanel.vue         # ≤300行
└── components/
    ├── FileToolbar.vue          # ~150行
    ├── FileBreadcrumb.vue       # ~60行
    ├── FileListView.vue         # ~100行
    ├── FileGridView.vue         # ~100行
    ├── FileContextMenu.vue      # ~80行
    └── FileQuickPreview.vue     # ~100行
```

**步骤**：
1. [ ] 创建 `FileToolbar.vue`：上传/新建/刷新等操作栏
2. [ ] 创建 `FileBreadcrumb.vue`：路径面包屑
3. [ ] 创建 `FileListView.vue`：列表视图表格
4. [ ] 创建 `FileGridView.vue`：网格视图卡片
5. [ ] 创建 `FileContextMenu.vue`：右键操作菜单
6. [ ] 创建 `FileQuickPreview.vue`：文件快速预览
7. [ ] 重构 `FileManagerPanel.vue`：移除所有内联代码

---

## Phase 2: P1 高优先级（4个大文件）

### Task 2.1 拆分 `storage/disks/index.vue` (1310行)
**目标文件结构**：
```
views/storage/disks/
├── index.vue                    # ≤350行
└── components/
    ├── DiskStatsCards.vue       # ~80行
    ├── DiskCard.vue             # ~150行
    └── DiskDetailModal.vue      # ~200行
```

**步骤**：
1. [ ] 创建 `DiskStatsCards.vue`
2. [ ] 创建 `DiskCard.vue`：单个硬盘状态卡片
3. [ ] 创建 `DiskDetailModal.vue`：硬盘详情弹窗
4. [ ] 重构 `index.vue`

### Task 2.2 拆分 `file/external-device/manage.vue` (1252行)
**目标文件结构**：
```
views/file/external-device/
├── manage.vue                   # ≤300行
└── components/
    ├── DeviceInfoHeader.vue     # ~120行
    ├── DualPanelLayout.vue      # ~100行
    ├── TransferConfirmModal.vue # ~80行
    └── RenameModal.vue          # ~60行（引用全局组件）
```

**步骤**：
1. [ ] 创建 `DeviceInfoHeader.vue`：外接设备信息头部
2. [ ] 创建 `DualPanelLayout.vue`：双栏布局容器（可拖拽调整）
3. [ ] 创建 `TransferConfirmModal.vue`：传输确认弹窗
4. [ ] 重构 `manage.vue`，复用全局 `RenameModal`

### Task 2.3 拆分 `file/my-files/index.vue` (1234行)
**目标文件结构**：
```
views/file/my-files/
├── index.vue                    # ≤300行
└── components/
    └── ShareTriggerButton.vue   # ~80行
```

**步骤**：
1. [ ] 创建 `ShareTriggerButton.vue`：选中文件后的分享触发
2. [ ] 重构 `index.vue`，复用 `FileExplorer` 和 `ShareConfigModal`

### Task 2.4 拆分 `file/network/index.vue` (1132行)
**目标文件结构**：
```
views/file/network/
├── index.vue                    # ≤250行
└── components/
    ├── NetworkServerList.vue    # ~200行
    ├── NetworkServerCard.vue    # ~150行
    └── MountPointList.vue       # ~180行
```

**步骤**：
1. [ ] 创建 `NetworkServerList.vue`：服务器列表管理
2. [ ] 创建 `NetworkServerCard.vue`：单个服务器卡片
3. [ ] 创建 `MountPointList.vue`：挂载点列表
4. [ ] 重构 `index.vue`

---

## Phase 3: P2 中优先级（6个文件）

### Task 3.1 拆分 `storage/disks/detail.vue` (868行)
- [ ] 创建 `DiskBasicInfo.vue`、`SmartInfoTable.vue`、`DiskPartitions.vue`
- [ ] 重构 `detail.vue` ≤250行

### Task 3.2 拆分 `system/device/components/DeviceDiagram.vue` (742行)
- [ ] 创建 `DiagramFrontPanel.vue`、`DiagramRearPanel.vue`、`DiagramLegend.vue`
- [ ] 重构 `DeviceDiagram.vue` ≤180行

### Task 3.3 拆分 `components/ShareConfigModal/index.vue` (704行)
- [ ] 创建 `FolderInfoCard.vue`、`ShareUserList.vue`、`ExpireSelector.vue`、`ExternalLinkPanel.vue`
- [ ] 重构 `index.vue` ≤200行

### Task 3.4 拆分 `storage/pools/detail.vue` (686行)
- [ ] 创建 `PoolBasicInfo.vue`、`PoolDiskList.vue`、`PoolPerformanceChart.vue`
- [ ] 重构 `detail.vue` ≤200行

### Task 3.5 拆分 `storage/team-files/index.vue` (668行)
- [ ] 创建 `TeamFileToolbar.vue`、`TeamFileList.vue`
- [ ] 重构 `index.vue` ≤200行

### Task 3.6 拆分 `file/external-device/index.vue` (654行)
- [ ] 创建 `ExternalDeviceCard.vue`、`DeviceTypeBadge.vue`
- [ ] 重构 `index.vue` ≤200行

---

## Phase 4: P3 低优先级（6个文件）

### Task 4.1 拆分 `storage/disks/components/NasDiagram.vue` (566行)
- [ ] 创建 `NasFrontPanel.vue`、`NasRearPanel.vue`
- [ ] 重构 `NasDiagram.vue` ≤150行

### Task 4.2 拆分 `storage/all-files/detail.vue` (532行)
- [ ] 创建 `FileListView.vue`、`FileGridView.vue`、`FileIcon.vue`、`RenameModal.vue`（引用全局）
- [ ] 重构 `detail.vue` ≤200行

### Task 4.3 拆分 `components/FileExplorer/FileTreePanel.vue` (531行)
- [ ] 创建 `ResizeHandle.vue`、`PanelHeader.vue`、`TreeNodeTitle.vue`
- [ ] 重构 `FileTreePanel.vue` ≤180行

### Task 4.4 拆分 `file/public-dirs/index.vue` (514行)
- [ ] 创建 `PublicDirToolbar.vue`、`PublicDirTable.vue`
- [ ] 重构 `index.vue` ≤200行

### Task 4.5 拆分 `storage/recycle-bin/index.vue` (505行)
- [ ] 创建 `RecycleToolbar.vue`、`RecycleFileList.vue`
- [ ] 重构 `index.vue` ≤200行

### Task 4.6 拆分 `storage/team-files/detail.vue` (498行)
- [ ] 创建 `FilePreviewPanel.vue`、`FileVersionList.vue`
- [ ] 重构 `detail.vue` ≤200行

---

## 关键阶段验证与提交规范

> **重要约束**：本变更属纯代码重构，**严禁修改任何界面风格、元素、布局**。页面展示效果必须与重构前完全一致。

### 每个 Task 完成后的强制流程

每个 Task（即每个文件拆分）完成后，必须按以下顺序执行：

1. **构建验证**
   ```bash
   cd apps/web-antd && pnpm run build 2>&1 | tee /tmp/build-check.log | tail -n 50
   ```
   - [ ] 构建无报错，无新增 warning
   - [ ] 若构建失败，立即修复，禁止跳过

2. **浏览器验证**
   - [ ] 使用 Chrome DevTools MCP 导航到对应页面
   - [ ] take_screenshot 对比重构前后视觉效果
   - [ ] 确认页面正常加载，无白屏/错位/样式丢失
   - [ ] 确认交互功能正常（点击、弹窗、表格排序等）

3. **代码提交**
   - [ ] 执行 `git add` 添加本次变更的所有文件
   - [ ] commit message 格式：`refactor(page): 拆分 <原文件名> 组件`
   - [ ] 示例：`refactor(page): 拆分 system/device/index.vue 组件`
   - [ ] 提交后方可进入下一个 Task

### 每个 Phase 完成后的额外验证

每个 Phase（含多个 Task）全部完成后，额外执行：

- [ ] **全页面走查**：该 Phase 涉及的所有页面均通过浏览器验证
- [ ] **截图存档**：关键页面截图保存到 `screenshots/phase-X/` 供后续对比
- [ ] **Phase 提交**：`git commit` 标记 Phase 完成

---

## Phase 5: 收尾与验证

### Task 5.1 代码检查
- [ ] 运行 `pnpm run lint` 检查所有新文件无语法错误
- [ ] 确认所有 Props/Emit 接口正确定义
- [ ] 确认无隐式依赖父组件状态

### Task 5.2 功能验证
- [ ] 每个重构后的页面在浏览器中正常渲染
- [ ] 交互功能与重构前完全一致
- [ ] 弹窗、图表、表格等子组件正常工作

### Task 5.3 行数检查
- [ ] 所有 index.vue / detail.vue / manage.vue ≤ 500 行
- [ ] 所有复合组件 ≤ 350 行
- [ ] 所有基础组件 ≤ 200 行

---

## 汇总统计

| 阶段 | 任务数 | 涉及文件 | 预估新建组件 | 预估新建工具 |
|:---|:---:|:---:|:---:|:---:|
| Phase 0 | 3 | 0 | 2 | 5 |
| Phase 1 | 4 | 4 | 18 | 0 |
| Phase 2 | 4 | 4 | 11 | 0 |
| Phase 3 | 6 | 6 | 16 | 0 |
| Phase 4 | 6 | 6 | 14 | 0 |
| Phase 5 | 3 | 20 | 0 | 0 |
| **合计** | **26** | **20** | **61** | **5** |

---

## 依赖关系图

```
Phase 0 (基础设施)
    │
    ├──→ Task 0.1 (format utils) ──→ Phase 1-4 所有文件
    │
    ├──→ Task 0.2 (composables) ───→ Phase 1.4, 2.2, 4.3
    │
    └──→ Task 0.3 (common comps) ──→ Phase 1.1, 2.2, 4.2

Phase 1 (P0)
    │
    ├── Task 1.1 (device/index) ──→ 独立
    ├── Task 1.2 (shared-files) ──→ 依赖 Task 3.3 (ShareConfigModal)
    ├── Task 1.3 (volumes) ───────→ 独立
    └── Task 1.4 (FileManager) ───→ 依赖 Task 0.2, 0.3

Phase 2 (P1)
    │
    ├── Task 2.1 (disks/index) ───→ 独立
    ├── Task 2.2 (ext-dev/manage) ─→ 依赖 Task 0.3 (RenameModal)
    ├── Task 2.3 (my-files) ──────→ 依赖 Task 1.4 (FileManager), Task 3.3 (ShareConfigModal)
    └── Task 2.4 (network) ───────→ 独立

Phase 3 (P2)
    │
    ├── Task 3.1 (disks/detail) ──→ 独立
    ├── Task 3.2 (DeviceDiagram) ─→ 独立
    ├── Task 3.3 (ShareConfigModal) → 被 Task 1.2, 2.3 依赖（应在 Phase 1 前或同时完成）
    ├── Task 3.4 (pools/detail) ──→ 独立
    ├── Task 3.5 (team-files) ────→ 独立
    └── Task 3.6 (ext-dev/index) ─→ 独立

Phase 4 (P3)
    │
    ├── Task 4.1 (NasDiagram) ────→ 独立
    ├── Task 4.2 (all-files/detail) → 依赖 Task 1.4 (FileManager)
    ├── Task 4.3 (FileTreePanel) ─→ 依赖 Task 0.2 (useResizePanel)
    └── ... 其余独立
```

> **关键路径**：Task 3.3 (ShareConfigModal) 必须在 Task 1.2 和 Task 2.3 之前完成。
> 建议实施顺序：Phase 0 → Task 3.3 → Phase 1/2 并行 → Phase 3/4 并行 → Phase 5
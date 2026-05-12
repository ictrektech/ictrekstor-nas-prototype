# Vue 组件分拆设计方案

## 整体架构原则

1. **分层拆分**：页面 → 区块组件 → 基础组件，每层职责单一
2. **就近原则**：页面专用子组件放在 `views/<module>/components/`，全局复用组件提升到 `src/components/`
3. **Props 向下、Events 向上**：严格显式通信，禁止隐式依赖
4. **组合式函数提取**：可复用逻辑（拖拽、图表、格式化）提取到 `composables/`

---

## 模块一：system/device

### 1.1 views/system/device/index.vue (1719 行 → 目标 ≤ 500 行)

**当前结构**：设备概览页，包含 Hero 区、CPU/内存卡片、硬盘列表、网卡列表、网卡配置弹窗、SVG 图表

**拆分方案**：

```
views/system/device/
├── index.vue                  # 页面容器，统筹数据加载与布局 (~300行)
├── components/
│   ├── DeviceHeroCard.vue     # 设备基本信息 Hero 区 (~120行)
│   ├── ResourceMonitorCard.vue # CPU/内存监控卡片（复用）(~150行)
│   ├── DiskGrid.vue           # 硬盘卡片网格 (~180行)
│   ├── NetworkGrid.vue        # 网卡卡片网格 (~160行)
│   ├── NetworkConfigModal.vue # 网卡配置弹窗 (~120行)
│   └── SvgMiniChart.vue       # SVG 迷你折线图 (~80行)
```

**Props/Emit 接口**：

```typescript
// DeviceHeroCard
defineProps<{ device: DeviceSummary }>()

// ResourceMonitorCard
defineProps<{
  title: string;
  usage: number;
  spec: string;
  history: number[];
  color: string;
}>()

// DiskGrid
defineProps<{ disks: DiskItem[] }>()
defineEmits<{
  locate: [id: string];
  sleep: [id: string];
  detail: [id: string];
}>()

// NetworkGrid
defineProps<{ networks: NetworkItem[] }>()
defineEmits<{ config: [network: NetworkItem] }>()

// NetworkConfigModal
defineProps<{ visible: boolean; network: NetworkItem | null }>()
defineEmits<{
  'update:visible': [boolean];
  save: [form: NetworkConfigForm];
}>()
```

### 1.2 views/system/device/network-detail.vue (483 行 → 目标 ≤ 300 行)

**当前结构**：网卡详情页，包含页面头部、信息面板、流量统计、带宽图表

**拆分方案**：

```
views/system/device/
├── network-detail.vue          # 页面容器 (~200行)
└── components/
    ├── NetworkPageHeader.vue   # 网卡概览头部 (~60行)
    ├── NetworkInfoPanel.vue    # 网络配置 Descriptions (~50行)
    ├── NetworkStatsPanel.vue   # 流量统计网格 (~60行)
    └── BandwidthChart.vue      # 带宽趋势 ECharts (~100行)
```

### 1.3 views/system/device/components/DeviceDiagram.vue (742 行 → 目标 ≤ 350 行)

**当前结构**：设备硬件示意图，包含前面板/后面板 SVG、硬盘槽位交互、图例

**拆分方案**：

```
views/system/device/components/
├── DeviceDiagram.vue           # 示意图容器，协调前后面板 (~180行)
├── DiagramFrontPanel.vue       # 前面板 SVG (~200行)
├── DiagramRearPanel.vue        # 后面板 SVG (~200行)
└── DiagramLegend.vue           # 图例说明 (~60行)
```

---

## 模块二：storage

### 2.1 views/storage/disks/index.vue (1310 行 → 目标 ≤ 400 行)

**当前结构**：硬盘管理页，包含统计卡片、硬盘卡片网格、详情弹窗

**拆分方案**：

```
views/storage/disks/
├── index.vue                   # 页面容器 (~350行)
├── detail.vue                  # 已存在，保持现状（868行需后续处理）
└── components/
    ├── DiskStatsCards.vue      # 顶部统计卡片 (~80行)
    ├── DiskCard.vue            # 单个硬盘卡片 (~150行)
    ├── DiskDetailModal.vue     # 硬盘详情弹窗 (~200行)
    └── NasDiagram.vue          # 已存在（566行需后续处理）
```

### 2.2 views/storage/disks/detail.vue (868 行 → 目标 ≤ 400 行)

**当前结构**：硬盘详情页，包含基本信息、SMART 信息、分区表格、操作按钮

**拆分方案**：

```
views/storage/disks/
├── detail.vue                  # 页面容器 (~250行)
└── components/
    ├── DiskBasicInfo.vue       # 硬盘基本信息 (~120行)
    ├── SmartInfoTable.vue      # SMART 信息表格 (~150行)
    └── DiskPartitions.vue      # 分区信息 (~120行)
```

### 2.3 views/storage/disks/components/NasDiagram.vue (566 行 → 目标 ≤ 300 行)

**当前结构**：NAS 硬件示意图，与 DeviceDiagram 类似但专注存储

**拆分方案**：

```
views/storage/disks/components/
├── NasDiagram.vue              # 示意图容器 (~150行)
├── NasFrontPanel.vue           # 前面板 (~180行)
└── NasRearPanel.vue            # 后面板 (~180行)
```

### 2.4 views/storage/volumes/index.vue (1498 行 → 目标 ≤ 400 行)

**当前结构**：存储空间管理页，包含统计卡片、存储池/卷卡片、操作弹窗

**拆分方案**：

```
views/storage/volumes/
├── index.vue                   # 页面容器 (~300行)
└── components/
    ├── VolumeStatsCards.vue    # 顶部统计卡片 (~80行)
    ├── StoragePoolCard.vue     # 存储池卡片 (~150行)
    ├── VolumeCard.vue          # 存储卷卡片 (~150行)
    ├── CreateVolumeModal.vue   # 创建卷弹窗 (~180行)
    └── ExtendVolumeModal.vue   # 扩容弹窗 (~150行)
```

### 2.5 views/storage/pools/detail.vue (686 行 → 目标 ≤ 350 行)

**当前结构**：存储池详情页，包含基本信息、硬盘列表、性能图表

**拆分方案**：

```
views/storage/pools/
├── detail.vue                  # 页面容器 (~200行)
└── components/
    ├── PoolBasicInfo.vue       # 存储池基本信息 (~120行)
    ├── PoolDiskList.vue        # 硬盘列表 (~150行)
    └── PoolPerformanceChart.vue # 性能图表 (~150行)
```

### 2.6 views/storage/team-files/index.vue (668 行 → 目标 ≤ 350 行)

**当前结构**：团队文件页，包含文件列表、操作工具栏

**拆分方案**：

```
views/storage/team-files/
├── index.vue                   # 页面容器 (~200行)
├── detail.vue                  # 已存在（498行需后续处理）
└── components/
    ├── TeamFileToolbar.vue     # 操作工具栏 (~120行)
    └── TeamFileList.vue        # 文件列表 (~200行)
```

### 2.7 views/storage/team-files/detail.vue (498 行 → 目标 ≤ 350 行)

**当前结构**：团队文件详情页

**拆分方案**：

```
views/storage/team-files/
├── detail.vue                  # 页面容器 (~200行)
└── components/
    ├── FilePreviewPanel.vue    # 文件预览 (~180行)
    └── FileVersionList.vue     # 版本列表 (~120行)
```

### 2.8 views/storage/all-files/index.vue (415 行 → 接近上限，适度拆分)

**当前结构**：全部文件页，包含文件夹卡片网格

**拆分方案**：

```
views/storage/all-files/
├── index.vue                   # 页面容器 (~250行)
├── detail.vue                  # 已存在（532行需处理）
└── components/
    └── FolderCard.vue          # 文件夹卡片 (~100行)
```

### 2.9 views/storage/all-files/detail.vue (532 行 → 目标 ≤ 350 行)

**当前结构**：文件夹详情页，包含文件列表/网格双视图、重命名弹窗

**拆分方案**：

```
views/storage/all-files/
├── detail.vue                  # 页面容器 (~200行)
└── components/
    ├── FileListView.vue        # 列表视图 (~80行)
    ├── FileGridView.vue        # 网格视图 (~80行)
    ├── FileIcon.vue            # 文件图标 (~60行)
    └── RenameModal.vue         # 重命名弹窗 (~50行)
```

### 2.10 views/storage/recycle-bin/index.vue (505 行 → 目标 ≤ 350 行)

**当前结构**：回收站页

**拆分方案**：

```
views/storage/recycle-bin/
├── index.vue                   # 页面容器 (~200行)
└── components/
    ├── RecycleToolbar.vue      # 工具栏 (~100行)
    └── RecycleFileList.vue     # 文件列表 (~150行)
```

### 2.11 views/storage/public-dirs/index.vue (428 行 → 接近上限，适度拆分)

**当前结构**：公共目录页

**拆分方案**：

```
views/storage/public-dirs/
├── index.vue                   # 页面容器 (~250行)
└── components/
    └── PublicDirCard.vue       # 公共目录卡片 (~100行)
```

---

## 模块三：file

### 3.1 views/file/shared-files/index.vue (1695 行 → 目标 ≤ 400 行)

**当前结构**：我的分享页，包含分享列表、创建分享弹窗（内嵌完整配置表单）

**拆分方案**：

```
views/file/shared-files/
├── index.vue                   # 页面容器 (~300行)
└── components/
    ├── ShareList.vue           # 分享列表 (~200行)
    ├── ShareListItem.vue       # 单个分享项 (~150行)
    └── CreateShareModal.vue    # 创建分享弹窗 (~250行)
```

**注意**：创建分享弹窗与 `components/ShareConfigModal/index.vue` 高度重叠，需统一复用。

### 3.2 views/file/my-files/index.vue (1234 行 → 目标 ≤ 400 行)

**当前结构**：我的文件页，包含文件管理器、创建分享入口

**拆分方案**：

```
views/file/my-files/
├── index.vue                   # 页面容器 (~300行)
└── components/
    └── ShareTriggerButton.vue  # 分享触发按钮 (~80行)
```

**说明**：主体文件管理器复用 `FileExplorer` 组件，分享配置复用 `ShareConfigModal`。

### 3.3 views/file/network/index.vue (1132 行 → 目标 ≤ 400 行)

**当前结构**：网络存储页，包含服务器列表、挂载管理

**拆分方案**：

```
views/file/network/
├── index.vue                   # 页面容器 (~250行)
└── components/
    ├── NetworkServerList.vue   # 服务器列表 (~200行)
    ├── NetworkServerCard.vue   # 服务器卡片 (~150行)
    └── MountPointList.vue      # 挂载点列表 (~180行)
```

### 3.4 views/file/external-device/index.vue (654 行 → 目标 ≤ 350 行)

**当前结构**：外接设备列表页

**拆分方案**：

```
views/file/external-device/
├── index.vue                   # 页面容器 (~200行)
├── manage.vue                  # 已存在（1252行需处理）
└── components/
    ├── ExternalDeviceCard.vue  # 外接设备卡片 (~150行)
    └── DeviceTypeBadge.vue     # 设备类型标签 (~50行)
```

### 3.5 views/file/external-device/manage.vue (1252 行 → 目标 ≤ 400 行)

**当前结构**：外接设备管理页，包含双栏文件管理器、传输确认、重命名弹窗

**拆分方案**：

```
views/file/external-device/
├── manage.vue                  # 页面容器 (~300行)
└── components/
    ├── DeviceInfoHeader.vue    # 设备信息头部 (~120行)
    ├── DualPanelLayout.vue     # 双栏布局容器 (~100行)
    ├── TransferConfirmModal.vue # 传输确认弹窗 (~80行)
    └── RenameModal.vue         # 重命名弹窗 (~60行)
```

### 3.6 views/file/public-dirs/index.vue (514 行 → 目标 ≤ 350 行)

**当前结构**：公共目录页

**拆分方案**：

```
views/file/public-dirs/
├── index.vue                   # 页面容器 (~200行)
└── components/
    ├── PublicDirToolbar.vue    # 工具栏 (~100行)
    └── PublicDirTable.vue      # 目录表格 (~150行)
```

### 3.7 views/file/public-files/index.vue (419 行 → 接近上限，适度拆分)

**当前结构**：公共文件页

**拆分方案**：

```
views/file/public-files/
├── index.vue                   # 页面容器 (~250行)
└── components/
    └── PublicFileCard.vue      # 公共文件卡片 (~100行)
```

### 3.8 views/file/shared-from-others/index.vue (401 行 → 接近上限，适度拆分)

**当前结构**：他人分享页

**拆分方案**：

```
views/file/shared-from-others/
├── index.vue                   # 页面容器 (~250行)
└── components/
    └── SharedFromItem.vue      # 他人分享项 (~100行)
```

---

## 模块四：全局组件

### 4.1 components/FileExplorer/FileManagerPanel.vue (1387 行 → 目标 ≤ 350 行)

**当前结构**：文件管理面板，包含工具栏、面包屑、文件列表/网格、操作菜单

**拆分方案**：

```
components/FileExplorer/
├── FileManagerPanel.vue        # 面板容器 (~300行)
├── FileTreePanel.vue           # 已存在（531行需处理）
└── components/
    ├── FileToolbar.vue         # 工具栏 (~150行)
    ├── FileBreadcrumb.vue      # 面包屑导航 (~60行)
    ├── FileListView.vue        # 列表视图 (~100行)
    ├── FileGridView.vue        # 网格视图 (~100行)
    ├── FileContextMenu.vue     # 右键菜单 (~80行)
    └── FileQuickPreview.vue    # 快速预览 (~100行)
```

### 4.2 components/FileExplorer/FileTreePanel.vue (531 行 → 目标 ≤ 300 行)

**当前结构**：文件树面板，包含拖拽调整大小、固定/悬浮模式、树节点渲染

**拆分方案**：

```
components/FileExplorer/
├── FileTreePanel.vue           # 面板容器 (~180行)
└── components/
    ├── ResizeHandle.vue        # 拖拽调整条 (~40行)
    ├── PanelHeader.vue         # 面板头部 (~60行)
    └── TreeNodeTitle.vue       # 树节点标题渲染 (~80行)
```

### 4.3 components/ShareConfigModal/index.vue (704 行 → 目标 ≤ 300 行)

**当前结构**：分享配置弹窗，包含文件夹信息、目录树、用户权限、有效期、外链设置

**拆分方案**：

```
components/ShareConfigModal/
├── index.vue                   # 弹窗容器 (~200行)
└── components/
    ├── FolderInfoCard.vue      # 文件夹信息卡片 (~60行)
    ├── ShareUserList.vue       # 共享用户列表 (~100行)
    ├── ExpireSelector.vue      # 有效期选择器（复用2次）(~80行)
    └── ExternalLinkPanel.vue   # 外链分享面板 (~100行)
```

---

## 跨模块复用组件清单

以下组件在多个页面出现相同/相似实现，需提取为全局复用组件：

| 组件名 | 来源页面 | 复用页面 | 放置位置 |
|-------|---------|---------|---------|
| `FileListView` | all-files/detail, FileManagerPanel | my-files, shared-files | `components/FileExplorer/components/` |
| `FileGridView` | all-files/detail, FileManagerPanel | my-files, shared-files | `components/FileExplorer/components/` |
| `FileIcon` | all-files/detail | 多个文件页面 | `components/FileExplorer/components/` |
| `RenameModal` | all-files/detail, external-device/manage | 多个页面 | `components/common/RenameModal.vue` |
| `ExpireSelector` | ShareConfigModal | 创建分享弹窗 | `components/ShareConfigModal/components/` |
| `SvgMiniChart` | system/device/index | 可能复用到监控页 | `components/common/SvgMiniChart.vue` |

---

## 工具函数/组合式函数提取

| 函数/组合式 | 当前位置 | 提取到 | 复用场景 |
|------------|---------|-------|---------|
| `useResizePanel` | FileTreePanel | `composables/useResizePanel.ts` | 任何可拖拽调整宽度的侧边面板 |
| `useFileIcons` | 多个文件页面 | `composables/useFileIcons.ts` | 文件图标映射 |
| `formatSpeed/formatBytes` | system/device | `utils/format.ts` | 网络速度、流量格式化 |
| `parseCapacity` | system/device | `utils/format.ts` | 容量解析 |
| `treeNodeIconResolver` | FileTreePanel, ShareConfigModal | `utils/treeIcons.ts` | 目录树节点图标 |
| `generateLinePath/generateAreaPath` | system/device | `utils/svgChart.ts` | SVG 迷你图路径生成 |

---

## 实施约束与规范

### 1. 纯重构原则

- **禁止修改任何界面风格、元素、布局**：颜色、字体、间距、圆角、阴影等样式必须保持原样
- **禁止修改业务逻辑**：数据流、状态管理、API 调用顺序、计算逻辑必须保持原样
- **仅允许代码物理位置的移动**：将 template/script/style 块从父文件移动到子文件
- **Props/Emits 接口必须等价**：子组件接收的数据和触发的事件与原先内联实现完全一致

### 2. 文件引用路径规范

```typescript
// ✅ 页面子组件使用相对路径
import DiskCard from './components/DiskCard.vue';

// ✅ 全局组件使用路径别名
import RenameModal from '@/components/common/RenameModal.vue';

// ✅ 工具函数使用路径别名
import { formatSpeed } from '@/utils/format';
import { useFileIcons } from '@/composables/useFileIcons';
```

### 3. 样式迁移规范

- 子组件的 scoped style 从父文件**原样复制**，不做任何修改
- 父文件中与子组件相关的 style 块**全部删除**
- 若样式依赖父级选择器嵌套，改为子组件独立 scoped style

### 4. 验证与提交规范

每个 Task（单个文件拆分）完成后必须：

1. **构建验证**：`cd apps/web-antd && pnpm run build` 必须无报错
2. **浏览器验证**：使用 Chrome DevTools MCP 截图确认页面效果与重构前一致
3. **代码提交**：`refactor(page): 拆分 <原文件路径>`，附签名

每个 Phase（阶段）完成后必须：
1. **全页面走查**：Phase 内所有涉及页面截图验证
2. **Phase 提交**：单独 commit 标记阶段完成

---

## 实施优先级

| 优先级 | 文件 | 行数 | 理由 |
|:---:|------|:---:|:---|
| P0 | `system/device/index.vue` | 1719 | 最大文件，影响系统模块核心页 |
| P0 | `file/shared-files/index.vue` | 1695 | 最大文件之一，分享功能核心 |
| P0 | `storage/volumes/index.vue` | 1498 | 存储核心页，组件复用价值高 |
| P0 | `FileExplorer/FileManagerPanel.vue` | 1387 | 全局组件，影响所有文件页面 |
| P1 | `storage/disks/index.vue` | 1310 | 存储核心页 |
| P1 | `file/external-device/manage.vue` | 1252 | 复杂双栏布局 |
| P1 | `file/my-files/index.vue` | 1234 | 文件管理核心页 |
| P1 | `file/network/index.vue` | 1132 | 网络存储核心页 |
| P2 | `storage/disks/detail.vue` | 868 | 详情页，逻辑相对独立 |
| P2 | `system/device/components/DeviceDiagram.vue` | 742 | 复杂 SVG 组件 |
| P2 | `components/ShareConfigModal/index.vue` | 704 | 全局复用弹窗 |
| P2 | `storage/pools/detail.vue` | 686 | 详情页 |
| P2 | `storage/team-files/index.vue` | 668 | 团队文件页 |
| P2 | `file/external-device/index.vue` | 654 | 外接设备列表 |
| P3 | `storage/disks/components/NasDiagram.vue` | 566 | SVG 示意图 |
| P3 | `storage/all-files/detail.vue` | 532 | 文件夹详情 |
| P3 | `FileExplorer/FileTreePanel.vue` | 531 | 全局组件 |
| P3 | `file/public-dirs/index.vue` | 514 | 接近上限 |
| P3 | `storage/recycle-bin/index.vue` | 505 | 接近上限 |
| P3 | `storage/team-files/detail.vue` | 498 | 接近上限 |

# Vue 组件分拆重构提案

## 背景与问题

apps/web-antd/src/ 下存在大量超大型 Vue 单体文件，经扫描统计：

| 排名 | 文件路径 | 行数 | 超限倍数 |
|:---:|---------|:---:|:---:|
| 1 | `views/system/device/index.vue` | 1719 | **3.4x** |
| 2 | `views/file/shared-files/index.vue` | 1695 | **3.4x** |
| 3 | `views/storage/volumes/index.vue` | 1498 | **3.0x** |
| 4 | `components/FileExplorer/FileManagerPanel.vue` | 1387 | **2.8x** |
| 5 | `views/storage/disks/index.vue` | 1310 | **2.6x** |
| 6 | `views/file/external-device/manage.vue` | 1252 | **2.5x** |
| 7 | `views/file/my-files/index.vue` | 1234 | **2.5x** |
| 8 | `views/file/network/index.vue` | 1132 | **2.3x** |
| 9 | `views/storage/disks/detail.vue` | 868 | **1.7x** |
| 10 | `views/system/device/components/DeviceDiagram.vue` | 742 | **1.5x** |
| 11 | `components/ShareConfigModal/index.vue` | 704 | **1.4x** |
| 12 | `views/storage/pools/detail.vue` | 686 | **1.4x** |
| 13 | `views/storage/team-files/index.vue` | 668 | **1.3x** |
| 14 | `views/file/external-device/index.vue` | 654 | **1.3x** |
| 15 | `views/storage/disks/components/NasDiagram.vue` | 566 | **1.1x** |
| 16 | `views/storage/all-files/detail.vue` | 532 | **1.1x** |
| 17 | `components/FileExplorer/FileTreePanel.vue` | 531 | **1.1x** |
| 18 | `views/file/public-dirs/index.vue` | 514 | **1.0x** |
| 19 | `views/storage/recycle-bin/index.vue` | 505 | **1.0x** |
| 20 | `views/storage/team-files/detail.vue` | 498 | ~1.0x |

**20 个文件超出 500 行强制上限，涉及约 17,487 行代码。**

### 导致的问题

1. **AI 上下文冗余**：每次修改需加载大量无关代码，干扰理解，消耗 token
2. **组件职责混杂**：一个文件同时处理数据加载、图表绘制、表单校验、弹窗管理等多种逻辑
3. **难以复用**：相同 UI 模式（如文件列表视图、设备卡片）在多个页面重复实现
4. **维护困难**：多人协作时频繁冲突，定位问题耗时

## 目标

1. 确保每个组件目的单一，方便 AI 快速定位需要修改的代码
2. 降低无关代码读取，提升修改效率
3. 建立可复用的组件库，减少重复实现
4. 所有页面级组件控制在 500 行以内

## 范围

- **涉及模块**：system/device, file/*, storage/* 共 3 大模块 20 个文件
- **不涉及的文件**：已低于 500 行的小型组件、布局文件、纯配置文件
- **变更类型**：纯重构，不修改业务逻辑和外部行为

## 验收标准

- [ ] 所有页面级组件（index.vue, detail.vue, manage.vue）≤ 500 行
- [ ] 所有复合/区块组件 ≤ 350 行
- [ ] 所有基础/纯展示组件 ≤ 200 行
- [ ] 页面功能与重构前完全一致（视觉 + 交互）
- [ ] 子组件通过 Props/Emits 显式契约通信，无隐式依赖
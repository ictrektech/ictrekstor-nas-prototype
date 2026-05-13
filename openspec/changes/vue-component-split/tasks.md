# 实施计划 — Vue 大型组件拆分 ✅ 已完成

## Phase 4: P3 低优先级（5个文件）

### Task 4.2: file/my-files/index.vue (757行) ✅ DONE
- **策略**：提取 mock 数据到 mockData.ts
- **拆分后文件**：
  - `index.vue`：450 行（主页面，业务逻辑）
  - `components/mockData.ts`：305 行（mock 树数据、mock 文件数据、目标目录树计算）
- **提交**：`b0a2b98b4`

### Task 4.3: file/network/index.vue (526行) ✅ DONE
- **策略**：提取 mock 数据到 mockData.ts
- **拆分后文件**：
  - `index.vue`：285 行（主页面）
  - `components/mockData.ts`：208 行（网络服务类型、协议数据、共享文件夹数据、站点数据）
- **提交**：`80405c2d8`

### Task 4.4: storage/recycle-bin/index.vue (505行) ✅ DONE
- **策略**：提取概览区域到 RecycleBinHeader.vue，mock 数据到 mockData.ts
- **拆分后文件**：
  - `index.vue`：137 行（主页面）
  - `components/RecycleBinHeader.vue`：63 行（概览区域）
  - `components/mockData.ts`：97 行（模拟树数据和回收文件数据）
- **提交**：`986621207`

### Task 4.5: file/external-device/manage.vue (772行) ✅ DONE
- **策略**：提取 mock 数据到 mockData.ts（反向依赖提取）
- **拆分后文件**：
  - `manage.vue`：499 行（主页面）
  - `components/mockData.ts`：185 行（设备定义、文件 mock 数据、buildDeviceTree 函数）
- **提交**：`1b58bf259`

---

## Phase 5: 收尾验证 ✅ 已完成

### Task 5.1: file/shared-files/index.vue (512行) → mockData.ts
- [x] 提取 `myFilesTreeData`、`initialShareDirs`、`userOptions`、`buildPathFromTree` 到 `components/mockData.ts`
- [x] index.vue 从 512 行降至 385 行
- [x] 构建验证通过
- [x] 已提交 commit `47c14825d`

### Task 5.2: storage/team-files/index.vue (570行) → mockData.ts
- [x] 提取 `mockTree`、`mockFiles` 到 `components/mockData.ts`
- [x] index.vue 从 570 行降至 483 行
- [x] 构建验证通过
- [x] 已提交 commit `9f773b79c`

### Task 5.3: DiskCard.vue (510行) → diskUtils.ts
- [x] 提取 `getStatusDot`、`getHealthBadgeColor`、`getDeviceIcon`、`getDeviceIconColor` 到 `components/diskUtils.ts`
- [x] DiskCard.vue 从 510 行降至 479 行
- [x] 构建验证通过
- [x] 已提交 commit `70019c691`

### Task 5.4: 剩余文件评估 — 拆分收益不足，不继续拆分
- [x] DeviceDiagram.vue (742行) — Canvas 绘图高内聚，拆分收益 < 成本
- [x] storage/disks/index.vue (652行) — 过滤系统与交互强耦合，拆分收益 < 成本
- [x] NasDiagram.vue (566行) — Canvas 绘图高内聚，拆分收益 < 成本
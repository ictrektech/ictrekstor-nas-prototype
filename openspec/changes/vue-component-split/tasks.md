# 实施计划 — Vue 大型组件拆分

## Phase 4: P3 低优先级（5个文件）

### Task 4.2: file/my-files/index.vue (757行) ✅ DONE
- **策略**：提取 mock 数据到 mockData.ts
- **拆分后文件**：
  - `index.vue`：450 行（主页面，业务逻辑）
  - `components/mockData.ts`：305 行（mock 树数据、mock 文件数据、目标目录树计算）
- **修改**：将 mockTree、mockFiles、targetDirTreeData 内联逻辑提取到 mockData.ts；index.vue 只保留业务逻辑
- **提交**：`b0a2b98b4`

### Task 4.3: file/network/index.vue (526行) ✅ DONE
- **策略**：提取 mock 数据到 mockData.ts
- **拆分后文件**：
  - `index.vue`：285 行（主页面）
  - `components/mockData.ts`：208 行（网络服务类型、协议数据、共享文件夹数据、站点数据）
- **修改**：index.vue 保留组件注册和事件处理逻辑，所有 mock 数据外置
- **提交**：`80405c2d8`

### Task 4.4: storage/recycle-bin/index.vue (505行) ✅ DONE
- **策略**：提取概览区域到 RecycleBinHeader.vue，mock 数据到 mockData.ts
- **拆分后文件**：
  - `index.vue`：137 行（主页面）
  - `components/RecycleBinHeader.vue`：63 行（概览区域）
  - `components/mockData.ts`：97 行（模拟树数据和回收文件数据）
- **修改**：index.vue 精简为纯状态管理和弹窗交互
- **提交**：`986621207`

### Task 4.5: file/external-device/manage.vue (772行) ✅ DONE
- **策略**：提取 mock 数据到 mockData.ts（反向依赖提取）
- **拆分后文件**：
  - `manage.vue`：499 行（主页面）
  - `components/mockData.ts`：185 行（设备定义、文件 mock 数据、buildDeviceTree 函数）
- **修改**：manage.vue 保持组件布局，所有 mock 数据外置
- **提交**：`1b58bf259`

---

## 剩余大文件（>500行）

### 1. system/device/components/DeviceDiagram.vue (742行)
### 2. storage/team-files/index.vue (570行)
### 3. storage/disks/components/NasDiagram.vue (566行)
### 4. file/shared-files/index.vue (512行)
### 5. storage/disks/components/DiskCard.vue (509行)

---

## 下一步

从剩余文件中选择 2-3 个继续拆分，建议优先处理：
1. **system/device/components/DeviceDiagram.vue**（742行，P0 级别）
2. **storage/team-files/index.vue**（570行）
3. **file/shared-files/index.vue**（512行）
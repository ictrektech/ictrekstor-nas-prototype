# 当前任务：修复 Vue 组件分拆后的页面差异

## 任务来源
- 触发方式：用户指令
- 关联变更：openspec/changes/fix-split-regression/

## 目标与范围
- [x] 截图对比分拆前后页面差异（localhost:5888 vs localhost:5666）
- [x] 修复：文件管理 - 我的文件（布局风格恢复 + 清理底部树状视图）
- [x] 修复：文件管理 - 网络访问（卡片颜色、内容）
- [x] 修复：系统设置 - 设备管理（设备示意图、CPU、内存卡片）
- [x] 修复：系统设置 - 设备管理（磁盘卡片状态展示）
- [x] 修复：系统设置 - 存储空间管理（页面空白）
- [ ] 修复：公共文件管理（页面为空）
- [ ] 验证修复效果

## 当前进度
- [x] 我的文件页面修复完成，已截图验证
- [x] 网络访问页面修复完成，已截图验证
- [x] 设备管理页面修复完成，已截图验证
- [x] 存储空间管理页面修复完成，已截图验证

## 已修复问题（存储空间管理）— 最终修复

**第一次修复根因**：组件拆分后 Vue API 导入丢失，导致运行时 `ReferenceError`，整个页面渲染失败。
**第二次修复根因**：拆分后重构了数据流，但存在多处严重错误：
1. 未加载 volumes 数据，只加载了 pools
2. 组件中使用的字段名与 API 接口不匹配（`used`/`capacity` vs `usedCapacity`/`totalCapacity`）
3. 存储空间按 pool 分组逻辑丢失
4. "基于目录的存储空间"区域完全丢失
5. 页面标题和概览区域结构改变
6. 操作事件参数类型改变（string vs StoragePool/StorageVolume）

### 修复文件清单

| 文件 | 修复内容 |
|------|----------|
| `volumes/index.vue` | 重写：加载 volumes+pools 双数据流，恢复 pool 分组逻辑，添加目录区域，恢复页面标题 |
| `components/PoolCard.vue` | 重写：使用 `usedCapacity`/`totalCapacity`/`raidType` 等正确字段，恢复渐变背景和完整操作菜单 |
| `components/VolumeNestCard.vue` | 修复：字段名 `used`→`usedCapacity`, `capacity`→`totalCapacity` |

### 截图验证
- 修复前：`screenshots/volumes-current.png`（数据错误、存储空间为空、无目录区域）
- 修复后：`screenshots/volumes-fix-verify.png`（与原始版本 5888 完全一致）

### 关键文件

| 文件 | 说明 |
|------|------|
| `apps/web-antd/src/views/storage/volumes/index.vue` | 主页面（277行） |
| `apps/web-antd/src/views/storage/volumes/components/PoolCard.vue` | 存储池卡片 |
| `apps/web-antd/src/views/storage/volumes/components/VolumeNestCard.vue` | 存储空间嵌套卡片 |
| `apps/web-antd/src/views/storage/volumes/components/VolumeOverview.vue` | 概览栏 |

## 待修复页面
1. 公共文件管理（页面为空）

## 上下文恢复检查点
- 最后修改的文件：
  - `apps/web-antd/src/views/storage/volumes/index.vue`
  - `apps/web-antd/src/views/storage/volumes/components/PoolCard.vue`
  - `apps/web-antd/src/views/storage/volumes/components/VolumeNestCard.vue`
- 最后确认的状态：存储空间管理页面与拆分前完全一致

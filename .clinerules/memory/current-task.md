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

## 已修复问题（存储空间管理）

**根因**：组件拆分后 Vue API 导入丢失，导致运行时 `ReferenceError`，整个页面渲染失败。

| 文件 | 问题 | 修复 |
|------|------|------|
| `volumes/index.vue` | 使用 `h()` 但未导入 | `import { h } from 'vue'` |
| `components/CreateVolumeModal.vue` | 使用 `ref()`、`nextTick()` 但未导入 | `import { nextTick, ref } from 'vue'` |
| `components/RenameVolumeModal.vue` | 使用 `ref()`、`nextTick()` 但未导入 | `import { nextTick, ref } from 'vue'` |

## 截图验证
- 修复前：`screenshots/volumes-current.png`（完全空白）
- 修复后：`screenshots/volumes-verify-1.png`（正常显示存储池卡片和概览栏）

## 关键文件

| 文件 | 说明 |
|------|------|
| `apps/web-antd/src/views/storage/volumes/index.vue` | 主页面 |
| `apps/web-antd/src/views/storage/volumes/components/CreateVolumeModal.vue` | 创建存储空间弹窗 |
| `apps/web-antd/src/views/storage/volumes/components/RenameVolumeModal.vue` | 重命名弹窗 |

## 待修复页面
1. 公共文件管理（页面为空）

## 上下文恢复检查点
- 最后修改的文件：
  - `apps/web-antd/src/views/storage/volumes/index.vue`
  - `apps/web-antd/src/views/storage/volumes/components/CreateVolumeModal.vue`
  - `apps/web-antd/src/views/storage/volumes/components/RenameVolumeModal.vue`
- 最后确认的状态：存储空间管理页面从空白恢复为正常显示
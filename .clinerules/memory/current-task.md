# 当前任务：文件管理组件批量操作栏优化 — 已完成

## 任务来源
- 触发方式：用户指令

## 已完成修改

### 1. 类型定义 (types.ts)
- `FileItem` 接口新增 `isShared?: boolean` 字段

### 2. FileManagerPanel.vue 核心改造
- **新增全选/反全选按钮**：根据当前是否全选，显示"全选"或"反全选"
- **危险操作下沉到二级菜单**：批量删除等危险操作移入 Dropdown > Menu 中
- **状态区分动作**：
  - 选中单个项时，显示"重命名"按钮
  - 选中单个目录项时，显示"分享"按钮（蓝色主按钮）
- **已分享标识**：列表视图和网格视图图标右下角添加蓝色圆形 link 图标标识
- **新增 share 事件**：`share: [file: FileItem]`
- **新增 computed 属性**：`selectionCount`, `isSingleSelection`, `singleSelectedFile`, `canShare`, `isAllSelected`
- **回收站模式**：也新增了全选/反全选，危险操作同样下沉

### 3. 所有使用页面统一绑定 selected-file-ids
| 页面 | 绑定状态 |
|------|---------|
| my-files/index.vue | 已有，新增 @share="openShareModal" |
| public-files/index.vue | 新增 selectedFileIds + 绑定 |
| team-files/index.vue | 新增 selectedFileIds + 绑定 |
| recycle-bin/index.vue | 新增 selectedFileIds + 绑定 |
| shared-from-others/index.vue | 新增 selectedFileIds + 绑定 |
| storage/all-files/index.vue | 新增 selectedFileIds + 绑定 |

## 验证状态
- 代码修改完成，待本地开发服务器验证
- 如遇到编译错误，可能需要重启 `pnpm run dev:antd --port 5666`

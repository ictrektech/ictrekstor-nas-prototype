# PRD: 我的分享

## 页面概要

| 属性 | 值 |
|------|-----|
| 路由 | `/file/shared` |
| 页面组件 | `apps/web-antd/src/views/file/shared-files/index.vue` |
| 菜单标题 | 我的分享 |
| 菜单图标 | `lucide:link` |
| 当前状态 | ✅ 已实现 |

## 需求概述

"我的分享"页面用于管理当前用户创建的所有共享目录。以表格形式展示共享目录列表，支持创建新分享、编辑分享设置、管理共享用户和链接。

## 功能行为

### 1. 页面布局

- **顶部**：统计概览卡片（`ShareOverview`）+ 搜索框 + 创建分享按钮
- **主体**：共享目录表格（`ShareDirTable`）

### 2. 统计概览

显示以下指标：
- 有效共享数（`status === 'active'`）
- 有效链接数（`linkEnabled && linkStatus === 'active'`）
- 共享用户数（去重统计）
- 共享目录总数

### 3. 创建分享

- 点击"创建分享"按钮，弹出 `ShareConfigModal`
- 在弹窗中选择源目录（从"我的文件"目录树中选择）
- 配置共享用户、权限、有效期
- 支持生成共享链接

### 4. 共享目录管理

表格列包含：
- 共享名称
- 源路径
- 共享用户列表
- 链接状态
- 有效期
- 操作（编辑、删除、复制链接）

### 5. 编辑共享用户

- 点击"管理用户"，弹出 `EditUsersModal`
- 可添加/删除共享用户，修改用户权限

### 6. 链接管理

- 点击"链接管理"，弹出 `LinkManageModal`
- 可启用/禁用链接、复制链接地址、设置链接密码

## 子组件

| 组件 | 路径 | 说明 |
|------|------|------|
| ShareOverview | `./components/ShareOverview.vue` | 统计概览卡片 |
| ShareDirTable | `./components/ShareDirTable.vue` | 共享目录表格 |
| EditUsersModal | `./components/EditUsersModal.vue` | 编辑共享用户弹窗 |
| LinkManageModal | `./components/LinkManageModal.vue` | 链接管理弹窗 |

## 预期交互

- 搜索框实时过滤共享目录（按名称、路径、用户、链接搜索）
- 创建分享后自动刷新列表
- 删除分享需二次确认
- 链接复制成功后显示提示

## 相关数据

- Mock 数据：`./components/mockData.ts`
- 树数据：`myFilesTreeData`
- 用户选项：`userOptions`

## 关联页面

- 复用全局组件 `ShareConfigModal`
- 源目录选择依赖 `FileExplorer` 组件的目录树数据

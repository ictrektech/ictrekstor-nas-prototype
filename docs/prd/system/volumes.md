# PRD: 存储空间管理

## 页面概要

| 属性 | 值 |
|------|-----|
| 路由 | `/system/volumes` |
| 页面组件 | `apps/web-antd/src/views/storage/volumes/index.vue` |
| 菜单标题 | 存储空间管理 |
| 菜单图标 | `lucide:box` |
| 当前状态 | ✅ 已实现 |

## 需求概述

存储空间管理页是 NAS 存储系统的核心管理界面，用于管理存储池和存储空间（卷）。页面展示存储池卡片、存储空间列表，并支持创建存储池、创建存储空间、配置用户权限等操作。

## 功能行为

### 1. 页面布局

- **顶部**：页面标题 + 统计概览 + 创建按钮
- **主体**：
  - `VolumeOverview`：统计概览卡片（总数、基于存储池数、基于目录数、总容量、已用容量）
  - `PoolCard` 列表：每个存储池一张卡片，展示池内所有存储空间
  - 独立目录卷区域：`VolumeNestCard` 展示不基于存储池的卷

### 2. 统计概览

- 存储空间总数
- 基于存储池的卷数量
- 基于目录的卷数量
- 总容量（GB/TB 自动转换）
- 总已用容量

### 3. 存储池卡片

每张 `PoolCard` 展示：
- 存储池名称、RAID 类型
- 健康状态
- 总容量 / 已用容量 / 可用容量
- 容量使用进度条
- 池内所有存储空间列表（`VolumeNestCard`）

### 4. 存储空间操作

| 操作 | 行为 |
|------|------|
| 创建存储空间 | 弹出 `CreateVolumeModal`，选择基于存储池或目录 |
| 重命名 | 弹出 `RenameVolumeModal` |
| 配置用户权限 | 弹出 `ConfigUserModal` 设置访问用户 |
| 删除 | 确认后删除存储空间 |

### 5. 创建存储池

- 弹出 `CreatePoolModal`
- 选择 RAID 类型
- 选择参与组池的硬盘
- 确认创建

### 6. 创建存储空间

- 基于存储池：选择已有存储池，设置名称、容量、文件系统
- 基于目录：选择本地目录路径，设置名称

## 子组件

| 组件 | 路径 | 说明 |
|------|------|------|
| VolumeOverview | `./components/VolumeOverview.vue` | 统计概览卡片 |
| PoolCard | `./components/PoolCard.vue` | 存储池卡片 |
| VolumeNestCard | `./components/VolumeNestCard.vue` | 存储空间嵌套卡片 |
| CreatePoolModal | `./components/CreatePoolModal.vue` | 创建存储池弹窗 |
| CreateVolumeModal | `./components/CreateVolumeModal.vue` | 创建存储空间弹窗 |
| RenameVolumeModal | `./components/RenameVolumeModal.vue` | 重命名弹窗 |
| ConfigUserModal | `./components/ConfigUserModal.vue` | 用户权限配置弹窗 |

## 预期交互

- 页面加载时并行获取卷、存储池、磁盘数据
- 未使用的磁盘可用于创建新存储池
- 存储池卡片可展开/收起内部卷列表
- 操作成功后自动刷新数据

## 相关接口

| 接口 | 说明 |
|------|------|
| `GET /api/storage/volumes` | 获取存储空间列表 |
| `GET /api/storage/pools` | 获取存储池列表 |
| `GET /api/storage/disks` | 获取磁盘列表 |

## 关联页面

- `/storage/pools/detail/:id` — 存储池详情页

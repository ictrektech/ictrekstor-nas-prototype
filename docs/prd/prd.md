# PRD 索引 — ICTrekStor NAS 前端原型

> 本文档为项目所有页面 PRD 的总索引，提供项目概要、核心概念说明，以及各页面 PRD 与路由的对应关系导航。
>
> PRD 主要关注**页面功能与行为**，不关注页面视觉表现。视觉规范参见 `docs/visual-design/`。
>
> PRD 格式规范与维护规则参见 `.clinerules/prd.md`。

---

## 一、项目概要

ICTrekStor NAS 前端原型项目是基于 [Vben Admin](https://github.com/vbenjs/vue-vben-admin) `5.x` 构建的 NAS 网络存储管理界面原型，采用 Vue 3 + Vite + TypeScript + Ant Design Vue 技术栈。

### 项目目标

- 通过 AI 工作流快速构建 NAS 管理界面的可交互原型
- 供实验、评审和交互验证使用
- 为前端部门最终实现提供参考和依据

### 功能模块划分

项目按功能划分为四大核心模块：

| 模块 | 路由前缀 | 说明 |
|------|---------|------|
| **文件管理** | `/file/*` | 个人文件、公共文件、分享、外接设备、回收站等 |
| **存储管理** | `/storage/*` | 硬盘详情、存储池详情等 |
| **系统设置** | `/system/*` | 设备管理、用户管理、存储空间管理、服务设置等 |
| **AI 助手** | `/ai/*` | 智能对话等 AI 相关功能 |
| **首页** | `/dashboard` | 设备概览 Dashboard |

---

## 二、核心概念

### 2.1 存储池（Storage Pool）

**定义**：存储池是由多块物理硬盘通过 RAID 技术组合而成的逻辑存储单元，提供数据冗余和性能提升能力。

**关键属性**：
- **RAID 类型**：如 RAID 0/1/5/6/10 等，决定数据冗余和性能特征
- **健康状态**：正常 / 警告 / 故障
- **总容量 / 已用容量 / 可用容量**
- **组成磁盘**：池内所有物理磁盘的列表及状态

**相关页面**：
- [存储空间管理](./system/volumes.md) — 创建和管理存储池
- [存储池详情](./storage/pool-detail.md) — 查看单个存储池的完整信息

### 2.2 存储空间 / 卷（Volume）

**定义**：存储空间是在存储池或独立目录上创建的逻辑分区，是用户实际存储文件的空间。一个存储池可以包含多个存储空间。

**分类**：
- **基于存储池的卷**：在存储池之上划分，享受 RAID 的数据保护
- **基于目录的卷**：直接挂载到本地目录，不依赖存储池

**关键属性**：
- 名称、容量、文件系统类型（ext4/btrfs 等）
- 所属存储池（如有）
- 用户访问权限配置

**相关页面**：
- [存储空间管理](./system/volumes.md) — 卷的创建、重命名、删除、权限配置
- [存储池详情](./storage/pool-detail.md) — 查看池内卷的容量分配

### 2.3 硬盘（Disk）

**定义**：NAS 设备中的物理存储设备，支持 SATA、SAS、NVMe 等接口。

**关键属性**：
- 设备名称、型号、序列号
- 容量、接口类型、固件版本
- 温度、通电次数/时间
- SMART 健康状态
- 使用状态（已用 / 未使用）

**相关页面**：
- [设备管理](./system/device.md) — 硬盘列表及操作
- [磁盘详情](./storage/disk-detail.md) — 单块磁盘的完整信息及 SMART 监控

### 2.4 文件管理模型

**文件管理核心模型**：

- **目录树**：展示存储空间 / 文件夹层级结构
- **文件面板**：展示当前选中目录的文件列表（支持列表/网格视图）
- **操作栏**：路径导航、搜索、视图切换、批量操作

**文件空间类型**：
- **我的文件** (`/file/my-files`)：用户个人私有空间
- **公共文件** (`/file/public-files`)：团队级别的共享资源
- **他人分享** (`/file/shared-from-others`)：其他用户共享给当前用户的文件
- **设备全部文件** (`/file/all-files`)：管理员视角的全局文件浏览
- **外接设备** (`/file/external-device`)：USB/SD 等外部存储设备

### 2.5 共享（Share）

**定义**：将文件或文件夹共享给其他用户或生成公开链接，控制访问权限和有效期。

**关键属性**：
- 共享名称、源路径
- 共享用户列表及权限（读/写）
- 链接状态（启用/禁用）、链接密码
- 有效期

**相关页面**：
- [我的分享](./file/shared.md) — 管理当前用户创建的所有共享
- [他人分享](./file/shared-from-others.md) — 浏览他人共享给当前用户的文件

---

## 三、PRD 文件导航

### 3.1 首页

| 页面名称 | PRD 文件 | 路由 |
|---------|---------|------|
| 首页 / Dashboard | [home/index.md](./home/index.md) | `/dashboard` |

### 3.2 文件管理 (`/file/*`)

| 页面名称 | PRD 文件 | 路由 |
|---------|---------|------|
| 我的文件 | [file/my-files.md](./file/my-files.md) | `/file/my-files` |
| 公共文件 | [file/public-files.md](./file/public-files.md) | `/file/public-files` |
| 他人分享 | [file/shared-from-others.md](./file/shared-from-others.md) | `/file/shared-from-others` |
| 我的分享 | [file/shared.md](./file/shared.md) | `/file/shared` |
| 外接设备 | [file/external-device.md](./file/external-device.md) | `/file/external-device` |
| 外接设备文件管理 | [file/external-device-manage.md](./file/external-device-manage.md) | `/file/external-device/:deviceId` |
| 回收站 | [file/recycle.md](./file/recycle.md) | `/file/recycle` |
| 设备全部文件 | [file/all-files.md](./file/all-files.md) | `/file/all-files` |

### 3.3 存储管理 (`/storage/*`)

| 页面名称 | PRD 文件 | 路由 |
|---------|---------|------|
| 磁盘详情 | [storage/disk-detail.md](./storage/disk-detail.md) | `/storage/disks/detail/:deviceName` |
| 存储池详情 | [storage/pool-detail.md](./storage/pool-detail.md) | `/storage/pools/detail/:id` |

### 3.4 系统设置 (`/system/*`)

| 页面名称 | PRD 文件 | 路由 |
|---------|---------|------|
| 设备管理 | [system/device.md](./system/device.md) | `/system/device` |
| 网卡详情 | [system/network-detail.md](./system/network-detail.md) | `/system/device/network/:name` |
| 用户管理 | [system/users.md](./system/users.md) | `/system/users` |
| 存储空间管理 | [system/volumes.md](./system/volumes.md) | `/system/volumes` |
| 服务设置 | [system/services.md](./system/services.md) | `/system/services` |

### 3.5 AI 助手 (`/ai/*`)

| 页面名称 | PRD 文件 | 路由 |
|---------|---------|------|
| 智能对话 | [ai/chat.md](./ai/chat.md) | `/ai/chat` |

---

## 四、维护说明

- 当页面功能发生变更时，需同步更新对应的 PRD 文件，确保 PRD 描述与实际功能保持一致。
- 当页面路由发生变更（新增、重命名、移动、删除、合并）时，需同步调整 PRD 文件及本索引的导航表格。
- PRD 仅关注页面功能行为，视觉样式变更无需更新 PRD（视觉规范独立维护于 `docs/visual-design/`）。
- PRD 格式规范与维护规则参见 `.clinerules/prd.md`。

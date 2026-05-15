# PRD: 服务设置

## 页面概要

| 属性 | 值 |
|------|-----|
| 路由 | `/system/services` |
| 页面组件 | `apps/web-antd/src/views/system/services/index.vue` |
| 菜单标题 | 服务设置 |
| 菜单图标 | `lucide:server-cog` |
| 当前状态 | ✅ 已实现 |

## 需求概述

服务设置页面用于管理 NAS 系统对外提供的各类服务，包括文件共享服务（SMB/NFS/AFP）、网络协议服务（FTP/WebDAV）等。页面以卡片形式展示各服务，支持启用/禁用、配置参数、查看使用指南。

## 功能行为

### 1. 页面布局

- **顶部**：页面标题 + 描述
- **主体**：`Tabs` 按服务分类分组
  - `file-sharing` — 文件共享服务
  - `network-protocol` — 网络协议服务
  - 每个分类下是 `ServiceCard` 卡片网格

### 2. 服务分类

当前支持的服务：

**文件共享：**
- SMB 共享（Windows 文件共享）
- NFS 共享（Linux/Unix 文件共享）
- AFP 共享（macOS 文件共享）

**网络协议：**
- FTP 服务
- WebDAV 服务

### 3. 服务卡片

每张 `ServiceCard` 展示：
- 服务图标和名称
- 服务描述
- 启用/禁用开关
- 运行状态标签（运行中/已停止）
- 快捷信息（共享路径、端口、认证方式等）
- 操作按钮：配置、使用指南

### 4. 服务配置

- 点击"配置"打开 `ServiceConfigModal`
- 不同服务有不同配置项：
  - SMB：工作组、服务器名称、SMB 版本、访客访问
  - NFS：导出路径、客户端权限
  - FTP：端口、被动模式、匿名访问
  - WebDAV：端口、认证方式

### 5. 使用指南

- 点击"使用指南"打开 `ServiceGuideModal`
- 展示各操作系统/客户端的连接方式
- 包含 Windows、macOS、Linux、手机端的连接说明
- 支持复制连接地址

### 6. 启用/禁用服务

- 点击开关切换服务状态
- 禁用前提示确认
- 状态变更后即时生效（STUB）

## 子组件

| 组件 | 路径 | 说明 |
|------|------|------|
| ServiceCard | `./components/ServiceCard.vue` | 服务信息卡片 |
| ServiceConfigModal | `./components/ServiceConfigModal.vue` | 服务配置弹窗 |
| ServiceGuideModal | `./components/ServiceGuideModal.vue` | 使用指南弹窗 |

## 预期交互

- Tab 切换平滑过渡
- 服务开关切换有确认提示
- 配置保存后即时更新卡片显示
- 使用指南支持一键复制命令/地址

## 相关数据

- 服务列表数据：硬编码在页面 `serviceList` ref 中
- 各服务配置项和指南内容均硬编码

## 关联页面

- 无直接关联子页面

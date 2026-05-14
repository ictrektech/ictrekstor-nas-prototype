# PRD: 外接设备

## 页面概要

| 属性 | 值 |
|------|-----|
| 路由 | `/file/external-device` |
| 页面组件 | `apps/web-antd/src/views/file/external-device/index.vue` |
| 菜单标题 | 外接设备 |
| 菜单图标 | `lucide:usb` |
| 当前状态 | ✅ 已实现 |

## 需求概述

外接设备页面用于查看和管理通过 USB 或 SD 卡槽连接到 NAS 的外部存储设备，包括 U 盘、移动硬盘、SSD、SD 卡等。以卡片网格形式展示设备列表。

## 功能行为

### 1. 页面布局

- **顶部**：页面标题 + 设备统计概览（总数、已连接、未连接）
- **主体**：设备卡片网格

### 2. 设备卡片信息

每张卡片展示：
- 设备类型图标（USB / HDD / SSD / SD）
- 设备名称
- 容量与已用空间
- 使用进度条
- 连接状态（已连接/未连接）
- 挂载路径
- 文件系统类型

### 3. 设备操作

| 操作 | 行为 |
|------|------|
| 打开文件 | 已连接设备可点击打开，跳转至设备文件管理页 |
| 安全弹出 | 已连接设备支持安全弹出（STUB） |

### 4. 设备状态

- `connected`：已连接并挂载，可操作
- `disconnected`：未连接，仅显示信息，不可操作

## 子组件

| 组件 | 路径 | 说明 |
|------|------|------|
| ExternalDeviceCard | `./components/ExternalDeviceCard.vue` | 设备信息卡片 |

## 预期交互

- 点击已连接设备卡片跳转至 `/file/external-device/:deviceId`
- 未连接设备卡片禁用操作，显示灰色状态
- 设备列表为空时显示 `Empty` 空状态

## 相关数据

- Mock 设备数据：硬编码在页面 `devices` ref 中
- 设备类型：`usb`、`hdd`、`ssd`、`sd`

## 关联页面

- `/file/external-device/:deviceId` — 外接设备文件管理页

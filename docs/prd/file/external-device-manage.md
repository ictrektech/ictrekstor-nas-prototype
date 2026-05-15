# PRD: 外接设备文件管理

## 页面概要

| 属性 | 值 |
|------|-----|
| 路由 | `/file/external-device/:deviceId` |
| 页面组件 | `apps/web-antd/src/views/file/external-device/manage.vue` |
| 菜单标题 | 外接设备文件管理（隐藏菜单） |
| 菜单图标 | `lucide:folder-open` |
| 当前状态 | ✅ 已实现 |

## 需求概述

外接设备文件管理页提供双面板文件管理器，左侧展示外接设备的文件目录，右侧展示本地存储目录，支持在设备与本地之间传输文件。

## 功能行为

### 1. 页面布局

- **顶部**：`DeviceInfoHeader` 设备信息头部
- **主体**：左右双面板布局
  - 左侧面板：外接设备文件（`FileTreePanel` + `FileManagerPanel`）
  - 右侧面板：本地存储文件（`FileTreePanel` + `FileManagerPanel`）
- 中间可切换显示/隐藏本地面板

### 2. 设备信息头部

显示当前设备的基本信息：
- 设备名称
- 容量与已用空间
- 文件系统类型
- 挂载路径

### 3. 文件操作

两侧面板均支持：
- 目录树浏览
- 文件列表/网格视图
- 搜索
- 重命名

### 4. 文件传输

- 选中一侧文件后，点击传输按钮
- 弹出 `TransferConfirmModal` 确认传输
- 传输方向：设备 → 本地 或 本地 → 设备

### 5. 面包屑导航

- 两侧各自独立维护面包屑路径
- 支持点击跳转上级目录

## 子组件

| 组件 | 路径 | 说明 |
|------|------|------|
| DeviceInfoHeader | `./components/DeviceInfoHeader.vue` | 设备信息头部 |
| TransferConfirmModal | `./components/TransferConfirmModal.vue` | 传输确认弹窗 |

## 预期交互

- 左侧选中设备文件，点击"传输到本地"，右侧自动选中目标目录
- 传输完成后刷新两侧文件列表
- 支持单个文件传输

## 相关数据

- Mock 设备数据：`./components/mockData.ts` 中 `devices`
- Mock 设备文件：`deviceFilesData`
- Mock 本地文件：`localTree`、`localFiles`

## 关联页面

- `/file/external-device` — 外接设备列表页（返回入口）

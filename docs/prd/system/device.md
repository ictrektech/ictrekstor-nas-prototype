# PRD: 设备管理

## 页面概要

| 属性 | 值 |
|------|-----|
| 路由 | `/system/device` |
| 页面组件 | `apps/web-antd/src/views/system/device/index.vue` |
| 菜单标题 | 设备管理 |
| 菜单图标 | `lucide:monitor` |
| 当前状态 | ✅ 已实现 |

## 需求概述

设备管理页是 NAS 系统的核心监控页面，展示设备硬件信息、资源使用情况、存储设备状态和网络配置。页面采用卡片式布局，信息密度高且结构清晰。

## 功能行为

### 1. 页面布局

- **顶部**：页面标题 + 描述
- **设备信息 Hero**：`DeviceInfoHero` 展示设备核心信息
- **硬件示意图**：`DeviceDiagramPanel` 可视化展示设备盘位和网络接口
- **存储设备卡片**：硬盘列表，支持定位、休眠、闪烁指示灯等操作
- **资源使用卡片**：`ResourceUsageCard` CPU/内存使用率图表
- **网络配置卡片**：`NetworkCard` 网卡列表及配置

### 2. 设备信息 Hero

展示：
- 设备名称、系统版本
- 运行时长
- CPU 核心数、内存大小
- 硬盘数量
- 设备序列号
- 远程访问状态

### 3. 硬件示意图

- Canvas 绘制的设备前后视图
- 前面板：盘位状态（空闲/已用/故障）、品牌标识
- 后面板：风扇、网口、USB、HDMI、PCIe、电源接口
- 点击盘位高亮对应硬盘
- 支持 Tooltip 显示详细信息

### 4. 存储设备

硬盘卡片列表，每张卡片展示：
- 盘位号、设备名
- 型号、容量
- 温度、健康度
- 使用状态（已用/未使用）
- 操作按钮：定位、休眠、闪烁、详情

### 5. 硬盘操作

| 操作 | 行为 |
|------|------|
| 定位 | 在硬件示意图中高亮该硬盘所在盘位 |
| 休眠 | 使硬盘进入休眠状态 |
| 闪烁 | 控制硬盘指示灯闪烁（用于物理定位） |
| 详情 | 跳转至 `/storage/disks/detail/:deviceName` |

### 6. 资源使用

- CPU 使用率实时图表（历史趋势）
- 内存使用率实时图表
- 显示平均使用率

### 7. 网络配置

网卡卡片列表，每张展示：
- 网卡名称、MAC 地址
- IP 地址、子网掩码
- 连接状态
- 实时速率
- 操作：配置、详情

### 8. 网卡操作

| 操作 | 行为 |
|------|------|
| 配置 | 打开 `NetworkConfigModal` 修改 IP/DNS 等 |
| 详情 | 跳转至 `/system/device/network/:name` |

## 子组件

| 组件 | 路径 | 说明 |
|------|------|------|
| DeviceInfoHero | `./components/DeviceInfoHero.vue` | 设备信息 Hero |
| DeviceDiagramPanel | `./components/DeviceDiagramPanel.vue` | 硬件示意图面板 |
| ResourceUsageCard | `./components/ResourceUsageCard.vue` | CPU/内存资源卡片 |
| DiskCard | `./components/DiskCard.vue` | 硬盘信息卡片 |
| NetworkCard | `./components/NetworkCard.vue` | 网卡信息卡片 |
| NetworkConfigModal | `./components/NetworkConfigModal.vue` | 网卡配置弹窗 |

## 预期交互

- 页面加载时并行获取磁盘、存储池、网络、摘要数据
- 硬件示意图与硬盘卡片双向联动（点击盘位高亮卡片，点击卡片高亮盘位）
- 网卡配置保存后即时更新列表
- 资源图表数据可模拟或从后端获取

## 相关接口

| 接口 | 说明 |
|------|------|
| `GET /api/storage/disks` | 获取磁盘列表 |
| `GET /api/storage/pools` | 获取存储池列表 |
| `GET /api/system/networks` | 获取网络配置 |
| `GET /api/dashboard/summary` | 获取设备摘要 |
| `PUT /api/system/networks/:name` | 更新网络配置 |

## 关联页面

- `/storage/disks/detail/:deviceName` — 磁盘详情页
- `/system/device/network/:name` — 网卡详情页

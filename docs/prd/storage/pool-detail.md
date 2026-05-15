# PRD: 存储池详情

## 页面概要

| 属性 | 值 |
|------|-----|
| 路由 | `/storage/pools/detail/:id` |
| 页面组件 | `apps/web-antd/src/views/storage/pools/detail.vue` |
| 菜单标题 | 存储池详情（隐藏菜单） |
| 当前状态 | ✅ 已实现 |

## 需求概述

存储池详情页展示单个存储池的全面信息，包括基本信息、性能监控、磁盘组成、容量分配、操作日志等。通过 Tab 页签组织不同维度的信息。

## 功能行为

### 1. 页面布局

- **顶部**：页面标题 + 基本信息 + 统计概览
- **主体**：`Tabs` 页签切换
  - `monitor` — 性能监控
  - `disks` — 磁盘组成
  - `capacity` — 容量分配
  - `logs` — 操作日志

### 2. 页面头部

显示：
- 返回按钮
- 存储池名称
- RAID 类型、硬盘数量
- 状态标签（正常/警告）
- 总容量、已用容量、健康度

### 3. 性能监控 Tab (`PoolMonitorTab`)

- 读写速率趋势图
- IOPS 趋势图
- 延迟趋势图
- 支持时间范围选择

### 4. 磁盘组成 Tab (`PoolDiskTab`)

- 存储池内所有磁盘列表
- 每块磁盘的状态、容量、健康度
- 点击磁盘可跳转至磁盘详情页
- 磁盘故障时显示告警

### 5. 容量分配 Tab (`PoolCapacityTab`)

- 存储池总容量可视化
- 各存储空间/卷占用的容量分布
- 剩余可用容量
- 容量使用趋势

### 6. 操作日志 Tab (`PoolLogTab`)

- 存储池相关的操作历史
- 包含时间、操作类型、操作人、结果
- 支持按时间/类型筛选

## 子组件

| 组件 | 路径 | 说明 |
|------|------|------|
| PoolMonitorTab | `./components/PoolMonitorTab.vue` | 性能监控 Tab |
| PoolDiskTab | `./components/PoolDiskTab.vue` | 磁盘组成 Tab |
| PoolCapacityTab | `./components/PoolCapacityTab.vue` | 容量分配 Tab |
| PoolLogTab | `./components/PoolLogTab.vue` | 操作日志 Tab |

## 预期交互

- Tab 切换时保留当前选择状态
- URL 支持 `?tab=` 参数直接定位到指定 Tab
- 点击磁盘行跳转至 `/storage/disks/detail/:deviceName`
- 返回按钮回到 `/storage/pools`

## 相关接口

| 接口 | 说明 |
|------|------|
| `GET /api/storage/pools/:id` | 获取存储池详情 |

## 关联页面

- `/storage/pools` — 存储池列表页（上级页面，注：当前无独立列表页，从 `/system/volumes` 可访问）
- `/storage/disks/detail/:deviceName` — 磁盘详情页

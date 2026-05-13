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
- [ ] 修复：系统设置 - 存储空间管理（页面为空）
- [ ] 修复：公共文件管理（页面为空）
- [ ] 验证修复效果

## 当前进度
- [x] 我的文件页面修复完成，已截图验证
- [x] 网络访问页面修复完成，已截图验证
- [x] 设备管理页面修复完成，已截图验证

## 已修复问题（设备管理）

| 问题 | 修复文件 | 修复内容 |
|------|---------|---------|
| CPU 显示型号而非核数 | `DeviceInfoHero.vue` | `cpuModel` → `cpuCores`，展示 "16 核" |
| 设备信息与示意图间距 | `device/index.vue` | 添加 `diagram-section { margin-top: 16px }` |
| CPU/内存图表为自定义SVG | `ResourceUsageCard.vue` | 改用 `vue-echarts` + ECharts `LineChart` |
| 磁盘健康状态显示"未知" | `DiskCard.vue` | `disk.health` → `disk.healthStatus` |
| 磁盘容量不显示 | `DiskCard.vue` | `disk.capacity` → `disk.size` |
| 存储池全部"未分配" | `DiskCard.vue` | `disk.pools` → `disk.poolIds` |

## 关键文件

| 文件 | 说明 |
|------|------|
| `apps/web-antd/src/views/system/device/components/DeviceInfoHero.vue` | 设备信息 Hero 卡片 |
| `apps/web-antd/src/views/system/device/components/ResourceUsageCard.vue` | CPU/内存资源卡片（ECharts 折线图） |
| `apps/web-antd/src/views/system/device/components/DiskCard.vue` | 磁盘信息卡片 |
| `apps/web-antd/src/views/system/device/index.vue` | 设备管理主页面 |

## 截图验证
- 修复后截图：`screenshots/device-verify-1.png`（设备信息 Hero）
- 修复后截图：`screenshots/device-verify-2.png`（CPU/内存 ECharts 图表）
- 修复后截图：`screenshots/device-verify-3.png`（磁盘卡片状态）

## 待修复页面
1. 系统设置 - 存储空间管理（页面为空）
2. 公共文件管理（页面为空）

## 上下文恢复检查点
- 最后修改的文件：
  - `apps/web-antd/src/views/system/device/components/DeviceInfoHero.vue`
  - `apps/web-antd/src/views/system/device/components/ResourceUsageCard.vue`
  - `apps/web-antd/src/views/system/device/components/DiskCard.vue`
  - `apps/web-antd/src/views/system/device/index.vue`
- 最后确认的状态：设备管理页面3项问题全部修复，截图验证通过
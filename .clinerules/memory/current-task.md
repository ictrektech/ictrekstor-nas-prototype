# 当前任务：磁盘管理页优化与详情页开发（已完成）

## 任务来源
- 触发方式：用户指令

## 已完成工作

### 1. 磁盘列表页优化 (`apps/web-antd/src/views/storage/disks/index.vue`)
- [x] 卡片改为左右横向布局（左侧72px图标区 + 右侧信息区，margin-right: 12px分隔）
- [x] 卡片高度缩减，仅展示型号/类型/序列号/存储池
- [x] 磁盘图标增大，蓝色背景与信息间距通过margin-right实现
- [x] 添加过滤栏：搜索框 + 状态筛选 + 容量筛选 + 重置按钮 + 结果计数
- [x] 操作按钮顺序：定位(crosshair) → 休眠(moon) → 点灯(lightbulb) → 详细信息(file-text+文字)
- [x] 头部区域（图标+设备名+容量+箭头）可点击跳转详情页，带悬停高亮效果
- [x] 页面上方集成NAS设备示意图（NasDiagram组件）
- [x] 示意图右侧添加220px概览面板：总容量/类型分布/健康状态/运行状态
- [x] 实现卡片→示意图的双向定位交互
- [x] 示意图居中对齐、概览面板右对齐
- [x] 概览面板优化：三列网格对齐（圆点|标签|数字）、字号层级分明（标题13px粗体/数值14px粗体/大数字36px）
- [x] 示意图和概览信息放入白色卡片背景（圆角12px + 浅灰头部 + 轻微阴影）

### 2. NAS设备示意图组件 (`apps/web-antd/src/views/storage/disks/components/NasDiagram.vue`)
- [x] Canvas绘制立式VIVIBIT NAS设备（340×520）
- [x] 6个磁盘槽位竖直排列，按数组索引顺序映射
- [x] 左侧深色面板带竖排"VIVIBIT"文字 + 底部RUN指示灯
- [x] 点击槽位检测与高亮（橙色边框+背景）
- [x] Tooltip显示槽位号/型号/序列号/容量/状态
- [x] 底部接口区：LAN×2(蓝) / USB(绿) / PWR(橙)
- [x] 调整槽位高度52px+间距8px，避免槽位6被底部接口遮挡
- [x] 调整左侧面板高度340px，避免RUN指示灯被底部接口遮挡

### 3. 磁盘详情页 (`apps/web-antd/src/views/storage/disks/detail.vue`) — 之前迭代完成
- [x] 路由：`/storage/disks/detail/:deviceName`
- [x] 概览 Tab：18 项基本信息 Descriptions + 分区信息列表
- [x] 性能监控 Tab：6 个折线图 + 1 个饼图（vue-echarts）
- [x] SMART Tab：完整 SMART 信息展示

### 4. 路由配置 (`apps/web-antd/src/router/routes/modules/storage.ts`)
- [x] 添加 `StorageDiskDetail` 路由

## 截图验证
- `screenshots/disks-panel-fix.png` — 最终效果（槽位和面板均不被遮挡）

## 文件清单
| 文件 | 说明 |
|------|------|
| `apps/web-antd/src/views/storage/disks/index.vue` | 列表页（优化+示意图+概览面板） |
| `apps/web-antd/src/views/storage/disks/components/NasDiagram.vue` | NAS设备示意图Canvas组件 |
| `apps/web-antd/src/views/storage/disks/detail.vue` | 详情页（之前迭代） |
| `apps/web-antd/src/router/routes/modules/storage.ts` | 路由配置 |

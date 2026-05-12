# 当前任务：网卡管理功能增强

## 任务来源
- 触发方式：用户指令
- 关联页面：http://localhost:5666/system/device

## 目标与范围
- [ ] 1. 扩展 NetworkConfig 接口，增加带宽和历史数据字段
- [ ] 2. 更新 API mock 数据，添加网卡详情和历史带宽数据
- [ ] 3. 创建网卡详情页面（参考磁盘详情页设计）
- [ ] 4. 添加网卡详情路由
- [ ] 5. 修改设备管理页面网卡卡片（配置弹窗+详情按钮+实时带宽）
- [ ] 6. 截图验证效果

## 关键上下文
- 设备管理页面：`apps/web-antd/src/views/system/device/index.vue`
- 磁盘详情参考：`apps/web-antd/src/views/storage/disks/detail.vue`
- 系统API：`apps/web-antd/src/api/system.ts`
- 系统路由：`apps/web-antd/src/router/routes/modules/system.ts`

## 设计方向
1. 网卡卡片新增：上传/下载带宽实时展示、配置按钮（弹窗）、详情按钮（跳转）
2. 网卡配置弹窗：表单编辑 IP、子网掩码、网关、DNS、MTU
3. 网卡详情页：顶部概览（带宽/状态/MAC）+ 信息卡片（Descriptions）+ 历史带宽图表（echarts）

# 当前任务：文件管理器通用组件提取（已完成）

## 任务来源
- 触发方式：用户指令
- 目标：将团队文件管理和设备全部文件中的树状视图和文件管理视图抽出为通用组件

## 目标与范围
- [x] 将目录结构独立为 Model/Mock 数据，由通用组件接收渲染
- [x] 提取 FileTreePanel 通用组件（侧边栏树状视图）
- [x] 提取 FileManagerPanel 通用组件（文件管理视图：面包屑+工具栏+列表/网格）
- [x] 提取通用类型定义和工具函数
- [x] 重写 all-files/index.vue 使用通用组件
- [x] 重写 team-files/index.vue 使用通用组件
- [x] 优化团队文件管理操作栏（新建/用户管理/高级操作下拉）
- [x] 修复高级操作删除hover颜色
- [x] 去掉概览与操作栏之间的分割线
- [x] 截图验证效果

## 设计决策
1. 组件位置：`apps/web-antd/src/components/FileExplorer/`
2. 数据位置：Mock 数据保留在页面中（页面级数据），类型定义提取到组件目录
3. 通用组件为纯展示组件，通过 props 接收数据、emit 事件，页面管理状态和逻辑
4. 提取共享工具函数 `getFileIconClass` 到 utils.ts

## 关键上下文
- all-files/index.vue 和 team-files/index.vue 结构高度相似
- 差异点：页面标题/描述/图标、统计指标、team-files 有新建团队文件夹弹窗
- 两页面样式几乎完全一致（~1100-1200 行）

## 文件变更
| 文件 | 说明 |
|------|------|
| `apps/web-antd/src/components/FileExplorer/types.ts` | 通用类型定义（FileTreeNode/FileItem/BreadcrumbItem等） |
| `apps/web-antd/src/components/FileExplorer/utils.ts` | 通用工具函数（getFileIconClass/buildBreadcrumbPath/findParentKeys等） |
| `apps/web-antd/src/components/FileExplorer/FileTreePanel.vue` | 树状侧边栏通用组件 |
| `apps/web-antd/src/components/FileExplorer/FileManagerPanel.vue` | 文件管理视图通用组件（面包屑+工具栏+列表/网格） |
| `apps/web-antd/src/components/FileExplorer/index.ts` | 统一导出入口 |
| `apps/web-antd/src/views/storage/all-files/index.vue` | 重写后使用通用组件（~350行） |
| `apps/web-antd/src/views/storage/team-files/index.vue` | 重写后使用通用组件+新增操作栏 |

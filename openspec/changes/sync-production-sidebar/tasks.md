## 1. 清理现有冗余代码

- [ ] 1.1 删除现有路由模块文件：`router/routes/modules/dashboard.ts`、`demos.ts`、`vben.ts`
- [ ] 1.2 删除现有冗余页面目录：`views/dashboard/`、`views/demos/`、`views/_core/about/`
- [ ] 1.3 清理 `views/_core/profile/index.vue` 中的 Vben 演示内容，简化为占位页面或保留基础结构
- [ ] 1.4 验证清理后项目仍可正常编译运行（`pnpm run dev:antd`）

## 2. 国际化文案更新

- [ ] 2.1 更新 `locales/langs/zh-CN/page.json`，添加首页、文件管理、存储管理、系统设置各菜单和页面的中文翻译键
- [ ] 2.2 更新 `locales/langs/en-US/page.json`（或对应英文目录），添加英文占位翻译
- [ ] 2.3 验证菜单标题正确显示中文

## 3. Mock API 与数据设计

- [ ] 3.1 创建 `api/dashboard.ts`，定义首页概览接口 `/api/dashboard/summary` 及 Mock 数据
- [ ] 3.2 创建 `api/storage.ts`，定义硬盘列表 `/api/storage/disks`、存储池 `/api/storage/pools`、存储空间 `/api/storage/volumes`、公共目录 `/api/storage/public-dirs` 接口及 Mock 数据
- [ ] 3.3 创建 `api/file.ts`，定义文件库 `/api/file/library`、回收站 `/api/file/recycle-bin`、外部设备 `/api/file/external-devices`、外链 `/api/file/share-links` 接口及 Mock 数据
- [ ] 3.4 创建 `api/system.ts`，定义网络配置 `/api/system/networks`、用户列表 `/api/system/users` 接口及 Mock 数据
- [ ] 3.5 验证各 Mock 接口在浏览器开发者工具 Network 面板中可正常返回数据

## 4. 路由模块创建

- [ ] 4.1 创建 `router/routes/modules/home.ts`，定义首页路由（`/` 或 `/dashboard`）
- [ ] 4.2 创建 `router/routes/modules/file.ts`，定义文件管理模块路由（`/file` 及其子路由）
- [ ] 4.3 创建 `router/routes/modules/storage.ts`，定义存储管理模块路由（`/storage` 及其子路由）
- [ ] 4.4 创建 `router/routes/modules/system.ts`，定义系统设置模块路由（`/system` 及其子路由）
- [ ] 4.5 更新 `router/routes/core.ts` 中的默认首页重定向路径
- [ ] 4.6 验证侧边栏菜单正确显示四大模块及子菜单

## 5. 首页页面组件

- [ ] 5.1 创建 `views/home/index.vue`，实现首页基础布局
- [ ] 5.2 实现 AI 智能助手入口区域（标题、描述、三个功能卡片）
- [ ] 5.3 实现快捷入口区域
- [ ] 5.4 实现存储空间和系统空间概览卡片（使用 Mock 数据）
- [ ] 5.5 实现硬件信息展示区域
- [ ] 5.6 实现网络信息 Tab 展示区域
- [ ] 5.7 首页调用 `/api/dashboard/summary` 接口加载数据

## 6. 文件管理页面组件

- [ ] 6.1 创建 `views/file/library/index.vue`（存储空间页面），实现存储空间列表和单选切换
- [ ] 6.2 创建 `views/file/recycle/index.vue`（回收站页面），实现已删除文件列表（允许空数据或模拟少量数据）
- [ ] 6.3 创建 `views/file/external/index.vue`（外部设备页面），实现外部设备列表
- [ ] 6.4 创建 `views/file/share-links/index.vue`（外链管理页面），实现外链列表
- [ ] 6.5 各页面调用对应 Mock API 加载数据

## 7. 存储管理页面组件

- [ ] 7.1 创建 `views/storage/disks/index.vue`（硬盘管理页面），实现硬盘信息表格（包含生产环境全部 14+ 个字段）
- [ ] 7.2 创建 `views/storage/pools/index.vue`（存储池管理页面），实现存储池列表及"创建存储池"按钮
- [ ] 7.3 创建 `views/storage/volumes/index.vue`（存储空间管理页面），实现逻辑存储空间列表
- [ ] 7.4 创建 `views/storage/public-dirs/index.vue`（公共目录管理页面），实现公共目录列表
- [ ] 7.5 各页面调用对应 Mock API 加载数据

## 8. 系统设置页面组件

- [ ] 8.1 创建 `views/system/device/index.vue`（设备信息页面），实现设备基本信息、存储/系统空间概览、硬件信息、网络信息 Tab
- [ ] 8.2 创建 `views/system/network/index.vue`（网络管理页面），实现网卡列表及配置展示
- [ ] 8.3 创建 `views/system/users/index.vue`（用户管理页面），实现用户列表及"新增用户"按钮
- [ ] 8.4 各页面调用对应 Mock API 加载数据

## 9. 布局与整体调整

- [ ] 9.1 更新 `layouts/basic.vue`，清理通知消息中的 Vben 演示数据，替换为中性占位内容或移除
- [ ] 9.2 验证所有页面在侧边栏菜单中正确高亮当前选中项
- [ ] 9.3 验证面包屑导航正确显示当前页面路径
- [ ] 9.4 执行构建验证 `pnpm run build:antd`，确保无编译错误

## 10. 最终验证

- [ ] 10.1 逐一访问首页、文件管理（4 个子页面）、存储管理（4 个子页面）、系统设置（3 个子页面），确认页面正常加载
- [ ] 10.2 确认 Mock 数据在各页面正确展示
- [ ] 10.3 确认侧边栏菜单结构与生产环境一致
- [ ] 10.4 截图保存各页面最终效果供评审

## Why

当前原型项目侧边栏仍为 Vben Admin 默认的演示菜单（概览、演示、项目等），与生产环境 VIVIBIT NAS 系统的菜单结构不一致。为了对齐生产环境的用户界面结构，需要将侧边栏替换为生产环境使用的菜单体系，并基于生产页面的真实内容设计 Mock 数据和页面原型。

## What Changes

- **移除现有演示路由和页面**：清理 `dashboard`（分析页/工作台）、`demos`（Ant Design Vue 演示）、`vben`（项目链接、关于）等冗余路由和页面组件
- **去除登录认证拦截**：修改路由守卫，移除登录跳转逻辑，用户可直接访问所有页面（默认用户为 admin）
- **新增首页路由和页面**：创建与生产环境一致的首页，包含 AI 智能助手入口、快捷入口等
- **新增文件管理路由和页面**：创建文件管理模块，包含存储空间、回收站、外部设备、外链管理四个子页面
- **新增存储管理路由和页面**：创建存储管理模块，包含硬盘管理、存储池管理、存储空间管理、公共目录管理四个子页面
- **新增系统设置路由和页面**：创建系统设置模块，包含设备信息、网络管理、用户管理三个子页面
- **设计并注入 Mock 数据**：基于生产环境页面的真实数据结构，设计各页面所需的 Mock API 接口和模拟数据
- **更新侧边栏 Logo 和标题**：将 "Vben Admin Antd" 调整为 "ictrekstor"（或保持框架默认，仅更新路由菜单）
- **更新国际化文案**：新增中文语言包中各菜单和页面的翻译字段

## Capabilities

### New Capabilities
- `nas-homepage`: 首页功能，包含 AI 智能助手入口、快捷入口、存储/系统空间概览、硬件信息、网络信息展示
- `file-management`: 文件管理功能，包含存储空间浏览、回收站、外部设备管理、外链管理
- `storage-management`: 存储管理功能，包含硬盘列表展示、存储池管理、存储空间管理、公共目录管理
- `system-settings`: 系统设置功能，包含设备信息展示、网络配置管理、用户管理
- `mock-data-design`: Mock 数据结构设计，为上述各模块提供合理的模拟数据

### Modified Capabilities
- 无现有 spec 需要修改

## Impact

- **路由文件**：`apps/web-antd/src/router/routes/modules/` 下新增/替换路由模块文件
- **页面组件**：`apps/web-antd/src/views/` 下新增各功能模块页面目录和组件
- **Mock API**：`apps/web-antd/src/api/` 下新增 Mock 接口定义和数据
- **国际化**：`apps/web-antd/src/locales/langs/zh-CN/` 下更新 page.json
- **布局**：`apps/web-antd/src/layouts/basic.vue` 中更新 Logo 和通知等占位内容
- **路由守卫**：`router/guard.ts` 中移除登录认证跳转，允许免登录直接访问
- **用户 Store**：`store/auth.ts` 中设置默认登录状态，默认用户名为 `admin`
- **清理范围**：移除 `views/dashboard/`、`views/demos/`、`views/_core/about/` 等冗余目录（保留 `_core` 中 fallback 页面，移除登录相关页面）

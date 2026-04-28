# 索引：Vben Admin 文档详细索引

> 本索引按主题组织，列出原始文档（`docs/src/`）的路径、行号和关键内容，便于 AI Agent 快速定位查阅。

---

## 目录

- [项目介绍与快速开始](#项目介绍与快速开始)
- [目录结构与基础概念](#目录结构与基础概念)
- [开发规范与工具链](#开发规范与工具链)
- [开发命令与环境配置](#开发命令与环境配置)
- [配置系统（环境变量与偏好设置）](#配置系统环境变量与偏好设置)
- [路由与菜单](#路由与菜单)
- [权限控制](#权限控制)
- [主题与样式](#主题与样式)
- [图标](#图标)
- [国际化](#国际化)
- [服务端交互与 Mock](#服务端交互与-mock)
- [构建与部署](#构建与部署)
- [组件文档](#组件文档)
- [其他文档](#其他文档)

---

## 项目介绍与快速开始

| 源文件 | 行数 | 关键内容 |
|--------|------|----------|
| `docs/src/index.md` | 1-111 | Vben Admin 首页，技术栈概览（Vue3、Vite、TypeScript、Tailwind、Turbo、Nitro） |
| `docs/src/guide/introduction/vben.md` | 1-49 | 项目介绍、特点、浏览器支持、贡献指南 |
| `docs/src/guide/introduction/quick-start.md` | 1-112 | 前置准备（Node.js 20.15+、Git）、pnpm install、pnpm dev、运行指定应用 |
| `docs/src/guide/introduction/why.md` | — | 为什么选择 Vben Admin |
| `docs/src/guide/introduction/thin.md` | — | 精简版说明 |
| `docs/src/guide/introduction/roadmap.md` | — | 路线图 |
| `docs/src/guide/introduction/changelog.md` | — | 更新日志 |

---

## 目录结构与基础概念

| 源文件 | 行数 | 关键内容 |
|--------|------|----------|
| `docs/src/guide/project/dir.md` | 1-68 | **完整目录结构**：apps/、packages/、internal/、scripts/ 等说明 |
| `docs/src/guide/essentials/concept.md` | 1-70 | **基础概念**：大仓、应用、包、别名（Node.js subpath imports） |

### 关键目录定位

- **应用目录**：`apps/web-antd/`（Ant Design Vue）、`apps/web-ele/`（Element Plus）、`apps/web-naive/`（Naive UI）、`apps/backend-mock/`（Nitro Mock）
- **核心包**：`packages/@core/base/`（design、icons、shared、typings）
- **UI 组件**：`packages/@core/ui-kit/`（layout-ui、menu-ui、shadcn-ui、tabs-ui）
- **通用组件**：`packages/effects/common-ui/`
- **布局**：`packages/effects/layouts/`
- **请求**：`packages/effects/request/`
- **权限**：`packages/effects/access/`
- **Hooks**：`packages/effects/hooks/`
- **图标**：`packages/icons/`
- **国际化**：`packages/locales/`
- **偏好设置**：`packages/preferences/`
- **状态管理**：`packages/stores/`
- **样式**：`packages/styles/`
- **类型**：`packages/types/`
- **工具**：`packages/utils/`

---

## 开发规范与工具链

| 源文件 | 行数 | 关键内容 |
|--------|------|----------|
| `docs/src/guide/project/standard.md` | 1-210 | **代码规范**：ESLint、Stylelint、Prettier、Commitlint、Publint、CSpell、lefthook |

### 行号索引

| 内容 | 行号范围 |
|------|----------|
| 工具链概述 | 24-36 |
| ESLint 配置 | 38-50 |
| Stylelint 配置 | 52-64 |
| Prettier 配置 | 66-78 |
| Commitlint 配置与提交类型 | 80-104 |
| Publint | 122-130 |
| CSpell | 132-145 |
| lefthook 配置详解 | 146-210 |

---

## 开发命令与环境配置

| 源文件 | 行数 | 关键内容 |
|--------|------|----------|
| `docs/src/guide/essentials/development.md` | 1-257 | **开发指南**：VS Code 插件、NPM Scripts、本地运行、环境区分、公共静态资源、DevTools |

### 行号索引

| 内容 | 行号范围 |
|------|----------|
| 前置准备与基础知识 | 9-24 |
| VS Code 推荐插件 | 25-39 |
| 完整 NPM Scripts 列表 | 40-119 |
| 本地运行项目 | 121-154 |
| 区分构建环境（test/production） | 155-220 |
| 公共静态资源 | 222-227 |
| DevTools 开启 | 228-238 |
| 本地运行文档 | 239-246 |
| 问题解决（reinstall） | 248-257 |

---

## 配置系统（环境变量与偏好设置）

| 源文件 | 行数 | 关键内容 |
|--------|------|----------|
| `docs/src/guide/essentials/settings.md` | 1-632 | **配置文档**：环境变量、生产环境动态配置、偏好设置完整类型定义 |

### 行号索引

| 内容 | 行号范围 |
|------|----------|
| 环境变量规则（Vite Env） | 1-27 |
| .env 配置示例 | 28-84 |
| 生产环境动态配置（_app.config.js） | 85-171 |
| 偏好设置概述 | 172-194 |
| **完整默认配置（defaultPreferences）** | 195-334 |
| **完整类型定义（Preferences 所有接口）** | 335-624 |

### 偏好设置关键配置项（行号对应 settings.md）

| 配置类别 | 行号范围 | 关键字段 |
|----------|----------|----------|
| AppPreferences | 341-400 | accessMode、layout、locale、name、defaultHomePath |
| BreadcrumbPreferences | 402-413 | enable、hideOnlyOne、showIcon |
| CopyrightPreferences | 415-430 | enable、companyName、date |
| FooterPreferences | 432-439 | enable、fixed、height |
| HeaderPreferences | 441-452 | enable、height、hidden、mode |
| LogoPreferences | 454-463 | enable、source、sourceDark |
| NavigationPreferences | 465-472 | accordion、split、styleType |
| SidebarPreferences | 474-501 | collapsed、width、collapseWidth、expandOnHover |
| ShortcutKeyPreferences | 503-514 | enable、globalLockScreen、globalLogout |
| TabbarPreferences | 516-541 | enable、keepAlive、draggable、styleType |
| ThemePreferences | 543-562 | mode、colorPrimary、radius、builtinType |
| TransitionPreferences | 564-573 | enable、name、progress |
| WidgetPreferences | 575-592 | fullscreen、globalSearch、themeToggle |

---

## 路由与菜单

| 源文件 | 行数 | 关键内容 |
|--------|------|----------|
| `docs/src/guide/essentials/route.md` | 1-644 | **路由系统**：路由类型、定义格式、新增页面、Meta 配置完整列表、标签页控制 |

### 行号索引

| 内容 | 行号范围 |
|------|----------|
| 路由类型（核心/静态/动态） | 1-47 |
| 核心路由说明 | 15-23 |
| 静态路由配置 | 25-46 |
| 动态路由配置 | 48-50 |
| 二级路由示例 | 57-98 |
| 多级路由示例 | 108-219 |
| 新增页面流程 | 223-279 |
| **RouteMeta 完整类型定义** | 297-421 |
| 各 Meta 字段详细说明 | 423-601 |
| 路由刷新 | 602-615 |
| 标签页与路由控制 | 617-644 |

### RouteMeta 关键字段速查（route.md 行号）

| 字段 | 行号 | 说明 |
|------|------|------|
| title | 425-430 | 页面标题 |
| icon | 432-437 | 图标 |
| activeIcon | 439-444 | 激活图标 |
| keepAlive | 446-451 | 页面缓存 |
| hideInMenu | 453-458 | 菜单隐藏 |
| hideInTab | 460-465 | 标签页隐藏 |
| authority | 481-486 | 权限角色 |
| affixTab | 523-528 | 固定标签页 |
| order | 579-587 | 菜单排序 |
| noBasicLayout | 595-600 | 不使用基础布局 |
| iframeSrc | 537-542 | iframe 地址 |
| link | 551-556 | 外链 |

---

## 权限控制

| 源文件 | 行数 | 关键内容 |
|--------|------|----------|
| `docs/src/guide/in-depth/access.md` | 1-357 | **权限系统**：三种权限模式、按钮细粒度控制、组件/API/指令用法 |

### 行号索引

| 内容 | 行号范围 |
|------|----------|
| 三种权限模式概述 | 1-12 |
| 前端访问控制 | 13-71 |
| 后端访问控制 | 73-162 |
| 混合访问控制 | 163-199 |
| 按钮细粒度控制概述 | 200-204 |
| 权限码数据结构 | 205-222 |
| AccessControl 组件（code） | 225-249 |
| hasAccessByCodes API | 251-274 |
| v-access:code 指令 | 276-295 |
| AccessControl 组件（role） | 297-322 |
| hasAccessByRoles API | 324-341 |
| v-access:role 指令 | 343-357 |

---

## 主题与样式

| 源文件 | 行数 | 关键内容 |
|--------|------|----------|
| `docs/src/guide/in-depth/theme.md` | 1-1295 | **主题系统**：CSS 变量、shadcn-vue、Tailwind、品牌色、16种内置主题 |
| `docs/src/guide/essentials/styles.md` | 1-106 | **样式方案**：SCSS、PostCSS、Tailwind、BEM、CSS Modules |
| `docs/src/guide/project/tailwindcss.md` | — | Tailwind CSS 配置说明 |

### theme.md 行号索引

| 内容 | 行号范围 |
|------|----------|
| CSS 变量概述 | 1-26 |
| 默认主题 CSS 变量 | 27-124 |
| 黑暗模式 CSS 变量 | 128-219 |
| 覆盖 CSS 变量 | 223-245 |
| 更改品牌主色 | 247-275 |
| 内置主题配置 | 277-290 |
| 内置主题类型列表 | 291-318 |
| 内置主题 CSS 变量（light） | 319-696 |
| 内置主题 CSS 变量（dark） | 700-1000+ |

### styles.md 行号索引

| 内容 | 行号范围 |
|------|----------|
| 样式文件结构 | 9-12 |
| SCSS 用法 | 13-28 |
| PostCSS 用法 | 30-44 |
| Tailwind CSS 用法 | 46-56 |
| BEM 规范与 useNamespace | 58-88 |
| CSS Modules | 90-106 |

---

## 图标

| 源文件 | 行数 | 关键内容 |
|--------|------|----------|
| `docs/src/guide/essentials/icons.md` | 1-78 | **图标系统**：Iconify、SVG、Tailwind CSS 图标 |

### 行号索引

| 内容 | 行号范围 |
|------|----------|
| Iconify 图标新增与使用 | 14-38 |
| SVG 图标新增与使用 | 40-68 |
| Tailwind CSS 图标 | 70-78 |

---

## 国际化

| 源文件 | 行数 | 关键内容 |
|--------|------|----------|
| `docs/src/guide/in-depth/locale.md` | 1-227 | **国际化**：Vue i18n、动态切换、新增翻译、新增语言包 |

### 行号索引

| 内容 | 行号范围 |
|------|----------|
| i18n Ally 插件 | 1-10 |
| 配置默认语言 | 11-21 |
| 动态切换语言 | 23-48 |
| 新增翻译文本 | 50-82 |
| 使用翻译文本 | 83-102 |
| 新增语言包步骤 | 104-142 |
| 界面切换语言功能 | 143-153 |
| 远程加载语言包 | 155-174 |
| 第三方语言包（dayjs） | 176-207 |
| 移除国际化 | 209-227 |

---

## 服务端交互与 Mock

| 源文件 | 行数 | 关键内容 |
|--------|------|----------|
| `docs/src/guide/essentials/server.md` | 1-387 | **服务端交互**：跨域配置、Axios 封装、请求示例、Token 刷新、Nitro Mock |

### 行号索引

| 内容 | 行号范围 |
|------|----------|
| 开发环境跨域配置 | 13-77 |
| 无跨域配置 | 79-88 |
| 生产环境交互 | 89-108 |
| 接口请求配置概述 | 109-112 |
| 扩展配置（ExtendOptions） | 113-141 |
| 请求示例（GET/POST/PUT/DELETE） | 142-186 |
| 应用级请求配置完整示例 | 187-305 |
| 多个接口地址 | 306-320 |
| 刷新 Token | 321-360 |
| Mock 数据与 Nitro | 361-379 |
| 关闭 Mock 服务 | 380-387 |

---

## 构建与部署

| 源文件 | 行数 | 关键内容 |
|--------|------|----------|
| `docs/src/guide/essentials/build.md` | 1-243 | **构建部署**：构建命令、预览、压缩、构建分析、nginx 配置 |
| `docs/src/guide/project/vite.md` | — | Vite 配置说明 |
| `docs/src/guide/project/changeset.md` | — | Changeset 版本管理 |
| `docs/src/guide/project/cli.md` | — | CLI 工具 |
| `docs/src/guide/project/test.md` | — | 测试 |

### build.md 行号索引

| 内容 | 行号范围 |
|------|----------|
| 构建命令 | 9-20 |
| 预览 | 21-51 |
| 压缩配置（gzip/brotli） | 53-114 |
| 构建分析 | 118-128 |
| 部署（nginx） | 129-158 |
| history 路由模式 | 159-175 |
| nginx history 模式配置 | 176-211 |
| 跨域处理 | 213-243 |

---

## 组件文档

| 源文件 | 行数 | 关键内容 |
|--------|------|----------|
| `docs/src/components/introduction.md` | 1-15 | 组件体系概述（布局组件 + 通用组件） |
| `docs/src/components/layout-ui/page.md` | — | Page 页面容器组件 |
| `docs/src/components/common-ui/vben-alert.md` | — | VbenAlert 提示框 |
| `docs/src/components/common-ui/vben-api-component.md` | — | VbenApiComponent API 组件 |
| `docs/src/components/common-ui/vben-count-to-animator.md` | — | VbenCountToAnimator 数字动画 |
| `docs/src/components/common-ui/vben-drawer.md` | — | VbenDrawer 抽屉 |
| `docs/src/components/common-ui/vben-ellipsis-text.md` | — | VbenEllipsisText 文本省略 |
| `docs/src/components/common-ui/vben-form.md` | — | VbenForm 表单 |
| `docs/src/components/common-ui/vben-modal.md` | — | VbenModal 弹窗 |
| `docs/src/components/common-ui/vben-vxe-table.md` | — | VbenVxeTable 表格 |

---

## 其他文档

| 源文件 | 行数 | 关键内容 |
|--------|------|----------|
| `docs/src/guide/in-depth/layout.md` | 1 | 布局（内容较简略） |
| `docs/src/guide/in-depth/loading.md` | — | 加载状态 |
| `docs/src/guide/in-depth/login.md` | — | 登录 |
| `docs/src/guide/in-depth/check-updates.md` | — | 检查更新 |
| `docs/src/guide/in-depth/features.md` | — | 特性 |
| `docs/src/guide/essentials/external-module.md` | 1-58 | 外部模块引入（以 ant-design-vue 为例） |
| `docs/src/guide/other/faq.md` | — | FAQ |
| `docs/src/guide/other/project-update.md` | — | 项目更新 |
| `docs/src/guide/other/remove-code.md` | — | 移除代码 |
| `docs/src/commercial/*.md` | — | 商业支持文档 |
| `docs/src/friend-links/*.md` | — | 友链 |
| `docs/src/sponsor/*.md` | — | 赞助 |

---

## 按问题类型快速查找

| 问题 | 推荐查阅 |
|------|----------|
| 如何启动项目？ | `01-overview.md` §1.5、`03-development.md` §3.3 |
| 目录结构是什么？ | `02-architecture.md` §2.2 |
| 如何新增页面？ | `04-routing.md` §4.3 |
| 如何配置权限？ | `05-access.md` §5.1-5.4 |
| 如何修改主题色？ | `06-theme-style.md` §6.1 |
| 如何使用图标？ | `06-theme-style.md` §6.3 |
| 如何添加国际化文本？ | `06-theme-style.md` §6.4 |
| 如何配置请求拦截器？ | `07-server.md` §7.3 |
| 如何使用 Mock 数据？ | `07-server.md` §7.5 |
| 如何构建和部署？ | `07-server.md` §7.7 |
| 代码提交规范是什么？ | `03-development.md` §3.1 |
| 偏好设置有哪些选项？ | `03-development.md` §3.5、`INDEX.md` 配置系统 |
| 路由 Meta 有哪些字段？ | `04-routing.md` §4.4、INDEX.md RouteMeta |

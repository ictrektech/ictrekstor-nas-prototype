# Vben Admin 5.x 快速参考手册

> 本手册由 AI 根据原始文档（`docs/src/`）提炼总结，面向 AI Agent 和开发者，帮助快速理解 Vben Admin 的组织架构、技术选型、开发规范和关键能力。
>
> 原始完整文档位于 `docs/src/` 目录下（VitePress 站点源码）。如需查阅细节，可依据本手册的索引定位到源文件具体位置。

---

## 手册结构

| 文件 | 主题 | 源文件对应 |
|------|------|-----------|
| [01-overview.md](./01-overview.md) | 项目概述、特点、环境要求、快速开始 | `guide/introduction/vben.md`, `guide/introduction/quick-start.md` |
| [02-architecture.md](./02-architecture.md) | Monorepo 目录结构、应用与包的概念、别名机制 | `guide/project/dir.md`, `guide/essentials/concept.md` |
| [03-development.md](./03-development.md) | 开发规范、代码质量工具、NPM Scripts、环境配置 | `guide/project/standard.md`, `guide/essentials/development.md`, `guide/essentials/settings.md` |
| [04-routing.md](./04-routing.md) | 路由类型、路由定义、Meta 配置、新增页面流程 | `guide/essentials/route.md` |
| [05-access.md](./05-access.md) | 三种权限模式、按钮细粒度控制、AccessControl 组件/指令/API | `guide/in-depth/access.md` |
| [06-theme-style.md](./06-theme-style.md) | 主题系统、CSS 变量、Tailwind CSS、图标、BEM、国际化 | `guide/in-depth/theme.md`, `guide/essentials/styles.md`, `guide/essentials/icons.md`, `guide/in-depth/locale.md` |
| [07-server.md](./07-server.md) | 服务端交互、Axios 封装、Mock（Nitro）、Token 刷新 | `guide/essentials/server.md` |
| [08-components.md](./08-components.md) | 内置布局组件、通用组件（Modal/Drawer/Form/Table 等） | `components/introduction.md`, `components/common-ui/*.md`, `components/layout-ui/*.md` |
| [INDEX.md](./INDEX.md) | 详细索引：按主题列出源文件路径、行号、关键内容 | — |

---

## 一句话总结

Vben Admin 5.x 是一个基于 **Vue 3 + Vite + TypeScript** 的企业级中后台 Monorepo 框架，采用 **pnpm workspaces + Turbo** 管理，核心基于 **shadcn-vue + Tailwind CSS**，支持多 UI 库（Ant Design Vue / Element Plus / Naive UI），内置权限、主题、国际化、Mock 服务等开箱即用能力。

## 关键路径速查

| 需求 | 路径 / 命令 |
|------|------------|
| 启动 Ant Design Vue 应用 | `pnpm run dev:antd` |
| 构建 Ant Design Vue 应用 | `pnpm run build:antd` |
| 页面组件存放位置 | `apps/web-antd/src/views/` |
| 路由配置位置 | `apps/web-antd/src/router/routes/modules/` |
| API / Mock 数据位置 | `apps/web-antd/src/api/` |
| 应用级偏好设置覆盖 | `apps/web-antd/src/preferences.ts` |
| 环境变量 | `apps/web-antd/.env`, `.env.development`, `.env.production` |
| 内置组件库 | `@vben/common-ui`, `@vben/layout-ui` |
| 请求封装 | `@vben/request`（应用级配置在 `src/api/request.ts`） |
| 权限控制 | `@vben/access`（`AccessControl` 组件、`v-access` 指令、`useAccess`） |
| 图标管理 | `@vben/icons`（Iconify + Svg） |
| 国际化 | `@vben/locales`（应用级覆盖在 `src/locales/langs/`） |

---

*本手册为 AI 提炼版，原始文档版权归 Vben Admin 项目所有。*

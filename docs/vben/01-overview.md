# 01 项目概述与快速开始

> 源文件：`docs/src/guide/introduction/vben.md`（49 行）、`docs/src/guide/introduction/quick-start.md`（112 行）

---

## 1.1 项目定位

Vben Admin 是一个基于 **Vue 3 + Vite + TypeScript** 的中后台前端解决方案，目标是为中大型项目提供**开箱即用**的启动模板。持续跟进最新前端技术并应用于项目中。

## 1.2 核心特点

- **最新技术栈**：Vue 3、Vite、TypeScript、Pinia、Vue Router
- **国际化**：内置完善的多语言方案
- **权限验证**：按钮级别权限控制
- **多主题**：内置多种主题 + 黑暗模式
- **动态菜单**：根据权限配置自动生成菜单
- **Mock 数据**：基于 Nitro 的本地高性能 Mock 方案
- **丰富组件**：满足大部分业务需求
- **代码规范**：ESLint、Prettier、Stylelint、Publint、CSpell
- **工程化**：pnpm Monorepo + TurboRepo + Changeset
- **多 UI 库支持**：Ant Design Vue、Element Plus、Naive UI（业务不再绑定单一组件库）

## 1.3 浏览器支持

- **开发环境**：推荐 Chrome 最新版，**不支持 Chrome 80 以下**
- **生产环境**：支持现代浏览器，**不支持 IE**
- Edge / Firefox / Chrome / Safari：last 2 versions

## 1.4 环境要求

- **Node.js**：20.15.0 及以上（推荐用 fnm / nvm / pnpm env 管理）
- **Git**：任意版本
- **包管理器**：仅支持 **pnpm**（通过 corepack 安装指定版本）

## 1.5 快速启动

```bash
# 1. 克隆代码
git clone https://github.com/vbenjs/vue-vben-admin.git

# 2. 安装依赖（在项目根目录）
npm i -g corepack
pnpm install

# 3. 启动项目（交互式选择应用）
pnpm dev

# 或直接启动指定应用
pnpm run dev:antd    # Ant Design Vue 版本（本项目使用）
pnpm run dev:ele     # Element Plus 版本
pnpm run dev:naive   # Naive UI 版本
pnpm run dev:docs    # 文档站点
pnpm run dev:play    # Playground
```

> ⚠️ 注意：代码目录及所有父级目录**不能存在中文、韩文、日文以及空格**，否则启动会出错。

## 1.6 项目版本

- 当前文档对应 **Vben Admin 5.0**
- 2.x / 3.x 版本已存档，与新版本不兼容
- 旧版本文档：https://doc.vvbin.cn

---

## 1.7 与 ictrekstor NAS 原型项目的关系

本项目（ictrekstor-nas-prototype）基于 Vben Admin 5.x 的 `web-antd` 应用进行二次开发：

- 使用 **Ant Design Vue** 作为 UI 组件库
- 开发服务器端口为 **5666**（`pnpm run dev:antd --port 5666`）
- 页面组件存放于 `apps/web-antd/src/views/`
- 路由配置位于 `apps/web-antd/src/router/routes/modules/`
- API 和 Mock 数据位于 `apps/web-antd/src/api/`

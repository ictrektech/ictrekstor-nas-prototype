# Vben Admin 文档使用指引

本项目基于 Vben Admin 5.x 构建，为便于 AI Agent 快速理解和使用框架，已将 Vben 官方文档（`docs/src/`）提炼总结为快速参考手册，存放于 `docs/vben/` 目录下。

## 文档结构

| 文件 | 主题 | 适用场景 |
|------|------|----------|
| `docs/vben/README.md` | 手册总览、关键路径速查 | 快速了解框架全貌 |
| `docs/vben/01-overview.md` | 项目概述、特点、快速开始 | 首次接触项目时 |
| `docs/vben/02-architecture.md` | Monorepo 目录结构、包引用、别名机制 | 需要理解代码组织时 |
| `docs/vben/03-development.md` | 开发规范、NPM Scripts、环境变量、偏好设置 | 配置项目或修改工程设置时 |
| `docs/vben/04-routing.md` | 路由类型、Meta 配置、新增页面 | 新增/修改页面时 |
| `docs/vben/05-access.md` | 三种权限模式、按钮控制（组件/指令/API） | 实现权限相关功能时 |
| `docs/vben/06-theme-style.md` | 主题系统、Tailwind/BEM、图标、国际化 | 调整样式或添加多语言时 |
| `docs/vben/07-server.md` | Axios 封装、Mock（Nitro）、构建部署 | 配置接口或部署时 |
| `docs/vben/08-components.md` | 内置组件（Modal/Drawer/Form/Table 等） | 使用或扩展框架组件时 |
| `docs/vben/INDEX.md` | **详细索引**：源文件路径、行号、按问题速查 | 需要定位原始文档具体位置时 |

## 使用原则

1. **优先查阅总结文档**：遇到 Vben 框架相关问题时，**先阅读 `docs/vben/` 下的提炼文档**，比直接阅读原始文档更高效
2. **索引定位原始文档**：当总结文档不足以解决问题时，通过 `docs/vben/INDEX.md` 快速定位到 `docs/src/` 中原始文档的精确行号
3. **禁止修改原始文档**：`docs/src/` 是 Vben 官方文档源码，**不要修改**；如有补充，在 `docs/vben/` 中新增或更新
4. **关键路径速查**：`docs/vben/README.md` 中列出了开发中最常用的路径和命令，建议作为日常参考

## 何时查阅

| 场景 | 查阅文件 |
|------|----------|
| 不确定路由 Meta 有哪些字段 | `04-routing.md` §4.4 |
| 需要配置按钮级别权限 | `05-access.md` §5.4 |
| 想修改主题色或布局模式 | `06-theme-style.md` §6.1、`03-development.md` §3.5 |
| 需要添加新的 Iconify 图标 | `06-theme-style.md` §6.3 |
| 接口请求需要自定义拦截器 | `07-server.md` §7.3 |
| Mock 数据不生效 | `07-server.md` §7.5 |
| 想了解完整的偏好设置选项 | `INDEX.md` → 配置系统（含 settings.md 行号映射） |

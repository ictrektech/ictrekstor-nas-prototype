# ictrekstor NAS 前端原型项目规则

## 重要提示，务必遵守

- 绝对不要自动执行 `pnpm run dev:antd --port 5666` 启动服务，该服务默认已经在后台启动，
  如果你发现没有启动，那就暂停并通知我；
- 绝对不要让 subagent 执行**修改文件**任务，如果你发现上下文不够了，不用着急结束，请继续
  实施你的任务，agent 会自动进行上下文管理和压缩，所以**绝对不要**因为上下文不够了就提前
  结束你的任务；
- 无论在什么系统上，当前项目都使用 bash 作为终端（windows 下用 git bash），执行命令时请
  使用 bash 格式（而不是 pwsh 格式）；

## 项目概述

本项目是基于 [Vben Admin](https://github.com/vbenjs/vue-vben-admin) `5.x` 的**前端原型项目**，用于快速构建 ictrekstor NAS 管理界面的可交互原型。项目采用 Vue 3 + Vite + TypeScript 技术栈，使用 pnpm Monorepo 管理。

**项目目标**：
- 通过 AI 工作流快速创建前端原型界面
- 供实验、评审和交互验证使用
- 为前端部门最终实现提供参考和依据

**重要声明**：
- 本项目代码完全服务于原型目的，最终不会交付生产环境。因此允许存在占位实现、模拟数据、待完善的样式等，但核心交互和页面结构应尽可能清晰可用。
- 如无特殊声明，该项目已在后台运行 pnpm run dev:antd --port 5666，支持热加载，不需要再额外执行；

## 技术栈

- **框架**：Vue 3 (Composition API)
- **构建工具**：Vite
- **语言**：TypeScript
- **UI 组件库**：Ant Design Vue
- **状态管理**：Pinia
- **路由**：Vue Router
- **Monorepo 工具**：pnpm workspaces + Turbo
- **代码规范**：ESLint、Prettier、Stylelint

## 语言规范

- 项目开发者母语为**中文**，所有文档、代码注释、提交信息（commit message）、问题回答**必须使用中文**撰写
- 变量名、函数名、配置键等标识符遵循英文命名惯例，但注释说明使用中文
- 技术术语保留英文原文（如 `ref`、`reactive`、`composable`、`mock`），不在中文语境中强行翻译

---

> 本目录下其他规则文件请按需查阅：
> - `git.md` —— 代码提交规范（Conventional Commits、提交时机、分支管理）
> - `openspec.md` —— OpenSpec 变更管理流程
> - `workspace.md` —— pnpm 包管理与脚本执行规范
> - `prototype.md` —— 原型项目特殊规范（页面组织、Vben 协作）
> - `vue-components.md` —— Vue 组件分拆规范
> - `vben.md` —— Vben Admin 文档使用指引
> - `agent.md` —— Agent 工作规范（介入条件、subagent、工具使用）
> - `memory.md` —— CONTEXT/MEMORY 长程任务稳定性机制

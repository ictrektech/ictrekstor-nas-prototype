# 包管理器与脚本执行规范

## Node.js 依赖

本项目为纯前端项目，统一使用 **pnpm** 作为 Node.js 包管理器。

- 使用 **pnpm** 作为 Node.js 包管理器
- 依赖清单文件为 `package.json`（根目录及各 workspace）
- 新增/变更依赖时，须修改 `package.json`，并通过 `pnpm install` 同步安装
- 模块统一安装于项目根目录 `node_modules/` 下
- lock 文件（`pnpm-lock.yaml`）须随 manifest 变更一并提交，确保构建可复现
- 禁止绕过 `package.json` 直接安装依赖

## 脚本执行规范

- **JS/TS 脚本**：使用 `node` / `npx` / `pnpm` 执行，确保调用的是 `node_modules/` 中安装的依赖
- **开发服务器启动**：`pnpm run dev:antd --port 5666`
- **构建**：`pnpm run build:antd`

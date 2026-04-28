# 02 组织架构与目录结构

> 源文件：`docs/src/guide/project/dir.md`（68 行）、`docs/src/guide/essentials/concept.md`（70 行）

---

## 2.1 Monorepo 大仓概念

Vben Admin 5.x 使用 **Monorepo** 管理整个项目，包含所有代码、包、应用、规范、文档、配置等。核心概念：

- **大仓**：整个 Monorepo 目录的所有内容
- **应用**：完整的可运行项目，位于 `apps/` 下，可独立运行、构建、测试、部署
- **包**：独立的模块（组件、工具、库），位于 `packages/` 下，可被多个应用或包引用

## 2.2 顶层目录结构

```
.
├── apps/                    # 应用目录
│   ├── backend-mock/        # Nitro Mock 后端服务
│   ├── web-antd/            # Ant Design Vue 前端应用
│   ├── web-ele/             # Element Plus 前端应用
│   └── web-naive/           # Naive UI 前端应用
├── docs/                    # 项目文档（VitePress）
├── internal/                # 内部工具目录
│   ├── lint-configs/        # ESLint / Prettier / Stylelint / Commitlint 配置
│   ├── node-utils/          # Node.js 工具
│   ├── tailwind-config/     # Tailwind CSS 配置
│   ├── tsconfig/            # 通用 tsconfig 配置
│   └── vite-config/         # 通用 Vite 配置
├── packages/                # 项目包目录
│   ├── @core/               # 核心包
│   │   ├── base/            # 基础包（design / icons / shared / typings）
│   │   ├── composables/     # 组合式 API
│   │   ├── preferences/     # 偏好设置
│   │   └── ui-kit/          # UI 组件集合
│   │       ├── layout-ui/   # 布局 UI
│   │       ├── menu-ui/     # 菜单 UI
│   │       ├── shadcn-ui/   # shadcn UI
│   │       └── tabs-ui/     # 标签页 UI
│   ├── constants/           # 常量
│   ├── effects/             # 副作用相关包
│   │   ├── access/          # 访问控制
│   │   ├── common-ui/       # 通用 UI 组件
│   │   ├── hooks/           # 组合式 API
│   │   ├── layouts/         # 布局
│   │   ├── plugins/         # 第三方大型依赖插件
│   │   └── request/         # HTTP 请求封装
│   ├── icons/               # 图标
│   ├── locales/             # 国际化
│   ├── preferences/         # 偏好设置
│   ├── stores/              # Pinia 状态管理
│   ├── styles/              # 样式
│   ├── types/               # 类型定义
│   └── utils/               # 工具函数
├── playground/              # 演示目录
├── scripts/                 # 脚本目录
│   ├── turbo-run/           # Turbo 运行脚本
│   └── vsh/                 # VSH 脚本
├── pnpm-workspace.yaml      # pnpm 工作区配置
├── turbo.json               # Turbo 配置
└── package.json             # 根目录依赖配置
```

## 2.3 包的引用方式

在 `package.json` 中引入：

```json
{
  "dependencies": {
    "@vben/utils": "workspace:*"
  }
}
```

在代码中引入：

```ts
import { isString } from '@vben/utils';
```

## 2.4 别名机制（`#` 前缀路径）

项目中使用 `#/` 开头的路径（如 `#/api`、`#/views`）不是通过 Vite alias 实现的，而是通过 **Node.js subpath imports**：

```json
// package.json
{
  "imports": {
    "#/*": "./src/*"
  }
}
```

同时在 `tsconfig.json` 中配置 paths 确保 IDE 识别：

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "#/*": ["src/*"]
    }
  }
}
```

## 2.5 ictrekstor 项目中的关键目录

| 目录 | 说明 |
|------|------|
| `apps/web-antd/src/views/` | 页面组件 |
| `apps/web-antd/src/router/routes/modules/` | 业务路由模块 |
| `apps/web-antd/src/api/` | API 接口与 Mock 数据 |
| `apps/web-antd/src/components/` | 自定义通用组件 |
| `apps/web-antd/src/store/` | Pinia Store |
| `apps/web-antd/src/locales/langs/` | 应用级国际化文本 |
| `apps/web-antd/src/preferences.ts` | 应用级偏好设置覆盖 |

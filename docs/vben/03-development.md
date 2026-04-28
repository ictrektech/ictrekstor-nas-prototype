# 03 开发规范与工程配置

> 源文件：`docs/src/guide/project/standard.md`（210 行）、`docs/src/guide/essentials/development.md`（257 行）、`docs/src/guide/essentials/settings.md`（632 行）

---

## 3.1 代码质量工具链

项目配置文件位于 `internal/lint-configs/` 下，集成的工具：

| 工具 | 用途 | 命令 |
|------|------|------|
| **ESLint** | JavaScript / TypeScript 代码检查 | `pnpm eslint .` |
| **Stylelint** | CSS 样式检查 | `pnpm stylelint "**/*.{vue,css,less,scss}"` |
| **Prettier** | 代码格式化 | `pnpm prettier .` |
| **Commitlint** | Git 提交信息规范检查 | — |
| **Publint** | npm 包规范检查 | `pnpm vsh publint` |
| **CSpell** | 拼写错误检查 | `pnpm cspell lint "**/*.ts" ...` |
| **lefthook** | Git hooks 管理（提交前自动校验） | — |

### lefthook 配置

在 `lefthook.yml` 中定义：

- `pre-commit`：提交前运行格式化与检查（code-workspace、lint-md、lint-vue、lint-js、lint-style、lint-package、lint-json）
- `post-merge`：合并后自动 `pnpm install`
- `commit-msg`：检查提交信息格式

临时关闭：`git commit -m 'feat: xxx' --no-verify`
永久关闭：删除 `lefthook.yml`

### Git 提交规范（Conventional Commits）

参考 Angular 规范，类型：

- `feat` — 新功能
- `fix` — 修复问题/BUG
- `style` — 代码风格（不影响运行）
- `perf` — 性能优化
- `refactor` — 重构
- `revert` — 撤销修改
- `test` — 测试相关
- `docs` — 文档/注释
- `chore` — 依赖更新/脚手架配置
- `workflow` — 工作流改进
- `ci` — 持续集成
- `types` — 类型修改

## 3.2 推荐 VS Code 插件

| 插件 | 用途 |
|------|------|
| Vue - Official | Vue 官方插件（必备） |
| Tailwind CSS | Tailwindcss 提示 |
| CSS Variable Autocomplete | CSS 变量提示 |
| Iconify IntelliSense | Iconify 图标 |
| i18n Ally | 国际化管理 |
| ESLint | 脚本代码检查 |
| Prettier | 代码格式化 |
| Stylelint | CSS 格式化 |
| Code Spell Checker | 单词拼写检查 |
| DotENV | .env 文件高亮 |

## 3.3 常用 NPM Scripts

```json
{
  "build": "cross-env NODE_OPTIONS=--max-old-space-size=8192 turbo build",
  "build:analyze": "turbo build:analyze",
  "build:antd": "pnpm run build --filter=@vben/web-antd",
  "build:docs": "pnpm run build --filter=@vben/docs",
  "dev": "turbo-run dev",
  "dev:antd": "pnpm -F @vben/web-antd run dev",
  "dev:docs": "pnpm -F @vben/docs run dev",
  "format": "vsh lint --format",
  "lint": "vsh lint",
  "test:unit": "vitest run --dom",
  "reinstall": "pnpm clean --del-lock && pnpm install",
  "clean": "node ./scripts/clean.mjs",
  "preview": "turbo-run preview"
}
```

### ictrekstor 项目中的常用命令

```bash
# 启动开发服务器（端口 5666）
pnpm run dev:antd --port 5666

# 构建 Ant Design Vue 应用
pnpm run build:antd
```

## 3.4 环境变量配置

环境变量文件位于应用目录下：

```
.env                # 所有环境
.env.local          # 所有环境，被 git 忽略
.env.[mode]         # 指定模式
.env.[mode].local   # 指定模式，被 git 忽略
```

规则与 [Vite Env Variables](https://vitejs.dev/guide/env-and-mode.html) 一致。

### 关键变量

- 只有以 `VITE_` 开头的变量会嵌入客户端包中
- 以 `VITE_GLOB_*` 开头的变量会在打包时注入 `dist/_app.config.js`，支持**生产环境动态修改**

### 典型配置示例

```bash
# .env.development
VITE_PORT=5555
VITE_BASE=/
VITE_GLOB_API_URL=/api
VITE_NITRO_MOCK=true
VITE_DEVTOOLS=true
VITE_INJECT_APP_LOADING=true

# .env.production
VITE_BASE=/
VITE_GLOB_API_URL=https://mock-napi.vben.pro/api
VITE_COMPRESS=gzip
VITE_PWA=false
VITE_ROUTER_HISTORY=hash
VITE_ARCHIVER=true
```

## 3.5 偏好设置（Preferences）

项目提供丰富的偏好设置，配置文件位于应用目录下的 `preferences.ts`：

```ts
import { defineOverridesPreferences } from '@vben/preferences';

export const overridesPreferences = defineOverridesPreferences({
  app: {
    accessMode: 'frontend',
    locale: 'zh-CN',
    layout: 'sidebar-nav',
  },
  theme: {
    mode: 'dark',
    colorPrimary: 'hsl(212 100% 45%)',
  },
});
```

> 只需要覆盖需要修改的配置，未覆盖的项会自动使用默认值。更改后请**清空缓存**。

### 主要配置类别

| 类别 | 说明 |
|------|------|
| `app` | 全局配置（权限模式、布局、语言、首页路径等） |
| `breadcrumb` | 面包屑配置 |
| `copyright` | 版权配置 |
| `footer` | 底栏配置 |
| `header` | 顶栏配置 |
| `logo` | Logo 配置 |
| `navigation` | 导航菜单配置（手风琴、切割、风格） |
| `shortcutKeys` | 快捷键配置 |
| `sidebar` | 侧边栏配置（宽度、折叠、隐藏等） |
| `tabbar` | 标签页配置（拖拽、缓存、风格等） |
| `theme` | 主题配置（模式、颜色、圆角等） |
| `transition` | 动画配置（页面切换、进度条等） |
| `widget` | 功能部件（全屏、搜索、锁屏、通知等） |

## 3.6 生产环境动态配置

打包后会在 `dist/_app.config.js` 生成动态配置文件，可通过修改该文件实现**无需重新打包**即可更新接口地址等配置。

使用 `@vben/hooks` 的 `useAppConfig` 获取：

```ts
const { apiURL } = useAppConfig(import.meta.env, import.meta.env.PROD);
```

新增动态配置项步骤：
1. `.env` 中新增 `VITE_GLOB_*` 变量
2. `packages/types/global.d.ts` 中新增类型定义
3. `packages/effects/hooks/src/use-app-config.ts` 中新增配置映射

## 3.7 DevTools

项目内置 Vue DevTools，默认关闭。在 `.env.development` 中开启：

```bash
VITE_DEVTOOLS=true
```

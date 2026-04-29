# ictrekstor NAS 前端原型项目规则

## 项目概述

本项目是基于 [Vben Admin](https://github.com/vbenjs/vue-vben-admin) `5.x` 的**前端原型项目**，用于快速构建 ictrekstor NAS 管理界面的可交互原型。项目采用 Vue 3 + Vite + TypeScript 技术栈，使用 pnpm Monorepo 管理。

**项目目标**：
- 通过 AI 工作流快速创建前端原型界面
- 供实验、评审和交互验证使用
- 为前端部门最终实现提供参考和依据

**重要声明**：本项目代码完全服务于原型目的，最终不会交付生产环境。因此允许存在占位实现、模拟数据、待完善的样式等，但核心交互和页面结构应尽可能清晰可用。

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

## 代码提交规范（Git Commit）

### 提交时机

- **禁止频繁提交未验证的中间状态**：不要在每次文件编辑后都执行 commit，避免 git 历史中出现大量无意义的中间 commit
- **在关键阶段或逻辑单元完成后提交**：一次 commit 应对应一个完整的、可验证的逻辑变更单元（如完成一个页面原型、修复一个独立的交互问题、实现一个完整的功能模块）
- **提交前建议满足的条件**：
  - 代码基本可运行（允许存在类型警告或未使用的变量，但不应导致构建完全失败）
  - 变更符合预期行为
  - 不引入明显的运行时错误
- **Agent 提交约束**：Agent 在完成一个完整的任务单元且确认验证通过后，方可执行 commit；严禁在调试过程中每改一个文件就 commit。若任务未完成但上下文即将耗尽，优先使用 `git stash` 或临时分支保存工作区，而非提交未完成的代码

### 提交信息格式（Conventional Commits）

本项目采用 [Conventional Commits](https://www.conventionalcommits.org/) 规范，commit message 结构如下：

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### 类型（type）

| 类型 | 说明 |
|------|------|
| `feat` | 新功能或新页面原型 |
| `fix` | 缺陷修复或交互问题修复 |
| `docs` | 仅文档变更 |
| `style` | 不影响代码逻辑的格式调整（空格、格式化、分号等） |
| `refactor` | 代码重构（既不修复 bug 也不添加功能） |
| `perf` | 性能优化 |
| `test` | 测试相关（添加、修改测试用例） |
| `chore` | 构建过程、辅助工具、依赖升级等杂项 |
| `build` | 影响构建系统或外部依赖的变更 |
| `ci` | CI/CD 配置或脚本的变更 |

#### 范围（scope）

scope 用于标识变更影响的模块或领域，可选但推荐填写。常见 scope：

| scope | 说明 |
|-------|------|
| `ui` | 通用 UI 组件或样式调整 |
| `page` | 页面级组件（如设备管理、存储池、用户管理等页面） |
| `layout` | 布局相关（侧边栏、顶部导航、整体框架） |
| `router` | 路由配置 |
| `store` | Pinia 状态管理 |
| `api` | API 接口定义或 mock 数据 |
| `hook` | 自定义 Vue 组合式函数 |
| `config` | 项目配置（vite、eslint、tsconfig 等） |
| `deps` | 依赖变更 |

#### 主题（subject）

- 使用**中文**撰写，简明扼要地描述变更内容
- 不超过 50 个字符
- 使用动词开头，如"添加"、"修复"、"重构"、"更新"等
- 句尾不加句号

#### 正文（body）

- 当变更较为复杂或需要额外说明时，在主题后空一行添加正文
- 详细说明变更的背景、动机和实现方式
- 可以包含多行，每行不超过 72 个字符

#### 页脚（footer）

- 用于引用相关 Issue、PR 或 OpenSpec 变更
- 格式：`关联变更: openspec/changes/xxx` 或 `Closes #123`
- 破坏性变更必须以 `BREAKING CHANGE:` 开头说明影响及迁移方式

### 签名要求

- **commit 建议附带签名**：执行 `git commit -s`，在 commit message 末尾自动添加 `Signed-off-by` 行
- 签名格式：`Signed-off-by: 姓名 <邮箱>`
- 原型项目阶段签名非强制，但推荐保持以养成良好的协作习惯

### 提交原子性原则

- **一个 commit 只做一件事**：每个 commit 应该是独立的、完整的逻辑单元
- **禁止将不相关的变更混入同一 commit**：例如，不要在一个 commit 中同时修改路由配置和更新依赖版本
- **大型变更的拆分**：当变更涉及多个独立页面或模块时，应拆分为多个 commit
- **占位实现可入库**：原型阶段允许提交带有 `TODO:`、`FIXME:`、`STUB:`、`PLACEHOLDER:`、`MOCK:` 等标记的占位实现或临时方案，但应在代码注释中说明后续完善方向
- **禁止纯调试性 commit**：禁止将仅用于本地调试、无实际价值且未清理的代码（如临时打印、硬编码路径、测试残留）提交到仓库
- **中间状态保存**：如需保存未完成的实验性工作，优先使用本地分支或 `git stash`，而非直接提交到当前工作分支

### 分支与历史管理

- **Agent 分支操作约束**：Agent 仅在当前分支上工作，**禁止执行任何分支管理或远程操作**，包括但不限于 `branch`、`checkout`、`merge`、`rebase`、`push`、`pull`、`fetch`、`cherry-pick` 等；Agent 仅允许执行本地工作区操作（如 `add`、`commit`、`diff`、`status`、`stash`）。如需切换分支、合并代码或推送到远程，由开发人员手动完成

### 提交前自检清单

执行 `git commit` 前，确认以下事项：

- [ ] 本次变更对应一个完整的逻辑单元，未混入无关修改
- [ ] 代码基本可运行，无明显的运行时错误（允许类型警告和 lint 警告）
- [ ] commit message 符合 Conventional Commits 格式（type、scope、中文 subject）
- [ ] 已清理临时调试代码和无关变更

## OpenSpec 变更管理

- 项目使用 **OpenSpec** 管理变更流程（配置文件：`openspec/config.yaml`）
- 功能开发、页面原型、架构调整建议通过 OpenSpec 流程提案（propose）→ 实现（apply）→ 归档（archive）
- 对于微小的调整（如单个字段修改、样式微调），可直接实施，无需走完整 OpenSpec 流程
- 变更提案存放于 `openspec/changes/`，已完成的变更归档至 `openspec/changes/archive/`
- 规格说明存放于 `openspec/specs/`
- **禁止 Agent 自动对 OpenSpec changes 进行 archive 归档**——归档操作必须由用户手动确认后执行

### OpenSpec 技能使用指引

| 场景 | 技能 | 说明 |
|------|------|------|
| 探索想法、调研问题 | `openspec-explore` | 进入探索模式，梳理思路 |
| 提出新变更 | `openspec-propose` | 一步生成设计、规格和任务 |
| 实施变更任务 | `openspec-apply-change` | 按 OpenSpec 任务逐步实现 |
| 归档已完成变更 | `openspec-archive-change` | 完成后归档，保持仓库整洁 |

## 包管理器规范

本项目为纯前端项目，统一使用 **pnpm** 作为 Node.js 包管理器。

### Node.js 依赖

- 使用 **pnpm** 作为 Node.js 包管理器
- 依赖清单文件为 `package.json`（根目录及各 workspace）
- 新增/变更依赖时，须修改 `package.json`，并通过 `pnpm install` 同步安装
- 模块统一安装于项目根目录 `node_modules/` 下
- lock 文件（`pnpm-lock.yaml`）须随 manifest 变更一并提交，确保构建可复现
- 禁止绕过 `package.json` 直接安装依赖

### 脚本执行规范

- **JS/TS 脚本**：使用 `node` / `npx` / `pnpm` 执行，确保调用的是 `node_modules/` 中安装的依赖
- **开发服务器启动**：`pnpm run dev:antd --port 5666`
- **构建**：`pnpm run build:antd`

## 原型项目特殊规范

### 代码质量容忍度

由于本项目为原型项目，代码质量要求相对生产项目适当放宽：

- **允许存在类型警告**：未使用的变量、any 类型、ts-ignore 等可在原型阶段接受，但应在注释中标注原因
- **允许模拟数据**：页面可使用 mock 数据或硬编码数据展示效果，但应明确标注数据来源
- **允许样式不完善**：布局微调、响应式适配可在后续迭代中完善
- **不允许运行时错误**：页面不应出现白屏、无限加载、明显的 Vue 渲染错误等

### 页面组织规范

- 页面组件存放于 `apps/web-antd/src/views/` 目录下
- 按功能模块划分子目录，如 `device/`、`storage/`、`network/`、`system/` 等
- 页面内部可拆分为 `components/` 子目录存放专用子组件
- 路由配置位于 `apps/web-antd/src/router/routes/modules/`
- API 接口和 mock 数据位于 `apps/web-antd/src/api/`

### 与 Vben 框架的协作

- 优先使用 Vben 提供的内置组件和工具（如 `@vben/common-ui`、`@vben/hooks`）
- 遵循 Vben 的目录结构和编码约定
- 如需自定义通用组件，优先在 `apps/web-antd/src/components/` 下创建
- 样式优先使用 Tailwind CSS 工具类，复杂样式可使用 `<style scoped>`

## Vben Admin 文档使用指引

本项目基于 Vben Admin 5.x 构建，为便于 AI Agent 快速理解和使用框架，已将 Vben 官方文档（`docs/src/`）提炼总结为快速参考手册，存放于 `docs/vben/` 目录下。

### 文档结构

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

### 使用原则

1. **优先查阅总结文档**：遇到 Vben 框架相关问题时，**先阅读 `docs/vben/` 下的提炼文档**，比直接阅读原始文档更高效
2. **索引定位原始文档**：当总结文档不足以解决问题时，通过 `docs/vben/INDEX.md` 快速定位到 `docs/src/` 中原始文档的精确行号
3. **禁止修改原始文档**：`docs/src/` 是 Vben 官方文档源码，**不要修改**；如有补充，在 `docs/vben/` 中新增或更新
4. **关键路径速查**：`docs/vben/README.md` 中列出了开发中最常用的路径和命令，建议作为日常参考

### 何时查阅

| 场景 | 查阅文件 |
|------|----------|
| 不确定路由 Meta 有哪些字段 | `04-routing.md` §4.4 |
| 需要配置按钮级别权限 | `05-access.md` §5.4 |
| 想修改主题色或布局模式 | `06-theme-style.md` §6.1、`03-development.md` §3.5 |
| 需要添加新的 Iconify 图标 | `06-theme-style.md` §6.3 |
| 接口请求需要自定义拦截器 | `07-server.md` §7.3 |
| Mock 数据不生效 | `07-server.md` §7.5 |
| 想了解完整的偏好设置选项 | `INDEX.md` → 配置系统（含 settings.md 行号映射） |

## 请求人介入规范

当 Agent 在任务执行过程中遇到以下情况之一时，应主动请求人介入，而非在低效的试错循环中继续消耗上下文和 token：

### 触发条件

1. **知识范围超限**：问题涉及 Vben 框架内部机制、Ant Design Vue 特定行为等，Agent 需要外部文档或源码才能确保方案正确性
2. **多次尝试未解决**：同一问题尝试了 3 次以上仍未解决，且每次尝试的方案逐渐偏离原设计
3. **设计约束风险**：为解决问题而采用的方案可能破坏已有的页面结构或设计决策
4. **复杂度爆炸**：问题的根因涉及前端构建工具链深层配置（如 Vite 插件、Turbo 缓存、Monorepo 依赖解析）
5. **上下文耗尽**：继续调试将耗尽可用的上下文窗口，导致信息丢失和重复劳动

### 介入请求格式

请求人介入时，Agent 必须：

1. **更新状态文件**：将当前状态写入 `.clinerules/memory/current-task.md`，确保后续可恢复
2. **概述问题**：用 2-3 句话描述核心问题现象
3. **分析根因**：列出已确认的根因和待验证的假设
4. **总结已尝试方案**：以表格形式列出每次尝试的修改、预期效果、实际结果
5. **提出后续建议**：给出 2-3 个可能的后续方向
6. **提供调试环境信息**：如需特定环境，给出搭建该环境的关键指令
7. **提供参考资料**：列出相关的日志文件路径、源码引用、文档链接

### 示例请求格式

```
【请求人介入】Vite 构建时 Ant Design Vue 组件样式丢失

## 问题概述
开发环境页面正常显示，但执行 `pnpm run build:antd` 后，部分 Ant Design Vue
组件（如 Table、Modal）的样式丢失，页面布局错乱。

## 根因分析
- 已确认：开发环境无此问题，仅生产构建受影响
- 待验证：Vite 的 `vite-plugin-style-import` 或 `unplugin-vue-components` 配置是否正确引入样式
- 待验证：是否存在样式文件被 Tree Shaking 误移除

## 已尝试方案
| 尝试 | 修改 | 预期 | 结果 |
|------|------|------|------|
| #1 | 手动在 main.ts 中全量引入 antd 样式 | 确保样式加载 | 构建成功但包体积过大，且不符合按需加载设计 |
| #2 | 修改 vite.config.ts 中组件解析配置 | 修复按需引入 | 部分组件恢复，Table 仍丢失样式 |
| #3 | 检查组件导入路径 | 确认使用正确导入 | 路径正确，问题未解决 |

## 后续建议
1. 检查 Vben 框架内置的 vite 配置中关于 antd 样式的处理逻辑
2. 对比 Vben 官方示例项目的 vite 配置差异
3. 考虑在原型阶段临时使用全量样式引入，后续再优化按需加载

## 调试环境
```bash
# 本地构建并预览
pnpm run build:antd
pnpm run preview
# 检查构建产物中的 css 文件
ls -la apps/web-antd/dist/assets/
```

## 参考资料
- 构建日志：apps/web-antd/dist/build.log
- Vite 配置：apps/web-antd/vite.config.mts
- 当前任务状态：.clinerules/memory/current-task.md

---

## 大输出命令处理规范

执行可能产生大量输出的命令（如 `pnpm run build:antd`、`pnpm install`、大型依赖安装等）时，必须遵循以下规范：

- **必须将输出重定向到临时文件**：使用 `tee` 将命令的标准输出和标准错误同时写入文件，便于后续排查
- **必须限制终端的输出量**：在命令末尾通过 `tail -n <行数>` 仅显示最后的关键结果（如错误信息、构建摘要）
- **标准格式**：
  ```bash
  <command> 2>&1 | tee /tmp/<描述性名称>.log | tail -n 100
  ```
  其中：
  - `/tmp/<描述性名称>.log`：完整日志文件，用于后续排查
  - `tail -n 100`：仅显示最后 100 行，避免冲爆上下文
- **例外情况**：命令输出本身很少（<50行）时可不使用此规范
- **日志文件清理**：构建成功后，可删除临时日志文件释放磁盘空间

## Subagent 并行执行

- 本项目所使用的 Agent 支持 **subagents** 机制，可用于并行执行独立的探索或实现任务
- 当需要同时读取多个文件、调研多个模块、或执行互不依赖的构建步骤时，**优先使用 subagents 并行处理**
- 典型场景：
  - 同时探索 `apps/web-antd/src/views/` 下多个页面模块的结构和逻辑
  - 并行调研不同功能模块（如设备管理、存储池、网络配置）的页面实现方案
  - 同时检查多个 API 接口定义和对应 mock 数据的一致性
- 使用原则：
  - subagents 应该优先用于处理代码分析、探索、总结等任务，不要用于执行读取文件等简单任务
  - 每个子任务保持聚焦，返回结构化的调研结果
  - 子任务数量建议不超过 5 个
  - 有依赖关系的任务必须串行执行，不可并行

## CONTEXT/MEMORY 机制（长程任务稳定性保障）

### 问题背景

在长程任务（如跨多文件的页面重构、多阶段原型实现）中，Agent 的上下文窗口可能被压缩或丢失关键信息，导致任务中断、重复工作或遗漏步骤。需要一个持久化的 CONTEXT/MEMORY 机制，将任务状态和后续规划实时记录到本地文件中，确保上下文压缩后能从本地文件恢复，保证长程任务的连续性和稳定性。

### 机制设计

#### 1. 记忆文件位置与结构

```
.clinerules/
├── project.md              # 项目规则（本文件）
└── memory/
    ├── current-task.md     # 当前活跃任务的上下文与进度
    ├── task-history.md     # 已完成任务的历史摘要
    └── decisions.md        # 架构决策记录（ADR 摘要）
```

- **`current-task.md`**：核心记忆文件，记录当前正在执行的任务的所有关键信息
- **`task-history.md`**：已完成任务的简要记录，避免重复劳动
- **`decisions.md`**：重要的架构和技术决策记录，供后续任务参考

#### 2. `current-task.md` 格式规范

```markdown
# 当前任务：[任务名称]

## 任务来源
- 触发方式：用户指令 / OpenSpec 变更 / Bug 修复
- 关联变更：openspec/changes/xxx（如有）

## 目标与范围
- [ ] 目标1
- [ ] 目标2
- ...

## 当前进度
- [x] 已完成步骤1
- [x] 已完成步骤2
- [ ] 当前步骤3 ← 正在进行
- [ ] 待执行步骤4

## 关键上下文
- 已读取的关键文件：file1, file2, ...
- 已确认的依赖关系：...
- 已排除的方案：...
- 风险与注意事项：...

## 待解决问题
- [ ] 问题1：描述及当前分析
- [ ] 问题2：描述及当前分析

## 后续规划
1. 下一步行动
2. 再下一步行动
3. ...

## 上下文恢复检查点
- 最后修改的文件：...
- 最后执行的命令：...
- 最后确认的状态：...
```

#### 3. 操作规则

**写入时机（必须遵守）：**

1. **任务启动时**：创建或重置 `current-task.md`，写入任务目标、范围和初始规划
2. **每完成一个关键步骤后**：更新进度清单，标记已完成项，标注当前步骤
3. **遇到阻塞或需要决策时**：记录待解决问题和当前分析
4. **任务完成时**：将任务摘要追加到 `task-history.md`，清除 `current-task.md`
5. **做出重要技术决策时**：同步更新 `decisions.md`

**恢复时机（必须遵守）：**

1. **每次新会话开始时**：首先读取 `current-task.md`，判断是否有未完成任务
2. **上下文被压缩后**：主动读取 `current-task.md` 恢复任务状态
3. **用户提出新任务时**：检查 `current-task.md`，确认是否有任务冲突或需要先完成当前任务

**关键原则：**

- `current-task.md` 是**事实来源（Single Source of Truth）**，任何时刻都应反映任务的真实状态
- 写入操作要**原子化**——每次更新只修改必要的部分，不重写整个文件
- 进度清单使用 Markdown checkbox 格式（`- [x]` / `- [ ]`），便于人类和 Agent 共同阅读
- **不要删除历史记录**——`task-history.md` 和 `decisions.md` 只追加，不删除

#### 4. 上下文恢复流程

```
新会话/上下文压缩
       │
       ▼
读取 .clinerules/memory/current-task.md
       │
       ├── 文件不存在或为空 → 无活跃任务，正常响应新请求
       │
       └── 文件存在且有内容
              │
              ▼
         解析任务状态
              │
              ├── 有未完成任务 → 向用户确认：继续上次任务 / 暂停并开始新任务
              │
              └── 任务已完成但未归档 → 执行归档（更新 task-history.md，清除 current-task.md）
```

#### 5. 与 OpenSpec 的集成

- OpenSpec 变更实施（apply-change）过程中，`current-task.md`的"关联变更"字段自动关联对应的 OpenSpec change 目录
- 变更中的每个 task 完成后，同步更新 `current-task.md` 的进度清单
- 变更归档（archive-change）时，自动将决策记录写入 `decisions.md`

## 工具使用规范

### Git 命令分页处理

使用 `git log`、`git status`、`git diff` 等命令时，可能会由于分页（pager）导致命令阻塞，等待用户交互。为避免此问题，需遵循以下规范：

- **禁用分页**：通过 `--no-pager` 参数直接禁用分页，例如 `git --no-pager log --oneline`
- **或使用管道输出**：将输出通过管道传递给 `cat`、`head`、`tail`、`grep` 等命令，可自动绕过 pager，例如 `git log --oneline | cat`
- **禁止使用 `--decorate`**：该选项在某些 Git 版本下可能触发 pager，避免使用
- 推荐在脚本和自动化流程中始终使用 `--no-pager`，确保命令不会阻塞

### Chrome DevTools MCP 截图路径规范

Chrome DevTools MCP 的 `take_screenshot` 工具的 `filePath` 参数默认解析路径相对于 MCP server 的启动路径，而非当前项目路径。如果不指定绝对路径，截图将被保存到项目外部的不可预期位置。

- **必须提供绝对路径**：`filePath` 应使用项目绝对路径，例如 `d:/Projects/ictrekstor-nas-prototype/screenshots/page.png`
- **或不指定 filePath**：如果不传 `filePath`，MCP 会直接在响应中返回图片数据（base64），由调用方处理保存
- **禁止传递相对路径**：如 `./screenshots/page.png` 或 `screenshots/page.png` 等相对路径会导致截图保存在项目外

# Agent 工作规范

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
```

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
  - **绝对不要让 subagents 去修改代码 ！！！** subagent 没有直接修改代码的能力，只能通过第三方命令来修改文件，会导致 **严重问题** ！！！

## 工具使用规范

### Chrome DevTools MCP 截图路径规范

Chrome DevTools MCP 的 `take_screenshot` 工具的 `filePath` 参数默认解析路径相对于 MCP server 的启动路径，而非当前项目路径。如果不指定绝对路径，截图将被保存到项目外部的不可预期位置。

- **必须提供绝对路径**：`filePath` 应使用项目绝对路径，例如 `d:/Projects/ictrekstor-nas-prototype/screenshots/page.png`
- **或不指定 filePath**：如果不传 `filePath`，MCP 会直接在响应中返回图片数据（base64），由调用方处理保存
- **禁止传递相对路径**：如 `./screenshots/page.png` 或 `screenshots/page.png` 等相对路径会导致截图保存在项目外

### 截图文件的读取与多模态分析

截图被保存到本地后，Agent 可以直接使用 `read_file` 工具读取该图片文件，模型会以多模态格式接收并解析图片内容。这意味着：

- **截图后可直接分析**：执行 `take_screenshot` 保存到本地后，使用 `read_file` 传入截图的绝对路径即可触发模型的图像理解能力
- **无需额外转换**：`read_file` 会自动将图片以多模态格式（如 base64 嵌入）发送给模型，Agent 无需手动处理图片编码
- **适用场景**：页面视觉验证、UI 走查、截图内容描述、图表数据分析等需要"看图说话"的任务

示例流程：
```
1. take_screenshot(filePath="d:/Projects/ictrekstor-nas-prototype/screenshots/page.png")
2. read_file(path="d:/Projects/ictrekstor-nas-prototype/screenshots/page.png")
3. 模型返回对截图内容的视觉描述和分析
```

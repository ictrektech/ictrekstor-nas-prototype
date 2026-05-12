# 当前任务：Vue 大型单体组件分拆重构

## 任务来源
- 触发方式：用户指令
- 关联变更：openspec/changes/vue-component-split/

## 目标与范围
- [x] 制定 Vue 组件分拆规则约束，写入 .clinerules/project.md
- [x] 扫描代码库识别大型 Vue 单体文件
- [x] 使用 OpenSpec 管理变更提案
- [x] 制定详细的分拆计划（含文件、组件、目录结构）
- [x] 根据用户反馈，补充每个 Task/Phase 的 build+验证+提交流程
- [x] 在 design.md 中补充实施约束（纯重构原则、样式迁移、验证规范）
- [ ] 等待用户最终检查确认
- [ ] 按确认的方案逐步实施分拆

## 当前进度
- OpenSpec 文档已全部创建并更新完毕，包含：
  - proposal.md：变更提案（背景、目标、范围、验收标准）
  - design.md：分拆设计方案（4模块、20文件、61新组件）+ **实施约束规范**
  - tasks.md：26个任务分5阶段 + **每个Task的强制验证提交流程**
- .clinerules/project.md 已新增「Vue 组件分拆规范」章节
- 等待用户审查通过后开始实施

## 用户补充要求（已落实）

| 要求 | 落实位置 |
|------|---------|
| 每个关键阶段 build 通过 | tasks.md §「关键阶段验证与提交规范」 |
| 浏览器 MCP 截图确认 | tasks.md § 每个 Task 完成后的浏览器验证步骤 |
| 效果不变，纯代码位置移动 | design.md §「实施约束与规范」- 纯重构原则 |
| 代码提交后再进入下一阶段 | tasks.md § 提交后方可进入下一个 Task |
| 随时更新 memory | current-task.md（本文件）实时更新 |

## 后续规划
1. 用户审查通过后，按 Phase 0 → Phase 1 → ... 逐步实施
2. 每完成一个 Task：`build` → `截图验证` → `git commit`
3. 每完成一个 Phase：全页面走查 → 截图存档 → Phase 提交
4. 全部完成后最终验证和归档

## 上下文恢复检查点
- 最后修改的文件：openspec/changes/vue-component-split/design.md
- 最后确认的状态：OpenSpec 文档已按用户要求补充验证/提交/约束规范，等待用户检查
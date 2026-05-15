# OpenSpec 变更管理

- 项目使用 **OpenSpec** 管理变更流程（配置文件：`openspec/config.yaml`）
- 功能开发、页面原型、架构调整建议通过 OpenSpec 流程提案（propose）→ 实现（apply）→ 归档（archive）
- 对于微小的调整（如单个字段修改、样式微调），可直接实施，无需走完整 OpenSpec 流程
- 变更提案存放于 `openspec/changes/`，已完成的变更归档至 `openspec/changes/archive/`
- 规格说明存放于 `openspec/specs/`
- **禁止 Agent 自动对 OpenSpec changes 进行 archive 归档**——归档操作必须由用户手动确认后执行

## OpenSpec 技能使用指引

| 场景 | 技能 | 说明 |
|------|------|------|
| 探索想法、调研问题 | `openspec-explore` | 进入探索模式，梳理思路 |
| 提出新变更 | `openspec-propose` | 一步生成设计、规格和任务 |
| 实施变更任务 | `openspec-apply-change` | 按 OpenSpec 任务逐步实现 |
| 归档已完成变更 | `openspec-archive-change` | 完成后归档，保持仓库整洁 |

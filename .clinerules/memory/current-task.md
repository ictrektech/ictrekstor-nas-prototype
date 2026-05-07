# 当前任务：存储页面视觉优化

## 任务来源
- 触发方式：用户指令
- 关联变更：openspec/changes/storage-ui-optimization

## 目标与范围
- [x] 了解项目背景和存储页面现状
- [x] 查看浏览器中当前页面的实际效果
- [x] 读取现有 OpenSpec 模板和代码
- [x] 创建 OpenSpec 变更文档
- [ ] 等待用户检查确认
- [ ] 按 OpenSpec 任务逐步实施优化

## 关键上下文
- **技术栈**：Vue 3 + Vite + TypeScript + Ant Design Vue + Vben Admin 5.x + Tailwind CSS
- **存储页面位置**：`apps/web-antd/src/views/storage/`
- **OpenSpec 变更目录**：`openspec/changes/storage-ui-optimization/`

## OpenSpec 文档结构

| 文件 | 说明 |
|------|------|
| `.openspec.yaml` | 变更元数据（schema: spec-driven, created: 2026-05-07） |
| `proposal.md` | 变更提案：Why / What Changes / Capabilities / Impact |
| `design.md` | 设计文档：Context / Goals&Non-Goals / 7项设计决策 / Risks / Open Questions |
| `tasks.md` | 任务清单：9大阶段、40+具体任务 |

## 变更核心内容概要

### 4个已有页面视觉升级
1. **硬盘管理页**：emoji图标→Iconify专业图标、卡片头部渐变背景、复合卡片布局、分区信息卡片化、悬浮动效
2. **存储池列表页**：顶部统计概览卡片、表格行悬浮高亮、状态彩色徽章、容量迷你进度条
3. **存储空间管理页**：标题栏渐变底色、分段颜色进度条、硬盘芯片标签组美化
4. **设备全部文件页**：渐变圆形图标背景、悬浮放大效果、统一进度条

### 3个404页面补全
5. **存储池详情页**：修复路由、监控图表、容量/硬盘/日志Tab、Mock数据
6. **团队文件管理页**：基础列表框架、Mock数据
7. **公共目录页**：基础卡片框架、Mock数据

### 统一风格
- 状态色彩语义化（正常=蓝/绿、警告=橙、危险=红、未使用=灰）
- 卡片悬浮动效统一（translateY抬升+阴影加深+边框高亮）
- Iconify图标统一替换emoji

## 后续规划
等待用户检查 OpenSpec 文档后，按 tasks.md 任务清单逐步实施优化。

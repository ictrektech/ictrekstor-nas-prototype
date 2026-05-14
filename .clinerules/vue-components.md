# Vue 组件分拆规范

## 制定目的

本项目存在大量超大型 Vue 单体文件（部分超过 1500 行），导致：
- AI 修改时代码上下文冗余，无关代码干扰理解
- 组件职责混杂，难以复用和单测
- 多人协作时频繁冲突

本规范强制约束 Vue 单文件组件（SFC）的粒度与组织方式，确保每个组件目的单一、边界清晰。

## 1. 文件行数硬约束

| 组件类型 | 建议上限 | 强制上限 |
|---------|---------|---------|
| 基础/纯展示组件 | 150 行 | 500 行 |
| 复合/区块组件 | 250 行 | 550 行 |
| 页面级组件（index.vue） | 400 行 | 800 行 |

原则上**超出强制上限的文件必须拆分**，但是对于内聚程度很高的文件，如果评估拆分收益小于保持单个大文件的收益，则不需要进行拆分。

## 2. 单一职责原则（SRP）

一个 Vue 组件只负责**一个独立的功能单元**。以下情况必须拆分为独立子组件：

1. **模板中存在多个独立视觉区块**（如：表格区域 + 配置弹窗 + 图表区域）
2. **script 中存在多个独立逻辑模块**（如：数据加载逻辑 + 图表绘制逻辑 + 表单校验逻辑）
3. **同一段模板/逻辑在多处复用**（如：不同页面使用相同的文件列表视图）
4. **条件渲染的复杂子树**（如：`v-if="viewMode==='list'"` 和 `v-if="viewMode==='grid'"` 各超过 50 行）

## 3. 组件分类与目录组织

```
apps/web-antd/src/
├── views/                    # 页面级组件（仅路由入口）
│   ├── storage/
│   │   ├── index.vue         # 列表页（< 500行）
│   │   ├── detail.vue        # 详情页（< 500行）
│   │   └── components/       # 页面专用子组件
│   │       ├── StorageCard.vue
│   │       └── StorageChart.vue
├── components/               # 全局/跨页面复用组件
│   ├── FileExplorer/
│   │   ├── FileTreePanel.vue
│   │   ├── FileManagerPanel.vue
│   │   └── components/       # 组件内部再拆分
│   │       └── TreeNode.vue
```

**目录规则**：
- 页面内部子组件必须放在 `views/<module>/components/` 下
- 跨页面复用组件必须放在 `src/components/` 下
- 子组件目录层级不超过 2 层（即 `components/components/` 为最大深度）
- 组件文件采用 PascalCase 命名（如 `DiskCard.vue`）

## 4. Props / Emits 显式契约

子组件必须通过 `defineProps` / `defineEmits` 声明接口，**禁止通过 `$parent` 或隐式依赖访问父组件状态**。

```vue
<!-- ✅ 正确：显式传递 -->
<DiskCard
  v-for="disk in disks"
  :key="disk.id"
  :disk="disk"
  @locate="handleLocate"
  @sleep="handleSleep"
/>

<!-- ❌ 错误：隐式依赖父组件变量 -->
<DiskCard v-for="disk in disks" :key="disk.id" />
<!-- DiskCard 内部直接访问父级的 disks / currentDisk -->
```

## 5. 状态提升与组合式函数

- **跨组件共享的状态**使用 Pinia Store 或提升到共同父组件
- **可复用的逻辑块**（如：拖拽调整大小、图表数据生成、格式化工具）提取为组合式函数（`composables/`）或纯工具函数（`utils/`）
- 禁止在子组件中直接调用 API，数据由父组件注入或通过 Store 获取

## 6. 弹窗/抽屉类组件强制外置

所有 `Modal`、`Drawer` 级组件必须独立为 `.vue` 文件，**禁止内联在页面模板中**。

```vue
<!-- ✅ 正确 -->
<template>
  <div>...</div>
  <RenameModal v-model:visible="renameVisible" :file="editingFile" @ok="handleRename" />
</template>

<!-- ❌ 错误：Modal 模板内联在页面中超过 100 行 -->
```

## 7. 图表/可视化组件独立封装

任何使用 ECharts、SVG 手绘图表、Canvas 的代码必须封装为独立组件，隔离图表配置与页面业务逻辑。

## 8. 校验清单

新建或重构组件前，自检以下问题：

- [ ] 该文件是否超过对应类型的行数上限？
- [ ] template 中是否有超过 2 个独立的视觉区块？
- [ ] script 中是否有超过 2 个独立的逻辑关注点？
- [ ] 是否有内联的 Modal / Drawer 超过 50 行？
- [ ] 是否有可在其他页面复用的 UI 片段？
- [ ] 是否有纯工具函数可提取到 `composables/` 或 `utils/`？

**任意一项为"是"，则必须拆分。**

## 9. Agent 执行规范

- Agent 读取代码时，若发现目标文件超过 500 行，**优先读取并修改拆分后的子组件**，而非直接修改巨型单体文件
- Agent 实施功能变更时，若需在超大型文件中添加新代码，**必须先建议拆分方案**，经用户确认后实施
- 禁止在已有拆分能力的场景下，继续向单体文件中追加代码

# 当前任务：优化"我的分享"创建分享弹窗 + 复用组件替换两个入口

## 任务来源
- 触发方式：用户指令
- 需求：
  1. "我的分享"页面中"创建共享"按钮改为"创建分享"
  2. 去掉共享名称输入，以选中文件夹名称作为共享名称
  3. 优化弹窗布局，减少纵向空间，更现代美观
  4. 外链支持自定义有效期（非仅预设）

## 当前进度

### ✅ 已完成
1. **创建复用组件** `apps/web-antd/src/components/ShareConfigModal/index.vue`
2. **`shared-files/index.vue` 已替换完成**（带目录树选择的创建分享入口）
3. **`my-files/index.vue` 已替换完成**（选中文件夹后分享的入口一）

### ✅ 验证中
- 两个入口均使用 ShareConfigModal 复用组件
- 弹窗包含：选中文件夹信息卡片、共享用户（带独立权限）、有效期（预设/自定义/永久）、外链（预设/自定义/永久 + 密码）

## 关键文件

| 文件 | 状态 | 说明 |
|------|------|------|
| `apps/web-antd/src/components/ShareConfigModal/index.vue` | ✅ 完成 | 复用组件 |
| `apps/web-antd/src/views/file/shared-files/index.vue` | ✅ 完成 | 已使用组件 |
| `apps/web-antd/src/views/file/my-files/index.vue` | ✅ 完成 | 已使用组件 |

## 后续规划
1. 截图验证 my-files 入口的分享弹窗
2. 截图验证 shared-files 入口的分享弹窗
3. 确认无误后建议用户提交代码
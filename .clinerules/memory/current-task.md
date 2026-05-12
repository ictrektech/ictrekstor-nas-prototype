# 当前任务：优化分享逻辑

## 任务来源
- 触发方式：用户指令

## 目标与范围
- [x] 入口一（我的文件-选中文件夹-分享）：优化分享弹窗
  - [x] 支持选择分享时间（含自定义时间）
  - [x] 支持选择用户
  - [x] 支持选择权限（只读、读写）
  - [x] 支持启用外链
  - [x] 支持设置外链有效时间
- [x] 入口二（我的分享-创建分享）：优化创建分享弹窗
  - [x] 包含目录管理树状视图
  - [x] 展示"我的文件"及其子目录
  - [x] 用户选择要分享的目录
  - [x] 其余字段与入口一保持一致

## 关键上下文
- my-files/index.vue：新增分享弹窗（共享用户Select、有效期预设/自定义Radio+DatePicker、权限Radio只读/读写、外链Checkbox+有效期+密码）
- shared-files/index.vue：新增创建分享弹窗（目录树Tree选择"我的文件"、共享用户、有效期预设/自定义、权限、外链），替换原有Select下拉选择为树状视图

## 实施文件
- apps/web-antd/src/views/file/my-files/index.vue
- apps/web-antd/src/views/file/shared-files/index.vue

## 上下文恢复检查点
- 最后修改的文件：apps/web-antd/src/views/file/shared-files/index.vue
- 当前确认的状态：两个入口的分享弹窗均已优化完成

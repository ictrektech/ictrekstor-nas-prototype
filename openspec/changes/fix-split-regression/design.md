# 修复方案设计

## 总体策略

以原始项目（`D:\Projects\ictrekstor-nas-prototype-ori`）代码为基准，将当前项目中被错误修改或丢失的代码恢复，同时尽量保持组件分拆后的文件结构。

修复原则：
- **最小侵入**：只修复差异部分，不重构其他代码
- **保持拆分**：尽量在现有子组件中修复，不将代码重新内联回大文件
- **数据优先**：mock 数据不完整是主要根因，优先恢复数据

---

## 1. 文件管理 - 我的文件

### 差异根因
原始 my-files/index.vue 有 1234 行，当前仅 451 行。原始文件中 FileManagerPanel 的使用方式是定制化内联，而分拆后替换为了通用组件 `FileManagerPanel`，导致：
- 面包屑样式从分段可点击变为纯文本（`FileToolbar` 组件渲染方式不同）
- 新增了"操作"列（通用组件添加了操作按钮）
- 底部树状视图（可能是 `FileTreePanel` 或其他组件的副作用）

### 修复方案
**方案 A（推荐）**：从原始 my-files/index.vue 中提取完整的 template 和 style 部分，保留当前 script 的组件引用结构，将 FileManagerPanel 的定制化 props/样式恢复。

具体步骤：
1. 对比原始 `my-files/index.vue` 的 template 和当前版本的差异
2. 检查 `FileManagerPanel` / `FileToolbar` / `FileListView` 通用组件是否有可配置项关闭操作列和树状视图
3. 如通用组件不支持，则直接在 `my-files/index.vue` 中恢复原始的文件列表渲染 template（而非使用通用组件）
4. 移除底部意外的树状视图元素

### 涉及文件
- `apps/web-antd/src/views/file/my-files/index.vue`
- `apps/web-antd/src/components/FileExplorer/FileManagerPanel.vue`
- `apps/web-antd/src/components/FileExplorer/components/FileToolbar.vue`
- `apps/web-antd/src/components/FileExplorer/components/FileListView.vue`

---

## 2. 文件管理 - 网络访问

### 差异根因
原始 network/index.vue 有 1132 行，当前仅 305 行。mock 数据提取到 `components/mockData.ts` 和 `components/columns.ts` 后，协议数据和渲染逻辑大量丢失：
- 5 个协议（SMB/CIFS、NFS、WebDAV、FTP、AFP）变成 5 个错误协议（SMB/CIFS、AFP、FTP、FTP、WebDAV、WebDAV）
- 图标颜色（蓝色/紫色/橙色等）丢失
- 配置信息内容变化

### 修复方案
从原始 `network/index.vue` 中恢复：
1. 正确的 `protocols` mock 数据数组（含图标、颜色、配置信息）
2. 正确的协议卡片 template 渲染逻辑
3. 正确的样式类名（`.protocol-card` 等）

### 涉及文件
- `apps/web-antd/src/views/file/network/index.vue`
- `apps/web-antd/src/views/file/network/components/mockData.ts`
- `apps/web-antd/src/views/file/network/components/columns.ts`

---

## 3. 系统设置 - 设备管理

### 差异根因
- 前面板示意图消失：DeviceDiagram 组件渲染问题或 index.vue 中未正确引用
- CPU/内存卡片样式变化：index.vue 中卡片模板或样式被修改
- 硬盘状态"未知"：mock 数据中的状态字段丢失

### 修复方案
1. 对比 `system/device/index.vue` 的原始版本和当前版本
2. 检查 DeviceDiagram 组件的引用和 props 是否正确
3. 恢复 CPU/内存卡片的原始 template 和样式
4. 恢复硬盘 mock 数据中的状态字段

### 涉及文件
- `apps/web-antd/src/views/system/device/index.vue`
- `apps/web-antd/src/views/system/device/components/DeviceDiagram.vue`

---

## 4. 系统设置 - 存储空间管理

### 差异根因
页面完全空白，可能是 index.vue 在分拆过程中被完全清空。

### 修复方案
直接从原始项目复制 `system/volumes/index.vue` 的完整内容到当前项目。

### 涉及文件
- `apps/web-antd/src/views/system/volumes/index.vue`

---

## 5. 公共文件管理

### 差异根因
与"我的文件"类似，使用了通用 FileManagerPanel 组件替代了原始定制化实现：
- 面包屑纯文本化
- 缺少"操作"列

### 修复方案
与"我的文件"类似，恢复原始 template 中文件列表的定制化渲染。

### 涉及文件
- `apps/web-antd/src/views/system/public-files/index.vue`

---

## 验证计划

每修复一个页面后立即：
1. 保存代码，等待热加载
2. 截图当前页面（5666）
3. 与原始页面（5888）对比
4. 确认无可见差异后标记完成
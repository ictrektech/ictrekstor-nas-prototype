# 当前任务：修复 Vue 组件分拆后的页面差异 — 我的文件

## 任务来源
- 触发方式：用户指令
- 关联变更：openspec/changes/fix-split-regression/

## 目标与范围
- [x] 截图对比分拆前后页面差异（localhost:5888 vs localhost:5666）
- [ ] 修复：文件管理 - 我的文件（布局风格恢复 + 清理底部树状视图）
- [ ] 修复：文件管理 - 网络访问（卡片颜色、内容）
- [ ] 修复：系统设置 - 设备管理（设备示意图、CPU、内存卡片）
- [ ] 修复：系统设置 - 存储空间管理（页面为空）
- [ ] 修复：公共文件管理（页面为空）
- [ ] 验证修复效果

## 当前进度
- [x] 截图对比完成：确认 5 处差异
- [ ] 正在修复：我的文件页面

## 关键发现 — 我的文件页面差异

### 差异1：FileManagerPanel 面包屑样式丢失
- 原版本：渐变背景 `#f6f8fb` → `#f0f3f8`、圆角药丸形(20px)、蓝色链接+hover背景
- 当前版本：纯文本、无背景、简单下划线hover

### 差异2：FileManagerPanel 工具栏样式简化
- 原版本：白色背景、精细padding、Radio.Button有专门padding
- 当前版本：#fafafa背景、简化样式

### 差异3：表格样式丢失
- 原版本：表头 `#fafafa` 背景、字体600、padding精细、hover效果、选中行 `#e6f4ff`
- 当前版本：无自定义表头样式、行hover缺失、复选框尺寸不对(16px vs 18px)

### 差异4：操作列完全消失
- 原版本：每行有操作下拉菜单（复制/移动/删除等）
- 当前版本：FileListView.vue 无操作列

### 差异5：底部出现意外树状导航
- 当前版本底部出现"我的文件/公共文件/他人分享"垂直导航
- 来源待定位

## 已确认的关键文件

| 文件 | 说明 |
|------|------|
| `apps/web-antd/src/components/FileExplorer/FileManagerPanel.vue` | 当前版本（198行，外壳组件） |
| `apps/web-antd/src/components/FileExplorer/components/FileToolbar.vue` | 拆分后的工具栏（211行，样式简化） |
| `apps/web-antd/src/components/FileExplorer/components/FileListView.vue` | 拆分后的列表视图（144行，缺少操作列和样式） |
| `apps/web-antd/src/views/file/my-files/index.vue` | 当前页面（451行） |

## 修复方案
1. 恢复 FileToolbar.vue 的面包屑和工具栏样式（参考原始 FileManagerPanel.vue 的样式）
2. 恢复 FileListView.vue 的表格样式+操作列
3. 使用 Chrome DevTools 定位并移除底部意外树状视图
4. 截图验证修复效果

## 上下文恢复检查点
- 最后修改的文件：无（分析阶段）
- 最后执行的命令：截图对比
- 最后确认的状态：差异根源已定位，准备实施修复
# 原型项目特殊规范

## 代码质量容忍度

由于本项目为原型项目，代码质量要求相对生产项目适当放宽：

- **允许存在类型警告**：未使用的变量、any 类型、ts-ignore 等可在原型阶段接受，但应在注释中标注原因
- **允许模拟数据**：页面可使用 mock 数据或硬编码数据展示效果，但应明确标注数据来源
- **允许样式不完善**：布局微调、响应式适配可在后续迭代中完善
- **不允许运行时错误**：页面不应出现白屏、无限加载、明显的 Vue 渲染错误等

## 页面组织规范

- 页面组件存放于 `apps/web-antd/src/views/` 目录下
- 按功能模块划分子目录，如 `device/`、`storage/`、`network/`、`system/` 等
- 页面内部可拆分为 `components/` 子目录存放专用子组件
- 路由配置位于 `apps/web-antd/src/router/routes/modules/`
- API 接口和 mock 数据位于 `apps/web-antd/src/api/`

## 与 Vben 框架的协作

- 优先使用 Vben 提供的内置组件和工具（如 `@vben/common-ui`、`@vben/hooks`）
- 遵循 Vben 的目录结构和编码约定
- 如需自定义通用组件，优先在 `apps/web-antd/src/components/` 下创建
- 样式优先使用 Tailwind CSS 工具类，复杂样式可使用 `<style scoped>`

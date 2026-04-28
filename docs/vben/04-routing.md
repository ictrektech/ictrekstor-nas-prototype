# 04 路由与菜单

> 源文件：`docs/src/guide/essentials/route.md`（644 行）

---

## 4.1 路由类型

Vben 框架根据路由文件**自动生成对应的菜单结构**。路由分为三类：

| 类型 | 位置 | 说明 |
|------|------|------|
| **核心路由** | `src/router/routes/core/` | 框架内置（根路由、登录、404），不建议放置业务路由 |
| **静态路由** | `src/router/routes/index/` | 项目启动时已确定，通过 `import.meta.glob('./static/**/*.ts')` 加载 |
| **动态路由** | `src/router/routes/modules/` | 用户登录后根据权限动态生成 |

## 4.2 路由定义格式

与 Vue Router 配置格式一致，支持二级和多级嵌套：

```ts
import type { RouteRecordRaw } from 'vue-router';
import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'mdi:home',
      title: $t('page.home.title'),
      order: 1000,
    },
    name: 'Home',
    path: '/home',
    redirect: '/home/index',
    children: [
      {
        name: 'HomeIndex',
        path: '/home/index',
        component: () => import('#/views/home/index.vue'),
        meta: {
          icon: 'mdi:home',
          title: $t('page.home.index'),
        },
      },
    ],
  },
];

export default routes;
```

## 4.3 新增页面流程

1. **添加路由**：在 `src/router/routes/modules/` 下创建/编辑路由文件
2. **添加页面组件**：在 `src/views/` 下创建对应的 `.vue` 文件
3. **验证**：访问对应路径即可查看页面

## 4.4 路由 Meta 配置

```ts
interface RouteMeta {
  title: string;                    // 页面标题（菜单/标签页显示）
  icon?: string;                    // 图标（支持 Iconify 或 http 图片链接）
  activeIcon?: string;              // 激活图标
  activePath?: string;              // 强制激活的父级菜单路径
  keepAlive?: boolean;              // 是否开启缓存（标签页启用时有效）
  order?: number;                   // 一级菜单排序（升序）
  authority?: string[];             // 权限角色，不配置则无需权限
  affixTab?: boolean;               // 固定标签页（不可关闭）
  affixTabOrder?: number;           // 固定标签页排序
  hideInMenu?: boolean;             // 菜单中隐藏
  hideInTab?: boolean;              // 标签页中隐藏
  hideInBreadcrumb?: boolean;       // 面包屑中隐藏
  hideChildrenInMenu?: boolean;     // 子菜单在菜单中隐藏
  ignoreAccess?: boolean;           // 忽略权限，直接访问
  menuVisibleWithForbidden?: boolean; // 菜单可见但访问跳转 403
  noBasicLayout?: boolean;          // 不使用基础布局（仅在顶级生效）
  iframeSrc?: string;               // 内嵌 iframe 地址
  link?: string;                    // 外链跳转路径（新窗口打开）
  openInNewWindow?: boolean;        // 新窗口打开
  badge?: string;                   // 徽标文本
  badgeType?: 'dot' | 'normal';     // 徽标类型
  badgeVariants?: string;           // 徽标颜色
  fullPathKey?: boolean;            // 使用完整路径作为 tab key（默认 true）
  maxNumOfOpenTab?: number;         // 标签页最大打开数量
  query?: Recordable;               // 菜单携带的参数
}
```

## 4.5 标签页与路由控制

单个路由可打开多个标签页，Tab key 的优先级（由高到低）：

1. 路由 query 参数 `pageKey`
2. `meta.fullPathKey` 不为 false → 使用 `fullPath`
3. `meta.fullPathKey` 为 false → 使用 `path`

## 4.6 路由刷新

```ts
import { useRefresh } from '@vben/hooks';
const { refresh } = useRefresh();
refresh(); // 刷新当前路由
```

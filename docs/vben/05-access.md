# 05 权限控制

> 源文件：`docs/src/guide/in-depth/access.md`（357 行）

---

## 5.1 三种权限模式

| 模式 | 配置值 | 说明 | 适用场景 |
|------|--------|------|----------|
| **前端访问控制** | `frontend` | 前端固定写死路由权限，通过角色遍历过滤路由表 | 角色较固定的系统 |
| **后端访问控制** | `backend` | 通过接口动态返回菜单数据结构，前端处理后添加到路由 | 权限复杂的系统 |
| **混合访问控制** | `mixed` | 同时结合前端和后端权限，合并两部分路由 | 复杂业务场景 |

在 `preferences.ts` 中配置：

```ts
import { defineOverridesPreferences } from '@vben/preferences';

export const overridesPreferences = defineOverridesPreferences({
  app: {
    accessMode: 'frontend', // 'frontend' | 'backend' | 'mixed'
  },
});
```

## 5.2 前端访问控制

1. 确保 `accessMode='frontend'`
2. 在路由 `meta` 中配置 `authority`：

```ts
{
  meta: {
    authority: ['super'],
  },
}
```

3. 确保登录后 `authStore.setUserInfo(userInfo)` 中 `userInfo.roles` 包含对应权限

### 菜单可见但禁止访问

```ts
{
  meta: {
    menuVisibleWithForbidden: true,
  },
}
```

## 5.3 后端访问控制

1. 确保 `accessMode='backend'`
2. 在 `src/router/access.ts` 中配置菜单接口：

```ts
async function generateAccess(options) {
  return await generateAccessible(preferences.app.accessMode, {
    fetchMenuListAsync: async () => {
      return await getAllMenus(); // 后端返回菜单数据
    },
  });
}
```

3. 后端返回数据结构示例：

```ts
const dashboardMenus = [
  {
    name: 'Dashboard',
    path: '/',
    redirect: '/analytics',
    meta: { title: 'page.dashboard.title', order: -1 },
    children: [
      {
        name: 'Analytics',
        path: '/analytics',
        component: '/dashboard/analytics/index', // 去掉 views/ 和 .vue
        meta: { affixTab: true, title: 'page.dashboard.analytics' },
      },
    ],
  },
];
```

## 5.4 按钮细粒度控制

使用 `@vben/access` 提供的组件、指令和 API。

### 权限码控制（type="code"）

权限码由接口返回，数据结构为字符串数组：`['AC_100100', 'AC_100110']`

**组件方式：**

```vue
<script setup>
import { AccessControl, useAccess } from '@vben/access';
</script>

<template>
  <AccessControl :codes="['AC_100100']" type="code">
    <Button>Super 可见</Button>
  </AccessControl>
</template>
```

**API 方式：**

```vue
<script setup>
import { useAccess } from '@vben/access';
const { hasAccessByCodes } = useAccess();
</script>

<template>
  <Button v-if="hasAccessByCodes(['AC_100100'])">Super 可见</Button>
</template>
```

**指令方式：**

```vue
<template>
  <Button v-access:code="'AC_100100'">Super 可见</Button>
  <Button v-access:code="['AC_100100', 'AC_100010']">多权限码</Button>
</template>
```

### 角色控制（默认 type="role"）

**组件方式：**

```vue
<template>
  <AccessControl :codes="['super']">
    <Button>Super 角色可见</Button>
  </AccessControl>
</template>
```

**API 方式：**

```ts
const { hasAccessByRoles } = useAccess();
```

**指令方式：**

```vue
<template>
  <Button v-access:role="'super'">Super 角色可见</Button>
  <Button v-access:role="['super', 'admin']">多角色</Button>
</template>
```

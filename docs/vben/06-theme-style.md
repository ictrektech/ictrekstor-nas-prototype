# 06 主题、样式与国际化

> 源文件：`docs/src/guide/in-depth/theme.md`（1295 行）、`docs/src/guide/essentials/styles.md`（106 行）、`docs/src/guide/essentials/icons.md`（78 行）、`docs/src/guide/in-depth/locale.md`（227 行）

---

## 6.1 主题系统

框架基于 **shadcn-vue** 和 **Tailwind CSS** 构建，支持 CSS 变量和 Tailwind 工具类进行主题设置。

### CSS 变量约定

- `background` — 组件背景色
- `foreground` — 文本颜色
- 颜色必须使用 **HSL 格式**，如 `0 0% 100%`（不需要加 `hsl()` 和逗号）

### 覆盖品牌主色

在应用目录的 `preferences.ts` 中配置：

```ts
import { defineOverridesPreferences } from '@vben/preferences';

export const overridesPreferences = defineOverridesPreferences({
  theme: {
    colorPrimary: 'hsl(212 100% 45%)',
    colorSuccess: 'hsl(144 57% 58%)',
    colorWarning: 'hsl(42 84% 61%)',
    colorDestructive: 'hsl(348 100% 61%)',
  },
});
```

> 修改后需要**清空缓存**才可生效。

### 内置主题

框架内置 **16 种主题**：

```ts
type BuiltinThemeType =
  | 'custom'
  | 'deep-blue' | 'deep-green' | 'default' | 'gray'
  | 'green' | 'neutral' | 'orange' | 'pink' | 'red'
  | 'rose' | 'sky-blue' | 'slate' | 'stone'
  | 'violet' | 'yellow' | 'zinc';
```

配置方式：

```ts
export const overridesPreferences = defineOverridesPreferences({
  theme: {
    builtinType: 'default',
    mode: 'dark', // 'light' | 'dark'
  },
});
```

## 6.2 样式方案

### Tailwind CSS（推荐）

项目中已集成 Tailwind CSS，可直接使用工具类：

```vue
<template>
  <div class="bg-white p-4">
    <p class="text-green">hello world</p>
  </div>
</template>
```

### SCSS

```vue
<style lang="scss" scoped>
$font-size: 30px;
.box {
  .title {
    color: green;
    font-size: $font-size;
  }
}
</style>
```

### PostCSS（替代 SCSS）

项目内置 `postcss-nested`，可使用 CSS 变量替代 SCSS：

```vue
<style scoped>
.box {
  --font-size: 30px;
  .title {
    color: green;
    font-size: var(--font-size);
  }
}
</style>
```

### BEM 规范

项目提供 `useNamespace` 辅助函数：

```vue
<script setup>
import { useNamespace } from '@vben/hooks';
const { b, e, is } = useNamespace('menu');
</script>

<template>
  <div :class="[b()]">
    <div :class="[e('item'), is('active', true)]">item1</div>
  </div>
</template>

<style lang="scss" scoped>
@use '@vben/styles/global' as *;
@include b('menu') {
  color: black;
  @include e('item') {
    background-color: black;
    @include is('active') {
      background-color: red;
    }
  }
}
</style>
```

### CSS Modules

```vue
<template>
  <p :class="$style.red">This should be red</p>
</template>

<style module>
.red {
  color: red;
}
</style>
```

## 6.3 图标

图标由 `@vben/icons` 包统一管理。

### Iconify 图标（推荐）

新增：在 `packages/icons/src/iconify/index.ts` 中创建

```ts
import { createIconifyIcon } from '@vben-core/icons';
export const MdiKeyboardEsc = createIconifyIcon('mdi:keyboard-esc');
```

使用：

```vue
<script setup>
import { MdiKeyboardEsc } from '@vben/icons';
</script>
<template>
  <MdiKeyboardEsc class="size-5" />
</template>
```

### SVG 图标（推荐）

将 `.svg` 文件放入 `packages/icons/src/svg/icons/`，然后在 `packages/icons/src/svg/index.ts` 注册：

```ts
const SvgTestIcon = createIconifyIcon('svg:test');
export { SvgTestIcon };
```

### Tailwind CSS 图标

```vue
<template>
  <span class="icon-[mdi--ab-testing]"></span>
</template>
```

## 6.4 国际化（i18n）

项目集成 Vue i18n，已配置中文和英文语言包。

### 配置默认语言

```ts
// preferences.ts
export const overridesPreferences = defineOverridesPreferences({
  app: {
    locale: 'zh-CN', // 'zh-CN' | 'en-US'
  },
});
```

### 动态切换语言

```ts
import type { SupportedLanguagesType } from '@vben/locales';
import { loadLocaleMessages } from '@vben/locales';
import { updatePreferences } from '@vben/preferences';

async function updateLocale(value: string) {
  const locale = value as SupportedLanguagesType;
  updatePreferences({ app: { locale } });
  await loadLocaleMessages(locale);
}
```

### 新增翻译文本

在应用目录的 `src/locales/langs/` 下新增：

```json
// src/locales/langs/zh-CN/about.json
{
  "about": {
    "desc": "Vben Admin 是一个现代的管理模版。"
  }
}
```

> 业务翻译不要放到 `@vben/locales` 包内，便于管理。

### 使用翻译

```vue
<script setup>
import { $t } from '@vben/locales';
</script>
<template>
  <div>{{ $t('about.desc') }}</div>
</template>
```

### 新增语言包

1. `packages/locales/langs/` 新增语言文件
2. 应用 `src/locales/langs/` 新增对应文件
3. `packages/constants/src/core.ts` 新增语言选项
4. `packages/locales/typing.ts` 新增 TypeScript 类型

### 关闭国际化

1. 隐藏语言切换按钮：`preferences.ts` 中设置 `widget.languageToggle: false`
2. 修改默认语言为中文
3. `src/locales/index.ts` 中设置 `missingWarn: false`

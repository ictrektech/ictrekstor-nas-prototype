# 07 服务端交互与数据 Mock

> 源文件：`docs/src/guide/essentials/server.md`（387 行）、`docs/src/guide/essentials/build.md`（243 行）

---

## 7.1 服务端交互概述

涉及技术：
- **[Nitro](https://nitro.unjs.io/)** — 轻量级后端服务器，用于 Mock 服务
- **[axios](https://axios-http.com/)** — HTTP 请求库

## 7.2 开发环境跨域配置

### 配置接口地址

在 `.env.development` 中：

```bash
VITE_GLOB_API_URL=/api
```

### 配置开发服务器代理

在应用目录的 `vite.config.mts` 中：

```ts
import { defineConfig } from '@vben/vite-config';

export default defineConfig(async () => {
  return {
    vite: {
      server: {
        proxy: {
          '/api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ''),
            target: 'http://localhost:5320/api', // Mock 服务地址
            ws: true,
          },
        },
      },
    },
  };
});
```

### 无跨域时的配置

直接忽略代理配置，将真实接口地址写入 `.env.development`：

```bash
VITE_GLOB_API_URL=https://mock-napi.vben.pro/api
```

## 7.3 请求封装

核心由 `@vben/request` 包提供，应用级配置在 `src/api/request.ts`。

### 扩展配置

```ts
type ExtendOptions<T = any> = {
  paramsSerializer?: 'brackets' | 'comma' | 'indices' | 'repeat';
  responseReturn?: 'body' | 'data' | 'raw';
};
```

- `paramsSerializer`：数组参数序列化方式
- `responseReturn`：响应数据返回方式（`raw` 返回完整 AxiosResponse，`body` 返回响应体，`data` 解构返回 data 节点）

### 请求示例

```ts
import { requestClient } from '#/api/request';

// GET
export async function getUserInfoApi() {
  return requestClient.get<UserInfo>('/user/info');
}

// POST/PUT
export async function saveUserApi(user: UserInfo) {
  return requestClient.post<UserInfo>('/user', user);
}

// DELETE
export async function deleteUserApi(userId: number) {
  return requestClient.delete<boolean>(`/user/${userId}`);
}
```

### 应用级请求配置（web-antd 示例）

```ts
import {
  authenticateResponseInterceptor,
  errorMessageResponseInterceptor,
  RequestClient,
} from '@vben/request';

function createRequestClient(baseURL: string) {
  const client = new RequestClient({ baseURL });

  // 请求头拦截器：添加 Authorization 和 Accept-Language
  client.addRequestInterceptor({
    fulfilled: async (config) => {
      config.headers.Authorization = formatToken(accessStore.accessToken);
      config.headers['Accept-Language'] = preferences.app.locale;
      return config;
    },
  });

  // 响应数据格式拦截器
  client.addResponseInterceptor(
    defaultResponseInterceptor({
      codeField: 'code',
      dataField: 'data',
      successCode: 0,
    }),
  );

  // Token 过期拦截器
  client.addResponseInterceptor(
    authenticateResponseInterceptor({
      client,
      doReAuthenticate,
      doRefreshToken,
      enableRefreshToken: preferences.app.enableRefreshToken,
      formatToken,
    }),
  );

  // 通用错误处理
  client.addResponseInterceptor(
    errorMessageResponseInterceptor((msg: string, error) => {
      const responseData = error?.response?.data ?? {};
      const errorMessage = responseData?.error ?? responseData?.message ?? '';
      message.error(errorMessage || msg);
    }),
  );

  return client;
}

export const requestClient = createRequestClient(apiURL);
```

## 7.4 刷新 Token

1. `preferences.ts` 中启用：`enableRefreshToken: true`
2. 在 `src/api/request.ts` 中配置 `doRefreshToken` 方法：

```ts
async function doRefreshToken() {
  const accessStore = useAccessStore();
  const resp = await refreshTokenApi();
  const newToken = resp.data;
  accessStore.setAccessToken(newToken);
  return newToken;
}
```

## 7.5 Mock 数据（Nitro）

项目使用 Nitro 进行本地 Mock 数据处理，本质是一个真实的后端服务。

- Mock 代码位于 `apps/backend-mock/`
- 无需手动启动，运行 `pnpm dev` 时自动启动
- Mock 服务地址：`http://localhost:5320/api`

### 关闭 Mock 服务

在 `.env.development` 中：

```bash
VITE_NITRO_MOCK=false
```

> 新版本不再支持生产环境 Mock。

## 7.6 生产环境动态配置

`VITE_GLOB_*` 变量会在打包时注入 `dist/_app.config.js`，支持**构建后动态修改**接口地址等配置。

获取方式：

```ts
const { apiURL } = useAppConfig(import.meta.env, import.meta.env.PROD);
```

## 7.7 构建与部署

### 构建

```bash
pnpm build        # 构建所有应用
pnpm build:antd   # 仅构建 web-antd
```

### 预览

```bash
pnpm preview      # 本地预览（端口 4173）
```

### 压缩

在 `.env.production` 中配置：

```bash
VITE_COMPRESS=gzip       # gzip
VITE_COMPRESS=brotli     # brotli
VITE_COMPRESS=gzip,brotli # 两者同时开启
```

### 路由模式

```bash
VITE_ROUTER_HISTORY=hash    # hash 模式（默认）
VITE_ROUTER_HISTORY=history # history 模式（需服务端配合）
```

### nginx 部署示例（history 模式）

```nginx
server {
  listen 80;
  location / {
    root /srv/www/project/;
    index index.html;
    try_files $uri $uri/ /index.html;
  }
}
```

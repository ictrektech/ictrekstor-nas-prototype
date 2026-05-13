/**
 * 认证相关 API — 原型环境 mock 实现
 * 所有请求直接返回模拟数据，不发送真实 HTTP 请求
 */
export namespace AuthApi {
  /** 登录接口参数 */
  export interface LoginParams {
    password?: string;
    username?: string;
  }

  /** 登录接口返回值 */
  export interface LoginResult {
    accessToken: string;
  }

  export interface RefreshTokenResult {
    data: string;
    status: number;
  }
}

/**
 * 登录
 */
export async function loginApi(data: AuthApi.LoginParams) {
  console.log('[MOCK] loginApi called with', data);
  return {
    accessToken: 'mock-access-token-for-prototype',
  } as AuthApi.LoginResult;
}

/**
 * 刷新accessToken
 */
export async function refreshTokenApi() {
  console.log('[MOCK] refreshTokenApi called');
  return {
    data: 'mock-refreshed-token-for-prototype',
    status: 200,
  } as AuthApi.RefreshTokenResult;
}

/**
 * 退出登录
 */
export async function logoutApi() {
  console.log('[MOCK] logoutApi called');
  return { success: true };
}

/**
 * 获取用户权限码
 */
export async function getAccessCodesApi() {
  console.log('[MOCK] getAccessCodesApi called');
  return ['auth:login', 'auth:logout', 'user:read', 'user:write', 'admin'] as string[];
}

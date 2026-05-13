/**
 * 用户相关 API — 原型环境 mock 实现
 * 所有请求直接返回模拟数据，不发送真实 HTTP 请求
 */
import type { UserInfo } from '@vben/types';

/**
 * 获取用户信息
 */
export async function getUserInfoApi() {
  console.log('[MOCK] getUserInfoApi called');
  return {
    userId: '1',
    username: 'admin',
    realName: '管理员',
    avatar: '',
    homePath: '/dashboard',
    roles: ['admin'],
  } as UserInfo;
}

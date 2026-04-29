import type { UserInfo } from '@vben/types';

import { requestClient } from '#/api/request';

/**
 * 获取用户信息
 * 原型环境：若后端未返回数据，提供默认用户信息
 */
export async function getUserInfoApi() {
  try {
    return await requestClient.get<UserInfo>('/user/info');
  } catch {
    // 原型环境兜底：返回默认管理员用户
    return {
      userId: '1',
      username: 'admin',
      realName: 'admin',
      avatar: '',
      homePath: '/dashboard',
      roles: ['admin'],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  }
}

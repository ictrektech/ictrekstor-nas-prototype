/**
 * 菜单相关 API — 原型环境 mock 实现
 * 所有请求直接返回模拟数据，不发送真实 HTTP 请求
 */
import type { RouteRecordStringComponent } from '@vben/types';

/**
 * 获取用户所有菜单
 */
export async function getAllMenusApi() {
  console.log('[MOCK] getAllMenusApi called');
  // 返回空数组，让前端使用本地路由配置
  return [] as RouteRecordStringComponent[];
}

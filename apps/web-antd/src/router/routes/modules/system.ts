import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:settings',
      order: 300,
      title: $t('page.system.title'),
    },
    name: 'SystemSettings',
    path: '/system',
    redirect: '/system/device',
    children: [
      {
        name: 'SystemDevice',
        path: '/system/device',
        component: () => import('#/views/system/device/index.vue'),
        meta: {
          icon: 'lucide:monitor',
          title: '设备管理',
        },
      },
      {
        name: 'SystemNetworkDetail',
        path: '/system/device/network/:name',
        component: () => import('#/views/system/device/network-detail.vue'),
        meta: {
          hideInMenu: true,
          title: '网卡详情',
        },
      },
      {
        name: 'SystemUsers',
        path: '/system/users',
        component: () => import('#/views/system/users/index.vue'),
        meta: {
          icon: 'lucide:users',
          title: $t('page.system.users'),
        },
      },
    ],
  },
];

export default routes;

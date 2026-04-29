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
          title: $t('page.system.device'),
        },
      },
      {
        name: 'SystemNetwork',
        path: '/system/network',
        component: () => import('#/views/system/network/index.vue'),
        meta: {
          icon: 'lucide:network',
          title: $t('page.system.network'),
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

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
      {
        name: 'SystemVolumes',
        path: '/system/volumes',
        component: () => import('#/views/storage/volumes/index.vue'),
        meta: {
          icon: 'lucide:box',
          title: '存储空间管理',
        },
      },
      {
        name: 'SystemPublicFiles',
        path: '/system/public-files',
        component: () => import('#/views/system/public-files/index.vue'),
        meta: {
          icon: 'lucide:folder-heart',
          title: '公共文件管理',
        },
      },
    ],
  },
];

export default routes;

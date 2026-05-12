import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      hideInMenu: true,
      title: '存储',
    },
    name: 'StorageManagement',
    path: '/storage',
    children: [
      {
        name: 'StorageDiskDetail',
        path: '/storage/disks/detail/:deviceName',
        component: () => import('#/views/storage/disks/detail.vue'),
        meta: {
          hideInMenu: true,
          title: '磁盘详情',
        },
      },
      {
        name: 'StoragePoolDetail',
        path: '/storage/pools/detail/:id',
        component: () => import('#/views/storage/pools/detail.vue'),
        meta: {
          hideInMenu: true,
          title: '存储池详情',
        },
      },
    ],
  },
];

export default routes;

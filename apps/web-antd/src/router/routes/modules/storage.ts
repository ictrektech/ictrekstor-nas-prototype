import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:database',
      order: 200,
      title: $t('page.storage.title'),
    },
    name: 'StorageManagement',
    path: '/storage',
    redirect: '/storage/disks',
    children: [
      {
        name: 'StorageDisks',
        path: '/storage/disks',
        component: () => import('#/views/storage/disks/index.vue'),
        meta: {
          icon: 'lucide:disc',
          title: $t('page.storage.disks'),
        },
      },
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
      {
        name: 'StorageVolumes',
        path: '/storage/volumes',
        component: () => import('#/views/storage/volumes/index.vue'),
        meta: {
          icon: 'lucide:box',
          title: $t('page.storage.volumes'),
        },
      },
      {
        name: 'StorageTeamFiles',
        path: '/storage/team-files',
        component: () => import('#/views/storage/team-files/index.vue'),
        meta: {
          icon: 'lucide:users',
          title: '团队文件管理',
        },
      },
      {
        name: 'StorageAllFiles',
        path: '/storage/all-files',
        component: () => import('#/views/storage/all-files/index.vue'),
        meta: {
          icon: 'lucide:folder-open',
          title: '设备全部文件',
        },
      },
    ],
  },
];

export default routes;

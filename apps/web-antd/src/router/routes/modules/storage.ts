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
        name: 'StoragePools',
        path: '/storage/pools',
        component: () => import('#/views/storage/pools/index.vue'),
        meta: {
          icon: 'lucide:layers',
          title: $t('page.storage.pools'),
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
        name: 'StoragePublicDirs',
        path: '/storage/public-dirs',
        component: () => import('#/views/storage/public-dirs/index.vue'),
        meta: {
          icon: 'lucide:folder-tree',
          title: $t('page.storage.publicDirs'),
        },
      },
    ],
  },
];

export default routes;

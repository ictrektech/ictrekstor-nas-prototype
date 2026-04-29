import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:folder-open',
      order: 100,
      title: $t('page.file.title'),
    },
    name: 'FileManagement',
    path: '/file',
    redirect: '/file/library',
    children: [
      {
        name: 'FileLibrary',
        path: '/file/library',
        component: () => import('#/views/file/library/index.vue'),
        meta: {
          icon: 'lucide:hard-drive',
          title: $t('page.file.library'),
        },
      },
      {
        name: 'FileRecycle',
        path: '/file/recycle',
        component: () => import('#/views/file/recycle/index.vue'),
        meta: {
          icon: 'lucide:trash-2',
          title: $t('page.file.recycle'),
        },
      },
      {
        name: 'FileExternal',
        path: '/file/external',
        component: () => import('#/views/file/external/index.vue'),
        meta: {
          icon: 'lucide:usb',
          title: $t('page.file.external'),
        },
      },
      {
        name: 'FileShareLinks',
        path: '/file/share-links',
        component: () => import('#/views/file/share-links/index.vue'),
        meta: {
          icon: 'lucide:link',
          title: $t('page.file.shareLinks'),
        },
      },
    ],
  },
];

export default routes;

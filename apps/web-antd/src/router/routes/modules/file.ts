import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:folder-open',
      order: 100,
      title: '文件管理',
    },
    name: 'FileManagement',
    path: '/file',
    redirect: '/file/my-files',
    children: [
      {
        name: 'FileMyFiles',
        path: '/file/my-files',
        component: () => import('#/views/file/my-files/index.vue'),
        meta: {
          icon: 'lucide:folder-open',
          title: '我的文件',
        },
      },
      {
        name: 'FileShared',
        path: '/file/shared',
        component: () => import('#/views/file/shared-files/index.vue'),
        meta: {
          icon: 'lucide:link',
          title: '我的共享',
        },
      },
      {
        name: 'FileNetwork',
        path: '/file/network',
        component: () => import('#/views/file/network/index.vue'),
        meta: {
          icon: 'lucide:globe',
          title: '网络访问',
        },
      },
      {
        name: 'FileExternalDevice',
        path: '/file/external-device',
        component: () => import('#/views/file/external-device/index.vue'),
        meta: {
          icon: 'lucide:usb',
          title: '外接设备',
        },
      },
      {
        name: 'FileRecycle',
        path: '/file/recycle',
        component: () => import('#/views/file/recycle/index.vue'),
        meta: {
          icon: 'lucide:trash-2',
          title: '回收站',
        },
      },
    ],
  },
];

export default routes;

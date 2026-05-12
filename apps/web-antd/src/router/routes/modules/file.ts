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
        name: 'FilePublicFiles',
        path: '/file/public-files',
        component: () => import('#/views/file/public-files/index.vue'),
        meta: {
          icon: 'lucide:folder-heart',
          title: '公共文件',
        },
      },
      {
        name: 'FileSharedFromOthers',
        path: '/file/shared-from-others',
        component: () => import('#/views/file/shared-from-others/index.vue'),
        meta: {
          icon: 'lucide:share-2',
          title: '他人分享',
        },
      },
      {
        name: 'FileShared',
        path: '/file/shared',
        component: () => import('#/views/file/shared-files/index.vue'),
        meta: {
          icon: 'lucide:link',
          title: '我的分享',
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
        name: 'FileExternalDeviceManage',
        path: '/file/external-device/:deviceId',
        component: () => import('#/views/file/external-device/manage.vue'),
        meta: {
          icon: 'lucide:folder-open',
          title: '外接设备文件管理',
          hideInMenu: true,
        },
      },
      {
        name: 'FileRecycle',
        path: '/file/recycle',
        component: () => import('#/views/storage/recycle-bin/index.vue'),
        meta: {
          icon: 'lucide:trash-2',
          title: '回收站',
        },
      },
      {
        name: 'FileAllFiles',
        path: '/file/all-files',
        component: () => import('#/views/storage/all-files/index.vue'),
        meta: {
          icon: 'lucide:hard-drive',
          title: '设备全部文件',
        },
      },
    ],
  },
];

export default routes;

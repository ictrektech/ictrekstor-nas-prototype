import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:home',
      order: -1,
      title: $t('page.dashboard.title'),
    },
    name: 'Home',
    path: '/dashboard',
    component: () => import('#/views/home/index.vue'),
  },
];

export default routes;

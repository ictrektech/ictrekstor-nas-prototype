import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:bot',
      order: 95,
      title: 'AI 助手',
    },
    name: 'AIAssistant',
    path: '/ai',
    redirect: '/ai/chat',
    children: [
      {
        name: 'AIChat',
        path: '/ai/chat',
        component: () => import('#/views/ai/chat/index.vue'),
        meta: {
          icon: 'lucide:message-circle',
          title: '智能对话',
        },
      },
    ],
  },
];

export default routes;

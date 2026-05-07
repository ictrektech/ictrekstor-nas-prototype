<script lang="ts" setup>
import type { NotificationItem } from '@vben/layouts';

import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { useWatermark } from '@vben/hooks';
import {
  BasicLayout,
  LockScreen,
  Notification,
  UserDropdown,
} from '@vben/layouts';
import { preferences } from '@vben/preferences';
import { useAccessStore, useUserStore } from '@vben/stores';

import { useAuthStore } from '#/store';

const router = useRouter();

// AI 悬浮按钮拖拽状态
const isDragging = ref(false);
const translateX = ref(0);
const translateY = ref(0);
const dragStartMouseX = ref(0);
const dragStartMouseY = ref(0);
const dragStartTranslateX = ref(0);
const dragStartTranslateY = ref(0);
const movedDistance = ref(0);

function handleMouseDown(e: MouseEvent) {
  isDragging.value = true;
  movedDistance.value = 0;
  dragStartMouseX.value = e.clientX;
  dragStartMouseY.value = e.clientY;
  dragStartTranslateX.value = translateX.value;
  dragStartTranslateY.value = translateY.value;
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
}

function handleMouseMove(e: MouseEvent) {
  if (!isDragging.value) return;
  e.preventDefault();
  const dx = e.clientX - dragStartMouseX.value;
  const dy = e.clientY - dragStartMouseY.value;
  movedDistance.value = Math.sqrt(dx * dx + dy * dy);
  translateX.value = dragStartTranslateX.value + dx;
  translateY.value = dragStartTranslateY.value + dy;
}

function handleMouseUp() {
  isDragging.value = false;
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
}

function handleAIFabClick(e: MouseEvent) {
  if (movedDistance.value > 5) {
    e.preventDefault();
    e.stopPropagation();
    return;
  }
  router.push('/ai/chat');
}

  const notifications = ref<NotificationItem[]>([
  {
    id: 1,
    avatar: '',
    date: '刚刚',
    isRead: false,
    message: '欢迎使用 ictrekstor NAS 管理界面',
    title: '系统通知',
  },
]);

const userStore = useUserStore();
const authStore = useAuthStore();
const accessStore = useAccessStore();
const { destroyWatermark, updateWatermark } = useWatermark();
const showDot = computed(() =>
  notifications.value.some((item) => !item.isRead),
);

const menus = computed(() => [
  {
    handler: () => {
      authStore.logout(false);
    },
    icon: 'lucide:log-out',
    text: '退出登录',
  },
]);

const avatar = computed(() => {
  return userStore.userInfo?.avatar ?? preferences.app.defaultAvatar;
});

async function handleLogout() {
  await authStore.logout(false);
}

function handleNoticeClear() {
  notifications.value = [];
}

function markRead(id: number | string) {
  const item = notifications.value.find((item) => item.id === id);
  if (item) {
    item.isRead = true;
  }
}

function remove(id: number | string) {
  notifications.value = notifications.value.filter((item) => item.id !== id);
}

function handleMakeAll() {
  notifications.value.forEach((item) => (item.isRead = true));
}
watch(
  () => ({
    enable: preferences.app.watermark,
    content: preferences.app.watermarkContent,
  }),
  async ({ enable, content }) => {
    if (enable) {
      await updateWatermark({
        content:
          content ||
          `${userStore.userInfo?.username} - ${userStore.userInfo?.realName}`,
      });
    } else {
      destroyWatermark();
    }
  },
  {
    immediate: true,
  },
);
</script>

<template>
  <BasicLayout @clear-preferences-and-logout="handleLogout" @clickLogo="router.push('/')">
    <template #user-dropdown>
      <UserDropdown
        :avatar
        :menus
        :text="userStore.userInfo?.realName"
        description="admin@ictrekstor.local"
        @logout="handleLogout"
      />
    </template>
    <template #notification>
      <Notification
        :dot="showDot"
        :notifications="notifications"
        @clear="handleNoticeClear"
        @read="(item) => item.id && markRead(item.id)"
        @remove="(item) => item.id && remove(item.id)"
        @make-all="handleMakeAll"
      />
    </template>
      <template #lock-screen>
      <LockScreen :avatar @to-login="handleLogout" />
    </template>
  </BasicLayout>

  <!-- AI 悬浮按钮 -->
  <div
    class="ai-fab"
    :style="{ transform: `translate(${translateX}px, ${translateY}px)` }"
    @mousedown="handleMouseDown"
    @click="handleAIFabClick"
  >
    <div class="ai-fab-inner">🤖</div>
    <div class="ai-fab-pulse" />
  </div>
</template>

<style scoped>
.ai-fab {
  position: fixed;
  right: 32px;
  bottom: 32px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
  box-shadow: 0 4px 16px rgba(24, 144, 255, 0.4);
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  user-select: none;
  touch-action: none;
  will-change: transform;
}

.ai-fab:active {
  cursor: grabbing;
}

.ai-fab:not(:active):hover {
  box-shadow: 0 6px 24px rgba(24, 144, 255, 0.5);
}

.ai-fab-inner {
  font-size: 28px;
  z-index: 2;
  pointer-events: none;
}

.ai-fab-pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(24, 144, 255, 0.3);
  animation: aiPulse 2s infinite;
  pointer-events: none;
}

@keyframes aiPulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.6);
    opacity: 0;
  }
}
</style>

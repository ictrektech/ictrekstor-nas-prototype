<script lang="ts" setup>
import { IconifyIcon } from '@vben/icons';

interface Props {
  icon?: string;
  text?: string;
  size?: 'large' | 'small';
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'large',
  disabled: false,
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();
</script>

<template>
  <button
    class="ict-danger-button"
    :class="{ 'ict-danger-button--small': size === 'small', 'ict-danger-button--disabled': disabled }"
    :disabled="disabled"
    @click="$event => emit('click', $event)"
  >
    <IconifyIcon
      v-if="icon"
      :icon="icon"
      :style="{ fontSize: size === 'small' ? '14px' : '16px' }"
    />
    <span v-if="text" class="ict-danger-button__text">{{ text }}</span>
    <slot />
  </button>
</template>

<style scoped>
/* 线框危险按钮 —— 基于线框按钮尺寸规范，使用危险色 */
.ict-danger-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  height: 32px;
  border: 1px solid var(--ict-danger);
  border-radius: 8px;
  background: var(--ict-bg-card);
  color: var(--ict-danger);
  font-size: 14px;
  font-weight: 400;
  line-height: 1;
  cursor: pointer;
  white-space: nowrap;
  transition: border-color 0.2s ease, color 0.2s ease;
}

.ict-danger-button:hover {
  border-color: var(--ict-danger-hover);
  color: var(--ict-danger-hover);
}

.ict-danger-button:active {
  border-color: var(--ict-danger-active);
  color: var(--ict-danger-active);
}

.ict-danger-button--disabled {
  background: var(--ict-bg-page) !important;
  border-color: var(--ict-danger-disabled) !important;
  color: var(--ict-danger-disabled) !important;
  cursor: not-allowed;
}

/* 小尺寸 */
.ict-danger-button--small {
  gap: 4px;
  padding: 2px 8px;
  height: 24px;
  border-radius: 4px;
  font-size: 12px;
}

.ict-danger-button--small :deep(svg) {
  font-size: 14px;
}

.ict-danger-button__text {
  line-height: 1;
}
</style>

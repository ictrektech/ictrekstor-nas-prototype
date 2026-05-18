<script lang="ts" setup>
import { Button } from 'ant-design-vue';
import { computed } from 'vue';

interface Props {
  size?: 'large' | 'small';
  disabled?: boolean;
  loading?: boolean;
  type?: 'default' | 'danger';
}

const props = withDefaults(defineProps<Props>(), {
  size: 'large',
  disabled: false,
  loading: false,
  type: 'default',
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const sizeClass = computed(() => (props.size === 'small' ? 'ant-btn-sm' : ''));
const typeClass = computed(() => (props.type === 'danger' ? 'action-btn-outlined--danger' : 'action-btn-outlined'));

function handleClick(event: MouseEvent) {
  if (!props.disabled && !props.loading) {
    emit('click', event);
  }
}
</script>

<template>
  <Button
    class="action-btn-outlined"
    :class="[sizeClass, typeClass]"
    :disabled="disabled"
    :loading="loading"
    @click="handleClick"
  >
    <template v-if="$slots.icon" #icon>
      <slot name="icon" />
    </template>
    <slot />
  </Button>
</template>

<style scoped>
/* ═══════════════════════════════════════
   大线框按钮（32px）
   ═══════════════════════════════════════ */
.action-btn-outlined {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: auto;
  height: 32px;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: var(--ict-body-medium);
  font-weight: 400;
  background: var(--ict-bg-card);
  border: 1px solid var(--ict-border);
  color: var(--ict-text-primary);
}

.action-btn-outlined:hover {
  background: var(--ict-bg-card);
  border: 1px solid var(--ict-primary-hover);
  color: var(--ict-primary-hover);
}

.action-btn-outlined:active {
  background: var(--ict-bg-card);
  border: 1px solid var(--ict-primary-active);
  color: var(--ict-primary-active);
}

.action-btn-outlined:disabled,
.action-btn-outlined.ant-btn-loading {
  background: var(--ict-bg-page);
  border: 1px solid var(--ict-border);
  color: var(--ict-text-disabled);
  cursor: not-allowed;
}

/* 大线框按钮 icon 尺寸 */
.action-btn-outlined :deep(.ant-btn-icon) {
  font-size: 16px;
  width: 16px;
  height: 16px;
}

/* 取消 icon + text 的 margin-left */
.action-btn-outlined :deep(.ant-btn-icon + span) {
  margin-left: 0;
}

/* ═══════════════════════════════════════
   小线框按钮（24px）
   ═══════════════════════════════════════ */
.action-btn-outlined.ant-btn-sm {
  height: 24px;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: var(--ict-body-small);
  font-weight: 400;
}

.action-btn-outlined.ant-btn-sm :deep(.ant-btn-icon) {
  font-size: 14px;
  width: 14px;
  height: 14px;
}

/* ═══════════════════════════════════════
   危险线框按钮
   ═══════════════════════════════════════ */
.action-btn-outlined--danger {
  border: 1px solid var(--ict-danger);
  color: var(--ict-danger);
}

.action-btn-outlined--danger:hover {
  background: var(--ict-bg-card);
  border: 1px solid var(--ict-danger-hover);
  color: var(--ict-danger-hover);
}

.action-btn-outlined--danger:active {
  background: var(--ict-bg-card);
  border: 1px solid var(--ict-danger-active);
  color: var(--ict-danger-active);
}
</style>

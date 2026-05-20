<script lang="ts" setup>
interface Props {
  text?: string;
  type?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
});

const typeMap: Record<string, { color: string; bg: string }> = {
  default:  { color: 'var(--ict-text-secondary)', bg: '#F7F8FA' },
  primary:  { color: 'var(--ict-primary)',        bg: 'var(--ict-primary-light)' },
  success:  { color: 'var(--ict-success)',        bg: 'var(--ict-success-light)' },
  warning:  { color: 'var(--ict-warning)',        bg: 'var(--ict-warning-light)' },
  danger:   { color: 'var(--ict-danger)',         bg: 'var(--ict-danger-light)' },
};
</script>

<template>
  <span
    class="ict-tag"
    :style="{
      color: typeMap[type].color,
      backgroundColor: typeMap[type].bg,
    }"
  >
    <span v-if="text" class="ict-tag__text">{{ text }}</span>
    <slot />
  </span>
</template>

<style scoped>
.ict-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  padding: 0 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 400;
  line-height: 18px;
  white-space: nowrap;
  user-select: none;
}
</style>

<script lang="ts" setup>
import { IconifyIcon } from '@vben/icons';

interface Props {
  icon: string;
  iconColor?: string;
  iconBg?: string;
  label: string;
  value: string | number;
}

withDefaults(defineProps<Props>(), {
  iconColor: 'var(--ict-primary)',
  iconBg: 'var(--ict-primary-light)',
});
</script>

<template>
  <div class="overview-card">
    <div class="overview-icon-wrap" :style="{ background: iconBg }">
      <IconifyIcon :icon="icon" style="font-size: 20px;" :style="{ color: iconColor }" />
    </div>
    <div class="overview-info">
      <span class="overview-value">{{ value }}</span>
      <span class="overview-label">{{ label }}</span>
    </div>
  </div>
</template>

<style scoped>
.overview-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--ict-bg-card);
  border-radius: 10px;
  border: 1px solid var(--ict-border-light);
  min-width: 100px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;
}

.overview-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}

.overview-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.overview-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.overview-label {
  font-size: var(--ict-body-small);
  line-height: 18px;
  color: var(--ict-text-secondary);
}

.overview-value {
  font-size: var(--ict-title-medium);
  font-weight: 600;
  line-height: 24px;
  color: var(--ict-text-emphasis);
  font-family: var(--ict-font-family);
}
</style>

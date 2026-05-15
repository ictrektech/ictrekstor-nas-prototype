<script lang="ts" setup>
import { IconifyIcon } from '@vben/icons';

interface Props {
  /** Iconify 图标名 */
  icon: string;
  /** 图标颜色 */
  iconColor?: string;
  /** 显示值 */
  value: string;
  /** 标签文本 */
  label: string;
}

const props = withDefaults(defineProps<Props>(), {
  iconColor: 'var(--ict-primary)',
});
</script>

<script lang="ts">
export default { name: 'InfoChip' };
</script>

<template>
  <div class="info-chip">
    <div
      class="chip-icon-box"
      :style="{ background: iconColor + '15' }"
    >
      <IconifyIcon
        :icon="icon"
        class="chip-icon"
        :style="{ color: iconColor }"
      />
    </div>
    <div class="chip-text">
      <span class="chip-value">{{ value }}</span>
      <span class="chip-label">{{ label }}</span>
    </div>
  </div>
</template>

<style scoped>
.info-chip {
  display: flex;
  align-items: center;
  gap: var(--ict-space-2);
  padding: var(--ict-space-2) var(--ict-space-3);
  background: var(--ict-bg-card);
  border-radius: var(--ict-radius-md);
  border: 1px solid var(--ict-border-light);
  box-shadow: var(--ict-shadow-1);
  transition: all 0.3s ease;
}

.info-chip:hover {
  box-shadow: var(--ict-shadow-2);
  transform: translateY(-1px);
}

.chip-icon-box {
  width: 32px;
  height: 32px;
  border-radius: var(--ict-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.chip-icon {
  font-size: var(--ict-title-medium);
}

.chip-text {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.chip-value {
  font-size: var(--ict-text-base);
  font-weight: 600;
  color: var(--ict-text-emphasis);
  font-family: var(--ict-font-family);
}

.chip-label {
  font-size: var(--ict-text-sm);
  color: var(--ict-text-secondary);
}
</style>

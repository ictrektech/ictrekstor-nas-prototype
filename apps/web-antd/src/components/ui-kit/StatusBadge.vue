<script lang="ts" setup>
import { computed } from 'vue';

interface Props {
  /** 状态文本 */
  status: string;
  /** 预设状态类型（自动着色） */
  type?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  /** 是否显示状态圆点（默认 true） */
  showDot?: boolean;
  /** 自定义尺寸：sm / md */
  size?: 'sm' | 'md';
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  showDot: true,
  size: 'sm',
});

const colorMap: Record<string, string> = {
  success: 'var(--ict-success)',
  warning: 'var(--ict-warning)',
  danger: 'var(--ict-danger)',
  info: 'var(--ict-info)',
  default: 'var(--ict-text-disabled)',
};

const color = computed(() => colorMap[props.type] || colorMap.default);

const dotSize = computed(() => (props.size === 'md' ? '8px' : '6px'));
const padding = computed(() =>
  props.size === 'md' ? '4px 10px' : '2px 8px',
);
</script>

<script lang="ts">
export default { name: 'StatusBadge' };
</script>

<template>
  <span
    class="status-badge"
    :style="{
      color: color,
      borderColor: color.startsWith('var(') ? 'currentColor' : color + '50',
      background: color.startsWith('var(') ? 'transparent' : color + '10',
      padding: padding,
    }"
  >
    <span
      v-if="showDot"
      class="status-dot"
      :style="{ width: dotSize, height: dotSize, background: color }"
    />
    {{ status }}
  </span>
</template>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: var(--ict-radius-sm);
  border: 1px solid;
  font-size: var(--ict-text-xs);
  font-weight: 500;
  line-height: 1.4;
  white-space: nowrap;
}

.status-dot {
  display: inline-block;
  border-radius: 50%;
  flex-shrink: 0;
}
</style>

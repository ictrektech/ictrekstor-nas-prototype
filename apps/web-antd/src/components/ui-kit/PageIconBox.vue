<script lang="ts" setup>
import { computed } from 'vue';
import { IconifyIcon } from '@vben/icons';

interface Props {
  /** Iconify 图标名 */
  icon: string;
  /** 图标颜色，默认主色 */
  color?: string;
  /** 图标大小，默认 20px */
  size?: number | string;
  /** 容器尺寸，默认 44px */
  boxSize?: number;
  /** 圆角，默认 10px */
  radius?: number;
}

const props = withDefaults(defineProps<Props>(), {
  color: 'var(--ict-primary)',
  size: 20,
  boxSize: 44,
  radius: 10,
});

const boxStyle = computed(() => ({
  width: `${props.boxSize}px`,
  height: `${props.boxSize}px`,
  borderRadius: `${props.radius}px`,
  background: `${props.color}18`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
}));

const iconStyle = computed(() => ({
  fontSize: typeof props.size === 'number' ? `${props.size}px` : props.size,
  color: props.color,
}));
</script>

<script lang="ts">
export default { name: 'PageIconBox' };
</script>

<template>
  <div class="page-icon-box" :style="boxStyle">
    <IconifyIcon :icon="icon" :style="iconStyle" />
  </div>
</template>

<style scoped>
.page-icon-box {
  transition: all 0.3s ease;
}
</style>

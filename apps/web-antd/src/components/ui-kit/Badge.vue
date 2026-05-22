<script lang="ts" setup>
import { computed } from 'vue';

/**
 * 全局徽标（Badge）
 * 严格遵循 .agents/skills/visual-design/SKILL.md §3.8
 *
 * 构成：dot（6px 圆点）+ text（14px 文本）
 * 与 Tag 的区别：Badge 仅以小圆点 + 文本呈现，**不带任何背景色**，用于状态指示等轻量场景。
 *
 * 颜色映射：
 * | type    | dot 颜色         | text 颜色             |
 * | ------- | --------------- | --------------------- |
 * | default | #C9CDD4         | --ict-text-secondary  |
 * | danger  | --ict-danger    | --ict-text-primary    |
 * | warning | --ict-warning   | --ict-text-primary    |
 * | success | --ict-success   | --ict-text-primary    |
 * | primary | --ict-primary   | --ict-text-primary    |
 * | info    | --ict-info      | --ict-text-primary    |
 */

type BadgeType = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

interface Props {
  /** 徽标文本 */
  text: string;
  /** 徽标语义类型 */
  type?: BadgeType;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
});

const DOT_COLOR_MAP: Record<BadgeType, string> = {
  default: '#C9CDD4',
  primary: 'var(--ict-primary)',
  success: 'var(--ict-success)',
  warning: 'var(--ict-warning)',
  danger: 'var(--ict-danger)',
  info: 'var(--ict-info)',
};

const TEXT_COLOR_MAP: Record<BadgeType, string> = {
  default: 'var(--ict-text-secondary)',
  primary: 'var(--ict-text-primary)',
  success: 'var(--ict-text-primary)',
  warning: 'var(--ict-text-primary)',
  danger: 'var(--ict-text-primary)',
  info: 'var(--ict-text-primary)',
};

const dotColor = computed(() => DOT_COLOR_MAP[props.type]);
const textColor = computed(() => TEXT_COLOR_MAP[props.type]);
</script>

<script lang="ts">
export default { name: 'Badge' };
</script>

<template>
  <span class="ict-badge" :data-type="type">
    <span class="ict-badge-dot" :style="{ background: dotColor }" />
    <span class="ict-badge-text" :style="{ color: textColor }">{{ text }}</span>
  </span>
</template>

<style scoped>
/* §3.8 尺寸规格：dot 6px / gap 8px(=space-2) / text 14px(body-medium) / line-height 20px */
.ict-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--ict-space-2);
  /* 禁止任何背景色 —— §3.8 使用规范 #6 */
  background: transparent;
  /* 不响应点击 —— §3.8 使用规范 #7 */
  cursor: default;
  user-select: none;
}

.ict-badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}

.ict-badge-text {
  font-size: var(--ict-body-medium);
  line-height: 20px;
}
</style>

<script lang="ts" setup>
import { Switch } from 'ant-design-vue';

interface Props {
  checked: boolean;
  checkedColor?: string;   // 开启态轨道色，如 'var(--ict-success)'
  uncheckedColor?: string; // 关闭态轨道色，如 'var(--ict-text-disabled)'
  disabled?: boolean;
  size?: 'default' | 'small';
}

const props = withDefaults(defineProps<Props>(), {
  checkedColor: 'var(--ict-primary)',
  uncheckedColor: 'var(--ict-border)',
  disabled: false,
  size: 'default',
});

const emit = defineEmits<{
  'update:checked': [checked: boolean];
}>();

function onChange(checked: boolean) {
  emit('update:checked', checked);
}
</script>

<template>
  <Switch
    :checked="checked"
    :disabled="disabled"
    :size="size"
    class="ict-switch-toggle"
    :style="{
      '--ict-switch-checked': checkedColor,
      '--ict-switch-unchecked': uncheckedColor,
    }"
    @update:checked="onChange"
  />
</template>

<style>
.ant-switch.ict-switch-toggle {
  width: 36px !important;
  min-width: 36px !important;
  max-width: 36px !important;
  height: 20px !important;
  flex-shrink: 0 !important;
}

.ant-switch.ict-switch-toggle .ant-switch-handle {
  width: 16px;
  height: 16px;
  top: 2px;
  left: 2px;
}

.ant-switch.ict-switch-toggle .ant-switch-handle::before {
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.ant-switch.ict-switch-toggle .ant-switch-inner {
  margin-inline-start: 20px;
  margin-inline-end: 4px;
  font-size: 12px;
}

.ant-switch.ict-switch-toggle.ant-switch-checked .ant-switch-handle {
  left: calc(100% - 18px);
}

.ant-switch.ict-switch-toggle.ant-switch-checked .ant-switch-inner {
  margin-inline-start: 4px;
  margin-inline-end: 20px;
}

/* 开启态轨道色 */
.ant-switch.ict-switch-toggle.ant-switch-checked {
  background: var(--ict-switch-checked) !important;
}

/* 关闭态轨道色 */
.ant-switch.ict-switch-toggle:not(.ant-switch-checked) {
  background: var(--ict-switch-unchecked) !important;
}

/* 悬浮态 */
.ant-switch.ict-switch-toggle.ant-switch-checked:hover {
  background: var(--ict-switch-checked) !important;
  opacity: 0.85;
}

.ant-switch.ict-switch-toggle:not(.ant-switch-checked):hover {
  background: var(--ict-switch-unchecked) !important;
  opacity: 0.85;
}

/* 禁用态 */
.ant-switch.ict-switch-toggle.ant-switch-disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* small 尺寸 */
.ant-switch.ict-switch-toggle.ant-switch-small {
  width: 26px !important;
  min-width: 26px !important;
  max-width: 26px !important;
  height: 16px !important;
  flex-shrink: 0 !important;
}

.ant-switch.ict-switch-toggle.ant-switch-small .ant-switch-handle {
  width: 12px;
  height: 12px;
  top: 2px;
  left: 2px;
}

.ant-switch.ict-switch-toggle.ant-switch-small.ant-switch-checked .ant-switch-handle {
  left: calc(100% - 14px);
}

.ant-switch.ict-switch-toggle.ant-switch-small .ant-switch-inner {
  margin-inline-start: 16px;
  margin-inline-end: 2px;
}

.ant-switch.ict-switch-toggle.ant-switch-small.ant-switch-checked .ant-switch-inner {
  margin-inline-start: 2px;
  margin-inline-end: 16px;
}
</style>

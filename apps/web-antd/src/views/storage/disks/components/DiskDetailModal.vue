<script lang="ts" setup>
import { Modal } from 'ant-design-vue';

defineProps<{
  visible: boolean;
  title: string;
  content: string;
}>();

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void;
}>();
</script>

<template>
  <Modal
    :open="visible"
    :title="title"
    width="900px"
    :footer="null"
    class="smart-modal"
    @update:open="emit('update:visible', $event)"
  >
    <pre class="smart-content">{{ content }}</pre>
  </Modal>
</template>

<style scoped>
.smart-content {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 16px;
  border-radius: 6px;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  font-size: var(--ict-body-small);
  line-height: 1.6;
  overflow-x: auto;
  max-height: 600px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
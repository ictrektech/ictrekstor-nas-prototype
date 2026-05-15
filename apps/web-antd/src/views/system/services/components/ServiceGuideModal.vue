<script lang="ts" setup>
import { Modal, Card } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import type { ServiceData } from '../types';

defineProps<{
  visible: boolean;
  service: ServiceData | null;
}>();

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void;
}>();
</script>

<template>
  <Modal
    :open="visible"
    :title="`${service?.name || ''} 使用指南`"
    width="720px"
    :footer="null"
    @update:open="emit('update:visible', $event)"
  >
    <div class="guide-content">
      <Card v-if="service" class="guide-card" size="small" :bordered="false">
        <template #title>
          <IconifyIcon
            :icon="service.icon"
            :style="{ fontSize: '18px', color: service.iconColor, marginRight: '8px' }"
          />
          {{ service.name }} 配置示例
        </template>
        <pre class="guide-code">{{ service.guideContent }}</pre>
      </Card>
    </div>
  </Modal>
</template>

<style scoped>
.guide-content {
  padding-top: 8px;
}

.guide-card {
  margin-top: 8px;
  background: var(--ict-success-light);
}

.guide-code {
  background: var(--ict-success-light);
  border: 1px solid var(--ict-success-disabled);
  border-radius: 6px;
  padding: 16px;
  font-family: var(--ict-font-family);
  font-size: var(--ict-mark-medium);
  line-height: 1.8;
  color: var(--ict-success-active);
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-x: auto;
}
</style>

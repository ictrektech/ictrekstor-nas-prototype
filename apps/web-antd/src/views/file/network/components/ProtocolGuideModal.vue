<script lang="ts" setup>
import { Modal, Card } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import type { ProtocolData } from './ProtocolCard.vue';

defineProps<{
  visible: boolean;
  protocol: ProtocolData | null;
}>();

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void;
}>();
</script>

<template>
  <Modal
    :open="visible"
    :title="`${protocol?.name || ''} 使用指南`"
    width="720px"
    :footer="null"
    @update:open="emit('update:visible', $event)"
  >
    <div class="guide-content">
      <Card v-if="protocol" class="guide-card" size="small" :bordered="false">
        <template #title>
          <IconifyIcon
            :icon="protocol.icon"
            :style="{ fontSize: '18px', color: protocol.iconColor, marginRight: '8px' }"
          />
          {{ protocol.name }} 配置示例
        </template>
        <pre class="guide-code">{{ protocol.guideContent }}</pre>
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
  background: #f6ffed;
}

.guide-code {
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 6px;
  padding: 16px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 13px;
  line-height: 1.8;
  color: #135200;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-x: auto;
}
</style>
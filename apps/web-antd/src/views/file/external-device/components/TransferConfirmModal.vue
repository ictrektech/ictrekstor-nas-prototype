<script lang="ts" setup>
import { Modal } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';

defineProps<{
  visible: boolean;
  fileName: string;
  direction: 'to-local' | 'to-device';
  targetName: string;
}>();

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void;
  (e: 'confirm'): void;
}>();
</script>

<template>
  <Modal
    :open="visible"
    title="传输确认"
    width="420px"
    ok-text="确认传输"
    cancel-text="取消"
    @ok="emit('confirm')"
    @update:open="emit('update:visible', $event)"
  >
    <div class="transfer-modal-content">
      <div class="transfer-modal-icon">
        <IconifyIcon
          icon="lucide:arrow-left-right"
          style="font-size: 32px; color: var(--ict-primary);"
        />
      </div>
      <div class="transfer-modal-info">
        <p class="transfer-modal-file">
          <IconifyIcon
            icon="lucide:file"
            style="font-size: var(--ict-body-medium); color: var(--ict-text-secondary);"
          />
          <span>{{ fileName }}</span>
        </p>
        <p class="transfer-modal-direction">
          <span v-if="direction === 'to-local'">
            将传输到 <strong>本地存储</strong>
          </span>
          <span v-else>
            将传输到 <strong>{{ targetName }}</strong>
          </span>
        </p>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.transfer-modal-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
}

.transfer-modal-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--ict-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.transfer-modal-info {
  text-align: center;
}

.transfer-modal-file {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: var(--ict-title-small);
  font-weight: 600;
  color: var(--ict-text-emphasis);
  margin: 0 0 8px;
}

.transfer-modal-direction {
  font-size: var(--ict-mark-medium);
  color: var(--ict-text-secondary);
  margin: 0;
}

.transfer-modal-direction strong {
  color: var(--ict-primary);
}
</style>
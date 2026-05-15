<script lang="ts" setup>
import { Checkbox, Tooltip, Input, Form } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import ExpireSelector from './ExpireSelector.vue';

interface Props {
  enabled: boolean;
  expireType: 'preset' | 'custom' | 'forever';
  expirePreset: string;
  expireCustomDate: string;
  password: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:enabled': [enabled: boolean];
  'update:expireType': [type: 'preset' | 'custom' | 'forever'];
  'update:expirePreset': [preset: string];
  'update:expireCustomDate': [date: string];
  'update:password': [password: string];
}>();
</script>

<template>
  <div class="link-section">
    <div class="link-section-header">
      <Checkbox :checked="enabled" @update:checked="emit('update:enabled', $event)">
        <span style="font-weight: 500; font-size: var(--ict-mark-medium);">启用外链分享</span>
      </Checkbox>
      <Tooltip title="开启后，未登录用户也可通过链接访问">
        <IconifyIcon icon="lucide:circle-help" style="font-size: var(--ict-mark-medium); color: var(--ict-text-disabled); cursor: help;" />
      </Tooltip>
    </div>

    <div v-if="enabled" class="link-config">
      <div class="config-grid">
        <Form.Item label="外链有效期" class="config-item">
          <ExpireSelector
            :type="expireType"
            :preset="expirePreset"
            :custom-date="expireCustomDate"
            @update:type="emit('update:expireType', $event)"
            @update:preset="emit('update:expirePreset', $event)"
            @update:custom-date="emit('update:expireCustomDate', $event)"
          />
        </Form.Item>

        <Form.Item label="访问密码" class="config-item">
          <Input :value="password" placeholder="公开访问" size="small" type="password" @update:value="emit('update:password', $event)">
            <template #prefix>
              <IconifyIcon icon="lucide:lock" style="font-size: var(--ict-body-small); color: var(--ict-text-disabled);" />
            </template>
          </Input>
        </Form.Item>
      </div>
    </div>
  </div>
</template>

<style scoped>
.link-section {
  background: var(--ict-bg-section);
  border-radius: 8px;
  padding: 10px 12px;
}

.link-section-header {
  display: flex;
  align-items: center;
  gap: 6px;
}

.link-config {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--ict-border-light);
}

.config-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.config-item {
  margin-bottom: 8px;
}

.config-item :deep(.ant-form-item-label) {
  padding-bottom: 4px;
  font-size: var(--ict-body-small);
}

.config-item :deep(.ant-form-item-label > label) {
  font-size: var(--ict-body-small);
}

@media (max-width: 768px) {
  .config-grid {
    grid-template-columns: 1fr;
  }
}
</style>
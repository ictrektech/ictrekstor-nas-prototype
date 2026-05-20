<script lang="ts" setup>
import { computed } from 'vue';
import { Tag } from '#/components/ui-kit';
import { Button, Progress } from 'ant-design-vue';

export interface ExternalDevice {
  id: string;
  name: string;
  type: 'usb' | 'sd' | 'ssd' | 'hdd';
  capacity: string;
  used: string;
  usedPercent: number;
  status: 'connected' | 'disconnected';
  mountPath: string;
  fileSystem: string;
}

const props = defineProps<{
  device: ExternalDevice;
}>();

const emit = defineEmits<{
  (e: 'manage', device: ExternalDevice): void;
  (e: 'eject', device: ExternalDevice): void;
  (e: 'mount', device: ExternalDevice): void;
}>();

function getDeviceTypeLabel(type: string): string {
  switch (type) {
    case 'usb':
      return 'U盘';
    case 'hdd':
      return '移动硬盘';
    case 'ssd':
      return '移动SSD';
    case 'sd':
      return 'SD卡';
    default:
      return '未知';
  }
}

function getStatusLabel(status: string): string {
  return status === 'connected' ? '已挂载' : '未挂载';
}

function getCapacityColor(percent: number): string {
  if (percent >= 90) return 'var(--ict-danger)';
  if (percent >= 70) return 'var(--ict-warning)';
  return 'var(--ict-primary)';
}

const availableSpace = computed(() => {
  if (props.device.status !== 'connected') return '--';
  // mock 数据简化处理：从 used 和 capacity 推算可用
  return `${props.device.used} / ${props.device.capacity}`;
});

function onManage() {
  emit('manage', props.device);
}

function onEject() {
  emit('eject', props.device);
}

function onMount() {
  emit('mount', props.device);
}
</script>

<template>
  <div class="device-card-inner">
    <!-- 头部：图标 + 名称 + 状态 -->
    <div class="device-header">
      <div class="device-icon-wrapper">
        <img src="/icons/USB.png" class="device-icon-img" alt="USB" />
      </div>
      <div class="device-header-info">
        <div class="device-name-row">
          <span class="device-name">{{ device.name }}</span>
          <Tag :text="getStatusLabel(device.status)" :type="device.status === 'connected' ? 'success' : 'default'" />
        </div>
        <div class="device-subtitle">
          {{ getDeviceTypeLabel(device.type) }} · {{ device.fileSystem }}
        </div>
      </div>
    </div>

    <!-- 容量进度 -->
    <div v-if="device.status === 'connected'" class="info-capacity">
      <Progress
        :percent="device.usedPercent"
        :stroke-color="getCapacityColor(device.usedPercent)"
        :show-info="false"
        :stroke-width="8"
        size="small"
      />
      <div class="capacity-summary">
        <span class="cap-used">{{ device.used }}</span>
        <span class="cap-div">/</span>
        <span class="cap-total">{{ device.capacity }}</span>
        <span class="cap-percent" :style="{ color: getCapacityColor(device.usedPercent) }">
          {{ device.usedPercent }}%
        </span>
      </div>
    </div>
    <div v-else class="info-capacity-disconnected">
      <span class="disconnected-hint">设备未挂载</span>
    </div>

    <!-- 操作按钮 -->
    <div class="device-actions">
      <template v-if="device.status === 'connected'">
        <Button
          type="primary"
          class="action-btn-primary"
          @click="onManage"
        >
          浏览文件
        </Button>
        <Button
          class="action-btn-secondary"
          @click="onEject"
        >
          安全弹出
        </Button>
      </template>
      <template v-else>
        <Button
          type="primary"
          class="action-btn-primary action-btn-full"
          @click="onMount"
        >
          挂载
        </Button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.device-card-inner {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}

/* 头部 */
.device-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.device-icon-wrapper {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.device-icon-img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.device-header-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.device-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.device-name {
  flex: auto;
  font-size: var(--ict-title-medium);
  font-weight: 600;
  color: var(--ict-text-emphasis);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.device-subtitle {
  font-size: var(--ict-body-medium);
  color: var(--ict-text-secondary);
}

/* 容量 */
.info-capacity {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.info-capacity :deep(.ant-progress),
.info-capacity :deep(.ant-progress-outer),
.info-capacity :deep(.ant-progress-inner) {
  margin: 0;
  padding: 0;
  line-height: 0;
  font-size: 0;
}

.capacity-summary {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--ict-body-small);
  color: var(--ict-text-secondary);
}

.cap-used {
  font-weight: 600;
  color: var(--ict-text-emphasis);
}

.cap-div {
  color: var(--ict-text-disabled);
}

.cap-total {
  color: var(--ict-text-secondary);
}

.cap-percent {
  margin-left: auto;
  font-size: var(--ict-mark-medium);
  font-weight: 700;
  font-family: var(--ict-font-family);
}

.info-capacity-disconnected {
  padding: 8px 0;
}

.disconnected-hint {
  font-size: var(--ict-body-small);
  color: var(--ict-text-disabled);
}

/* 操作按钮 */
.device-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.action-btn-primary {
  flex: 1;
  height: 32px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 400;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.action-btn-secondary {
  flex: 1;
  height: 32px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 400;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.action-btn-full {
  flex: 1;
}
</style>

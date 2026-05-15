<script lang="ts" setup>
import { Button, Tag, Progress, Tooltip } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';

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
}>();

function getDeviceIcon(type: string): string {
  return 'lucide:usb';
}

function getDeviceIconColor(type: string): string {
  return 'var(--ict-primary)';
}

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

function getStatusColor(status: string): string {
  return status === 'connected' ? 'success' : 'default';
}

function getStatusLabel(status: string): string {
  return status === 'connected' ? '已连接' : '未连接';
}

function getCapacityColor(percent: number): string {
  if (percent >= 90) return 'var(--ict-danger)';
  if (percent >= 70) return 'var(--ict-warning)';
  return 'var(--ict-primary)';
}

function getCapacityBg(percent: number): string {
  if (percent >= 90) return 'var(--ict-danger-light)';
  if (percent >= 70) return '#fffbe6';
  return 'var(--ict-primary-light)';
}

function onManage() {
  emit('manage', props.device);
}

function onEject() {
  emit('eject', props.device);
}
</script>

<template>
  <div class="device-card-inner">
    <!-- 左侧：设备图标区域 -->
    <div
      class="device-visual"
      :style="{ background: getDeviceIconColor(device.type) + '12' }"
    >
      <div
        class="device-icon-box"
        :style="{
          background: getDeviceIconColor(device.type) + '18',
          borderColor: getDeviceIconColor(device.type) + '35',
        }"
      >
        <IconifyIcon
          :icon="getDeviceIcon(device.type)"
          class="device-icon"
          :style="{ color: getDeviceIconColor(device.type) }"
        />
      </div>
      <div
        class="device-status-dot"
        :style="{ background: device.status === 'connected' ? 'var(--ict-success)' : 'var(--ict-text-disabled)' }"
      />
    </div>

    <!-- 右侧：信息区域 -->
    <div class="device-info">
      <!-- 第一行：名称 + 状态 -->
      <div class="info-header">
        <div class="info-header-left">
          <span class="device-name">{{ device.name }}</span>
          <Tag :color="getStatusColor(device.status)" size="small">
            <span
              class="status-dot"
              :style="{ background: device.status === 'connected' ? 'var(--ict-success)' : 'var(--ict-text-disabled)' }"
            />
            {{ getStatusLabel(device.status) }}
          </Tag>
        </div>
      </div>

      <!-- 第二行：类型 / 文件系统 -->
      <div class="info-meta">
        <span class="meta-chip">
          <IconifyIcon :icon="getDeviceIcon(device.type)" style="font-size: var(--ict-mark-small);" />
          {{ getDeviceTypeLabel(device.type) }}
        </span>
        <span v-if="device.status === 'connected'" class="meta-chip">
          <IconifyIcon icon="lucide:folder-tree" style="font-size: var(--ict-mark-small);" />
          {{ device.fileSystem }}
        </span>
      </div>

      <!-- 第三行：容量信息 -->
      <div v-if="device.status === 'connected'" class="info-capacity">
        <div class="capacity-row">
          <span class="capacity-text">
            <span class="cap-used">{{ device.used }}</span>
            <span class="cap-div">/</span>
            <span class="cap-total">{{ device.capacity }}</span>
          </span>
          <span
            class="cap-percent"
            :style="{ color: getCapacityColor(device.usedPercent) }"
          >
            {{ device.usedPercent }}%
          </span>
        </div>
        <Progress
          :percent="device.usedPercent"
          :stroke-color="getCapacityColor(device.usedPercent)"
          :show-info="false"
          :stroke-width="5"
          size="small"
        />
      </div>
      <div v-else class="info-capacity-disconnected">
        <span class="disconnected-hint">
          <IconifyIcon icon="lucide:unplug" style="font-size: var(--ict-body-small); color: var(--ict-text-disabled);" />
          设备未连接
        </span>
      </div>

      <!-- 第四行：操作按钮 -->
      <div class="info-actions">
        <Button
          type="primary"
          size="small"
          class="file-manage-btn"
          :disabled="device.status !== 'connected'"
          @click="onManage"
        >
          <IconifyIcon icon="lucide:folder-open" style="font-size: var(--ict-body-small);" />
          文件管理
        </Button>
        <Tooltip title="安全弹出">
          <Button
            size="small"
            class="action-btn"
            :disabled="device.status !== 'connected'"
            @click="onEject"
          >
            <IconifyIcon icon="lucide:log-out" style="font-size: var(--ict-body-small);" />
          </Button>
        </Tooltip>
      </div>
    </div>
  </div>
</template>

<style scoped>
.device-card-inner {
  display: flex;
  align-items: stretch;
  height: 100%;
}

/* 左侧图标区 */
.device-visual {
  width: 72px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 14px 10px;
  gap: 8px;
  flex-shrink: 0;
  position: relative;
  margin-right: 12px;
}

.device-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid;
}

.device-icon {
  font-size: var(--ict-headline-small);
}

.device-status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid var(--ict-bg-card);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08);
}

/* 右侧信息区 */
.device-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  padding: 14px 16px 14px 0;
  min-width: 0;
}

/* 名称行 */
.info-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.info-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.device-name {
  font-size: var(--ict-title-small);
  font-weight: 600;
  color: var(--ict-text-emphasis);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 4px;
}

/* 元信息行 */
.info-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.meta-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: var(--ict-bg-page);
  border-radius: 4px;
  font-size: var(--ict-body-small);
  color: var(--ict-text-secondary);
}

/* 容量行 */
.info-capacity {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.capacity-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.capacity-text {
  font-size: var(--ict-body-small);
  color: var(--ict-text-secondary);
}

.cap-used {
  font-weight: 600;
  color: var(--ict-text-emphasis);
}

.cap-div {
  margin: 0 3px;
  color: var(--ict-text-disabled);
}

.cap-total {
  color: var(--ict-text-secondary);
}

.cap-percent {
  font-size: var(--ict-mark-medium);
  font-weight: 700;
  font-family: var(--ict-font-family);
}

.info-capacity-disconnected {
  padding: 4px 0;
}

.disconnected-hint {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: var(--ict-body-small);
  color: var(--ict-text-disabled);
}

/* 操作按钮行 */
.info-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.file-manage-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: 6px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border-radius: 6px;
}
</style>
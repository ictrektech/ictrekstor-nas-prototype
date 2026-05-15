<script lang="ts" setup>
import { Button } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import type { DiskInfo } from '#/api/storage';

defineProps<{
  disk: DiskInfo;
}>();

const emit = defineEmits<{
  (e: 'back'): void;
}>();

function getDeviceIcon(deviceType?: string): string {
  if (deviceType?.includes('SSD')) return 'lucide:cpu';
  if (deviceType?.includes('NVMe')) return 'lucide:zap';
  return 'lucide:hard-drive';
}

function getDeviceIconColor(deviceType?: string): string {
  if (deviceType?.includes('SSD')) return 'var(--ict-info)';
  if (deviceType?.includes('NVMe')) return '#eb2f96';
  return 'var(--ict-primary)';
}

function formatHours(hours?: number): string {
  if (!hours) return '--';
  const days = Math.floor(hours / 24);
  if (days > 365) return `${(days / 365).toFixed(1)}年`;
  return `${days}天`;
}

function getTempColor(temp?: number): string {
  if (!temp) return 'var(--ict-text-secondary)';
  if (temp < 40) return 'var(--ict-success)';
  if (temp < 50) return 'var(--ict-warning)';
  return 'var(--ict-danger)';
}
</script>

<template>
  <div class="page-header">
    <div class="page-header-left">
      <Button size="small" class="back-btn" @click="emit('back')">
        <IconifyIcon icon="lucide:arrow-left" style="font-size: var(--ict-mark-medium);" />
      </Button>
      <div
        class="page-icon-box"
        :style="{
          background: `${getDeviceIconColor(disk.deviceType)}15`,
          border: `1px solid ${getDeviceIconColor(disk.deviceType)}30`,
        }"
      >
        <IconifyIcon
          :icon="getDeviceIcon(disk.deviceType)"
          style="font-size: var(--ict-title-large);"
          :style="{ color: getDeviceIconColor(disk.deviceType) }"
        />
      </div>
      <div class="page-title-area">
        <h1 class="page-title">{{ disk.deviceName }}</h1>
        <p class="page-desc">{{ disk.model }} · {{ disk.usageStatus || disk.status }}</p>
      </div>
    </div>
    <div class="page-header-right">
      <div class="overview-card">
        <IconifyIcon icon="lucide:database" style="font-size: var(--ict-title-medium); color: var(--ict-primary);" />
        <div class="overview-info">
          <span class="overview-label">容量</span>
          <span class="overview-value">{{ disk.size }}</span>
        </div>
      </div>
      <div v-if="disk.temperature !== undefined" class="overview-card">
        <IconifyIcon icon="lucide:thermometer" style="font-size: var(--ict-title-medium); color: var(--ict-warning);" />
        <div class="overview-info">
          <span class="overview-label">温度</span>
          <span class="overview-value" :style="{ color: getTempColor(disk.temperature) }">{{ disk.temperature }}°C</span>
        </div>
      </div>
      <div v-if="disk.usedHours" class="overview-card">
        <IconifyIcon icon="lucide:clock" style="font-size: var(--ict-title-medium); color: var(--ict-success);" />
        <div class="overview-info">
          <span class="overview-label">使用时长</span>
          <span class="overview-value">{{ formatHours(disk.usedHours) }}</span>
        </div>
      </div>
      <div v-if="disk.partitions" class="overview-card">
        <IconifyIcon icon="lucide:folder-open" style="font-size: var(--ict-title-medium); color: var(--ict-info);" />
        <div class="overview-info">
          <span class="overview-label">分区数</span>
          <span class="overview-value">{{ disk.partitions.length }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: var(--ict-bg-card);
  gap: 16px;
  flex-shrink: 0;
}

.page-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-btn {
  font-size: var(--ict-body-small);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: 6px;
}

.page-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.page-title {
  font-size: var(--ict-title-medium);
  font-weight: 600;
  color: var(--ict-text-emphasis);
  margin: 0;
  line-height: 1.4;
}

.page-desc {
  font-size: var(--ict-body-small);
  color: var(--ict-text-secondary);
  margin: 2px 0 0;
}

.page-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.overview-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: var(--ict-bg-page);
  border-radius: 8px;
  min-width: 90px;
}

.overview-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.overview-label {
  font-size: var(--ict-mark-small);
  color: var(--ict-text-secondary);
}

.overview-value {
  font-size: var(--ict-title-medium);
  font-weight: 600;
  color: var(--ict-text-emphasis);
  font-family: var(--ict-font-family);
}
</style>
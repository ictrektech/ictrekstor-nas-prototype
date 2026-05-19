<script lang="ts" setup>
import { Button } from 'ant-design-vue';
import { OverviewCard } from '#/components/ui-kit';
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
        <div class="page-title-area">
        <h1 class="page-title">{{ disk.deviceName }}</h1>
        <p class="page-desc">{{ disk.model }} · {{ disk.usageStatus || disk.status }}</p>
      </div>
    </div>
    <div class="page-header-right">
      <OverviewCard icon="lucide:database" icon-color="var(--ict-primary)" icon-bg="var(--ict-primary-light)" label="容量" :value="disk.size" />
      <OverviewCard v-if="disk.temperature !== undefined" icon="lucide:thermometer" icon-color="var(--ict-warning)" icon-bg="var(--ict-warning-light)" label="温度" :value="disk.temperature + '°C'" :value-color="getTempColor(disk.temperature)" />
      <OverviewCard v-if="disk.usedHours" icon="lucide:clock" icon-color="var(--ict-success)" icon-bg="var(--ict-success-light)" label="使用时长" :value="formatHours(disk.usedHours)" />
      <OverviewCard v-if="disk.partitions" icon="lucide:folder-open" icon-color="var(--ict-info)" icon-bg="var(--ict-info-light)" label="分区数" :value="disk.partitions.length" />
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

</style>
<script lang="ts" setup>
import { Button } from 'ant-design-vue';
import { OverviewCard } from '#/components/ui-kit';
import { IconifyIcon } from '@vben/icons';
import type { DiskInfo } from '#/api/storage';

withDefaults(
  defineProps<{
    disk: DiskInfo;
    /** 上一级页面名称，按钮文本将显示为"返回{backLabel}" */
    backLabel?: string;
  }>(),
  { backLabel: '上一级' },
);

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
    <div class="page-header-inner">
      <div class="page-title-area">
        <h1 class="page-title">{{ disk.deviceName }}</h1>
        <p class="page-desc">{{ disk.model }} · {{ disk.usageStatus || disk.status }}</p>
      </div>
      <!-- 返回按钮（small 线框 + 图标文本，放在描述下方单独一行） -->
      <Button size="small" class="back-btn" @click="emit('back')">
        <IconifyIcon icon="lucide:arrow-left" class="back-icon" />
        返回{{ backLabel }}
      </Button>
    </div>
    <div class="page-header-right">
      <OverviewCard icon="lucide:database" icon-color="var(--ict-primary)" icon-bg="var(--ict-primary-light)" label="容量" :value="disk.size" />
      <OverviewCard v-if="disk.temperature !== undefined" icon="lucide:thermometer" icon-color="var(--ict-warning)" icon-bg="var(--ict-warning-light)" label="温度" :value="disk.temperature + '°C'" :value-color="getTempColor(disk.temperature)" />
      <OverviewCard v-if="disk.usedHours" icon="lucide:clock" icon-color="var(--ict-success)" icon-bg="var(--ict-success-light)" label="使用时长" :value="formatHours(disk.usedHours)" />
    </div>
  </div>
</template>

<style scoped>
/* 头部样式与"我的文件"页面（FilePageHeader.vue）保持一致：
   - padding: 16px 20px
   - 下边框：1px solid --ict-border-light
   - 背景：--ict-bg-card */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: var(--ict-bg-card);
  border-bottom: 1px solid var(--ict-border-light);
  gap: 16px;
  flex-shrink: 0;
}

.page-header-inner {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.back-btn {
  font-size: var(--ict-body-small);
  color: var(--ict-text-secondary);
  padding: 2px 6px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: 4px;
  align-self: flex-start;
}

.back-icon {
  font-size: 14px;
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
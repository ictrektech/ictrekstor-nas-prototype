<script lang="ts" setup>
import { IconifyIcon } from '@vben/icons';
import { computed } from 'vue';
import { getCapacityColor } from '../types';

interface Props {
  poolCount: number;
  volumeCount: number;
  totalCap: string;
  totalUsed: string;
}

const props = defineProps<Props>();

const usagePercent = computed(() => {
  const used = parseFloat(props.totalUsed) || 0;
  const cap = parseFloat(props.totalCap) || 0;
  return cap > 0 ? Math.round((used / cap) * 100) : 0;
});

const usageColor = computed(() => getCapacityColor(usagePercent.value));
</script>

<template>
  <div class="vol-overview">
    <div class="overview-card">
      <IconifyIcon icon="lucide:database" style="font-size: var(--ict-title-medium); color: var(--ict-primary);" />
      <div class="overview-info">
        <span class="overview-label">存储池</span>
        <span class="overview-value">{{ poolCount }}</span>
      </div>
    </div>
    <div class="overview-card">
      <IconifyIcon icon="lucide:box" style="font-size: var(--ict-title-medium); color: var(--ict-primary);" />
      <div class="overview-info">
        <span class="overview-label">存储空间</span>
        <span class="overview-value">{{ volumeCount }}</span>
      </div>
    </div>
    <div class="overview-card">
      <IconifyIcon icon="lucide:hard-drive" style="font-size: var(--ict-title-medium); color: var(--ict-success);" />
      <div class="overview-info">
        <span class="overview-label">总容量</span>
        <span class="overview-value">{{ totalCap }}</span>
      </div>
    </div>
    <div class="overview-card">
      <IconifyIcon icon="lucide:pie-chart" style="font-size: var(--ict-title-medium);" :style="{ color: usageColor }" />
      <div class="overview-info">
        <span class="overview-label">使用率</span>
        <span class="overview-value" :style="{ color: usageColor }">{{ usagePercent }}%</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vol-overview {
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
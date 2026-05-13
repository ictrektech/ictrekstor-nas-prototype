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
      <IconifyIcon icon="lucide:database" style="font-size: 16px; color: #1677ff;" />
      <div class="overview-info">
        <span class="overview-label">存储池</span>
        <span class="overview-value">{{ poolCount }}</span>
      </div>
    </div>
    <div class="overview-card">
      <IconifyIcon icon="lucide:box" style="font-size: 16px; color: #1677ff;" />
      <div class="overview-info">
        <span class="overview-label">存储空间</span>
        <span class="overview-value">{{ volumeCount }}</span>
      </div>
    </div>
    <div class="overview-card">
      <IconifyIcon icon="lucide:hard-drive" style="font-size: 16px; color: #52c41a;" />
      <div class="overview-info">
        <span class="overview-label">总容量</span>
        <span class="overview-value">{{ totalCap }}</span>
      </div>
    </div>
    <div class="overview-card">
      <IconifyIcon icon="lucide:pie-chart" style="font-size: 16px;" :style="{ color: usageColor }" />
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
  background: #f5f5f5;
  border-radius: 8px;
  min-width: 90px;
}

.overview-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.overview-label {
  font-size: 11px;
  color: #8c8c8c;
}

.overview-value {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  font-family: 'SF Mono', 'Fira Code', monospace;
}
</style>
<script lang="ts" setup>
import { computed } from 'vue';
import { IconifyIcon } from '@vben/icons';
import type { DiskInfo } from '#/api/storage';

const props = defineProps<{
  disks: DiskInfo[];
}>();

// 解析容量大小（返回字节数）
function parseCapacity(size?: string): number {
  if (!size) return 0;
  const match = size.match(/^([\d.]+)\s*(TB|GB|MB|PB)/i);
  if (!match) return 0;
  const val = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  const multipliers: Record<string, number> = {
    MB: 1024 ** 2,
    GB: 1024 ** 3,
    TB: 1024 ** 4,
    PB: 1024 ** 5,
  };
  return val * (multipliers[unit] || 0);
}

const totalCapacityTB = computed(() => {
  const bytes = props.disks.reduce(
    (sum, d) => sum + parseCapacity(d.size),
    0,
  );
  return (bytes / 1024 ** 4).toFixed(2);
});

const healthyCount = computed(
  () => props.disks.filter((d) => d.healthStatus === '正常').length,
);
</script>

<template>
  <div class="disk-stats-cards">
    <div class="overview-card">
      <IconifyIcon
        icon="lucide:hard-drive"
        style="font-size: 16px; color: #1677ff;"
      />
      <div class="overview-info">
        <span class="overview-label">硬盘数</span>
        <span class="overview-value">{{ disks.length }}</span>
      </div>
    </div>
    <div class="overview-card">
      <IconifyIcon
        icon="lucide:database"
        style="font-size: 16px; color: #52c41a;"
      />
      <div class="overview-info">
        <span class="overview-label">总容量(TB)</span>
        <span class="overview-value">{{ totalCapacityTB }}</span>
      </div>
    </div>
    <div class="overview-card">
      <IconifyIcon
        icon="lucide:heart-pulse"
        style="font-size: 16px; color: #52c41a;"
      />
      <div class="overview-info">
        <span class="overview-label">健康</span>
        <span class="overview-value">{{ healthyCount }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.disk-stats-cards {
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
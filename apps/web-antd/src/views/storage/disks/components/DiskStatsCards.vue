<script lang="ts" setup>
import { computed } from 'vue';
import { OverviewCard } from '#/components/ui-kit';
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
    <OverviewCard icon="lucide:hard-drive" icon-color="var(--ict-primary)" icon-bg="var(--ict-primary-light)" label="硬盘数" :value="disks.length" />
    <OverviewCard icon="lucide:database" icon-color="var(--ict-success)" icon-bg="var(--ict-success-light)" label="总容量(TB)" :value="totalCapacityTB" />
    <OverviewCard icon="lucide:heart-pulse" icon-color="var(--ict-success)" icon-bg="var(--ict-success-light)" label="健康" :value="healthyCount" />
  </div>
</template>

<style scoped>
.disk-stats-cards {
  display: flex;
  align-items: center;
  gap: 12px;
}

</style>
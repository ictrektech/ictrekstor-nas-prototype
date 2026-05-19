<script lang="ts" setup>
import { OverviewCard } from '#/components/ui-kit';
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
    <OverviewCard icon="lucide:database" icon-color="var(--ict-primary)" icon-bg="var(--ict-primary-light)" label="存储池" :value="poolCount" />
    <OverviewCard icon="lucide:box" icon-color="var(--ict-primary)" icon-bg="var(--ict-primary-light)" label="存储空间" :value="volumeCount" />
    <OverviewCard icon="lucide:hard-drive" icon-color="var(--ict-success)" icon-bg="var(--ict-success-light)" label="总容量" :value="totalCap" />
    <OverviewCard icon="lucide:pie-chart" icon-color="var(--ict-warning)" icon-bg="var(--ict-warning-light)" label="使用率" :value="usagePercent + '%'" :value-color="usageColor" />
  </div>
</template>

<style scoped>
.vol-overview {
  display: flex;
  align-items: center;
  gap: 12px;
}

</style>
<script lang="ts" setup>
import { OverviewCard } from '#/components/ui-kit';

interface Props {
  poolCount: number;
  volumeCount: number;
}

defineProps<Props>();
</script>

<template>
  <div class="vol-overview">
    <OverviewCard icon="lucide:database" icon-color="var(--ict-primary)" icon-bg="var(--ict-primary-light)" label="存储池" :value="poolCount" />
    <OverviewCard icon="lucide:box" icon-color="var(--ict-primary)" icon-bg="var(--ict-primary-light)" label="存储空间" :value="volumeCount" />
  </div>
</template>

<style scoped>
.vol-overview {
  display: flex;
  align-items: center;
  gap: 12px;
}

</style>
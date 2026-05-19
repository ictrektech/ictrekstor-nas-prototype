<script lang="ts" setup>
import { OverviewCard } from '#/components/ui-kit';

interface Props {
  activeDirs: number;
  activeLinks: number;
  userCount: number;
  totalDirs: number;
}

defineProps<Props>();
</script>

<template>
  <div class="share-overview">
    <OverviewCard
      icon="lucide:folder-heart"
      icon-color="var(--ict-success)"
      icon-bg="var(--ict-success-light)"
      label="有效共享"
      :value="activeDirs"
    />
    <OverviewCard
      icon="lucide:link"
      icon-color="var(--ict-primary)"
      icon-bg="var(--ict-primary-light)"
      label="有效外链"
      :value="activeLinks"
    />
    <OverviewCard
      icon="lucide:users"
      icon-color="var(--ict-info)"
      icon-bg="var(--ict-info-light)"
      label="共享用户"
      :value="userCount"
    />
    <OverviewCard
      icon="lucide:folder-open"
      icon-color="var(--ict-warning)"
      icon-bg="var(--ict-warning-light)"
      label="共享总数"
      :value="totalDirs"
    />
  </div>
</template>

<style scoped>
.share-overview {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>

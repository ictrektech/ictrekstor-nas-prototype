<script lang="ts" setup>
import { OverviewCard } from '#/components/ui-kit';
import { IconifyIcon } from '@vben/icons';

defineProps<{
  spaces: number;
}>();
</script>

<template>
  <div class="page-header">
    <div class="page-header-left">
      <div class="page-title-area">
        <h1 class="page-title">我的文件</h1>
        <p class="page-desc">普通用户所能访问到的所有文件资源</p>
      </div>
    </div>
    <div class="page-header-right">
      <OverviewCard icon="lucide:hard-drive" icon-color="var(--ict-primary)" icon-bg="var(--ict-primary-light)" label="存储空间" :value="spaces" />
    </div>
  </div>
</template>

<style scoped>
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

.page-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: var(--ict-primary-light);
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

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
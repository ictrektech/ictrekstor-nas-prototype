<script lang="ts" setup>
import { IconifyIcon } from '@vben/icons';

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
    <div class="overview-card">
      <div class="overview-icon-wrap" style="background: var(--ict-success-light);">
        <IconifyIcon icon="lucide:folder-heart" style="font-size: var(--ict-title-medium); color: var(--ict-success);" />
      </div>
      <div class="overview-info">
        <span class="overview-label">有效共享</span>
        <span class="overview-value">{{ activeDirs }}</span>
      </div>
    </div>
    <div class="overview-card">
      <div class="overview-icon-wrap" style="background: var(--ict-primary-light);">
        <IconifyIcon icon="lucide:link" style="font-size: var(--ict-title-medium); color: var(--ict-primary);" />
      </div>
      <div class="overview-info">
        <span class="overview-label">有效外链</span>
        <span class="overview-value">{{ activeLinks }}</span>
      </div>
    </div>
    <div class="overview-card">
      <div class="overview-icon-wrap" style="background: var(--ict-info-light);">
        <IconifyIcon icon="lucide:users" style="font-size: var(--ict-title-medium); color: var(--ict-info);" />
      </div>
      <div class="overview-info">
        <span class="overview-label">共享用户</span>
        <span class="overview-value">{{ userCount }}</span>
      </div>
    </div>
    <div class="overview-card">
      <div class="overview-icon-wrap" style="background: var(--ict-warning-light);">
        <IconifyIcon icon="lucide:folder-open" style="font-size: var(--ict-title-medium); color: var(--ict-warning);" />
      </div>
      <div class="overview-info">
        <span class="overview-label">共享总数</span>
        <span class="overview-value">{{ totalDirs }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.share-overview {
  display: flex;
  align-items: center;
  gap: 12px;
}

.overview-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: var(--ict-bg-card);
  border-radius: 10px;
  border: 1px solid var(--ict-border-light);
  min-width: 100px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;
}

.overview-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}

.overview-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
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
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
      <div class="overview-icon-wrap" style="background: #f6ffed;">
        <IconifyIcon icon="lucide:folder-heart" style="font-size: 16px; color: #52c41a;" />
      </div>
      <div class="overview-info">
        <span class="overview-label">有效共享</span>
        <span class="overview-value">{{ activeDirs }}</span>
      </div>
    </div>
    <div class="overview-card">
      <div class="overview-icon-wrap" style="background: #e6f7ff;">
        <IconifyIcon icon="lucide:link" style="font-size: 16px; color: #1677ff;" />
      </div>
      <div class="overview-info">
        <span class="overview-label">有效外链</span>
        <span class="overview-value">{{ activeLinks }}</span>
      </div>
    </div>
    <div class="overview-card">
      <div class="overview-icon-wrap" style="background: #f9f0ff;">
        <IconifyIcon icon="lucide:users" style="font-size: 16px; color: #722ed1;" />
      </div>
      <div class="overview-info">
        <span class="overview-label">共享用户</span>
        <span class="overview-value">{{ userCount }}</span>
      </div>
    </div>
    <div class="overview-card">
      <div class="overview-icon-wrap" style="background: #fff7e6;">
        <IconifyIcon icon="lucide:folder-open" style="font-size: 16px; color: #fa8c16;" />
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
  background: #fff;
  border-radius: 10px;
  border: 1px solid #f0f0f0;
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
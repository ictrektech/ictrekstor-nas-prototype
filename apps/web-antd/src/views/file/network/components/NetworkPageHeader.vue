<script lang="ts" setup>
import { IconifyIcon } from '@vben/icons';

defineProps<{
  activeCount: number;
}>();
</script>

<template>
  <div class="page-header">
    <div class="page-header-left">
      <div class="page-icon-box">
        <IconifyIcon
          icon="lucide:globe"
          style="font-size: 22px; color: #1677ff;"
        />
      </div>
      <div class="page-title-area">
        <h1 class="page-title">网络访问</h1>
        <p class="page-desc">启用文件共享协议，让不同平台的设备通过网络访问您的文件</p>
      </div>
    </div>
    <div class="page-header-right">
      <div class="overview-card">
        <IconifyIcon
          icon="lucide:activity"
          style="font-size: 16px; color: #52c41a;"
        />
        <div class="overview-info">
          <span class="overview-label">在线协议</span>
          <span class="overview-value">{{ activeCount }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 16px;
  gap: 16px;
  flex-wrap: wrap;
}

.page-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-icon-box {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #e6f4ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #141414;
  margin: 0;
  line-height: 1.4;
}

.page-desc {
  font-size: 13px;
  color: #8c8c8c;
  margin: 0;
  line-height: 1.5;
}

.page-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
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

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-header-right {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
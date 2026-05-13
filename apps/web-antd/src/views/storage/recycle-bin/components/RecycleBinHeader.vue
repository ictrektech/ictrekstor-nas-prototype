<script lang="ts" setup>
import { IconifyIcon } from '@vben/icons';

defineProps<{
  totalFiles: number;
  fileItems: number;
  folderItems: number;
}>();
</script>

<template>
  <div class="page-header">
    <div class="page-header-left">
      <div class="page-icon-box">
        <IconifyIcon icon="lucide:trash-2" style="font-size: 20px; color: #1677ff;" />
      </div>
      <div class="page-title-area">
        <h1 class="page-title">回收站</h1>
        <p class="page-desc">查看已删除的文件，支持还原或彻底删除</p>
      </div>
    </div>
    <div class="page-header-right">
      <div class="overview-card">
        <IconifyIcon icon="lucide:files" style="font-size: 16px; color: #1677ff;" />
        <div class="overview-info">
          <span class="overview-label">回收文件</span>
          <span class="overview-value">{{ totalFiles }}</span>
        </div>
      </div>
      <div class="overview-card">
        <IconifyIcon icon="lucide:file" style="font-size: 16px; color: #52c41a;" />
        <div class="overview-info">
          <span class="overview-label">文件</span>
          <span class="overview-value">{{ fileItems }}</span>
        </div>
      </div>
      <div class="overview-card">
        <IconifyIcon icon="lucide:folder" style="font-size: 16px; color: #faad14;" />
        <div class="overview-info">
          <span class="overview-label">文件夹</span>
          <span class="overview-value">{{ folderItems }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; background: #fff; border-bottom: 1px solid #f0f0f0; gap: 16px; flex-shrink: 0; }
.page-header-left { display: flex; align-items: center; gap: 12px; }
.page-icon-box { width: 44px; height: 44px; border-radius: 10px; background: #e6f4ff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.page-title { font-size: 16px; font-weight: 600; color: #262626; margin: 0; line-height: 1.4; }
.page-desc { font-size: 12px; color: #8c8c8c; margin: 2px 0 0; }
.page-header-right { display: flex; align-items: center; gap: 12px; }

.overview-card { display: flex; align-items: center; gap: 8px; padding: 8px 14px; background: #f5f5f5; border-radius: 8px; min-width: 100px; }
.overview-info { display: flex; flex-direction: column; gap: 1px; }
.overview-label { font-size: 11px; color: #8c8c8c; }
.overview-value { font-size: 16px; font-weight: 600; color: #262626; font-family: 'SF Mono', 'Fira Code', monospace; }

@media (max-width: 768px) {
  .page-header { flex-direction: column; align-items: flex-start; }
}
</style>
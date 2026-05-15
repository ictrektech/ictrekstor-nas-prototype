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
        <IconifyIcon icon="lucide:trash-2" style="font-size: var(--ict-title-large); color: var(--ict-primary);" />
      </div>
      <div class="page-title-area">
        <h1 class="page-title">回收站</h1>
        <p class="page-desc">查看已删除的文件，支持还原或彻底删除</p>
      </div>
    </div>
    <div class="page-header-right">
      <div class="overview-card">
        <IconifyIcon icon="lucide:files" style="font-size: var(--ict-title-medium); color: var(--ict-primary);" />
        <div class="overview-info">
          <span class="overview-label">回收文件</span>
          <span class="overview-value">{{ totalFiles }}</span>
        </div>
      </div>
      <div class="overview-card">
        <IconifyIcon icon="lucide:file" style="font-size: var(--ict-title-medium); color: var(--ict-success);" />
        <div class="overview-info">
          <span class="overview-label">文件</span>
          <span class="overview-value">{{ fileItems }}</span>
        </div>
      </div>
      <div class="overview-card">
        <IconifyIcon icon="lucide:folder" style="font-size: var(--ict-title-medium); color: var(--ict-warning);" />
        <div class="overview-info">
          <span class="overview-label">文件夹</span>
          <span class="overview-value">{{ folderItems }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; background: var(--ict-bg-card); border-bottom: 1px solid var(--ict-border-light); gap: 16px; flex-shrink: 0; }
.page-header-left { display: flex; align-items: center; gap: 12px; }
.page-icon-box { width: 44px; height: 44px; border-radius: 10px; background: var(--ict-primary-light); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.page-title { font-size: var(--ict-title-medium); font-weight: 600; color: var(--ict-text-emphasis); margin: 0; line-height: 1.4; }
.page-desc { font-size: var(--ict-body-small); color: var(--ict-text-secondary); margin: 2px 0 0; }
.page-header-right { display: flex; align-items: center; gap: 12px; }

.overview-card { display: flex; align-items: center; gap: 8px; padding: 8px 14px; background: var(--ict-bg-page); border-radius: 8px; min-width: 100px; }
.overview-info { display: flex; flex-direction: column; gap: 1px; }
.overview-label { font-size: var(--ict-mark-small); color: var(--ict-text-secondary); }
.overview-value { font-size: var(--ict-title-medium); font-weight: 600; color: var(--ict-text-emphasis); font-family: var(--ict-font-family); }

@media (max-width: 768px) {
  .page-header { flex-direction: column; align-items: flex-start; }
}
</style>
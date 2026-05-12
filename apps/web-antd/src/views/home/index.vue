<script lang="ts" setup>
import { IconifyIcon } from '@vben/icons';
</script>

<template>
  <div class="construction-page">
    <div class="construction-icon">
      <IconifyIcon icon="lucide:hard-hat" />
    </div>
    <div class="construction-title">施工中</div>
    <div class="construction-desc">此功能正在开发中，敬请期待</div>
  </div>
</template>

<style scoped>
.construction-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 120px);
}

.construction-icon {
  font-size: 64px;
  color: #faad14;
  margin-bottom: 16px;
}

.construction-title {
  font-size: 20px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 8px;
}

.construction-desc {
  font-size: 14px;
  color: #8c8c8c;
}
</style>

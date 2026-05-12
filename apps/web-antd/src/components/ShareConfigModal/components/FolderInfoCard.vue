<script lang="ts" setup>
import { IconifyIcon } from '@vben/icons';

interface Props {
  name: string;
  path?: string;
  showTree?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  path: '',
  showTree: false,
});
</script>

<template>
  <div v-if="name" class="selected-folder-info">
    <div class="selected-folder-icon">
      <IconifyIcon icon="lucide:folder-open" style="font-size: 20px; color: #faad14;" />
    </div>
    <div class="selected-folder-detail">
      <div class="selected-folder-name">{{ name }}</div>
      <div v-if="path" class="selected-folder-path">{{ path }}</div>
    </div>
  </div>
  <div v-else-if="showTree" class="selected-folder-empty">
    <IconifyIcon icon="lucide:folder-open" style="font-size: 20px; color: #d9d9d9;" />
    <span>请从下方目录树中选择一个文件夹</span>
  </div>
</template>

<style scoped>
.selected-folder-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: linear-gradient(135deg, #fffbe6 0%, #fff7e6 100%);
  border: 1px solid #ffd591;
  border-radius: 10px;
  margin-bottom: 12px;
}

.selected-folder-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.selected-folder-detail {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.selected-folder-name {
  font-size: 14px;
  font-weight: 600;
  color: #262626;
}

.selected-folder-path {
  font-size: 12px;
  color: #8c8c8c;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.selected-folder-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  background: #fafafa;
  border: 1px dashed #d9d9d9;
  border-radius: 10px;
  margin-bottom: 12px;
  color: #8c8c8c;
  font-size: 13px;
}
</style>
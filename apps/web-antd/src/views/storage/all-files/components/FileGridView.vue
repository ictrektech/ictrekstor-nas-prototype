<script lang="ts" setup>
import { Button, Empty, Popconfirm } from 'ant-design-vue';
import type { StorageSpaceFile } from '#/api/storage';

const props = defineProps<{
  files: StorageSpaceFile[];
}>();

const emit = defineEmits<{
  (e: 'rename', file: StorageSpaceFile): void;
  (e: 'delete', file: StorageSpaceFile): void;
}>();

function getFileIcon(file: StorageSpaceFile): string {
  if (file.type === 'folder') return '📁';
  switch (file.extension) {
    case 'md': case 'txt': return '📄';
    case 'json': case 'xml': return '⚙️';
    case 'zip': case 'rar': case '7z': return '📦';
    case 'pdf': return '📕';
    case 'xlsx': case 'xls': case 'csv': return '📊';
    case 'doc': case 'docx': return '📝';
    case 'jpg': case 'jpeg': case 'png': case 'gif': return '🖼️';
    case 'mp4': case 'avi': case 'mkv': return '🎬';
    case 'mp3': case 'wav': case 'flac': return '🎵';
    default: return '📃';
  }
}
</script>

<template>
  <div class="file-grid">
    <div
      v-for="file in files"
      :key="file.id"
      class="file-grid-item"
    >
      <div class="file-grid-icon">{{ getFileIcon(file) }}</div>
      <div class="file-grid-name">{{ file.name }}</div>
      <div class="file-grid-meta">
        <span v-if="file.type === 'file'">{{ file.size }}</span>
        <span v-else>文件夹</span>
      </div>
      <div class="file-grid-actions">
        <Button size="small" type="link" @click="emit('rename', file)">重命名</Button>
        <Popconfirm
          title="确认删除"
          description="确定要删除该文件吗？"
          ok-text="确认"
          cancel-text="取消"
          @confirm="emit('delete', file)"
        >
          <Button size="small" type="link" danger>删除</Button>
        </Popconfirm>
      </div>
    </div>
    <Empty v-if="files.length === 0" description="暂无文件" class="file-grid-empty" />
  </div>
</template>

<style scoped>
.file-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
}

.file-grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px;
  border-radius: 8px;
  border: 1px solid transparent;
  transition: all 0.2s;
  cursor: pointer;
}

.file-grid-item:hover {
  background: #f5f5f5;
  border-color: #d9d9d9;
}

.file-grid-icon { font-size: 40px; margin-bottom: 8px; }
.file-grid-name { font-size: 13px; color: #262626; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%; margin-bottom: 4px; }
.file-grid-meta { font-size: 11px; color: #8c8c8c; margin-bottom: 8px; }
.file-grid-actions { display: flex; gap: 4px; opacity: 0; transition: opacity 0.2s; }
.file-grid-item:hover .file-grid-actions { opacity: 1; }
.file-grid-empty { grid-column: 1 / -1; padding: 48px 0; }
</style>
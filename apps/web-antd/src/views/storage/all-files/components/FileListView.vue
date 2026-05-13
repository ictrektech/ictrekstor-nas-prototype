<script lang="ts" setup>
import { Button, Tag, Table, Popconfirm } from 'ant-design-vue';
import type { StorageSpaceFile } from '#/api/storage';

const props = defineProps<{
  files: StorageSpaceFile[];
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: 'rename', file: StorageSpaceFile): void;
  (e: 'delete', file: StorageSpaceFile): void;
}>();

const columns = [
  { title: '名称', dataIndex: 'name', key: 'name', width: 300 },
  { title: '类型', dataIndex: 'type', key: 'type', width: 100 },
  { title: '大小', dataIndex: 'size', key: 'size', width: 120 },
  { title: '修改时间', dataIndex: 'modifyTime', key: 'modifyTime', width: 180 },
  { title: '操作', key: 'action', width: 160 },
];

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
  <Table
    :columns="columns"
    :data-source="files"
    :loading="loading"
    row-key="id"
    size="small"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'name'">
        <div class="file-name-cell">
          <span class="file-icon">{{ getFileIcon(record) }}</span>
          <span class="file-name">{{ record.name }}</span>
        </div>
      </template>
      <template v-if="column.key === 'type'">
        <Tag :color="record.type === 'folder' ? 'blue' : 'default'" size="small">
          {{ record.type === 'folder' ? '文件夹' : '文件' }}
        </Tag>
      </template>
      <template v-if="column.key === 'action'">
        <div class="file-actions">
          <Button size="small" type="link" @click="emit('rename', record)">重命名</Button>
          <Popconfirm
            title="确认删除"
            description="确定要删除该文件吗？"
            ok-text="确认"
            cancel-text="取消"
            @confirm="emit('delete', record)"
          >
            <Button size="small" type="link" danger>删除</Button>
          </Popconfirm>
        </div>
      </template>
    </template>
  </Table>
</template>

<style scoped>
.file-name-cell { display: flex; align-items: center; gap: 8px; }
.file-icon { font-size: 18px; flex-shrink: 0; }
.file-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.file-actions { display: flex; gap: 4px; }
</style>
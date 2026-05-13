<script lang="ts" setup>
import { IconifyIcon } from '@vben/icons';
import { Empty, Table, Tag } from 'ant-design-vue';
import { computed } from 'vue';

import type { FileItem } from '../types';
import { getFileIconClass } from '../utils';

interface Props {
  files: FileItem[];
  loading?: boolean;
  selectedIds: string[];
  draggable?: boolean;
  mode?: 'normal' | 'recycle';
  emptyDescription?: string;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  draggable: false,
  mode: 'normal',
  emptyDescription: '暂无文件',
});

const emit = defineEmits<{
  itemClick: [file: FileItem, event: MouseEvent];
  toggleSelect: [file: FileItem, event?: MouseEvent];
  contextMenu: [file: FileItem, event: MouseEvent];
  dragStart: [file: FileItem, event: DragEvent];
}>();

const columns = computed(() => {
  if (props.mode === 'recycle') {
    return [
      { title: '名称', dataIndex: 'name', key: 'name', width: 280, ellipsis: true },
      { title: '类型', dataIndex: 'type', key: 'type', width: 80, align: 'center' as const },
      { title: '大小', dataIndex: 'size', key: 'size', width: 90, align: 'right' as const },
      { title: '删除时间', dataIndex: 'deletedTime', key: 'deletedTime', width: 150 },
      { title: '原路径', dataIndex: 'originalPath', key: 'originalPath', width: 220, ellipsis: true },
    ];
  }
  return [
    { title: '名称', dataIndex: 'name', key: 'name', width: 320, ellipsis: true },
    { title: '类型', dataIndex: 'type', key: 'type', width: 90, align: 'center' as const },
    { title: '大小', dataIndex: 'size', key: 'size', width: 100, align: 'right' as const },
    { title: '修改时间', dataIndex: 'modifyTime', key: 'modifyTime', width: 170 },
  ];
});

function isSelected(file: FileItem) {
  return props.selectedIds.includes(file.id);
}

function rowClassName(record: any) {
  return isSelected(record) ? 'file-list-row--selected' : '';
}

function customRow(record: any) {
  return {
    onContextmenu: (e: MouseEvent) => emit('contextMenu', record as FileItem, e),
  };
}
</script>

<template>
  <Table
    :columns="columns"
    :data-source="files"
    :loading="loading"
    row-key="id"
    size="small"
    :pagination="false"
    :row-class-name="rowClassName"
    :customRow="customRow"
    class="file-list-view"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'name'">
        <div
          class="name-cell"
          :class="{ 'name-cell--folder': record.type === 'folder', 'name-cell--draggable': draggable }"
          :draggable="draggable && record.type === 'file'"
          @click.stop="emit('itemClick', record as FileItem, $event)"
          @dragstart="emit('dragStart', record as FileItem, $event)"
        >
          <div class="checkbox" :class="{ 'checkbox--checked': isSelected(record) }" @click.stop="emit('toggleSelect', record as FileItem, $event)">
            <IconifyIcon v-if="isSelected(record)" icon="lucide:check" style="font-size: 10px; color: #fff;" />
          </div>
          <div class="icon-wrap">
            <div class="icon-box" :style="{ background: getFileIconClass(record).bg }">
              <IconifyIcon :icon="getFileIconClass(record).icon" :style="{ fontSize: '16px', color: getFileIconClass(record).color }" />
            </div>
            <div v-if="record.isShared" class="shared-badge" title="已分享">
              <IconifyIcon icon="lucide:link" style="font-size: 9px; color: #fff;" />
            </div>
          </div>
          <span class="name-text" :title="record.name">{{ record.name }}</span>
        </div>
      </template>
      <template v-if="column.key === 'type'">
        <Tag :color="record.type === 'folder' ? 'blue' : 'default'" size="small">
          {{ record.type === 'folder' ? '文件夹' : '文件' }}
        </Tag>
      </template>
      <template v-if="column.key === 'size'">
        <span class="size-text">{{ record.size }}</span>
      </template>
      <template v-if="column.key === 'modifyTime'">
        <span class="time-text">{{ record.modifyTime }}</span>
      </template>
      <template v-if="column.key === 'deletedTime'">
        <span class="time-text">{{ record.deletedTime || '--' }}</span>
      </template>
      <template v-if="column.key === 'originalPath'">
        <span class="path-text" :title="record.originalPath">{{ record.originalPath || '--' }}</span>
      </template>
    </template>
    <template #emptyText>
      <Empty :description="emptyDescription">
        <template #image>
          <div class="empty-image">
            <IconifyIcon icon="lucide:folder-open" style="font-size: 48px; color: #d9d9d9;" />
          </div>
        </template>
      </Empty>
    </template>
  </Table>
</template>

<style scoped>
.name-cell { display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none; }
.name-cell--folder { cursor: pointer; }
.name-cell--draggable[draggable="true"] { cursor: grab; }
.checkbox { width: 16px; height: 16px; border: 1.5px solid #d9d9d9; border-radius: 3px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; cursor: pointer; transition: all 0.15s; }
.checkbox--checked { background: #1677ff; border-color: #1677ff; }
.icon-wrap { position: relative; flex-shrink: 0; }
.icon-box { width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center; }
.shared-badge { position: absolute; bottom: -2px; right: -2px; width: 14px; height: 14px; background: #52c41a; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1.5px solid #fff; }
.name-text { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; color: #262626; }
.size-text, .time-text, .path-text { font-size: 12px; color: #8c8c8c; }
.empty-image { display: flex; justify-content: center; align-items: center; margin-bottom: 12px; }
:deep(.file-list-row--selected) { background: #e6f7ff !important; }
:deep(.file-list-row--selected:hover) { background: #bae0ff !important; }
</style>
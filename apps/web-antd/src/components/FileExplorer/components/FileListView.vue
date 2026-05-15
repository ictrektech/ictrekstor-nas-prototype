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
  rename: [file: FileItem];
  deleteFile: [file: FileItem];
  restore: [file: FileItem];
  share: [file: FileItem];
  copy: [file: FileItem];
  move: [file: FileItem];
  selectAll: [];
  clearSelection: [];
}>();

const selectedCount = computed(() => props.selectedIds.length);
const isAllSelected = computed(
  () => props.files.length > 0 && props.files.every((f) => props.selectedIds.includes(f.id)),
);
const hasSelection = computed(() => selectedCount.value > 0);

function onHeaderCheck() {
  if (isAllSelected.value) {
    emit('clearSelection');
  } else {
    emit('selectAll');
  }
}

const columns = computed(() => {
  if (props.mode === 'recycle') {
    return [
      { title: '名称', dataIndex: 'name', key: 'name', width: 320, ellipsis: true },
      { title: '类型', dataIndex: 'type', key: 'type', width: 90, align: 'center' as const },
      { title: '大小', dataIndex: 'size', key: 'size', width: 100, align: 'right' as const },
      { title: '删除时间', dataIndex: 'deletedTime', key: 'deletedTime', width: 170 },
      { title: '原路径', dataIndex: 'originalPath', key: 'originalPath', width: 240, ellipsis: true },
    ];
  }
  return [
    { title: '名称', dataIndex: 'name', key: 'name', ellipsis: true },
    { title: '类型', dataIndex: 'type', key: 'type', width: 100, align: 'center' as const },
    { title: '大小', dataIndex: 'size', key: 'size', width: 110, align: 'right' as const },
    { title: '修改时间', dataIndex: 'modifyTime', key: 'modifyTime', width: 180 },
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
    <div class="table-wrap">
      <Table
      :columns="columns"
      :data-source="files"
      :loading="loading"
      row-key="id"
      size="small"
      :pagination="false"
      :row-class-name="rowClassName"
      :customRow="customRow"
      :scroll="{ x: 'max-content' }"
      class="file-list-view"
    >
    <template #headerCell="{ column }">
      <template v-if="column.key === 'name'">
        <div class="header-check-wrap" @click.stop>
          <div
            class="checkbox header-checkbox"
            :class="{ 'checkbox--checked': isAllSelected, 'checkbox--indeterminate': hasSelection && !isAllSelected }"
            @click="onHeaderCheck"
          >
            <IconifyIcon v-if="isAllSelected" icon="lucide:check" style="font-size: var(--ict-mark-small); color: var(--ict-bg-card);" />
            <div v-else-if="hasSelection" class="indeterminate-dot" />
          </div>
          <span v-if="!hasSelection" class="header-text">全选</span>
          <span v-else class="header-text header-text--active">全选（已选中 {{ selectedCount }} 项）</span>
        </div>
      </template>
      <template v-else>{{ column.title }}</template>
    </template>
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
            <IconifyIcon v-if="isSelected(record)" icon="lucide:check" style="font-size: var(--ict-mark-small); color: var(--ict-bg-card);" />
          </div>
          <div class="icon-wrap">
            <div class="icon-box" :style="{ background: getFileIconClass(record).bg }">
              <IconifyIcon :icon="getFileIconClass(record).icon" :style="{ fontSize: '16px', color: getFileIconClass(record).color }" />
            </div>
            <div v-if="record.isShared" class="shared-badge" title="已分享">
              <IconifyIcon icon="lucide:link" style="font-size: 9px; color: var(--ict-bg-card);" />
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
            <IconifyIcon icon="lucide:folder-open" style="font-size: 48px; color: var(--ict-text-disabled);" />
          </div>
        </template>
      </Empty>
    </template>
  </Table>
  </div>
</template>

<style scoped>
/* 表格样式 */
.file-list-view {
  border-radius: 8px;
  overflow: hidden;
}
.file-list-view :deep(.ant-table-thead > tr > th) {
  background: var(--ict-bg-section);
  font-weight: 600;
  font-size: var(--ict-body-small);
  color: var(--ict-text-secondary);
  padding: 10px 12px;
}
.file-list-view :deep(.ant-table-tbody > tr > td) {
  padding: 8px 12px;
  font-size: var(--ict-mark-medium);
}
.file-list-view :deep(.ant-table-tbody > tr:hover > td) {
  background: var(--ict-bg-page);
}

/* 选中行 */
:deep(.file-list-row--selected) { background: var(--ict-primary-light) !important; }
:deep(.file-list-row--selected:hover) { background: #bae0ff !important; }

/* 名称单元格 */
.name-cell { display: inline-flex; align-items: center; gap: 8px; cursor: default; user-select: none; }
.name-cell--folder { cursor: pointer; }
.name-cell--draggable[draggable="true"] { cursor: grab; }
.name-cell--folder:hover .name-text { color: var(--ict-primary); }

/* 复选框 */
.checkbox {
  width: 16px;
  height: 16px;
  border-radius: var(--ict-radius-sm);
  border: 1.5px solid var(--ict-border);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
  transition: all 0.15s;
  background: var(--ict-bg-card);
}
.checkbox:hover { border-color: var(--ict-primary); }
.checkbox--checked { background: var(--ict-primary); border-color: var(--ict-primary); }
.checkbox--indeterminate { background: var(--ict-primary); border-color: var(--ict-primary); }
.checkbox--disabled { background: var(--ict-bg-page); border-color: var(--ict-border); cursor: not-allowed; }
.checkbox--disabled.checkbox--checked .indeterminate-dot,
.checkbox--disabled.checkbox--indeterminate .indeterminate-dot { background: var(--ict-text-tertiary); }

/* 图标 */
.icon-wrap { position: relative; display: inline-flex; flex-shrink: 0; }
.icon-box { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
.shared-badge { position: absolute; bottom: -2px; right: -2px; width: 14px; height: 14px; border-radius: 50%; background: var(--ict-primary); display: flex; align-items: center; justify-content: center; border: 1.5px solid var(--ict-bg-card); box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15); }

/* 文字 */
.name-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--ict-text-primary); transition: color 0.2s; }
.size-text, .time-text, .path-text { font-family: var(--ict-font-family); color: var(--ict-text-primary); font-size: var(--ict-body-medium); }

/* 表头 checkbox */
.header-check-wrap { display: inline-flex; align-items: center; gap: 8px; cursor: default; user-select: none; }
.header-checkbox { margin-right: 0; }
.header-text { font-size: var(--ict-body-medium); color: var(--ict-text-primary); font-weight: 400; }
.header-text--active { color: var(--ict-text-emphasis); }
.indeterminate-dot { width: 8px; height: 8px; border-radius: 2px; background: var(--ict-bg-card); }

/* 表格外层容器：确保列表区域占满宽度 */
.table-wrap { width: 100%; }

/* 空状态 */
.empty-image { display: flex; justify-content: center; align-items: center; margin-bottom: 12px; }
</style>

<script lang="ts" setup>
import { IconifyIcon } from '@vben/icons';
import { Empty } from 'ant-design-vue';
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

const props = withDefaults(defineProps<Props>(), { loading: false, draggable: false, mode: 'normal', emptyDescription: '暂无文件' });
const emit = defineEmits<{
  itemClick: [file: FileItem, event: MouseEvent];
  toggleSelect: [file: FileItem, event?: MouseEvent];
  contextMenu: [file: FileItem, event: MouseEvent];
  dragStart: [file: FileItem, event: DragEvent];
  selectAll: [];
  clearSelection: [];
}>();

const selectedCount = computed(() => props.selectedIds.length);
const isAllSelected = computed(
  () => props.files.length > 0 && props.files.every((f) => props.selectedIds.includes(f.id)),
);
const hasSelection = computed(() => selectedCount.value > 0);

function isSelected(file: FileItem) { return props.selectedIds.includes(file.id); }

function onHeaderCheck() {
  if (isAllSelected.value) {
    emit('clearSelection');
  } else {
    emit('selectAll');
  }
}
</script>

<template>
  <div class="file-grid-view" @click.stop>
    <!-- 顶部全选栏：始终明示 -->
    <div v-if="files.length > 0" class="grid-header-bar" @click.stop>
      <div
        class="checkbox grid-header-checkbox"
        :class="{ 'checkbox--checked': isAllSelected, 'checkbox--indeterminate': hasSelection && !isAllSelected }"
        @click="onHeaderCheck"
      >
        <IconifyIcon v-if="isAllSelected" icon="lucide:check" style="font-size: var(--ict-mark-small); color: var(--ict-bg-card);" />
        <div v-else-if="hasSelection" class="indeterminate-dot" />
      </div>
      <span v-if="!hasSelection" class="grid-header-text">全选</span>
      <span v-else class="grid-header-text">全选&nbsp;&nbsp;已选中 {{ selectedCount }} 项</span>
    </div>
    <div v-for="file in files" :key="file.id" class="grid-item" :class="{
      'grid-item--folder': file.type === 'folder',
      'grid-item--draggable': draggable,
      'grid-item--selected': isSelected(file),
    }" :draggable="draggable && file.type === 'file'" @click.stop="emit('itemClick', file, $event)" @contextmenu.stop="emit('contextMenu', file, $event)" @dragstart="emit('dragStart', file, $event)">
      <div class="grid-checkbox" :class="{ 'grid-checkbox--checked': isSelected(file) }" @click.stop="emit('toggleSelect', file, $event)">
        <IconifyIcon v-if="isSelected(file)" icon="lucide:check" style="font-size: var(--ict-mark-small); color: var(--ict-bg-card);" />
      </div>
      <div class="grid-icon-wrap">
        <div class="grid-icon-box" :style="{ background: getFileIconClass(file).bg }">
          <IconifyIcon :icon="getFileIconClass(file).icon" :style="{ fontSize: '32px', color: getFileIconClass(file).color }" />
        </div>
        <div v-if="file.isShared" class="grid-shared-badge" title="已分享">
          <IconifyIcon icon="lucide:link" style="font-size: var(--ict-mark-small); color: var(--ict-bg-card);" />
        </div>
      </div>
      <div class="grid-name" :title="file.name">{{ file.name }}</div>
      <div class="grid-meta"><span v-if="file.type === 'file'">{{ file.size }}</span><span v-else>文件夹</span></div>
      <div v-if="mode === 'recycle'" class="grid-meta grid-path">{{ file.originalPath || '--' }}</div>
      <div v-if="mode === 'recycle'" class="grid-meta grid-path">{{ file.deletedTime || '--' }}</div>
    </div>
    <Empty v-if="files.length === 0 && !loading" :description="emptyDescription" class="grid-empty">
      <template #image><div class="empty-image"><IconifyIcon icon="lucide:folder-open" style="font-size: 48px; color: var(--ict-text-disabled);" /></div></template>
    </Empty>
  </div>
</template>

<style scoped>
.file-grid-view { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 12px; }
.grid-item { position: relative; display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 12px 8px; border-radius: 8px; cursor: pointer; transition: all 0.2s; border: 1px solid transparent; }
.grid-item:hover { background: var(--ict-bg-page); }
.grid-item--selected { background: var(--ict-primary-light) !important; border-color: var(--ict-primary); }
.grid-item--draggable[draggable="true"] { cursor: grab; }
.grid-checkbox { position: absolute; top: 6px; left: 6px; width: 16px; height: 16px; border: 1.5px solid var(--ict-border); border-radius: var(--ict-radius-sm); display: flex; align-items: center; justify-content: center; z-index: 2; transition: all 0.15s; }
.grid-checkbox--checked { background: var(--ict-primary); border-color: var(--ict-primary); }
.grid-checkbox--indeterminate { background: var(--ict-primary); border-color: var(--ict-primary); }
.grid-icon-wrap { position: relative; }
.grid-icon-box { width: 56px; height: 56px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
.grid-shared-badge { position: absolute; bottom: -2px; right: -2px; width: 16px; height: 16px; background: var(--ict-success); border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1.5px solid var(--ict-bg-card); }
.grid-name { font-size: var(--ict-body-medium); color: var(--ict-text-primary); text-align: center; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.grid-meta { font-size: var(--ict-body-medium); color: var(--ict-text-primary); }
.grid-path { font-size: var(--ict-body-medium); max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.grid-empty { grid-column: 1 / -1; }
.empty-image { display: flex; justify-content: center; align-items: center; margin-bottom: 12px; }

/* 顶部全选栏 */
.grid-header-bar { display: flex; align-items: center; gap: 8px; grid-column: 1 / -1; padding: 0 4px 8px; border-bottom: 1px solid var(--ict-border-light); margin-bottom: 4px; }
.grid-header-checkbox { margin-right: 0; }
.grid-header-text { font-size: var(--ict-body-medium); color: var(--ict-text-primary); }

/* 复选框 */
.checkbox { width: 16px; height: 16px; border: 1.5px solid var(--ict-border); border-radius: var(--ict-radius-sm); display: flex; align-items: center; justify-content: center; flex-shrink: 0; cursor: pointer; transition: all 0.15s; background: var(--ict-bg-card); }
.checkbox:hover { border-color: var(--ict-primary); }
.checkbox--checked { background: var(--ict-primary); border-color: var(--ict-primary); }
.checkbox--indeterminate { background: var(--ict-primary); border-color: var(--ict-primary); }
.indeterminate-dot { width: 8px; height: 8px; border-radius: 2px; background: var(--ict-bg-card); }
</style>

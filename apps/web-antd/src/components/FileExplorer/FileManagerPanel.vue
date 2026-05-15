<script lang="ts" setup>
import { IconifyIcon } from '@vben/icons';
import { computed, ref } from 'vue';
import type { FileItem, BreadcrumbItem } from './types';
import FileContextMenu from './components/FileContextMenu.vue';
import FileGridView from './components/FileGridView.vue';
import FileListView from './components/FileListView.vue';
import FileToolbar from './components/FileToolbar.vue';

interface Props {
  files: FileItem[];
  breadcrumbPath: BreadcrumbItem[];
  loading?: boolean;
  searchText?: string;
  viewMode?: 'list' | 'grid';
  showNewFolder?: boolean;
  emptyDescription?: string;
  rootKey?: string;
  draggable?: boolean;
  dropZone?: boolean;
  dragSourceKey?: string;
  dropHint?: string;
  panelTitle?: string;
  mode?: 'normal' | 'recycle';
  selectedFileIds?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  loading: false, searchText: '', viewMode: 'list', showNewFolder: true,
  emptyDescription: '暂无文件', rootKey: 'root', draggable: false,
  dropZone: false, dragSourceKey: 'panel', dropHint: '释放以传输到此处',
  panelTitle: '', mode: 'normal', selectedFileIds: () => [],
});

const emit = defineEmits<{
  'update:searchText': [value: string];
  'update:viewMode': [mode: 'list' | 'grid'];
  'update:selectedFileIds': [ids: string[]];
  breadcrumbClick: [item: BreadcrumbItem];
  refresh: []; newFolder: []; upload: [];
  openFolder: [file: FileItem];
  rename: [file: FileItem]; deleteFile: [file: FileItem];
  restore: [file: FileItem]; dragStart: [file: FileItem, event: DragEvent];
  drop: [files: FileItem[], event: DragEvent];
  dragOverChange: [isOver: boolean];
  batchDelete: [files: FileItem[]];
  batchRestore: [files: FileItem[]];
  share: [file: FileItem];
  copy: [file: FileItem]; move: [file: FileItem];
  batchCopy: [files: FileItem[]]; batchMove: [files: FileItem[]];
}>();

const filteredFiles = computed(() => {
  if (!props.searchText) return props.files;
  const kw = props.searchText.toLowerCase();
  return props.files.filter((f) => f.name.toLowerCase().includes(kw));
});

const sortedFiles = computed(() => [...filteredFiles.value].sort((a, b) => {
  if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
  return a.name.localeCompare(b.name);
}));

const internalSelectedIds = computed({
  get: () => props.selectedFileIds,
  set: (val) => emit('update:selectedFileIds', val),
});

function getSelectedFiles() {
  return sortedFiles.value.filter((f) => internalSelectedIds.value.includes(f.id));
}

function toggleSelect(file: FileItem, event?: MouseEvent) {
  const ids = [...internalSelectedIds.value];
  const idx = ids.indexOf(file.id);
  if (event?.ctrlKey || event?.metaKey) {
    idx > -1 ? ids.splice(idx, 1) : ids.push(file.id);
  } else if (event?.shiftKey && ids.length > 0) {
    const cur = sortedFiles.value.findIndex((f) => f.id === file.id);
    const lastId = ids[ids.length - 1];
    const last = sortedFiles.value.findIndex((f) => f.id === lastId);
    const start = Math.min(cur, last), end = Math.max(cur, last);
    internalSelectedIds.value = [...new Set([...ids, ...sortedFiles.value.slice(start, end + 1).map((f) => f.id)])];
    return;
  } else {
    idx > -1 ? ids.splice(idx, 1) : ids.push(file.id);
  }
  internalSelectedIds.value = ids;
}

function handleItemClick(file: FileItem, event: MouseEvent) {
  if (file.type === 'folder') emit('openFolder', file);
  else toggleSelect(file, event);
}

function selectAll() { internalSelectedIds.value = sortedFiles.value.map((f) => f.id); }
function clearSelection() { internalSelectedIds.value = []; }

function emitBatch(name: 'batchDelete' | 'batchRestore' | 'batchCopy' | 'batchMove') {
  const files = getSelectedFiles();
  if (files.length) emit(name, files);
}

// 右键菜单
const ctxVisible = ref(false);
const ctxPos = ref({ x: 0, y: 0 });
const ctxFile = ref<FileItem | null>(null);

function onContextMenu(file: FileItem, event: MouseEvent) {
  event.preventDefault(); event.stopPropagation();
  ctxFile.value = file; ctxPos.value = { x: event.clientX, y: event.clientY }; ctxVisible.value = true;
}

function onCtxAction(action: string, file: FileItem) {
  switch (action) {
    case 'rename': emit('rename', file); break;
    case 'copy': emit('copy', file); break;
    case 'move': emit('move', file); break;
    case 'delete': emit('deleteFile', file); break;
    case 'restore': emit('restore', file); break;
  }
}

// 拖拽
const isDragOver = ref(false);
function onDragStart(file: FileItem, event: DragEvent) {
  if (!props.draggable) return;
  event.dataTransfer?.setData('application/json', JSON.stringify({ source: props.dragSourceKey, file }));
  event.dataTransfer!.effectAllowed = 'copyMove';
  emit('dragStart', file, event);
}
function onDragOver(event: DragEvent) {
  if (!props.dropZone) return;
  event.preventDefault(); event.dataTransfer!.dropEffect = 'copy';
  isDragOver.value = true; emit('dragOverChange', true);
}
function onDragLeave(event: DragEvent) {
  if (!props.dropZone) return;
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const { clientX: x, clientY: y } = event;
  if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
    isDragOver.value = false; emit('dragOverChange', false);
  }
}
function onDrop(event: DragEvent) {
  if (!props.dropZone) return;
  event.preventDefault(); isDragOver.value = false; emit('dragOverChange', false);
  try {
    const dataStr = event.dataTransfer?.getData('application/json');
    if (dataStr) {
      const data = JSON.parse(dataStr);
      if (data.source === props.dragSourceKey) return;
      if (data.file) emit('drop', [data.file], event);
    }
  } catch { /* ignore */ }
}
</script>

<template>
  <div class="fmp" :class="{ 'fmp--drop-zone': dropZone, 'fmp--drag-over': isDragOver && dropZone }"
    @dragover="onDragOver" @dragleave="onDragLeave" @drop="onDrop" @click="clearSelection">
    <FileToolbar :panel-title="panelTitle" :breadcrumb-path="breadcrumbPath" :search-text="searchText"
      :view-mode="viewMode" :show-new-folder="showNewFolder" :mode="mode" :selected-file-ids="selectedFileIds"
      :files="sortedFiles" @update:search-text="$emit('update:searchText', $event)"
      @update:view-mode="$emit('update:viewMode', $event)" @breadcrumb-click="$emit('breadcrumbClick', $event)"
      @refresh="$emit('refresh')" @new-folder="$emit('newFolder')" @upload="$emit('upload')"
      @select-all="selectAll" @clear-selection="clearSelection" @rename="$emit('rename', $event)"
      @share="$emit('share', $event)" @batch-delete="emitBatch('batchDelete')" @batch-restore="emitBatch('batchRestore')"
      @batch-copy="emitBatch('batchCopy')" @batch-move="emitBatch('batchMove')" />

    <!-- 拖拽遮罩 -->
    <div v-if="isDragOver && dropZone" class="fmp-drop-overlay">
      <IconifyIcon icon="lucide:arrow-down-circle" style="font-size: 40px; color: #1677ff;" />
      <span>{{ dropHint }}</span>
    </div>

    <!-- 文件内容 -->
    <div class="fmp-body" @click.stop>
      <FileListView v-if="viewMode === 'list'" :files="sortedFiles" :loading="loading"
        :selected-ids="selectedFileIds" :draggable="draggable" :mode="mode" :empty-description="emptyDescription"
        @item-click="handleItemClick" @toggle-select="toggleSelect" @context-menu="onContextMenu" @drag-start="onDragStart"
        @select-all="selectAll" @clear-selection="clearSelection"
        @rename="$emit('rename', $event)" @delete-file="$emit('deleteFile', $event)" @restore="$emit('restore', $event)"
        @share="$emit('share', $event)" @copy="$emit('copy', $event)" @move="$emit('move', $event)" />
      <FileGridView v-else :files="sortedFiles" :loading="loading" :selected-ids="selectedFileIds"
        :draggable="draggable" :mode="mode" :empty-description="emptyDescription"
        @item-click="handleItemClick" @toggle-select="toggleSelect" @context-menu="onContextMenu" @drag-start="onDragStart"
        @select-all="selectAll" @clear-selection="clearSelection" />
    </div>

    <FileContextMenu v-model:visible="ctxVisible" :x="ctxPos.x" :y="ctxPos.y" :file="ctxFile" :mode="mode"
      @action="onCtxAction" />
  </div>
</template>

<style scoped>
.fmp { display: flex; flex-direction: column; flex: 1; height: 100%; overflow: hidden; background: #fff; position: relative; }
.fmp--drop-zone { border-style: dashed; border-color: #d9d9d9; }
.fmp--drag-over { border-color: #1677ff; background: #e6f7ff; }
.fmp-drop-overlay { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; background: rgba(22,119,255,0.06); z-index: 10; pointer-events: none; font-size: 16px; color: #1677ff; font-weight: 500; }
.fmp-body { flex: 1; overflow: auto; padding: 20px; }
</style>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import {
  Button,
  Input,
  Table,
  Empty,
  Radio,
  Tag,
  Tooltip,
  Breadcrumb,
  Popconfirm,
  Menu,
  Dropdown,
} from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import type { FileItem, BreadcrumbItem } from './types';
import { getFileIconClass } from './utils';

interface Props {
  files: FileItem[];
  breadcrumbPath: BreadcrumbItem[];
  loading?: boolean;
  /** 搜索关键词 */
  searchText?: string;
  /** 视图模式 */
  viewMode?: 'list' | 'grid';
  /** 是否显示新建文件夹按钮 */
  showNewFolder?: boolean;
  /** 自定义表格列（留空使用默认列） */
  columns?: any[];
  /** 空状态描述 */
  emptyDescription?: string;
  /** 面包屑根节点点击后的目标 key */
  rootKey?: string;
  /** 是否开启文件拖拽 */
  draggable?: boolean;
  /** 是否作为放置区域（接收拖拽文件） */
  dropZone?: boolean;
  /** 拖拽数据标识前缀，用于区分来源 */
  dragSourceKey?: string;
  /** 拖拽放置时的提示文本 */
  dropHint?: string;
  /** 面板标题（显示在面包屑左侧） */
  panelTitle?: string;
  /** 操作模式：normal 普通文件管理 / recycle 回收站 */
  mode?: 'normal' | 'recycle';
  /** 当前选中的文件 ID 列表 */
  selectedFileIds?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  searchText: '',
  viewMode: 'list',
  showNewFolder: true,
  emptyDescription: '暂无文件',
  rootKey: 'root',
  draggable: false,
  dropZone: false,
  dragSourceKey: 'panel',
  dropHint: '释放以传输到此处',
  panelTitle: '',
  mode: 'normal',
  selectedFileIds: () => [],
});

const emit = defineEmits<{
  'update:searchText': [value: string];
  'update:viewMode': [mode: 'list' | 'grid'];
  'update:selectedFileIds': [ids: string[]];
  /** 面包屑点击 */
  breadcrumbClick: [item: BreadcrumbItem];
  /** 刷新 */
  refresh: [];
  /** 新建文件夹 */
  newFolder: [];
  /** 上传 */
  upload: [];
  /** 打开文件夹（点击文件夹行/卡片时） */
  openFolder: [file: FileItem];
  /** 重命名 */
  rename: [file: FileItem];
  /** 删除 / 回收站彻底删除 */
  deleteFile: [file: FileItem];
  /** 回收站：还原 */
  restore: [file: FileItem];
  /** 文件拖拽开始 */
  dragStart: [file: FileItem, event: DragEvent];
  /** 文件拖放完成 */
  drop: [files: FileItem[], event: DragEvent];
  /** 拖拽悬停状态变化 */
  dragOverChange: [isOver: boolean];
  /** 批量删除 */
  batchDelete: [files: FileItem[]];
  /** 批量还原 */
  batchRestore: [files: FileItem[]];
  /** 分享（选中单个文件夹时） */
  share: [file: FileItem];
  /** 复制文件 */
  copy: [file: FileItem];
  /** 移动文件 */
  move: [file: FileItem];
  /** 批量复制 */
  batchCopy: [files: FileItem[]];
  /** 批量移动 */
  batchMove: [files: FileItem[]];
}>();

const internalSearch = computed({
  get: () => props.searchText,
  set: (val) => emit('update:searchText', val),
});

const internalViewMode = computed({
  get: () => props.viewMode,
  set: (val) => emit('update:viewMode', val as 'list' | 'grid'),
});

const filteredFiles = computed(() => {
  if (!props.searchText) return props.files;
  const kw = props.searchText.toLowerCase();
  return props.files.filter((f) => f.name.toLowerCase().includes(kw));
});

const sortedFiles = computed(() => {
  return [...filteredFiles.value].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
});

const tableColumns = computed(() => {
  if (props.columns) return props.columns;
  if (props.mode === 'recycle') {
    return [
      { title: '名称', dataIndex: 'name', key: 'name', width: 280, ellipsis: true },
      { title: '类型', dataIndex: 'type', key: 'type', width: 80, align: 'center' as const },
      { title: '大小', dataIndex: 'size', key: 'size', width: 90, align: 'right' as const },
      { title: '删除时间', dataIndex: 'deletedTime', key: 'deletedTime', width: 150 },
      { title: '原路径', dataIndex: 'originalPath', key: 'originalPath', width: 220, ellipsis: true },
      { title: '操作', key: 'action', width: 140, align: 'center' as const },
    ];
  }
  return [
    { title: '名称', dataIndex: 'name', key: 'name', width: 320, ellipsis: true },
    { title: '类型', dataIndex: 'type', key: 'type', width: 90, align: 'center' as const },
    { title: '大小', dataIndex: 'size', key: 'size', width: 100, align: 'right' as const },
    { title: '修改时间', dataIndex: 'modifyTime', key: 'modifyTime', width: 170 },
    { title: '操作', key: 'action', width: 140, align: 'center' as const },
  ];
});

const emptyDesc = computed(() => props.emptyDescription);

function onRestore(file: FileItem) {
  emit('restore', file);
}

const isDragOver = ref(false);

function onBreadcrumbClick(item: BreadcrumbItem) {
  emit('breadcrumbClick', item);
}

function onRefresh() {
  emit('refresh');
}

function onNewFolder() {
  emit('newFolder');
}

function onUpload() {
  emit('upload');
}

function onOpenFolder(file: FileItem) {
  if (file.type === 'folder') {
    emit('openFolder', file);
  }
}

function onRename(file: FileItem) {
  emit('rename', file);
}

function onDelete(file: FileItem) {
  emit('deleteFile', file);
}

// ═══ 多选相关 ═══

const internalSelectedIds = computed({
  get: () => props.selectedFileIds,
  set: (val) => emit('update:selectedFileIds', val),
});

const hasSelection = computed(() => internalSelectedIds.value.length > 0);
const selectionCount = computed(() => internalSelectedIds.value.length);
const isSingleSelection = computed(() => selectionCount.value === 1);
const singleSelectedFile = computed(() => {
  if (!isSingleSelection.value) return null;
  return sortedFiles.value.find((f) => internalSelectedIds.value.includes(f.id)) || null;
});
const canShare = computed(() => {
  if (!singleSelectedFile.value) return false;
  return singleSelectedFile.value.type === 'folder';
});
const isAllSelected = computed(() => {
  return sortedFiles.value.length > 0 && sortedFiles.value.every((f) => internalSelectedIds.value.includes(f.id));
});

function isSelected(file: FileItem) {
  return internalSelectedIds.value.includes(file.id);
}

/** 点击文件/文件夹名称时的统一处理 */
function handleItemClick(file: FileItem, event: MouseEvent) {
  if (file.type === 'folder') {
    onOpenFolder(file);
  } else {
    toggleSelect(file, event);
  }
}

function toggleSelect(file: FileItem, event?: MouseEvent) {
  const ids = [...internalSelectedIds.value];
  const idx = ids.indexOf(file.id);
  if (event?.ctrlKey || event?.metaKey) {
    // Ctrl/Cmd 点击：切换单个
    if (idx > -1) ids.splice(idx, 1);
    else ids.push(file.id);
  } else if (event?.shiftKey && ids.length > 0) {
    // Shift 点击：范围选择
    const currentIdx = sortedFiles.value.findIndex((f) => f.id === file.id);
    const lastId = ids[ids.length - 1];
    const lastIdx = sortedFiles.value.findIndex((f) => f.id === lastId);
    const start = Math.min(currentIdx, lastIdx);
    const end = Math.max(currentIdx, lastIdx);
    const rangeIds = sortedFiles.value
      .slice(start, end + 1)
      .map((f) => f.id);
    // 合并已有选中与范围，去重
    const newSet = new Set([...ids, ...rangeIds]);
    internalSelectedIds.value = [...newSet];
    return;
  } else {
    // 普通点击：多选默认——切换当前项
    if (idx > -1) ids.splice(idx, 1);
    else ids.push(file.id);
  }
  internalSelectedIds.value = ids;
}

function clearSelection() {
  internalSelectedIds.value = [];
}

function selectAll() {
  internalSelectedIds.value = sortedFiles.value.map((f) => f.id);
}

function getSelectedFiles() {
  return sortedFiles.value.filter((f) => internalSelectedIds.value.includes(f.id));
}

function handleBatchDelete() {
  const files = getSelectedFiles();
  if (files.length === 0) return;
  emit('batchDelete', files);
}

function handleBatchRestore() {
  const files = getSelectedFiles();
  if (files.length === 0) return;
  emit('batchRestore', files);
}

function handleBatchCopy() {
  const files = getSelectedFiles();
  if (files.length === 0) return;
  emit('batchCopy', files);
}

function handleBatchMove() {
  const files = getSelectedFiles();
  if (files.length === 0) return;
  emit('batchMove', files);
}

// ═══ 右键菜单相关 ═══

const contextMenuVisible = ref(false);
const contextMenuPos = ref({ x: 0, y: 0 });
const contextMenuFile = ref<FileItem | null>(null);

function onRowContextMenu(file: FileItem, event: MouseEvent) {
  event.preventDefault();
  event.stopPropagation();
  contextMenuFile.value = file;
  contextMenuPos.value = { x: event.clientX, y: event.clientY };
  contextMenuVisible.value = true;
}

function closeContextMenu() {
  contextMenuVisible.value = false;
}

function handleContextMenuAction(action: string) {
  const file = contextMenuFile.value;
  if (!file) return;
  switch (action) {
    case 'rename':
      emit('rename', file);
      break;
    case 'copy':
      emit('copy', file);
      break;
    case 'move':
      emit('move', file);
      break;
    case 'delete':
      emit('deleteFile', file);
      break;
    case 'restore':
      emit('restore', file);
      break;
  }
  closeContextMenu();
}

// ═══ 拖拽相关 ═══

function onRowDragStart(file: FileItem, event: DragEvent) {
  if (!props.draggable) return;
  const data = JSON.stringify({
    source: props.dragSourceKey,
    file: file,
  });
  event.dataTransfer?.setData('application/json', data);
  event.dataTransfer!.effectAllowed = 'copyMove';
  emit('dragStart', file, event);
}

function onPanelDragOver(event: DragEvent) {
  if (!props.dropZone) return;
  event.preventDefault();
  event.dataTransfer!.dropEffect = 'copy';
  isDragOver.value = true;
  emit('dragOverChange', true);
}

function onPanelDragLeave(event: DragEvent) {
  if (!props.dropZone) return;
  // 只有当真正离开面板时才取消高亮
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const x = event.clientX;
  const y = event.clientY;
  if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
    isDragOver.value = false;
    emit('dragOverChange', false);
  }
}

function onPanelDrop(event: DragEvent) {
  if (!props.dropZone) return;
  event.preventDefault();
  isDragOver.value = false;
  emit('dragOverChange', false);

  try {
    const dataStr = event.dataTransfer?.getData('application/json');
    if (dataStr) {
      const data = JSON.parse(dataStr);
      // 阻止自己拖到自己
      if (data.source === props.dragSourceKey) return;
      if (data.file) {
        emit('drop', [data.file], event);
      }
    }
  } catch {
    // 忽略解析错误
  }
}
</script>

<script lang="ts">
import { ref } from 'vue';
</script>

<template>
  <div
    class="file-manager-panel"
    :class="{
      'file-manager-panel--drop-zone': dropZone,
      'file-manager-panel--drag-over': isDragOver && dropZone,
    }"
    @dragover="onPanelDragOver"
    @dragleave="onPanelDragLeave"
    @drop="onPanelDrop"
    @click="clearSelection"
  >
    <!-- 工具栏 -->
    <div class="file-manager-panel__toolbar">
      <!-- 第一行：文件路径 -->
      <div class="file-manager-panel__path-row">
        <div v-if="panelTitle" class="file-manager-panel__panel-title">
          <IconifyIcon icon="lucide:hard-drive" style="font-size: 14px; color: #1677ff;" />
          <span>{{ panelTitle }}</span>
        </div>
        <div class="file-manager-panel__breadcrumb-scroll">
          <div class="file-manager-panel__breadcrumb-inner">
            <Breadcrumb class="file-manager-panel__breadcrumb">
              <Breadcrumb.Item
                v-for="(item, idx) in breadcrumbPath"
                :key="item.key"
              >
                <a
                  v-if="idx < breadcrumbPath.length - 1"
                  class="file-manager-panel__breadcrumb-link"
                  @click="onBreadcrumbClick(item)"
                >
                  {{ item.title }}
                </a>
                <span v-else class="file-manager-panel__breadcrumb-current">{{ item.title }}</span>
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
        </div>
      </div>
      <!-- 第二行：搜索与操作 -->
      <div class="file-manager-panel__actions-row">
        <!-- 批量操作栏（有选中时显示） -->
        <div v-if="hasSelection" class="file-manager-panel__batch-bar" @click.stop>
          <span class="batch-bar__text">
            已选中 <strong>{{ selectionCount }}</strong> 项
          </span>
          <div class="batch-bar__actions">
            <template v-if="mode === 'recycle'">
              <!-- 全选/反全选 -->
              <Button size="small" @click="selectAll">
                <IconifyIcon icon="lucide:check-square" style="font-size: 12px;" />
                {{ isAllSelected ? '反全选' : '全选' }}
              </Button>
              <Button size="small" @click="handleBatchRestore">
                <IconifyIcon icon="lucide:rotate-ccw" style="font-size: 12px;" />
                批量还原
              </Button>
              <!-- 危险操作下沉到二级菜单 -->
              <Dropdown placement="bottomRight">
                <Button size="small">
                  <IconifyIcon icon="lucide:more-horizontal" style="font-size: 12px;" />
                  更多
                </Button>
                <template #overlay>
                  <Menu>
                    <Menu.Item key="batch-delete" danger @click="handleBatchDelete">
                      <span class="batch-menu-item batch-menu-item--danger">
                        <IconifyIcon icon="lucide:trash-2" style="font-size: 13px;" />
                        彻底删除
                      </span>
                    </Menu.Item>
                  </Menu>
                </template>
              </Dropdown>
            </template>
            <template v-else>
              <!-- 全选/反全选 -->
              <Button size="small" @click="isAllSelected ? clearSelection() : selectAll()">
                <IconifyIcon icon="lucide:check-square" style="font-size: 12px;" />
                {{ isAllSelected ? '反全选' : '全选' }}
              </Button>
              <Button size="small" @click="clearSelection">
                <IconifyIcon icon="lucide:x" style="font-size: 12px;" />
                取消选择
              </Button>
              <!-- 单选时：重命名 -->
              <Button
                v-if="isSingleSelection"
                size="small"
                @click="singleSelectedFile && onRename(singleSelectedFile)"
              >
                <IconifyIcon icon="lucide:pencil" style="font-size: 12px;" />
                重命名
              </Button>
              <!-- 单选文件夹时：分享 -->
              <Button
                v-if="canShare"
                size="small"
                @click="singleSelectedFile && emit('share', singleSelectedFile)"
              >
                <IconifyIcon icon="lucide:share-2" style="font-size: 12px;" />
                <span class="batch-btn-text">分享</span>
              </Button>
              <!-- 复制 -->
              <Button size="small" @click="handleBatchCopy">
                <IconifyIcon icon="lucide:copy" style="font-size: 12px;" />
                <span class="batch-btn-text">复制</span>
              </Button>
              <!-- 移动 -->
              <Button size="small" @click="handleBatchMove">
                <IconifyIcon icon="lucide:move" style="font-size: 12px;" />
                <span class="batch-btn-text">移动</span>
              </Button>
              <!-- 更多操作 -->
              <Dropdown placement="bottomRight">
                <Button size="small">
                  <IconifyIcon icon="lucide:more-horizontal" style="font-size: 12px;" />
                  <span class="batch-btn-text">更多</span>
                </Button>
                <template #overlay>
                  <Menu>
                    <Menu.Item key="batch-delete" danger @click="handleBatchDelete">
                      <span class="batch-menu-item batch-menu-item--danger">
                        <IconifyIcon icon="lucide:trash-2" style="font-size: 13px;" />
                        <span class="batch-btn-text">批量删除</span>
                      </span>
                    </Menu.Item>
                  </Menu>
                </template>
              </Dropdown>
            </template>
          </div>
        </div>
        <!-- 常规工具栏 -->
        <div class="file-manager-panel__actions" @click.stop>
          <Input
            v-model:value="internalSearch"
            placeholder="搜索文件"
            class="file-manager-panel__search"
            allow-clear
          >
            <template #prefix>
              <IconifyIcon icon="lucide:search" style="font-size: 14px; color: #bfbfbf;" />
            </template>
          </Input>
          <Radio.Group v-model:value="internalViewMode" size="small" class="file-manager-panel__view-toggle">
            <Radio.Button value="list">
              <IconifyIcon icon="lucide:list" style="font-size: 13px;" />
            </Radio.Button>
            <Radio.Button value="grid">
              <IconifyIcon icon="lucide:layout-grid" style="font-size: 13px;" />
            </Radio.Button>
          </Radio.Group>
          <Tooltip title="刷新">
            <Button size="small" class="file-manager-panel__refresh" @click="onRefresh">
              <IconifyIcon icon="lucide:refresh-cw" style="font-size: 13px;" />
            </Button>
          </Tooltip>
          <Tooltip title="新建文件夹">
            <Button
              v-if="mode !== 'recycle'"
              size="small"
              class="file-manager-panel__new-folder"
              @click="onNewFolder"
            >
              <IconifyIcon icon="lucide:folder-plus" style="font-size: 13px;" />
            </Button>
          </Tooltip>
          <Tooltip title="上传">
            <Button
              v-if="mode !== 'recycle'"
              size="small"
              class="file-manager-panel__upload"
              @click="onUpload"
            >
              <IconifyIcon icon="lucide:upload" style="font-size: 13px;" />
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>

    <!-- 拖拽提示遮罩 -->
    <div v-if="isDragOver && dropZone" class="file-manager-panel__drop-overlay">
      <div class="file-manager-panel__drop-overlay-content">
        <IconifyIcon icon="lucide:arrow-down-circle" style="font-size: 40px; color: #1677ff;" />
        <span class="file-manager-panel__drop-overlay-text">{{ dropHint }}</span>
      </div>
    </div>

    <!-- 文件内容区 -->
    <div class="file-manager-panel__body" @click.stop>
      <!-- 列表视图 -->
      <Table
        v-if="viewMode === 'list'"
        :columns="tableColumns"
        :data-source="sortedFiles"
        :loading="loading"
        row-key="id"
        size="small"
        :pagination="false"
        :row-class-name="(record: any) => isSelected(record) ? 'file-manager-panel__row--selected' : ''"
        :customRow="(record: any) => ({ onContextmenu: (e: MouseEvent) => onRowContextMenu(record as FileItem, e) })"
        class="file-manager-panel__table"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <div
              class="file-manager-panel__name-cell"
              :class="{
                'file-manager-panel__name-cell--folder': record.type === 'folder',
                'file-manager-panel__name-cell--draggable': draggable,
              }"
              :draggable="draggable && record.type === 'file'"
              @click.stop="handleItemClick(record as FileItem, $event)"
              @dragstart="onRowDragStart(record as FileItem, $event)"
            >
              <div
                class="file-manager-panel__checkbox"
                :class="{ 'file-manager-panel__checkbox--checked': isSelected(record) }"
                @click.stop="toggleSelect(record as FileItem, $event)"
              >
                <IconifyIcon
                  v-if="isSelected(record)"
                  icon="lucide:check"
                  style="font-size: 10px; color: #fff;"
                />
              </div>
              <div class="file-manager-panel__icon-wrap">
                <div
                  class="file-manager-panel__icon-box"
                  :style="{ background: getFileIconClass(record).bg }"
                >
                  <IconifyIcon
                    :icon="getFileIconClass(record).icon"
                    :style="{ fontSize: '16px', color: getFileIconClass(record).color }"
                  />
                </div>
                <!-- 已分享标识 -->
                <div
                  v-if="record.isShared"
                  class="file-manager-panel__shared-badge"
                  title="已分享"
                >
                  <IconifyIcon icon="lucide:link" style="font-size: 9px; color: #fff;" />
                </div>
              </div>
              <span class="file-manager-panel__name-text" :title="record.name">{{ record.name }}</span>
            </div>
          </template>
          <template v-if="column.key === 'type'">
            <Tag :color="record.type === 'folder' ? 'blue' : 'default'" size="small">
              {{ record.type === 'folder' ? '文件夹' : '文件' }}
            </Tag>
          </template>
          <template v-if="column.key === 'size'">
            <span class="file-manager-panel__size">{{ record.size }}</span>
          </template>
          <template v-if="column.key === 'modifyTime'">
            <span class="file-manager-panel__time">{{ record.modifyTime }}</span>
          </template>
          <template v-if="column.key === 'deletedTime'">
            <span class="file-manager-panel__time">{{ record.deletedTime || '--' }}</span>
          </template>
          <template v-if="column.key === 'originalPath'">
            <span class="file-manager-panel__path" :title="record.originalPath">{{ record.originalPath || '--' }}</span>
          </template>
        </template>
        <template #emptyText>
          <Empty :description="emptyDescription" class="file-manager-panel__empty">
            <template #image>
              <div class="file-manager-panel__empty-image">
                <IconifyIcon icon="lucide:folder-open" style="font-size: 48px; color: #d9d9d9;" />
              </div>
            </template>
          </Empty>
        </template>
      </Table>

      <!-- 网格视图 -->
      <div v-else class="file-manager-panel__grid" @click.stop>
        <div
          v-for="file in sortedFiles"
          :key="file.id"
          class="file-manager-panel__grid-item"
          :class="{
            'file-manager-panel__grid-item--folder': file.type === 'folder',
            'file-manager-panel__grid-item--draggable': draggable,
            'file-manager-panel__grid-item--selected': isSelected(file),
          }"
          :draggable="draggable && file.type === 'file'"
          @click.stop="handleItemClick(file as FileItem, $event)"
          @contextmenu.stop="onRowContextMenu(file as FileItem, $event)"
          @dragstart="onRowDragStart(file as FileItem, $event)"
        >
          <!-- 复选框 -->
          <div
            class="file-manager-panel__grid-checkbox"
            :class="{ 'file-manager-panel__grid-checkbox--checked': isSelected(file) }"
            @click.stop="toggleSelect(file as FileItem, $event)"
          >
            <IconifyIcon
              v-if="isSelected(file)"
              icon="lucide:check"
              style="font-size: 10px; color: #fff;"
            />
          </div>
          <div class="file-manager-panel__grid-icon-wrap">
            <div
              class="file-manager-panel__grid-icon-box"
              :style="{ background: getFileIconClass(file).bg }"
            >
              <IconifyIcon
                :icon="getFileIconClass(file).icon"
                :style="{ fontSize: '32px', color: getFileIconClass(file).color }"
              />
            </div>
            <!-- 已分享标识 -->
            <div
              v-if="file.isShared"
              class="file-manager-panel__grid-shared-badge"
              title="已分享"
            >
              <IconifyIcon icon="lucide:link" style="font-size: 10px; color: #fff;" />
            </div>
          </div>
          <div class="file-manager-panel__grid-name" :title="file.name">{{ file.name }}</div>
          <div class="file-manager-panel__grid-meta">
            <span v-if="file.type === 'file'">{{ file.size }}</span>
            <span v-else>文件夹</span>
          </div>
          <div v-if="mode === 'recycle'" class="file-manager-panel__grid-meta file-manager-panel__grid-path">
            {{ file.originalPath || '--' }}
          </div>
          <div v-if="mode === 'recycle'" class="file-manager-panel__grid-meta file-manager-panel__grid-path">
            {{ file.deletedTime || '--' }}
          </div>
        </div>
        <Empty
          v-if="sortedFiles.length === 0 && !loading"
          :description="emptyDescription"
          class="file-manager-panel__grid-empty"
        >
          <template #image>
            <div class="file-manager-panel__empty-image">
              <IconifyIcon icon="lucide:folder-open" style="font-size: 48px; color: #d9d9d9;" />
            </div>
          </template>
        </Empty>
      </div>
    </div>

    <!-- 右键菜单 -->
    <Teleport to="body">
      <div
        v-if="contextMenuVisible"
        class="file-manager-panel__context-menu-overlay"
        @click="closeContextMenu"
        @contextmenu.prevent="closeContextMenu"
      >
        <div
          class="file-manager-panel__context-menu"
          :style="{ left: `${contextMenuPos.x}px`, top: `${contextMenuPos.y}px` }"
          @click.stop
        >
          <Menu>
            <template v-if="mode === 'recycle' && contextMenuFile">
              <Menu.Item key="restore" @click="handleContextMenuAction('restore')">
                <span class="context-menu-item">
                  <IconifyIcon icon="lucide:rotate-ccw" style="font-size: 13px; color: #1677ff;" />
                  还原
                </span>
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item key="delete" danger @click="handleContextMenuAction('delete')">
                <span class="context-menu-item context-menu-item--danger">
                  <IconifyIcon icon="lucide:trash-2" style="font-size: 13px;" />
                  彻底删除
                </span>
              </Menu.Item>
            </template>
            <template v-else-if="contextMenuFile">
              <Menu.Item key="rename" @click="handleContextMenuAction('rename')">
                <span class="context-menu-item">
                  <IconifyIcon icon="lucide:pencil" style="font-size: 13px;" />
                  重命名
                </span>
              </Menu.Item>
              <Menu.Item key="copy" @click="handleContextMenuAction('copy')">
                <span class="context-menu-item">
                  <IconifyIcon icon="lucide:copy" style="font-size: 13px; color: #1677ff;" />
                  复制
                </span>
              </Menu.Item>
              <Menu.Item key="move" @click="handleContextMenuAction('move')">
                <span class="context-menu-item">
                  <IconifyIcon icon="lucide:move" style="font-size: 13px; color: #52c41a;" />
                  移动
                </span>
              </Menu.Item>
            </template>
          </Menu>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.file-manager-panel {
  flex: 1;
  background: #fff;
  border-radius: 10px;
  border: 1px solid #f0f0f0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.file-manager-panel--drop-zone {
  border: 1px solid #f0f0f0;
}

.file-manager-panel--drag-over {
  border: 2px dashed #1677ff !important;
  box-shadow: 0 0 0 3px rgba(22, 119, 255, 0.1);
  background: rgba(255, 255, 255, 0.95);
}

/* ═══ 拖拽覆盖层 ═══ */
.file-manager-panel__drop-overlay {
  position: absolute;
  inset: 0;
  background: rgba(22, 119, 255, 0.06);
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.file-manager-panel__drop-overlay-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px 48px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  border: 2px dashed #1677ff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.file-manager-panel__drop-overlay-text {
  font-size: 14px;
  color: #1677ff;
  font-weight: 500;
}

/* ═══ 工具栏 ═══ */
.file-manager-panel__toolbar {
  display: flex;
  flex-direction: column;
  padding: 10px 14px;
  border-bottom: 1px solid #f5f5f5;
  gap: 10px;
  flex-shrink: 0;
}

/* 第一行：文件路径 */
.file-manager-panel__path-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-width: 0;
}

.file-manager-panel__panel-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  background: #e6f4ff;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #1677ff;
  flex-shrink: 0;
  white-space: nowrap;
}

/* 路径横向滚动容器 */
.file-manager-panel__breadcrumb-scroll {
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.file-manager-panel__breadcrumb-scroll::-webkit-scrollbar {
  display: none;
}

.file-manager-panel__breadcrumb-inner {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  background: linear-gradient(135deg, #f6f8fb 0%, #f0f3f8 100%);
  border: 1px solid #e8ecf2;
  border-radius: 20px;
  padding: 3px 14px;
  gap: 2px;
}

.file-manager-panel__breadcrumb {
  font-size: 12px;
  white-space: nowrap;
}

.file-manager-panel__breadcrumb :deep(.ant-breadcrumb-link) {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
}

.file-manager-panel__breadcrumb :deep(.ant-breadcrumb-separator) {
  color: #c0c8d5;
  margin: 0 4px;
  font-size: 11px;
}

.file-manager-panel__breadcrumb :deep(.ant-breadcrumb-item) {
  display: inline-flex;
  align-items: center;
}

.file-manager-panel__breadcrumb-link {
  color: #4e7ac8;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.file-manager-panel__breadcrumb-link:hover {
  color: #1677ff;
  background: rgba(22, 119, 255, 0.08);
  text-decoration: none;
}

.file-manager-panel__breadcrumb-current {
  color: #1a2b4c;
  font-weight: 700;
  white-space: nowrap;
  padding: 2px 10px;
  border-radius: 12px;
  background: rgba(22, 119, 255, 0.1);
  border: 1px solid rgba(22, 119, 255, 0.15);
}

/* 第二行：搜索与操作 */
.file-manager-panel__actions-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  gap: 12px;
}

/* 批量操作栏 */
.file-manager-panel__batch-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.batch-bar__text {
  font-size: 13px;
  color: #595959;
  white-space: nowrap;
}

.batch-bar__text strong {
  color: #1677ff;
  font-weight: 600;
}

.batch-bar__actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.file-manager-panel__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.file-manager-panel__search {
  width: 180px;
}

.file-manager-panel__view-toggle :deep(.ant-radio-button-wrapper) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
}

.file-manager-panel__refresh,
.file-manager-panel__new-folder,
.file-manager-panel__upload {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

/* ═══ 内容区 ═══ */
.file-manager-panel__body {
  flex: 1;
  overflow: auto;
  padding: 8px 12px 12px;
}

/* ═══ 表格样式 ═══ */
.file-manager-panel__table {
  border-radius: 8px;
  overflow: hidden;
}

.file-manager-panel__table :deep(.ant-table-thead > tr > th) {
  background: #fafafa;
  font-weight: 600;
  font-size: 12px;
  color: #595959;
  padding: 10px 12px;
}

.file-manager-panel__table :deep(.ant-table-tbody > tr > td) {
  padding: 8px 12px;
  font-size: 13px;
}

.file-manager-panel__table :deep(.ant-table-tbody > tr:hover > td) {
  background: #f5f5f5;
}

/* 选中行样式 */
.file-manager-panel__table :deep(.file-manager-panel__row--selected > td) {
  background: #e6f4ff !important;
}

.file-manager-panel__name-cell {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: default;
  user-select: none;
}

.file-manager-panel__name-cell--folder {
  cursor: pointer;
}

.file-manager-panel__name-cell--draggable[draggable="true"] {
  cursor: grab;
}

.file-manager-panel__name-cell--draggable[draggable="true"]:active {
  cursor: grabbing;
}

.file-manager-panel__name-cell--folder:hover .file-manager-panel__name-text {
  color: #1677ff;
}

/* 行内复选框 */
.file-manager-panel__checkbox {
  width: 18px;
  height: 18px;
  border-radius: 5px;
  border: 1.5px solid #d9d9d9;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s;
  background: #fff;
  margin-right: 2px;
}

.file-manager-panel__checkbox:hover {
  border-color: #1677ff;
}

.file-manager-panel__checkbox--checked {
  background: #1677ff;
  border-color: #1677ff;
}

.file-manager-panel__icon-box {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* 图标包装器（列表视图） */
.file-manager-panel__icon-wrap {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
}

/* 列表视图已分享标识 */
.file-manager-panel__shared-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #1677ff;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.file-manager-panel__name-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #262626;
  transition: color 0.2s;
}

.file-manager-panel__size {
  font-family: 'SF Mono', 'Fira Code', monospace;
  color: #8c8c8c;
  font-size: 12px;
}

.file-manager-panel__time {
  color: #8c8c8c;
  font-size: 12px;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.file-manager-panel__path {
  color: #8c8c8c;
  font-size: 12px;
}

.file-manager-panel__empty {
  padding: 48px 0;
}

/* ═══ 网格视图 ═══ */
.file-manager-panel__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
}

.file-manager-panel__grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px 8px;
  border-radius: 10px;
  border: 1px solid transparent;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: default;
  position: relative;
  user-select: none;
}

.file-manager-panel__grid-item--folder {
  cursor: pointer;
}

.file-manager-panel__grid-item--draggable[draggable="true"] {
  cursor: grab;
}

.file-manager-panel__grid-item--draggable[draggable="true"]:active {
  cursor: grabbing;
}

.file-manager-panel__grid-item:hover {
  background: #fafafa;
  border-color: #e8e8e8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.file-manager-panel__grid-item--folder:hover {
  background: #f0f5ff;
  border-color: #bae0ff;
}

/* 网格选中态 */
.file-manager-panel__grid-item--selected {
  background: #e6f4ff !important;
  border-color: #1677ff !important;
  box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.15);
}

/* 网格复选框 */
.file-manager-panel__grid-checkbox {
  position: absolute;
  top: 6px;
  left: 6px;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 1.5px solid #d9d9d9;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
  background: rgba(255, 255, 255, 0.9);
  z-index: 2;
}

.file-manager-panel__grid-checkbox:hover {
  border-color: #1677ff;
}

.file-manager-panel__grid-checkbox--checked {
  background: #1677ff;
  border-color: #1677ff;
}

.file-manager-panel__grid-icon-box {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  transition: transform 0.2s;
}

.file-manager-panel__grid-item:hover .file-manager-panel__grid-icon-box {
  transform: scale(1.05);
}

/* 网格图标包装器 */
.file-manager-panel__grid-icon-wrap {
  position: relative;
  display: inline-flex;
  margin-bottom: 10px;
}

/* 网格视图已分享标识 */
.file-manager-panel__grid-shared-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #1677ff;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
  z-index: 2;
}

.file-manager-panel__grid-name {
  font-size: 12px;
  color: #262626;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  margin-bottom: 4px;
  line-height: 1.4;
}

.file-manager-panel__grid-meta {
  font-size: 11px;
  color: #8c8c8c;
  margin-bottom: 6px;
}

.file-manager-panel__grid-empty {
  grid-column: 1 / -1;
  padding: 48px 0;
}

.file-manager-panel__grid-path {
  font-size: 10px;
  color: #bfbfbf;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ═══ 右键菜单 ═══ */
.file-manager-panel__context-menu-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
}

.file-manager-panel__context-menu {
  position: fixed;
  z-index: 10000;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  border: 1px solid #f0f0f0;
  min-width: 140px;
  overflow: hidden;
}

.file-manager-panel__context-menu :deep(.ant-menu) {
  border-inline-end: none !important;
  box-shadow: none;
}

.file-manager-panel__context-menu :deep(.ant-menu-item) {
  height: 36px;
  line-height: 36px;
  margin: 0 !important;
  padding: 0 14px !important;
  font-size: 13px;
}

.file-manager-panel__context-menu :deep(.ant-menu-item-divider) {
  margin: 4px 0;
}

.context-menu-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.context-menu-item--danger {
  color: #ff4d4f;
}

.batch-menu-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.batch-btn-text {
  white-space: nowrap;
  display: inline-block;
}

/* ═══ 响应式 ═══ */
@media (max-width: 768px) {
  .file-manager-panel__toolbar {
    flex-wrap: wrap;
  }

  .file-manager-panel__search {
    width: 160px;
  }

  .file-manager-panel__batch-bar {
    flex-wrap: wrap;
  }
}
</style>

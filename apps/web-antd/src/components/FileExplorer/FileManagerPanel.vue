<script lang="ts" setup>
import { computed } from 'vue';
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
});

const emit = defineEmits<{
  'update:searchText': [value: string];
  'update:viewMode': [mode: 'list' | 'grid'];
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
      { title: '操作', key: 'action', width: 130, align: 'center' as const },
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
        <div class="file-manager-panel__actions">
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
              v-if="showNewFolder && mode !== 'recycle'"
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
    <div class="file-manager-panel__body">
      <!-- 列表视图 -->
      <Table
        v-if="viewMode === 'list'"
        :columns="tableColumns"
        :data-source="sortedFiles"
        :loading="loading"
        row-key="id"
        size="small"
        :pagination="false"
        class="file-manager-panel__table"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <div
              class="file-manager-panel__name-cell"
              :class="{ 'file-manager-panel__name-cell--folder': record.type === 'folder', 'file-manager-panel__name-cell--draggable': draggable }"
              :draggable="draggable && record.type === 'file'"
              @click="onOpenFolder(record as FileItem)"
              @dragstart="onRowDragStart(record as FileItem, $event)"
            >
              <div
                class="file-manager-panel__icon-box"
                :style="{ background: getFileIconClass(record).bg }"
              >
                <IconifyIcon
                  :icon="getFileIconClass(record).icon"
                  :style="{ fontSize: '16px', color: getFileIconClass(record).color }"
                />
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
          <template v-if="column.key === 'action'">
            <slot name="action-cell" :file="record">
              <div class="file-manager-panel__actions-cell">
                <template v-if="mode === 'recycle'">
                  <Tooltip title="还原">
                    <Button size="small" type="text" class="file-manager-panel__action-btn" @click="onRestore(record as FileItem)">
                      <IconifyIcon icon="lucide:rotate-ccw" style="font-size: 13px; color: #1677ff;" />
                    </Button>
                  </Tooltip>
                  <Tooltip title="彻底删除">
                    <Popconfirm
                      title="确认彻底删除"
                      description="此操作不可恢复，确定要彻底删除吗？"
                      ok-text="确认"
                      cancel-text="取消"
                      ok-type="danger"
                      @confirm="onDelete(record as FileItem)"
                    >
                      <Button size="small" type="text" danger class="file-manager-panel__action-btn">
                        <IconifyIcon icon="lucide:trash-2" style="font-size: 13px;" />
                      </Button>
                    </Popconfirm>
                  </Tooltip>
                </template>
                <template v-else>
                  <Tooltip title="重命名">
                    <Button size="small" type="text" class="file-manager-panel__action-btn" @click="onRename(record as FileItem)">
                      <IconifyIcon icon="lucide:pencil" style="font-size: 13px;" />
                    </Button>
                  </Tooltip>
                  <Tooltip title="删除">
                    <Popconfirm
                      title="确认删除"
                      description="确定要删除该文件吗？"
                      ok-text="确认"
                      cancel-text="取消"
                      @confirm="onDelete(record as FileItem)"
                    >
                      <Button size="small" type="text" danger class="file-manager-panel__action-btn">
                        <IconifyIcon icon="lucide:trash-2" style="font-size: 13px;" />
                      </Button>
                    </Popconfirm>
                  </Tooltip>
                </template>
              </div>
            </slot>
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
      <div v-else class="file-manager-panel__grid">
        <div
          v-for="file in sortedFiles"
          :key="file.id"
          class="file-manager-panel__grid-item"
          :class="{ 'file-manager-panel__grid-item--folder': file.type === 'folder', 'file-manager-panel__grid-item--draggable': draggable }"
          :draggable="draggable && file.type === 'file'"
          @click="onOpenFolder(file as FileItem)"
          @dragstart="onRowDragStart(file as FileItem, $event)"
        >
          <div
            class="file-manager-panel__grid-icon-box"
            :style="{ background: getFileIconClass(file).bg }"
          >
            <IconifyIcon
              :icon="getFileIconClass(file).icon"
              :style="{ fontSize: '32px', color: getFileIconClass(file).color }"
            />
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
          <div class="file-manager-panel__grid-actions">
            <template v-if="mode === 'recycle'">
              <Tooltip title="还原">
                <Button size="small" type="text" @click.stop="onRestore(file as FileItem)">
                  <IconifyIcon icon="lucide:rotate-ccw" style="font-size: 12px; color: #1677ff;" />
                </Button>
              </Tooltip>
              <Tooltip title="彻底删除">
                <Popconfirm
                  title="确认彻底删除"
                  description="此操作不可恢复，确定要彻底删除吗？"
                  ok-text="确认"
                  cancel-text="取消"
                  ok-type="danger"
                  @confirm.stop="onDelete(file as FileItem)"
                >
                  <Button size="small" type="text" danger @click.stop>
                    <IconifyIcon icon="lucide:trash-2" style="font-size: 12px;" />
                  </Button>
                </Popconfirm>
              </Tooltip>
            </template>
            <template v-else>
              <Tooltip title="重命名">
                <Button size="small" type="text" @click.stop="onRename(file as FileItem)">
                  <IconifyIcon icon="lucide:pencil" style="font-size: 12px;" />
                </Button>
              </Tooltip>
              <Tooltip title="删除">
                <Popconfirm
                  title="确认删除"
                  description="确定要删除该文件吗？"
                  ok-text="确认"
                  cancel-text="取消"
                  @confirm.stop="onDelete(file as FileItem)"
                >
                  <Button size="small" type="text" danger @click.stop>
                    <IconifyIcon icon="lucide:trash-2" style="font-size: 12px;" />
                  </Button>
                </Popconfirm>
              </Tooltip>
            </template>
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
  /* 默认状态下与其他页面保持一致（实线边框），仅在拖拽悬停时显示虚线高亮 */
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
  /* 隐藏滚动条但保留滚动能力 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
}

.file-manager-panel__breadcrumb-scroll::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}

.file-manager-panel__breadcrumb-inner {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  /* 给面包屑整体一个现代感的胶囊背景 */
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

/* 覆盖 ant-breadcrumb 默认分隔符样式 */
.file-manager-panel__breadcrumb :deep(.ant-breadcrumb-separator) {
  color: #c0c8d5;
  margin: 0 4px;
  font-size: 11px;
}

/* 每个面包屑项的通用样式 */
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

/* 当前项（最后一级） */
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
  width: 100%;
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

.file-manager-panel__name-cell {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: default;
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

.file-manager-panel__icon-box {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
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

.file-manager-panel__actions-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.2s;
}

.file-manager-panel__table :deep(.ant-table-tbody > tr:hover) .file-manager-panel__actions-cell {
  opacity: 1;
}

.file-manager-panel__action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  width: 28px;
  height: 28px;
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

.file-manager-panel__grid-actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.2s;
}

.file-manager-panel__grid-item:hover .file-manager-panel__grid-actions {
  opacity: 1;
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

/* ═══ 响应式 ═══ */
@media (max-width: 768px) {
  .file-manager-panel__toolbar {
    flex-wrap: wrap;
  }

  .file-manager-panel__search {
    width: 160px;
  }
}
</style>

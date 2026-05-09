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
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  searchText: '',
  viewMode: 'list',
  showNewFolder: true,
  emptyDescription: '暂无文件',
  rootKey: 'root',
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
  /** 删除 */
  deleteFile: [file: FileItem];
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
  return (
    props.columns || [
      { title: '名称', dataIndex: 'name', key: 'name', width: 320, ellipsis: true },
      { title: '类型', dataIndex: 'type', key: 'type', width: 90, align: 'center' as const },
      { title: '大小', dataIndex: 'size', key: 'size', width: 100, align: 'right' as const },
      { title: '修改时间', dataIndex: 'modifyTime', key: 'modifyTime', width: 170 },
      { title: '操作', key: 'action', width: 140, align: 'center' as const },
    ]
  );
});

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
</script>

<template>
  <div class="file-manager-panel">
    <!-- 工具栏 -->
    <div class="file-manager-panel__toolbar">
      <div class="file-manager-panel__breadcrumb-wrap">
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
        <Button
          v-if="showNewFolder"
          type="primary"
          size="small"
          class="file-manager-panel__new-folder"
          @click="onNewFolder"
        >
          <IconifyIcon icon="lucide:folder-plus" style="font-size: 13px;" />
          新建文件夹
        </Button>
        <Button size="small" class="file-manager-panel__upload" @click="onUpload">
          <IconifyIcon icon="lucide:upload" style="font-size: 13px;" />
          上传
        </Button>
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
              :class="{ 'file-manager-panel__name-cell--folder': record.type === 'folder' }"
              @click="onOpenFolder(record)"
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
          <template v-if="column.key === 'action'">
            <slot name="action-cell" :file="record">
              <div class="file-manager-panel__actions-cell">
                <Tooltip title="重命名">
                  <Button size="small" type="text" class="file-manager-panel__action-btn" @click="onRename(record)">
                    <IconifyIcon icon="lucide:pencil" style="font-size: 13px;" />
                  </Button>
                </Tooltip>
                <Tooltip title="删除">
                  <Popconfirm
                    title="确认删除"
                    description="确定要删除该文件吗？"
                    ok-text="确认"
                    cancel-text="取消"
                    @confirm="onDelete(record)"
                  >
                    <Button size="small" type="text" danger class="file-manager-panel__action-btn">
                      <IconifyIcon icon="lucide:trash-2" style="font-size: 13px;" />
                    </Button>
                  </Popconfirm>
                </Tooltip>
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
          :class="{ 'file-manager-panel__grid-item--folder': file.type === 'folder' }"
          @click="onOpenFolder(file)"
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
          <div class="file-manager-panel__grid-actions">
            <Tooltip title="重命名">
              <Button size="small" type="text" @click.stop="onRename(file)">
                <IconifyIcon icon="lucide:pencil" style="font-size: 12px;" />
              </Button>
            </Tooltip>
            <Tooltip title="删除">
              <Popconfirm
                title="确认删除"
                description="确定要删除该文件吗？"
                ok-text="确认"
                cancel-text="取消"
                @confirm.stop="onDelete(file)"
              >
                <Button size="small" type="text" danger @click.stop>
                  <IconifyIcon icon="lucide:trash-2" style="font-size: 12px;" />
                </Button>
              </Popconfirm>
            </Tooltip>
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
}

/* ═══ 工具栏 ═══ */
.file-manager-panel__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid #f5f5f5;
  gap: 12px;
  flex-shrink: 0;
}

.file-manager-panel__breadcrumb-wrap {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.file-manager-panel__breadcrumb {
  font-size: 13px;
}

.file-manager-panel__breadcrumb :deep(.ant-breadcrumb-link) {
  display: inline-flex;
  align-items: center;
}

.file-manager-panel__breadcrumb-link {
  color: #1677ff;
  cursor: pointer;
  transition: color 0.2s;
}

.file-manager-panel__breadcrumb-link:hover {
  color: #4096ff;
  text-decoration: underline;
}

.file-manager-panel__breadcrumb-current {
  color: #262626;
  font-weight: 600;
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

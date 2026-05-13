<script lang="ts" setup>
import { IconifyIcon } from '@vben/icons';
import { Button, Dropdown, Input, Menu, Radio, Tooltip } from 'ant-design-vue';
import { computed } from 'vue';

import type { BreadcrumbItem, FileItem } from '../types';

interface Props {
  panelTitle?: string;
  breadcrumbPath: BreadcrumbItem[];
  searchText?: string;
  viewMode?: 'list' | 'grid';
  showNewFolder?: boolean;
  mode?: 'normal' | 'recycle';
  selectedFileIds?: string[];
  files: FileItem[];
}

const props = withDefaults(defineProps<Props>(), {
  panelTitle: '',
  searchText: '',
  viewMode: 'list',
  showNewFolder: true,
  mode: 'normal',
  selectedFileIds: () => [],
});

const emit = defineEmits<{
  'update:searchText': [value: string];
  'update:viewMode': [mode: 'list' | 'grid'];
  breadcrumbClick: [item: BreadcrumbItem];
  refresh: [];
  newFolder: [];
  upload: [];
  selectAll: [];
  clearSelection: [];
  rename: [file: FileItem];
  share: [file: FileItem];
  batchDelete: [];
  batchRestore: [];
  batchCopy: [];
  batchMove: [];
}>();

const internalSearch = computed({
  get: () => props.searchText,
  set: (val) => emit('update:searchText', val),
});

const internalViewMode = computed({
  get: () => props.viewMode,
  set: (val) => emit('update:viewMode', val as 'list' | 'grid'),
});

const selectionCount = computed(() => props.selectedFileIds.length);
const hasSelection = computed(() => selectionCount.value > 0);
const isSingleSelection = computed(() => selectionCount.value === 1);
const isAllSelected = computed(
  () => props.files.length > 0 && props.files.every((f) => props.selectedFileIds.includes(f.id)),
);

const singleSelectedFile = computed(() => {
  if (!isSingleSelection.value) return null;
  return props.files.find((f) => props.selectedFileIds.includes(f.id)) || null;
});

const canShare = computed(() => singleSelectedFile.value?.type === 'folder');
</script>

<template>
  <div class="file-toolbar">
    <!-- 路径行 -->
    <div class="toolbar-path-row">
      <div v-if="panelTitle" class="toolbar-panel-title">
        <IconifyIcon icon="lucide:hard-drive" style="font-size: 14px; color: #1677ff;" />
        <span>{{ panelTitle }}</span>
      </div>
      <div class="toolbar-breadcrumb-scroll">
        <div class="toolbar-breadcrumb-inner">
          <a-breadcrumb class="toolbar-breadcrumb">
            <a-breadcrumb-item v-for="(item, idx) in breadcrumbPath" :key="item.key">
              <a v-if="idx < breadcrumbPath.length - 1" class="breadcrumb-link" @click="emit('breadcrumbClick', item)">
                {{ item.title }}
              </a>
              <span v-else class="breadcrumb-current">{{ item.title }}</span>
            </a-breadcrumb-item>
          </a-breadcrumb>
        </div>
      </div>
    </div>

    <!-- 操作行 -->
    <div class="toolbar-actions-row">
      <!-- 批量操作栏 -->
      <div v-if="hasSelection" class="batch-bar" @click.stop>
        <span class="batch-bar__text">已选中 <strong>{{ selectionCount }}</strong> 项</span>
        <div class="batch-bar__actions">
          <template v-if="mode === 'recycle'">
            <Button size="small" @click="emit('selectAll')">
              <IconifyIcon icon="lucide:check-square" style="font-size: 12px;" />
              {{ isAllSelected ? '反全选' : '全选' }}
            </Button>
            <Button size="small" @click="emit('batchRestore')">
              <IconifyIcon icon="lucide:rotate-ccw" style="font-size: 12px;" />
              批量还原
            </Button>
            <Dropdown placement="bottomRight">
              <Button size="small"><IconifyIcon icon="lucide:more-horizontal" style="font-size: 12px;" /> 更多</Button>
              <template #overlay>
                <Menu>
                  <Menu.Item key="batch-delete" danger @click="emit('batchDelete')">
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
            <Button size="small" @click="isAllSelected ? emit('clearSelection') : emit('selectAll')">
              <IconifyIcon icon="lucide:check-square" style="font-size: 12px;" />
              {{ isAllSelected ? '反全选' : '全选' }}
            </Button>
            <Button size="small" @click="emit('clearSelection')">
              <IconifyIcon icon="lucide:x" style="font-size: 12px;" />
              取消选择
            </Button>
            <Button v-if="isSingleSelection" size="small" @click="singleSelectedFile && emit('rename', singleSelectedFile)">
              <IconifyIcon icon="lucide:pencil" style="font-size: 12px;" />
              重命名
            </Button>
            <Button v-if="canShare" size="small" @click="singleSelectedFile && emit('share', singleSelectedFile)">
              <IconifyIcon icon="lucide:share-2" style="font-size: 12px;" />
              <span class="batch-btn-text">分享</span>
            </Button>
            <Button size="small" @click="emit('batchCopy')">
              <IconifyIcon icon="lucide:copy" style="font-size: 12px;" />
              <span class="batch-btn-text">复制</span>
            </Button>
            <Button size="small" @click="emit('batchMove')">
              <IconifyIcon icon="lucide:move" style="font-size: 12px;" />
              <span class="batch-btn-text">移动</span>
            </Button>
            <Dropdown placement="bottomRight">
              <Button size="small">
                <IconifyIcon icon="lucide:more-horizontal" style="font-size: 12px;" />
                <span class="batch-btn-text">更多</span>
              </Button>
              <template #overlay>
                <Menu>
                  <Menu.Item key="batch-delete" danger @click="emit('batchDelete')">
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
      <div class="toolbar-actions" @click.stop>
        <Input v-model:value="internalSearch" placeholder="搜索文件" class="toolbar-search" allow-clear>
          <template #prefix>
            <IconifyIcon icon="lucide:search" style="font-size: 14px; color: #bfbfbf;" />
          </template>
        </Input>
        <Radio.Group v-model:value="internalViewMode" size="small" class="toolbar-view-toggle">
          <Radio.Button value="list"><IconifyIcon icon="lucide:list" style="font-size: 13px;" /></Radio.Button>
          <Radio.Button value="grid"><IconifyIcon icon="lucide:layout-grid" style="font-size: 13px;" /></Radio.Button>
        </Radio.Group>
        <Tooltip title="刷新">
          <Button size="small" @click="emit('refresh')"><IconifyIcon icon="lucide:refresh-cw" style="font-size: 13px;" /></Button>
        </Tooltip>
        <Tooltip v-if="mode !== 'recycle'" title="新建文件夹">
          <Button size="small" @click="emit('newFolder')"><IconifyIcon icon="lucide:folder-plus" style="font-size: 13px;" /></Button>
        </Tooltip>
        <Tooltip v-if="mode !== 'recycle'" title="上传">
          <Button size="small" @click="emit('upload')"><IconifyIcon icon="lucide:upload" style="font-size: 13px;" /></Button>
        </Tooltip>
      </div>
    </div>
  </div>
</template>

<style scoped>
.file-toolbar { display: flex; flex-direction: column; gap: 8px; padding: 12px 16px; border-bottom: 1px solid #f0f0f0; background: #fafafa; }
.toolbar-path-row { display: flex; align-items: center; gap: 12px; min-height: 28px; }
.toolbar-panel-title { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: #262626; flex-shrink: 0; }
.toolbar-breadcrumb-scroll { flex: 1; overflow-x: auto; }
.toolbar-breadcrumb-inner { white-space: nowrap; }
.toolbar-breadcrumb { font-size: 13px; }
.breadcrumb-link { color: #1677ff; cursor: pointer; }
.breadcrumb-link:hover { text-decoration: underline; }
.breadcrumb-current { color: #262626; font-weight: 500; }
.toolbar-actions-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.batch-bar { display: flex; align-items: center; gap: 12px; }
.batch-bar__text { font-size: 13px; color: #595959; }
.batch-bar__actions { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.batch-btn-text { margin-left: 4px; }
.batch-menu-item { display: flex; align-items: center; gap: 6px; }
.batch-menu-item--danger { color: #ff4d4f; }
.toolbar-actions { display: flex; align-items: center; gap: 8px; }
.toolbar-search { width: 200px; }
.toolbar-view-toggle { display: flex; }
</style>
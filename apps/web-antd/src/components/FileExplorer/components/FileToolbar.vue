<script lang="ts" setup>
import { IconifyIcon } from '@vben/icons';
<<<<<<< HEAD
import { Button, Dropdown, Input, Menu, Radio, Tooltip } from 'ant-design-vue';
import { computed, ref } from 'vue';
=======
import { Button, Breadcrumb, Dropdown, Input, Menu, Radio, Tooltip } from 'ant-design-vue';
import { computed } from 'vue';
>>>>>>> 052356bb2fc685856e6fd8659f2fefe3e8fd1cce

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

// ─── 面包屑前进后退导航 ───
const forwardStack = ref<BreadcrumbItem[]>([]);

const canGoBack = computed(() => props.breadcrumbPath.length > 1);
const canGoForward = computed(() => forwardStack.value.length > 0);

/** 点击面包屑链接时清空前进栈 */
const onBreadcrumbClick = (item: BreadcrumbItem) => {
  forwardStack.value = [];
  emit('breadcrumbClick', item);
};

/** 后退 */
const handleGoBack = () => {
  if (!canGoBack.value) return;
  const current = props.breadcrumbPath[props.breadcrumbPath.length - 1];
  if (current) {
    forwardStack.value.push(current);
  }
  const target = props.breadcrumbPath[props.breadcrumbPath.length - 2];
  emit('breadcrumbClick', target);
};

/** 前进 */
const handleGoForward = () => {
  if (!canGoForward.value) return;
  const target = forwardStack.value.pop()!;
  emit('breadcrumbClick', target);
};
</script>

<template>
  <div class="file-toolbar">
    <!-- 路径行 -->
    <div class="toolbar-path-row">
      <!-- 前进后退按钮 -->
      <div class="toolbar-nav-buttons">
        <Button class="nav-btn" :disabled="!canGoBack" @click="handleGoBack">
          <IconifyIcon icon="lucide:chevron-left" style="font-size: 14px;" />
        </Button>
        <Button class="nav-btn" :disabled="!canGoForward" @click="handleGoForward">
          <IconifyIcon icon="lucide:chevron-right" style="font-size: 14px;" />
        </Button>
      </div>

      <!-- 刷新按钮 -->
      <Tooltip title="刷新">
        <Button class="refresh-btn" @click="emit('refresh')">
          <IconifyIcon icon="lucide:refresh-cw" style="font-size: 14px;" />
        </Button>
      </Tooltip>

      <!-- 面包屑 -->
      <div class="toolbar-breadcrumb-scroll">
        <div class="toolbar-breadcrumb-inner">
<<<<<<< HEAD
          <div class="toolbar-breadcrumb">
            <template v-for="(item, idx) in breadcrumbPath" :key="item.key">
              <a v-if="idx < breadcrumbPath.length - 1" class="breadcrumb-link" @click="onBreadcrumbClick(item)">
                {{ item.title }}
              </a>
              <span v-else class="breadcrumb-current">{{ item.title }}</span>
              <IconifyIcon v-if="idx < breadcrumbPath.length - 1" icon="lucide:chevron-right" class="breadcrumb-separator" />
            </template>
          </div>
=======
          <Breadcrumb class="toolbar-breadcrumb">
            <Breadcrumb.Item v-for="(item, idx) in breadcrumbPath" :key="item.key">
              <a v-if="idx < breadcrumbPath.length - 1" class="breadcrumb-link" @click="emit('breadcrumbClick', item)">
                {{ item.title }}
              </a>
              <span v-else class="breadcrumb-current">{{ item.title }}</span>
            </Breadcrumb.Item>
          </Breadcrumb>
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
>>>>>>> 052356bb2fc685856e6fd8659f2fefe3e8fd1cce
        </div>
      </div>

      <!-- 搜索 -->
      <div class="toolbar-actions" @click.stop>
        <Input v-model:value="internalSearch" placeholder="搜索文件" class="toolbar-search" allow-clear>
          <template #prefix>
            <IconifyIcon icon="lucide:search" style="font-size: 14px; color: #bfbfbf;" />
          </template>
        </Input>
      </div>
    </div>

    <!-- 操作行 -->
    <div class="toolbar-actions-row">
      <!-- 左侧：新建 + 上传 -->
      <div class="toolbar-left-actions" @click.stop>
        <template v-if="mode !== 'recycle'">
          <Button type="primary" size="small" class="action-btn-primary" @click="emit('newFolder')">
            <IconifyIcon icon="lucide:folder-plus" style="font-size: 14px;" />
            <span>新建</span>
          </Button>
          <Button size="small" class="action-btn-outline" @click="emit('upload')">
            <IconifyIcon icon="lucide:upload" style="font-size: 14px;" />
            <span>上传</span>
          </Button>
        </template>
      </div>

      <!-- 右侧：批量操作 + 视图切换 -->
      <div class="toolbar-right-group" @click.stop>
        <!-- 批量操作栏 -->
        <div v-if="hasSelection" class="batch-bar">
          <div class="batch-bar__actions">
            <template v-if="mode === 'recycle'">
              <Button @click="emit('batchRestore')">
                <IconifyIcon icon="lucide:rotate-ccw" style="font-size: 12px;" />
                批量还原
              </Button>
              <Dropdown placement="bottomRight">
                <Button><IconifyIcon icon="lucide:more-horizontal" style="font-size: 12px;" /> 更多</Button>
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
              <Button v-if="isSingleSelection" @click="singleSelectedFile && emit('rename', singleSelectedFile)">
                <IconifyIcon icon="lucide:pencil" style="font-size: 12px;" />
                重命名
              </Button>
              <Button v-if="canShare" @click="singleSelectedFile && emit('share', singleSelectedFile)">
                <IconifyIcon icon="lucide:share-2" style="font-size: 12px;" />
                <span class="batch-btn-text">分享</span>
              </Button>
              <Button @click="emit('batchCopy')">
                <IconifyIcon icon="lucide:copy" style="font-size: 12px;" />
                <span class="batch-btn-text">复制</span>
              </Button>
              <Button @click="emit('batchMove')">
                <IconifyIcon icon="lucide:move" style="font-size: 12px;" />
                <span class="batch-btn-text">移动</span>
              </Button>
              <Dropdown placement="bottomRight">
                <Button>
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

        <!-- 视图切换 -->
        <div class="toolbar-view-actions">
          <Radio.Group v-model:value="internalViewMode" class="toolbar-view-toggle">
            <Radio.Button value="list"><IconifyIcon icon="lucide:list" style="font-size: 14px;" /></Radio.Button>
            <Radio.Button value="grid"><IconifyIcon icon="lucide:layout-grid" style="font-size: 14px;" /></Radio.Button>
          </Radio.Group>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.file-toolbar { display: flex; flex-direction: column; gap: 10px; padding: 10px 14px; border-bottom: 1px solid #f5f5f5; flex-shrink: 0; }
.toolbar-path-row { display: flex; align-items: center; gap: 8px; min-height: 32px; }

/* 前进后退按钮 */
.toolbar-nav-buttons { display: flex; align-items: center; flex-shrink: 0; }
.nav-btn {
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 0;
}
.nav-btn:first-child {
  border-radius: 8px 0 0 8px;
}
.nav-btn:last-child {
  border-radius: 0 8px 8px 0;
}
.nav-btn:not(:last-child) {
  margin-right: -1px;
  position: relative;
  z-index: 1;
}

/* 刷新按钮 */
.refresh-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  flex-shrink: 0;
}

/* 面包屑 */
.toolbar-breadcrumb-scroll {
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.toolbar-breadcrumb-scroll::-webkit-scrollbar {
  display: none;
}
.toolbar-breadcrumb-inner {
  display: flex;
  align-items: center;
  white-space: nowrap;
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 0 14px;
  gap: 2px;
  height: 32px;
}
.toolbar-breadcrumb {
  display: flex;
  align-items: center;
  font-size: 12px;
  white-space: nowrap;
  gap: 4px;
}
.breadcrumb-separator {
  font-size: 10px;
  color: #d1d5db;
  flex-shrink: 0;
}
.breadcrumb-link {
  color: #6b7280;
  cursor: pointer;
  transition: color 0.2s ease;
  white-space: nowrap;
  font-size: 12px;
}
.breadcrumb-link:hover {
  color: #374151;
  text-decoration: none;
}
.breadcrumb-current {
  color: #1f2937;
  font-weight: 500;
  white-space: nowrap;
  font-size: 12px;
}
<<<<<<< HEAD

/* 搜索 */
.toolbar-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
=======
.toolbar-actions-row { display: flex; align-items: center; justify-content: flex-end; gap: 12px; flex-wrap: wrap; }
.batch-bar { display: flex; align-items: center; gap: 12px; }
.batch-bar__text { font-size: 13px; color: #595959; }
.batch-bar__actions { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.batch-btn-text { margin-left: 4px; }
.batch-menu-item { display: flex; align-items: center; gap: 6px; }
.batch-menu-item--danger { color: #ff4d4f; }

/* 修复 Dropdown Menu danger 项 hover 时背景与前景红色冲突 */
:global(.ant-dropdown-menu-item-danger:hover) {
  color: #ff4d4f !important;
  background: #fff1f0 !important;
}
:global(.ant-dropdown-menu-item-danger:hover .ant-dropdown-menu-title-content) {
  color: #ff4d4f !important;
}
:global(.ant-dropdown-menu-item-danger:hover .ant-dropdown-menu-item-icon) {
  color: #ff4d4f !important;
}

.toolbar-actions { display: flex; align-items: center; gap: 8px; }
>>>>>>> 052356bb2fc685856e6fd8659f2fefe3e8fd1cce
.toolbar-search { width: 200px; }

/* 第二行 */
.toolbar-actions-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }

/* 左侧操作：新建 + 上传 */
.toolbar-left-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.toolbar-left-actions .action-btn-primary,
.toolbar-left-actions .action-btn-outline {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 32px;
  padding: 0 12px;
  font-size: 13px;
}

/* 右侧组：批量操作 + 视图切换 */
.toolbar-right-group { display: flex; align-items: center; gap: 8px; margin-left: auto; flex-shrink: 0; }

/* 右侧视图切换 */
.toolbar-view-actions { display: flex; align-items: center; flex-shrink: 0; }
.toolbar-view-toggle { display: flex; }
.toolbar-view-toggle :deep(.ant-radio-button-wrapper) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
  height: 32px;
}

/* 批量操作栏 */
.batch-bar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.batch-bar__text { font-size: 14px; color: #595959; }
.batch-bar__actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.batch-bar__actions :deep(.ant-btn) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  padding: 0 10px;
  font-size: 13px;
}
.batch-btn-text { margin-left: 4px; }
.batch-menu-item { display: flex; align-items: center; gap: 6px; }
.batch-menu-item--danger { color: #ff4d4f; }
</style>

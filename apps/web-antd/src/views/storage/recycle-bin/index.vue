<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import {
  FileTreePanel,
  FileManagerPanel,
} from '#/components/FileExplorer';
import type { FileTreeNode, FileItem } from '#/components/FileExplorer';
import { buildBreadcrumbPath, findParentKeys } from '#/components/FileExplorer';
import RecycleBinHeader from './components/RecycleBinHeader.vue';
import { mockRecycleTree, mockRecycleFiles } from './components/mockData';

// ─── 状态 ───
const treeData = ref<FileTreeNode[]>(mockRecycleTree);
const selectedKeys = ref<string[]>(['space-1']);
const expandedKeys = ref<string[]>(['space-group', 'space-1', 'team-group']);
const loading = ref(false);
const searchText = ref('');
const viewMode = ref<'list' | 'grid'>('list');
const currentFiles = ref<FileItem[]>([]);
const selectedFileIds = ref<string[]>([]);

// ─── 计算属性 ───
const breadcrumbPath = computed(() => {
  const key = selectedKeys.value[0];
  if (!key) return [{ title: '回收站', key: 'root' }];
  return buildBreadcrumbPath(treeData.value, key, '回收站', 'root');
});

const overviewStats = computed(() => {
  const fileCount = Object.values(mockRecycleFiles).reduce((sum, list) => sum + list.length, 0);
  const totalSize = Object.values(mockRecycleFiles).flat().filter((f) => f.type === 'file').length;
  const folderCount = Object.values(mockRecycleFiles).flat().filter((f) => f.type === 'folder').length;
  return { totalFiles: fileCount, fileItems: totalSize, folderItems: folderCount };
});

// ─── 方法 ───
function loadFiles(key: string) {
  loading.value = true;
  setTimeout(() => {
    currentFiles.value = mockRecycleFiles[key] || [];
    loading.value = false;
  }, 150);
}

function onSelectTree(key: string) {
  selectedKeys.value = [key];
  loadFiles(key);
}

function onBreadcrumbClick(item: { key: string }) {
  if (item.key === 'root') {
    selectedKeys.value = ['space-1'];
    expandedKeys.value = ['space-group', 'space-1', 'team-group'];
    loadFiles('space-1');
    return;
  }
  selectedKeys.value = [item.key];
  const parentKeys = findParentKeys(treeData.value, item.key);
  expandedKeys.value = [...new Set([...expandedKeys.value, ...parentKeys])];
  loadFiles(item.key);
}

function handleRestore(file: FileItem) {
  message.success(`"${file.name}" 已还原`);
  currentFiles.value = currentFiles.value.filter((f) => f.id !== file.id);
}

function handleDelete(file: FileItem) {
  message.success(`"${file.name}" 已彻底删除`);
  currentFiles.value = currentFiles.value.filter((f) => f.id !== file.id);
}

function refresh() {
  loadFiles(selectedKeys.value[0]);
  message.success('已刷新');
}

function nodeIconResolver(node: FileTreeNode) {
  if (node.type === 'root-space') return { icon: 'lucide:hard-drive', color: '#1677ff' };
  if (node.type === 'root-team') return { icon: 'lucide:users', color: '#1677ff' };
  if (node.type === 'space') return { icon: 'lucide:server', color: '#1677ff' };
  if (node.type === 'team-folder') return { icon: 'lucide:folder-heart', color: '#1677ff' };
  if (node.isLeaf) return { icon: 'lucide:folder-open', color: '#faad14' };
  return { icon: 'lucide:folder', color: '#faad14' };
}

onMounted(() => {
  loadFiles('space-1');
});
</script>

<template>
  <div class="file-manager-page">
    <!-- 页面顶部概览 -->
    <RecycleBinHeader
      :total-files="overviewStats.totalFiles"
      :file-items="overviewStats.fileItems"
      :folder-items="overviewStats.folderItems"
    />

    <!-- 主体区域 -->
    <div class="fm-body">
      <FileTreePanel
        :tree-data="treeData"
        v-model:selected-keys="selectedKeys"
        v-model:expanded-keys="expandedKeys"
        :node-icon-resolver="nodeIconResolver"
        @select="onSelectTree"
      />
      <FileManagerPanel
        :files="currentFiles"
        :breadcrumb-path="breadcrumbPath"
        :loading="loading"
        v-model:search-text="searchText"
        v-model:view-mode="viewMode"
        v-model:selected-file-ids="selectedFileIds"
        mode="recycle"
        :show-new-folder="false"
        empty-description="暂无回收文件"
        @breadcrumb-click="onBreadcrumbClick"
        @refresh="refresh"
        @delete-file="handleDelete"
        @restore="handleRestore"
      />
    </div>
  </div>
</template>

<style scoped>
.file-manager-page { display: flex; flex-direction: column; height: 100%; background: #f5f5f5; }
.fm-body { display: flex; flex: 1; overflow: hidden; padding: 12px; gap: 12px; }
.file-manager-panel__path { color: #8c8c8c; font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

@media (max-width: 768px) {
  .page-header { flex-direction: column; align-items: flex-start; }
}
</style>
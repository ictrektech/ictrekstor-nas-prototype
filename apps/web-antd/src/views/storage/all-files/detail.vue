<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Button, Input, Radio, message } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import {
  getStorageSpaceFilesApi,
  getStorageSpacesApi,
  type StorageSpaceFile,
  type StorageSpace,
} from '#/api/storage';
import FileListView from './components/FileListView.vue';
import FileGridView from './components/FileGridView.vue';
import FileRenameModal from './components/FileRenameModal.vue';

const route = useRoute();
const router = useRouter();
const spaceId = computed(() => route.params.id as string);

const spaceInfo = ref<StorageSpace | null>(null);
const files = ref<StorageSpaceFile[]>([]);
const loading = ref(false);
const searchText = ref('');
const viewMode = ref<'list' | 'grid'>('list');

const renameModalVisible = ref(false);
const editingFile = ref<StorageSpaceFile | null>(null);

const filteredFiles = computed(() => {
  if (!searchText.value) return files.value;
  const kw = searchText.value.toLowerCase();
  return files.value.filter((f) => f.name.toLowerCase().includes(kw));
});

const sortedFiles = computed(() => {
  return [...filteredFiles.value].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
});

async function loadData() {
  loading.value = true;
  try {
    const [spacesRes, filesRes] = await Promise.all([
      getStorageSpacesApi(),
      getStorageSpaceFilesApi(spaceId.value),
    ]);
    spaceInfo.value = spacesRes.find((s) => s.id === spaceId.value) || null;
    files.value = filesRes;
  } finally {
    loading.value = false;
  }
}

function goBack() {
  router.push('/storage/all-files');
}

function openRenameModal(file: StorageSpaceFile) {
  editingFile.value = file;
  renameModalVisible.value = true;
}

function handleRename(newName: string) {
  if (editingFile.value) {
    editingFile.value.name = newName;
  }
}

function handleDeleteFile(file: StorageSpaceFile) {
  message.success(`"${file.name}" 已删除`);
  files.value = files.value.filter((f) => f.id !== file.id);
}

onMounted(loadData);
</script>

<template>
  <div class="space-detail-page">
    <!-- 页面顶部概览 -->
    <div class="page-header">
      <div class="page-header-left">
        <Button size="small" class="back-btn" @click="goBack">
          <IconifyIcon icon="lucide:arrow-left" style="font-size: 13px;" />
        </Button>
        <div class="page-icon-box">
          <IconifyIcon icon="lucide:folder-open" style="font-size: 20px; color: #1677ff;" />
        </div>
        <div class="page-title-area">
          <h1 class="page-title">{{ spaceInfo?.name || '加载中...' }}</h1>
          <p class="page-desc">设备全部文件 · {{ filteredFiles.length }} 个项目</p>
        </div>
      </div>
      <div class="page-header-right">
        <div class="overview-card">
          <IconifyIcon icon="lucide:files" style="font-size: 16px; color: #1677ff;" />
          <div class="overview-info">
            <span class="overview-label">文件</span>
            <span class="overview-value">{{ files.filter(f => f.type === 'file').length }}</span>
          </div>
        </div>
        <div class="overview-card">
          <IconifyIcon icon="lucide:folder" style="font-size: 16px; color: #52c41a;" />
          <div class="overview-info">
            <span class="overview-label">文件夹</span>
            <span class="overview-value">{{ files.filter(f => f.type === 'folder').length }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <Input v-model:value="searchText" placeholder="搜索文件" class="search-input" allow-clear />
      <Radio.Group v-model:value="viewMode" size="small">
        <Radio.Button value="list">☰ 列表</Radio.Button>
        <Radio.Button value="grid">▦ 网格</Radio.Button>
      </Radio.Group>
    </div>

    <!-- 文件内容 -->
    <div class="file-content">
      <FileListView
        v-if="viewMode === 'list'"
        :files="sortedFiles"
        :loading="loading"
        @rename="openRenameModal"
        @delete="handleDeleteFile"
      />
      <FileGridView
        v-else
        :files="sortedFiles"
        @rename="openRenameModal"
        @delete="handleDeleteFile"
      />
    </div>

    <!-- 重命名弹窗 -->
    <FileRenameModal
      v-model:visible="renameModalVisible"
      :file="editingFile"
      @confirm="handleRename"
    />
  </div>
</template>

<style scoped>
.space-detail-page { padding: 0 16px 16px; width: 100%; }

.page-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; background: #fff; gap: 16px; flex-shrink: 0; }
.page-header-left { display: flex; align-items: center; gap: 12px; }
.back-btn { font-size: 12px; display: inline-flex; align-items: center; gap: 4px; border-radius: 6px; }
.page-icon-box { width: 44px; height: 44px; border-radius: 10px; background: #e6f4ff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.page-title { font-size: 16px; font-weight: 600; color: #262626; margin: 0; line-height: 1.4; }
.page-desc { font-size: 12px; color: #8c8c8c; margin: 2px 0 0; }
.page-header-right { display: flex; align-items: center; gap: 12px; }

.overview-card { display: flex; align-items: center; gap: 8px; padding: 8px 14px; background: #f5f5f5; border-radius: 8px; min-width: 90px; }
.overview-info { display: flex; flex-direction: column; gap: 1px; }
.overview-label { font-size: 11px; color: #8c8c8c; }
.overview-value { font-size: 16px; font-weight: 600; color: #262626; font-family: 'SF Mono', 'Fira Code', monospace; }

.search-bar { display: flex; align-items: center; gap: 8px; margin: 10px 0; }
.search-input { width: 240px; }

.file-content { background: #fff; border-radius: 8px; border: 1px solid #f0f0f0; padding: 16px; }
</style>
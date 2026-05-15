<script lang="ts" setup>
import { ref, computed } from 'vue';
import { Button, Input, Card, message } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import type { PublicFolder } from './types';
import FolderOverview from './components/FolderOverview.vue';
import FolderTable from './components/FolderTable.vue';
import FolderModal from './components/FolderModal.vue';
import { initialFolders } from './components/mockData';

/* ═══════ 数据状态 ═══════ */
const folders = ref<PublicFolder[]>([...initialFolders]);
const searchText = ref('');

/* ═══════ 计算属性 ═══════ */
const filteredFolders = computed(() => {
  let result = folders.value;
  if (searchText.value) {
    const kw = searchText.value.toLowerCase();
    result = result.filter(
      (f) =>
        f.name.toLowerCase().includes(kw) ||
        f.storagePool.toLowerCase().includes(kw) ||
        f.description.toLowerCase().includes(kw),
    );
  }
  return result;
});

/* ═══════ 创建/编辑 ═══════ */
const folderModalVisible = ref(false);
const folderModalTitle = ref('创建公共文件夹');
const editingFolder = ref<Partial<PublicFolder>>({});
const isEdit = ref(false);

function openCreateModal() {
  isEdit.value = false;
  folderModalTitle.value = '创建公共文件夹';
  editingFolder.value = {};
  folderModalVisible.value = true;
}

function openEditModal(folder: PublicFolder) {
  isEdit.value = true;
  folderModalTitle.value = `编辑公共文件夹 — ${folder.name}`;
  editingFolder.value = { ...folder };
  folderModalVisible.value = true;
}

function handleSaveFolder(data: any) {
  if (isEdit.value && editingFolder.value.id) {
    const idx = folders.value.findIndex((f) => f.id === editingFolder.value.id);
    if (idx >= 0) {
      const poolLabel = data.storagePool === 'pool-1' ? 'Pool-1 (RAID 5)'
        : data.storagePool === 'pool-2' ? 'Pool-2 (RAID 1)'
        : 'Pool-3 (RAID 10)';
      folders.value[idx] = {
        ...folders.value[idx],
        name: data.name,
        storagePool: poolLabel,
        poolId: data.storagePool,
      };
      message.success('公共文件夹已更新');
    }
  } else {
    const poolLabel = data.storagePool === 'pool-1' ? 'Pool-1 (RAID 5)'
      : data.storagePool === 'pool-2' ? 'Pool-2 (RAID 1)'
      : 'Pool-3 (RAID 10)';
    const newFolder: PublicFolder = {
      id: `pf-${Date.now()}`,
      name: data.name,
      path: `/public/${data.name}`,
      storagePool: poolLabel,
      poolId: data.storagePool,
      permissionMode: 'readwrite',
      status: 'active',
      createTime: new Date().toLocaleString('zh-CN'),
      userCount: 0,
      usedCapacityGB: 0,
      totalCapacityGB: 100,
      description: '',
    };
    folders.value.push(newFolder);
    message.success('公共文件夹创建成功');
  }
}

/* ═══════ 删除 ═══════ */
function handleDeleteFolder(folder: PublicFolder) {
  folders.value = folders.value.filter((f) => f.id !== folder.id);
  message.success(`"${folder.name}" 已删除`);
}
</script>

<template>
  <div class="public-files-page">
    <!-- 页面顶部概览 -->
    <div class="page-header">
      <div class="page-header-left">
        <div class="page-icon-box">
          <IconifyIcon icon="lucide:folder-heart" style="font-size: 20px; color: #fa8c16;" />
        </div>
        <div class="page-title-area">
          <h1 class="page-title">公共文件管理</h1>
          <p class="page-desc">管理公共文件夹的创建与存储分配</p>
        </div>
      </div>
      <FolderOverview :total-folders="folders.length" />
    </div>

    <!-- 动作栏 -->
    <div class="action-bar">
      <div class="action-bar-left">
        <Button type="primary" class="create-btn" @click="openCreateModal">
          <IconifyIcon icon="lucide:folder-plus" style="font-size: 13px;" />
          新建公共文件夹
        </Button>
      </div>
      <div class="action-bar-right">
        <Input
          v-model:value="searchText"
          placeholder="搜索文件夹名称或存储池"
          class="search-input"
          allow-clear
        >
          <template #prefix>
            <IconifyIcon icon="lucide:search" style="font-size: 14px; color: #bfbfbf;" />
          </template>
        </Input>
      </div>
    </div>

    <!-- 表格 -->
    <div class="page-body">
      <Card class="folder-card" :bordered="false">
        <FolderTable
          :folders="filteredFolders"
          @delete-folder="handleDeleteFolder"
        />
      </Card>
    </div>

    <!-- 创建/编辑弹窗 -->
    <FolderModal
      v-model:visible="folderModalVisible"
      :title="folderModalTitle"
      :initial-data="editingFolder"
      @save="handleSaveFolder"
    />
  </div>
</template>

<style scoped>
.public-files-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  gap: 16px;
  flex-shrink: 0;
}

.page-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #fff7e6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.page-title {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  margin: 0;
  line-height: 1.4;
}

.page-desc {
  font-size: 12px;
  color: #8c8c8c;
  margin: 2px 0 0;
}

.action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  gap: 12px;
  flex-shrink: 0;
}

.action-bar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.action-bar-right {
  display: flex;
  align-items: center;
}

.create-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.search-input {
  width: 280px;
}

.page-body {
  flex: 1;
  overflow: auto;
}

.folder-card {
  background: #fff;
  border: none;
  box-shadow: none;
}

.folder-card :deep(.ant-card-body) {
  padding: 0;
}

/* ═══ 响应式 ═══ */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .action-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .search-input {
    width: 200px;
  }
}
</style>

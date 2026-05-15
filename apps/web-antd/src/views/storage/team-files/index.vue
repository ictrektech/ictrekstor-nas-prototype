<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import {
  Button,
  Modal,
  Form,
  Input,
  message,
  Dropdown,
  Menu,
} from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import TeamFolderModal from './components/TeamFolderModal.vue';
import {
  FileTreePanel,
  FileManagerPanel,
} from '#/components/FileExplorer';
import type { FileTreeNode, FileItem } from '#/components/FileExplorer';
import { buildBreadcrumbPath, findParentKeys, findNodeInTree } from '#/components/FileExplorer';
import { mockTree, mockFiles } from './components/mockData';

// ─── 状态 ───
const treeData = ref<FileTreeNode[]>(mockTree);
const selectedKeys = ref<string[]>(['tf-1']);
const expandedKeys = ref<string[]>(['tf-1']);
const loading = ref(false);
const searchText = ref('');
const viewMode = ref<'list' | 'grid'>('list');
const currentFiles = ref<FileItem[]>([]);
const selectedFileIds = ref<string[]>([]);

// 新建团队文件夹弹窗
const folderModalVisible = ref(false);
const folderModalTitle = ref('新建团队文件夹');
const isEdit = ref(false);
const editingFolderId = ref('');

// 重命名
const renameModalVisible = ref(false);
const renameFormRef = ref();
const renameForm = ref({ name: '' });
const editingFile = ref<FileItem | null>(null);

// ─── 计算属性 ───
const breadcrumbPath = computed(() => {
  const key = selectedKeys.value[0];
  if (!key) return [{ title: '团队文件', key: 'root' }];
  return buildBreadcrumbPath(treeData.value, key, '团队文件', 'root');
});

const overviewStats = computed(() => {
  const folderCount = treeData.value.length;
  let subFolderCount = 0;
  let fileCount = 0;
  Object.values(mockFiles).forEach((list) => {
    list.forEach((f) => {
      if (f.type === 'folder') subFolderCount++;
      else fileCount++;
    });
  });
  return {
    teamFolders: folderCount,
    subFolders: subFolderCount,
    files: fileCount,
  };
});

// ─── 方法 ───
function loadFiles(key: string) {
  loading.value = true;
  setTimeout(() => {
    currentFiles.value = mockFiles[key] || [];
    loading.value = false;
  }, 150);
}

function onSelectTree(key: string) {
  selectedKeys.value = [key];
  loadFiles(key);
}

function onBreadcrumbClick(item: { key: string }) {
  if (item.key === 'root') {
    selectedKeys.value = ['tf-1'];
    expandedKeys.value = ['tf-1'];
    loadFiles('tf-1');
    return;
  }
  selectedKeys.value = [item.key];
  const parentKeys = findParentKeys(treeData.value, item.key);
  expandedKeys.value = [...new Set([...expandedKeys.value, ...parentKeys])];
  loadFiles(item.key);
}

function handleOpenFolder(file: FileItem) {
  if (file.type !== 'folder') return;
  const currentKey = selectedKeys.value[0];
  const newKey = `${currentKey}/${file.name}`;
  const node = findNodeInTree(treeData.value, newKey);
  if (node) {
    selectedKeys.value = [newKey];
    expandedKeys.value = [...new Set([...expandedKeys.value, currentKey])];
    loadFiles(newKey);
  } else {
    message.info('该目录暂无数据');
  }
}

function openRenameModal(file: FileItem) {
  editingFile.value = file;
  renameForm.value = { name: file.name };
  renameModalVisible.value = true;
}

function handleRename() {
  renameFormRef.value?.validate().then(() => {
    if (editingFile.value) {
      editingFile.value.name = renameForm.value.name;
      message.success('重命名成功');
    }
    renameModalVisible.value = false;
  }).catch(() => {});
}

function handleDeleteFile(file: FileItem) {
  message.success(`"${file.name}" 已删除`);
  currentFiles.value = currentFiles.value.filter((f) => f.id !== file.id);
}

function refresh() {
  loadFiles(selectedKeys.value[0]);
  message.success('已刷新');
}

function openCreateModal() {
  isEdit.value = false;
  editingFolderId.value = '';
  folderModalTitle.value = '新建团队文件夹';
  folderModalVisible.value = true;
}

function handleSaveFolder(data: any) {
  if (isEdit.value) {
    message.success(`团队文件夹 "${data.name}" 已更新`);
  } else {
    message.success(`团队文件夹 "${data.name}" 创建成功`);
  }
}

// 树节点图标自定义
function nodeIconResolver(node: FileTreeNode) {
  if (node.type === 'team-folder') {
    return { icon: 'lucide:folder-heart', color: '#1677ff' };
  }
  if (node.isLeaf) {
    return { icon: 'lucide:folder-open', color: '#faad14' };
  }
  return { icon: 'lucide:folder', color: '#faad14' };
}

onMounted(() => {
  loadFiles('tf-1');
});
</script>

<template>
  <div class="file-manager-page">
    <!-- ═══════ 页面顶部概览 ═══════ -->
    <div class="page-header">
      <div class="page-header-left">
        <div class="page-icon-box">
          <IconifyIcon icon="lucide:users" style="font-size: 20px; color: #1677ff;" />
        </div>
        <div class="page-title-area">
          <h1 class="page-title">团队文件管理</h1>
          <p class="page-desc">在多个用户之间共享文件的团队文件夹</p>
        </div>
      </div>
      <div class="page-header-right">
        <div class="overview-card">
          <IconifyIcon icon="lucide:folder-heart" style="font-size: 16px; color: #1677ff;" />
          <div class="overview-info">
            <span class="overview-label">团队文件夹</span>
            <span class="overview-value">{{ overviewStats.teamFolders }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════ 操作栏 ═══════ -->
    <div class="team-toolbar">
      <div class="team-toolbar__left">
        <Button
          type="primary"
          size="small"
          class="team-toolbar__btn team-toolbar__btn--primary"
          @click="openCreateModal"
        >
          <IconifyIcon icon="lucide:folder-plus" style="font-size: 13px;" />
          新建
        </Button>
        <Button
          size="small"
          class="team-toolbar__btn"
          @click="message.info('用户管理功能开发中')"
        >
          <IconifyIcon icon="lucide:user-cog" style="font-size: 13px;" />
          用户管理
        </Button>
        <Dropdown placement="bottomRight">
          <Button size="small" class="team-toolbar__btn">
            <IconifyIcon icon="lucide:more-horizontal" style="font-size: 13px; display: inline-flex; align-items: center;" />
            <span style="display: inline-flex; align-items: center;">高级操作</span>
            <IconifyIcon icon="lucide:chevron-down" style="font-size: 12px; display: inline-flex; align-items: center;" />
          </Button>
          <template #overlay>
            <Menu>
              <Menu.Item key="batch-delete" danger @click="message.info('批量删除功能开发中')">
                <span class="menu-item-danger">
                  <IconifyIcon icon="lucide:trash-2" style="font-size: 13px; display: inline-flex; align-items: center;" />
                  <span style="display: inline-flex; align-items: center;">删除</span>
                </span>
              </Menu.Item>
            </Menu>
          </template>
        </Dropdown>
      </div>
      <div class="team-toolbar__right" />
    </div>

    <!-- ═══════ 主体区域 ═══════ -->
    <div class="fm-body">
      <!-- 左侧目录树 -->
      <FileTreePanel
        :tree-data="treeData"
        v-model:selected-keys="selectedKeys"
        v-model:expanded-keys="expandedKeys"
        :node-icon-resolver="nodeIconResolver"
        @select="onSelectTree"
      />

      <!-- 右侧文件区域 -->
      <FileManagerPanel
        :files="currentFiles"
        :breadcrumb-path="breadcrumbPath"
        :loading="loading"
        v-model:search-text="searchText"
        v-model:view-mode="viewMode"
        v-model:selected-file-ids="selectedFileIds"
        @breadcrumb-click="onBreadcrumbClick"
        @refresh="refresh"
        @open-folder="handleOpenFolder"
        @rename="openRenameModal"
        @delete-file="handleDeleteFile"
      />
    </div>

    <!-- 新建/编辑团队文件夹弹窗 -->
    <TeamFolderModal
      v-model:visible="folderModalVisible"
      :title="folderModalTitle"
      @save="handleSaveFolder"
    />

    <!-- 重命名弹窗 -->
    <Modal
      v-model:open="renameModalVisible"
      title="重命名"
      width="400px"
      @ok="handleRename"
    >
      <Form
        ref="renameFormRef"
        :model="renameForm"
        layout="vertical"
        :rules="{ name: [{ required: true, message: '请输入名称', trigger: 'blur' }] }"
      >
        <Form.Item label="新名称" name="name">
          <Input v-model:value="renameForm.name" placeholder="请输入新名称" />
        </Form.Item>
      </Form>
    </Modal>
  </div>
</template>

<style scoped>
.file-manager-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
}

/* ═══ 页面顶部概览 ═══ */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #fff;
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
  background: #e6f4ff;
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

.page-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.overview-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: #f5f5f5;
  border-radius: 8px;
  min-width: 90px;
}

.overview-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.overview-label {
  font-size: 11px;
  color: #8c8c8c;
}

.overview-value {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.page-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-left: 4px;
}

/* ═══ 主体区域 ═══ */
.fm-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* ═══ 弹窗样式 ═══ */
.folder-modal :deep(.ant-modal-title) {
  display: flex;
  align-items: center;
  gap: 8px;
}

.capacity-input-row {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.capacity-input {
  flex: 1;
}

.capacity-unit-select {
  width: 100px;
}

.checkbox-label,
.radio-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* ═══ 操作栏 ═══ */
.team-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  background: #fff;
  flex-shrink: 0;
  gap: 16px;
}

.team-toolbar__left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.team-toolbar__right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.team-toolbar__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.team-toolbar__btn--primary {
  font-weight: 500;
}

.menu-item-danger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #ff4d4f;
}

/* 修复 Dropdown Menu danger 项 hover 颜色 */
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

/* ═══ 响应式 ═══ */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .team-toolbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>

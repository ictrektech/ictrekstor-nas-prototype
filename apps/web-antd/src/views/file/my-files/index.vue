<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { message, Modal } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import {
  FileTreePanel,
  FileManagerPanel,
} from '#/components/FileExplorer';
import type { FileTreeNode, FileItem } from '#/components/FileExplorer';
import { findParentKeys, findNodeInTree } from '#/components/FileExplorer';
import { ShareConfigModal } from '#/components/ShareConfigModal';
import type { ShareFormData } from '#/components/ShareConfigModal';
import RenameModal from '#/components/common/RenameModal.vue';
import FilePageHeader from './components/FilePageHeader.vue';
import TargetDirModal from './components/TargetDirModal.vue';
import NewFolderModal from './components/NewFolderModal.vue';

import {
  mockTree,
  mockFiles,
  buildTargetDirTree,
  type MyFileItem,
} from './components/mockData';

// ─── 状态 ───
const treeData = ref<FileTreeNode[]>(mockTree);
const selectedKeys = ref<string[]>(['space-1']);
const expandedKeys = ref<string[]>(['space-1']);
const loading = ref(false);
const searchText = ref('');
const viewMode = ref<'list' | 'grid'>('list');
const currentFiles = ref<MyFileItem[]>([]);
const selectedFileIds = ref<string[]>([]);

// 重命名（复用全局组件）
const renameModalVisible = ref(false);
const renameFileName = ref('');
const editingFile = ref<MyFileItem | null>(null);

// 目标目录选择弹窗（复制/移动共用）
const targetDirModalVisible = ref(false);
const targetDirModalTitle = ref('选择目标目录');
const targetDirAction = ref<'copy' | 'move'>('copy');
const targetDirSelectedKeys = ref<string[]>([]);
const targetDirExpandedKeys = ref<string[]>([]);
const targetDirPendingFiles = ref<MyFileItem[]>([]);

// 共享设置
const shareModalVisible = ref(false);

// 新建文件夹
const newFolderModalVisible = ref(false);

// 上传
const uploadInputRef = ref<HTMLInputElement | null>(null);

// 用户选项
const userOptions = [
  { label: 'zhangsan', value: 'zhangsan' },
  { label: 'lisi', value: 'lisi' },
  { label: 'wangwu', value: 'wangwu' },
  { label: 'admin', value: 'admin' },
];

// 目标目录树数据
const targetDirTreeData = computed<FileTreeNode[]>(() => buildTargetDirTree(treeData.value));

// ─── 计算属性 ───
const breadcrumbPath = computed(() => {
  const key = selectedKeys.value[0];
  if (!key) return [{ title: '我的文件', key: 'root' }];
  const parts: { title: string; key: string }[] = [{ title: '我的文件', key: 'root' }];
  function findPath(
    nodes: FileTreeNode[],
    target: string,
    current: { title: string; key: string }[],
  ): boolean {
    for (const node of nodes) {
      if (node.key === target) {
        parts.push(...current, { title: node.title, key: node.key });
        return true;
      }
      if (node.children) {
        const res = findPath(node.children, target, [...current, { title: node.title, key: node.key }]);
        if (res) return true;
      }
    }
    return false;
  }
  findPath(treeData.value, key, []);
  return parts;
});

const overviewStats = computed(() => {
  const spaces = treeData.value.length;
  const folders = treeData.value.reduce((sum, s) => sum + (s.children?.length || 0), 0);
  let fileCount = 0;
  Object.values(mockFiles).forEach((list) => {
    list.forEach((f) => {
      if (f.type === 'file') fileCount++;
    });
  });
  return { spaces, folders, files: fileCount };
});

const isTrash = computed(() => selectedKeys.value[0] === 'trash');

// ─── 方法 ───
function loadFiles(key: string) {
  loading.value = true;
  setTimeout(() => {
    const direct = mockFiles[key];
    if (direct) {
      currentFiles.value = direct;
    } else {
      const node = findNodeInTree(treeData.value, key);
      if (node?.children) {
        currentFiles.value = node.children.map((child) => ({
          id: child.key,
          name: child.title,
          type: 'folder' as const,
          size: '--',
          modifyTime: '--',
          isShared: child.type?.startsWith('shared'),
        }));
      } else {
        currentFiles.value = [];
      }
    }
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
    expandedKeys.value = ['space-1'];
    loadFiles('space-1');
    return;
  }
  selectedKeys.value = [item.key];
  const parentKeys = findParentKeys(treeData.value, item.key);
  expandedKeys.value = [...new Set([...expandedKeys.value, ...parentKeys])];
  loadFiles(item.key);
}

function handleOpenFolder(file: MyFileItem) {
  if (file.type !== 'folder') return;
  selectedKeys.value = [file.id];
  const parentKeys = findParentKeys(treeData.value, file.id);
  expandedKeys.value = [...new Set([...expandedKeys.value, ...parentKeys, file.id])];
  loadFiles(file.id);
}

function refresh() {
  loadFiles(selectedKeys.value[0]);
  message.success('已刷新');
}

function handleDownload(file: MyFileItem) {
  message.success(`开始下载：${file.name}`);
}

function openRenameModal(file: MyFileItem) {
  editingFile.value = file;
  renameFileName.value = file.name;
  renameModalVisible.value = true;
}

function handleRename(newName: string) {
  if (editingFile.value) {
    editingFile.value.name = newName;
    message.success('重命名成功');
  }
  renameModalVisible.value = false;
}

function handleDeleteFile(file: MyFileItem) {
  message.success(`"${file.name}" 已删除`);
  currentFiles.value = currentFiles.value.filter((f) => f.id !== file.id);
  selectedFileIds.value = selectedFileIds.value.filter((id) => id !== file.id);
}

function handleBatchDelete(files: MyFileItem[]) {
  const names = files.map((f) => f.name).join('、');
  message.success(`已删除 ${files.length} 个文件：${names}`);
  const idsToRemove = new Set(files.map((f) => f.id));
  currentFiles.value = currentFiles.value.filter((f) => !idsToRemove.has(f.id));
  selectedFileIds.value = [];
}

function openShareModal(file: MyFileItem) {
  editingFile.value = file;
  shareModalVisible.value = true;
}

function handleSaveShare(data: ShareFormData) {
  if (!editingFile.value) return;
  editingFile.value.isShared = true;
  const names = data.shareUsers.map((u) => u.user).join('、') || '无';
  const permissions = data.shareUsers.map((u) => (u.permission === 'readonly' ? '只读' : '读写'));
  const permText =
    permissions.length > 0 ? (new Set(permissions).size === 1 ? permissions[0] : permissions.join('、')) : '只读';
  message.success(`已将「${editingFile.value.name}」分享给 ${names}，权限：${permText}`);
  shareModalVisible.value = false;
}

// 复制/移动：目标目录弹窗
function openTargetDirModal(action: 'copy' | 'move', files: MyFileItem[]) {
  targetDirAction.value = action;
  targetDirModalTitle.value = action === 'copy' ? '复制到' : '移动到';
  targetDirPendingFiles.value = files;
  targetDirSelectedKeys.value = [];
  targetDirExpandedKeys.value = ['root-my-files'];
  targetDirModalVisible.value = true;
}

function handleCopyFile(file: MyFileItem) {
  openTargetDirModal('copy', [file]);
}

function handleMoveFile(file: MyFileItem) {
  openTargetDirModal('move', [file]);
}

function handleBatchCopy(files: MyFileItem[]) {
  openTargetDirModal('copy', files);
}

function handleBatchMove(files: MyFileItem[]) {
  openTargetDirModal('move', files);
}

function handleTargetDirConfirm() {
  const targetKey = targetDirSelectedKeys.value[0];
  if (!targetKey) {
    message.warning('请选择目标目录');
    return;
  }
  const action = targetDirAction.value;
  const files = targetDirPendingFiles.value;
  const names = files.map((f) => f.name).join('、');
  const targetNode = findNodeInTree(targetDirTreeData.value, targetKey);
  const targetName = targetNode?.title || targetKey;

  if (action === 'copy') {
    message.success(`已将 ${files.length} 个文件复制到「${targetName}」：${names}`);
  } else {
    message.success(`已将 ${files.length} 个文件移动到「${targetName}」：${names}`);
    const idsToRemove = new Set(files.map((f) => f.id));
    currentFiles.value = currentFiles.value.filter((f) => !idsToRemove.has(f.id));
    selectedFileIds.value = [];
  }
  targetDirModalVisible.value = false;
}

// 新建文件夹
function handleCreateFolder(name: string) {
  if (!name) {
    message.warning('请输入文件夹名称');
    return;
  }
  const newFolder: MyFileItem = {
    id: `folder-${Date.now()}`,
    name,
    type: 'folder',
    size: '--',
    modifyTime: new Date()
      .toLocaleString('zh-CN', { hour12: false })
      .replace(/\//g, '-'),
  };
  currentFiles.value.unshift(newFolder);
  message.success(`文件夹「${name}」创建成功`);
}

// 上传
function handleUploadClick() {
  uploadInputRef.value?.click();
}

function handleFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = input.files;
  if (!files || files.length === 0) return;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const sizeStr =
      file.size > 1024 * 1024
        ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
        : `${(file.size / 1024).toFixed(1)} KB`;
    const ext = file.name.split('.').pop() || '';

    const newFile: MyFileItem = {
      id: `upload-${Date.now()}-${i}`,
      name: file.name,
      type: 'file',
      size: sizeStr,
      modifyTime: new Date()
        .toLocaleString('zh-CN', { hour12: false })
        .replace(/\//g, '-'),
      extension: ext,
    };
    currentFiles.value.unshift(newFile);
  }

  message.success(`已上传 ${files.length} 个文件`);
  input.value = '';
}

// 树节点图标
function nodeIconResolver(node: FileTreeNode) {
  switch (node.type) {
    case 'category':
      if (node.key === 'spaces') return { icon: 'lucide:database', color: '#1677ff' };
      if (node.key === 'team') return { icon: 'lucide:users', color: '#fa8c16' };
      if (node.key === 'shared-from-others') return { icon: 'lucide:share-2', color: '#722ed1' };
      return { icon: 'lucide:folder-kanban', color: '#595959' };
    case 'space':
      return { icon: 'lucide:hard-drive', color: '#1677ff' };
    case 'team-folder':
      return { icon: 'lucide:folder-heart', color: '#fa8c16' };
    case 'shared-user':
      return { icon: 'lucide:user-circle', color: '#722ed1' };
    case 'shared-folder':
      return { icon: 'lucide:folder-symlink', color: '#a855f7' };
    case 'subfolder':
      return { icon: 'lucide:folder-open', color: '#faad14' };
    default:
      return { icon: 'lucide:folder', color: '#faad14' };
  }
}

onMounted(() => {
  loadFiles('space-1');
});
</script>

<template>
  <div class="file-manager-page">
    <!-- 页面顶部概览 -->
    <FilePageHeader :spaces="overviewStats.spaces" />

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
        :show-new-folder="!isTrash"
        :empty-description="isTrash ? '回收站为空' : '暂无文件'"
        @breadcrumb-click="onBreadcrumbClick"
        @refresh="refresh"
        @open-folder="handleOpenFolder"
        @rename="openRenameModal"
        @delete-file="handleDeleteFile"
        @batch-delete="handleBatchDelete"
        @share="openShareModal"
        @copy="handleCopyFile"
        @move="handleMoveFile"
        @batch-copy="handleBatchCopy"
        @batch-move="handleBatchMove"
        @new-folder="newFolderModalVisible = true"
        @upload="handleUploadClick"
      />
    </div>

    <!-- 重命名弹窗（复用全局组件） -->
    <RenameModal
      v-model:visible="renameModalVisible"
      :name="renameFileName"
      @confirm="handleRename"
    />

    <!-- 分享弹窗 -->
    <ShareConfigModal
      v-model:visible="shareModalVisible"
      :title="`分享 - ${editingFile?.name || ''}`"
      :folder-name="editingFile?.name || ''"
      confirm-text="确认分享"
      :user-options="userOptions"
      @ok="handleSaveShare"
    />

    <!-- 目标目录选择弹窗 -->
    <TargetDirModal
      v-model:visible="targetDirModalVisible"
      :title="targetDirModalTitle"
      :tree-data="targetDirTreeData"
      v-model:selected-keys="targetDirSelectedKeys"
      v-model:expanded-keys="targetDirExpandedKeys"
      :pending-files="targetDirPendingFiles"
      :action="targetDirAction"
      @confirm="handleTargetDirConfirm"
    />

    <!-- 新建文件夹弹窗 -->
    <NewFolderModal
      v-model:visible="newFolderModalVisible"
      @confirm="handleCreateFolder"
    />

    <!-- 隐藏的文件上传 input -->
    <input
      ref="uploadInputRef"
      type="file"
      multiple
      style="display: none;"
      @change="handleFileSelected"
    />
  </div>
</template>

<style scoped>
.file-manager-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f5f5f5;
}

.fm-body {
  display: flex;
  flex: 1;
  overflow: hidden;
  padding: 12px;
  gap: 12px;
}

/* 响应式 */
@media (max-width: 768px) {
  .fm-body {
    flex-direction: column;
  }
}
</style>
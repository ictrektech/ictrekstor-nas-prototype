<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { Button, Modal, Form, Input, message } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import {
  FileTreePanel,
  FileManagerPanel,
} from '#/components/FileExplorer';
import type { FileTreeNode, FileItem } from '#/components/FileExplorer';
import { getFileIconClass, buildBreadcrumbPath, findParentKeys, findNodeInTree } from '#/components/FileExplorer';
import NewFolderModal from '#/views/file/my-files/components/NewFolderModal.vue';

// ─── 页面级类型 ───
// 复用通用 FileTreeNode / FileItem，类型别名保持兼容

// ─── Mock 树数据 ───
const mockTree: FileTreeNode[] = [
  {
    key: 'space-1',
    title: '存储空间1',
    type: 'space',
    path: '/share/space1',
    businessId: 'space-1',
    children: [
      {
        key: 'space-1/docs',
        title: '文档',
        type: 'folder',
        path: '/share/space1/文档',
        businessId: 'space-1',
        children: [
          { key: 'space-1/docs/2024', title: '2024', type: 'folder', path: '/share/space1/文档/2024', businessId: 'space-1', isLeaf: true },
          { key: 'space-1/docs/2025', title: '2025', type: 'folder', path: '/share/space1/文档/2025', businessId: 'space-1', isLeaf: true },
        ],
      },
      {
        key: 'space-1/images',
        title: '图片',
        type: 'folder',
        path: '/share/space1/图片',
        businessId: 'space-1',
        children: [
          { key: 'space-1/images/photos', title: '相册', type: 'folder', path: '/share/space1/图片/相册', businessId: 'space-1', isLeaf: true },
          { key: 'space-1/images/screenshots', title: '截图', type: 'folder', path: '/share/space1/图片/截图', businessId: 'space-1', isLeaf: true },
        ],
      },
      { key: 'space-1/videos', title: '视频', type: 'folder', path: '/share/space1/视频', businessId: 'space-1', isLeaf: true },
      { key: 'space-1/music', title: '音乐', type: 'folder', path: '/share/space1/音乐', businessId: 'space-1', isLeaf: true },
      { key: 'space-1/software', title: '软件', type: 'folder', path: '/share/space1/软件', businessId: 'space-1', isLeaf: true },
    ],
  },
  {
    key: 'space-2',
    title: '存储空间2',
    type: 'space',
    path: '/share/space2',
    businessId: 'space-2',
    children: [
      { key: 'space-2/backup', title: '备份', type: 'folder', path: '/share/space2/备份', businessId: 'space-2', isLeaf: true },
      { key: 'space-2/logs', title: '日志', type: 'folder', path: '/share/space2/日志', businessId: 'space-2', isLeaf: true },
      { key: 'space-2/configs', title: '配置文件', type: 'folder', path: '/share/space2/配置文件', businessId: 'space-2', isLeaf: true },
    ],
  },
];

// ─── Mock 文件数据 ───
const mockFiles: Record<string, FileItem[]> = {
  'space-1': [
    { id: 'f-1', name: '文档', type: 'folder', size: '--', modifyTime: '2024-05-06 10:30:00' },
    { id: 'f-2', name: '图片', type: 'folder', size: '--', modifyTime: '2024-05-05 14:20:00' },
    { id: 'f-3', name: '视频', type: 'folder', size: '--', modifyTime: '2024-05-04 09:15:00' },
    { id: 'f-4', name: '音乐', type: 'folder', size: '--', modifyTime: '2024-05-03 16:45:00' },
    { id: 'f-5', name: '软件', type: 'folder', size: '--', modifyTime: '2024-05-02 11:00:00' },
    { id: 'f-6', name: 'README.md', type: 'file', size: '12 KB', modifyTime: '2024-05-01 14:30:00', extension: 'md' },
    { id: 'f-7', name: 'config.json', type: 'file', size: '3 KB', modifyTime: '2024-04-28 08:30:00', extension: 'json' },
    { id: 'f-8', name: 'backup.zip', type: 'file', size: '1.2 GB', modifyTime: '2024-04-25 15:20:00', extension: 'zip' },
  ],
  'space-1/docs': [
    { id: 'd1', name: '2024', type: 'folder', size: '--', modifyTime: '2024-05-06 10:30:00' },
    { id: 'd2', name: '2025', type: 'folder', size: '--', modifyTime: '2024-05-05 14:20:00' },
    { id: 'f1', name: '公司制度.pdf', type: 'file', size: '2.5 MB', modifyTime: '2024-05-03 16:45:00', extension: 'pdf' },
    { id: 'f2', name: '流程规范.docx', type: 'file', size: '856 KB', modifyTime: '2024-04-20 10:10:00', extension: 'docx' },
  ],
  'space-1/docs/2024': [
    { id: 'f3', name: 'Q1报告.xlsx', type: 'file', size: '340 KB', modifyTime: '2024-03-31 09:00:00', extension: 'xlsx' },
    { id: 'f4', name: 'Q2报告.xlsx', type: 'file', size: '380 KB', modifyTime: '2024-06-30 17:00:00', extension: 'xlsx' },
  ],
  'space-1/docs/2025': [
    { id: 'f5', name: '年度计划.docx', type: 'file', size: '1.2 MB', modifyTime: '2025-01-15 10:00:00', extension: 'docx' },
  ],
  'space-1/images': [
    { id: 'd3', name: '相册', type: 'folder', size: '--', modifyTime: '2024-05-06 08:00:00' },
    { id: 'd4', name: '截图', type: 'folder', size: '--', modifyTime: '2024-05-04 11:00:00' },
    { id: 'f6', name: 'banner.png', type: 'file', size: '2.3 MB', modifyTime: '2024-05-01 14:00:00', extension: 'png' },
    { id: 'f7', name: 'logo.svg', type: 'file', size: '15 KB', modifyTime: '2024-04-28 16:30:00', extension: 'svg' },
  ],
  'space-1/images/photos': [
    { id: 'f8', name: '年会.jpg', type: 'file', size: '5.6 MB', modifyTime: '2024-01-20 14:00:00', extension: 'jpg' },
    { id: 'f9', name: '团建.jpg', type: 'file', size: '4.2 MB', modifyTime: '2024-03-15 10:30:00', extension: 'jpg' },
  ],
  'space-1/images/screenshots': [
    { id: 'f10', name: 'bug-001.png', type: 'file', size: '320 KB', modifyTime: '2024-05-06 09:00:00', extension: 'png' },
  ],
  'space-1/videos': [
    { id: 'f11', name: '产品介绍.mp4', type: 'file', size: '256 MB', modifyTime: '2024-04-20 14:00:00', extension: 'mp4' },
    { id: 'f12', name: '培训视频.mp4', type: 'file', size: '1.2 GB', modifyTime: '2024-03-15 10:00:00', extension: 'mp4' },
  ],
  'space-1/music': [
    { id: 'f13', name: '轻音乐.mp3', type: 'file', size: '8 MB', modifyTime: '2024-02-10 16:00:00', extension: 'mp3' },
  ],
  'space-1/software': [
    { id: 'f14', name: 'setup.exe', type: 'file', size: '45 MB', modifyTime: '2024-01-15 09:00:00', extension: 'exe' },
  ],
  'space-2': [
    { id: 'g-1', name: '备份', type: 'folder', size: '--', modifyTime: '2024-05-06 10:30:00' },
    { id: 'g-2', name: '日志', type: 'folder', size: '--', modifyTime: '2024-05-05 14:20:00' },
    { id: 'g-3', name: '配置文件', type: 'folder', size: '--', modifyTime: '2024-05-04 09:15:00' },
    { id: 'g-4', name: 'backup-2024.tar.gz', type: 'file', size: '12.5 GB', modifyTime: '2024-12-31 23:59:00', extension: 'tar.gz' },
  ],
  'space-2/backup': [
    { id: 'g5', name: 'db-backup.sql', type: 'file', size: '2.3 GB', modifyTime: '2024-05-06 02:00:00', extension: 'sql' },
  ],
  'space-2/logs': [
    { id: 'g6', name: 'system.log', type: 'file', size: '45 MB', modifyTime: '2024-05-06 10:00:00', extension: 'log' },
    { id: 'g7', name: 'error.log', type: 'file', size: '12 MB', modifyTime: '2024-05-06 09:00:00', extension: 'log' },
  ],
  'space-2/configs': [
    { id: 'g8', name: 'nginx.conf', type: 'file', size: '8 KB', modifyTime: '2024-04-20 10:00:00', extension: 'conf' },
    { id: 'g9', name: 'docker-compose.yml', type: 'file', size: '3 KB', modifyTime: '2024-04-15 14:00:00', extension: 'yml' },
  ],
};

// ─── 状态 ───
const treeData = ref<FileTreeNode[]>(mockTree);
const selectedKeys = ref<string[]>(['space-1']);
const expandedKeys = ref<string[]>(['space-1']);
const loading = ref(false);
const searchText = ref('');
const viewMode = ref<'list' | 'grid'>('list');
const currentFiles = ref<FileItem[]>([]);
const selectedFileIds = ref<string[]>([]);

// 重命名
const renameModalVisible = ref(false);
const renameFormRef = ref();
const renameForm = ref({ name: '' });
const editingFile = ref<FileItem | null>(null);

// 新建文件夹
const newFolderModalVisible = ref(false);

// 上传
const uploadInputRef = ref<HTMLInputElement | null>(null);

// ─── 计算属性 ───
const breadcrumbPath = computed(() => {
  const key = selectedKeys.value[0];
  if (!key) return [{ title: '设备全部文件', key: 'root' }];
  return buildBreadcrumbPath(treeData.value, key, '设备全部文件', 'root');
});

const overviewStats = computed(() => {
  let folderCount = 0;
  let fileCount = 0;
  Object.values(mockFiles).forEach((list) => {
    list.forEach((f) => {
      if (f.type === 'folder') folderCount++;
      else fileCount++;
    });
  });
  return {
    spaces: treeData.value.length,
    folders: folderCount,
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

// 新建文件夹
function handleCreateFolder(name: string) {
  if (!name) {
    message.warning('请输入文件夹名称');
    return;
  }
  const newFolder: FileItem = {
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

    const newFile: FileItem = {
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

// 树节点图标自定义
function nodeIconResolver(node: FileTreeNode) {
  if (node.type === 'space') {
    return { icon: 'lucide:hard-drive', color: '#1677ff' };
  }
  return { icon: 'lucide:folder', color: '#faad14' };
}

onMounted(() => {
  loadFiles('space-1');
});
</script>

<template>
  <div class="file-manager-page">
    <!-- ═══════ 页面顶部概览 ═══════ -->
    <div class="page-header">
      <div class="page-header-left">
        <div class="page-icon-box">
          <IconifyIcon icon="lucide:folder-open" style="font-size: 20px; color: #1677ff;" />
        </div>
        <div class="page-title-area">
          <h1 class="page-title">设备全部文件</h1>
          <p class="page-desc">管理存储空间中挂载目录下的所有文件</p>
        </div>
      </div>
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
        @new-folder="newFolderModalVisible = true"
        @upload="handleUploadClick"
      />
    </div>

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

/* ═══ 页面顶部概览 ═══ */
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
  min-width: 100px;
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

/* ═══ 主体区域 ═══ */
.fm-body {
  display: flex;
  flex: 1;
  overflow: hidden;
  padding: 12px;
  gap: 12px;
}

/* ═══ 响应式 ═══ */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

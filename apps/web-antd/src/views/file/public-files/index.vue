<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import {
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
} from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import {
  FileTreePanel,
  FileManagerPanel,
} from '#/components/FileExplorer';
import type { FileTreeNode, FileItem } from '#/components/FileExplorer';
import { findParentKeys, findNodeInTree } from '#/components/FileExplorer';

/** 存储池选项 */
const poolOptions = [
  { value: 'pool-1', label: 'Pool-1 (RAID 5) - 4TB' },
  { value: 'pool-2', label: 'Pool-2 (RAID 1) - 2TB' },
  { value: 'pool-3', label: 'Pool-3 (RAID 10) - 8TB' },
];

/** 存储池映射 */
const poolLabelMap: Record<string, string> = {
  'pool-1': 'Pool-1 (RAID 5)',
  'pool-2': 'Pool-2 (RAID 1)',
  'pool-3': 'Pool-3 (RAID 10)',
};

// ─── Mock 树数据：公共文件 ───
const mockTree: FileTreeNode[] = [
  {
    key: 'pub-docs',
    title: '文档',
    type: 'public-folder',
    path: '/public/文档',
    storagePool: 'Pool-1 (RAID 5)',
    poolId: 'pool-1',
    children: [
      { key: 'pub-docs/制度', title: '公司制度', type: 'folder', path: '/public/文档/公司制度', isLeaf: true },
      { key: 'pub-docs/规范', title: '流程规范', type: 'folder', path: '/public/文档/流程规范', isLeaf: true },
    ],
  },
  {
    key: 'pub-design',
    title: '设计资源',
    type: 'public-folder',
    path: '/public/设计资源',
    storagePool: 'Pool-1 (RAID 5)',
    poolId: 'pool-1',
    children: [
      { key: 'pub-design/ui', title: 'UI 设计', type: 'folder', path: '/public/设计资源/UI', isLeaf: true },
      { key: 'pub-design/brand', title: '品牌素材', type: 'folder', path: '/public/设计资源/品牌', isLeaf: true },
    ],
  },
  {
    key: 'pub-finance',
    title: '财务资料',
    type: 'public-folder',
    path: '/public/财务资料',
    storagePool: 'Pool-2 (RAID 1)',
    poolId: 'pool-2',
    children: [
      { key: 'pub-finance/2024', title: '2024 年报', type: 'folder', path: '/public/财务资料/2024', isLeaf: true },
    ],
  },
  {
    key: 'pub-training',
    title: '培训资料',
    type: 'public-folder',
    path: '/public/培训资料',
    storagePool: 'Pool-2 (RAID 1)',
    poolId: 'pool-2',
    children: [
      { key: 'pub-training/new', title: '新员工培训', type: 'folder', path: '/public/培训资料/新员工', isLeaf: true },
    ],
  },
  {
    key: 'pub-software',
    title: '共享软件',
    type: 'public-folder',
    path: '/public/共享软件',
    storagePool: 'Pool-1 (RAID 5)',
    poolId: 'pool-1',
    children: [
      { key: 'pub-software/tools', title: '常用工具', type: 'folder', path: '/public/共享软件/工具', isLeaf: true },
    ],
  },
];

// ─── Mock 文件数据 ───
const mockFiles: Record<string, FileItem[]> = {
  'pub-docs': [
    { id: 'pd1', name: '公司制度', type: 'folder', size: '--', modifyTime: '2024-05-06 10:30:00' },
    { id: 'pd2', name: '流程规范', type: 'folder', size: '--', modifyTime: '2024-05-05 14:20:00' },
    { id: 'pd3', name: 'README.md', type: 'file', size: '12 KB', modifyTime: '2024-05-01 14:30:00', extension: 'md' },
  ],
  'pub-docs/制度': [
    { id: 'pd-s1', name: '员工手册.pdf', type: 'file', size: '2.5 MB', modifyTime: '2024-05-03 16:45:00', extension: 'pdf' },
    { id: 'pd-s2', name: '考勤制度.docx', type: 'file', size: '856 KB', modifyTime: '2024-04-20 10:10:00', extension: 'docx' },
  ],
  'pub-docs/规范': [
    { id: 'pd-g1', name: '开发规范.md', type: 'file', size: '28 KB', modifyTime: '2024-04-15 14:00:00', extension: 'md' },
    { id: 'pd-g2', name: '设计规范.pdf', type: 'file', size: '1.5 MB', modifyTime: '2024-04-10 10:00:00', extension: 'pdf' },
  ],
  'pub-design': [
    { id: 'pde1', name: 'UI 设计', type: 'folder', size: '--', modifyTime: '2024-05-06 08:00:00' },
    { id: 'pde2', name: '品牌素材', type: 'folder', size: '--', modifyTime: '2024-05-04 11:00:00' },
    { id: 'pde3', name: 'logo.svg', type: 'file', size: '15 KB', modifyTime: '2024-05-01 14:00:00', extension: 'svg' },
  ],
  'pub-design/ui': [
    { id: 'pde-u1', name: '首页设计.fig', type: 'file', size: '12 MB', modifyTime: '2024-05-05 14:00:00', extension: 'fig' },
  ],
  'pub-design/brand': [
    { id: 'pde-b1', name: '品牌手册.pdf', type: 'file', size: '25 MB', modifyTime: '2024-04-20 10:00:00', extension: 'pdf' },
  ],
  'pub-finance': [
    { id: 'pf1', name: '2024 年报', type: 'folder', size: '--', modifyTime: '2024-05-05 09:00:00' },
    { id: 'pf2', name: '资产负债表.pdf', type: 'file', size: '1.2 MB', modifyTime: '2024-04-30 11:00:00', extension: 'pdf' },
  ],
  'pub-finance/2024': [
    { id: 'pf-y1', name: 'Q1.xlsx', type: 'file', size: '200 KB', modifyTime: '2024-03-31 09:00:00', extension: 'xlsx' },
    { id: 'pf-y2', name: 'Q2.xlsx', type: 'file', size: '220 KB', modifyTime: '2024-06-30 17:00:00', extension: 'xlsx' },
  ],
  'pub-training': [
    { id: 'pt1', name: '新员工培训', type: 'folder', size: '--', modifyTime: '2024-04-28 09:00:00' },
    { id: 'pt2', name: '安全规范.pdf', type: 'file', size: '8 MB', modifyTime: '2024-03-15 09:00:00', extension: 'pdf' },
  ],
  'pub-training/new': [
    { id: 'pt-n1', name: '入职指南.pdf', type: 'file', size: '5 MB', modifyTime: '2024-04-20 10:00:00', extension: 'pdf' },
    { id: 'pt-n2', name: '培训视频.mp4', type: 'file', size: '256 MB', modifyTime: '2024-04-15 09:00:00', extension: 'mp4' },
  ],
  'pub-software': [
    { id: 'ps1', name: '常用工具', type: 'folder', size: '--', modifyTime: '2024-04-15 11:00:00' },
    { id: 'ps2', name: 'setup.exe', type: 'file', size: '45 MB', modifyTime: '2024-01-15 09:00:00', extension: 'exe' },
  ],
  'pub-software/tools': [
    { id: 'ps-t1', name: '工具包.zip', type: 'file', size: '120 MB', modifyTime: '2024-04-10 10:00:00', extension: 'zip' },
  ],
};

// ─── 状态 ───
const treeData = ref<FileTreeNode[]>(mockTree);
const selectedKeys = ref<string[]>(['pub-docs']);
const expandedKeys = ref<string[]>(['pub-docs']);
const loading = ref(false);
const searchText = ref('');
const viewMode = ref<'list' | 'grid'>('list');
const currentFiles = ref<FileItem[]>([]);
const selectedFileIds = ref<string[]>([]);

// ─── 计算属性 ───
const breadcrumbPath = computed(() => {
  const key = selectedKeys.value[0];
  if (!key) return [{ title: '公共文件', key: 'root' }];
  const parts: { title: string; key: string }[] = [{ title: '公共文件', key: 'root' }];
  function findPath(nodes: FileTreeNode[], target: string, current: { title: string; key: string }[]): boolean {
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
  const folders = treeData.value.length;
  let fileCount = 0;
  Object.values(mockFiles).forEach(list => {
    list.forEach(f => { if (f.type === 'file') fileCount++; });
  });
  return { folders, files: fileCount };
});

/** 当前选中的公共文件夹所属存储池 */
const currentStoragePool = computed(() => {
  const key = selectedKeys.value[0];
  if (!key) return null;
  // 先查找直接匹配
  let node = findNodeInTree(treeData.value, key);
  if (!node) return null;
  // 如果是子目录，向上查找到公共文件夹根节点
  if (node.type !== 'public-folder') {
    const findParentPublicFolder = (nodes: FileTreeNode[], targetKey: string, parent?: FileTreeNode): FileTreeNode | null => {
      for (const n of nodes) {
        if (n.key === targetKey) return parent || null;
        if (n.children) {
          const res = findParentPublicFolder(n.children, targetKey, n.type === 'public-folder' ? n : parent);
          if (res) return res;
        }
      }
      return null;
    };
    node = findParentPublicFolder(treeData.value, key) || node;
  }
  return node.storagePool || null;
});

// ─── 创建公共文件夹弹窗 ───
const createModalVisible = ref(false);
const createFormRef = ref<InstanceType<typeof Form> | null>(null);
const createForm = ref({ name: '', storagePool: '' });

function openCreateModal() {
  createForm.value = { name: '', storagePool: '' };
  createModalVisible.value = true;
}

function handleCreateFolder() {
  createFormRef.value?.validate().then(() => {
    const { name, storagePool } = createForm.value;
    const key = `pub-${Date.now()}`;
    const newNode: FileTreeNode = {
      key,
      title: name,
      type: 'public-folder',
      path: `/public/${name}`,
      storagePool: poolLabelMap[storagePool] || storagePool,
      poolId: storagePool,
      children: [],
    };
    treeData.value.push(newNode);
    mockFiles[key] = [];
    createModalVisible.value = false;
    message.success(`公共文件夹「${name}」创建成功`);
    // 自动选中新创建的文件夹
    selectedKeys.value = [key];
    expandedKeys.value = [...expandedKeys.value, key];
    loadFiles(key);
  }).catch(() => {});
}

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
        currentFiles.value = node.children.map(child => ({
          id: child.key,
          name: child.title,
          type: 'folder' as const,
          size: '--',
          modifyTime: '--',
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
    selectedKeys.value = ['pub-docs'];
    expandedKeys.value = ['pub-docs'];
    loadFiles('pub-docs');
    return;
  }
  selectedKeys.value = [item.key];
  const parentKeys = findParentKeys(treeData.value, item.key);
  expandedKeys.value = [...new Set([...expandedKeys.value, ...parentKeys])];
  loadFiles(item.key);
}

function handleOpenFolder(file: FileItem) {
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

function handleDownload(file: FileItem) {
  message.success(`开始下载：${file.name}`);
}

// ─── 树节点图标 ───
function nodeIconResolver(node: FileTreeNode) {
  switch (node.type) {
    case 'public-folder':
      return { icon: 'lucide:folder-heart', color: '#fa8c16' };
    case 'folder':
      return { icon: 'lucide:folder-open', color: '#faad14' };
    default:
      return { icon: 'lucide:folder', color: '#faad14' };
  }
}

onMounted(() => {
  loadFiles('pub-docs');
});
</script>

<template>
  <div class="file-manager-page">
    <!-- ═══════ 页面顶部概览 ═══════ -->
    <div class="page-header">
      <div class="page-header-left">
        <div class="page-icon-box">
          <IconifyIcon icon="lucide:folder-heart" style="font-size: 20px; color: #fa8c16;" />
        </div>
        <div class="page-title-area">
          <h1 class="page-title">公共文件</h1>
          <div class="page-title-actions">
            <p class="page-desc">团队公共文件资源，所有成员均可访问</p>
            <Button type="primary" class="create-btn" size="small" @click="openCreateModal">
              <IconifyIcon icon="lucide:folder-plus" style="font-size: 13px;" />
              创建公共文件夹
            </Button>
          </div>
        </div>
      </div>
      <div class="page-header-right">
        <!-- 存储池状态显示 -->
        <div v-if="currentStoragePool" class="pool-badge">
          <IconifyIcon icon="lucide:hard-drive" style="font-size: 14px; color: #1677ff;" />
          <span class="pool-badge-label">所属存储池</span>
          <span class="pool-badge-value">{{ currentStoragePool }}</span>
        </div>
        <div class="overview-card">
          <IconifyIcon icon="lucide:folder-open" style="font-size: 16px; color: #faad14;" />
          <div class="overview-info">
            <span class="overview-label">公共文件夹</span>
            <span class="overview-value">{{ overviewStats.folders }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建公共文件夹弹窗 -->
    <Modal
      v-model:open="createModalVisible"
      title="创建公共文件夹"
      width="400px"
      @ok="handleCreateFolder"
      ok-text="创建"
    >
      <Form
        ref="createFormRef"
        :model="createForm"
        layout="vertical"
        :rules="{
          name: [{ required: true, message: '请输入文件夹名称', trigger: 'blur' }],
          storagePool: [{ required: true, message: '请选择存储池', trigger: 'change' }],
        }"
      >
        <Form.Item label="文件夹名称" name="name">
          <Input v-model:value="createForm.name" placeholder="如：公司文档" />
        </Form.Item>
        <Form.Item label="所属存储池" name="storagePool">
          <Select
            v-model:value="createForm.storagePool"
            placeholder="请选择存储池"
            :options="poolOptions"
          />
        </Form.Item>
      </Form>
    </Modal>

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
        :show-new-folder="false"
        empty-description="暂无文件"
        @breadcrumb-click="onBreadcrumbClick"
        @refresh="refresh"
        @open-folder="handleOpenFolder"
      >
        <template #action-cell="{ file }">
          <div class="custom-actions">
            <Button size="small" type="link" class="action-link" @click="handleDownload(file)">
              <IconifyIcon icon="lucide:download" style="font-size: 13px;" />
              下载
            </Button>
          </div>
        </template>
      </FileManagerPanel>
    </div>
  </div>
</template>

<style scoped>
.file-manager-page {
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
  margin: 0;
}

.page-title-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
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

/* 存储池徽章 */
.pool-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #e6f4ff;
  border: 1px solid #91caff;
  border-radius: 8px;
}

.pool-badge-label {
  font-size: 11px;
  color: #1677ff;
  font-weight: 500;
}

.pool-badge-value {
  font-size: 13px;
  font-weight: 600;
  color: #0958d9;
}

/* 创建按钮 */
.create-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.fm-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.custom-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.2s;
}

:deep(.ant-table-tbody > tr:hover) .custom-actions {
  opacity: 1;
}

.action-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0 6px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

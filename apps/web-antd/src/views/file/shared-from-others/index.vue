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
import {
  FileTreePanel,
  FileManagerPanel,
} from '#/components/FileExplorer';
import type { FileTreeNode, FileItem } from '#/components/FileExplorer';
import { findParentKeys, findNodeInTree } from '#/components/FileExplorer';

// ─── Mock 树数据：他人分享 ───
const mockTree: FileTreeNode[] = [
  {
    key: 'sfo-zhangsan',
    title: '来自 张三',
    type: 'shared-user',
    path: '/shared/张三',
    children: [
      { key: 'sfo-zhangsan/docs', title: '共享文档', type: 'folder', path: '/shared/张三/共享文档', isLeaf: true },
      { key: 'sfo-zhangsan/design', title: '共享设计', type: 'folder', path: '/shared/张三/共享设计', isLeaf: true },
    ],
  },
  {
    key: 'sfo-lisi',
    title: '来自 李四',
    type: 'shared-user',
    path: '/shared/李四',
    children: [
      { key: 'sfo-lisi/projects', title: '项目资料', type: 'folder', path: '/shared/李四/项目资料', isLeaf: true },
      { key: 'sfo-lisi/videos', title: '培训视频', type: 'folder', path: '/shared/李四/培训视频', isLeaf: true },
    ],
  },
  {
    key: 'sfo-wangwu',
    title: '来自 王五',
    type: 'shared-user',
    path: '/shared/王五',
    children: [
      { key: 'sfo-wangwu/audio', title: '会议录音', type: 'folder', path: '/shared/王五/会议录音', isLeaf: true },
    ],
  },
];

// ─── Mock 文件数据 ───
const mockFiles: Record<string, FileItem[]> = {
  'sfo-zhangsan': [
    { id: 'zs-d', name: '共享文档', type: 'folder', size: '--', modifyTime: '2024-05-06 10:30:00' },
    { id: 'zs-de', name: '共享设计', type: 'folder', size: '--', modifyTime: '2024-05-05 14:20:00' },
  ],
  'sfo-zhangsan/docs': [
    { id: 'zs-d1', name: '项目计划书.pdf', type: 'file', size: '2.5 MB', modifyTime: '2024-05-06 10:30:00', extension: 'pdf' },
    { id: 'zs-d2', name: '设计规范.docx', type: 'file', size: '856 KB', modifyTime: '2024-05-05 14:20:00', extension: 'docx' },
    { id: 'zs-d3', name: 'Q1报表.xlsx', type: 'file', size: '340 KB', modifyTime: '2024-05-03 09:15:00', extension: 'xlsx' },
  ],
  'sfo-zhangsan/design': [
    { id: 'zs-de1', name: '产品原型.rp', type: 'file', size: '12 MB', modifyTime: '2024-04-28 16:00:00', extension: 'rp' },
    { id: 'zs-de2', name: '架构图.png', type: 'file', size: '3.2 MB', modifyTime: '2024-04-20 09:00:00', extension: 'png' },
  ],
  'sfo-lisi': [
    { id: 'ls-p', name: '项目资料', type: 'folder', size: '--', modifyTime: '2024-04-20 09:15:00' },
    { id: 'ls-v', name: '培训视频', type: 'folder', size: '--', modifyTime: '2024-03-20 10:00:00' },
  ],
  'sfo-lisi/projects': [
    { id: 'ls-p1', name: '技术方案.md', type: 'file', size: '28 KB', modifyTime: '2024-04-15 14:00:00', extension: 'md' },
    { id: 'ls-p2', name: '接口文档.pdf', type: 'file', size: '1.5 MB', modifyTime: '2024-04-10 10:00:00', extension: 'pdf' },
  ],
  'sfo-lisi/videos': [
    { id: 'ls-v1', name: '新员工培训.mp4', type: 'file', size: '512 MB', modifyTime: '2024-03-20 10:00:00', extension: 'mp4' },
    { id: 'ls-v2', name: '安全规范.pdf', type: 'file', size: '8 MB', modifyTime: '2024-03-15 09:00:00', extension: 'pdf' },
  ],
  'sfo-wangwu': [
    { id: 'ww-a', name: '会议录音', type: 'folder', size: '--', modifyTime: '2024-05-01 12:00:00' },
  ],
  'sfo-wangwu/audio': [
    { id: 'ww-a1', name: '周会-20240501.mp3', type: 'file', size: '45 MB', modifyTime: '2024-05-01 12:00:00', extension: 'mp3' },
    { id: 'ww-a2', name: '周会-20240508.mp3', type: 'file', size: '52 MB', modifyTime: '2024-05-08 12:00:00', extension: 'mp3' },
  ],
};

// ─── 状态 ───
const treeData = ref<FileTreeNode[]>(mockTree);
const selectedKeys = ref<string[]>(['sfo-zhangsan']);
const expandedKeys = ref<string[]>(['sfo-zhangsan']);
const loading = ref(false);
const searchText = ref('');
const viewMode = ref<'list' | 'grid'>('list');
const currentFiles = ref<FileItem[]>([]);

// ─── 计算属性 ───
const breadcrumbPath = computed(() => {
  const key = selectedKeys.value[0];
  if (!key) return [{ title: '他人分享', key: 'root' }];
  const parts: { title: string; key: string }[] = [{ title: '他人分享', key: 'root' }];
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
  const users = treeData.value.length;
  let fileCount = 0;
  Object.values(mockFiles).forEach(list => {
    list.forEach(f => { if (f.type === 'file') fileCount++; });
  });
  return { users, files: fileCount };
});

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
    selectedKeys.value = ['sfo-zhangsan'];
    expandedKeys.value = ['sfo-zhangsan'];
    loadFiles('sfo-zhangsan');
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

function handleSave(file: FileItem) {
  message.success(`"${file.name}" 已保存到我的文件`);
}

// ─── 树节点图标 ───
function nodeIconResolver(node: FileTreeNode) {
  switch (node.type) {
    case 'shared-user':
      return { icon: 'lucide:user-circle', color: '#722ed1' };
    case 'folder':
      return { icon: 'lucide:folder-symlink', color: '#a855f7' };
    default:
      return { icon: 'lucide:folder', color: '#faad14' };
  }
}

onMounted(() => {
  loadFiles('sfo-zhangsan');
});
</script>

<template>
  <div class="file-manager-page">
    <!-- ═══════ 页面顶部概览 ═══════ -->
    <div class="page-header">
      <div class="page-header-left">
        <div class="page-icon-box">
          <IconifyIcon icon="lucide:share-2" style="font-size: 20px; color: #722ed1;" />
        </div>
        <div class="page-title-area">
          <h1 class="page-title">他人分享</h1>
          <p class="page-desc">其他用户分享给你的文件和文件夹</p>
        </div>
      </div>
      <div class="page-header-right">
        <div class="overview-card">
          <IconifyIcon icon="lucide:users" style="font-size: 16px; color: #722ed1;" />
          <div class="overview-info">
            <span class="overview-label">分享者</span>
            <span class="overview-value">{{ overviewStats.users }}</span>
          </div>
        </div>
        <div class="overview-card">
          <IconifyIcon icon="lucide:folder-open" style="font-size: 16px; color: #faad14;" />
          <div class="overview-info">
            <span class="overview-label">文件夹</span>
            <span class="overview-value">{{ treeData.reduce((sum, s) => sum + (s.children?.length || 0), 0) }}</span>
          </div>
        </div>
        <div class="overview-card">
          <IconifyIcon icon="lucide:file" style="font-size: 16px; color: #52c41a;" />
          <div class="overview-info">
            <span class="overview-label">文件总数</span>
            <span class="overview-value">{{ overviewStats.files }}</span>
          </div>
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
            <Button size="small" type="link" class="action-link" @click="handleSave(file)">
              <IconifyIcon icon="lucide:folder-input" style="font-size: 13px;" />
              保存
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
  background: #f5f5f5;
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
  background: #f9f0ff;
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

.fm-body {
  display: flex;
  flex: 1;
  overflow: hidden;
  padding: 12px;
  gap: 12px;
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

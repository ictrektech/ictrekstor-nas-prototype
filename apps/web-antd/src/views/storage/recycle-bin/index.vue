<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import {
  FileTreePanel,
  FileManagerPanel,
} from '#/components/FileExplorer';
import type { FileTreeNode, FileItem } from '#/components/FileExplorer';
import { buildBreadcrumbPath, findParentKeys } from '#/components/FileExplorer';

// ─── Mock 树数据：仅存储空间 + 团队文件 ───
const mockTree: FileTreeNode[] = [
  {
    key: 'space-group',
    title: '存储空间',
    type: 'root-space',
    path: '/',
    children: [
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
            isLeaf: true,
          },
          {
            key: 'space-1/images',
            title: '图片',
            type: 'folder',
            path: '/share/space1/图片',
            businessId: 'space-1',
            isLeaf: true,
          },
          {
            key: 'space-1/videos',
            title: '视频',
            type: 'folder',
            path: '/share/space1/视频',
            businessId: 'space-1',
            isLeaf: true,
          },
        ],
      },
      {
        key: 'space-2',
        title: '存储空间2',
        type: 'space',
        path: '/share/space2',
        businessId: 'space-2',
        children: [
          {
            key: 'space-2/backup',
            title: '备份',
            type: 'folder',
            path: '/share/space2/备份',
            businessId: 'space-2',
            isLeaf: true,
          },
          {
            key: 'space-2/logs',
            title: '日志',
            type: 'folder',
            path: '/share/space2/日志',
            businessId: 'space-2',
            isLeaf: true,
          },
        ],
      },
    ],
  },
  {
    key: 'team-group',
    title: '团队文件',
    type: 'root-team',
    path: '/',
    children: [
      {
        key: 'tf-1',
        title: '文档',
        type: 'team-folder',
        path: '/share/team/文档',
        businessId: 'tf-1',
        children: [
          {
            key: 'tf-1/project',
            title: '项目文档',
            type: 'subfolder',
            path: '/share/team/文档/项目文档',
            businessId: 'tf-1',
            isLeaf: true,
          },
          {
            key: 'tf-1/meeting',
            title: '会议纪要',
            type: 'subfolder',
            path: '/share/team/文档/会议纪要',
            businessId: 'tf-1',
            isLeaf: true,
          },
        ],
      },
      {
        key: 'tf-2',
        title: '设计资源',
        type: 'team-folder',
        path: '/share/team/设计资源',
        businessId: 'tf-2',
        children: [
          {
            key: 'tf-2/ui',
            title: 'UI 设计',
            type: 'subfolder',
            path: '/share/team/设计资源/UI',
            businessId: 'tf-2',
            isLeaf: true,
          },
        ],
      },
      {
        key: 'tf-3',
        title: '财务资料',
        type: 'team-folder',
        path: '/share/team/财务资料',
        businessId: 'tf-3',
        isLeaf: false,
      },
    ],
  },
];

// ─── Mock 回收站文件数据 ───
const mockRecycleFiles: Record<string, FileItem[]> = {
  'space-1': [
    {
      id: 'r-s1-1',
      name: '旧项目文档.docx',
      type: 'file',
      size: '2.5 MB',
      modifyTime: '2024-05-01 10:00:00',
      extension: 'docx',
      deletedTime: '2024-05-08 14:30:00',
      originalPath: '/share/space1/文档',
    },
    {
      id: 'r-s1-2',
      name: '临时截图.png',
      type: 'file',
      size: '3.2 MB',
      modifyTime: '2024-04-28 16:00:00',
      extension: 'png',
      deletedTime: '2024-05-07 09:15:00',
      originalPath: '/share/space1/图片',
    },
    {
      id: 'r-s1-3',
      name: '测试文件夹',
      type: 'folder',
      size: '--',
      modifyTime: '2024-04-20 08:00:00',
      deletedTime: '2024-05-06 11:00:00',
      originalPath: '/share/space1',
    },
  ],
  'space-1/docs': [
    {
      id: 'r-s1d-1',
      name: '废弃规范.docx',
      type: 'file',
      size: '856 KB',
      modifyTime: '2024-03-15 10:00:00',
      extension: 'docx',
      deletedTime: '2024-05-08 16:20:00',
      originalPath: '/share/space1/文档',
    },
  ],
  'space-2': [
    {
      id: 'r-s2-1',
      name: 'db-backup-2023.sql',
      type: 'file',
      size: '1.8 GB',
      modifyTime: '2023-12-31 23:00:00',
      extension: 'sql',
      deletedTime: '2024-05-05 03:00:00',
      originalPath: '/share/space2/备份',
    },
  ],
  'tf-1': [
    {
      id: 'r-t1-1',
      name: '旧需求文档.docx',
      type: 'file',
      size: '1.2 MB',
      modifyTime: '2024-02-10 14:00:00',
      extension: 'docx',
      deletedTime: '2024-05-08 10:00:00',
      originalPath: '/share/team/文档',
    },
    {
      id: 'r-t1-2',
      name: '流程图v1.png',
      type: 'file',
      size: '2.3 MB',
      modifyTime: '2024-01-20 09:00:00',
      extension: 'png',
      deletedTime: '2024-05-07 15:30:00',
      originalPath: '/share/team/文档',
    },
  ],
  'tf-1/project': [
    {
      id: 'r-t1p-1',
      name: 'PRD_草稿.docx',
      type: 'file',
      size: '980 KB',
      modifyTime: '2024-03-01 11:00:00',
      extension: 'docx',
      deletedTime: '2024-05-06 09:00:00',
      originalPath: '/share/team/文档/项目文档',
    },
  ],
  'tf-2': [
    {
      id: 'r-t2-1',
      name: 'logo-old.svg',
      type: 'file',
      size: '12 KB',
      modifyTime: '2023-06-15 10:00:00',
      extension: 'svg',
      deletedTime: '2024-05-08 08:00:00',
      originalPath: '/share/team/设计资源',
    },
  ],
};

// ─── 状态 ───
const treeData = ref<FileTreeNode[]>(mockTree);
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
  const fileCount = Object.values(mockRecycleFiles).reduce(
    (sum, list) => sum + list.length,
    0,
  );
  const totalSize = Object.values(mockRecycleFiles)
    .flat()
    .filter((f) => f.type === 'file')
    .length;
  const folderCount = Object.values(mockRecycleFiles)
    .flat()
    .filter((f) => f.type === 'folder')
    .length;
  return {
    totalFiles: fileCount,
    fileItems: totalSize,
    folderItems: folderCount,
  };
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

// 树节点图标自定义
function nodeIconResolver(node: FileTreeNode) {
  if (node.type === 'root-space') {
    return { icon: 'lucide:hard-drive', color: '#1677ff' };
  }
  if (node.type === 'root-team') {
    return { icon: 'lucide:users', color: '#1677ff' };
  }
  if (node.type === 'space') {
    return { icon: 'lucide:server', color: '#1677ff' };
  }
  if (node.type === 'team-folder') {
    return { icon: 'lucide:folder-heart', color: '#1677ff' };
  }
  if (node.isLeaf) {
    return { icon: 'lucide:folder-open', color: '#faad14' };
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
        <div class="page-icon-box page-icon-box--recycle">
          <IconifyIcon icon="lucide:trash-2" style="font-size: 20px; color: #1677ff;" />
        </div>
        <div class="page-title-area">
          <h1 class="page-title">回收站</h1>
          <p class="page-desc">查看已删除的文件，支持还原或彻底删除</p>
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

      <!-- 右侧文件区域（回收站模式） -->
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

/* ═══ 路径列样式 ═══ */
.file-manager-panel__path {
  color: #8c8c8c;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ═══ 响应式 ═══ */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

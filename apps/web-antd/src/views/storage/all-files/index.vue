<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import {
  Button,
  Input,
  Tree,
  Table,
  Empty,
  Radio,
  Tag,
  Tooltip,
  Breadcrumb,
  Modal,
  Form,
  message,
  Popconfirm,
} from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';

// ─── 类型 ───
interface FileTreeNode {
  key: string;
  title: string;
  type: 'space' | 'folder';
  path?: string;
  spaceId?: string;
  children?: FileTreeNode[];
  isLeaf?: boolean;
}

interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  size: string;
  modifyTime: string;
  extension?: string;
}

// ─── Mock 数据 ───
const mockTree: FileTreeNode[] = [
  {
    key: 'space-1',
    title: '存储空间1',
    type: 'space',
    path: '/share/space1',
    spaceId: 'space-1',
    children: [
      {
        key: 'space-1/docs',
        title: '文档',
        type: 'folder',
        path: '/share/space1/文档',
        spaceId: 'space-1',
        children: [
          { key: 'space-1/docs/2024', title: '2024', type: 'folder', path: '/share/space1/文档/2024', spaceId: 'space-1', isLeaf: true },
          { key: 'space-1/docs/2025', title: '2025', type: 'folder', path: '/share/space1/文档/2025', spaceId: 'space-1', isLeaf: true },
        ],
      },
      {
        key: 'space-1/images',
        title: '图片',
        type: 'folder',
        path: '/share/space1/图片',
        spaceId: 'space-1',
        children: [
          { key: 'space-1/images/photos', title: '相册', type: 'folder', path: '/share/space1/图片/相册', spaceId: 'space-1', isLeaf: true },
          { key: 'space-1/images/screenshots', title: '截图', type: 'folder', path: '/share/space1/图片/截图', spaceId: 'space-1', isLeaf: true },
        ],
      },
      { key: 'space-1/videos', title: '视频', type: 'folder', path: '/share/space1/视频', spaceId: 'space-1', isLeaf: true },
      { key: 'space-1/music', title: '音乐', type: 'folder', path: '/share/space1/音乐', spaceId: 'space-1', isLeaf: true },
      { key: 'space-1/software', title: '软件', type: 'folder', path: '/share/space1/软件', spaceId: 'space-1', isLeaf: true },
    ],
  },
  {
    key: 'space-2',
    title: '存储空间2',
    type: 'space',
    path: '/share/space2',
    spaceId: 'space-2',
    children: [
      { key: 'space-2/backup', title: '备份', type: 'folder', path: '/share/space2/备份', spaceId: 'space-2', isLeaf: true },
      { key: 'space-2/logs', title: '日志', type: 'folder', path: '/share/space2/日志', spaceId: 'space-2', isLeaf: true },
      { key: 'space-2/configs', title: '配置文件', type: 'folder', path: '/share/space2/配置文件', spaceId: 'space-2', isLeaf: true },
    ],
  },
];

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

// 重命名
const renameModalVisible = ref(false);
const renameFormRef = ref();
const renameForm = ref({ name: '' });
const editingFile = ref<FileItem | null>(null);

// ─── 计算属性 ───
const breadcrumbPath = computed(() => {
  const key = selectedKeys.value[0];
  if (!key) return [{ title: '设备全部文件', key: 'root' }];

  const parts: { title: string; key: string }[] = [{ title: '设备全部文件', key: 'root' }];

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

const filteredFiles = computed(() => {
  if (!searchText.value) return currentFiles.value;
  const kw = searchText.value.toLowerCase();
  return currentFiles.value.filter((f) => f.name.toLowerCase().includes(kw));
});

const sortedFiles = computed(() => {
  return [...filteredFiles.value].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
});

// 概览统计
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

function onSelectTree(selected: string[]) {
  if (selected.length > 0) {
    selectedKeys.value = selected;
    loadFiles(selected[0]);
  }
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

function findParentKeys(nodes: FileTreeNode[], target: string): string[] {
  for (const node of nodes) {
    if (node.key === target) return [];
    if (node.children) {
      const child = findParentKeys(node.children, target);
      if (child.length >= 0 && node.children.some((c) => c.key === target || findParentKeysInChildren(c, target))) {
        return [node.key, ...child];
      }
      const deeper = findParentKeys(node.children, target);
      if (deeper.length > 0) return [node.key, ...deeper];
    }
  }
  return [];
}

function findParentKeysInChildren(node: FileTreeNode, target: string): boolean {
  if (node.key === target) return true;
  if (node.children) {
    return node.children.some((c) => findParentKeysInChildren(c, target));
  }
  return false;
}

function getFileIconClass(file: FileItem): { icon: string; color: string; bg: string } {
  if (file.type === 'folder') {
    return { icon: 'lucide:folder', color: '#faad14', bg: '#fffbe6' };
  }
  const ext = (file.extension || '').toLowerCase();
  const iconMap: Record<string, { icon: string; color: string; bg: string }> = {
    md: { icon: 'lucide:file-text', color: '#1677ff', bg: '#e6f4ff' },
    txt: { icon: 'lucide:file-text', color: '#1677ff', bg: '#e6f4ff' },
    json: { icon: 'lucide:file-code', color: '#13c2c2', bg: '#e6fffb' },
    xml: { icon: 'lucide:file-code', color: '#13c2c2', bg: '#e6fffb' },
    zip: { icon: 'lucide:package', color: '#722ed1', bg: '#f9f0ff' },
    rar: { icon: 'lucide:package', color: '#722ed1', bg: '#f9f0ff' },
    '7z': { icon: 'lucide:package', color: '#722ed1', bg: '#f9f0ff' },
    'tar.gz': { icon: 'lucide:package', color: '#722ed1', bg: '#f9f0ff' },
    pdf: { icon: 'lucide:file-type', color: '#f5222d', bg: '#fff1f0' },
    xlsx: { icon: 'lucide:file-spreadsheet', color: '#52c41a', bg: '#f6ffed' },
    xls: { icon: 'lucide:file-spreadsheet', color: '#52c41a', bg: '#f6ffed' },
    csv: { icon: 'lucide:file-spreadsheet', color: '#52c41a', bg: '#f6ffed' },
    doc: { icon: 'lucide:file-text', color: '#1677ff', bg: '#e6f4ff' },
    docx: { icon: 'lucide:file-text', color: '#1677ff', bg: '#e6f4ff' },
    jpg: { icon: 'lucide:image', color: '#eb2f96', bg: '#fff0f6' },
    jpeg: { icon: 'lucide:image', color: '#eb2f96', bg: '#fff0f6' },
    png: { icon: 'lucide:image', color: '#eb2f96', bg: '#fff0f6' },
    gif: { icon: 'lucide:image', color: '#eb2f96', bg: '#fff0f6' },
    svg: { icon: 'lucide:image', color: '#eb2f96', bg: '#fff0f6' },
    psd: { icon: 'lucide:image', color: '#eb2f96', bg: '#fff0f6' },
    mp4: { icon: 'lucide:video', color: '#fa8c16', bg: '#fff7e6' },
    avi: { icon: 'lucide:video', color: '#fa8c16', bg: '#fff7e6' },
    mkv: { icon: 'lucide:video', color: '#fa8c16', bg: '#fff7e6' },
    mp3: { icon: 'lucide:music', color: '#fa8c16', bg: '#fff7e6' },
    wav: { icon: 'lucide:music', color: '#fa8c16', bg: '#fff7e6' },
    flac: { icon: 'lucide:music', color: '#fa8c16', bg: '#fff7e6' },
    exe: { icon: 'lucide:terminal', color: '#595959', bg: '#f5f5f5' },
    log: { icon: 'lucide:scroll-text', color: '#8c8c8c', bg: '#fafafa' },
    conf: { icon: 'lucide:settings', color: '#8c8c8c', bg: '#fafafa' },
    yml: { icon: 'lucide:file-code', color: '#13c2c2', bg: '#e6fffb' },
    sql: { icon: 'lucide:database', color: '#1677ff', bg: '#e6f4ff' },
  };
  return iconMap[ext] || { icon: 'lucide:file', color: '#8c8c8c', bg: '#f5f5f5' };
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

function handleOpenFolder(file: FileItem) {
  if (file.type !== 'folder') return;
  const currentKey = selectedKeys.value[0];
  const newKey = `${currentKey}/${file.name}`;
  const findNode = (nodes: FileTreeNode[], target: string): FileTreeNode | null => {
    for (const n of nodes) {
      if (n.key === target) return n;
      if (n.children) {
        const found = findNode(n.children, target);
        if (found) return found;
      }
    }
    return null;
  };
  const node = findNode(treeData.value, newKey);
  if (node) {
    selectedKeys.value = [newKey];
    expandedKeys.value = [...new Set([...expandedKeys.value, currentKey])];
    loadFiles(newKey);
  } else {
    message.info('该目录暂无数据');
  }
}

function refresh() {
  loadFiles(selectedKeys.value[0]);
  message.success('已刷新');
}

const columns = [
  { title: '名称', dataIndex: 'name', key: 'name', width: 320, ellipsis: true },
  { title: '类型', dataIndex: 'type', key: 'type', width: 90, align: 'center' as const },
  { title: '大小', dataIndex: 'size', key: 'size', width: 100, align: 'right' as const },
  { title: '修改时间', dataIndex: 'modifyTime', key: 'modifyTime', width: 170 },
  { title: '操作', key: 'action', width: 140, align: 'center' as const },
];

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
      <div class="page-header-right">
        <div class="overview-card">
          <IconifyIcon icon="lucide:hard-drive" style="font-size: 16px; color: #1677ff;" />
          <div class="overview-info">
            <span class="overview-label">存储空间</span>
            <span class="overview-value">{{ overviewStats.spaces }}</span>
          </div>
        </div>
        <div class="overview-card">
          <IconifyIcon icon="lucide:folder" style="font-size: 16px; color: #faad14;" />
          <div class="overview-info">
            <span class="overview-label">文件夹</span>
            <span class="overview-value">{{ overviewStats.folders }}</span>
          </div>
        </div>
        <div class="overview-card">
          <IconifyIcon icon="lucide:file" style="font-size: 16px; color: #52c41a;" />
          <div class="overview-info">
            <span class="overview-label">文件</span>
            <span class="overview-value">{{ overviewStats.files }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════ 主体区域 ═══════ -->
    <div class="fm-body">
      <!-- 左侧目录树 -->
      <div class="fm-sidebar">
        <Tree
          :tree-data="treeData"
          :selected-keys="selectedKeys"
          :expanded-keys="expandedKeys"
          :field-names="{ title: 'title', key: 'key', children: 'children' }"
          @update:selected-keys="onSelectTree"
          @update:expanded-keys="expandedKeys = $event"
          class="fm-tree"
          :show-line="{ showLeafIcon: false }"
        >
          <template #title="node">
            <span class="tree-node-title">
              <IconifyIcon
                :icon="node.type === 'space' ? 'lucide:hard-drive' : 'lucide:folder'"
                :style="{ fontSize: '14px', color: node.type === 'space' ? '#1677ff' : '#faad14', marginRight: '6px' }"
              />
              <span class="tree-node-text">{{ node.title }}</span>
            </span>
          </template>
        </Tree>
      </div>

      <!-- 右侧文件区域 -->
      <div class="fm-content">
        <!-- 文件区顶部工具栏 -->
        <div class="content-toolbar">
          <div class="toolbar-path">
            <Breadcrumb class="content-breadcrumb">
              <Breadcrumb.Item
                v-for="(item, idx) in breadcrumbPath"
                :key="item.key"
              >
                <a
                  v-if="idx < breadcrumbPath.length - 1"
                  class="breadcrumb-link"
                  @click="onBreadcrumbClick(item)"
                >
                  {{ item.title }}
                </a>
                <span v-else class="breadcrumb-current">{{ item.title }}</span>
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <div class="toolbar-actions">
            <Input
              v-model:value="searchText"
              placeholder="搜索文件"
              class="fm-search-input"
              allow-clear
            >
              <template #prefix>
                <IconifyIcon icon="lucide:search" style="font-size: 14px; color: #bfbfbf;" />
              </template>
            </Input>
            <Radio.Group v-model:value="viewMode" size="small" class="fm-view-toggle">
              <Radio.Button value="list">
                <IconifyIcon icon="lucide:list" style="font-size: 13px;" />
              </Radio.Button>
              <Radio.Button value="grid">
                <IconifyIcon icon="lucide:layout-grid" style="font-size: 13px;" />
              </Radio.Button>
            </Radio.Group>
            <Tooltip title="刷新">
              <Button size="small" class="fm-refresh-btn" @click="refresh">
                <IconifyIcon icon="lucide:refresh-cw" style="font-size: 13px;" />
              </Button>
            </Tooltip>
            <Button type="primary" size="small" class="fm-new-folder-btn">
              <IconifyIcon icon="lucide:folder-plus" style="font-size: 13px;" />
              新建文件夹
            </Button>
            <Button size="small" class="fm-upload-btn">
              <IconifyIcon icon="lucide:upload" style="font-size: 13px;" />
              上传
            </Button>
          </div>
        </div>

        <!-- 文件列表 -->
        <div class="content-body">
          <Table
            v-if="viewMode === 'list'"
            :columns="columns"
            :data-source="sortedFiles"
            :loading="loading"
            row-key="id"
            size="small"
            :pagination="false"
            class="fm-table"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'name'">
                <div
                  class="file-name-cell"
                  :class="{ 'folder-row': record.type === 'folder' }"
                  @click="record.type === 'folder' ? handleOpenFolder(record) : null"
                >
                  <div
                    class="file-icon-box"
                    :style="{ background: getFileIconClass(record).bg }"
                  >
                    <IconifyIcon
                      :icon="getFileIconClass(record).icon"
                      :style="{ fontSize: '16px', color: getFileIconClass(record).color }"
                    />
                  </div>
                  <span class="file-name-text" :title="record.name">{{ record.name }}</span>
                </div>
              </template>
              <template v-if="column.key === 'type'">
                <Tag :color="record.type === 'folder' ? 'blue' : 'default'" size="small">
                  {{ record.type === 'folder' ? '文件夹' : '文件' }}
                </Tag>
              </template>
              <template v-if="column.key === 'size'">
                <span class="file-size">{{ record.size }}</span>
              </template>
              <template v-if="column.key === 'modifyTime'">
                <span class="file-time">{{ record.modifyTime }}</span>
              </template>
              <template v-if="column.key === 'action'">
                <div class="file-actions">
                  <Tooltip title="重命名">
                    <Button size="small" type="text" class="action-btn" @click="openRenameModal(record)">
                      <IconifyIcon icon="lucide:pencil" style="font-size: 13px;" />
                    </Button>
                  </Tooltip>
                  <Tooltip title="删除">
                    <Popconfirm
                      title="确认删除"
                      description="确定要删除该文件吗？"
                      ok-text="确认"
                      cancel-text="取消"
                      @confirm="handleDeleteFile(record)"
                    >
                      <Button size="small" type="text" danger class="action-btn">
                        <IconifyIcon icon="lucide:trash-2" style="font-size: 13px;" />
                      </Button>
                    </Popconfirm>
                  </Tooltip>
                </div>
              </template>
            </template>
            <template #emptyText>
              <Empty description="暂无文件" class="fm-empty">
                <template #image>
                  <div class="empty-image">
                    <IconifyIcon icon="lucide:folder-open" style="font-size: 48px; color: #d9d9d9;" />
                  </div>
                </template>
              </Empty>
            </template>
          </Table>

          <!-- 网格视图 -->
          <div v-else class="file-grid">
            <div
              v-for="file in sortedFiles"
              :key="file.id"
              class="file-grid-item"
              :class="{ 'folder-item': file.type === 'folder' }"
              @click="file.type === 'folder' ? handleOpenFolder(file) : null"
            >
              <div
                class="file-grid-icon-box"
                :style="{ background: getFileIconClass(file).bg }"
              >
                <IconifyIcon
                  :icon="getFileIconClass(file).icon"
                  :style="{ fontSize: '32px', color: getFileIconClass(file).color }"
                />
              </div>
              <div class="file-grid-name" :title="file.name">{{ file.name }}</div>
              <div class="file-grid-meta">
                <span v-if="file.type === 'file'">{{ file.size }}</span>
                <span v-else>文件夹</span>
              </div>
              <div class="file-grid-actions">
                <Tooltip title="重命名">
                  <Button size="small" type="text" @click.stop="openRenameModal(file)">
                    <IconifyIcon icon="lucide:pencil" style="font-size: 12px;" />
                  </Button>
                </Tooltip>
                <Tooltip title="删除">
                  <Popconfirm
                    title="确认删除"
                    description="确定要删除该文件吗？"
                    ok-text="确认"
                    cancel-text="取消"
                    @confirm.stop="handleDeleteFile(file)"
                  >
                    <Button size="small" type="text" danger @click.stop>
                      <IconifyIcon icon="lucide:trash-2" style="font-size: 12px;" />
                    </Button>
                  </Popconfirm>
                </Tooltip>
              </div>
            </div>
            <Empty
              v-if="sortedFiles.length === 0 && !loading"
              description="暂无文件"
              class="file-grid-empty"
            >
              <template #image>
                <div class="empty-image">
                  <IconifyIcon icon="lucide:folder-open" style="font-size: 48px; color: #d9d9d9;" />
                </div>
              </template>
            </Empty>
          </div>
        </div>
      </div>
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

/* ═══ 左侧目录树 ═══ */
.fm-sidebar {
  width: 220px;
  min-width: 180px;
  background: #fff;
  border-radius: 10px;
  border: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
  padding: 8px 4px;
}

.fm-tree {
  flex: 1;
  overflow: auto;
}

.fm-tree :deep(.ant-tree-treenode) {
  padding: 2px 0;
}

.fm-tree :deep(.ant-tree-node-content-wrapper) {
  display: flex;
  align-items: center;
  border-radius: 6px;
  transition: all 0.2s;
  padding: 4px 6px;
}

.fm-tree :deep(.ant-tree-node-content-wrapper:hover) {
  background: #f0f5ff;
}

.fm-tree :deep(.ant-tree-node-selected .ant-tree-node-content-wrapper) {
  background: #e6f4ff !important;
  color: #1677ff;
  font-weight: 500;
}

.fm-tree :deep(.ant-tree-switcher-leaf-line::before) {
  display: none !important;
}

.fm-tree :deep(.ant-tree-switcher-leaf-line::after) {
  display: none !important;
}

.tree-node-title {
  display: inline-flex;
  align-items: center;
  font-size: 13px;
}

.tree-node-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 120px;
}

/* ═══ 右侧文件区域 ═══ */
.fm-content {
  flex: 1;
  background: #fff;
  border-radius: 10px;
  border: 1px solid #f0f0f0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 文件区顶部工具栏 */
.content-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid #f5f5f5;
  gap: 12px;
  flex-shrink: 0;
}

.toolbar-path {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.content-breadcrumb {
  font-size: 13px;
}

.content-breadcrumb :deep(.ant-breadcrumb-link) {
  display: inline-flex;
  align-items: center;
}

.breadcrumb-link {
  color: #1677ff;
  cursor: pointer;
  transition: color 0.2s;
}

.breadcrumb-link:hover {
  color: #4096ff;
  text-decoration: underline;
}

.breadcrumb-current {
  color: #262626;
  font-weight: 600;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.fm-search-input {
  width: 180px;
}

.fm-view-toggle :deep(.ant-radio-button-wrapper) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
}

.fm-refresh-btn,
.fm-new-folder-btn,
.fm-upload-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

/* 文件内容区域 */
.content-body {
  flex: 1;
  overflow: auto;
  padding: 8px 12px 12px;
}

/* ═══ 表格样式 ═══ */
.fm-table {
  border-radius: 8px;
  overflow: hidden;
}

.fm-table :deep(.ant-table-thead > tr > th) {
  background: #fafafa;
  font-weight: 600;
  font-size: 12px;
  color: #595959;
  padding: 10px 12px;
}

.fm-table :deep(.ant-table-tbody > tr > td) {
  padding: 8px 12px;
  font-size: 13px;
}

.fm-table :deep(.ant-table-tbody > tr:hover > td) {
  background: #f5f5f5;
}

.file-name-cell {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: default;
}

.file-name-cell.folder-row {
  cursor: pointer;
}

.file-name-cell.folder-row:hover .file-name-text {
  color: #1677ff;
}

.file-icon-box {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.file-name-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #262626;
  transition: color 0.2s;
}

.file-size {
  font-family: 'SF Mono', 'Fira Code', monospace;
  color: #8c8c8c;
  font-size: 12px;
}

.file-time {
  color: #8c8c8c;
  font-size: 12px;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.file-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.2s;
}

.fm-table :deep(.ant-table-tbody > tr:hover) .file-actions {
  opacity: 1;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  width: 28px;
  height: 28px;
}

.fm-empty {
  padding: 48px 0;
}

/* ═══ 网格视图 ═══ */
.file-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
}

.file-grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px 8px;
  border-radius: 10px;
  border: 1px solid transparent;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: default;
  position: relative;
}

.file-grid-item.folder-item {
  cursor: pointer;
}

.file-grid-item:hover {
  background: #fafafa;
  border-color: #e8e8e8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.file-grid-item.folder-item:hover {
  background: #f0f5ff;
  border-color: #bae0ff;
}

.file-grid-icon-box {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  transition: transform 0.2s;
}

.file-grid-item:hover .file-grid-icon-box {
  transform: scale(1.05);
}

.file-grid-name {
  font-size: 12px;
  color: #262626;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  margin-bottom: 4px;
  line-height: 1.4;
}

.file-grid-meta {
  font-size: 11px;
  color: #8c8c8c;
  margin-bottom: 6px;
}

.file-grid-actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.2s;
}

.file-grid-item:hover .file-grid-actions {
  opacity: 1;
}

.file-grid-empty {
  grid-column: 1 / -1;
  padding: 48px 0;
}

/* ═══ 响应式 ═══ */
@media (max-width: 768px) {
  .fm-sidebar {
    width: 180px;
    min-width: 180px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .content-toolbar {
    flex-wrap: wrap;
  }

  .fm-search-input {
    width: 160px;
  }
}
</style>

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
  Select,
  Checkbox,
  Radio as AntRadio,
} from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';

// ─── 类型 ───
interface TeamTreeNode {
  key: string;
  title: string;
  type: 'team-folder' | 'subfolder';
  path?: string;
  folderId?: string;
  children?: TeamTreeNode[];
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

// ─── Mock 树数据 ───
const mockTree: TeamTreeNode[] = [
  {
    key: 'tf-1',
    title: '文档',
    type: 'team-folder',
    path: '/share/team/文档',
    folderId: 'tf-1',
    children: [
      { key: 'tf-1/project', title: '项目文档', type: 'subfolder', path: '/share/team/文档/项目文档', folderId: 'tf-1', isLeaf: true },
      { key: 'tf-1/meeting', title: '会议纪要', type: 'subfolder', path: '/share/team/文档/会议纪要', folderId: 'tf-1', isLeaf: true },
    ],
  },
  {
    key: 'tf-2',
    title: '设计资源',
    type: 'team-folder',
    path: '/share/team/设计资源',
    folderId: 'tf-2',
    children: [
      { key: 'tf-2/ui', title: 'UI 设计', type: 'subfolder', path: '/share/team/设计资源/UI', folderId: 'tf-2', isLeaf: true },
      { key: 'tf-2/brand', title: '品牌素材', type: 'subfolder', path: '/share/team/设计资源/品牌', folderId: 'tf-2', isLeaf: true },
    ],
  },
  {
    key: 'tf-3',
    title: '财务资料',
    type: 'team-folder',
    path: '/share/team/财务资料',
    folderId: 'tf-3',
    children: [
      { key: 'tf-3/2024', title: '2024 年报', type: 'subfolder', path: '/share/team/财务资料/2024', folderId: 'tf-3', isLeaf: true },
      { key: 'tf-3/tax', title: '税务资料', type: 'subfolder', path: '/share/team/财务资料/税务', folderId: 'tf-3', isLeaf: true },
    ],
  },
];

const mockFiles: Record<string, FileItem[]> = {
  'tf-1': [
    { id: 'd1', name: '项目文档', type: 'folder', size: '--', modifyTime: '2024-05-06 10:30:00' },
    { id: 'd2', name: '会议纪要', type: 'folder', size: '--', modifyTime: '2024-05-05 14:20:00' },
    { id: 'f1', name: 'README.md', type: 'file', size: '12 KB', modifyTime: '2024-05-03 16:45:00', extension: 'md' },
    { id: 'f2', name: '需求文档.docx', type: 'file', size: '856 KB', modifyTime: '2024-04-20 10:10:00', extension: 'docx' },
    { id: 'f3', name: '流程图.png', type: 'file', size: '2.3 MB', modifyTime: '2024-04-15 09:30:00', extension: 'png' },
  ],
  'tf-1/project': [
    { id: 'p1', name: '产品需求', type: 'folder', size: '--', modifyTime: '2024-05-06 10:30:00' },
    { id: 'p2', name: '技术方案', type: 'folder', size: '--', modifyTime: '2024-05-05 14:20:00' },
    { id: 'pf1', name: 'PRD_v1.0.docx', type: 'file', size: '1.2 MB', modifyTime: '2024-05-01 10:00:00', extension: 'docx' },
    { id: 'pf2', name: 'API设计.json', type: 'file', size: '45 KB', modifyTime: '2024-04-28 14:00:00', extension: 'json' },
  ],
  'tf-1/meeting': [
    { id: 'm1', name: '周会-20240506.md', type: 'file', size: '8 KB', modifyTime: '2024-05-06 17:00:00', extension: 'md' },
    { id: 'm2', name: '月会-202404.docx', type: 'file', size: '120 KB', modifyTime: '2024-04-30 16:00:00', extension: 'docx' },
  ],
  'tf-2': [
    { id: 'd3', name: 'UI 设计', type: 'folder', size: '--', modifyTime: '2024-05-06 08:00:00' },
    { id: 'd4', name: '品牌素材', type: 'folder', size: '--', modifyTime: '2024-05-04 11:00:00' },
    { id: 'f4', name: 'logo.svg', type: 'file', size: '15 KB', modifyTime: '2024-05-01 14:00:00', extension: 'svg' },
    { id: 'f5', name: 'banner.psd', type: 'file', size: '45 MB', modifyTime: '2024-04-28 16:30:00', extension: 'psd' },
    { id: 'f6', name: '配色方案.xlsx', type: 'file', size: '120 KB', modifyTime: '2024-04-25 10:00:00', extension: 'xlsx' },
  ],
  'tf-2/ui': [
    { id: 'u1', name: '首页设计', type: 'folder', size: '--', modifyTime: '2024-05-06 08:00:00' },
    { id: 'u2', name: '设置页.fig', type: 'file', size: '12 MB', modifyTime: '2024-05-05 14:00:00', extension: 'fig' },
  ],
  'tf-2/brand': [
    { id: 'b1', name: '品牌手册.pdf', type: 'file', size: '25 MB', modifyTime: '2024-04-20 10:00:00', extension: 'pdf' },
    { id: 'b2', name: '字体包.zip', type: 'file', size: '120 MB', modifyTime: '2024-04-15 09:00:00', extension: 'zip' },
  ],
  'tf-3': [
    { id: 'd5', name: '2024 年报', type: 'folder', size: '--', modifyTime: '2024-05-05 09:00:00' },
    { id: 'd6', name: '税务资料', type: 'folder', size: '--', modifyTime: '2024-05-02 15:30:00' },
    { id: 'f7', name: '资产负债表.pdf', type: 'file', size: '1.2 MB', modifyTime: '2024-04-30 11:00:00', extension: 'pdf' },
    { id: 'f8', name: '利润表.xlsx', type: 'file', size: '340 KB', modifyTime: '2024-04-25 09:00:00', extension: 'xlsx' },
  ],
  'tf-3/2024': [
    { id: 'a1', name: 'Q1.xlsx', type: 'file', size: '200 KB', modifyTime: '2024-03-31 09:00:00', extension: 'xlsx' },
    { id: 'a2', name: 'Q2.xlsx', type: 'file', size: '220 KB', modifyTime: '2024-06-30 17:00:00', extension: 'xlsx' },
    { id: 'a3', name: '年报汇总.docx', type: 'file', size: '1.5 MB', modifyTime: '2024-12-31 10:00:00', extension: 'docx' },
  ],
  'tf-3/tax': [
    { id: 't1', name: '增值税.xlsx', type: 'file', size: '180 KB', modifyTime: '2024-04-15 09:00:00', extension: 'xlsx' },
    { id: 't2', name: '个税申报.pdf', type: 'file', size: '2.5 MB', modifyTime: '2024-04-10 10:00:00', extension: 'pdf' },
  ],
};

// ─── 状态 ───
const treeData = ref<TeamTreeNode[]>(mockTree);
const selectedKeys = ref<string[]>(['tf-1']);
const expandedKeys = ref<string[]>(['tf-1']);
const loading = ref(false);
const searchText = ref('');
const viewMode = ref<'list' | 'grid'>('list');
const currentFiles = ref<FileItem[]>([]);

// 新建团队文件夹弹窗
const folderModalVisible = ref(false);
const folderModalTitle = ref('新建团队文件夹');
const isEdit = ref(false);
const editingFolderId = ref('');
const folderFormRef = ref();
const folderForm = ref({
  name: '',
  enableCapacityLimit: false,
  capacityLimit: undefined as number | undefined,
  capacityUnit: 'GB',
  allowShareProtocol: true,
  recyclePermission: 'admin' as 'admin' | 'all',
});

const capacityUnitOptions = [
  { label: 'GB', value: 'GB' },
  { label: 'TB', value: 'TB' },
];

// 重命名
const renameModalVisible = ref(false);
const renameFormRef = ref();
const renameForm = ref({ name: '' });
const editingFile = ref<FileItem | null>(null);

// ─── 计算属性 ───
const breadcrumbPath = computed(() => {
  const key = selectedKeys.value[0];
  if (!key) return [{ title: '团队文件', key: 'root' }];

  const parts: { title: string; key: string }[] = [{ title: '团队文件', key: 'root' }];

  function findPath(nodes: TeamTreeNode[], target: string, current: { title: string; key: string }[]): boolean {
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

function onSelectTree(selected: string[]) {
  if (selected.length > 0) {
    selectedKeys.value = selected;
    loadFiles(selected[0]);
  }
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

function findParentKeys(nodes: TeamTreeNode[], target: string): string[] {
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

function findParentKeysInChildren(node: TeamTreeNode, target: string): boolean {
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
    fig: { icon: 'lucide:figma', color: '#eb2f96', bg: '#fff0f6' },
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
  const findNode = (nodes: TeamTreeNode[], target: string): TeamTreeNode | null => {
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

function openCreateModal() {
  isEdit.value = false;
  editingFolderId.value = '';
  folderModalTitle.value = '新建团队文件夹';
  folderForm.value = {
    name: '',
    enableCapacityLimit: false,
    capacityLimit: undefined,
    capacityUnit: 'GB',
    allowShareProtocol: true,
    recyclePermission: 'admin',
  };
  folderModalVisible.value = true;
}

function handleSaveFolder() {
  folderFormRef.value?.validate().then(() => {
    if (isEdit.value) {
      message.success(`团队文件夹 "${folderForm.value.name}" 已更新`);
    } else {
      message.success(`团队文件夹 "${folderForm.value.name}" 创建成功`);
    }
    folderModalVisible.value = false;
  }).catch(() => {});
}

const columns = [
  { title: '名称', dataIndex: 'name', key: 'name', width: 320, ellipsis: true },
  { title: '类型', dataIndex: 'type', key: 'type', width: 90, align: 'center' as const },
  { title: '大小', dataIndex: 'size', key: 'size', width: 100, align: 'right' as const },
  { title: '修改时间', dataIndex: 'modifyTime', key: 'modifyTime', width: 170 },
  { title: '操作', key: 'action', width: 140, align: 'center' as const },
];

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
        <div class="overview-card">
          <IconifyIcon icon="lucide:folder-open" style="font-size: 16px; color: #faad14;" />
          <div class="overview-info">
            <span class="overview-label">子目录</span>
            <span class="overview-value">{{ overviewStats.subFolders }}</span>
          </div>
        </div>
        <div class="overview-card">
          <IconifyIcon icon="lucide:file" style="font-size: 16px; color: #52c41a;" />
          <div class="overview-info">
            <span class="overview-label">文件</span>
            <span class="overview-value">{{ overviewStats.files }}</span>
          </div>
        </div>
        <Button type="primary" size="small" class="page-action-btn" @click="openCreateModal">
          <IconifyIcon icon="lucide:folder-plus" style="font-size: 13px;" />
          新建团队文件夹
        </Button>
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
                :icon="node.type === 'team-folder' ? 'lucide:folder-heart' : 'lucide:folder-open'"
                :style="{ fontSize: '14px', color: node.type === 'team-folder' ? '#1677ff' : '#faad14', marginRight: '6px' }"
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

    <!-- 新建/编辑团队文件夹弹窗 -->
    <Modal
      v-model:open="folderModalVisible"
      :title="folderModalTitle"
      width="520px"
      @ok="handleSaveFolder"
      class="folder-modal"
    >
      <Form
        ref="folderFormRef"
        :model="folderForm"
        layout="vertical"
        :rules="{
          name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
        }"
      >
        <Form.Item label="名称" name="name">
          <Input v-model:value="folderForm.name" placeholder="请输入名称">
            <template #prefix>
              <IconifyIcon icon="lucide:folder-heart" style="font-size: 14px; color: #bfbfbf;" />
            </template>
          </Input>
        </Form.Item>

        <Form.Item>
          <Checkbox v-model:checked="folderForm.enableCapacityLimit">
            <span class="checkbox-label">
              <IconifyIcon icon="lucide:ruler" style="font-size: 12px;" />
              限制容量上限
            </span>
          </Checkbox>
          <div v-if="folderForm.enableCapacityLimit" class="capacity-input-row">
            <Input
              v-model:value="folderForm.capacityLimit"
              type="number"
              placeholder="不限制"
              class="capacity-input"
            >
              <template #prefix>
                <IconifyIcon icon="lucide:hard-drive" style="font-size: 12px; color: #bfbfbf;" />
              </template>
            </Input>
            <Select
              v-model:value="folderForm.capacityUnit"
              :options="capacityUnitOptions"
              class="capacity-unit-select"
            />
          </div>
        </Form.Item>

        <Form.Item>
          <Checkbox v-model:checked="folderForm.allowShareProtocol">
            <span class="checkbox-label">
              <IconifyIcon icon="lucide:share-2" style="font-size: 12px;" />
              允许通过文件共享协议挂载到其他设备上
            </span>
          </Checkbox>
        </Form.Item>

        <Form.Item label="回收站权限">
          <AntRadio.Group v-model:value="folderForm.recyclePermission">
            <AntRadio value="admin">
              <span class="radio-label">
                <IconifyIcon icon="lucide:shield" style="font-size: 12px;" />
                仅管理员
              </span>
            </AntRadio>
            <AntRadio value="all">
              <span class="radio-label">
                <IconifyIcon icon="lucide:users" style="font-size: 12px;" />
                团队文件夹所有成员
              </span>
            </AntRadio>
          </AntRadio.Group>
        </Form.Item>
      </Form>
    </Modal>

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

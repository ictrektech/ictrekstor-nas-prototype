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
  Checkbox,
  Radio as AntRadio,
} from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import {
  FileTreePanel,
  FileManagerPanel,
} from '#/components/FileExplorer';
import type { FileTreeNode, FileItem } from '#/components/FileExplorer';
import { findParentKeys, findNodeInTree } from '#/components/FileExplorer';

// ─── 页面级扩展类型 ───
interface MyFileItem extends FileItem {
  isShared?: boolean;
}

// ─── Mock 树数据 ───
// 结构：我的文件（根概念）→ [存储空间 / 团队文件 / 他人共享文件 / 回收站]
const mockTree: FileTreeNode[] = [
  {
    key: 'spaces',
    title: '存储空间',
    type: 'category',
    path: '/spaces',
    children: [
      {
        key: 'space-1',
        title: '存储空间1',
        type: 'space',
        path: '/spaces/space-1',
        children: [
          { key: 'space-1/docs', title: '文档', type: 'folder', path: '/spaces/space-1/文档', isLeaf: true },
          { key: 'space-1/images', title: '图片', type: 'folder', path: '/spaces/space-1/图片', isLeaf: true },
          { key: 'space-1/videos', title: '视频', type: 'folder', path: '/spaces/space-1/视频', isLeaf: true },
        ],
      },
      {
        key: 'space-2',
        title: '存储空间2',
        type: 'space',
        path: '/spaces/space-2',
        children: [
          { key: 'space-2/backup', title: '备份', type: 'folder', path: '/spaces/space-2/备份', isLeaf: true },
          { key: 'space-2/download', title: '下载', type: 'folder', path: '/spaces/space-2/下载', isLeaf: true },
        ],
      },
    ],
  },
  {
    key: 'team',
    title: '团队文件',
    type: 'category',
    path: '/team',
    children: [
      {
        key: 'tf-1',
        title: '文档',
        type: 'team-folder',
        path: '/team/文档',
        children: [
          { key: 'tf-1/project', title: '项目文档', type: 'subfolder', path: '/team/文档/项目文档', isLeaf: true },
          { key: 'tf-1/meeting', title: '会议纪要', type: 'subfolder', path: '/team/文档/会议纪要', isLeaf: true },
        ],
      },
      {
        key: 'tf-2',
        title: '设计资源',
        type: 'team-folder',
        path: '/team/设计资源',
        children: [
          { key: 'tf-2/ui', title: 'UI 设计', type: 'subfolder', path: '/team/设计资源/UI', isLeaf: true },
          { key: 'tf-2/brand', title: '品牌素材', type: 'subfolder', path: '/team/设计资源/品牌', isLeaf: true },
        ],
      },
      {
        key: 'tf-3',
        title: '财务资料',
        type: 'team-folder',
        path: '/team/财务资料',
        children: [
          { key: 'tf-3/2024', title: '2024 年报', type: 'subfolder', path: '/team/财务资料/2024', isLeaf: true },
          { key: 'tf-3/tax', title: '税务资料', type: 'subfolder', path: '/team/财务资料/税务', isLeaf: true },
        ],
      },
    ],
  },
  {
    key: 'shared-from-others',
    title: '他人共享文件',
    type: 'category',
    path: '/shared-from-others',
    children: [
      {
        key: 'shared-from-zhangsan',
        title: '来自 张三',
        type: 'shared-user',
        path: '/shared-from-others/张三',
        children: [
          { key: 'zs-share1', title: '共享文档', type: 'shared-folder', path: '/shared-from-others/张三/共享文档', isLeaf: true },
          { key: 'zs-share2', title: '共享设计', type: 'shared-folder', path: '/shared-from-others/张三/共享设计', isLeaf: true },
        ],
      },
      {
        key: 'shared-from-lisi',
        title: '来自 李四',
        type: 'shared-user',
        path: '/shared-from-others/李四',
        children: [
          { key: 'ls-share1', title: '项目资料', type: 'shared-folder', path: '/shared-from-others/李四/项目资料', isLeaf: true },
          { key: 'ls-share2', title: '培训视频', type: 'shared-folder', path: '/shared-from-others/李四/培训视频', isLeaf: true },
        ],
      },
      {
        key: 'shared-from-wangwu',
        title: '来自 王五',
        type: 'shared-user',
        path: '/shared-from-others/王五',
        children: [
          { key: 'ww-share1', title: '会议录音', type: 'shared-folder', path: '/shared-from-others/王五/会议录音', isLeaf: true },
        ],
      },
    ],
  },
];

// ─── Mock 文件数据 ───
const mockFiles: Record<string, MyFileItem[]> = {
  // 存储空间
  'space-1': [
    { id: 'f-1', name: '文档', type: 'folder', size: '--', modifyTime: '2024-05-06 10:30:00' },
    { id: 'f-2', name: '图片', type: 'folder', size: '--', modifyTime: '2024-05-05 14:20:00' },
    { id: 'f-3', name: '视频', type: 'folder', size: '--', modifyTime: '2024-05-04 09:15:00' },
    { id: 'f-4', name: 'README.md', type: 'file', size: '12 KB', modifyTime: '2024-05-01 14:30:00', extension: 'md' },
    { id: 'f-5', name: 'config.json', type: 'file', size: '3 KB', modifyTime: '2024-04-28 08:30:00', extension: 'json' },
  ],
  'space-1/docs': [
    { id: 'd1', name: '公司制度.pdf', type: 'file', size: '2.5 MB', modifyTime: '2024-05-03 16:45:00', extension: 'pdf' },
    { id: 'd2', name: '流程规范.docx', type: 'file', size: '856 KB', modifyTime: '2024-04-20 10:10:00', extension: 'docx' },
    { id: 'd3', name: 'Q1报告.xlsx', type: 'file', size: '340 KB', modifyTime: '2024-03-31 09:00:00', extension: 'xlsx' },
  ],
  'space-1/images': [
    { id: 'i1', name: 'banner.png', type: 'file', size: '2.3 MB', modifyTime: '2024-05-01 14:00:00', extension: 'png' },
    { id: 'i2', name: 'logo.svg', type: 'file', size: '15 KB', modifyTime: '2024-04-28 16:30:00', extension: 'svg' },
    { id: 'i3', name: '年会.jpg', type: 'file', size: '5.6 MB', modifyTime: '2024-01-20 14:00:00', extension: 'jpg' },
  ],
  'space-1/videos': [
    { id: 'v1', name: '产品介绍.mp4', type: 'file', size: '256 MB', modifyTime: '2024-04-20 14:00:00', extension: 'mp4' },
  ],
  'space-2': [
    { id: 'g-1', name: '备份', type: 'folder', size: '--', modifyTime: '2024-05-06 10:30:00' },
    { id: 'g-2', name: '下载', type: 'folder', size: '--', modifyTime: '2024-05-05 14:20:00' },
    { id: 'g-3', name: 'backup-2024.tar.gz', type: 'file', size: '12.5 GB', modifyTime: '2024-12-31 23:59:00', extension: 'tar.gz' },
  ],
  'space-2/backup': [
    { id: 'b1', name: 'db-backup.sql', type: 'file', size: '2.3 GB', modifyTime: '2024-05-06 02:00:00', extension: 'sql' },
  ],
  'space-2/download': [
    { id: 'dl1', name: 'setup.exe', type: 'file', size: '45 MB', modifyTime: '2024-01-15 09:00:00', extension: 'exe' },
  ],

  // 团队文件
  'tf-1': [
    { id: 'tf1-d1', name: '项目文档', type: 'folder', size: '--', modifyTime: '2024-05-06 10:30:00' },
    { id: 'tf1-d2', name: '会议纪要', type: 'folder', size: '--', modifyTime: '2024-05-05 14:20:00' },
    { id: 'tf1-f1', name: 'README.md', type: 'file', size: '12 KB', modifyTime: '2024-05-03 16:45:00', extension: 'md' },
    { id: 'tf1-f2', name: '需求文档.docx', type: 'file', size: '856 KB', modifyTime: '2024-04-20 10:10:00', extension: 'docx' },
  ],
  'tf-1/project': [
    { id: 'tp1', name: 'PRD_v1.0.docx', type: 'file', size: '1.2 MB', modifyTime: '2024-05-01 10:00:00', extension: 'docx' },
    { id: 'tp2', name: 'API设计.json', type: 'file', size: '45 KB', modifyTime: '2024-04-28 14:00:00', extension: 'json' },
  ],
  'tf-1/meeting': [
    { id: 'tm1', name: '周会-20240506.md', type: 'file', size: '8 KB', modifyTime: '2024-05-06 17:00:00', extension: 'md' },
    { id: 'tm2', name: '月会-202404.docx', type: 'file', size: '120 KB', modifyTime: '2024-04-30 16:00:00', extension: 'docx' },
  ],
  'tf-2': [
    { id: 'tf2-d1', name: 'UI 设计', type: 'folder', size: '--', modifyTime: '2024-05-06 08:00:00' },
    { id: 'tf2-d2', name: '品牌素材', type: 'folder', size: '--', modifyTime: '2024-05-04 11:00:00' },
    { id: 'tf2-f1', name: 'logo.svg', type: 'file', size: '15 KB', modifyTime: '2024-05-01 14:00:00', extension: 'svg' },
    { id: 'tf2-f2', name: 'banner.psd', type: 'file', size: '45 MB', modifyTime: '2024-04-28 16:30:00', extension: 'psd' },
  ],
  'tf-2/ui': [
    { id: 'tu1', name: '首页设计.fig', type: 'file', size: '12 MB', modifyTime: '2024-05-05 14:00:00', extension: 'fig' },
  ],
  'tf-2/brand': [
    { id: 'tb1', name: '品牌手册.pdf', type: 'file', size: '25 MB', modifyTime: '2024-04-20 10:00:00', extension: 'pdf' },
    { id: 'tb2', name: '字体包.zip', type: 'file', size: '120 MB', modifyTime: '2024-04-15 09:00:00', extension: 'zip' },
  ],
  'tf-3': [
    { id: 'tf3-d1', name: '2024 年报', type: 'folder', size: '--', modifyTime: '2024-05-05 09:00:00' },
    { id: 'tf3-d2', name: '税务资料', type: 'folder', size: '--', modifyTime: '2024-05-02 15:30:00' },
    { id: 'tf3-f1', name: '资产负债表.pdf', type: 'file', size: '1.2 MB', modifyTime: '2024-04-30 11:00:00', extension: 'pdf' },
  ],
  'tf-3/2024': [
    { id: 'ta1', name: 'Q1.xlsx', type: 'file', size: '200 KB', modifyTime: '2024-03-31 09:00:00', extension: 'xlsx' },
    { id: 'ta2', name: 'Q2.xlsx', type: 'file', size: '220 KB', modifyTime: '2024-06-30 17:00:00', extension: 'xlsx' },
  ],
  'tf-3/tax': [
    { id: 'tt1', name: '增值税.xlsx', type: 'file', size: '180 KB', modifyTime: '2024-04-15 09:00:00', extension: 'xlsx' },
    { id: 'tt2', name: '个税申报.pdf', type: 'file', size: '2.5 MB', modifyTime: '2024-04-10 10:00:00', extension: 'pdf' },
  ],

  // 他人共享文件
  'zs-share1': [
    { id: 'zs1-f1', name: '项目计划书.pdf', type: 'file', size: '2.5 MB', modifyTime: '2024-05-06 10:30:00', extension: 'pdf', isShared: true },
    { id: 'zs1-f2', name: '设计规范.docx', type: 'file', size: '856 KB', modifyTime: '2024-05-05 14:20:00', extension: 'docx', isShared: true },
    { id: 'zs1-f3', name: 'Q1报表.xlsx', type: 'file', size: '340 KB', modifyTime: '2024-05-03 09:15:00', extension: 'xlsx', isShared: true },
  ],
  'zs-share2': [
    { id: 'zs2-f1', name: '产品原型.rp', type: 'file', size: '12 MB', modifyTime: '2024-04-28 16:00:00', extension: 'rp', isShared: true },
    { id: 'zs2-f2', name: '架构图.png', type: 'file', size: '3.2 MB', modifyTime: '2024-04-20 09:00:00', extension: 'png', isShared: true },
  ],
  'ls-share1': [
    { id: 'ls1-f1', name: '技术方案.md', type: 'file', size: '28 KB', modifyTime: '2024-04-15 14:00:00', extension: 'md', isShared: true },
    { id: 'ls1-f2', name: '接口文档.pdf', type: 'file', size: '1.5 MB', modifyTime: '2024-04-10 10:00:00', extension: 'pdf', isShared: true },
  ],
  'ls-share2': [
    { id: 'ls2-f1', name: '新员工培训.mp4', type: 'file', size: '512 MB', modifyTime: '2024-03-20 10:00:00', extension: 'mp4', isShared: true },
    { id: 'ls2-f2', name: '安全规范.pdf', type: 'file', size: '8 MB', modifyTime: '2024-03-15 09:00:00', extension: 'pdf', isShared: true },
  ],
  'ww-share1': [
    { id: 'ww1-f1', name: '周会-20240501.mp3', type: 'file', size: '45 MB', modifyTime: '2024-05-01 12:00:00', extension: 'mp3', isShared: true },
    { id: 'ww1-f2', name: '周会-20240508.mp3', type: 'file', size: '52 MB', modifyTime: '2024-05-08 12:00:00', extension: 'mp3', isShared: true },
  ],

  // 回收站
};

// ─── 状态 ───
const treeData = ref<FileTreeNode[]>(mockTree);
const selectedKeys = ref<string[]>(['spaces']);
const expandedKeys = ref<string[]>(['spaces', 'shared-from-others']);
const loading = ref(false);
const searchText = ref('');
const viewMode = ref<'list' | 'grid'>('list');
const currentFiles = ref<MyFileItem[]>([]);

// 重命名
const renameModalVisible = ref(false);
const renameFormRef = ref();
const renameForm = ref({ name: '' });
const editingFile = ref<MyFileItem | null>(null);

// 移动到
const moveModalVisible = ref(false);
const moveTarget = ref('');

// 共享设置
const shareModalVisible = ref(false);
const shareFormRef = ref();
const shareForm = ref({
  enableShare: true,
  shareLink: 'https://nas.example.com/s/abc123',
  expireDays: '7',
  password: '',
});

// 移动目标选项（所有叶子/文件夹节点）
const folderOptions = computed(() => {
  const opts: { label: string; value: string }[] = [];
  function walk(nodes: FileTreeNode[], prefix: string) {
    for (const n of nodes) {
      const label = prefix ? `${prefix} / ${n.title}` : n.title;
      if (n.children) {
        walk(n.children, label);
      }
      // 允许作为移动目标的节点（排除分类节点本身）
      if (n.type !== 'category' && n.type !== 'shared-user') {
        opts.push({ label, value: n.key });
      }
    }
  }
  walk(treeData.value, '');
  return opts;
});

// ─── 计算属性 ───

/** 自定义面包屑路径 */
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
        const res = findPath(node.children, target, [
          ...current,
          { title: node.title, key: node.key },
        ]);
        if (res) return true;
      }
    }
    return false;
  }

  findPath(treeData.value, key, []);
  return parts;
});

/** 概览统计 */
const overviewStats = computed(() => {
  const spaces = treeData.value.find(n => n.key === 'spaces')?.children?.length || 0;
  const teamFolders = treeData.value.find(n => n.key === 'team')?.children?.length || 0;
  const sharedUsers = treeData.value.find(n => n.key === 'shared-from-others')?.children?.length || 0;
  let fileCount = 0;
  Object.values(mockFiles).forEach(list => {
    list.forEach(f => { if (f.type === 'file') fileCount++; });
  });
  return { spaces, teamFolders, sharedUsers, files: fileCount };
});

/** 当前是否为回收站 */
const isTrash = computed(() => selectedKeys.value[0] === 'trash');

// ─── 方法 ───

function loadFiles(key: string) {
  loading.value = true;
  setTimeout(() => {
    const direct = mockFiles[key];
    if (direct) {
      currentFiles.value = direct;
    } else {
      // 若选中分类/中间节点，展示其子节点作为文件夹入口
      const node = findNodeInTree(treeData.value, key);
      if (node?.children) {
        currentFiles.value = node.children.map(child => ({
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
    selectedKeys.value = ['spaces'];
    expandedKeys.value = ['spaces'];
    loadFiles('spaces');
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

// ─── 文件操作 ───

function handleDownload(file: MyFileItem) {
  message.success(`开始下载：${file.name}`);
}

function openRenameModal(file: MyFileItem) {
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

function openMoveModal(file: MyFileItem) {
  editingFile.value = file;
  moveTarget.value = '';
  moveModalVisible.value = true;
}

function handleMove() {
  if (!moveTarget.value || !editingFile.value) return;
  message.success(`"${editingFile.value.name}" 已移动`);
  currentFiles.value = currentFiles.value.filter(f => f.id !== editingFile.value!.id);
  moveModalVisible.value = false;
}

function handleDeleteFile(file: MyFileItem) {
  message.success(`"${file.name}" 已删除`);
  currentFiles.value = currentFiles.value.filter(f => f.id !== file.id);
}

function openShareModal(file: MyFileItem) {
  editingFile.value = file;
  shareForm.value = {
    enableShare: !!file.isShared,
    shareLink: `https://nas.example.com/s/${file.id}`,
    expireDays: '7',
    password: '',
  };
  shareModalVisible.value = true;
}

function handleSaveShare() {
  if (editingFile.value) {
    editingFile.value.isShared = shareForm.value.enableShare;
    message.success(shareForm.value.enableShare ? '共享设置已启用' : '共享已关闭');
  }
  shareModalVisible.value = false;
}

function copyShareLink() {
  message.success('链接已复制到剪贴板');
}

// ─── 树节点图标 ───
function nodeIconResolver(node: FileTreeNode) {
  switch (node.type) {
    case 'category':
      // 根据分类 key 返回对应图标
      if (node.key === 'spaces') {
        return { icon: 'lucide:database', color: '#1677ff' };
      }
      if (node.key === 'team') {
        return { icon: 'lucide:users', color: '#fa8c16' };
      }
      if (node.key === 'shared-from-others') {
        return { icon: 'lucide:share-2', color: '#722ed1' };
      }
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
  loadFiles('spaces');
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
          <h1 class="page-title">我的文件</h1>
          <p class="page-desc">普通用户所能访问到的所有文件资源</p>
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
          <IconifyIcon icon="lucide:folder-heart" style="font-size: 16px; color: #faad14;" />
          <div class="overview-info">
            <span class="overview-label">团队文件夹</span>
            <span class="overview-value">{{ overviewStats.teamFolders }}</span>
          </div>
        </div>
        <div class="overview-card">
          <IconifyIcon icon="lucide:users" style="font-size: 16px; color: #722ed1;" />
          <div class="overview-info">
            <span class="overview-label">他人共享</span>
            <span class="overview-value">{{ overviewStats.sharedUsers }}</span>
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
        :show-new-folder="!isTrash"
        :empty-description="isTrash ? '回收站为空' : '暂无文件'"
        @breadcrumb-click="onBreadcrumbClick"
        @refresh="refresh"
        @open-folder="handleOpenFolder"
        @rename="openRenameModal"
        @delete-file="handleDeleteFile"
      >
        <!-- 自定义操作列：下载 / 重命名 / 更多 -->
        <template #action-cell="{ file }">
          <div class="custom-actions">
            <Button size="small" type="link" class="action-link" @click="handleDownload(file)">
              <IconifyIcon icon="lucide:download" style="font-size: 13px;" />
              下载
            </Button>
            <Button size="small" type="link" class="action-link" @click="openRenameModal(file)">
              <IconifyIcon icon="lucide:pencil" style="font-size: 13px;" />
              重命名
            </Button>
            <Dropdown :trigger="['click']">
              <Button size="small" type="link" class="action-link">
                <IconifyIcon icon="lucide:more-horizontal" style="font-size: 13px;" />
                更多
              </Button>
              <template #overlay>
                <Menu>
                  <Menu.Item key="move" @click="openMoveModal(file)">
                    <span class="menu-item-inner">
                      <IconifyIcon icon="lucide:folder-input" style="font-size: 13px;" />
                      移动
                    </span>
                  </Menu.Item>
                  <Menu.Item v-if="file.type === 'folder' && !isTrash" key="share" @click="openShareModal(file)">
                    <span class="menu-item-inner">
                      <IconifyIcon icon="lucide:share-2" style="font-size: 13px;" />
                      共享设置
                    </span>
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item key="delete" danger @click="handleDeleteFile(file)">
                    <span class="menu-item-danger">
                      <IconifyIcon icon="lucide:trash-2" style="font-size: 13px;" />
                      删除
                    </span>
                  </Menu.Item>
                </Menu>
              </template>
            </Dropdown>
          </div>
        </template>
      </FileManagerPanel>
    </div>

    <!-- ═══════ 重命名弹窗 ═══════ -->
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

    <!-- ═══════ 移动到弹窗 ═══════ -->
    <Modal
      v-model:open="moveModalVisible"
      title="移动到"
      width="400px"
      @ok="handleMove"
    >
      <Form layout="vertical">
        <Form.Item label="目标文件夹">
          <div class="move-folder-list">
            <div
              v-for="opt in folderOptions"
              :key="opt.value"
              class="move-folder-item"
              :class="{ active: moveTarget === opt.value }"
              @click="moveTarget = opt.value"
            >
              <IconifyIcon icon="lucide:folder" style="font-size: 13px; color: #bfbfbf; margin-right: 6px;" />
              {{ opt.label }}
            </div>
          </div>
        </Form.Item>
      </Form>
    </Modal>

    <!-- ═══════ 共享设置弹窗 ═══════ -->
    <Modal
      v-model:open="shareModalVisible"
      title="共享设置"
      width="480px"
      @ok="handleSaveShare"
    >
      <Form
        ref="shareFormRef"
        :model="shareForm"
        layout="vertical"
      >
        <Form.Item>
          <Checkbox v-model:checked="shareForm.enableShare">启用共享链接</Checkbox>
        </Form.Item>

        <template v-if="shareForm.enableShare">
          <Form.Item label="共享链接">
            <div class="share-link-row">
              <Input v-model:value="shareForm.shareLink" readonly />
              <Button @click="copyShareLink">复制</Button>
            </div>
          </Form.Item>

          <Form.Item label="有效期">
            <AntRadio.Group v-model:value="shareForm.expireDays">
              <AntRadio value="1">1天</AntRadio>
              <AntRadio value="7">7天</AntRadio>
              <AntRadio value="30">30天</AntRadio>
              <AntRadio value="0">永久</AntRadio>
            </AntRadio.Group>
          </Form.Item>

          <Form.Item label="访问密码（选填）">
            <Input v-model:value="shareForm.password" placeholder="不设置密码则公开访问" />
          </Form.Item>
        </template>
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

/* ═══ 主体区域 ═══ */
.fm-body {
  display: flex;
  flex: 1;
  overflow: hidden;
  padding: 12px;
  gap: 12px;
}

/* ═══ 自定义操作列 ═══ */
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

.menu-item-inner {
  display: inline-flex;
  align-items: center;
  gap: 6px;
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

/* ═══ 移动文件夹列表 ═══ */
.move-folder-list {
  max-height: 240px;
  overflow-y: auto;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
}

.move-folder-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 13px;
  color: #262626;
  transition: background 0.2s;
}

.move-folder-item:hover {
  background: #f5f5f5;
}

.move-folder-item.active {
  background: #e6f7ff;
  color: #1677ff;
}

/* ═══ 共享链接 ═══ */
.share-link-row {
  display: flex;
  gap: 8px;
}

.share-link-row :deep(.ant-input) {
  flex: 1;
}

/* ═══ 响应式 ═══ */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

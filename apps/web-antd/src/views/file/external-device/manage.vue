<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  Tag,
  Tooltip,
  message,
  Modal,
  Form,
  Input,
  Button,
} from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import {
  FileTreePanel,
  FileManagerPanel,
} from '#/components/FileExplorer';
import type { FileTreeNode, FileItem, BreadcrumbItem } from '#/components/FileExplorer';
import {
  buildBreadcrumbPath,
  findParentKeys,
  findNodeInTree,
} from '#/components/FileExplorer';

const route = useRoute();
const router = useRouter();

// ═══════════════════════════════════════════════════════════
// 当前设备 ID
// ═══════════════════════════════════════════════════════════

const deviceId = computed(() => route.params.deviceId as string);

// ═══════════════════════════════════════════════════════════
// 设备信息
// ═══════════════════════════════════════════════════════════

interface ExternalDevice {
  id: string;
  name: string;
  type: 'usb' | 'sd' | 'ssd' | 'hdd';
  capacity: string;
  used: string;
  usedPercent: number;
  status: 'connected' | 'disconnected';
  mountPath: string;
  fileSystem: string;
}

const devices = ref<ExternalDevice[]>([
  {
    id: 'usb-1',
    name: 'SanDisk U盘',
    type: 'usb',
    capacity: '128 GB',
    used: '45 GB',
    usedPercent: 35,
    status: 'connected',
    mountPath: '/mnt/usb0',
    fileSystem: 'exFAT',
  },
  {
    id: 'hdd-1',
    name: 'Seagate 移动硬盘',
    type: 'hdd',
    capacity: '2 TB',
    used: '850 GB',
    usedPercent: 42,
    status: 'connected',
    mountPath: '/mnt/usb1',
    fileSystem: 'NTFS',
  },
  {
    id: 'ssd-1',
    name: 'Samsung T7 SSD',
    type: 'ssd',
    capacity: '1 TB',
    used: '320 GB',
    usedPercent: 31,
    status: 'connected',
    mountPath: '/mnt/usb2',
    fileSystem: 'exFAT',
  },
  {
    id: 'sd-1',
    name: 'SD 存储卡',
    type: 'sd',
    capacity: '64 GB',
    used: '—',
    usedPercent: 0,
    status: 'disconnected',
    mountPath: '—',
    fileSystem: 'FAT32',
  },
]);

const currentDevice = computed(() =>
  devices.value.find((d) => d.id === deviceId.value),
);

// ═══════════════════════════════════════════════════════════
// 设备图标
// ═══════════════════════════════════════════════════════════

function getDeviceIcon(type: string): string {
  // 所有外接设备统一使用 U盘 图标
  return 'lucide:usb';
}

function getDeviceIconColor(type: string): string {
  // 所有外接设备统一使用 U盘 蓝色
  return '#1677ff';
}

function getDeviceTypeLabel(type: string): string {
  switch (type) {
    case 'usb': return 'U盘';
    case 'hdd': return '移动硬盘';
    case 'ssd': return '移动SSD';
    case 'sd': return 'SD卡';
    default: return '未知';
  }
}

function getCapacityColor(percent: number): string {
  if (percent >= 90) return '#ff4d4f';
  if (percent >= 70) return '#faad14';
  return '#1677ff';
}

// ═══════════════════════════════════════════════════════════
// 目录树
// ═══════════════════════════════════════════════════════════

function getDeviceNodeType(device: ExternalDevice): string {
  if (device.status === 'disconnected') return 'device-disconnected';
  return `device-${device.type}`;
}

const treeData = computed<FileTreeNode[]>(() => {
  const device = currentDevice.value;
  if (!device) return [];

  const nodeType = getDeviceNodeType(device);
  const children: FileTreeNode[] = [];

  if (device.id === 'usb-1') {
    children.push(
      {
        key: 'usb-1:documents', title: '文档', type: 'folder', path: '/mnt/usb0/文档', children: [
          { key: 'usb-1:docs/work', title: '工作资料', type: 'folder', path: '/mnt/usb0/文档/工作资料', isLeaf: true },
          { key: 'usb-1:docs/personal', title: '个人资料', type: 'folder', path: '/mnt/usb0/文档/个人资料', isLeaf: true },
        ],
      },
      { key: 'usb-1:photos', title: '照片', type: 'folder', path: '/mnt/usb0/照片', isLeaf: true },
      { key: 'usb-1:videos', title: '视频', type: 'folder', path: '/mnt/usb0/视频', isLeaf: true },
      { key: 'usb-1:music', title: '音乐', type: 'folder', path: '/mnt/usb0/音乐', isLeaf: true },
    );
  } else if (device.id === 'hdd-1') {
    children.push(
      {
        key: 'hdd-1:backup', title: '备份', type: 'folder', path: '/mnt/usb1/备份', children: [
          { key: 'hdd-1:backup/2024', title: '2024', type: 'folder', path: '/mnt/usb1/备份/2024', isLeaf: true },
          { key: 'hdd-1:backup/2025', title: '2025', type: 'folder', path: '/mnt/usb1/备份/2025', isLeaf: true },
        ],
      },
      { key: 'hdd-1:movies', title: '电影', type: 'folder', path: '/mnt/usb1/电影', isLeaf: true },
      { key: 'hdd-1:games', title: '游戏', type: 'folder', path: '/mnt/usb1/游戏', isLeaf: true },
    );
  } else if (device.id === 'ssd-1') {
    children.push(
      {
        key: 'ssd-1:projects', title: '项目', type: 'folder', path: '/mnt/usb2/项目', children: [
          { key: 'ssd-1:projects/web', title: '前端项目', type: 'folder', path: '/mnt/usb2/项目/前端项目', isLeaf: true },
          { key: 'ssd-1:projects/app', title: 'App项目', type: 'folder', path: '/mnt/usb2/项目/App项目', isLeaf: true },
        ],
      },
      { key: 'ssd-1:design', title: '设计稿', type: 'folder', path: '/mnt/usb2/设计稿', isLeaf: true },
    );
  }

  return [
    {
      key: 'root',
      title: device.name,
      type: nodeType,
      path: device.mountPath,
      children,
    },
  ];
});

// ═══════════════════════════════════════════════════════════
// Mock 文件数据
// ═══════════════════════════════════════════════════════════

const deviceFilesData: Record<string, FileItem[]> = {
  'usb-1:root': [
    { id: 'u1-d1', name: '文档', type: 'folder', size: '--', modifyTime: '2025-05-06 10:30:00' },
    { id: 'u1-d2', name: '照片', type: 'folder', size: '--', modifyTime: '2025-05-05 14:20:00' },
    { id: 'u1-d3', name: '视频', type: 'folder', size: '--', modifyTime: '2025-05-04 09:15:00' },
    { id: 'u1-d4', name: '音乐', type: 'folder', size: '--', modifyTime: '2025-05-03 16:45:00' },
    { id: 'u1-f1', name: 'README.md', type: 'file', size: '2 KB', modifyTime: '2025-05-01 14:30:00', extension: 'md' },
  ],
  'usb-1:documents': [
    { id: 'u1-d5', name: '工作资料', type: 'folder', size: '--', modifyTime: '2025-05-06 10:30:00' },
    { id: 'u1-d6', name: '个人资料', type: 'folder', size: '--', modifyTime: '2025-05-05 14:20:00' },
    { id: 'u1-f2', name: '会议记录.docx', type: 'file', size: '45 KB', modifyTime: '2025-05-03 16:45:00', extension: 'docx' },
    { id: 'u1-f3', name: '项目计划.xlsx', type: 'file', size: '120 KB', modifyTime: '2025-04-28 08:30:00', extension: 'xlsx' },
  ],
  'usb-1:docs/work': [
    { id: 'u1-w1', name: '需求文档.docx', type: 'file', size: '856 KB', modifyTime: '2025-04-20 10:10:00', extension: 'docx' },
    { id: 'u1-w2', name: '技术方案.pdf', type: 'file', size: '2.3 MB', modifyTime: '2025-04-15 09:30:00', extension: 'pdf' },
    { id: 'u1-w3', name: 'API设计.json', type: 'file', size: '15 KB', modifyTime: '2025-04-10 14:00:00', extension: 'json' },
  ],
  'usb-1:docs/personal': [
    { id: 'u1-p1', name: '简历.pdf', type: 'file', size: '320 KB', modifyTime: '2025-03-15 10:00:00', extension: 'pdf' },
    { id: 'u1-p2', name: '旅行计划.xlsx', type: 'file', size: '45 KB', modifyTime: '2025-03-10 09:00:00', extension: 'xlsx' },
  ],
  'usb-1:photos': [
    { id: 'u1-ph1', name: '风景.jpg', type: 'file', size: '3.2 MB', modifyTime: '2025-05-01 14:00:00', extension: 'jpg' },
    { id: 'u1-ph2', name: '人物.png', type: 'file', size: '2.1 MB', modifyTime: '2025-04-28 16:30:00', extension: 'png' },
    { id: 'u1-ph3', name: '聚会.jpg', type: 'file', size: '4.5 MB', modifyTime: '2025-04-20 10:00:00', extension: 'jpg' },
  ],
  'usb-1:videos': [
    { id: 'u1-v1', name: '教程.mp4', type: 'file', size: '156 MB', modifyTime: '2025-04-15 14:00:00', extension: 'mp4' },
    { id: 'u1-v2', name: '演示.mov', type: 'file', size: '320 MB', modifyTime: '2025-04-10 10:00:00', extension: 'mp4' },
  ],
  'usb-1:music': [
    { id: 'u1-m1', name: '轻音乐.mp3', type: 'file', size: '8 MB', modifyTime: '2025-03-20 16:00:00', extension: 'mp3' },
    { id: 'u1-m2', name: '流行歌曲.flac', type: 'file', size: '32 MB', modifyTime: '2025-03-15 14:00:00', extension: 'flac' },
  ],
  'hdd-1:root': [
    { id: 'h1-d1', name: '备份', type: 'folder', size: '--', modifyTime: '2025-05-06 10:30:00' },
    { id: 'h1-d2', name: '电影', type: 'folder', size: '--', modifyTime: '2025-05-05 14:20:00' },
    { id: 'h1-d3', name: '游戏', type: 'folder', size: '--', modifyTime: '2025-05-04 09:15:00' },
    { id: 'h1-f1', name: '说明.txt', type: 'file', size: '1 KB', modifyTime: '2025-05-01 14:30:00', extension: 'txt' },
  ],
  'hdd-1:backup': [
    { id: 'h1-d4', name: '2024', type: 'folder', size: '--', modifyTime: '2025-05-06 10:30:00' },
    { id: 'h1-d5', name: '2025', type: 'folder', size: '--', modifyTime: '2025-05-05 14:20:00' },
    { id: 'h1-f2', name: '备份日志.log', type: 'file', size: '45 KB', modifyTime: '2025-05-03 16:45:00', extension: 'log' },
  ],
  'hdd-1:backup/2024': [
    { id: 'h1-b1', name: '系统镜像.iso', type: 'file', size: '4.2 GB', modifyTime: '2024-12-31 23:59:00', extension: 'iso' },
    { id: 'h1-b2', name: '数据备份.zip', type: 'file', size: '12.5 GB', modifyTime: '2024-12-30 18:00:00', extension: 'zip' },
  ],
  'hdd-1:backup/2025': [
    { id: 'h1-b3', name: 'Q1备份.tar.gz', type: 'file', size: '8.5 GB', modifyTime: '2025-03-31 23:00:00', extension: 'tar.gz' },
  ],
  'hdd-1:movies': [
    { id: 'h1-m1', name: '星际穿越.mkv', type: 'file', size: '12.8 GB', modifyTime: '2025-01-15 20:00:00', extension: 'mkv' },
    { id: 'h1-m2', name: '盗梦空间.mp4', type: 'file', size: '8.5 GB', modifyTime: '2025-01-10 20:00:00', extension: 'mp4' },
  ],
  'hdd-1:games': [
    { id: 'h1-g1', name: 'Steam库', type: 'folder', size: '--', modifyTime: '2025-05-01 10:00:00' },
    { id: 'h1-g2', name: 'Epic库', type: 'folder', size: '--', modifyTime: '2025-04-20 10:00:00' },
  ],
  'ssd-1:root': [
    { id: 's1-d1', name: '项目', type: 'folder', size: '--', modifyTime: '2025-05-06 10:30:00' },
    { id: 's1-d2', name: '设计稿', type: 'folder', size: '--', modifyTime: '2025-05-05 14:20:00' },
    { id: 's1-f1', name: '待办.md', type: 'file', size: '3 KB', modifyTime: '2025-05-01 14:30:00', extension: 'md' },
  ],
  'ssd-1:projects': [
    { id: 's1-d3', name: '前端项目', type: 'folder', size: '--', modifyTime: '2025-05-06 10:30:00' },
    { id: 's1-d4', name: 'App项目', type: 'folder', size: '--', modifyTime: '2025-05-05 14:20:00' },
    { id: 's1-f2', name: '项目清单.xlsx', type: 'file', size: '25 KB', modifyTime: '2025-04-28 08:30:00', extension: 'xlsx' },
  ],
  'ssd-1:projects/web': [
    { id: 's1-w1', name: 'package.json', type: 'file', size: '2 KB', modifyTime: '2025-05-06 10:00:00', extension: 'json' },
    { id: 's1-w2', name: 'README.md', type: 'file', size: '5 KB', modifyTime: '2025-05-05 14:00:00', extension: 'md' },
    { id: 's1-w3', name: 'vite.config.ts', type: 'file', size: '3 KB', modifyTime: '2025-05-04 09:00:00', extension: 'ts' },
  ],
  'ssd-1:projects/app': [
    { id: 's1-a1', name: 'main.dart', type: 'file', size: '8 KB', modifyTime: '2025-05-03 10:00:00', extension: 'dart' },
    { id: 's1-a2', name: 'pubspec.yaml', type: 'file', size: '2 KB', modifyTime: '2025-05-02 14:00:00', extension: 'yml' },
  ],
  'ssd-1:design': [
    { id: 's1-ds1', name: '首页.fig', type: 'file', size: '45 MB', modifyTime: '2025-04-20 10:00:00', extension: 'fig' },
    { id: 's1-ds2', name: 'logo.svg', type: 'file', size: '15 KB', modifyTime: '2025-04-15 09:00:00', extension: 'svg' },
    { id: 's1-ds3', name: 'banner.psd', type: 'file', size: '120 MB', modifyTime: '2025-04-10 14:00:00', extension: 'psd' },
  ],
};

// ═══════════════════════════════════════════════════════════
// 本地存储目录树（用于双栏传输）
// ═══════════════════════════════════════════════════════════

const localTree: FileTreeNode[] = [
  {
    key: 'local:root',
    title: '本地存储',
    type: 'local-root',
    path: '/share',
    children: [
      {
        key: 'local:team',
        title: '团队文件',
        type: 'folder',
        path: '/share/team',
        children: [
          { key: 'local:team/docs', title: '文档', type: 'folder', path: '/share/team/文档', isLeaf: true },
          { key: 'local:team/design', title: '设计', type: 'folder', path: '/share/team/设计', isLeaf: true },
        ],
      },
      {
        key: 'local:shared',
        title: '共享目录',
        type: 'folder',
        path: '/share/shared',
        children: [
          { key: 'local:shared/public', title: '公共资源', type: 'folder', path: '/share/shared/公共资源', isLeaf: true },
          { key: 'local:shared/media', title: '媒体库', type: 'folder', path: '/share/shared/媒体库', isLeaf: true },
        ],
      },
      {
        key: 'local:personal',
        title: '个人文件',
        type: 'folder',
        path: '/share/personal',
        isLeaf: true,
      },
    ],
  },
];

const localFiles: Record<string, FileItem[]> = {
  'local:root': [
    { id: 'lr-d1', name: '团队文件', type: 'folder', size: '--', modifyTime: '2025-05-06 10:30:00' },
    { id: 'lr-d2', name: '共享目录', type: 'folder', size: '--', modifyTime: '2025-05-05 14:20:00' },
    { id: 'lr-d3', name: '个人文件', type: 'folder', size: '--', modifyTime: '2025-05-04 09:15:00' },
    { id: 'lr-f1', name: '系统说明.md', type: 'file', size: '5 KB', modifyTime: '2025-05-01 14:30:00', extension: 'md' },
  ],
  'local:team': [
    { id: 'lt-d1', name: '文档', type: 'folder', size: '--', modifyTime: '2025-05-06 10:30:00' },
    { id: 'lt-d2', name: '设计', type: 'folder', size: '--', modifyTime: '2025-05-05 14:20:00' },
    { id: 'lt-f1', name: '团队规范.pdf', type: 'file', size: '1.2 MB', modifyTime: '2025-04-20 10:10:00', extension: 'pdf' },
  ],
  'local:team/docs': [
    { id: 'lt-f2', name: '会议纪要-20250506.docx', type: 'file', size: '45 KB', modifyTime: '2025-05-06 17:00:00', extension: 'docx' },
    { id: 'lt-f3', name: '项目进度.xlsx', type: 'file', size: '120 KB', modifyTime: '2025-05-05 09:00:00', extension: 'xlsx' },
  ],
  'local:team/design': [
    { id: 'lt-f4', name: 'UI规范.fig', type: 'file', size: '25 MB', modifyTime: '2025-04-28 14:00:00', extension: 'fig' },
    { id: 'lt-f5', name: '配色方案.png', type: 'file', size: '2.3 MB', modifyTime: '2025-04-25 10:00:00', extension: 'png' },
  ],
  'local:shared': [
    { id: 'ls-d1', name: '公共资源', type: 'folder', size: '--', modifyTime: '2025-05-06 10:30:00' },
    { id: 'ls-d2', name: '媒体库', type: 'folder', size: '--', modifyTime: '2025-05-05 14:20:00' },
    { id: 'ls-f1', name: '共享说明.txt', type: 'file', size: '1 KB', modifyTime: '2025-05-01 14:30:00', extension: 'txt' },
  ],
  'local:shared/public': [
    { id: 'ls-f2', name: '公司介绍.pdf', type: 'file', size: '5.6 MB', modifyTime: '2025-04-20 10:00:00', extension: 'pdf' },
    { id: 'ls-f3', name: '产品手册.docx', type: 'file', size: '3.2 MB', modifyTime: '2025-04-15 09:00:00', extension: 'docx' },
  ],
  'local:shared/media': [
    { id: 'ls-f4', name: '宣传片.mp4', type: 'file', size: '256 MB', modifyTime: '2025-03-20 14:00:00', extension: 'mp4' },
    { id: 'ls-f5', name: '背景音乐.mp3', type: 'file', size: '8 MB', modifyTime: '2025-03-15 10:00:00', extension: 'mp3' },
  ],
  'local:personal': [
    { id: 'lp-f1', name: '我的文档.docx', type: 'file', size: '56 KB', modifyTime: '2025-05-06 10:00:00', extension: 'docx' },
    { id: 'lp-f2', name: '照片备份.zip', type: 'file', size: '1.2 GB', modifyTime: '2025-04-30 18:00:00', extension: 'zip' },
  ],
};

// ═══════════════════════════════════════════════════════════
// 状态
// ═══════════════════════════════════════════════════════════

const showLocalPanel = ref(false);

// 外接设备面板状态
const selectedKeys = ref<string[]>(['root']);
const expandedKeys = ref<string[]>(['root']);
const files = ref<FileItem[]>([]);
const searchText = ref('');
const viewMode = ref<'list' | 'grid'>('list');
const loading = ref(false);

// 本地面板状态
const localTreeData = ref<FileTreeNode[]>(localTree);
const localSelectedKeys = ref<string[]>(['local:root']);
const localExpandedKeys = ref<string[]>(['local:root']);
const localFilesList = ref<FileItem[]>([]);
const localSearchText = ref('');
const localViewMode = ref<'list' | 'grid'>('list');
const localLoading = ref(false);

// 树状面板引用（用于外部控制收起/展开）
const deviceTreeRef = ref<InstanceType<typeof FileTreePanel> | null>(null);
const localTreeRef = ref<InstanceType<typeof FileTreePanel> | null>(null);

// 传输弹窗
const transferModalVisible = ref(false);
const transferFileName = ref('');
const transferDirection = ref<'to-local' | 'to-device'>('to-local');

// 重命名
const renameModalVisible = ref(false);
const renameFormRef = ref();
const renameForm = ref({ name: '' });
const editingFile = ref<FileItem | null>(null);

const filesMap = ref<Record<string, FileItem[]>>(JSON.parse(JSON.stringify(deviceFilesData)));

// ═══════════════════════════════════════════════════════════
// 计算属性
// ═══════════════════════════════════════════════════════════

const breadcrumbPath = computed(() => {
  const key = selectedKeys.value[0];
  if (!key || key === 'root') {
    return [{ title: currentDevice.value?.name || '外接设备', key: 'root' }];
  }
  return buildBreadcrumbPath(treeData.value, key, currentDevice.value?.name || '外接设备', 'root');
});

const localBreadcrumbPath = computed(() => {
  const key = localSelectedKeys.value[0];
  if (!key) return [{ title: '本地存储', key: 'root' }];
  return buildBreadcrumbPath(localTreeData.value, key, '本地存储', 'local:root');
});

// ═══════════════════════════════════════════════════════════
// 方法
// ═══════════════════════════════════════════════════════════

function loadFiles(key: string) {
  if (key === 'root') {
    // 根节点显示设备根目录文件
    const device = currentDevice.value;
    if (!device) {
      files.value = [];
      return;
    }
    const rootKey = `${device.id}:root`;
    files.value = filesMap.value[rootKey] || [];
    return;
  }
  loading.value = true;
  setTimeout(() => {
    files.value = filesMap.value[key] || [];
    loading.value = false;
  }, 150);
}

function loadLocalFiles(key: string) {
  localLoading.value = true;
  setTimeout(() => {
    localFilesList.value = localFiles[key] || [];
    localLoading.value = false;
  }, 150);
}

function onTreeSelect(key: string) {
  selectedKeys.value = [key];
  loadFiles(key);
}

function onLocalTreeSelect(key: string) {
  localSelectedKeys.value = [key];
  loadLocalFiles(key);
}

function onBreadcrumbClick(item: BreadcrumbItem) {
  if (item.key === 'root') {
    selectedKeys.value = ['root'];
    loadFiles('root');
    return;
  }
  selectedKeys.value = [item.key];
  const parentKeys = findParentKeys(treeData.value, item.key);
  expandedKeys.value = [...new Set([...expandedKeys.value, ...parentKeys])];
  loadFiles(item.key);
}

function onLocalBreadcrumbClick(item: BreadcrumbItem) {
  if (item.key === 'local:root') {
    localSelectedKeys.value = ['local:root'];
    localExpandedKeys.value = ['local:root'];
    loadLocalFiles('local:root');
    return;
  }
  localSelectedKeys.value = [item.key];
  const parentKeys = findParentKeys(localTreeData.value, item.key);
  localExpandedKeys.value = [...new Set([...localExpandedKeys.value, ...parentKeys])];
  loadLocalFiles(item.key);
}

function handleOpenFolder(file: FileItem) {
  if (file.type !== 'folder') return;
  const currentKey = selectedKeys.value[0];
  const newKey = findChildKey(treeData.value, currentKey, file.name);
  if (newKey) {
    selectedKeys.value = [newKey];
    expandedKeys.value = [...new Set([...expandedKeys.value, currentKey])];
    loadFiles(newKey);
  }
}

function handleLocalOpenFolder(file: FileItem) {
  if (file.type !== 'folder') return;
  const currentKey = localSelectedKeys.value[0];
  const newKey = findChildKey(localTreeData.value, currentKey, file.name);
  if (newKey) {
    localSelectedKeys.value = [newKey];
    localExpandedKeys.value = [...new Set([...localExpandedKeys.value, currentKey])];
    loadLocalFiles(newKey);
  }
}

/** 在树中查找子节点的 key */
function findChildKey(nodes: FileTreeNode[], parentKey: string, childName: string): string | null {
  const parent = findNodeInTree(nodes, parentKey);
  if (parent?.children) {
    const child = parent.children.find((c) => c.title === childName);
    if (child) return child.key;
  }
  return null;
}

// ═══ 拖拽传输 ═══

function onDeviceDrop(files: FileItem[], _event: DragEvent) {
  if (files.length === 0) return;
  const file = files[0];
  transferFileName.value = file.name;
  transferDirection.value = 'to-device';
  transferModalVisible.value = true;
}

function onLocalDrop(files: FileItem[], _event: DragEvent) {
  if (files.length === 0) return;
  const file = files[0];
  transferFileName.value = file.name;
  transferDirection.value = 'to-local';
  transferModalVisible.value = true;
}

function confirmTransfer() {
  const target = transferDirection.value === 'to-local' ? '本地存储' : currentDevice.value?.name || '外接设备';
  message.success(`"${transferFileName.value}" 已传输到 ${target}`);
  transferModalVisible.value = false;

  if (transferDirection.value === 'to-local') {
    const currentKey = localSelectedKeys.value[0];
    const newFile: FileItem = {
      id: `trans-${Date.now()}`,
      name: transferFileName.value,
      type: 'file',
      size: '未知',
      modifyTime: new Date().toLocaleString('zh-CN'),
      extension: transferFileName.value.split('.').pop(),
    };
    if (!localFiles[currentKey]) localFiles[currentKey] = [];
    localFiles[currentKey].push(newFile);
    loadLocalFiles(currentKey);
  } else {
    const currentKey = selectedKeys.value[0];
    const newFile: FileItem = {
      id: `trans-${Date.now()}`,
      name: transferFileName.value,
      type: 'file',
      size: '未知',
      modifyTime: new Date().toLocaleString('zh-CN'),
      extension: transferFileName.value.split('.').pop(),
    };
    if (!filesMap.value[currentKey]) filesMap.value[currentKey] = [];
    filesMap.value[currentKey].push(newFile);
    loadFiles(currentKey);
  }
}

// ═══ 重命名 ═══

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

// ═══ 删除 ═══

function handleDeleteFile(file: FileItem) {
  message.success(`"${file.name}" 已删除`);
  files.value = files.value.filter((f) => f.id !== file.id);
}

function handleDeleteLocalFile(file: FileItem) {
  message.success(`"${file.name}" 已删除`);
  localFilesList.value = localFilesList.value.filter((f) => f.id !== file.id);
}

// ═══ 刷新 ═══

function refreshFiles() {
  loadFiles(selectedKeys.value[0]);
  message.success('已刷新');
}

function refreshLocal() {
  loadLocalFiles(localSelectedKeys.value[0]);
  message.success('已刷新');
}

// ═══ 树节点图标 ═══

function nodeIconResolver(node: FileTreeNode) {
  const device = currentDevice.value;
  if (!device) return { icon: 'lucide:usb', color: '#1677ff' };

  // 所有外接设备节点统一使用 U盘 图标和蓝色
  if (node.type?.startsWith('device-')) {
    if (node.type === 'device-disconnected') {
      return { icon: 'lucide:usb', color: '#bfbfbf' };
    }
    return { icon: 'lucide:usb', color: '#1677ff' };
  }
  return { icon: 'lucide:folder', color: '#faad14' };
}

function localNodeIconResolver(node: FileTreeNode) {
  if (node.type === 'local-root') {
    return { icon: 'lucide:server', color: '#52c41a' };
  }
  return { icon: 'lucide:folder', color: '#faad14' };
}

// ═══ 返回列表 ═══

function goBack() {
  router.push('/file/external-device');
}

// ═══ 拷贝模式切换 ═══

/** 切换双栏拷贝模式 */
function toggleCopyMode() {
  showLocalPanel.value = !showLocalPanel.value;
}

// 监听拷贝模式变化，自动切换树状视图侧边栏状态
watch(showLocalPanel, (val) => {
  if (val) {
    // 进入拷贝模式：两侧树状视图切换为悬浮收起模式
    deviceTreeRef.value?.setPin?.(false);
    deviceTreeRef.value?.collapse?.();
    localTreeRef.value?.setPin?.(false);
    localTreeRef.value?.collapse?.();
  } else {
    // 退出拷贝模式：恢复为固定展开模式
    deviceTreeRef.value?.setPin?.(true);
    deviceTreeRef.value?.expand?.();
    localTreeRef.value?.setPin?.(true);
    localTreeRef.value?.expand?.();
  }
});

// ═══════════════════════════════════════════════════════════
// 初始化
// ═══════════════════════════════════════════════════════════

onMounted(() => {
  loadFiles('root');
  loadLocalFiles('local:root');
});
</script>

<template>
  <div class="external-device-manage">
    <!-- ═══════ 统一头部栏（两行布局） ═══════ -->
    <div class="unified-header">
      <!-- 第一行：页面描述与状态信息 -->
      <div class="unified-header__row">
        <div class="unified-header__left">
          <div class="device-info">
            <div class="device-info__icon">
              <IconifyIcon
                :icon="getDeviceIcon(currentDevice?.type || 'usb')"
                style="font-size: 18px;"
                :style="{ color: getDeviceIconColor(currentDevice?.type || 'usb') }"
              />
            </div>
            <div class="device-info__text">
              <div class="device-info__name">{{ currentDevice?.name || '外接设备' }}</div>
              <div class="device-info__meta">
                <span class="meta-tag">{{ getDeviceTypeLabel(currentDevice?.type || 'usb') }}</span>
                <span class="meta-sep">·</span>
                <span>{{ currentDevice?.fileSystem }}</span>
                <span class="meta-sep">·</span>
                <span>{{ currentDevice?.capacity }}</span>
              </div>
            </div>
          </div>
          <div class="header-divider" />
          <div
            class="connection-badge"
            :class="{ 'connection-badge--connected': currentDevice?.status === 'connected' }"
          >
            <span class="connection-badge__dot" />
            <span class="connection-badge__text">
              {{ currentDevice?.status === 'connected' ? '已连接' : '未连接' }}
            </span>
          </div>
        </div>

        <!-- 右侧：容量概览 -->
        <div class="unified-header__right-stats">
          <div class="stat-chip">
            <IconifyIcon icon="lucide:hard-drive" style="font-size: 14px; color: #1677ff;" />
            <div class="stat-chip__content">
              <span class="stat-chip__label">总容量</span>
              <span class="stat-chip__value">{{ currentDevice?.capacity || '-' }}</span>
            </div>
          </div>
          <div class="stat-chip">
            <IconifyIcon icon="lucide:database" style="font-size: 14px; color: #52c41a;" />
            <div class="stat-chip__content">
              <span class="stat-chip__label">已用</span>
              <span class="stat-chip__value">{{ currentDevice?.used || '-' }}</span>
            </div>
          </div>
          <div class="stat-chip">
            <IconifyIcon icon="lucide:percent" style="font-size: 14px; color: #faad14;" />
            <div class="stat-chip__content">
              <span class="stat-chip__label">使用率</span>
              <span class="stat-chip__value">{{ currentDevice?.usedPercent ?? 0 }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 第二行：操作按钮 -->
      <div class="unified-header__row">
        <Button size="small" class="back-btn" @click="goBack">
          <IconifyIcon icon="lucide:arrow-left" style="font-size: 14px;" />
          返回外接设备列表
        </Button>

        <button
          class="copy-mode-toggle"
          :class="{ 'copy-mode-toggle--active': showLocalPanel }"
          @click="toggleCopyMode"
        >
          <IconifyIcon
            :icon="showLocalPanel ? 'lucide:folder-x' : 'lucide:folder-sync'"
            style="font-size: 14px;"
          />
          <span>{{ showLocalPanel ? '退出拷贝' : '文件拷贝' }}</span>
        </button>
      </div>
    </div>

    <!-- ═══════ 双栏文件管理器 ═══════ -->
    <div class="dual-panel" :class="{ 'dual-panel--single': !showLocalPanel }">
      <!-- 左侧：外接设备 -->
      <div class="panel-wrapper panel-wrapper--device">
        <div class="panel-content">
          <FileTreePanel
            ref="deviceTreeRef"
            :tree-data="treeData"
            v-model:selected-keys="selectedKeys"
            v-model:expanded-keys="expandedKeys"
            :node-icon-resolver="nodeIconResolver"
            width="220px"
            @select="onTreeSelect"
          />
          <FileManagerPanel
            :files="files"
            :breadcrumb-path="breadcrumbPath"
            :loading="loading"
            v-model:search-text="searchText"
            v-model:view-mode="viewMode"
            :draggable="true"
            :drop-zone="true"
            drag-source-key="device-panel"
            drop-hint="释放以传输到本地存储"
            @breadcrumb-click="onBreadcrumbClick"
            @refresh="refreshFiles"
            @open-folder="handleOpenFolder"
            @rename="openRenameModal"
            @delete-file="handleDeleteFile"
            @drop="onDeviceDrop"
          />
        </div>
      </div>

      <!-- 中间拖拽分隔线 -->
      <div v-if="showLocalPanel" class="drag-divider">
        <div class="drag-divider__inner" />
      </div>

      <!-- 右侧：本地存储 -->
      <div v-show="showLocalPanel" class="panel-wrapper panel-wrapper--local">
        <div class="panel-content">
          <FileTreePanel
            ref="localTreeRef"
            :tree-data="localTreeData"
            v-model:selected-keys="localSelectedKeys"
            v-model:expanded-keys="localExpandedKeys"
            :node-icon-resolver="localNodeIconResolver"
            width="220px"
            @select="onLocalTreeSelect"
          />
          <FileManagerPanel
            :files="localFilesList"
            :breadcrumb-path="localBreadcrumbPath"
            :loading="localLoading"
            v-model:search-text="localSearchText"
            v-model:view-mode="localViewMode"
            :draggable="true"
            :drop-zone="true"
            drag-source-key="local-panel"
            drop-hint="释放以传输到外接设备"
            @breadcrumb-click="onLocalBreadcrumbClick"
            @refresh="refreshLocal"
            @open-folder="handleLocalOpenFolder"
            @rename="openRenameModal"
            @delete-file="handleDeleteLocalFile"
            @drop="onLocalDrop"
          />
        </div>
      </div>
    </div>

    <!-- ═══════ 传输确认弹窗 ═══════ -->
    <Modal
      v-model:open="transferModalVisible"
      :title="transferDirection === 'to-local' ? '传输确认' : '传输确认'"
      width="420px"
      @ok="confirmTransfer"
      ok-text="确认传输"
      cancel-text="取消"
    >
      <div class="transfer-modal-content">
        <div class="transfer-modal-icon">
          <IconifyIcon icon="lucide:arrow-left-right" style="font-size: 32px; color: #1677ff;" />
        </div>
        <div class="transfer-modal-info">
          <p class="transfer-modal-file">
            <IconifyIcon icon="lucide:file" style="font-size: 14px; color: #8c8c8c;" />
            <span>{{ transferFileName }}</span>
          </p>
          <p class="transfer-modal-direction">
            <span v-if="transferDirection === 'to-local'">
              将传输到 <strong>本地存储</strong>
            </span>
            <span v-else>
              将传输到 <strong>{{ currentDevice?.name }}</strong>
            </span>
          </p>
        </div>
      </div>
    </Modal>

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
  </div>
</template>

<style scoped>
.external-device-manage {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f5f5f5;
  overflow: hidden;
}

/* ═══════════════════════════════════════════════════════════
   统一头部栏（两行布局）
   ═══════════════════════════════════════════════════════════ */
.unified-header {
  display: flex;
  flex-direction: column;
  padding: 12px 20px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  gap: 10px;
  flex-shrink: 0;
}

.unified-header__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

/* 左侧：设备信息 + 连接状态 */
.unified-header__left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: 6px;
}

.header-divider {
  width: 1px;
  height: 24px;
  background: #e8e8e8;
  flex-shrink: 0;
}

.device-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.device-info__icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #e6f4ff 0%, #d6e8ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.device-info__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.device-info__name {
  font-size: 15px;
  font-weight: 600;
  color: #262626;
  line-height: 1.3;
}

.device-info__meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #8c8c8c;
}

.meta-tag {
  display: inline-flex;
  align-items: center;
  padding: 1px 8px;
  background: #f0f5ff;
  border-radius: 10px;
  font-size: 11px;
  color: #1677ff;
  font-weight: 500;
}

.meta-sep {
  color: #d9d9d9;
}

/* 右侧：容量概览统计 */
.unified-header__right-stats {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.stat-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.stat-chip:hover {
  background: #f0f5ff;
  border-color: #bae0ff;
}

.stat-chip__content {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.stat-chip__label {
  font-size: 10px;
  color: #8c8c8c;
  line-height: 1.3;
}

.stat-chip__value {
  font-size: 14px;
  font-weight: 600;
  color: #262626;
  font-family: 'SF Mono', 'Fira Code', monospace;
  line-height: 1.3;
}


/* 右侧：连接状态 + 拷贝模式 */
.unified-header__right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.connection-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: #f5f5f5;
  border-radius: 20px;
  font-size: 12px;
  color: #8c8c8c;
  transition: all 0.2s ease;
}

.connection-badge--connected {
  background: #f6ffed;
  color: #52c41a;
}

.connection-badge__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #bfbfbf;
  flex-shrink: 0;
}

.connection-badge--connected .connection-badge__dot {
  background: #52c41a;
  box-shadow: 0 0 0 2px rgba(82, 196, 26, 0.2);
}

/* 拷贝模式切换按钮 */
.copy-mode-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: #f5f5f5;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  font-size: 13px;
  color: #595959;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
  outline: none;
}

.copy-mode-toggle:hover {
  background: #f0f5ff;
  border-color: #bae0ff;
  color: #1677ff;
}

.copy-mode-toggle--active {
  background: linear-gradient(135deg, #1677ff 0%, #4096ff 100%);
  border-color: #1677ff;
  color: #fff;
  box-shadow: 0 2px 8px rgba(22, 119, 255, 0.25);
}

.copy-mode-toggle--active:hover {
  background: linear-gradient(135deg, #0958d9 0%, #1677ff 100%);
  border-color: #0958d9;
  color: #fff;
}

/* ═══════════════════════════════════════════════════════════
   双栏布局
   ═══════════════════════════════════════════════════════════ */
.dual-panel {
  display: flex;
  flex: 1;
  overflow: hidden;
  padding: 10px;
  gap: 4px;
}

.dual-panel--single .panel-wrapper--device {
  max-width: 100%;
}

.panel-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

.panel-content {
  display: flex;
  flex: 1;
  overflow: hidden;
  gap: 4px;
}

/* 中间拖拽分隔：短竖线 */
.drag-divider {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 4px;
  flex-shrink: 0;
  align-self: center;
}

.drag-divider__inner {
  width: 2px;
  height: 64px;
  border-radius: 2px;
  background: #d9d9d9;
  display: block;
}

/* ═══════════════════════════════════════════════════════════
   传输弹窗
   ═══════════════════════════════════════════════════════════ */
.transfer-modal-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
}

.transfer-modal-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #e6f4ff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.transfer-modal-info {
  text-align: center;
}

.transfer-modal-file {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 600;
  color: #262626;
  margin: 0 0 8px;
}

.transfer-modal-direction {
  font-size: 13px;
  color: #595959;
  margin: 0;
}

.transfer-modal-direction strong {
  color: #1677ff;
}

/* ═══════════════════════════════════════════════════════════
   响应式
   ═══════════════════════════════════════════════════════════ */
@media (max-width: 1200px) {
  .unified-header__center {
    display: none;
  }
}

@media (max-width: 1024px) {
  .dual-panel {
    flex-direction: column;
  }

  .drag-divider {
    flex-direction: row;
    width: auto;
    height: 32px;
  }

  .panel-content {
    flex-direction: column;
  }

  .panel-content :deep(.file-tree-panel) {
    width: 100% !important;
    min-width: auto !important;
    max-height: 200px;
    border-radius: 0;
  }
}

@media (max-width: 768px) {
  .unified-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 14px;
  }

  .unified-header__right {
    width: 100%;
    justify-content: space-between;
  }
}
</style>

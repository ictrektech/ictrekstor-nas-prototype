<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import {
  Tag,
  Tooltip,
  Switch,
  message,
  Modal,
  Form,
  Input,
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

// ═══════════════════════════════════════════════════════════
// 类型定义
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

// ═══════════════════════════════════════════════════════════
// Mock 外接设备数据
// ═══════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════
// 统一目录树（外接设备根 → 各设备 → 文件目录）
// ═══════════════════════════════════════════════════════════

function getDeviceNodeType(device: ExternalDevice): string {
  if (device.status === 'disconnected') return 'device-disconnected';
  return `device-${device.type}`;
}

const unifiedTree = computed<FileTreeNode[]>(() => {
  const deviceNodes: FileTreeNode[] = devices.value.map((device) => {
    const nodeType = getDeviceNodeType(device);
    const isDisconnected = device.status === 'disconnected';

    if (isDisconnected) {
      return {
        key: `${device.id}:root`,
        title: device.name,
        type: nodeType,
        path: device.mountPath,
        businessId: device.id,
        isLeaf: true,
        disabled: true,
      } as FileTreeNode;
    }

    // 已连接设备的子目录结构
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

    return {
      key: `${device.id}:root`,
      title: device.name,
      type: nodeType,
      path: device.mountPath,
      businessId: device.id,
      children,
    };
  });

  return [
    {
      key: 'root',
      title: '外接设备',
      type: 'root',
      path: '/mnt',
      children: deviceNodes,
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
// Mock 本地存储目录树
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

// ═══════════════════════════════════════════════════════════
// Mock 本地存储文件数据
// ═══════════════════════════════════════════════════════════

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
const deviceTreeData = computed<FileTreeNode[]>(() => unifiedTree.value);
const deviceSelectedKeys = ref<string[]>(['usb-1:root']);
const deviceExpandedKeys = ref<string[]>(['root', 'usb-1:root']);
const deviceFiles = ref<FileItem[]>([]);
const deviceSearchText = ref('');
const deviceViewMode = ref<'list' | 'grid'>('list');
const deviceLoading = ref(false);

// 本地面板状态
const localTreeData = ref<FileTreeNode[]>(localTree);
const localSelectedKeys = ref<string[]>(['local:root']);
const localExpandedKeys = ref<string[]>(['local:root']);
const localFilesList = ref<FileItem[]>([]);
const localSearchText = ref('');
const localViewMode = ref<'list' | 'grid'>('list');
const localLoading = ref(false);

// 传输弹窗
const transferModalVisible = ref(false);
const transferFileName = ref('');
const transferDirection = ref<'to-local' | 'to-device'>('to-local');

// 重命名
const renameModalVisible = ref(false);
const renameFormRef = ref();
const renameForm = ref({ name: '' });
const editingFile = ref<FileItem | null>(null);

// 用 ref 包装设备文件数据以便动态修改
const deviceFilesMap = ref<Record<string, FileItem[]>>(JSON.parse(JSON.stringify(deviceFilesData)));

// ═══════════════════════════════════════════════════════════
// 计算属性
// ═══════════════════════════════════════════════════════════

const currentDeviceName = computed(() => {
  const key = deviceSelectedKeys.value[0];
  if (!key || key === 'root') return '外接设备';
  const deviceId = key.split(':')[0];
  const device = devices.value.find((d) => d.id === deviceId);
  return device?.name || '外接设备';
});

const deviceBreadcrumbPath = computed(() => {
  const key = deviceSelectedKeys.value[0];
  if (!key || key === 'root') return [{ title: '外接设备', key: 'root' }];
  return buildBreadcrumbPath(unifiedTree.value, key, '外接设备', 'root');
});

const localBreadcrumbPath = computed(() => {
  const key = localSelectedKeys.value[0];
  if (!key) return [{ title: '本地存储', key: 'root' }];
  return buildBreadcrumbPath(localTreeData.value, key, '本地存储', 'root');
});

// ═══════════════════════════════════════════════════════════
// 方法
// ═══════════════════════════════════════════════════════════

function loadDeviceFiles(key: string) {
  if (key === 'root') {
    deviceFiles.value = [];
    return;
  }
  deviceLoading.value = true;
  setTimeout(() => {
    deviceFiles.value = deviceFilesMap.value[key] || [];
    deviceLoading.value = false;
  }, 150);
}

function loadLocalFiles(key: string) {
  localLoading.value = true;
  setTimeout(() => {
    localFilesList.value = localFiles[key] || [];
    localLoading.value = false;
  }, 150);
}

function onDeviceTreeSelect(key: string) {
  deviceSelectedKeys.value = [key];
  loadDeviceFiles(key);
}

function onLocalTreeSelect(key: string) {
  localSelectedKeys.value = [key];
  loadLocalFiles(key);
}

function onDeviceBreadcrumbClick(item: BreadcrumbItem) {
  if (item.key === 'root') {
    deviceSelectedKeys.value = ['root'];
    loadDeviceFiles('root');
    return;
  }
  deviceSelectedKeys.value = [item.key];
  const parentKeys = findParentKeys(unifiedTree.value, item.key);
  deviceExpandedKeys.value = [...new Set([...deviceExpandedKeys.value, ...parentKeys])];
  loadDeviceFiles(item.key);
}

function onLocalBreadcrumbClick(item: BreadcrumbItem) {
  if (item.key === 'root') {
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

function handleDeviceOpenFolder(file: FileItem) {
  if (file.type !== 'folder') return;
  const currentKey = deviceSelectedKeys.value[0];
  const newKey = findChildKey(unifiedTree.value, currentKey, file.name);
  if (newKey) {
    deviceSelectedKeys.value = [newKey];
    deviceExpandedKeys.value = [...new Set([...deviceExpandedKeys.value, currentKey])];
    loadDeviceFiles(newKey);
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
  const target = transferDirection.value === 'to-local' ? '本地存储' : currentDeviceName.value;
  message.success(`"${transferFileName.value}" 已传输到 ${target}`);
  transferModalVisible.value = false;

  // MOCK: 将文件添加到目标目录
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
    const currentKey = deviceSelectedKeys.value[0];
    const newFile: FileItem = {
      id: `trans-${Date.now()}`,
      name: transferFileName.value,
      type: 'file',
      size: '未知',
      modifyTime: new Date().toLocaleString('zh-CN'),
      extension: transferFileName.value.split('.').pop(),
    };
    if (!deviceFilesMap.value[currentKey]) deviceFilesMap.value[currentKey] = [];
    deviceFilesMap.value[currentKey].push(newFile);
    loadDeviceFiles(currentKey);
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

function handleDeleteDeviceFile(file: FileItem) {
  message.success(`"${file.name}" 已删除`);
  deviceFiles.value = deviceFiles.value.filter((f) => f.id !== file.id);
}

function handleDeleteLocalFile(file: FileItem) {
  message.success(`"${file.name}" 已删除`);
  localFilesList.value = localFilesList.value.filter((f) => f.id !== file.id);
}

// ═══ 刷新 ═══

function refreshDevice() {
  loadDeviceFiles(deviceSelectedKeys.value[0]);
  message.success('已刷新');
}

function refreshLocal() {
  loadLocalFiles(localSelectedKeys.value[0]);
  message.success('已刷新');
}

// ═══ 树节点图标 ═══

function deviceNodeIconResolver(node: FileTreeNode) {
  if (node.type === 'root') {
    return { icon: 'lucide:usb', color: '#1677ff' };
  }
  if (node.type === 'device-usb') {
    return { icon: 'lucide:usb', color: '#1677ff' };
  }
  if (node.type === 'device-hdd') {
    return { icon: 'lucide:hard-drive', color: '#722ed1' };
  }
  if (node.type === 'device-ssd') {
    return { icon: 'lucide:hard-drive', color: '#13c2c2' };
  }
  if (node.type === 'device-sd') {
    return { icon: 'lucide:sd-card', color: '#faad14' };
  }
  if (node.type === 'device-disconnected') {
    return { icon: 'lucide:usb', color: '#bfbfbf' };
  }
  return { icon: 'lucide:folder', color: '#faad14' };
}

function localNodeIconResolver(node: FileTreeNode) {
  if (node.type === 'local-root') {
    return { icon: 'lucide:server', color: '#52c41a' };
  }
  return { icon: 'lucide:folder', color: '#faad14' };
}

// ═══════════════════════════════════════════════════════════
// 初始化
// ═══════════════════════════════════════════════════════════

onMounted(() => {
  loadDeviceFiles('usb-1:root');
  loadLocalFiles('local:root');
});
</script>

<template>
  <div class="external-device-page">
    <!-- ═══════ 顶部工具栏 ═══════ -->
    <div class="top-toolbar">
      <div class="top-toolbar__left">
        <div class="page-icon-box">
          <IconifyIcon icon="lucide:usb" style="font-size: 20px; color: #1677ff;" />
        </div>
        <div class="page-title-area">
          <h1 class="page-title">外接设备</h1>
          <p class="page-desc">管理 USB、移动硬盘、SD 卡等外接存储设备</p>
        </div>
      </div>
      <div class="top-toolbar__right">
        <div class="toolbar-stat">
          <IconifyIcon icon="lucide:plug" style="font-size: 14px; color: #52c41a;" />
          <span>已连接 <strong>3 / 4</strong></span>
        </div>
        <div class="toolbar-divider" />
        <div class="local-toggle">
          <span class="local-toggle__label">本地文件管理器</span>
          <Switch v-model:checked="showLocalPanel" size="small" />
        </div>
      </div>
    </div>

    <!-- ═══════ 双栏文件管理器 ═══════ -->
    <div class="dual-panel" :class="{ 'dual-panel--single': !showLocalPanel }">
      <!-- 左侧：外接设备 -->
      <div class="panel-wrapper panel-wrapper--device">
        <div class="panel-label">
          <IconifyIcon icon="lucide:usb" style="font-size: 13px; color: #1677ff;" />
          <span>外接设备</span>
          <Tag size="small" color="blue">{{ currentDeviceName }}</Tag>
        </div>
        <div class="panel-content">
          <FileTreePanel
            :tree-data="deviceTreeData"
            v-model:selected-keys="deviceSelectedKeys"
            v-model:expanded-keys="deviceExpandedKeys"
            :node-icon-resolver="deviceNodeIconResolver"
            width="220px"
            @select="onDeviceTreeSelect"
          />
          <FileManagerPanel
            :files="deviceFiles"
            :breadcrumb-path="deviceBreadcrumbPath"
            :loading="deviceLoading"
            v-model:search-text="deviceSearchText"
            v-model:view-mode="deviceViewMode"
            :draggable="true"
            :drop-zone="true"
            drag-source-key="device-panel"
            drop-hint="释放以传输到本地存储"
            panel-title="外接设备"
            @breadcrumb-click="onDeviceBreadcrumbClick"
            @refresh="refreshDevice"
            @open-folder="handleDeviceOpenFolder"
            @rename="openRenameModal"
            @delete-file="handleDeleteDeviceFile"
            @drop="onDeviceDrop"
          />
        </div>
      </div>

      <!-- 中间拖拽提示 -->
      <div v-if="showLocalPanel" class="drag-divider">
        <div class="drag-divider__icon">
          <IconifyIcon icon="lucide:arrow-left-right" style="font-size: 18px; color: #bfbfbf;" />
        </div>
        <div class="drag-divider__text">双向拖拽传输</div>
      </div>

      <!-- 右侧：本地存储 -->
      <div v-if="showLocalPanel" class="panel-wrapper panel-wrapper--local">
        <div class="panel-label">
          <IconifyIcon icon="lucide:server" style="font-size: 13px; color: #52c41a;" />
          <span>本地存储</span>
          <Tag size="small" color="green">NAS</Tag>
        </div>
        <div class="panel-content">
          <FileTreePanel
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
            panel-title="本地存储"
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
              将传输到 <strong>{{ currentDeviceName }}</strong>
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
.external-device-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f5f5f5;
  overflow: hidden;
}

/* ═══ 顶部工具栏 ═══ */
.top-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  gap: 16px;
  flex-shrink: 0;
}

.top-toolbar__left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-icon-box {
  width: 40px;
  height: 40px;
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

.top-toolbar__right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-stat {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #595959;
}

.toolbar-stat strong {
  color: #262626;
  font-weight: 600;
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  background: #e8e8e8;
}

.local-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
}

.local-toggle__label {
  font-size: 13px;
  color: #595959;
}

/* ═══ 双栏布局 ═══ */
.dual-panel {
  display: flex;
  flex: 1;
  overflow: hidden;
  padding: 12px;
  gap: 12px;
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

.panel-label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-bottom: none;
  border-radius: 10px 10px 0 0;
  font-size: 13px;
  font-weight: 600;
  color: #262626;
  flex-shrink: 0;
}

.panel-content {
  display: flex;
  flex: 1;
  overflow: hidden;
  gap: 1px;
}

.panel-content :deep(.file-tree-panel) {
  border-radius: 0 0 0 10px;
  border-top: none;
}

.panel-content :deep(.file-manager-panel) {
  border-radius: 0 0 10px 0;
  border-top: none;
}

/* 中间拖拽分隔 */
.drag-divider {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 48px;
  flex-shrink: 0;
  align-self: center;
}

.drag-divider__icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #fff;
  border: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.drag-divider__text {
  font-size: 10px;
  color: #bfbfbf;
  text-align: center;
  writing-mode: vertical-rl;
  letter-spacing: 2px;
}

/* ═══ 传输弹窗 ═══ */
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

/* ═══ 响应式 ═══ */
@media (max-width: 1024px) {
  .dual-panel {
    flex-direction: column;
  }
  .drag-divider {
    flex-direction: row;
    width: auto;
    height: 40px;
  }
  .drag-divider__text {
    writing-mode: horizontal-tb;
  }
}

@media (max-width: 768px) {
  .top-toolbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
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
</style>

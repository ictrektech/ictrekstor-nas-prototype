import type { FileTreeNode, FileItem } from '#/components/FileExplorer';

export interface ExternalDevice {
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

export const devices: ExternalDevice[] = [
  {
    id: 'usb-1', name: 'SanDisk U盘', type: 'usb',
    capacity: '128 GB', used: '45 GB', usedPercent: 35,
    status: 'connected', mountPath: '/mnt/usb0', fileSystem: 'exFAT',
  },
  {
    id: 'hdd-1', name: 'Seagate 移动硬盘', type: 'hdd',
    capacity: '2 TB', used: '850 GB', usedPercent: 42,
    status: 'connected', mountPath: '/mnt/usb1', fileSystem: 'NTFS',
  },
  {
    id: 'ssd-1', name: 'Samsung T7 SSD', type: 'ssd',
    capacity: '1 TB', used: '320 GB', usedPercent: 31,
    status: 'connected', mountPath: '/mnt/usb2', fileSystem: 'exFAT',
  },
  {
    id: 'sd-1', name: 'SD 存储卡', type: 'sd',
    capacity: '64 GB', used: '—', usedPercent: 0,
    status: 'disconnected', mountPath: '—', fileSystem: 'FAT32',
  },
];

export const deviceFilesData: Record<string, FileItem[]> = {
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

export const localTree: FileTreeNode[] = [
  {
    key: 'local:root', title: '本地存储', type: 'local-root', path: '/share',
    children: [
      {
        key: 'local:team', title: '团队文件', type: 'folder', path: '/share/team',
        children: [
          { key: 'local:team/docs', title: '文档', type: 'folder', path: '/share/team/文档', isLeaf: true },
          { key: 'local:team/design', title: '设计', type: 'folder', path: '/share/team/设计', isLeaf: true },
        ],
      },
      {
        key: 'local:shared', title: '共享目录', type: 'folder', path: '/share/shared',
        children: [
          { key: 'local:shared/public', title: '公共资源', type: 'folder', path: '/share/shared/公共资源', isLeaf: true },
          { key: 'local:shared/media', title: '媒体库', type: 'folder', path: '/share/shared/媒体库', isLeaf: true },
        ],
      },
      { key: 'local:personal', title: '个人文件', type: 'folder', path: '/share/personal', isLeaf: true },
    ],
  },
];

export function buildDeviceTree(device: ExternalDevice): FileTreeNode[] {
  if (!device) return [];
  const nodeType = device.status === 'disconnected' ? 'device-disconnected' : `device-${device.type}`;
  const children: FileTreeNode[] = [];

  if (device.id === 'usb-1') {
    children.push(
      { key: 'usb-1:documents', title: '文档', type: 'folder', path: '/mnt/usb0/文档', children: [
        { key: 'usb-1:docs/work', title: '工作资料', type: 'folder', path: '/mnt/usb0/文档/工作资料', isLeaf: true },
        { key: 'usb-1:docs/personal', title: '个人资料', type: 'folder', path: '/mnt/usb0/文档/个人资料', isLeaf: true },
      ]},
      { key: 'usb-1:photos', title: '照片', type: 'folder', path: '/mnt/usb0/照片', isLeaf: true },
      { key: 'usb-1:videos', title: '视频', type: 'folder', path: '/mnt/usb0/视频', isLeaf: true },
      { key: 'usb-1:music', title: '音乐', type: 'folder', path: '/mnt/usb0/音乐', isLeaf: true },
    );
  } else if (device.id === 'hdd-1') {
    children.push(
      { key: 'hdd-1:backup', title: '备份', type: 'folder', path: '/mnt/usb1/备份', children: [
        { key: 'hdd-1:backup/2024', title: '2024', type: 'folder', path: '/mnt/usb1/备份/2024', isLeaf: true },
        { key: 'hdd-1:backup/2025', title: '2025', type: 'folder', path: '/mnt/usb1/备份/2025', isLeaf: true },
      ]},
      { key: 'hdd-1:movies', title: '电影', type: 'folder', path: '/mnt/usb1/电影', isLeaf: true },
      { key: 'hdd-1:games', title: '游戏', type: 'folder', path: '/mnt/usb1/游戏', isLeaf: true },
    );
  } else if (device.id === 'ssd-1') {
    children.push(
      { key: 'ssd-1:projects', title: '项目', type: 'folder', path: '/mnt/usb2/项目', children: [
        { key: 'ssd-1:projects/web', title: '前端项目', type: 'folder', path: '/mnt/usb2/项目/前端项目', isLeaf: true },
        { key: 'ssd-1:projects/app', title: 'App项目', type: 'folder', path: '/mnt/usb2/项目/App项目', isLeaf: true },
      ]},
      { key: 'ssd-1:design', title: '设计稿', type: 'folder', path: '/mnt/usb2/设计稿', isLeaf: true },
    );
  }

  return [{ key: 'root', title: device.name, type: nodeType, path: device.mountPath, children }];
}

export const localFiles: Record<string, FileItem[]> = {
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
import type { FileTreeNode } from '#/components/FileExplorer';
import type { SharedDir } from '../types';

/* ─── 目录树数据（用于创建分享时选择源文件夹）─── */
export const myFilesTreeData: FileTreeNode[] = [
  {
    key: 'space-1',
    title: '存储空间1',
    type: 'space',
    children: [
      {
        key: 'space-1/docs',
        title: '文档',
        type: 'folder',
        children: [
          {
            key: 'space-1/docs/2024',
            title: '2024年度',
            type: 'folder',
            children: [
              { key: 'space-1/docs/2024/q1', title: '第一季度', type: 'folder', isLeaf: true },
              { key: 'space-1/docs/2024/q2', title: '第二季度', type: 'folder', isLeaf: true },
            ],
          },
          { key: 'space-1/docs/archive', title: '历史归档', type: 'folder', isLeaf: true },
        ],
      },
      { key: 'space-1/images', title: '图片', type: 'folder', isLeaf: true },
      { key: 'space-1/videos', title: '视频', type: 'folder', isLeaf: true },
    ],
  },
  {
    key: 'space-2',
    title: '存储空间2',
    type: 'space',
    children: [
      { key: 'space-2/backup', title: '备份', type: 'folder', isLeaf: true },
      { key: 'space-2/download', title: '下载', type: 'folder', isLeaf: true },
    ],
  },
];

/* ─── 共享目录 mock 数据 ─── */
export const initialShareDirs: SharedDir[] = [
  {
    id: 'sd-1',
    name: 'test',
    sourcePath: '存储空间1 / 我的文件 / test',
    shareUsers: [
      { user: 'zhangsan', permission: 'readonly' },
      { user: 'lisi', permission: 'readwrite' },
    ],
    shareTime: '2024-05-06 10:30:00',
    expireTime: '2024-06-06 10:30:00',
    status: 'active',
    linkEnabled: true,
    linkUrl: 'https://d.vivibit.com/s/abc123',
    linkAccessCount: 128,
    linkStatus: 'active',
  },
  {
    id: 'sd-2',
    name: 'test4',
    sourcePath: '存储空间1 / 我的文件 / test4',
    shareUsers: [{ user: 'wangwu', permission: 'readonly' }],
    shareTime: '2024-05-05 14:20:00',
    expireTime: '永久',
    status: 'active',
    linkEnabled: false,
    linkUrl: '',
    linkAccessCount: 0,
    linkStatus: 'expired',
  },
  {
    id: 'sd-3',
    name: '项目资料',
    sourcePath: '存储空间2 / 团队文件 / 项目资料',
    shareUsers: [
      { user: 'zhangsan', permission: 'readwrite' },
      { user: 'lisi', permission: 'readonly' },
      { user: 'wangwu', permission: 'readonly' },
    ],
    shareTime: '2024-04-20 09:15:00',
    expireTime: '2024-05-20 09:15:00',
    status: 'expired',
    linkEnabled: true,
    linkUrl: 'https://d.vivibit.com/s/ghi789',
    linkAccessCount: 32,
    linkStatus: 'expired',
  },
  {
    id: 'sd-4',
    name: '设计资源',
    sourcePath: '存储空间1 / 图片 / 设计资源',
    shareUsers: [{ user: 'admin', permission: 'readwrite' }],
    shareTime: '2024-05-08 11:00:00',
    expireTime: '2024-08-08 11:00:00',
    status: 'active',
    linkEnabled: true,
    linkUrl: 'https://d.vivibit.com/s/def456',
    linkAccessCount: 56,
    linkStatus: 'active',
  },
  {
    id: 'sd-5',
    name: 'Q2 报表',
    sourcePath: '存储空间2 / 备份 / Q2 报表',
    shareUsers: [
      { user: 'zhangsan', permission: 'readonly' },
      { user: 'wangwu', permission: 'readwrite' },
    ],
    shareTime: '2024-05-01 09:00:00',
    expireTime: '永久',
    status: 'active',
    linkEnabled: true,
    linkUrl: 'https://d.vivibit.com/s/jkl012',
    linkAccessCount: 89,
    linkStatus: 'active',
  },
];

/* ─── 用户选项 ─── */
export const userOptions = [
  { label: 'zhangsan', value: 'zhangsan' },
  { label: 'lisi', value: 'lisi' },
  { label: 'wangwu', value: 'wangwu' },
  { label: 'admin', value: 'admin' },
];

/* ─── 从树构建路径 ─── */
export function buildPathFromTree(nodes: FileTreeNode[], targetKey: string): string {
  for (const node of nodes) {
    if (node.key === targetKey) return node.title;
    if (node.children) {
      const childPath = buildPathFromTree(node.children, targetKey);
      if (childPath) return `${node.title} / ${childPath}`;
    }
  }
  return '';
}
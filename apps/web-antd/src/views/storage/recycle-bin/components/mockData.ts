import type { FileItem, FileTreeNode } from '#/components/FileExplorer';

// ─── Mock 树数据：仅存储空间 + 团队文件 ───
export const mockRecycleTree: FileTreeNode[] = [
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
          { key: 'space-1/docs', title: '文档', type: 'folder', path: '/share/space1/文档', businessId: 'space-1', isLeaf: true },
          { key: 'space-1/images', title: '图片', type: 'folder', path: '/share/space1/图片', businessId: 'space-1', isLeaf: true },
          { key: 'space-1/videos', title: '视频', type: 'folder', path: '/share/space1/视频', businessId: 'space-1', isLeaf: true },
        ],
      },
      {
        key: 'space-2',
        title: '存储空间2',
        type: 'space',
        path: '/share/space2',
        businessId: 'space-2',
        children: [
          { key: 'space-2/backup', title: '备份', type: 'folder', path: '/share/space2/备份', businessId: 'space-2', isLeaf: true },
          { key: 'space-2/logs', title: '日志', type: 'folder', path: '/share/space2/日志', businessId: 'space-2', isLeaf: true },
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
          { key: 'tf-1/project', title: '项目文档', type: 'subfolder', path: '/share/team/文档/项目文档', businessId: 'tf-1', isLeaf: true },
          { key: 'tf-1/meeting', title: '会议纪要', type: 'subfolder', path: '/share/team/文档/会议纪要', businessId: 'tf-1', isLeaf: true },
        ],
      },
      {
        key: 'tf-2',
        title: '设计资源',
        type: 'team-folder',
        path: '/share/team/设计资源',
        businessId: 'tf-2',
        children: [
          { key: 'tf-2/ui', title: 'UI 设计', type: 'subfolder', path: '/share/team/设计资源/UI', businessId: 'tf-2', isLeaf: true },
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
export const mockRecycleFiles: Record<string, FileItem[]> = {
  'space-1': [
    { id: 'r-s1-1', name: '旧项目文档.docx', type: 'file', size: '2.5 MB', modifyTime: '2024-05-01 10:00:00', extension: 'docx', deletedTime: '2024-05-08 14:30:00', originalPath: '/share/space1/文档' },
    { id: 'r-s1-2', name: '临时截图.png', type: 'file', size: '3.2 MB', modifyTime: '2024-04-28 16:00:00', extension: 'png', deletedTime: '2024-05-07 09:15:00', originalPath: '/share/space1/图片' },
    { id: 'r-s1-3', name: '测试文件夹', type: 'folder', size: '--', modifyTime: '2024-04-20 08:00:00', deletedTime: '2024-05-06 11:00:00', originalPath: '/share/space1' },
  ],
  'space-1/docs': [
    { id: 'r-s1d-1', name: '废弃规范.docx', type: 'file', size: '856 KB', modifyTime: '2024-03-15 10:00:00', extension: 'docx', deletedTime: '2024-05-08 16:20:00', originalPath: '/share/space1/文档' },
  ],
  'space-2': [
    { id: 'r-s2-1', name: 'db-backup-2023.sql', type: 'file', size: '1.8 GB', modifyTime: '2023-12-31 23:00:00', extension: 'sql', deletedTime: '2024-05-05 03:00:00', originalPath: '/share/space2/备份' },
  ],
  'tf-1': [
    { id: 'r-t1-1', name: '旧需求文档.docx', type: 'file', size: '1.2 MB', modifyTime: '2024-02-10 14:00:00', extension: 'docx', deletedTime: '2024-05-08 10:00:00', originalPath: '/share/team/文档' },
    { id: 'r-t1-2', name: '流程图v1.png', type: 'file', size: '2.3 MB', modifyTime: '2024-01-20 09:00:00', extension: 'png', deletedTime: '2024-05-07 15:30:00', originalPath: '/share/team/文档' },
  ],
  'tf-1/project': [
    { id: 'r-t1p-1', name: 'PRD_草稿.docx', type: 'file', size: '980 KB', modifyTime: '2024-03-01 11:00:00', extension: 'docx', deletedTime: '2024-05-06 09:00:00', originalPath: '/share/team/文档/项目文档' },
  ],
  'tf-2': [
    { id: 'r-t2-1', name: 'logo-old.svg', type: 'file', size: '12 KB', modifyTime: '2023-06-15 10:00:00', extension: 'svg', deletedTime: '2024-05-08 08:00:00', originalPath: '/share/team/设计资源' },
  ],
};
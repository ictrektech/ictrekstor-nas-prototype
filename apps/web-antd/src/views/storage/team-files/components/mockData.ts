import type { FileTreeNode, FileItem } from '#/components/FileExplorer';

/* ─── Mock 树数据 ─── */
export const mockTree: FileTreeNode[] = [
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
      { key: 'tf-2/brand', title: '品牌素材', type: 'subfolder', path: '/share/team/设计资源/品牌', businessId: 'tf-2', isLeaf: true },
    ],
  },
  {
    key: 'tf-3',
    title: '财务资料',
    type: 'team-folder',
    path: '/share/team/财务资料',
    businessId: 'tf-3',
    children: [
      { key: 'tf-3/2024', title: '2024 年报', type: 'subfolder', path: '/share/team/财务资料/2024', businessId: 'tf-3', isLeaf: true },
      { key: 'tf-3/tax', title: '税务资料', type: 'subfolder', path: '/share/team/财务资料/税务', businessId: 'tf-3', isLeaf: true },
    ],
  },
];

/* ─── Mock 文件数据 ─── */
export const mockFiles: Record<string, FileItem[]> = {
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
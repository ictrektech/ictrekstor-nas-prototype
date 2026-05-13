<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { message, Modal } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import {
  FileTreePanel,
  FileManagerPanel,
} from '#/components/FileExplorer';
import type { FileTreeNode, FileItem } from '#/components/FileExplorer';
import { findParentKeys, findNodeInTree } from '#/components/FileExplorer';
import { ShareConfigModal } from '#/components/ShareConfigModal';
import type { ShareFormData } from '#/components/ShareConfigModal';
import RenameModal from '#/components/common/RenameModal.vue';
import FilePageHeader from './components/FilePageHeader.vue';
import TargetDirModal from './components/TargetDirModal.vue';
import NewFolderModal from './components/NewFolderModal.vue';

// ─── 页面级扩展类型 ───
interface MyFileItem extends FileItem {
  isShared?: boolean;
}

// ─── Mock 树数据 ───
const mockTree: FileTreeNode[] = [
  {
    key: 'space-1',
    title: '存储空间1',
    type: 'space',
    path: '/spaces/space-1',
    children: [
      {
        key: 'space-1/docs',
        title: '文档',
        type: 'folder',
        path: '/spaces/space-1/文档',
        children: [
          {
            key: 'space-1/docs/2024',
            title: '2024年度',
            type: 'folder',
            path: '/spaces/space-1/文档/2024年度',
            children: [
              {
                key: 'space-1/docs/2024/q1',
                title: '第一季度',
                type: 'folder',
                path: '/spaces/space-1/文档/2024年度/第一季度',
                children: [
                  {
                    key: 'space-1/docs/2024/q1/reports',
                    title: '部门报告',
                    type: 'folder',
                    path: '/spaces/space-1/文档/2024年度/第一季度/部门报告',
                    children: [
                      {
                        key: 'space-1/docs/2024/q1/reports/finance',
                        title: '财务报表',
                        type: 'folder',
                        path: '/spaces/space-1/文档/2024年度/第一季度/部门报告/财务报表',
                        isLeaf: true,
                      },
                      {
                        key: 'space-1/docs/2024/q1/reports/marketing',
                        title: '市场分析',
                        type: 'folder',
                        path: '/spaces/space-1/文档/2024年度/第一季度/部门报告/市场分析',
                        isLeaf: true,
                      },
                    ],
                  },
                  {
                    key: 'space-1/docs/2024/q1/plans',
                    title: '计划书',
                    type: 'folder',
                    path: '/spaces/space-1/文档/2024年度/第一季度/计划书',
                    isLeaf: true,
                  },
                ],
              },
              {
                key: 'space-1/docs/2024/q2',
                title: '第二季度',
                type: 'folder',
                path: '/spaces/space-1/文档/2024年度/第二季度',
                isLeaf: true,
              },
            ],
          },
          {
            key: 'space-1/docs/archive',
            title: '历史归档',
            type: 'folder',
            path: '/spaces/space-1/文档/历史归档',
            children: [
              {
                key: 'space-1/docs/archive/2023',
                title: '2023年度',
                type: 'folder',
                path: '/spaces/space-1/文档/历史归档/2023年度',
                isLeaf: true,
              },
              {
                key: 'space-1/docs/archive/2022',
                title: '2022年度',
                type: 'folder',
                path: '/spaces/space-1/文档/历史归档/2022年度',
                isLeaf: true,
              },
            ],
          },
        ],
      },
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
];

// ─── Mock 文件数据 ───
const mockFiles: Record<string, MyFileItem[]> = {
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
  'space-1/docs/2024': [
    { id: 'd24-1', name: '第一季度', type: 'folder', size: '--', modifyTime: '2024-01-15 09:00:00' },
    { id: 'd24-2', name: '第二季度', type: 'folder', size: '--', modifyTime: '2024-04-01 09:00:00' },
    { id: 'd24-f1', name: '年度总结.pdf', type: 'file', size: '3.5 MB', modifyTime: '2024-12-31 17:00:00', extension: 'pdf' },
  ],
  'space-1/docs/2024/q1': [
    { id: 'dq1-1', name: '部门报告', type: 'folder', size: '--', modifyTime: '2024-01-20 10:00:00' },
    { id: 'dq1-2', name: '计划书', type: 'folder', size: '--', modifyTime: '2024-01-10 09:00:00' },
    { id: 'dq1-f1', name: 'Q1总览.pptx', type: 'file', size: '12 MB', modifyTime: '2024-03-31 18:00:00', extension: 'pptx' },
  ],
  'space-1/docs/2024/q1/reports': [
    { id: 'dr1', name: '财务报表', type: 'folder', size: '--', modifyTime: '2024-01-25 10:00:00' },
    { id: 'dr2', name: '市场分析', type: 'folder', size: '--', modifyTime: '2024-02-01 09:00:00' },
  ],
  'space-1/docs/2024/q1/reports/finance': [
    { id: 'df1', name: '利润表.xlsx', type: 'file', size: '450 KB', modifyTime: '2024-01-28 10:00:00', extension: 'xlsx' },
    { id: 'df2', name: '资产负债表.xlsx', type: 'file', size: '380 KB', modifyTime: '2024-01-28 10:30:00', extension: 'xlsx' },
    { id: 'df3', name: '现金流量表.xlsx', type: 'file', size: '320 KB', modifyTime: '2024-01-29 09:00:00', extension: 'xlsx' },
    { id: 'df4', name: '财务分析报告.pdf', type: 'file', size: '2.8 MB', modifyTime: '2024-02-05 14:00:00', extension: 'pdf' },
  ],
  'space-1/docs/2024/q1/reports/marketing': [
    { id: 'dm1', name: '市场调研.docx', type: 'file', size: '2.1 MB', modifyTime: '2024-02-10 10:00:00', extension: 'docx' },
    { id: 'dm2', name: '竞品分析.xlsx', type: 'file', size: '890 KB', modifyTime: '2024-02-12 14:30:00', extension: 'xlsx' },
    { id: 'dm3', name: '用户画像.pptx', type: 'file', size: '8.5 MB', modifyTime: '2024-02-15 09:00:00', extension: 'pptx' },
  ],
  'space-1/docs/2024/q1/plans': [
    { id: 'dp1', name: '产品路线图.mmd', type: 'file', size: '45 KB', modifyTime: '2024-01-12 10:00:00', extension: 'mmd' },
    { id: 'dp2', name: 'OKR规划.xlsx', type: 'file', size: '120 KB', modifyTime: '2024-01-15 09:00:00', extension: 'xlsx' },
    { id: 'dp3', name: '资源分配表.xlsx', type: 'file', size: '95 KB', modifyTime: '2024-01-18 11:00:00', extension: 'xlsx' },
  ],
  'space-1/docs/2024/q2': [
    { id: 'dq2-f1', name: 'Q2总览.pptx', type: 'file', size: '15 MB', modifyTime: '2024-06-30 18:00:00', extension: 'pptx' },
    { id: 'dq2-f2', name: '中期复盘.md', type: 'file', size: '28 KB', modifyTime: '2024-06-28 17:00:00', extension: 'md' },
  ],
  'space-1/docs/archive': [
    { id: 'da-1', name: '2023年度', type: 'folder', size: '--', modifyTime: '2023-12-31 23:59:00' },
    { id: 'da-2', name: '2022年度', type: 'folder', size: '--', modifyTime: '2022-12-31 23:59:00' },
    { id: 'da-f1', name: '归档说明.txt', type: 'file', size: '2 KB', modifyTime: '2024-01-01 09:00:00', extension: 'txt' },
  ],
  'space-1/docs/archive/2023': [
    { id: 'd23-f1', name: '2023年报.pdf', type: 'file', size: '8.5 MB', modifyTime: '2023-12-31 17:00:00', extension: 'pdf' },
    { id: 'd23-f2', name: '2023OKR.xlsx', type: 'file', size: '200 KB', modifyTime: '2023-12-30 10:00:00', extension: 'xlsx' },
  ],
  'space-1/docs/archive/2022': [
    { id: 'd22-f1', name: '2022年报.pdf', type: 'file', size: '7.2 MB', modifyTime: '2022-12-31 17:00:00', extension: 'pdf' },
    { id: 'd22-f2', name: '组织架构图.png', type: 'file', size: '1.8 MB', modifyTime: '2022-06-15 14:00:00', extension: 'png' },
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
};

// ─── 状态 ───
const treeData = ref<FileTreeNode[]>(mockTree);
const selectedKeys = ref<string[]>(['space-1']);
const expandedKeys = ref<string[]>(['space-1']);
const loading = ref(false);
const searchText = ref('');
const viewMode = ref<'list' | 'grid'>('list');
const currentFiles = ref<MyFileItem[]>([]);
const selectedFileIds = ref<string[]>([]);

// 重命名（复用全局组件）
const renameModalVisible = ref(false);
const renameFileName = ref('');
const editingFile = ref<MyFileItem | null>(null);

// 目标目录选择弹窗（复制/移动共用）
const targetDirModalVisible = ref(false);
const targetDirModalTitle = ref('选择目标目录');
const targetDirAction = ref<'copy' | 'move'>('copy');
const targetDirSelectedKeys = ref<string[]>([]);
const targetDirExpandedKeys = ref<string[]>([]);
const targetDirPendingFiles = ref<MyFileItem[]>([]);

// 共享设置
const shareModalVisible = ref(false);

// 新建文件夹
const newFolderModalVisible = ref(false);

// 上传
const uploadInputRef = ref<HTMLInputElement | null>(null);

// 用户选项
const userOptions = [
  { label: 'zhangsan', value: 'zhangsan' },
  { label: 'lisi', value: 'lisi' },
  { label: 'wangwu', value: 'wangwu' },
  { label: 'admin', value: 'admin' },
];

// 目标目录树数据
const targetDirTreeData = computed<FileTreeNode[]>(() => {
  const myFilesNodes = mockTree.map((n) => ({ ...n }));
  const publicFilesNodes: FileTreeNode[] = [
    {
      key: 'pub-docs',
      title: '公共文档',
      type: 'public-folder',
      children: [
        { key: 'pub-docs/制度', title: '公司制度', type: 'folder', isLeaf: true },
        { key: 'pub-docs/流程', title: '工作流程', type: 'folder', isLeaf: true },
      ],
    },
    {
      key: 'pub-design',
      title: '设计资源',
      type: 'public-folder',
      children: [
        { key: 'pub-design/素材', title: '通用素材', type: 'folder', isLeaf: true },
      ],
    },
    {
      key: 'pub-finance',
      title: '财务公开',
      type: 'public-folder',
      isLeaf: true,
    },
  ];
  const sharedFromOthersNodes: FileTreeNode[] = [
    {
      key: 'zs-share',
      title: '张三',
      type: 'shared-user',
      children: [
        { key: 'zs-share1', title: '项目资料', type: 'shared-folder', isLeaf: true },
        { key: 'zs-share2', title: '参考资料', type: 'shared-folder', isLeaf: true },
      ],
    },
    {
      key: 'ls-share',
      title: '李四',
      type: 'shared-user',
      children: [
        { key: 'ls-share1', title: '技术文档', type: 'shared-folder', isLeaf: true },
        { key: 'ls-share2', title: '培训视频', type: 'shared-folder', isLeaf: true },
      ],
    },
    {
      key: 'ww-share',
      title: '王五',
      type: 'shared-user',
      children: [
        { key: 'ww-share1', title: '会议录音', type: 'shared-folder', isLeaf: true },
      ],
    },
  ];
  return [
    { key: 'root-my-files', title: '我的文件', type: 'category', children: myFilesNodes },
    { key: 'root-public', title: '公共文件', type: 'category', children: publicFilesNodes },
    { key: 'root-shared', title: '他人分享', type: 'category', children: sharedFromOthersNodes },
  ];
});

// ─── 计算属性 ───
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
        const res = findPath(node.children, target, [...current, { title: node.title, key: node.key }]);
        if (res) return true;
      }
    }
    return false;
  }
  findPath(treeData.value, key, []);
  return parts;
});

const overviewStats = computed(() => {
  const spaces = treeData.value.length;
  const folders = treeData.value.reduce((sum, s) => sum + (s.children?.length || 0), 0);
  let fileCount = 0;
  Object.values(mockFiles).forEach((list) => {
    list.forEach((f) => {
      if (f.type === 'file') fileCount++;
    });
  });
  return { spaces, folders, files: fileCount };
});

const isTrash = computed(() => selectedKeys.value[0] === 'trash');

// ─── 方法 ───
function loadFiles(key: string) {
  loading.value = true;
  setTimeout(() => {
    const direct = mockFiles[key];
    if (direct) {
      currentFiles.value = direct;
    } else {
      const node = findNodeInTree(treeData.value, key);
      if (node?.children) {
        currentFiles.value = node.children.map((child) => ({
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

function handleDownload(file: MyFileItem) {
  message.success(`开始下载：${file.name}`);
}

function openRenameModal(file: MyFileItem) {
  editingFile.value = file;
  renameFileName.value = file.name;
  renameModalVisible.value = true;
}

function handleRename(newName: string) {
  if (editingFile.value) {
    editingFile.value.name = newName;
    message.success('重命名成功');
  }
  renameModalVisible.value = false;
}

function handleDeleteFile(file: MyFileItem) {
  message.success(`"${file.name}" 已删除`);
  currentFiles.value = currentFiles.value.filter((f) => f.id !== file.id);
  selectedFileIds.value = selectedFileIds.value.filter((id) => id !== file.id);
}

function handleBatchDelete(files: MyFileItem[]) {
  const names = files.map((f) => f.name).join('、');
  message.success(`已删除 ${files.length} 个文件：${names}`);
  const idsToRemove = new Set(files.map((f) => f.id));
  currentFiles.value = currentFiles.value.filter((f) => !idsToRemove.has(f.id));
  selectedFileIds.value = [];
}

function openShareModal(file: MyFileItem) {
  editingFile.value = file;
  shareModalVisible.value = true;
}

function handleSaveShare(data: ShareFormData) {
  if (!editingFile.value) return;
  editingFile.value.isShared = true;
  const names = data.shareUsers.map((u) => u.user).join('、') || '无';
  const permissions = data.shareUsers.map((u) => (u.permission === 'readonly' ? '只读' : '读写'));
  const permText =
    permissions.length > 0 ? (new Set(permissions).size === 1 ? permissions[0] : permissions.join('、')) : '只读';
  message.success(`已将「${editingFile.value.name}」分享给 ${names}，权限：${permText}`);
  shareModalVisible.value = false;
}

// 复制/移动：目标目录弹窗
function openTargetDirModal(action: 'copy' | 'move', files: MyFileItem[]) {
  targetDirAction.value = action;
  targetDirModalTitle.value = action === 'copy' ? '复制到' : '移动到';
  targetDirPendingFiles.value = files;
  targetDirSelectedKeys.value = [];
  targetDirExpandedKeys.value = ['root-my-files'];
  targetDirModalVisible.value = true;
}

function handleCopyFile(file: MyFileItem) {
  openTargetDirModal('copy', [file]);
}

function handleMoveFile(file: MyFileItem) {
  openTargetDirModal('move', [file]);
}

function handleBatchCopy(files: MyFileItem[]) {
  openTargetDirModal('copy', files);
}

function handleBatchMove(files: MyFileItem[]) {
  openTargetDirModal('move', files);
}

function handleTargetDirConfirm() {
  const targetKey = targetDirSelectedKeys.value[0];
  if (!targetKey) {
    message.warning('请选择目标目录');
    return;
  }
  const action = targetDirAction.value;
  const files = targetDirPendingFiles.value;
  const names = files.map((f) => f.name).join('、');
  const targetNode = findNodeInTree(targetDirTreeData.value, targetKey);
  const targetName = targetNode?.title || targetKey;

  if (action === 'copy') {
    message.success(`已将 ${files.length} 个文件复制到「${targetName}」：${names}`);
  } else {
    message.success(`已将 ${files.length} 个文件移动到「${targetName}」：${names}`);
    const idsToRemove = new Set(files.map((f) => f.id));
    currentFiles.value = currentFiles.value.filter((f) => !idsToRemove.has(f.id));
    selectedFileIds.value = [];
  }
  targetDirModalVisible.value = false;
}

// 新建文件夹
function handleCreateFolder(name: string) {
  if (!name) {
    message.warning('请输入文件夹名称');
    return;
  }
  const newFolder: MyFileItem = {
    id: `folder-${Date.now()}`,
    name,
    type: 'folder',
    size: '--',
    modifyTime: new Date()
      .toLocaleString('zh-CN', { hour12: false })
      .replace(/\//g, '-'),
  };
  currentFiles.value.unshift(newFolder);
  message.success(`文件夹「${name}」创建成功`);
}

// 上传
function handleUploadClick() {
  uploadInputRef.value?.click();
}

function handleFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = input.files;
  if (!files || files.length === 0) return;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const sizeStr =
      file.size > 1024 * 1024
        ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
        : `${(file.size / 1024).toFixed(1)} KB`;
    const ext = file.name.split('.').pop() || '';

    const newFile: MyFileItem = {
      id: `upload-${Date.now()}-${i}`,
      name: file.name,
      type: 'file',
      size: sizeStr,
      modifyTime: new Date()
        .toLocaleString('zh-CN', { hour12: false })
        .replace(/\//g, '-'),
      extension: ext,
    };
    currentFiles.value.unshift(newFile);
  }

  message.success(`已上传 ${files.length} 个文件`);
  input.value = '';
}

// 树节点图标
function nodeIconResolver(node: FileTreeNode) {
  switch (node.type) {
    case 'category':
      if (node.key === 'spaces') return { icon: 'lucide:database', color: '#1677ff' };
      if (node.key === 'team') return { icon: 'lucide:users', color: '#fa8c16' };
      if (node.key === 'shared-from-others') return { icon: 'lucide:share-2', color: '#722ed1' };
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
  loadFiles('space-1');
});
</script>

<template>
  <div class="file-manager-page">
    <!-- 页面顶部概览 -->
    <FilePageHeader :spaces="overviewStats.spaces" />

    <!-- 主体区域 -->
    <div class="fm-body">
      <FileTreePanel
        :tree-data="treeData"
        v-model:selected-keys="selectedKeys"
        v-model:expanded-keys="expandedKeys"
        :node-icon-resolver="nodeIconResolver"
        @select="onSelectTree"
      />
      <FileManagerPanel
        :files="currentFiles"
        :breadcrumb-path="breadcrumbPath"
        :loading="loading"
        v-model:search-text="searchText"
        v-model:view-mode="viewMode"
        v-model:selected-file-ids="selectedFileIds"
        :show-new-folder="!isTrash"
        :empty-description="isTrash ? '回收站为空' : '暂无文件'"
        @breadcrumb-click="onBreadcrumbClick"
        @refresh="refresh"
        @open-folder="handleOpenFolder"
        @rename="openRenameModal"
        @delete-file="handleDeleteFile"
        @batch-delete="handleBatchDelete"
        @share="openShareModal"
        @copy="handleCopyFile"
        @move="handleMoveFile"
        @batch-copy="handleBatchCopy"
        @batch-move="handleBatchMove"
        @new-folder="newFolderModalVisible = true"
        @upload="handleUploadClick"
      />
    </div>

    <!-- 重命名弹窗（复用全局组件） -->
    <RenameModal
      v-model:visible="renameModalVisible"
      :name="renameFileName"
      @confirm="handleRename"
    />

    <!-- 分享弹窗 -->
    <ShareConfigModal
      v-model:visible="shareModalVisible"
      :title="`分享 - ${editingFile?.name || ''}`"
      :folder-name="editingFile?.name || ''"
      confirm-text="确认分享"
      :user-options="userOptions"
      @ok="handleSaveShare"
    />

    <!-- 目标目录选择弹窗 -->
    <TargetDirModal
      v-model:visible="targetDirModalVisible"
      :title="targetDirModalTitle"
      :tree-data="targetDirTreeData"
      v-model:selected-keys="targetDirSelectedKeys"
      v-model:expanded-keys="targetDirExpandedKeys"
      :pending-files="targetDirPendingFiles"
      :action="targetDirAction"
      @confirm="handleTargetDirConfirm"
    />

    <!-- 新建文件夹弹窗 -->
    <NewFolderModal
      v-model:visible="newFolderModalVisible"
      @confirm="handleCreateFolder"
    />

    <!-- 隐藏的文件上传 input -->
    <input
      ref="uploadInputRef"
      type="file"
      multiple
      style="display: none;"
      @change="handleFileSelected"
    />
  </div>
</template>

<style scoped>
.file-manager-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f5f5f5;
}

.fm-body {
  display: flex;
  flex: 1;
  overflow: hidden;
  padding: 12px;
  gap: 12px;
}

/* 响应式 */
@media (max-width: 768px) {
  .fm-body {
    flex-direction: column;
  }
}
</style>
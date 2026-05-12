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
  Tree,
  DatePicker,
  Select,
  Divider,
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
// 直接展示存储空间，去除顶层"存储空间级别"
// 增加大深度目录结构用于测试路径滚动效果
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
  // 深层目录 mock 数据
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
const selectedKeys = ref<string[]>(['space-1']);
const expandedKeys = ref<string[]>(['space-1']);
const loading = ref(false);
const searchText = ref('');
const viewMode = ref<'list' | 'grid'>('list');
const currentFiles = ref<MyFileItem[]>([]);
const selectedFileIds = ref<string[]>([]);

// 重命名
const renameModalVisible = ref(false);
const renameFormRef = ref();
const renameForm = ref({ name: '' });
const editingFile = ref<MyFileItem | null>(null);

// 移动到
const moveModalVisible = ref(false);
const moveTarget = ref('');

// ═══ 新建文件夹 ═══
const newFolderModalVisible = ref(false);
const newFolderFormRef = ref();
const newFolderForm = ref({ name: '' });

// ═══ 上传文件 ═══
const uploadInputRef = ref<HTMLInputElement | null>(null);

// ═══ 目标目录选择弹窗（复制/移动共用）═══
const targetDirModalVisible = ref(false);
const targetDirModalTitle = ref('选择目标目录');
const targetDirAction = ref<'copy' | 'move'>('copy');
const targetDirSelectedKeys = ref<string[]>([]);
const targetDirExpandedKeys = ref<string[]>([]);
const targetDirPendingFiles = ref<MyFileItem[]>([]);

// 统一的目标目录树数据（我的文件 + 公共文件 + 他人分享）
const targetDirTreeData = computed<FileTreeNode[]>(() => {
  // 复用 mockTree（我的文件）作为基础，添加顶层分类
  const myFilesNodes = mockTree.map(n => ({ ...n }));
  // 公共文件 mock 数据
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
  // 他人分享 mock 数据
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
    {
      key: 'root-my-files',
      title: '我的文件',
      type: 'category',
      children: myFilesNodes,
    },
    {
      key: 'root-public',
      title: '公共文件',
      type: 'category',
      children: publicFilesNodes,
    },
    {
      key: 'root-shared',
      title: '他人分享',
      type: 'category',
      children: sharedFromOthersNodes,
    },
  ];
});

// 目标目录树节点图标解析
function targetDirIconResolver(node: FileTreeNode) {
  switch (node.type) {
    case 'category':
      if (node.key === 'root-my-files') return { icon: 'lucide:user', color: '#1677ff' };
      if (node.key === 'root-public') return { icon: 'lucide:folder-heart', color: '#fa8c16' };
      if (node.key === 'root-shared') return { icon: 'lucide:share-2', color: '#722ed1' };
      return { icon: 'lucide:folder-kanban', color: '#595959' };
    case 'space':
      return { icon: 'lucide:hard-drive', color: '#1677ff' };
    case 'public-folder':
      return { icon: 'lucide:folder-heart', color: '#fa8c16' };
    case 'shared-user':
      return { icon: 'lucide:user-circle', color: '#722ed1' };
    case 'shared-folder':
      return { icon: 'lucide:folder-symlink', color: '#a855f7' };
    case 'folder':
    case 'subfolder':
      return { icon: 'lucide:folder-open', color: '#faad14' };
    default:
      return { icon: 'lucide:folder', color: '#faad14' };
  }
}

// 用户选项（MOCK）
const userOptions = [
  { label: 'zhangsan', value: 'zhangsan' },
  { label: 'lisi', value: 'lisi' },
  { label: 'wangwu', value: 'wangwu' },
  { label: 'admin', value: 'admin' },
];

// 共享设置（入口一：选中文件夹后分享）
const shareModalVisible = ref(false);
const shareFormRef = ref();
const shareForm = ref({
  // 分享时间
  expireType: 'preset', // 'preset' | 'custom'
  expirePreset: '7',    // 预设天数
  expireCustomDate: '', // 自定义到期日期
  // 共享用户
  shareUsers: [] as string[],
  // 权限
  permission: 'readonly' as 'readonly' | 'readwrite',
  // 外链
  linkEnabled: false,
  linkExpireTime: '7',   // 外链有效期（预设天数）
  linkPassword: '',      // 外链访问密码
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
      // 允许作为移动目标的节点
      if (n.type !== 'shared-user') {
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
  const spaces = treeData.value.length;
  const folders = treeData.value.reduce((sum, s) => sum + (s.children?.length || 0), 0);
  let fileCount = 0;
  Object.values(mockFiles).forEach(list => {
    list.forEach(f => { if (f.type === 'file') fileCount++; });
  });
  return { spaces, folders, files: fileCount };
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
  selectedFileIds.value = selectedFileIds.value.filter(id => id !== file.id);
}

function handleBatchDelete(files: MyFileItem[]) {
  const names = files.map(f => f.name).join('、');
  message.success(`已删除 ${files.length} 个文件：${names}`);
  const idsToRemove = new Set(files.map(f => f.id));
  currentFiles.value = currentFiles.value.filter(f => !idsToRemove.has(f.id));
  selectedFileIds.value = [];
}

function openShareModal(file: MyFileItem) {
  editingFile.value = file;
  shareForm.value = {
    expireType: 'preset',
    expirePreset: '7',
    expireCustomDate: '',
    shareUsers: [],
    permission: 'readonly',
    linkEnabled: false,
    linkExpireTime: '7',
    linkPassword: '',
  };
  shareModalVisible.value = true;
}

function handleSaveShare() {
  if (!editingFile.value) return;
  editingFile.value.isShared = true;
  const names = shareForm.value.shareUsers.join('、') || '无';
  message.success(
    `已将「${editingFile.value.name}」分享给 ${names}，权限：${shareForm.value.permission === 'readonly' ? '只读' : '读写'}`,
  );
  shareModalVisible.value = false;
}

// ═══ 复制 / 移动：目标目录弹窗逻辑 ═══

/** 打开目标目录选择弹窗 */
function openTargetDirModal(action: 'copy' | 'move', files: MyFileItem[]) {
  targetDirAction.value = action;
  targetDirModalTitle.value = action === 'copy' ? '复制到' : '移动到';
  targetDirPendingFiles.value = files;
  targetDirSelectedKeys.value = [];
  targetDirExpandedKeys.value = ['root-my-files'];
  targetDirModalVisible.value = true;
}

/** 处理单文件右键复制/移动 */
function handleCopyFile(file: MyFileItem) {
  openTargetDirModal('copy', [file]);
}

function handleMoveFile(file: MyFileItem) {
  openTargetDirModal('move', [file]);
}

/** 处理批量复制/移动 */
function handleBatchCopy(files: MyFileItem[]) {
  openTargetDirModal('copy', files);
}

function handleBatchMove(files: MyFileItem[]) {
  openTargetDirModal('move', files);
}

/** 目标目录树选择事件 */
function onTargetDirSelect(keys: string[]) {
  targetDirSelectedKeys.value = keys;
}

function onTargetDirExpand(keys: string[]) {
  targetDirExpandedKeys.value = keys;
}

/** 确认复制/移动 */
function handleTargetDirConfirm() {
  const targetKey = targetDirSelectedKeys.value[0];
  if (!targetKey) {
    message.warning('请选择目标目录');
    return;
  }
  const action = targetDirAction.value;
  const files = targetDirPendingFiles.value;
  const names = files.map(f => f.name).join('、');
  const targetNode = findNodeInTree(targetDirTreeData.value, targetKey);
  const targetName = targetNode?.title || targetKey;

  if (action === 'copy') {
    message.success(`已将 ${files.length} 个文件复制到「${targetName}」：${names}`);
  } else {
    message.success(`已将 ${files.length} 个文件移动到「${targetName}」：${names}`);
    // 从当前列表移除（移动时才移除）
    const idsToRemove = new Set(files.map(f => f.id));
    currentFiles.value = currentFiles.value.filter(f => !idsToRemove.has(f.id));
    selectedFileIds.value = [];
  }
  targetDirModalVisible.value = false;
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

// ═══ 新建文件夹 / 上传文件 ═══

function openNewFolderModal() {
  newFolderForm.value = { name: '' };
  newFolderModalVisible.value = true;
}

function handleCreateFolder() {
  newFolderFormRef.value?.validate().then(() => {
    const name = newFolderForm.value.name.trim();
    if (!name) {
      message.warning('请输入文件夹名称');
      return;
    }
    // 模拟创建文件夹：添加到当前文件列表
    const newFolder: MyFileItem = {
      id: `folder-${Date.now()}`,
      name,
      type: 'folder',
      size: '--',
      modifyTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
    };
    currentFiles.value.unshift(newFolder);
    message.success(`文件夹「${name}」创建成功`);
    newFolderModalVisible.value = false;
  }).catch(() => {});
}

function handleUploadClick() {
  uploadInputRef.value?.click();
}

function handleFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = input.files;
  if (!files || files.length === 0) return;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const sizeStr = file.size > 1024 * 1024
      ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
      : `${(file.size / 1024).toFixed(1)} KB`;
    const ext = file.name.split('.').pop() || '';

    const newFile: MyFileItem = {
      id: `upload-${Date.now()}-${i}`,
      name: file.name,
      type: 'file',
      size: sizeStr,
      modifyTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
      extension: ext,
    };
    currentFiles.value.unshift(newFile);
  }

  message.success(`已上传 ${files.length} 个文件`);
  input.value = ''; // 清空以便重复选择同一文件
}

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
        @new-folder="openNewFolderModal"
        @upload="handleUploadClick"
      />
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

    <!-- ═══════ 新建文件夹弹窗 ═══════ -->
    <Modal
      v-model:open="newFolderModalVisible"
      title="新建文件夹"
      width="400px"
      @ok="handleCreateFolder"
    >
      <Form
        ref="newFolderFormRef"
        :model="newFolderForm"
        layout="vertical"
        :rules="{ name: [{ required: true, message: '请输入文件夹名称', trigger: 'blur' }] }"
      >
        <Form.Item label="文件夹名称" name="name">
          <Input v-model:value="newFolderForm.name" placeholder="请输入文件夹名称" />
        </Form.Item>
      </Form>
    </Modal>

    <!-- ═══════ 分享弹窗（入口一：选中文件夹后分享）═══════ -->
    <Modal
      v-model:open="shareModalVisible"
      :title="`分享 - ${editingFile?.name || ''}`"
      width="520px"
      ok-text="确认分享"
      @ok="handleSaveShare"
    >
      <Form
        ref="shareFormRef"
        :model="shareForm"
        layout="vertical"
      >
        <!-- 分享对象 -->
        <Form.Item label="共享用户">
          <Select
            v-model:value="shareForm.shareUsers"
            mode="multiple"
            placeholder="请选择共享用户"
            :options="userOptions"
          />
        </Form.Item>

        <!-- 分享有效期 -->
        <Form.Item label="有效期">
          <div class="share-expire-row">
            <AntRadio.Group v-model:value="shareForm.expireType" style="display: flex; gap: 8px;">
              <AntRadio value="preset">预设</AntRadio>
              <AntRadio value="custom">自定义</AntRadio>
            </AntRadio.Group>
          </div>
          <div v-if="shareForm.expireType === 'preset'" style="margin-top: 8px;">
            <AntRadio.Group v-model:value="shareForm.expirePreset">
              <AntRadio value="1">1天</AntRadio>
              <AntRadio value="7">7天</AntRadio>
              <AntRadio value="30">30天</AntRadio>
              <AntRadio value="0">永久</AntRadio>
            </AntRadio.Group>
          </div>
          <div v-else style="margin-top: 8px;">
            <DatePicker
              v-model:value="shareForm.expireCustomDate"
              placeholder="选择到期日期"
              style="width: 100%;"
            />
          </div>
        </Form.Item>

        <!-- 权限 -->
        <Form.Item label="权限">
          <AntRadio.Group v-model:value="shareForm.permission">
            <AntRadio value="readonly">
              <span class="radio-with-icon">
                <IconifyIcon icon="lucide:eye" style="font-size: 12px; margin-right: 4px;" />
                只读
              </span>
            </AntRadio>
            <AntRadio value="readwrite">
              <span class="radio-with-icon">
                <IconifyIcon icon="lucide:pencil" style="font-size: 12px; margin-right: 4px;" />
                读写
              </span>
            </AntRadio>
          </AntRadio.Group>
        </Form.Item>

        <!-- 外链 -->
        <Form.Item>
          <Checkbox v-model:checked="shareForm.linkEnabled">
            <span style="font-weight: 500;">启用外链分享</span>
          </Checkbox>
        </Form.Item>

        <template v-if="shareForm.linkEnabled">
          <Form.Item label="外链有效期">
            <AntRadio.Group v-model:value="shareForm.linkExpireTime">
              <AntRadio value="1">1天</AntRadio>
              <AntRadio value="7">7天</AntRadio>
              <AntRadio value="30">30天</AntRadio>
              <AntRadio value="0">永久</AntRadio>
            </AntRadio.Group>
          </Form.Item>
          <Form.Item label="外链访问密码（选填）">
            <Input v-model:value="shareForm.linkPassword" placeholder="不设置密码则公开访问" />
          </Form.Item>
        </template>
      </Form>
    </Modal>

    <!-- ═══════ 目标目录选择弹窗（复制/移动共用）═══════ -->
    <Modal
      v-model:open="targetDirModalVisible"
      :title="targetDirModalTitle"
      width="480px"
      @ok="handleTargetDirConfirm"
    >
      <div class="target-dir-tree-wrap">
        <Tree
          :tree-data="targetDirTreeData"
          :selected-keys="targetDirSelectedKeys"
          :expanded-keys="targetDirExpandedKeys"
          :field-names="{ title: 'title', key: 'key', children: 'children' }"
          @update:selected-keys="onTargetDirSelect"
          @update:expanded-keys="onTargetDirExpand"
          class="target-dir-tree"
          :show-line="{ showLeafIcon: false }"
        >
          <template #title="node">
            <span class="tree-node-title">
              <IconifyIcon
                :icon="targetDirIconResolver(node).icon"
                :style="{ fontSize: '14px', color: targetDirIconResolver(node).color, marginRight: '6px', flexShrink: 0 }"
              />
              <span class="tree-node-text" :title="node.title">{{ node.title }}</span>
            </span>
          </template>
        </Tree>
      </div>
      <div v-if="targetDirPendingFiles.length > 0" class="target-dir-pending">
        <span class="target-dir-pending-label">待{{ targetDirAction === 'copy' ? '复制' : '移动' }}文件：</span>
        <span class="target-dir-pending-names">{{ targetDirPendingFiles.map(f => f.name).join('、') }}</span>
      </div>
    </Modal>

    <!-- ═══════ 隐藏的文件上传 input ═══════ -->
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

/* ═══ 分享弹窗 ═══ */
.radio-with-icon {
  display: inline-flex;
  align-items: center;
  font-size: 13px;
}

.share-expire-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ═══ 共享链接 ═══ */
.share-link-row {
  display: flex;
  gap: 8px;
}

.share-link-row :deep(.ant-input) {
  flex: 1;
}

/* ═══ 目标目录选择弹窗样式 ═══ */
.target-dir-tree-wrap {
  max-height: 320px;
  overflow: auto;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  padding: 8px;
}

.target-dir-tree :deep(.ant-tree-treenode) {
  padding: 2px 0;
}

.target-dir-tree :deep(.ant-tree-node-content-wrapper) {
  display: inline-flex;
  align-items: center;
  border-radius: 6px;
  transition: all 0.2s;
  padding: 4px 8px;
}

.target-dir-tree :deep(.ant-tree-node-content-wrapper:hover) {
  background: #f0f5ff;
}

.target-dir-tree :deep(.ant-tree-node-selected .ant-tree-node-content-wrapper) {
  background: #e6f4ff !important;
  color: #1677ff;
  font-weight: 500;
}

.target-dir-tree .tree-node-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  white-space: nowrap;
}

.target-dir-tree .tree-node-text {
  white-space: nowrap;
}

.target-dir-pending {
  margin-top: 12px;
  padding: 8px 12px;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 6px;
  font-size: 13px;
}

.target-dir-pending-label {
  color: #52c41a;
  font-weight: 500;
}

.target-dir-pending-names {
  color: #262626;
}

/* ═══ 响应式 ═══ */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

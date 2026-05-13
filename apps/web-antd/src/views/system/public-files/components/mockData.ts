import type { PublicFolder, PermissionUser } from '../types';

export const initialFolders: PublicFolder[] = [
  {
    id: 'pf-1',
    name: '公司文档',
    path: '/public/docs',
    storagePool: 'Pool-1 (RAID 5)',
    poolId: 'pool-1',
    permissionMode: 'readwrite',
    status: 'active',
    createTime: '2024-01-15 09:30:00',
    userCount: 12,
    usedCapacityGB: 45.2,
    totalCapacityGB: 200,
    description: '公司通用文档资料',
  },
  {
    id: 'pf-2',
    name: '设计资源',
    path: '/public/design',
    storagePool: 'Pool-1 (RAID 5)',
    poolId: 'pool-1',
    permissionMode: 'readwrite',
    status: 'active',
    createTime: '2024-02-20 14:00:00',
    userCount: 8,
    usedCapacityGB: 128.5,
    totalCapacityGB: 500,
    description: 'UI/UX 设计素材、品牌规范',
  },
  {
    id: 'pf-3',
    name: '财务资料',
    path: '/public/finance',
    storagePool: 'Pool-2 (RAID 1)',
    poolId: 'pool-2',
    permissionMode: 'readonly',
    status: 'active',
    createTime: '2024-03-01 10:00:00',
    userCount: 5,
    usedCapacityGB: 12.3,
    totalCapacityGB: 100,
    description: '财务报表、审计资料',
  },
  {
    id: 'pf-4',
    name: '培训资料',
    path: '/public/training',
    storagePool: 'Pool-2 (RAID 1)',
    poolId: 'pool-2',
    permissionMode: 'readwrite',
    status: 'active',
    createTime: '2024-03-15 11:30:00',
    userCount: 20,
    usedCapacityGB: 256.0,
    totalCapacityGB: 500,
    description: '新员工培训、技能提升',
  },
  {
    id: 'pf-5',
    name: '共享软件',
    path: '/public/software',
    storagePool: 'Pool-1 (RAID 5)',
    poolId: 'pool-1',
    permissionMode: 'readonly',
    status: 'disabled',
    createTime: '2024-01-20 16:00:00',
    userCount: 0,
    usedCapacityGB: 85.7,
    totalCapacityGB: 300,
    description: '常用工具软件、安装包',
  },
];

export const poolOptions = [
  { value: 'pool-1', label: 'Pool-1 (RAID 5) - 4TB' },
  { value: 'pool-2', label: 'Pool-2 (RAID 1) - 2TB' },
  { value: 'pool-3', label: 'Pool-3 (RAID 10) - 8TB' },
];

export const userOptions = [
  { value: 'zhangsan', label: '张三' },
  { value: 'lisi', label: '李四' },
  { value: 'wangwu', label: '王五' },
  { value: 'zhaoliu', label: '赵六' },
  { value: 'admin', label: '管理员' },
];

export const initialPermissions: Record<string, PermissionUser[]> = {
  'pf-1': [
    { user: 'zhangsan', permission: 'admin' },
    { user: 'lisi', permission: 'readwrite' },
    { user: 'wangwu', permission: 'readwrite' },
  ],
  'pf-2': [
    { user: 'lisi', permission: 'admin' },
    { user: 'zhaoliu', permission: 'readwrite' },
  ],
  'pf-3': [
    { user: 'admin', permission: 'admin' },
    { user: 'zhangsan', permission: 'readonly' },
  ],
  'pf-4': [
    { user: 'zhangsan', permission: 'admin' },
    { user: 'lisi', permission: 'readwrite' },
    { user: 'wangwu', permission: 'readwrite' },
    { user: 'zhaoliu', permission: 'readonly' },
  ],
  'pf-5': [
    { user: 'admin', permission: 'admin' },
  ],
};

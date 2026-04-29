/**
 * 文件管理 API - Mock 数据
 * 数据来源：生产环境 VIVIBIT NAS 页面结构分析
 */

export interface FileLibraryItem {
  id: string;
  name: string;
  usedQuota: string;
  totalQuota: string;
  storagePath: string;
  accessType: string;
}

export interface RecycleBinItem {
  id: string;
  name: string;
  originalPath: string;
  deleteTime: string;
  size: string;
  type: string;
}

export interface ExternalDevice {
  id: string;
  name: string;
  capacity: string;
  usedCapacity: string;
  filesystem: string;
  connectionStatus: string;
  mountPoint: string;
}

export interface ShareLink {
  id: string;
  name: string;
  targetPath: string;
  createTime: string;
  expireTime: string;
  accessCount: number;
  url: string;
}

export async function getFileLibraryApi(): Promise<FileLibraryItem[]> {
  return [
    {
      id: 'lib-1',
      name: 'storage1',
      usedQuota: '0',
      totalQuota: '100 GB',
      storagePath: '/share/ea342ea3-2db8-477c-98bd-86e219ec800d',
      accessType: '私有',
    },
  ];
}

export async function getRecycleBinApi(): Promise<RecycleBinItem[]> {
  return [
    {
      id: 'rec-1',
      name: '旧文档.txt',
      originalPath: '/share/storage1/docs/旧文档.txt',
      deleteTime: '2024-07-20 14:30:00',
      size: '12 KB',
      type: 'file',
    },
  ];
}

export async function getExternalDevicesApi(): Promise<ExternalDevice[]> {
  return [
    {
      id: 'ext-1',
      name: 'Flash-Disk (sdd)',
      capacity: '125.00 GB',
      usedCapacity: '45.20 GB',
      filesystem: 'ext4',
      connectionStatus: '已连接',
      mountPoint: '/mnt/usb0',
    },
  ];
}

export async function getShareLinksApi(): Promise<ShareLink[]> {
  return [
    {
      id: 'link-1',
      name: '项目资料分享',
      targetPath: '/share/storage1/projects',
      createTime: '2024-07-25 09:00:00',
      expireTime: '2024-08-25 09:00:00',
      accessCount: 12,
      url: 'https://d.vivibit.com/s/abc123',
    },
  ];
}

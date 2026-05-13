export type PermissionMode = 'readonly' | 'readwrite' | 'admin';
export type FolderStatus = 'active' | 'disabled';

export interface PublicFolder {
  id: string;
  name: string;
  path: string;
  storagePool: string;
  poolId: string;
  permissionMode: PermissionMode;
  status: FolderStatus;
  createTime: string;
  userCount: number;
  usedCapacityGB: number;
  totalCapacityGB: number;
  description: string;
}

export interface FolderFormData {
  name: string;
  path: string;
  storagePool: string;
  permissionMode: PermissionMode;
  totalCapacityGB: number;
  description: string;
}

export interface PermissionUser {
  user: string;
  permission: PermissionMode;
}

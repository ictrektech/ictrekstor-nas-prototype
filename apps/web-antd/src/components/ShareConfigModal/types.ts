import type { FileTreeNode } from '#/components/FileExplorer';

export interface ShareUser {
  user: string;
  permission: 'readonly' | 'readwrite';
}

export interface ShareFormData {
  shareUsers: ShareUser[];
  expireType: 'preset' | 'custom' | 'forever';
  expirePreset: string;
  expireCustomDate: string;
  linkEnabled: boolean;
  linkExpireType: 'preset' | 'custom' | 'forever';
  linkExpirePreset: string;
  linkExpireCustomDate: string;
  linkPassword: string;
  // 目录树相关（仅创建分享时使用）
  sourceTreeKey?: string;
  sourcePath?: string;
  name?: string;
}

export interface ShareConfigModalProps {
  visible: boolean;
  title?: string;
  folderName?: string;
  folderPath?: string;
  showTree?: boolean;
  treeData?: FileTreeNode[];
  treeExpandedKeys?: string[];
  treeSelectedKey?: string;
  confirmText?: string;
  userOptions: { label: string; value: string }[];
  initialValues?: Partial<ShareFormData>;
}
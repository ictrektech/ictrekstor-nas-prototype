export interface ShareUser {
  user: string;
  permission: 'readonly' | 'readwrite';
}

export interface SharedDir {
  id: string;
  name: string;
  sourcePath: string;
  shareUsers: ShareUser[];
  shareTime: string;
  expireTime: string;
  status: 'active' | 'expired';
  linkEnabled: boolean;
  linkUrl: string;
  linkAccessCount: number;
  linkStatus: 'active' | 'expired';
  linkPassword?: string;
}

export interface LinkFormData {
  enabled: boolean;
  expireType: 'preset' | 'custom' | 'forever';
  expirePreset: string;
  expireCustomDate: string;
  password: string;
}
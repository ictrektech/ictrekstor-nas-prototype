export interface PublicDirItem {
  id: string;
  name: string;
  description: string;
  fileCount: number;
  owner: string;
  updateTime: string;
  access: 'readonly' | 'write';
}
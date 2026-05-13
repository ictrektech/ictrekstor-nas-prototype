import type { StorageVolume, StoragePool } from '#/api/storage';

export { StorageVolume, StoragePool };

export interface VolumeCreateForm {
  name: string;
  sourceType: 'pool' | 'directory';
  poolId: string;
  bindSource: string;
  size: number | undefined;
  sizeUnit: string;
  filesystem: string;
  description: string;
}

/* ═══════ 容量计算工具 ═══════ */
export function getUsagePercent(used: string, total: string): number {
  const parseSize = (s: string): number => {
    const num = parseFloat(s);
    if (s.includes('TB')) return num * 1024;
    if (s.includes('GB')) return num;
    if (s.includes('MB')) return num / 1024;
    return num;
  };
  const u = parseSize(used);
  const t = parseSize(total);
  return t > 0 ? Math.round((u / t) * 100) : 0;
}

export function getCapacityColor(percent: number): string {
  if (percent >= 90) return '#ff4d4f';
  if (percent >= 70) return '#faad14';
  return '#1677ff';
}

export function getStatusColor(status: string): string {
  return status === '正常' ? 'success' : 'default';
}

export function getFsIcon(fs: string): string {
  if (fs === 'ext4') return 'lucide:folder-tree';
  if (fs === 'btrfs') return 'lucide:layers';
  if (fs === 'xfs') return 'lucide:database';
  return 'lucide:folder';
}

export function getPoolStatusDotColor(status: string): string {
  return status === '正常' ? '#52c41a' : '#ff4d4f';
}
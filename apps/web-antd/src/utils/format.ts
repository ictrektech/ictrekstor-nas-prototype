/**
 * 格式化网络速度为友好字符串
 * @param kbps - 速度值（KB/s）
 * @returns 格式化后的速度字符串
 */
export function formatSpeed(kbps: number): string {
  if (kbps >= 1024 * 1024) return `${(kbps / (1024 * 1024)).toFixed(2)} GB/s`;
  if (kbps >= 1024) return `${(kbps / 1024).toFixed(1)} MB/s`;
  return `${kbps.toFixed(0)} KB/s`;
}

/**
 * 格式化字节数为友好字符串
 * @param bytes - 字节数
 * @returns 格式化后的容量字符串
 */
export function formatBytes(bytes: number): string {
  if (bytes >= 1024 ** 5) return `${(bytes / 1024 ** 5).toFixed(2)} PB`;
  if (bytes >= 1024 ** 4) return `${(bytes / 1024 ** 4).toFixed(2)} TB`;
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
  return `${(bytes / 1024).toFixed(2)} KB`;
}

/**
 * 解析容量字符串为字节数
 * @param size - 容量字符串，如 "2 TB", "500 GB"
 * @returns 字节数
 */
export function parseCapacity(size?: string): number {
  if (!size) return 0;
  const match = size.match(/^(\d+(?:\.\d+)?)\s*(TB|GB|MB|PB)/i);
  if (!match) return 0;
  const val = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  const multipliers: Record<string, number> = {
    MB: 1024 ** 2,
    GB: 1024 ** 3,
    TB: 1024 ** 4,
    PB: 1024 ** 5,
  };
  return val * (multipliers[unit] || 0);
}
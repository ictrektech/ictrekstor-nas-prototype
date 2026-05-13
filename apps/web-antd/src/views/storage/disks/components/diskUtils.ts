/**
 * 磁盘状态相关的纯工具函数
 * 从 DiskCard.vue 提取，供多个组件复用
 */

export function getStatusDot(status: string): string {
  switch (status) {
    case '运行中':
      return '#52c41a';
    case '休眠':
      return '#faad14';
    default:
      return '#bfbfbf';
  }
}

export function getHealthBadgeColor(health?: string): string {
  switch (health) {
    case '正常':
      return '#52c41a';
    case '警告':
      return '#faad14';
    case '异常':
      return '#ff4d4f';
    default:
      return '#8c8c8c';
  }
}

export function getDeviceIcon(deviceType?: string): string {
  if (deviceType?.includes('SSD')) return 'lucide:cpu';
  if (deviceType?.includes('NVMe')) return 'lucide:zap';
  return 'lucide:hard-drive';
}

export function getDeviceIconColor(deviceType?: string): string {
  if (deviceType?.includes('SSD')) return '#722ed1';
  if (deviceType?.includes('NVMe')) return '#eb2f96';
  return '#1677ff';
}
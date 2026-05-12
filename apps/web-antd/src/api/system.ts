/**
 * 系统设置 API - Mock 数据
 * 数据来源：生产环境 VIVIBIT NAS 页面结构分析
 */

export interface NetworkConfig {
  name: string;
  ipv4Address: string;
  subnetMask: string;
  gateway: string;
  dns: string;
  macAddress: string;
  mtu: number;
  connectionStatus: string;
  /** 当前下载速度 (KB/s) */
  downloadSpeed: number;
  /** 当前上传速度 (KB/s) */
  uploadSpeed: number;
  /** 协商速率，如 1000Mb/s */
  linkSpeed: string;
  /** 双工模式：全双工/半双工 */
  duplex: string;
}

/** 网卡历史带宽数据点 */
export interface NetworkBandwidthPoint {
  time: string;
  download: number;
  upload: number;
}

/** 网卡详情（含历史数据） */
export interface NetworkDetail extends NetworkConfig {
  /** 24小时历史带宽数据 */
  history: NetworkBandwidthPoint[];
  /** 今日总下载量 (MB) */
  totalDownloadToday: number;
  /** 今日总上传量 (MB) */
  totalUploadToday: number;
  /** 网卡驱动 */
  driver: string;
  /** 总接收字节数 */
  rxBytes: number;
  /** 总发送字节数 */
  txBytes: number;
  /** 接收错误包数 */
  rxErrors: number;
  /** 发送错误包数 */
  txErrors: number;
  /** 丢弃包数 */
  rxDropped: number;
}

export interface SystemUser {
  id: string;
  username: string;
  role: string;
  status: string;
  createTime: string;
  lastLoginTime: string;
  email: string;
}

// 生成 24 小时历史带宽数据
function genBandwidthHistory(): NetworkBandwidthPoint[] {
  const points: NetworkBandwidthPoint[] = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hour = t.getHours();
    // 模拟白天高、晚上低的流量模式
    const baseFactor = hour >= 9 && hour <= 22 ? 1.2 : 0.3;
    points.push({
      time: `${String(hour).padStart(2, '0')}:00`,
      download: +(Math.random() * 8000 * baseFactor + 500).toFixed(2),
      upload: +(Math.random() * 2000 * baseFactor + 100).toFixed(2),
    });
  }
  return points;
}

export async function getNetworksApi(): Promise<NetworkConfig[]> {
  return [
    {
      name: 'eth0',
      ipv4Address: '192.168.1.212',
      subnetMask: '255.255.255.0',
      gateway: '192.168.1.1',
      dns: '8.8.8.8',
      macAddress: 'bc:24:11:94:12:f0',
      mtu: 1500,
      connectionStatus: '已连接',
      downloadSpeed: 4520,
      uploadSpeed: 1280,
      linkSpeed: '1000Mb/s',
      duplex: '全双工',
    },
  ];
}

export async function getNetworkDetailApi(name: string): Promise<NetworkDetail> {
  const history = genBandwidthHistory();
  return {
    name,
    ipv4Address: '192.168.1.212',
    subnetMask: '255.255.255.0',
    gateway: '192.168.1.1',
    dns: '8.8.8.8',
    macAddress: 'bc:24:11:94:12:f0',
    mtu: 1500,
    connectionStatus: '已连接',
    downloadSpeed: 4520,
    uploadSpeed: 1280,
    linkSpeed: '1000Mb/s',
    duplex: '全双工',
    history,
    totalDownloadToday: 2840,
    totalUploadToday: 680,
    driver: 'igb',
    rxBytes: 1024 ** 4 * 12,
    txBytes: 1024 ** 4 * 3,
    rxErrors: 0,
    txErrors: 0,
    rxDropped: 12,
  };
}

export async function updateNetworkApi(
  name: string,
  config: Partial<NetworkConfig>,
): Promise<void> {
  // MOCK: 模拟保存成功
  console.log(`[MOCK] 更新网卡 ${name} 配置:`, config);
}

export async function getSystemUsersApi(): Promise<SystemUser[]> {
  return [
    {
      id: '1',
      username: 'admin',
      role: '管理员',
      status: '启用',
      createTime: '2024-01-01 00:00:00',
      lastLoginTime: '2024-07-28 10:30:00',
      email: 'admin@ictrekstor.local',
    },
    {
      id: '2',
      username: 'guest',
      role: '访客',
      status: '禁用',
      createTime: '2024-03-15 14:20:00',
      lastLoginTime: '-',
      email: 'guest@ictrekstor.local',
    },
  ];
}

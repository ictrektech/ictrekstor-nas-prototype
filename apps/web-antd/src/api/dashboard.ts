/**
 * 首页概览 API - Mock 数据
 * 数据来源：生产环境 VIVIBIT NAS 页面结构分析
 */

export interface DashboardSummary {
  deviceName: string;
  deviceId: string;
  systemVersion: string;
  uptime: string;
  account: string;
  connectUrl: string;
  storageSpace: { used: string; total: string };
  systemSpace: { used: string; total: string };
  hardware: { cpuCores: number; cpuThreads: number; memory: string };
  networks: Array<{
    name: string;
    ipv4Status: string;
    ipv4Address: string;
    mac: string;
    mtu: number;
  }>;
}

export async function getDashboardSummaryApi(): Promise<DashboardSummary> {
  // MOCK: 返回模拟的首页概览数据
  return {
    deviceName: 'ubuntu',
    deviceId: '9412f0',
    systemVersion: '1.0.4-12',
    uptime: '8天 21:25:45',
    account: 'admin',
    connectUrl: 'https://d.vivibit.com/9412f0/',
    storageSpace: { used: '3.16 MB', total: '99.77 GB' },
    systemSpace: { used: '2.22 TB', total: '4.85 TB' },
    hardware: {
      cpuCores: 16,
      cpuThreads: 16,
      memory: '31.33 GB RAM',
    },
    networks: [
      {
        name: 'eth0',
        ipv4Status: '已连接',
        ipv4Address: '192.168.1.212, 192.168.1.213',
        mac: 'bc:24:11:94:12:f0',
        mtu: 1500,
      },
    ],
  };
}

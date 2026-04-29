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
    },
  ];
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

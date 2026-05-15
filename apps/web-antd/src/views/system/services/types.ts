/**
 * 服务设置页面 - 数据类型定义
 */

/** 服务分类 */
export type ServiceCategory = 'file-sharing' | 'management' | 'remote-access';

/** 服务运行状态 */
export type ServiceStatus = 'running' | 'stopped' | 'error';

/** 服务配置项（快速展示用） */
export interface ServiceQuickInfo {
  label: string;
  value: string;
}

/** 服务数据 */
export interface ServiceData {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconColor: string;
  enabled: boolean;
  category: ServiceCategory;
  status: ServiceStatus;
  url?: string;
  quickInfo: ServiceQuickInfo[];
  /** 使用指南内容（Markdown/纯文本） */
  guideContent: string;
  /** 服务特有配置（由具体服务弹窗消费） */
  config: Record<string, any>;
}

/** SMB 配置 */
export interface SmbConfig {
  workgroup: string;
  serverName: string;
  bindInterface: string;
  enableSmb1: boolean;
  enableSmb2: boolean;
  enableSmb3: boolean;
  guestAccess: boolean;
  announceService: boolean;
}

/** HTTP 管理配置 */
export interface HttpMgmtConfig {
  port: number;
  bindInterface: string;
  enableHttps: boolean;
  enableHsts: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  allowedIps: string;
  enableCsp: boolean;
}

/** FTP 配置 */
export interface FtpConfig {
  ftpMode: string;
  bindInterface: string;
  port: number;
  maxConnections: number;
  passivePortRange: string;
  enableAnonymous: boolean;
  enableFtps: boolean;
}

/** WebDAV 配置 */
export interface WebdavConfig {
  port: number;
  bindInterface: string;
  enableHttps: boolean;
  enableDav: boolean;
  enableCaldav: boolean;
  enableCarddav: boolean;
}

/** AFP 配置 */
export interface AfpConfig {
  serverName: string;
  bindInterface: string;
  enableAfp3: boolean;
  enableBonjour: boolean;
  enableTimeMachine: boolean;
}

/** NFS 配置 */
export interface NfsConfig {
  bindInterface: string;
  enableNfsv3: boolean;
  enableNfsv4: boolean;
  rootSquash: boolean;
  allSquash: boolean;
}

/**
 * 存储管理 API - Mock 数据
 * 数据来源：生产环境 VIVIBIT NAS 页面结构分析
 */

export interface DiskPartition {
  name: string;
  size: string;
  used?: string;
  filesystem?: string;
  mountPoint?: string;
}

export interface DiskInfo {
  deviceName: string;
  devicePath: string;
  model: string;
  serial: string;
  size: string;
  status: string;
  isUsed: string;
  physicalSectorSize: number;
  logicalSectorSize: number;
  isRotational: string;
  deviceType: string;
  uuid: string;
  transportType: string;
  subsystem: string;
  isHotpluggable: string;
  /** 温度(°C) */
  temperature?: number;
  /** 健康状态 */
  healthStatus?: string;
  /** 使用时长(小时) */
  usedHours?: number;
  /** 接口协议 */
  interfaceType?: string;
  /** 使用状态描述 */
  usageStatus?: string;
  /** 分区信息 */
  partitions?: DiskPartition[];
  /** SMART 信息 */
  smartctlInfo?: string;
  /** 所属存储池 ID 列表 */
  poolIds?: string[];
}

export interface PoolLog {
  id: string;
  time: string;
  level: 'info' | 'warning' | 'error';
  message: string;
}

export interface PoolDiskInfo {
  deviceName: string;
  model: string;
  size: string;
  status: string;
  healthStatus?: string;
}

export interface PoolCapacityHistory {
  date: string;
  used: number;
  total: number;
}

export interface PoolIoStats {
  time: string;
  readIops: number;
  writeIops: number;
  readThroughput: number;
  writeThroughput: number;
}

export interface StoragePoolDetail {
  id: string;
  name: string;
  raidType: string;
  status: string;
  totalCapacity: string;
  usedCapacity: string;
  diskCount: number;
  createTime: string;
  disks: PoolDiskInfo[];
  logs: PoolLog[];
  capacityHistory: PoolCapacityHistory[];
  ioStats: PoolIoStats[];
}

export interface StoragePool {
  id: string;
  name: string;
  raidType: string;
  status: string;
  totalCapacity: string;
  usedCapacity: string;
  diskCount: number;
  createTime: string;
  /** 该存储池所使用的磁盘列表（简略信息） */
  disks?: { deviceName: string; model: string; size: string }[];
}

export interface StorageVolume {
  id: string;
  name: string;
  /** 关联存储池ID，空字符串表示基于目录 */
  poolId: string;
  poolName?: string;
  /** 来源类型: pool = 来自存储池, directory = 基于现有目录bind mount */
  sourceType: 'pool' | 'directory';
  totalCapacity: string;
  usedCapacity: string;
  status: string;
  mountPath: string;
  filesystem: string;
  /** bind mount的源目录路径（仅sourceType=directory时有效） */
  bindSource?: string;
  raidType?: string;
  diskType?: string;
  interfaceProtocol?: string;
  disks?: { deviceName: string; size: string }[];
}

export interface PublicDir {
  id: string;
  name: string;
  path: string;
  permissions: string;
  createTime: string;
}

export interface TeamFileFolder {
  id: string;
  name: string;
  storageLocation: string;
  storageLocationName: string;
  capacityLimit: number | null;
  capacityUnit: string;
  allowShareProtocol: boolean;
  recyclePermission: 'admin' | 'all';
  createTime: string;
  updateTime: string;
}

export interface TeamFileUser {
  id: string;
  username: string;
  role: 'admin' | 'member';
  permission: 'read' | 'write' | 'full';
  addTime: string;
}

export async function getDisksApi(): Promise<DiskInfo[]> {
  // MOCK: 返回模拟的硬盘列表（与生产环境结构一致）
  return [
    {
      deviceName: 'sda',
      devicePath: '/dev/sda',
      model: 'ST2000VN004-2E41',
      serial: 'Z52BX1L7',
      size: '1.81 TB',
      poolIds: ['pool-1'],
      status: '运行中',
      isUsed: '是',
      physicalSectorSize: 512,
      logicalSectorSize: 512,
      isRotational: '是',
      deviceType: 'HDD',
      uuid: '--',
      transportType: 'SATA',
      subsystem: 'block:scsi:virtio:pci',
      isHotpluggable: '否',
      temperature: 36,
      healthStatus: '正常',
      usedHours: 29536,
      usageStatus: '使用中',
      smartctlInfo: `smartctl 7.3 2022-02-28 r5338 [x86_64-linux-5.15.0] (local build)
Copyright (C) 2002-22, Bruce Allen, Christian Franke, www.smartmontools.org

=== START OF INFORMATION SECTION ===
Model Family:     Seagate IronWolf
Device Model:     ST2000VN004-2E41
Serial Number:    Z52BX1L7
LU WWN Device Id: 5 000c50 0b2a3f7c8
Firmware Version: SC60
User Capacity:    2,000,398,934,016 bytes [2.00 TB]
Sector Sizes:     512 bytes logical, 4096 bytes physical
Rotation Rate:    5900 rpm
Form Factor:      3.5 inches
Device is:        In smartctl database [for details use: -P show]
ATA Version is:   ACS-3 T13/2161-D revision 5
SATA Version is:  SATA 3.1, 6.0 Gb/s (current: 6.0 Gb/s)
Local Time is:    Wed May  6 10:23:45 2026 CST
SMART support is: Available - device has SMART capability.
SMART support is: Enabled

=== START OF READ SMART DATA SECTION ===
SMART overall-health self-assessment test result: PASSED

General SMART Values:
Offline data collection status:  (0x82) Offline data collection activity
                                        was completed without error.
Auto Offline Data Collection: Enabled.
Self-test execution status:      (   0) The previous self-test routine completed
                                        without error or no self-test has ever
                                        been run.
Total time to complete Offline
                    data collection: (  575) seconds.
Offline data collection
capabilities:                    (0x7b) SMART execute Offline immediate.
                                        Auto Offline data collection on/off support.
                                        Suspend Offline collection upon new
                                        command.
                                        Offline surface scan supported.
                                        Self-test supported.
                                        Conveyance Self-test supported.
                                        Selective Self-test supported.
SMART capabilities:            (0x0003) Saves SMART data before entering
                                        power-saving mode.
                                        Supports SMART auto save timer.
Error logging capability:        (0x01) Error logging supported.
                                        General Purpose Logging supported.
Short self-test routine
recommended polling time:        (   1) minutes.
Extended self-test routine
recommended polling time:        ( 208) minutes.
Conveyance self-test routine
recommended polling time:        (   2) minutes.
SCT capabilities:              (0x70bd) SCT Status supported.
                                        SCT Error Recovery Control supported.
                                        SCT Feature Control supported.
                                        SCT Data Table supported.

SMART Attributes Data Structure revision number: 10
Vendor Specific SMART Attributes with Thresholds:
ID# ATTRIBUTE_NAME          FLAG     VALUE WORST THRESH TYPE      UPDATED  WHEN_FAILED RAW_VALUE
  1 Raw_Read_Error_Rate     0x000f   077   064   044    Pre-fail  Always       -       53357952
  3 Spin_Up_Time            0x0003   095   094   000    Pre-fail  Always       -       0
  4 Start_Stop_Count        0x0032   100   100   020    Old_age   Always       -       35
  5 Reallocated_Sector_Ct   0x0033   100   100   010    Pre-fail  Always       -       0
  7 Seek_Error_Rate         0x000f   086   060   045    Pre-fail  Always       -       4729079544
  9 Power_On_Hours          0x0032   065   065   000    Old_age   Always       -       29536
 10 Spin_Retry_Count        0x0013   100   100   097    Pre-fail  Always       -       0
 12 Power_Cycle_Count       0x0032   100   100   020    Old_age   Always       -       152
184 End-to-End_Error        0x0032   100   100   099    Old_age   Always       -       0
187 Reported_Uncorrect      0x0032   100   100   000    Old_age   Always       -       0
188 Command_Timeout         0x0032   100   100   000    Old_age   Always       -       0
189 High_Fly_Writes         0x003a   100   100   000    Old_age   Always       -       0
190 Airflow_Temperature_Cel 0x0022   064   055   040    Old_age   Always       -       36 (Min/Max 18/42)
191 G-Sense_Error_Rate      0x0032   100   100   000    Old_age   Always       -       0
192 Power-Off_Retract_Count 0x0032   100   100   000    Old_age   Always       -       152
193 Load_Cycle_Count        0x0032   100   100   000    Old_age   Always       -       29536
194 Temperature_Celsius     0x0022   036   045   000    Old_age   Always       -       36 (0 18 0 0 0)
197 Current_Pending_Sector  0x0012   100   100   000    Old_age   Always       -       0
198 Offline_Uncorrectable   0x0010   100   100   000    Old_age   Offline      -       0
199 UDMA_CRC_Error_Count    0x003e   200   200   000    Old_age   Always       -       0
240 Head_Flying_Hours       0x0000   100   253   000    Old_age   Offline      -       29536h+00m+00.000s
241 Total_LBAs_Written      0x0000   100   253   000    Old_age   Offline      -       15284736
242 Total_LBAs_Read         0x0000   100   253   000    Old_age   Offline      -       48273651

SMART Error Log Version: 1
No Errors Logged

SMART Self-test log structure revision number 1
Num  Test_Description    Status                  Remaining  LifeTime(hours)  LBA_of_first_error
# 1  Short offline       Completed without error       00%     29520         -
# 2  Extended offline    Completed without error       00%     29000         -

SMART Selective self-test log data structure revision number 1
 SPAN  MIN_LBA  MAX_LBA  CURRENT_TEST_STATUS
    1        0        0  Not_testing
    2        0        0  Not_testing
    3        0        0  Not_testing
    4        0        0  Not_testing
    5        0        0  Not_testing
Selective self-test flags (0x0):
  After scanning selected spans, do NOT read-scan remainder of disk.
If Selective self-test is pending on power-up, resume after 0 minute delay.`,
      partitions: [
        { name: 'sda1', size: '94 MB', filesystem: '未知' },
        { name: 'sda2', size: '9.97 GB / 1.81 TB', filesystem: '系统安装', mountPoint: '/' },
      ],
    },
    {
      deviceName: 'sdb',
      devicePath: '/dev/sdb',
      model: 'ST2000VN004-2E41',
      serial: 'Z52BWSR3',
      size: '1.81 TB',
      poolIds: ['pool-1'],
      status: '休眠',
      isUsed: '是',
      physicalSectorSize: 512,
      logicalSectorSize: 512,
      isRotational: '是',
      deviceType: 'HDD',
      uuid: '--',
      transportType: 'SATA',
      subsystem: 'block:scsi:virtio:pci',
      isHotpluggable: '否',
      temperature: 36,
      healthStatus: '正常',
      usedHours: 29510,
      usageStatus: '使用中',
      partitions: [
        { name: 'sdb1', size: '1.81 TB', filesystem: 'ext4', mountPoint: '/share' },
      ],
    },
    {
      deviceName: 'sdc',
      devicePath: '/dev/sdc',
      model: 'ST2000DM005-2CW1',
      serial: 'WFM20P5N',
      size: '1.81 TB',
      poolIds: ['pool-1'],
      status: '运行中',
      isUsed: '否',
      physicalSectorSize: 512,
      logicalSectorSize: 512,
      isRotational: '是',
      deviceType: 'HDD',
      uuid: '--',
      transportType: 'SATA',
      subsystem: 'block:scsi:virtio:pci',
      isHotpluggable: '否',
      temperature: 36,
      healthStatus: '正常',
      usedHours: 27294,
      usageStatus: '未使用',
      partitions: [],
    },
    {
      deviceName: 'sdd',
      devicePath: '/dev/sdd',
      model: 'ST2000DM005-2CW1',
      serial: 'WFL4NR0A',
      size: '1.81 TB',
      poolIds: [],
      status: '运行中',
      isUsed: '否',
      physicalSectorSize: 512,
      logicalSectorSize: 512,
      isRotational: '是',
      deviceType: 'HDD',
      uuid: '--',
      transportType: 'SATA',
      subsystem: 'block:scsi:virtio:pci',
      isHotpluggable: '否',
      temperature: 34,
      healthStatus: '正常',
      usedHours: 27120,
      usageStatus: '未使用',
      partitions: [],
    },
  ];
}

export async function getStoragePoolsApi(): Promise<StoragePool[]> {
  return [
    {
      id: 'pool-1',
      name: '存储池-1',
      raidType: 'RAID5',
      status: '正常',
      totalCapacity: '5.00 TB',
      usedCapacity: '2.50 TB',
      diskCount: 3,
      createTime: '2024-01-15 10:30:00',
      disks: [
        { deviceName: 'sda', model: 'ST2000VN004-2E41', size: '1.81 TB' },
        { deviceName: 'sdb', model: 'ST2000VN004-2E41', size: '1.81 TB' },
        { deviceName: 'sdc', model: 'ST2000DM005-2CW1', size: '1.81 TB' },
      ],
    },
  ];
}

export async function getStorageVolumesApi(): Promise<StorageVolume[]> {
  return [
    {
      id: 'vol-1',
      name: '共享资料空间',
      poolId: 'pool-1',
      poolName: '存储池-1',
      sourceType: 'pool',
      totalCapacity: '3.00 TB',
      usedCapacity: '1.80 TB',
      status: '正常',
      mountPath: '/share/space1',
      filesystem: 'ext4',
      raidType: 'RAID5',
      diskType: 'HDD',
      interfaceProtocol: 'SATA',
      disks: [
        { deviceName: 'sda', size: '1.81 TB' },
        { deviceName: 'sdb', size: '1.81 TB' },
        { deviceName: 'sdc', size: '1.81 TB' },
      ],
    },
    {
      id: 'vol-2',
      name: '备份空间',
      poolId: 'pool-1',
      poolName: '存储池-1',
      sourceType: 'pool',
      totalCapacity: '1.50 TB',
      usedCapacity: '400 GB',
      status: '正常',
      mountPath: '/share/backup',
      filesystem: 'btrfs',
      raidType: 'RAID5',
      diskType: 'HDD',
      interfaceProtocol: 'SATA',
      disks: [
        { deviceName: 'sda', size: '1.81 TB' },
        { deviceName: 'sdb', size: '1.81 TB' },
        { deviceName: 'sdc', size: '1.81 TB' },
      ],
    },
    {
      id: 'vol-3',
      name: '系统数据目录',
      poolId: '',
      sourceType: 'directory',
      totalCapacity: '500 GB',
      usedCapacity: '120 GB',
      status: '正常',
      mountPath: '/mnt/data',
      filesystem: 'ext4',
      bindSource: '/opt/old-data',
    },
    {
      id: 'vol-4',
      name: '历史档案库',
      poolId: '',
      sourceType: 'directory',
      totalCapacity: '2.00 TB',
      usedCapacity: '850 GB',
      status: '正常',
      mountPath: '/mnt/archive',
      filesystem: 'xfs',
      bindSource: '/var/lib/archive-data',
    },
  ];
}

export async function getPublicDirsApi(): Promise<PublicDir[]> {
  return [
    {
      id: 'dir-1',
      name: '公共文档',
      path: '/share/public/docs',
      permissions: 'rwxr-xr-x',
      createTime: '2024-01-15 10:30:00',
    },
  ];
}

export async function getTeamFileFoldersApi(): Promise<TeamFileFolder[]> {
  return [
    {
      id: 'tf-1',
      name: '文档',
      storageLocation: 'pool-1',
      storageLocationName: '存储空间1',
      capacityLimit: null,
      capacityUnit: 'GB',
      allowShareProtocol: true,
      recyclePermission: 'admin',
      createTime: '2024-01-15 10:30:00',
      updateTime: '2024-05-06 14:00:00',
    },
    {
      id: 'tf-2',
      name: '设计资源',
      storageLocation: 'pool-1',
      storageLocationName: '存储空间1',
      capacityLimit: 500,
      capacityUnit: 'GB',
      allowShareProtocol: true,
      recyclePermission: 'all',
      createTime: '2024-02-20 09:00:00',
      updateTime: '2024-05-01 10:00:00',
    },
    {
      id: 'tf-3',
      name: '财务资料',
      storageLocation: 'pool-1',
      storageLocationName: '存储空间1',
      capacityLimit: 100,
      capacityUnit: 'GB',
      allowShareProtocol: false,
      recyclePermission: 'admin',
      createTime: '2024-03-10 11:30:00',
      updateTime: '2024-04-20 16:00:00',
    },
  ];
}

export interface StorageSpaceFile {
  id: string;
  name: string;
  type: 'folder' | 'file';
  size: string;
  modifyTime: string;
  extension?: string;
}

export interface StorageSpace {
  id: string;
  name: string;
  filesystem: string;
  raidType: string;
  totalCapacity: string;
  usedCapacity: string;
  path: string;
}

export async function getStorageSpacesApi(): Promise<StorageSpace[]> {
  return [
    {
      id: 'space-1',
      name: '存储空间1',
      filesystem: 'ext4',
      raidType: 'RAID5',
      totalCapacity: '5.00 TB',
      usedCapacity: '2.50 TB',
      path: '/share/space1',
    },
    {
      id: 'space-2',
      name: '存储空间2',
      filesystem: 'btrfs',
      raidType: 'RAID1',
      totalCapacity: '2.00 TB',
      usedCapacity: '800 GB',
      path: '/share/space2',
    },
  ];
}

export async function getStorageSpaceFilesApi(spaceId: string): Promise<StorageSpaceFile[]> {
  return [
    {
      id: 'f-1',
      name: '文档',
      type: 'folder',
      size: '--',
      modifyTime: '2024-05-06 10:30:00',
    },
    {
      id: 'f-2',
      name: '图片',
      type: 'folder',
      size: '--',
      modifyTime: '2024-05-05 14:20:00',
    },
    {
      id: 'f-3',
      name: '视频',
      type: 'folder',
      size: '--',
      modifyTime: '2024-05-04 09:15:00',
    },
    {
      id: 'f-4',
      name: 'README.md',
      type: 'file',
      size: '12 KB',
      modifyTime: '2024-05-03 16:45:00',
      extension: 'md',
    },
    {
      id: 'f-5',
      name: 'config.json',
      type: 'file',
      size: '3 KB',
      modifyTime: '2024-05-02 11:00:00',
      extension: 'json',
    },
    {
      id: 'f-6',
      name: 'backup.zip',
      type: 'file',
      size: '1.2 GB',
      modifyTime: '2024-04-28 08:30:00',
      extension: 'zip',
    },
    {
      id: 'f-7',
      name: 'report.pdf',
      type: 'file',
      size: '2.5 MB',
      modifyTime: '2024-04-25 15:20:00',
      extension: 'pdf',
    },
    {
      id: 'f-8',
      name: 'data.xlsx',
      type: 'file',
      size: '856 KB',
      modifyTime: '2024-04-20 10:10:00',
      extension: 'xlsx',
    },
  ];
}

export interface TeamFolderFile {
  id: string;
  name: string;
  type: 'folder' | 'file';
  size: string;
  modifyTime: string;
  extension?: string;
}

export async function getTeamFolderFilesApi(folderId: string): Promise<TeamFolderFile[]> {
  const mockData: Record<string, TeamFolderFile[]> = {
    'tf-1': [
      { id: 'd1', name: '项目文档', type: 'folder', size: '--', modifyTime: '2024-05-06 10:30:00' },
      { id: 'd2', name: '会议纪要', type: 'folder', size: '--', modifyTime: '2024-05-05 14:20:00' },
      { id: 'f1', name: 'README.md', type: 'file', size: '12 KB', modifyTime: '2024-05-03 16:45:00', extension: 'md' },
      { id: 'f2', name: '需求文档.docx', type: 'file', size: '856 KB', modifyTime: '2024-04-20 10:10:00', extension: 'docx' },
      { id: 'f3', name: '流程图.png', type: 'file', size: '2.3 MB', modifyTime: '2024-04-15 09:30:00', extension: 'png' },
    ],
    'tf-2': [
      { id: 'd3', name: 'UI 设计', type: 'folder', size: '--', modifyTime: '2024-05-06 08:00:00' },
      { id: 'd4', name: '品牌素材', type: 'folder', size: '--', modifyTime: '2024-05-04 11:00:00' },
      { id: 'f4', name: 'logo.svg', type: 'file', size: '15 KB', modifyTime: '2024-05-01 14:00:00', extension: 'svg' },
      { id: 'f5', name: 'banner.psd', type: 'file', size: '45 MB', modifyTime: '2024-04-28 16:30:00', extension: 'psd' },
      { id: 'f6', name: '配色方案.xlsx', type: 'file', size: '120 KB', modifyTime: '2024-04-25 10:00:00', extension: 'xlsx' },
    ],
    'tf-3': [
      { id: 'd5', name: '2024 年报', type: 'folder', size: '--', modifyTime: '2024-05-05 09:00:00' },
      { id: 'd6', name: '税务资料', type: 'folder', size: '--', modifyTime: '2024-05-02 15:30:00' },
      { id: 'f7', name: '资产负债表.pdf', type: 'file', size: '1.2 MB', modifyTime: '2024-04-30 11:00:00', extension: 'pdf' },
      { id: 'f8', name: '利润表.xlsx', type: 'file', size: '340 KB', modifyTime: '2024-04-25 09:00:00', extension: 'xlsx' },
    ],
  };
  return mockData[folderId] || [];
}

export async function getTeamFileUsersApi(folderId: string): Promise<TeamFileUser[]> {
  return [
    {
      id: 'u-1',
      username: 'admin',
      role: 'admin',
      permission: 'full',
      addTime: '2024-01-15 10:30:00',
    },
    {
      id: 'u-2',
      username: 'zhangsan',
      role: 'member',
      permission: 'write',
      addTime: '2024-02-01 09:00:00',
    },
    {
      id: 'u-3',
      username: 'lisi',
      role: 'member',
      permission: 'read',
      addTime: '2024-03-10 14:00:00',
    },
  ];
}

export async function getStoragePoolDetailApi(id: string): Promise<StoragePoolDetail> {
  return {
    id,
    name: '存储池-1',
    raidType: 'RAID5',
    status: '正常',
    totalCapacity: '5.00 TB',
    usedCapacity: '2.50 TB',
    diskCount: 3,
    createTime: '2024-01-15 10:30:00',
    disks: [
      {
        deviceName: 'sda',
        model: 'ST2000VN004-2E41',
        size: '1.81 TB',
        status: '运行中',
        healthStatus: '正常',
      },
      {
        deviceName: 'sdb',
        model: 'ST2000VN004-2E41',
        size: '1.81 TB',
        status: '休眠',
        healthStatus: '正常',
      },
      {
        deviceName: 'sdc',
        model: 'ST2000DM005-2CW1',
        size: '1.81 TB',
        status: '运行中',
        healthStatus: '正常',
      },
    ],
    logs: [
      { id: 'log-1', time: '2026-05-06 09:30:00', level: 'info', message: '存储池正常，RAID5 校验通过' },
      { id: 'log-2', time: '2026-05-05 14:20:00', level: 'info', message: '计划任务：每周数据校验完成' },
      { id: 'log-3', time: '2026-05-04 03:15:00', level: 'warning', message: '硬盘 sdb 进入休眠模式' },
      { id: 'log-4', time: '2026-05-03 22:10:00', level: 'info', message: '存储池扩容完成，新增 1.81 TB' },
      { id: 'log-5', time: '2026-05-02 08:00:00', level: 'error', message: '网络异常，远程备份失败' },
      { id: 'log-6', time: '2026-05-01 12:00:00', level: 'info', message: '系统重启，存储池自动挂载' },
    ],
    capacityHistory: [
      { date: '2026-04-01', used: 1.2, total: 5.0 },
      { date: '2026-04-08', used: 1.5, total: 5.0 },
      { date: '2026-04-15', used: 1.8, total: 5.0 },
      { date: '2026-04-22', used: 2.1, total: 5.0 },
      { date: '2026-04-29', used: 2.3, total: 5.0 },
      { date: '2026-05-06', used: 2.5, total: 5.0 },
    ],
    ioStats: [
      { time: '10:00', readIops: 120, writeIops: 45, readThroughput: 15.2, writeThroughput: 5.8 },
      { time: '10:05', readIops: 98, writeIops: 32, readThroughput: 12.1, writeThroughput: 4.2 },
      { time: '10:10', readIops: 156, writeIops: 67, readThroughput: 22.5, writeThroughput: 8.9 },
      { time: '10:15', readIops: 87, writeIops: 28, readThroughput: 10.8, writeThroughput: 3.5 },
      { time: '10:20', readIops: 203, writeIops: 89, readThroughput: 28.6, writeThroughput: 11.2 },
      { time: '10:25', readIops: 145, writeIops: 56, readThroughput: 18.3, writeThroughput: 7.1 },
    ],
  };
}

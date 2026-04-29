/**
 * 存储管理 API - Mock 数据
 * 数据来源：生产环境 VIVIBIT NAS 页面结构分析
 */

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
}

export interface StorageVolume {
  id: string;
  name: string;
  poolName: string;
  totalCapacity: string;
  usedCapacity: string;
  status: string;
  mountPath: string;
}

export interface PublicDir {
  id: string;
  name: string;
  path: string;
  permissions: string;
  createTime: string;
}

export async function getDisksApi(): Promise<DiskInfo[]> {
  // MOCK: 返回模拟的硬盘列表（与生产环境结构一致）
  return [
    {
      deviceName: 'sda',
      devicePath: '/dev/sda',
      model: 'QEMU HARDDISK',
      serial: 'drive-scsi0',
      size: '5.00 TB',
      status: '运行中',
      isUsed: '是',
      physicalSectorSize: 512,
      logicalSectorSize: 512,
      isRotational: '是',
      deviceType: 'disk',
      uuid: '--',
      transportType: '--',
      subsystem: 'block:scsi:virtio:pci',
      isHotpluggable: '否',
    },
    {
      deviceName: 'sdb',
      devicePath: '/dev/sdb',
      model: 'QEMU HARDDISK',
      serial: 'drive-scsi2',
      size: '1.00 TB',
      status: '运行中',
      isUsed: '是',
      physicalSectorSize: 512,
      logicalSectorSize: 512,
      isRotational: '是',
      deviceType: 'disk',
      uuid: '--',
      transportType: '--',
      subsystem: 'block:scsi:virtio:pci',
      isHotpluggable: '否',
    },
    {
      deviceName: 'sdc',
      devicePath: '/dev/sdc',
      model: 'QEMU HARDDISK',
      serial: 'drive-scsi1',
      size: '1.00 TB',
      status: '运行中',
      isUsed: '是',
      physicalSectorSize: 512,
      logicalSectorSize: 512,
      isRotational: '是',
      deviceType: 'disk',
      uuid: '--',
      transportType: '--',
      subsystem: 'block:scsi:virtio:pci',
      isHotpluggable: '否',
    },
    {
      deviceName: 'sdd',
      devicePath: '/dev/sdd',
      model: 'Flash-Disk',
      serial: 'WA201016R1.000',
      size: '125.00 GB',
      status: '运行中',
      isUsed: '是',
      physicalSectorSize: 512,
      logicalSectorSize: 512,
      isRotational: '是',
      deviceType: 'disk',
      uuid: '--',
      transportType: 'usb',
      subsystem: 'block:scsi:usb:pci',
      isHotpluggable: '是',
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
    },
  ];
}

export async function getStorageVolumesApi(): Promise<StorageVolume[]> {
  return [
    {
      id: 'vol-1',
      name: 'storage1',
      poolName: '存储池-1',
      totalCapacity: '100 GB',
      usedCapacity: '0 GB',
      status: '正常',
      mountPath: '/share/ea342ea3-2db8-477c-98bd-86e219ec800d',
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

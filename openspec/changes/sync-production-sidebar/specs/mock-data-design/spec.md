## ADDED Requirements

### Requirement: 首页数据 Mock 接口
系统 SHALL 提供 `/api/dashboard/summary` 接口，返回首页所需的设备概览数据。

#### Scenario: 调用首页概览接口
- **WHEN** 前端调用 GET /api/dashboard/summary
- **THEN** 接口返回 JSON 数据，包含：deviceName、deviceId、systemVersion、uptime、account、connectUrl、storageSpace（used/total）、systemSpace（used/total）、hardware（cpuCores/cpuThreads/memory）、networks（数组，每项包含 name/ipv4Status/ipv4Address/mac/mtu）

### Requirement: 硬盘列表 Mock 接口
系统 SHALL 提供 `/api/storage/disks` 接口，返回物理硬盘列表数据。

#### Scenario: 调用硬盘列表接口
- **WHEN** 前端调用 GET /api/storage/disks
- **THEN** 接口返回 JSON 数组，每条记录包含：deviceName、devicePath、model、serial、size、status、isUsed、physicalSectorSize、logicalSectorSize、isRotational、deviceType、uuid、transportType、subsystem、isHotpluggable
- **AND** 返回至少 4 条模拟记录，覆盖不同硬盘类型（大容量硬盘、USB 闪存盘等）

### Requirement: 存储池列表 Mock 接口
系统 SHALL 提供 `/api/storage/pools` 接口，返回存储池列表数据。

#### Scenario: 调用存储池列表接口
- **WHEN** 前端调用 GET /api/storage/pools
- **THEN** 接口返回 JSON 数组，每条记录包含：id、name、raidType、status、totalCapacity、usedCapacity、diskCount、createTime

### Requirement: 存储空间列表 Mock 接口
系统 SHALL 提供 `/api/storage/volumes` 接口，返回逻辑存储空间列表数据。

#### Scenario: 调用存储空间列表接口
- **WHEN** 前端调用 GET /api/storage/volumes
- **THEN** 接口返回 JSON 数组，每条记录包含：id、name、poolName、totalCapacity、usedCapacity、status、mountPath

### Requirement: 公共目录列表 Mock 接口
系统 SHALL 提供 `/api/storage/public-dirs` 接口，返回公共共享目录列表数据。

#### Scenario: 调用公共目录列表接口
- **WHEN** 前端调用 GET /api/storage/public-dirs
- **THEN** 接口返回 JSON 数组，每条记录包含：id、name、path、permissions、createTime

### Requirement: 文件库存储空间列表 Mock 接口
系统 SHALL 提供 `/api/file/library` 接口，返回文件库中可访问的存储空间列表。

#### Scenario: 调用文件库存储空间列表接口
- **WHEN** 前端调用 GET /api/file/library
- **THEN** 接口返回 JSON 数组，每条记录包含：id、name、usedQuota、totalQuota、storagePath、accessType

### Requirement: 回收站列表 Mock 接口
系统 SHALL 提供 `/api/file/recycle-bin` 接口，返回回收站中的已删除文件列表。

#### Scenario: 调用回收站列表接口
- **WHEN** 前端调用 GET /api/file/recycle-bin
- **THEN** 接口返回 JSON 数组，每条记录包含：id、name、originalPath、deleteTime、size、type

### Requirement: 外部设备列表 Mock 接口
系统 SHALL 提供 `/api/file/external-devices` 接口，返回已连接的外部存储设备列表。

#### Scenario: 调用外部设备列表接口
- **WHEN** 前端调用 GET /api/file/external-devices
- **THEN** 接口返回 JSON 数组，每条记录包含：id、name、capacity、usedCapacity、filesystem、connectionStatus、mountPoint

### Requirement: 外链列表 Mock 接口
系统 SHALL 提供 `/api/file/share-links` 接口，返回已创建的外部共享链接列表。

#### Scenario: 调用外链列表接口
- **WHEN** 前端调用 GET /api/file/share-links
- **THEN** 接口返回 JSON 数组，每条记录包含：id、name、targetPath、createTime、expireTime、accessCount、url

### Requirement: 网络配置 Mock 接口
系统 SHALL 提供 `/api/system/networks` 接口，返回网络配置数据。

#### Scenario: 调用网络配置接口
- **WHEN** 前端调用 GET /api/system/networks
- **THEN** 接口返回 JSON 数组，每条记录包含：name、ipv4Address、subnetMask、gateway、dns、macAddress、mtu、connectionStatus

### Requirement: 用户列表 Mock 接口
系统 SHALL 提供 `/api/system/users` 接口，返回系统用户列表数据。

#### Scenario: 调用用户列表接口
- **WHEN** 前端调用 GET /api/system/users
- **THEN** 接口返回 JSON 数组，每条记录包含：id、username、role、status、createTime、lastLoginTime、email

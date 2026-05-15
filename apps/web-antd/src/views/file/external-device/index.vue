<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Card, Empty } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import ExternalDeviceCard, { type ExternalDevice } from './components/ExternalDeviceCard.vue';

const router = useRouter();

const devices = ref<ExternalDevice[]>([
  {
    id: 'usb-1',
    name: 'SanDisk U盘',
    type: 'usb',
    capacity: '128 GB',
    used: '45 GB',
    usedPercent: 35,
    status: 'connected',
    mountPath: '/mnt/usb0',
    fileSystem: 'exFAT',
  },
  {
    id: 'hdd-1',
    name: 'Seagate 移动硬盘',
    type: 'hdd',
    capacity: '2 TB',
    used: '850 GB',
    usedPercent: 42,
    status: 'connected',
    mountPath: '/mnt/usb1',
    fileSystem: 'NTFS',
  },
  {
    id: 'ssd-1',
    name: 'Samsung T7 SSD',
    type: 'ssd',
    capacity: '1 TB',
    used: '320 GB',
    usedPercent: 31,
    status: 'connected',
    mountPath: '/mnt/usb2',
    fileSystem: 'exFAT',
  },
  {
    id: 'sd-1',
    name: 'SD 存储卡',
    type: 'sd',
    capacity: '64 GB',
    used: '—',
    usedPercent: 0,
    status: 'disconnected',
    mountPath: '—',
    fileSystem: 'FAT32',
  },
]);

const overviewStats = computed(() => {
  const total = devices.value.length;
  const connected = devices.value.filter((d) => d.status === 'connected').length;
  const disconnected = devices.value.filter((d) => d.status === 'disconnected').length;
  return { total, connected, disconnected };
});

function openDeviceFiles(device: ExternalDevice) {
  if (device.status !== 'connected') return;
  router.push(`/file/external-device/${device.id}`);
}

function ejectDevice(device: ExternalDevice) {
  if (device.status !== 'connected') return;
  // STUB: 安全弹出功能待实现
}
</script>

<template>
  <div class="external-device-list">
    <!-- 页面顶部概览 -->
    <div class="page-header">
      <div class="page-header-left">
        <div class="page-icon-box">
          <IconifyIcon icon="lucide:usb" style="font-size: var(--ict-title-large); color: var(--ict-primary);" />
        </div>
        <div class="page-title-area">
          <h1 class="page-title">外接设备</h1>
          <p class="page-desc">查看和管理所有通过 USB 或 SD 卡槽连接到 NAS 的外部存储设备</p>
        </div>
      </div>
      <div class="page-header-right">
        <div class="overview-card">
          <IconifyIcon icon="lucide:hard-drive" style="font-size: var(--ict-title-medium); color: var(--ict-primary);" />
          <div class="overview-info">
            <span class="overview-label">设备总数</span>
            <span class="overview-value">{{ overviewStats.total }}</span>
          </div>
        </div>
        <div class="overview-card">
          <IconifyIcon icon="lucide:plug" style="font-size: var(--ict-title-medium); color: var(--ict-success);" />
          <div class="overview-info">
            <span class="overview-label">已连接</span>
            <span class="overview-value">{{ overviewStats.connected }}</span>
          </div>
        </div>
        <div class="overview-card">
          <IconifyIcon icon="lucide:unplug" style="font-size: var(--ict-title-medium); color: var(--ict-text-disabled);" />
          <div class="overview-info">
            <span class="overview-label">未连接</span>
            <span class="overview-value">{{ overviewStats.disconnected }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 设备卡片网格 -->
    <div v-if="devices.length > 0" class="device-grid">
      <Card
        v-for="device in devices"
        :key="device.id"
        class="device-card"
        :bordered="true"
        :body-style="{ padding: '0' }"
      >
        <ExternalDeviceCard
          :device="device"
          @manage="openDeviceFiles"
          @eject="ejectDevice"
        />
      </Card>
    </div>

    <!-- 空状态 -->
    <Empty
      v-else
      description="暂无外接设备"
      class="empty-state"
    >
      <template #image>
        <div class="empty-image">
          <IconifyIcon icon="lucide:usb" style="font-size: 56px; color: var(--ict-text-disabled);" />
        </div>
      </template>
    </Empty>
  </div>
</template>

<style scoped>
.external-device-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--ict-bg-card);
}

/* 页面顶部概览 */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: var(--ict-bg-card);
  border-bottom: 1px solid var(--ict-border-light);
  gap: 16px;
  flex-shrink: 0;
}

.page-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: var(--ict-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.page-title {
  font-size: var(--ict-title-medium);
  font-weight: 600;
  color: var(--ict-text-emphasis);
  margin: 0;
  line-height: 1.4;
}

.page-desc {
  font-size: var(--ict-body-small);
  color: var(--ict-text-secondary);
  margin: 2px 0 0;
}

.page-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.overview-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: var(--ict-bg-page);
  border-radius: 8px;
  min-width: 90px;
}

.overview-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.overview-label {
  font-size: var(--ict-mark-small);
  color: var(--ict-text-secondary);
}

.overview-value {
  font-size: var(--ict-title-medium);
  font-weight: 600;
  color: var(--ict-text-emphasis);
  font-family: var(--ict-font-family);
}

/* 设备卡片网格 */
.device-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 12px;
  padding: 16px 0;
}

.device-card {
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.device-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: var(--ict-primary);
}

/* 空状态 */
.empty-state {
  margin-top: 60px;
}

.empty-image {
  margin-bottom: 16px;
}

/* 响应式 */
@media (max-width: 768px) {
  .overview-stats {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .stat-item {
    border-right: none;
    border-bottom: 1px solid var(--ict-border-light);
    padding: 0 0 12px 0;
  }

  .stat-item:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .device-grid {
    grid-template-columns: 1fr;
  }
}
</style>

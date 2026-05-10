<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  Card,
  Button,
  Tag,
  Progress,
  Empty,
  Tooltip,
} from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';

const router = useRouter();

// ═══════════════════════════════════════════════════════════
// 类型定义
// ═══════════════════════════════════════════════════════════

interface ExternalDevice {
  id: string;
  name: string;
  type: 'usb' | 'sd' | 'ssd' | 'hdd';
  capacity: string;
  used: string;
  usedPercent: number;
  status: 'connected' | 'disconnected';
  mountPath: string;
  fileSystem: string;
}

// ═══════════════════════════════════════════════════════════
// Mock 外接设备数据
// ═══════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════
// 统计计算
// ═══════════════════════════════════════════════════════════

const overviewStats = computed(() => {
  const total = devices.value.length;
  const connected = devices.value.filter((d) => d.status === 'connected').length;
  const disconnected = devices.value.filter((d) => d.status === 'disconnected').length;

  return {
    total,
    connected,
    disconnected,
  };
});

// ═══════════════════════════════════════════════════════════
// 工具函数
// ═══════════════════════════════════════════════════════════

function getDeviceIcon(type: string): string {
  // 所有外接设备统一使用 U盘 图标
  return 'lucide:usb';
}

function getDeviceIconColor(type: string): string {
  // 所有外接设备统一使用 U盘 蓝色
  return '#1677ff';
}

function getDeviceTypeLabel(type: string): string {
  switch (type) {
    case 'usb':
      return 'U盘';
    case 'hdd':
      return '移动硬盘';
    case 'ssd':
      return '移动SSD';
    case 'sd':
      return 'SD卡';
    default:
      return '未知';
  }
}

function getStatusColor(status: string): string {
  return status === 'connected' ? 'success' : 'default';
}

function getStatusLabel(status: string): string {
  return status === 'connected' ? '已连接' : '未连接';
}

function getCapacityColor(percent: number): string {
  if (percent >= 90) return '#ff4d4f';
  if (percent >= 70) return '#faad14';
  return '#1677ff';
}

function getCapacityBg(percent: number): string {
  if (percent >= 90) return '#fff1f0';
  if (percent >= 70) return '#fffbe6';
  return '#e6f7ff';
}

// ═══════════════════════════════════════════════════════════
// 操作
// ═══════════════════════════════════════════════════════════

function openDeviceFiles(device: ExternalDevice) {
  if (device.status !== 'connected') {
    return;
  }
  router.push(`/file/external-device/${device.id}`);
}
</script>

<template>
  <div class="external-device-list">
    <!-- ═══════ 页面顶部概览 ═══════ -->
    <div class="page-header">
      <div class="page-header-left">
        <div class="page-icon-box">
          <IconifyIcon icon="lucide:usb" style="font-size: 20px; color: #1677ff;" />
        </div>
        <div class="page-title-area">
          <h1 class="page-title">外接设备</h1>
          <p class="page-desc">查看和管理所有通过 USB 或 SD 卡槽连接到 NAS 的外部存储设备</p>
        </div>
      </div>
      <div class="page-header-right">
        <div class="overview-card">
          <IconifyIcon icon="lucide:hard-drive" style="font-size: 16px; color: #1677ff;" />
          <div class="overview-info">
            <span class="overview-label">设备总数</span>
            <span class="overview-value">{{ overviewStats.total }}</span>
          </div>
        </div>
        <div class="overview-card">
          <IconifyIcon icon="lucide:plug" style="font-size: 16px; color: #52c41a;" />
          <div class="overview-info">
            <span class="overview-label">已连接</span>
            <span class="overview-value">{{ overviewStats.connected }}</span>
          </div>
        </div>
        <div class="overview-card">
          <IconifyIcon icon="lucide:unplug" style="font-size: 16px; color: #bfbfbf;" />
          <div class="overview-info">
            <span class="overview-label">未连接</span>
            <span class="overview-value">{{ overviewStats.disconnected }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════ 设备卡片网格 ═══════ -->
    <div v-if="devices.length > 0" class="device-grid">
      <Card
        v-for="device in devices"
        :key="device.id"
        class="device-card"
        :bordered="true"
        :body-style="{ padding: '0' }"
      >
        <div class="device-card-inner">
          <!-- 左侧：设备图标区域 -->
          <div
            class="device-visual"
            :style="{ background: getDeviceIconColor(device.type) + '12' }"
          >
            <div
              class="device-icon-box"
              :style="{
                background: getDeviceIconColor(device.type) + '18',
                borderColor: getDeviceIconColor(device.type) + '35',
              }"
            >
              <IconifyIcon
                :icon="getDeviceIcon(device.type)"
                class="device-icon"
                :style="{ color: getDeviceIconColor(device.type) }"
              />
            </div>
            <div
              class="device-status-dot"
              :style="{ background: device.status === 'connected' ? '#52c41a' : '#bfbfbf' }"
            />
          </div>

          <!-- 右侧：信息区域 -->
          <div class="device-info">
            <!-- 第一行：名称 + 状态 -->
            <div class="info-header">
              <div class="info-header-left">
                <span class="device-name">{{ device.name }}</span>
                <Tag :color="getStatusColor(device.status)" size="small">
                  <span
                    class="status-dot"
                    :style="{ background: device.status === 'connected' ? '#52c41a' : '#bfbfbf' }"
                  />
                  {{ getStatusLabel(device.status) }}
                </Tag>
              </div>
            </div>

            <!-- 第二行：类型 / 文件系统 -->
            <div class="info-meta">
              <span class="meta-chip">
                <IconifyIcon :icon="getDeviceIcon(device.type)" style="font-size: 11px;" />
                {{ getDeviceTypeLabel(device.type) }}
              </span>
              <span v-if="device.status === 'connected'" class="meta-chip">
                <IconifyIcon icon="lucide:folder-tree" style="font-size: 11px;" />
                {{ device.fileSystem }}
              </span>
            </div>

            <!-- 第三行：容量信息 -->
            <div v-if="device.status === 'connected'" class="info-capacity">
              <div class="capacity-row">
                <span class="capacity-text">
                  <span class="cap-used">{{ device.used }}</span>
                  <span class="cap-div">/</span>
                  <span class="cap-total">{{ device.capacity }}</span>
                </span>
                <span
                  class="cap-percent"
                  :style="{ color: getCapacityColor(device.usedPercent) }"
                >
                  {{ device.usedPercent }}%
                </span>
              </div>
              <Progress
                :percent="device.usedPercent"
                :stroke-color="getCapacityColor(device.usedPercent)"
                :show-info="false"
                :stroke-width="5"
                size="small"
              />
            </div>
            <div v-else class="info-capacity-disconnected">
              <span class="disconnected-hint">
                <IconifyIcon icon="lucide:unplug" style="font-size: 12px; color: #bfbfbf;" />
                设备未连接
              </span>
            </div>

            <!-- 第四行：操作按钮 -->
            <div class="info-actions">
              <Button
                type="primary"
                size="small"
                class="file-manage-btn"
                :disabled="device.status !== 'connected'"
                @click="openDeviceFiles(device)"
              >
                <IconifyIcon icon="lucide:folder-open" style="font-size: 12px;" />
                文件管理
              </Button>
              <Tooltip title="安全弹出">
                <Button
                  size="small"
                  class="action-btn"
                  :disabled="device.status !== 'connected'"
                >
                  <IconifyIcon icon="lucide:log-out" style="font-size: 12px;" />
                </Button>
              </Tooltip>
            </div>
          </div>
        </div>
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
          <IconifyIcon icon="lucide:usb" style="font-size: 56px; color: #d9d9d9;" />
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
  background: #f5f5f5;
}

/* ═══ 页面顶部概览 ═══ */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
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
  background: #e6f4ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.page-title {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  margin: 0;
  line-height: 1.4;
}

.page-desc {
  font-size: 12px;
  color: #8c8c8c;
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
  background: #f5f5f5;
  border-radius: 8px;
  min-width: 90px;
}

.overview-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.overview-label {
  font-size: 11px;
  color: #8c8c8c;
}

.overview-value {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

/* ═══ 设备卡片网格 ═══ */
.device-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 12px;
  padding: 16px;
}

/* ═══ 设备卡片网格 ═══ */
.device-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 12px;
}

.device-card {
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.device-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: #1677ff;
}

/* ═══ 卡片内部布局 ═══ */
.device-card-inner {
  display: flex;
  align-items: stretch;
  height: 100%;
}

/* 左侧图标区 */
.device-visual {
  width: 72px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 14px 10px;
  gap: 8px;
  flex-shrink: 0;
  position: relative;
  margin-right: 12px;
}

.device-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid;
}

.device-icon {
  font-size: 22px;
}

.device-status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08);
}

/* 右侧信息区 */
.device-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  padding: 14px 16px 14px 0;
  min-width: 0;
}

/* 名称行 */
.info-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.info-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.device-name {
  font-size: 15px;
  font-weight: 600;
  color: #262626;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 4px;
}

/* 元信息行 */
.info-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.meta-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 12px;
  color: #595959;
}

/* 容量行 */
.info-capacity {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.capacity-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.capacity-text {
  font-size: 12px;
  color: #8c8c8c;
}

.cap-used {
  font-weight: 600;
  color: #262626;
}

.cap-div {
  margin: 0 3px;
  color: #bfbfbf;
}

.cap-total {
  color: #8c8c8c;
}

.cap-percent {
  font-size: 13px;
  font-weight: 700;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.info-capacity-disconnected {
  padding: 4px 0;
}

.disconnected-hint {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #bfbfbf;
}

/* 操作按钮行 */
.info-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.file-manage-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: 6px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border-radius: 6px;
}

/* ═══ 空状态 ═══ */
.empty-state {
  margin-top: 60px;
}

.empty-image {
  margin-bottom: 16px;
}

/* ═══ 响应式 ═══ */
@media (max-width: 768px) {
  .overview-stats {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .stat-item {
    border-right: none;
    border-bottom: 1px solid #f0f0f0;
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

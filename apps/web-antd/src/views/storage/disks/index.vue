<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import {
  Card,
  Tag,
  Badge,
  Tabs,
  Button,
  Modal,
  message,
  Tooltip,
} from 'ant-design-vue';
import { useRouter } from 'vue-router';
import { IconifyIcon } from '@vben/icons';
import {
  getDisksApi,
  getStoragePoolsApi,
  type DiskInfo,
  type StoragePool,
} from '#/api/storage';

const router = useRouter();
const disks = ref<DiskInfo[]>([]);
const pools = ref<StoragePool[]>([]);
const loading = ref(false);
const activeTab = ref('all');

// 点灯状态记录：deviceName -> boolean
const blinkState = ref<Map<string, boolean>>(new Map());

// 详细信息弹窗
const detailModalVisible = ref(false);
const detailModalTitle = ref('');
const detailModalContent = ref('');

// 统计数据
const stats = computed(() => {
  const total = disks.value.length;
  const internal = disks.value.filter(
    (d) => d.deviceType?.includes('HDD') || d.deviceType?.includes('SSD'),
  ).length;
  const external = total - internal;
  return { total, internal, external };
});

// 过滤后的硬盘列表
const filteredDisks = computed(() => {
  if (activeTab.value === 'internal') {
    return disks.value.filter(
      (d) => d.deviceType?.includes('HDD') || d.deviceType?.includes('SSD'),
    );
  }
  if (activeTab.value === 'external') {
    return disks.value.filter(
      (d) => !d.deviceType?.includes('HDD') && !d.deviceType?.includes('SSD'),
    );
  }
  return disks.value;
});

async function loadData() {
  loading.value = true;
  try {
    const [disksRes, poolsRes] = await Promise.all([
      getDisksApi(),
      getStoragePoolsApi(),
    ]);
    disks.value = disksRes;
    pools.value = poolsRes;
  } finally {
    loading.value = false;
  }
}

function copySerial(serial: string) {
  navigator.clipboard.writeText(serial);
  message.success('序列号已复制');
}

function getStatusColor(status: string): string {
  switch (status) {
    case '运行中':
      return 'success';
    case '休眠':
      return 'warning';
    case '未使用':
      return 'default';
    default:
      return 'default';
  }
}

function getStatusDot(status: string): string {
  switch (status) {
    case '运行中':
      return '#52c41a';
    case '休眠':
      return '#faad14';
    default:
      return '#bfbfbf';
  }
}

function getHealthColor(health?: string): string {
  switch (health) {
    case '正常':
      return 'success';
    case '警告':
      return 'warning';
    case '异常':
      return 'error';
    default:
      return 'default';
  }
}

function getHealthBadgeColor(health?: string): string {
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

// 卡片头部渐变背景
function getCardHeaderBg(disk: DiskInfo): string {
  const status = disk.status;
  if (status === '休眠') {
    return 'linear-gradient(135deg, #fff7e6 0%, #ffe7ba 100%)';
  }
  if (disk.healthStatus === '异常') {
    return 'linear-gradient(135deg, #fff1f0 0%, #ffccc7 100%)';
  }
  if (disk.usageStatus === '使用中' || status === '运行中') {
    return 'linear-gradient(135deg, #e6f7ff 0%, #bae0ff 100%)';
  }
  return 'linear-gradient(135deg, #f5f5f5 0%, #d9d9d9 100%)';
}

// 设备图标
function getDeviceIcon(deviceType?: string): string {
  if (deviceType?.includes('SSD')) return 'lucide:cpu';
  if (deviceType?.includes('NVMe')) return 'lucide:zap';
  return 'lucide:hard-drive';
}

function getDeviceIconColor(deviceType?: string): string {
  if (deviceType?.includes('SSD')) return '#722ed1';
  if (deviceType?.includes('NVMe')) return '#eb2f96';
  return '#1677ff';
}

// 文件系统图标
function getFsIcon(fs?: string): string {
  if (!fs) return 'lucide:folder';
  if (fs === 'ext4') return 'lucide:folder-tree';
  if (fs === 'btrfs') return 'lucide:layers';
  if (fs === 'xfs') return 'lucide:database';
  if (fs === 'ntfs') return 'lucide:monitor';
  if (fs === '未知') return 'lucide:folder-question';
  return 'lucide:folder';
}

function formatHours(hours?: number): string {
  if (!hours) return '--';
  const days = Math.floor(hours / 24);
  if (days > 365) {
    const years = (days / 365).toFixed(1);
    return `${years}年`;
  }
  return `${days}天`;
}

function sleepDisk(disk: DiskInfo) {
  message.success(`硬盘 ${disk.deviceName} (${disk.model}) 已休眠`);
  disk.status = '休眠';
}

function blinkDisk(disk: DiskInfo) {
  const current = blinkState.value.get(disk.deviceName) || false;
  blinkState.value.set(disk.deviceName, !current);
  if (!current) {
    message.success(`硬盘 ${disk.deviceName} (${disk.model}) 指示灯已开启`);
  } else {
    message.success(`硬盘 ${disk.deviceName} (${disk.model}) 指示灯已关闭`);
  }
}

function isBlinking(disk: DiskInfo): boolean {
  return blinkState.value.get(disk.deviceName) || false;
}

function showDiskDetail(disk: DiskInfo) {
  detailModalTitle.value = `硬盘 ${disk.deviceName} - SMART 详细信息`;
  detailModalContent.value =
    disk.smartctlInfo || '暂无 SMART 信息';
  detailModalVisible.value = true;
}

function getPoolNames(poolIds?: string[]): string[] {
  if (!poolIds || poolIds.length === 0) return [];
  return poolIds
    .map((id) => pools.value.find((p) => p.id === id)?.name)
    .filter(Boolean) as string[];
}

function goToPool(poolId: string) {
  router.push(`/storage/pools/detail/${poolId}`);
}

onMounted(loadData);
</script>

<template>
  <div class="disk-manager">
    <!-- Tab 切换 -->
    <div class="disk-toolbar">
      <Tabs v-model:active-key="activeTab" class="disk-tabs">
        <Tabs.TabPane key="all">
          <template #tab>
            <span class="tab-label">全部</span>
            <Badge
              :count="stats.total"
              :overflow-count="999"
              class="tab-badge"
              style="background-color: #1677ff"
            />
          </template>
        </Tabs.TabPane>
        <Tabs.TabPane key="internal">
          <template #tab>
            <span class="tab-label">内置</span>
            <Badge
              :count="stats.internal"
              :overflow-count="999"
              class="tab-badge"
              style="background-color: #52c41a"
            />
          </template>
        </Tabs.TabPane>
        <Tabs.TabPane key="external">
          <template #tab>
            <span class="tab-label">外接</span>
            <Badge
              :count="stats.external"
              :overflow-count="999"
              class="tab-badge"
              style="background-color: #faad14"
            />
          </template>
        </Tabs.TabPane>
      </Tabs>
    </div>

    <!-- 分区标题 -->
    <div class="section-title">
      <IconifyIcon icon="lucide:hard-drive" class="section-icon" />
      内置硬盘
      <span class="section-count">{{ filteredDisks.length }}</span>
    </div>

    <!-- 硬盘列表 -->
    <div class="disk-list">
      <Card
        v-for="(disk, index) in filteredDisks"
        :key="disk.deviceName"
        class="disk-card"
        :bordered="true"
        :body-style="{ padding: '0' }"
      >
        <!-- 卡片头部渐变条 -->
        <div
          class="disk-card-header"
          :style="{ background: getCardHeaderBg(disk) }"
        >
          <div class="header-left">
            <span class="header-index">#{{ index + 1 }}</span>
            <Tag
              :color="getStatusColor(disk.status)"
              class="header-status"
              size="small"
            >
              <span
                class="status-dot"
                :style="{ background: getStatusDot(disk.status) }"
              />
              {{ disk.usageStatus || disk.status }}
            </Tag>
          </div>
          <div class="header-temp" v-if="disk.temperature !== undefined">
            <IconifyIcon icon="lucide:thermometer" class="temp-icon" />
            <span class="temp-value">{{ disk.temperature }}°C</span>
          </div>
        </div>

        <div class="disk-card-inner">
          <!-- 左侧：设备信息区 -->
          <div class="disk-left">
            <div
              class="disk-icon-box"
              :style="{
                background: `${getDeviceIconColor(disk.deviceType)}15`,
                borderColor: `${getDeviceIconColor(disk.deviceType)}30`,
              }"
            >
              <IconifyIcon
                :icon="getDeviceIcon(disk.deviceType)"
                class="disk-icon"
                :style="{ color: getDeviceIconColor(disk.deviceType) }"
              />
            </div>
            <div class="disk-capacity">
              <div class="disk-device-name">{{ disk.deviceName }}</div>
              <div class="capacity-value">{{ disk.size }}</div>
            </div>
          </div>

          <!-- 右侧：详情区域 -->
          <div class="disk-detail">
            <div class="detail-row">
              <div class="detail-col">
                <div class="detail-item">
                  <span class="detail-label">
                    <IconifyIcon icon="lucide:cpu" class="detail-label-icon" />
                    型号
                  </span>
                  <span class="detail-value">{{ disk.model || 'QEMU_HARDDISK' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">
                    <IconifyIcon icon="lucide:plug" class="detail-label-icon" />
                    接口
                  </span>
                  <span class="detail-value">{{ disk.interfaceType || 'SATA' }}</span>
                </div>
              </div>
              <div class="detail-col">
                <div class="detail-item">
                  <span class="detail-label">
                    <IconifyIcon icon="lucide:tag" class="detail-label-icon" />
                    类型
                  </span>
                  <span class="detail-value">{{ disk.deviceType || 'HDD' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">
                    <IconifyIcon icon="lucide:fingerprint" class="detail-label-icon" />
                    序列号
                  </span>
                  <span class="detail-value serial-value">
                    {{ disk.serial }}
                    <Tooltip title="复制序列号">
                      <span class="copy-icon" @click="copySerial(disk.serial)">
                        <IconifyIcon icon="lucide:copy" style="font-size: 12px;" />
                      </span>
                    </Tooltip>
                  </span>
                </div>
              </div>
              <div class="detail-col">
                <div class="detail-item">
                  <span class="detail-label">
                    <IconifyIcon icon="lucide:heart-pulse" class="detail-label-icon" />
                    健康状态
                  </span>
                  <span class="detail-value">
                    <span
                      class="health-badge"
                      :style="{ color: getHealthBadgeColor(disk.healthStatus), borderColor: getHealthBadgeColor(disk.healthStatus) }"
                    >
                      <span
                        class="health-dot"
                        :style="{ background: getHealthBadgeColor(disk.healthStatus) }"
                      />
                      {{ disk.healthStatus || '不支持检测' }}
                    </span>
                  </span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">
                    <IconifyIcon icon="lucide:clock" class="detail-label-icon" />
                    使用时长
                  </span>
                  <span class="detail-value">{{ formatHours(disk.usedHours) }}</span>
                </div>
              </div>
            </div>

            <!-- 所属存储池 -->
            <div
              v-if="disk.poolIds && disk.poolIds.length > 0"
              class="disk-pools"
            >
              <span class="pools-label">
                <IconifyIcon icon="lucide:database" style="font-size: 12px;" />
                所属存储池
              </span>
              <span class="pools-list">
                <Tag
                  v-for="pid in disk.poolIds"
                  :key="pid"
                  color="blue"
                  class="pool-tag"
                  @click="goToPool(pid)"
                >
                  <IconifyIcon icon="lucide:layers" style="font-size: 11px; margin-right: 2px;" />
                  {{ pools.find((p) => p.id === pid)?.name || pid }}
                </Tag>
              </span>
            </div>

            <!-- 分区信息 -->
            <div
              v-if="disk.partitions && disk.partitions.length > 0"
              class="disk-partitions"
            >
              <div class="partitions-title">
                <IconifyIcon icon="lucide:folder-open" style="font-size: 12px;" />
                分区信息
              </div>
              <div class="partition-grid">
                <div
                  v-for="part in disk.partitions"
                  :key="part.name"
                  class="partition-cell"
                >
                  <div class="partition-header">
                    <div
                      class="partition-icon-box"
                      :style="{ background: `${getDeviceIconColor()}10` }"
                    >
                      <IconifyIcon
                        :icon="getFsIcon(part.filesystem)"
                        class="partition-icon"
                      />
                    </div>
                    <span class="partition-name">{{ part.name }}</span>
                  </div>
                  <div class="partition-body">
                    <span class="partition-size">{{ part.size }}</span>
                    <Tag
                      v-if="part.filesystem && part.filesystem !== '未知'"
                      size="small"
                      class="partition-fs"
                    >
                      {{ part.filesystem }}
                    </Tag>
                  </div>
                  <div v-if="part.mountPoint" class="partition-mount">
                    <Tag color="blue" size="small" class="mount-tag">
                      <IconifyIcon icon="lucide:link" style="font-size: 10px; margin-right: 2px;" />
                      {{ part.mountPoint }}
                    </Tag>
                  </div>
                </div>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="disk-actions">
              <Button
                size="small"
                class="action-btn disk-sleep-btn"
                @click="sleepDisk(disk)"
              >
                <IconifyIcon icon="lucide:moon" class="action-icon" />
                休眠
              </Button>
              <Button
                size="small"
                :class="[
                  'action-btn',
                  'blink-btn',
                  isBlinking(disk) ? 'blink-active' : '',
                ]"
                @click="blinkDisk(disk)"
              >
                <IconifyIcon
                  :icon="isBlinking(disk) ? 'lucide:lightbulb-off' : 'lucide:lightbulb'"
                  :class="['action-icon', isBlinking(disk) ? 'blink-pulse' : '']"
                />
                {{ isBlinking(disk) ? '关灯' : '点灯' }}
              </Button>
              <Button
                size="small"
                class="action-btn detail-btn"
                @click="showDiskDetail(disk)"
              >
                <IconifyIcon icon="lucide:activity" class="action-icon" />
                SMART
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>

    <!-- 详细信息弹窗 -->
    <Modal
      v-model:open="detailModalVisible"
      :title="detailModalTitle"
      width="900px"
      :footer="null"
      class="smart-modal"
    >
      <pre class="smart-content">{{ detailModalContent }}</pre>
    </Modal>
  </div>
</template>

<style scoped>
.disk-manager {
  padding: 0 24px 24px;
  width: 100%;
}

/* 工具栏 */
.disk-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.disk-tabs :deep(.ant-tabs-nav) {
  margin-bottom: 0;
}

.disk-tabs :deep(.ant-tabs-tab) {
  padding: 12px 16px;
  font-size: 14px;
}

.tab-badge :deep(.ant-badge-count) {
  margin-left: 6px;
  font-size: 11px;
  min-width: 18px;
  height: 18px;
  line-height: 18px;
}

/* 分区标题 */
.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 16px;
  padding-left: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-icon {
  font-size: 18px;
  color: #1677ff;
}

.section-count {
  color: #8c8c8c;
  font-weight: 400;
  margin-left: 4px;
}

/* 硬盘列表 */
.disk-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.disk-card {
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.disk-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: #1677ff;
}

/* 卡片头部渐变条 */
.disk-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-index {
  font-size: 12px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.45);
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.header-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}

.header-temp {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #595959;
}

.temp-icon {
  font-size: 13px;
  color: #faad14;
}

.temp-value {
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.disk-card-inner {
  display: flex;
  padding: 20px 24px;
  gap: 20px;
}

/* 左侧区域 */
.disk-left {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-shrink: 0;
  min-width: 180px;
  padding-right: 20px;
  border-right: 1px solid #f0f0f0;
}

.disk-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid;
}

.disk-icon {
  font-size: 24px;
}

.disk-capacity {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.disk-device-name {
  font-size: 20px;
  font-weight: 700;
  color: #262626;
  line-height: 1.2;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.capacity-value {
  font-size: 14px;
  font-weight: 600;
  color: #1677ff;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

/* 右侧详情区域 */
.disk-detail {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.detail-row {
  display: flex;
  gap: 40px;
}

.detail-col {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 160px;
}

.detail-item {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.detail-label {
  font-size: 12px;
  color: #8c8c8c;
  flex-shrink: 0;
  width: 64px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.detail-label-icon {
  font-size: 12px;
  color: #bfbfbf;
}

.detail-value {
  font-size: 13px;
  color: #262626;
  font-weight: 500;
}

.serial-value {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.copy-icon {
  font-size: 12px;
  color: #bfbfbf;
  cursor: pointer;
  transition: color 0.2s;
  display: inline-flex;
  align-items: center;
}

.copy-icon:hover {
  color: #1677ff;
}

/* 健康状态徽章 */
.health-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 10px;
  border: 1px solid;
  font-size: 12px;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.8);
}

.health-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

/* 所属存储池 */
.disk-pools {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.pools-label {
  color: #8c8c8c;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.pools-list {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.pool-tag {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
}

.pool-tag:hover {
  opacity: 0.85;
}

/* 分区信息 */
.disk-partitions {
  border-top: 1px dashed #f0f0f0;
  padding-top: 14px;
}

.partitions-title {
  font-size: 12px;
  font-weight: 600;
  color: #595959;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.partition-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.partition-cell {
  background: #fafafa;
  border-radius: 10px;
  padding: 12px 14px;
  border: 1px solid #f0f0f0;
  transition: all 0.2s ease;
}

.partition-cell:hover {
  background: #f0f5ff;
  border-color: #bae0ff;
}

.partition-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.partition-icon-box {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.partition-icon {
  font-size: 14px;
  color: #1677ff;
}

.partition-name {
  font-size: 13px;
  font-weight: 600;
  color: #262626;
}

.partition-body {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.partition-size {
  font-size: 12px;
  color: #595959;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.partition-fs {
  font-size: 11px;
}

.partition-mount {
  font-size: 11px;
}

.mount-tag {
  display: inline-flex;
  align-items: center;
}

/* 操作按钮 */
.disk-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-btn {
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: 6px;
}

.action-icon {
  font-size: 13px;
}

.blink-active {
  background: #fff7e6;
  border-color: #ffd591;
  color: #d46b08;
}

.blink-pulse {
  animation: blink-pulse 1.5s ease-in-out infinite;
}

@keyframes blink-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

/* SMART 弹窗 */
.smart-content {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 16px;
  border-radius: 6px;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 12px;
  line-height: 1.6;
  overflow-x: auto;
  max-height: 600px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 响应式 */
@media (max-width: 1200px) {
  .detail-row {
    gap: 24px;
  }

  .detail-col {
    min-width: 140px;
  }
}

@media (max-width: 992px) {
  .disk-card-inner {
    flex-direction: column;
    gap: 16px;
  }

  .disk-left {
    min-width: auto;
    border-right: none;
    border-bottom: 1px solid #f0f0f0;
    padding-right: 0;
    padding-bottom: 16px;
  }

  .detail-row {
    flex-wrap: wrap;
    gap: 12px 24px;
  }

  .detail-col {
    min-width: 130px;
  }

  .partition-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
}

@media (max-width: 576px) {
  .disk-manager {
    padding: 0 12px 12px;
  }

  .disk-toolbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .disk-card-inner {
    padding: 16px;
  }

  .detail-row {
    flex-direction: column;
    gap: 10px;
  }

  .partition-grid {
    grid-template-columns: 1fr;
  }

  .disk-actions {
    flex-wrap: wrap;
  }
}
</style>

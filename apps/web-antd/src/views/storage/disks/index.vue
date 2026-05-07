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
} from 'ant-design-vue';
import { useRouter } from 'vue-router';
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
        <Tabs.TabPane key="all" :tab="`全部 ${stats.total}`" />
        <Tabs.TabPane key="internal" :tab="`内置 ${stats.internal}`" />
        <Tabs.TabPane key="external" :tab="`外接 ${stats.external}`" />
      </Tabs>
    </div>

    <!-- 内置硬盘标题 -->
    <div class="section-title">
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
        <div class="disk-card-inner">
          <!-- 操作按钮区 -->
          <div class="disk-actions">
            <Button
              size="small"
              class="action-btn disk-sleep-btn"
              @click="sleepDisk(disk)"
            >
              ⏻ 休眠
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
              💡 {{ isBlinking(disk) ? '关灯' : '点灯' }}
            </Button>
            <Button
              size="small"
              class="action-btn detail-btn"
              @click="showDiskDetail(disk)"
            >
              ℹ 详细信息
            </Button>
          </div>

          <!-- 左侧：序号 + 图标 + 容量 -->
          <div class="disk-left">
            <div class="disk-index">{{ index + 1 }}</div>
            <div class="disk-icon-box">
              <span class="disk-icon">💾</span>
            </div>
            <div class="disk-capacity">
              <div class="disk-device-name">{{ disk.deviceName }}</div>
              <div class="capacity-value">{{ disk.size }}</div>
              <Tag
                :color="
                  getStatusColor(
                    disk.usageStatus === '使用中' ? '运行中' : '未使用',
                  )
                "
                class="status-tag"
                size="small"
              >
                {{ disk.usageStatus || disk.status }}
              </Tag>
            </div>
          </div>

          <!-- 右侧：详细信息网格 -->
          <div class="disk-detail">
            <div class="detail-row">
              <div class="detail-col">
                <div class="detail-item">
                  <span class="detail-label">硬盘类型</span>
                  <span class="detail-value">{{ disk.deviceType || 'HDD' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">接口协议</span>
                  <span class="detail-value">{{ disk.interfaceType || 'SCSI' }}</span>
                </div>
              </div>
              <div class="detail-col">
                <div class="detail-item">
                  <span class="detail-label">型号</span>
                  <span class="detail-value">{{ disk.model || 'QEMU_HARDDISK' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">序列号</span>
                  <span class="detail-value serial-value">
                    {{ disk.serial }}
                    <span class="copy-icon" @click="copySerial(disk.serial)">📋</span>
                  </span>
                </div>
              </div>
              <div class="detail-col">
                <div class="detail-item">
                  <span class="detail-label">健康状态</span>
                  <span class="detail-value">
                    <Tag :color="getHealthColor(disk.healthStatus)" size="small">
                      {{ disk.healthStatus || '不支持检测' }}
                    </Tag>
                  </span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">使用时长</span>
                  <span class="detail-value">{{ formatHours(disk.usedHours) }}</span>
                </div>
              </div>
            </div>

            <!-- 所属存储池 -->
            <div
              v-if="disk.poolIds && disk.poolIds.length > 0"
              class="disk-pools"
            >
              <span class="pools-label">所属存储池：</span>
              <span class="pools-list">
                <Tag
                  v-for="pid in disk.poolIds"
                  :key="pid"
                  color="blue"
                  class="pool-tag"
                  @click="goToPool(pid)"
                >
                  {{ pools.find((p) => p.id === pid)?.name || pid }}
                </Tag>
              </span>
            </div>

            <!-- 分区信息 -->
            <div
              v-if="disk.partitions && disk.partitions.length > 0"
              class="disk-partitions"
            >
              <div class="partition-grid">
                <div
                  v-for="part in disk.partitions"
                  :key="part.name"
                  class="partition-cell"
                >
                  <div class="partition-header">
                    <span class="partition-icon">📂</span>
                    <span class="partition-name">{{ part.name }}</span>
                  </div>
                  <div class="partition-body">
                    <span class="partition-size">{{ part.size }}</span>
                    <Tag
                      v-if="part.filesystem"
                      size="small"
                      class="partition-fs"
                    >
                      {{ part.filesystem }}
                    </Tag>
                  </div>
                  <div v-if="part.mountPoint" class="partition-mount">
                    <Tag color="blue" size="small">
                      {{ part.mountPoint }}
                    </Tag>
                  </div>
                </div>
              </div>
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

/* 分区标题 */
.section-title {
  font-size: 14px;
  font-weight: 500;
  color: #262626;
  margin-bottom: 12px;
  padding-left: 4px;
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
  gap: 12px;
}

.disk-card {
  border-radius: 8px;
  transition: box-shadow 0.2s ease;
}

.disk-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
}

.disk-card-inner {
  display: flex;
  padding: 20px 24px;
  gap: 16px;
}

/* 操作按钮区 */
.disk-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
  padding-right: 12px;
  border-right: 1px solid #f0f0f0;
}

.action-btn {
  min-width: 80px;
  font-size: 12px;
}

.blink-active {
  background: #fff7e6;
  border-color: #ffd591;
  color: #d46b08;
}

/* 左侧区域 */
.disk-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  min-width: 160px;
}

.disk-index {
  font-size: 13px;
  color: #bfbfbf;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
}

.disk-icon-box {
  width: 40px;
  height: 40px;
  background: #f0f5ff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.disk-icon {
  font-size: 20px;
  color: #2f54eb;
}

.disk-capacity {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.disk-device-name {
  font-size: 18px;
  font-weight: 700;
  color: #262626;
  line-height: 1.2;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.capacity-value {
  font-size: 14px;
  font-weight: 500;
  color: #595959;
}

.status-tag {
  font-size: 12px;
  line-height: 1.5;
  align-self: flex-start;
}

/* 右侧详情区域 */
.disk-detail {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  gap: 48px;
}

.detail-col {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 180px;
}

.detail-item {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.detail-label {
  font-size: 13px;
  color: #8c8c8c;
  flex-shrink: 0;
  width: 60px;
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
}

.copy-icon:hover {
  color: #1890ff;
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
}

.pools-list {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.pool-tag {
  cursor: pointer;
}

.pool-tag:hover {
  opacity: 0.85;
}

/* 分区信息 */
.disk-partitions {
  border-top: 1px dashed #f0f0f0;
  padding-top: 12px;
}

.partition-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.partition-cell {
  background: #fafafa;
  border-radius: 6px;
  padding: 10px 14px;
  border: 1px solid #f0f0f0;
}

.partition-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.partition-icon {
  font-size: 14px;
  color: #595959;
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
  font-size: 13px;
  color: #595959;
}

.partition-fs {
  font-size: 11px;
}

.partition-mount {
  font-size: 11px;
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
    gap: 32px;
  }

  .detail-col {
    min-width: 150px;
  }
}

@media (max-width: 992px) {
  .disk-card-inner {
    flex-direction: column;
    gap: 16px;
  }

  .disk-actions {
    flex-direction: row;
    border-right: none;
    border-bottom: 1px solid #f0f0f0;
    padding-right: 0;
    padding-bottom: 12px;
  }

  .disk-left {
    min-width: auto;
  }

  .detail-row {
    flex-wrap: wrap;
    gap: 16px 32px;
  }

  .detail-col {
    min-width: 140px;
  }

  .partition-grid {
    grid-template-columns: 1fr;
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
}
</style>

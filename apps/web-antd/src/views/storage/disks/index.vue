<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import {
  Card,
  Tag,
  Button,
  Modal,
  message,
  Tooltip,
  Input,
  Select,
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

// 过滤条件
const filterModel = ref('');
const filterStatus = ref<string>('all');
const filterCapacity = ref<string>('all');

// 点灯状态记录：deviceName -> boolean
const blinkState = ref<Map<string, boolean>>(new Map());

// 详细信息弹窗
const detailModalVisible = ref(false);
const detailModalTitle = ref('');
const detailModalContent = ref('');

// 解析容量大小用于过滤（返回字节数）
function parseCapacity(size?: string): number {
  if (!size) return 0;
  const match = size.match(/^([\d.]+)\s*(TB|GB|MB|PB)/i);
  if (!match) return 0;
  const val = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  const multipliers: Record<string, number> = {
    MB: 1024 ** 2,
    GB: 1024 ** 3,
    TB: 1024 ** 4,
    PB: 1024 ** 5,
  };
  return val * (multipliers[unit] || 0);
}

// 过滤后的硬盘列表
const filteredDisks = computed(() => {
  let result = disks.value;

  // 型号搜索过滤
  if (filterModel.value.trim()) {
    const kw = filterModel.value.trim().toLowerCase();
    result = result.filter(
      (d) =>
        d.model?.toLowerCase().includes(kw) ||
        d.deviceName?.toLowerCase().includes(kw) ||
        d.serial?.toLowerCase().includes(kw),
    );
  }

  // 使用状态过滤
  if (filterStatus.value !== 'all') {
    result = result.filter((d) => {
      const st = d.usageStatus || d.status;
      if (filterStatus.value === 'running') return st === '使用中' || st === '运行中';
      if (filterStatus.value === 'sleep') return st === '休眠';
      if (filterStatus.value === 'unused') return st === '未使用';
      return true;
    });
  }

  // 容量过滤
  if (filterCapacity.value !== 'all') {
    result = result.filter((d) => {
      const bytes = parseCapacity(d.size);
      const tb = bytes / (1024 ** 4);
      if (filterCapacity.value === 'lt1') return tb < 1;
      if (filterCapacity.value === '1to4') return tb >= 1 && tb < 4;
      if (filterCapacity.value === 'gte4') return tb >= 4;
      return true;
    });
  }

  return result;
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

function resetFilters() {
  filterModel.value = '';
  filterStatus.value = 'all';
  filterCapacity.value = 'all';
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

function formatHours(hours?: number): string {
  if (!hours) return '--';
  const days = Math.floor(hours / 24);
  if (days > 365) {
    const years = (days / 365).toFixed(1);
    return `${years}年`;
  }
  return `${days}天`;
}

// 提取分区总大小（去掉已用/可用部分）
function getPartitionTotalSize(size?: string): string {
  if (!size) return '';
  if (size.includes('/')) {
    return size.split('/').pop()?.trim() || size;
  }
  return size;
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

function goToPool(poolId: string) {
  router.push(`/storage/pools/detail/${poolId}`);
}

function goToDiskDetail(disk: DiskInfo) {
  router.push(`/storage/disks/detail/${disk.deviceName}`);
}

onMounted(loadData);
</script>

<template>
  <div class="disk-manager">
    <!-- 过滤栏 -->
    <div class="filter-bar">
      <div class="filter-item filter-search">
        <IconifyIcon icon="lucide:search" class="filter-icon" />
        <Input
          v-model:value="filterModel"
          placeholder="搜索型号 / 设备名 / 序列号"
          class="filter-input"
          allow-clear
          size="small"
        />
      </div>
      <div class="filter-item">
        <Select
          v-model:value="filterStatus"
          class="filter-select"
          size="small"
        >
          <Select.Option value="all">全部状态</Select.Option>
          <Select.Option value="running">使用中</Select.Option>
          <Select.Option value="sleep">休眠</Select.Option>
          <Select.Option value="unused">未使用</Select.Option>
        </Select>
      </div>
      <div class="filter-item">
        <Select
          v-model:value="filterCapacity"
          class="filter-select"
          size="small"
        >
          <Select.Option value="all">全部容量</Select.Option>
          <Select.Option value="lt1">小于 1TB</Select.Option>
          <Select.Option value="1to4">1TB - 4TB</Select.Option>
          <Select.Option value="gte4">4TB 及以上</Select.Option>
        </Select>
      </div>
      <Button
        size="small"
        class="filter-reset-btn"
        @click="resetFilters"
      >
        <IconifyIcon icon="lucide:rotate-ccw" style="font-size: 12px;" />
        重置
      </Button>
      <span class="filter-count">
        共 <strong>{{ filteredDisks.length }}</strong> 块硬盘
      </span>
    </div>

    <!-- 硬盘卡片网格 -->
    <div class="disk-grid">
      <Card
        v-for="disk in filteredDisks"
        :key="disk.deviceName"
        class="disk-card"
        :bordered="true"
        :body-style="{ padding: '0', height: '100%' }"
      >
        <div class="disk-card-inner">
          <!-- 第一行：图标 + 设备名 + 容量 + 操作按钮 -->
          <div class="card-header-row">
            <div class="header-main">
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
              <div class="header-title">
                <span class="disk-device-name">{{ disk.deviceName }}</span>
                <span class="disk-capacity">{{ disk.size }}</span>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="header-actions">
              <Button
                size="small"
                type="primary"
                class="detail-btn"
                @click="goToDiskDetail(disk)"
              >
                <IconifyIcon icon="lucide:file-text" style="font-size: 12px;" />
                详情
              </Button>
              <Tooltip title="休眠硬盘">
                <Button
                  size="small"
                  class="action-btn"
                  @click="sleepDisk(disk)"
                >
                  <IconifyIcon icon="lucide:moon" class="action-icon" />
                </Button>
              </Tooltip>
              <Tooltip :title="isBlinking(disk) ? '关闭指示灯' : '开启指示灯'">
                <Button
                  size="small"
                  :class="['action-btn', isBlinking(disk) ? 'blink-active' : '']"
                  @click="blinkDisk(disk)"
                >
                  <IconifyIcon
                    :icon="isBlinking(disk) ? 'lucide:lightbulb-off' : 'lucide:lightbulb'"
                    :class="['action-icon', isBlinking(disk) ? 'blink-pulse' : '']"
                  />
                </Button>
              </Tooltip>
              <Tooltip title="查看 SMART 信息">
                <Button
                  size="small"
                  class="action-btn"
                  @click="showDiskDetail(disk)"
                >
                  <IconifyIcon icon="lucide:activity" class="action-icon" />
                </Button>
              </Tooltip>
            </div>
          </div>

          <!-- 第二行：状态标签组 -->
          <div class="card-meta-row">
            <Tag
              :color="getStatusColor(disk.status)"
              class="status-tag"
              size="small"
            >
              <span
                class="status-dot"
                :style="{ background: getStatusDot(disk.status) }"
              />
              {{ disk.usageStatus || disk.status }}
            </Tag>
            <span
              v-if="disk.healthStatus"
              class="health-badge"
              :style="{ color: getHealthBadgeColor(disk.healthStatus), borderColor: getHealthBadgeColor(disk.healthStatus) }"
            >
              <span
                class="health-dot"
                :style="{ background: getHealthBadgeColor(disk.healthStatus) }"
              />
              {{ disk.healthStatus }}
            </span>
            <span v-if="disk.temperature !== undefined" class="meta-badge temp-badge">
              <IconifyIcon icon="lucide:thermometer" class="meta-icon" />
              {{ disk.temperature }}°C
            </span>
            <span v-if="disk.usedHours" class="meta-badge hours-badge">
              <IconifyIcon icon="lucide:clock" class="meta-icon" />
              {{ formatHours(disk.usedHours) }}
            </span>
          </div>

          <!-- 分隔线 -->
          <div class="disk-divider" />

          <!-- 第三行：型号 / 接口 / 类型 / 序列号 -->
          <div class="card-attrs">
            <div class="attr-item">
              <span class="attr-label">型号</span>
              <span class="attr-value" :title="disk.model || 'QEMU_HARDDISK'">{{ disk.model || 'QEMU_HARDDISK' }}</span>
            </div>
            <div class="attr-item">
              <span class="attr-label">接口</span>
              <span class="attr-value">{{ disk.interfaceType || 'SATA' }}</span>
            </div>
            <div class="attr-item">
              <span class="attr-label">类型</span>
              <span class="attr-value">{{ disk.deviceType || 'HDD' }}</span>
            </div>
            <div class="attr-item">
              <span class="attr-label">序列号</span>
              <span class="attr-value serial-value">
                {{ disk.serial }}
                <Tooltip title="复制序列号">
                  <span class="copy-icon" @click="copySerial(disk.serial)">
                    <IconifyIcon icon="lucide:copy" style="font-size: 11px;" />
                  </span>
                </Tooltip>
              </span>
            </div>
          </div>

          <!-- 第四行：所属存储池 -->
          <div v-if="disk.poolIds && disk.poolIds.length > 0" class="card-pools">
            <span class="row-label">
              <IconifyIcon icon="lucide:database" style="font-size: 11px;" />
              所属存储池
            </span>
            <span class="pools-list">
              <Tag
                v-for="pid in disk.poolIds"
                :key="pid"
                color="blue"
                class="pool-tag"
                size="small"
                @click="goToPool(pid)"
              >
                <IconifyIcon icon="lucide:layers" style="font-size: 10px; margin-right: 2px;" />
                {{ pools.find((p) => p.id === pid)?.name || pid }}
              </Tag>
            </span>
          </div>

          <!-- 第五行：分区信息 -->
          <div v-if="disk.partitions && disk.partitions.length > 0" class="card-partitions">
            <span class="row-label">
              <IconifyIcon icon="lucide:folder-open" style="font-size: 11px;" />
              分区
            </span>
            <span class="partitions-list">
              <span
                v-for="part in disk.partitions"
                :key="part.name"
                class="partition-chip"
              >
                <span class="chip-name">{{ part.name }}</span>
                <span class="chip-size">{{ getPartitionTotalSize(part.size) }}</span>
              </span>
            </span>
          </div>
        </div>
      </Card>
    </div>

    <!-- 空状态 -->
    <div v-if="filteredDisks.length === 0" class="empty-state">
      <IconifyIcon icon="lucide:hard-drive" class="empty-icon" />
      <div class="empty-text">未找到符合条件的硬盘</div>
      <Button size="small" @click="resetFilters">
        <IconifyIcon icon="lucide:rotate-ccw" style="font-size: 12px;" />
        重置过滤条件
      </Button>
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
  padding: 0 16px 16px;
  width: 100%;
}

/* ===== 过滤栏 ===== */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
  margin-bottom: 4px;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  align-items: center;
}

.filter-search {
  position: relative;
  flex: 1;
  min-width: 200px;
  max-width: 320px;
}

.filter-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 13px;
  color: #bfbfbf;
  z-index: 1;
  pointer-events: none;
}

.filter-input :deep(.ant-input) {
  padding-left: 30px;
  font-size: 12px;
  border-radius: 6px;
}

.filter-select {
  min-width: 120px;
}

.filter-select :deep(.ant-select-selector) {
  font-size: 12px;
  border-radius: 6px;
}

.filter-reset-btn {
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  border-radius: 6px;
}

.filter-count {
  font-size: 12px;
  color: #8c8c8c;
  margin-left: auto;
}

.filter-count strong {
  color: #1677ff;
  font-weight: 600;
}

/* ===== 硬盘网格布局：等宽等高 ===== */
.disk-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 12px;
}

.disk-card {
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.disk-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: #1677ff;
}

.disk-card :deep(.ant-card-body) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.disk-card-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 14px;
  gap: 10px;
}

/* ===== 卡片头部行 ===== */
.card-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.header-main {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.disk-icon-box {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid;
}

.disk-icon {
  font-size: 18px;
}

.disk-device-name {
  font-size: 17px;
  font-weight: 700;
  color: #262626;
  font-family: 'SF Mono', 'Fira Code', monospace;
  line-height: 1;
  flex-shrink: 0;
}

.header-main {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.detail-arrow {
  font-size: 14px;
  color: #bfbfbf;
  margin-left: auto;
  transition: color 0.2s, transform 0.2s;
}

.disk-capacity {
  font-size: 12px;
  font-weight: 600;
  color: #1677ff;
  font-family: 'SF Mono', 'Fira Code', monospace;
  background: #e6f4ff;
  padding: 2px 7px;
  border-radius: 4px;
  flex-shrink: 0;
}

/* 操作按钮 */
.header-actions {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
}

.detail-btn {
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: 7px;
  padding: 0 10px;
  height: 30px;
}

.action-btn {
  width: 30px;
  height: 30px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
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

/* ===== Meta 标签行 ===== */
.card-meta-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.status-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  margin-right: 0;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}

.health-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 7px;
  border-radius: 10px;
  border: 1px solid;
  font-size: 12px;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.9);
}

.health-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.meta-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  padding: 1px 7px;
  border-radius: 10px;
}

.meta-icon {
  font-size: 11px;
}

.temp-badge {
  color: #595959;
  background: #fff7e6;
}

.temp-badge .meta-icon {
  color: #faad14;
}

.hours-badge {
  color: #595959;
  background: #f6ffed;
}

.hours-badge .meta-icon {
  color: #52c41a;
}

/* 分隔线 */
.disk-divider {
  height: 1px;
  background: #f0f0f0;
}

/* ===== 属性行 ===== */
.card-attrs {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.attr-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.attr-label {
  font-size: 11px;
  color: #8c8c8c;
  flex-shrink: 0;
  width: 40px;
}

.attr-value {
  font-size: 12px;
  color: #262626;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.serial-value {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.copy-icon {
  color: #bfbfbf;
  cursor: pointer;
  transition: color 0.2s;
  display: inline-flex;
  align-items: center;
}

.copy-icon:hover {
  color: #1677ff;
}

/* ===== 存储池行 ===== */
.card-pools {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.row-label {
  font-size: 11px;
  color: #8c8c8c;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.pools-list {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.pool-tag {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  font-size: 11px;
}

.pool-tag:hover {
  opacity: 0.85;
}

/* ===== 分区信息行 ===== */
.card-partitions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.partitions-list {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.partition-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #f5f5f5;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  padding: 2px 7px;
  font-size: 11px;
  transition: all 0.2s ease;
}

.partition-chip:hover {
  background: #e6f4ff;
  border-color: #bae0ff;
}

.chip-name {
  font-weight: 600;
  color: #262626;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.chip-size {
  color: #595959;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

/* ===== 空状态 ===== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 0;
  color: #bfbfbf;
}

.empty-icon {
  font-size: 48px;
  color: #d9d9d9;
}

.empty-text {
  font-size: 14px;
  color: #8c8c8c;
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
  .disk-grid {
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  }
}

@media (max-width: 768px) {
  .disk-grid {
    grid-template-columns: 1fr;
  }

  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-search {
    max-width: none;
  }

  .filter-count {
    margin-left: 0;
  }
}

@media (max-width: 576px) {
  .disk-manager {
    padding: 0 12px 12px;
  }

  .disk-card-inner {
    padding: 12px;
  }
}
</style>

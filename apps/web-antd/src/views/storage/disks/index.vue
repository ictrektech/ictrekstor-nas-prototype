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
import NasDiagram from './components/NasDiagram.vue';

const router = useRouter();
const disks = ref<DiskInfo[]>([]);
const pools = ref<StoragePool[]>([]);
const loading = ref(false);

// Canvas 示意图中当前高亮的磁盘
const selectedDiagramDisk = ref<string>('');
const diagramRef = ref<InstanceType<typeof NasDiagram> | null>(null);

// 处理示意图中点击磁盘
function handleDiagramSelectDisk(disk: DiskInfo | null) {
  if (disk) {
    selectedDiagramDisk.value = disk.deviceName;
  } else {
    selectedDiagramDisk.value = '';
  }
}

// 处理示意图中定位磁盘
function handleDiagramLocateDisk(deviceName: string) {
  selectedDiagramDisk.value = deviceName;
}

// 在卡片上点击定位按钮
function locateDiskInDiagram(disk: DiskInfo) {
  selectedDiagramDisk.value = disk.deviceName;
  if (diagramRef.value) {
    diagramRef.value.highlightBay(disk.deviceName);
  }
  message.success(`已在示意图中定位磁盘 ${disk.deviceName}`);
}

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
    <!-- ═══════ 页面顶部概览 ═══════ -->
    <div class="page-header">
      <div class="page-header-left">
        <div class="page-icon-box">
          <IconifyIcon icon="lucide:hard-drive" style="font-size: 20px; color: #1677ff;" />
        </div>
        <div class="page-title-area">
          <h1 class="page-title">硬盘管理</h1>
          <p class="page-desc">查看和管理 NAS 中的所有物理硬盘</p>
        </div>
      </div>
      <div class="page-header-right">
        <div class="overview-card">
          <IconifyIcon icon="lucide:hard-drive" style="font-size: 16px; color: #1677ff;" />
          <div class="overview-info">
            <span class="overview-label">硬盘数</span>
            <span class="overview-value">{{ filteredDisks.length }}</span>
          </div>
        </div>
        <div class="overview-card">
          <IconifyIcon icon="lucide:database" style="font-size: 16px; color: #52c41a;" />
          <div class="overview-info">
            <span class="overview-label">总容量(TB)</span>
            <span class="overview-value">{{ (filteredDisks.reduce((sum, d) => sum + (parseCapacity(d.size) / (1024 ** 4)), 0)).toFixed(2) }}</span>
          </div>
        </div>
        <div class="overview-card">
          <IconifyIcon icon="lucide:heart-pulse" style="font-size: 16px; color: #52c41a;" />
          <div class="overview-info">
            <span class="overview-label">健康</span>
            <span class="overview-value">{{ filteredDisks.filter(d => d.healthStatus === '正常').length }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- NAS 设备 Canvas 示意图 + 右侧概览 -->
    <div class="nas-diagram-real">
      <div class="nas-diagram-header">
        <div class="nas-diagram-title-row">
          <IconifyIcon icon="lucide:server" class="nas-header-icon" />
          <span class="nas-header-title">NAS 设备示意图</span>
        </div>
      </div>
      <div class="nas-diagram-body">
        <!-- 左侧 Canvas 居中 -->
        <div class="nas-diagram-canvas-wrap">
          <NasDiagram
            ref="diagramRef"
            :disks="filteredDisks"
            :selected-disk-name="selectedDiagramDisk"
            @select-disk="handleDiagramSelectDisk"
            @locate-disk="handleDiagramLocateDisk"
          />
        </div>
        <!-- 右侧概览面板 -->
        <div class="nas-overview-panel">
          <!-- 总容量 -->
          <div class="overview-section">
            <div class="overview-section-title">
              <IconifyIcon icon="lucide:database" style="font-size: 13px; color: #1677ff;" />
              总容量
            </div>
            <div class="overview-big-num">
              {{ (filteredDisks.reduce((sum, d) => sum + (parseCapacity(d.size) / (1024 ** 4)), 0)).toFixed(2) }}
              <span class="overview-unit">TB</span>
            </div>
          </div>

          <!-- 磁盘类型分布 -->
          <div class="overview-section">
            <div class="overview-section-title">
              <IconifyIcon icon="lucide:pie-chart" style="font-size: 13px; color: #722ed1;" />
              类型分布
            </div>
            <div class="overview-type-list">
              <div class="overview-type-item">
                <span class="type-dot" style="background: #1677ff;" />
                <span class="type-label">HDD</span>
                <span class="type-num">{{ filteredDisks.filter(d => !d.deviceType || d.deviceType === 'HDD').length }}</span>
              </div>
              <div class="overview-type-item">
                <span class="type-dot" style="background: #722ed1;" />
                <span class="type-label">SSD</span>
                <span class="type-num">{{ filteredDisks.filter(d => d.deviceType?.includes('SSD')).length }}</span>
              </div>
              <div class="overview-type-item">
                <span class="type-dot" style="background: #eb2f96;" />
                <span class="type-label">NVMe</span>
                <span class="type-num">{{ filteredDisks.filter(d => d.deviceType?.includes('NVMe')).length }}</span>
              </div>
            </div>
          </div>

          <!-- 健康状态 -->
          <div class="overview-section">
            <div class="overview-section-title">
              <IconifyIcon icon="lucide:heart-pulse" style="font-size: 13px; color: #52c41a;" />
              健康状态
            </div>
            <div class="overview-health-list">
              <div class="overview-health-item">
                <span class="health-dot" style="background: #52c41a;" />
                <span class="health-label">正常</span>
                <span class="health-num">{{ filteredDisks.filter(d => d.healthStatus === '正常').length }}</span>
              </div>
              <div class="overview-health-item">
                <span class="health-dot" style="background: #faad14;" />
                <span class="health-label">警告</span>
                <span class="health-num">{{ filteredDisks.filter(d => d.healthStatus === '警告').length }}</span>
              </div>
              <div class="overview-health-item">
                <span class="health-dot" style="background: #ff4d4f;" />
                <span class="health-label">异常</span>
                <span class="health-num">{{ filteredDisks.filter(d => d.healthStatus === '异常').length }}</span>
              </div>
            </div>
          </div>

          <!-- 运行状态 -->
          <div class="overview-section">
            <div class="overview-section-title">
              <IconifyIcon icon="lucide:activity" style="font-size: 13px; color: #faad14;" />
              运行状态
            </div>
            <div class="overview-status-bar">
              <div
                class="status-bar-segment"
                :style="{
                  width: filteredDisks.length ? (filteredDisks.filter(d => d.status === '运行中').length / filteredDisks.length * 100) + '%' : '0%',
                  background: '#52c41a',
                }"
              />
              <div
                class="status-bar-segment"
                :style="{
                  width: filteredDisks.length ? (filteredDisks.filter(d => d.status === '休眠').length / filteredDisks.length * 100) + '%' : '0%',
                  background: '#faad14',
                }"
              />
              <div
                class="status-bar-segment"
                :style="{
                  width: filteredDisks.length ? (filteredDisks.filter(d => (d.usageStatus || d.status) === '未使用').length / filteredDisks.length * 100) + '%' : '0%',
                  background: '#bfbfbf',
                }"
              />
            </div>
            <div class="overview-status-legend">
              <span class="legend-item">
                <span class="legend-dot" style="background: #52c41a;" />
                运行 {{ filteredDisks.filter(d => d.status === '运行中').length }}
              </span>
              <span class="legend-item">
                <span class="legend-dot" style="background: #faad14;" />
                休眠 {{ filteredDisks.filter(d => d.status === '休眠').length }}
              </span>
              <span class="legend-item">
                <span class="legend-dot" style="background: #bfbfbf;" />
                未用 {{ filteredDisks.filter(d => (d.usageStatus || d.status) === '未使用').length }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

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
        :body-style="{ padding: '0' }"
      >
        <div class="disk-card-inner">
          <!-- 左侧：大图标区域 -->
          <div
            class="disk-visual"
            :style="{
              background: `${getDeviceIconColor(disk.deviceType)}12`,
            }"
          >
            <div
              class="disk-icon-box"
              :style="{
                background: `${getDeviceIconColor(disk.deviceType)}18`,
                borderColor: `${getDeviceIconColor(disk.deviceType)}35`,
              }"
            >
              <IconifyIcon
                :icon="getDeviceIcon(disk.deviceType)"
                class="disk-icon"
                :style="{ color: getDeviceIconColor(disk.deviceType) }"
              />
            </div>
            <div
              class="disk-status-indicator"
              :style="{ background: getStatusDot(disk.status) }"
            />
          </div>

          <!-- 右侧：信息区域 -->
          <div class="disk-info">
            <!-- 第一行：设备名 + 容量 + 操作按钮 -->
            <div class="info-header">
              <div class="info-header-left">
                <span class="disk-device-name">{{ disk.deviceName }}</span>
                <span class="disk-capacity">{{ disk.size }}</span>
                <Tag
                  v-if="disk.healthStatus"
                  class="health-tag-mini"
                  size="small"
                  :style="{
                    color: getHealthBadgeColor(disk.healthStatus),
                    borderColor: `${getHealthBadgeColor(disk.healthStatus)}50`,
                    background: `${getHealthBadgeColor(disk.healthStatus)}10`,
                  }"
                >
                  <span
                    class="health-dot-mini"
                    :style="{ background: getHealthBadgeColor(disk.healthStatus) }"
                  />
                  {{ disk.healthStatus }}
                </Tag>
              </div>
              <div class="header-actions">
                <Tooltip title="定位">
                  <Button
                    size="small"
                    class="action-btn"
                    :class="{ 'locate-active': selectedDiagramDisk === disk.deviceName }"
                    @click="locateDiskInDiagram(disk)"
                  >
                    <IconifyIcon icon="lucide:crosshair" class="action-icon" />
                  </Button>
                </Tooltip>
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
                <Button
                  size="small"
                  type="primary"
                  class="detail-btn"
                  @click="goToDiskDetail(disk)"
                >
                  <IconifyIcon icon="lucide:file-text" style="font-size: 11px;" />
                  详细信息
                </Button>
              </div>
            </div>

            <!-- 第二行：核心属性（型号 / 类型 / 序列号） -->
            <div class="info-attrs">
              <div class="attr-pair">
                <span class="attr-label">型号</span>
                <span class="attr-value" :title="disk.model || 'QEMU_HARDDISK'">{{ disk.model || 'QEMU_HARDDISK' }}</span>
              </div>
              <div class="attr-pair">
                <span class="attr-label">类型</span>
                <span class="attr-value">{{ disk.deviceType || 'HDD' }}</span>
              </div>
              <div class="attr-pair">
                <span class="attr-label">序列号</span>
                <span class="attr-value serial-value">
                  {{ disk.serial }}
                  <Tooltip title="复制序列号">
                    <span class="copy-icon" @click="copySerial(disk.serial)">
                      <IconifyIcon icon="lucide:copy" style="font-size: 10px;" />
                    </span>
                  </Tooltip>
                </span>
              </div>
            </div>

            <!-- 第三行：所属存储池 -->
            <div v-if="disk.poolIds && disk.poolIds.length > 0" class="info-pools">
              <span class="pools-list">
                <Tag
                  v-for="pid in disk.poolIds"
                  :key="pid"
                  color="blue"
                  class="pool-tag"
                  size="small"
                  @click="goToPool(pid)"
                >
                  <IconifyIcon icon="lucide:database" style="font-size: 10px; margin-right: 2px;" />
                  {{ pools.find((p) => p.id === pid)?.name || pid }}
                </Tag>
              </span>
            </div>
            <div v-else class="info-pools-empty">
              <span class="pool-empty-text">未分配存储池</span>
            </div>
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
  padding: 0 20px 16px;
  width: 100%;
}

/* ===== 页面顶部概览 ===== */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: #fff;
  gap: 16px;
  flex-shrink: 0;
  margin: 0 -20px;
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

/* ===== NAS 设备真实 Canvas 示意图 ===== */
.nas-diagram-real {
  margin-bottom: 16px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.nas-diagram-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.nas-diagram-body {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 24px;
  padding: 16px 20px 20px;
}

/* 左侧 Canvas 居中包裹 */
.nas-diagram-canvas-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
}

/* 右侧概览面板 */
.nas-overview-panel {
  width: 220px;
  padding: 12px 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex-shrink: 0;
}

.overview-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.overview-section-title {
  font-size: 13px;
  font-weight: 600;
  color: #262626;
  display: flex;
  align-items: center;
  gap: 6px;
}

.overview-big-num {
  font-size: 36px;
  font-weight: 700;
  color: #141414;
  font-family: 'SF Mono', 'Fira Code', monospace;
  line-height: 1;
}

.overview-unit {
  font-size: 14px;
  font-weight: 500;
  color: #8c8c8c;
  margin-left: 4px;
}

.overview-type-list,
.overview-health-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* 三列网格对齐：圆点 | 标签 | 数字 */
.overview-type-item,
.overview-health-item {
  display: grid;
  grid-template-columns: 16px 1fr auto;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.type-dot,
.health-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  justify-self: center;
}

.type-label,
.health-label {
  color: #595959;
}

.type-num,
.health-num {
  font-weight: 600;
  color: #141414;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 14px;
  text-align: right;
}

.overview-status-bar {
  display: flex;
  height: 10px;
  border-radius: 5px;
  overflow: hidden;
  background: #f0f0f0;
}

.status-bar-segment {
  height: 100%;
  transition: width 0.3s ease;
}

.overview-status-legend {
  display: flex;
  gap: 16px;
  margin-top: 8px;
  font-size: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #595959;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.nas-diagram-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.nas-header-icon {
  font-size: 20px;
  color: #1677ff;
}

.nas-header-title {
  font-size: 15px;
  font-weight: 600;
  color: #262626;
}

.nas-diagram-stats {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nas-stat-chip {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 16px;
}

.nas-stat-chip-num {
  font-size: 14px;
  font-weight: 700;
  color: #262626;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.nas-stat-chip-label {
  font-size: 11px;
  color: #8c8c8c;
}

/* ===== NAS 设备示意图占位区域 ===== */
.nas-diagram-placeholder {

  margin-bottom: 12px;
  border-radius: 12px;
  border: 1px dashed #d9d9d9;
  background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
  padding: 20px 24px;
}

.nas-diagram-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.nas-diagram-left {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  min-width: 0;
}

.nas-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #e6f4ff;
  border: 1px solid #bae0ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nas-icon {
  font-size: 24px;
  color: #1677ff;
}

.nas-diagram-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.nas-diagram-title {
  font-size: 15px;
  font-weight: 600;
  color: #262626;
}

.nas-diagram-desc {
  font-size: 12px;
  color: #8c8c8c;
  line-height: 1.5;
}

.nas-diagram-right {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.nas-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.nas-stat-num {
  font-size: 20px;
  font-weight: 700;
  color: #262626;
  font-family: 'SF Mono', 'Fira Code', monospace;
  line-height: 1;
}

.nas-stat-label {
  font-size: 11px;
  color: #8c8c8c;
}

.nas-stat-divider {
  width: 1px;
  height: 32px;
  background: #e8e8e8;
}

/* ===== 过滤栏 ===== */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
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

/* ===== 硬盘网格布局 ===== */
.disk-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
  gap: 10px;
}

.disk-card {
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.disk-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: #1677ff;
}

/* ===== 卡片内部：左右布局 ===== */
.disk-card-inner {
  display: flex;
  align-items: stretch;
  height: 100%;
}

/* 左侧视觉区 */
.disk-visual {
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

.disk-icon-box {
  width: 54px;
  height: 54px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid;
}

.disk-icon {
  font-size: 26px;
}

.disk-status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  box-shadow: 0 0 0 2px #fff;
}

/* 右侧信息区 */
.disk-info {
  flex: 1;
  padding: 14px 16px 14px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  justify-content: center;
}

/* 信息头部 */
.info-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.info-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.disk-device-name {
  font-size: 17px;
  font-weight: 800;
  color: #141414;
  font-family: 'SF Mono', 'Fira Code', monospace;
  line-height: 1;
  flex-shrink: 0;
  letter-spacing: 0.3px;
}

.disk-capacity {
  font-size: 11px;
  font-weight: 600;
  color: #1677ff;
  font-family: 'SF Mono', 'Fira Code', monospace;
  background: #e6f4ff;
  padding: 1px 6px;
  border-radius: 4px;
  flex-shrink: 0;
}

.health-tag-mini {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  margin-right: 0;
  padding: 0 6px;
  border: 1px solid;
  border-radius: 10px;
}

.health-dot-mini {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  display: inline-block;
}

/* 操作按钮 */
.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.detail-btn {
  font-size: 11px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  padding: 0 8px;
  height: 28px;
  gap: 4px;
}

.action-btn {
  width: 28px;
  height: 28px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
}

.action-icon {
  font-size: 12px;
}

.blink-active {
  background: #fff7e6;
  border-color: #ffd591;
  color: #d46b08;
}

.locate-active {
  background: #e6f4ff;
  border-color: #1677ff;
  color: #1677ff;
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

/* 核心属性行 */
.info-attrs {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.attr-pair {
  display: flex;
  align-items: center;
  gap: 5px;
}

.attr-label {
  font-size: 11px;
  color: #8c8c8c;
  flex-shrink: 0;
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
  gap: 3px;
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

/* 存储池 */
.info-pools {
  display: flex;
  align-items: center;
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
  margin-right: 0;
}

.pool-tag:hover {
  opacity: 0.85;
}

.info-pools-empty {
  display: flex;
  align-items: center;
}

.pool-empty-text {
  font-size: 11px;
  color: #bfbfbf;
  font-style: italic;
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
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
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

  .nas-diagram-inner {
    flex-direction: column;
    align-items: flex-start;
  }

  .nas-diagram-right {
    width: 100%;
    justify-content: flex-start;
  }
}

@media (max-width: 576px) {
  .disk-manager {
    padding: 0 12px 12px;
  }

  .disk-visual {
    width: 60px;
    padding: 10px 6px;
  }

  .disk-icon-box {
    width: 40px;
    height: 40px;
  }

  .disk-icon {
    font-size: 20px;
  }

  .info-attrs {
    gap: 10px;
  }
}
</style>

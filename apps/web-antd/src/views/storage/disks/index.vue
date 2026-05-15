<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { Card, Button, message, Input, Select } from 'ant-design-vue';
import { useRouter } from 'vue-router';
import { IconifyIcon } from '@vben/icons';
import {
  getDisksApi,
  getStoragePoolsApi,
  type DiskInfo,
  type StoragePool,
} from '#/api/storage';
import NasDiagram from './components/NasDiagram.vue';
import DiskStatsCards from './components/DiskStatsCards.vue';
import DiskCard from './components/DiskCard.vue';
import DiskDetailModal from './components/DiskDetailModal.vue';
import { PageHeader } from '#/components/ui-kit';

const router = useRouter();
const disks = ref<DiskInfo[]>([]);
const pools = ref<StoragePool[]>([]);
const loading = ref(false);

// Canvas 示意图中当前高亮的磁盘
const selectedDiagramDisk = ref<string>('');
const diagramRef = ref<InstanceType<typeof NasDiagram> | null>(null);

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
      if (filterStatus.value === 'running')
        return st === '使用中' || st === '运行中';
      if (filterStatus.value === 'sleep') return st === '休眠';
      if (filterStatus.value === 'unused') return st === '未使用';
      return true;
    });
  }

  // 容量过滤
  if (filterCapacity.value !== 'all') {
    result = result.filter((d) => {
      const bytes = parseCapacity(d.size);
      const tb = bytes / 1024 ** 4;
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
  detailModalContent.value = disk.smartctlInfo || '暂无 SMART 信息';
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
    <!-- 页面顶部概览 —— UI KIT PageHeader -->
    <PageHeader
      icon="lucide:hard-drive"
      title="硬盘管理"
      description="查看和管理 NAS 中的所有物理硬盘"
    >
      <template #extra>
        <DiskStatsCards :disks="filteredDisks" />
      </template>
    </PageHeader>

    <!-- 主体区域：设备示意图 + 磁盘列表 横向并列 -->
    <div class="main-layout">
      <!-- 左侧：设备示意图 -->
      <div class="diagram-col">
        <div class="nas-diagram-real">
          <div class="nas-diagram-header">
            <div class="nas-diagram-title-row">
              <IconifyIcon
                icon="lucide:server"
                class="nas-header-icon"
              />
              <span class="nas-header-title">设备示意图</span>
            </div>
          </div>
          <div class="nas-diagram-body" style="padding: 16px;">
            <div class="nas-diagram-canvas-wrap">
              <NasDiagram
                ref="diagramRef"
                :disks="filteredDisks"
                :selected-disk-name="selectedDiagramDisk"
                @select-disk="handleDiagramSelectDisk"
                @locate-disk="handleDiagramLocateDisk"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：磁盘列表卡片容器 -->
      <div class="disk-list-col">
        <Card
          class="disk-list-card"
          :bordered="true"
          :body-style="{ padding: 0 }"
        >
          <!-- 卡片顶部：过滤工具栏 -->
          <div class="disk-list-toolbar">
            <div class="toolbar-left">
              <div class="filter-item filter-search">
                <IconifyIcon
                  icon="lucide:search"
                  class="filter-icon"
                />
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
                <IconifyIcon
                  icon="lucide:rotate-ccw"
                  style="font-size: 12px;"
                />
                重置
              </Button>
            </div>
            <span class="filter-count">
              共 <strong>{{ filteredDisks.length }}</strong> 块硬盘
            </span>
          </div>

          <!-- 磁盘平铺网格 -->
          <div class="disk-grid">
            <Card
              v-for="disk in filteredDisks"
              :key="disk.deviceName"
              class="disk-card"
              :bordered="true"
              :body-style="{ padding: '0' }"
            >
              <DiskCard
                :disk="disk"
                :pools="pools"
                :is-selected-in-diagram="
                  selectedDiagramDisk === disk.deviceName
                "
                :is-blinking="isBlinking(disk)"
                @locate="locateDiskInDiagram"
                @sleep="sleepDisk"
                @blink="blinkDisk"
                @copy-serial="copySerial"
                @go-pool="goToPool"
                @go-detail="goToDiskDetail"
              />
            </Card>
          </div>

          <!-- 空状态 -->
          <div
            v-if="filteredDisks.length === 0"
            class="empty-state"
          >
            <IconifyIcon
              icon="lucide:hard-drive"
              class="empty-icon"
            />
            <div class="empty-text">未找到符合条件的硬盘</div>
            <Button size="small" @click="resetFilters">
              <IconifyIcon
                icon="lucide:rotate-ccw"
                style="font-size: 12px;"
              />
              重置过滤条件
            </Button>
          </div>
        </Card>
      </div>
    </div>

    <!-- 详细信息弹窗 -->
    <DiskDetailModal
      v-model:visible="detailModalVisible"
      :title="detailModalTitle"
      :content="detailModalContent"
    />
  </div>
</template>

<style scoped>
.disk-manager {
  padding: 0 20px 16px;
  width: 100%;
}

/* 主体横向布局：设备示意图 + 磁盘列表 */
.main-layout {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.diagram-col {
  width: 380px;
  flex-shrink: 0;
}

.disk-list-col {
  flex: 1;
  min-width: 0;
}

/* NAS 设备真实 Canvas 示意图 */
.nas-diagram-real {
  margin-bottom: 0;
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
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.nas-diagram-canvas-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
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

/* 磁盘列表外层卡片 */
.disk-list-card {
  border-radius: 12px;
  overflow: hidden;
}

/* 卡片顶部过滤工具栏 */
.disk-list-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
  flex-wrap: wrap;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  align-items: center;
}

.filter-search {
  position: relative;
  width: 220px;
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
  white-space: nowrap;
  flex-shrink: 0;
}

.filter-count strong {
  color: #1677ff;
  font-weight: 600;
}

/* 硬盘平铺网格（CSS Grid 响应式） */
.disk-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 12px;
  padding: 12px 16px;
}

.disk-card {
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  min-width: 0;
}

.disk-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: #1677ff;
}

/* 空状态 */
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

/* 响应式 */
@media (min-width: 1400px) {
  .disk-grid {
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  }
}

@media (max-width: 1200px) {
  .main-layout {
    flex-direction: column;
  }

  .diagram-col {
    width: 100%;
  }

  .disk-grid {
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  }
}

@media (max-width: 992px) {
  .disk-grid {
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  }
}

@media (max-width: 768px) {
  .disk-list-toolbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .toolbar-left {
    width: 100%;
  }

  .filter-search {
    width: 100%;
    max-width: none;
  }

  .filter-count {
    margin-left: 0;
  }

  .disk-grid {
    grid-template-columns: 1fr;
    padding: 10px 12px;
  }
}

@media (max-width: 576px) {
  .disk-manager {
    padding: 0 12px 12px;
  }
}
</style>

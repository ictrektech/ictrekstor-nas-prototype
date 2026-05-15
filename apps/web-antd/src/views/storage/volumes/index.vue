<script lang="ts" setup>
import { IconifyIcon } from '@vben/icons';
import { Button, Empty, message, Modal } from 'ant-design-vue';
import { computed, h, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { getDisksApi, getStoragePoolsApi, getStorageVolumesApi } from '#/api/storage';
import type { DiskInfo } from '#/api/storage';

import ConfigUserModal from './components/ConfigUserModal.vue';
import CreatePoolModal from './components/CreatePoolModal.vue';
import CreateVolumeModal from './components/CreateVolumeModal.vue';
import PoolCard from './components/PoolCard.vue';
import RenameVolumeModal from './components/RenameVolumeModal.vue';
import VolumeNestCard from './components/VolumeNestCard.vue';
import VolumeOverview from './components/VolumeOverview.vue';
import { PageHeader } from '#/components/ui-kit';
import type { PoolCreateForm, StoragePool, StorageVolume, VolumeCreateForm } from './types';

const router = useRouter();
const items = ref<StorageVolume[]>([]);
const pools = ref<StoragePool[]>([]);
const availableDisks = ref<DiskInfo[]>([]);
const loading = ref(false);

// ═══════ 按存储池分组的卷 ═══════
const poolVolumes = computed(() => {
  const map = new Map<string, StorageVolume[]>();
  items.value
    .filter((v) => v.sourceType === 'pool')
    .forEach((v) => {
      const pid = v.poolId || 'unknown';
      if (!map.has(pid)) map.set(pid, []);
      map.get(pid)!.push(v);
    });
  return map;
});

// ═══════ 基于目录的卷 ═══════
const directoryVolumes = computed(() =>
  items.value.filter((v) => v.sourceType === 'directory'),
);

function getVolumesByPool(poolId: string): StorageVolume[] {
  return poolVolumes.value.get(poolId) || [];
}

// ═══════ 统计计算 ═══════
const overviewStats = computed(() => {
  const total = items.value.length;
  const poolVolCount = items.value.filter((v) => v.sourceType === 'pool').length;
  const dirCount = directoryVolumes.value.length;

  const totalCap = items.value.reduce((sum, v) => {
    const num = parseFloat(v.totalCapacity);
    return sum + (v.totalCapacity.includes('TB') ? num * 1024 : num);
  }, 0);
  const totalUsed = items.value.reduce((sum, v) => {
    const num = parseFloat(v.usedCapacity);
    return sum + (v.usedCapacity.includes('TB') ? num * 1024 : num);
  }, 0);

  return {
    total,
    poolVolCount,
    dirCount,
    totalCap:
      totalCap >= 1024
        ? (totalCap / 1024).toFixed(2) + ' TB'
        : totalCap.toFixed(0) + ' GB',
    totalUsed:
      totalUsed >= 1024
        ? (totalUsed / 1024).toFixed(2) + ' TB'
        : totalUsed.toFixed(0) + ' GB',
  };
});

// ═══════ 弹窗状态 ═══════
const createVisible = ref(false);
const createLoading = ref(false);
const createPoolVisible = ref(false);
const createPoolLoading = ref(false);
const configVisible = ref(false);
const configVolumeName = ref('');
const renameVisible = ref(false);
const renameVolume = ref<StorageVolume | null>(null);

onMounted(() => loadData());

async function loadData() {
  loading.value = true;
  try {
    const [volumesRes, poolsRes, disksRes] = await Promise.all([
      getStorageVolumesApi(),
      getStoragePoolsApi(),
      getDisksApi(),
    ]);
    items.value = volumesRes;
    pools.value = poolsRes;
    // 过滤出未使用的磁盘（usageStatus 为 "未使用" 或 isUsed 为 "否"）
    availableDisks.value = disksRes.filter(
      (d) => d.usageStatus === '未使用' || d.isUsed === '否',
    );
  } catch (e) {
    message.error('加载数据失败');
  } finally {
    loading.value = false;
  }
}

// ═══════ 创建存储空间 ═══════
function handleCreateVolume(values: VolumeCreateForm) {
  createLoading.value = true;
  setTimeout(() => {
    createLoading.value = false;
    createVisible.value = false;
    message.success(`存储空间 "${values.name}" 创建成功`);
    loadData();
  }, 1000);
}

function openCreateModal() {
  createVisible.value = true;
}

function openCreatePoolModal() {
  createPoolVisible.value = true;
}

function handleCreatePool(values: PoolCreateForm) {
  createPoolLoading.value = true;
  setTimeout(() => {
    createPoolLoading.value = false;
    createPoolVisible.value = false;
    message.success(`存储池 "${values.name}" 创建成功`);
    loadData();
  }, 1000);
}

// ═══════ 存储池操作 ═══════
function goToPoolDetail(poolId: string) {
  router.push(`/storage/pools/detail/${poolId}`);
}

function goToDiskDetail(deviceName: string) {
  router.push(`/storage/disks/detail/${deviceName}`);
}

function handleReplaceDisk(pool: StoragePool) {
  message.info(`换盘操作：${pool.name}`);
}

function handleRebuildPool(pool: StoragePool) {
  message.info(`重构存储池：${pool.name}`);
}

function handleDeletePool(pool: StoragePool) {
  Modal.confirm({
    title: '确认删除存储池',
    content: '删除存储池将同时删除其下所有存储空间，此操作不可恢复，是否继续？',
    okText: '确认删除',
    okType: 'danger',
    cancelText: '取消',
    onOk: async () => {
      message.success(`存储池 "${pool.name}" 已删除`);
      loadData();
    },
  });
}

// ═══════ 存储空间操作 ═══════
function handleConfigUser(volId: string) {
  configVolumeName.value = volId;
  configVisible.value = true;
}

function handleRename(volume: StorageVolume) {
  renameVolume.value = volume;
  renameVisible.value = true;
}

async function handleRenameSubmit(_volId: string, _name: string) {
  message.success('重命名成功');
  renameVisible.value = false;
  loadData();
}

function handleExpandVolume(vol: StorageVolume) {
  message.info(`扩容存储空间：${vol.name}`);
}

function handleDeleteVolume(vol: StorageVolume) {
  Modal.confirm({
    title: '确认删除存储空间',
    content: '删除存储空间将清除其中所有数据，此操作不可恢复，是否继续？',
    okText: '确认删除',
    okType: 'danger',
    cancelText: '取消',
    onOk: async () => {
      message.success(`存储空间 "${vol.name}" 已删除`);
      loadData();
    },
  });
}
</script>

<template>
  <div class="volume-manager">
    <!-- ═══════ 页面顶部概览 —— UI KIT PageHeader ═══════ -->
    <PageHeader
      icon="lucide:box"
      title="存储空间管理"
      description="管理基于存储池或目录的存储空间分配与使用"
    >
      <template #actions>
        <Button type="primary" size="small" @click="openCreatePoolModal">
          <template #icon>
            <IconifyIcon icon="lucide:database" />
          </template>
          创建存储池
        </Button>
        <Button size="small" @click="openCreateModal">
          <template #icon>
            <IconifyIcon icon="lucide:plus" />
          </template>
          创建存储空间
        </Button>
      </template>
      <template #extra>
        <VolumeOverview
          :pool-count="pools.length"
          :volume-count="overviewStats.total"
          :total-cap="overviewStats.totalCap"
          :total-used="overviewStats.totalUsed"
        />
      </template>
    </PageHeader>

    <!-- 存储空间列表 -->
    <div v-if="items.length > 0" class="volumes-list">
      <!-- 基于存储池的存储空间 -->
      <div
        v-for="pool in pools"
        :key="pool.id"
        class="pool-wrapper-card"
      >
        <PoolCard
          :pool="pool"
          :volume-count="getVolumesByPool(pool.id).length"
          @click-disk="goToDiskDetail"
          @detail="goToPoolDetail"
          @replace-disk="handleReplaceDisk"
          @rebuild-pool="handleRebuildPool"
          @delete-pool="handleDeletePool"
        />

        <!-- 存储空间表头 -->
        <div class="volumes-section-header">
          <div class="volumes-section-title">
            <IconifyIcon icon="lucide:box" style="font-size: var(--ict-body-medium); color: var(--ict-primary);" />
            <span>存储空间</span>
            <span class="volumes-count">{{ getVolumesByPool(pool.id).length }}</span>
          </div>
        </div>

        <!-- 该池下的存储空间卡片 -->
        <div class="pool-volumes-container">
          <VolumeNestCard
            v-for="vol in getVolumesByPool(pool.id)"
            :key="vol.id"
            :volume="vol"
            @config-user="handleConfigUser"
            @expand="handleExpandVolume"
            @delete-volume="handleDeleteVolume"
          />

          <!-- 空状态 -->
          <div v-if="getVolumesByPool(pool.id).length === 0" class="pool-empty">
            <IconifyIcon icon="lucide:inbox" style="font-size: var(--ict-title-large); color: var(--ict-text-disabled);" />
            <span>该存储池下暂无存储空间</span>
          </div>
        </div>
      </div>

      <!-- 基于目录的存储空间 -->
      <div v-if="directoryVolumes.length > 0" class="pool-wrapper-card directory-wrapper">
        <!-- 目录头部信息 -->
        <div class="pool-header directory-header">
          <div class="pool-header-main">
            <div class="pool-icon-box" style="background: var(--ict-success-light);">
              <IconifyIcon icon="lucide:folder-open" style="font-size: var(--ict-headline-small); color: var(--ict-success);" />
            </div>
            <div class="pool-header-body">
              <div class="ph-row ph-row-name">
                <span class="pool-name">基于目录的存储空间</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 存储空间表头 -->
        <div class="volumes-section-header">
          <div class="volumes-section-title">
            <IconifyIcon icon="lucide:box" style="font-size: var(--ict-body-medium); color: var(--ict-primary);" />
            <span>存储空间</span>
            <span class="volumes-count">{{ directoryVolumes.length }}</span>
          </div>
        </div>

        <!-- 目录下的存储空间卡片 -->
        <div class="pool-volumes-container">
          <VolumeNestCard
            v-for="vol in directoryVolumes"
            :key="vol.id"
            :volume="vol"
            @config-user="handleConfigUser"
            @expand="handleExpandVolume"
            @delete-volume="handleDeleteVolume"
          />
        </div>
      </div>
    </div>

    <!-- 全部为空 -->
    <div v-else-if="!loading" class="empty-state">
      <Empty
        :image="h('div', { class: 'empty-image' }, h(IconifyIcon, { icon: 'lucide:database', style: 'font-size: 64px; color: var(--ict-text-disabled);' }))"
        description="暂无存储空间"
      >
        <Button type="primary" size="small" @click="openCreateModal">
          <IconifyIcon icon="lucide:plus" style="font-size: var(--ict-body-medium);" />
          立即创建
        </Button>
      </Empty>
    </div>
  </div>

  <!-- 弹窗 -->
  <CreatePoolModal
    v-model:visible="createPoolVisible"
    :loading="createPoolLoading"
    :available-disks="availableDisks"
    @submit="handleCreatePool"
  />
  <CreateVolumeModal
    v-model:visible="createVisible"
    :pools="pools"
    :loading="createLoading"
    @submit="handleCreateVolume"
  />
  <ConfigUserModal v-model:visible="configVisible" :volume-name="configVolumeName" />
  <RenameVolumeModal
    v-model:visible="renameVisible"
    :volume="renameVolume"
    @submit="handleRenameSubmit"
  />
</template>

<style scoped>
.volume-manager {
  padding: 0 20px 16px;
  width: 100%;
}

/* 存储空间列表 */
.volumes-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 外层大卡片：存储池包裹 */
.pool-wrapper-card {
  background: var(--ict-bg-card);
  border-radius: 12px;
  border: 1px solid var(--ict-text-disabled);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}

.pool-wrapper-card:hover {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
  border-color: #b7b7b7;
  transform: translateY(-1px);
}

.directory-wrapper {
  border-color: var(--ict-success-disabled);
  box-shadow: 0 2px 10px rgba(82, 196, 26, 0.06);
}

.directory-wrapper:hover {
  border-color: #73d13d;
  box-shadow: 0 6px 24px rgba(82, 196, 26, 0.12);
}

/* 目录头部 */
.directory-header {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(135deg, var(--ict-success-light) 0%, #d9f7be 100%);
  border-bottom: 1px solid #e6e6e6;
  transition: all 0.2s ease;
  gap: 24px;
  cursor: default;
}

.directory-header:hover {
  background: linear-gradient(135deg, var(--ict-success-light) 0%, #d9f7be 100%);
}

/* 存储空间表头 */
.volumes-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 18px;
  background: var(--ict-bg-page);
  border-bottom: 1px solid var(--ict-border);
}

.volumes-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--ict-mark-medium);
  font-weight: 600;
  color: var(--ict-text-emphasis);
}

.volumes-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  font-size: var(--ict-mark-small);
  font-weight: 700;
  color: var(--ict-bg-card);
  background: var(--ict-primary);
  border-radius: 9px;
}

.create-volume-inline-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: var(--ict-body-small);
  border-radius: 6px;
}

/* 存储空间容器 */
.pool-volumes-container {
  padding: 14px 18px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
  background: var(--ict-bg-section);
}

.pool-empty {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px;
  color: var(--ict-text-disabled);
  font-size: var(--ict-mark-medium);
}

/* 空状态 */
.empty-state {
  padding: 32px 0;
}

.empty-image {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 12px;
}

/* 响应式 */
@media (max-width: 992px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .page-header-right {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .volumes-section-header {
    padding: 10px 12px;
  }

  .pool-volumes-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 576px) {
  .volume-manager {
    padding: 0 12px 12px;
  }

  .pool-volumes-container {
    padding: 10px 12px;
  }
}
</style>

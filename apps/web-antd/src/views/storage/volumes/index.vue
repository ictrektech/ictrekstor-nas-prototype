<script lang="ts" setup>
import { IconifyIcon } from '@vben/icons';
import { Empty, message, Modal } from 'ant-design-vue';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { getStoragePoolsApi } from '#/api/storage';

import ConfigUserModal from './components/ConfigUserModal.vue';
import CreateVolumeModal from './components/CreateVolumeModal.vue';
import PoolCard from './components/PoolCard.vue';
import RenameVolumeModal from './components/RenameVolumeModal.vue';
import VolumeNestCard from './components/VolumeNestCard.vue';
import VolumeOverview from './components/VolumeOverview.vue';
import type { StoragePool, StorageVolume, VolumeCreateForm } from './types';

const router = useRouter();
const pools = ref<StoragePool[]>([]);
const loading = ref(false);

const poolCount = computed(() => pools.value.length);
const volumeCount = computed(() =>
  pools.value.reduce((sum, p) => sum + (p.volumes?.length || 0), 0),
);
const totalCap = computed(() => '32TB');
const totalUsed = computed(() => '18.5TB');

const createVisible = ref(false);
const createLoading = ref(false);
const configVisible = ref(false);
const configVolumeName = ref('');
const renameVisible = ref(false);
const renameVolume = ref<StorageVolume | null>(null);

onMounted(() => loadPools());

async function loadPools() {
  loading.value = true;
  try {
    pools.value = await getStoragePoolsApi();
  } catch (e) {
    message.error('加载存储池失败');
  } finally {
    loading.value = false;
  }
}

function goCreatePool() {
  router.push('/storage/pools');
}

function handleCreateVolume(values: VolumeCreateForm) {
  createLoading.value = true;
  setTimeout(() => {
    createLoading.value = false;
    createVisible.value = false;
    message.success('创建存储空间成功');
    loadPools();
  }, 1000);
}

function handleDeletePool(poolId: string) {
  Modal.confirm({
    title: '确认删除存储池',
    content: '删除存储池将同时删除其下所有存储空间，此操作不可恢复，是否继续？',
    okText: '确认删除',
    okType: 'danger',
    cancelText: '取消',
    onOk: async () => {
      message.success('存储池已删除');
      loadPools();
    },
  });
}

function handleDeleteVolume(volId: string) {
  Modal.confirm({
    title: '确认删除存储空间',
    content: '删除存储空间将清除其中所有数据，此操作不可恢复，是否继续？',
    okText: '确认删除',
    okType: 'danger',
    cancelText: '取消',
    onOk: async () => {
      message.success('存储空间已删除');
      loadPools();
    },
  });
}

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
  loadPools();
}
</script>

<template>
  <div class="volume-manager">
    <!-- 概览 -->
    <VolumeOverview
      :pool-count="poolCount"
      :volume-count="volumeCount"
      :total-cap="totalCap"
      :total-used="totalUsed"
    />

    <!-- 存储池卡片列表 -->
    <div v-for="pool in pools" :key="pool.id" class="pool-card">
      <PoolCard
        :pool="pool"
        @click-disk="router.push(`/storage/disks?diskId=${$event}`)"
        @create-volume="createVisible = true"
        @delete-pool="handleDeletePool"
      />

      <!-- 存储空间头部 -->
      <div class="volumes-section-header">
        <div class="volumes-section-title">
          <IconifyIcon icon="lucide:box" style="font-size: 13px; color: #1677ff;" />
          存储空间
          <span class="volumes-count">{{ pool.volumes?.length || 0 }}</span>
        </div>
        <a-button
          class="create-volume-inline-btn"
          size="small"
          type="link"
          @click="createVisible = true"
        >
          <IconifyIcon icon="lucide:plus" style="font-size: 12px;" />
          创建
        </a-button>
      </div>

      <!-- 存储空间网格 -->
      <div class="pool-volumes-container">
        <VolumeNestCard
          v-for="v in pool.volumes"
          :key="v.id"
          :volume="v"
          @config-user="handleConfigUser"
          @rename="handleRename"
          @delete-volume="handleDeleteVolume"
        />
        <div v-if="!pool.volumes?.length" class="pool-empty">
          <IconifyIcon icon="lucide:box" style="font-size: 20px;" />
          暂无存储空间
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!pools.length && !loading" class="empty-state">
      <Empty
        :image="h('div', { class: 'empty-image' }, h(IconifyIcon, { icon: 'lucide:database', style: 'font-size: 64px; color: #d9d9d9;' }))"
        description="暂无存储池"
      >
        <a-button type="primary" @click="goCreatePool">
          <IconifyIcon icon="lucide:plus" style="font-size: 14px;" />
          创建存储池
        </a-button>
      </Empty>
    </div>
  </div>

  <!-- 弹窗 -->
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
  padding: 0 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.pool-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}
.pool-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}
.volumes-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 18px;
  background: #f5f5f5;
  border-bottom: 1px solid #e8e8e8;
}
.volumes-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #262626;
}
.volumes-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  background: #1677ff;
  border-radius: 9px;
}
.create-volume-inline-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  border-radius: 6px;
}
.pool-volumes-container {
  padding: 14px 18px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
  background: #fafafa;
}
.pool-empty {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px;
  color: #bfbfbf;
  font-size: 13px;
}
.empty-state {
  padding: 32px 0;
}
.empty-image {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 12px;
}
@media (max-width: 992px) {
  .volumes-section-header { padding: 10px 12px; }
  .pool-volumes-container { grid-template-columns: 1fr; }
}
@media (max-width: 576px) {
  .volume-manager { padding: 0 12px 12px; }
}
</style>
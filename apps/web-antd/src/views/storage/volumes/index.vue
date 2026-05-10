<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  Card,
  Button,
  Tag,
  Progress,
  Modal,
  Form,
  Input,
  Select,
  Radio,
  Dropdown,
  message,
  Tooltip,
  Empty,
} from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import {
  getStorageVolumesApi,
  getStoragePoolsApi,
  type StorageVolume,
  type StoragePool,
} from '#/api/storage';

const router = useRouter();
const items = ref<StorageVolume[]>([]);
const pools = ref<StoragePool[]>([]);
const loading = ref(false);

// 创建弹窗
const createModalVisible = ref(false);
const createFormRef = ref();
const createForm = ref({
  name: '',
  sourceType: 'pool' as 'pool' | 'directory',
  poolId: '',
  bindSource: '',
  size: undefined as number | undefined,
  sizeUnit: 'GB',
  filesystem: 'ext4',
  description: '',
});

const sizeUnitOptions = [
  { label: 'GB', value: 'GB' },
  { label: 'TB', value: 'TB' },
];

const filesystemOptions = [
  { label: 'EXT4', value: 'ext4' },
  { label: 'XFS', value: 'xfs' },
  { label: 'BTRFS', value: 'btrfs' },
];

async function loadData() {
  loading.value = true;
  try {
    const [volumesRes, poolsRes] = await Promise.all([
      getStorageVolumesApi(),
      getStoragePoolsApi(),
    ]);
    items.value = volumesRes;
    pools.value = poolsRes;
  } finally {
    loading.value = false;
  }
}

/** 按存储池分组的卷 */
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

/** 基于目录的卷 */
const directoryVolumes = computed(() =>
  items.value.filter((v) => v.sourceType === 'directory'),
);

function getVolumesByPool(poolId: string): StorageVolume[] {
  return poolVolumes.value.get(poolId) || [];
}

// === 统计计算 ===
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

// === 容量工具函数 ===
function getUsagePercent(used: string, total: string): number {
  const parseSize = (s: string): number => {
    const num = parseFloat(s);
    if (s.includes('TB')) return num * 1024;
    if (s.includes('GB')) return num;
    if (s.includes('MB')) return num / 1024;
    return num;
  };
  const u = parseSize(used);
  const t = parseSize(total);
  return t > 0 ? Math.round((u / t) * 100) : 0;
}

function getFreeCapacity(used: string, total: string): string {
  const parseSize = (s: string): [number, string] => {
    const num = parseFloat(s);
    if (s.includes('TB')) return [num, 'TB'];
    if (s.includes('GB')) return [num, 'GB'];
    if (s.includes('MB')) return [num, 'MB'];
    return [num, 'GB'];
  };
  const [u, uUnit] = parseSize(used);
  const [t, tUnit] = parseSize(total);
  if (uUnit === tUnit) {
    return `${(t - u).toFixed(2)} ${uUnit}`;
  }
  return `${used} / ${total}`;
}

function getCapacityColor(percent: number): string {
  if (percent >= 90) return '#ff4d4f';
  if (percent >= 70) return '#faad14';
  return '#1677ff';
}

function getStatusColor(status: string): string {
  return status === '正常' ? 'success' : 'default';
}

function getFsIcon(fs: string): string {
  if (fs === 'ext4') return 'lucide:folder-tree';
  if (fs === 'btrfs') return 'lucide:layers';
  if (fs === 'xfs') return 'lucide:database';
  return 'lucide:folder';
}

function getPoolStatusDotColor(status: string): string {
  return status === '正常' ? '#52c41a' : '#ff4d4f';
}

// 概览使用率颜色
function getOverviewUsedColor(): string {
  const totalCap = overviewStats.value.totalCap;
  const totalUsed = overviewStats.value.totalUsed;
  const capNum = parseFloat(totalCap);
  const usedNum = parseFloat(totalUsed);
  if (capNum <= 0) return '#1677ff';
  const percent = (usedNum / capNum) * 100;
  if (percent >= 90) return '#ff4d4f';
  if (percent >= 70) return '#faad14';
  return '#1677ff';
}

function getOverviewUsedBg(): string {
  const color = getOverviewUsedColor();
  if (color === '#ff4d4f') return '#fff1f0';
  if (color === '#faad14') return '#fffbe6';
  return '#e6f7ff';
}

function goToPoolDetail(poolId: string) {
  router.push(`/storage/pools/detail/${poolId}`);
}

function goToDiskDetail(deviceName: string) {
  router.push(`/storage/disks/detail/${deviceName}`);
}

function openCreateModal() {
  createForm.value = {
    name: '',
    sourceType: 'pool',
    poolId: pools.value[0]?.id || '',
    bindSource: '',
    size: undefined,
    sizeUnit: 'GB',
    filesystem: 'ext4',
    description: '',
  };
  createModalVisible.value = true;
}

function openCreateModalForPool(poolId: string) {
  createForm.value = {
    name: '',
    sourceType: 'pool',
    poolId: poolId,
    bindSource: '',
    size: undefined,
    sizeUnit: 'GB',
    filesystem: 'ext4',
    description: '',
  };
  createModalVisible.value = true;
}

function openCreatePoolModal() {
  message.info('创建存储池功能待实现');
}

function handleCreate() {
  createFormRef.value
    .validate()
    .then(() => {
      message.success(`存储空间 "${createForm.value.name}" 创建成功`);
      createModalVisible.value = false;
      loadData();
    })
    .catch(() => {});
}

// === 存储池高级动作 ===
function handleReplaceDisk(pool: StoragePool) {
  message.info(`换盘操作：${pool.name}`);
}

function handleRebuildPool(pool: StoragePool) {
  message.info(`重构存储池：${pool.name}`);
}

function handleDeletePool(pool: StoragePool) {
  message.success(`存储池 "${pool.name}" 已删除`);
}

// === 存储空间操作 ===
function handleVolumeUsers(vol: StorageVolume) {
  message.info(`用户管理：${vol.name}`);
}

function handleExpandVolume(vol: StorageVolume) {
  message.info(`扩容存储空间：${vol.name}`);
}

function handleDeleteVolume(vol: StorageVolume) {
  message.success(`存储空间 "${vol.name}" 已删除`);
}

onMounted(loadData);
</script>

<template>
  <div class="volume-manager">
    <!-- ═══════ 页面顶部概览 ═══════ -->
    <div class="page-header">
      <div class="page-header-left">
        <div class="page-icon-box">
          <IconifyIcon icon="lucide:box" style="font-size: 20px; color: #1677ff;" />
        </div>
        <div class="page-title-area">
          <h1 class="page-title">存储空间管理</h1>
          <p class="page-desc">管理基于存储池或目录的存储空间分配与使用</p>
        </div>
      </div>
      <div class="page-header-right">
        <div class="overview-card">
          <IconifyIcon icon="lucide:database" style="font-size: 16px; color: #1677ff;" />
          <div class="overview-info">
            <span class="overview-label">存储池</span>
            <span class="overview-value">{{ pools.length }}</span>
          </div>
        </div>
        <div class="overview-card">
          <IconifyIcon icon="lucide:box" style="font-size: 16px; color: #1677ff;" />
          <div class="overview-info">
            <span class="overview-label">存储空间</span>
            <span class="overview-value">{{ overviewStats.total }}</span>
          </div>
        </div>
        <div class="overview-card">
          <IconifyIcon icon="lucide:hard-drive" style="font-size: 16px; color: #52c41a;" />
          <div class="overview-info">
            <span class="overview-label">总容量</span>
            <span class="overview-value">{{ overviewStats.totalCap }}</span>
          </div>
        </div>
        <div class="overview-card">
          <IconifyIcon icon="lucide:pie-chart" style="font-size: 16px;" :style="{ color: getOverviewUsedColor() }" />
          <div class="overview-info">
            <span class="overview-label">使用率</span>
            <span class="overview-value" :style="{ color: getOverviewUsedColor() }">{{ Math.round((parseFloat(overviewStats.totalUsed) / parseFloat(overviewStats.totalCap)) * 100) || 0 }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 存储空间列表 -->
    <div v-if="items.length > 0" class="volumes-list">
      <!-- 基于存储池的存储空间 -->
      <div
        v-for="pool in pools"
        :key="pool.id"
        class="pool-wrapper-card"
      >
        <!-- 存储池头部信息 -->
        <div class="pool-header">
          <!-- 左侧主信息 -->
          <div class="pool-header-main">
            <div class="pool-icon-box">
              <IconifyIcon icon="lucide:database" style="font-size: 22px; color: #1677ff;" />
            </div>
            <div class="pool-header-body">
              <div class="ph-row ph-row-name">
                <span class="pool-name">{{ pool.name }}</span>
                <Tag :color="pool.status === '正常' ? 'success' : 'error'" size="small">
                  <span
                    class="status-dot"
                    :style="{ background: getPoolStatusDotColor(pool.status) }"
                  />
                  {{ pool.status }}
                </Tag>
              </div>
              <div class="ph-row ph-row-meta">
                <span class="meta-chip">
                  <IconifyIcon icon="lucide:layers" style="font-size: 11px;" />
                  {{ pool.raidType }}
                </span>
                <span class="meta-chip">
                  <IconifyIcon icon="lucide:hard-drive" style="font-size: 11px;" />
                  {{ pool.diskCount }} 块硬盘
                </span>
                <span class="meta-chip">
                  <IconifyIcon icon="lucide:box" style="font-size: 11px;" />
                  {{ getVolumesByPool(pool.id).length }} 个存储空间
                </span>
              </div>
              <div v-if="pool.disks && pool.disks.length" class="ph-row ph-row-disks">
                <span
                  v-for="disk in pool.disks"
                  :key="disk.deviceName"
                  class="disk-tag"
                  @click.stop="goToDiskDetail(disk.deviceName)"
                >
                  {{ disk.deviceName }}
                </span>
              </div>
            </div>
          </div>

          <!-- 右侧容量与操作面板 -->
          <div class="pool-header-panel">
            <div class="ph-panel-capacity">
              <span class="cap-used">{{ pool.usedCapacity }}</span>
              <span class="cap-div">/</span>
              <span class="cap-total">{{ pool.totalCapacity }}</span>
              <span
                class="cap-percent"
                :style="{ color: getCapacityColor(getUsagePercent(pool.usedCapacity, pool.totalCapacity)) }"
              >
                {{ getUsagePercent(pool.usedCapacity, pool.totalCapacity) }}%
              </span>
            </div>
            <div class="ph-panel-progress">
              <Progress
                :percent="getUsagePercent(pool.usedCapacity, pool.totalCapacity)"
                :stroke-color="getCapacityColor(getUsagePercent(pool.usedCapacity, pool.totalCapacity))"
                :show-info="false"
                :stroke-width="5"
                size="small"
              />
            </div>
            <div class="ph-panel-actions">
              <Button
                size="small"
                class="detail-btn"
                @click.stop="goToPoolDetail(pool.id)"
              >
                <IconifyIcon icon="lucide:file-text" style="font-size: 12px;" />
                详细信息
              </Button>
              <Dropdown>
                <Button size="small" class="action-dropdown-btn">
                  <IconifyIcon icon="lucide:settings" style="font-size: 12px;" />
                  高级动作
                  <IconifyIcon icon="lucide:chevron-down" style="font-size: 10px;" />
                </Button>
                <template #overlay>
                  <div class="pool-action-menu">
                    <div class="menu-item" @click.stop="handleReplaceDisk(pool)">
                      <IconifyIcon icon="lucide:refresh-cw" style="font-size: 13px; color: #faad14;" />
                      <span>换盘</span>
                    </div>
                    <div class="menu-item" @click.stop="handleRebuildPool(pool)">
                      <IconifyIcon icon="lucide:rotate-ccw" style="font-size: 13px; color: #1677ff;" />
                      <span>重构</span>
                    </div>
                    <div class="menu-divider" />
                    <div class="menu-item danger" @click.stop="handleDeletePool(pool)">
                      <IconifyIcon icon="lucide:trash-2" style="font-size: 13px; color: #ff4d4f;" />
                      <span>删除</span>
                    </div>
                  </div>
                </template>
              </Dropdown>
            </div>
          </div>
        </div>

        <!-- 存储空间表头 -->
        <div class="volumes-section-header">
          <div class="volumes-section-title">
            <IconifyIcon icon="lucide:box" style="font-size: 14px; color: #1677ff;" />
            <span>存储空间</span>
            <span class="volumes-count">{{ getVolumesByPool(pool.id).length }}</span>
          </div>
          <Button
            size="small"
            class="create-volume-inline-btn"
            @click="openCreateModalForPool(pool.id)"
          >
            <IconifyIcon icon="lucide:plus" style="font-size: 12px;" />
            创建存储空间
          </Button>
        </div>

        <!-- 该池下的存储空间卡片 -->
        <div class="pool-volumes-container">
          <div
            v-for="vol in getVolumesByPool(pool.id)"
            :key="vol.id"
            class="volume-nest-card"
          >
            <div class="nest-card-header">
              <div class="nest-icon-box">
                <IconifyIcon icon="lucide:box" style="font-size: 16px; color: #1677ff;" />
              </div>
              <div class="nest-title-info">
                <div class="nest-name-row">
                  <span class="nest-name">{{ vol.name }}</span>
                  <Tag :color="getStatusColor(vol.status)" size="small">
                    <span
                      class="status-dot"
                      :style="{ background: vol.status === '正常' ? '#52c41a' : '#8c8c8c' }"
                    />
                    {{ vol.status }}
                  </Tag>
                </div>
              </div>
            </div>
            <div class="nest-card-body">
              <div class="nest-capacity">
                <div class="nest-capacity-top">
                  <span class="nest-capacity-text">
                    <span class="nest-used">{{ vol.usedCapacity }}</span>
                    <span class="nest-divider">/</span>
                    <span class="nest-total">{{ vol.totalCapacity }}</span>
                  </span>
                  <span
                    class="nest-percent"
                    :style="{ color: getCapacityColor(getUsagePercent(vol.usedCapacity, vol.totalCapacity)) }"
                  >
                    {{ getUsagePercent(vol.usedCapacity, vol.totalCapacity) }}%
                  </span>
                </div>
                <Progress
                  :percent="getUsagePercent(vol.usedCapacity, vol.totalCapacity)"
                  :stroke-color="getCapacityColor(getUsagePercent(vol.usedCapacity, vol.totalCapacity))"
                  :show-info="false"
                  :stroke-width="5"
                  size="small"
                />
              </div>
              <div class="nest-card-footer">
                <span class="fs-tag">
                  <IconifyIcon :icon="getFsIcon(vol.filesystem)" style="font-size: 10px; color: #8c8c8c;" />
                  {{ vol.filesystem }}
                </span>
                <div class="nest-actions">
                  <Button
                    size="small"
                    class="user-btn"
                    @click="handleVolumeUsers(vol)"
                  >
                    <IconifyIcon icon="lucide:users" style="font-size: 11px;" />
                    用户管理
                  </Button>
                  <Dropdown>
                    <Button size="small" class="vol-action-btn">
                      <IconifyIcon icon="lucide:settings" style="font-size: 11px;" />
                      高级动作
                      <IconifyIcon icon="lucide:chevron-down" style="font-size: 10px;" />
                    </Button>
                    <template #overlay>
                      <div class="vol-action-menu">
                        <div class="menu-item" @click="handleExpandVolume(vol)">
                          <IconifyIcon icon="lucide:maximize" style="font-size: 13px; color: #1677ff;" />
                          <span>扩容</span>
                        </div>
                        <div class="menu-divider" />
                        <div class="menu-item danger" @click="handleDeleteVolume(vol)">
                          <IconifyIcon icon="lucide:trash-2" style="font-size: 13px; color: #ff4d4f;" />
                          <span>删除</span>
                        </div>
                      </div>
                    </template>
                  </Dropdown>
                </div>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-if="getVolumesByPool(pool.id).length === 0" class="pool-empty">
            <IconifyIcon icon="lucide:inbox" style="font-size: 20px; color: #d9d9d9;" />
            <span>该存储池下暂无存储空间</span>
          </div>
        </div>
      </div>

      <!-- 基于目录的存储空间 -->
      <div v-if="directoryVolumes.length > 0" class="pool-wrapper-card directory-wrapper">
        <!-- 目录头部信息 -->
        <div class="pool-header directory-header">
          <div class="pool-header-main">
            <div class="pool-icon-box" style="background: #f6ffed;">
              <IconifyIcon icon="lucide:folder-open" style="font-size: 22px; color: #52c41a;" />
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
            <IconifyIcon icon="lucide:box" style="font-size: 14px; color: #1677ff;" />
            <span>存储空间</span>
            <span class="volumes-count">{{ directoryVolumes.length }}</span>
          </div>
          <Button
            size="small"
            class="create-volume-inline-btn"
            @click="openCreateModal"
          >
            <IconifyIcon icon="lucide:plus" style="font-size: 12px;" />
            创建存储空间
          </Button>
        </div>

        <!-- 目录下的存储空间卡片 -->
        <div class="pool-volumes-container">
          <div
            v-for="vol in directoryVolumes"
            :key="vol.id"
            class="volume-nest-card"
          >
            <div class="nest-card-header">
              <div class="nest-icon-box" style="background: #f6ffed;">
                <IconifyIcon icon="lucide:folder" style="font-size: 16px; color: #52c41a;" />
              </div>
              <div class="nest-title-info">
                <div class="nest-name-row">
                  <span class="nest-name">{{ vol.name }}</span>
                  <Tag :color="getStatusColor(vol.status)" size="small">
                    <span
                      class="status-dot"
                      :style="{ background: vol.status === '正常' ? '#52c41a' : '#8c8c8c' }"
                    />
                    {{ vol.status }}
                  </Tag>
                </div>
              </div>
            </div>
            <div class="nest-card-body">
              <div class="nest-capacity">
                <div class="nest-capacity-top">
                  <span class="nest-capacity-text">
                    <span class="nest-used">{{ vol.usedCapacity }}</span>
                    <span class="nest-divider">/</span>
                    <span class="nest-total">{{ vol.totalCapacity }}</span>
                  </span>
                  <span
                    class="nest-percent"
                    :style="{ color: getCapacityColor(getUsagePercent(vol.usedCapacity, vol.totalCapacity)) }"
                  >
                    {{ getUsagePercent(vol.usedCapacity, vol.totalCapacity) }}%
                  </span>
                </div>
                <Progress
                  :percent="getUsagePercent(vol.usedCapacity, vol.totalCapacity)"
                  :stroke-color="getCapacityColor(getUsagePercent(vol.usedCapacity, vol.totalCapacity))"
                  :show-info="false"
                  :stroke-width="5"
                  size="small"
                />
              </div>
              <div class="nest-card-footer">
                <span class="fs-tag">
                  <IconifyIcon :icon="getFsIcon(vol.filesystem)" style="font-size: 10px; color: #8c8c8c;" />
                  {{ vol.filesystem }}
                </span>
                <div class="nest-actions">
                  <Button
                    size="small"
                    class="user-btn"
                    @click="handleVolumeUsers(vol)"
                  >
                    <IconifyIcon icon="lucide:users" style="font-size: 11px;" />
                    用户管理
                  </Button>
                  <Dropdown>
                    <Button size="small" class="vol-action-btn">
                      <IconifyIcon icon="lucide:settings" style="font-size: 11px;" />
                      高级动作
                      <IconifyIcon icon="lucide:chevron-down" style="font-size: 10px;" />
                    </Button>
                    <template #overlay>
                      <div class="vol-action-menu">
                        <div class="menu-item" @click="handleExpandVolume(vol)">
                          <IconifyIcon icon="lucide:maximize" style="font-size: 13px; color: #1677ff;" />
                          <span>扩容</span>
                        </div>
                        <div class="menu-divider" />
                        <div class="menu-item danger" @click="handleDeleteVolume(vol)">
                          <IconifyIcon icon="lucide:trash-2" style="font-size: 13px; color: #ff4d4f;" />
                          <span>删除</span>
                        </div>
                      </div>
                    </template>
                  </Dropdown>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 全部为空 -->
    <Empty
      v-else-if="!loading"
      description="暂无存储空间"
      class="empty-state"
    >
      <template #image>
        <div class="empty-image">
          <IconifyIcon icon="lucide:box" style="font-size: 56px; color: #d9d9d9;" />
        </div>
      </template>
      <Button type="primary" size="small" @click="openCreateModal">
        <IconifyIcon icon="lucide:plus" style="font-size: 12px;" />
        立即创建
      </Button>
    </Empty>

    <!-- 创建存储空间弹窗 -->
    <Modal
      v-model:open="createModalVisible"
      title="创建存储空间"
      width="560px"
      ok-text="确认"
      cancel-text="取消"
      @ok="handleCreate"
      class="create-volume-modal"
    >
      <Form
        ref="createFormRef"
        :model="createForm"
        layout="vertical"
        :rules="{
          name: [
            { required: true, message: '请输入存储空间名称', trigger: 'blur' },
          ],
          poolId: [
            { required: true, message: '请选择存储池', trigger: 'change' },
          ],
          bindSource: [
            { required: true, message: '请输入源目录路径', trigger: 'blur' },
          ],
          size: [
            { required: true, message: '请输入存储空间大小', trigger: 'blur' },
          ],
          filesystem: [
            { required: true, message: '请选择文件系统', trigger: 'change' },
          ],
        }"
      >
        <Form.Item label="存储空间名称" name="name">
          <Input
            v-model:value="createForm.name"
            placeholder="请输入存储空间名称"
          >
            <template #prefix>
              <IconifyIcon icon="lucide:box" style="font-size: 14px; color: #bfbfbf;" />
            </template>
          </Input>
        </Form.Item>

        <Form.Item label="存储来源" required>
          <Radio.Group v-model:value="createForm.sourceType">
            <Radio value="pool">
              <span class="radio-label">
                <IconifyIcon icon="lucide:database" style="font-size: 12px;" />
                存储池 (RAID + LVM)
              </span>
            </Radio>
            <Radio value="directory">
              <span class="radio-label">
                <IconifyIcon icon="lucide:folder-symlink" style="font-size: 12px;" />
                现有目录 (bind mount)
              </span>
            </Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          v-if="createForm.sourceType === 'pool'"
          label="选择存储池"
          name="poolId"
        >
          <Select
            v-model:value="createForm.poolId"
            placeholder="请选择存储池"
          >
            <Select.Option
              v-for="pool in pools"
              :key="pool.id"
              :value="pool.id"
            >
              <span style="display: inline-flex; align-items: center; gap: 6px;">
                <IconifyIcon icon="lucide:database" style="font-size: 12px; color: #1677ff;" />
                {{ pool.name }}
                <span style="color: #8c8c8c; font-size: 12px;">({{ pool.raidType }})</span>
              </span>
            </Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          v-if="createForm.sourceType === 'directory'"
          label="源目录路径"
          name="bindSource"
        >
          <Input
            v-model:value="createForm.bindSource"
            placeholder="如 /opt/old-data"
          >
            <template #prefix>
              <IconifyIcon icon="lucide:folder-symlink" style="font-size: 14px; color: #bfbfbf;" />
            </template>
          </Input>
        </Form.Item>

        <Form.Item label="存储空间大小" name="size">
          <div class="size-input-row">
            <Input
              v-model:value="createForm.size"
              type="number"
              placeholder="请输入存储空间大小"
              class="size-input"
            >
              <template #prefix>
                <IconifyIcon icon="lucide:ruler" style="font-size: 14px; color: #bfbfbf;" />
              </template>
            </Input>
            <Select
              v-model:value="createForm.sizeUnit"
              :options="sizeUnitOptions"
              class="size-unit-select"
            />
          </div>
        </Form.Item>

        <Form.Item label="文件系统" name="filesystem">
          <Select
            v-model:value="createForm.filesystem"
            :options="filesystemOptions"
            placeholder="请选择文件系统"
          >
            <template #suffixIcon>
              <IconifyIcon icon="lucide:folder-tree" style="font-size: 12px; color: #bfbfbf;" />
            </template>
          </Select>
        </Form.Item>

        <Form.Item label="描述">
          <Input.TextArea
            v-model:value="createForm.description"
            :rows="3"
            placeholder="请输入描述信息（选填）"
          />
        </Form.Item>
      </Form>
    </Modal>
  </div>
</template>

<style scoped>
.volume-manager {
  padding: 0 20px 16px;
  width: 100%;
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
  margin: 0 -20px 16px;
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

/* 操作栏 */
.action-bar {
  margin-bottom: 10px;
}

/* 存储空间列表 */
.volumes-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 外层大卡片：存储池包裹 */
.pool-wrapper-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #d9d9d9;
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
  border-color: #b7eb8f;
  box-shadow: 0 2px 10px rgba(82, 196, 26, 0.06);
}

.directory-wrapper:hover {
  border-color: #73d13d;
  box-shadow: 0 6px 24px rgba(82, 196, 26, 0.12);
}

/* 存储池头部 */
.pool-header {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f0f5ff 0%, #e6f0ff 100%);
  border-bottom: 1px solid #e6e6e6;
  transition: all 0.2s ease;
  gap: 24px;
}

.directory-header {
  background: linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%);
  cursor: default;
}

.directory-header:hover {
  background: linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%);
}

/* 左侧主信息 */
.pool-header-main {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  flex: 1;
  min-width: 0;
}

.pool-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.pool-header-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 2px;
  min-width: 0;
}

.ph-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.ph-row-name {
  gap: 10px;
}

.pool-name {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
}

.ph-row-meta {
  gap: 6px;
}

.meta-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #595959;
  background: rgba(255, 255, 255, 0.7);
  padding: 3px 10px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.dir-chip {
  color: #389e0d;
  background: rgba(82, 196, 26, 0.12);
}

.ph-row-disks {
  gap: 6px;
}

.disk-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #1677ff;
  background: rgba(22, 119, 255, 0.08);
  padding: 3px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(22, 119, 255, 0.15);
}

.disk-tag:hover {
  background: rgba(22, 119, 255, 0.15);
  border-color: rgba(22, 119, 255, 0.3);
}

/* 右侧容量与操作面板 */
.pool-header-panel {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  min-width: 170px;
  padding-top: 2px;
  flex-shrink: 0;
}

.ph-panel-capacity {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  white-space: nowrap;
}

.cap-used {
  font-weight: 700;
  color: #262626;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.cap-div {
  color: #bfbfbf;
}

.cap-total {
  color: #8c8c8c;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.cap-percent {
  font-weight: 700;
  font-family: 'SF Mono', 'Fira Code', monospace;
  margin-left: 6px;
}

.ph-panel-progress {
  width: 140px;
}

.ph-panel-progress :deep(.ant-progress) {
  margin-bottom: 0;
}

.ph-panel-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
}

.detail-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  border-radius: 6px;
}

.action-dropdown-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  border-radius: 6px;
}

/* 下拉菜单 */
.pool-action-menu {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  border: 1px solid #f0f0f0;
  padding: 4px;
  min-width: 120px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  color: #262626;
  transition: all 0.2s ease;
}

.menu-item:hover {
  background: #f5f5f5;
}

.menu-item.danger:hover {
  background: #fff1f0;
}

.menu-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 4px 0;
}

/* 存储空间表头 */
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

/* 存储空间容器 */
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

/* 内层存储空间卡片 */
.volume-nest-card {
  background: #fff;
  border-radius: 10px;
  border: 1px solid #e8e8e8;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.volume-nest-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  border-color: #1677ff;
}

.nest-card-header {
  padding: 10px 14px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.nest-icon-box {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #e6f7ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nest-title-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.nest-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nest-name {
  font-size: 13px;
  font-weight: 700;
  color: #262626;
}

.nest-source-tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 3px;
  width: fit-content;
}

.pool-source {
  color: #1677ff;
  background: rgba(22, 119, 255, 0.1);
}

.dir-source {
  color: #52c41a;
  background: rgba(82, 196, 26, 0.1);
}

.nest-card-body {
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 容量 */
.nest-capacity {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nest-capacity-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nest-capacity-text {
  font-size: 12px;
  color: #262626;
}

.nest-used {
  font-weight: 700;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.nest-divider {
  color: #bfbfbf;
  margin: 0 2px;
}

.nest-total {
  color: #8c8c8c;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.nest-percent {
  font-size: 12px;
  font-weight: 700;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.nest-capacity-bottom {
  font-size: 11px;
  color: #8c8c8c;
  display: flex;
  align-items: center;
  gap: 3px;
}

/* 卡片底部操作区 */
.nest-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.fs-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #595959;
  background: #f5f5f5;
  padding: 2px 8px;
  border-radius: 4px;
}

.nest-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.user-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  border-radius: 6px;
}

.vol-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  border-radius: 6px;
}

.vol-action-menu {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  border: 1px solid #f0f0f0;
  padding: 4px;
  min-width: 120px;
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

/* 创建弹窗 */
.create-volume-modal :deep(.ant-modal-title) {
  display: flex;
  align-items: center;
  gap: 8px;
}

.radio-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.size-input-row {
  display: flex;
  gap: 8px;
}

.size-input {
  flex: 1;
}

.size-unit-select {
  width: 100px;
}

/* 响应式 */
@media (max-width: 992px) {
  .pool-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }

  .pool-header-main {
    width: 100%;
  }

  .pool-header-panel {
    width: 100%;
    align-items: stretch;
    flex-direction: row;
    flex-wrap: nowrap;
    gap: 12px;
    padding-top: 0;
    padding-left: 58px;
  }

  .ph-panel-capacity {
    white-space: nowrap;
    flex-shrink: 0;
  }

  .ph-panel-progress {
    flex: 1;
    min-width: 100px;
  }

  .ph-panel-actions {
    flex-shrink: 0;
    margin-top: 0;
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

  .pool-header {
    padding: 10px 12px;
  }

  .pool-volumes-container {
    padding: 10px 12px;
  }
}
</style>

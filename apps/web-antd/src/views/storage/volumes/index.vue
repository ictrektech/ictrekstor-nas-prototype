<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
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

const items = ref<StorageVolume[]>([]);
const pools = ref<StoragePool[]>([]);
const loading = ref(false);

// 创建弹窗
const createModalVisible = ref(false);
const createFormRef = ref();
const createForm = ref({
  name: '',
  locationType: 'pool',
  poolId: '',
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

function openCreateModal() {
  createForm.value = {
    name: '',
    locationType: 'pool',
    poolId: pools.value[0]?.id || '',
    size: undefined,
    sizeUnit: 'GB',
    filesystem: 'ext4',
    description: '',
  };
  createModalVisible.value = true;
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
  return Math.round((u / t) * 100);
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

// 容量进度条颜色
function getCapacityColor(percent: number): string {
  if (percent >= 90) return '#ff4d4f';
  if (percent >= 70) return '#faad14';
  return '#1677ff';
}

// 卡片头部渐变背景
function getVolumeHeaderBg(vol: StorageVolume): string {
  const percent = getUsagePercent(vol.usedCapacity, vol.totalCapacity);
  if (percent >= 90) {
    return 'linear-gradient(135deg, #fff1f0 0%, #ffccc7 100%)';
  }
  if (percent >= 70) {
    return 'linear-gradient(135deg, #fff7e6 0%, #ffe7ba 100%)';
  }
  return 'linear-gradient(135deg, #e6f7ff 0%, #bae0ff 100%)';
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

// 统计概览
const overviewStats = computed(() => {
  const total = items.value.length;
  const totalCap = items.value.reduce((sum, v) => {
    const num = parseFloat(v.totalCapacity);
    return sum + (v.totalCapacity.includes('TB') ? num * 1024 : num);
  }, 0);
  const totalUsed = items.value.reduce((sum, v) => {
    const num = parseFloat(v.usedCapacity);
    return sum + (v.usedCapacity.includes('TB') ? num * 1024 : num);
  }, 0);
  return { total, totalCap: totalCap >= 1024 ? (totalCap / 1024).toFixed(2) + ' TB' : totalCap.toFixed(0) + ' GB', totalUsed: totalUsed >= 1024 ? (totalUsed / 1024).toFixed(2) + ' TB' : totalUsed.toFixed(0) + ' GB' };
});

onMounted(loadData);
</script>

<template>
  <div class="volume-manager">
    <!-- 统计概览 -->
    <div class="overview-cards">
      <div class="overview-card">
        <div class="overview-icon-box" style="background: #e6f7ff;">
          <IconifyIcon icon="lucide:box" style="font-size: 22px; color: #1677ff;" />
        </div>
        <div class="overview-info">
          <div class="overview-value">{{ overviewStats.total }}</div>
          <div class="overview-label">存储空间总数</div>
        </div>
      </div>
      <div class="overview-card">
        <div class="overview-icon-box" style="background: #f6ffed;">
          <IconifyIcon icon="lucide:hard-drive" style="font-size: 22px; color: #52c41a;" />
        </div>
        <div class="overview-info">
          <div class="overview-value">{{ overviewStats.totalCap }}</div>
          <div class="overview-label">总容量</div>
        </div>
      </div>
      <div class="overview-card">
        <div class="overview-icon-box" style="background: #fff7e6;">
          <IconifyIcon icon="lucide:database" style="font-size: 22px; color: #faad14;" />
        </div>
        <div class="overview-info">
          <div class="overview-value">{{ overviewStats.totalUsed }}</div>
          <div class="overview-label">已用容量</div>
        </div>
      </div>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <Button type="primary" @click="openCreateModal">
        <IconifyIcon icon="lucide:plus" style="font-size: 14px;" />
        创建存储空间
      </Button>
    </div>

    <!-- 存储空间列表 -->
    <div v-if="items.length > 0" class="volume-list">
      <Card
        v-for="vol in items"
        :key="vol.id"
        class="volume-card"
        :bordered="true"
        :body-style="{ padding: '0' }"
      >
        <!-- 卡片头部 -->
        <div
          class="volume-header"
          :style="{ background: getVolumeHeaderBg(vol) }"
        >
          <div class="volume-header-main">
            <div class="volume-icon-box" style="background: #fff;">
              <IconifyIcon icon="lucide:box" style="font-size: 20px; color: #1677ff;" />
            </div>
            <div class="volume-title-info">
              <div class="volume-name-row">
                <span class="volume-name">{{ vol.name }}</span>
                <Tag :color="getStatusColor(vol.status)" size="small">
                  <span
                    class="status-dot"
                    :style="{ background: vol.status === '正常' ? '#52c41a' : '#8c8c8c' }"
                  />
                  {{ vol.status }}
                </Tag>
              </div>
              <div class="volume-subtitle">
                <span class="raid-badge">
                  <IconifyIcon icon="lucide:layers" style="font-size: 11px;" />
                  {{ vol.raidType }}
                </span>
                <span class="pool-name">
                  <IconifyIcon icon="lucide:database" style="font-size: 11px;" />
                  {{ vol.poolName }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 卡片主体 -->
        <div class="volume-body">
          <!-- 容量可视化 -->
          <div class="capacity-section">
            <div class="capacity-header">
              <div class="capacity-info">
                <span class="capacity-label">容量使用</span>
                <span class="capacity-detail">
                  <span class="capacity-used">{{ vol.usedCapacity }}</span>
                  <span class="capacity-divider">/</span>
                  <span class="capacity-total">{{ vol.totalCapacity }}</span>
                </span>
              </div>
              <Tooltip :title="`剩余 ${getFreeCapacity(vol.usedCapacity, vol.totalCapacity)}`">
                <span
                  class="capacity-percent-badge"
                  :style="{
                    color: getCapacityColor(getUsagePercent(vol.usedCapacity, vol.totalCapacity)),
                    borderColor: getCapacityColor(getUsagePercent(vol.usedCapacity, vol.totalCapacity)),
                    background: `${getCapacityColor(getUsagePercent(vol.usedCapacity, vol.totalCapacity))}10`,
                  }"
                >
                  {{ getUsagePercent(vol.usedCapacity, vol.totalCapacity) }}%
                </span>
              </Tooltip>
            </div>
            <div class="capacity-progress-bar">
              <Progress
                :percent="getUsagePercent(vol.usedCapacity, vol.totalCapacity)"
                :stroke-color="getCapacityColor(getUsagePercent(vol.usedCapacity, vol.totalCapacity))"
                :show-info="false"
                :stroke-width="8"
                size="small"
              />
            </div>
            <div class="capacity-footer">
              <span class="capacity-free">
                <IconifyIcon icon="lucide:circle-check" style="font-size: 11px;" />
                剩余 {{ getFreeCapacity(vol.usedCapacity, vol.totalCapacity) }}
              </span>
            </div>
          </div>

          <!-- 元信息 -->
          <div class="meta-section">
            <div class="meta-item">
              <div class="meta-icon-box" style="background: #f6ffed;">
                <IconifyIcon icon="lucide:hard-drive" style="font-size: 13px; color: #52c41a;" />
              </div>
              <div class="meta-text">
                <span class="meta-label">硬盘类型</span>
                <span class="meta-value">{{ vol.diskType }}</span>
              </div>
            </div>
            <div class="meta-item">
              <div class="meta-icon-box" style="background: #e6f7ff;">
                <IconifyIcon icon="lucide:plug" style="font-size: 13px; color: #1677ff;" />
              </div>
              <div class="meta-text">
                <span class="meta-label">接口协议</span>
                <span class="meta-value">{{ vol.interfaceProtocol }}</span>
              </div>
            </div>
            <div class="meta-item">
              <div class="meta-icon-box" style="background: #fff7e6;">
                <IconifyIcon :icon="getFsIcon(vol.filesystem)" style="font-size: 13px; color: #faad14;" />
              </div>
              <div class="meta-text">
                <span class="meta-label">文件系统</span>
                <span class="meta-value">{{ vol.filesystem }}</span>
              </div>
            </div>
          </div>

          <!-- 挂载路径 -->
          <div v-if="vol.mountPath" class="mount-section">
            <Tag color="blue" size="small">
              <IconifyIcon icon="lucide:link" style="font-size: 10px; margin-right: 2px;" />
              {{ vol.mountPath }}
            </Tag>
          </div>

          <!-- 使用硬盘 -->
          <div class="disks-section">
            <div class="disks-title">
              <IconifyIcon icon="lucide:disc-3" style="font-size: 12px;" />
              使用硬盘 ({{ vol.disks.length }})
            </div>
            <div class="disks-list">
              <div
                v-for="disk in vol.disks"
                :key="disk.deviceName"
                class="disk-chip"
              >
                <div class="disk-chip-icon-box">
                  <IconifyIcon icon="lucide:hard-drive" style="font-size: 14px; color: #1677ff;" />
                </div>
                <div class="disk-chip-info">
                  <span class="disk-chip-name">{{ disk.deviceName }}</span>
                  <span class="disk-chip-size">{{ disk.size }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>

    <!-- 空状态 -->
    <Empty v-else description="暂无存储空间" class="empty-state">
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
      title="添加存储空间"
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

        <Form.Item label="存储位置">
          <Radio.Group v-model:value="createForm.locationType">
            <Radio value="pool">
              <span class="radio-label">
                <IconifyIcon icon="lucide:database" style="font-size: 12px;" />
                存储池
              </span>
            </Radio>
            <Radio value="local">
              <span class="radio-label">
                <IconifyIcon icon="lucide:folder" style="font-size: 12px;" />
                本地目录
              </span>
            </Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          v-if="createForm.locationType === 'pool'"
          label="存储池"
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
              </span>
            </Select.Option>
          </Select>
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
  padding: 0 24px 24px;
  width: 100%;
}

/* 统计概览 */
.overview-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.overview-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  border: 1px solid #f0f0f0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.overview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #1677ff;
}

.overview-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.overview-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.overview-value {
  font-size: 20px;
  font-weight: 700;
  color: #262626;
  line-height: 1.2;
}

.overview-label {
  font-size: 12px;
  color: #8c8c8c;
}

/* 操作栏 */
.action-bar {
  margin-bottom: 20px;
}

/* 存储空间列表 */
.volume-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.volume-card {
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.volume-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: #1677ff;
}

/* 卡片头部 */
.volume-header {
  padding: 16px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.volume-header-main {
  display: flex;
  align-items: center;
  gap: 14px;
}

.volume-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.volume-title-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.volume-name-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.volume-name {
  font-size: 16px;
  font-weight: 700;
  color: #262626;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}

.volume-subtitle {
  display: flex;
  align-items: center;
  gap: 12px;
}

.raid-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #595959;
  background: rgba(255, 255, 255, 0.7);
  padding: 2px 8px;
  border-radius: 4px;
}

.pool-name {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #8c8c8c;
}

/* 卡片主体 */
.volume-body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* 容量区域 */
.capacity-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.capacity-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.capacity-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.capacity-label {
  font-size: 13px;
  color: #8c8c8c;
  font-weight: 500;
}

.capacity-detail {
  font-size: 14px;
  color: #262626;
}

.capacity-used {
  font-weight: 700;
  color: #262626;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.capacity-divider {
  color: #bfbfbf;
  margin: 0 4px;
}

.capacity-total {
  color: #8c8c8c;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.capacity-percent-badge {
  padding: 3px 10px;
  border-radius: 10px;
  border: 1px solid;
  font-size: 13px;
  font-weight: 700;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.capacity-progress-bar :deep(.ant-progress) {
  margin-bottom: 0;
}

.capacity-footer {
  font-size: 12px;
  color: #8c8c8c;
}

.capacity-free {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* 元信息区域 */
.meta-section {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  flex: 1;
  min-width: 140px;
}

.meta-icon-box {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.meta-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.meta-label {
  font-size: 11px;
  color: #8c8c8c;
}

.meta-value {
  font-size: 13px;
  font-weight: 600;
  color: #262626;
}

/* 挂载路径 */
.mount-section {
  display: flex;
}

/* 硬盘区域 */
.disks-section {
  border-top: 1px dashed #f0f0f0;
  padding-top: 14px;
}

.disks-title {
  font-size: 12px;
  font-weight: 600;
  color: #595959;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.disks-list {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.disk-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f0f5ff;
  border: 1px solid #bae0ff;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 13px;
  transition: all 0.2s ease;
}

.disk-chip:hover {
  background: #e6f7ff;
  border-color: #1677ff;
}

.disk-chip-icon-box {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.disk-chip-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.disk-chip-name {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-weight: 600;
  color: #262626;
  font-size: 12px;
}

.disk-chip-size {
  color: #8c8c8c;
  font-size: 11px;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

/* 空状态 */
.empty-state {
  padding: 48px 0;
}

.empty-image {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
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
  .overview-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .meta-section {
    flex-direction: column;
  }
}

@media (max-width: 576px) {
  .volume-manager {
    padding: 0 12px 12px;
  }

  .overview-cards {
    grid-template-columns: 1fr;
  }

  .volume-header-main {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

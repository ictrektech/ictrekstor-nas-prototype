<script lang="ts" setup>
import { ref, onMounted } from 'vue';
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
} from 'ant-design-vue';
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

onMounted(loadData);
</script>

<template>
  <div class="volume-manager">
    <!-- 创建按钮 -->
    <div class="action-bar">
      <Button type="primary" @click="openCreateModal">
        + 创建存储空间
      </Button>
    </div>

    <!-- 存储空间列表 -->
    <div class="volume-list">
      <Card
        v-for="vol in items"
        :key="vol.id"
        class="volume-card"
        :bordered="true"
      >
        <div class="volume-card-body">
          <!-- 头部 -->
          <div class="volume-header">
            <div class="volume-title-row">
              <span class="volume-icon">🖴</span>
              <span class="volume-name">{{ vol.name }}</span>
              <Tag color="success" size="small">{{ vol.status }}</Tag>
            </div>
            <div class="volume-raid">{{ vol.raidType }}</div>
          </div>

          <!-- 容量信息 -->
          <div class="volume-capacity-row">
            <span class="capacity-label">容量</span>
            <span class="capacity-value">
              {{ vol.usedCapacity }} / {{ vol.totalCapacity }}
            </span>
            <span class="capacity-free">
              剩余 {{ getFreeCapacity(vol.usedCapacity, vol.totalCapacity) }}
            </span>
          </div>

          <!-- 进度条 -->
          <div class="volume-progress">
            <Progress
              :percent="getUsagePercent(vol.usedCapacity, vol.totalCapacity)"
              :stroke-color="
                getUsagePercent(vol.usedCapacity, vol.totalCapacity) > 90
                  ? '#ff4d4f'
                  : getUsagePercent(vol.usedCapacity, vol.totalCapacity) > 70
                    ? '#faad14'
                    : '#1890ff'
              "
              :show-info="false"
              size="small"
            />
          </div>

          <!-- 元信息 -->
          <div class="volume-meta">
            <div class="meta-item">
              <span class="meta-label">硬盘类型</span>
              <span class="meta-value">{{ vol.diskType }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">接口协议</span>
              <span class="meta-value">{{ vol.interfaceProtocol }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">文件系统</span>
              <span class="meta-value">{{ vol.filesystem }}</span>
            </div>
          </div>

          <!-- 使用硬盘 -->
          <div class="volume-disks">
            <div class="disks-label">使用硬盘 {{ vol.disks.length }}</div>
            <div class="disks-list">
              <div
                v-for="disk in vol.disks"
                :key="disk.deviceName"
                class="disk-chip"
              >
                <span class="disk-chip-icon">💾</span>
                <span class="disk-chip-name">{{ disk.deviceName }}</span>
                <span class="disk-chip-size">{{ disk.size }}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>

    <!-- 创建存储空间弹窗 -->
    <Modal
      v-model:open="createModalVisible"
      title="添加存储空间"
      width="520px"
      ok-text="确认"
      cancel-text="取消"
      @ok="handleCreate"
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
          />
        </Form.Item>

        <Form.Item label="存储位置">
          <Radio.Group v-model:value="createForm.locationType">
            <Radio value="pool">存储池</Radio>
            <Radio value="local">本地目录</Radio>
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
              {{ pool.name }}
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
            />
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
          />
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
  padding: 24px;
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
  border-radius: 8px;
  transition: box-shadow 0.2s ease;
}

.volume-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
}

.volume-card :deep(.ant-card-body) {
  padding: 24px;
}

.volume-card-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 头部 */
.volume-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.volume-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.volume-icon {
  font-size: 22px;
}

.volume-name {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.volume-raid {
  font-size: 13px;
  color: #8c8c8c;
  padding-left: 32px;
}

/* 容量行 */
.volume-capacity-row {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
}

.capacity-label {
  color: #595959;
  font-weight: 500;
}

.capacity-value {
  color: #262626;
  font-weight: 600;
  font-family: 'SF Mono', monospace;
}

.capacity-free {
  color: #8c8c8c;
  margin-left: auto;
}

/* 进度条 */
.volume-progress {
  padding: 0 4px;
}

/* 元信息 */
.volume-meta {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.meta-label {
  color: #8c8c8c;
}

.meta-value {
  color: #262626;
  font-weight: 500;
}

/* 使用硬盘 */
.volume-disks {
  border-top: 1px dashed #f0f0f0;
  padding-top: 14px;
}

.disks-label {
  font-size: 13px;
  color: #595959;
  margin-bottom: 10px;
}

.disks-list {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.disk-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f5f5f5;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  padding: 8px 14px;
  font-size: 13px;
}

.disk-chip-icon {
  font-size: 14px;
}

.disk-chip-name {
  font-family: 'SF Mono', monospace;
  font-weight: 500;
  color: #262626;
}

.disk-chip-size {
  color: #8c8c8c;
  font-size: 12px;
}

/* 弹窗内样式 */
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
</style>

<script lang="ts" setup>
import { IconifyIcon } from '@vben/icons';
import { Checkbox, Form, Input, Modal, Select } from 'ant-design-vue';
import { computed, nextTick, reactive, ref, watch } from 'vue';

import type { DiskInfo } from '#/api/storage';

import type { PoolCreateForm } from '../types';

interface Props {
  visible: boolean;
  loading: boolean;
  availableDisks: DiskInfo[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:visible': [v: boolean];
  submit: [values: PoolCreateForm];
}>();

const formRef = ref<any>(null);

const formState = reactive<PoolCreateForm>({
  name: '',
  raidType: 'RAID0',
  description: '',
  diskIds: [],
});

const rules = {
  name: [{ required: true, message: '请输入存储池名称', trigger: 'blur' }],
  raidType: [{ required: true, message: '请选择RAID类型', trigger: 'change' }],
  diskIds: [
    {
      required: true,
      message: '请至少选择一块磁盘',
      trigger: 'change',
      type: 'array' as const,
    },
  ],
};

const minDiskCount = computed(() => {
  const raid = formState.raidType;
  if (raid === 'RAID0' || raid === 'RAID1') return 2;
  if (raid === 'RAID5') return 3;
  if (raid === 'RAID6') return 4;
  if (raid === 'RAID10') return 4;
  return 1;
});

const diskHelpText = computed(() => {
  const min = minDiskCount.value;
  const selected = formState.diskIds.length;
  if (selected === 0) return `当前 RAID 类型至少需要 ${min} 块磁盘`;
  if (selected < min) return `已选 ${selected} 块，至少需要 ${min} 块`;
  return `已选 ${selected} 块磁盘`;
});

const diskHelpStatus = computed(() => {
  const min = minDiskCount.value;
  return formState.diskIds.length >= min ? undefined : 'error';
});

watch(
  () => props.visible,
  (val) => {
    if (!val) return;
    formState.name = '';
    formState.raidType = 'RAID0';
    formState.description = '';
    formState.diskIds = [];
    nextTick(() => formRef.value?.clearValidate());
  },
);

function handleOk() {
  formRef.value?.validate().then(() => {
    emit('submit', { ...formState });
  });
}

function handleCancel() {
  emit('update:visible', false);
}

function toggleDisk(diskId: string, checked: boolean) {
  if (checked) {
    if (!formState.diskIds.includes(diskId)) {
      formState.diskIds.push(diskId);
    }
  } else {
    formState.diskIds = formState.diskIds.filter((id) => id !== diskId);
  }
}

function isDiskSelected(diskId: string): boolean {
  return formState.diskIds.includes(diskId);
}

function getHealthColor(status?: string): string {
  if (status === '正常') return '#52c41a';
  if (status === '警告') return '#faad14';
  return '#8c8c8c';
}
</script>

<template>
  <Modal
    v-model:visible="props.visible"
    title="创建存储池"
    width="600"
    :confirm-loading="loading"
    @ok="handleOk"
    @cancel="handleCancel"
    class="create-pool-modal"
  >
    <template #title>
      <IconifyIcon icon="lucide:database" style="font-size: 18px; color: #1677ff;" />
      创建存储池
    </template>
    <Form ref="formRef" :model="formState" :rules="rules" layout="vertical">
      <Form.Item label="存储池名称" name="name">
        <Input v-model:value="formState.name" placeholder="请输入存储池名称" />
      </Form.Item>

      <Form.Item label="RAID 类型" name="raidType">
        <Select v-model:value="formState.raidType" placeholder="请选择 RAID 类型">
          <Select.Option value="RAID0">
            <span class="raid-option">
              <span class="raid-name">RAID 0</span>
              <span class="raid-desc">条带化 — 最高性能，无冗余，至少 2 块盘</span>
            </span>
          </Select.Option>
          <Select.Option value="RAID1">
            <span class="raid-option">
              <span class="raid-name">RAID 1</span>
              <span class="raid-desc">镜像 — 完全冗余，50% 容量利用率，至少 2 块盘</span>
            </span>
          </Select.Option>
          <Select.Option value="RAID5">
            <span class="raid-option">
              <span class="raid-name">RAID 5</span>
              <span class="raid-desc">分布式奇偶校验 — 兼顾性能与冗余，至少 3 块盘</span>
            </span>
          </Select.Option>
          <Select.Option value="RAID6">
            <span class="raid-option">
              <span class="raid-name">RAID 6</span>
              <span class="raid-desc">双奇偶校验 — 更高冗余，允许双盘故障，至少 4 块盘</span>
            </span>
          </Select.Option>
          <Select.Option value="RAID10">
            <span class="raid-option">
              <span class="raid-name">RAID 10</span>
              <span class="raid-desc">镜像+条带 — 高性能高冗余，至少 4 块盘</span>
            </span>
          </Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="选择磁盘"
        name="diskIds"
        :help="diskHelpText"
        :validate-status="diskHelpStatus"
      >
        <div v-if="availableDisks.length === 0" class="disks-empty">
          <IconifyIcon icon="lucide:hard-drive" style="font-size: 20px; color: #d9d9d9;" />
          <span>暂无可用的未使用磁盘</span>
        </div>
        <div v-else class="disks-grid">
          <div
            v-for="disk in availableDisks"
            :key="disk.deviceName"
            class="disk-select-card"
            :class="{ selected: isDiskSelected(disk.deviceName) }"
            @click="toggleDisk(disk.deviceName, !isDiskSelected(disk.deviceName))"
          >
            <Checkbox
              :checked="isDiskSelected(disk.deviceName)"
              class="disk-checkbox"
              @click.stop
              @change="(e) => toggleDisk(disk.deviceName, e.target.checked)"
            />
            <div class="disk-info">
              <div class="disk-name-row">
                <IconifyIcon icon="lucide:hard-drive" style="font-size: 14px; color: #1677ff;" />
                <span class="disk-device">{{ disk.deviceName }}</span>
                <span
                  class="disk-health"
                  :style="{ color: getHealthColor(disk.healthStatus) }"
                >
                  {{ disk.healthStatus || '未知' }}
                </span>
              </div>
              <div class="disk-meta">
                <span class="disk-model">{{ disk.model }}</span>
                <span class="disk-size">{{ disk.size }}</span>
              </div>
            </div>
          </div>
        </div>
      </Form.Item>

      <Form.Item label="描述" name="description">
        <Input.TextArea
          v-model:value="formState.description"
          :rows="3"
          placeholder="可选，添加描述信息"
        />
      </Form.Item>
    </Form>
  </Modal>
</template>

<style scoped>
.raid-option {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.raid-name {
  font-weight: 600;
  font-size: 13px;
}
.raid-desc {
  font-size: 12px;
  color: #8c8c8c;
}

.disks-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px;
  color: #bfbfbf;
  font-size: 13px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px dashed #d9d9d9;
}

.disks-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.disk-select-card {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.disk-select-card:hover {
  background: #f0f5ff;
  border-color: #b7d1ff;
}

.disk-select-card.selected {
  background: #e6f4ff;
  border-color: #1677ff;
}

.disk-checkbox {
  margin-top: 2px;
  flex-shrink: 0;
}

.disk-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.disk-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.disk-device {
  font-weight: 600;
  color: #262626;
}

.disk-health {
  font-size: 11px;
  margin-left: auto;
}

.disk-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #8c8c8c;
}

.disk-model {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.disk-size {
  flex-shrink: 0;
  font-weight: 600;
  color: #595959;
}

@media (max-width: 576px) {
  .disks-grid {
    grid-template-columns: 1fr;
  }
}
</style>

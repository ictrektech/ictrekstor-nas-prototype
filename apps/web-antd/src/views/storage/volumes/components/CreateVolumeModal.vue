<script lang="ts" setup>
import { IconifyIcon } from '@vben/icons';
import { Form, Input, InputNumber, Modal, Radio, Select } from 'ant-design-vue';
import { nextTick, reactive, ref, watch } from 'vue';

import type { StoragePool, VolumeCreateForm } from '../types';

interface Props {
  visible: boolean;
  pools: StoragePool[];
  loading: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:visible': [v: boolean];
  submit: [values: VolumeCreateForm];
}>();

const formRef = ref<any>(null);

const formState = reactive<VolumeCreateForm>({
  name: '',
  sourceType: 'pool',
  poolId: '',
  bindSource: '',
  size: undefined,
  sizeUnit: 'GB',
  filesystem: 'ext4',
  description: '',
});

const rules = {
  name: [{ required: true, message: '请输入存储空间名称', trigger: 'blur' }],
  poolId: [{ required: true, message: '请选择存储池', trigger: 'change' }],
  bindSource: [{ required: true, message: '请输入绑定目录', trigger: 'blur' }],
  size: [{ required: true, message: '请输入容量', trigger: 'change' }],
  filesystem: [{ required: true, message: '请选择文件系统', trigger: 'change' }],
};

watch(
  () => props.visible,
  (val) => {
    if (!val) return;
    formState.name = '';
    formState.sourceType = 'pool';
    formState.poolId = '';
    formState.bindSource = '';
    formState.size = undefined;
    formState.sizeUnit = 'GB';
    formState.filesystem = 'ext4';
    formState.description = '';
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
</script>

<template>
  <Modal
    v-model:visible="props.visible"
    title="创建存储空间"
    width="560"
    :confirm-loading="loading"
    @ok="handleOk"
    @cancel="handleCancel"
    class="create-volume-modal"
  >
    <template #title>
      <IconifyIcon icon="lucide:plus-circle" style="font-size: var(--ict-title-large); color: var(--ict-primary);" />
      创建存储空间
    </template>
    <Form ref="formRef" :model="formState" :rules="rules" layout="vertical">
      <Form.Item label="存储空间名称" name="name">
        <Input v-model:value="formState.name" placeholder="请输入存储空间名称" />
      </Form.Item>

      <Form.Item label="来源类型" name="sourceType">
        <Radio.Group v-model:value="formState.sourceType">
          <Radio value="pool">
            <span class="radio-label">
              <IconifyIcon icon="lucide:database" style="font-size: var(--ict-mark-medium);" />
              存储池
            </span>
          </Radio>
          <Radio value="directory">
            <span class="radio-label">
              <IconifyIcon icon="lucide:folder" style="font-size: var(--ict-mark-medium);" />
              目录
            </span>
          </Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item v-if="formState.sourceType === 'pool'" label="选择存储池" name="poolId">
        <Select v-model:value="formState.poolId" placeholder="请选择存储池">
          <Select.Option v-for="p in pools" :key="p.id" :value="p.id">
            {{ p.name }}（{{ p.capacity }}）
          </Select.Option>
        </Select>
      </Form.Item>

      <Form.Item v-else label="绑定目录" name="bindSource">
        <Input v-model:value="formState.bindSource" placeholder="例如 /data/volume1" />
      </Form.Item>

      <Form.Item label="容量" name="size">
        <div class="size-input-row">
          <InputNumber
            v-model:value="formState.size"
            :min="1"
            :precision="0"
            placeholder="请输入容量"
            class="size-input"
          />
          <Select v-model:value="formState.sizeUnit" class="size-unit-select">
            <Select.Option value="GB">GB</Select.Option>
            <Select.Option value="TB">TB</Select.Option>
          </Select>
        </div>
      </Form.Item>

      <Form.Item label="文件系统" name="filesystem">
        <Radio.Group v-model:value="formState.filesystem">
          <Radio value="ext4">ext4</Radio>
          <Radio value="btrfs">btrfs</Radio>
          <Radio value="xfs">xfs</Radio>
        </Radio.Group>
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
</style>
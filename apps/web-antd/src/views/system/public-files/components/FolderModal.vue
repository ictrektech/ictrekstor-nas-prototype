<script lang="ts" setup>
import { ref, watch } from 'vue';
import { Modal, Form, Input, Select } from 'ant-design-vue';
import type { FolderFormData } from '../types';
import { poolOptions } from './mockData';

interface Props {
  visible: boolean;
  title: string;
  initialData?: Partial<FolderFormData>;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:visible': [value: boolean];
  'save': [data: FolderFormData];
}>();

const formRef = ref();
const form = ref<FolderFormData>({
  name: '',
  path: '/public/',
  storagePool: '',
  permissionMode: 'readwrite',
  totalCapacityGB: 100,
  description: '',
});

watch(() => props.visible, (visible) => {
  if (visible) {
    form.value = {
      name: props.initialData?.name ?? '',
      path: props.initialData?.path ?? '/public/',
      storagePool: props.initialData?.storagePool ?? '',
      permissionMode: props.initialData?.permissionMode ?? 'readwrite',
      totalCapacityGB: props.initialData?.totalCapacityGB ?? 100,
      description: props.initialData?.description ?? '',
    };
    formRef.value?.resetFields();
  }
});

function handleOk() {
  formRef.value?.validate().then(() => {
    emit('save', { ...form.value });
    emit('update:visible', false);
  }).catch(() => {});
}

function handleCancel() {
  emit('update:visible', false);
}
</script>

<template>
  <Modal
    :open="props.visible"
    :title="props.title"
    width="400px"
    @ok="handleOk"
    @cancel="handleCancel"
    :ok-text="props.title.includes('编辑') ? '保存' : '创建'"
  >
    <Form
      ref="formRef"
      :model="form"
      layout="vertical"
      :rules="{
        name: [{ required: true, message: '请输入文件夹名称', trigger: 'blur' }],
        storagePool: [{ required: true, message: '请选择存储池', trigger: 'change' }],
      }"
    >
      <Form.Item label="文件夹名称" name="name">
        <Input v-model:value="form.name" placeholder="如：公司文档" />
      </Form.Item>

      <Form.Item label="所属存储池" name="storagePool">
        <Select
          v-model:value="form.storagePool"
          placeholder="请选择存储池"
          :options="poolOptions"
        />
      </Form.Item>
    </Form>
  </Modal>
</template>

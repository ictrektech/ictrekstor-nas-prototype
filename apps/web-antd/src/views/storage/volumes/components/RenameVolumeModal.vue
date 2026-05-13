<script lang="ts" setup>
import { IconifyIcon } from '@vben/icons';
import { Form, Input, Modal } from 'ant-design-vue';
import { reactive, watch } from 'vue';

import type { StorageVolume } from '../types';

interface Props {
  visible: boolean;
  volume: StorageVolume | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:visible': [v: boolean];
  submit: [volumeId: string, name: string];
}>();

const formRef = ref<any>(null);
const formState = reactive({ name: '' });

watch(
  () => props.volume,
  (v) => {
    formState.name = v?.name || '';
    nextTick(() => formRef.value?.clearValidate());
  },
  { immediate: true },
);

function handleOk() {
  formRef.value?.validate().then(() => {
    if (props.volume) {
      emit('submit', props.volume.id, formState.name);
    }
  });
}

function handleCancel() {
  emit('update:visible', false);
}
</script>

<template>
  <Modal
    v-model:visible="props.visible"
    title="重命名存储空间"
    width="480"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <Form ref="formRef" :model="formState" layout="vertical">
      <Form.Item
        label="新名称"
        name="name"
        :rules="[{ required: true, message: '请输入新名称', trigger: 'blur' }]"
      >
        <Input v-model:value="formState.name" placeholder="请输入新名称" />
      </Form.Item>
    </Form>
  </Modal>
</template>
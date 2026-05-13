<script lang="ts" setup>
import { ref, watch } from 'vue';
import { Modal, Form, Input, message } from 'ant-design-vue';
import type { StorageSpaceFile } from '#/api/storage';

const props = defineProps<{
  visible: boolean;
  file: StorageSpaceFile | null;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'confirm', newName: string): void;
}>();

const formRef = ref();
const form = ref({ name: '' });

watch(() => props.file, (f) => {
  if (f) form.value = { name: f.name };
}, { immediate: true });

function handleOk() {
  formRef.value?.validate().then(() => {
    emit('confirm', form.value.name);
    emit('update:visible', false);
    message.success('重命名成功');
  }).catch(() => {});
}
</script>

<template>
  <Modal
    :open="visible"
    title="重命名"
    width="400px"
    @ok="handleOk"
    @update:open="emit('update:visible', $event)"
  >
    <Form
      ref="formRef"
      :model="form"
      layout="vertical"
      :rules="{ name: [{ required: true, message: '请输入名称', trigger: 'blur' }] }"
    >
      <Form.Item label="新名称" name="name">
        <Input v-model:value="form.name" placeholder="请输入新名称" />
      </Form.Item>
    </Form>
  </Modal>
</template>
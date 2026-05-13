<script lang="ts" setup>
import { ref } from 'vue';
import { Modal, Form, Input } from 'ant-design-vue';

defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void;
  (e: 'confirm', name: string): void;
}>();

const formRef = ref<InstanceType<typeof Form> | null>(null);
const form = ref({ name: '' });

function handleOk() {
  formRef.value
    ?.validate()
    .then(() => {
      emit('confirm', form.value.name.trim());
      emit('update:visible', false);
      form.value.name = '';
    })
    .catch(() => {});
}

function handleCancel() {
  emit('update:visible', false);
  form.value.name = '';
}
</script>

<template>
  <Modal
    :open="visible"
    title="新建文件夹"
    width="400px"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <Form
      ref="formRef"
      :model="form"
      layout="vertical"
      :rules="{
        name: [
          { required: true, message: '请输入文件夹名称', trigger: 'blur' },
        ],
      }"
    >
      <Form.Item label="文件夹名称" name="name">
        <Input
          v-model:value="form.name"
          placeholder="请输入文件夹名称"
        />
      </Form.Item>
    </Form>
  </Modal>
</template>
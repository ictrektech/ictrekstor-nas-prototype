<script lang="ts" setup>
import { ref, watch } from 'vue';
import { Modal, Form, Input } from 'ant-design-vue';

interface Props {
  visible: boolean;
  title?: string;
  name?: string;
  label?: string;
  placeholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: '重命名',
  name: '',
  label: '新名称',
  placeholder: '请输入新名称',
});

const emit = defineEmits<{
  'update:visible': [visible: boolean];
  confirm: [name: string];
}>();

const formRef = ref<InstanceType<typeof Form> | null>(null);
const form = ref({ name: '' });

// 同步外部 name 变化
watch(
  () => props.name,
  (val) => {
    form.value.name = val;
  },
  { immediate: true },
);

// 弹窗打开时重置
watch(
  () => props.visible,
  (val) => {
    if (val) {
      form.value.name = props.name;
    }
  },
);

function handleOk() {
  formRef.value
    ?.validate()
    .then(() => {
      emit('confirm', form.value.name);
      emit('update:visible', false);
    })
    .catch(() => {});
}

function handleCancel() {
  emit('update:visible', false);
}
</script>

<template>
  <Modal
    :open="visible"
    :title="title"
    width="400px"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <Form
      ref="formRef"
      :model="form"
      layout="vertical"
      :rules="{
        name: [{ required: true, message: `请输入${label}`, trigger: 'blur' }],
      }"
    >
      <Form.Item :label="label" name="name">
        <Input v-model:value="form.name" :placeholder="placeholder" />
      </Form.Item>
    </Form>
  </Modal>
</template>
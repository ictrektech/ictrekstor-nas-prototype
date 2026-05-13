<script lang="ts" setup>
import { ref, watch } from 'vue';
import { Modal, Form, Input, Checkbox, Select, Radio as AntRadio } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';

const props = defineProps<{
  visible: boolean;
  title: string;
  initialName?: string;
}>();

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void;
  (e: 'save', data: {
    name: string;
    enableCapacityLimit: boolean;
    capacityLimit: number | undefined;
    capacityUnit: string;
    allowShareProtocol: boolean;
    recyclePermission: 'admin' | 'all';
  }): void;
}>();

const formRef = ref<InstanceType<typeof Form> | null>(null);

const form = ref({
  name: '',
  enableCapacityLimit: false,
  capacityLimit: undefined as number | undefined,
  capacityUnit: 'GB',
  allowShareProtocol: true,
  recyclePermission: 'admin' as 'admin' | 'all',
});

const capacityUnitOptions = [
  { label: 'GB', value: 'GB' },
  { label: 'TB', value: 'TB' },
];

watch(
  () => props.visible,
  (vis) => {
    if (vis) {
      form.value = {
        name: props.initialName || '',
        enableCapacityLimit: false,
        capacityLimit: undefined,
        capacityUnit: 'GB',
        allowShareProtocol: true,
        recyclePermission: 'admin',
      };
    }
  },
);

function onOk() {
  formRef.value
    ?.validate()
    .then(() => {
      emit('save', { ...form.value });
      emit('update:visible', false);
    })
    .catch(() => {});
}

function onCancel() {
  emit('update:visible', false);
}
</script>

<template>
  <Modal
    :open="visible"
    :title="title"
    width="520px"
    @ok="onOk"
    @cancel="onCancel"
    class="folder-modal"
  >
    <Form
      ref="formRef"
      :model="form"
      layout="vertical"
      :rules="{
        name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
      }"
    >
      <Form.Item label="名称" name="name">
        <Input v-model:value="form.name" placeholder="请输入名称">
          <template #prefix>
            <IconifyIcon icon="lucide:folder-heart" style="font-size: 14px; color: #bfbfbf;" />
          </template>
        </Input>
      </Form.Item>

      <Form.Item>
        <Checkbox v-model:checked="form.enableCapacityLimit">
          <span class="checkbox-label">
            <IconifyIcon icon="lucide:ruler" style="font-size: 12px;" />
            限制容量上限
          </span>
        </Checkbox>
        <div v-if="form.enableCapacityLimit" class="capacity-input-row">
          <Input
            v-model:value="form.capacityLimit"
            type="number"
            placeholder="不限制"
            class="capacity-input"
          >
            <template #prefix>
              <IconifyIcon icon="lucide:hard-drive" style="font-size: 12px; color: #bfbfbf;" />
            </template>
          </Input>
          <Select
            v-model:value="form.capacityUnit"
            :options="capacityUnitOptions"
            class="capacity-unit-select"
          />
        </div>
      </Form.Item>

      <Form.Item>
        <Checkbox v-model:checked="form.allowShareProtocol">
          <span class="checkbox-label">
            <IconifyIcon icon="lucide:share-2" style="font-size: 12px;" />
            允许通过文件共享协议挂载到其他设备上
          </span>
        </Checkbox>
      </Form.Item>

      <Form.Item label="回收站权限">
        <AntRadio.Group v-model:value="form.recyclePermission">
          <AntRadio value="admin">
            <span class="radio-label">
              <IconifyIcon icon="lucide:shield" style="font-size: 12px;" />
              仅管理员
            </span>
          </AntRadio>
          <AntRadio value="all">
            <span class="radio-label">
              <IconifyIcon icon="lucide:users" style="font-size: 12px;" />
              团队文件夹所有成员
            </span>
          </AntRadio>
        </AntRadio.Group>
      </Form.Item>
    </Form>
  </Modal>
</template>

<style scoped>
.capacity-input-row {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.capacity-input {
  flex: 1;
}

.capacity-unit-select {
  width: 100px;
}

.checkbox-label,
.radio-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
</style>
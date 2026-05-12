<script lang="ts" setup>
import { ref, watch } from 'vue';
import { Modal, Form, Input, InputNumber, type FormInstance } from 'ant-design-vue';
import type { NetworkConfig } from '#/api/system';

const props = defineProps<{
  visible: boolean;
  network: NetworkConfig | null;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
  save: [form: NetworkForm, network: NetworkConfig];
}>();

interface NetworkForm {
  ipv4Address: string;
  subnetMask: string;
  gateway: string;
  dns: string;
  mtu: number;
}

const formRef = ref<FormInstance | null>(null);
const form = ref<NetworkForm>({
  ipv4Address: '',
  subnetMask: '',
  gateway: '',
  dns: '',
  mtu: 1500,
});

const loading = ref(false);

watch(
  () => props.network,
  (net) => {
    if (net) {
      form.value = {
        ipv4Address: net.ipv4Address,
        subnetMask: net.subnetMask,
        gateway: net.gateway,
        dns: net.dns,
        mtu: net.mtu,
      };
    }
  },
  { immediate: true },
);

async function handleOk() {
  if (!formRef.value || !props.network) return;
  try {
    await formRef.value.validate();
    loading.value = true;
    emit('save', { ...form.value }, props.network);
  } catch {
    // 校验失败
  } finally {
    loading.value = false;
  }
}

function handleCancel() {
  emit('update:visible', false);
}
</script>

<template>
  <Modal
    :open="visible"
    :title="`配置网卡 - ${network?.name || ''}`"
    width="480px"
    :confirm-loading="loading"
    @ok="handleOk"
    @cancel="handleCancel"
    @update:open="(v) => emit('update:visible', v)"
  >
    <Form
      ref="formRef"
      :model="form"
      layout="vertical"
      style="margin-top: 12px;"
    >
      <Form.Item
        label="IPv4 地址"
        name="ipv4Address"
        :rules="[{ required: true, message: '请输入 IPv4 地址' }]"
      >
        <Input v-model:value="form.ipv4Address" placeholder="如: 192.168.1.212" />
      </Form.Item>
      <Form.Item
        label="子网掩码"
        name="subnetMask"
        :rules="[{ required: true, message: '请输入子网掩码' }]"
      >
        <Input v-model:value="form.subnetMask" placeholder="如: 255.255.255.0" />
      </Form.Item>
      <Form.Item
        label="默认网关"
        name="gateway"
        :rules="[{ required: true, message: '请输入默认网关' }]"
      >
        <Input v-model:value="form.gateway" placeholder="如: 192.168.1.1" />
      </Form.Item>
      <Form.Item
        label="DNS 服务器"
        name="dns"
        :rules="[{ required: true, message: '请输入 DNS 服务器' }]"
      >
        <Input v-model:value="form.dns" placeholder="如: 8.8.8.8" />
      </Form.Item>
      <Form.Item
        label="MTU"
        name="mtu"
        :rules="[{ required: true, message: '请输入 MTU' }]"
      >
        <InputNumber v-model:value="form.mtu" :min="576" :max="9000" style="width: 100%;" />
      </Form.Item>
    </Form>
  </Modal>
</template>
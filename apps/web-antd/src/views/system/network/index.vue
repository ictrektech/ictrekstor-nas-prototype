<script lang="ts" setup>
import { h, ref, onMounted } from 'vue';
import { Card, Table, Button } from 'ant-design-vue';
import { getNetworksApi, type NetworkConfig } from '#/api/system';

const networks = ref<NetworkConfig[]>([]);
const loading = ref(false);

const columns = [
  { title: '名称', dataIndex: 'name', key: 'name' },
  { title: 'IPv4 地址', dataIndex: 'ipv4Address', key: 'ipv4Address' },
  { title: '子网掩码', dataIndex: 'subnetMask', key: 'subnetMask' },
  { title: '网关', dataIndex: 'gateway', key: 'gateway' },
  { title: 'DNS', dataIndex: 'dns', key: 'dns' },
  { title: 'MAC 地址', dataIndex: 'macAddress', key: 'macAddress' },
  { title: 'MTU', dataIndex: 'mtu', key: 'mtu' },
  { title: '连接状态', dataIndex: 'connectionStatus', key: 'connectionStatus' },
  {
    title: '操作',
    key: 'action',
    customRender: () => h(Button, { size: 'small', type: 'primary' }, () => '编辑'),
  },
];

async function loadData() {
  loading.value = true;
  try {
    networks.value = await getNetworksApi();
  } finally {
    loading.value = false;
  }
}

onMounted(loadData);
</script>

<template>
  <div class="p-5">
    <Card title="网络管理">
      <Table
        :columns="columns"
        :data-source="networks"
        :loading="loading"
        row-key="name"
      />
    </Card>
  </div>
</template>

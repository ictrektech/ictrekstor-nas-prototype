<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { Card, Table } from 'ant-design-vue';
import { getExternalDevicesApi, type ExternalDevice } from '#/api/file';

const items = ref<ExternalDevice[]>([]);
const loading = ref(false);

const columns = [
  { title: '设备名称', dataIndex: 'name', key: 'name' },
  { title: '容量', dataIndex: 'capacity', key: 'capacity' },
  { title: '已用容量', dataIndex: 'usedCapacity', key: 'usedCapacity' },
  { title: '文件系统', dataIndex: 'filesystem', key: 'filesystem' },
  { title: '连接状态', dataIndex: 'connectionStatus', key: 'connectionStatus' },
  { title: '挂载点', dataIndex: 'mountPoint', key: 'mountPoint' },
];

async function loadData() {
  loading.value = true;
  try {
    items.value = await getExternalDevicesApi();
  } finally {
    loading.value = false;
  }
}

onMounted(loadData);
</script>

<template>
  <div class="p-5">
    <Card title="外部设备">
      <Table
        :columns="columns"
        :data-source="items"
        :loading="loading"
        row-key="id"
      />
    </Card>
  </div>
</template>

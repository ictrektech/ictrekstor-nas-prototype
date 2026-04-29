<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { Card, Table } from 'ant-design-vue';
import { getStorageVolumesApi, type StorageVolume } from '#/api/storage';

const items = ref<StorageVolume[]>([]);
const loading = ref(false);

const columns = [
  { title: '空间名称', dataIndex: 'name', key: 'name' },
  { title: '所属存储池', dataIndex: 'poolName', key: 'poolName' },
  { title: '总容量', dataIndex: 'totalCapacity', key: 'totalCapacity' },
  { title: '已用容量', dataIndex: 'usedCapacity', key: 'usedCapacity' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '挂载路径', dataIndex: 'mountPath', key: 'mountPath' },
];

async function loadData() {
  loading.value = true;
  try {
    items.value = await getStorageVolumesApi();
  } finally {
    loading.value = false;
  }
}

onMounted(loadData);
</script>

<template>
  <div class="p-5">
    <Card title="存储空间管理">
      <Table
        :columns="columns"
        :data-source="items"
        :loading="loading"
        row-key="id"
      />
    </Card>
  </div>
</template>

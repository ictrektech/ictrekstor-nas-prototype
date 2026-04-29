<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { Card, Table, Button } from 'ant-design-vue';
import { getStoragePoolsApi, type StoragePool } from '#/api/storage';

const items = ref<StoragePool[]>([]);
const loading = ref(false);

const columns = [
  { title: '存储池名称', dataIndex: 'name', key: 'name' },
  { title: 'RAID 类型', dataIndex: 'raidType', key: 'raidType' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '总容量', dataIndex: 'totalCapacity', key: 'totalCapacity' },
  { title: '已用容量', dataIndex: 'usedCapacity', key: 'usedCapacity' },
  { title: '包含硬盘数', dataIndex: 'diskCount', key: 'diskCount' },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime' },
];

async function loadData() {
  loading.value = true;
  try {
    items.value = await getStoragePoolsApi();
  } finally {
    loading.value = false;
  }
}

onMounted(loadData);
</script>

<template>
  <div class="p-5">
    <Card title="存储池管理">
      <template #extra>
        <Button type="primary">创建存储池</Button>
      </template>
      <Table
        :columns="columns"
        :data-source="items"
        :loading="loading"
        row-key="id"
      />
    </Card>
  </div>
</template>

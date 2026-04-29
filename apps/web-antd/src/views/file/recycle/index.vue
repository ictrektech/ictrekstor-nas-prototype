<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { Card, Table, Button, Space } from 'ant-design-vue';
import { getRecycleBinApi, type RecycleBinItem } from '#/api/file';

const items = ref<RecycleBinItem[]>([]);
const loading = ref(false);

const columns = [
  { title: '文件名', dataIndex: 'name', key: 'name' },
  { title: '原位置', dataIndex: 'originalPath', key: 'originalPath' },
  { title: '删除时间', dataIndex: 'deleteTime', key: 'deleteTime' },
  { title: '大小', dataIndex: 'size', key: 'size' },
  { title: '类型', dataIndex: 'type', key: 'type' },
  {
    title: '操作',
    key: 'action',
  },
];

async function loadData() {
  loading.value = true;
  try {
    items.value = await getRecycleBinApi();
  } finally {
    loading.value = false;
  }
}

onMounted(loadData);
</script>

<template>
  <div class="p-5">
    <Card title="回收站">
      <Table
        :columns="columns"
        :data-source="items"
        :loading="loading"
        row-key="id"
      >
        <template #bodyCell="{ column }">
          <template v-if="column.key === 'action'">
            <Space>
              <Button size="small" type="primary">还原</Button>
              <Button size="small" danger>彻底删除</Button>
            </Space>
          </template>
        </template>
      </Table>
    </Card>
  </div>
</template>

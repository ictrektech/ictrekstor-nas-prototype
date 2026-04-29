<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { Card, Table } from 'ant-design-vue';
import { getPublicDirsApi, type PublicDir } from '#/api/storage';

const items = ref<PublicDir[]>([]);
const loading = ref(false);

const columns = [
  { title: '目录名称', dataIndex: 'name', key: 'name' },
  { title: '路径', dataIndex: 'path', key: 'path' },
  { title: '权限', dataIndex: 'permissions', key: 'permissions' },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime' },
];

async function loadData() {
  loading.value = true;
  try {
    items.value = await getPublicDirsApi();
  } finally {
    loading.value = false;
  }
}

onMounted(loadData);
</script>

<template>
  <div class="p-5">
    <Card title="公共目录管理">
      <Table
        :columns="columns"
        :data-source="items"
        :loading="loading"
        row-key="id"
      />
    </Card>
  </div>
</template>

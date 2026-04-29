<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { Card, Table, Button, Space } from 'ant-design-vue';
import { getShareLinksApi, type ShareLink } from '#/api/file';

const items = ref<ShareLink[]>([]);
const loading = ref(false);

const columns = [
  { title: '链接名称', dataIndex: 'name', key: 'name' },
  { title: '对应文件/文件夹', dataIndex: 'targetPath', key: 'targetPath' },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime' },
  { title: '过期时间', dataIndex: 'expireTime', key: 'expireTime' },
  { title: '访问次数', dataIndex: 'accessCount', key: 'accessCount' },
  {
    title: '操作',
    key: 'action',
  },
];

async function loadData() {
  loading.value = true;
  try {
    items.value = await getShareLinksApi();
  } finally {
    loading.value = false;
  }
}

onMounted(loadData);
</script>

<template>
  <div class="p-5">
    <Card title="外链管理">
      <Table
        :columns="columns"
        :data-source="items"
        :loading="loading"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <Space>
              <Button size="small" type="primary" @click="() => { navigator.clipboard.writeText(record.url); }">复制链接</Button>
              <Button size="small" danger>取消分享</Button>
            </Space>
          </template>
        </template>
      </Table>
    </Card>
  </div>
</template>

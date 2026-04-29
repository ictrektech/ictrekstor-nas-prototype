<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { Card, Table, Button } from 'ant-design-vue';
import { getSystemUsersApi, type SystemUser } from '#/api/system';

const items = ref<SystemUser[]>([]);
const loading = ref(false);

const columns = [
  { title: '用户名', dataIndex: 'username', key: 'username' },
  { title: '角色', dataIndex: 'role', key: 'role' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime' },
  { title: '最后登录时间', dataIndex: 'lastLoginTime', key: 'lastLoginTime' },
  { title: '邮箱', dataIndex: 'email', key: 'email' },
];

async function loadData() {
  loading.value = true;
  try {
    items.value = await getSystemUsersApi();
  } finally {
    loading.value = false;
  }
}

onMounted(loadData);
</script>

<template>
  <div class="p-5">
    <Card title="用户管理">
      <template #extra>
        <Button type="primary">新增用户</Button>
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

<script lang="ts" setup>
import { h, ref, onMounted } from 'vue';
import { Card, RadioGroup, Radio, Button, Table, Space } from 'ant-design-vue';
import { getFileLibraryApi, type FileLibraryItem } from '#/api/file';

const libraryType = ref<'storage' | 'public'>('storage');
const items = ref<FileLibraryItem[]>([]);
const loading = ref(false);

const columns = [
  { title: '存储空间名称', dataIndex: 'name', key: 'name' },
  {
    title: '操作',
    key: 'action',
    customRender: () => h(Button, { size: 'small', type: 'link' }, () => '如何访问'),
  },
  { title: '已用配额 / 总配额', key: 'quota', customRender: ({ record }: any) => `${record.usedQuota} / ${record.totalQuota}` },
  { title: '存储位置', dataIndex: 'storagePath', key: 'storagePath' },
];

async function loadData() {
  loading.value = true;
  try {
    items.value = await getFileLibraryApi();
  } finally {
    loading.value = false;
  }
}

onMounted(loadData);
</script>

<template>
  <div class="p-5">
    <Card title="文件库">
      <p class="text-gray-400 mb-4">请先选择存储空间或公共目录后再浏览文件</p>
      <RadioGroup v-model:value="libraryType" class="mb-4">
        <Radio value="storage">存储空间</Radio>
        <Radio value="public">公共目录</Radio>
      </RadioGroup>
      <Table
        :columns="columns"
        :data-source="items"
        :loading="loading"
        row-key="id"
      />
    </Card>
  </div>
</template>

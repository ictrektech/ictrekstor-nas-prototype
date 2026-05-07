<script lang="ts" setup>
import { ref, computed } from 'vue';
import { Card, Button, Input, Table, Tag, Progress } from 'ant-design-vue';

const searchText = ref('');

const devices = ref([
  { id: 'e1', name: 'USB 移动硬盘', type: 'USB', size: '1 TB', used: '450 GB', status: '已连接', mountPath: '/mnt/usb1' },
  { id: 'e2', name: 'SD 卡', type: 'SD', size: '128 GB', used: '80 GB', status: '已连接', mountPath: '/mnt/sd1' },
  { id: 'e3', name: '外接 SSD', type: 'USB-C', size: '512 GB', used: '200 GB', status: '未连接', mountPath: '-' },
]);

const columns = [
  { title: '设备名称', dataIndex: 'name', key: 'name' },
  { title: '类型', dataIndex: 'type', key: 'type' },
  { title: '容量', dataIndex: 'size', key: 'size' },
  { title: '已用', dataIndex: 'used', key: 'used' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '挂载路径', dataIndex: 'mountPath', key: 'mountPath' },
  { title: '操作', key: 'action', width: 120 },
];

const filteredDevices = computed(() => {
  if (!searchText.value) return devices.value;
  return devices.value.filter(d => d.name.toLowerCase().includes(searchText.value.toLowerCase()));
});

function getUsagePercent(used: string, total: string): number {
  const parseSize = (s: string): number => {
    const num = parseFloat(s);
    if (s.includes('TB')) return num * 1024;
    if (s.includes('GB')) return num;
    return num;
  };
  return Math.round((parseSize(used) / parseSize(total)) * 100);
}
</script>

<template>
  <div class="external-device-page">
    <div class="toolbar">
      <div class="breadcrumb-bar">
        <span class="breadcrumb-icon">💾</span>
        <span class="breadcrumb-text">外接设备</span>
      </div>
      <Input v-model:value="searchText" placeholder="搜索设备" class="search-input" allow-clear />
    </div>
    <Card>
      <Table :columns="columns" :data-source="filteredDevices" row-key="id" size="small">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <Tag :color="record.status === '已连接' ? 'success' : 'default'">{{ record.status }}</Tag>
          </template>
          <template v-if="column.key === 'action'">
            <Button size="small" type="link">卸载</Button>
          </template>
        </template>
      </Table>
    </Card>
  </div>
</template>

<style scoped>
.external-device-page { padding: 24px; }
.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.breadcrumb-bar { display: flex; align-items: center; gap: 8px; background: #fff; border: 1px solid #d9d9d9; border-radius: 6px; padding: 4px 12px; }
.search-input { width: 220px; }
</style>

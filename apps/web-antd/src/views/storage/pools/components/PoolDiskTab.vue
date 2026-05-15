<script lang="ts" setup>
import { Button, Tag, Table } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import type { StoragePoolDetail } from '#/api/storage';

const props = defineProps<{
  poolDetail: StoragePoolDetail;
}>();

const emit = defineEmits<{
  (e: 'go-to-disk', deviceName: string): void;
}>();

const diskColumns = [
  { title: '硬盘', dataIndex: 'deviceName', key: 'deviceName', align: 'left' as const },
  { title: '型号', dataIndex: 'model', key: 'model', align: 'left' as const },
  { title: '容量', dataIndex: 'capacity', key: 'capacity', width: 120, align: 'center' as const },
  { title: '状态', dataIndex: 'status', key: 'status', width: 110, align: 'center' as const },
  { title: '健康状态', dataIndex: 'healthStatus', key: 'healthStatus', width: 120, align: 'center' as const },
  { title: '操作', key: 'action', width: 120, align: 'center' as const },
];

function getHealthTagColor(health: string): string {
  switch (health) {
    case 'good': return 'success';
    case 'warning': return 'warning';
    case 'critical': return 'error';
    default: return 'default';
  }
}

function getHealthTagText(health: string): string {
  switch (health) {
    case 'good': return '良好';
    case 'warning': return '警告';
    case 'critical': return '严重';
    default: return '未知';
  }
}

function onGoToDisk(deviceName: string) {
  emit('go-to-disk', deviceName);
}
</script>

<template>
  <div class="disk-tab-content">
    <Table
      :columns="diskColumns"
      :data-source="poolDetail.disks"
      row-key="deviceName"
      :pagination="false"
      size="small"
      class="disk-table"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          <Tag :color="record.status === 'active' ? 'success' : 'default'" size="small">
            {{ record.status === 'active' ? '活跃' : '空闲' }}
          </Tag>
        </template>
        <template v-if="column.key === 'healthStatus'">
          <Tag :color="getHealthTagColor(record.healthStatus)" size="small">
            {{ getHealthTagText(record.healthStatus) }}
          </Tag>
        </template>
        <template v-if="column.key === 'action'">
          <Button
            type="link"
            size="small"
            class="action-btn"
            @click="onGoToDisk(record.deviceName)"
          >
            <IconifyIcon icon="lucide:external-link" style="font-size: var(--ict-body-small);" />
            详情
          </Button>
        </template>
      </template>
    </Table>
  </div>
</template>

<style scoped>
.disk-tab-content { padding: 12px 16px 20px; }
:deep(.ant-table) { border-radius: 8px; overflow: hidden; }
:deep(.ant-table-thead > tr > th) { background: var(--ict-bg-section); font-weight: 600; }
:deep(.ant-table-tbody > tr) { transition: all 0.2s ease; border-left: 3px solid transparent; }
:deep(.ant-table-tbody > tr:hover > td) { background: #f0f7ff; }
:deep(.ant-table-tbody > tr:hover) { border-left-color: var(--ict-primary); }
.action-btn { display: inline-flex; align-items: center; gap: 4px; font-size: var(--ict-body-small); border-radius: 6px; }
</style>
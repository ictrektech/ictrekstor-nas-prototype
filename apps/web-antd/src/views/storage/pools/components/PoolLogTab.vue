<script lang="ts" setup>
import { Tag, Table } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import type { PoolLog } from '#/api/storage';

const props = defineProps<{
  logs: PoolLog[];
}>();

const logColumns = [
  { title: '级别', dataIndex: 'level', key: 'level', width: 100, align: 'center' as const },
  { title: '时间', dataIndex: 'timestamp', key: 'timestamp', width: 160, align: 'center' as const },
  { title: '消息', dataIndex: 'message', key: 'message', align: 'left' as const },
];

function getLogTagColor(level: PoolLog['level']): string {
  switch (level) {
    case 'info': return 'blue';
    case 'warning': return 'orange';
    case 'error': return 'red';
    case 'critical': return 'red';
    default: return 'default';
  }
}

function getLogTagText(level: PoolLog['level']): string {
  switch (level) {
    case 'info': return '信息';
    case 'warning': return '警告';
    case 'error': return '错误';
    case 'critical': return '严重';
    default: return '未知';
  }
}
</script>

<template>
  <div class="log-tab-content">
    <Table
      :columns="logColumns"
      :data-source="logs"
      row-key="timestamp"
      :pagination="{ pageSize: 10, size: 'small' }"
      size="small"
      class="log-table"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'level'">
          <Tag :color="getLogTagColor(record.level)" size="small">
            <IconifyIcon
              :icon="record.level === 'info' ? 'lucide:info' : record.level === 'warning' ? 'lucide:alert-triangle' : 'lucide:alert-circle'"
              style="font-size: var(--ict-mark-small); margin-right: 4px; display: inline-flex; align-items: center;"
            />
            {{ getLogTagText(record.level) }}
          </Tag>
        </template>
      </template>
    </Table>
  </div>
</template>

<style scoped>
.log-tab-content { padding: 12px 16px 20px; }
:deep(.ant-table) { border-radius: 8px; overflow: hidden; }
:deep(.ant-table-thead > tr > th) { background: var(--ict-bg-section); font-weight: 600; }
:deep(.ant-table-tbody > tr:hover > td) { background: #f0f7ff; }
</style>
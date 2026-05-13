<script lang="ts" setup>
import { Button, Empty, Table, Tag } from 'ant-design-vue';
import { FolderHeart } from 'lucide-vue-next';
import { IconifyIcon } from '@vben/icons';
import type { PublicDirItem } from '../types';

const props = defineProps<{
  dirs: PublicDirItem[];
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: 'open', dir: PublicDirItem): void;
}>();

const columns = [
  { title: '目录名称', key: 'name', width: 180 },
  { title: '说明', dataIndex: 'description', key: 'description', ellipsis: true },
  { title: '文件数', key: 'fileCount', width: 100, align: 'center' as const },
  { title: '所有者', key: 'owner', width: 120 },
  { title: '更新时间', key: 'updateTime', width: 140 },
  { title: '权限', key: 'access', width: 100, align: 'center' as const },
  { title: '操作', key: 'action', width: 120, align: 'center' as const },
];

function formatFriendlyTime(timeStr: string): string {
  const now = new Date();
  const time = new Date(timeStr);
  const diffMs = now.getTime() - time.getTime();
  const diffDay = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDay === 0) return '今天';
  if (diffDay === 1) return '昨天';
  if (diffDay < 30) return `${diffDay}天前`;
  if (diffDay < 365) return `${Math.floor(diffDay / 30)}个月前`;
  return `${Math.floor(diffDay / 365)}年前`;
}
</script>

<template>
  <div class="table-card">
    <Table
      :columns="columns"
      :data-source="dirs"
      row-key="id"
      size="small"
      :loading="loading"
      :pagination="false"
      class="dirs-table"
    >
      <template #bodyCell="{ column, record }">
        <!-- 目录名称 -->
        <template v-if="column.key === 'name'">
          <div class="name-cell">
            <div class="name-icon-box">
              <FolderHeart style="font-size: 18px;" />
            </div>
            <div class="name-text-area">
              <div class="name-title">{{ record.name }}</div>
            </div>
          </div>
        </template>

        <!-- 文件数 -->
        <template v-if="column.key === 'fileCount'">
          <span class="count-value">{{ record.fileCount }}</span>
        </template>

        <!-- 所有者 -->
        <template v-if="column.key === 'owner'">
          <Tag size="small" color="blue">{{ record.owner }}</Tag>
        </template>

        <!-- 更新时间 -->
        <template v-if="column.key === 'updateTime'">
          <span class="time-text">{{ formatFriendlyTime(record.updateTime) }}</span>
        </template>

        <!-- 权限 -->
        <template v-if="column.key === 'access'">
          <Tag :color="record.access === 'write' ? 'success' : 'default'" size="small">
            {{ record.access === 'write' ? '可读写' : '只读' }}
          </Tag>
        </template>

        <!-- 操作 -->
        <template v-if="column.key === 'action'">
          <div class="action-cell">
            <Button size="small" type="link" @click="emit('open', record)">
              <IconifyIcon icon="lucide:folder-open" style="font-size: 13px;" />
              打开
            </Button>
          </div>
        </template>
      </template>

      <template #emptyText>
        <Empty description="暂无公共目录" class="table-empty">
          <template #image>
            <div class="empty-image">
              <FolderHeart style="font-size: 48px; color: #d9d9d9;" />
            </div>
          </template>
        </Empty>
      </template>
    </Table>
  </div>
</template>

<style scoped>
.table-card { background: #fff; border-radius: 10px; border: 1px solid #f0f0f0; overflow: hidden; }
.dirs-table :deep(.ant-table-thead > tr > th) { background: #fafafa; font-weight: 600; font-size: 12px; color: #595959; padding: 10px 14px; }
.dirs-table :deep(.ant-table-tbody > tr > td) { padding: 12px 14px; font-size: 13px; }
.dirs-table :deep(.ant-table-tbody > tr:hover > td) { background: #f5f5f5; }

.name-cell { display: flex; align-items: center; gap: 10px; }
.name-icon-box { width: 36px; height: 36px; border-radius: 8px; background: #fff7e6; color: #fa8c16; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.name-text-area { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.name-title { font-size: 14px; font-weight: 500; color: #262626; }

.count-value { font-weight: 600; color: #262626; font-family: 'SF Mono', 'Fira Code', monospace; }
.time-text { color: #8c8c8c; font-size: 12px; }
.action-cell { display: flex; align-items: center; justify-content: center; gap: 2px; }
.table-empty { padding: 48px 0; }
.empty-image { display: flex; justify-content: center; margin-bottom: 16px; }
</style>
<script lang="ts" setup>
import { Table, Tooltip, Button, Popconfirm, Progress, Empty } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import type { PublicFolder } from '../types';

interface Props {
  folders: PublicFolder[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'delete-folder': [folder: PublicFolder];
}>();

const columns = [
  { title: '公共文件夹', dataIndex: 'name', key: 'name', width: 220 },
  { title: '所属存储池', dataIndex: 'storagePool', key: 'storagePool', width: 160 },
  { title: '容量使用', key: 'capacity', width: 180 },
  { title: '操作', key: 'action', width: 80, align: 'center' as const },
];

/* ═══════ 容量格式化 ═══════ */
function formatCapacity(usedGB: number, totalGB: number): string {
  const u = usedGB >= 1024 ? `${(usedGB / 1024).toFixed(1)} TB` : `${usedGB.toFixed(1)} GB`;
  const t = totalGB >= 1024 ? `${(totalGB / 1024).toFixed(1)} TB` : `${totalGB.toFixed(1)} GB`;
  return `${u} / ${t}`;
}

function capacityPercent(usedGB: number, totalGB: number): number {
  return Math.round((usedGB / totalGB) * 100);
}

function capacityColor(percent: number): string {
  if (percent >= 90) return '#ff4d4f';
  if (percent >= 70) return '#faad14';
  return '#1677ff';
}
</script>

<template>
  <div class="folder-table-wrap">
    <Table
      :columns="columns"
      :data-source="props.folders"
      row-key="id"
      size="small"
      :pagination="false"
      class="folder-table"
    >
      <template #bodyCell="{ column, record }: { column: any; record: PublicFolder }">
        <!-- 文件夹名称 -->
        <template v-if="column.key === 'name'">
          <div class="name-cell">
            <div class="name-icon-box" :class="{ 'name-icon-box--disabled': record.status === 'disabled' }">
              <IconifyIcon icon="lucide:folder-heart" style="font-size: 16px;" />
            </div>
            <div class="name-text-area">
              <div class="name-title">{{ record.name }}</div>
              <div class="name-desc" :title="record.description">{{ record.description }}</div>
            </div>
          </div>
        </template>

        <!-- 存储池 -->
        <template v-if="column.key === 'storagePool'">
          <div class="pool-cell">
            <IconifyIcon icon="lucide:hard-drive" style="font-size: 12px; color: #8c8c8c;" />
            <span class="pool-text">{{ record.storagePool }}</span>
          </div>
        </template>

        <!-- 容量 -->
        <template v-if="column.key === 'capacity'">
          <div class="capacity-cell">
            <Progress
              :percent="capacityPercent(record.usedCapacityGB, record.totalCapacityGB)"
              :stroke-color="capacityColor(capacityPercent(record.usedCapacityGB, record.totalCapacityGB))"
              :show-info="false"
              size="small"
              style="width: 80px; flex-shrink: 0;"
            />
            <span class="capacity-text">
              {{ formatCapacity(record.usedCapacityGB, record.totalCapacityGB) }}
            </span>
          </div>
        </template>

        <!-- 操作 -->
        <template v-if="column.key === 'action'">
          <div class="action-cell">
            <Tooltip title="删除">
              <Popconfirm
                title="确认删除"
                :description="'删除后「' + record.name + '」将不再作为公共文件夹，文件夹内数据不会被删除，是否继续？'"
                ok-text="确认"
                cancel-text="取消"
                @confirm="emit('delete-folder', record)"
              >
                <Button size="small" type="text" danger class="action-icon-btn">
                  <IconifyIcon icon="lucide:trash-2" style="font-size: 14px; color: #ff4d4f;" />
                </Button>
              </Popconfirm>
            </Tooltip>
          </div>
        </template>
      </template>

      <template #emptyText>
        <Empty description="暂无公共文件夹" class="table-empty">
          <template #image>
            <div class="empty-image">
              <IconifyIcon icon="lucide:folder-heart" style="font-size: 48px; color: #d9d9d9;" />
            </div>
          </template>
        </Empty>
      </template>
    </Table>
  </div>
</template>

<style scoped>
.folder-table-wrap {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
}

.folder-table :deep(.ant-table-thead > tr > th) {
  background: #fafafa;
  font-weight: 600;
  font-size: 12px;
  color: #595959;
  padding: 10px 16px;
}

.folder-table :deep(.ant-table-tbody > tr > td) {
  padding: 12px 16px;
  font-size: 13px;
}

.folder-table :deep(.ant-table-tbody > tr:hover > td) {
  background: #f5f5f5;
}

/* ═══ 名称列 ═══ */
.name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.name-icon-box {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(135deg, #fff7e6 0%, #fff0db 100%);
  color: #fa8c16;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.name-icon-box--disabled {
  background: linear-gradient(135deg, #f5f5f5 0%, #f0f0f0 100%);
  color: #8c8c8c;
}

.name-text-area {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.name-title {
  font-size: 14px;
  font-weight: 500;
  color: #262626;
}

.name-desc {
  font-size: 12px;
  color: #8c8c8c;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}

/* ═══ 存储池列 ═══ */
.pool-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #595959;
  font-size: 13px;
}

/* ═══ 容量列 ═══ */
.capacity-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.capacity-text {
  font-size: 12px;
  color: #595959;
  font-family: 'SF Mono', 'Fira Code', monospace;
  white-space: nowrap;
}

/* ═══ 操作列 ═══ */
.action-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.action-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.action-icon-btn:hover {
  background: #f0f0f0 !important;
}

/* ═══ 空状态 ═══ */
.table-empty {
  padding: 48px 0;
}

.empty-image {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}
</style>

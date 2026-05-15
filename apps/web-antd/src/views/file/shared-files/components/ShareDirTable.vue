<script lang="ts" setup>
import { Table, Tooltip, Tag, Button, Popconfirm, Empty } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import type { SharedDir, ShareUser } from '../types';

interface Props {
  dirs: SharedDir[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'edit-users': [dir: SharedDir];
  'link-manage': [dir: SharedDir];
  'delete-dir': [dir: SharedDir];
  'copy-link': [url: string];
}>();

const dirColumns = [
  { title: '共享名称', dataIndex: 'name', key: 'name', width: 150 },
  { title: '原文件夹', dataIndex: 'sourcePath', key: 'sourcePath', ellipsis: true },
  { title: '共享用户', key: 'shareUsers', width: 200 },
  { title: '创建时间', key: 'shareTime', width: 110 },
  { title: '有效期', dataIndex: 'expireTime', key: 'expireTime', width: 110 },
  { title: '状态', key: 'status', width: 90, align: 'center' as const },
  { title: '外链', key: 'link', width: 100, align: 'center' as const },
  { title: '操作', key: 'action', width: 140, align: 'center' as const },
];

/* ═══════ 友好时间格式 ═══════ */
function formatFriendlyTime(timeStr: string): string {
  const now = new Date();
  const time = new Date(timeStr);
  const diffMs = now.getTime() - time.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) return '刚刚';
  if (diffMin < 60) return `${diffMin}分钟前`;
  if (diffHour < 24) return `${diffHour}小时前`;
  if (diffDay < 30) return `${diffDay}天前`;
  if (diffMonth < 12) return `${diffMonth}个月前`;
  return `${diffYear}年前`;
}

function formatExpireTime(expireTime: string): { text: string; color: string } {
  if (expireTime === '永久') {
    return { text: '永久', color: 'var(--ict-text-secondary)' };
  }
  const now = new Date();
  const time = new Date(expireTime);
  const diffMs = time.getTime() - now.getTime();
  const diffDay = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60 * 24));
  const isExpired = diffMs < 0;

  if (isExpired) {
    return { text: `已过期${diffDay}天`, color: 'var(--ict-danger)' };
  }
  if (diffDay === 0) {
    return { text: '今天过期', color: 'var(--ict-warning)' };
  }
  if (diffDay <= 3) {
    return { text: `还剩${diffDay}天`, color: 'var(--ict-warning)' };
  }
  return { text: `还剩${diffDay}天`, color: 'var(--ict-text-secondary)' };
}

function getUserColor(user: string) {
  const colors: Record<string, string> = {
    zhangsan: 'var(--ict-primary)',
    lisi: 'var(--ict-success)',
    wangwu: 'var(--ict-warning)',
    admin: 'var(--ict-info)',
  };
  return colors[user] || 'var(--ict-text-secondary)';
}

function getUserInitial(user: string) {
  return user.charAt(0).toUpperCase();
}
</script>

<template>
  <div class="table-card">
    <Table
      :columns="dirColumns"
      :data-source="props.dirs"
      row-key="id"
      size="small"
      :pagination="false"
      class="shared-table"
    >
      <template #bodyCell="{ column, record }: { column: any; record: SharedDir }">
        <!-- 共享名称 -->
        <template v-if="column.key === 'name'">
          <div class="name-cell">
            <div
              class="name-icon-box"
              :class="{ 'name-icon-box--expired': record.status === 'expired' }"
            >
              <IconifyIcon icon="lucide:folder-open" style="font-size: var(--ict-title-medium);" />
            </div>
            <div class="name-text-area">
              <div class="name-title">{{ record.name }}</div>
            </div>
          </div>
        </template>

        <!-- 创建时间 -->
        <template v-if="column.key === 'shareTime'">
          <Tooltip :title="record.shareTime">
            <span class="time-text">{{ formatFriendlyTime(record.shareTime) }}</span>
          </Tooltip>
        </template>

        <!-- 原文件夹 -->
        <template v-if="column.key === 'sourcePath'">
          <div class="path-cell">
            <IconifyIcon icon="lucide:folder" style="font-size: var(--ict-body-small); color: var(--ict-text-disabled); flex-shrink: 0;" />
            <span class="path-text" :title="record.sourcePath">{{ record.sourcePath }}</span>
          </div>
        </template>

        <!-- 共享用户 -->
        <template v-if="column.key === 'shareUsers'">
          <div class="user-cell">
            <Tooltip
              v-for="su in record.shareUsers"
              :key="su.user"
              :title="`${su.user} — ${su.permission === 'readonly' ? '只读' : '读写'}`"
            >
              <div class="user-perm-tag">
                <div
                  class="user-avatar"
                  :style="{ backgroundColor: getUserColor(su.user) + '18', color: getUserColor(su.user), borderColor: getUserColor(su.user) + '40' }"
                >
                  {{ getUserInitial(su.user) }}
                </div>
                <span
                  class="perm-dot"
                  :class="su.permission === 'readonly' ? 'perm-dot--ro' : 'perm-dot--rw'"
                />
              </div>
            </Tooltip>
            <span v-if="record.shareUsers.length === 0" class="no-users">无</span>
          </div>
        </template>

        <!-- 有效期 -->
        <template v-if="column.key === 'expireTime'">
          <Tooltip :title="record.expireTime">
            <span :style="{ color: formatExpireTime(record.expireTime).color, fontSize: '12px' }">
              {{ formatExpireTime(record.expireTime).text }}
            </span>
          </Tooltip>
        </template>

        <!-- 状态 -->
        <template v-if="column.key === 'status'">
          <div class="status-cell">
            <span
              class="status-dot"
              :style="{ background: record.status === 'active' ? 'var(--ict-success)' : 'var(--ict-text-secondary)' }"
            />
            <span class="status-text" :class="{ 'status-text--expired': record.status === 'expired' }">
              {{ record.status === 'active' ? '有效' : '已过期' }}
            </span>
          </div>
        </template>

        <!-- 外链 -->
        <template v-if="column.key === 'link'">
          <div class="link-cell">
            <template v-if="record.linkEnabled && record.linkStatus === 'active'">
              <Tooltip title="点击复制外链">
                <Tag
                  color="blue"
                  size="small"
                  class="link-tag link-tag--clickable"
                  @click="emit('copy-link', record.linkUrl)"
                >
                  <IconifyIcon icon="lucide:link" style="font-size: var(--ict-mark-small); margin-right: 2px;" />
                  已开启
                </Tag>
              </Tooltip>
            </template>
            <template v-else-if="record.linkEnabled && record.linkStatus === 'expired'">
              <Tag color="default" size="small" class="link-tag">
                <IconifyIcon icon="lucide:link-break" style="font-size: var(--ict-mark-small); margin-right: 2px;" />
                已过期
              </Tag>
            </template>
            <span v-else class="link-none">
              <IconifyIcon icon="lucide:link-off" style="font-size: var(--ict-mark-small); margin-right: 2px;" />
              未开启
            </span>
          </div>
        </template>

        <!-- 操作 -->
        <template v-if="column.key === 'action'">
          <div class="action-cell">
            <Tooltip title="管理共享用户">
              <Button
                size="small"
                type="text"
                class="action-icon-btn"
                @click="emit('edit-users', record)"
              >
                <IconifyIcon icon="lucide:users" style="font-size: var(--ict-body-medium); color: var(--ict-text-secondary);" />
              </Button>
            </Tooltip>
            <Tooltip title="外链管理">
              <Button
                size="small"
                type="text"
                class="action-icon-btn"
                @click="emit('link-manage', record)"
              >
                <IconifyIcon icon="lucide:link" style="font-size: var(--ict-body-medium); color: var(--ict-text-secondary);" />
              </Button>
            </Tooltip>
            <Tooltip title="删除共享">
              <Popconfirm
                title="确认删除"
                description="删除后该共享将失效，是否继续？"
                ok-text="确认"
                cancel-text="取消"
                @confirm="emit('delete-dir', record)"
              >
                <Button size="small" type="text" danger class="action-icon-btn">
                  <IconifyIcon icon="lucide:trash-2" style="font-size: var(--ict-body-medium); color: var(--ict-danger);" />
                </Button>
              </Popconfirm>
            </Tooltip>
          </div>
        </template>
      </template>

      <template #emptyText>
        <Empty description="暂无共享目录" class="table-empty">
          <template #image>
            <div class="empty-image">
              <IconifyIcon icon="lucide:folder-symlink" style="font-size: 48px; color: var(--ict-text-disabled);" />
            </div>
          </template>
        </Empty>
      </template>
    </Table>
  </div>
</template>

<style scoped>
.table-card {
  background: var(--ict-bg-card);
  border-radius: 12px;
  overflow: hidden;
}

.shared-table :deep(.ant-table-thead > tr > th) {
  background: var(--ict-bg-section);
  font-weight: 600;
  font-size: var(--ict-body-small);
  color: var(--ict-text-secondary);
  padding: 10px 16px;
}

.shared-table :deep(.ant-table-tbody > tr > td) {
  padding: 12px 16px;
  font-size: var(--ict-mark-medium);
}

.shared-table :deep(.ant-table-tbody > tr:hover > td) {
  background: var(--ict-bg-page);
}

/* ═══ 时间列 ═══ */
.time-text {
  color: var(--ict-text-secondary);
  font-size: var(--ict-body-small);
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
  background: linear-gradient(135deg, var(--ict-primary-light) 0%, #f0f5ff 100%);
  color: var(--ict-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.name-icon-box--expired {
  background: linear-gradient(135deg, var(--ict-bg-page) 0%, var(--ict-border-light) 100%);
  color: var(--ict-text-secondary);
}

.name-text-area {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.name-title {
  font-size: var(--ict-body-medium);
  font-weight: 500;
  color: var(--ict-text-emphasis);
}

/* ═══ 路径列 ═══ */
.path-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--ict-text-secondary);
  font-size: var(--ict-mark-medium);
}

.path-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ═══ 用户列 ═══ */
.user-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.user-perm-tag {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.user-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--ict-body-small);
  font-weight: 600;
  border: 1.5px solid;
  cursor: default;
}

.perm-dot {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1.5px solid var(--ict-bg-card);
}

.perm-dot--ro {
  background: var(--ict-text-secondary);
}

.perm-dot--rw {
  background: var(--ict-success);
}

.no-users {
  color: var(--ict-text-disabled);
  font-size: var(--ict-mark-medium);
}

/* ═══ 状态列 ═══ */
.status-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-text {
  font-size: var(--ict-body-small);
  font-weight: 500;
  color: var(--ict-success);
}

.status-text--expired {
  color: var(--ict-text-secondary);
}

/* ═══ 外链列 ═══ */
.link-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

.link-tag {
  display: inline-flex;
  align-items: center;
}

.link-tag--clickable {
  cursor: pointer;
  transition: all 0.2s ease;
}

.link-tag--clickable:hover {
  opacity: 0.85;
  transform: scale(1.02);
}

.link-none {
  display: inline-flex;
  align-items: center;
  color: var(--ict-text-disabled);
  font-size: var(--ict-body-small);
}

/* ═══ 操作列 ═══ */
.action-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
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
  background: var(--ict-border-light) !important;
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
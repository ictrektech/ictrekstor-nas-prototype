<script lang="ts" setup>
import { IconifyIcon } from '@vben/icons';
import { Button, Dropdown, Progress } from 'ant-design-vue';
import { computed } from 'vue';
import { Tag } from '#/components/ui-kit';

import {
  getCapacityColor,
  getFsIcon,
  getStatusColor,
  getUsagePercent,
} from '../types';
import type { StorageVolume } from '../types';

interface Props { volume: StorageVolume }
const props = defineProps<Props>();
const emit = defineEmits<{
  configUser: [volumeId: string];
  expand: [volume: StorageVolume];
  deleteVolume: [volume: StorageVolume];
}>();

const percent = computed(() =>
  getUsagePercent(props.volume.usedCapacity, props.volume.totalCapacity),
);
const capColor = computed(() => getCapacityColor(percent.value));
const fsIcon = computed(() => getFsIcon(props.volume.filesystem));
const statusColor = computed(() => getStatusColor(props.volume.status));
</script>

<template>
  <div class="volume-nest-card">
    <div class="nest-card-header">
      <div class="nest-icon-box">
        <IconifyIcon
          :icon="volume.sourceType === 'directory' ? 'lucide:folder' : 'lucide:box'"
          style="font-size: var(--ict-title-large);"
          :style="{ color: volume.sourceType === 'directory' ? 'var(--ict-success)' : 'var(--ict-primary)' }"
        />
      </div>
      <div class="nest-title-info">
        <div class="nest-name-row">
          <span class="nest-name">{{ volume.name }}</span>
          <Tag :type="statusColor" :text="volume.status" />
        </div>
        <span class="fs-tag">
          {{ volume.filesystem }}
        </span>
      </div>
    </div>
    <div class="nest-card-body">
      <div class="nest-capacity">
        <Progress
          :percent="percent"
          :stroke-color="capColor"
          :show-info="false"
          :stroke-width="8"
          size="small"
        />
        <div class="capacity-summary">
          <span class="cap-used">{{ volume.usedCapacity }}</span>
          <span class="cap-div">/</span>
          <span class="cap-total">{{ volume.totalCapacity }}</span>
          <span class="cap-percent" :style="{ color: capColor }">
            {{ percent }}%
          </span>
        </div>
      </div>
      <div class="nest-card-footer">
        <div class="nest-actions">
          <Button
            size="small"
            class="user-btn"
            @click="emit('configUser', volume.id)"
          >
            <IconifyIcon icon="lucide:users" style="font-size: var(--ict-mark-small);" />
            用户管理
          </Button>
          <Dropdown>
            <Button size="small" class="vol-action-btn">
              <IconifyIcon icon="lucide:settings" style="font-size: var(--ict-mark-small);" />
              高级动作
              <IconifyIcon icon="lucide:chevron-down" style="font-size: var(--ict-mark-small);" />
            </Button>
            <template #overlay>
              <div class="vol-action-menu">
                <div class="menu-item" @click="emit('expand', volume)">
                  <IconifyIcon icon="lucide:maximize" style="font-size: var(--ict-mark-medium); color: var(--ict-primary);" />
                  <span>扩容</span>
                </div>
                <div class="menu-divider" />
                <div class="menu-item danger" @click="emit('deleteVolume', volume)">
                  <IconifyIcon icon="lucide:trash-2" style="font-size: var(--ict-mark-medium); color: var(--ict-danger);" />
                  <span style="color: var(--ict-danger);">删除</span>
                </div>
              </div>
            </template>
          </Dropdown>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.volume-nest-card {
  background: var(--ict-bg-card);
  border-radius: 10px;
  border: 1px solid var(--ict-border);
  overflow: hidden;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.volume-nest-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: var(--ict-primary);
}

.nest-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nest-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: hsl(var(--accent));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nest-title-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.nest-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nest-name {
  font-size: var(--ict-title-medium);
  font-weight: 600;
  color: var(--ict-text-emphasis);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nest-card-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 容量 */
.nest-capacity {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nest-capacity :deep(.ant-progress),
.nest-capacity :deep(.ant-progress-outer),
.nest-capacity :deep(.ant-progress-inner) {
  margin: 0;
  padding: 0;
  line-height: 0;
  font-size: 0;
}

.capacity-summary {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--ict-body-small);
  color: var(--ict-text-secondary);
}

.cap-used {
  font-weight: 600;
  color: var(--ict-text-emphasis);
}

.cap-div {
  color: var(--ict-text-disabled);
}

.cap-total {
  color: var(--ict-text-secondary);
}

.cap-percent {
  margin-left: auto;
  font-size: var(--ict-mark-medium);
  font-weight: 700;
  font-family: var(--ict-font-family);
}

/* 卡片底部操作区 */
.nest-card-footer {
  flex: auto;;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid var(--ict-border-light);
}

.fs-tag {
  font-size: var(--ict-body-medium);
}

.nest-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.user-btn {
  flex:auto;
  align-items: center;
  gap: 4px;
  font-size: var(--ict-body-small);
  border-radius: 6px;
}

.vol-action-btn {
  flex:auto;
  align-items: center;
  gap: 4px;
  font-size: var(--ict-body-small);
  border-radius: 6px;
}

.vol-action-menu {
  background: var(--ict-bg-card);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  border: 1px solid var(--ict-border-light);
  padding: 4px;
  min-width: 120px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: var(--ict-mark-medium);
  color: var(--ict-text-emphasis);
  transition: all 0.2s ease;
}

.menu-item:hover {
  background: var(--ict-bg-page);
}

.menu-item.danger:hover {
  background: var(--ict-danger-light);
}

.menu-divider {
  height: 1px;
  background: var(--ict-border-light);
  margin: 4px 0;
}
</style>

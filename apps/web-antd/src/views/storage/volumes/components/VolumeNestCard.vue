<script lang="ts" setup>
import { IconifyIcon } from '@vben/icons';
import { Button, Dropdown, Progress, Tag } from 'ant-design-vue';
import { computed } from 'vue';

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
          style="font-size: 16px;"
          :style="{ color: volume.sourceType === 'directory' ? '#52c41a' : '#1677ff' }"
        />
      </div>
      <div class="nest-title-info">
        <div class="nest-name-row">
          <span class="nest-name">{{ volume.name }}</span>
          <Tag :color="statusColor" size="small">
            <span
              class="status-dot"
              :style="{ background: volume.status === '正常' ? '#52c41a' : '#8c8c8c' }"
            />
            {{ volume.status }}
          </Tag>
        </div>
      </div>
    </div>
    <div class="nest-card-body">
      <div class="nest-capacity">
        <div class="nest-capacity-top">
          <span class="nest-capacity-text">
            <span class="nest-used">{{ volume.usedCapacity }}</span>
            <span class="nest-divider">/</span>
            <span class="nest-total">{{ volume.totalCapacity }}</span>
          </span>
          <span
            class="nest-percent"
            :style="{ color: capColor }"
          >
            {{ percent }}%
          </span>
        </div>
        <Progress
          :percent="percent"
          :stroke-color="capColor"
          :show-info="false"
          :stroke-width="5"
          size="small"
        />
      </div>
      <div class="nest-card-footer">
        <span class="fs-tag">
          <IconifyIcon :icon="fsIcon" style="font-size: 10px; color: #8c8c8c;" />
          {{ volume.filesystem }}
        </span>
        <div class="nest-actions">
          <Button
            size="small"
            class="user-btn"
            @click="emit('configUser', volume.id)"
          >
            <IconifyIcon icon="lucide:users" style="font-size: 11px;" />
            用户管理
          </Button>
          <Dropdown>
            <Button size="small" class="vol-action-btn">
              <IconifyIcon icon="lucide:settings" style="font-size: 11px;" />
              高级动作
              <IconifyIcon icon="lucide:chevron-down" style="font-size: 10px;" />
            </Button>
            <template #overlay>
              <div class="vol-action-menu">
                <div class="menu-item" @click="emit('expand', volume)">
                  <IconifyIcon icon="lucide:maximize" style="font-size: 13px; color: #1677ff;" />
                  <span>扩容</span>
                </div>
                <div class="menu-divider" />
                <div class="menu-item danger" @click="emit('deleteVolume', volume)">
                  <IconifyIcon icon="lucide:trash-2" style="font-size: 13px; color: #ff4d4f;" />
                  <span>删除</span>
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
  background: #fff;
  border-radius: 10px;
  border: 1px solid #e8e8e8;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.volume-nest-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  border-color: #1677ff;
}

.nest-card-header {
  padding: 10px 14px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.nest-icon-box {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #e6f7ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nest-title-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.nest-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nest-name {
  font-size: 13px;
  font-weight: 700;
  color: #262626;
}

.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 4px;
}

.nest-card-body {
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 容量 */
.nest-capacity {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nest-capacity-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nest-capacity-text {
  font-size: 12px;
  color: #262626;
}

.nest-used {
  font-weight: 700;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.nest-divider {
  color: #bfbfbf;
  margin: 0 2px;
}

.nest-total {
  color: #8c8c8c;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.nest-percent {
  font-size: 12px;
  font-weight: 700;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

/* 卡片底部操作区 */
.nest-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.fs-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #595959;
  background: #f5f5f5;
  padding: 2px 8px;
  border-radius: 4px;
}

.nest-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.user-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  border-radius: 6px;
}

.vol-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  border-radius: 6px;
}

.vol-action-menu {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  border: 1px solid #f0f0f0;
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
  font-size: 13px;
  color: #262626;
  transition: all 0.2s ease;
}

.menu-item:hover {
  background: #f5f5f5;
}

.menu-item.danger:hover {
  background: #fff1f0;
}

.menu-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 4px 0;
}
</style>

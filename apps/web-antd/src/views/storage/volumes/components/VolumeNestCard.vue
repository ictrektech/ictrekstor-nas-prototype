<script lang="ts" setup>
import { IconifyIcon } from '@vben/icons';
import { Dropdown, Progress, Tag } from 'ant-design-vue';
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
  rename: [volume: StorageVolume];
  deleteVolume: [volumeId: string];
}>();

const percent = computed(() =>
  getUsagePercent(props.volume.used, props.volume.capacity),
);
const capColor = computed(() => getCapacityColor(percent.value));
const fsIcon = computed(() => getFsIcon(props.volume.filesystem));
const statusColor = computed(() => getStatusColor(props.volume.status));
</script>

<template>
  <div class="volume-nest-card">
    <div class="nest-card-header">
      <div class="nest-icon-box">
        <IconifyIcon icon="lucide:box" style="font-size: 16px; color: #1677ff;" />
      </div>
      <div class="nest-title-info">
        <div class="nest-name-row">
          <span class="nest-name">{{ volume.name }}</span>
          <Tag
            v-if="volume.sourceType === 'pool'"
            :color="statusColor"
            size="small"
            class="nest-source-tag pool-source"
          >
            <IconifyIcon icon="lucide:database" style="font-size: 10px;" />
            存储池
          </Tag>
          <Tag v-else :color="statusColor" size="small" class="nest-source-tag dir-source">
            <IconifyIcon icon="lucide:folder" style="font-size: 10px;" />
            目录
          </Tag>
        </div>
        <div v-if="volume.sourceType === 'pool'" class="nest-capacity-bottom">
          <IconifyIcon icon="lucide:database" style="font-size: 10px;" />
          来源存储池：{{ volume.poolName }}
        </div>
        <div v-else class="nest-capacity-bottom">
          <IconifyIcon icon="lucide:folder-open" style="font-size: 10px;" />
          来源目录：{{ volume.bindSource }}
        </div>
      </div>
    </div>
    <div class="nest-card-body">
      <div class="nest-capacity">
        <div class="nest-capacity-top">
          <span class="nest-capacity-text">
            <span class="nest-used">{{ volume.used }}</span>
            <span class="nest-divider">/</span>
            <span class="nest-total">{{ volume.capacity }}</span>
          </span>
          <span class="nest-percent" :style="{ color: capColor }">{{ percent }}%</span>
        </div>
        <Progress :percent="percent" :show-info="false" :stroke-color="capColor" size="small" />
      </div>
    </div>
    <div class="nest-card-footer">
      <span class="fs-tag">
        <IconifyIcon :icon="fsIcon" style="font-size: 10px;" />
        {{ volume.filesystem }}
      </span>
      <div class="nest-actions">
        <a-button class="user-btn" size="small" type="text" @click.stop="emit('configUser', volume.id)">
          <IconifyIcon icon="lucide:users" style="font-size: 12px;" />
          用户权限
        </a-button>
        <Dropdown :trigger="['click']" placement="bottomRight">
          <a-button class="vol-action-btn" size="small">
            <IconifyIcon icon="lucide:more-vertical" style="font-size: 12px;" />
          </a-button>
          <template #overlay>
            <div class="vol-action-menu">
              <div class="menu-item" @click="emit('rename', volume)">
                <IconifyIcon icon="lucide:edit-3" style="font-size: 14px; color: #1677ff;" />
                重命名
              </div>
              <div class="menu-divider" />
              <div class="menu-item danger" @click="emit('deleteVolume', volume.id)">
                <IconifyIcon icon="lucide:trash-2" style="font-size: 14px; color: #ff4d4f;" />
                删除
              </div>
            </div>
          </template>
        </Dropdown>
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
.nest-title-info { display: flex; flex-direction: column; gap: 3px; }
.nest-name-row { display: flex; align-items: center; gap: 8px; }
.nest-name { font-size: 13px; font-weight: 700; color: #262626; }
.nest-source-tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 3px;
  width: fit-content;
}
.pool-source { color: #1677ff; background: rgba(22, 119, 255, 0.1); }
.dir-source { color: #52c41a; background: rgba(82, 196, 26, 0.1); }
.nest-card-body { padding: 10px 14px; display: flex; flex-direction: column; gap: 8px; }
.nest-capacity { display: flex; flex-direction: column; gap: 4px; }
.nest-capacity-top { display: flex; align-items: center; justify-content: space-between; }
.nest-capacity-text { font-size: 12px; color: #262626; }
.nest-used { font-weight: 700; font-family: 'SF Mono', 'Fira Code', monospace; }
.nest-divider { color: #bfbfbf; margin: 0 2px; }
.nest-total { color: #8c8c8c; font-family: 'SF Mono', 'Fira Code', monospace; }
.nest-percent { font-size: 12px; font-weight: 700; font-family: 'SF Mono', 'Fira Code', monospace; }
.nest-capacity-bottom { font-size: 11px; color: #8c8c8c; display: flex; align-items: center; gap: 3px; }
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
.nest-actions { display: flex; align-items: center; gap: 6px; }
.user-btn, .vol-action-btn {
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
.menu-item:hover { background: #f5f5f5; }
.menu-item.danger:hover { background: #fff1f0; }
.menu-divider { height: 1px; background: #f0f0f0; margin: 4px 0; }
</style>
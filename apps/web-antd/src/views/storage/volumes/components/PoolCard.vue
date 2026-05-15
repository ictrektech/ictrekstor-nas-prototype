<script lang="ts" setup>
import { IconifyIcon } from '@vben/icons';
import { Button, Dropdown, Progress, Tag } from 'ant-design-vue';
import { computed } from 'vue';

import {
  getCapacityColor,
  getPoolStatusDotColor,
  getUsagePercent,
} from '../types';
import type { StoragePool } from '../types';

interface Props {
  pool: StoragePool;
  volumeCount?: number;
}
const props = defineProps<Props>();
const emit = defineEmits<{
  clickDisk: [deviceName: string];
  detail: [poolId: string];
  replaceDisk: [pool: StoragePool];
  rebuildPool: [pool: StoragePool];
  deletePool: [pool: StoragePool];
}>();

const poolStatusColor = computed(() => getPoolStatusDotColor(props.pool.status));
const poolUsage = computed(() =>
  getUsagePercent(props.pool.usedCapacity, props.pool.totalCapacity),
);
const poolCapColor = computed(() => getCapacityColor(poolUsage.value));
</script>

<template>
  <div class="pool-header">
    <!-- 左侧主信息 -->
    <div class="pool-header-main">
      <div class="pool-icon-box">
        <IconifyIcon icon="lucide:database" style="font-size: var(--ict-headline-small); color: var(--ict-primary);" />
      </div>
      <div class="pool-header-body">
        <div class="ph-row ph-row-name">
          <span class="pool-name">{{ pool.name }}</span>
          <Tag :color="pool.status === '正常' ? 'success' : 'error'" size="small">
            <span class="status-dot" :style="{ background: poolStatusColor }" />
            {{ pool.status }}
          </Tag>
        </div>
        <div class="ph-row ph-row-meta">
          <span class="meta-chip">
            <IconifyIcon icon="lucide:layers" style="font-size: var(--ict-mark-small);" />
            {{ pool.raidType }}
          </span>
          <span class="meta-chip">
            <IconifyIcon icon="lucide:hard-drive" style="font-size: var(--ict-mark-small);" />
            {{ pool.diskCount }} 块硬盘
          </span>
          <span class="meta-chip">
            <IconifyIcon icon="lucide:box" style="font-size: var(--ict-mark-small);" />
            {{ volumeCount || 0 }} 个存储空间
          </span>
        </div>
        <div v-if="pool.disks && pool.disks.length" class="ph-row ph-row-disks">
          <span
            v-for="disk in pool.disks"
            :key="disk.deviceName"
            class="disk-tag"
            @click.stop="emit('clickDisk', disk.deviceName)"
          >
            {{ disk.deviceName }}
          </span>
        </div>
      </div>
    </div>

    <!-- 右侧容量与操作面板 -->
    <div class="pool-header-panel">
      <div class="ph-panel-capacity">
        <span class="cap-used">{{ pool.usedCapacity }}</span>
        <span class="cap-div">/</span>
        <span class="cap-total">{{ pool.totalCapacity }}</span>
        <span class="cap-percent" :style="{ color: poolCapColor }">
          {{ poolUsage }}%
        </span>
      </div>
      <div class="ph-panel-progress">
        <Progress
          :percent="poolUsage"
          :stroke-color="poolCapColor"
          :show-info="false"
          :stroke-width="5"
          size="small"
        />
      </div>
      <div class="ph-panel-actions">
        <Button size="small" class="detail-btn" @click.stop="emit('detail', pool.id)">
          <IconifyIcon icon="lucide:file-text" style="font-size: var(--ict-body-small);" />
          详细信息
        </Button>
        <Dropdown>
          <Button size="small" class="action-dropdown-btn">
            <IconifyIcon icon="lucide:settings" style="font-size: var(--ict-body-small);" />
            高级动作
            <IconifyIcon icon="lucide:chevron-down" style="font-size: var(--ict-mark-small);" />
          </Button>
          <template #overlay>
            <div class="pool-action-menu">
              <div class="menu-item" @click.stop="emit('replaceDisk', pool)">
                <IconifyIcon icon="lucide:refresh-cw" style="font-size: var(--ict-mark-medium); color: var(--ict-warning);" />
                <span>换盘</span>
              </div>
              <div class="menu-item" @click.stop="emit('rebuildPool', pool)">
                <IconifyIcon icon="lucide:rotate-ccw" style="font-size: var(--ict-mark-medium); color: var(--ict-primary);" />
                <span>重构</span>
              </div>
              <div class="menu-divider" />
              <div class="menu-item danger" @click.stop="emit('deletePool', pool)">
                <IconifyIcon icon="lucide:trash-2" style="font-size: var(--ict-mark-medium); color: var(--ict-danger);" />
                <span>删除</span>
              </div>
            </div>
          </template>
        </Dropdown>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pool-header {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f0f5ff 0%, #e6f0ff 100%);
  border-bottom: 1px solid #e6e6e6;
  transition: all 0.2s ease;
  gap: 24px;
}

.pool-header-main {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  flex: 1;
  min-width: 0;
}

.pool-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: var(--ict-bg-card);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.pool-header-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 2px;
  min-width: 0;
}

.ph-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.ph-row-name { gap: 10px; }

.pool-name {
  font-size: var(--ict-title-medium);
  font-weight: 700;
  color: #1a1a1a;
}

.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 4px;
}

.ph-row-meta { gap: 6px; }

.meta-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: var(--ict-body-small);
  color: var(--ict-text-secondary);
  background: rgba(255, 255, 255, 0.7);
  padding: 3px 10px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.ph-row-disks { gap: 6px; }

.disk-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: var(--ict-body-small);
  color: var(--ict-primary);
  background: rgba(22, 119, 255, 0.08);
  padding: 3px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(22, 119, 255, 0.15);
}

.disk-tag:hover {
  background: rgba(22, 119, 255, 0.15);
  border-color: rgba(22, 119, 255, 0.3);
}

.pool-header-panel {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  min-width: 170px;
  padding-top: 2px;
  flex-shrink: 0;
}

.ph-panel-capacity {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--ict-body-medium);
  white-space: nowrap;
}

.cap-used {
  font-weight: 700;
  color: var(--ict-text-emphasis);
  font-family: var(--ict-font-family);
}

.cap-div { color: var(--ict-text-disabled); }

.cap-total {
  color: var(--ict-text-secondary);
  font-family: var(--ict-font-family);
}

.cap-percent {
  font-weight: 700;
  font-family: var(--ict-font-family);
  margin-left: 6px;
}

.ph-panel-progress {
  width: 140px;
}

.ph-panel-progress :deep(.ant-progress) {
  margin-bottom: 0;
}

.ph-panel-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
}

.detail-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: var(--ict-body-small);
  border-radius: 6px;
}

.action-dropdown-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: var(--ict-body-small);
  border-radius: 6px;
}

/* 下拉菜单 */
.pool-action-menu {
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

@media (max-width: 992px) {
  .pool-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }

  .pool-header-main {
    width: 100%;
  }

  .pool-header-panel {
    width: 100%;
    align-items: stretch;
    flex-direction: row;
    flex-wrap: nowrap;
    gap: 12px;
    padding-top: 0;
    padding-left: 58px;
  }

  .ph-panel-capacity {
    white-space: nowrap;
    flex-shrink: 0;
  }

  .ph-panel-progress {
    flex: 1;
    min-width: 100px;
  }

  .ph-panel-actions {
    flex-shrink: 0;
    margin-top: 0;
  }
}
</style>

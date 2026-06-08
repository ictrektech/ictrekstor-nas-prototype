<script lang="ts" setup>
import { IconifyIcon } from '@vben/icons';
import { Button, Dropdown, Progress } from 'ant-design-vue';
import { computed } from 'vue';
import { Tag } from '#/components/ui-kit';

import {
  getCapacityColor,
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
          <Tag :type="pool.status === '正常' ? 'success' : 'danger'" :text="pool.status" />
        </div>
        <div class="ph-row ph-row-meta">
          <span class="meta-item">{{ pool.raidType }}</span>
          <span class="meta-sep">|</span>
          <span class="meta-item">{{ pool.diskCount }} 块硬盘</span>
          <span class="meta-sep">|</span>
          <Tag :text="`${volumeCount || 0} 个存储空间`" type="default" />
          <template v-if="pool.disks && pool.disks.length">
            <span class="meta-sep">|</span>
            <span class="meta-label">硬盘</span>
            <span
              v-for="disk in pool.disks"
              :key="disk.deviceName"
              class="disk-tag"
              @click.stop="emit('clickDisk', disk.deviceName)"
            >
              {{ disk.deviceName }}
            </span>
          </template>
        </div>
        <div class="ph-row ph-row-capacity">
          <span class="cap-used">{{ pool.usedCapacity }}</span>
          <span class="cap-div">/</span>
          <span class="cap-total">{{ pool.totalCapacity }}</span>
          <Progress
            :percent="poolUsage"
            :stroke-color="poolCapColor"
            :show-info="false"
            :stroke-width="6"
            size="small"
            class="pool-cap-progress"
          />
          <span class="cap-percent" :style="{ color: poolCapColor }">
            {{ poolUsage }}%
          </span>
        </div>
      </div>
    </div>

    <!-- 右侧操作面板 -->
    <div class="pool-header-panel">
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
                <span style="color: var(--ict-danger);">删除</span>
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
  background: linear-gradient(0deg, hsl(var(--card)) 0%, var(--ict-primary-light) 100%);
  border-bottom: 1px solid hsl(var(--border));
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
  color: hsl(var(--foreground));
}

.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 4px;
}

.ph-row-meta {
  gap: 6px;
  font-size: var(--ict-body-medium);
  color: var(--ict-text-secondary);
}

.meta-item {
  white-space: nowrap;
}

.meta-sep {
  color: var(--ict-border);
  font-weight: 300;
}

.meta-label {
  color: var(--ict-text-secondary);
  white-space: nowrap;
}

.disk-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: var(--ict-body-medium);
  color: var(--ict-primary);
  background: hsl(var(--primary) / 0.08);
  padding: 2px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid hsl(var(--primary) / 0.15);
  line-height: 1.5;
}

.disk-tag:hover {
  background: hsl(var(--primary) / 0.15);
  border-color: hsl(var(--primary) / 0.3);
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

.ph-row-capacity {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--ict-body-medium);
  flex-wrap: nowrap;
}

.pool-cap-progress {
  flex: 1;
  margin: 0;
  padding: 0;
  line-height: 0;
}

.pool-cap-progress :deep(.ant-progress),
.pool-cap-progress :deep(.ant-progress-outer),
.pool-cap-progress :deep(.ant-progress-inner) {
  margin: 0;
  padding: 0;
  line-height: 0;
  font-size: 0;
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
  margin-left: auto;
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

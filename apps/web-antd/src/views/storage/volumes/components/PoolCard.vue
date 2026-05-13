<script lang="ts" setup>
import { IconifyIcon } from '@vben/icons';
import { Dropdown, Progress, Tag } from 'ant-design-vue';
import { computed } from 'vue';

import { getPoolStatusDotColor } from '../types';
import type { StoragePool } from '../types';

interface Props { pool: StoragePool }
const props = defineProps<Props>();
const emit = defineEmits<{
  clickDisk: [diskId: string];
  createVolume: [poolId: string];
  deletePool: [poolId: string];
}>();

const poolStatusColor = computed(() => getPoolStatusDotColor(props.pool.status));
</script>

<template>
  <div class="pool-header">
    <div class="pool-header-main">
      <div class="ph-row-name">
        <div class="pool-icon-box">
          <IconifyIcon icon="lucide:layers" style="font-size: 20px; color: #1677ff;" />
        </div>
        <div class="pool-name">{{ pool.name }}</div>
      </div>
      <div class="ph-row-meta">
        <span class="meta-chip">
          <IconifyIcon icon="lucide:check-circle" style="font-size: 12px;" :style="{ color: poolStatusColor }" />
          {{ pool.status }}
        </span>
        <span class="meta-chip">{{ pool.raid }}</span>
        <span class="meta-chip dir-chip">{{ pool.directory }}</span>
      </div>
      <div class="ph-row-disks">
        <span v-for="d in pool.disks" :key="d.id" class="disk-tag" @click.stop="emit('clickDisk', d.id)">
          <IconifyIcon icon="lucide:hard-drive" style="font-size: 11px;" />
          {{ d.model }}
        </span>
      </div>
    </div>
    <div class="pool-header-panel">
      <div class="ph-panel-capacity">
        <span class="cap-used">{{ pool.used }}</span>
        <span class="cap-div">/</span>
        <span class="cap-total">{{ pool.capacity }}</span>
        <span class="cap-percent" :style="{ color: poolStatusColor }">{{ pool.usage }}%</span>
      </div>
      <div class="ph-panel-progress">
        <Progress :percent="pool.usage" :show-info="false" :stroke-color="poolStatusColor" size="small" />
      </div>
      <div class="ph-panel-actions">
        <a-button class="detail-btn" size="small" type="link">
          <IconifyIcon icon="lucide:arrow-right" style="font-size: 12px;" />
          详情
        </a-button>
        <Dropdown :trigger="['click']" placement="bottomRight">
          <a-button class="action-dropdown-btn" size="small">
            <IconifyIcon icon="lucide:more-vertical" style="font-size: 12px;" />
            更多
          </a-button>
          <template #overlay>
            <div class="pool-action-menu">
              <div class="menu-item" @click="emit('createVolume', pool.id)">
                <IconifyIcon icon="lucide:plus" style="font-size: 14px; color: #1677ff;" />
                创建存储空间
              </div>
              <div class="menu-divider" />
              <div class="menu-item danger" @click="emit('deletePool', pool.id)">
                <IconifyIcon icon="lucide:trash-2" style="font-size: 14px; color: #ff4d4f;" />
                删除存储池
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
  align-items: flex-start;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid #e8e8e8;
  background: #fafafa;
  gap: 16px;
}
.pool-header-main {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 0;
}
.ph-row-name {
  display: flex;
  align-items: center;
  gap: 10px;
}
.pool-icon-box {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #e6f7ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.pool-name {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
}
.ph-row-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.meta-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #595959;
  background: rgba(255, 255, 255, 0.7);
  padding: 3px 10px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.04);
}
.dir-chip {
  color: #389e0d;
  background: rgba(82, 196, 26, 0.12);
}
.ph-row-disks {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.disk-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #1677ff;
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
  font-size: 14px;
  white-space: nowrap;
}
.cap-used { font-weight: 700; color: #262626; font-family: 'SF Mono', 'Fira Code', monospace; }
.cap-div { color: #bfbfbf; }
.cap-total { color: #8c8c8c; font-family: 'SF Mono', 'Fira Code', monospace; }
.cap-percent { font-weight: 700; font-family: 'SF Mono', 'Fira Code', monospace; margin-left: 6px; }
.ph-panel-progress { width: 140px; }
.ph-panel-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
}
.detail-btn, .action-dropdown-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  border-radius: 6px;
}
@media (max-width: 992px) {
  .pool-header { flex-direction: column; align-items: flex-start; gap: 14px; }
  .pool-header-main { width: 100%; }
  .pool-header-panel {
    width: 100%; align-items: stretch; flex-direction: row; flex-wrap: nowrap; gap: 12px;
    padding-top: 0; padding-left: 58px;
  }
  .ph-panel-capacity { white-space: nowrap; flex-shrink: 0; }
  .ph-panel-progress { flex: 1; min-width: 100px; }
  .ph-panel-actions { flex-shrink: 0; margin-top: 0; }
}
</style>
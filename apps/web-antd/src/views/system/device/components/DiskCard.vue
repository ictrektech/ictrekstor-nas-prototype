<script lang="ts" setup>
import { computed } from 'vue';
import { Card, Tag, Button, Tooltip } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import type { DiskInfo, StoragePool } from '#/api/storage';

const props = defineProps<{
  disk: DiskInfo;
  pools: StoragePool[];
}>();

const emit = defineEmits<{
  locate: [disk: DiskInfo];
  sleep: [disk: DiskInfo];
  blink: [disk: DiskInfo];
  detail: [disk: DiskInfo];
}>();

const diskIcon = computed(() => {
  if (props.disk.deviceType?.includes('SSD')) return 'lucide:cpu';
  if (props.disk.deviceType?.includes('NVMe')) return 'lucide:zap';
  return 'lucide:hard-drive';
});

const diskIconColor = computed(() => {
  if (props.disk.deviceType?.includes('SSD')) return 'var(--ict-info)';
  if (props.disk.deviceType?.includes('NVMe')) return '#eb2f96';
  return 'var(--ict-primary)';
});

const healthColor = computed(() => {
  switch (props.disk.healthStatus) {
    case '正常': return 'var(--ict-success)';
    case '警告': return 'var(--ict-warning)';
    case '异常': return 'var(--ict-danger)';
    default: return 'var(--ict-text-secondary)';
  }
});

const diskPools = computed(() => {
  if (!props.disk.poolIds) return [];
  return props.disk.poolIds.map((pid) => props.pools.find((p) => p.id === pid)?.name || pid);
});
</script>

<template>
  <Card class="disk-card" :bordered="true" :body-style="{ padding: '0' }">
    <div class="disk-card-inner">
      <div class="disk-visual" :style="{ background: `${diskIconColor}10` }">
        <Tooltip title="点击在示意图中定位">
          <div
            class="disk-icon-box"
            :style="{
              background: `${diskIconColor}18`,
              borderColor: `${diskIconColor}35`,
            }"
            @click="emit('locate', disk)"
          >
            <IconifyIcon :icon="diskIcon" class="disk-icon" :style="{ color: diskIconColor }" />
          </div>
        </Tooltip>
        <div class="health-badge" :style="{ color: healthColor, background: `${healthColor}12`, borderColor: `${healthColor}28` }">
          <span class="health-dot-mini" :style="{ background: healthColor }" />
          {{ disk.healthStatus || '未知' }}
        </div>
      </div>
      <div class="disk-info">
        <!-- 第一行：设备名 + 容量 + 存储池 + 操作 -->
        <div class="info-header">
          <div class="info-header-left">
            <span class="disk-device-name">{{ disk.deviceName }}</span>
            <span class="disk-capacity" :style="{ background: `${diskIconColor}12`, color: diskIconColor }">
              {{ disk.size }}
            </span>
            <span v-if="diskPools.length > 0" class="disk-pools-inline">
              <span v-for="pname in diskPools" :key="pname" class="disk-pool-tag">
                <IconifyIcon icon="lucide:database" style="font-size: var(--ict-mark-small); margin-right: 2px;" />
                {{ pname }}
              </span>
            </span>
            <span v-else class="pool-empty-inline">未分配存储池</span>
          </div>
          <div class="header-actions">
            <Tooltip title="休眠">
              <Button size="small" class="action-btn" @click="emit('sleep', disk)">
                <IconifyIcon icon="lucide:moon" class="action-icon" />
              </Button>
            </Tooltip>
            <Tooltip title="切换指示灯">
              <Button size="small" class="action-btn" @click="emit('blink', disk)">
                <IconifyIcon icon="lucide:lightbulb" class="action-icon" />
              </Button>
            </Tooltip>
            <Button size="small" type="primary" class="detail-btn" @click="emit('detail', disk)">
              <IconifyIcon icon="lucide:file-text" style="font-size: var(--ict-mark-small);" />
              详情
            </Button>
          </div>
        </div>
        <!-- 第二行：型号/类型/序列号 -->
        <div class="disk-attrs-row">
          <span class="disk-attr">
            <IconifyIcon icon="lucide:info" class="attr-icon" />
            <span class="attr-label">型号</span>
            <span class="attr-value">{{ disk.model || '-' }}</span>
          </span>
          <span class="disk-attr">
            <span class="attr-label">类型</span>
            <span class="attr-value">{{ disk.deviceType || '-' }}</span>
          </span>
          <span class="disk-attr">
            <span class="attr-label">序列号</span>
            <span class="attr-value serial">{{ disk.serial || '-' }}</span>
          </span>
        </div>
      </div>
    </div>
  </Card>
</template>

<style scoped>
.disk-card { border-radius: 12px; overflow: hidden; transition: all 0.3s; }
.disk-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
.disk-card-inner { display: flex; }
.disk-visual { width: 72px; min-height: 80px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; padding: 10px 0; border-right: 1px solid var(--ict-border-light); flex-shrink: 0; }
.disk-icon-box { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; border: 2px solid; cursor: pointer; transition: transform 0.2s, filter 0.2s; }
.disk-icon-box:hover { transform: scale(1.08); filter: brightness(1.1); }
.disk-icon { font-size: var(--ict-title-large); }
.health-badge { display: inline-flex; align-items: center; justify-content: center; gap: 3px; font-size: var(--ict-mark-small); font-weight: 500; padding: 2px 7px; border-radius: 10px; border: 1px solid; white-space: nowrap; line-height: 1.3; }
.disk-info { flex: 1; min-width: 0; padding: 10px 14px; display: flex; flex-direction: column; gap: 6px; }
.info-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.info-header-left { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.disk-device-name { font-size: var(--ict-title-small); font-weight: 600; color: var(--ict-text-emphasis); }
.disk-capacity { font-size: var(--ict-body-small); font-weight: 500; padding: 2px 8px; border-radius: 6px; }
.health-dot-mini { display: inline-block; width: 6px; height: 6px; border-radius: 50%; margin-right: 4px; }
.header-actions { display: flex; gap: 5px; }
.action-btn { width: 26px; height: 26px; padding: 0; display: flex; align-items: center; justify-content: center; border-radius: 6px; }
.action-icon { font-size: var(--ict-body-small); }
.detail-btn { height: 26px; padding: 0 8px; border-radius: 6px; display: flex; align-items: center; gap: 4px; font-size: var(--ict-mark-small); }
.disk-attrs-row { display: flex; gap: 14px; flex-wrap: wrap; }
.disk-attr { display: flex; align-items: center; gap: 4px; font-size: var(--ict-body-small); }
.attr-icon { font-size: var(--ict-mark-small); color: var(--ict-text-disabled); }
.attr-label { color: var(--ict-text-secondary); }
.attr-value { color: var(--ict-text-primary); font-weight: 500; }
.attr-value.serial { font-family: 'SF Mono', monospace; font-size: var(--ict-mark-small); }
.disk-pools-inline { display: inline-flex; gap: 5px; flex-wrap: wrap; align-items: center; }
.disk-pool-tag { display: inline-flex; align-items: center; padding: 1px 6px; background: var(--ict-success-light); border: 1px solid var(--ict-success-disabled); border-radius: 5px; font-size: var(--ict-mark-small); color: var(--ict-success-active); }
.pool-empty-inline { font-size: var(--ict-mark-small); color: var(--ict-text-disabled); font-style: italic; }
</style>
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
  if (props.disk.deviceType?.includes('SSD')) return '#722ed1';
  if (props.disk.deviceType?.includes('NVMe')) return '#eb2f96';
  return '#1677ff';
});

const statusColor = computed(() => {
  switch (props.disk.status) {
    case '运行中': return '#52c41a';
    case '休眠': return '#faad14';
    default: return '#bfbfbf';
  }
});

const healthColor = computed(() => {
  switch (props.disk.health) {
    case '正常': return '#52c41a';
    case '警告': return '#faad14';
    case '异常': return '#ff4d4f';
    default: return '#8c8c8c';
  }
});

const diskPools = computed(() => {
  if (!props.disk.pools) return [];
  return props.disk.pools.map((pid) => props.pools.find((p) => p.id === pid)?.name || pid);
});
</script>

<template>
  <Card class="disk-card" :bordered="true" :body-style="{ padding: '0' }">
    <div class="disk-card-inner">
      <div class="disk-visual" :style="{ background: `${diskIconColor}10` }">
        <div
          class="disk-icon-box"
          :style="{
            background: `${diskIconColor}18`,
            borderColor: `${diskIconColor}35`,
          }"
        >
          <IconifyIcon :icon="diskIcon" class="disk-icon" :style="{ color: diskIconColor }" />
        </div>
        <div class="disk-status-indicator" :style="{ background: statusColor }" />
      </div>
      <div class="disk-info">
        <!-- 第一行：设备名 + 容量 + 健康状态 + 操作 -->
        <div class="info-header">
          <div class="info-header-left">
            <span class="disk-device-name">{{ disk.deviceName }}</span>
            <span class="disk-capacity" :style="{ background: `${diskIconColor}12`, color: diskIconColor }">
              {{ disk.capacity }}
            </span>
            <Tag size="small" :style="{ color: healthColor, borderColor: `${healthColor}50`, background: `${healthColor}10` }">
              <span class="health-dot-mini" :style="{ background: healthColor }" />
              {{ disk.health || '未知' }}
            </Tag>
          </div>
          <div class="header-actions">
            <Tooltip title="在设备示意图中定位">
              <Button size="small" class="action-btn" @click="emit('locate', disk)">
                <IconifyIcon icon="lucide:locate" class="action-icon" />
              </Button>
            </Tooltip>
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
              <IconifyIcon icon="lucide:file-text" style="font-size: 11px;" />
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
        <!-- 第三行：存储池标签 -->
        <div v-if="diskPools.length > 0" class="disk-pools-row">
          <span v-for="pname in diskPools" :key="pname" class="disk-pool-tag">
            <IconifyIcon icon="lucide:database" style="font-size: 10px; margin-right: 2px;" />
            {{ pname }}
          </span>
        </div>
        <div v-else class="info-pools-empty">
          <span class="pool-empty-text">未分配存储池</span>
        </div>
      </div>
    </div>
  </Card>
</template>

<style scoped>
.disk-card { border-radius: 12px; overflow: hidden; transition: all 0.3s; }
.disk-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
.disk-card-inner { display: flex; }
.disk-visual { width: 72px; min-height: 100px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 12px 0; border-right: 1px solid #f0f0f0; flex-shrink: 0; }
.disk-icon-box { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; border: 2px solid; }
.disk-icon { font-size: 20px; }
.disk-status-indicator { width: 8px; height: 8px; border-radius: 50%; }
.disk-info { flex: 1; min-width: 0; padding: 12px 16px; display: flex; flex-direction: column; gap: 8px; }
.info-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.info-header-left { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.disk-device-name { font-size: 15px; font-weight: 600; color: #262626; }
.disk-capability { font-size: 12px; font-weight: 500; padding: 2px 8px; border-radius: 6px; }
.health-dot-mini { display: inline-block; width: 6px; height: 6px; border-radius: 50%; margin-right: 4px; }
.header-actions { display: flex; gap: 6px; }
.action-btn { width: 28px; height: 28px; padding: 0; display: flex; align-items: center; justify-content: center; border-radius: 6px; }
.action-icon { font-size: 13px; }
.detail-btn { height: 28px; padding: 0 10px; border-radius: 6px; display: flex; align-items: center; gap: 4px; font-size: 12px; }
.disk-attrs-row { display: flex; gap: 16px; flex-wrap: wrap; }
.disk-attr { display: flex; align-items: center; gap: 4px; font-size: 12px; }
.attr-icon { font-size: 11px; color: #bfbfbf; }
.attr-label { color: #8c8c8c; }
.attr-value { color: #434343; font-weight: 500; }
.attr-value.serial { font-family: 'SF Mono', monospace; font-size: 11px; }
.disk-pools-row { display: flex; gap: 6px; flex-wrap: wrap; }
.disk-pool-tag { display: inline-flex; align-items: center; padding: 2px 8px; background: #f6ffed; border: 1px solid #b7eb8f; border-radius: 6px; font-size: 11px; color: #389e0d; }
.info-pools-empty { font-size: 11px; color: #bfbfbf; font-style: italic; }
.pool-empty-text { font-size: 11px; color: #bfbfbf; }
</style>
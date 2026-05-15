<script lang="ts" setup>
import { computed } from 'vue';
import { Card, Button } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import { formatSpeed } from '#/utils/format';
import type { NetworkConfig } from '#/api/system';

const props = defineProps<{
  network: NetworkConfig;
}>();

const emit = defineEmits<{
  config: [net: NetworkConfig];
  detail: [net: NetworkConfig];
}>();

const statusColor = computed(() => {
  switch (props.network.connectionStatus) {
    case '已连接': return 'var(--ict-success)';
    case '断开': return 'var(--ict-danger)';
    default: return 'var(--ict-warning)';
  }
});
</script>

<template>
  <Card class="disk-card" :bordered="true" :body-style="{ padding: '0' }">
    <div class="disk-card-inner">
      <div class="disk-visual" :style="{ background: `${statusColor}12` }">
        <div
          class="disk-icon-box"
          :style="{
            background: `${statusColor}18`,
            borderColor: `${statusColor}35`,
          }"
        >
          <IconifyIcon icon="lucide:network" class="disk-icon" :style="{ color: statusColor }" />
        </div>
        <div class="health-badge" :style="{ color: statusColor, background: `${statusColor}12`, borderColor: `${statusColor}28` }">
          <span class="health-dot-mini" :style="{ background: statusColor }" />
          {{ network.connectionStatus }}
        </div>
      </div>
      <div class="disk-info">
        <!-- 第一行：名称 + 速率 + 操作 -->
        <div class="info-header">
          <div class="info-header-left">
            <span class="disk-device-name">{{ network.name }}</span>
            <span class="disk-capacity" :style="{ background: `${statusColor}15`, color: statusColor }">
              {{ network.linkSpeed }}
            </span>
          </div>
          <div class="header-actions">
            <Button size="small" class="action-btn" @click="emit('config', network)">
              <IconifyIcon icon="lucide:settings" class="action-icon" />
            </Button>
            <Button size="small" type="primary" class="detail-btn" @click="emit('detail', network)">
              <IconifyIcon icon="lucide:file-text" style="font-size: var(--ict-mark-small);" />
              详情
            </Button>
          </div>
        </div>
        <!-- 第二行：实时带宽 -->
        <div class="net-bandwidth-row compact">
          <div class="bw-pill" style="background: var(--ict-primary-light);">
            <IconifyIcon icon="lucide:arrow-down" style="font-size: var(--ict-mark-small); color: var(--ict-primary);" />
            <span class="bw-pill-label">下载</span>
            <span class="bw-pill-value" style="color: var(--ict-primary);">{{ formatSpeed(network.downloadSpeed) }}</span>
          </div>
          <div class="bw-pill" style="background: var(--ict-success-light);">
            <IconifyIcon icon="lucide:arrow-up" style="font-size: var(--ict-mark-small); color: var(--ict-success);" />
            <span class="bw-pill-label">上传</span>
            <span class="bw-pill-value" style="color: var(--ict-success);">{{ formatSpeed(network.uploadSpeed) }}</span>
          </div>
        </div>
        <!-- 第三行：网络配置 + MAC -->
        <div class="net-config-row">
          <span class="net-config-item">
            <span class="net-config-label">IPv4</span>
            <span class="net-config-value">{{ network.ipv4Address }}</span>
          </span>
          <span class="net-config-divider" />
          <span class="net-config-item">
            <span class="net-config-label">掩码</span>
            <span class="net-config-value">{{ network.subnetMask }}</span>
          </span>
          <span class="net-config-divider" />
          <span class="net-config-item">
            <span class="net-config-label">网关</span>
            <span class="net-config-value">{{ network.gateway }}</span>
          </span>
          <span class="net-config-divider" />
          <span class="net-config-item">
            <span class="net-config-label">DNS</span>
            <span class="net-config-value">{{ network.dns }}</span>
          </span>
          <span class="net-config-divider" />
          <span class="net-config-item">
            <span class="net-config-label">MAC</span>
            <span class="net-config-value">{{ network.macAddress }}</span>
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
.disk-icon-box { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; border: 2px solid; }
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
.net-bandwidth-row { display: flex; gap: 8px; flex-wrap: wrap; }
.bw-pill { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 6px; font-size: var(--ict-mark-small); }
.bw-pill-label { color: var(--ict-text-secondary); }
.bw-pill-value { font-weight: 600; font-family: 'SF Mono', monospace; }
.net-config-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; font-size: var(--ict-body-small); }
.net-config-item { display: flex; align-items: center; gap: 4px; }
.net-config-label { color: var(--ict-text-secondary); }
.net-config-value { color: var(--ict-text-emphasis); font-weight: 500; font-family: 'SF Mono', monospace; font-size: var(--ict-mark-small); }
.net-config-divider { width: 1px; height: 12px; background: var(--ict-border); }
</style>
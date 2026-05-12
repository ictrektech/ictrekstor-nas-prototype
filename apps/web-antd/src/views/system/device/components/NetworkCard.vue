<script lang="ts" setup>
import { computed } from 'vue';
import { Card, Tag, Button } from 'ant-design-vue';
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
    case '已连接': return '#52c41a';
    case '断开': return '#ff4d4f';
    default: return '#faad14';
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
        <div class="disk-status-indicator" :style="{ background: statusColor }" />
      </div>
      <div class="disk-info">
        <!-- 第一行：名称 + MAC + 状态 + 操作 -->
        <div class="info-header">
          <div class="info-header-left">
            <span class="disk-device-name">{{ network.name }}</span>
            <span class="disk-capacity" :style="{ background: `${statusColor}15`, color: statusColor }">
              {{ network.macAddress }}
            </span>
            <Tag
              size="small"
              :style="{
                color: statusColor,
                borderColor: `${statusColor}50`,
                background: `${statusColor}10`,
              }"
            >
              <span class="health-dot-mini" :style="{ background: statusColor }" />
              {{ network.connectionStatus }}
            </Tag>
          </div>
          <div class="header-actions">
            <Button size="small" class="action-btn" @click="emit('config', network)">
              <IconifyIcon icon="lucide:settings" class="action-icon" />
            </Button>
            <Button size="small" type="primary" class="detail-btn" @click="emit('detail', network)">
              <IconifyIcon icon="lucide:file-text" style="font-size: 11px;" />
              详情
            </Button>
          </div>
        </div>
        <!-- 第二行：实时带宽 -->
        <div class="net-bandwidth-row compact">
          <div class="bw-pill" style="background: #e6f4ff;">
            <IconifyIcon icon="lucide:arrow-down" style="font-size: 11px; color: #1677ff;" />
            <span class="bw-pill-label">下载</span>
            <span class="bw-pill-value" style="color: #1677ff;">{{ formatSpeed(network.downloadSpeed) }}</span>
          </div>
          <div class="bw-pill" style="background: #f6ffed;">
            <IconifyIcon icon="lucide:arrow-up" style="font-size: 11px; color: #52c41a;" />
            <span class="bw-pill-label">上传</span>
            <span class="bw-pill-value" style="color: #52c41a;">{{ formatSpeed(network.uploadSpeed) }}</span>
          </div>
          <div class="bw-pill" style="background: #fff7e6;">
            <IconifyIcon icon="lucide:zap" style="font-size: 11px; color: #faad14;" />
            <span class="bw-pill-label">速率</span>
            <span class="bw-pill-value">{{ network.linkSpeed }}</span>
          </div>
        </div>
        <!-- 第三行：网络配置 -->
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
.disk-capacity { font-size: 12px; font-weight: 500; padding: 2px 8px; border-radius: 6px; }
.health-dot-mini { display: inline-block; width: 6px; height: 6px; border-radius: 50%; margin-right: 4px; }
.header-actions { display: flex; gap: 6px; }
.action-btn { width: 28px; height: 28px; padding: 0; display: flex; align-items: center; justify-content: center; border-radius: 6px; }
.action-icon { font-size: 13px; }
.detail-btn { height: 28px; padding: 0 10px; border-radius: 6px; display: flex; align-items: center; gap: 4px; font-size: 12px; }
.net-bandwidth-row { display: flex; gap: 8px; flex-wrap: wrap; }
.bw-pill { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 6px; font-size: 11px; }
.bw-pill-label { color: #595959; }
.bw-pill-value { font-weight: 600; font-family: 'SF Mono', monospace; }
.net-config-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; font-size: 12px; }
.net-config-item { display: flex; align-items: center; gap: 4px; }
.net-config-label { color: #8c8c8c; }
.net-config-value { color: #262626; font-weight: 500; font-family: 'SF Mono', monospace; font-size: 11px; }
.net-config-divider { width: 1px; height: 12px; background: #e8e8e8; }
</style>
<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  Card,
  Tag,
  Button,
  Descriptions,
} from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart } from 'echarts/charts';
import {
  TooltipComponent,
  LegendComponent,
  GridComponent,
  TitleComponent,
} from 'echarts/components';
import { getNetworkDetailApi, type NetworkDetail } from '#/api/system';

use([
  CanvasRenderer,
  LineChart,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  TitleComponent,
]);

const route = useRoute();
const router = useRouter();
const interfaceName = route.params.name as string;

const net = ref<NetworkDetail | null>(null);
const loading = ref(false);

// 加载网卡详情
async function loadNetwork() {
  loading.value = true;
  try {
    net.value = await getNetworkDetailApi(interfaceName);
  } finally {
    loading.value = false;
  }
}

// 返回设备管理页
function goBack() {
  router.push('/system/device');
}

// 状态颜色
function getStatusColor(status: string): string {
  switch (status) {
    case '已连接': return 'var(--ict-success)';
    case '断开': return 'var(--ict-danger)';
    default: return 'var(--ict-warning)';
  }
}

// 格式化速度为友好字符串
function formatSpeed(kbps: number): string {
  if (kbps >= 1024 * 1024) return `${(kbps / (1024 * 1024)).toFixed(2)} GB/s`;
  if (kbps >= 1024) return `${(kbps / 1024).toFixed(1)} MB/s`;
  return `${kbps.toFixed(0)} KB/s`;
}

// 格式化字节
function formatBytes(bytes: number): string {
  if (bytes >= 1024 ** 5) return `${(bytes / 1024 ** 5).toFixed(2)} PB`;
  if (bytes >= 1024 ** 4) return `${(bytes / 1024 ** 4).toFixed(2)} TB`;
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
  return `${(bytes / 1024).toFixed(2)} KB`;
}

// 带宽图表配置
const bandwidthOption = computed(() => {
  if (!net.value) return {};
  const times = net.value.history.map((h) => h.time);
  const downloads = net.value.history.map((h) => +(h.download / 1024).toFixed(2)); // KB/s → MB/s
  const uploads = net.value.history.map((h) => +(h.upload / 1024).toFixed(2));

  return {
    title: {
      text: '24小时带宽趋势',
      left: 'center',
      textStyle: { fontSize: 13, fontWeight: 'normal', color: 'var(--ict-text-emphasis)' },
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any[]) => {
        let html = `<div style="font-weight:600;margin-bottom:4px">${params[0].axisValue}</div>`;
        params.forEach((p) => {
          html += `<div style="display:flex;align-items:center;gap:6px">
            <span style="width:8px;height:8px;border-radius:50%;background:${p.color}"></span>
            <span>${p.seriesName}: ${p.value} MB/s</span>
          </div>`;
        });
        return html;
      },
    },
    legend: { bottom: 4, textStyle: { fontSize: 11 } },
    grid: { left: 55, right: 20, top: 40, bottom: 55 },
    xAxis: {
      type: 'category',
      data: times,
      axisLabel: { fontSize: 10, color: 'var(--ict-text-secondary)' },
      axisLine: { lineStyle: { color: 'var(--ict-border)' } },
    },
    yAxis: {
      type: 'value',
      name: 'MB/s',
      nameTextStyle: { fontSize: 10, color: 'var(--ict-text-secondary)' },
      axisLabel: { fontSize: 10, color: 'var(--ict-text-secondary)' },
      splitLine: { lineStyle: { color: 'var(--ict-border-light)' } },
    },
    series: [
      {
        name: '下载',
        type: 'line',
        data: downloads,
        smooth: true,
        areaStyle: { opacity: 0.12 },
        itemStyle: { color: 'var(--ict-primary)' },
        lineStyle: { width: 2 },
        symbol: 'none',
      },
      {
        name: '上传',
        type: 'line',
        data: uploads,
        smooth: true,
        areaStyle: { opacity: 0.12 },
        itemStyle: { color: 'var(--ict-success)' },
        lineStyle: { width: 2 },
        symbol: 'none',
      },
    ],
  };
});

onMounted(loadNetwork);
</script>

<template>
  <div class="network-detail" v-if="net">
    <!-- ═══════ 页面顶部概览 ═══════ -->
    <div class="page-header">
      <div class="page-header-left">
        <Button size="small" class="back-btn" @click="goBack">
          <IconifyIcon icon="lucide:arrow-left" style="font-size: var(--ict-mark-medium);" />
        </Button>
        <div
          class="page-icon-box"
          :style="{
            background: `${getStatusColor(net.connectionStatus)}15`,
            border: `1px solid ${getStatusColor(net.connectionStatus)}30`,
          }"
        >
          <IconifyIcon
            icon="lucide:network"
            style="font-size: var(--ict-title-large);"
            :style="{ color: getStatusColor(net.connectionStatus) }"
          />
        </div>
        <div class="page-title-area">
          <h1 class="page-title">{{ net.name }}</h1>
          <p class="page-desc">{{ net.macAddress }} · {{ net.connectionStatus }}</p>
        </div>
      </div>
      <div class="page-header-right">
        <div class="overview-card">
          <IconifyIcon icon="lucide:arrow-down" style="font-size: var(--ict-title-medium); color: var(--ict-primary);" />
          <div class="overview-info">
            <span class="overview-label">下载速度</span>
            <span class="overview-value" style="color: var(--ict-primary);">{{ formatSpeed(net.downloadSpeed) }}</span>
          </div>
        </div>
        <div class="overview-card">
          <IconifyIcon icon="lucide:arrow-up" style="font-size: var(--ict-title-medium); color: var(--ict-success);" />
          <div class="overview-info">
            <span class="overview-label">上传速度</span>
            <span class="overview-value" style="color: var(--ict-success);">{{ formatSpeed(net.uploadSpeed) }}</span>
          </div>
        </div>
        <div class="overview-card">
          <IconifyIcon icon="lucide:zap" style="font-size: var(--ict-title-medium); color: var(--ict-warning);" />
          <div class="overview-info">
            <span class="overview-label">协商速率</span>
            <span class="overview-value">{{ net.linkSpeed }}</span>
          </div>
        </div>
        <div class="overview-card">
          <IconifyIcon icon="lucide:git-compare" style="font-size: var(--ict-title-medium); color: var(--ict-info);" />
          <div class="overview-info">
            <span class="overview-label">双工模式</span>
            <span class="overview-value">{{ net.duplex }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════ 主体内容 ═══════ -->
    <div class="detail-body">
      <!-- 基本信息卡片 -->
      <Card class="info-card" :bordered="true" :body-style="{ padding: '20px' }">
        <div class="panel-title">
          <IconifyIcon icon="lucide:info" style="font-size: var(--ict-body-medium);" />
          网络配置
        </div>
        <Descriptions :column="3" size="small">
          <Descriptions.Item label="接口名称">{{ net.name }}</Descriptions.Item>
          <Descriptions.Item label="MAC 地址">{{ net.macAddress }}</Descriptions.Item>
          <Descriptions.Item label="连接状态">
            <Tag
              size="small"
              :style="{
                color: getStatusColor(net.connectionStatus),
                borderColor: `${getStatusColor(net.connectionStatus)}50`,
                background: `${getStatusColor(net.connectionStatus)}10`,
              }"
            >
              <span
                class="status-dot"
                :style="{ background: getStatusColor(net.connectionStatus) }"
              />
              {{ net.connectionStatus }}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="IPv4 地址">{{ net.ipv4Address }}</Descriptions.Item>
          <Descriptions.Item label="子网掩码">{{ net.subnetMask }}</Descriptions.Item>
          <Descriptions.Item label="默认网关">{{ net.gateway }}</Descriptions.Item>
          <Descriptions.Item label="DNS">{{ net.dns }}</Descriptions.Item>
          <Descriptions.Item label="MTU">{{ net.mtu }}</Descriptions.Item>
          <Descriptions.Item label="协商速率">{{ net.linkSpeed }}</Descriptions.Item>
          <Descriptions.Item label="双工模式">{{ net.duplex }}</Descriptions.Item>
          <Descriptions.Item label="网卡驱动">{{ net.driver }}</Descriptions.Item>
          <Descriptions.Item label="当前下载">{{ formatSpeed(net.downloadSpeed) }}</Descriptions.Item>
          <Descriptions.Item label="当前上传">{{ formatSpeed(net.uploadSpeed) }}</Descriptions.Item>
        </Descriptions>
      </Card>

      <!-- 流量统计卡片 -->
      <Card class="stats-card" :bordered="true" :body-style="{ padding: '16px' }">
        <div class="panel-title">
          <IconifyIcon icon="lucide:bar-chart-3" style="font-size: var(--ict-body-medium);" />
          流量统计
        </div>
        <div class="stats-grid">
          <div class="stat-cell" style="border-left-color: var(--ict-primary);">
            <span class="stat-label">今日下载</span>
            <span class="stat-value" style="color: var(--ict-primary);">{{ net.totalDownloadToday }} MB</span>
          </div>
          <div class="stat-cell" style="border-left-color: var(--ict-success);">
            <span class="stat-label">今日上传</span>
            <span class="stat-value" style="color: var(--ict-success);">{{ net.totalUploadToday }} MB</span>
          </div>
          <div class="stat-cell" style="border-left-color: var(--ict-info);">
            <span class="stat-label">总接收量</span>
            <span class="stat-value">{{ formatBytes(net.rxBytes) }}</span>
          </div>
          <div class="stat-cell" style="border-left-color: var(--ict-warning);">
            <span class="stat-label">总发送量</span>
            <span class="stat-value">{{ formatBytes(net.txBytes) }}</span>
          </div>
          <div class="stat-cell" style="border-left-color: var(--ict-danger);">
            <span class="stat-label">接收错误</span>
            <span class="stat-value" :style="{ color: net.rxErrors > 0 ? 'var(--ict-danger)' : 'var(--ict-success)' }">
              {{ net.rxErrors }}
            </span>
          </div>
          <div class="stat-cell" style="border-left-color: #eb2f96;">
            <span class="stat-label">发送错误</span>
            <span class="stat-value" :style="{ color: net.txErrors > 0 ? 'var(--ict-danger)' : 'var(--ict-success)' }">
              {{ net.txErrors }}
            </span>
          </div>
          <div class="stat-cell" style="border-left-color: var(--ict-text-secondary);">
            <span class="stat-label">丢弃包数</span>
            <span class="stat-value">{{ net.rxDropped }}</span>
          </div>
        </div>
      </Card>

      <!-- 带宽趋势图表 -->
      <Card class="chart-card" :bordered="true" :body-style="{ padding: '8px' }">
        <v-chart class="chart" :option="bandwidthOption" autoresize />
      </Card>
    </div>
  </div>
</template>

<style scoped>
.network-detail {
  padding: 0 16px 16px;
  width: 100%;
}

/* ===== 页面顶部概览 ===== */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: var(--ict-bg-card);
  gap: 16px;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.page-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-btn {
  font-size: var(--ict-body-small);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: 6px;
}

.page-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.page-title {
  font-size: var(--ict-title-medium);
  font-weight: 600;
  color: var(--ict-text-emphasis);
  margin: 0;
  line-height: 1.4;
}

.page-desc {
  font-size: var(--ict-body-small);
  color: var(--ict-text-secondary);
  margin: 2px 0 0;
}

.page-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.overview-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: var(--ict-bg-page);
  border-radius: 8px;
  min-width: 90px;
}

.overview-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.overview-label {
  font-size: var(--ict-mark-small);
  color: var(--ict-text-secondary);
}

.overview-value {
  font-size: var(--ict-title-medium);
  font-weight: 600;
  color: var(--ict-text-emphasis);
  font-family: var(--ict-font-family);
}

/* ===== 主体 ===== */
.detail-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 10px;
}

/* ===== 信息卡片 ===== */
.info-card {
  border-radius: 10px;
}

.panel-title {
  font-size: var(--ict-body-medium);
  font-weight: 600;
  color: var(--ict-text-emphasis);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 4px;
}

.info-card :deep(.ant-descriptions-item-label) {
  font-size: var(--ict-body-small);
  color: var(--ict-text-secondary);
  width: 80px;
}

.info-card :deep(.ant-descriptions-item-content) {
  font-size: var(--ict-mark-medium);
  font-weight: 500;
}

/* ===== 统计面板 ===== */
.stats-card {
  border-radius: 10px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
}

.stat-cell {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 8px 10px;
  background: var(--ict-bg-section);
  border-radius: 8px;
  border-left: 3px solid var(--ict-text-disabled);
}

.stat-label {
  font-size: var(--ict-mark-small);
  color: var(--ict-text-secondary);
}

.stat-value {
  font-size: var(--ict-body-medium);
  font-weight: 600;
  color: var(--ict-text-emphasis);
  font-family: var(--ict-font-family);
}

/* ===== 图表 ===== */
.chart-card {
  border-radius: 10px;
}

.chart {
  width: 100%;
  height: 320px;
}

/* 响应式 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>

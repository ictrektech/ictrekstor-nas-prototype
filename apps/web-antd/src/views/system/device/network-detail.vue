<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  Card,
  Tag,
  Descriptions,
} from 'ant-design-vue';
import { PageHeader, OverviewCard } from '#/components/ui-kit';
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

  // ECharts Canvas 不支持 CSS var()，必须用十六进制色值，与设计令牌保持一致
  const COLOR = { primary: '#006be6', success: '#00b42a' };
  const AXIS_COLORS = { text: '#64748b', line: '#e2e8f0' };

  /** 构造带 hover 强调 + 渐变填充的 line series */
  function lineSeries(name: string, data: number[], color: string) {
    return {
      name,
      type: 'line',
      data,
      smooth: true,
      showSymbol: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { width: 2, color },
      itemStyle: { color, borderWidth: 2, borderColor: '#fff' },
      emphasis: {
        scale: true,
        lineStyle: { width: 3 },
        itemStyle: { borderWidth: 2, shadowBlur: 4, shadowColor: color },
      },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: color + '4d' }, // ~30%
            { offset: 1, color: color + '0a' },
          ],
        },
      },
    };
  }

  return {
    title: {
      text: '24小时带宽趋势',
      left: 'center',
      textStyle: { fontSize: 13, fontWeight: 'normal', color: '#1e293b' },
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
    legend: { bottom: 4, textStyle: { fontSize: 11, color: AXIS_COLORS.text } },
    grid: { left: 55, right: 20, top: 40, bottom: 55 },
    xAxis: {
      type: 'category',
      data: times,
      axisLabel: { fontSize: 10, color: AXIS_COLORS.text },
      axisLine: { lineStyle: { color: AXIS_COLORS.line } },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      name: 'MB/s',
      nameTextStyle: { fontSize: 10, color: AXIS_COLORS.text },
      axisLabel: { fontSize: 10, color: AXIS_COLORS.text },
      splitLine: { lineStyle: { color: AXIS_COLORS.line, type: 'dashed' } },
    },
    series: [
      lineSeries('下载', downloads, COLOR.primary),
      lineSeries('上传', uploads, COLOR.success),
    ],
  };
});

onMounted(loadNetwork);
</script>

<template>
  <!-- 页面头部：标题 + 副标题 + 返回按钮 + 右侧概览卡片 -->
  <PageHeader
    v-if="net"
    :title="net.name"
    :subtitle="`${net.macAddress} · ${net.connectionStatus}`"
    back-label="设备管理"
    @back="goBack"
  >
    <template #extra>
      <OverviewCard
        icon="lucide:arrow-down"
        icon-color="var(--ict-primary)"
        icon-bg="var(--ict-primary-light)"
        label="下载速度"
        :value="formatSpeed(net.downloadSpeed)"
        value-color="var(--ict-primary)"
      />
      <OverviewCard
        icon="lucide:arrow-up"
        icon-color="var(--ict-success)"
        icon-bg="var(--ict-success-light)"
        label="上传速度"
        :value="formatSpeed(net.uploadSpeed)"
        value-color="var(--ict-success)"
      />
      <OverviewCard
        icon="lucide:zap"
        icon-color="var(--ict-warning)"
        icon-bg="var(--ict-warning-light)"
        label="协商速率"
        :value="net.linkSpeed"
      />
      <OverviewCard
        icon="lucide:git-compare"
        icon-color="var(--ict-info)"
        icon-bg="var(--ict-info-light)"
        label="双工模式"
        :value="net.duplex"
      />
    </template>
  </PageHeader>

  <!-- ═══════ 主体内容 ═══════ -->
  <div class="network-detail" v-if="net">
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
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>

<script lang="ts" setup>
import { computed } from 'vue';
import { usePreferences } from '@vben/preferences';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components';
import type { StoragePoolDetail } from '#/api/storage';

use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
]);

const props = defineProps<{
  poolDetail: StoragePoolDetail;
}>();

const { isDark } = usePreferences();
const chartAxisLineColor = computed(() => isDark.value ? 'rgba(255,255,255,0.1)' : '#e2e8f0');

const capacityPercent = computed(() => {
  const used = parseFloat(props.poolDetail.usedCapacity);
  const total = parseFloat(props.poolDetail.totalCapacity);
  return Math.round((used / total) * 100);
});

// ECharts Canvas 不支持 CSS var()，必须用十六进制色值，与设计令牌保持一致
const COLOR = {
  primary: '#006be6',
  success: '#00b42a',
  warning: '#faad14',
};

/** 构造带 hover 强调 + 渐变填充的 line series（与 MonitorCharts.vue 风格统一） */
function lineSeries(name: string, data: number[], color: string, withArea = false) {
  const s: any = {
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
  };
  if (withArea) {
    s.areaStyle = {
      color: {
        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: color + '4d' }, // ~30%
          { offset: 1, color: color + '0a' },
        ],
      },
    };
  }
  return s;
}

const capacityChartOption = computed(() => {
  const dates = props.poolDetail.capacityHistory.map((h) => h.date);
  return {
    tooltip: { trigger: 'axis' },
    legend: { data: ['已用容量', '可用容量'], bottom: 0, textStyle: { color: '#64748b' } },
    grid: { left: '3%', right: '4%', bottom: '10%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: dates, boundaryGap: false, axisLabel: { color: '#64748b' }, axisLine: { lineStyle: { color: chartAxisLineColor.value } } },
    yAxis: { type: 'value', name: 'GB', nameTextStyle: { color: '#64748b' }, axisLabel: { color: '#64748b' }, splitLine: { lineStyle: { color: chartAxisLineColor.value, type: 'dashed' } } },
    series: [
      lineSeries('已用容量', props.poolDetail.capacityHistory.map((h) => h.used), COLOR.primary, true),
      lineSeries('可用容量', props.poolDetail.capacityHistory.map((h) => h.available), COLOR.success, true),
    ],
  };
});

const iopsChartOption = computed(() => {
  const times = props.poolDetail.ioStats.map((s) => s.time);
  return {
    tooltip: { trigger: 'axis' },
    legend: { data: ['读 IOPS', '写 IOPS'], bottom: 0, textStyle: { color: '#64748b' } },
    grid: { left: '3%', right: '4%', bottom: '10%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: times, axisLabel: { color: '#64748b' }, axisLine: { lineStyle: { color: chartAxisLineColor.value } } },
    yAxis: { type: 'value', name: 'IOPS', nameTextStyle: { color: '#64748b' }, axisLabel: { color: '#64748b' }, splitLine: { lineStyle: { color: chartAxisLineColor.value, type: 'dashed' } } },
    series: [
      lineSeries('读 IOPS', props.poolDetail.ioStats.map((s) => s.readIops), COLOR.primary),
      lineSeries('写 IOPS', props.poolDetail.ioStats.map((s) => s.writeIops), COLOR.success),
    ],
  };
});

const bandwidthChartOption = computed(() => {
  const times = props.poolDetail.ioStats.map((s) => s.time);
  return {
    tooltip: { trigger: 'axis' },
    legend: { data: ['读带宽', '写带宽'], bottom: 0, textStyle: { color: '#64748b' } },
    grid: { left: '3%', right: '4%', bottom: '10%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: times, axisLabel: { color: '#64748b' }, axisLine: { lineStyle: { color: chartAxisLineColor.value } } },
    yAxis: { type: 'value', name: 'MB/s', nameTextStyle: { color: '#64748b' }, axisLabel: { color: '#64748b' }, splitLine: { lineStyle: { color: chartAxisLineColor.value, type: 'dashed' } } },
    series: [
      lineSeries('读带宽', props.poolDetail.ioStats.map((s) => s.readBandwidth), COLOR.primary),
      lineSeries('写带宽', props.poolDetail.ioStats.map((s) => s.writeBandwidth), COLOR.warning),
    ],
  };
});
</script>

<template>
  <div>
    <!-- 容量使用率 -->
    <div class="monitor-section">
      <div class="section-header">
        <h3 class="section-title">容量使用率</h3>
      </div>
      <div class="chart-wrapper">
        <VChart :option="capacityChartOption" style="height: 280px;" />
      </div>
    </div>

    <!-- IOPS -->
    <div class="monitor-section">
      <div class="section-header">
        <h3 class="section-title">IOPS</h3>
      </div>
      <div class="chart-wrapper">
        <VChart :option="iopsChartOption" style="height: 280px;" />
      </div>
    </div>

    <!-- 带宽 -->
    <div class="monitor-section">
      <div class="section-header">
        <h3 class="section-title">带宽</h3>
      </div>
      <div class="chart-wrapper">
        <VChart :option="bandwidthChartOption" style="height: 280px;" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.monitor-section { margin-bottom: 20px; }
.section-header { display: flex; align-items: center; gap: 6px; margin-bottom: 10px; }
.section-title { font-size: var(--ict-body-medium); font-weight: 600; color: var(--ict-text-emphasis); margin: 0; }
.chart-wrapper { background: var(--ict-bg-section); border-radius: 8px; padding: 12px 12px 32px; border: 1px solid var(--ict-border-light); }
</style>
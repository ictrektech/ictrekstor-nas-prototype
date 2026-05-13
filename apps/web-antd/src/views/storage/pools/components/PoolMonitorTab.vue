<script lang="ts" setup>
import { computed } from 'vue';
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

const capacityPercent = computed(() => {
  const used = parseFloat(props.poolDetail.usedCapacity);
  const total = parseFloat(props.poolDetail.totalCapacity);
  return Math.round((used / total) * 100);
});

const capacityChartOption = computed(() => {
  const dates = props.poolDetail.capacityHistory.map((h) => h.date);
  return {
    tooltip: { trigger: 'axis' },
    legend: { data: ['已用容量', '可用容量'], bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '10%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: dates, boundaryGap: false },
    yAxis: { type: 'value', name: 'GB' },
    series: [
      {
        name: '已用容量',
        type: 'line',
        data: props.poolDetail.capacityHistory.map((h) => h.used),
        smooth: true,
        areaStyle: { opacity: 0.3 },
        itemStyle: { color: '#1677ff' },
      },
      {
        name: '可用容量',
        type: 'line',
        data: props.poolDetail.capacityHistory.map((h) => h.available),
        smooth: true,
        areaStyle: { opacity: 0.3 },
        itemStyle: { color: '#52c41a' },
      },
    ],
  };
});

const iopsChartOption = computed(() => {
  const times = props.poolDetail.ioStats.map((s) => s.time);
  return {
    tooltip: { trigger: 'axis' },
    legend: { data: ['读 IOPS', '写 IOPS'], bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '10%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: times },
    yAxis: { type: 'value', name: 'IOPS' },
    series: [
      { name: '读 IOPS', type: 'line', data: props.poolDetail.ioStats.map((s) => s.readIops), smooth: true, itemStyle: { color: '#1677ff' } },
      { name: '写 IOPS', type: 'line', data: props.poolDetail.ioStats.map((s) => s.writeIops), smooth: true, itemStyle: { color: '#52c41a' } },
    ],
  };
});

const bandwidthChartOption = computed(() => {
  const times = props.poolDetail.ioStats.map((s) => s.time);
  return {
    tooltip: { trigger: 'axis' },
    legend: { data: ['读带宽', '写带宽'], bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '10%', top: '10%', containLabel: true },
    xAxis: { type: 'category', data: times },
    yAxis: { type: 'value', name: 'MB/s' },
    series: [
      { name: '读带宽', type: 'line', data: props.poolDetail.ioStats.map((s) => s.readBandwidth), smooth: true, itemStyle: { color: '#1677ff' } },
      { name: '写带宽', type: 'line', data: props.poolDetail.ioStats.map((s) => s.writeBandwidth), smooth: true, itemStyle: { color: '#faad14' } },
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
.section-title { font-size: 14px; font-weight: 600; color: #262626; margin: 0; }
.chart-wrapper { background: #fafafa; border-radius: 8px; padding: 12px 12px 32px; border: 1px solid #f0f0f0; }
</style>
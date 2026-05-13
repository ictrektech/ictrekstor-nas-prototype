<script lang="ts" setup>
import { computed } from 'vue';
import { Card } from 'ant-design-vue';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart, BarChart } from 'echarts/charts';
import {
  TooltipComponent,
  LegendComponent,
  GridComponent,
  TitleComponent,
  DataZoomComponent,
} from 'echarts/components';

use([
  CanvasRenderer,
  LineChart,
  BarChart,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  TitleComponent,
  DataZoomComponent,
]);

function genHourlyData(base: number, variance: number): number[] {
  return Array.from({ length: 24 }, (_, i) => {
    const hourFactor = Math.sin((i / 24) * Math.PI * 2) * 0.3 + 1;
    return Math.max(0, +(base * hourFactor + (Math.random() - 0.5) * variance).toFixed(2));
  });
}

const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

const writeBandwidthData = genHourlyData(45, 20);
const readBandwidthData = genHourlyData(30, 15);
const utilizationData = genHourlyData(35, 15).map(v => Math.min(100, v));
const writeIopsData = genHourlyData(120, 60);
const readIopsData = genHourlyData(80, 40);
const latencyData = genHourlyData(8, 5);
const queueData = genHourlyData(4, 2).map(v => Math.max(1, Math.round(v)));
const tempData = genHourlyData(36, 3);

function lineOption(title: string, yName: string, series: any[]) {
  return {
    title: { text: title, left: 'center', textStyle: { fontSize: 13, fontWeight: 'normal' } },
    tooltip: { trigger: 'axis' },
    legend: { bottom: 4, textStyle: { fontSize: 11 } },
    grid: { left: 55, right: 20, top: 40, bottom: 55 },
    xAxis: { type: 'category', data: hours, axisLabel: { fontSize: 10 } },
    yAxis: { type: 'value', name: yName, nameTextStyle: { fontSize: 10 }, axisLabel: { fontSize: 10 } },
    series,
  };
}

const bandwidthOption = computed(() =>
  lineOption('读写带宽', 'MB/s', [
    { name: '写入', type: 'line', data: writeBandwidthData, smooth: true, areaStyle: { opacity: 0.15 }, itemStyle: { color: '#1677ff' } },
    { name: '读取', type: 'line', data: readBandwidthData, smooth: true, areaStyle: { opacity: 0.15 }, itemStyle: { color: '#52c41a' } },
  ])
);

const utilizationOption = computed(() =>
  lineOption('磁盘占用率', '%', [
    { name: '占用率', type: 'line', data: utilizationData, smooth: true, areaStyle: { opacity: 0.2 }, itemStyle: { color: '#faad14' }, markLine: { data: [{ yAxis: 70, label: { formatter: '70%' }, lineStyle: { color: '#ff4d4f', type: 'dashed' } }] } },
  ])
);

const iopsOption = computed(() =>
  lineOption('IOPS', '次/秒', [
    { name: '写入 IOPS', type: 'line', data: writeIopsData, smooth: true, itemStyle: { color: '#1677ff' } },
    { name: '读取 IOPS', type: 'line', data: readIopsData, smooth: true, itemStyle: { color: '#52c41a' } },
  ])
);

const latencyOption = computed(() =>
  lineOption('时延', 'ms', [
    { name: '平均时延', type: 'line', data: latencyData, smooth: true, areaStyle: { opacity: 0.2 }, itemStyle: { color: '#722ed1' }, markLine: { data: [{ yAxis: 10, label: { formatter: '10ms' }, lineStyle: { color: '#ff4d4f', type: 'dashed' } }] } },
  ])
);

const queueOption = computed(() =>
  lineOption('队列深度', '', [
    { name: '队列深度', type: 'line', data: queueData, smooth: false, step: 'middle', itemStyle: { color: '#eb2f96' }, areaStyle: { opacity: 0.15 } },
  ])
);

const tempOption = computed(() =>
  lineOption('温度', '°C', [
    { name: '温度', type: 'line', data: tempData, smooth: true, itemStyle: { color: '#faad14' }, markLine: { data: [{ yAxis: 45, label: { formatter: '45°C' }, lineStyle: { color: '#ff4d4f', type: 'dashed' } }] }, areaStyle: { opacity: 0.1 } },
  ])
);
</script>

<template>
  <div class="charts-row">
    <Card class="chart-card" :bordered="true" :body-style="{ padding: '8px' }">
      <v-chart class="chart" :option="bandwidthOption" autoresize />
    </Card>
    <Card class="chart-card" :bordered="true" :body-style="{ padding: '8px' }">
      <v-chart class="chart" :option="utilizationOption" autoresize />
    </Card>
    <Card class="chart-card" :bordered="true" :body-style="{ padding: '8px' }">
      <v-chart class="chart" :option="iopsOption" autoresize />
    </Card>
    <Card class="chart-card" :bordered="true" :body-style="{ padding: '8px' }">
      <v-chart class="chart" :option="latencyOption" autoresize />
    </Card>
    <Card class="chart-card" :bordered="true" :body-style="{ padding: '8px' }">
      <v-chart class="chart" :option="queueOption" autoresize />
    </Card>
    <Card class="chart-card" :bordered="true" :body-style="{ padding: '8px' }">
      <v-chart class="chart" :option="tempOption" autoresize />
    </Card>
  </div>
</template>

<style scoped>
.charts-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(800px, 1fr));
  gap: 12px;
}

.chart-card {
  border-radius: 10px;
}

.chart {
  width: 100%;
  height: 320px;
}
</style>
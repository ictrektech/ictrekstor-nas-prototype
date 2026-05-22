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

/**
 * 生成带完整样式的折线图配置（解决 ECharts Canvas 不支持 CSS 变量问题）
 * 颜色与 SKILL.md 设计令牌保持视觉一致
 */
function lineOption(title: string, yName: string, series: any[]) {
  return {
    title: {
      text: title,
      left: 'center',
      textStyle: { fontSize: 13, fontWeight: 'normal', color: '#1e293b' },
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.95)',
      textStyle: { fontSize: 12 },
      axisPointer: { type: 'line', lineStyle: { color: 'rgba(0,107,230,0.3)' } },
    },
    legend: {
      bottom: 4,
      textStyle: { fontSize: 11, color: '#64748b' },
    },
    grid: { left: 55, right: 20, top: 40, bottom: 55 },
    xAxis: {
      type: 'category',
      data: hours,
      axisLabel: { fontSize: 10, color: '#64748b' },
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      name: yName,
      nameTextStyle: { fontSize: 10, color: '#64748b' },
      axisLabel: { fontSize: 10, color: '#64748b' },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#e2e8f0', type: 'dashed' } },
    },
    series,
  };
}

/**
 * 构造标准折线图 series（统一颜色、hover 强调、标记点样式）
 * ECharts Canvas 不支持 var(--ict-*)，必须用十六进制色值，与设计令牌保持一致
 */
function createLineSeries(name: string, data: number[], color: string, opts: {
  smooth?: boolean; step?: boolean;
  showArea?: boolean; markLine?: any;
  areaOpacity?: number;
} = {}) {
  const { smooth = true, step, showArea = false, markLine, areaOpacity = 0.12 } = opts;
  const s: any = {
    name,
    type: 'line' as const,
    data,
    smooth,
    showSymbol: true,
    symbol: 'circle',
    symbolSize: 6,
    // 线条 + 标记点统一颜色
    lineStyle: { width: 2, color },
    itemStyle: { color, borderWidth: 2, borderColor: '#fff' },
    // hover 强调：线变粗、点放大
    emphasis: {
      scale: true,
      lineStyle: { width: 3 },
      itemStyle: { borderWidth: 2, shadowBlur: 4, shadowColor: color },
    },
  };
  if (step !== undefined) { s.step = step; s.smooth = false; }
  if (showArea) {
    s.areaStyle = {
      // 渐变填充：lineColor → 透明
      color: {
        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: color + Math.round(areaOpacity * 255).toString(16).padStart(2, '0') },
          { offset: 1, color: color + '0a' },
        ],
      },
    };
  }
  if (markLine) { s.markLine = markLine; }
  return s;
}

// ↓ 色值与 SKILL.md 设计令牌保持一致（ECharts Canvas 不支持 CSS var()，必须用十六进制）
const COLOR = {
  primary: '#006be6',   // --ict-primary
  success: '#00b42a',   // --ict-success
  warning: '#faad14',   // --ict-warning
  info:    '#168cff',   // --ict-info
  danger:  '#f5222d',   // --ict-danger
  accent:  '#eb2f96',   // 队列深度专用 accent 色
};

// 1. 读写带宽（双曲线 + 渐变填充）
const bandwidthOption = computed(() =>
  lineOption('读写带宽', 'MB/s', [
    createLineSeries('写入', writeBandwidthData, COLOR.primary, { showArea: true }),
    createLineSeries('读取', readBandwidthData, COLOR.success, { showArea: true }),
  ])
);

// 2. 磁盘占用率（警告阈值线：70%）
const utilizationOption = computed(() =>
  lineOption('磁盘占用率', '%', [
    createLineSeries('占用率', utilizationData, COLOR.warning, {
      showArea: true,
      markLine: {
        data: [{
          yAxis: 70,
          label: { formatter: '70%', fontSize: 10, color: COLOR.danger },
          lineStyle: { color: COLOR.danger, type: 'dashed', width: 1.5 },
        }],
      },
    }),
  ])
);

// 3. IOPS（双曲线，无线形填充）
const iopsOption = computed(() =>
  lineOption('IOPS', '次/秒', [
    createLineSeries('写入 IOPS', writeIopsData, COLOR.primary),
    createLineSeries('读取 IOPS', readIopsData, COLOR.success),
  ])
);

// 4. 时延（警告阈值线：10ms）
const latencyOption = computed(() =>
  lineOption('时延', 'ms', [
    createLineSeries('平均时延', latencyData, COLOR.info, {
      showArea: true,
      markLine: {
        data: [{
          yAxis: 10,
          label: { formatter: '10ms', fontSize: 10, color: COLOR.danger },
          lineStyle: { color: COLOR.danger, type: 'dashed', width: 1.5 },
        }],
      },
    }),
  ])
);

// 5. 队列深度（阶梯折线 + accent 色填充）
const queueOption = computed(() =>
  lineOption('队列深度', '', [
    createLineSeries('队列深度', queueData, COLOR.accent, {
      step: 'middle',
      showArea: true,
      areaOpacity: 0.18,
    }),
  ])
);

// 6. 温度（警告阈值线：45°C）
const tempOption = computed(() =>
  lineOption('温度', '°C', [
    createLineSeries('温度', tempData, COLOR.warning, {
      showArea: true,
      markLine: {
        data: [{
          yAxis: 45,
          label: { formatter: '45°C', fontSize: 10, color: COLOR.danger },
          lineStyle: { color: COLOR.danger, type: 'dashed', width: 1.5 },
        }],
      },
    }),
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
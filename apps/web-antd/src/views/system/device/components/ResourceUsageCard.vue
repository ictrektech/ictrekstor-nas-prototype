<script lang="ts" setup>
import { computed } from 'vue';
import { Card } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent]);

const props = defineProps<{
  title: string;
  icon: string;
  iconBg: string;
  usagePercent: number;
  avgPercent: number;
  historyData: number[];
  specs: { label: string; value: string }[];
  colorTheme: string;
}>();

const xLabels = ['-60分', '-45分', '-30分', '-15分', '现在'];

// ECharts (Canvas) 无法解析 CSS 变量，需要把 var(--ict-xxx) 解析为具体色值
function resolveCssVar(value: string): string {
  if (!value) return value;
  const match = value.match(/var\(\s*(--[^,)\s]+)/);
  if (match && typeof document !== 'undefined') {
    const v = getComputedStyle(document.documentElement)
      .getPropertyValue(match[1])
      .trim();
    return v || value;
  }
  return value;
}

const resolvedColor = computed(() => resolveCssVar(props.colorTheme));

const chartOption = computed(() => ({
  color: [resolvedColor.value],
  grid: { left: 56, right: 8, top: 12, bottom: 36, containLabel: false },
  xAxis: {
    type: 'category',
    data: xLabels,
    boundaryGap: false,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { fontSize: 12, fontWeight: 400, color: '#64748b', margin: 16 },
  },
  yAxis: {
    type: 'value',
    min: 0,
    max: 100,
    interval: 20,
    splitLine: { lineStyle: { color: '#F0F0F0' } },
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { fontSize: 12, fontWeight: 400, color: '#64748b', margin: 14, formatter: '{value}%' },
  },
  tooltip: {
    trigger: 'axis',
    backgroundColor: '#ffffff',
    borderColor: '#F0F0F0',
    borderWidth: 1,
    padding: [6, 10],
    textStyle: { color: '#1e293b', fontSize: 12, fontWeight: 400 },
    extraCssText: 'box-shadow: 0 3px 14px 2px rgba(0,0,0,0.05), 0 8px 10px 1px rgba(0,0,0,0.06), 0 5px 5px -3px rgba(0,0,0,0.10); border-radius: 6px;',
    axisPointer: {
      type: 'line',
      lineStyle: { color: '#F0F0F0', width: 1, type: 'dashed' },
    },
    formatter: (params: any) => `${params[0].name}: ${params[0].value}%`,
  },
  series: [{
    type: 'line',
    data: props.historyData,
    smooth: true,
    symbol: 'circle',
    symbolSize: 6,
    showSymbol: false,
    emphasis: {
      focus: 'series',
      itemStyle: {
        color: resolvedColor.value,
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    },
    lineStyle: { color: resolvedColor.value, width: 2 },
    itemStyle: { color: resolvedColor.value },
    areaStyle: { color: resolvedColor.value, opacity: 0.1 },
  }],
}));
</script>

<template>
  <Card class="resource-card" :bordered="true" :body-style="{ padding: '12px' }">
    <div class="resource-header">
      <div class="resource-title-wrap">
        <span class="resource-title">{{ title }}</span>
        <div class="resource-specs">
          <span v-for="s in specs" :key="s.label" class="spec-tag">
            <span class="spec-label">{{ s.label }}</span>
            <span class="spec-value">{{ s.value }}</span>
          </span>
        </div>
      </div>
      <div class="resource-percent">
        <span class="percent-value" :style="{ color: colorTheme }">{{ usagePercent }}%</span>
        <span class="percent-label">当前使用率</span>
      </div>
    </div>

    <div class="chart-container">
      <VChart :option="chartOption" style="width: 100%; height: 160px;" autoresize />
      <div class="chart-avg">
        <span class="avg-dot" :style="{ background: colorTheme }" />
        <span class="avg-text">平均使用率 {{ avgPercent }}%</span>
      </div>
    </div>
  </Card>
</template>

<style scoped>
.resource-card { border-radius: 14px; }
.resource-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.resource-icon-box { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.resource-icon { font-size: var(--ict-title-large); color: var(--ict-bg-card); }
.resource-title-wrap { flex: 1; min-width: 0; }
.resource-title { font-size: var(--ict-body-medium); font-weight: 600; color: var(--ict-text-emphasis); }
.resource-specs { display: flex; gap: 8px; margin-top: 4px; flex-wrap: wrap; }
.spec-tag { display: flex; align-items: center; gap: 4px; font-size: var(--ict-mark-small); }
.spec-label { color: var(--ict-text-secondary); }
.spec-value { color: var(--ict-text-primary); font-weight: 500; }
.resource-percent { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
.percent-value { font-size: var(--ict-headline-small); font-weight: 700; font-family: 'SF Mono', monospace; }
.percent-label { font-size: var(--ict-body-small); color: var(--ict-text-secondary); }
.chart-container { position: relative; }
.chart-avg { display: flex; align-items: center; gap: 6px; margin-top: 2px; padding-left: 56px; }
.avg-dot { width: 6px; height: 6px; border-radius: 50%; }
.avg-text { font-size: var(--ict-body-small); color: var(--ict-text-secondary); }
</style>

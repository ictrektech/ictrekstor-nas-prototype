<script lang="ts" setup>
import { computed } from 'vue';
import { Card } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import { generateLinePath, generateAreaPath } from '#/utils/svgChart';

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

const CHART_CONFIG = { width: 400, height: 80, padding: { top: 8, right: 8, bottom: 20, left: 32 } };
const innerW = CHART_CONFIG.width - CHART_CONFIG.padding.left - CHART_CONFIG.padding.right;
const innerH = CHART_CONFIG.height - CHART_CONFIG.padding.top - CHART_CONFIG.padding.bottom;
const yTicks = [0, 25, 50, 75, 100];
const xLabels = ['-60分', '-45分', '-30分', '-15分', '现在'];

const linePath = computed(() => generateLinePath(props.historyData, innerW, innerH));
const areaPath = computed(() => generateAreaPath(props.historyData, innerW, innerH));
const areaColor = computed(() => `${props.colorTheme}18`);
const lineColor = computed(() => props.colorTheme);
</script>

<template>
  <Card class="resource-card" :bordered="true" :body-style="{ padding: '16px' }">
    <div class="resource-header">
      <div class="resource-icon-box" :style="{ background: iconBg }">
        <IconifyIcon :icon="icon" class="resource-icon" />
      </div>
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
      <svg :width="CHART_CONFIG.width" :height="CHART_CONFIG.height" class="usage-chart">
        <g :transform="`translate(${CHART_CONFIG.padding.left},${CHART_CONFIG.padding.top})`">
          <g v-for="(tick, i) in yTicks" :key="i" class="chart-grid">
            <line
              :x1="0" :y1="innerH - (tick / 100) * innerH"
              :x2="innerW" :y2="innerH - (tick / 100) * innerH"
              stroke="#f0f0f0" stroke-width="1"
            />
            <text
              :x="-6" :y="innerH - (tick / 100) * innerH + 3"
              text-anchor="end" font-size="9" fill="#bfbfbf"
            >{{ tick }}%</text>
          </g>
          <path :d="areaPath" :fill="areaColor" />
          <path :d="linePath" :stroke="lineColor" fill="none" stroke-width="2" stroke-linecap="round" />
          <g v-for="(label, i) in xLabels" :key="`x-${i}`">
            <text
              :x="(i / (xLabels.length - 1)) * innerW"
              :y="innerH + 14" text-anchor="middle" font-size="9" fill="#bfbfbf"
            >{{ label }}</text>
          </g>
        </g>
      </svg>
      <div class="chart-avg">
        <span class="avg-dot" :style="{ background: colorTheme }" />
        <span class="avg-text">平均使用率 {{ avgPercent }}%</span>
      </div>
    </div>
  </Card>
</template>

<style scoped>
.resource-card { margin-bottom: 16px; border-radius: 14px; }
.resource-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.resource-icon-box { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.resource-icon { font-size: 20px; color: #fff; }
.resource-title-wrap { flex: 1; min-width: 0; }
.resource-title { font-size: 14px; font-weight: 600; color: #262626; }
.resource-specs { display: flex; gap: 8px; margin-top: 4px; flex-wrap: wrap; }
.spec-tag { display: flex; align-items: center; gap: 4px; font-size: 11px; }
.spec-label { color: #8c8c8c; }
.spec-value { color: #434343; font-weight: 500; }
.resource-percent { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
.percent-value { font-size: 24px; font-weight: 700; font-family: 'SF Mono', monospace; }
.percent-label { font-size: 11px; color: #8c8c8c; }
.chart-container { position: relative; }
.usage-chart { width: 100%; height: auto; }
.chart-avg { display: flex; align-items: center; gap: 6px; margin-top: 8px; padding-left: 32px; }
.avg-dot { width: 6px; height: 6px; border-radius: 50%; }
.avg-text { font-size: 11px; color: #8c8c8c; }
</style>
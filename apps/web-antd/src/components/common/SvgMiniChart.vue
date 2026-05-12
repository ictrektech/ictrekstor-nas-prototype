<script lang="ts" setup>
import { computed } from 'vue';

interface Props {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  areaColor?: string;
  showAxes?: boolean;
  xLabels?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  width: 400,
  height: 80,
  color: '#1677ff',
  areaColor: 'rgba(22, 119, 255, 0.1)',
  showAxes: true,
  xLabels: () => ['-60分', '-45分', '-30分', '-15分', '现在'],
});

const padding = { top: 8, right: 8, bottom: 20, left: 32 };

const innerWidth = computed(() => props.width - padding.left - padding.right);
const innerHeight = computed(() => props.height - padding.top - padding.bottom);

// Y轴刻度（0%, 25%, 50%, 75%, 100%）
const yTicks = [0, 25, 50, 75, 100];

function generateLinePath(data: number[], w: number, h: number): string {
  const max = 100;
  const min = 0;
  const range = max - min;
  const stepX = w / (data.length - 1);
  return data
    .map((val, i) => {
      const x = i * stepX;
      const y = h - ((val - min) / range) * h;
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    })
    .join(' ');
}

function generateAreaPath(data: number[], w: number, h: number): string {
  const linePath = generateLinePath(data, w, h);
  return `${linePath} L${w},${h} L0,${h} Z`;
}

const linePath = computed(() => generateLinePath(props.data, innerWidth.value, innerHeight.value));
const areaPath = computed(() => generateAreaPath(props.data, innerWidth.value, innerHeight.value));
</script>

<template>
  <svg :width="width" :height="height" class="svg-mini-chart">
    <!-- 网格线 -->
    <g v-if="showAxes" class="grid-lines">
      <line
        v-for="tick in yTicks"
        :key="tick"
        :x1="padding.left"
        :y1="padding.top + innerHeight - (tick / 100) * innerHeight"
        :x2="padding.left + innerWidth"
        :y2="padding.top + innerHeight - (tick / 100) * innerHeight"
        stroke="#f0f0f0"
        stroke-width="1"
      />
    </g>

    <!-- 面积填充 -->
    <path
      :d="areaPath"
      :fill="areaColor"
      :transform="`translate(${padding.left}, ${padding.top})`"
    />

    <!-- 折线 -->
    <path
      :d="linePath"
      fill="none"
      :stroke="color"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      :transform="`translate(${padding.left}, ${padding.top})`"
    />

    <!-- Y轴标签 -->
    <g v-if="showAxes" class="y-labels">
      <text
        v-for="tick in [0, 50, 100]"
        :key="`y-${tick}`"
        :x="padding.left - 6"
        :y="padding.top + innerHeight - (tick / 100) * innerHeight + 3"
        text-anchor="end"
        font-size="10"
        fill="#999"
      >
        {{ tick }}%
      </text>
    </g>

    <!-- X轴标签 -->
    <g v-if="showAxes" class="x-labels">
      <text
        v-for="(label, i) in xLabels"
        :key="`x-${i}`"
        :x="padding.left + (innerWidth / (xLabels.length - 1)) * i"
        :y="height - 4"
        text-anchor="middle"
        font-size="10"
        fill="#999"
      >
        {{ label }}
      </text>
    </g>
  </svg>
</template>

<style scoped>
.svg-mini-chart {
  display: block;
}
</style>
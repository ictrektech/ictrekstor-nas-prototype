<script lang="ts" setup>
import { computed } from 'vue';
import { Card, Popover } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import { formatSpeed } from '#/utils/format';
import { Badge } from '#/components/ui-kit';
import type { NetworkConfig } from '#/api/system';

const props = defineProps<{
  network: NetworkConfig;
}>();

const emit = defineEmits<{
  config: [net: NetworkConfig];
  detail: [net: NetworkConfig];
}>();

const isConnected = computed(() => props.network.connectionStatus === '已连接');

/** 连接状态 Badge 语义 —— 遵循 SKILL.md §3.8 */
const statusBadgeType = computed<'success' | 'default'>(() =>
  isConnected.value ? 'success' : 'default',
);

/** 速率曲线 SVG path（平滑曲线 + 区域填充） */
const chartData = computed(() => {
  const raw = props.network.trafficHistory && props.network.trafficHistory.length > 0
    ? props.network.trafficHistory
    : [10, 20, 15, 25, 30, 28, 35, 32, 38, 40, 36, 42];
  const width = 100; // viewBox 宽（百分比）
  const height = 32; // viewBox 高
  const max = Math.max(...raw, 1);
  const min = Math.min(...raw, 0);
  const range = max - min || 1;
  const stepX = width / (raw.length - 1);
  const points = raw.map((v, i) => ({
    x: i * stepX,
    y: height - ((v - min) / range) * (height - 4) - 2,
  }));

  // 平滑曲线（Catmull-Rom → Cubic Bezier）
  let line = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    line += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  const area = `${line} L ${width} ${height} L 0 ${height} Z`;
  return { line, area, width, height };
});

function handleConfig() {
  emit('config', props.network);
}
function handleDetail() {
  emit('detail', props.network);
}
</script>

<template>
  <Card class="net-card" :bordered="true" :body-style="{ padding: '0' }">
    <div class="net-card-inner">
      <!-- 顶部：图标 + 名称 + ens 名 | 右侧：状态 + 操作菜单 -->
      <div class="net-header">
        <div class="net-header-left">
          <span class="net-icon-wrap">
            <IconifyIcon icon="lucide:plug-zap" class="net-icon" />
          </span>
          <span class="net-display-name">{{ network.displayName || network.name }}</span>
          <span class="net-divider-vertical" />
          <span class="net-alias">{{ network.name }}</span>
        </div>
        <div class="net-header-right">
          <!-- 全局 Badge —— 引用 ui-kit/Badge（SKILL.md §3.8） -->
          <Badge :text="network.connectionStatus" :type="statusBadgeType" />
          <Popover
            trigger="hover"
            placement="bottomRight"
            :overlay-class-name="'net-actions-popover'"
            :arrow="false"
          >
            <template #content>
              <div class="net-actions-menu">
                <button class="net-action-item" @click="handleConfig">
                  <IconifyIcon icon="lucide:square-pen" class="net-action-icon" />
                  <span>编辑</span>
                </button>
                <button class="net-action-item" @click="handleDetail">
                  <IconifyIcon icon="lucide:file-text" class="net-action-icon" />
                  <span>详情</span>
                </button>
              </div>
            </template>
            <button class="net-more-btn" type="button">
              <IconifyIcon icon="lucide:more-vertical" />
            </button>
          </Popover>
        </div>
      </div>

      <!-- 实时速率 + 趋势曲线 -->
      <div class="net-chart-section">
        <div class="net-chart-header">
          <span class="net-chart-label">实时速率</span>
          <div class="net-speed-group">
            <span class="net-speed-item">
              <IconifyIcon icon="lucide:arrow-up" class="net-speed-arrow" />
              <span class="net-speed-value">{{ formatSpeed(network.uploadSpeed) }}</span>
            </span>
            <span class="net-speed-item">
              <IconifyIcon icon="lucide:arrow-down" class="net-speed-arrow" />
              <span class="net-speed-value">{{ formatSpeed(network.downloadSpeed) }}</span>
            </span>
          </div>
        </div>
        <div class="net-chart-wrapper">
          <svg
            class="net-chart-svg"
            :viewBox="`0 0 ${chartData.width} ${chartData.height}`"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient :id="`grad-${network.name}`" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="var(--ict-primary)" stop-opacity="0.35" />
                <stop offset="100%" stop-color="var(--ict-primary)" stop-opacity="0" />
              </linearGradient>
            </defs>
            <path :d="chartData.area" :fill="`url(#grad-${network.name})`" />
            <path
              :d="chartData.line"
              fill="none"
              stroke="var(--ict-primary)"
              stroke-width="1.2"
              vector-effect="non-scaling-stroke"
            />
          </svg>
        </div>
      </div>

      <!-- 详情列表 -->
      <div class="net-detail-list">
        <div class="net-detail-row">
          <span class="net-detail-label">IP获取方式</span>
          <span class="net-detail-value">{{ network.ipMode || 'DHCP' }}</span>
        </div>
        <div class="net-detail-row">
          <span class="net-detail-label">IPv4地址</span>
          <span class="net-detail-value">{{ network.ipv4Address }}</span>
        </div>
        <div class="net-detail-row">
          <span class="net-detail-label">子网掩码</span>
          <span class="net-detail-value">{{ network.subnetMask }}</span>
        </div>
        <div class="net-detail-row">
          <span class="net-detail-label">网关地址</span>
          <span class="net-detail-value">{{ network.gateway }}</span>
        </div>
        <div class="net-detail-row">
          <span class="net-detail-label">DNS</span>
          <span class="net-detail-value">{{ network.dns }}</span>
        </div>
        <div class="net-detail-row">
          <span class="net-detail-label">MTU</span>
          <span class="net-detail-value">{{ network.mtu }}</span>
        </div>
      </div>
    </div>
  </Card>
</template>

<style scoped>
.net-card {
  border-radius: var(--ict-radius-lg);
  overflow: hidden;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.net-card-inner {
  display: flex;
  flex-direction: column;
  padding: var(--ict-space-4) var(--ict-space-5);
  gap: var(--ict-space-3);
}

/* ============== 顶部 Header ============== */
.net-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ict-space-3);
}
.net-header-left {
  display: flex;
  align-items: center;
  gap: var(--ict-space-2);
  min-width: 0;
}
.net-icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--ict-text-secondary);
}
.net-icon {
  font-size: 18px;
}
.net-display-name {
  font-size: var(--ict-title-small);
  font-weight: 600;
  color: var(--ict-text-emphasis);
  line-height: 1.4;
}
.net-divider-vertical {
  width: 1px;
  height: 12px;
  background: var(--ict-border);
  display: inline-block;
}
.net-alias {
  font-size: var(--ict-body-medium);
  color: var(--ict-text-secondary);
  font-family: "SF Mono", Menlo, Consolas, monospace;
}

.net-header-right {
  display: flex;
  align-items: center;
  gap: var(--ict-space-3);
  flex-shrink: 0;
}
/* ============== 三点菜单按钮 ============== */
.net-more-btn {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: var(--ict-radius-sm);
  color: var(--ict-text-secondary);
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.15s ease, color 0.15s ease;
  padding: 0;
}
.net-more-btn:hover {
  background: var(--ict-bg-section);
  color: var(--ict-text-emphasis);
}

/* ============== 实时速率 + 趋势图 ============== */
.net-chart-section {
  display: flex;
  flex-direction: column;
  gap: var(--ict-space-2);
}
.net-chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.net-chart-label {
  font-size: var(--ict-body-medium);
  color: var(--ict-text-secondary);
}
.net-speed-group {
  display: inline-flex;
  align-items: center;
  gap: var(--ict-space-3);
}
.net-speed-item {
  display: inline-flex;
  align-items: center;
  gap: var(--ict-space-1);
  font-size: var(--ict-body-medium);
}
.net-speed-arrow {
  font-size: 14px;
  color: var(--ict-text-secondary);
}
.net-speed-value {
  font-weight: 600;
  color: var(--ict-primary);
  font-family: "SF Mono", Menlo, Consolas, monospace;
}
.net-chart-wrapper {
  width: 100%;
  height: 64px;
}
.net-chart-svg {
  width: 100%;
  height: 100%;
  display: block;
}

/* ============== 详情列表 ============== */
.net-detail-list {
  display: flex;
  flex-direction: column;
  gap: var(--ict-space-2);
  padding-top: var(--ict-space-2);
}
.net-detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--ict-body-medium);
  line-height: 1.5;
}
.net-detail-label {
  color: var(--ict-text-secondary);
}
.net-detail-value {
  color: var(--ict-text-emphasis);
  font-weight: 500;
  font-family: "SF Mono", Menlo, Consolas, monospace;
}
</style>

<!-- 全局：Popover 内菜单样式（不能使用 scoped） -->
<style>
.net-actions-popover .ant-popover-inner {
  padding: 4px;
  border-radius: var(--ict-radius-md);
  box-shadow: var(--ict-shadow-2, 0 3px 14px 2px rgba(0, 0, 0, 0.05),
    0 8px 10px 1px rgba(0, 0, 0, 0.06),
    0 5px 5px -3px rgba(0, 0, 0, 0.1));
}
.net-actions-popover .ant-popover-inner-content {
  padding: 0;
}
.net-actions-menu {
  display: flex;
  flex-direction: column;
  min-width: 96px;
}
.net-action-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border: none;
  background: transparent;
  border-radius: 4px;
  font-size: 14px;
  color: var(--ict-text-primary);
  cursor: pointer;
  text-align: left;
  transition: background-color 0.15s ease, color 0.15s ease;
}
.net-action-item:hover {
  background: var(--ict-primary-light);
  color: var(--ict-primary);
}
.net-action-icon {
  font-size: 14px;
}
</style>

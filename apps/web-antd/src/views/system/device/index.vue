<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  Card,
  Tag,
  Button,
  Tooltip,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
} from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import {
  getDisksApi,
  getStoragePoolsApi,
  type DiskInfo,
  type StoragePool,
} from '#/api/storage';
import {
  getNetworksApi,
  updateNetworkApi,
  type NetworkConfig,
} from '#/api/system';
import {
  getDashboardSummaryApi,
  type DashboardSummary,
} from '#/api/dashboard';
import DeviceDiagram from './components/DeviceDiagram.vue';

const router = useRouter();
const disks = ref<DiskInfo[]>([]);
const pools = ref<StoragePool[]>([]);
const networks = ref<NetworkConfig[]>([]);
const summary = ref<DashboardSummary | null>(null);
const loading = ref(false);

const selectedDiagramDisk = ref<string>('');
const diagramRef = ref<InstanceType<typeof DeviceDiagram> | null>(null);

// ═══════ 网卡配置弹窗状态 ═══════
const configModalVisible = ref(false);
const configModalLoading = ref(false);
const editingNetwork = ref<NetworkConfig | null>(null);
const configFormRef = ref<InstanceType<typeof Form> | null>(null);
const configForm = ref({
  ipv4Address: '',
  subnetMask: '',
  gateway: '',
  dns: '',
  mtu: 1500,
});

// 打开网卡配置弹窗
function openConfigModal(net: NetworkConfig) {
  editingNetwork.value = net;
  configForm.value = {
    ipv4Address: net.ipv4Address,
    subnetMask: net.subnetMask,
    gateway: net.gateway,
    dns: net.dns,
    mtu: net.mtu,
  };
  configModalVisible.value = true;
}

// 保存网卡配置
async function saveConfig() {
  if (!editingNetwork.value) return;
  try {
    await configFormRef.value?.validate();
    configModalLoading.value = true;
    await updateNetworkApi(editingNetwork.value.name, configForm.value);
    const idx = networks.value.findIndex((n) => n.name === editingNetwork.value!.name);
    if (idx !== -1) {
      networks.value[idx] = { ...networks.value[idx], ...configForm.value };
    }
    message.success(`网卡 ${editingNetwork.value.name} 配置已更新`);
    configModalVisible.value = false;
  } catch {
    // 校验失败
  } finally {
    configModalLoading.value = false;
  }
}

// 跳转到网卡详情页
function goToNetworkDetail(net: NetworkConfig) {
  router.push(`/system/device/network/${net.name}`);
}

// 格式化速度为友好字符串
function formatSpeed(kbps: number): string {
  if (kbps >= 1024 * 1024) return `${(kbps / (1024 * 1024)).toFixed(2)} GB/s`;
  if (kbps >= 1024) return `${(kbps / 1024).toFixed(1)} MB/s`;
  return `${kbps.toFixed(0)} KB/s`;
}

async function loadData() {
  loading.value = true;
  try {
    const [disksRes, poolsRes, networksRes, summaryRes] = await Promise.all([
      getDisksApi(),
      getStoragePoolsApi(),
      getNetworksApi(),
      getDashboardSummaryApi(),
    ]);
    disks.value = disksRes;
    pools.value = poolsRes;
    networks.value = networksRes;
    summary.value = summaryRes;
  } finally {
    loading.value = false;
  }
}

function handleDiagramSelectDisk(disk: DiskInfo | null) {
  if (disk) {
    selectedDiagramDisk.value = disk.deviceName;
  } else {
    selectedDiagramDisk.value = '';
  }
}

function handleDiagramLocateDisk(deviceName: string) {
  selectedDiagramDisk.value = deviceName;
}

function locateDiskInDiagram(disk: DiskInfo) {
  selectedDiagramDisk.value = disk.deviceName;
  if (diagramRef.value) {
    diagramRef.value.highlightBay(disk.deviceName);
  }
  message.success(`已在示意图中定位磁盘 ${disk.deviceName}`);
}

function getDeviceIcon(deviceType?: string): string {
  if (deviceType?.includes('SSD')) return 'lucide:cpu';
  if (deviceType?.includes('NVMe')) return 'lucide:zap';
  return 'lucide:hard-drive';
}

function getDeviceIconColor(deviceType?: string): string {
  if (deviceType?.includes('SSD')) return '#722ed1';
  if (deviceType?.includes('NVMe')) return '#eb2f96';
  return '#1677ff';
}

function getStatusDot(status: string): string {
  switch (status) {
    case '运行中': return '#52c41a';
    case '休眠': return '#faad14';
    default: return '#bfbfbf';
  }
}

function getHealthBadgeColor(health?: string): string {
  switch (health) {
    case '正常': return '#52c41a';
    case '警告': return '#faad14';
    case '异常': return '#ff4d4f';
    default: return '#8c8c8c';
  }
}

function getNetworkStatusColor(status: string): string {
  switch (status) {
    case '已连接': return '#52c41a';
    case '断开': return '#ff4d4f';
    default: return '#faad14';
  }
}

function goToDiskDetail(disk: DiskInfo) {
  router.push(`/storage/disks/detail/${disk.deviceName}`);
}

function sleepDisk(disk: DiskInfo) {
  message.success(`硬盘 ${disk.deviceName} 已休眠`);
  disk.status = '休眠';
}

function blinkDisk(disk: DiskInfo) {
  message.success(`硬盘 ${disk.deviceName} 指示灯已切换`);
}

function copySerial(serial: string) {
  navigator.clipboard.writeText(serial);
  message.success('序列号已复制');
}

function parseCapacity(size?: string): number {
  if (!size) return 0;
  const match = size.match(/^(\d+(?:\.\d+)?)\s*(TB|GB|MB|PB)/i);
  if (!match) return 0;
  const val = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  const multipliers: Record<string, number> = {
    MB: 1024 ** 2,
    GB: 1024 ** 3,
    TB: 1024 ** 4,
    PB: 1024 ** 5,
  };
  return val * (multipliers[unit] || 0);
}

// 模拟折线图数据点（0-100）
const cpuHistory = [18, 22, 25, 20, 30, 28, 35, 32, 25, 22, 20, 23, 26, 29, 33, 31, 27, 24, 22, 25];
const memHistory = [40, 42, 45, 43, 48, 46, 50, 47, 44, 42, 41, 45, 47, 46, 48, 49, 47, 45, 44, 46];

// 图表配置（含坐标轴边距）
const CHART_CONFIG = {
  width: 400,
  height: 80,
  padding: { top: 8, right: 8, bottom: 20, left: 32 },
};

const chartInnerWidth = CHART_CONFIG.width - CHART_CONFIG.padding.left - CHART_CONFIG.padding.right;
const chartInnerHeight = CHART_CONFIG.height - CHART_CONFIG.padding.top - CHART_CONFIG.padding.bottom;

// Y轴刻度（0%, 25%, 50%, 75%, 100%）
const yTicks = [0, 25, 50, 75, 100];
// X轴时间刻度标签
const xLabels = ['-60分', '-45分', '-30分', '-15分', '现在'];

// 生成SVG折线路径（在inner区域内）
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

// 生成SVG面积路径（折线+底部闭合）
function generateAreaPath(data: number[], w: number, h: number): string {
  const linePath = generateLinePath(data, w, h);
  return `${linePath} L${w},${h} L0,${h} Z`;
}

onMounted(loadData);
</script>

<template>
  <div v-if="summary" class="device-manager">
    <!-- ═══════ 页面顶部（仅标题） ═══════ -->
    <div class="page-header">
      <div class="page-header-left">
        <div class="page-icon-box">
          <IconifyIcon icon="lucide:monitor" style="font-size: 20px; color: #1677ff;" />
        </div>
        <div class="page-title-area">
          <h1 class="page-title">设备管理</h1>
          <p class="page-desc">统一管理设备硬件，包括硬盘、网卡、CPU、内存等组件</p>
        </div>
      </div>
    </div>

    <!-- ═══════ 设备基本信息（整合硬件概览） ═══════ -->
    <div class="info-section">
      <div class="device-info-hero">
        <div class="device-info-main">
          <div class="device-avatar">
            <IconifyIcon icon="lucide:server" style="font-size: 28px; color: #1677ff;" />
          </div>
          <div class="device-meta">
            <h2 class="device-name">{{ summary.deviceName }}</h2>
            <div class="device-tags">
              <Tag size="small" color="blue">{{ summary.systemVersion }}</Tag>
              <Tag size="small" color="green">
                <IconifyIcon icon="lucide:clock" style="font-size: 10px;" />
                {{ summary.uptime }}
              </Tag>
            </div>
          </div>
        </div>
        <div class="device-info-chips">
          <div class="info-chip">
            <div class="chip-icon" style="background: #f9f0ff;">
              <IconifyIcon icon="lucide:cpu" style="font-size: 14px; color: #722ed1;" />
            </div>
            <div class="chip-text">
              <span class="chip-value">{{ summary.hardware.cpuCores }} 核</span>
              <span class="chip-label">CPU</span>
            </div>
          </div>
          <div class="info-chip">
            <div class="chip-icon" style="background: #e6f7ff;">
              <IconifyIcon icon="lucide:memory-stick" style="font-size: 14px; color: #1677ff;" />
            </div>
            <div class="chip-text">
              <span class="chip-value">{{ summary.hardware.memory }}</span>
              <span class="chip-label">内存</span>
            </div>
          </div>
          <div class="info-chip">
            <div class="chip-icon" style="background: #f6ffed;">
              <IconifyIcon icon="lucide:hard-drive" style="font-size: 14px; color: #52c41a;" />
            </div>
            <div class="chip-text">
              <span class="chip-value">{{ disks.length }} 块</span>
              <span class="chip-label">
                {{ (disks.reduce((sum, d) => sum + parseCapacity(d.size) / (1024 ** 4), 0)).toFixed(2) }} TB
              </span>
            </div>
          </div>
          <div class="info-chip">
            <div class="chip-icon" style="background: #fff7e6;">
              <IconifyIcon icon="lucide:hash" style="font-size: 14px; color: #fa8c16;" />
            </div>
            <div class="chip-text">
              <span class="chip-value mono">{{ summary.deviceId }}</span>
              <span class="chip-label">设备ID</span>
            </div>
          </div>
          <div class="info-chip">
            <div class="chip-icon" style="background: #fff0f6;">
              <IconifyIcon icon="lucide:link" style="font-size: 14px; color: #eb2f96;" />
            </div>
            <div class="chip-text">
              <a :href="summary.connectUrl" target="_blank" class="chip-link">远程连接</a>
              <span class="chip-label">VIVIBIT Connect</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════ 硬件示意图区（前后并排） ═══════ -->
    <div class="diagram-section">
      <div class="diagram-card">
        <div class="diagram-card-header">
          <div class="diagram-card-title">
            <IconifyIcon icon="lucide:server" style="font-size: 18px; color: #1677ff;" />
            <span>硬件示意图</span>
          </div>
        </div>
        <div class="diagram-panels">
          <div class="diagram-panel">
            <div class="diagram-panel-label">
              <IconifyIcon icon="lucide:square" style="font-size: 11px;" />
              前面板
            </div>
            <div class="diagram-panel-body">
              <DeviceDiagram
                ref="diagramRef"
                :disks="disks"
                :selected-disk-name="selectedDiagramDisk"
                mode="front"
                @select-disk="handleDiagramSelectDisk"
                @locate-disk="handleDiagramLocateDisk"
              />
            </div>
          </div>
          <div class="diagram-panel-divider" />
          <div class="diagram-panel">
            <div class="diagram-panel-label">
              <IconifyIcon icon="lucide:square-dot" style="font-size: 11px;" />
              后面板
            </div>
            <div class="diagram-panel-body">
              <DeviceDiagram
                :disks="disks"
                :selected-disk-name="selectedDiagramDisk"
                mode="rear"
                @select-disk="handleDiagramSelectDisk"
                @locate-disk="handleDiagramLocateDisk"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════ CPU / 内存大卡片（折线图 + 新布局） ═══════ -->
    <div class="resource-section">
      <div class="resource-grid">
        <!-- CPU 大卡片 -->
        <Card class="resource-card cpu-resource-card" :bordered="true">
          <div class="resource-card-inner">
            <div class="resource-top">
              <div class="resource-top-left">
                <div class="resource-icon-wrap" style="background: #f9f0ff;">
                  <IconifyIcon icon="lucide:cpu" style="font-size: 24px; color: #722ed1;" />
                </div>
                <div class="resource-title-group">
                  <div class="resource-title-row">
                    <span class="resource-title">处理器</span>
                    <Tag color="purple" size="small">运行中</Tag>
                  </div>
                  <div class="resource-specs">
                    <span class="spec-item">
                      <span class="spec-label">核心</span>
                      <span class="spec-value">{{ summary.hardware.cpuCores }}</span>
                    </span>
                    <span class="spec-divider" />
                    <span class="spec-item">
                      <span class="spec-label">线程</span>
                      <span class="spec-value">{{ summary.hardware.cpuThreads }}</span>
                    </span>
                  </div>
                </div>
              </div>
              <div class="resource-usage-big">
                <span class="usage-percent" style="color: #722ed1;">23%</span>
                <span class="usage-label">当前使用率</span>
              </div>
            </div>

            <div class="resource-chart">
              <div class="chart-header">
                <span class="chart-title">过去1小时使用率</span>
                <span class="chart-avg">平均 26%</span>
              </div>
              <div class="line-chart line-chart--with-axis">
                <svg :viewBox="`0 0 ${CHART_CONFIG.width} ${CHART_CONFIG.height}`" preserveAspectRatio="none" class="line-chart-svg">
                  <defs>
                    <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#722ed1" stop-opacity="0.25" />
                      <stop offset="100%" stop-color="#722ed1" stop-opacity="0.02" />
                    </linearGradient>
                  </defs>
                  <g v-for="tick in yTicks" :key="`cpu-y-${tick}`">
                    <line
                      :x1="CHART_CONFIG.padding.left"
                      :y1="CHART_CONFIG.padding.top + chartInnerHeight - (tick / 100) * chartInnerHeight"
                      :x2="CHART_CONFIG.padding.left + chartInnerWidth"
                      :y2="CHART_CONFIG.padding.top + chartInnerHeight - (tick / 100) * chartInnerHeight"
                      stroke="#f0f0f0"
                      stroke-width="1"
                    />
                    <text
                      :x="CHART_CONFIG.padding.left - 4"
                      :y="CHART_CONFIG.padding.top + chartInnerHeight - (tick / 100) * chartInnerHeight"
                      text-anchor="end"
                      dominant-baseline="middle"
                      font-size="9"
                      fill="#bfbfbf"
                    >{{ tick }}%</text>
                  </g>
                  <g v-for="(label, idx) in xLabels" :key="`cpu-x-${idx}`">
                    <text
                      :x="CHART_CONFIG.padding.left + (idx / (xLabels.length - 1)) * chartInnerWidth"
                      :y="CHART_CONFIG.height - 2"
                      text-anchor="middle"
                      dominant-baseline="bottom"
                      font-size="9"
                      fill="#bfbfbf"
                    >{{ label }}</text>
                  </g>
                  <path
                    :d="generateAreaPath(cpuHistory, chartInnerWidth, chartInnerHeight)"
                    fill="url(#cpuGradient)"
                    :transform="`translate(${CHART_CONFIG.padding.left}, ${CHART_CONFIG.padding.top})`"
                  />
                  <path
                    :d="generateLinePath(cpuHistory, chartInnerWidth, chartInnerHeight)"
                    fill="none"
                    stroke="#722ed1"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    :transform="`translate(${CHART_CONFIG.padding.left}, ${CHART_CONFIG.padding.top})`"
                  />
                </svg>
              </div>
            </div>
          </div>
        </Card>

        <!-- 内存大卡片 -->
        <Card class="resource-card mem-resource-card" :bordered="true">
          <div class="resource-card-inner">
            <div class="resource-top">
              <div class="resource-top-left">
                <div class="resource-icon-wrap" style="background: #e6f7ff;">
                  <IconifyIcon icon="lucide:memory-stick" style="font-size: 24px; color: #1677ff;" />
                </div>
                <div class="resource-title-group">
                  <div class="resource-title-row">
                    <span class="resource-title">运行内存</span>
                    <Tag color="blue" size="small">正常</Tag>
                  </div>
                  <div class="resource-specs">
                    <span class="spec-item">
                      <span class="spec-label">容量</span>
                      <span class="spec-value">{{ summary.hardware.memory }}</span>
                    </span>
                    <span class="spec-divider" />
                    <span class="spec-item">
                      <span class="spec-label">类型</span>
                      <span class="spec-value">DDR4 ECC</span>
                    </span>
                  </div>
                </div>
              </div>
              <div class="resource-usage-big">
                <span class="usage-percent" style="color: #1677ff;">45%</span>
                <span class="usage-label">当前使用率</span>
              </div>
            </div>

            <div class="resource-chart">
              <div class="chart-header">
                <span class="chart-title">过去1小时使用率</span>
                <span class="chart-avg">平均 45%</span>
              </div>
              <div class="line-chart line-chart--with-axis">
                <svg :viewBox="`0 0 ${CHART_CONFIG.width} ${CHART_CONFIG.height}`" preserveAspectRatio="none" class="line-chart-svg">
                  <defs>
                    <linearGradient id="memGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#1677ff" stop-opacity="0.25" />
                      <stop offset="100%" stop-color="#1677ff" stop-opacity="0.02" />
                    </linearGradient>
                  </defs>
                  <g v-for="tick in yTicks" :key="`mem-y-${tick}`">
                    <line
                      :x1="CHART_CONFIG.padding.left"
                      :y1="CHART_CONFIG.padding.top + chartInnerHeight - (tick / 100) * chartInnerHeight"
                      :x2="CHART_CONFIG.padding.left + chartInnerWidth"
                      :y2="CHART_CONFIG.padding.top + chartInnerHeight - (tick / 100) * chartInnerHeight"
                      stroke="#f0f0f0"
                      stroke-width="1"
                    />
                    <text
                      :x="CHART_CONFIG.padding.left - 4"
                      :y="CHART_CONFIG.padding.top + chartInnerHeight - (tick / 100) * chartInnerHeight"
                      text-anchor="end"
                      dominant-baseline="middle"
                      font-size="9"
                      fill="#bfbfbf"
                    >{{ tick }}%</text>
                  </g>
                  <g v-for="(label, idx) in xLabels" :key="`mem-x-${idx}`">
                    <text
                      :x="CHART_CONFIG.padding.left + (idx / (xLabels.length - 1)) * chartInnerWidth"
                      :y="CHART_CONFIG.height - 2"
                      text-anchor="middle"
                      dominant-baseline="bottom"
                      font-size="9"
                      fill="#bfbfbf"
                    >{{ label }}</text>
                  </g>
                  <path
                    :d="generateAreaPath(memHistory, chartInnerWidth, chartInnerHeight)"
                    fill="url(#memGradient)"
                    :transform="`translate(${CHART_CONFIG.padding.left}, ${CHART_CONFIG.padding.top})`"
                  />
                  <path
                    :d="generateLinePath(memHistory, chartInnerWidth, chartInnerHeight)"
                    fill="none"
                    stroke="#1677ff"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    :transform="`translate(${CHART_CONFIG.padding.left}, ${CHART_CONFIG.padding.top})`"
                  />
                </svg>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>

    <!-- ═══════ 硬盘列表 ═══════ -->
    <Card class="section-card" :bordered="true" :body-style="{ padding: 0 }">
      <template #title>
        <div class="section-title-bar">
          <div class="section-title-left">
            <IconifyIcon icon="lucide:hard-drive" style="font-size: 16px; color: #1677ff;" />
            <span class="section-title-text">硬盘列表</span>
            <Tag size="small" class="count-tag">{{ disks.length }} 块</Tag>
          </div>
        </div>
      </template>
      <div class="disk-grid">
        <Card
          v-for="disk in disks"
          :key="disk.deviceName"
          class="disk-card"
          :bordered="true"
          :body-style="{ padding: '0' }"
        >
          <div class="disk-card-inner">
            <div
              class="disk-visual"
              :style="{ background: `${getDeviceIconColor(disk.deviceType)}12` }"
            >
              <div
                class="disk-icon-box"
                :style="{
                  background: `${getDeviceIconColor(disk.deviceType)}18`,
                  borderColor: `${getDeviceIconColor(disk.deviceType)}35`,
                }"
              >
                <IconifyIcon
                  :icon="getDeviceIcon(disk.deviceType)"
                  class="disk-icon"
                  :style="{ color: getDeviceIconColor(disk.deviceType) }"
                />
              </div>
              <div
                class="disk-status-indicator"
                :style="{ background: getStatusDot(disk.status) }"
              />
            </div>
            <div class="disk-info">
              <div class="info-header">
                <div class="info-header-left">
                  <span class="disk-device-name">{{ disk.deviceName }}</span>
                  <span class="disk-capacity">{{ disk.size }}</span>
                  <Tag
                    v-if="disk.healthStatus"
                    class="health-tag-mini"
                    size="small"
                    :style="{
                      color: getHealthBadgeColor(disk.healthStatus),
                      borderColor: `${getHealthBadgeColor(disk.healthStatus)}50`,
                      background: `${getHealthBadgeColor(disk.healthStatus)}10`,
                    }"
                  >
                    <span
                      class="health-dot-mini"
                      :style="{ background: getHealthBadgeColor(disk.healthStatus) }"
                    />
                    {{ disk.healthStatus }}
                  </Tag>
                </div>
                <div class="header-actions">
                  <Tooltip title="定位">
                    <Button
                      size="small"
                      class="action-btn"
                      :class="{ 'locate-active': selectedDiagramDisk === disk.deviceName }"
                      @click="locateDiskInDiagram(disk)"
                    >
                      <IconifyIcon icon="lucide:crosshair" class="action-icon" />
                    </Button>
                  </Tooltip>
                  <Tooltip title="休眠硬盘">
                    <Button size="small" class="action-btn" @click="sleepDisk(disk)">
                      <IconifyIcon icon="lucide:moon" class="action-icon" />
                    </Button>
                  </Tooltip>
                  <Tooltip title="指示灯">
                    <Button size="small" class="action-btn" @click="blinkDisk(disk)">
                      <IconifyIcon icon="lucide:lightbulb" class="action-icon" />
                    </Button>
                  </Tooltip>
                  <Button
                    size="small"
                    type="primary"
                    class="detail-btn"
                    @click="goToDiskDetail(disk)"
                  >
                    <IconifyIcon icon="lucide:file-text" style="font-size: 11px;" />
                    详情
                  </Button>
                </div>
              </div>
              <div class="info-attrs">
                <div class="attr-pair">
                  <span class="attr-label">型号</span>
                  <span class="attr-value" :title="disk.model">{{ disk.model }}</span>
                </div>
                <div class="attr-pair">
                  <span class="attr-label">类型</span>
                  <span class="attr-value">{{ disk.deviceType || 'HDD' }}</span>
                </div>
                <div class="attr-pair">
                  <span class="attr-label">序列号</span>
                  <span class="attr-value serial-value">
                    {{ disk.serial }}
                    <Tooltip title="复制序列号">
                      <span class="copy-icon" @click="copySerial(disk.serial)">
                        <IconifyIcon icon="lucide:copy" style="font-size: 10px;" />
                      </span>
                    </Tooltip>
                  </span>
                </div>
              </div>
              <div v-if="disk.poolIds && disk.poolIds.length > 0" class="info-pools">
                <span class="pools-list">
                  <Tag
                    v-for="pid in disk.poolIds"
                    :key="pid"
                    color="blue"
                    class="pool-tag"
                    size="small"
                  >
                    <IconifyIcon icon="lucide:database" style="font-size: 10px; margin-right: 2px;" />
                    {{ pools.find((p) => p.id === pid)?.name || pid }}
                  </Tag>
                </span>
              </div>
              <div v-else class="info-pools-empty">
                <span class="pool-empty-text">未分配存储池</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Card>

    <!-- ═══════ 网卡列表 ═══════ -->
    <Card class="section-card" :bordered="true" :body-style="{ padding: '16px' }">
      <template #title>
        <div class="section-title-bar">
          <div class="section-title-left">
            <IconifyIcon icon="lucide:network" style="font-size: 16px; color: #fa8c16;" />
            <span class="section-title-text">网络接口</span>
            <Tag size="small" class="count-tag">{{ networks.length }} 个</Tag>
          </div>
        </div>
      </template>
      <div class="disk-grid">
        <Card
          v-for="net in networks"
          :key="net.name"
          class="disk-card"
          :bordered="true"
          :body-style="{ padding: '0' }"
        >
          <div class="disk-card-inner">
            <div
              class="disk-visual"
              :style="{ background: `${getNetworkStatusColor(net.connectionStatus)}12` }"
            >
              <div
                class="disk-icon-box"
                :style="{
                  background: `${getNetworkStatusColor(net.connectionStatus)}18`,
                  borderColor: `${getNetworkStatusColor(net.connectionStatus)}35`,
                }"
              >
                <IconifyIcon
                  icon="lucide:network"
                  class="disk-icon"
                  :style="{ color: getNetworkStatusColor(net.connectionStatus) }"
                />
              </div>
              <div
                class="disk-status-indicator"
                :style="{ background: getNetworkStatusColor(net.connectionStatus) }"
              />
            </div>
            <div class="disk-info">
              <!-- 第一行：名称 + MAC + 状态 + 操作 -->
              <div class="info-header">
                <div class="info-header-left">
                  <span class="disk-device-name">{{ net.name }}</span>
                  <span class="disk-capacity" :style="{ background: `${getNetworkStatusColor(net.connectionStatus)}15`, color: getNetworkStatusColor(net.connectionStatus) }">
                    {{ net.macAddress }}
                  </span>
                  <Tag
                    size="small"
                    :style="{
                      color: getNetworkStatusColor(net.connectionStatus),
                      borderColor: `${getNetworkStatusColor(net.connectionStatus)}50`,
                      background: `${getNetworkStatusColor(net.connectionStatus)}10`,
                    }"
                  >
                    <span
                      class="health-dot-mini"
                      :style="{ background: getNetworkStatusColor(net.connectionStatus) }"
                    />
                    {{ net.connectionStatus }}
                  </Tag>
                </div>
                <div class="header-actions">
                  <Button
                    size="small"
                    class="action-btn"
                    @click="openConfigModal(net)"
                  >
                    <IconifyIcon icon="lucide:settings" class="action-icon" />
                  </Button>
                  <Button
                    size="small"
                    type="primary"
                    class="detail-btn"
                    @click="goToNetworkDetail(net)"
                  >
                    <IconifyIcon icon="lucide:file-text" style="font-size: 11px;" />
                    详情
                  </Button>
                </div>
              </div>
              <!-- 第二行：实时带宽（紧凑布局） -->
              <div class="net-bandwidth-row compact">
                <div class="bw-pill" style="background: #e6f4ff;">
                  <IconifyIcon icon="lucide:arrow-down" style="font-size: 11px; color: #1677ff;" />
                  <span class="bw-pill-label">下载</span>
                  <span class="bw-pill-value" style="color: #1677ff;">{{ formatSpeed(net.downloadSpeed) }}</span>
                </div>
                <div class="bw-pill" style="background: #f6ffed;">
                  <IconifyIcon icon="lucide:arrow-up" style="font-size: 11px; color: #52c41a;" />
                  <span class="bw-pill-label">上传</span>
                  <span class="bw-pill-value" style="color: #52c41a;">{{ formatSpeed(net.uploadSpeed) }}</span>
                </div>
                <div class="bw-pill" style="background: #fff7e6;">
                  <IconifyIcon icon="lucide:zap" style="font-size: 11px; color: #faad14;" />
                  <span class="bw-pill-label">速率</span>
                  <span class="bw-pill-value">{{ net.linkSpeed }}</span>
                </div>
              </div>
              <!-- 第三行：网络配置（紧凑一行） -->
              <div class="net-config-row">
                <span class="net-config-item">
                  <span class="net-config-label">IPv4</span>
                  <span class="net-config-value">{{ net.ipv4Address }}</span>
                </span>
                <span class="net-config-divider" />
                <span class="net-config-item">
                  <span class="net-config-label">掩码</span>
                  <span class="net-config-value">{{ net.subnetMask }}</span>
                </span>
                <span class="net-config-divider" />
                <span class="net-config-item">
                  <span class="net-config-label">网关</span>
                  <span class="net-config-value">{{ net.gateway }}</span>
                </span>
                <span class="net-config-divider" />
                <span class="net-config-item">
                  <span class="net-config-label">DNS</span>
                  <span class="net-config-value">{{ net.dns }}</span>
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Card>

    <!-- ═══════ 网卡配置弹窗 ═══════ -->
    <Modal
      v-model:open="configModalVisible"
      :title="`配置网卡 - ${editingNetwork?.name || ''}`"
      width="480px"
      :confirm-loading="configModalLoading"
      @ok="saveConfig"
    >
      <Form
        ref="configFormRef"
        :model="configForm"
        layout="vertical"
        style="margin-top: 12px;"
      >
        <Form.Item
          label="IPv4 地址"
          name="ipv4Address"
          :rules="[{ required: true, message: '请输入 IPv4 地址' }]"
        >
          <Input v-model:value="configForm.ipv4Address" placeholder="如: 192.168.1.212" />
        </Form.Item>
        <Form.Item
          label="子网掩码"
          name="subnetMask"
          :rules="[{ required: true, message: '请输入子网掩码' }]"
        >
          <Input v-model:value="configForm.subnetMask" placeholder="如: 255.255.255.0" />
        </Form.Item>
        <Form.Item
          label="默认网关"
          name="gateway"
          :rules="[{ required: true, message: '请输入默认网关' }]"
        >
          <Input v-model:value="configForm.gateway" placeholder="如: 192.168.1.1" />
        </Form.Item>
        <Form.Item
          label="DNS 服务器"
          name="dns"
          :rules="[{ required: true, message: '请输入 DNS 服务器' }]"
        >
          <Input v-model:value="configForm.dns" placeholder="如: 8.8.8.8" />
        </Form.Item>
        <Form.Item
          label="MTU"
          name="mtu"
          :rules="[{ required: true, message: '请输入 MTU' }]"
        >
          <InputNumber v-model:value="configForm.mtu" :min="576" :max="9000" style="width: 100%;" />
        </Form.Item>
      </Form>
    </Modal>
  </div>
</template>

<style scoped>
.device-manager {
  padding: 0 20px 16px;
  width: 100%;
}

/* ===== 页面顶部（仅标题） ===== */
.page-header {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  background: #fff;
  gap: 16px;
  flex-shrink: 0;
  margin: 0 -20px 16px;
}

.page-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #e6f4ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.page-title {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  margin: 0;
  line-height: 1.4;
}

.page-desc {
  font-size: 12px;
  color: #8c8c8c;
  margin: 2px 0 0;
}

/* ===== 设备基本信息 Hero（整合硬件概览） ===== */
.info-section {
  margin-bottom: 16px;
}

.device-info-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: linear-gradient(135deg, #f0f5ff 0%, #e6f4ff 50%, #f6ffed 100%);
  border-radius: 14px;
  border: 1px solid #e8e8e8;
  gap: 20px;
  flex-wrap: wrap;
}

.device-info-main {
  display: flex;
  align-items: center;
  gap: 16px;
}

.device-avatar {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: #fff;
  border: 2px solid #bae0ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.12);
}

.device-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.device-name {
  font-size: 20px;
  font-weight: 700;
  color: #141414;
  margin: 0;
}

.device-tags {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

/* 硬件信息 Chips */
.device-info-chips {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.info-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #fff;
  border-radius: 10px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: all 0.3s;
}

.info-chip:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.chip-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.chip-text {
  display: flex;
  flex-direction: column;
  gap: 0px;
}

.chip-value {
  font-size: 13px;
  font-weight: 600;
  color: #262626;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.chip-value.mono {
  font-size: 12px;
}

.chip-label {
  font-size: 10px;
  color: #8c8c8c;
}

.chip-link {
  font-size: 12px;
  color: #1677ff;
  font-weight: 500;
}

/* ===== 硬件示意图区（并排） ===== */
.diagram-section {
  margin-bottom: 16px;
}

.diagram-card {
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e8e8e8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.diagram-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.diagram-card-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 600;
  color: #262626;
}

.diagram-panels {
  display: flex;
  align-items: stretch;
  justify-content: center;
  gap: 0;
  padding: 16px;
}

.diagram-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 400px;
}

.diagram-panel-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #595959;
  margin-bottom: 10px;
  padding: 4px 12px;
  background: #f5f5f5;
  border-radius: 16px;
}

.diagram-panel-body {
  display: flex;
  justify-content: center;
}

.diagram-panel-divider {
  width: 1px;
  background: linear-gradient(to bottom, transparent, #e0e0e0, transparent);
  margin: 20px 0;
  align-self: stretch;
}

/* ===== CPU/内存大卡片（新布局 + 折线图） ===== */
.resource-section {
  margin-bottom: 16px;
}

.resource-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.resource-card {
  border-radius: 14px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.resource-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.cpu-resource-card:hover {
  border-color: #722ed1;
}

.mem-resource-card:hover {
  border-color: #1677ff;
}

.resource-card-inner {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 卡片顶部：图标+标题+基本信息 + 使用率大数字 */
.resource-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.resource-top-left {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  min-width: 0;
}

.resource-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.resource-title-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.resource-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.resource-title {
  font-size: 16px;
  font-weight: 700;
  color: #141414;
}

/* 基本信息 specs（核心数/线程数等） */
.resource-specs {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.spec-item {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.spec-label {
  font-size: 11px;
  color: #8c8c8c;
}

.spec-value {
  font-size: 13px;
  font-weight: 600;
  color: #262626;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.spec-divider {
  width: 1px;
  height: 12px;
  background: #e0e0e0;
}

/* 使用率大数字 */
.resource-usage-big {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  flex-shrink: 0;
}

.usage-percent {
  font-size: 32px;
  font-weight: 700;
  font-family: 'SF Mono', 'Fira Code', monospace;
  line-height: 1;
}

.usage-label {
  font-size: 11px;
  color: #8c8c8c;
}

/* 折线图 */
.resource-chart {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chart-title {
  font-size: 12px;
  color: #8c8c8c;
}

.chart-avg {
  font-size: 11px;
  color: #bfbfbf;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.line-chart {
  width: 100%;
  height: 80px;
  background: #fafafa;
  border-radius: 8px;
  overflow: hidden;
  padding: 4px;
}

.line-chart--with-axis {
  height: 100px;
  padding: 2px 4px 2px 2px;
}

.line-chart-svg {
  width: 100%;
  height: 100%;
}

/* ===== 硬盘卡片网格 ===== */
.section-card {
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
}

.section-title-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title-text {
  font-size: 15px;
  font-weight: 600;
  color: #262626;
}

.count-tag {
  font-size: 11px;
  color: #8c8c8c;
  background: #f5f5f5;
  border-color: #e0e0e0;
}

.disk-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 12px;
  padding: 12px 16px;
}

.disk-card {
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  min-width: 0;
}

.disk-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: #1677ff;
}

.disk-card-inner {
  display: flex;
  align-items: stretch;
  height: 100%;
}

.disk-visual {
  width: 64px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 8px;
  gap: 8px;
  flex-shrink: 0;
  position: relative;
  margin-right: 10px;
}

.disk-icon-box {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid;
}

.disk-icon {
  font-size: 22px;
}

.disk-status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  box-shadow: 0 0 0 2px #fff;
}

.disk-info {
  flex: 1;
  padding: 12px 14px 12px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  justify-content: center;
}

.info-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.info-header-left {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  flex: 1;
}

.disk-device-name {
  font-size: 16px;
  font-weight: 700;
  color: #141414;
  font-family: 'SF Mono', 'Fira Code', monospace;
  line-height: 1;
  flex-shrink: 0;
  letter-spacing: 0.3px;
}

.disk-capacity {
  font-size: 11px;
  font-weight: 600;
  color: #1677ff;
  font-family: 'SF Mono', 'Fira Code', monospace;
  background: #e6f4ff;
  padding: 1px 6px;
  border-radius: 4px;
  flex-shrink: 0;
}

.health-tag-mini {
  font-size: 11px;
  border-radius: 4px;
  padding: 0 6px;
  line-height: 18px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.health-dot-mini {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.action-btn {
  width: 28px;
  height: 28px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  color: #8c8c8c;
}

.action-btn:hover {
  color: #1677ff;
  border-color: #1677ff;
}

.action-btn.locate-active {
  color: #faad14;
  border-color: #faad14;
  background: #fff7e6;
}

.action-icon {
  font-size: 13px;
}

.detail-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  height: 28px;
  padding: 0 10px;
  border-radius: 6px;
}

.info-attrs {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.attr-pair {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.attr-label {
  font-size: 11px;
  color: #8c8c8c;
  flex-shrink: 0;
}

.attr-value {
  font-size: 12px;
  color: #262626;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.serial-value {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 11px;
}

.copy-icon {
  cursor: pointer;
  color: #bfbfbf;
  transition: color 0.2s;
  display: inline-flex;
  align-items: center;
}

.copy-icon:hover {
  color: #1677ff;
}

.info-pools {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pools-list {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.pool-tag {
  font-size: 11px;
  padding: 0 6px;
  cursor: pointer;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
}

.pool-tag:hover {
  opacity: 0.85;
}

.info-pools-empty {
  display: flex;
  align-items: center;
}

.pool-empty-text {
  font-size: 11px;
  color: #bfbfbf;
  font-style: italic;
}

/* ===== 网卡带宽展示（紧凑Pill） ===== */
.net-bandwidth-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.bw-pill {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 16px;
  font-size: 12px;
}

.bw-pill-label {
  font-size: 11px;
  color: #8c8c8c;
}

.bw-pill-value {
  font-weight: 600;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

/* ===== 网卡配置行（紧凑单行） ===== */
.net-config-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 12px;
}

.net-config-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.net-config-label {
  font-size: 11px;
  color: #8c8c8c;
}

.net-config-value {
  color: #262626;
  font-weight: 500;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.net-config-divider {
  width: 1px;
  height: 10px;
  background: #e0e0e0;
}

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .device-info-hero {
    flex-direction: column;
    align-items: flex-start;
  }

  .device-info-chips {
    width: 100%;
  }

  .diagram-panels {
    flex-direction: column;
  }

  .diagram-panel-divider {
    width: 100%;
    height: 1px;
    margin: 10px 0;
  }

  .resource-grid {
    grid-template-columns: 1fr;
  }

  .resource-top {
    flex-direction: column;
    align-items: flex-start;
  }

  .resource-usage-big {
    align-items: flex-start;
  }

  .disk-grid {
    grid-template-columns: 1fr;
  }

  .network-grid {
    grid-template-columns: 1fr;
  }

  .net-bandwidth-row {
    gap: 8px;
  }

  .net-config-row {
    gap: 6px;
  }

  .net-config-divider {
    display: none;
  }
}
</style>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  Card,
  Tag,
  Button,
  Descriptions,
  Modal,
  Table,
} from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
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
import { getDisksApi, type DiskInfo } from '#/api/storage';

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

const route = useRoute();
const router = useRouter();
const deviceName = route.params.deviceName as string;

const disk = ref<DiskInfo | null>(null);
const loading = ref(false);
const smartModalVisible = ref(false);
const smartRawView = ref(false);

// SMART 弹窗表格列定义
const smartAttrColumns = [
  { title: 'ID', dataIndex: 'id', width: 50 },
  { title: '属性名', dataIndex: 'name', width: 160 },
  { title: 'FLAG', dataIndex: 'flag', width: 70 },
  { title: '当前值', dataIndex: 'value', width: 60, align: 'center' },
  { title: '最差值', dataIndex: 'worst', width: 60, align: 'center' },
  { title: '阈值', dataIndex: 'thresh', width: 60, align: 'center' },
  { title: '类型', dataIndex: 'type', width: 80 },
  { title: 'RAW_VALUE', dataIndex: 'rawValue', ellipsis: true },
];

// 解析 INFORMATION SECTION 键值对
const smartInfoSection = computed(() => {
  if (!disk.value?.smartctlInfo) return [];
  const raw = disk.value.smartctlInfo;
  const match = raw.match(/=== START OF INFORMATION SECTION ===([\s\S]*?)(?=== START OF READ SMART|$)/);
  if (!match) return [];
  return match[1].trim().split('\n')
    .map(line => {
      const m = line.match(/^([\w\s/()]+?):\s+(.*)$/);
      return m ? { label: m[1].trim(), value: m[2].trim() } : null;
    })
    .filter(Boolean) as { label: string; value: string }[];
});

// 解析 SMART Attributes 表格
const smartAttributes = computed(() => {
  if (!disk.value?.smartctlInfo) return [];
  const raw = disk.value.smartctlInfo;
  const match = raw.match(/Vendor Specific SMART Attributes with Thresholds:([\s\S]*?)(?=\n\s*\n\s*SMART Error Log|$)/);
  if (!match) return [];
  const lines = match[1].trim().split('\n');
  const data: any[] = [];
  for (const line of lines) {
    const m = line.match(/^\s*(\d+)\s+(\S+)\s+(\S+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(.*)$/);
    if (m) {
      data.push({
        id: m[1], name: m[2], flag: m[3],
        value: m[4], worst: m[5], thresh: m[6],
        type: m[7], updated: m[8], whenFailed: m[9], rawValue: m[10].trim(),
      });
    }
  }
  return data;
});

// 解析其他文本 section
const smartTextSections = computed(() => {
  if (!disk.value?.smartctlInfo) return [];
  const raw = disk.value.smartctlInfo;
  const sections: { title: string; content: string }[] = [];

  // 提取 READ SMART DATA SECTION 中 General SMART Values / capabilities 等（不含 Attributes 表格）
  const readSmartMatch = raw.match(/=== START OF READ SMART DATA SECTION ===([\s\S]*?)(?=Vendor Specific SMART Attributes|$)/);
  if (readSmartMatch) {
    const content = readSmartMatch[1].trim();
    if (content) {
      sections.push({ title: 'READ SMART DATA SECTION', content });
    }
  }

  // 提取 Error Log
  const errorLogMatch = raw.match(/(SMART Error Log[\s\S]*?)(?=SMART Self-test|$)/);
  if (errorLogMatch) {
    sections.push({ title: 'SMART Error Log', content: errorLogMatch[1].trim() });
  }

  // 提取 Self-test Log
  const selfTestMatch = raw.match(/(SMART Self-test log[\s\S]*?)(?=SMART Selective|$)/);
  if (selfTestMatch) {
    sections.push({ title: 'SMART Self-test Log', content: selfTestMatch[1].trim() });
  }

  // 提取 Selective self-test log
  const selectiveMatch = raw.match(/(SMART Selective self-test log[\s\S]*)/);
  if (selectiveMatch) {
    sections.push({ title: 'SMART Selective Self-test Log', content: selectiveMatch[1].trim() });
  }

  return sections;
});

// ===== 生成 24 小时监控数据 =====
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

// ===== SMART 解析 =====
interface SmartSummary {
  health: string;
  powerOnHours: number;
  powerCycleCount: number;
  reallocatedSectors: number;
  pendingSectors: number;
  uncorrectableSectors: number;
  temperature: number;
  totalLbasWritten: number;
  totalLbasRead: number;
  udmaCrcErrors: number;
  lastSelfTest: string;
}

function parseSmartInfo(raw?: string): SmartSummary | null {
  if (!raw) return null;

  const extractAttr = (id: number): number => {
    const pattern = new RegExp(
      `^\\s*${id}\\s+\\S+(?:\\s+\\S+){6}\\s+-\\s+([\\d,]+)`,
      'm'
    );
    const m = raw.match(pattern);
    return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
  };

  const healthMatch = raw.match(/SMART overall-health self-assessment test result:\s*(\w+)/);
  const health = healthMatch ? healthMatch[1] : '未知';

  const selfTestLine = raw.match(/^.*Short offline.*$/m);
  let lastSelfTest = '--';
  if (selfTestLine) {
    const nums = [...selfTestLine[0].matchAll(/\d+/g)].map(m => m[0]);
    const lifetime = nums.length >= 2 ? nums[nums.length - 1] : null;
    lastSelfTest = lifetime ? `${lifetime} 小时前` : '--';
  }

  return {
    health,
    powerOnHours: extractAttr(9),
    powerCycleCount: extractAttr(12),
    reallocatedSectors: extractAttr(5),
    pendingSectors: extractAttr(197),
    uncorrectableSectors: extractAttr(198),
    temperature: extractAttr(194),
    totalLbasWritten: extractAttr(241),
    totalLbasRead: extractAttr(242),
    udmaCrcErrors: extractAttr(199),
    lastSelfTest,
  };
}

const smartSummary = computed(() => parseSmartInfo(disk.value?.smartctlInfo));

function formatLba(lba: number): string {
  if (lba === 0) return '0';
  const tb = (lba * 512) / (1024 ** 4);
  if (tb >= 1) return `${tb.toFixed(2)} TB`;
  const gb = (lba * 512) / (1024 ** 3);
  if (gb >= 1) return `${gb.toFixed(2)} GB`;
  return `${lba}`;
}

// ===== 通用工具 =====
function getStatusColor(status: string): string {
  switch (status) {
    case '运行中': return 'success';
    case '休眠': return 'warning';
    default: return 'default';
  }
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

function getSmartHealthColor(health: string): string {
  if (health === 'PASSED') return '#52c41a';
  if (health === 'FAILED') return '#ff4d4f';
  return '#faad14';
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

function formatHours(hours?: number): string {
  if (!hours) return '--';
  const days = Math.floor(hours / 24);
  if (days > 365) return `${(days / 365).toFixed(1)}年`;
  return `${days}天`;
}

function getTempColor(temp?: number): string {
  if (!temp) return '#8c8c8c';
  if (temp < 40) return '#52c41a';
  if (temp < 50) return '#faad14';
  return '#ff4d4f';
}

async function loadDisk() {
  loading.value = true;
  try {
    const disks = await getDisksApi();
    disk.value = disks.find((d) => d.deviceName === deviceName) || null;
  } finally {
    loading.value = false;
  }
}

function goBack() {
  router.push('/storage/disks');
}

onMounted(loadDisk);
</script>

<template>
  <div class="disk-detail" v-if="disk">
    <!-- ═══════ 页面顶部概览 ═══════ -->
    <div class="page-header">
      <div class="page-header-left">
        <Button size="small" class="back-btn" @click="goBack">
          <IconifyIcon icon="lucide:arrow-left" style="font-size: 13px;" />
        </Button>
        <div
          class="page-icon-box"
          :style="{
            background: `${getDeviceIconColor(disk.deviceType)}15`,
            border: `1px solid ${getDeviceIconColor(disk.deviceType)}30`,
          }"
        >
          <IconifyIcon
            :icon="getDeviceIcon(disk.deviceType)"
            style="font-size: 20px;"
            :style="{ color: getDeviceIconColor(disk.deviceType) }"
          />
        </div>
        <div class="page-title-area">
          <h1 class="page-title">{{ disk.deviceName }}</h1>
          <p class="page-desc">{{ disk.model }} · {{ disk.usageStatus || disk.status }}</p>
        </div>
      </div>
      <div class="page-header-right">
        <div class="overview-card">
          <IconifyIcon icon="lucide:database" style="font-size: 16px; color: #1677ff;" />
          <div class="overview-info">
            <span class="overview-label">容量</span>
            <span class="overview-value">{{ disk.size }}</span>
          </div>
        </div>
        <div v-if="disk.temperature !== undefined" class="overview-card">
          <IconifyIcon icon="lucide:thermometer" style="font-size: 16px; color: #faad14;" />
          <div class="overview-info">
            <span class="overview-label">温度</span>
            <span class="overview-value" :style="{ color: getTempColor(disk.temperature) }">{{ disk.temperature }}°C</span>
          </div>
        </div>
        <div v-if="disk.usedHours" class="overview-card">
          <IconifyIcon icon="lucide:clock" style="font-size: 16px; color: #52c41a;" />
          <div class="overview-info">
            <span class="overview-label">使用时长</span>
            <span class="overview-value">{{ formatHours(disk.usedHours) }}</span>
          </div>
        </div>
        <div v-if="disk.partitions" class="overview-card">
          <IconifyIcon icon="lucide:folder-open" style="font-size: 16px; color: #722ed1;" />
          <div class="overview-info">
            <span class="overview-label">分区数</span>
            <span class="overview-value">{{ disk.partitions.length }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== 主体内容 ===== -->
    <div class="detail-body">
      <!-- 设备信息卡片 -->
      <Card class="info-card" :bordered="true" :body-style="{ padding: '20px' }">
        <!-- 设备信息区 -->
        <div class="device-info">
          <Descriptions :column="3" size="small">
            <Descriptions.Item label="设备名称">{{ disk.deviceName }}</Descriptions.Item>
            <Descriptions.Item label="设备路径">{{ disk.devicePath }}</Descriptions.Item>
            <Descriptions.Item label="型号">{{ disk.model }}</Descriptions.Item>
            <Descriptions.Item label="序列号">{{ disk.serial }}</Descriptions.Item>
            <Descriptions.Item label="容量">{{ disk.size }}</Descriptions.Item>
            <Descriptions.Item label="类型">{{ disk.deviceType }}</Descriptions.Item>
            <Descriptions.Item label="接口">{{ disk.interfaceType || 'SATA' }}</Descriptions.Item>
            <Descriptions.Item label="传输协议">{{ disk.transportType }}</Descriptions.Item>
            <Descriptions.Item label="子系统">{{ disk.subsystem }}</Descriptions.Item>
            <Descriptions.Item label="物理扇区">{{ disk.physicalSectorSize }} bytes</Descriptions.Item>
            <Descriptions.Item label="逻辑扇区">{{ disk.logicalSectorSize }} bytes</Descriptions.Item>
            <Descriptions.Item label="旋转设备">{{ disk.isRotational }}</Descriptions.Item>
            <Descriptions.Item label="热插拔">{{ disk.isHotpluggable }}</Descriptions.Item>
            <Descriptions.Item label="UUID">{{ disk.uuid }}</Descriptions.Item>
            <Descriptions.Item label="使用时长">{{ formatHours(disk.usedHours) }}</Descriptions.Item>
            <Descriptions.Item label="温度">{{ disk.temperature !== undefined ? `${disk.temperature}°C` : '--' }}</Descriptions.Item>
            <Descriptions.Item label="健康状态">{{ disk.healthStatus || '不支持检测' }}</Descriptions.Item>
            <Descriptions.Item label="使用状态">{{ disk.usageStatus || disk.status }}</Descriptions.Item>
          </Descriptions>
        </div>
      </Card>

      <!-- SMART 健康卡片 -->
      <Card class="smart-panel" :bordered="true" :body-style="{ padding: '16px' }">
        <div class="panel-title smart-title">
          <div class="smart-title-left">
            <IconifyIcon icon="lucide:activity" style="font-size: 14px;" />
            健康状态
          </div>
          <Button size="small" class="view-raw-btn" @click="smartModalVisible = true">
            <IconifyIcon icon="lucide:file-text" style="font-size: 11px;" />
            查看完整信息
          </Button>
        </div>

        <div v-if="smartSummary" class="smart-grid">
          <div class="smart-cell" :style="{ borderLeftColor: getSmartHealthColor(smartSummary.health) }">
            <span class="smart-cell-label">整体评估</span>
            <span class="smart-cell-value" :style="{ color: getSmartHealthColor(smartSummary.health) }">
              {{ smartSummary.health === 'PASSED' ? '通过' : smartSummary.health === 'FAILED' ? '失败' : smartSummary.health }}
            </span>
          </div>
          <div class="smart-cell">
            <span class="smart-cell-label">通电时间</span>
            <span class="smart-cell-value">{{ formatHours(smartSummary.powerOnHours) }}</span>
          </div>
          <div class="smart-cell">
            <span class="smart-cell-label">通电次数</span>
            <span class="smart-cell-value">{{ smartSummary.powerCycleCount }} 次</span>
          </div>
          <div class="smart-cell">
            <span class="smart-cell-label">重映射扇区</span>
            <span class="smart-cell-value" :style="{ color: smartSummary.reallocatedSectors > 0 ? '#ff4d4f' : '#52c41a' }">
              {{ smartSummary.reallocatedSectors }}
            </span>
          </div>
          <div class="smart-cell">
            <span class="smart-cell-label">待处理扇区</span>
            <span class="smart-cell-value" :style="{ color: smartSummary.pendingSectors > 0 ? '#ff4d4f' : '#52c41a' }">
              {{ smartSummary.pendingSectors }}
            </span>
          </div>
          <div class="smart-cell">
            <span class="smart-cell-label">不可修复扇区</span>
            <span class="smart-cell-value" :style="{ color: smartSummary.uncorrectableSectors > 0 ? '#ff4d4f' : '#52c41a' }">
              {{ smartSummary.uncorrectableSectors }}
            </span>
          </div>
          <div class="smart-cell">
            <span class="smart-cell-label">SMART 温度</span>
            <span class="smart-cell-value" :style="{ color: getTempColor(smartSummary.temperature) }">
              {{ smartSummary.temperature }}°C
            </span>
          </div>
          <div class="smart-cell">
            <span class="smart-cell-label">CRC 错误</span>
            <span class="smart-cell-value" :style="{ color: smartSummary.udmaCrcErrors > 0 ? '#ff4d4f' : '#52c41a' }">
              {{ smartSummary.udmaCrcErrors }}
            </span>
          </div>
          <div class="smart-cell">
            <span class="smart-cell-label">总写入量</span>
            <span class="smart-cell-value">{{ formatLba(smartSummary.totalLbasWritten) }}</span>
          </div>
          <div class="smart-cell">
            <span class="smart-cell-label">总读取量</span>
            <span class="smart-cell-value">{{ formatLba(smartSummary.totalLbasRead) }}</span>
          </div>
          <div class="smart-cell">
            <span class="smart-cell-label">上次自检</span>
            <span class="smart-cell-value">{{ smartSummary.lastSelfTest }}</span>
          </div>
        </div>

        <div v-else class="smart-empty">
          <IconifyIcon icon="lucide:activity" style="font-size: 32px; color: #d9d9d9;" />
          <span>暂无 SMART 信息</span>
        </div>
      </Card>

      <!-- 性能图表 -->
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
    </div>

    <!-- SMART 完整信息弹窗 -->
    <Modal
      v-model:open="smartModalVisible"
      title="健康状态"
      width="960px"
      :footer="null"
      class="smart-modal"
    >
      <div v-if="!smartRawView" class="smart-structured">
        <!-- INFORMATION SECTION -->
        <div v-if="smartInfoSection.length > 0" class="smart-section">
          <div class="smart-section-title">
            <IconifyIcon icon="lucide:info" style="font-size: 13px;" />
            设备信息 (INFORMATION SECTION)
          </div>
          <Descriptions :column="2" size="small" bordered>
            <Descriptions.Item v-for="item in smartInfoSection" :key="item.label" :label="item.label">
              {{ item.value }}
            </Descriptions.Item>
          </Descriptions>
        </div>

        <!-- SMART Attributes 表格 -->
        <div v-if="smartAttributes.length > 0" class="smart-section">
          <div class="smart-section-title">
            <IconifyIcon icon="lucide:table" style="font-size: 13px;" />
            SMART 属性 (Vendor Specific SMART Attributes with Thresholds)
          </div>
          <Table
            :columns="smartAttrColumns"
            :data-source="smartAttributes"
            size="small"
            :pagination="false"
            :scroll="{ x: 700, y: 400 }"
            row-key="id"
          />
        </div>

        <!-- 其他文本 Section -->
        <div v-for="section in smartTextSections" :key="section.title" class="smart-section">
          <div class="smart-section-title">
            <IconifyIcon icon="lucide:file-text" style="font-size: 13px;" />
            {{ section.title.replace('START OF ', '') }}
          </div>
          <pre class="smart-section-pre">{{ section.content }}</pre>
        </div>
      </div>

      <!-- 原始信息 -->
      <pre v-else class="smart-raw">{{ disk.smartctlInfo || '暂无 SMART 信息' }}</pre>

      <!-- 底部切换 -->
      <div class="smart-modal-footer">
        <Button size="small" @click="smartRawView = !smartRawView">
          <IconifyIcon :icon="smartRawView ? 'lucide:table' : 'lucide:terminal'" style="font-size: 12px;" />
          {{ smartRawView ? '查看结构化信息' : '查看原始信息' }}
        </Button>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
.disk-detail {
  padding: 0 16px 16px;
  width: 100%;
}

/* ===== 页面顶部概览 ===== */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: #fff;
  gap: 16px;
  flex-shrink: 0;
}

.page-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-btn {
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: 6px;
}

.page-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 10px;
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

.page-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.overview-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: #f5f5f5;
  border-radius: 8px;
  min-width: 90px;
}

.overview-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.overview-label {
  font-size: 11px;
  color: #8c8c8c;
}

.overview-value {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

/* ===== 主体 ===== */
.detail-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 10px;
}

/* ===== 设备信息卡片 ===== */
.info-card {
  border-radius: 10px;
}

/* 设备信息区（次） */
.device-info :deep(.ant-descriptions-item-label) {
  font-size: 12px;
  color: #8c8c8c;
  width: 80px;
}

.device-info :deep(.ant-descriptions-item-content) {
  font-size: 13px;
  font-weight: 500;
}

/* ===== SMART 面板 ===== */
.smart-panel {
  border-radius: 10px;
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.smart-title {
  justify-content: space-between;
}

.smart-title-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.view-raw-btn {
  font-size: 11px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  border-radius: 5px;
  padding: 0 8px;
  height: 26px;
}

.smart-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
}

.smart-cell {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 8px 10px;
  background: #fafafa;
  border-radius: 8px;
  border-left: 3px solid #d9d9d9;
}

.smart-cell-label {
  font-size: 11px;
  color: #8c8c8c;
}

.smart-cell-value {
  font-size: 14px;
  font-weight: 600;
  color: #262626;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.smart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px 0;
  color: #8c8c8c;
  font-size: 13px;
}

/* ===== 图表区域 ===== */
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

/* SMART 弹窗结构化内容 */
.smart-structured {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: 640px;
  overflow-y: auto;
  padding-right: 4px;
}

.smart-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.smart-section-title {
  font-size: 13px;
  font-weight: 600;
  color: #262626;
  display: flex;
  align-items: center;
  gap: 5px;
}

.smart-section-pre {
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  padding: 10px 12px;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 11px;
  line-height: 1.6;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
  color: #595959;
}

.smart-modal-footer {
  display: flex;
  justify-content: center;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  margin-top: 12px;
}

/* SMART 弹窗原始信息 */
.smart-raw {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 16px;
  border-radius: 6px;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 12px;
  line-height: 1.6;
  overflow-x: auto;
  max-height: 600px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 响应式 */
@media (max-width: 768px) {
  .device-hero {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-stats {
    width: 100%;
  }

  .smart-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>

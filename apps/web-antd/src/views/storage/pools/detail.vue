<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  Button,
  Card,
  Tabs,
  Tag,
  Table,
  Progress,
  Descriptions,
  Tooltip,
} from 'ant-design-vue';
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
import { IconifyIcon } from '@vben/icons';
import {
  getStoragePoolDetailApi,
  type StoragePoolDetail,
  type PoolLog,
} from '#/api/storage';

use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
]);

const route = useRoute();
const router = useRouter();
const poolId = computed(() => route.params.id as string);

const poolDetail = ref<StoragePoolDetail | null>(null);
const loading = ref(false);
const activeTab = ref('monitor');

// 处理 URL query 中的 tab 参数
watch(
  () => route.query.tab,
  (tab) => {
    if (tab && typeof tab === 'string') {
      activeTab.value = tab;
    }
  },
  { immediate: true },
);

async function loadData() {
  if (!poolId.value) return;
  loading.value = true;
  try {
    poolDetail.value = await getStoragePoolDetailApi(poolId.value);
  } finally {
    loading.value = false;
  }
}

function goToDisk(deviceName: string) {
  router.push('/storage/disks');
}

function goBack() {
  router.push('/storage/pools');
}

function getLogTagColor(level: PoolLog['level']): string {
  switch (level) {
    case 'info':
      return 'blue';
    case 'warning':
      return 'orange';
    case 'error':
      return 'red';
    default:
      return 'default';
  }
}

function getLogTagText(level: PoolLog['level']): string {
  switch (level) {
    case 'info':
      return '信息';
    case 'warning':
      return '警告';
    case 'error':
      return '错误';
    default:
      return level;
  }
}

function getCapacityColor(percent: number): string {
  if (percent >= 90) return '#ff4d4f';
  if (percent >= 70) return '#faad14';
  return '#1677ff';
}

const capacityPercent = computed(() => {
  if (!poolDetail.value) return 0;
  const used = parseFloat(poolDetail.value.usedCapacity);
  const total = parseFloat(poolDetail.value.totalCapacity);
  return Math.round((used / total) * 100);
});

// 容量趋势图
const capacityChartOption = computed(() => {
  if (!poolDetail.value?.capacityHistory) return {};
  const dates = poolDetail.value.capacityHistory.map((h) => h.date);
  return {
    tooltip: { trigger: 'axis' },
    legend: { data: ['已用容量'], bottom: 0, left: 'center' },
    grid: { left: 60, right: 40, top: 20, bottom: 50 },
    xAxis: { type: 'category', boundaryGap: false, data: dates },
    yAxis: { type: 'value', name: 'TB' },
    series: [
      {
        name: '已用容量',
        type: 'line',
        smooth: true,
        data: poolDetail.value.capacityHistory.map((s) => s.used),
        itemStyle: { color: '#1677ff' },
        areaStyle: { color: 'rgba(22, 119, 255, 0.15)' },
      },
    ],
  };
});

const iopsChartOption = computed(() => {
  if (!poolDetail.value?.ioStats) return {};
  const times = poolDetail.value.ioStats.map((s) => s.time);
  return {
    tooltip: { trigger: 'axis' },
    legend: { data: ['读', '写'], bottom: 0, left: 'center' },
    grid: { left: 60, right: 40, top: 20, bottom: 50 },
    xAxis: { type: 'category', boundaryGap: false, data: times },
    yAxis: { type: 'value', name: 'IOPS' },
    series: [
      {
        name: '读',
        type: 'line',
        smooth: true,
        data: poolDetail.value.ioStats.map((s) => s.readIops),
        itemStyle: { color: '#1677ff' },
        areaStyle: { color: 'rgba(22, 119, 255, 0.15)' },
      },
      {
        name: '写',
        type: 'line',
        smooth: true,
        data: poolDetail.value.ioStats.map((s) => s.writeIops),
        itemStyle: { color: '#52c41a' },
        areaStyle: { color: 'rgba(82, 196, 26, 0.15)' },
      },
    ],
  };
});

const bandwidthChartOption = computed(() => {
  if (!poolDetail.value?.ioStats) return {};
  const times = poolDetail.value.ioStats.map((s) => s.time);
  return {
    tooltip: { trigger: 'axis' },
    legend: { data: ['读', '写'], bottom: 0, left: 'center' },
    grid: { left: 60, right: 40, top: 20, bottom: 50 },
    xAxis: { type: 'category', boundaryGap: false, data: times },
    yAxis: { type: 'value', name: 'MB/s' },
    series: [
      {
        name: '读',
        type: 'line',
        smooth: true,
        data: poolDetail.value.ioStats.map((s) => s.readThroughput),
        itemStyle: { color: '#1677ff' },
        areaStyle: { color: 'rgba(22, 119, 255, 0.15)' },
      },
      {
        name: '写',
        type: 'line',
        smooth: true,
        data: poolDetail.value.ioStats.map((s) => s.writeThroughput),
        itemStyle: { color: '#52c41a' },
        areaStyle: { color: 'rgba(82, 196, 26, 0.15)' },
      },
    ],
  };
});

const logColumns = [
  { title: '时间', dataIndex: 'time', key: 'time', width: 180 },
  { title: '级别', dataIndex: 'level', key: 'level', width: 100, align: 'center' as const },
  { title: '消息', dataIndex: 'message', key: 'message' },
];

const diskColumns = [
  { title: '设备名', dataIndex: 'deviceName', key: 'deviceName', width: 100 },
  { title: '型号', dataIndex: 'model', key: 'model' },
  { title: '容量', dataIndex: 'size', key: 'size', width: 120 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 110, align: 'center' as const },
  { title: '健康状态', dataIndex: 'healthStatus', key: 'healthStatus', width: 120, align: 'center' as const },
  { title: '操作', key: 'action', width: 120, align: 'center' as const },
];

onMounted(loadData);
</script>

<template>
  <div class="pool-detail">
    <!-- ═══════ 页面顶部概览 ═══════ -->
    <div class="page-header">
      <div class="page-header-left">
        <Button size="small" class="back-btn" @click="goBack">
          <IconifyIcon icon="lucide:arrow-left" style="font-size: 13px;" />
        </Button>
        <div class="page-icon-box">
          <IconifyIcon icon="lucide:database" style="font-size: 20px; color: #1677ff;" />
        </div>
        <div class="page-title-area">
          <h1 class="page-title">{{ poolDetail?.name || '加载中...' }}</h1>
          <p class="page-desc">RAID {{ poolDetail?.raidType }} · {{ poolDetail?.diskCount }} 块硬盘 · {{ poolDetail?.status }}</p>
        </div>
      </div>
      <div class="page-header-right">
        <div class="overview-card">
          <IconifyIcon icon="lucide:hard-drive" style="font-size: 16px; color: #1677ff;" />
          <div class="overview-info">
            <span class="overview-label">总容量</span>
            <span class="overview-value">{{ poolDetail?.totalCapacity || '--' }}</span>
          </div>
        </div>
        <div class="overview-card">
          <IconifyIcon icon="lucide:database" style="font-size: 16px; color: #faad14;" />
          <div class="overview-info">
            <span class="overview-label">已用容量</span>
            <span class="overview-value">{{ poolDetail?.usedCapacity || '--' }}</span>
          </div>
        </div>
        <div class="overview-card">
          <IconifyIcon icon="lucide:circle-check" style="font-size: 16px; color: #52c41a;" />
          <div class="overview-info">
            <span class="overview-label">可用容量</span>
            <span class="overview-value">{{ (parseFloat(poolDetail?.totalCapacity || '0') - parseFloat(poolDetail?.usedCapacity || '0')).toFixed(2) }} TB</span>
          </div>
        </div>
        <div class="overview-card">
          <IconifyIcon icon="lucide:percent" style="font-size: 16px; color: #722ed1;" />
          <div class="overview-info">
            <span class="overview-label">使用率</span>
            <span class="overview-value" :style="{ color: getCapacityColor(capacityPercent) }">{{ capacityPercent }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab 内容 -->
    <Card
      class="pool-tabs-card"
      :bordered="true"
      :body-style="{ padding: '0' }"
    >
      <Tabs v-model:active-key="activeTab" class="pool-tabs">
        <!-- 监控 -->
        <Tabs.TabPane key="monitor">
          <template #tab>
            <span class="tab-label">
              <IconifyIcon icon="lucide:activity" style="font-size: 14px;" />
              监控
            </span>
          </template>
          <div class="tab-content">
            <!-- IOPS 曲线图 -->
            <div class="monitor-section">
              <div class="section-header">
                <IconifyIcon icon="lucide:gauge" style="font-size: 16px; color: #1677ff;" />
                <h3 class="section-title">存储池 IOPS</h3>
              </div>
              <div class="chart-wrapper">
                <VChart
                  v-if="poolDetail?.ioStats"
                  :option="iopsChartOption"
                  autoresize
                  style="height: 300px; width: 100%;"
                />
              </div>
            </div>

            <!-- 带宽曲线图 -->
            <div class="monitor-section">
              <div class="section-header">
                <IconifyIcon icon="lucide:network" style="font-size: 16px; color: #1677ff;" />
                <h3 class="section-title">存储池带宽</h3>
              </div>
              <div class="chart-wrapper">
                <VChart
                  v-if="poolDetail?.ioStats"
                  :option="bandwidthChartOption"
                  autoresize
                  style="height: 300px; width: 100%;"
                />
              </div>
            </div>
          </div>
        </Tabs.TabPane>

        <!-- 容量 -->
        <Tabs.TabPane key="capacity">
          <template #tab>
            <span class="tab-label">
              <IconifyIcon icon="lucide:pie-chart" style="font-size: 14px;" />
              容量
            </span>
          </template>
          <div class="tab-content">
            <!-- 容量趋势图 -->
            <div class="monitor-section">
              <div class="section-header">
                <IconifyIcon icon="lucide:trending-up" style="font-size: 16px; color: #1677ff;" />
                <h3 class="section-title">容量使用趋势</h3>
              </div>
              <div class="chart-wrapper">
                <VChart
                  v-if="poolDetail?.capacityHistory"
                  :option="capacityChartOption"
                  autoresize
                  style="height: 280px; width: 100%;"
                />
              </div>
            </div>

            <div class="capacity-detail">
              <div class="section-header">
                <IconifyIcon icon="lucide:info" style="font-size: 16px; color: #1677ff;" />
                <h3 class="section-title">容量明细</h3>
              </div>
              <Descriptions :column="2" bordered>
                <Descriptions.Item label="总容量">
                  {{ poolDetail?.totalCapacity }}
                </Descriptions.Item>
                <Descriptions.Item label="已用容量">
                  {{ poolDetail?.usedCapacity }}
                </Descriptions.Item>
                <Descriptions.Item label="可用容量">
                  {{ (parseFloat(poolDetail?.totalCapacity || '0') - parseFloat(poolDetail?.usedCapacity || '0')).toFixed(2) }} TB
                </Descriptions.Item>
                <Descriptions.Item label="使用率">
                  <span :style="{ color: getCapacityColor(capacityPercent), fontWeight: 600 }">
                    {{ capacityPercent }}%
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="RAID 类型">
                  {{ poolDetail?.raidType }}
                </Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Tag :color="poolDetail?.status === '正常' ? 'success' : 'error'" size="small">
                    {{ poolDetail?.status }}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </div>
          </div>
        </Tabs.TabPane>

        <!-- 硬盘 -->
        <Tabs.TabPane key="disks">
          <template #tab>
            <span class="tab-label">
              <IconifyIcon icon="lucide:hard-drive" style="font-size: 14px;" />
              硬盘
            </span>
          </template>
          <div class="tab-content disk-tab-content">
            <div class="section-header">
              <IconifyIcon icon="lucide:disc-3" style="font-size: 16px; color: #1677ff;" />
              <h3 class="section-title">所属硬盘 ({{ poolDetail?.disks?.length || 0 }})</h3>
            </div>
            <Table
              class="disk-table"
              :columns="diskColumns"
              :data-source="poolDetail?.disks"
              :loading="loading"
              row-key="deviceName"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'status'">
                  <Tag :color="record.status === '运行中' ? 'success' : 'warning'" size="small">
                    <span
                      class="status-dot"
                      :style="{ background: record.status === '运行中' ? '#52c41a' : '#faad14' }"
                    />
                    {{ record.status }}
                  </Tag>
                </template>
                <template v-if="column.key === 'healthStatus'">
                  <Tag :color="record.healthStatus === '正常' ? 'success' : 'error'" size="small">
                    {{ record.healthStatus || '未知' }}
                  </Tag>
                </template>
                <template v-if="column.key === 'action'">
                  <Button
                    size="small"
                    class="action-btn"
                    @click="goToDisk(record.deviceName)"
                  >
                    <IconifyIcon icon="lucide:eye" style="font-size: 11px;" />
                    查看
                  </Button>
                </template>
              </template>
            </Table>
          </div>
        </Tabs.TabPane>

        <!-- 日志 -->
        <Tabs.TabPane key="logs">
          <template #tab>
            <span class="tab-label">
              <IconifyIcon icon="lucide:file-text" style="font-size: 14px;" />
              日志
            </span>
          </template>
          <div class="tab-content">
            <div class="section-header">
              <IconifyIcon icon="lucide:scroll-text" style="font-size: 16px; color: #1677ff;" />
              <h3 class="section-title">操作日志</h3>
            </div>
            <Table
              :columns="logColumns"
              :data-source="poolDetail?.logs"
              :loading="loading"
              row-key="id"
              :pagination="{ pageSize: 10 }"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'level'">
                  <Tag :color="getLogTagColor(record.level)" size="small">
                    <span
                      class="status-dot"
                      :style="{
                        background: record.level === 'info' ? '#1677ff'
                          : record.level === 'warning' ? '#faad14' : '#ff4d4f'
                      }"
                    />
                    {{ getLogTagText(record.level) }}
                  </Tag>
                </template>
              </template>
            </Table>
          </div>
        </Tabs.TabPane>
      </Tabs>
    </Card>
  </div>
</template>

<style scoped>
.pool-detail {
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

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}

/* Tab 卡片 */
.pool-tabs-card {
  border-radius: 10px;
  overflow: hidden;
}

.pool-tabs :deep(.ant-tabs-nav) {
  padding: 0 16px;
  margin-bottom: 0;
  border-bottom: 1px solid #f0f0f0;
}

.tab-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.tab-content {
  padding: 16px;
}

/* 区块标题 */
.section-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #262626;
  margin: 0;
}

/* 监控页 */
.monitor-section {
  margin-bottom: 20px;
}

.chart-wrapper {
  background: #fafafa;
  border-radius: 8px;
  padding: 12px 12px 32px;
  border: 1px solid #f0f0f0;
}

/* 硬盘页 */
.disk-tab-content {
  padding: 12px 16px 20px;
}

.disk-table :deep(.ant-table) {
  border-radius: 8px;
  overflow: hidden;
}

.disk-table :deep(.ant-table-thead > tr > th) {
  background: #fafafa;
  font-weight: 600;
}

.disk-table :deep(.ant-table-tbody > tr) {
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.disk-table :deep(.ant-table-tbody > tr:hover > td) {
  background: #f0f7ff;
}

.disk-table :deep(.ant-table-tbody > tr:hover) {
  border-left-color: #1677ff;
}

/* 容量页 */
.capacity-detail {
  margin-top: 16px;
}

/* 操作按钮 */
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  border-radius: 6px;
}

/* 响应式 */
@media (max-width: 1200px) {
  .pool-capacity-bar {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .capacity-stat-item {
    border-right: none;
    padding: 0;
  }
}

@media (max-width: 768px) {
  .pool-detail {
    padding: 0 12px 12px;
  }

  .pool-header-main {
    flex-direction: column;
    align-items: flex-start;
  }

  .pool-meta-row {
    flex-wrap: wrap;
    gap: 8px;
  }

  .pool-capacity-bar {
    grid-template-columns: 1fr;
  }
}
</style>

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
    <!-- 返回按钮 -->
    <div class="back-bar">
      <Button type="link" class="back-btn" @click="goBack">
        <IconifyIcon icon="lucide:arrow-left" style="font-size: 14px;" />
        返回存储池列表
      </Button>
    </div>

    <!-- 存储池头部概览卡片 -->
    <Card
      class="pool-header-card"
      :bordered="true"
      :body-style="{ padding: '0' }"
    >
      <!-- 头部渐变区域 -->
      <div
        class="pool-header-bg"
        :style="{
          background: poolDetail?.status === '正常'
            ? 'linear-gradient(135deg, #e6f7ff 0%, #bae0ff 100%)'
            : 'linear-gradient(135deg, #fff1f0 0%, #ffccc7 100%)',
        }"
      >
        <div class="pool-header-main">
          <div class="pool-icon-box" style="background: #fff;">
            <IconifyIcon icon="lucide:database" style="font-size: 24px; color: #1677ff;" />
          </div>
          <div class="pool-title-info">
            <div class="pool-name-row">
              <h2 class="pool-name">{{ poolDetail?.name || '加载中...' }}</h2>
              <Tag
                :color="poolDetail?.status === '正常' ? 'success' : 'error'"
                size="small"
              >
                <span
                  class="status-dot"
                  :style="{ background: poolDetail?.status === '正常' ? '#52c41a' : '#ff4d4f' }"
                />
                {{ poolDetail?.status }}
              </Tag>
            </div>
            <div class="pool-meta-row">
              <span class="meta-item">
                <IconifyIcon icon="lucide:layers" style="font-size: 11px;" />
                RAID {{ poolDetail?.raidType }}
              </span>
              <span class="meta-item">
                <IconifyIcon icon="lucide:disc-3" style="font-size: 11px;" />
                {{ poolDetail?.diskCount }} 块硬盘
              </span>
              <span class="meta-item">
                <IconifyIcon icon="lucide:calendar" style="font-size: 11px;" />
                {{ poolDetail?.createTime }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 容量概览 -->
      <div class="pool-capacity-bar">
        <div class="capacity-stat-item">
          <div class="stat-icon-box" style="background: #f0f5ff;">
            <IconifyIcon icon="lucide:hard-drive" style="font-size: 18px; color: #1677ff;" />
          </div>
          <div class="stat-info">
            <div class="stat-label">总容量</div>
            <div class="stat-value">{{ poolDetail?.totalCapacity || '--' }}</div>
          </div>
        </div>
        <div class="capacity-stat-item">
          <div class="stat-icon-box" style="background: #fff7e6;">
            <IconifyIcon icon="lucide:database" style="font-size: 18px; color: #faad14;" />
          </div>
          <div class="stat-info">
            <div class="stat-label">已用容量</div>
            <div class="stat-value">{{ poolDetail?.usedCapacity || '--' }}</div>
          </div>
        </div>
        <div class="capacity-stat-item">
          <div class="stat-icon-box" style="background: #f6ffed;">
            <IconifyIcon icon="lucide:circle-check" style="font-size: 18px; color: #52c41a;" />
          </div>
          <div class="stat-info">
            <div class="stat-label">可用容量</div>
            <div class="stat-value">
              {{ (parseFloat(poolDetail?.totalCapacity || '0') - parseFloat(poolDetail?.usedCapacity || '0')).toFixed(2) }} TB
            </div>
          </div>
        </div>
        <div class="capacity-stat-item usage-stat">
          <div class="stat-info">
            <div class="stat-label">使用率</div>
            <div class="stat-value" :style="{ color: getCapacityColor(capacityPercent) }">
              {{ capacityPercent }}%
            </div>
          </div>
          <div class="mini-progress">
            <Progress
              :percent="capacityPercent"
              :stroke-color="getCapacityColor(capacityPercent)"
              :show-info="false"
              :stroke-width="6"
              size="small"
            />
          </div>
        </div>
      </div>
    </Card>

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
  padding: 0 24px 24px;
  width: 100%;
}

/* 返回栏 */
.back-bar {
  margin-bottom: 12px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding-left: 0;
}

/* 头部卡片 */
.pool-header-card {
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
}

.pool-header-bg {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.pool-header-main {
  display: flex;
  align-items: center;
  gap: 16px;
}

.pool-icon-box {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.pool-title-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pool-name-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pool-name {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #262626;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}

.pool-meta-row {
  display: flex;
  align-items: center;
  gap: 20px;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #595959;
  background: rgba(255, 255, 255, 0.7);
  padding: 2px 10px;
  border-radius: 4px;
}

/* 容量概览栏 */
.pool-capacity-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  padding: 16px 24px;
}

.capacity-stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  border-right: 1px solid #f0f0f0;
}

.capacity-stat-item:last-child {
  border-right: none;
}

.usage-stat {
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}

.stat-icon-box {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-label {
  font-size: 12px;
  color: #8c8c8c;
}

.stat-value {
  font-size: 16px;
  font-weight: 700;
  color: #262626;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.mini-progress {
  width: 100%;
}

.mini-progress :deep(.ant-progress) {
  margin-bottom: 0;
}

/* Tab 卡片 */
.pool-tabs-card {
  border-radius: 12px;
  overflow: hidden;
}

.pool-tabs :deep(.ant-tabs-nav) {
  padding: 0 20px;
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
  padding: 24px;
}

/* 区块标题 */
.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #262626;
  margin: 0;
}

/* 监控页 */
.monitor-section {
  margin-bottom: 32px;
}

.chart-wrapper {
  background: #fafafa;
  border-radius: 10px;
  padding: 16px 16px 36px;
  border: 1px solid #f0f0f0;
}

/* 硬盘页 */
.disk-tab-content {
  padding: 20px 24px 32px;
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
  margin-top: 24px;
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
    gap: 16px;
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

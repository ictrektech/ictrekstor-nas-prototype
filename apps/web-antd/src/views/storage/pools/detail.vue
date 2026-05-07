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

const capacityPercent = computed(() => {
  if (!poolDetail.value) return 0;
  const used = parseFloat(poolDetail.value.usedCapacity);
  const total = parseFloat(poolDetail.value.totalCapacity);
  return Math.round((used / total) * 100);
});

const iopsChartOption = computed(() => {
  if (!poolDetail.value?.ioStats) return {};
  const times = poolDetail.value.ioStats.map((s) => s.time);
  return {
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['读', '写'],
      bottom: 0,
      left: 'center',
    },
    grid: {
      left: 60,
      right: 40,
      top: 20,
      bottom: 50,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: times,
    },
    yAxis: {
      type: 'value',
      name: 'IOPS',
    },
    series: [
      {
        name: '读',
        type: 'line',
        smooth: true,
        data: poolDetail.value.ioStats.map((s) => s.readIops),
        itemStyle: { color: '#5470c6' },
        areaStyle: {
          color: 'rgba(84, 112, 198, 0.15)',
        },
      },
      {
        name: '写',
        type: 'line',
        smooth: true,
        data: poolDetail.value.ioStats.map((s) => s.writeIops),
        itemStyle: { color: '#91cc75' },
        areaStyle: {
          color: 'rgba(145, 204, 117, 0.15)',
        },
      },
    ],
  };
});

const bandwidthChartOption = computed(() => {
  if (!poolDetail.value?.ioStats) return {};
  const times = poolDetail.value.ioStats.map((s) => s.time);
  return {
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['读', '写'],
      bottom: 0,
      left: 'center',
    },
    grid: {
      left: 60,
      right: 40,
      top: 20,
      bottom: 50,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: times,
    },
    yAxis: {
      type: 'value',
      name: 'MB/s',
    },
    series: [
      {
        name: '读',
        type: 'line',
        smooth: true,
        data: poolDetail.value.ioStats.map((s) => s.readThroughput),
        itemStyle: { color: '#5470c6' },
        areaStyle: {
          color: 'rgba(84, 112, 198, 0.15)',
        },
      },
      {
        name: '写',
        type: 'line',
        smooth: true,
        data: poolDetail.value.ioStats.map((s) => s.writeThroughput),
        itemStyle: { color: '#91cc75' },
        areaStyle: {
          color: 'rgba(145, 204, 117, 0.15)',
        },
      },
    ],
  };
});

const logColumns = [
  { title: '时间', dataIndex: 'time', key: 'time', width: 180 },
  {
    title: '级别',
    dataIndex: 'level',
    key: 'level',
    width: 100,
  },
  { title: '消息', dataIndex: 'message', key: 'message' },
];

const diskColumns = [
  { title: '设备名', dataIndex: 'deviceName', key: 'deviceName', width: 100 },
  { title: '型号', dataIndex: 'model', key: 'model' },
  { title: '容量', dataIndex: 'size', key: 'size', width: 120 },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
  },
  {
    title: '健康状态',
    dataIndex: 'healthStatus',
    key: 'healthStatus',
    width: 120,
  },
  {
    title: '操作',
    key: 'action',
    width: 120,
  },
];

onMounted(loadData);
</script>

<template>
  <div class="pool-detail">
    <!-- 存储池基本信息 -->
    <Card class="pool-header-card" :bordered="false">
      <div class="pool-header">
        <div class="pool-title">
          <h2>{{ poolDetail?.name || '加载中...' }}</h2>
          <Tag :color="poolDetail?.status === '正常' ? 'success' : 'error'">
            {{ poolDetail?.status }}
          </Tag>
        </div>
        <div class="pool-meta">
          <span>RAID 类型：{{ poolDetail?.raidType }}</span>
          <span>创建时间：{{ poolDetail?.createTime }}</span>
          <span>硬盘数：{{ poolDetail?.diskCount }}</span>
        </div>
      </div>
    </Card>

    <!-- Tab 内容 -->
    <Card class="pool-tabs-card" :bordered="false" :body-style="{ padding: '0' }">
      <Tabs v-model:active-key="activeTab" class="pool-tabs">
        <!-- 监控 -->
        <Tabs.TabPane key="monitor" tab="监控">
          <div class="tab-content">
            <!-- IOPS 曲线图 -->
            <div class="monitor-section">
              <h3 class="section-title">存储池 IOPS</h3>
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
              <h3 class="section-title">存储池带宽</h3>
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
        <Tabs.TabPane key="capacity" tab="容量">
          <div class="tab-content">
            <div class="capacity-overview">
              <div class="capacity-total">
                <div class="capacity-label">总容量</div>
                <div class="capacity-value">{{ poolDetail?.totalCapacity }}</div>
              </div>
              <div class="capacity-used">
                <div class="capacity-label">已用容量</div>
                <div class="capacity-value">{{ poolDetail?.usedCapacity }}</div>
              </div>
              <div class="capacity-percent">
                <div class="capacity-label">使用率</div>
                <div class="capacity-value">{{ capacityPercent }}%</div>
              </div>
            </div>
            <div class="capacity-progress">
              <Progress
                :percent="capacityPercent"
                  :stroke-color="
                    capacityPercent > 90
                      ? '#ff4d4f'
                      : capacityPercent > 70
                        ? '#faad14'
                        : '#1890ff'
                  "
                :size="18"
              />
            </div>

            <div class="capacity-detail">
              <h3 class="section-title">容量明细</h3>
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
                  {{ capacityPercent }}%
                </Descriptions.Item>
                <Descriptions.Item label="RAID 类型">
                  {{ poolDetail?.raidType }}
                </Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Tag :color="poolDetail?.status === '正常' ? 'success' : 'error'">
                    {{ poolDetail?.status }}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </div>
          </div>
        </Tabs.TabPane>

        <!-- 硬盘 -->
        <Tabs.TabPane key="disks" tab="硬盘">
          <div class="tab-content disk-tab-content">
            <Table
              class="disk-table"
              :columns="diskColumns"
              :data-source="poolDetail?.disks"
              :loading="loading"
              row-key="deviceName"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'status'">
                  <Tag :color="record.status === '运行中' ? 'success' : 'warning'">
                    {{ record.status }}
                  </Tag>
                </template>
                <template v-if="column.key === 'healthStatus'">
                  <Tag :color="record.healthStatus === '正常' ? 'success' : 'error'">
                    {{ record.healthStatus || '未知' }}
                  </Tag>
                </template>
                <template v-if="column.key === 'action'">
                  <Button
                    size="small"
                    type="link"
                    @click="goToDisk(record.deviceName)"
                  >
                    查看详情
                  </Button>
                </template>
              </template>
            </Table>
          </div>
        </Tabs.TabPane>

        <!-- 日志 -->
        <Tabs.TabPane key="logs" tab="日志">
          <div class="tab-content">
            <Table
              :columns="logColumns"
              :data-source="poolDetail?.logs"
              :loading="loading"
              row-key="id"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'level'">
                  <Tag :color="getLogTagColor(record.level)">
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
  padding: 24px;
}

.pool-header-card {
  margin-bottom: 16px;
  border-radius: 8px;
}

.pool-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pool-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pool-title h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #262626;
}

.pool-meta {
  display: flex;
  gap: 24px;
  font-size: 13px;
  color: #595959;
}

.pool-tabs-card {
  border-radius: 8px;
}

.pool-tabs :deep(.ant-tabs-nav) {
  padding: 0 24px;
  margin-bottom: 0;
}

.tab-content {
  padding: 24px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 16px;
}

/* 监控页 */
.monitor-section {
  margin-bottom: 32px;
}

.chart-wrapper {
  background: #fafafa;
  border-radius: 8px;
  padding: 16px 16px 36px;
  border: 1px solid #f0f0f0;
}

/* 硬盘页 */
.disk-tab-content {
  padding: 24px 24px 32px;
}

.disk-table :deep(.ant-table) {
  border-radius: 8px;
  overflow: hidden;
}

.disk-table :deep(.ant-table-thead > tr > th) {
  background: #fafafa;
  font-weight: 600;
}

.disk-table :deep(.ant-table-tbody > tr:hover > td) {
  background: #f0f5ff;
}

/* 容量页 */
.capacity-overview {
  display: flex;
  gap: 48px;
  margin-bottom: 24px;
}

.capacity-total,
.capacity-used,
.capacity-percent {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.capacity-label {
  font-size: 13px;
  color: #8c8c8c;
}

.capacity-value {
  font-size: 24px;
  font-weight: 700;
  color: #262626;
}

.capacity-progress {
  margin-bottom: 32px;
}

/* 响应式 */
@media (max-width: 768px) {
  .pool-detail {
    padding: 12px;
  }

  .pool-meta {
    flex-direction: column;
    gap: 8px;
  }

  .capacity-overview {
    flex-direction: column;
    gap: 16px;
  }
}
</style>

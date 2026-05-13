<script lang="ts" setup>
import { computed } from 'vue';
import { Progress, Statistic, Card } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import type { StoragePoolDetail } from '#/api/storage';

const props = defineProps<{
  poolDetail: StoragePoolDetail;
}>();

const capacityPercent = computed(() => {
  const used = parseFloat(props.poolDetail.usedCapacity);
  const total = parseFloat(props.poolDetail.totalCapacity);
  return Math.round((used / total) * 100);
});

function getCapacityColor(percent: number): string {
  if (percent >= 90) return '#ff4d4f';
  if (percent >= 70) return '#faad14';
  return '#1677ff';
}

const capacityStats = computed(() => [
  {
    icon: 'lucide:hard-drive',
    iconColor: '#1677ff',
    bgColor: '#e6f4ff',
    title: '总容量',
    value: props.poolDetail.totalCapacity,
  },
  {
    icon: 'lucide:database',
    iconColor: '#52c41a',
    bgColor: '#f6ffed',
    title: '已用容量',
    value: props.poolDetail.usedCapacity,
  },
  {
    icon: 'lucide:folder-open',
    iconColor: '#faad14',
    bgColor: '#fffbe6',
    title: '可用容量',
    value: props.poolDetail.availableCapacity,
  },
  {
    icon: 'lucide:percent',
    iconColor: '#ff4d4f',
    bgColor: '#fff1f0',
    title: '使用率',
    value: `${capacityPercent.value}%`,
  },
]);
</script>

<template>
  <div class="capacity-tab-content">
    <!-- 容量概览 -->
    <div class="capacity-overview">
      <div
        v-for="stat in capacityStats"
        :key="stat.title"
        class="capacity-stat-card"
      >
        <div
          class="capacity-stat-icon"
          :style="{ background: stat.bgColor }"
        >
          <IconifyIcon
            :icon="stat.icon"
            style="font-size: 18px;"
            :style="{ color: stat.iconColor }"
          />
        </div>
        <div class="capacity-stat-info">
          <div class="capacity-stat-title">{{ stat.title }}</div>
          <div
            class="capacity-stat-value"
            :style="{ color: stat.iconColor }"
          >
            {{ stat.value }}
          </div>
        </div>
      </div>
    </div>

    <!-- 容量进度条 -->
    <div class="capacity-progress-section">
      <h3 class="section-title">
        <IconifyIcon icon="lucide:pie-chart" style="font-size: 14px; color: #1677ff;" />
        容量分布
      </h3>
      <Progress
        :percent="capacityPercent"
        :stroke-color="getCapacityColor(capacityPercent)"
        :show-info="true"
        status="active"
        :stroke-width="12"
      />
      <div class="capacity-detail">
        <div class="capacity-detail-item">
          <span class="detail-dot" style="background: #1677ff;" />
          <span class="detail-label">已用</span>
          <span class="detail-value">{{ poolDetail.usedCapacity }}</span>
        </div>
        <div class="capacity-detail-item">
          <span class="detail-dot" style="background: #52c41a;" />
          <span class="detail-label">可用</span>
          <span class="detail-value">{{ poolDetail.availableCapacity }}</span>
        </div>
        <div class="capacity-detail-item">
          <span class="detail-dot" style="background: #d9d9d9;" />
          <span class="detail-label">总容量</span>
          <span class="detail-value">{{ poolDetail.totalCapacity }}</span>
        </div>
      </div>
    </div>

    <!-- 各卷容量 -->
    <div class="volume-capacity-section">
      <h3 class="section-title">
        <IconifyIcon icon="lucide:layers" style="font-size: 14px; color: #1677ff;" />
        存储卷容量分布
      </h3>
      <div class="volume-capacity-list">
        <div
          v-for="volume in poolDetail.volumes"
          :key="volume.name"
          class="volume-capacity-item"
        >
          <div class="volume-capacity-header">
            <span class="volume-name">{{ volume.name }}</span>
            <span class="volume-ratio">{{ volume.usedCapacity }} / {{ volume.totalCapacity }}</span>
          </div>
          <Progress
            :percent="Math.round((parseFloat(volume.usedCapacity) / parseFloat(volume.totalCapacity)) * 100)"
            :stroke-color="getCapacityColor(Math.round((parseFloat(volume.usedCapacity) / parseFloat(volume.totalCapacity)) * 100))"
            :show-info="false"
            size="small"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.capacity-tab-content { padding: 16px; }

.capacity-overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.capacity-stat-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: #fafafa;
  border-radius: 8px;
}

.capacity-stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.capacity-stat-info { flex: 1; }
.capacity-stat-title { font-size: 12px; color: #8c8c8c; margin-bottom: 2px; }
.capacity-stat-value { font-size: 18px; font-weight: 700; font-family: 'SF Mono', 'Fira Code', monospace; }

.capacity-progress-section { margin-bottom: 20px; }
.section-title { font-size: 14px; font-weight: 600; color: #262626; margin: 0 0 12px 0; display: flex; align-items: center; gap: 6px; }

.capacity-detail { display: flex; gap: 24px; margin-top: 12px; padding: 12px; background: #fafafa; border-radius: 8px; }
.capacity-detail-item { display: flex; align-items: center; gap: 6px; }
.detail-dot { width: 10px; height: 10px; border-radius: 3px; }
.detail-label { font-size: 12px; color: #8c8c8c; }
.detail-value { font-size: 13px; font-weight: 600; color: #262626; }

.volume-capacity-section {}
.volume-capacity-list { display: flex; flex-direction: column; gap: 10px; }
.volume-capacity-item { padding: 10px 12px; background: #fafafa; border-radius: 8px; }
.volume-capacity-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.volume-name { font-size: 13px; font-weight: 500; color: #262626; }
.volume-ratio { font-size: 12px; color: #8c8c8c; font-family: 'SF Mono', 'Fira Code', monospace; }

@media (max-width: 1200px) {
  .capacity-overview { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .capacity-overview { grid-template-columns: 1fr; }
  .capacity-detail { flex-direction: column; gap: 8px; }
}
</style>
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
  if (percent >= 90) return 'var(--ict-danger)';
  if (percent >= 70) return 'var(--ict-warning)';
  return 'var(--ict-primary)';
}

const capacityStats = computed(() => [
  {
    icon: 'lucide:hard-drive',
    iconColor: 'var(--ict-primary)',
    bgColor: 'var(--ict-primary-light)',
    title: '总容量',
    value: props.poolDetail.totalCapacity,
  },
  {
    icon: 'lucide:database',
    iconColor: 'var(--ict-success)',
    bgColor: 'var(--ict-success-light)',
    title: '已用容量',
    value: props.poolDetail.usedCapacity,
  },
  {
    icon: 'lucide:folder-open',
    iconColor: 'var(--ict-warning)',
    bgColor: '#fffbe6',
    title: '可用容量',
    value: props.poolDetail.availableCapacity,
  },
  {
    icon: 'lucide:percent',
    iconColor: 'var(--ict-danger)',
    bgColor: 'var(--ict-danger-light)',
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
            style="font-size: var(--ict-title-large);"
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
        <IconifyIcon icon="lucide:pie-chart" style="font-size: var(--ict-body-medium); color: var(--ict-primary);" />
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
          <span class="detail-dot" style="background: var(--ict-primary);" />
          <span class="detail-label">已用</span>
          <span class="detail-value">{{ poolDetail.usedCapacity }}</span>
        </div>
        <div class="capacity-detail-item">
          <span class="detail-dot" style="background: var(--ict-success);" />
          <span class="detail-label">可用</span>
          <span class="detail-value">{{ poolDetail.availableCapacity }}</span>
        </div>
        <div class="capacity-detail-item">
          <span class="detail-dot" style="background: var(--ict-text-disabled);" />
          <span class="detail-label">总容量</span>
          <span class="detail-value">{{ poolDetail.totalCapacity }}</span>
        </div>
      </div>
    </div>

    <!-- 各卷容量 -->
    <div class="volume-capacity-section">
      <h3 class="section-title">
        <IconifyIcon icon="lucide:layers" style="font-size: var(--ict-body-medium); color: var(--ict-primary);" />
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
  background: var(--ict-bg-section);
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
.capacity-stat-title { font-size: var(--ict-body-small); color: var(--ict-text-secondary); margin-bottom: 2px; }
.capacity-stat-value { font-size: var(--ict-title-large); font-weight: 700; font-family: var(--ict-font-family); }

.capacity-progress-section { margin-bottom: 20px; }
.section-title { font-size: var(--ict-body-medium); font-weight: 600; color: var(--ict-text-emphasis); margin: 0 0 12px 0; display: flex; align-items: center; gap: 6px; }

.capacity-detail { display: flex; gap: 24px; margin-top: 12px; padding: 12px; background: var(--ict-bg-section); border-radius: 8px; }
.capacity-detail-item { display: flex; align-items: center; gap: 6px; }
.detail-dot { width: 10px; height: 10px; border-radius: 3px; }
.detail-label { font-size: var(--ict-body-small); color: var(--ict-text-secondary); }
.detail-value { font-size: var(--ict-mark-medium); font-weight: 600; color: var(--ict-text-emphasis); }

.volume-capacity-section {}
.volume-capacity-list { display: flex; flex-direction: column; gap: 10px; }
.volume-capacity-item { padding: 10px 12px; background: var(--ict-bg-section); border-radius: 8px; }
.volume-capacity-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.volume-name { font-size: var(--ict-mark-medium); font-weight: 500; color: var(--ict-text-emphasis); }
.volume-ratio { font-size: var(--ict-body-small); color: var(--ict-text-secondary); font-family: var(--ict-font-family); }

@media (max-width: 1200px) {
  .capacity-overview { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .capacity-overview { grid-template-columns: 1fr; }
  .capacity-detail { flex-direction: column; gap: 8px; }
}
</style>
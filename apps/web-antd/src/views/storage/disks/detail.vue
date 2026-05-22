<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getDisksApi, type DiskInfo } from '#/api/storage';
import { PageHeader, OverviewCard } from '#/components/ui-kit';
import DiskInfoCard from './components/DiskInfoCard.vue';
import SmartHealthPanel from './components/SmartHealthPanel.vue';
import MonitorCharts from './components/MonitorCharts.vue';
import SmartDetailModal from './components/SmartDetailModal.vue';

const route = useRoute();
const router = useRouter();
const deviceName = route.params.deviceName as string;

const disk = ref<DiskInfo | null>(null);
const loading = ref(false);
const smartModalVisible = ref(false);

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

/** 使用时长格式化（小时 → 友好单位） */
function formatHours(hours?: number): string {
  if (!hours) return '--';
  const days = Math.floor(hours / 24);
  if (days > 365) return `${(days / 365).toFixed(1)}年`;
  return `${days}天`;
}

/** 温度色阶 */
function getTempColor(temp?: number): string {
  if (!temp) return 'var(--ict-text-secondary)';
  if (temp < 40) return 'var(--ict-success)';
  if (temp < 50) return 'var(--ict-warning)';
  return 'var(--ict-danger)';
}

onMounted(loadDisk);
</script>

<template>
  <!-- 页面头部：标题 + 副标题 + 返回按钮 + 右侧概览卡片 -->
  <PageHeader
    v-if="disk"
    :title="disk.deviceName"
    :subtitle="`${disk.model} · ${disk.usageStatus || disk.status}`"
    back-label="磁盘管理"
    @back="goBack"
  >
    <template #extra>
      <OverviewCard
        icon="lucide:database"
        icon-color="var(--ict-primary)"
        icon-bg="var(--ict-primary-light)"
        label="容量"
        :value="disk.size"
      />
      <OverviewCard
        v-if="disk.temperature !== undefined"
        icon="lucide:thermometer"
        icon-color="var(--ict-warning)"
        icon-bg="var(--ict-warning-light)"
        label="温度"
        :value="disk.temperature + '°C'"
        :value-color="getTempColor(disk.temperature)"
      />
      <OverviewCard
        v-if="disk.usedHours"
        icon="lucide:clock"
        icon-color="var(--ict-success)"
        icon-bg="var(--ict-success-light)"
        label="使用时长"
        :value="formatHours(disk.usedHours)"
      />
    </template>
  </PageHeader>

  <!-- 主体内容 -->
  <div class="disk-detail" v-if="disk">
    <div class="detail-body">
      <!-- 设备信息卡片 -->
      <DiskInfoCard :disk="disk" />

      <!-- SMART 健康卡片 -->
      <SmartHealthPanel :disk="disk" @show-detail="smartModalVisible = true" />

      <!-- 性能图表 -->
      <MonitorCharts />
    </div>

    <!-- SMART 完整信息弹窗 -->
    <SmartDetailModal
      v-model:visible="smartModalVisible"
      :disk="disk"
    />
  </div>
</template>

<style scoped>
.disk-detail {
  padding: 0 16px 16px;
  width: 100%;
}

.detail-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .disk-detail {
    padding: 0 8px 8px;
  }
}
</style>

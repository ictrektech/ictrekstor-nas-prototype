<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getDisksApi, type DiskInfo } from '#/api/storage';
import DiskDetailHeader from './components/DiskDetailHeader.vue';
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

onMounted(loadDisk);
</script>

<template>
  <div class="disk-detail" v-if="disk">
    <!-- 页面顶部概览 -->
    <DiskDetailHeader :disk="disk" @back="goBack" />

    <!-- 主体内容 -->
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
  margin-top: 10px;
}

@media (max-width: 768px) {
  .disk-detail {
    padding: 0 8px 8px;
  }
}
</style>
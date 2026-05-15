<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Button, Card, Tag, Tabs, Skeleton } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import { getStoragePoolDetailApi } from '#/api/storage';
import type { StoragePoolDetail } from '#/api/storage';
import PoolMonitorTab from './components/PoolMonitorTab.vue';
import PoolDiskTab from './components/PoolDiskTab.vue';
import PoolCapacityTab from './components/PoolCapacityTab.vue';
import PoolLogTab from './components/PoolLogTab.vue';

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
    if (tab && ['monitor', 'disks', 'capacity', 'logs'].includes(tab as string)) {
      activeTab.value = tab as string;
    }
  },
  { immediate: true },
);

async function loadData() {
  loading.value = true;
  try {
    poolDetail.value = await getStoragePoolDetailApi(poolId.value);
  } finally {
    loading.value = false;
  }
}

function goToDisk(deviceName: string) {
  router.push(`/storage/disks/detail/${deviceName}`);
}

function goBack() {
  router.push('/storage/pools');
}
</script>

<template>
  <div class="pool-detail">
    <!-- 页面顶部概览 -->
    <div v-if="poolDetail" class="page-header">
      <div class="page-header-left">
        <Button size="small" class="back-btn" @click="goBack">
          <IconifyIcon icon="lucide:arrow-left" style="font-size: var(--ict-body-small);" />
          返回
        </Button>
        <div class="page-icon-box">
          <IconifyIcon icon="lucide:database" style="font-size: var(--ict-title-large); color: var(--ict-primary);" />
        </div>
        <div class="page-title-area">
          <h1 class="page-title">{{ poolDetail.name }}</h1>
          <p class="page-desc">
            {{ poolDetail.raidType }} · {{ poolDetail.diskCount }} 块硬盘 ·
            <Tag :color="poolDetail.status === 'normal' ? 'success' : 'warning'" size="small">
              <span
                class="status-dot"
                :style="{ background: poolDetail.status === 'normal' ? 'var(--ict-success)' : 'var(--ict-warning)' }"
              />
              {{ poolDetail.status === 'normal' ? '正常' : poolDetail.status }}
            </Tag>
          </p>
        </div>
      </div>
      <div class="page-header-right">
        <div class="overview-card">
          <IconifyIcon icon="lucide:hard-drive" style="font-size: var(--ict-title-medium); color: var(--ict-primary);" />
          <div class="overview-info">
            <span class="overview-label">总容量</span>
            <span class="overview-value">{{ poolDetail.totalCapacity }}</span>
          </div>
        </div>
        <div class="overview-card">
          <IconifyIcon icon="lucide:database" style="font-size: var(--ict-title-medium); color: var(--ict-success);" />
          <div class="overview-info">
            <span class="overview-label">已用</span>
            <span class="overview-value">{{ poolDetail.usedCapacity }}</span>
          </div>
        </div>
        <div class="overview-card">
          <IconifyIcon icon="lucide:folder-open" style="font-size: var(--ict-title-medium); color: var(--ict-warning);" />
          <div class="overview-info">
            <span class="overview-label">可用</span>
            <span class="overview-value">{{ poolDetail.availableCapacity }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab 内容 -->
    <Card class="pool-tabs-card" :bordered="true" :body-style="{ padding: 0 }">
      <Skeleton v-if="loading" active :paragraph="{ rows: 8 }" style="padding: 24px;" />
      <Tabs v-else-if="poolDetail" v-model:active-key="activeTab" class="pool-tabs">
        <!-- 性能监控 -->
        <Tabs.TabPane key="monitor" tab="性能监控">
          <div class="tab-content">
            <PoolMonitorTab :pool-detail="poolDetail" />
          </div>
        </Tabs.TabPane>

        <!-- 硬盘列表 -->
        <Tabs.TabPane key="disks" tab="硬盘">
          <PoolDiskTab :pool-detail="poolDetail" @go-to-disk="goToDisk" />
        </Tabs.TabPane>

        <!-- 容量详情 -->
        <Tabs.TabPane key="capacity" tab="容量">
          <PoolCapacityTab :pool-detail="poolDetail" />
        </Tabs.TabPane>

        <!-- 日志 -->
        <Tabs.TabPane key="logs" tab="日志">
          <PoolLogTab :logs="poolDetail.logs" />
        </Tabs.TabPane>
      </Tabs>
    </Card>
  </div>
</template>

<style scoped>
.pool-detail { padding: 0 16px 16px; width: 100%; }

/* 页面顶部概览 */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: var(--ict-bg-card);
  gap: 16px;
  flex-shrink: 0;
}

.page-header-left { display: flex; align-items: center; gap: 12px; }
.back-btn { font-size: var(--ict-body-small); display: inline-flex; align-items: center; gap: 4px; border-radius: 6px; }
.page-icon-box { width: 44px; height: 44px; border-radius: 10px; background: var(--ict-primary-light); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.page-title { font-size: var(--ict-title-medium); font-weight: 600; color: var(--ict-text-emphasis); margin: 0; line-height: 1.4; }
.page-desc { font-size: var(--ict-body-small); color: var(--ict-text-secondary); margin: 2px 0 0; }

.page-header-right { display: flex; align-items: center; gap: 12px; }

.overview-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: var(--ict-bg-page);
  border-radius: 8px;
  min-width: 90px;
}

.overview-info { display: flex; flex-direction: column; gap: 1px; }
.overview-label { font-size: var(--ict-mark-small); color: var(--ict-text-secondary); }
.overview-value { font-size: var(--ict-title-medium); font-weight: 600; color: var(--ict-text-emphasis); font-family: var(--ict-font-family); }

.status-dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; }

/* Tab 卡片 */
.pool-tabs-card { border-radius: 10px; overflow: hidden; }
.pool-tabs :deep(.ant-tabs-nav) { padding: 0 16px; margin-bottom: 0; border-bottom: 1px solid var(--ict-border-light); }
.tab-content { padding: 16px; }

/* 响应式 */
@media (max-width: 768px) {
  .pool-detail { padding: 0 12px 12px; }
  .page-header { flex-direction: column; align-items: flex-start; }
}
</style>

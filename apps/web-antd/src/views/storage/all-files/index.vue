<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  Card,
  Button,
  Input,
  Progress,
  Tag,
  message,
  Empty,
  Tooltip,
} from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import {
  getStorageSpacesApi,
  type StorageSpace,
} from '#/api/storage';

const router = useRouter();
const spaces = ref<StorageSpace[]>([]);
const loading = ref(false);
const searchText = ref('');

const filteredSpaces = computed(() => {
  if (!searchText.value) return spaces.value;
  const kw = searchText.value.toLowerCase();
  return spaces.value.filter(
    (s) =>
      s.name.toLowerCase().includes(kw) ||
      s.filesystem.toLowerCase().includes(kw),
  );
});

function getUsagePercent(used: string, total: string): number {
  const parseSize = (s: string): number => {
    const num = parseFloat(s);
    if (s.includes('TB')) return num * 1024;
    if (s.includes('GB')) return num;
    if (s.includes('MB')) return num / 1024;
    return num;
  };
  const u = parseSize(used);
  const t = parseSize(total);
  return Math.round((u / t) * 100);
}

function getCapacityColor(percent: number): string {
  if (percent >= 90) return '#ff4d4f';
  if (percent >= 70) return '#faad14';
  return '#1677ff';
}

function getFsIcon(fs: string): string {
  if (fs === 'ext4') return 'lucide:folder-tree';
  if (fs === 'btrfs') return 'lucide:layers';
  if (fs === 'xfs') return 'lucide:database';
  return 'lucide:folder';
}

async function loadData() {
  loading.value = true;
  try {
    spaces.value = await getStorageSpacesApi();
  } finally {
    loading.value = false;
  }
}

function goToSpaceDetail(spaceId: string) {
  router.push(`/storage/all-files/detail/${spaceId}`);
}

onMounted(loadData);
</script>

<template>
  <div class="all-files-page">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <div class="breadcrumb-bar">
          <div class="breadcrumb-icon-box">
            <IconifyIcon icon="lucide:folder-open" style="font-size: 16px; color: #1677ff;" />
          </div>
          <span class="breadcrumb-text">设备全部文件</span>
        </div>
      </div>
      <div class="toolbar-right">
        <Input
          v-model:value="searchText"
          placeholder="搜索存储空间"
          class="search-input"
          allow-clear
        >
          <template #prefix>
            <IconifyIcon icon="lucide:search" style="font-size: 14px; color: #bfbfbf;" />
          </template>
        </Input>
        <Tooltip title="刷新">
          <Button class="refresh-btn" @click="loadData">
            <IconifyIcon icon="lucide:refresh-cw" style="font-size: 14px;" />
          </Button>
        </Tooltip>
      </div>
    </div>

    <!-- 存储空间网格 -->
    <div v-if="filteredSpaces.length > 0" class="space-grid">
      <Card
        v-for="space in filteredSpaces"
        :key="space.id"
        class="space-card"
        :bordered="true"
        :body-style="{ padding: '0' }"
        @click="goToSpaceDetail(space.id)"
      >
        <!-- 卡片头部 -->
        <div class="space-header">
          <div
            class="space-icon-wrapper"
            :style="{ background: `${getCapacityColor(getUsagePercent(space.usedCapacity, space.totalCapacity))}12` }"
          >
            <IconifyIcon
              :icon="getFsIcon(space.filesystem)"
              style="font-size: 24px;"
              :style="{ color: getCapacityColor(getUsagePercent(space.usedCapacity, space.totalCapacity)) }"
            />
          </div>
          <div class="space-info">
            <div class="space-name">{{ space.name }}</div>
            <div class="space-meta">
              <Tag size="small" color="blue" class="fs-tag">
                <IconifyIcon icon="lucide:layers" style="font-size: 10px; margin-right: 2px;" />
                {{ space.filesystem }}
              </Tag>
              <span class="raid-badge">
                <IconifyIcon icon="lucide:shield" style="font-size: 10px;" />
                {{ space.raidType }}
              </span>
            </div>
          </div>
        </div>

        <!-- 容量区域 -->
        <div class="space-capacity-section">
          <div class="capacity-top">
            <div class="capacity-labels">
              <span class="capacity-used">{{ space.usedCapacity }}</span>
              <span class="capacity-divider">/</span>
              <span class="capacity-total">{{ space.totalCapacity }}</span>
            </div>
            <Tooltip :title="`使用率 ${getUsagePercent(space.usedCapacity, space.totalCapacity)}%`">
              <span
                class="capacity-percent"
                :style="{ color: getCapacityColor(getUsagePercent(space.usedCapacity, space.totalCapacity)) }"
              >
                {{ getUsagePercent(space.usedCapacity, space.totalCapacity) }}%
              </span>
            </Tooltip>
          </div>
          <div class="space-progress">
            <Progress
              :percent="getUsagePercent(space.usedCapacity, space.totalCapacity)"
              :stroke-color="getCapacityColor(getUsagePercent(space.usedCapacity, space.totalCapacity))"
              :show-info="false"
              :stroke-width="8"
              size="small"
            />
          </div>
        </div>

        <!-- 底部信息 -->
        <div class="space-footer">
          <div class="footer-left">
            <IconifyIcon icon="lucide:link" style="font-size: 11px; color: #8c8c8c;" />
            <span class="footer-path">{{ space.path }}</span>
          </div>
          <div class="footer-right">
            <span class="footer-hint">点击查看文件</span>
            <IconifyIcon icon="lucide:arrow-right" style="font-size: 11px; color: #bfbfbf;" />
          </div>
        </div>
      </Card>
    </div>

    <!-- 空状态 -->
    <Empty v-else description="暂无存储空间" class="empty-state">
      <template #image>
        <div class="empty-image">
          <IconifyIcon icon="lucide:folder-open" style="font-size: 56px; color: #d9d9d9;" />
        </div>
      </template>
      <Button type="primary" size="small" @click="loadData">
        <IconifyIcon icon="lucide:refresh-cw" style="font-size: 12px;" />
        重新加载
      </Button>
    </Empty>
  </div>
</template>

<style scoped>
.all-files-page {
  padding: 0 24px 24px;
  width: 100%;
}

/* 工具栏 */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 12px;
}

.toolbar-left {
  display: flex;
  align-items: center;
}

.breadcrumb-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 6px 14px;
}

.breadcrumb-icon-box {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: #e6f7ff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.breadcrumb-text {
  font-size: 14px;
  font-weight: 500;
  color: #262626;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-input {
  width: 240px;
}

.refresh-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
}

/* 存储空间网格 */
.space-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.space-card {
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  overflow: hidden;
}

.space-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: #1677ff;
}

/* 卡片头部 */
.space-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 20px 16px;
  border-bottom: 1px solid #f5f5f5;
}

.space-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.space-card:hover .space-icon-wrapper {
  transform: scale(1.05);
}

.space-info {
  flex: 1;
  min-width: 0;
}

.space-name {
  font-size: 15px;
  font-weight: 700;
  color: #262626;
  margin-bottom: 6px;
}

.space-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.fs-tag {
  display: inline-flex;
  align-items: center;
  font-size: 11px;
}

.raid-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  color: #8c8c8c;
  background: #f5f5f5;
  padding: 1px 8px;
  border-radius: 4px;
}

/* 容量区域 */
.space-capacity-section {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.capacity-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.capacity-labels {
  font-size: 13px;
}

.capacity-used {
  font-weight: 700;
  color: #262626;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.capacity-divider {
  color: #bfbfbf;
  margin: 0 4px;
}

.capacity-total {
  color: #8c8c8c;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.capacity-percent {
  font-size: 14px;
  font-weight: 700;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.space-progress :deep(.ant-progress) {
  margin-bottom: 0;
}

/* 底部 */
.space-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background: #fafafa;
  border-top: 1px solid #f5f5f5;
  font-size: 12px;
}

.footer-left {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #8c8c8c;
}

.footer-path {
  font-family: 'SF Mono', 'Fira Code', monospace;
  color: #595959;
}

.footer-right {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #bfbfbf;
  transition: color 0.2s;
}

.space-card:hover .footer-right {
  color: #1677ff;
}

.footer-hint {
  font-size: 11px;
}

/* 空状态 */
.empty-state {
  padding: 48px 0;
}

.empty-image {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
}

/* 响应式 */
@media (max-width: 576px) {
  .all-files-page {
    padding: 0 12px 12px;
  }

  .toolbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .search-input {
    width: 100%;
  }

  .space-grid {
    grid-template-columns: 1fr;
  }
}
</style>

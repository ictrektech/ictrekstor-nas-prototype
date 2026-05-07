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
} from 'ant-design-vue';
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
          <span class="breadcrumb-icon">📁</span>
          <span class="breadcrumb-text">设备全部文件</span>
        </div>
      </div>
      <div class="toolbar-right">
        <Input
          v-model:value="searchText"
          placeholder="搜索存储空间"
          class="search-input"
          allow-clear
        />
        <Button size="small" class="refresh-btn" @click="loadData">
          ⟳
        </Button>
      </div>
    </div>

    <!-- 存储空间网格 -->
    <div class="space-grid">
      <Card
        v-for="space in filteredSpaces"
        :key="space.id"
        class="space-card"
        :bordered="true"
        hoverable
        @click="goToSpaceDetail(space.id)"
      >
        <div class="space-card-body">
          <div class="space-header">
            <div class="space-icon-wrapper">
              <span class="space-icon">🖴</span>
            </div>
            <div class="space-info">
              <div class="space-name">{{ space.name }}</div>
              <Tag size="small" class="space-fs-tag">
                {{ space.filesystem }}
              </Tag>
            </div>
          </div>

          <div class="space-usage">
            <Progress
              :percent="getUsagePercent(space.usedCapacity, space.totalCapacity)"
              :stroke-color="
                getUsagePercent(space.usedCapacity, space.totalCapacity) > 90
                  ? '#ff4d4f'
                  : getUsagePercent(space.usedCapacity, space.totalCapacity) > 70
                    ? '#faad14'
                    : '#1890ff'
              "
              :show-info="false"
              size="small"
            />
          </div>

          <div class="space-footer">
            <span class="space-raid">{{ space.raidType }}</span>
            <span class="space-capacity">
              {{ space.usedCapacity }} / {{ space.totalCapacity }}
            </span>
          </div>
        </div>
      </Card>

      <div v-if="filteredSpaces.length === 0" class="space-empty">
        <div class="empty-text">暂无存储空间</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.all-files-page {
  padding: 24px;
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
  gap: 8px;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 4px 12px;
}

.breadcrumb-icon {
  font-size: 14px;
}

.breadcrumb-text {
  font-size: 14px;
  color: #262626;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-input {
  width: 220px;
}

.refresh-btn {
  padding: 0 10px;
}

/* 存储空间网格 */
.space-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.space-card {
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.space-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.space-card :deep(.ant-card-body) {
  padding: 20px;
}

.space-card-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.space-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.space-icon-wrapper {
  width: 48px;
  height: 48px;
  background: #f0f5ff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.space-icon {
  font-size: 24px;
}

.space-info {
  flex: 1;
  min-width: 0;
}

.space-name {
  font-size: 15px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 4px;
}

.space-fs-tag {
  font-size: 11px;
  line-height: 1.4;
}

.space-usage {
  padding: 0 4px;
}

.space-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #595959;
}

.space-raid {
  font-weight: 500;
}

.space-capacity {
  font-family: 'SF Mono', monospace;
}

.space-empty {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 0;
  color: #bfbfbf;
  font-size: 14px;
}
</style>

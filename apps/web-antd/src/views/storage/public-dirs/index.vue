<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { Card, Button, Input, Tag, Empty, Tooltip } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import { getPublicDirsApi, type PublicDir } from '#/api/storage';

const items = ref<PublicDir[]>([]);
const loading = ref(false);
const searchText = ref('');

const filteredItems = computed(() => {
  if (!searchText.value) return items.value;
  const kw = searchText.value.toLowerCase();
  return items.value.filter(
    (i) =>
      i.name.toLowerCase().includes(kw) ||
      i.path.toLowerCase().includes(kw),
  );
});

function getPermissionColor(permissions: string): string {
  // 根据权限字符串判断颜色
  if (permissions.includes('rwx')) return 'green';
  if (permissions.includes('rw-')) return 'blue';
  if (permissions.includes('r--')) return 'orange';
  return 'default';
}

function formatPermissions(permissions: string): string {
  // 简化权限显示
  if (permissions === 'rwxr-xr-x') return '公共读写';
  if (permissions === 'rwxr-x---') return '组内读写';
  if (permissions === 'rwx------') return '仅所有者';
  return permissions;
}

async function loadData() {
  loading.value = true;
  try {
    items.value = await getPublicDirsApi();
  } finally {
    loading.value = false;
  }
}

onMounted(loadData);
</script>

<template>
  <div class="public-dirs-page">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <div class="breadcrumb-bar">
          <div class="breadcrumb-icon-box">
            <IconifyIcon icon="lucide:folder-open" style="font-size: 16px; color: #1677ff;" />
          </div>
          <span class="breadcrumb-text">公共目录管理</span>
        </div>
      </div>
      <div class="toolbar-right">
        <Input
          v-model:value="searchText"
          placeholder="搜索目录"
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

    <!-- 目录列表 -->
    <div v-if="filteredItems.length > 0" class="dir-grid">
      <Card
        v-for="dir in filteredItems"
        :key="dir.id"
        class="dir-card"
        :bordered="true"
        :body-style="{ padding: '0' }"
      >
        <!-- 头部 -->
        <div class="dir-header">
          <div class="dir-icon-box">
            <IconifyIcon icon="lucide:folder-open" style="font-size: 22px; color: #fff;" />
          </div>
          <div class="dir-title">
            <span class="dir-name">{{ dir.name }}</span>
            <Tag
              :color="getPermissionColor(dir.permissions)"
              size="small"
              class="perm-tag"
            >
              {{ formatPermissions(dir.permissions) }}
            </Tag>
          </div>
        </div>

        <!-- 主体 -->
        <div class="dir-body">
          <div class="dir-path">
            <IconifyIcon icon="lucide:link" style="font-size: 11px; color: #8c8c8c;" />
            <span class="path-value">{{ dir.path }}</span>
          </div>
          <div class="dir-create-time">
            <IconifyIcon icon="lucide:calendar" style="font-size: 11px; color: #bfbfbf;" />
            <span class="time-value">{{ dir.createTime }}</span>
          </div>
        </div>

        <!-- 底部 -->
        <div class="dir-footer">
          <div class="perm-detail">
            <IconifyIcon icon="lucide:shield" style="font-size: 11px; color: #bfbfbf;" />
            <span class="perm-value">{{ dir.permissions }}</span>
          </div>
          <Tooltip title="复制路径">
            <Button
              size="small"
              type="text"
              class="copy-btn"
              @click="navigator.clipboard.writeText(dir.path)"
            >
              <IconifyIcon icon="lucide:copy" style="font-size: 12px;" />
            </Button>
          </Tooltip>
        </div>
      </Card>
    </div>

    <!-- 空状态 -->
    <Empty v-else description="暂无公共目录" class="empty-state">
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
.public-dirs-page {
  padding: 0 16px 16px;
  width: 100%;
}

/* 工具栏 */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  gap: 10px;
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

/* 目录网格 */
.dir-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 10px;
}

.dir-card {
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.dir-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: #1677ff;
}

/* 头部 */
.dir-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px;
  border-bottom: 1px solid #f5f5f5;
}

.dir-icon-box {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #1677ff, #4096ff);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dir-title {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.dir-name {
  font-size: 15px;
  font-weight: 700;
  color: #262626;
}

.perm-tag {
  font-size: 11px;
  align-self: flex-start;
}

/* 主体 */
.dir-body {
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dir-path {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.path-value {
  color: #595959;
  font-family: 'SF Mono', 'Fira Code', monospace;
  word-break: break-all;
}

.dir-create-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.time-value {
  color: #8c8c8c;
}

/* 底部 */
.dir-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 14px;
  background: #fafafa;
  border-top: 1px solid #f5f5f5;
}

.perm-detail {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.perm-value {
  color: #8c8c8c;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.copy-btn {
  display: inline-flex;
  align-items: center;
  color: #bfbfbf;
  transition: color 0.2s;
}

.copy-btn:hover {
  color: #1677ff;
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
  .public-dirs-page {
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

  .dir-grid {
    grid-template-columns: 1fr;
  }
}
</style>

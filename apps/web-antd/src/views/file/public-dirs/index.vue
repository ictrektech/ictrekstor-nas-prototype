<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import {
  Button,
  Card,
  Input,
  Table,
  Tag,
  message,
  Empty,
} from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import { FolderHeart, FolderOpen, Search, Users } from 'lucide-vue-next';

interface PublicDirItem {
  id: string;
  name: string;
  description: string;
  fileCount: number;
  owner: string;
  updateTime: string;
  access: 'readonly' | 'write';
}

// ─── Mock 公共目录数据 ───
const mockDirs: PublicDirItem[] = [
  {
    id: 'pd-1',
    name: '文档',
    description: '公司制度、流程规范、项目文档等',
    fileCount: 128,
    owner: 'admin',
    updateTime: '2024-05-06 10:30:00',
    access: 'readonly',
  },
  {
    id: 'pd-2',
    name: '设计资源',
    description: 'UI 设计、品牌素材、设计规范',
    fileCount: 86,
    owner: 'design-team',
    updateTime: '2024-05-05 14:20:00',
    access: 'readonly',
  },
  {
    id: 'pd-3',
    name: '财务资料',
    description: '年报、税务资料、财务报表',
    fileCount: 45,
    owner: 'finance',
    updateTime: '2024-05-02 15:30:00',
    access: 'readonly',
  },
  {
    id: 'pd-4',
    name: '培训资料',
    description: '新员工培训、技术分享、安全规范',
    fileCount: 62,
    owner: 'hr',
    updateTime: '2024-04-28 09:00:00',
    access: 'write',
  },
  {
    id: 'pd-5',
    name: '共享软件',
    description: '团队常用工具、安装包、脚本',
    fileCount: 34,
    owner: 'it',
    updateTime: '2024-04-15 11:00:00',
    access: 'write',
  },
];

const searchText = ref('');
const loading = ref(false);
const dirList = ref<PublicDirItem[]>(mockDirs);

const filteredDirs = computed(() => {
  if (!searchText.value) return dirList.value;
  const kw = searchText.value.toLowerCase();
  return dirList.value.filter(
    (d) =>
      d.name.toLowerCase().includes(kw) ||
      d.description.toLowerCase().includes(kw) ||
      d.owner.toLowerCase().includes(kw),
  );
});

const overviewStats = computed(() => ({
  total: dirList.value.length,
  files: dirList.value.reduce((sum, d) => sum + d.fileCount, 0),
  readonly: dirList.value.filter((d) => d.access === 'readonly').length,
  write: dirList.value.filter((d) => d.access === 'write').length,
}));

const columns = [
  { title: '目录名称', key: 'name', width: 180 },
  { title: '说明', dataIndex: 'description', key: 'description', ellipsis: true },
  { title: '文件数', key: 'fileCount', width: 100, align: 'center' as const },
  { title: '所有者', key: 'owner', width: 120 },
  { title: '更新时间', key: 'updateTime', width: 140 },
  { title: '权限', key: 'access', width: 100, align: 'center' as const },
  { title: '操作', key: 'action', width: 120, align: 'center' as const },
];

function refresh() {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    message.success('已刷新');
  }, 300);
}

function handleOpenDir(dir: PublicDirItem) {
  message.info(`打开目录：${dir.name}`);
}

function formatFriendlyTime(timeStr: string): string {
  const now = new Date();
  const time = new Date(timeStr);
  const diffMs = now.getTime() - time.getTime();
  const diffDay = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDay === 0) return '今天';
  if (diffDay === 1) return '昨天';
  if (diffDay < 30) return `${diffDay}天前`;
  if (diffDay < 365) return `${Math.floor(diffDay / 30)}个月前`;
  return `${Math.floor(diffDay / 365)}年前`;
}

onMounted(() => {
  loading.value = true;
  setTimeout(() => { loading.value = false; }, 200);
});
</script>

<template>
  <div class="public-dirs-page">
    <!-- ═══════ 页面顶部概览 ═══════ -->
    <div class="page-header">
      <div class="page-header-left">
        <div class="page-icon-box">
          <FolderHeart style="font-size: 20px; color: #fa8c16;" />
        </div>
        <div class="page-title-area">
          <h1 class="page-title">公共目录</h1>
          <p class="page-desc">团队公共文件资源，所有成员均可访问</p>
        </div>
      </div>
      <div class="page-header-right">
        <div class="overview-card">
          <FolderOpen style="font-size: 16px; color: #1677ff;" />
          <div class="overview-info">
            <span class="overview-label">公共目录</span>
            <span class="overview-value">{{ overviewStats.total }}</span>
          </div>
        </div>
        <div class="overview-card">
          <IconifyIcon icon="lucide:file" style="font-size: 16px; color: #52c41a;" />
          <div class="overview-info">
            <span class="overview-label">文件总数</span>
            <span class="overview-value">{{ overviewStats.files }}</span>
          </div>
        </div>
        <div class="overview-card">
          <Users style="font-size: 16px; color: #722ed1;" />
          <div class="overview-info">
            <span class="overview-label">只读目录</span>
            <span class="overview-value">{{ overviewStats.readonly }}</span>
          </div>
        </div>
        <div class="overview-card">
          <IconifyIcon icon="lucide:edit-3" style="font-size: 16px; color: #faad14;" />
          <div class="overview-info">
            <span class="overview-label">可写目录</span>
            <span class="overview-value">{{ overviewStats.write }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════ 主体内容 ═══════ -->
    <div class="page-body">
      <Card class="dirs-card" :bordered="false">
        <!-- 工具栏 -->
        <div class="toolbar">
          <div class="toolbar-left">
            <Button @click="refresh">
              <IconifyIcon icon="lucide:refresh-cw" style="font-size: 13px;" />
              刷新
            </Button>
          </div>
          <div class="toolbar-right">
            <Input
              v-model:value="searchText"
              placeholder="搜索目录名称、说明或所有者"
              class="search-input"
              allow-clear
            >
              <template #prefix>
                <Search style="font-size: 14px; color: #bfbfbf;" />
              </template>
            </Input>
          </div>
        </div>

        <!-- 表格 -->
        <div class="table-card">
          <Table
            :columns="columns"
            :data-source="filteredDirs"
            row-key="id"
            size="small"
            :loading="loading"
            :pagination="false"
            class="dirs-table"
          >
            <template #bodyCell="{ column, record }">
              <!-- 目录名称 -->
              <template v-if="column.key === 'name'">
                <div class="name-cell">
                  <div class="name-icon-box">
                    <FolderHeart style="font-size: 18px;" />
                  </div>
                  <div class="name-text-area">
                    <div class="name-title">{{ record.name }}</div>
                  </div>
                </div>
              </template>

              <!-- 文件数 -->
              <template v-if="column.key === 'fileCount'">
                <span class="count-value">{{ record.fileCount }}</span>
              </template>

              <!-- 所有者 -->
              <template v-if="column.key === 'owner'">
                <Tag size="small" color="blue">{{ record.owner }}</Tag>
              </template>

              <!-- 更新时间 -->
              <template v-if="column.key === 'updateTime'">
                <span class="time-text">{{ formatFriendlyTime(record.updateTime) }}</span>
              </template>

              <!-- 权限 -->
              <template v-if="column.key === 'access'">
                <Tag
                  :color="record.access === 'write' ? 'success' : 'default'"
                  size="small"
                >
                  {{ record.access === 'write' ? '可读写' : '只读' }}
                </Tag>
              </template>

              <!-- 操作 -->
              <template v-if="column.key === 'action'">
                <div class="action-cell">
                  <Button size="small" type="link" @click="handleOpenDir(record)">
                    <IconifyIcon icon="lucide:folder-open" style="font-size: 13px;" />
                    打开
                  </Button>
                </div>
              </template>
            </template>

            <template #emptyText>
              <Empty description="暂无公共目录" class="table-empty">
                <template #image>
                  <div class="empty-image">
                    <FolderHeart style="font-size: 48px; color: #d9d9d9;" />
                  </div>
                </template>
              </Empty>
            </template>
          </Table>
        </div>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.public-dirs-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f5f5f5;
}

/* ═══ 页面顶部概览 ═══ */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  gap: 16px;
  flex-shrink: 0;
}

.page-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #fff7e6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.page-title {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  margin: 0;
  line-height: 1.4;
}

.page-desc {
  font-size: 12px;
  color: #8c8c8c;
  margin: 2px 0 0;
}

.page-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.overview-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: #f5f5f5;
  border-radius: 8px;
  min-width: 90px;
}

.overview-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.overview-label {
  font-size: 11px;
  color: #8c8c8c;
}

.overview-value {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

/* ═══ 主体内容 ═══ */
.page-body {
  flex: 1;
  overflow: auto;
  padding: 12px;
}

.dirs-card {
  border-radius: 12px;
  background: #fff;
  border: 1px solid #f0f0f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.dirs-card :deep(.ant-card-body) {
  padding: 16px;
}

/* ═══ 工具栏 ═══ */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  gap: 12px;
}

.toolbar-left {
  display: flex;
  align-items: center;
}

.toolbar-right {
  display: flex;
  align-items: center;
}

.search-input {
  width: 280px;
}

/* ═══ 表格卡片 ═══ */
.table-card {
  background: #fff;
  border-radius: 10px;
  border: 1px solid #f0f0f0;
  overflow: hidden;
}

.dirs-table :deep(.ant-table-thead > tr > th) {
  background: #fafafa;
  font-weight: 600;
  font-size: 12px;
  color: #595959;
  padding: 10px 14px;
}

.dirs-table :deep(.ant-table-tbody > tr > td) {
  padding: 12px 14px;
  font-size: 13px;
}

.dirs-table :deep(.ant-table-tbody > tr:hover > td) {
  background: #f5f5f5;
}

/* ═══ 名称列 ═══ */
.name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.name-icon-box {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #fff7e6;
  color: #fa8c16;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.name-text-area {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.name-title {
  font-size: 14px;
  font-weight: 500;
  color: #262626;
}

/* ═══ 文件数 ═══ */
.count-value {
  font-weight: 600;
  color: #262626;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

/* ═══ 时间列 ═══ */
.time-text {
  color: #8c8c8c;
  font-size: 12px;
}

/* ═══ 操作列 ═══ */
.action-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

/* ═══ 空状态 ═══ */
.table-empty {
  padding: 48px 0;
}

.empty-image {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

/* ═══ 响应式 ═══ */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .toolbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .search-input {
    width: 200px;
  }
}
</style>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { Button, Card, Input, message } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import { FolderHeart, FolderOpen, Search, Users } from 'lucide-vue-next';
import PublicDirTable from './components/PublicDirTable.vue';
import type { PublicDirItem } from './types';

// ─── Mock 公共目录数据 ───
const mockDirs: PublicDirItem[] = [
  {
    id: 'pd-1', name: '文档',
    description: '公司制度、流程规范、项目文档等', fileCount: 128,
    owner: 'admin', updateTime: '2024-05-06 10:30:00', access: 'readonly',
  },
  {
    id: 'pd-2', name: '设计资源',
    description: 'UI 设计、品牌素材、设计规范', fileCount: 86,
    owner: 'design-team', updateTime: '2024-05-05 14:20:00', access: 'readonly',
  },
  {
    id: 'pd-3', name: '财务资料',
    description: '年报、税务资料、财务报表', fileCount: 45,
    owner: 'finance', updateTime: '2024-05-02 15:30:00', access: 'readonly',
  },
  {
    id: 'pd-4', name: '培训资料',
    description: '新员工培训、技术分享、安全规范', fileCount: 62,
    owner: 'hr', updateTime: '2024-04-28 09:00:00', access: 'write',
  },
  {
    id: 'pd-5', name: '共享软件',
    description: '团队常用工具、安装包、脚本', fileCount: 34,
    owner: 'it', updateTime: '2024-04-15 11:00:00', access: 'write',
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
        <PublicDirTable :dirs="filteredDirs" :loading="loading" @open="handleOpenDir" />
      </Card>
    </div>
  </div>
</template>

<style scoped>
.public-dirs-page { display: flex; flex-direction: column; height: 100%; background: #fff; }

/* ═══ 页面顶部概览 ═══ */
.page-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; background: #fff; border-bottom: 1px solid #f0f0f0; gap: 16px; flex-shrink: 0; }
.page-header-left { display: flex; align-items: center; gap: 12px; }
.page-icon-box { width: 44px; height: 44px; border-radius: 10px; background: #fff7e6; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.page-title { font-size: 16px; font-weight: 600; color: #262626; margin: 0; line-height: 1.4; }
.page-desc { font-size: 12px; color: #8c8c8c; margin: 2px 0 0; }
.page-header-right { display: flex; align-items: center; gap: 12px; }

.overview-card { display: flex; align-items: center; gap: 8px; padding: 8px 14px; background: #f5f5f5; border-radius: 8px; min-width: 90px; }
.overview-info { display: flex; flex-direction: column; gap: 1px; }
.overview-label { font-size: 11px; color: #8c8c8c; }
.overview-value { font-size: 16px; font-weight: 600; color: #262626; font-family: 'SF Mono', 'Fira Code', monospace; }

/* ═══ 主体内容 ═══ */
.page-body { flex: 1; overflow: auto; }
.dirs-card { background: #fff; border: none; box-shadow: none; }
.dirs-card :deep(.ant-card-body) { padding: 16px; }

/* ═══ 工具栏 ═══ */
.toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; gap: 12px; }
.toolbar-left { display: flex; align-items: center; }
.toolbar-right { display: flex; align-items: center; }
.search-input { width: 280px; }

/* ═══ 响应式 ═══ */
@media (max-width: 768px) {
  .page-header { flex-direction: column; align-items: flex-start; }
  .toolbar { flex-direction: column; align-items: flex-start; gap: 10px; }
  .search-input { width: 200px; }
}
</style>

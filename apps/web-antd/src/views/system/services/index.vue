<script lang="ts" setup>
import { ref, computed } from 'vue';
import { message, Tabs } from 'ant-design-vue';
import { OverviewCard } from '#/components/ui-kit';
import { IconifyIcon } from '@vben/icons';
import type { ServiceData, ServiceCategory } from './types';
import ServiceCard from './components/ServiceCard.vue';
import ServiceGuideModal from './components/ServiceGuideModal.vue';

// ===== 使用指南内容 =====
const smbGuide = `===== Windows =====
打开文件资源管理器 → 在地址栏输入：
\\192.168.1.100
然后输入用户名和密码即可访问

===== macOS =====
Finder → 前往 → 连接服务器 → 输入：
smb://192.168.1.100

===== Linux =====
sudo mount -t cifs //192.168.1.100/share /mnt/nas -o username=admin

===== 手机端 =====
- iOS: 文件App → 浏览 → 连接服务器
- Android: 使用支持SMB的文件管理器`;

// ===== 服务数据 =====
const serviceList = ref<ServiceData[]>([
  {
    id: 'smb',
    name: 'SMB 共享',
    description: 'Windows 系统原生支持的文件共享协议，局域网内传输速度快',
    icon: 'lucide:monitor',
    iconColor: 'var(--ict-primary)',
    enabled: true,
    category: 'file-sharing',
    status: 'running',
    url: '\\\\192.168.1.100\\share',
    quickInfo: [
      { label: '共享路径', value: '/share/smb' },
      { label: '端口', value: '445' },
      { label: '认证', value: '需要' },
      { label: '工作组', value: 'WORKGROUP' },
      { label: 'SMBv1', value: '已禁用' },
    ],
    guideContent: smbGuide,
    config: {
      workgroup: 'WORKGROUP',
      serverName: 'NAS-SERVER',
      bindInterface: '全部接口',
      enableSmb1: false,
      enableSmb2: true,
      enableSmb3: true,
      guestAccess: false,
      announceService: true,
    },
  },
]);

// ===== 分类与统计 =====
const activeCategory = ref<ServiceCategory>('file-sharing');

const filteredServices = computed(() =>
  serviceList.value.filter((s) => s.category === activeCategory.value),
);

const runningCount = computed(
  () => serviceList.value.filter((s) => s.status === 'running').length,
);
const enabledCount = computed(
  () => serviceList.value.filter((s) => s.enabled).length,
);
const totalCount = computed(() => serviceList.value.length);

// ===== 弹窗状态 =====
const guideModalVisible = ref(false);
const currentService = ref<ServiceData | null>(null);

// ===== 方法 =====
function toggleService(id: string, enabled: boolean) {
  const s = serviceList.value.find((x) => x.id === id);
  if (s) {
    s.enabled = enabled;
    s.status = enabled ? 'running' : 'stopped';
    message.success(`${s.name} ${enabled ? '已启用' : '已禁用'}`);
  }
}

function copyUrl(url: string) {
  navigator.clipboard
    .writeText(url)
    .then(() => message.success('访问地址已复制到剪贴板'))
    .catch(() => message.error('复制失败'));
}

function openGuideModal(s: ServiceData) {
  currentService.value = s;
  guideModalVisible.value = true;
}
</script>

<template>
  <div class="service-settings-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-header-left">
        <div>
          <h1 class="page-title">服务设置</h1>
          <p class="page-desc">管理系统各项服务的启用状态和配置参数</p>
        </div>
      </div>
      <!-- 概览统计 -->
      <div class="page-header-stats">
      <OverviewCard icon="lucide:activity" icon-color="var(--ict-success)" icon-bg="var(--ict-success-light)" label="运行中" :value="runningCount" />
      <OverviewCard icon="lucide:toggle-right" icon-color="var(--ict-primary)" icon-bg="var(--ict-primary-light)" label="已启用" :value="enabledCount" />
      <OverviewCard icon="lucide:layers" icon-color="var(--ict-text-secondary)" icon-bg="var(--ict-bg-page)" label="总服务" :value="totalCount" />
      </div>
    </div>

    <!-- 分类 Tabs -->
    <div class="category-tabs-wrapper">
      <Tabs
        v-model:activeKey="activeCategory"
        class="category-tabs"
        :tabBarStyle="{ marginBottom: '16px', paddingLeft: '20px', paddingRight: '20px' }"
      >
        <Tabs.TabPane key="file-sharing" tab="文件共享">
          <template #tab>
            <span class="tab-label">
              <IconifyIcon icon="lucide:folder-open" style="margin-right: 6px;" />
              文件共享
            </span>
          </template>
        </Tabs.TabPane>
      </Tabs>
    </div>

    <!-- 服务列表 -->
    <div class="service-list">
      <div v-if="filteredServices.length === 0" class="empty-placeholder">
        <IconifyIcon icon="lucide:inbox" style="font-size: 48px; color: var(--ict-text-disabled);" />
        <p>该分类下暂无服务</p>
      </div>
      <ServiceCard
        v-for="s in filteredServices"
        :key="s.id"
        :service="s"
        @toggle="toggleService"
        @guide="openGuideModal"
        @copy="copyUrl"
      />
    </div>

    <!-- 使用指南弹窗 -->
    <ServiceGuideModal
      v-model:visible="guideModalVisible"
      :service="currentService"
    />
  </div>
</template>

<style scoped>
.service-settings-page {
  padding-bottom: 32px;
  min-height: 100vh;
  background: var(--ict-bg-card);
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: var(--ict-bg-card);
  border-bottom: 1px solid var(--ict-border-light);
  margin-bottom: 0;
  gap: 16px;
  flex-wrap: wrap;
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
  background: var(--ict-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.page-title {
  font-size: var(--ict-title-medium);
  font-weight: 600;
  color: var(--ict-text-emphasis);
  margin: 0;
  line-height: 1.4;
}

.page-desc {
  font-size: var(--ict-body-small);
  color: var(--ict-text-secondary);
  margin: 2px 0 0;
}

.page-header-stats {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}


/* 分类 Tabs */
.category-tabs-wrapper {
  background: var(--ict-bg-card);
}

.category-tabs :deep(.ant-tabs-nav) {
  margin-bottom: 0 !important;
}

.tab-label {
  display: inline-flex;
  align-items: center;
}

/* 服务列表 */
.service-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 20px;
}

.empty-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 20px;
  background: var(--ict-bg-card);
  border-radius: 12px;
  border: 1px solid var(--ict-border);
  color: var(--ict-text-secondary);
}

.empty-placeholder p {
  margin-top: 12px;
  font-size: var(--ict-body-medium);
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .page-header-stats {
    width: 100%;
    justify-content: space-between;
  }
}
</style>

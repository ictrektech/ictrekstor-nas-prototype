<script lang="ts" setup>
import { ref, computed } from 'vue';
import { message, Tabs, Tag } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import type { ServiceData, ServiceCategory } from './types';
import ServiceCard from './components/ServiceCard.vue';
import ServiceGuideModal from './components/ServiceGuideModal.vue';
import ServiceConfigModal from './components/ServiceConfigModal.vue';

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

const afpGuide = `===== macOS =====
Finder → 前往 → 连接服务器 → 输入：
afp://192.168.1.100:548

===== 自动发现 =====
确保Mac与NAS在同一网络，打开Finder侧边栏即可看到NAS设备`;

const ftpGuide = `===== 通用FTP客户端 =====
主机：192.168.1.100
端口：21
用户名：your_username
密码：your_password

===== 命令行 =====
ftp 192.168.1.100
# 或使用lftp
lftp -u username,password 192.168.1.100

===== 浏览器访问 =====
ftp://username:password@192.168.1.100`;

const webdavGuide = `===== 通用WebDAV客户端 =====
地址：http://192.168.1.100:5005/webdav
用户名：your_username
密码：your_password

===== Windows 映射 =====
打开"此电脑" → 映射网络驱动器 → 输入：
http://192.168.1.100:5005/webdav

===== macOS =====
Finder → 前往 → 连接服务器 → 输入：
http://192.168.1.100:5005/webdav

===== 手机端 =====
- iOS: 文件App 支持WebDAV
- Android: 使用Solid Explorer等应用`;

const nfsGuide = `===== Linux =====
sudo mount -t nfs 192.168.1.100:/share/nfs /mnt/nas

===== /etc/fstab 自动挂载 =====
192.168.1.100:/share/nfs /mnt/nas nfs defaults 0 0

===== 导出选项 =====
建议配置：rw,sync,no_subtree_check,no_root_squash`;

// ===== 服务数据 =====
const serviceList = ref<ServiceData[]>([
  // --- 文件共享 ---
  {
    id: 'smb',
    name: 'SMB 共享',
    description: 'Windows 系统原生支持的文件共享协议，局域网内传输速度快',
    icon: 'lucide:monitor',
    iconColor: '#1677ff',
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
  {
    id: 'nfs',
    name: 'NFS 共享',
    description: 'Linux / Unix 系统原生支持的文件共享协议，性能优异',
    icon: 'lucide:terminal',
    iconColor: '#52c41a',
    enabled: true,
    category: 'file-sharing',
    status: 'running',
    url: '192.168.1.100:/share/nfs',
    quickInfo: [
      { label: '共享路径', value: '/share/nfs' },
      { label: '端口', value: '2049' },
      { label: '认证', value: '不需要' },
      { label: 'NFSv4', value: '已启用' },
      { label: 'Root Squash', value: 'no_root_squash' },
    ],
    guideContent: nfsGuide,
    config: {
      bindInterface: '全部接口',
      enableNfsv3: true,
      enableNfsv4: true,
      rootSquash: true,
      allSquash: false,
    },
  },
  {
    id: 'webdav',
    name: 'WebDAV',
    description: '基于 HTTP 的文件共享协议，支持跨平台远程访问',
    icon: 'lucide:globe',
    iconColor: '#722ed1',
    enabled: true,
    category: 'file-sharing',
    status: 'running',
    url: 'http://192.168.1.100:5005',
    quickInfo: [
      { label: '共享路径', value: '/share/webdav' },
      { label: '端口', value: '5005' },
      { label: '认证', value: '需要' },
      { label: 'HTTPS', value: '未启用' },
    ],
    guideContent: webdavGuide,
    config: {
      port: 5005,
      bindInterface: '全部接口',
      enableHttps: false,
      enableDav: true,
      enableCaldav: false,
      enableCarddav: false,
    },
  },
  {
    id: 'ftp',
    name: 'FTP 共享',
    description: '传统文件传输协议，兼容性好，适合大文件批量传输',
    icon: 'lucide:upload',
    iconColor: '#faad14',
    enabled: false,
    category: 'file-sharing',
    status: 'stopped',
    url: 'ftp://192.168.1.100:21',
    quickInfo: [
      { label: '共享路径', value: '/share/ftp' },
      { label: '端口', value: '21' },
      { label: '认证', value: '需要' },
      { label: '被动模式', value: '已启用' },
    ],
    guideContent: ftpGuide,
    config: {
      ftpMode: '被动模式',
      bindInterface: '全部接口',
      port: 21,
      maxConnections: 50,
      passivePortRange: '50000-51000',
      enableAnonymous: false,
      enableFtps: false,
    },
  },
  {
    id: 'afp',
    name: 'AFP 共享',
    description: 'Apple Filing Protocol，macOS 系统原生支持的文件共享协议',
    icon: 'lucide:apple',
    iconColor: '#000000',
    enabled: false,
    category: 'file-sharing',
    status: 'stopped',
    url: 'afp://192.168.1.100:548',
    quickInfo: [
      { label: '共享路径', value: '/share/afp' },
      { label: '端口', value: '548' },
      { label: '认证', value: '需要' },
      { label: 'Time Machine', value: '已启用' },
    ],
    guideContent: afpGuide,
    config: {
      serverName: 'AFP-SERVER',
      bindInterface: '全部接口',
      enableAfp3: true,
      enableBonjour: true,
      enableTimeMachine: true,
    },
  },
  // --- 管理系统 ---
  {
    id: 'http-mgmt',
    name: '管理页面 (HTTP)',
    description: 'NAS 管理后台的 HTTP/HTTPS 访问配置，包括端口绑定和安全策略',
    icon: 'lucide:shield',
    iconColor: '#eb2f96',
    enabled: true,
    category: 'management',
    status: 'running',
    url: 'http://192.168.1.100:5000',
    quickInfo: [
      { label: '端口', value: '5000' },
      { label: 'HTTPS', value: '未启用' },
      { label: '会话超时', value: '30分钟' },
      { label: 'CSP', value: '已启用' },
    ],
    guideContent: '',
    config: {
      port: 5000,
      bindInterface: '全部接口',
      enableHttps: false,
      enableHsts: false,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      allowedIps: '0.0.0.0/0',
      enableCsp: true,
    },
  },
]);

// ===== 分类与统计 =====
const activeCategory = ref<ServiceCategory>('file-sharing');

const categoryConfig: Record<ServiceCategory, { label: string; icon: string }> = {
  'file-sharing': { label: '文件共享', icon: 'lucide:folder-open' },
  'management': { label: '管理系统', icon: 'lucide:shield' },
  'remote-access': { label: '远程访问', icon: 'lucide:globe' },
};

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
const configModalVisible = ref(false);
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

function openConfigModal(s: ServiceData) {
  currentService.value = s;
  configModalVisible.value = true;
}

function handleSaveConfig(data: { id: string; config: Record<string, any> }) {
  const s = serviceList.value.find((x) => x.id === data.id);
  if (s) {
    s.config = { ...data.config };
    // 同步更新 quickInfo
    syncQuickInfo(s);
    message.success(`${s.name} 配置已保存`);
  }
}

/** 根据配置同步快速信息展示 */
function syncQuickInfo(s: ServiceData) {
  const c = s.config;
  switch (s.id) {
    case 'smb':
      s.quickInfo = [
        { label: '共享路径', value: '/share/smb' },
        { label: '端口', value: '445' },
        { label: '工作组', value: c.workgroup || 'WORKGROUP' },
        { label: 'SMBv3', value: c.enableSmb3 ? '已启用' : '已禁用' },
        { label: '访客访问', value: c.guestAccess ? '允许' : '禁止' },
      ];
      break;
    case 'http-mgmt':
      s.quickInfo = [
        { label: '端口', value: String(c.port || 5000) },
        { label: 'HTTPS', value: c.enableHttps ? '已启用' : '未启用' },
        { label: '会话超时', value: `${c.sessionTimeout || 30}分钟` },
        { label: 'CSP', value: c.enableCsp ? '已启用' : '未启用' },
      ];
      break;
    case 'ftp':
      s.quickInfo = [
        { label: '共享路径', value: '/share/ftp' },
        { label: '端口', value: String(c.port || 21) },
        { label: '模式', value: c.ftpMode || '被动模式' },
        { label: '匿名访问', value: c.enableAnonymous ? '允许' : '禁止' },
      ];
      break;
    case 'webdav':
      s.quickInfo = [
        { label: '共享路径', value: '/share/webdav' },
        { label: '端口', value: String(c.port || 5005) },
        { label: 'HTTPS', value: c.enableHttps ? '已启用' : '未启用' },
      ];
      break;
    case 'afp':
      s.quickInfo = [
        { label: '共享路径', value: '/share/afp' },
        { label: '端口', value: '548' },
        { label: 'Time Machine', value: c.enableTimeMachine ? '已启用' : '未启用' },
      ];
      break;
    case 'nfs':
      s.quickInfo = [
        { label: '共享路径', value: '/share/nfs' },
        { label: '端口', value: '2049' },
        { label: 'NFSv4', value: c.enableNfsv4 ? '已启用' : '未启用' },
      ];
      break;
  }
}
</script>

<template>
  <div class="service-settings-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-header-left">
        <div class="page-icon-box">
          <IconifyIcon
            icon="lucide:server-cog"
            style="font-size: 22px; color: #1677ff;"
          />
        </div>
        <div>
          <h1 class="page-title">服务设置</h1>
          <p class="page-desc">管理系统各项服务的启用状态和配置参数</p>
        </div>
      </div>
      <!-- 概览统计 -->
      <div class="page-header-stats">
        <div class="stat-card">
          <IconifyIcon
            icon="lucide:activity"
            style="font-size: 16px; color: #52c41a;"
          />
          <div class="stat-info">
            <span class="stat-label">运行中</span>
            <span class="stat-value">{{ runningCount }}</span>
          </div>
        </div>
        <div class="stat-card">
          <IconifyIcon
            icon="lucide:toggle-right"
            style="font-size: 16px; color: #1677ff;"
          />
          <div class="stat-info">
            <span class="stat-label">已启用</span>
            <span class="stat-value">{{ enabledCount }}</span>
          </div>
        </div>
        <div class="stat-card">
          <IconifyIcon
            icon="lucide:layers"
            style="font-size: 16px; color: #8c8c8c;"
          />
          <div class="stat-info">
            <span class="stat-label">总服务</span>
            <span class="stat-value">{{ totalCount }}</span>
          </div>
        </div>
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
        <Tabs.TabPane key="management" tab="管理系统">
          <template #tab>
            <span class="tab-label">
              <IconifyIcon icon="lucide:shield" style="margin-right: 6px;" />
              管理系统
            </span>
          </template>
        </Tabs.TabPane>
        <Tabs.TabPane key="remote-access" tab="远程访问">
          <template #tab>
            <span class="tab-label">
              <IconifyIcon icon="lucide:globe" style="margin-right: 6px;" />
              远程访问
            </span>
          </template>
        </Tabs.TabPane>
      </Tabs>
    </div>

    <!-- 服务列表 -->
    <div class="service-list">
      <div v-if="filteredServices.length === 0" class="empty-placeholder">
        <IconifyIcon icon="lucide:inbox" style="font-size: 48px; color: #d9d9d9;" />
        <p>该分类下暂无服务</p>
      </div>
      <ServiceCard
        v-for="s in filteredServices"
        :key="s.id"
        :service="s"
        @toggle="toggleService"
        @guide="openGuideModal"
        @configure="openConfigModal"
        @copy="copyUrl"
      />
    </div>

    <!-- 使用指南弹窗 -->
    <ServiceGuideModal
      v-model:visible="guideModalVisible"
      :service="currentService"
    />

    <!-- 配置弹窗 -->
    <ServiceConfigModal
      v-model:visible="configModalVisible"
      :service="currentService"
      @save="handleSaveConfig"
    />
  </div>
</template>

<style scoped>
.service-settings-page {
  padding-bottom: 32px;
  min-height: 100vh;
  background: #f5f5f5;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
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
  background: #e6f4ff;
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

.page-header-stats {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: #f5f5f5;
  border-radius: 8px;
  min-width: 90px;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.stat-label {
  font-size: 11px;
  color: #8c8c8c;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

/* 分类 Tabs */
.category-tabs-wrapper {
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.category-tabs :deep(.ant-tabs-nav) {
  margin-bottom: 0;
}

.tab-label {
  display: inline-flex;
  align-items: center;
}

/* 服务列表 */
.service-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 16px 20px;
}

.empty-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 20px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  color: #8c8c8c;
}

.empty-placeholder p {
  margin-top: 12px;
  font-size: 14px;
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

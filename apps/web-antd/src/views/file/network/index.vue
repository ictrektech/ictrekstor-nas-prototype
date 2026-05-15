<script lang="ts" setup>
import { ref, computed } from 'vue';
import { message } from 'ant-design-vue';
import NetworkPageHeader from './components/NetworkPageHeader.vue';
import ProtocolCard from './components/ProtocolCard.vue';
import type { ProtocolData } from './components/ProtocolCard.vue';
import ProtocolGuideModal from './components/ProtocolGuideModal.vue';
import ProtocolConfigModal from './components/ProtocolConfigModal.vue';

const smbGuide = `===== Windows =====
打开文件资源管理器 → 在地址栏输入：
\\\\192.168.1.100
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

const protocolList = ref<ProtocolData[]>([
  {
    id: 'smb',
    name: 'SMB 共享',
    description: 'Windows 系统原生支持的文件共享协议，局域网内传输速度快',
    icon: 'lucide:monitor',
    iconColor: '#1677ff',
    enabled: true,
    url: '\\\\192.168.1.100\\share',
    config: [
      { label: '共享路径', value: '/share/smb' },
      { label: '端口', value: '445' },
      { label: '认证', value: '需要' },
      { label: '自动挂载', value: '已启用' },
      { label: '工作组', value: 'WORKGROUP' },
      { label: 'SMBv1', value: '已禁用' },
    ],
    guideContent: smbGuide,
  },
  {
    id: 'nfs',
    name: 'NFS 共享',
    description: 'Linux / Unix 系统原生支持的文件共享协议，性能优异',
    icon: 'lucide:terminal',
    iconColor: '#52c41a',
    enabled: true,
    url: '192.168.1.100:/share/nfs',
    config: [
      { label: '共享路径', value: '/share/nfs' },
      { label: '端口', value: '2049' },
      { label: '认证', value: '不需要' },
      { label: '自动挂载', value: '未启用' },
      { label: 'Root Squash', value: 'no_root_squash' },
    ],
    guideContent: '',
  },
  {
    id: 'webdav',
    name: 'WebDAV',
    description: '基于 HTTP 的文件共享协议，支持跨平台远程访问',
    icon: 'lucide:globe',
    iconColor: '#722ed1',
    enabled: true,
    url: 'http://192.168.1.100:5005',
    config: [
      { label: '共享路径', value: '/share/webdav' },
      { label: '端口', value: '5005' },
      { label: '认证', value: '需要' },
      { label: '自动挂载', value: '未启用' },
      { label: 'HTTPS', value: '未启用' },
    ],
    guideContent: webdavGuide,
  },
  {
    id: 'ftp',
    name: 'FTP 共享',
    description: '传统文件传输协议，兼容性好，适合大文件批量传输',
    icon: 'lucide:upload',
    iconColor: '#faad14',
    enabled: false,
    url: 'ftp://192.168.1.100:21',
    config: [
      { label: '共享路径', value: '/share/ftp' },
      { label: '端口', value: '21' },
      { label: '认证', value: '需要' },
      { label: '自动挂载', value: '未启用' },
      { label: '被动模式', value: '已启用' },
    ],
    guideContent: ftpGuide,
  },
  {
    id: 'afp',
    name: 'AFP 共享',
    description: 'Apple Filing Protocol，macOS 系统原生支持的文件共享协议',
    icon: 'lucide:apple',
    iconColor: '#000000',
    enabled: false,
    url: 'afp://192.168.1.100:548',
    config: [
      { label: '共享路径', value: '/share/afp' },
      { label: '端口', value: '548' },
      { label: '认证', value: '需要' },
      { label: '自动挂载', value: '未启用' },
      { label: 'Time Machine', value: '已启用' },
    ],
    guideContent: afpGuide,
  },
]);

const activeCount = computed(
  () => protocolList.value.filter((p) => p.enabled).length,
);

// 弹窗状态
const guideModalVisible = ref(false);
const configModalVisible = ref(false);
const currentProtocol = ref<ProtocolData | null>(null);

// 方法
function toggleProtocol(id: string, enabled: boolean) {
  const p = protocolList.value.find((x) => x.id === id);
  if (p) {
    p.enabled = enabled;
    message.success(`${p.name} ${enabled ? '已启用' : '已禁用'}`);
  }
}

function copyUrl(url: string) {
  navigator.clipboard
    .writeText(url)
    .then(() => message.success('访问地址已复制到剪贴板'))
    .catch(() => message.error('复制失败'));
}

function openGuideModal(p: ProtocolData) {
  currentProtocol.value = p;
  guideModalVisible.value = true;
}

function openConfigModal(p: ProtocolData) {
  currentProtocol.value = p;
  configModalVisible.value = true;
}

function handleSaveConfig(data: any) {
  message.success(`${currentProtocol.value?.name || ''} 配置已保存`);
}
</script>

<template>
  <div class="network-access-page">
    <!-- 页面头部 -->
    <NetworkPageHeader :active-count="activeCount" />

    <!-- 协议卡片列表 -->
    <div class="protocol-list">
      <ProtocolCard
        v-for="p in protocolList"
        :key="p.id"
        :protocol="p"
        @toggle="toggleProtocol"
        @guide="openGuideModal"
        @configure="openConfigModal"
        @copy="copyUrl"
      />
    </div>

    <!-- 使用指南弹窗 -->
    <ProtocolGuideModal
      v-model:visible="guideModalVisible"
      :protocol="currentProtocol"
    />

    <!-- 高级配置弹窗 -->
    <ProtocolConfigModal
      v-model:visible="configModalVisible"
      :protocol="currentProtocol"
      @save="handleSaveConfig"
    />
  </div>
</template>

<style scoped>
.network-access-page {
  padding-bottom: 32px;
  min-height: 100vh;
  background: #fff;
}

.protocol-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
}

</style>

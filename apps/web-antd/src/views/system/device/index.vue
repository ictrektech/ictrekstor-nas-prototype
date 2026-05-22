<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Card, Tag, message, Modal, Descriptions } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import { getDisksApi, getStoragePoolsApi, type DiskInfo, type StoragePool } from '#/api/storage';
import { getNetworksApi, updateNetworkApi, type NetworkConfig } from '#/api/system';
import { getDashboardSummaryApi, type DashboardSummary } from '#/api/dashboard';
import { Badge, OverviewCard, PageHeader, SectionCard } from '#/components/ui-kit';

import DeviceInfoHero from './components/DeviceInfoHero.vue';
import ResourceUsageCard from './components/ResourceUsageCard.vue';
import DiskCard from './components/DiskCard.vue';
import NetworkCard from './components/NetworkCard.vue';
import NetworkConfigModal from './components/NetworkConfigModal.vue';
import DeviceDiagramPanel from './components/DeviceDiagramPanel.vue';

const router = useRouter();
const disks = ref<DiskInfo[]>([]);
const pools = ref<StoragePool[]>([]);
const networks = ref<NetworkConfig[]>([]);
const summary = ref<DashboardSummary | null>(null);
const loading = ref(false);

const selectedDiagramDisk = ref('');
const diagramRef = ref<InstanceType<typeof DeviceDiagramPanel> | null>(null);

// 网卡配置弹窗
const configModalVisible = ref(false);
const editingNetwork = ref<NetworkConfig | null>(null);

// 磁盘详情弹窗
const diskDetailVisible = ref(false);
const selectedDiskForDetail = ref<DiskInfo | null>(null);

// 模拟历史数据
const cpuHistory = [18,22,25,20,30,28,35,32,25,22,20,23,26,29,33,31,27,24,22,25];
const memHistory = [40,42,45,43,48,46,50,47,44,42,41,45,47,46,48,49,47,45,44,46];

async function loadData() {
  loading.value = true;
  try {
    const [dRes, pRes, nRes, sRes] = await Promise.all([
      getDisksApi(), getStoragePoolsApi(), getNetworksApi(), getDashboardSummaryApi(),
    ]);
    disks.value = dRes; pools.value = pRes; networks.value = nRes; summary.value = sRes;
  } finally { loading.value = false; }
}

// 硬盘操作
function locateDisk(disk: DiskInfo) {
  selectedDiagramDisk.value = disk.deviceName;
  diagramRef.value?.highlightBay(disk.deviceName);
}
function sleepDisk(disk: DiskInfo) { message.success(`硬盘 ${disk.deviceName} 已休眠`); disk.status = '休眠'; }
function blinkDisk(disk: DiskInfo) { message.success(`硬盘 ${disk.deviceName} 指示灯已切换`); }
function goToDiskDetail(disk: DiskInfo) { router.push(`/storage/disks/detail/${disk.deviceName}`); }

// 网卡操作
function openConfigModal(net: NetworkConfig) { editingNetwork.value = net; configModalVisible.value = true; }
async function saveConfig(form: any, net: NetworkConfig) {
  await updateNetworkApi(net.name, form);
  const idx = networks.value.findIndex((n) => n.name === net.name);
  if (idx !== -1) networks.value[idx] = { ...networks.value[idx], ...form };
  message.success(`网卡 ${net.name} 配置已更新`);
  configModalVisible.value = false;
}
function goToNetworkDetail(net: NetworkConfig) { router.push(`/system/device/network/${net.name}`); }

// 硬件示意图事件
function handleDiagramSelect(disk: DiskInfo | null) {
  selectedDiagramDisk.value = disk ? disk.deviceName : '';
}
function handleDiagramLocate(name: string) { selectedDiagramDisk.value = name; }

const cpuAvg = computed(() => Math.round(cpuHistory.reduce((a,b)=>a+b,0)/cpuHistory.length));
const memAvg = computed(() => Math.round(memHistory.reduce((a,b)=>a+b,0)/memHistory.length));

// 网络连接统计
const connectedCount = computed(() => networks.value.filter((n) => n.connectionStatus === '已连接').length);
const disconnectedCount = computed(() => networks.value.length - connectedCount.value);

onMounted(loadData);
</script>

<template>
  <div class="device-manager">
    <!-- 页面标题 —— UI KIT PageHeader（右侧展示硬件统计 chips） -->
    <PageHeader
      icon="lucide:cpu"
      title="设备管理"
      description="查看设备信息、CPU/内存资源、硬盘状态和网络配置"
    >
      <template #extra>
        <div class="device-info-chips">
          <OverviewCard
            icon="lucide:cpu"
            icon-color="var(--ict-primary)"
            icon-bg="var(--ict-primary-light)"
            label="CPU"
            :value="(summary?.hardware?.cpuCores || 4) + ' 核'"
          />
          <OverviewCard
            icon="lucide:memory-stick"
            icon-color="var(--ict-success)"
            icon-bg="var(--ict-success-light)"
            label="内存"
            :value="summary?.memorySize || '8 GB'"
          />
          <OverviewCard
            icon="lucide:hard-drive"
            icon-color="var(--ict-warning)"
            icon-bg="var(--ict-warning-light)"
            label="硬盘"
            :value="disks.length + ' 块'"
          />
        </div>
      </template>
    </PageHeader>

    <!-- 设备信息 Hero（设备名 + 设备ID + 运行时间 + 系统版本 + 远程连接） -->
    <DeviceInfoHero
      :device-name="summary?.deviceName || 'VIVIBIT E1001'"
      :device-id="summary?.deviceId || '02680d4'"
      :system-version="summary?.systemVersion || '1.1.0'"
      :uptime="summary?.uptime || '12 天 10 小时 8 分钟 29 秒'"
      :remote-access="summary?.remoteAccess || '已启用 (QuickConnect)'"
    />

    <!-- 硬件示意图 -->
    <DeviceDiagramPanel
      class="diagram-section"
      ref="diagramRef"
      :disks="disks"
      :selected-disk="selectedDiagramDisk"
      @select="handleDiagramSelect"
      @locate="handleDiagramLocate"
    />

    <!-- CPU + 内存 资源（横排） -->
    <div class="resource-row">
      <ResourceUsageCard
        title="CPU 使用率"
        icon="lucide:cpu"
        icon-bg="var(--ict-primary)"
        :usage-percent="Math.round(cpuHistory[cpuHistory.length-1])"
        :avg-percent="cpuAvg"
        :history-data="cpuHistory"
        :color-theme="'var(--ict-primary)'"
        :specs="[
          { label: '型号', value: summary?.cpuModel || 'Intel Celeron J4125' },
          { label: '核心', value: '4 核' },
          { label: '频率', value: '2.0 GHz' },
        ]"
      />
      <ResourceUsageCard
        title="内存使用率"
        icon="lucide:memory-stick"
        icon-bg="var(--ict-success)"
        :usage-percent="Math.round(memHistory[memHistory.length-1])"
        :avg-percent="memAvg"
        :history-data="memHistory"
        :color-theme="'var(--ict-success)'"
        :specs="[
          { label: '总量', value: summary?.memorySize || '8 GB' },
          { label: '已用', value: '3.2 GB' },
          { label: '可用', value: '4.8 GB' },
        ]"
      />
    </div>

    <!-- 硬盘列表 —— UI KIT SectionCard（保留边框/圆角，无 hover 阴影） -->
    <SectionCard
      class="flat-section"
      title="存储设备"
      :count="disks.length"
    >
      <div class="disk-grid-2col">
        <DiskCard
          v-for="disk in disks"
          :key="disk.deviceName"
          :disk="disk"
          :pools="pools"
          @locate="locateDisk"
          @sleep="sleepDisk"
          @blink="blinkDisk"
          @detail="goToDiskDetail"
        />
      </div>
    </SectionCard>

    <!-- 网络概览 —— UI KIT SectionCard（保留边框/圆角，无 hover 阴影） -->
    <SectionCard
      class="flat-section"
      icon="lucide:plug-zap"
      icon-color="var(--ict-text-emphasis)"
      title="网络概览"
    >
      <template #title-extra>
        <!-- 全局 Badge —— 严格遵循 SKILL.md §3.8（gap 20px / 文本后追加 emphasis 数字） -->
        <div class="net-overview-stats">
          <span class="net-overview-stat">
            <Badge text="已连接" type="success" />
            <span class="net-overview-count">{{ connectedCount }}</span>
          </span>
          <span class="net-overview-stat">
            <Badge text="未连接" type="default" />
            <span class="net-overview-count">{{ disconnectedCount }}</span>
          </span>
        </div>
      </template>
      <div class="net-grid-2col">
        <NetworkCard
          v-for="net in networks"
          :key="net.name"
          :network="net"
          @config="openConfigModal"
          @detail="goToNetworkDetail"
        />
      </div>
    </SectionCard>

    <!-- 磁盘详情弹窗 -->
    <Modal
      v-model:open="diskDetailVisible"
      :title="`磁盘 ${selectedDiskForDetail?.deviceName || ''} 详情`"
      width="480px"
      :footer="null"
    >
      <Descriptions v-if="selectedDiskForDetail" :column="1" size="small" bordered>
        <Descriptions.Item label="设备名称">{{ selectedDiskForDetail.deviceName }}</Descriptions.Item>
        <Descriptions.Item label="型号">{{ selectedDiskForDetail.model || '-' }}</Descriptions.Item>
        <Descriptions.Item label="容量">{{ selectedDiskForDetail.size || '-' }}</Descriptions.Item>
        <Descriptions.Item label="类型">{{ selectedDiskForDetail.deviceType || '-' }}</Descriptions.Item>
        <Descriptions.Item label="接口">{{ selectedDiskForDetail.interfaceType || 'SATA' }}</Descriptions.Item>
        <Descriptions.Item label="序列号">{{ selectedDiskForDetail.serial || '-' }}</Descriptions.Item>
        <Descriptions.Item label="状态">{{ selectedDiskForDetail.status || '-' }}</Descriptions.Item>
        <Descriptions.Item label="健康">{{ selectedDiskForDetail.healthStatus || '-' }}</Descriptions.Item>
        <Descriptions.Item label="温度">{{ selectedDiskForDetail.temperature || '-' }}</Descriptions.Item>
        <Descriptions.Item label="通电时间">{{ selectedDiskForDetail.powerOnHours || '-' }}</Descriptions.Item>
        <Descriptions.Item label="路径">{{ selectedDiskForDetail.devicePath || '-' }}</Descriptions.Item>
      </Descriptions>
    </Modal>

    <!-- 网卡配置弹窗 -->
    <NetworkConfigModal
      v-model:visible="configModalVisible"
      :network="editingNetwork"
      @save="saveConfig"
    />
  </div>
</template>

<style scoped>
.device-manager {
  padding: 0 20px 16px;
  width: 100%;
  /* 统一卡片之间的垂直间距：通过 flex 布局 + gap 实现，避免每个子组件单独设置 margin */
  display: flex;
  flex-direction: column;
  gap: var(--ict-space-4); /* 16px */
}

/* SectionCard 自带 margin-bottom，flex gap 已统一间距，禁用其多余的下外边距 */
.device-manager :deep(.section-card) {
  margin-bottom: 0;
}

/* "存储设备" / "网络接口" 区块：保留卡片边框和圆角，但取消 hover 阴影效果 */
.flat-section,
.flat-section :deep(.ant-card) {
  box-shadow: none !important;
}

.flat-section:hover,
.flat-section:hover :deep(.ant-card) {
  box-shadow: none !important;
  transform: none !important;
}

/* PageHeader 自带 margin-bottom: 16px，flex gap 已统一间距，禁用其多余的下外边距 */
.device-manager :deep(.page-header) {
  margin-bottom: 0;
}

/* 与存储空间页 .volumes-grid 一致：minmax(300px, 1fr) + gap 12px，
   保证卡片自适应分列、与"存储空间"页布局节奏统一 */
.disk-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--ict-space-3);
}

/* 网络概览：每行 2 个网口卡片 */
.net-grid-2col {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--ict-space-4);
}
.net-grid-2col > * { min-width: 0; }

@media (max-width: 992px) {
  .net-grid-2col { grid-template-columns: 1fr; }
}

/* 网络概览右上角连接统计 —— §3.8 使用规范 #4（项间 20px）+ #5（数字 emphasis） */
.net-overview-stats {
  display: inline-flex;
  align-items: center;
  gap: var(--ict-space-5);
}
.net-overview-stat {
  display: inline-flex;
  align-items: center;
  gap: var(--ict-space-2);
}
.net-overview-count {
  font-size: var(--ict-body-medium);
  color: var(--ict-text-emphasis);
  font-weight: 500;
  line-height: 20px;
}

/* 存储设备区块：固定每行 3 个卡片 */
.disk-grid-2col {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--ict-space-3);
}

.disk-grid-2col > * { min-width: 0; }

/* 中屏回退为 2 列，小屏回退为单列 */
@media (max-width: 1200px) {
  .disk-grid-2col { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 768px) {
  .disk-grid-2col { grid-template-columns: 1fr; }
}

/* 硬件统计 chips（位于 PageHeader 右侧） */
.device-info-chips {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

/* CPU + 内存 横向 2 列等宽，中间间距 16px（与卡片之间间距统一） */
.resource-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--ict-space-4);
}

.resource-row > * { min-width: 0; }

@media (max-width: 992px) {
  .resource-row { grid-template-columns: 1fr; }
}
</style>

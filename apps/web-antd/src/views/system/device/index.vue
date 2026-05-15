<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Card, Tag, message, Modal, Descriptions } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import { getDisksApi, getStoragePoolsApi, type DiskInfo, type StoragePool } from '#/api/storage';
import { getNetworksApi, updateNetworkApi, type NetworkConfig } from '#/api/system';
import { getDashboardSummaryApi, type DashboardSummary } from '#/api/dashboard';
import { PageHeader, SectionCard } from '#/components/ui-kit';

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

onMounted(loadData);
</script>

<template>
  <div class="device-manager">
    <!-- 页面标题 —— UI KIT PageHeader -->
    <PageHeader
      icon="lucide:cpu"
      title="设备管理"
      description="查看设备信息、CPU/内存资源、硬盘状态和网络配置"
    />

    <!-- 设备信息 Hero -->
    <DeviceInfoHero
      :device-name="summary?.deviceName || 'iCTrek NAS'"
      :system-version="summary?.systemVersion || 'DSM 7.2'"
      :uptime="summary?.uptime || '30天'"
      :cpu-cores="summary?.hardware?.cpuCores || 4"
      :memory-size="summary?.memorySize || '8 GB'"
      :disk-count="disks.length"
      :device-id="summary?.deviceId || 'C7N-8821-A92D'"
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

<<<<<<< HEAD
    <!-- CPU 资源 -->
    <ResourceUsageCard
      title="CPU 使用率"
      icon="lucide:cpu"
      icon-bg="#1677ff"
      :usage-percent="Math.round(cpuHistory[cpuHistory.length-1])"
      :avg-percent="cpuAvg"
      :history-data="cpuHistory"
      :color-theme="'#1677ff'"
      :specs="[
        { label: '型号', value: summary?.cpuModel || 'Intel Celeron J4125' },
        { label: '核心', value: '4 核' },
        { label: '频率', value: '2.0 GHz' },
      ]"
    />

    <!-- 内存资源 -->
    <ResourceUsageCard
      title="内存使用率"
      icon="lucide:memory-stick"
      icon-bg="#52c41a"
      :usage-percent="Math.round(memHistory[memHistory.length-1])"
      :avg-percent="memAvg"
      :history-data="memHistory"
      :color-theme="'#52c41a'"
      :specs="[
        { label: '总量', value: summary?.memorySize || '8 GB' },
        { label: '已用', value: '3.2 GB' },
        { label: '可用', value: '4.8 GB' },
      ]"
    />

    <!-- 硬盘列表 —— UI KIT SectionCard -->
    <SectionCard
      icon="lucide:hard-drive"
      icon-color="var(--ict-primary)"
      title="存储设备"
      :count="disks.length"
    >
=======
    <!-- 存储设备 -->
    <Card class="section-card storage-section" :bordered="true" :body-style="{ padding: '16px' }">
      <template #title>
        <div class="section-title-bar">
          <div class="section-title-left">
            <IconifyIcon icon="lucide:hard-drive" style="font-size: 16px; color: #1677ff;" />
            <span class="section-title-text">存储设备</span>
            <Tag size="small" class="count-tag">{{ disks.length }} 块</Tag>
          </div>
        </div>
      </template>
>>>>>>> 052356bb2fc685856e6fd8659f2fefe3e8fd1cce
      <div class="disk-grid">
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

<<<<<<< HEAD
    <!-- 网卡列表 —— UI KIT SectionCard -->
    <SectionCard
      icon="lucide:network"
      icon-color="var(--ict-warning)"
      title="网络接口"
      :count="networks.length"
    >
      <div class="disk-grid">
=======
    <!-- CPU / 内存 并排 -->
    <div class="resource-row">
      <ResourceUsageCard
        class="resource-card-half"
        title="CPU 使用率"
        icon="lucide:cpu"
        icon-bg="#1677ff"
        :usage-percent="Math.round(cpuHistory[cpuHistory.length-1])"
        :avg-percent="cpuAvg"
        :history-data="cpuHistory"
        :color-theme="'#1677ff'"
        :specs="[
          { label: '型号', value: summary?.cpuModel || 'Intel Celeron J4125' },
          { label: '核心', value: '4 核' },
          { label: '频率', value: '2.0 GHz' },
        ]"
      />

      <ResourceUsageCard
        class="resource-card-half"
        title="内存使用率"
        icon="lucide:memory-stick"
        icon-bg="#52c41a"
        :usage-percent="Math.round(memHistory[memHistory.length-1])"
        :avg-percent="memAvg"
        :history-data="memHistory"
        :color-theme="'#52c41a'"
        :specs="[
          { label: '总量', value: summary?.memorySize || '8 GB' },
          { label: '已用', value: '3.2 GB' },
          { label: '可用', value: '4.8 GB' },
        ]"
      />
    </div>

    <!-- 网络接口 -->
    <Card class="section-card" :bordered="true" :body-style="{ padding: '16px' }">
      <template #title>
        <div class="section-title-bar">
          <div class="section-title-left">
            <IconifyIcon icon="lucide:network" style="font-size: 16px; color: #fa8c16;" />
            <span class="section-title-text">网络接口</span>
            <Tag size="small" class="count-tag">{{ networks.length }} 个</Tag>
          </div>
        </div>
      </template>
      <div class="net-grid">
>>>>>>> 052356bb2fc685856e6fd8659f2fefe3e8fd1cce
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
.device-manager { padding: 0 20px 16px; width: 100%; }
<<<<<<< HEAD
.diagram-section { margin-top: var(--ict-space-4); }
.disk-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(520px, 1fr)); gap: var(--ict-space-3); }
</style>
=======
.diagram-section { margin-top: 16px; margin-bottom: 16px; }
.storage-section { margin-bottom: 16px; border-radius: 14px; }
.resource-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 16px; margin-bottom: 16px; }
.resource-card-half { border-radius: 14px; }
.page-header { display: flex; align-items: center; padding: 12px 20px; background: #fff; gap: 16px; flex-shrink: 0; margin: 0 -20px 16px; }
.page-header-left { display: flex; align-items: center; gap: 12px; }
.page-icon-box { width: 44px; height: 44px; border-radius: 10px; background: #e6f4ff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.page-title { font-size: 16px; font-weight: 600; color: #262626; margin: 0; line-height: 1.4; }
.page-desc { font-size: 12px; color: #8c8c8c; margin: 2px 0 0; }
.section-card { margin-bottom: 16px; border-radius: 14px; }
.section-title-bar { display: flex; align-items: center; justify-content: space-between; }
.section-title-left { display: flex; align-items: center; gap: 10px; }
.section-title-text { font-size: 15px; font-weight: 600; color: #262626; }
.count-tag { font-size: 12px; background: #f5f5f5; border-color: #e8e8e8; color: #595959; }
.disk-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 12px; }
.net-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(420px, 1fr)); gap: 12px; }
</style>
>>>>>>> 052356bb2fc685856e6fd8659f2fefe3e8fd1cce

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Card, Tag, message } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import { getDisksApi, getStoragePoolsApi, type DiskInfo, type StoragePool } from '#/api/storage';
import { getNetworksApi, updateNetworkApi, type NetworkConfig } from '#/api/system';
import { getDashboardSummaryApi, type DashboardSummary } from '#/api/dashboard';

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
  message.success(`已在示意图中定位磁盘 ${disk.deviceName}`);
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
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="page-header-left">
        <div class="page-icon-box">
          <IconifyIcon icon="lucide:cpu" style="font-size: 22px; color: #1677ff;" />
        </div>
        <div>
          <h1 class="page-title">设备管理</h1>
          <p class="page-desc">查看设备信息、CPU/内存资源、硬盘状态和网络配置</p>
        </div>
      </div>
    </div>

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

    <!-- 硬盘列表 -->
    <Card class="section-card" :bordered="true" :body-style="{ padding: '16px' }">
      <template #title>
        <div class="section-title-bar">
          <div class="section-title-left">
            <IconifyIcon icon="lucide:hard-drive" style="font-size: 16px; color: #1677ff;" />
            <span class="section-title-text">存储设备</span>
            <Tag size="small" class="count-tag">{{ disks.length }} 块</Tag>
          </div>
        </div>
      </template>
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
    </Card>

    <!-- 网卡列表 -->
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
      <div class="disk-grid">
        <NetworkCard
          v-for="net in networks"
          :key="net.name"
          :network="net"
          @config="openConfigModal"
          @detail="goToNetworkDetail"
        />
      </div>
    </Card>

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
.diagram-section { margin-top: 16px; }
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
.disk-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(520px, 1fr)); gap: 12px; }
</style>
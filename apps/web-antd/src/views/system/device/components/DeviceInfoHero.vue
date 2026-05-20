<script lang="ts" setup>
import { computed } from 'vue';
import { OverviewCard } from '#/components/ui-kit';
import { Tag } from 'ant-design-vue';

const props = defineProps<{
  deviceName: string;
  systemVersion: string;
  uptime: string;
  cpuCores: number;
  memorySize: string;
  diskCount: number;
  deviceId: string;
  remoteAccess: string;
}>();

const copySerial = (serial: string) => {
  navigator.clipboard.writeText(serial);
};
</script>

<template>
  <div class="device-info-hero">
    <div class="device-info-main">
      <div class="device-avatar">
        <IconifyIcon icon="lucide:server" style="font-size: var(--ict-headline-medium); color: var(--ict-primary);" />
      </div>
      <div class="device-meta">
        <h2 class="device-name">{{ deviceName }}</h2>
        <div class="device-tags">
          <Tag color="blue" size="small">{{ systemVersion }}</Tag>
          <Tag color="green" size="small">运行 {{ uptime }}</Tag>
        </div>
      </div>
    </div>

    <div class="device-info-chips">
      <OverviewCard icon="lucide:cpu" icon-color="var(--ict-primary)" icon-bg="var(--ict-primary-light)" label="CPU" :value="cpuCores + ' 核'" />
      <OverviewCard icon="lucide:memory-stick" icon-color="var(--ict-success)" icon-bg="var(--ict-success-light)" label="内存" :value="memorySize" />
      <OverviewCard icon="lucide:hard-drive" icon-color="var(--ict-warning)" icon-bg="var(--ict-warning-light)" label="硬盘" :value="diskCount + ' 块'" />
      <OverviewCard icon="lucide:fingerprint" icon-color="var(--ict-info)" icon-bg="var(--ict-info-light)" label="设备ID" :value="deviceId" />
      <OverviewCard icon="lucide:globe" icon-color="#eb2f96" icon-bg="var(--ict-danger-light)" label="远程连接" :value="remoteAccess" />
    </div>
  </div>
</template>

<style scoped>
.device-info-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: linear-gradient(135deg, #f0f5ff 0%, var(--ict-primary-light) 50%, var(--ict-success-light) 100%);
  border-radius: 14px;
  border: 1px solid var(--ict-border);
  gap: 20px;
  flex-wrap: wrap;
}
.device-info-main { display: flex; align-items: center; gap: 16px; }
.device-avatar {
  width: 56px; height: 56px; border-radius: 14px; background: var(--ict-bg-card);
  border: 2px solid #bae0ff; display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; box-shadow: 0 2px 8px rgba(24, 144, 255, 0.12);
}
.device-meta { display: flex; flex-direction: column; gap: 6px; }
.device-name { font-size: var(--ict-title-large); font-weight: 700; color: var(--ict-text-emphasis); margin: 0; }
.device-tags { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.device-info-chips { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
</style>

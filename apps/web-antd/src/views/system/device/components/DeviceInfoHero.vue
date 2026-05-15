<script lang="ts" setup>
import { computed } from 'vue';
import { Tag } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';

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
      <div class="info-chip">
        <div class="chip-icon" style="background: var(--ict-primary-light);">
          <IconifyIcon icon="lucide:cpu" style="font-size: var(--ict-title-medium); color: var(--ict-primary);" />
        </div>
        <div class="chip-text">
          <span class="chip-value">{{ cpuCores }} 核</span>
          <span class="chip-label">CPU</span>
        </div>
      </div>
      <div class="info-chip">
        <div class="chip-icon" style="background: var(--ict-success-light);">
          <IconifyIcon icon="lucide:memory-stick" style="font-size: var(--ict-title-medium); color: var(--ict-success);" />
        </div>
        <div class="chip-text">
          <span class="chip-value">{{ memorySize }}</span>
          <span class="chip-label">内存</span>
        </div>
      </div>
      <div class="info-chip">
        <div class="chip-icon" style="background: var(--ict-warning-light);">
          <IconifyIcon icon="lucide:hard-drive" style="font-size: var(--ict-title-medium); color: var(--ict-warning);" />
        </div>
        <div class="chip-text">
          <span class="chip-value">{{ diskCount }} 块</span>
          <span class="chip-label">硬盘</span>
        </div>
      </div>
      <div class="info-chip">
        <div class="chip-icon" style="background: var(--ict-info-light);">
          <IconifyIcon icon="lucide:fingerprint" style="font-size: var(--ict-title-medium); color: var(--ict-info);" />
        </div>
        <div class="chip-text">
          <span class="chip-value mono">{{ deviceId }}</span>
          <span class="chip-label">设备ID</span>
        </div>
      </div>
      <div class="info-chip">
        <div class="chip-icon" style="background: var(--ict-danger-light);">
          <IconifyIcon icon="lucide:globe" style="font-size: var(--ict-title-medium); color: #eb2f96;" />
        </div>
        <div class="chip-text">
          <span class="chip-value chip-link">{{ remoteAccess }}</span>
          <span class="chip-label">远程连接</span>
        </div>
      </div>
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
.info-chip {
  display: flex; align-items: center; gap: 8px; padding: 8px 12px;
  background: var(--ict-bg-card); border-radius: 10px; border: 1px solid var(--ict-border-light);
  box-shadow: 0 1px 3px rgba(0,0,0,0.04); transition: all 0.3s;
}
.info-chip:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); transform: translateY(-1px); }
.chip-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.chip-text { display: flex; flex-direction: column; gap: 0px; }
.chip-value { font-size: var(--ict-mark-medium); font-weight: 600; color: var(--ict-text-emphasis); font-family: var(--ict-font-family); }
.chip-value.mono { font-size: var(--ict-body-small); }
.chip-label { font-size: var(--ict-mark-small); color: var(--ict-text-secondary); }
.chip-link { font-size: var(--ict-body-small); color: var(--ict-primary); font-weight: 500; }
</style>
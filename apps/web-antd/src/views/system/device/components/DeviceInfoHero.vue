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
        <IconifyIcon icon="lucide:server" style="font-size: 28px; color: #1677ff;" />
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
        <div class="chip-icon" style="background: #e6f4ff;">
          <IconifyIcon icon="lucide:cpu" style="font-size: 16px; color: #1677ff;" />
        </div>
        <div class="chip-text">
          <span class="chip-value">{{ cpuCores }} 核</span>
          <span class="chip-label">CPU</span>
        </div>
      </div>
      <div class="info-chip">
        <div class="chip-icon" style="background: #f6ffed;">
          <IconifyIcon icon="lucide:memory-stick" style="font-size: 16px; color: #52c41a;" />
        </div>
        <div class="chip-text">
          <span class="chip-value">{{ memorySize }}</span>
          <span class="chip-label">内存</span>
        </div>
      </div>
      <div class="info-chip">
        <div class="chip-icon" style="background: #fff7e6;">
          <IconifyIcon icon="lucide:hard-drive" style="font-size: 16px; color: #faad14;" />
        </div>
        <div class="chip-text">
          <span class="chip-value">{{ diskCount }} 块</span>
          <span class="chip-label">硬盘</span>
        </div>
      </div>
      <div class="info-chip">
        <div class="chip-icon" style="background: #f9f0ff;">
          <IconifyIcon icon="lucide:fingerprint" style="font-size: 16px; color: #722ed1;" />
        </div>
        <div class="chip-text">
          <span class="chip-value mono">{{ deviceId }}</span>
          <span class="chip-label">设备ID</span>
        </div>
      </div>
      <div class="info-chip">
        <div class="chip-icon" style="background: #fff1f0;">
          <IconifyIcon icon="lucide:globe" style="font-size: 16px; color: #eb2f96;" />
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
  background: linear-gradient(135deg, #f0f5ff 0%, #e6f4ff 50%, #f6ffed 100%);
  border-radius: 14px;
  border: 1px solid #e8e8e8;
  gap: 20px;
  flex-wrap: wrap;
}
.device-info-main { display: flex; align-items: center; gap: 16px; }
.device-avatar {
  width: 56px; height: 56px; border-radius: 14px; background: #fff;
  border: 2px solid #bae0ff; display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; box-shadow: 0 2px 8px rgba(24, 144, 255, 0.12);
}
.device-meta { display: flex; flex-direction: column; gap: 6px; }
.device-name { font-size: 20px; font-weight: 700; color: #141414; margin: 0; }
.device-tags { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.device-info-chips { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.info-chip {
  display: flex; align-items: center; gap: 8px; padding: 8px 12px;
  background: #fff; border-radius: 10px; border: 1px solid #f0f0f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04); transition: all 0.3s;
}
.info-chip:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); transform: translateY(-1px); }
.chip-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.chip-text { display: flex; flex-direction: column; gap: 0px; }
.chip-value { font-size: 13px; font-weight: 600; color: #262626; font-family: 'SF Mono', 'Fira Code', monospace; }
.chip-value.mono { font-size: 12px; }
.chip-label { font-size: 10px; color: #8c8c8c; }
.chip-link { font-size: 12px; color: #1677ff; font-weight: 500; }
</style>
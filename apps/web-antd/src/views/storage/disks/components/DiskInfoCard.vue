<script lang="ts" setup>
import { Card, Descriptions } from 'ant-design-vue';
import type { DiskInfo } from '#/api/storage';

defineProps<{
  disk: DiskInfo;
}>();

function formatHours(hours?: number): string {
  if (!hours) return '--';
  const days = Math.floor(hours / 24);
  if (days > 365) return `${(days / 365).toFixed(1)}年`;
  return `${days}天`;
}
</script>

<template>
  <Card class="info-card" :bordered="true" :body-style="{ padding: '20px' }">
    <div class="device-info">
      <Descriptions :column="3" size="small">
        <Descriptions.Item label="设备名称">{{ disk.deviceName }}</Descriptions.Item>
        <Descriptions.Item label="设备路径">{{ disk.devicePath }}</Descriptions.Item>
        <Descriptions.Item label="型号">{{ disk.model }}</Descriptions.Item>
        <Descriptions.Item label="序列号">{{ disk.serial }}</Descriptions.Item>
        <Descriptions.Item label="容量">{{ disk.size }}</Descriptions.Item>
        <Descriptions.Item label="类型">{{ disk.deviceType }}</Descriptions.Item>
        <Descriptions.Item label="接口">{{ disk.interfaceType || 'SATA' }}</Descriptions.Item>
        <Descriptions.Item label="传输协议">{{ disk.transportType }}</Descriptions.Item>
        <Descriptions.Item label="子系统">{{ disk.subsystem }}</Descriptions.Item>
        <Descriptions.Item label="物理扇区">{{ disk.physicalSectorSize }} bytes</Descriptions.Item>
        <Descriptions.Item label="逻辑扇区">{{ disk.logicalSectorSize }} bytes</Descriptions.Item>
        <Descriptions.Item label="旋转设备">{{ disk.isRotational }}</Descriptions.Item>
        <Descriptions.Item label="热插拔">{{ disk.isHotpluggable }}</Descriptions.Item>
        <Descriptions.Item label="UUID">{{ disk.uuid }}</Descriptions.Item>
        <Descriptions.Item label="使用时长">{{ formatHours(disk.usedHours) }}</Descriptions.Item>
        <Descriptions.Item label="温度">{{ disk.temperature !== undefined ? `${disk.temperature}°C` : '--' }}</Descriptions.Item>
        <Descriptions.Item label="健康状态">{{ disk.healthStatus || '不支持检测' }}</Descriptions.Item>
        <Descriptions.Item label="使用状态">{{ disk.usageStatus || disk.status }}</Descriptions.Item>
      </Descriptions>
    </div>
  </Card>
</template>

<style scoped>
.info-card {
  border-radius: 10px;
}

.device-info :deep(.ant-descriptions-item-label) {
  font-size: 12px;
  color: #8c8c8c;
  width: 80px;
}

.device-info :deep(.ant-descriptions-item-content) {
  font-size: 13px;
  font-weight: 500;
}
</style>
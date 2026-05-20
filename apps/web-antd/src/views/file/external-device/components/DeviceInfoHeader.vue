<script lang="ts" setup>
import { Button } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import { OverviewCard } from '#/components/ui-kit';

interface ExternalDevice {
  id: string;
  name: string;
  type: 'usb' | 'sd' | 'ssd' | 'hdd';
  capacity: string;
  used: string;
  usedPercent: number;
  status: 'connected' | 'disconnected';
  mountPath: string;
  fileSystem: string;
}

const props = defineProps<{
  device?: ExternalDevice;
  showCopyMode: boolean;
}>();

const emit = defineEmits<{
  (e: 'back'): void;
  (e: 'toggle-copy-mode'): void;
}>();

function getDeviceIcon(_type: string): string {
  return 'lucide:usb';
}

function getDeviceIconColor(_type: string): string {
  return 'var(--ict-primary)';
}

function getDeviceTypeLabel(type: string): string {
  switch (type) {
    case 'usb':
      return 'U盘';
    case 'hdd':
      return '移动硬盘';
    case 'ssd':
      return '移动SSD';
    case 'sd':
      return 'SD卡';
    default:
      return '未知';
  }
}
</script>

<template>
  <div class="unified-header">
    <!-- 第一行：页面描述与状态信息 -->
    <div class="unified-header__row">
      <div class="unified-header__left">
        <div class="device-info">
          
          <div class="device-info__text">
            <div class="device-info__name">
              {{ device?.name || '外接设备' }}
            </div>
            <div class="device-info__meta">
              <span class="meta-tag">{{
                getDeviceTypeLabel(device?.type || 'usb')
              }}</span>
              <span class="meta-sep">·</span>
              <span>{{ device?.fileSystem }}</span>
              <span class="meta-sep">·</span>
              <span>{{ device?.capacity }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：容量概览 -->
      <div class="unified-header__right-stats">
        <OverviewCard
          icon="lucide:hard-drive"
          icon-color="var(--ict-primary)"
          icon-bg="var(--ict-primary-light)"
          label="总容量"
          :value="device?.capacity || '-'"
        />
        <OverviewCard
          icon="lucide:database"
          icon-color="var(--ict-success)"
          icon-bg="var(--ict-success-light)"
          label="已用"
          :value="device?.used || '-'"
        />
        <OverviewCard
          icon="lucide:percent"
          icon-color="var(--ict-warning)"
          icon-bg="var(--ict-warning-light)"
          label="使用率"
          :value="`${device?.usedPercent ?? 0}%`"
        />
      </div>
    </div>

    <!-- 第二行：操作按钮 -->
    <div class="unified-header__row">
      <Button size="small" class="back-btn" @click="emit('back')">
        <IconifyIcon
          icon="lucide:arrow-left"
          style="font-size: var(--ict-body-medium);"
        />
        返回外接设备列表
      </Button>

      <Button
        type="primary"
        class="copy-mode-btn"
        @click="emit('toggle-copy-mode')"
      >
        <IconifyIcon
          :icon="showCopyMode ? 'lucide:folder-x' : 'lucide:folder-sync'"
          style="font-size: var(--ict-body-medium);"
        />
        <span>{{ showCopyMode ? '退出拷贝' : '文件拷贝' }}</span>
      </Button>
    </div>
  </div>
</template>

<style scoped>
.unified-header {
  display: flex;
  flex-direction: column;
  padding: 12px 20px;
  background: var(--ict-bg-card);
  border-bottom: 1px solid var(--ict-border-light);
  gap: 10px;
  flex-shrink: 0;
}

.unified-header__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.unified-header__left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: 6px;
}


.device-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.device-info__icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--ict-primary-light) 0%, #d6e8ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.device-info__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.device-info__name {
  font-size: var(--ict-title-medium);
  font-weight: 600;
  color: var(--ict-text-emphasis);
  line-height: 1.3;
}

.device-info__meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--ict-body-small);
  color: var(--ict-text-secondary);
}

.meta-tag {
  display: inline-flex;
  align-items: center;
  padding: 1px 8px;
  background: #f0f5ff;
  border-radius: 10px;
  font-size: var(--ict-mark-small);
  color: var(--ict-primary);
  font-weight: 500;
}

.meta-sep {
  color: var(--ict-text-disabled);
}

.unified-header__right-stats {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}


.copy-mode-btn {
  height: 32px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 400;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 768px) {
  .unified-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 14px;
  }
}
</style>
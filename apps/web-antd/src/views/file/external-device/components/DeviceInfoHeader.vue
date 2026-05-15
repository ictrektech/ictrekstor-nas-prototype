<script lang="ts" setup>
import { Button } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';

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
          <div class="device-info__icon">
            <IconifyIcon
              :icon="getDeviceIcon(device?.type || 'usb')"
              style="font-size: var(--ict-title-large);"
              :style="{ color: getDeviceIconColor(device?.type || 'usb') }"
            />
          </div>
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
        <div class="header-divider" />
        <div
          class="connection-badge"
          :class="{
            'connection-badge--connected': device?.status === 'connected',
          }"
        >
          <span class="connection-badge__dot" />
          <span class="connection-badge__text">
            {{
              device?.status === 'connected' ? '已连接' : '未连接'
            }}
          </span>
        </div>
      </div>

      <!-- 右侧：容量概览 -->
      <div class="unified-header__right-stats">
        <div class="stat-chip">
          <IconifyIcon
            icon="lucide:hard-drive"
            style="font-size: var(--ict-body-medium); color: var(--ict-primary);"
          />
          <div class="stat-chip__content">
            <span class="stat-chip__label">总容量</span>
            <span class="stat-chip__value">{{
              device?.capacity || '-'
            }}</span>
          </div>
        </div>
        <div class="stat-chip">
          <IconifyIcon
            icon="lucide:database"
            style="font-size: var(--ict-body-medium); color: var(--ict-success);"
          />
          <div class="stat-chip__content">
            <span class="stat-chip__label">已用</span>
            <span class="stat-chip__value">{{
              device?.used || '-'
            }}</span>
          </div>
        </div>
        <div class="stat-chip">
          <IconifyIcon
            icon="lucide:percent"
            style="font-size: var(--ict-body-medium); color: var(--ict-warning);"
          />
          <div class="stat-chip__content">
            <span class="stat-chip__label">使用率</span>
            <span class="stat-chip__value"
              >{{ device?.usedPercent ?? 0 }}%</span
            >
          </div>
        </div>
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

      <button
        class="copy-mode-toggle"
        :class="{ 'copy-mode-toggle--active': showCopyMode }"
        @click="emit('toggle-copy-mode')"
      >
        <IconifyIcon
          :icon="
            showCopyMode ? 'lucide:folder-x' : 'lucide:folder-sync'
          "
          style="font-size: var(--ict-body-medium);"
        />
        <span>{{ showCopyMode ? '退出拷贝' : '文件拷贝' }}</span>
      </button>
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

.header-divider {
  width: 1px;
  height: 24px;
  background: var(--ict-border);
  flex-shrink: 0;
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
  font-size: var(--ict-title-small);
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
  gap: 10px;
  flex-shrink: 0;
}

.stat-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: linear-gradient(135deg, var(--ict-bg-section) 0%, var(--ict-bg-page) 100%);
  border: 1px solid var(--ict-border-light);
  border-radius: 10px;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.stat-chip:hover {
  background: #f0f5ff;
  border-color: #bae0ff;
}

.stat-chip__content {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.stat-chip__label {
  font-size: var(--ict-mark-small);
  color: var(--ict-text-secondary);
  line-height: 1.3;
}

.stat-chip__value {
  font-size: var(--ict-body-medium);
  font-weight: 600;
  color: var(--ict-text-emphasis);
  font-family: var(--ict-font-family);
  line-height: 1.3;
}

.connection-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: var(--ict-bg-page);
  border-radius: 20px;
  font-size: var(--ict-body-small);
  color: var(--ict-text-secondary);
  transition: all 0.2s ease;
}

.connection-badge--connected {
  background: var(--ict-success-light);
  color: var(--ict-success);
}

.connection-badge__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--ict-text-disabled);
  flex-shrink: 0;
}

.connection-badge--connected .connection-badge__dot {
  background: var(--ict-success);
  box-shadow: 0 0 0 2px rgba(82, 196, 26, 0.2);
}

.copy-mode-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: var(--ict-bg-page);
  border: 1px solid var(--ict-border);
  border-radius: 8px;
  font-size: var(--ict-mark-medium);
  color: var(--ict-text-secondary);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
  outline: none;
}

.copy-mode-toggle:hover {
  background: #f0f5ff;
  border-color: #bae0ff;
  color: var(--ict-primary);
}

.copy-mode-toggle--active {
  background: linear-gradient(135deg, var(--ict-primary) 0%, #4096ff 100%);
  border-color: var(--ict-primary);
  color: var(--ict-bg-card);
  box-shadow: 0 2px 8px rgba(22, 119, 255, 0.25);
}

.copy-mode-toggle--active:hover {
  background: linear-gradient(135deg, #0958d9 0%, var(--ict-primary) 100%);
  border-color: #0958d9;
  color: var(--ict-bg-card);
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
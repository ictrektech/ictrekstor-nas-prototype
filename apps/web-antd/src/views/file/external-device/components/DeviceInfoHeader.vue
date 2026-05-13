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
  return '#1677ff';
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
              style="font-size: 18px;"
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
            style="font-size: 14px; color: #1677ff;"
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
            style="font-size: 14px; color: #52c41a;"
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
            style="font-size: 14px; color: #faad14;"
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
          style="font-size: 14px;"
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
          style="font-size: 14px;"
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
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
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
  background: #e8e8e8;
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
  background: linear-gradient(135deg, #e6f4ff 0%, #d6e8ff 100%);
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
  font-size: 15px;
  font-weight: 600;
  color: #262626;
  line-height: 1.3;
}

.device-info__meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #8c8c8c;
}

.meta-tag {
  display: inline-flex;
  align-items: center;
  padding: 1px 8px;
  background: #f0f5ff;
  border-radius: 10px;
  font-size: 11px;
  color: #1677ff;
  font-weight: 500;
}

.meta-sep {
  color: #d9d9d9;
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
  background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
  border: 1px solid #f0f0f0;
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
  font-size: 10px;
  color: #8c8c8c;
  line-height: 1.3;
}

.stat-chip__value {
  font-size: 14px;
  font-weight: 600;
  color: #262626;
  font-family: 'SF Mono', 'Fira Code', monospace;
  line-height: 1.3;
}

.connection-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: #f5f5f5;
  border-radius: 20px;
  font-size: 12px;
  color: #8c8c8c;
  transition: all 0.2s ease;
}

.connection-badge--connected {
  background: #f6ffed;
  color: #52c41a;
}

.connection-badge__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #bfbfbf;
  flex-shrink: 0;
}

.connection-badge--connected .connection-badge__dot {
  background: #52c41a;
  box-shadow: 0 0 0 2px rgba(82, 196, 26, 0.2);
}

.copy-mode-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: #f5f5f5;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  font-size: 13px;
  color: #595959;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
  outline: none;
}

.copy-mode-toggle:hover {
  background: #f0f5ff;
  border-color: #bae0ff;
  color: #1677ff;
}

.copy-mode-toggle--active {
  background: linear-gradient(135deg, #1677ff 0%, #4096ff 100%);
  border-color: #1677ff;
  color: #fff;
  box-shadow: 0 2px 8px rgba(22, 119, 255, 0.25);
}

.copy-mode-toggle--active:hover {
  background: linear-gradient(135deg, #0958d9 0%, #1677ff 100%);
  border-color: #0958d9;
  color: #fff;
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
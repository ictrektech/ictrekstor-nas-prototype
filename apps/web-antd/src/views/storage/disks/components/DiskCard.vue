<script lang="ts" setup>
import { Tag, Button, Tooltip } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import type { DiskInfo, StoragePool } from '#/api/storage';

const props = defineProps<{
  disk: DiskInfo;
  pools: StoragePool[];
  isSelectedInDiagram: boolean;
  isBlinking: boolean;
}>();

const emit = defineEmits<{
  (e: 'locate', disk: DiskInfo): void;
  (e: 'sleep', disk: DiskInfo): void;
  (e: 'blink', disk: DiskInfo): void;
  (e: 'copy-serial', serial: string): void;
  (e: 'go-pool', poolId: string): void;
  (e: 'go-detail', disk: DiskInfo): void;
}>();

function getStatusDot(status: string): string {
  switch (status) {
    case '运行中':
      return '#52c41a';
    case '休眠':
      return '#faad14';
    default:
      return '#bfbfbf';
  }
}

function getHealthBadgeColor(health?: string): string {
  switch (health) {
    case '正常':
      return '#52c41a';
    case '警告':
      return '#faad14';
    case '异常':
      return '#ff4d4f';
    default:
      return '#8c8c8c';
  }
}

function getDeviceIcon(deviceType?: string): string {
  if (deviceType?.includes('SSD')) return 'lucide:cpu';
  if (deviceType?.includes('NVMe')) return 'lucide:zap';
  return 'lucide:hard-drive';
}

function getDeviceIconColor(deviceType?: string): string {
  if (deviceType?.includes('SSD')) return '#722ed1';
  if (deviceType?.includes('NVMe')) return '#eb2f96';
  return '#1677ff';
}
</script>

<template>
  <div class="disk-card-inner">
    <!-- 左侧：大图标区域 -->
    <div
      class="disk-visual"
      :style="{
        background: `${getDeviceIconColor(disk.deviceType)}12`,
      }"
    >
      <div
        class="disk-icon-box"
        :style="{
          background: `${getDeviceIconColor(disk.deviceType)}18`,
          borderColor: `${getDeviceIconColor(disk.deviceType)}35`,
        }"
      >
        <IconifyIcon
          :icon="getDeviceIcon(disk.deviceType)"
          class="disk-icon"
          :style="{ color: getDeviceIconColor(disk.deviceType) }"
        />
      </div>
      <div
        class="disk-status-indicator"
        :style="{ background: getStatusDot(disk.status) }"
      />
    </div>

    <!-- 右侧：信息区域 -->
    <div class="disk-info">
      <!-- 第一行：设备名 + 容量 + 操作按钮 -->
      <div class="info-header">
        <div class="info-header-left">
          <span class="disk-device-name">{{ disk.deviceName }}</span>
          <span class="disk-capacity">{{ disk.size }}</span>
          <Tag
            v-if="disk.healthStatus"
            class="health-tag-mini"
            size="small"
            :style="{
              color: getHealthBadgeColor(disk.healthStatus),
              borderColor: `${getHealthBadgeColor(disk.healthStatus)}50`,
              background: `${getHealthBadgeColor(disk.healthStatus)}10`,
            }"
          >
            <span
              class="health-dot-mini"
              :style="{ background: getHealthBadgeColor(disk.healthStatus) }"
            />
            {{ disk.healthStatus }}
          </Tag>
        </div>
        <div class="header-actions">
          <Tooltip title="定位">
            <Button
              size="small"
              class="action-btn"
              :class="{ 'locate-active': isSelectedInDiagram }"
              @click="emit('locate', disk)"
            >
              <IconifyIcon icon="lucide:crosshair" class="action-icon" />
            </Button>
          </Tooltip>
          <Tooltip title="休眠硬盘">
            <Button
              size="small"
              class="action-btn"
              @click="emit('sleep', disk)"
            >
              <IconifyIcon icon="lucide:moon" class="action-icon" />
            </Button>
          </Tooltip>
          <Tooltip :title="isBlinking ? '关闭指示灯' : '开启指示灯'">
            <Button
              size="small"
              :class="['action-btn', isBlinking ? 'blink-active' : '']"
              @click="emit('blink', disk)"
            >
              <IconifyIcon
                :icon="isBlinking ? 'lucide:lightbulb-off' : 'lucide:lightbulb'"
                :class="['action-icon', isBlinking ? 'blink-pulse' : '']"
              />
            </Button>
          </Tooltip>
          <Button
            size="small"
            type="primary"
            class="detail-btn"
            @click="emit('go-detail', disk)"
          >
            <IconifyIcon icon="lucide:file-text" style="font-size: 11px;" />
            详细信息
          </Button>
        </div>
      </div>

      <!-- 第二行：核心属性（型号 / 类型 / 序列号） -->
      <div class="info-attrs">
        <div class="attr-pair">
          <span class="attr-label">型号</span>
          <span
            class="attr-value"
            :title="disk.model || 'QEMU_HARDDISK'"
          >
            {{ disk.model || 'QEMU_HARDDISK' }}
          </span>
        </div>
        <div class="attr-pair">
          <span class="attr-label">类型</span>
          <span class="attr-value">{{ disk.deviceType || 'HDD' }}</span>
        </div>
        <div class="attr-pair">
          <span class="attr-label">序列号</span>
          <span class="attr-value serial-value">
            {{ disk.serial }}
            <Tooltip title="复制序列号">
              <span
                class="copy-icon"
                @click="emit('copy-serial', disk.serial)"
              >
                <IconifyIcon
                  icon="lucide:copy"
                  style="font-size: 10px;"
                />
              </span>
            </Tooltip>
          </span>
        </div>
      </div>

      <!-- 第三行：所属存储池 -->
      <div
        v-if="disk.poolIds && disk.poolIds.length > 0"
        class="info-pools"
      >
        <span class="pools-list">
          <Tag
            v-for="pid in disk.poolIds"
            :key="pid"
            color="blue"
            class="pool-tag"
            size="small"
            @click="emit('go-pool', pid)"
          >
            <IconifyIcon
              icon="lucide:database"
              style="font-size: 10px; margin-right: 2px;"
            />
            {{ pools.find((p) => p.id === pid)?.name || pid }}
          </Tag>
        </span>
      </div>
      <div v-else class="info-pools-empty">
        <span class="pool-empty-text">未分配存储池</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 卡片内部：左右布局 */
.disk-card-inner {
  display: flex;
  align-items: stretch;
  height: 100%;
}

/* 左侧视觉区 */
.disk-visual {
  width: 64px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 8px;
  gap: 8px;
  flex-shrink: 0;
  position: relative;
  margin-right: 10px;
}

.disk-icon-box {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid;
}

.disk-icon {
  font-size: 22px;
}

.disk-status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  box-shadow: 0 0 0 2px #fff;
}

/* 右侧信息区 */
.disk-info {
  flex: 1;
  padding: 12px 14px 12px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  justify-content: center;
}

/* 信息头部 */
.info-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.info-header-left {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  flex: 1;
}

.disk-device-name {
  font-size: 16px;
  font-weight: 700;
  color: #141414;
  font-family: 'SF Mono', 'Fira Code', monospace;
  line-height: 1;
  flex-shrink: 0;
  letter-spacing: 0.3px;
}

.disk-capacity {
  font-size: 11px;
  font-weight: 600;
  color: #1677ff;
  font-family: 'SF Mono', 'Fira Code', monospace;
  background: #e6f4ff;
  padding: 1px 6px;
  border-radius: 4px;
  flex-shrink: 0;
}

.health-tag-mini {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  margin-right: 0;
  padding: 0 6px;
  border: 1px solid;
  border-radius: 10px;
}

.health-dot-mini {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  display: inline-block;
}

/* 操作按钮 */
.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.detail-btn {
  font-size: 11px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  padding: 0 8px;
  height: 28px;
  gap: 4px;
}

.action-btn {
  width: 28px;
  height: 28px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
}

.action-icon {
  font-size: 12px;
}

.blink-active {
  background: #fff7e6;
  border-color: #ffd591;
  color: #d46b08;
}

.locate-active {
  background: #e6f4ff;
  border-color: #1677ff;
  color: #1677ff;
}

.blink-pulse {
  animation: blink-pulse 1.5s ease-in-out infinite;
}

@keyframes blink-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

/* 核心属性行 */
.info-attrs {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.attr-pair {
  display: flex;
  align-items: center;
  gap: 5px;
}

.attr-label {
  font-size: 11px;
  color: #8c8c8c;
  flex-shrink: 0;
}

.attr-value {
  font-size: 12px;
  color: #262626;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.serial-value {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.copy-icon {
  color: #bfbfbf;
  cursor: pointer;
  transition: color 0.2s;
  display: inline-flex;
  align-items: center;
}

.copy-icon:hover {
  color: #1677ff;
}

/* 存储池 */
.info-pools {
  display: flex;
  align-items: center;
}

.pools-list {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.pool-tag {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  margin-right: 0;
}

.pool-tag:hover {
  opacity: 0.85;
}

.info-pools-empty {
  display: flex;
  align-items: center;
}

.pool-empty-text {
  font-size: 11px;
  color: #bfbfbf;
  font-style: italic;
}

@media (max-width: 576px) {
  .disk-visual {
    width: 52px;
    padding: 10px 6px;
  }

  .disk-icon-box {
    width: 38px;
    height: 38px;
  }

  .disk-icon {
    font-size: 18px;
  }

  .disk-device-name {
    font-size: 14px;
  }

  .info-attrs {
    gap: 8px;
  }

  .header-actions {
    gap: 3px;
  }

  .detail-btn {
    padding: 0 6px;
    height: 26px;
    font-size: 10px;
  }

  .action-btn {
    width: 26px;
    height: 26px;
  }

  .disk-info {
    padding: 10px 10px 10px 0;
  }
}
</style>
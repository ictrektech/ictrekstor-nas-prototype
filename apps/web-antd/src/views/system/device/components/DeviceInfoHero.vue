<script lang="ts" setup>
defineProps<{
  /** 设备型号名称（如 VIVIBIT E1001） */
  deviceName: string;
  /** 设备 ID（如 02680d4） */
  deviceId: string;
  /** 系统版本（如 1.1.0） */
  systemVersion: string;
  /** 本次运行时间（已格式化字符串，如 "12 天 10 小时 8 分钟 29 秒"） */
  uptime: string;
  /** 远程连接状态文本（如 "已启用 (QuickConnect)"） */
  remoteAccess: string;
  /** 远程连接服务名称（默认 VIVIBIT Connect） */
  remoteServiceName?: string;
}>();
</script>

<template>
  <div class="device-info-hero">
    <!-- 主卡片：设备基本信息 -->
    <div class="device-card device-card--primary">
      <h2 class="device-name">{{ deviceName }}</h2>
      <div class="device-meta-row">
        <span class="meta-item">
          <span class="meta-label">设备ID</span>
          <span class="meta-value">{{ deviceId }}</span>
        </span>
        <span class="meta-item">
          <span class="meta-label">本次运行时间</span>
          <span class="meta-value">{{ uptime }}</span>
        </span>
        <span class="meta-item">
          <span class="meta-label">系统版本</span>
          <span class="meta-value">{{ systemVersion }}</span>
        </span>
      </div>
    </div>

    <!-- 副卡片：远程连接状态 -->
    <div class="device-card device-card--secondary">
      <span class="remote-label">{{ remoteServiceName || 'VIVIBIT Connect' }}</span>
      <span class="remote-value">{{ remoteAccess }}</span>
    </div>
  </div>
</template>

<style scoped>
.device-info-hero {
  display: flex;
  align-items: stretch;
  gap: 16px;
  flex-wrap: wrap;
}

.device-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  padding: 20px 28px;
  border-radius: 14px;
  min-height: 96px;
}

.device-card--primary {
  flex: 1 1 0;
  min-width: 0;
  background: var(--ict-primary-light);
}

.device-card--secondary {
  flex: 0 0 auto;
  background: var(--ict-bg-section);
}

.device-name {
  font-size: var(--ict-title-large);
  font-weight: 700;
  color: var(--ict-text-emphasis);
  margin: 0;
  line-height: 1.3;
}

.device-meta-row {
  display: flex;
  align-items: center;
  gap: 40px;
  flex-wrap: wrap;
}

.meta-item {
  display: inline-flex;
  align-items: baseline;
  gap: 12px;
  font-size: var(--ict-body-small);
}

.meta-label {
  color: var(--ict-text-secondary);
}

.meta-value {
  color: var(--ict-text-emphasis);
  font-weight: 500;
}

/* 副卡片字体规格 */
.remote-label {
  font-size: var(--ict-body-small);
  color: var(--ict-text-secondary);
}

.remote-value {
  font-size: var(--ict-title-medium);
  font-weight: 700;
  color: var(--ict-text-emphasis);
}

@media (max-width: 768px) {
  .device-meta-row { gap: 16px 24px; }
  .device-card { padding: 16px 18px; }
}
</style>

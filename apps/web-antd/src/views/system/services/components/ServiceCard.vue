<script lang="ts" setup>
import { IconifyIcon } from '@vben/icons';
import { Switch, Button, Tag } from 'ant-design-vue';
import type { ServiceData } from '../types';

const props = defineProps<{
  service: ServiceData;
}>();

const emit = defineEmits<{
  (e: 'toggle', id: string, enabled: boolean): void;
  (e: 'guide', s: ServiceData): void;
  (e: 'configure', s: ServiceData): void;
  (e: 'copy', url: string): void;
}>();

function onToggle(checked: boolean) {
  emit('toggle', props.service.id, checked);
}

/** 状态标签配置 */
const statusConfig: Record<string, { color: string; text: string }> = {
  running: { color: 'success', text: '运行中' },
  stopped: { color: 'default', text: '已停止' },
  error: { color: 'error', text: '异常' },
};
</script>

<template>
  <div
    class="service-card"
    :class="{ 'service-card-disabled': !service.enabled }"
  >
    <!-- 头部 -->
    <div class="card-header">
      <div class="header-left">
        <div
          class="service-icon-wrap"
          :style="{
            background: service.enabled
              ? `${service.iconColor}18`
              : '#f0f0f0',
          }"
        >
          <IconifyIcon
            :icon="service.icon"
            class="service-icon"
            :style="{
              color: service.enabled ? service.iconColor : '#bfbfbf',
            }"
          />
        </div>
        <div class="service-meta">
          <div class="service-name">
            {{ service.name }}
            <Tag
              class="status-tag"
              :color="statusConfig[service.status]?.color"
            >
              {{ statusConfig[service.status]?.text }}
            </Tag>
          </div>
          <div class="service-desc">{{ service.description }}</div>
        </div>
      </div>
      <div class="header-actions">
        <Button
          v-if="service.enabled"
          size="small"
          @click="emit('guide', service)"
        >
          <IconifyIcon icon="lucide:book-open" :style="{ fontSize: '14px' }" />
          使用指南
        </Button>
        <Button
          v-if="service.enabled"
          size="small"
          type="primary"
          @click="emit('configure', service)"
        >
          <IconifyIcon icon="lucide:settings-2" :style="{ fontSize: '14px' }" />
          配置
        </Button>
        <Switch :checked="service.enabled" @update:checked="onToggle" />
      </div>
    </div>

    <!-- 启用状态内容 -->
    <div v-if="service.enabled" class="card-body">
      <!-- 访问地址 -->
      <div v-if="service.url" class="info-section url-section">
        <div class="section-label">
          <IconifyIcon
            icon="lucide:link"
            :style="{ fontSize: '13px', color: '#52c41a' }"
          />
          访问地址
        </div>
        <div class="url-bar">
          <input class="url-input" readonly :value="service.url" />
          <Button
            size="small"
            class="copy-btn"
            type="link"
            @click="emit('copy', service.url!)"
          >
            <IconifyIcon icon="lucide:copy" :style="{ fontSize: '13px' }" />
          </Button>
        </div>
      </div>
      <!-- 快速信息 -->
      <div class="info-section quick-info-section">
        <div class="section-label">
          <IconifyIcon
            icon="lucide:info"
            :style="{ fontSize: '13px', color: '#1677ff' }"
          />
          配置信息
        </div>
        <div class="quick-info-list">
          <div
            v-for="item in service.quickInfo"
            :key="item.label"
            class="quick-info-item"
          >
            <span class="quick-info-label">{{ item.label }}:</span>
            <span class="quick-info-value">{{ item.value }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 禁用状态 -->
    <div v-else class="card-body-disabled">
      <span class="disabled-hint">开启后即可配置和访问</span>
    </div>
  </div>
</template>

<style scoped>
.service-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.service-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border-color: #d9d9d9;
  transform: translateY(-2px);
}

.service-card-disabled {
  opacity: 0.65;
  background: #fafafa;
}

.service-card-disabled:hover {
  transform: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.service-card-disabled .card-header {
  background: #f5f5f5;
  border-bottom-color: #e8e8e8;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  gap: 12px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  min-width: 0;
}

.service-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.3s ease;
}

.service-icon {
  font-size: 22px;
  transition: color 0.3s ease;
}

.service-meta {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  flex: 1;
}

.service-name {
  font-size: 15px;
  font-weight: 600;
  color: #141414;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.status-tag {
  font-size: 11px;
  font-weight: 500;
}

.service-desc {
  font-size: 12px;
  color: #8c8c8c;
  line-height: 1.4;
}

.card-body {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 14px 20px;
  flex-wrap: wrap;
}

.info-section {
  flex-shrink: 0;
}

.url-section {
  width: 320px;
}

.section-label {
  font-size: 11px;
  font-weight: 600;
  color: #8c8c8c;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.url-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 8px;
  padding: 6px 10px;
}

.url-input {
  flex: 1;
  font-family: 'SF Mono', 'Fira Code', Consolas, monospace;
  font-size: 13px;
  color: #135200;
  background: transparent;
  border: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.copy-btn {
  color: #52c41a;
  padding: 2px 6px;
  height: auto;
  flex-shrink: 0;
}

.copy-btn:hover {
  color: #389e0d;
  background: #d9f7be;
}

.quick-info-section {
  flex: 1;
  min-width: 240px;
}

.quick-info-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.quick-info-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  background: #f5f5f5;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  font-size: 12px;
  flex-shrink: 0;
}

.quick-info-label {
  color: #8c8c8c;
  flex-shrink: 0;
}

.quick-info-value {
  color: #262626;
  font-weight: 500;
  font-family: 'SF Mono', 'Fira Code', Consolas, monospace;
}

.card-body-disabled {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 20px;
}

.disabled-hint {
  font-size: 13px;
  color: #bfbfbf;
  font-style: italic;
}

@media (max-width: 768px) {
  .card-body {
    flex-direction: column;
  }
  .url-section,
  .quick-info-section {
    width: 100%;
  }
}
</style>

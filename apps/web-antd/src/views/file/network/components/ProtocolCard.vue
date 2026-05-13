<script lang="ts" setup>
import { IconifyIcon } from '@vben/icons';
import { Switch, Button, Tag } from 'ant-design-vue';

export interface ProtocolData {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconColor: string;
  enabled: boolean;
  url: string;
  config: { label: string; value: string }[];
  guideContent: string;
}

const props = defineProps<{
  protocol: ProtocolData;
}>();

const emit = defineEmits<{
  (e: 'toggle', id: string, enabled: boolean): void;
  (e: 'guide', p: ProtocolData): void;
  (e: 'configure', p: ProtocolData): void;
  (e: 'copy', url: string): void;
}>();

function onToggle(checked: boolean) {
  emit('toggle', props.protocol.id, checked);
}
</script>

<template>
  <div
    class="protocol-card"
    :class="{ 'protocol-card-disabled': !protocol.enabled }"
  >
    <!-- 头部 -->
    <div class="card-header-row">
      <div class="header-left">
        <div
          class="protocol-icon-wrap"
          :style="{
            background: protocol.enabled
              ? `${protocol.iconColor}18`
              : '#f0f0f0',
          }"
        >
          <IconifyIcon
            :icon="protocol.icon"
            class="protocol-icon"
            :style="{
              color: protocol.enabled ? protocol.iconColor : '#bfbfbf',
            }"
          />
        </div>
        <div class="protocol-meta">
          <div class="protocol-name">
            {{ protocol.name }}
            <Tag
              v-if="protocol.enabled"
              class="status-tag"
              color="success"
            >
              已启用
            </Tag>
            <Tag v-else class="status-tag">未启用</Tag>
          </div>
          <div class="protocol-desc">{{ protocol.description }}</div>
        </div>
      </div>
      <div class="header-actions">
        <Button
          v-if="protocol.enabled"
          size="small"
          @click="emit('guide', protocol)"
        >
          <IconifyIcon icon="lucide:book-open" :style="{ fontSize: '14px' }" />
          使用指南
        </Button>
        <Button
          v-if="protocol.enabled"
          size="small"
          type="primary"
          @click="emit('configure', protocol)"
        >
          <IconifyIcon icon="lucide:settings-2" :style="{ fontSize: '14px' }" />
          配置
        </Button>
        <Switch
          :checked="protocol.enabled"
          @update:checked="onToggle"
        />
      </div>
    </div>

    <!-- 启用状态内容 -->
    <div v-if="protocol.enabled" class="card-body-row">
      <div class="access-url-section">
        <div class="section-label">
          <IconifyIcon
            icon="lucide:link"
            :style="{ fontSize: '13px', color: '#52c41a' }"
          />
          访问地址
        </div>
        <div class="access-url-bar">
          <input class="access-url" readonly :value="protocol.url" />
          <Button
            size="small"
            class="copy-btn"
            type="link"
            @click="emit('copy', protocol.url)"
          >
            <IconifyIcon icon="lucide:copy" :style="{ fontSize: '13px' }" />
          </Button>
        </div>
      </div>
      <div class="card-config-area">
        <div class="section-label">
          <IconifyIcon
            icon="lucide:settings-2"
            :style="{ fontSize: '13px', color: '#1677ff' }"
          />
          配置信息
        </div>
        <div class="config-list">
          <div
            v-for="c in protocol.config"
            :key="c.label"
            class="config-item"
          >
            <span class="config-item-label">{{ c.label }}:</span>
            <span class="config-item-value">{{ c.value }}</span>
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
.protocol-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.protocol-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border-color: #d9d9d9;
}

.protocol-card-disabled {
  opacity: 0.65;
  background: #fafafa;
}

.protocol-card-disabled:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.protocol-card-disabled .card-header-row {
  background: #f5f5f5;
  border-bottom-color: #e8e8e8;
}

.card-header-row {
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

.protocol-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.3s ease;
}

.protocol-icon {
  font-size: 22px;
  transition: color 0.3s ease;
}

.protocol-meta {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  flex: 1;
}

.protocol-name {
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

.protocol-desc {
  font-size: 12px;
  color: #8c8c8c;
  line-height: 1.4;
}

.card-body-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 14px 20px;
}

.access-url-section {
  width: 320px;
  flex-shrink: 0;
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

.access-url-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 8px;
  padding: 6px 10px;
}

.access-url {
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

.card-config-area {
  width: 420px;
  flex-shrink: 0;
}

.config-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.config-item {
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

.config-item-label {
  color: #8c8c8c;
  flex-shrink: 0;
}

.config-item-value {
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
  .card-body-row {
    flex-direction: column;
  }
  .access-url-section,
  .card-config-area {
    width: 100%;
  }
}
</style>
<script lang="ts" setup>
import { IconifyIcon } from '@vben/icons';
import { useUserStore } from '@vben/stores';
import { SwitchToggle, Tag } from '#/components/ui-kit';
import { Button } from 'ant-design-vue';
import { computed, ref } from 'vue';
import type { ServiceData } from '../types';

const userStore = useUserStore();

const props = defineProps<{
  service: ServiceData;
}>();

const emit = defineEmits<{
  (e: 'toggle', id: string, enabled: boolean): void;
  (e: 'guide', s: ServiceData): void;
  (e: 'configure', s: ServiceData): void;
  (e: 'copy', text: string): void;
}>();

function onToggle(checked: boolean) {
  emit('toggle', props.service.id, checked);
}

/** 状态标签配置 */
const statusConfig: Record<string, { type: string; text: string }> = {
  running: { type: 'success', text: '运行中' },
  stopped: { type: 'default', text: '已停止' },
  error: { type: 'danger', text: '异常' },
};

// ===== 连接方式数据 =====
const ipAddress = computed(() => {
  const url = props.service.url || '';
  // 从 \\192.168.1.100\share 格式中提取 IP 地址
  const match = url.match(/\\(.+?)(\\|$)/);
  return match ? match[1] : '';
});

const macUrl = computed(() => `smb://${ipAddress.value}`);
const windowsUrl = computed(() => `\\\\${ipAddress.value}`);

const port = computed(() => {
  const item = props.service.quickInfo?.find((q) => q.label === '端口');
  return item?.value || '445';
});

const hostname = computed(() => {
  return (props.service.config as any)?.serverName || 'NAS';
});

/** 当前登录用户名（用于 SMB 连接） */
const username = computed(() => userStore.userInfo?.username || 'admin');
/** 密码（MOCK：SMB 连接密码与系统密码一致） */
const password = computed(() => 'admin123');
/** 密码默认隐藏，用户手动点击眼睛图标后展示 */
const showPassword = ref(false);
const displayedPassword = computed(() =>
  showPassword.value ? password.value : '••••••••',
);
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
              : 'var(--ict-border-light)',
          }"
        >
          <img
            src="/icons/smb.png"
            class="service-icon-img"
            alt="SMB"
          />
        </div>
        <div class="service-meta">
          <div class="service-name">
            {{ service.name }}
            <Tag
              class="status-tag"
              :type="statusConfig[service.status]?.type"
              :text="statusConfig[service.status]?.text"
            />
          </div>
          <div class="service-desc">{{ service.description }}</div>
        </div>
      </div>
      <div class="header-actions">
        <SwitchToggle :checked="service.enabled" checked-color="var(--ict-primary)" unchecked-color="var(--ict-border)" @update:checked="onToggle" />
      </div>
    </div>

    <!-- 启用状态内容 -->
    <div v-if="service.enabled" class="card-body">
      <!-- 连接方式 -->
      <div class="connection-section">
        <div class="connection-title">连接方式</div>
        <div class="connection-cards">
          <!-- Mac -->
          <div class="connection-card">
            <div class="connection-label">Mac</div>
            <div class="connection-steps">
              <span class="step">1. 访达</span>
              <IconifyIcon icon="lucide:chevrons-right" class="step-arrow" />
              <span class="step">2. 前往</span>
              <IconifyIcon icon="lucide:chevrons-right" class="step-arrow" />
              <span class="step">3. 连接服务器</span>
            </div>
            <div class="connection-url-bar">
              <span class="connection-url">{{ macUrl }}</span>
              <Button
                size="small"
                class="copy-btn"
                type="link"
                @click="emit('copy', macUrl)"
              >
                <IconifyIcon icon="lucide:copy" :style="{ fontSize: '14px' }" />
              </Button>
            </div>
          </div>
          <!-- Windows -->
          <div class="connection-card">
            <div class="connection-label">Windows</div>
            <div class="connection-steps">
              <span class="step">1. 文件</span>
              <IconifyIcon icon="lucide:chevrons-right" class="step-arrow" />
              <span class="step">2. 地址栏输入</span>
            </div>
            <div class="connection-url-bar">
              <span class="connection-url">{{ windowsUrl }}</span>
              <Button
                size="small"
                class="copy-btn"
                type="link"
                @click="emit('copy', windowsUrl)"
              >
                <IconifyIcon icon="lucide:copy" :style="{ fontSize: '14px' }" />
              </Button>
            </div>
          </div>
        </div>
        <!-- 账号信息 -->
        <div class="other-connection-title">账号信息</div>
        <div class="other-connection-card">
          <div class="other-connection-grid">
            <div class="other-connection-item">
              <span class="other-connection-label">用户名</span>
              <span class="other-connection-value">{{ username }}</span>
            </div>
            <div class="other-connection-item">
              <span class="other-connection-label">密码</span>
              <span class="other-connection-value password-value">
                {{ displayedPassword }}
              </span>
              <Button
                size="small"
                class="icon-action-btn"
                type="link"
                :aria-label="showPassword ? '隐藏密码' : '显示密码'"
                @click="showPassword = !showPassword"
              >
                <IconifyIcon
                  :icon="showPassword ? 'lucide:eye-off' : 'lucide:eye'"
                  :style="{ fontSize: '14px' }"
                />
              </Button>
              <Button
                size="small"
                class="icon-action-btn"
                type="link"
                @click="emit('copy', password)"
              >
                <IconifyIcon icon="lucide:copy" :style="{ fontSize: '14px' }" />
              </Button>
            </div>
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
  background: var(--ict-bg-card);
  border-radius: 10px;
  border: 1px solid var(--ict-border);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.service-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: var(--ict-primary);
  transform: translateY(-2px);
}

.service-card-disabled {
  opacity: 0.65;
  background: var(--ict-bg-section);
}

.service-card-disabled:hover {
  transform: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.service-card-disabled .card-header {
  background: var(--ict-bg-page);
  border-bottom-color: var(--ict-border);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  gap: 12px;
  border-bottom: 1px solid var(--ict-border-light);
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

.service-icon {
  font-size: var(--ict-headline-small);
  transition: color 0.3s ease;
}

.service-icon-img {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.service-meta {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  flex: 1;
}

.service-name {
  font-size: var(--ict-title-medium);
  font-weight: 600;
  color: var(--ict-text-emphasis);
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}


.service-desc {
  font-size: var(--ict-body-medium);
  color: var(--ict-text-secondary);
  line-height: 1.4;
}

.card-body {
  display: flex;
  align-items: flex-start;
  padding: 14px 20px;
  flex-wrap: wrap;
}

/* 连接方式区域 */
.connection-section {
  width: 100%;
}

.connection-title {
  font-size: var(--ict-title-small);
  font-weight: 600;
  color: var(--ict-text-emphasis);
  margin-bottom: 12px;
}

.connection-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 12px;
}

.connection-card {
  background: var(--ict-bg-page);
  border-radius: 12px;
  padding: 16px 20px;
}

.connection-label {
  font-size: var(--ict-body-medium);
  color: var(--ict-text-emphasis);
  margin-bottom: 8px;
}

.connection-steps {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.step {
  font-size: var(--ict-body-small);
  color: var(--ict-text-secondary);
}

.step-arrow {
  font-size: 16px;
  color: var(--ict-primary);
}

.connection-url-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  background: var(--ict-bg-card);
  border: 1px solid var(--ict-border);
  border-radius: 8px;
  padding: 8px 12px;
}

.connection-url {
  flex: 1;
  font-family: var(--ict-font-family);
  font-size: var(--ict-body-small);
  color: var(--ict-text-emphasis);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.copy-btn {
  color: var(--ict-text-secondary);
  padding: 2px 6px;
  height: auto;
  flex-shrink: 0;
}

.copy-btn:hover {
  color: var(--ict-primary);
  background: var(--ict-primary-light);
}

.icon-action-btn {
  color: var(--ict-text-secondary);
  padding: 2px 6px;
  height: auto;
  flex-shrink: 0;
  border-radius: var(--ict-radius-sm);
  transition: all 0.2s ease;
}

.icon-action-btn:hover,
.icon-action-btn:focus-visible {
  color: var(--ict-primary);
  background: var(--ict-primary-light);
}

/* 其他连接方式 */
.other-connection-card {
  background: var(--ict-bg-page);
  border-radius: 12px;
  padding: 16px 20px;
}

.other-connection-title {
  font-size: var(--ict-body-medium);
  font-weight: 600;
  color: var(--ict-text-emphasis);
  margin-bottom: 12px;
}

.other-connection-grid {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.other-connection-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.other-connection-label {
  font-size: var(--ict-body-small);
  color: var(--ict-text-secondary);
}

.other-connection-value {
  font-size: var(--ict-body-small);
  color: var(--ict-text-emphasis);
  font-weight: 500;
  font-family: var(--ict-font-family);
}

.password-value {
  min-width: 56px;
  letter-spacing: 1px;
}

.card-body-disabled {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 20px;
}

.disabled-hint {
  font-size: var(--ict-mark-medium);
  color: var(--ict-text-disabled);
  font-style: italic;
}

@media (max-width: 768px) {
  .connection-cards {
    grid-template-columns: 1fr;
  }
  .other-connection-grid {
    flex-direction: column;
    gap: 8px;
  }
}
</style>

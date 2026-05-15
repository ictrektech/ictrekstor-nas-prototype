<script lang="ts" setup>
import { computed } from 'vue';
import { Modal, Input, Button, Checkbox, Radio, DatePicker, Tooltip } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import type { SharedDir, LinkFormData } from '../types';

const props = defineProps<{
  visible: boolean;
  dir: SharedDir | null;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
  'save': [data: LinkFormData];
  'copy-link': [url: string];
}>();

const modelVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
});

const form = defineModel<LinkFormData>('form', {
  default: () => ({
    enabled: false,
    expireType: 'preset',
    expirePreset: '7',
    expireCustomDate: '',
    password: '',
  }),
});

function handleSave() {
  emit('save', { ...form.value });
  modelVisible.value = false;
}
</script>

<template>
  <Modal
    v-model:open="modelVisible"
    :title="`外链管理 - ${dir?.name || ''}`"
    width="480px"
    ok-text="保存"
    cancel-text="取消"
    @ok="handleSave"
  >
    <div class="link-modal-body">
      <!-- 文件夹信息卡片 -->
      <div class="link-folder-card">
        <IconifyIcon
          icon="lucide:folder-open"
          style="font-size: var(--ict-title-large); color: var(--ict-warning-active); flex-shrink: 0;"
        />
        <span class="link-folder-name">{{ dir?.name }}</span>
      </div>

      <!-- 启用外链开关 -->
      <div class="link-enable-row">
        <Checkbox v-model:checked="form.enabled">
          <span class="link-enable-label">启用外链分享</span>
        </Checkbox>
        <Tooltip title="开启后，任何人可通过链接访问此文件夹">
          <IconifyIcon
            icon="lucide:circle-help"
            style="font-size: var(--ict-mark-medium); color: var(--ict-text-disabled); cursor: help;"
          />
        </Tooltip>
      </div>

      <template v-if="form.enabled">
        <!-- 共享链接 -->
        <div class="link-section">
          <div class="link-section-title">共享链接</div>
          <div class="link-url-row">
            <Input
              v-model:value="dir!.linkUrl"
              readonly
              class="link-url-input"
            />
            <Button
              type="primary"
              size="small"
              @click="emit('copy-link', dir!.linkUrl)"
            >
              复制
            </Button>
          </div>
        </div>

        <!-- 访问次数 -->
        <div class="link-section">
          <div class="link-section-title">访问次数</div>
          <span class="link-stat-num">
            {{ dir?.linkAccessCount || 0 }}
          </span>
        </div>

        <!-- 有效期 -->
        <div class="link-section">
          <div class="link-section-title">有效期</div>
          <Radio.Group
            v-model:value="form.expireType"
            size="small"
            class="link-expire-radio"
          >
            <Radio.Button value="preset">预设</Radio.Button>
            <Radio.Button value="custom">自定义</Radio.Button>
            <Radio.Button value="forever">永久</Radio.Button>
          </Radio.Group>
          <div
            v-if="form.expireType === 'preset'"
            class="link-preset-days"
          >
            <Radio.Group
              v-model:value="form.expirePreset"
              size="small"
            >
              <Radio.Button value="1">1天</Radio.Button>
              <Radio.Button value="7">7天</Radio.Button>
              <Radio.Button value="30">30天</Radio.Button>
            </Radio.Group>
          </div>
          <div
            v-else-if="form.expireType === 'custom'"
            class="link-custom-date"
          >
            <DatePicker
              v-model:value="form.expireCustomDate"
              placeholder="选择到期日期"
              size="small"
              style="width: 100%;"
            />
          </div>
        </div>

        <!-- 访问密码 -->
        <div class="link-section">
          <div class="link-section-title">访问密码（选填）</div>
          <Input
            v-model:value="form.password"
            placeholder="不设置密码则公开访问"
          />
        </div>
      </template>

      <!-- 关闭状态提示 -->
      <div v-else class="link-disabled-hint">
        外链分享已关闭，开启后将生成共享链接
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.link-modal-body {
  padding: 4px 4px 12px;
}

.link-folder-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: linear-gradient(135deg, #fffbe6 0%, var(--ict-warning-light) 100%);
  border: 1px solid #ffd591;
  border-radius: 10px;
  margin-bottom: 16px;
}

.link-folder-name {
  font-size: var(--ict-body-medium);
  font-weight: 600;
  color: var(--ict-text-emphasis);
}

.link-enable-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--ict-border-light);
}

.link-enable-label {
  font-size: var(--ict-body-medium);
  color: var(--ict-text-emphasis);
}

.link-section {
  margin-bottom: 14px;
}

.link-section:last-of-type {
  margin-bottom: 0;
}

.link-section-title {
  font-size: var(--ict-mark-medium);
  font-weight: 500;
  color: var(--ict-text-emphasis);
  margin-bottom: 6px;
}

.link-url-row {
  display: flex;
  gap: 8px;
}

.link-url-input {
  flex: 1;
}

.link-url-input :deep(.ant-input) {
  background: var(--ict-bg-section);
  color: var(--ict-text-secondary);
}

.link-stat-num {
  font-size: var(--ict-title-large);
  font-weight: 700;
  color: var(--ict-text-emphasis);
  font-family: var(--ict-font-family);
}

.link-expire-radio {
  margin-bottom: 6px;
}

.link-preset-days {
  margin-top: 6px;
}

.link-disabled-hint {
  padding: 24px 0;
  text-align: center;
  font-size: var(--ict-mark-medium);
  color: var(--ict-text-secondary);
}
</style>
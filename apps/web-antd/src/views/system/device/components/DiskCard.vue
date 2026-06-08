<script lang="ts" setup>
import { computed } from 'vue';
import { Button, Progress, Tooltip } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import { Tag } from '#/components/ui-kit';
import type { DiskInfo, StoragePool } from '#/api/storage';

const props = defineProps<{
  disk: DiskInfo;
  pools: StoragePool[];
}>();

const emit = defineEmits<{
  locate: [disk: DiskInfo];
  sleep: [disk: DiskInfo];
  blink: [disk: DiskInfo];
  detail: [disk: DiskInfo];
}>();

/** 容量进度条配色：按使用率高低语义着色（高占用 → 警告色） */
const capacityColor = computed(() => {
  const p = usagePercent.value;
  if (p >= 90) return 'var(--ict-danger)';
  if (p >= 75) return 'var(--ict-warning)';
  if (props.disk.deviceType?.includes('NVMe')) return '#eb2f96';
  if (props.disk.deviceType?.includes('SSD')) return 'var(--ict-info)';
  return 'var(--ict-primary)';
});

/**
 * 基于 deviceName 生成稳定的伪随机使用率（10% ~ 95%）。
 * 同一块磁盘每次渲染得到相同数值，便于演示一致性；不同磁盘则呈现差异化分布。
 */
const usagePercent = computed(() => {
  const name = props.disk.deviceName || '';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  // 未分配存储池的硬盘使用率显示为 0
  if (!props.disk.poolIds || props.disk.poolIds.length === 0) return 0;
  return 10 + (hash % 86); // 10 ~ 95
});

/** 将 disk.size（如 "1.81 TB"）解析为数值（GB） */
function parseSizeToGB(size?: string): number {
  if (!size) return 0;
  const m = size.match(/([\d.]+)\s*(TB|GB|MB)/i);
  if (!m) return 0;
  const num = parseFloat(m[1]);
  const unit = m[2].toUpperCase();
  if (unit === 'TB') return num * 1024;
  if (unit === 'GB') return num;
  if (unit === 'MB') return num / 1024;
  return 0;
}

/** 格式化容量数值（GB）为带单位的字符串 */
function formatGB(gb: number): string {
  if (gb >= 1024) return (gb / 1024).toFixed(2) + ' TB';
  if (gb >= 1) return gb.toFixed(0) + ' GB';
  return (gb * 1024).toFixed(0) + ' MB';
}

/** 已用容量文本 */
const usedSizeText = computed(() => {
  const totalGB = parseSizeToGB(props.disk.size);
  return formatGB((totalGB * usagePercent.value) / 100);
});


/** 健康状态映射到 Tag 的语义类型 */
const healthTagType = computed<
  'success' | 'warning' | 'danger' | 'default'
>(() => {
  switch (props.disk.healthStatus) {
    case '正常':
      return 'success';
    case '警告':
      return 'warning';
    case '异常':
      return 'danger';
    default:
      return 'default';
  }
});

/** 该硬盘所属存储池的名称列表（用逗号分隔显示） */
const poolNamesText = computed(() => {
  if (!props.disk.poolIds || props.disk.poolIds.length === 0) return '未分配';
  return props.disk.poolIds
    .map((pid) => props.pools.find((p) => p.id === pid)?.name || pid)
    .join('、');
});
</script>

<template>
  <div class="disk-nest-card">
    <!-- 头部：图标盒 + 名称 + 健康状态 + 存储池副标题 -->
    <div class="nest-card-header">
      <Tooltip title="点击在示意图中定位">
        <div class="nest-icon-box" @click="emit('locate', disk)">
          <img src="/icons/disk.png" class="nest-icon-img" alt="disk" />
        </div>
      </Tooltip>
      <div class="nest-title-info">
        <div class="nest-name-row">
          <span class="nest-name">{{ disk.deviceName }}</span>
          <Tag :type="healthTagType" :text="disk.healthStatus || '未知'" />
        </div>
        <span class="pool-subtitle">所属存储池：{{ poolNamesText }}</span>
      </div>
    </div>

    <!-- 内容：属性信息（类型 + 序列号/型号） -->
    <div class="nest-card-body">
      <div class="disk-attrs-row">
        <span class="disk-attr">
          <span class="attr-label">类型</span>
          <span class="attr-value">{{ disk.deviceType || '-' }}</span>
        </span>
        <span class="disk-attr model-text">
          <span class="model-text__label">序列号</span>
          <span class="model-text__value">{{ disk.serial || '-' }}</span>
          <span class="model-text__divider">·</span>
          <span class="model-text__label">型号</span>
          <span class="model-text__value">{{ disk.model || '-' }}</span>
        </span>
      </div>
    </div>

    <!-- 底部操作区（顶部带分割线） -->
    <div class="nest-card-footer">
      <div class="nest-actions">
        <Tooltip title="休眠">
          <Button size="small" class="action-btn" @click="emit('sleep', disk)">
            <IconifyIcon icon="lucide:moon" class="action-icon" />
          </Button>
        </Tooltip>
        <Tooltip title="切换指示灯">
          <Button size="small" class="action-btn" @click="emit('blink', disk)">
            <IconifyIcon icon="lucide:lightbulb" class="action-icon" />
          </Button>
        </Tooltip>
        <Button
          size="small"
          type="primary"
          class="detail-btn"
          @click="emit('detail', disk)"
        >
          <IconifyIcon
            icon="lucide:file-text"
            style="font-size: var(--ict-mark-small);"
          />
          详情
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 与 VolumeNestCard 一致的容器结构：垂直堆叠 3 层（header / body / footer） */
.disk-nest-card {
  background: var(--ict-bg-card);
  border-radius: 10px;
  border: 1px solid var(--ict-border);
  overflow: hidden;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.disk-nest-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: var(--ict-primary);
}

/* ============ 头部：图标盒 + 标题信息 ============ */
.nest-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 参照 ExternalDeviceCard 的 .device-icon-wrapper：
   52×52 圆角灰底盒 + 32×32 PNG 图标。点击在示意图中定位时给予轻微 hover 反馈。 */
.nest-icon-box {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}

.nest-icon-box:hover {
  background: var(--ict-primary-light);
  transform: scale(1.05);
}

.nest-icon-img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.nest-title-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.nest-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.nest-name {
  font-size: var(--ict-title-medium);
  font-weight: 600;
  color: var(--ict-text-emphasis);
  white-space: nowrap;
  flex: auto;
}

/* 副标题：存储池（位于 nest-name 下方） */
.pool-subtitle {
  font-size: var(--ict-body-medium);
  color: var(--ict-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ============ 容量进度条 ============ */
.info-capacity {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-capacity :deep(.ant-progress),
.info-capacity :deep(.ant-progress-outer),
.info-capacity :deep(.ant-progress-inner) {
  margin: 0;
  padding: 0;
  line-height: 0;
  font-size: 0;
}

.capacity-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--ict-body-small);
  color: var(--ict-text-secondary);
}

.cap-used {
  color: var(--ict-text-secondary);
}

.cap-percent {
  font-weight: 600;
  color: var(--ict-text-emphasis);
}

/* ============ 中部：属性行 ============ */
.nest-card-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.disk-attrs-row {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  align-items: center;
}

.disk-attr {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--ict-body-small);
}

.attr-label {
  color: var(--ict-text-secondary);
}

.attr-value {
  color: var(--ict-text-primary);
  font-weight: 500;
}

/* model-text 现作为一个 .disk-attr，继承 disk-attr 的尺寸/间距，
   但保留其内部 label / serial / divider / model 的字体细节。 */
.model-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.model-text__label {
  color: var(--ict-text-secondary);
}

.model-text__value {
  color: var(--ict-text-primary);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.model-text__divider {
  color: var(--ict-text-disabled);
  margin: 0 2px;
}

/* ============ 底部：操作按钮区（顶部分割线） ============ */
.nest-card-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-top: 12px;
  border-top: 1px solid var(--ict-border-light);
}

.nest-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-btn {
  width: 26px;
  height: 26px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
}

.action-icon {
  font-size: var(--ict-body-small);
}

.detail-btn {
  height: 26px;
  padding: 0 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--ict-mark-small);
}
</style>

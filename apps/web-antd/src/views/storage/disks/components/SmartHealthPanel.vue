<script lang="ts" setup>
import { computed } from 'vue';
import { Card, Button } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import type { DiskInfo } from '#/api/storage';

const props = defineProps<{
  disk: DiskInfo;
}>();

const emit = defineEmits<{
  (e: 'show-detail'): void;
}>();

interface SmartSummary {
  health: string;
  powerOnHours: number;
  powerCycleCount: number;
  reallocatedSectors: number;
  pendingSectors: number;
  uncorrectableSectors: number;
  temperature: number;
  totalLbasWritten: number;
  totalLbasRead: number;
  udmaCrcErrors: number;
  lastSelfTest: string;
}

function parseSmartInfo(raw?: string): SmartSummary | null {
  if (!raw) return null;

  const extractAttr = (id: number): number => {
    const pattern = new RegExp(
      `^\\s*${id}\\s+\\S+(?:\\s+\\S+){6}\\s+-\\s+([\\d,]+)`,
      'm'
    );
    const m = raw.match(pattern);
    return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
  };

  const healthMatch = raw.match(/SMART overall-health self-assessment test result:\s*(\w+)/);
  const health = healthMatch ? healthMatch[1] : '未知';

  const selfTestLine = raw.match(/^.*Short offline.*$/m);
  let lastSelfTest = '--';
  if (selfTestLine) {
    const nums = [...selfTestLine[0].matchAll(/\d+/g)].map(m => m[0]);
    const lifetime = nums.length >= 2 ? nums[nums.length - 1] : null;
    lastSelfTest = lifetime ? `${lifetime} 小时前` : '--';
  }

  return {
    health,
    powerOnHours: extractAttr(9),
    powerCycleCount: extractAttr(12),
    reallocatedSectors: extractAttr(5),
    pendingSectors: extractAttr(197),
    uncorrectableSectors: extractAttr(198),
    temperature: extractAttr(194),
    totalLbasWritten: extractAttr(241),
    totalLbasRead: extractAttr(242),
    udmaCrcErrors: extractAttr(199),
    lastSelfTest,
  };
}

const smartSummary = computed(() => parseSmartInfo(props.disk?.smartctlInfo));

function formatLba(lba: number): string {
  if (lba === 0) return '0';
  const tb = (lba * 512) / (1024 ** 4);
  if (tb >= 1) return `${tb.toFixed(2)} TB`;
  const gb = (lba * 512) / (1024 ** 3);
  if (gb >= 1) return `${gb.toFixed(2)} GB`;
  return `${lba}`;
}

function formatHours(hours?: number): string {
  if (!hours) return '--';
  const days = Math.floor(hours / 24);
  if (days > 365) return `${(days / 365).toFixed(1)}年`;
  return `${days}天`;
}

function getSmartHealthColor(health: string): string {
  if (health === 'PASSED') return 'var(--ict-success)';
  if (health === 'FAILED') return 'var(--ict-danger)';
  return 'var(--ict-warning)';
}

function getTempColor(temp?: number): string {
  if (!temp) return 'var(--ict-text-secondary)';
  if (temp < 40) return 'var(--ict-success)';
  if (temp < 50) return 'var(--ict-warning)';
  return 'var(--ict-danger)';
}
</script>

<template>
  <Card class="smart-panel" :bordered="true" :body-style="{ padding: '16px' }">
    <div class="panel-title smart-title">
      <div class="smart-title-left">
        <IconifyIcon icon="lucide:activity" style="font-size: var(--ict-body-medium);" />
        健康状态
      </div>
      <Button size="small" class="view-raw-btn" @click="emit('show-detail')">
        <IconifyIcon icon="lucide:file-text" style="font-size: var(--ict-mark-small);" />
        查看完整信息
      </Button>
    </div>

    <div v-if="smartSummary" class="smart-grid">
      <div class="smart-cell" :style="{ borderLeftColor: getSmartHealthColor(smartSummary.health) }">
        <span class="smart-cell-label">整体评估</span>
        <span class="smart-cell-value" :style="{ color: getSmartHealthColor(smartSummary.health) }">
          {{ smartSummary.health === 'PASSED' ? '通过' : smartSummary.health === 'FAILED' ? '失败' : smartSummary.health }}
        </span>
      </div>
      <div class="smart-cell">
        <span class="smart-cell-label">通电时间</span>
        <span class="smart-cell-value">{{ formatHours(smartSummary.powerOnHours) }}</span>
      </div>
      <div class="smart-cell">
        <span class="smart-cell-label">通电次数</span>
        <span class="smart-cell-value">{{ smartSummary.powerCycleCount }} 次</span>
      </div>
      <div class="smart-cell">
        <span class="smart-cell-label">重映射扇区</span>
        <span class="smart-cell-value" :style="{ color: smartSummary.reallocatedSectors > 0 ? 'var(--ict-danger)' : 'var(--ict-success)' }">
          {{ smartSummary.reallocatedSectors }}
        </span>
      </div>
      <div class="smart-cell">
        <span class="smart-cell-label">待处理扇区</span>
        <span class="smart-cell-value" :style="{ color: smartSummary.pendingSectors > 0 ? 'var(--ict-danger)' : 'var(--ict-success)' }">
          {{ smartSummary.pendingSectors }}
        </span>
      </div>
      <div class="smart-cell">
        <span class="smart-cell-label">不可修复扇区</span>
        <span class="smart-cell-value" :style="{ color: smartSummary.uncorrectableSectors > 0 ? 'var(--ict-danger)' : 'var(--ict-success)' }">
          {{ smartSummary.uncorrectableSectors }}
        </span>
      </div>
      <div class="smart-cell">
        <span class="smart-cell-label">SMART 温度</span>
        <span class="smart-cell-value" :style="{ color: getTempColor(smartSummary.temperature) }">
          {{ smartSummary.temperature }}°C
        </span>
      </div>
      <div class="smart-cell">
        <span class="smart-cell-label">CRC 错误</span>
        <span class="smart-cell-value" :style="{ color: smartSummary.udmaCrcErrors > 0 ? 'var(--ict-danger)' : 'var(--ict-success)' }">
          {{ smartSummary.udmaCrcErrors }}
        </span>
      </div>
      <div class="smart-cell">
        <span class="smart-cell-label">总写入量</span>
        <span class="smart-cell-value">{{ formatLba(smartSummary.totalLbasWritten) }}</span>
      </div>
      <div class="smart-cell">
        <span class="smart-cell-label">总读取量</span>
        <span class="smart-cell-value">{{ formatLba(smartSummary.totalLbasRead) }}</span>
      </div>
      <div class="smart-cell">
        <span class="smart-cell-label">上次自检</span>
        <span class="smart-cell-value">{{ smartSummary.lastSelfTest }}</span>
      </div>
    </div>

    <div v-else class="smart-empty">
      <IconifyIcon icon="lucide:activity" style="font-size: 32px; color: var(--ict-text-disabled);" />
      <span>暂无 SMART 信息</span>
    </div>
  </Card>
</template>

<style scoped>
.smart-panel {
  border-radius: 10px;
}

.panel-title {
  font-size: var(--ict-body-medium);
  font-weight: 600;
  color: var(--ict-text-emphasis);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.smart-title {
  justify-content: space-between;
}

.smart-title-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.view-raw-btn {
  font-size: var(--ict-mark-small);
  display: inline-flex;
  align-items: center;
  gap: 3px;
  border-radius: 5px;
  padding: 0 8px;
  height: 26px;
}

.smart-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
}

.smart-cell {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 8px 10px;
  background: var(--ict-bg-section);
  border-radius: 8px;
  border-left: 3px solid var(--ict-text-disabled);
}

.smart-cell-label {
  font-size: var(--ict-mark-small);
  color: var(--ict-text-secondary);
}

.smart-cell-value {
  font-size: var(--ict-body-medium);
  font-weight: 600;
  color: var(--ict-text-emphasis);
  font-family: var(--ict-font-family);
}

.smart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px 0;
  color: var(--ict-text-secondary);
  font-size: var(--ict-mark-medium);
}

@media (max-width: 768px) {
  .smart-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
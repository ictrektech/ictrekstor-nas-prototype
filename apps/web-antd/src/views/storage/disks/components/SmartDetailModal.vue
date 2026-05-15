<script lang="ts" setup>
import { ref, computed } from 'vue';
import { Modal, Descriptions, Table, Button } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import type { DiskInfo } from '#/api/storage';

const props = defineProps<{
  visible: boolean;
  disk: DiskInfo | null;
}>();

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void;
}>();

const rawView = ref(false);

const smartAttrColumns = [
  { title: 'ID', dataIndex: 'id', width: 50 },
  { title: '属性名', dataIndex: 'name', width: 160 },
  { title: 'FLAG', dataIndex: 'flag', width: 70 },
  { title: '当前值', dataIndex: 'value', width: 60, align: 'center' },
  { title: '最差值', dataIndex: 'worst', width: 60, align: 'center' },
  { title: '阈值', dataIndex: 'thresh', width: 60, align: 'center' },
  { title: '类型', dataIndex: 'type', width: 80 },
  { title: 'RAW_VALUE', dataIndex: 'rawValue', ellipsis: true },
];

const smartInfoSection = computed(() => {
  if (!props.disk?.smartctlInfo) return [];
  const raw = props.disk.smartctlInfo;
  const match = raw.match(/=== START OF INFORMATION SECTION ===([\s\S]*?)(?=== START OF READ SMART|$)/);
  if (!match) return [];
  return match[1].trim().split('\n')
    .map((line: string) => {
      const m = line.match(/^([\w\s/()]+?):\s+(.*)$/);
      return m ? { label: m[1].trim(), value: m[2].trim() } : null;
    })
    .filter(Boolean) as { label: string; value: string }[];
});

const smartAttributes = computed(() => {
  if (!props.disk?.smartctlInfo) return [];
  const raw = props.disk.smartctlInfo;
  const match = raw.match(/Vendor Specific SMART Attributes with Thresholds:([\s\S]*?)(?=\n\s*\n\s*SMART Error Log|$)/);
  if (!match) return [];
  const lines = match[1].trim().split('\n');
  const data: any[] = [];
  for (const line of lines) {
    const m = line.match(/^\s*(\d+)\s+(\S+)\s+(\S+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(.*)$/);
    if (m) {
      data.push({
        id: m[1], name: m[2], flag: m[3],
        value: m[4], worst: m[5], thresh: m[6],
        type: m[7], updated: m[8], whenFailed: m[9], rawValue: m[10].trim(),
      });
    }
  }
  return data;
});

const smartTextSections = computed(() => {
  if (!props.disk?.smartctlInfo) return [];
  const raw = props.disk.smartctlInfo;
  const sections: { title: string; content: string }[] = [];

  const readSmartMatch = raw.match(/=== START OF READ SMART DATA SECTION ===([\s\S]*?)(?=Vendor Specific SMART Attributes|$)/);
  if (readSmartMatch) {
    const content = readSmartMatch[1].trim();
    if (content) {
      sections.push({ title: 'READ SMART DATA SECTION', content });
    }
  }

  const errorLogMatch = raw.match(/(SMART Error Log[\s\S]*?)(?=SMART Self-test|$)/);
  if (errorLogMatch) {
    sections.push({ title: 'SMART Error Log', content: errorLogMatch[1].trim() });
  }

  const selfTestMatch = raw.match(/(SMART Self-test log[\s\S]*?)(?=SMART Selective|$)/);
  if (selfTestMatch) {
    sections.push({ title: 'SMART Self-test Log', content: selfTestMatch[1].trim() });
  }

  const selectiveMatch = raw.match(/(SMART Selective self-test log[\s\S]*)/);
  if (selectiveMatch) {
    sections.push({ title: 'SMART Selective Self-test Log', content: selectiveMatch[1].trim() });
  }

  return sections;
});

function toggleView() {
  rawView.value = !rawView.value;
}

function onClose() {
  rawView.value = false;
  emit('update:visible', false);
}
</script>

<template>
  <Modal
    :open="visible"
    title="健康状态"
    width="960px"
    :footer="null"
    class="smart-modal"
    @update:open="onClose"
  >
    <div v-if="!rawView" class="smart-structured">
      <div v-if="smartInfoSection.length > 0" class="smart-section">
        <div class="smart-section-title">
          <IconifyIcon icon="lucide:info" style="font-size: var(--ict-mark-medium);" />
          设备信息 (INFORMATION SECTION)
        </div>
        <Descriptions :column="2" size="small" bordered>
          <Descriptions.Item v-for="item in smartInfoSection" :key="item.label" :label="item.label">
            {{ item.value }}
          </Descriptions.Item>
        </Descriptions>
      </div>

      <div v-if="smartAttributes.length > 0" class="smart-section">
        <div class="smart-section-title">
          <IconifyIcon icon="lucide:table" style="font-size: var(--ict-mark-medium);" />
          SMART 属性 (Vendor Specific SMART Attributes with Thresholds)
        </div>
        <Table
          :columns="smartAttrColumns"
          :data-source="smartAttributes"
          size="small"
          :pagination="false"
          :scroll="{ x: 700, y: 400 }"
          row-key="id"
        />
      </div>

      <div v-for="section in smartTextSections" :key="section.title" class="smart-section">
        <div class="smart-section-title">
          <IconifyIcon icon="lucide:file-text" style="font-size: var(--ict-mark-medium);" />
          {{ section.title.replace('START OF ', '') }}
        </div>
        <pre class="smart-section-pre">{{ section.content }}</pre>
      </div>
    </div>

    <pre v-else class="smart-raw">{{ disk?.smartctlInfo || '暂无 SMART 信息' }}</pre>

    <div class="smart-modal-footer">
      <Button size="small" @click="toggleView">
        <IconifyIcon :icon="rawView ? 'lucide:table' : 'lucide:terminal'" style="font-size: var(--ict-body-small);" />
        {{ rawView ? '查看结构化信息' : '查看原始信息' }}
      </Button>
    </div>
  </Modal>
</template>

<style scoped>
.smart-structured {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: 640px;
  overflow-y: auto;
  padding-right: 4px;
}

.smart-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.smart-section-title {
  font-size: var(--ict-mark-medium);
  font-weight: 600;
  color: var(--ict-text-emphasis);
  display: flex;
  align-items: center;
  gap: 5px;
}

.smart-section-pre {
  background: var(--ict-bg-section);
  border: 1px solid var(--ict-border-light);
  border-radius: 6px;
  padding: 10px 12px;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  font-size: var(--ict-mark-small);
  line-height: 1.6;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--ict-text-secondary);
}

.smart-modal-footer {
  display: flex;
  justify-content: center;
  padding-top: 12px;
  border-top: 1px solid var(--ict-border-light);
  margin-top: 12px;
}

.smart-raw {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 16px;
  border-radius: 6px;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  font-size: var(--ict-body-small);
  line-height: 1.6;
  overflow-x: auto;
  max-height: 600px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
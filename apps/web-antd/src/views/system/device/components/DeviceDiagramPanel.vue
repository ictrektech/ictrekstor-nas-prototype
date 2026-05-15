<script lang="ts" setup>
import { ref } from 'vue';
import { Card } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import DeviceDiagram from './DeviceDiagram.vue';
import type { DiskInfo } from '#/api/storage';

defineProps<{
  disks: DiskInfo[];
  selectedDisk: string;
}>();

const emit = defineEmits<{
  select: [disk: DiskInfo | null];
  locate: [deviceName: string];
}>();

const frontRef = ref<InstanceType<typeof DeviceDiagram> | null>(null);
const rearRef = ref<InstanceType<typeof DeviceDiagram> | null>(null);

function handleSelect(disk: DiskInfo | null) {
  emit('select', disk);
}

function handleLocate(deviceName: string) {
  emit('locate', deviceName);
}

defineExpose({
  highlightBay: (name: string) => frontRef.value?.highlightBay?.(name),
});
</script>

<template>
  <Card class="diagram-card" :bordered="true" :body-style="{ padding: 0 }">
    <div class="diagram-card-header">
      <div class="diagram-card-title">
        <IconifyIcon icon="lucide:layout-grid" style="font-size: var(--ict-title-medium); color: var(--ict-text-secondary);" />
        硬件示意图
      </div>
      <span class="diagram-hint">点击插槽可查看对应硬盘信息</span>
    </div>
    <div class="diagram-panels">
      <!-- 前面板 -->
      <div class="diagram-panel">
        <div class="diagram-panel-label">
          <IconifyIcon icon="lucide:square" style="font-size: var(--ict-body-small); color: var(--ict-text-secondary);" />
          前面板
        </div>
        <DeviceDiagram
          ref="frontRef"
          :disks="disks"
          :selected-disk="selectedDisk"
          mode="front"
          @select="handleSelect"
          @locate="handleLocate"
        />
      </div>
      <!-- 后面板 -->
      <div class="diagram-panel">
        <div class="diagram-panel-label">
          <IconifyIcon icon="lucide:square" style="font-size: var(--ict-body-small); color: var(--ict-text-secondary);" />
          后面板
        </div>
        <DeviceDiagram
          ref="rearRef"
          :disks="disks"
          :selected-disk="selectedDisk"
          mode="rear"
          @select="handleSelect"
          @locate="handleLocate"
        />
      </div>
    </div>
  </Card>
</template>

<style scoped>
.diagram-card { background: var(--ict-bg-card); border-radius: 14px; border: 1px solid var(--ict-border); box-shadow: 0 2px 8px rgba(0,0,0,0.04); overflow: hidden; }
.diagram-card-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; border-bottom: 1px solid var(--ict-border-light); background: var(--ict-bg-section); }
.diagram-card-title { display: flex; align-items: center; gap: 10px; font-size: var(--ict-title-small); font-weight: 600; color: var(--ict-text-emphasis); }
.diagram-hint { font-size: var(--ict-body-small); color: var(--ict-text-disabled); }
.diagram-panels { display: flex; align-items: stretch; justify-content: center; gap: 0; }
</style>
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

const diagramRef = ref<InstanceType<typeof DeviceDiagram> | null>(null);

function handleSelect(disk: DiskInfo | null) {
  emit('select', disk);
}

function handleLocate(deviceName: string) {
  emit('locate', deviceName);
}

defineExpose({
  highlightBay: (name: string) => diagramRef.value?.highlightBay?.(name),
});
</script>

<template>
  <Card class="diagram-card" :bordered="true" :body-style="{ padding: 0 }">
    <div class="diagram-card-header">
      <div class="diagram-card-title">
        <IconifyIcon icon="lucide:layout-grid" style="font-size: 16px; color: #595959;" />
        硬件示意图
      </div>
      <span class="diagram-hint">点击插槽可查看对应硬盘信息</span>
    </div>
    <div class="diagram-panels">
      <DeviceDiagram
        ref="diagramRef"
        :disks="disks"
        :selected-disk="selectedDisk"
        @select="handleSelect"
        @locate="handleLocate"
      />
    </div>
  </Card>
</template>

<style scoped>
.diagram-card { background: #ffffff; border-radius: 14px; border: 1px solid #e8e8e8; box-shadow: 0 2px 8px rgba(0,0,0,0.04); overflow: hidden; }
.diagram-card-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; border-bottom: 1px solid #f0f0f0; background: #fafafa; }
.diagram-card-title { display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 600; color: #262626; }
.diagram-hint { font-size: 12px; color: #bfbfbf; }
.diagram-panels { display: flex; align-items: stretch; justify-content: center; gap: 0; }
</style>
<script lang="ts" setup>
import { computed } from 'vue';
import { Radio, DatePicker } from 'ant-design-vue';

interface Props {
  type: 'preset' | 'custom' | 'forever';
  preset: string;
  customDate: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:type': [type: 'preset' | 'custom' | 'forever'];
  'update:preset': [preset: string];
  'update:customDate': [date: string];
}>();

function updateType(v: 'preset' | 'custom' | 'forever') {
  emit('update:type', v);
}
</script>

<template>
  <div class="expire-selector">
    <Radio.Group :value="type" size="small" @change="updateType($event.target.value)">
      <Radio.Button value="preset">预设</Radio.Button>
      <Radio.Button value="custom">自定义</Radio.Button>
      <Radio.Button value="forever">永久</Radio.Button>
    </Radio.Group>
    <div v-if="type === 'preset'" class="expire-preset">
      <Radio.Group :value="preset" size="small" @change="emit('update:preset', $event.target.value)">
        <Radio.Button value="1">1天</Radio.Button>
        <Radio.Button value="7">7天</Radio.Button>
        <Radio.Button value="30">30天</Radio.Button>
      </Radio.Group>
    </div>
    <div v-else-if="type === 'custom'" class="expire-custom">
      <DatePicker :value="customDate" placeholder="选择到期日期" size="small" style="width: 100%;" @change="emit('update:customDate', $event)" />
    </div>
  </div>
</template>

<style scoped>
.expire-selector {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.expire-preset {
  display: flex;
  gap: 6px;
}

.expire-custom {
  width: 100%;
}
</style>
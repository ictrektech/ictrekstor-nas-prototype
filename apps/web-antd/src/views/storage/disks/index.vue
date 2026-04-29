<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { Card, Table } from 'ant-design-vue';
import { getDisksApi, type DiskInfo } from '#/api/storage';

const disks = ref<DiskInfo[]>([]);
const loading = ref(false);

const columns = [
  { title: '设备名', dataIndex: 'deviceName', key: 'deviceName' },
  { title: '设备路径', dataIndex: 'devicePath', key: 'devicePath' },
  { title: '磁盘型号', dataIndex: 'model', key: 'model' },
  { title: '磁盘序列号', dataIndex: 'serial', key: 'serial' },
  { title: '磁盘大小', dataIndex: 'size', key: 'size' },
  { title: '磁盘状态', dataIndex: 'status', key: 'status' },
  { title: '是否被使用', dataIndex: 'isUsed', key: 'isUsed' },
  { title: '物理扇区大小', dataIndex: 'physicalSectorSize', key: 'physicalSectorSize' },
  { title: '逻辑扇区大小', dataIndex: 'logicalSectorSize', key: 'logicalSectorSize' },
  { title: '旋转磁盘', dataIndex: 'isRotational', key: 'isRotational' },
  { title: '设备类型', dataIndex: 'deviceType', key: 'deviceType' },
  { title: '全球唯一标识符', dataIndex: 'uuid', key: 'uuid' },
  { title: '传输类型', dataIndex: 'transportType', key: 'transportType' },
  { title: '子系统信息', dataIndex: 'subsystem', key: 'subsystem' },
  { title: '热插拔', dataIndex: 'isHotpluggable', key: 'isHotpluggable' },
];

async function loadData() {
  loading.value = true;
  try {
    disks.value = await getDisksApi();
  } finally {
    loading.value = false;
  }
}

onMounted(loadData);
</script>

<template>
  <div class="p-5">
    <Card title="硬盘管理">
      <Table
        :columns="columns"
        :data-source="disks"
        :loading="loading"
        row-key="deviceName"
        size="small"
        :scroll="{ x: 1500 }"
      />
    </Card>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { Card, Tabs, TabPane, Button, Space } from 'ant-design-vue';
import { getDashboardSummaryApi, type DashboardSummary } from '#/api/dashboard';

const summary = ref<DashboardSummary | null>(null);
const loading = ref(false);

async function loadData() {
  loading.value = true;
  try {
    summary.value = await getDashboardSummaryApi();
  } finally {
    loading.value = false;
  }
}

onMounted(loadData);
</script>

<template>
  <div v-if="summary" class="p-5">
    <!-- 设备基本信息 -->
    <Card class="mb-4" title="设备信息">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <div class="text-sm text-gray-400">设备名称</div>
          <div class="font-medium">{{ summary.deviceName }}</div>
        </div>
        <div>
          <div class="text-sm text-gray-400">设备ID</div>
          <div class="font-medium">{{ summary.deviceId }}</div>
        </div>
        <div>
          <div class="text-sm text-gray-400">系统版本</div>
          <Space>
            <span class="font-medium">{{ summary.systemVersion }}</span>
            <Button size="small" type="primary">检查更新</Button>
          </Space>
        </div>
        <div>
          <div class="text-sm text-gray-400">本次运行时间</div>
          <div class="font-medium">{{ summary.uptime }}</div>
        </div>
        <div>
          <div class="text-sm text-gray-400">账号</div>
          <div class="font-medium">{{ summary.account }}</div>
        </div>
        <div>
          <div class="text-sm text-gray-400">VIVIBIT Connect</div>
          <a :href="summary.connectUrl" target="_blank" class="text-blue-500">{{ summary.connectUrl }}</a>
        </div>
      </div>
    </Card>

    <!-- 空间概览 -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 mb-4">
      <Card title="存储空间">
        <div class="flex justify-between">
          <div>
            <div class="text-sm text-gray-400">已用</div>
            <div class="text-xl font-bold">{{ summary.storageSpace.used }}</div>
          </div>
          <div class="text-right">
            <div class="text-sm text-gray-400">总容量</div>
            <div class="text-xl font-bold">{{ summary.storageSpace.total }}</div>
          </div>
        </div>
      </Card>
      <Card title="系统空间">
        <div class="flex justify-between">
          <div>
            <div class="text-sm text-gray-400">已用</div>
            <div class="text-xl font-bold">{{ summary.systemSpace.used }}</div>
          </div>
          <div class="text-right">
            <div class="text-sm text-gray-400">总容量</div>
            <div class="text-xl font-bold">{{ summary.systemSpace.total }}</div>
          </div>
        </div>
      </Card>
    </div>

    <!-- 硬件信息 -->
    <Card class="mb-4" title="硬件信息">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <div class="text-sm text-gray-400">CPU</div>
          <div class="font-medium">
            {{ summary.hardware.cpuCores }} 核 {{ summary.hardware.cpuThreads }} 线程
          </div>
        </div>
        <div>
          <div class="text-sm text-gray-400">运行内存</div>
          <div class="font-medium">{{ summary.hardware.memory }}</div>
        </div>
      </div>
    </Card>

    <!-- 网络信息 -->
    <Card title="网络">
      <Tabs>
        <TabPane
          v-for="net in summary.networks"
          :key="net.name"
          :tab="net.name"
        >
          <div class="grid grid-cols-1 gap-2 md:grid-cols-2">
            <div><span class="text-gray-400">名称：</span>{{ net.name }}</div>
            <div><span class="text-gray-400">IPv4连接状态：</span>{{ net.ipv4Status }}</div>
            <div><span class="text-gray-400">IPv4地址：</span>{{ net.ipv4Address }}</div>
            <div><span class="text-gray-400">MAC地址：</span>{{ net.mac }}</div>
            <div><span class="text-gray-400">网络配置：</span>MTU{{ net.mtu }}</div>
          </div>
        </TabPane>
      </Tabs>
    </Card>
  </div>
</template>

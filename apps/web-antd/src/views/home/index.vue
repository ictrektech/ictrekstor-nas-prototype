<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { Card, Tabs, TabPane, Button, Space } from 'ant-design-vue';
import {
  getDashboardSummaryApi,
  type DashboardSummary,
} from '#/api/dashboard';

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
    <!-- AI 智能助手 -->
    <Card class="mb-4" title="AI 智能助手">
      <p class="text-gray-500 mb-4">
        您的专属数据管家，让文件管理变得更加智能和高效
      </p>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card class="text-center">
          <div class="text-2xl mb-2">💬</div>
          <div class="font-medium">智能对话</div>
          <div class="text-sm text-gray-400">自然语言交互，随时解答</div>
        </Card>
        <Card class="text-center">
          <div class="text-2xl mb-2">🔍</div>
          <div class="font-medium">智能搜索</div>
          <div class="text-sm text-gray-400">以文搜图，以图搜图</div>
        </Card>
        <Card class="text-center">
          <div class="text-2xl mb-2">📚</div>
          <div class="font-medium">知识库</div>
          <div class="text-sm text-gray-400">企业知识智能管理</div>
        </Card>
      </div>
    </Card>

    <!-- 快捷入口 -->
    <Card class="mb-4" title="快捷入口">
      <Space>
        <Button type="primary">⚙️ 设置</Button>
      </Space>
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

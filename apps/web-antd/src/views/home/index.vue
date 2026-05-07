<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  Card,
  Button,
  Row,
  Col,
  Progress,
  Statistic,
  Tag,
  Badge,
} from 'ant-design-vue';
import {
  getDashboardSummaryApi,
  type DashboardSummary,
} from '#/api/dashboard';

const router = useRouter();
const summary = ref<DashboardSummary | null>(null);
const loading = ref(false);

const quickEntries = [
  { icon: '📁', title: '我的文件', desc: '浏览和管理文件', path: '/file/my-files', color: '#1890ff' },
  { icon: '🌐', title: '全部文件', desc: '存储空间概览', path: '/storage/all-files', color: '#52c41a' },
  { icon: '👥', title: '团队文件', desc: '协作共享文件', path: '/storage/team-files', color: '#722ed1' },
  { icon: '🔗', title: '我的共享', desc: '管理共享链接', path: '/file/shared', color: '#fa8c16' },
  { icon: '🗑️', title: '回收站', desc: '恢复或删除文件', path: '/file/recycle', color: '#ff4d4f' },
  { icon: '🌐', title: '网络访问', desc: 'SMB/NFS/WebDAV', path: '/file/network', color: '#13c2c2' },
  { icon: '💾', title: '存储池', desc: 'RAID 和磁盘管理', path: '/storage/pools', color: '#eb2f96' },
  { icon: '⚙️', title: '系统设置', desc: '设备和网络配置', path: '/system/device', color: '#595959' },
];

const systemAlerts = [
  { type: 'warning', message: '存储空间1 使用率达到 50%，建议清理', time: '2小时前' },
  { type: 'success', message: '系统备份任务已成功完成', time: '昨天' },
  { type: 'error', message: '硬盘 sdb 温度超过阈值 (42°C)', time: '3天前' },
  { type: 'warning', message: '存储空间3 使用率达到 75%，即将满载', time: '4小时前' },
  { type: 'success', message: '用户 zhangsan 上传了 50 个文件', time: '今天' },
  { type: 'error', message: '网络连接 eth1 出现短暂中断', time: '5小时前' },
  { type: 'warning', message: '回收站占用空间超过 1GB', time: '1天前' },
  { type: 'warning', message: '存储空间4 使用率达到 65%', time: '6小时前' },
  { type: 'success', message: '共享文件夹 "设计资源" 权限已更新', time: '2天前' },
  { type: 'error', message: '硬盘 sdc SMART 检测到异常', time: '1周前' },
];

async function loadData() {
  loading.value = true;
  try {
    summary.value = await getDashboardSummaryApi();
  } finally {
    loading.value = false;
  }
}

onMounted(loadData);

const storagePercent = computed(() => {
  if (!summary.value) return 0;
  const used = parseFloat(summary.value.systemSpace.used);
  const total = parseFloat(summary.value.systemSpace.total);
  return Math.round((used / total) * 100);
});

function goTo(path: string) {
  router.push(path);
}
</script>

<template>
  <div v-if="summary" class="home-page">
    <!-- 欢迎栏 -->
    <div class="welcome-bar">
      <div class="welcome-left">
        <h2 class="welcome-title">
          👋 欢迎回来，{{ summary.account }}
        </h2>
        <p class="welcome-desc">
          设备 {{ summary.deviceName }} 已稳定运行 {{ summary.uptime }} · 系统版本 {{ summary.systemVersion }}
        </p>
      </div>
      <div class="welcome-right">
        <Button type="primary" @click="goTo('/ai/chat')">
          🤖 AI 助手
        </Button>
      </div>
    </div>

    <!-- 快捷入口 -->
    <Card class="section-card" title="📌 快捷入口" :bordered="false">
      <Row :gutter="[16, 16]">
        <Col v-for="entry in quickEntries" :key="entry.title" :xs="12" :sm="8" :md="6" :lg="6">
          <div class="quick-card" @click="goTo(entry.path)">
            <div class="quick-icon" :style="{ background: entry.color + '15', color: entry.color }">
              {{ entry.icon }}
            </div>
            <div class="quick-info">
              <div class="quick-title">{{ entry.title }}</div>
              <div class="quick-desc">{{ entry.desc }}</div>
            </div>
          </div>
        </Col>
      </Row>
    </Card>

    <!-- 容量和状态 -->
    <Row :gutter="16" class="section-row">
      <!-- 容量概览 -->
      <Col :xs="24" :md="12">
        <Card class="section-card" title="💾 容量概览" :bordered="false">
          <div class="capacity-section">
            <div class="capacity-ring">
              <Progress
                type="circle"
                :percent="storagePercent"
                :stroke-color="{ '0%': '#108ee9', '100%': '#87d068' }"
                :size="160"
              />
              <div class="capacity-labels">
                <div class="cap-item">
                  <div class="cap-label">已用容量</div>
                  <div class="cap-value">{{ summary.systemSpace.used }}</div>
                </div>
                <div class="cap-item">
                  <div class="cap-label">总容量</div>
                  <div class="cap-value">{{ summary.systemSpace.total }}</div>
                </div>
                <div class="cap-item">
                  <div class="cap-label">存储空间</div>
                  <div class="cap-value">{{ summary.storageSpace.used }} / {{ summary.storageSpace.total }}</div>
                </div>
              </div>
            </div>
            <div class="capacity-bars">
              <div class="bar-item">
                <div class="bar-header">
                  <span>存储空间1</span>
                  <span>50%</span>
                </div>
                <Progress :percent="50" :show-info="false" stroke-color="#1890ff" />
              </div>
              <div class="bar-item">
                <div class="bar-header">
                  <span>存储空间2</span>
                  <span>30%</span>
                </div>
                <Progress :percent="30" :show-info="false" stroke-color="#52c41a" />
              </div>
              <div class="bar-item">
                <div class="bar-header">
                  <span>存储空间3</span>
                  <span>75%</span>
                </div>
                <Progress :percent="75" :show-info="false" stroke-color="#fa8c16" />
              </div>
              <div class="bar-item">
                <div class="bar-header">
                  <span>备份存储</span>
                  <span>20%</span>
                </div>
                <Progress :percent="20" :show-info="false" stroke-color="#13c2c2" />
              </div>
              <div class="bar-item">
                <div class="bar-header">
                  <span>下载空间</span>
                  <span>85%</span>
                </div>
                <Progress :percent="85" :show-info="false" stroke-color="#ff4d4f" />
              </div>
              <div class="bar-item">
                <div class="bar-header">
                  <span>团队共享</span>
                  <span>40%</span>
                </div>
                <Progress :percent="40" :show-info="false" stroke-color="#722ed1" />
              </div>
            </div>
          </div>
        </Card>
      </Col>

      <!-- 系统状态 -->
      <Col :xs="24" :md="12">
        <Card class="section-card" title="📊 系统状态" :bordered="false">
          <Row :gutter="[16, 16]">
            <Col :span="12">
              <div class="stat-card">
                <div class="stat-icon" style="background: #e6f7ff; color: #1890ff;">🖴</div>
                <Statistic title="存储池" value="2" suffix="个" />
              </div>
            </Col>
            <Col :span="12">
              <div class="stat-card">
                <div class="stat-icon" style="background: #f6ffed; color: #52c41a;">💾</div>
                <Statistic title="硬盘" value="3" suffix="块" />
              </div>
            </Col>
            <Col :span="12">
              <div class="stat-card">
                <div class="stat-icon" style="background: #fff7e6; color: #fa8c16;">📁</div>
                <Statistic title="共享目录" value="5" suffix="个" />
              </div>
            </Col>
            <Col :span="12">
              <div class="stat-card">
                <div class="stat-icon" style="background: #fff0f6; color: #eb2f96;">👥</div>
                <Statistic title="在线用户" value="3" suffix="人" />
              </div>
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>

    <!-- 硬件信息和告警 -->
    <Row :gutter="16" class="section-row">
      <!-- 硬件信息 -->
      <Col :xs="24" :md="12">
        <Card class="section-card" title="🔧 硬件信息" :bordered="false">
          <div class="hardware-list">
            <div class="hw-item">
              <span class="hw-label">CPU</span>
              <span class="hw-value">{{ summary.hardware.cpuCores }} 核 / {{ summary.hardware.cpuThreads }} 线程</span>
            </div>
            <div class="hw-item">
              <span class="hw-label">内存</span>
              <span class="hw-value">{{ summary.hardware.memory }}</span>
            </div>
            <div class="hw-item">
              <span class="hw-label">运行时间</span>
              <span class="hw-value">{{ summary.uptime }}</span>
            </div>
            <div class="hw-item">
              <span class="hw-label">系统版本</span>
              <span class="hw-value">{{ summary.systemVersion }}</span>
            </div>
          </div>
        </Card>
      </Col>

      <!-- 系统告警 -->
      <Col :xs="24" :md="12">
        <Card class="section-card" title="🔔 系统通知" :bordered="false">
          <div class="alert-list">
            <div v-for="(alert, index) in systemAlerts" :key="index" class="alert-item">
              <Badge
                :status="alert.type as any"
                :text="alert.message"
                class="alert-badge"
              />
              <span class="alert-time">{{ alert.time }}</span>
            </div>
          </div>
        </Card>
      </Col>
    </Row>
  </div>
</template>

<style scoped>
.home-page {
  padding: 24px;
}

/* 欢迎栏 */
.welcome-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
  border-radius: 12px;
  color: #fff;
}

.welcome-title {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
}

.welcome-desc {
  margin: 6px 0 0;
  font-size: 13px;
  opacity: 0.85;
}

/* 卡片区域 */
.section-card {
  margin-bottom: 16px;
  border-radius: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  height: 100%;
}

.section-card :deep(.ant-card-body) {
  height: calc(100% - 56px);
}

.section-row + .section-row > .ant-col {
  display: flex;
}

.section-row + .section-row .section-card {
  flex: 1;
}

.section-row + .section-row .section-card :deep(.ant-card-body) {
  height: auto;
  display: flex;
  flex-direction: column;
}

.section-row {
  margin-bottom: 0;
}

.section-row + .section-row {
  margin-top: 16px;
}

.section-row > .ant-col {
  display: flex;
}

.section-row .section-card {
  flex: 1;
}

/* 快捷入口 */
.quick-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 10px;
  border: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s;
  background: #fff;
}

.quick-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
  border-color: #d9d9d9;
}

.quick-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.quick-title {
  font-weight: 500;
  font-size: 14px;
  color: #262626;
}

.quick-desc {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 2px;
}

/* 容量概览 */
.capacity-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.capacity-ring {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-shrink: 0;
}

.capacity-labels {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cap-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #fafafa;
  border-radius: 6px;
}

.cap-label {
  font-size: 13px;
  color: #8c8c8c;
}

.cap-value {
  font-size: 14px;
  font-weight: 600;
  color: #262626;
}

.capacity-bars {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 160px;
  overflow-y: auto;
  padding-right: 4px;
}

.bar-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.bar-header {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #595959;
}

/* 统计卡片 */
.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #fafafa;
  border-radius: 10px;
  height: 100%;
  box-sizing: border-box;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

/* 硬件信息 */
.hardware-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  justify-content: center;
  flex: 1;
}

.hw-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.hw-item:last-child {
  border-bottom: none;
}

.hw-label {
  font-size: 13px;
  color: #8c8c8c;
}

.hw-value {
  font-size: 14px;
  font-weight: 500;
  color: #262626;
}

/* 告警列表 */
.alert-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 260px;
  overflow-y: auto;
  padding-right: 4px;
}

.alert-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: #fafafa;
  border-radius: 6px;
}

.alert-time {
  font-size: 12px;
  color: #bfbfbf;
  flex-shrink: 0;
}
</style>

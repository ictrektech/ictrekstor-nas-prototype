<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  Card,
  Table,
  Button,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Checkbox,
  message,
  Space,
  Popconfirm,
  Tooltip,
  Empty,
  Progress,
} from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import {
  getStoragePoolsApi,
  getDisksApi,
  type StoragePool,
  type DiskInfo,
} from '#/api/storage';

const router = useRouter();
const items = ref<StoragePool[]>([]);
const disks = ref<DiskInfo[]>([]);
const loading = ref(false);
const createModalVisible = ref(false);
const createFormRef = ref();

const createForm = ref({
  name: '',
  raidEngine: 'Mdadm',
  raidLevel: 'RAID0',
  diskSelections: [] as string[],
  description: '',
});

const raidEngineOptions = [
  { label: 'Mdadm', value: 'Mdadm' },
  { label: 'ZFS', value: 'ZFS' },
];

const raidLevelOptions = [
  { label: 'RAID0', value: 'RAID0' },
  { label: 'RAID1', value: 'RAID1' },
  { label: 'RAID6', value: 'RAID6' },
];

// 容量解析
function extractCapacityValue(s: string): number {
  const m = s.match(/^(\d+(?:\.\d+)?)/);
  return m ? parseFloat(m[1]) : 0;
}

function calculateUsagePercent(total: string, used: string): number {
  const t = extractCapacityValue(total);
  const u = extractCapacityValue(used);
  return t > 0 ? Math.round((u / t) * 100) : 0;
}

function getUsageColor(percent: number): string {
  if (percent >= 90) return '#ff4d4f';
  if (percent >= 70) return '#faad14';
  return '#1677ff';
}

// 统计概览
const overviewStats = computed(() => {
  const total = items.value.length;
  const healthy = items.value.filter((i) => i.status === '正常').length;
  const abnormal = total - healthy;
  const totalCap = items.value.reduce((sum, i) => sum + extractCapacityValue(i.totalCapacity), 0);
  return { total, healthy, abnormal, totalCap };
});

const columns = [
  {
    title: '存储池',
    dataIndex: 'name',
    key: 'name',
    width: 180,
  },
  { title: 'RAID 类型', dataIndex: 'raidType', key: 'raidType', width: 120, align: 'center' as const },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 120,
    align: 'center' as const,
  },
  {
    title: '容量使用',
    key: 'capacity',
    width: 220,
  },
  { title: '硬盘数', dataIndex: 'diskCount', key: 'diskCount', width: 90, align: 'center' as const },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width: 170 },
  {
    title: '操作',
    key: 'action',
    width: 200,
    align: 'right' as const,
  },
];

const availableDisks = computed(() => {
  return disks.value.filter(
    (d) => !d.poolIds || d.poolIds.length === 0,
  );
});

async function loadData() {
  loading.value = true;
  try {
    const [poolsRes, disksRes] = await Promise.all([
      getStoragePoolsApi(),
      getDisksApi(),
    ]);
    items.value = poolsRes;
    disks.value = disksRes;
  } finally {
    loading.value = false;
  }
}

function goToPoolDetail(poolId: string, tab?: string) {
  const query = tab ? `?tab=${tab}` : '';
  router.push(`/storage/pools/detail/${poolId}${query}`);
}

function openCreateModal() {
  createForm.value = {
    name: '',
    raidEngine: 'Mdadm',
    raidLevel: 'RAID0',
    diskSelections: [],
    description: '',
  };
  createModalVisible.value = true;
}

function handleCreate() {
  createFormRef.value
    .validate()
    .then(() => {
      if (createForm.value.diskSelections.length === 0) {
        message.warning('请至少选择一块硬盘');
        return;
      }
      message.success(
        `存储池 "${createForm.value.name}" 创建成功`,
      );
      createModalVisible.value = false;
      loadData();
    })
    .catch(() => {});
}

function handleDelete(pool: any) {
  message.success(`存储池 "${pool.name}" 已删除`);
  items.value = items.value.filter((i) => i.id !== pool.id);
}

function handleEdit(pool: any) {
  message.info(`编辑存储池 "${pool.name}"`);
}

function handleReplaceDisk(pool: any) {
  message.info(`换盘操作：${pool.name}`);
}

function getStatusColor(status: string): string {
  return status === '正常' ? 'success' : 'error';
}

function getStatusDotColor(status: string): string {
  return status === '正常' ? '#52c41a' : '#ff4d4f';
}

onMounted(loadData);
</script>

<template>
  <div class="pool-manager">
    <!-- 统计概览卡片 -->
    <div class="overview-cards">
      <div class="overview-card card-total">
        <div class="overview-icon-box" style="background: #e6f7ff;">
          <IconifyIcon icon="lucide:database" style="font-size: 22px; color: #1677ff;" />
        </div>
        <div class="overview-info">
          <div class="overview-value">{{ overviewStats.total }}</div>
          <div class="overview-label">存储池总数</div>
        </div>
      </div>
      <div class="overview-card card-capacity">
        <div class="overview-icon-box" style="background: #f6ffed;">
          <IconifyIcon icon="lucide:hard-drive" style="font-size: 22px; color: #52c41a;" />
        </div>
        <div class="overview-info">
          <div class="overview-value">{{ overviewStats.totalCap.toFixed(2) }} TB</div>
          <div class="overview-label">总容量</div>
        </div>
      </div>
      <div class="overview-card card-healthy">
        <div class="overview-icon-box" style="background: #f6ffed;">
          <IconifyIcon icon="lucide:shield-check" style="font-size: 22px; color: #52c41a;" />
        </div>
        <div class="overview-info">
          <div class="overview-value" style="color: #52c41a;">{{ overviewStats.healthy }}</div>
          <div class="overview-label">健康池</div>
        </div>
      </div>
      <div class="overview-card card-abnormal">
        <div class="overview-icon-box" style="background: #fff1f0;">
          <IconifyIcon icon="lucide:alert-triangle" style="font-size: 22px; color: #ff4d4f;" />
        </div>
        <div class="overview-info">
          <div class="overview-value" style="color: #ff4d4f;">{{ overviewStats.abnormal }}</div>
          <div class="overview-label">异常池</div>
        </div>
      </div>
    </div>

    <!-- 存储池表格 -->
    <Card class="pool-table-card" :body-style="{ padding: '0' }">
      <template #title>
        <span class="table-title">
          <IconifyIcon icon="lucide:layers" style="font-size: 16px; color: #1677ff;" />
          存储池列表
        </span>
      </template>
      <template #extra>
        <Button type="primary" @click="openCreateModal">
          <IconifyIcon icon="lucide:plus" style="font-size: 14px;" />
          创建存储池
        </Button>
      </template>
      <Table
        :columns="columns"
        :data-source="items"
        :loading="loading"
        row-key="id"
        :pagination="false"
        class="pool-table"
      >
        <template #emptyText>
          <Empty description="暂无存储池">
            <template #image>
              <div class="empty-image">
                <IconifyIcon icon="lucide:database" style="font-size: 48px; color: #d9d9d9;" />
              </div>
            </template>
            <Button type="primary" size="small" @click="openCreateModal">
              <IconifyIcon icon="lucide:plus" style="font-size: 12px;" />
              立即创建
            </Button>
          </Empty>
        </template>
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <div class="pool-name-cell">
              <IconifyIcon icon="lucide:database" style="font-size: 16px; color: #1677ff;" />
              <a class="pool-name-link" @click="goToPoolDetail(record.id)">
                {{ record.name }}
              </a>
            </div>
          </template>
          <template v-if="column.key === 'status'">
            <span class="status-badge">
              <span
                class="status-dot"
                :style="{ background: getStatusDotColor(record.status) }"
              />
              <Tag :color="getStatusColor(record.status)" size="small">
                {{ record.status }}
              </Tag>
            </span>
          </template>
          <template v-if="column.key === 'capacity'">
            <div class="capacity-cell">
              <div class="capacity-text">
                <span class="capacity-used">{{ record.usedCapacity }}</span>
                <span class="capacity-divider">/</span>
                <span class="capacity-total">{{ record.totalCapacity }}</span>
              </div>
              <div class="capacity-progress">
                <Progress
                  :percent="calculateUsagePercent(record.totalCapacity, record.usedCapacity)"
                  :stroke-color="getUsageColor(calculateUsagePercent(record.totalCapacity, record.usedCapacity))"
                  :show-info="false"
                  size="small"
                  :stroke-width="6"
                />
                <span
                  class="capacity-percent"
                  :style="{ color: getUsageColor(calculateUsagePercent(record.totalCapacity, record.usedCapacity)) }"
                >
                  {{ calculateUsagePercent(record.totalCapacity, record.usedCapacity) }}%
                </span>
              </div>
            </div>
          </template>
          <template v-if="column.key === 'diskCount'">
            <a class="disk-count-link" @click="goToPoolDetail(record.id, 'disks')">
              <IconifyIcon icon="lucide:disc-3" style="font-size: 12px;" />
              {{ record.diskCount }}
            </a>
          </template>
          <template v-if="column.key === 'action'">
            <Space>
              <Tooltip title="编辑">
                <Button
                  size="small"
                  class="action-btn"
                  @click="handleEdit(record)"
                >
                  <IconifyIcon icon="lucide:pencil" class="action-icon" />
                  编辑
                </Button>
              </Tooltip>
              <Tooltip title="换盘">
                <Button
                  size="small"
                  class="action-btn"
                  @click="handleReplaceDisk(record)"
                >
                  <IconifyIcon icon="lucide:refresh-cw" class="action-icon" />
                  换盘
                </Button>
              </Tooltip>
              <Tooltip title="删除">
                <Popconfirm
                  title="确认删除"
                  description="删除存储池将导致数据丢失，是否继续？"
                  ok-text="确认"
                  cancel-text="取消"
                  @confirm="handleDelete(record)"
                >
                  <Button size="small" danger class="action-btn">
                    <IconifyIcon icon="lucide:trash-2" class="action-icon" />
                    删除
                  </Button>
                </Popconfirm>
              </Tooltip>
            </Space>
          </template>
        </template>
      </Table>
    </Card>

    <!-- 创建存储池弹窗 -->
    <Modal
      v-model:open="createModalVisible"
      title="创建存储池"
      width="640px"
      :ok-text="'创建'"
      :cancel-text="'取消'"
      @ok="handleCreate"
      class="create-pool-modal"
    >
      <Form
        ref="createFormRef"
        :model="createForm"
        layout="vertical"
        :rules="{
          name: [
            { required: true, message: '请输入存储池名称', trigger: 'blur' },
          ],
          raidEngine: [
            { required: true, message: '请选择RAID引擎', trigger: 'change' },
          ],
          raidLevel: [
            { required: true, message: '请选择RAID级别', trigger: 'change' },
          ],
        }"
      >
        <Form.Item label="存储池名称" name="name">
          <Input
            v-model:value="createForm.name"
            placeholder="请输入存储池名称"
          >
            <template #prefix>
              <IconifyIcon icon="lucide:database" style="font-size: 14px; color: #bfbfbf;" />
            </template>
          </Input>
        </Form.Item>

        <div class="form-row">
          <Form.Item label="RAID 引擎" name="raidEngine" class="form-col">
            <Select
              v-model:value="createForm.raidEngine"
              :options="raidEngineOptions"
              placeholder="请选择RAID引擎"
            >
              <template #suffixIcon>
                <IconifyIcon icon="lucide:settings" style="font-size: 12px; color: #bfbfbf;" />
              </template>
            </Select>
          </Form.Item>
          <Form.Item label="RAID 级别" name="raidLevel" class="form-col">
            <Select
              v-model:value="createForm.raidLevel"
              :options="raidLevelOptions"
              placeholder="请选择RAID级别"
            >
              <template #suffixIcon>
                <IconifyIcon icon="lucide:layers" style="font-size: 12px; color: #bfbfbf;" />
              </template>
            </Select>
          </Form.Item>
        </div>

        <Form.Item label="选择硬盘" required>
          <div class="disk-select-area">
            <div v-if="availableDisks.length === 0" class="disk-empty">
              <IconifyIcon icon="lucide:hard-drive" style="font-size: 24px; color: #d9d9d9;" />
              <div style="margin-top: 8px;">暂无可用的硬盘</div>
            </div>
            <Checkbox.Group
              v-else
              v-model:value="createForm.diskSelections"
            >
              <div class="disk-checkbox-grid">
                <div
                  v-for="disk in availableDisks"
                  :key="disk.deviceName"
                  class="disk-checkbox-card"
                >
                  <Checkbox :value="disk.deviceName">
                    <div class="disk-card-info">
                      <div class="disk-card-header-info">
                        <div
                          class="disk-card-icon"
                          :style="{ background: '#e6f7ff' }"
                        >
                          <IconifyIcon icon="lucide:hard-drive" style="font-size: 16px; color: #1677ff;" />
                        </div>
                        <div class="disk-card-meta">
                          <span class="disk-card-name">{{ disk.deviceName }}</span>
                          <span class="disk-card-model">{{ disk.model }}</span>
                        </div>
                      </div>
                      <Tag size="small" color="blue">{{ disk.size }}</Tag>
                    </div>
                  </Checkbox>
                </div>
              </div>
            </Checkbox.Group>
          </div>
        </Form.Item>

        <Form.Item label="描述" name="description">
          <Input.TextArea
            v-model:value="createForm.description"
            :rows="3"
            placeholder="请输入描述（可选）"
          />
        </Form.Item>
      </Form>
    </Modal>
  </div>
</template>

<style scoped>
.pool-manager {
  padding: 0 24px 24px;
  width: 100%;
}

/* 统计概览卡片 */
.overview-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.overview-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  border: 1px solid #f0f0f0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.overview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #1677ff;
}

.overview-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.overview-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.overview-value {
  font-size: 20px;
  font-weight: 700;
  color: #262626;
  line-height: 1.2;
}

.overview-label {
  font-size: 12px;
  color: #8c8c8c;
}

/* 表格卡片 */
.pool-table-card {
  border-radius: 12px;
  overflow: hidden;
}

.table-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
}

/* 表格行悬浮效果 */
.pool-table :deep(.ant-table-row) {
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.pool-table :deep(.ant-table-row:hover) {
  background: #f0f7ff !important;
  border-left-color: #1677ff;
}

/* 存储池名称 */
.pool-name-cell {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.pool-name-link {
  color: #1677ff;
  cursor: pointer;
  transition: color 0.2s;
  font-weight: 500;
}

.pool-name-link:hover {
  color: #4096ff;
  text-decoration: underline;
}

/* 状态徽章 */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
}

/* 容量单元格 */
.capacity-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.capacity-text {
  font-size: 13px;
  color: #595959;
}

.capacity-used {
  font-weight: 600;
  color: #262626;
}

.capacity-divider {
  color: #bfbfbf;
  margin: 0 2px;
}

.capacity-total {
  color: #8c8c8c;
}

.capacity-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.capacity-progress :deep(.ant-progress) {
  flex: 1;
  margin-bottom: 0;
  min-width: 80px;
}

.capacity-percent {
  font-size: 12px;
  font-weight: 600;
  min-width: 36px;
  text-align: right;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

/* 硬盘数链接 */
.disk-count-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #1677ff;
  cursor: pointer;
  font-weight: 500;
}

.disk-count-link:hover {
  text-decoration: underline;
}

/* 操作按钮 */
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  border-radius: 6px;
}

.action-icon {
  font-size: 12px;
}

/* 空状态 */
.empty-image {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 12px;
}

/* 创建弹窗 */
.create-pool-modal :deep(.ant-modal-title) {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-col {
  flex: 1;
}

.form-col :deep(.ant-form-item) {
  margin-bottom: 16px;
}

.disk-select-area {
  border: 1px solid #d9d9d9;
  border-radius: 10px;
  padding: 16px;
  background: #fafafa;
  min-height: 120px;
}

.disk-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 0;
  color: #bfbfbf;
}

.disk-checkbox-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px;
}

.disk-checkbox-card {
  padding: 12px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  transition: all 0.2s ease;
}

.disk-checkbox-card:hover {
  border-color: #1677ff;
  box-shadow: 0 2px 8px rgba(22, 119, 255, 0.08);
}

.disk-card-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.disk-card-header-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.disk-card-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.disk-card-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.disk-card-name {
  font-weight: 600;
  color: #262626;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 13px;
}

.disk-card-model {
  color: #8c8c8c;
  font-size: 12px;
}

/* 响应式 */
@media (max-width: 1200px) {
  .overview-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .pool-manager {
    padding: 0 12px 12px;
  }

  .overview-cards {
    grid-template-columns: 1fr;
  }

  .form-row {
    flex-direction: column;
    gap: 0;
  }
}
</style>

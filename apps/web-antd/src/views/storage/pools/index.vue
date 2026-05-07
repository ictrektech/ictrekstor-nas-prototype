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
} from 'ant-design-vue';
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

const columns = [
  {
    title: '存储池名称',
    dataIndex: 'name',
    key: 'name',
  },
  { title: 'RAID 类型', dataIndex: 'raidType', key: 'raidType' },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
  },
  { title: '总容量', dataIndex: 'totalCapacity', key: 'totalCapacity' },
  { title: '已用容量', dataIndex: 'usedCapacity', key: 'usedCapacity' },
  {
    title: '包含硬盘数',
    dataIndex: 'diskCount',
    key: 'diskCount',
  },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime' },
  {
    title: '操作',
    key: 'action',
    width: 220,
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
      // 刷新列表
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

onMounted(loadData);
</script>

<template>
  <div class="p-5">
    <Card title="存储池管理">
      <template #extra>
        <Button type="primary" @click="openCreateModal">
          创建存储池
        </Button>
      </template>
      <Table
        :columns="columns"
        :data-source="items"
        :loading="loading"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <a
              class="pool-name-link"
              @click="goToPoolDetail(record.id)"
            >
              {{ record.name }}
            </a>
          </template>
          <template v-if="column.key === 'status'">
            <Tag
              :color="record.status === '正常' ? 'success' : 'error'"
            >
              {{ record.status }}
            </Tag>
          </template>
          <template v-if="column.key === 'diskCount'">
            <a
              class="pool-disk-link"
              @click="goToPoolDetail(record.id, 'disks')"
            >
              {{ record.diskCount }}
            </a>
          </template>
          <template v-if="column.key === 'action'">
            <Space>
              <Button
                size="small"
                type="link"
                @click="handleEdit(record)"
              >
                编辑
              </Button>
              <Button
                size="small"
                type="link"
                @click="handleReplaceDisk(record)"
              >
                换盘
              </Button>
              <Popconfirm
                title="确认删除"
                description="删除存储池将导致数据丢失，是否继续？"
                ok-text="确认"
                cancel-text="取消"
                @confirm="handleDelete(record)"
              >
                <Button size="small" type="link" danger>
                  删除
                </Button>
              </Popconfirm>
            </Space>
          </template>
        </template>
      </Table>
    </Card>

    <!-- 创建存储池弹窗 -->
    <Modal
      v-model:open="createModalVisible"
      title="创建存储池"
      width="600px"
      :ok-text="'创建'"
      :cancel-text="'取消'"
      @ok="handleCreate"
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
          />
        </Form.Item>

        <Form.Item label="RAID 引擎" name="raidEngine">
          <Select
            v-model:value="createForm.raidEngine"
            :options="raidEngineOptions"
            placeholder="请选择RAID引擎"
          />
        </Form.Item>

        <Form.Item label="RAID 级别" name="raidLevel">
          <Select
            v-model:value="createForm.raidLevel"
            :options="raidLevelOptions"
            placeholder="请选择RAID级别"
          />
        </Form.Item>

        <Form.Item label="选择硬盘" required>
          <div class="disk-select-area">
            <div v-if="availableDisks.length === 0" class="disk-empty">
              暂无可用的硬盘
            </div>
            <Checkbox.Group
              v-else
              v-model:value="createForm.diskSelections"
            >
              <div class="disk-checkbox-list">
                <div
                  v-for="disk in availableDisks"
                  :key="disk.deviceName"
                  class="disk-checkbox-item"
                >
                  <Checkbox :value="disk.deviceName">
                    <div class="disk-checkbox-info">
                      <span class="disk-name">{{ disk.deviceName }}</span>
                      <span class="disk-model">{{ disk.model }}</span>
                      <Tag size="small">{{ disk.size }}</Tag>
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
.pool-name-link {
  color: #1890ff;
  cursor: pointer;
  transition: color 0.2s;
}

.pool-name-link:hover {
  color: #40a9ff;
  text-decoration: underline;
}

.pool-disk-link {
  color: #1890ff;
  cursor: pointer;
}

.pool-disk-link:hover {
  text-decoration: underline;
}

.disk-select-area {
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 12px 16px;
  background: #fafafa;
  min-height: 120px;
}

.disk-empty {
  color: #bfbfbf;
  text-align: center;
  padding: 32px 0;
}

.disk-checkbox-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.disk-checkbox-item {
  padding: 8px 12px;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
  transition: border-color 0.2s;
}

.disk-checkbox-item:hover {
  border-color: #1890ff;
}

.disk-checkbox-info {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin-left: 8px;
}

.disk-name {
  font-weight: 600;
  color: #262626;
  font-family: 'SF Mono', monospace;
}

.disk-model {
  color: #595959;
  font-size: 13px;
}
</style>

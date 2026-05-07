<script lang="ts" setup>
import { ref, computed } from 'vue';
import {
  Button,
  Input,
  Table,
  Modal,
  Form,
  Select,
  Tag,
  message,
  Popconfirm,
  Empty,
  Radio,
} from 'ant-design-vue';

interface SharedDir {
  id: string;
  name: string;
  sourcePath: string;
  shareUsers: string[];
  shareTime: string;
  expireTime: string;
  status: 'active' | 'expired';
}

const searchText = ref('');
const shareDirs = ref<SharedDir[]>([
  {
    id: 'sd-1',
    name: 'test',
    sourcePath: '存储空间1/我的文件/test',
    shareUsers: ['zhangsan', 'lisi'],
    shareTime: '2024-05-06 10:30:00',
    expireTime: '2024-06-06 10:30:00',
    status: 'active',
  },
  {
    id: 'sd-2',
    name: 'test4',
    sourcePath: '存储空间1/我的文件/test4',
    shareUsers: ['wangwu'],
    shareTime: '2024-05-05 14:20:00',
    expireTime: '永久',
    status: 'active',
  },
  {
    id: 'sd-3',
    name: '项目资料',
    sourcePath: '存储空间2/团队文件/项目资料',
    shareUsers: ['zhangsan', 'lisi', 'wangwu'],
    shareTime: '2024-04-20 09:15:00',
    expireTime: '2024-05-20 09:15:00',
    status: 'expired',
  },
]);

// 弹窗状态
const createModalVisible = ref(false);
const createFormRef = ref();
const createForm = ref({
  name: '',
  sourcePath: '',
  shareUsers: [] as string[],
  expireTime: '7',
});

const editUsersModalVisible = ref(false);
const editUsersFormRef = ref();
const editingDir = ref<SharedDir | null>(null);
const editUsersForm = ref({
  shareUsers: [] as string[],
});

const userOptions = [
  { label: 'zhangsan', value: 'zhangsan' },
  { label: 'lisi', value: 'lisi' },
  { label: 'wangwu', value: 'wangwu' },
  { label: 'admin', value: 'admin' },
];

const folderOptions = [
  { label: '存储空间1 / 我的文件 / test', value: '存储空间1/我的文件/test' },
  { label: '存储空间1 / 我的文件 / test4', value: '存储空间1/我的文件/test4' },
  { label: '存储空间1 / 文档', value: '存储空间1/文档' },
  { label: '存储空间1 / 图片', value: '存储空间1/图片' },
  { label: '存储空间2 / 备份', value: '存储空间2/备份' },
  { label: '存储空间2 / 下载', value: '存储空间2/下载' },
  { label: '团队文件 / 文档', value: '团队文件/文档' },
  { label: '团队文件 / 设计资源', value: '团队文件/设计资源' },
  { label: '团队文件 / 财务资料', value: '团队文件/财务资料' },
];

const filteredDirs = computed(() => {
  let result = shareDirs.value;
  if (searchText.value) {
    const kw = searchText.value.toLowerCase();
    result = result.filter(
      (d) =>
        d.name.toLowerCase().includes(kw) ||
        d.sourcePath.toLowerCase().includes(kw),
    );
  }
  return result;
});

const columns = [
  { title: '共享名', dataIndex: 'name', key: 'name', width: 200 },
  { title: '原文件夹', dataIndex: 'sourcePath', key: 'sourcePath' },
  { title: '共享用户', key: 'shareUsers', width: 200 },
  { title: '共享时间', dataIndex: 'shareTime', key: 'shareTime', width: 160 },
  { title: '有效期', dataIndex: 'expireTime', key: 'expireTime', width: 140 },
  { title: '状态', key: 'status', width: 80 },
  { title: '操作', key: 'action', width: 160 },
];

function openCreateModal() {
  createForm.value = {
    name: '',
    sourcePath: '',
    shareUsers: [],
    expireTime: '7',
  };
  createModalVisible.value = true;
}

function handleCreate() {
  createFormRef.value
    .validate()
    .then(() => {
      const newDir: SharedDir = {
        id: `sd-${Date.now()}`,
        name: createForm.value.name,
        sourcePath: createForm.value.sourcePath,
        shareUsers: createForm.value.shareUsers,
        shareTime: new Date().toLocaleString(),
        expireTime:
          createForm.value.expireTime === '0'
            ? '永久'
            : `${createForm.value.expireTime}天后`,
        status: 'active',
      };
      shareDirs.value.push(newDir);
      message.success('共享目录创建成功');
      createModalVisible.value = false;
    })
    .catch(() => {});
}

function openEditUsersModal(dir: any) {
  editingDir.value = dir;
  editUsersForm.value = {
    shareUsers: [...dir.shareUsers],
  };
  editUsersModalVisible.value = true;
}

function handleSaveUsers() {
  if (editingDir.value) {
    editingDir.value.shareUsers = [...editUsersForm.value.shareUsers];
    message.success('共享用户已更新');
  }
  editUsersModalVisible.value = false;
}

function handleDelete(dir: any) {
  shareDirs.value = shareDirs.value.filter((d) => d.id !== dir.id);
  message.success(`"${dir.name}" 已删除`);
}
</script>

<template>
  <div class="shared-files-page">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <div class="breadcrumb-bar">
          <span class="breadcrumb-icon">🔗</span>
          <span class="breadcrumb-text">我的共享</span>
        </div>
      </div>
      <div class="toolbar-right">
        <Button type="primary" @click="openCreateModal">
          + 创建共享
        </Button>
        <Input
          v-model:value="searchText"
          placeholder="搜索共享名"
          class="search-input"
          allow-clear
        />
      </div>
    </div>

    <!-- 共享目录列表 -->
    <div class="table-wrapper">
      <Table
        :columns="columns"
        :data-source="filteredDirs"
        row-key="id"
        size="small"
        :pagination="false"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <div class="dir-name-cell">
              <span class="dir-icon">📁</span>
              <span class="dir-name">{{ record.name }}</span>
            </div>
          </template>
          <template v-if="column.key === 'shareUsers'">
            <div class="user-tags">
              <Tag
                v-for="user in record.shareUsers"
                :key="user"
                color="blue"
                size="small"
              >
                {{ user }}
              </Tag>
              <span
                v-if="record.shareUsers.length === 0"
                class="no-users"
              >
                无
              </span>
            </div>
          </template>
          <template v-if="column.key === 'status'">
            <Tag :color="record.status === 'active' ? 'success' : 'default'" size="small">
              {{ record.status === 'active' ? '有效' : '已过期' }}
            </Tag>
          </template>
          <template v-if="column.key === 'action'">
            <div class="action-btns">
              <Button
                size="small"
                type="link"
                @click="openEditUsersModal(record)"
              >
                共享用户
              </Button>
              <Popconfirm
                title="确认删除"
                description="删除后该共享将失效，是否继续？"
                ok-text="确认"
                cancel-text="取消"
                @confirm="handleDelete(record)"
              >
                <Button size="small" type="link" danger>
                  删除
                </Button>
              </Popconfirm>
            </div>
          </template>
        </template>
      </Table>
      <Empty v-if="filteredDirs.length === 0" description="暂无共享目录" />
    </div>

    <!-- 创建共享弹窗 -->
    <Modal
      v-model:open="createModalVisible"
      title="创建共享"
      width="480px"
      ok-text="创建"
      cancel-text="取消"
      @ok="handleCreate"
    >
      <Form
        ref="createFormRef"
        :model="createForm"
        layout="vertical"
        :rules="{
          name: [{ required: true, message: '请输入共享名称', trigger: 'blur' }],
          sourcePath: [
            { required: true, message: '请选择原文件夹', trigger: 'change' },
          ],
        }"
      >
        <Form.Item label="共享名称" name="name">
          <Input
            v-model:value="createForm.name"
            placeholder="请输入共享名称"
          />
        </Form.Item>
        <Form.Item label="原文件夹" name="sourcePath">
          <Select
            v-model:value="createForm.sourcePath"
            placeholder="请选择要共享的文件夹"
            :options="folderOptions"
          />
        </Form.Item>
        <Form.Item label="共享用户">
          <Select
            v-model:value="createForm.shareUsers"
            mode="multiple"
            placeholder="请选择共享用户"
            :options="userOptions"
          />
        </Form.Item>
        <Form.Item label="有效期">
          <Radio.Group v-model:value="createForm.expireTime">
            <Radio value="1">1天</Radio>
            <Radio value="7">7天</Radio>
            <Radio value="30">30天</Radio>
            <Radio value="0">永久</Radio>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>

    <!-- 编辑共享用户弹窗 -->
    <Modal
      v-model:open="editUsersModalVisible"
      :title="`共享用户 - ${editingDir?.name}`"
      width="480px"
      ok-text="保存"
      cancel-text="取消"
      @ok="handleSaveUsers"
    >
      <Form ref="editUsersFormRef" :model="editUsersForm" layout="vertical">
        <Form.Item label="共享用户">
          <Select
            v-model:value="editUsersForm.shareUsers"
            mode="multiple"
            placeholder="请选择共享用户"
            :options="userOptions"
          />
        </Form.Item>
      </Form>
    </Modal>
  </div>
</template>

<style scoped>
.shared-files-page {
  padding: 24px;
}

/* 工具栏 */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 12px;
}

.toolbar-left {
  display: flex;
  align-items: center;
}

.breadcrumb-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 4px 12px;
}

.breadcrumb-icon {
  font-size: 14px;
}

.breadcrumb-text {
  font-size: 14px;
  color: #262626;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-input {
  width: 220px;
}

/* 表格 */
.table-wrapper {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  padding: 16px;
}

.dir-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dir-icon {
  font-size: 18px;
}

.dir-name {
  font-weight: 500;
}

.user-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.no-users {
  color: #bfbfbf;
  font-size: 13px;
}

.action-btns {
  display: flex;
  gap: 4px;
}
</style>

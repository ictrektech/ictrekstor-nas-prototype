<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import {
  Card,
  Button,
  Input,
  Modal,
  Form,
  Select,
  Checkbox,
  Radio,
  message,
  Dropdown,
  Empty,
  Table,
  Tag,
  Popconfirm,
  Tooltip,
} from 'ant-design-vue';
import { useRouter } from 'vue-router';
import { IconifyIcon } from '@vben/icons';
import {
  getTeamFileFoldersApi,
  getTeamFileUsersApi,
  getStoragePoolsApi,
  type TeamFileFolder,
  type TeamFileUser,
  type StoragePool,
} from '#/api/storage';

const router = useRouter();

const folders = ref<TeamFileFolder[]>([]);
const pools = ref<StoragePool[]>([]);
const loading = ref(false);
const searchText = ref('');

// 排序
const sortField = ref<'name' | 'updateTime' | 'location' | 'createTime'>('name');
const sortOrder = ref<'asc' | 'desc'>('asc');

// 文件夹弹窗
const folderModalVisible = ref(false);
const folderModalTitle = ref('新建团队文件夹');
const isEdit = ref(false);
const editingFolderId = ref('');
const folderFormRef = ref();

const folderForm = ref({
  name: '',
  storageLocation: '',
  enableCapacityLimit: false,
  capacityLimit: undefined as number | undefined,
  capacityUnit: 'GB',
  allowShareProtocol: true,
  recyclePermission: 'admin' as 'admin' | 'all',
});

// 用户管理弹窗
const userModalVisible = ref(false);
const userModalFolder = ref<TeamFileFolder | null>(null);
const users = ref<TeamFileUser[]>([]);
const userLoading = ref(false);

const userFormVisible = ref(false);
const userFormRef = ref();
const userForm = ref({
  username: '',
  role: 'member' as 'admin' | 'member',
  permission: 'read' as 'read' | 'write' | 'full',
});
const editingUserId = ref('');

const capacityUnitOptions = [
  { label: 'GB', value: 'GB' },
  { label: 'TB', value: 'TB' },
];

const filteredFolders = computed(() => {
  let result = folders.value;
  if (searchText.value) {
    const kw = searchText.value.toLowerCase();
    result = result.filter(
      (f) =>
        f.name.toLowerCase().includes(kw) ||
        f.storageLocationName.toLowerCase().includes(kw),
    );
  }
  result = [...result].sort((a, b) => {
    let cmp = 0;
    switch (sortField.value) {
      case 'name':
        cmp = a.name.localeCompare(b.name);
        break;
      case 'updateTime':
        cmp = a.updateTime.localeCompare(b.updateTime);
        break;
      case 'location':
        cmp = a.storageLocationName.localeCompare(b.storageLocationName);
        break;
      case 'createTime':
        cmp = a.createTime.localeCompare(b.createTime);
        break;
    }
    return sortOrder.value === 'asc' ? cmp : -cmp;
  });
  return result;
});

async function loadData() {
  loading.value = true;
  try {
    const [foldersRes, poolsRes] = await Promise.all([
      getTeamFileFoldersApi(),
      getStoragePoolsApi(),
    ]);
    folders.value = foldersRes;
    pools.value = poolsRes;
  } finally {
    loading.value = false;
  }
}

function openCreateModal() {
  isEdit.value = false;
  editingFolderId.value = '';
  folderModalTitle.value = '新建团队文件夹';
  folderForm.value = {
    name: '',
    storageLocation: pools.value[0]?.id || '',
    enableCapacityLimit: false,
    capacityLimit: undefined,
    capacityUnit: 'GB',
    allowShareProtocol: true,
    recyclePermission: 'admin',
  };
  folderModalVisible.value = true;
}

function openEditModal(folder: TeamFileFolder) {
  isEdit.value = true;
  editingFolderId.value = folder.id;
  folderModalTitle.value = '编辑团队文件夹';
  folderForm.value = {
    name: folder.name,
    storageLocation: folder.storageLocation,
    enableCapacityLimit: folder.capacityLimit !== null,
    capacityLimit: folder.capacityLimit || undefined,
    capacityUnit: folder.capacityUnit,
    allowShareProtocol: folder.allowShareProtocol,
    recyclePermission: folder.recyclePermission,
  };
  folderModalVisible.value = true;
}

function handleSaveFolder() {
  folderFormRef.value
    .validate()
    .then(() => {
      if (isEdit.value) {
        message.success(`团队文件夹 "${folderForm.value.name}" 已更新`);
      } else {
        message.success(`团队文件夹 "${folderForm.value.name}" 创建成功`);
      }
      folderModalVisible.value = false;
      loadData();
    })
    .catch(() => {});
}

function goToFolderDetail(folder: TeamFileFolder) {
  router.push(`/storage/team-files/detail/${folder.id}`);
}

function handleDeleteFolder(folder: TeamFileFolder) {
  message.success(`团队文件夹 "${folder.name}" 已删除`);
  folders.value = folders.value.filter((f) => f.id !== folder.id);
}

async function openUserModal(folder: TeamFileFolder) {
  userModalFolder.value = folder;
  userModalVisible.value = true;
  userLoading.value = true;
  try {
    users.value = await getTeamFileUsersApi(folder.id);
  } finally {
    userLoading.value = false;
  }
}

function openAddUser() {
  editingUserId.value = '';
  userForm.value = {
    username: '',
    role: 'member',
    permission: 'read',
  };
  userFormVisible.value = true;
}

function openEditUser(user: any) {
  editingUserId.value = user.id;
  userForm.value = {
    username: user.username,
    role: user.role,
    permission: user.permission,
  };
  userFormVisible.value = true;
}

function handleSaveUser() {
  userFormRef.value
    .validate()
    .then(() => {
      if (editingUserId.value) {
        message.success(`用户 "${userForm.value.username}" 已更新`);
      } else {
        message.success(`用户 "${userForm.value.username}" 已添加`);
        users.value.push({
          id: `u-${Date.now()}`,
          username: userForm.value.username,
          role: userForm.value.role,
          permission: userForm.value.permission,
          addTime: new Date().toLocaleString(),
        });
      }
      userFormVisible.value = false;
    })
    .catch(() => {});
}

function handleDeleteUser(user: any) {
  message.success(`用户 "${user.username}" 已移除`);
  users.value = users.value.filter((u) => u.id !== user.id);
}

function getPermissionText(permission: string): string {
  switch (permission) {
    case 'read':
      return '只读';
    case 'write':
      return '读写';
    case 'full':
      return '完全控制';
    default:
      return permission;
  }
}

function getPermissionColor(permission: string): string {
  switch (permission) {
    case 'read':
      return 'default';
    case 'write':
      return 'blue';
    case 'full':
      return 'success';
    default:
      return 'default';
  }
}

function getPermissionIcon(permission: string): string {
  switch (permission) {
    case 'read':
      return 'lucide:eye';
    case 'write':
      return 'lucide:edit-3';
    case 'full':
      return 'lucide:key';
    default:
      return 'lucide:eye';
  }
}

onMounted(loadData);
</script>

<template>
  <div class="team-files-page">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <div class="breadcrumb-bar">
          <div class="breadcrumb-icon-box">
            <IconifyIcon icon="lucide:users" style="font-size: 16px; color: #1677ff;" />
          </div>
          <span class="breadcrumb-text">团队文件管理</span>
        </div>
      </div>
      <div class="toolbar-right">
        <Input
          v-model:value="searchText"
          placeholder="搜索文件夹名"
          class="search-input"
          allow-clear
        >
          <template #prefix>
            <IconifyIcon icon="lucide:search" style="font-size: 14px; color: #bfbfbf;" />
          </template>
        </Input>
        <Tooltip title="刷新">
          <Button class="refresh-btn" @click="loadData">
            <IconifyIcon icon="lucide:refresh-cw" style="font-size: 14px;" />
          </Button>
        </Tooltip>
        <Dropdown :trigger="['click']" placement="bottomRight">
          <Button class="sort-btn">
            <IconifyIcon icon="lucide:arrow-up-down" style="font-size: 14px;" />
          </Button>
          <template #overlay>
            <div class="sort-menu">
              <div
                v-for="item in [
                  { key: 'name', label: '名称' },
                  { key: 'updateTime', label: '修改时间' },
                  { key: 'location', label: '所在位置' },
                  { key: 'createTime', label: '创建时间' },
                ]"
                :key="item.key"
                class="sort-menu-item"
                :class="{ active: sortField === item.key }"
                @click="sortField = item.key as any"
              >
                <IconifyIcon
                  :icon="sortField === item.key ? 'lucide:check' : 'lucide:check'"
                  :style="{ opacity: sortField === item.key ? 1 : 0 }"
                  style="font-size: 12px;"
                />
                {{ item.label }}
              </div>
              <div class="sort-menu-divider" />
              <div
                class="sort-menu-item"
                :class="{ active: sortOrder === 'asc' }"
                @click="sortOrder = 'asc'"
              >
                <IconifyIcon
                  :icon="sortOrder === 'asc' ? 'lucide:check' : 'lucide:check'"
                  :style="{ opacity: sortOrder === 'asc' ? 1 : 0 }"
                  style="font-size: 12px;"
                />
                升序
              </div>
              <div
                class="sort-menu-item"
                :class="{ active: sortOrder === 'desc' }"
                @click="sortOrder = 'desc'"
              >
                <IconifyIcon
                  :icon="sortOrder === 'desc' ? 'lucide:check' : 'lucide:check'"
                  :style="{ opacity: sortOrder === 'desc' ? 1 : 0 }"
                  style="font-size: 12px;"
                />
                降序
              </div>
            </div>
          </template>
        </Dropdown>
      </div>
    </div>

    <!-- 新建按钮 -->
    <div class="action-bar">
      <Button type="primary" @click="openCreateModal">
        <IconifyIcon icon="lucide:plus" style="font-size: 14px;" />
        新建团队文件夹
      </Button>
    </div>

    <!-- 文件夹列表 -->
    <div v-if="filteredFolders.length > 0" class="folder-grid">
      <Card
        v-for="folder in filteredFolders"
        :key="folder.id"
        class="folder-card"
        :bordered="true"
        :body-style="{ padding: '0' }"
      >
        <div class="folder-card-body" @click="goToFolderDetail(folder)">
          <div class="folder-main">
            <div class="folder-icon-wrapper">
              <IconifyIcon icon="lucide:folder-heart" style="font-size: 24px; color: #fff;" />
            </div>
            <div class="folder-info">
              <div class="folder-name">{{ folder.name }}</div>
              <div class="folder-meta">
                <span class="folder-location">
                  <IconifyIcon icon="lucide:database" style="font-size: 10px;" />
                  {{ folder.storageLocationName }}
                </span>
                <span v-if="folder.capacityLimit" class="folder-limit">
                  <IconifyIcon icon="lucide:ruler" style="font-size: 10px;" />
                  {{ folder.capacityLimit }} {{ folder.capacityUnit }}
                </span>
              </div>
            </div>
          </div>
          <Dropdown :trigger="['click']" placement="bottomRight">
            <Button
              size="small"
              type="text"
              class="folder-more-btn"
              @click.stop
            >
              <IconifyIcon icon="lucide:more-vertical" style="font-size: 14px;" />
            </Button>
            <template #overlay>
              <div class="folder-dropdown-menu">
                <div class="dropdown-item" @click="openEditModal(folder)">
                  <IconifyIcon icon="lucide:pencil" style="font-size: 12px;" />
                  编辑
                </div>
                <div class="dropdown-item" @click="openUserModal(folder)">
                  <IconifyIcon icon="lucide:users" style="font-size: 12px;" />
                  用户管理
                </div>
                <div class="dropdown-divider" />
                <Popconfirm
                  title="确认删除"
                  description="删除后文件夹内数据将无法恢复，是否继续？"
                  ok-text="确认"
                  cancel-text="取消"
                  @confirm="handleDeleteFolder(folder)"
                >
                  <div class="dropdown-item danger">
                    <IconifyIcon icon="lucide:trash-2" style="font-size: 12px;" />
                    删除
                  </div>
                </Popconfirm>
              </div>
            </template>
          </Dropdown>
        </div>
      </Card>
    </div>

    <!-- 空状态 -->
    <Empty v-else description="暂无团队文件夹" class="folder-empty">
      <template #image>
        <div class="empty-image">
          <IconifyIcon icon="lucide:folder-heart" style="font-size: 56px; color: #d9d9d9;" />
        </div>
      </template>
      <Button type="primary" size="small" @click="openCreateModal">
        <IconifyIcon icon="lucide:plus" style="font-size: 12px;" />
        立即创建
      </Button>
    </Empty>

    <!-- 新建/编辑文件夹弹窗 -->
    <Modal
      v-model:open="folderModalVisible"
      :title="folderModalTitle"
      width="560px"
      :ok-text="isEdit ? '保存' : '下一步'"
      :cancel-text="'取消'"
      @ok="handleSaveFolder"
      class="folder-modal"
    >
      <Form
        ref="folderFormRef"
        :model="folderForm"
        layout="vertical"
        :rules="{
          name: [
            { required: true, message: '请输入名称', trigger: 'blur' },
          ],
          storageLocation: [
            { required: true, message: '请选择存储位置', trigger: 'change' },
          ],
        }"
      >
        <Form.Item label="名称" name="name">
          <Input
            v-model:value="folderForm.name"
            placeholder="请输入名称"
          >
            <template #prefix>
              <IconifyIcon icon="lucide:folder-heart" style="font-size: 14px; color: #bfbfbf;" />
            </template>
          </Input>
        </Form.Item>

        <Form.Item label="存储位置" name="storageLocation">
          <Select
            v-model:value="folderForm.storageLocation"
            placeholder="请选择存储位置"
          >
            <Select.Option
              v-for="pool in pools"
              :key="pool.id"
              :value="pool.id"
            >
              <div class="pool-option">
                <span style="display: inline-flex; align-items: center; gap: 6px;">
                  <IconifyIcon icon="lucide:database" style="font-size: 12px; color: #1677ff;" />
                  {{ pool.name }}
                </span>
                <span class="pool-free">{{ pool.totalCapacity }} 可用</span>
              </div>
            </Select.Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Checkbox v-model:checked="folderForm.enableCapacityLimit">
            <span class="checkbox-label">
              <IconifyIcon icon="lucide:ruler" style="font-size: 12px;" />
              限制容量上限
            </span>
          </Checkbox>
          <div
            v-if="folderForm.enableCapacityLimit"
            class="capacity-input-row"
          >
            <Input
              v-model:value="folderForm.capacityLimit"
              type="number"
              placeholder="不限制"
              class="capacity-input"
            >
              <template #prefix>
                <IconifyIcon icon="lucide:hard-drive" style="font-size: 12px; color: #bfbfbf;" />
              </template>
            </Input>
            <Select
              v-model:value="folderForm.capacityUnit"
              :options="capacityUnitOptions"
              class="capacity-unit-select"
            />
          </div>
        </Form.Item>

        <Form.Item>
          <Checkbox v-model:checked="folderForm.allowShareProtocol">
            <span class="checkbox-label">
              <IconifyIcon icon="lucide:share-2" style="font-size: 12px;" />
              允许通过文件共享协议挂载到其他设备上
            </span>
          </Checkbox>
        </Form.Item>

        <Form.Item label="回收站权限">
          <Radio.Group v-model:value="folderForm.recyclePermission">
            <Radio value="admin">
              <span class="radio-label">
                <IconifyIcon icon="lucide:shield" style="font-size: 12px;" />
                仅管理员
              </span>
            </Radio>
            <Radio value="all">
              <span class="radio-label">
                <IconifyIcon icon="lucide:users" style="font-size: 12px;" />
                团队文件夹所有成员
              </span>
            </Radio>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>

    <!-- 用户管理弹窗 -->
    <Modal
      v-model:open="userModalVisible"
      :title="`用户管理 - ${userModalFolder?.name}`"
      width="720px"
      :footer="null"
      class="user-modal"
    >
      <div class="user-modal-body">
        <div class="user-action-bar">
          <Button type="primary" size="small" @click="openAddUser">
            <IconifyIcon icon="lucide:user-plus" style="font-size: 12px;" />
            添加用户
          </Button>
        </div>
        <Table
          :columns="[
            { title: '用户名', dataIndex: 'username', key: 'username' },
            { title: '角色', dataIndex: 'role', key: 'role', align: 'center' as const },
            { title: '权限', dataIndex: 'permission', key: 'permission', align: 'center' as const },
            { title: '添加时间', dataIndex: 'addTime', key: 'addTime', width: 170 },
            { title: '操作', key: 'action', width: 140, align: 'center' as const },
          ]"
          :data-source="users"
          :loading="userLoading"
          row-key="id"
          size="small"
          class="user-table"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'role'">
              <Tag :color="record.role === 'admin' ? 'red' : 'blue'" size="small">
                <IconifyIcon
                  :icon="record.role === 'admin' ? 'lucide:crown' : 'lucide:user'"
                  style="font-size: 10px; margin-right: 2px;"
                />
                {{ record.role === 'admin' ? '管理员' : '成员' }}
              </Tag>
            </template>
            <template v-if="column.key === 'permission'">
              <Tag :color="getPermissionColor(record.permission)" size="small">
                <IconifyIcon :icon="getPermissionIcon(record.permission)" style="font-size: 10px; margin-right: 2px;" />
                {{ getPermissionText(record.permission) }}
              </Tag>
            </template>
            <template v-if="column.key === 'action'">
              <Button
                size="small"
                class="action-btn"
                @click="openEditUser(record)"
              >
                <IconifyIcon icon="lucide:pencil" style="font-size: 11px;" />
                编辑
              </Button>
              <Popconfirm
                title="确认移除"
                description="确定要移除该用户吗？"
                ok-text="确认"
                cancel-text="取消"
                @confirm="handleDeleteUser(record)"
              >
                <Button size="small" danger class="action-btn">
                  <IconifyIcon icon="lucide:user-minus" style="font-size: 11px;" />
                  移除
                </Button>
              </Popconfirm>
            </template>
          </template>
        </Table>
      </div>
    </Modal>

    <!-- 添加/编辑用户弹窗 -->
    <Modal
      v-model:open="userFormVisible"
      :title="editingUserId ? '编辑用户' : '添加用户'"
      width="420px"
      @ok="handleSaveUser"
      class="user-form-modal"
    >
      <Form
        ref="userFormRef"
        :model="userForm"
        layout="vertical"
        :rules="{
          username: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
          ],
        }"
      >
        <Form.Item label="用户名" name="username">
          <Input
            v-model:value="userForm.username"
            placeholder="请输入用户名"
            :disabled="!!editingUserId"
          >
            <template #prefix>
              <IconifyIcon icon="lucide:user" style="font-size: 14px; color: #bfbfbf;" />
            </template>
          </Input>
        </Form.Item>
        <Form.Item label="角色">
          <Radio.Group v-model:value="userForm.role">
            <Radio value="admin">
              <span class="radio-label">
                <IconifyIcon icon="lucide:crown" style="font-size: 12px;" />
                管理员
              </span>
            </Radio>
            <Radio value="member">
              <span class="radio-label">
                <IconifyIcon icon="lucide:user" style="font-size: 12px;" />
                成员
              </span>
            </Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="权限">
          <Select v-model:value="userForm.permission">
            <Select.Option value="read">
              <span class="select-label">
                <IconifyIcon icon="lucide:eye" style="font-size: 12px;" />
                只读
              </span>
            </Select.Option>
            <Select.Option value="write">
              <span class="select-label">
                <IconifyIcon icon="lucide:edit-3" style="font-size: 12px;" />
                读写
              </span>
            </Select.Option>
            <Select.Option value="full">
              <span class="select-label">
                <IconifyIcon icon="lucide:key" style="font-size: 12px;" />
                完全控制
              </span>
            </Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  </div>
</template>

<style scoped>
.team-files-page {
  padding: 0 16px 16px;
  width: 100%;
}

/* 工具栏 */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  gap: 10px;
}

.toolbar-left {
  display: flex;
  align-items: center;
}

.breadcrumb-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 6px 14px;
}

.breadcrumb-icon-box {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: #e6f7ff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.breadcrumb-text {
  font-size: 14px;
  font-weight: 500;
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

.refresh-btn,
.sort-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
}

.sort-menu {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
  padding: 4px 0;
  min-width: 140px;
}

.sort-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #262626;
  transition: background 0.2s;
}

.sort-menu-item:hover {
  background: #f0f5ff;
}

.sort-menu-item.active {
  color: #1677ff;
  font-weight: 500;
}

.sort-menu-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 4px 0;
}

/* 操作栏 */
.action-bar {
  margin-bottom: 10px;
}

/* 文件夹网格 */
.folder-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 10px;
}

.folder-card {
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  overflow: hidden;
}

.folder-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: #1677ff;
}

.folder-card-body {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  position: relative;
}

.folder-main {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.folder-icon-wrapper {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #1677ff, #4096ff);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.folder-info {
  flex: 1;
  min-width: 0;
}

.folder-name {
  font-size: 14px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.folder-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.folder-location {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #8c8c8c;
}

.folder-limit {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #faad14;
}

.folder-more-btn {
  position: absolute;
  right: 8px;
  top: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.folder-card:hover .folder-more-btn {
  opacity: 1;
}

.folder-dropdown-menu {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
  padding: 4px 0;
  min-width: 140px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 13px;
  color: #262626;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background: #f0f5ff;
}

.dropdown-item.danger {
  color: #ff4d4f;
}

.dropdown-item.danger:hover {
  background: #fff1f0;
}

.dropdown-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 4px 0;
}

/* 空状态 */
.folder-empty {
  grid-column: 1 / -1;
  padding: 48px 0;
}

.empty-image {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
}

/* 弹窗样式 */
.folder-modal :deep(.ant-modal-title),
.user-modal :deep(.ant-modal-title),
.user-form-modal :deep(.ant-modal-title) {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pool-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pool-free {
  color: #8c8c8c;
  font-size: 12px;
}

.capacity-input-row {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.capacity-input {
  flex: 1;
}

.capacity-unit-select {
  width: 100px;
}

.checkbox-label,
.radio-label,
.select-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* 用户管理 */
.user-modal-body {
  padding: 8px 0;
}

.user-action-bar {
  margin-bottom: 16px;
}

.user-table :deep(.ant-table-tbody > tr) {
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.user-table :deep(.ant-table-tbody > tr:hover > td) {
  background: #f0f7ff;
}

.user-table :deep(.ant-table-tbody > tr:hover) {
  border-left-color: #1677ff;
}

/* 操作按钮 */
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  border-radius: 6px;
}

/* 响应式 */
@media (max-width: 576px) {
  .team-files-page {
    padding: 0 12px 12px;
  }

  .toolbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .search-input {
    width: 100%;
  }

  .folder-grid {
    grid-template-columns: 1fr;
  }
}
</style>

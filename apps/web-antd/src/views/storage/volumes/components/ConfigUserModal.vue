<script lang="ts" setup>
import { IconifyIcon } from '@vben/icons';
import { Button, Modal, Radio, Select, Table, Tabs } from 'ant-design-vue';
import { reactive, ref } from 'vue';

const TabPane = Tabs.TabPane;

interface Props {
  visible: boolean;
  volumeName: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:visible': [v: boolean];
  cancelAccess: [userId: number];
  confirmAccess: [userId: number];
  rejectAccess: [userId: number];
  addUser: [userId: number, permission: string];
}>();

const activeKey = ref('active');

const addUserForm = reactive({ userId: undefined as number | undefined, permission: 'read-write' });

const activeUserColumns = [
  { title: '用户名', dataIndex: 'username', key: 'username' },
  { title: '权限', dataIndex: 'permission', key: 'permission' },
  { title: '添加时间', dataIndex: 'addTime', key: 'addTime' },
  {
    title: '操作',
    key: 'action',
    width: 100,
    customRender: ({ record }: any) =>
      h(Button, { type: 'link', danger: true, size: 'small', onClick: () => emit('cancelAccess', record.id) }, { default: () => '取消访问' }),
  },
];

const pendingUserColumns = [
  { title: '用户名', dataIndex: 'username', key: 'username' },
  { title: '申请时间', dataIndex: 'applyTime', key: 'applyTime' },
  { title: '申请权限', dataIndex: 'permission', key: 'permission' },
  {
    title: '操作',
    key: 'action',
    width: 160,
    customRender: ({ record }: any) =>
      h('div', { style: 'display:flex;gap:8px;' }, [
        h(Button, { type: 'primary', size: 'small', onClick: () => emit('confirmAccess', record.id) }, { default: () => '确认' }),
        h(Button, { size: 'small', onClick: () => emit('rejectAccess', record.id) }, { default: () => '拒绝' }),
      ]),
  },
];

const activeUsers = ref([
  { id: 1, username: 'user1', permission: '读写', addTime: '2024-01-15 10:30' },
  { id: 2, username: 'user2', permission: '只读', addTime: '2024-01-15 11:00' },
]);
const pendingUsers = ref([
  { id: 3, username: 'user3', applyTime: '2024-01-16 09:00', permission: '读写' },
]);
const availableUsers = ref([
  { value: 4, label: 'user4' },
  { value: 5, label: 'user5' },
]);

function handleAddUser() {
  if (addUserForm.userId) {
    emit('addUser', addUserForm.userId, addUserForm.permission);
    addUserForm.userId = undefined;
    addUserForm.permission = 'read-write';
  }
}

function handleCancel() {
  emit('update:visible', false);
}
</script>

<template>
  <Modal
    :visible="props.visible"
    :title="`配置用户权限 - ${props.volumeName}`"
    width="700"
    :footer="null"
    @cancel="handleCancel"
  >
    <Tabs v-model:activeKey="activeKey" type="card">
      <TabPane key="active" tab="已授权用户">
        <Table
          :columns="activeUserColumns"
          :data-source="activeUsers"
          size="small"
          :pagination="false"
          row-key="id"
        />
      </TabPane>
      <TabPane key="pending" tab="待确认申请">
        <Table
          :columns="pendingUserColumns"
          :data-source="pendingUsers"
          size="small"
          :pagination="false"
          row-key="id"
        />
      </TabPane>
      <TabPane key="add" tab="添加用户">
        <div class="add-user-form">
          <div class="form-row">
            <span class="form-label">选择用户：</span>
            <Select
              v-model:value="addUserForm.userId"
              :options="availableUsers"
              placeholder="请选择用户"
              style="width: 200px;"
            />
          </div>
          <div class="form-row">
            <span class="form-label">权限设置：</span>
            <Radio.Group v-model:value="addUserForm.permission">
              <Radio value="read-write">
                <span class="perm-label">
                  <IconifyIcon icon="lucide:edit-3" style="font-size: var(--ict-body-small);" />
                  读写
                </span>
              </Radio>
              <Radio value="read-only">
                <span class="perm-label">
                  <IconifyIcon icon="lucide:eye" style="font-size: var(--ict-body-small);" />
                  只读
                </span>
              </Radio>
            </Radio.Group>
          </div>
          <Button type="primary" @click="handleAddUser">
            <IconifyIcon icon="lucide:plus" style="font-size: var(--ict-body-small);" />
            添加
          </Button>
        </div>
      </TabPane>
    </Tabs>
  </Modal>
</template>

<style scoped>
.add-user-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}
.form-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.form-label {
  font-size: var(--ict-mark-medium);
  color: var(--ict-text-secondary);
  min-width: 70px;
}
.perm-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
</style>
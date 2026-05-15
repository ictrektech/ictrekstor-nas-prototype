<script lang="ts" setup>
import { computed } from 'vue';
import { Modal, Form, Select, Radio, Button, Tooltip } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import type { SharedDir, ShareUser } from '../types';

const props = defineProps<{
  visible: boolean;
  dir: SharedDir | null;
  userOptions: { label: string; value: string }[];
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
  'save': [users: ShareUser[]];
}>();

const modelVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
});

const editUsersForm = defineModel<{
  shareUsers: ShareUser[];
}>('form', { default: () => ({ shareUsers: [] }) });

const selectedUserKeys = computed(() =>
  editUsersForm.value.shareUsers.map((u: ShareUser) => u.user)
);

function getUserColor(user: string) {
  const colors: Record<string, string> = {
    zhangsan: 'var(--ict-primary)',
    lisi: 'var(--ict-success)',
    wangwu: 'var(--ict-warning)',
    admin: 'var(--ict-info)',
  };
  return colors[user] || 'var(--ict-text-secondary)';
}

function getUserInitial(user: string) {
  return user.charAt(0).toUpperCase();
}

function addShareUser(userValue: string) {
  if (!editUsersForm.value.shareUsers.find((u: ShareUser) => u.user === userValue)) {
    editUsersForm.value.shareUsers.push({ user: userValue, permission: 'readonly' });
  }
}

function removeShareUser(userValue: string) {
  editUsersForm.value.shareUsers = editUsersForm.value.shareUsers.filter(
    (u: ShareUser) => u.user !== userValue
  );
}

function handleSelectChange(vals: string[]) {
  editUsersForm.value.shareUsers = editUsersForm.value.shareUsers.filter(
    (u: ShareUser) => vals.includes(u.user)
  );
  vals.forEach((v) => addShareUser(v));
}

function handleSave() {
  emit('save', [...editUsersForm.value.shareUsers]);
  modelVisible.value = false;
}
</script>

<template>
  <Modal
    v-model:open="modelVisible"
    :title="`共享用户 - ${dir?.name || ''}`"
    width="520px"
    ok-text="保存"
    cancel-text="取消"
    @ok="handleSave"
  >
    <Form :model="editUsersForm" layout="vertical">
      <Form.Item label="共享用户">
        <Select
          :value="selectedUserKeys"
          mode="multiple"
          placeholder="选择用户并为其设置权限"
          :options="userOptions"
          @change="handleSelectChange"
        />
        <div v-if="editUsersForm.shareUsers.length > 0" class="user-perm-list">
          <div
            v-for="su in editUsersForm.shareUsers"
            :key="su.user"
            class="user-perm-row"
          >
            <div class="user-perm-info">
              <div
                class="user-avatar-small"
                :style="{
                  backgroundColor: getUserColor(su.user) + '18',
                  color: getUserColor(su.user),
                  borderColor: getUserColor(su.user) + '40'
                }"
              >
                {{ getUserInitial(su.user) }}
              </div>
              <span class="user-perm-name">{{ su.user }}</span>
            </div>
            <Radio.Group
              :value="su.permission"
              size="small"
              @change="(e: any) => {
                const u = editUsersForm.shareUsers.find((x: ShareUser) => x.user === su.user);
                if (u) u.permission = e.target.value;
              }"
            >
              <Radio.Button value="readonly">
                <span class="radio-with-icon">
                  <IconifyIcon icon="lucide:eye" style="font-size: var(--ict-mark-small); margin-right: 2px;" />
                  只读
                </span>
              </Radio.Button>
              <Radio.Button value="readwrite">
                <span class="radio-with-icon">
                  <IconifyIcon icon="lucide:pencil" style="font-size: var(--ict-mark-small); margin-right: 2px;" />
                  读写
                </span>
              </Radio.Button>
            </Radio.Group>
            <Button
              type="text"
              size="small"
              danger
              class="user-remove-btn"
              @click="removeShareUser(su.user)"
            >
              <IconifyIcon icon="lucide:x" style="font-size: var(--ict-body-small);" />
            </Button>
          </div>
        </div>
      </Form.Item>
    </Form>
  </Modal>
</template>

<style scoped>
.user-perm-list {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.user-perm-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 10px;
  background: var(--ict-success-light);
  border: 1px solid var(--ict-success-disabled);
  border-radius: 8px;
}

.user-perm-info {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.user-avatar-small {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--ict-mark-small);
  font-weight: 600;
  border: 1.5px solid;
  flex-shrink: 0;
}

.user-perm-name {
  font-size: var(--ict-mark-medium);
  color: var(--ict-text-emphasis);
  font-weight: 500;
}

.user-remove-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  width: 22px;
  height: 22px;
  border-radius: 4px;
}

.radio-with-icon {
  display: inline-flex;
  align-items: center;
  font-size: var(--ict-body-small);
}
</style>
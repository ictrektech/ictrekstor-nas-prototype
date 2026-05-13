<script lang="ts" setup>
import { ref, watch, computed } from 'vue';
import { Modal, Button, Select, Tag, Empty } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import type { PublicFolder, PermissionUser, PermissionMode } from '../types';
import { userOptions } from './mockData';

interface Props {
  visible: boolean;
  folder: PublicFolder | null;
  permissions: PermissionUser[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:visible': [value: boolean];
  'save': [permissions: PermissionUser[]];
}>();

const localPerms = ref<PermissionUser[]>([]);
const newUser = ref<string>('');
const newPerm = ref<PermissionMode>('readwrite');

watch(() => props.visible, (visible) => {
  if (visible) {
    localPerms.value = [...props.permissions];
    newUser.value = '';
    newPerm.value = 'readwrite';
  }
});

const availableUsers = computed(() => {
  const used = new Set(localPerms.value.map((p) => p.user));
  return userOptions.filter((u) => !used.has(u.value));
});

function addUser() {
  if (!newUser.value) return;
  localPerms.value.push({ user: newUser.value, permission: newPerm.value });
  newUser.value = '';
  newPerm.value = 'readwrite';
}

function removeUser(index: number) {
  localPerms.value.splice(index, 1);
}

function changePermission(index: number, perm: PermissionMode) {
  localPerms.value[index].permission = perm;
}

function handleSave() {
  emit('save', [...localPerms.value]);
  emit('update:visible', false);
}

function handleCancel() {
  emit('update:visible', false);
}

function getUserLabel(userValue: string): string {
  return userOptions.find((u) => u.value === userValue)?.label || userValue;
}

function getUserInitial(user: string): string {
  const label = getUserLabel(user);
  return label.charAt(0).toUpperCase();
}

function getUserColor(user: string): string {
  const colors: Record<string, string> = {
    zhangsan: '#1677ff',
    lisi: '#52c41a',
    wangwu: '#fa8c16',
    zhaoliu: '#13c2c2',
    admin: '#722ed1',
  };
  return colors[user] || '#595959';
}

function permTagColor(perm: PermissionMode): string {
  const map: Record<string, string> = {
    readonly: 'blue',
    readwrite: 'green',
    admin: 'purple',
  };
  return map[perm] || 'default';
}

function permTagText(perm: PermissionMode): string {
  const map: Record<string, string> = {
    readonly: '只读',
    readwrite: '读写',
    admin: '管理',
  };
  return map[perm] || perm;
}
</script>

<template>
  <Modal
    :open="props.visible"
    :title="`权限管理 — ${props.folder?.name ?? ''}`"
    width="520px"
    @ok="handleSave"
    @cancel="handleCancel"
    ok-text="保存"
  >
    <div class="perm-modal-body">
      <!-- 添加用户 -->
      <div class="perm-add-row">
        <Select
          v-model:value="newUser"
          placeholder="选择用户"
          :options="availableUsers"
          style="flex: 1;"
          allow-clear
        />
        <Select
          v-model:value="newPerm"
          style="width: 120px;"
          :options="[
            { value: 'readonly', label: '只读' },
            { value: 'readwrite', label: '读写' },
            { value: 'admin', label: '管理' },
          ]"
        />
        <Button type="primary" size="small" @click="addUser" :disabled="!newUser">
          <IconifyIcon icon="lucide:plus" style="font-size: 13px;" />
          添加
        </Button>
      </div>

      <!-- 用户列表 -->
      <div class="perm-list">
        <div v-for="(p, index) in localPerms" :key="p.user" class="perm-item">
          <div class="perm-user">
            <div
              class="perm-avatar"
              :style="{ backgroundColor: getUserColor(p.user) + '18', color: getUserColor(p.user), borderColor: getUserColor(p.user) + '40' }"
            >
              {{ getUserInitial(p.user) }}
            </div>
            <span class="perm-user-name">{{ getUserLabel(p.user) }}</span>
            <span class="perm-user-id">({{ p.user }})</span>
          </div>
          <div class="perm-actions">
            <Select
              :value="p.permission"
              size="small"
              style="width: 90px;"
              :bordered="false"
              :options="[
                { value: 'readonly', label: '只读' },
                { value: 'readwrite', label: '读写' },
                { value: 'admin', label: '管理' },
              ]"
              @change="(v: PermissionMode) => changePermission(index, v)"
            />
            <Button size="small" type="text" danger class="perm-del-btn" @click="removeUser(index)">
              <IconifyIcon icon="lucide:trash-2" style="font-size: 13px;" />
            </Button>
          </div>
        </div>

        <div v-if="localPerms.length === 0" class="perm-empty">
          <Empty description="暂无用户权限配置">
            <template #image>
              <IconifyIcon icon="lucide:shield-off" style="font-size: 40px; color: #d9d9d9;" />
            </template>
          </Empty>
        </div>
      </div>

      <!-- 权限说明 -->
      <div class="perm-hint">
        <IconifyIcon icon="lucide:info" style="font-size: 13px; color: #8c8c8c;" />
        <span>只读：仅能查看和下载；读写：可上传、修改和删除；管理：拥有全部权限并可修改其他用户权限</span>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.perm-modal-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.perm-add-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.perm-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 320px;
  overflow-y: auto;
}

.perm-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 8px;
}

.perm-user {
  display: flex;
  align-items: center;
  gap: 8px;
}

.perm-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  border: 1.5px solid;
  flex-shrink: 0;
}

.perm-user-name {
  font-size: 14px;
  color: #262626;
  font-weight: 500;
}

.perm-user-id {
  font-size: 12px;
  color: #8c8c8c;
}

.perm-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.perm-del-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  width: 24px;
  height: 24px;
  border-radius: 4px;
}

.perm-empty {
  padding: 24px 0;
}

.perm-hint {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 8px 12px;
  background: #f6ffed;
  border-radius: 6px;
  font-size: 12px;
  color: #595959;
  line-height: 1.5;
}
</style>

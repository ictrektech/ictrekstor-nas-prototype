<script lang="ts" setup>
import { computed } from 'vue';
import { Select, Radio, Button } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import type { ShareUser } from '../types';

interface Props {
  modelValue: ShareUser[];
  userOptions: { label: string; value: string }[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:modelValue': [users: ShareUser[]];
}>();

const selectedUsers = computed({
  get: () => props.modelValue.map((u) => u.user),
  set: (vals: string[]) => {
    const users = vals.map((v) => {
      const existing = props.modelValue.find((u) => u.user === v);
      return existing || { user: v, permission: 'readonly' as const };
    });
    emit('update:modelValue', users);
  },
});

function removeUser(user: string) {
  emit(
    'update:modelValue',
    props.modelValue.filter((u) => u.user !== user),
  );
}

function updatePermission(user: string, permission: 'readonly' | 'readwrite') {
  const users = props.modelValue.map((u) => (u.user === user ? { ...u, permission } : u));
  emit('update:modelValue', users);
}

const USER_COLORS = ['var(--ict-primary)', 'var(--ict-success)', 'var(--ict-warning)', '#eb2f96', 'var(--ict-info)', '#13c2c2'];

function getUserColor(user: string): string {
  let hash = 0;
  for (let i = 0; i < user.length; i++) hash = user.charCodeAt(i) + ((hash << 5) - hash);
  return USER_COLORS[Math.abs(hash) % USER_COLORS.length];
}

function getUserInitial(user: string): string {
  return user.slice(0, 2).toUpperCase();
}
</script>

<template>
  <div class="share-user-list">
    <Select
      :value="selectedUsers"
      mode="multiple"
      placeholder="选择用户（可多选）"
      :options="userOptions"
      style="width: 100%;"
      @change="selectedUsers = $event as string[]"
    />
    <div v-if="modelValue.length > 0" class="user-perm-list">
      <div v-for="su in modelValue" :key="su.user" class="user-perm-row">
        <div class="user-perm-info">
          <div
            class="user-avatar-small"
            :style="{
              backgroundColor: getUserColor(su.user) + '18',
              color: getUserColor(su.user),
              borderColor: getUserColor(su.user) + '40',
            }"
          >
            {{ getUserInitial(su.user) }}
          </div>
          <span class="user-perm-name">{{ su.user }}</span>
        </div>
        <Radio.Group :value="su.permission" size="small" @change="updatePermission(su.user, $event.target.value)">
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
        <Button type="text" size="small" danger class="user-remove-btn" @click="removeUser(su.user)">
          <IconifyIcon icon="lucide:x" style="font-size: var(--ict-body-small);" />
        </Button>
      </div>
    </div>
  </div>
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
<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import {
  Button,
  Modal,
  Form,
  Input,
  Select,
  Radio,
  Tooltip,
  Divider,
  Checkbox,
  Tree,
  DatePicker,
} from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import type { FileTreeNode } from '#/components/FileExplorer';
import type { ShareFormData } from './types';

interface Props {
  visible: boolean;
  title?: string;
  folderName?: string;
  folderPath?: string;
  showTree?: boolean;
  treeData?: FileTreeNode[];
  treeExpandedKeys?: string[];
  treeSelectedKey?: string;
  confirmText?: string;
  userOptions: { label: string; value: string }[];
  initialValues?: Partial<ShareFormData>;
}

const props = withDefaults(defineProps<Props>(), {
  title: '创建分享',
  folderName: '',
  folderPath: '',
  showTree: false,
  treeData: () => [],
  treeExpandedKeys: () => ['space-1'],
  treeSelectedKey: '',
  confirmText: '创建',
  initialValues: () => ({}),
});

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void;
  (e: 'update:treeSelectedKey', val: string): void;
  (e: 'update:treeExpandedKeys', val: string[]): void;
  (e: 'ok', data: ShareFormData): void;
}>();

const formRef = ref();
const form = ref<ShareFormData>({
  shareUsers: [],
  expireType: 'preset',
  expirePreset: '7',
  expireCustomDate: '',
  linkEnabled: false,
  linkExpireType: 'preset',
  linkExpirePreset: '7',
  linkExpireCustomDate: '',
  linkPassword: '',
  sourceTreeKey: '',
  sourcePath: '',
  name: '',
});

const localTreeExpandedKeys = ref<string[]>([...props.treeExpandedKeys]);

/** 重置表单 */
function resetForm() {
  form.value = {
    shareUsers: props.initialValues?.shareUsers ?? [],
    expireType: props.initialValues?.expireType ?? 'preset',
    expirePreset: props.initialValues?.expirePreset ?? '7',
    expireCustomDate: props.initialValues?.expireCustomDate ?? '',
    linkEnabled: props.initialValues?.linkEnabled ?? false,
    linkExpireType: props.initialValues?.linkExpireType ?? 'preset',
    linkExpirePreset: props.initialValues?.linkExpirePreset ?? '7',
    linkExpireCustomDate: props.initialValues?.linkExpireCustomDate ?? '',
    linkPassword: props.initialValues?.linkPassword ?? '',
    sourceTreeKey: props.treeSelectedKey ?? '',
    sourcePath: props.folderPath ?? '',
    name: props.folderName ?? '',
  };
  localTreeExpandedKeys.value = [...props.treeExpandedKeys];
}

/** 已选用户 keys */
const selectedUserKeys = computed(() => form.value.shareUsers.map((u) => u.user));

/** 添加共享用户 */
function addShareUser(userValue: string) {
  if (!form.value.shareUsers.find((u) => u.user === userValue)) {
    form.value.shareUsers.push({ user: userValue, permission: 'readonly' });
  }
}

/** 移除共享用户 */
function removeShareUser(userValue: string) {
  form.value.shareUsers = form.value.shareUsers.filter((u) => u.user !== userValue);
}

/** 树节点选择 */
function onTreeSelect(keys: string[]) {
  const key = keys[0] || '';
  form.value.sourceTreeKey = key;
  if (key && props.treeData) {
    form.value.name = findNodeTitle(props.treeData, key);
    form.value.sourcePath = buildPathFromTree(props.treeData, key);
  } else {
    form.value.name = '';
    form.value.sourcePath = '';
  }
  emit('update:treeSelectedKey', key);
}

/** 在树中查找节点标题 */
function findNodeTitle(nodes: FileTreeNode[], targetKey: string): string {
  for (const node of nodes) {
    if (node.key === targetKey) return node.title;
    if (node.children) {
      const found = findNodeTitle(node.children, targetKey);
      if (found) return found;
    }
  }
  return '';
}

/** 从树节点构建路径字符串 */
function buildPathFromTree(nodes: FileTreeNode[], targetKey: string): string {
  for (const node of nodes) {
    if (node.key === targetKey) return node.title;
    if (node.children) {
      const childPath = buildPathFromTree(node.children, targetKey);
      if (childPath) return `${node.title} / ${childPath}`;
    }
  }
  return '';
}

function treeNodeIconResolver(node: FileTreeNode) {
  switch (node.type) {
    case 'space':
      return { icon: 'lucide:hard-drive', color: '#1677ff' };
    case 'folder':
      return { icon: 'lucide:folder-open', color: '#faad14' };
    default:
      return { icon: 'lucide:folder', color: '#faad14' };
  }
}

function handleOk() {
  formRef.value
    .validate()
    .then(() => {
      if (props.showTree && !form.value.sourceTreeKey) {
        // 需要目录树但未选择
        return;
      }
      emit('ok', { ...form.value });
      emit('update:visible', false);
    })
    .catch(() => {});
}

function getUserColor(user: string) {
  const colors: Record<string, string> = {
    zhangsan: '#1677ff',
    lisi: '#52c41a',
    wangwu: '#fa8c16',
    admin: '#722ed1',
  };
  return colors[user] || '#595959';
}

function getUserInitial(user: string) {
  return user.charAt(0).toUpperCase();
}

// 监听 visible 变化，打开时重置表单
watch(
  () => props.visible,
  (val) => {
    if (val) resetForm();
  },
);

// 监听 props 变化
watch(
  () => props.folderName,
  (val) => {
    if (val) form.value.name = val;
  },
);
watch(
  () => props.folderPath,
  (val) => {
    if (val) form.value.sourcePath = val;
  },
);
watch(
  () => props.treeSelectedKey,
  (val) => {
    if (val) form.value.sourceTreeKey = val;
  },
);
</script>

<template>
  <Modal
    :open="visible"
    :title="title"
    width="620px"
    :ok-text="confirmText"
    cancel-text="取消"
    @ok="handleOk"
    @update:open="(v) => emit('update:visible', v)"
    class="share-config-modal"
  >
    <Form
      ref="formRef"
      :model="form"
      layout="vertical"
      :rules="{
        sourcePath: [{ required: showTree, message: '请选择原文件夹', trigger: 'change' }],
      }"
    >
      <!-- 选中的文件夹信息 -->
      <div v-if="folderName || form.name" class="selected-folder-info">
        <div class="selected-folder-icon">
          <IconifyIcon icon="lucide:folder-open" style="font-size: 20px; color: #faad14;" />
        </div>
        <div class="selected-folder-detail">
          <div class="selected-folder-name">{{ folderName || form.name }}</div>
          <div v-if="folderPath || form.sourcePath" class="selected-folder-path">
            {{ folderPath || form.sourcePath }}
          </div>
        </div>
      </div>
      <div v-else-if="showTree" class="selected-folder-empty">
        <IconifyIcon icon="lucide:folder-open" style="font-size: 20px; color: #d9d9d9;" />
        <span>请从下方目录树中选择一个文件夹</span>
      </div>

      <!-- 目录树（可选） -->
      <Form.Item v-if="showTree" required class="tree-form-item">
        <div class="tree-wrap">
          <Tree
            :tree-data="treeData"
            :selected-keys="form.sourceTreeKey ? [form.sourceTreeKey] : []"
            :expanded-keys="localTreeExpandedKeys"
            :field-names="{ title: 'title', key: 'key', children: 'children' }"
            @update:selected-keys="onTreeSelect"
            @update:expanded-keys="
              (keys: string[]) => {
                localTreeExpandedKeys = keys;
                emit('update:treeExpandedKeys', keys);
              }
            "
            class="share-dir-tree"
            :show-line="{ showLeafIcon: false }"
          >
            <template #title="node">
              <span class="tree-node-title">
                <IconifyIcon
                  :icon="treeNodeIconResolver(node).icon"
                  :style="{
                    fontSize: '14px',
                    color: treeNodeIconResolver(node).color,
                    marginRight: '6px',
                    flexShrink: 0,
                  }"
                />
                <span class="tree-node-text" :title="node.title">{{ node.title }}</span>
              </span>
            </template>
          </Tree>
        </div>
      </Form.Item>

      <!-- 共享用户（带独立权限设置） -->
      <Form.Item label="共享用户" class="share-users-form-item">
        <Select
          :value="selectedUserKeys"
          mode="multiple"
          placeholder="选择用户并为其设置权限"
          :options="userOptions"
          @change="
            (vals: string[]) => {
              form.shareUsers = form.shareUsers.filter((u) => vals.includes(u.user));
              vals.forEach((v) => addShareUser(v));
            }
          "
          size="small"
        />
        <!-- 已选用户权限列表 -->
        <div v-if="form.shareUsers.length > 0" class="user-perm-list">
          <div v-for="su in form.shareUsers" :key="su.user" class="user-perm-row">
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
            <Radio.Group
              :value="su.permission"
              size="small"
              @change="
                (e: any) => {
                  const u = form.shareUsers.find((x) => x.user === su.user);
                  if (u) u.permission = e.target.value;
                }
              "
            >
              <Radio.Button value="readonly">
                <span class="radio-with-icon">
                  <IconifyIcon icon="lucide:eye" style="font-size: 10px; margin-right: 2px;" />
                  只读
                </span>
              </Radio.Button>
              <Radio.Button value="readwrite">
                <span class="radio-with-icon">
                  <IconifyIcon icon="lucide:pencil" style="font-size: 10px; margin-right: 2px;" />
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
              <IconifyIcon icon="lucide:x" style="font-size: 12px;" />
            </Button>
          </div>
        </div>
      </Form.Item>

      <!-- 有效期 -->
      <Form.Item label="有效期" class="expire-form-item">
        <div class="expire-compact">
          <Radio.Group v-model:value="form.expireType" size="small">
            <Radio.Button value="preset">预设</Radio.Button>
            <Radio.Button value="custom">自定义</Radio.Button>
            <Radio.Button value="forever">永久</Radio.Button>
          </Radio.Group>
          <div v-if="form.expireType === 'preset'" class="expire-preset">
            <Radio.Group v-model:value="form.expirePreset" size="small">
              <Radio.Button value="1">1天</Radio.Button>
              <Radio.Button value="7">7天</Radio.Button>
              <Radio.Button value="30">30天</Radio.Button>
            </Radio.Group>
          </div>
          <div v-else-if="form.expireType === 'custom'" class="expire-custom">
            <DatePicker
              v-model:value="form.expireCustomDate"
              placeholder="选择到期日期"
              size="small"
              style="width: 100%;"
            />
          </div>
        </div>
      </Form.Item>

      <Divider style="margin: 12px 0;" />

      <!-- 外链 -->
      <div class="link-section">
        <div class="link-section-header">
          <Checkbox v-model:checked="form.linkEnabled">
            <span style="font-weight: 500; font-size: 13px;">启用外链分享</span>
          </Checkbox>
          <Tooltip title="开启后，未登录用户也可通过链接访问">
            <IconifyIcon
              icon="lucide:circle-help"
              style="font-size: 13px; color: #bfbfbf; cursor: help;"
            />
          </Tooltip>
        </div>

        <div v-if="form.linkEnabled" class="link-config">
          <div class="config-grid">
            <Form.Item label="外链有效期" class="config-item">
              <div class="expire-compact">
                <Radio.Group v-model:value="form.linkExpireType" size="small">
                  <Radio.Button value="preset">预设</Radio.Button>
                  <Radio.Button value="custom">自定义</Radio.Button>
                  <Radio.Button value="forever">永久</Radio.Button>
                </Radio.Group>
                <div v-if="form.linkExpireType === 'preset'" class="expire-preset">
                  <Radio.Group v-model:value="form.linkExpirePreset" size="small">
                    <Radio.Button value="1">1天</Radio.Button>
                    <Radio.Button value="7">7天</Radio.Button>
                    <Radio.Button value="30">30天</Radio.Button>
                  </Radio.Group>
                </div>
                <div v-else-if="form.linkExpireType === 'custom'" class="expire-custom">
                  <DatePicker
                    v-model:value="form.linkExpireCustomDate"
                    placeholder="选择到期日期"
                    size="small"
                    style="width: 100%;"
                  />
                </div>
              </div>
            </Form.Item>

            <Form.Item label="访问密码" class="config-item">
              <Input
                v-model:value="form.linkPassword"
                placeholder="公开访问"
                size="small"
                type="password"
              >
                <template #prefix>
                  <IconifyIcon icon="lucide:lock" style="font-size: 12px; color: #bfbfbf;" />
                </template>
              </Input>
            </Form.Item>
          </div>
        </div>
      </div>
    </Form>
  </Modal>
</template>

<style scoped>
.share-config-modal :deep(.ant-modal-body) {
  padding: 16px 20px;
}

/* 选中的文件夹信息 */
.selected-folder-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: linear-gradient(135deg, #fffbe6 0%, #fff7e6 100%);
  border: 1px solid #ffd591;
  border-radius: 10px;
  margin-bottom: 12px;
}

.selected-folder-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.selected-folder-detail {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.selected-folder-name {
  font-size: 14px;
  font-weight: 600;
  color: #262626;
}

.selected-folder-path {
  font-size: 12px;
  color: #8c8c8c;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.selected-folder-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  background: #fafafa;
  border: 1px dashed #d9d9d9;
  border-radius: 10px;
  margin-bottom: 12px;
  color: #8c8c8c;
  font-size: 13px;
}

/* 目录树 */
.tree-form-item {
  margin-bottom: 8px;
}

.tree-form-item :deep(.ant-form-item-label) {
  padding-bottom: 4px;
}

.tree-wrap {
  max-height: 180px;
  overflow: auto;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 6px 8px;
  background: #fafafa;
}

.share-dir-tree :deep(.ant-tree-treenode) {
  padding: 1px 0;
}

.share-dir-tree :deep(.ant-tree-node-content-wrapper) {
  display: inline-flex;
  align-items: center;
  border-radius: 6px;
  transition: all 0.2s;
  padding: 3px 8px;
}

.share-dir-tree :deep(.ant-tree-node-content-wrapper:hover) {
  background: #f0f5ff;
}

.share-dir-tree :deep(.ant-tree-node-selected .ant-tree-node-content-wrapper) {
  background: #e6f4ff !important;
  color: #1677ff;
  font-weight: 500;
}

.tree-node-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  white-space: nowrap;
}

.tree-node-text {
  white-space: nowrap;
}

/* 共享用户（带权限） */
.share-users-form-item {
  margin-bottom: 8px;
}

.share-users-form-item :deep(.ant-form-item-label) {
  padding-bottom: 4px;
  font-size: 12px;
}

.share-users-form-item :deep(.ant-form-item-label > label) {
  font-size: 12px;
}

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
  background: #f6ffed;
  border: 1px solid #b7eb8f;
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
  font-size: 10px;
  font-weight: 600;
  border: 1.5px solid;
  flex-shrink: 0;
}

.user-perm-name {
  font-size: 13px;
  color: #262626;
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

/* 有效期紧凑布局 */
.expire-form-item {
  margin-bottom: 8px;
}

.expire-form-item :deep(.ant-form-item-label) {
  padding-bottom: 4px;
  font-size: 12px;
}

.expire-form-item :deep(.ant-form-item-label > label) {
  font-size: 12px;
}

.expire-compact {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.expire-preset {
  display: flex;
  gap: 6px;
}

.expire-custom {
  width: 100%;
}

/* 外链区域 */
.link-section {
  background: #fafafa;
  border-radius: 8px;
  padding: 10px 12px;
}

.link-section-header {
  display: flex;
  align-items: center;
  gap: 6px;
}

.link-config {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

/* 紧凑配置网格 */
.config-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.config-item {
  margin-bottom: 8px;
}

.config-item :deep(.ant-form-item-label) {
  padding-bottom: 4px;
  font-size: 12px;
}

.config-item :deep(.ant-form-item-label > label) {
  font-size: 12px;
}

/* radio with icon */
.radio-with-icon {
  display: inline-flex;
  align-items: center;
  font-size: 12px;
}

/* 响应式 */
@media (max-width: 768px) {
  .config-grid {
    grid-template-columns: 1fr;
  }
}
</style>
<script lang="ts" setup>
import { ref, watch } from 'vue';
import { Modal, Form, Tree, Divider } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import { treeNodeIconResolver } from '#/utils/treeIcons';
import FolderInfoCard from './components/FolderInfoCard.vue';
import ShareUserList from './components/ShareUserList.vue';
import ExpireSelector from './components/ExpireSelector.vue';
import ExternalLinkPanel from './components/ExternalLinkPanel.vue';
import type { FileTreeNode } from '#/components/FileExplorer';
import type { ShareConfigModalProps, ShareFormData } from './types';

const props = withDefaults(defineProps<ShareConfigModalProps>(), {
  title: '创建分享',
  folderName: '',
  folderPath: '',
  showTree: false,
  treeData: () => [],
  treeExpandedKeys: () => [],
  treeSelectedKey: '',
  confirmText: '创建分享',
  initialValues: () => ({}),
});

const emit = defineEmits<{
  'update:visible': [visible: boolean];
  confirm: [data: ShareFormData];
}>();

const formRef = ref<InstanceType<typeof Form> | null>(null);

const defaultForm = (): ShareFormData => ({
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

const form = ref<ShareFormData>(defaultForm());
const expandedKeys = ref<string[]>([]);
const selectedKeys = ref<string[]>([]);

watch(
  () => props.visible,
  (val) => {
    if (val) {
      form.value = { ...defaultForm(), ...props.initialValues };
      expandedKeys.value = [...props.treeExpandedKeys];
      selectedKeys.value = props.treeSelectedKey ? [props.treeSelectedKey] : [];
    }
  },
);

watch(
  () => props.treeExpandedKeys,
  (val) => {
    expandedKeys.value = [...val];
  },
);

function onTreeSelect(keys: string[]) {
  selectedKeys.value = keys;
  if (keys.length > 0) {
    form.value.sourceTreeKey = keys[0];
  }
}

function onTreeExpand(keys: string[]) {
  expandedKeys.value = keys;
}

function handleOk() {
  formRef.value
    ?.validate()
    .then(() => {
      if (props.showTree && selectedKeys.value.length === 0) {
        return;
      }
      emit('confirm', { ...form.value });
      emit('update:visible', false);
    })
    .catch(() => {});
}

function handleCancel() {
  emit('update:visible', false);
}
</script>

<template>
  <Modal
    :open="visible"
    :title="title"
    width="520px"
    :ok-text="confirmText"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <Form
      ref="formRef"
      :model="form"
      layout="vertical"
      class="share-config-modal"
    >
      <FolderInfoCard
        :name="folderName"
        :path="folderPath"
        :show-tree="showTree"
      />

      <!-- 目录树 -->
      <Form.Item v-if="showTree" label="选择分享目录" class="tree-form-item">
        <div class="tree-wrap">
          <Tree
            :tree-data="treeData"
            :selected-keys="selectedKeys"
            :expanded-keys="expandedKeys"
            :field-names="{ title: 'title', key: 'key', children: 'children' }"
            @update:selected-keys="onTreeSelect"
            @update:expanded-keys="onTreeExpand"
            class="share-dir-tree"
            :show-line="{ showLeafIcon: false }"
          >
            <template #title="node">
              <span class="tree-node-title">
                <IconifyIcon
                  :icon="treeNodeIconResolver(node).icon"
                  :style="{ fontSize: '14px', color: treeNodeIconResolver(node).color, marginRight: '6px', flexShrink: 0 }"
                />
                <span class="tree-node-text">{{ node.title }}</span>
              </span>
            </template>
          </Tree>
        </div>
      </Form.Item>

      <!-- 共享用户 -->
      <Form.Item label="共享用户" class="share-users-form-item">
        <ShareUserList
          v-model="form.shareUsers"
          :user-options="userOptions"
        />
      </Form.Item>

      <!-- 有效期 -->
      <Form.Item label="有效期" class="expire-form-item">
        <ExpireSelector
          v-model:type="form.expireType"
          v-model:preset="form.expirePreset"
          v-model:custom-date="form.expireCustomDate"
        />
      </Form.Item>

      <Divider style="margin: 12px 0;" />

      <!-- 外链 -->
      <ExternalLinkPanel
        v-model:enabled="form.linkEnabled"
        v-model:expire-type="form.linkExpireType"
        v-model:expire-preset="form.linkExpirePreset"
        v-model:expire-custom-date="form.linkExpireCustomDate"
        v-model:password="form.linkPassword"
      />
    </Form>
  </Modal>
</template>

<style scoped>
.share-config-modal :deep(.ant-modal-body) {
  padding: 16px 20px;
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
  border: 1px solid var(--ict-border-light);
  border-radius: 8px;
  padding: 6px 8px;
  background: var(--ict-bg-section);
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
  background: var(--ict-primary-light) !important;
  color: var(--ict-primary);
  font-weight: 500;
}

.tree-node-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: var(--ict-mark-medium);
  white-space: nowrap;
}

.tree-node-text {
  white-space: nowrap;
}

/* 共享用户 */
.share-users-form-item {
  margin-bottom: 8px;
}

.share-users-form-item :deep(.ant-form-item-label) {
  padding-bottom: 4px;
  font-size: var(--ict-body-small);
}

.share-users-form-item :deep(.ant-form-item-label > label) {
  font-size: var(--ict-body-small);
}

/* 有效期 */
.expire-form-item {
  margin-bottom: 8px;
}

.expire-form-item :deep(.ant-form-item-label) {
  padding-bottom: 4px;
  font-size: var(--ict-body-small);
}

.expire-form-item :deep(.ant-form-item-label > label) {
  font-size: var(--ict-body-small);
}
</style>
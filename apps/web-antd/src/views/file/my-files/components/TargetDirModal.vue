<script lang="ts" setup>
import { Modal, Tree } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import type { FileTreeNode } from '#/components/FileExplorer';

defineProps<{
  visible: boolean;
  title: string;
  treeData: FileTreeNode[];
  selectedKeys: string[];
  expandedKeys: string[];
  pendingFiles: { name: string }[];
  action: 'copy' | 'move';
}>();

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void;
  (e: 'update:selectedKeys', keys: string[]): void;
  (e: 'update:expandedKeys', keys: string[]): void;
  (e: 'confirm'): void;
}>();

function onSelect(keys: string[]) {
  emit('update:selectedKeys', keys);
}

function onExpand(keys: string[]) {
  emit('update:expandedKeys', keys);
}

function onOk() {
  emit('confirm');
}
</script>

<template>
  <Modal
    :open="visible"
    :title="title"
    width="480px"
    @ok="onOk"
    @update:open="emit('update:visible', $event)"
  >
    <div class="target-dir-tree-wrap">
      <Tree
        :tree-data="treeData"
        :selected-keys="selectedKeys"
        :expanded-keys="expandedKeys"
        :field-names="{ title: 'title', key: 'key', children: 'children' }"
        @update:selected-keys="onSelect"
        @update:expanded-keys="onExpand"
        class="target-dir-tree"
        :show-line="{ showLeafIcon: false }"
      >
        <template #title="node">
          <span class="tree-node-title">
            <IconifyIcon
              :icon="
                node.type === 'category'
                  ? node.key === 'root-my-files'
                    ? 'lucide:user'
                    : node.key === 'root-public'
                      ? 'lucide:folder-heart'
                      : 'lucide:share-2'
                  : node.type === 'space'
                    ? 'lucide:hard-drive'
                    : node.type === 'public-folder'
                      ? 'lucide:folder-heart'
                      : node.type === 'shared-user'
                        ? 'lucide:user-circle'
                        : node.type === 'shared-folder'
                          ? 'lucide:folder-symlink'
                          : 'lucide:folder-open'
              "
              :style="{
                fontSize: '14px',
                color:
                  node.type === 'category'
                    ? node.key === 'root-my-files'
                      ? '#1677ff'
                      : node.key === 'root-public'
                        ? '#fa8c16'
                        : '#722ed1'
                    : node.type === 'space'
                      ? '#1677ff'
                      : node.type === 'public-folder'
                        ? '#fa8c16'
                        : node.type === 'shared-user'
                          ? '#722ed1'
                          : node.type === 'shared-folder'
                            ? '#a855f7'
                            : '#faad14',
                marginRight: '6px',
                flexShrink: 0,
              }"
            />
            <span class="tree-node-text" :title="node.title">{{
              node.title
            }}</span>
          </span>
        </template>
      </Tree>
    </div>
    <div v-if="pendingFiles.length > 0" class="target-dir-pending">
      <span class="target-dir-pending-label"
        >待{{ action === 'copy' ? '复制' : '移动' }}文件：</span
      >
      <span class="target-dir-pending-names">{{
        pendingFiles.map((f) => f.name).join('、')
      }}</span>
    </div>
  </Modal>
</template>

<style scoped>
.target-dir-tree-wrap {
  max-height: 320px;
  overflow: auto;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  padding: 8px;
}

.target-dir-tree :deep(.ant-tree-treenode) {
  padding: 2px 0;
}

.target-dir-tree :deep(.ant-tree-node-content-wrapper) {
  display: inline-flex;
  align-items: center;
  border-radius: 6px;
  transition: all 0.2s;
  padding: 4px 8px;
}

.target-dir-tree :deep(.ant-tree-node-content-wrapper:hover) {
  background: #f0f5ff;
}

.target-dir-tree
  :deep(.ant-tree-node-selected .ant-tree-node-content-wrapper) {
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

.target-dir-pending {
  margin-top: 12px;
  padding: 8px 12px;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 6px;
  font-size: 13px;
}

.target-dir-pending-label {
  color: #52c41a;
  font-weight: 500;
}

.target-dir-pending-names {
  color: #262626;
}
</style>

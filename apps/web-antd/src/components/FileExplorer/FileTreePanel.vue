<script lang="ts" setup>
import { Tree } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import type { FileTreeNode } from './types';

interface Props {
  treeData: FileTreeNode[];
  selectedKeys: string[];
  expandedKeys: string[];
  /** 自定义节点图标解析函数 */
  nodeIconResolver?: (node: FileTreeNode) => { icon: string; color: string };
  /** 是否显示连接线 */
  showLine?: boolean;
  /** 侧边栏宽度 */
  width?: string;
  /** 最小宽度 */
  minWidth?: string;
}

const props = withDefaults(defineProps<Props>(), {
  showLine: true,
  width: '220px',
  minWidth: '180px',
});

const emit = defineEmits<{
  'update:selectedKeys': [keys: string[]];
  'update:expandedKeys': [keys: string[]];
  /** 节点被选中时触发 */
  select: [key: string];
}>();

function onSelect(keys: string[]) {
  if (keys.length > 0) {
    emit('update:selectedKeys', keys);
    emit('select', keys[0]);
  }
}

function onExpand(keys: string[]) {
  emit('update:expandedKeys', keys);
}

function defaultIconResolver(node: FileTreeNode): { icon: string; color: string } {
  // 默认根据 node.type 推断图标
  if (node.type === 'space') {
    return { icon: 'lucide:hard-drive', color: '#1677ff' };
  }
  if (node.type === 'team-folder') {
    return { icon: 'lucide:folder-heart', color: '#1677ff' };
  }
  if (node.isLeaf) {
    return { icon: 'lucide:folder-open', color: '#faad14' };
  }
  return { icon: 'lucide:folder', color: '#faad14' };
}

function resolveIcon(node: FileTreeNode) {
  return props.nodeIconResolver ? props.nodeIconResolver(node) : defaultIconResolver(node);
}
</script>

<template>
  <div class="file-tree-panel" :style="{ width, minWidth }">
    <Tree
      :tree-data="treeData"
      :selected-keys="selectedKeys"
      :expanded-keys="expandedKeys"
      :field-names="{ title: 'title', key: 'key', children: 'children' }"
      @update:selected-keys="onSelect"
      @update:expanded-keys="onExpand"
      class="file-tree-panel__tree"
      :show-line="showLine ? { showLeafIcon: false } : false"
    >
      <template #title="node">
        <span class="file-tree-panel__node-title">
          <IconifyIcon
            :icon="resolveIcon(node).icon"
            :style="{ fontSize: '14px', color: resolveIcon(node).color, marginRight: '6px' }"
          />
          <span class="file-tree-panel__node-text">{{ node.title }}</span>
        </span>
      </template>
    </Tree>
  </div>
</template>

<style scoped>
.file-tree-panel {
  background: #fff;
  border-radius: 10px;
  border: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
  padding: 8px 4px;
}

.file-tree-panel__tree {
  flex: 1;
  overflow: auto;
}

.file-tree-panel__tree :deep(.ant-tree-treenode) {
  padding: 2px 0;
}

.file-tree-panel__tree :deep(.ant-tree-node-content-wrapper) {
  display: flex;
  align-items: center;
  border-radius: 6px;
  transition: all 0.2s;
  padding: 4px 6px;
}

.file-tree-panel__tree :deep(.ant-tree-node-content-wrapper:hover) {
  background: #f0f5ff;
}

.file-tree-panel__tree :deep(.ant-tree-node-selected .ant-tree-node-content-wrapper) {
  background: #e6f4ff !important;
  color: #1677ff;
  font-weight: 500;
}

.file-tree-panel__tree :deep(.ant-tree-switcher-leaf-line::before) {
  display: none !important;
}

.file-tree-panel__tree :deep(.ant-tree-switcher-leaf-line::after) {
  display: none !important;
}

.file-tree-panel__node-title {
  display: inline-flex;
  align-items: center;
  font-size: 13px;
}

.file-tree-panel__node-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 120px;
}

@media (max-width: 768px) {
  .file-tree-panel {
    width: 180px !important;
    min-width: 180px !important;
  }
}
</style>

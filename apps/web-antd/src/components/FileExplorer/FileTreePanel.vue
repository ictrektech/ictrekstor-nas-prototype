<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { Tree, Tooltip } from 'ant-design-vue';
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
  /** 默认宽度 */
  defaultWidth?: number;
  /** 最小宽度 */
  minWidth?: number;
  /** 最大宽度 */
  maxWidth?: number;
}

const props = withDefaults(defineProps<Props>(), {
  showLine: true,
  defaultWidth: 280,
  minWidth: 200,
  maxWidth: 600,
});

const emit = defineEmits<{
  'update:selectedKeys': [keys: string[]];
  'update:expandedKeys': [keys: string[]];
  /** 节点被选中时触发 */
  select: [key: string];
}>();

// ═══ 抽屉状态 ═══
/** 是否收起 */
const collapsed = ref(false);
/** 是否固定模式（pin=true 时挤占空间，pin=false 时 overlay 覆盖） */
const isPinned = ref(true);
/** 当前抽屉宽度 */
const drawerWidth = ref(props.defaultWidth);
/** 是否正在拖拽调整宽度 */
const isResizing = ref(false);
/** 是否处于悬浮展开状态（overlay 模式下鼠标悬停临时展开） */
const isHoverExpanded = ref(false);

// ═══ 计算属性 ═══
const isExpanded = computed(() => !collapsed.value || isHoverExpanded.value);

const rootStyle = computed(() => {
  if (collapsed.value && !isHoverExpanded.value) {
    return { width: '40px', minWidth: '40px' };
  }
  if (isPinned.value) {
    return { width: `${drawerWidth.value}px`, minWidth: `${props.minWidth}px` };
  }
  // overlay 模式收起状态下保持 40px 触发条，展开后由 absolute 面板覆盖
  return { width: '40px', minWidth: '40px', position: 'relative' as const };
});

const panelStyle = computed(() => {
  if (collapsed.value && !isHoverExpanded.value) {
    return { display: 'none' };
  }
  const base: Record<string, string> = {
    width: `${drawerWidth.value}px`,
  };
  if (!isPinned.value) {
    // overlay 模式：absolute 定位覆盖在内容上方
    base.position = 'absolute';
    base.left = '0';
    base.top = '0';
    base.bottom = '0';
    base.zIndex = '50';
  }
  return base;
});

// ═══ 方法 ═══
function expand() {
  collapsed.value = false;
  isHoverExpanded.value = false;
}

function collapse() {
  collapsed.value = true;
  isHoverExpanded.value = false;
}

function togglePin() {
  const wasPinned = isPinned.value;
  isPinned.value = !isPinned.value;
  // 切换模式时如果处于收起状态，自动展开
  if (collapsed.value) {
    collapsed.value = false;
    isHoverExpanded.value = false;
  } else if (wasPinned && !isPinned.value) {
    // 从固定模式切换到悬浮模式，且当前处于展开状态
    // 将展开状态标记为悬浮展开，使鼠标移出后自动收起
    collapsed.value = true;
    isHoverExpanded.value = true;
  } else {
    // 从悬浮模式切换到固定模式，清除悬浮展开状态
    isHoverExpanded.value = false;
  }
}

// 悬浮展开（overlay 模式下悬停触发条时临时展开）
function onTriggerHover() {
  if (!isPinned.value && collapsed.value) {
    isHoverExpanded.value = true;
  }
}

function onTriggerLeave() {
  if (isHoverExpanded.value) {
    isHoverExpanded.value = false;
  }
}

function onPanelMouseLeave() {
  if (isHoverExpanded.value) {
    isHoverExpanded.value = false;
  }
}

// ═══ 宽度拖拽调整 ═══
function startResize(e: MouseEvent) {
  e.preventDefault();
  e.stopPropagation();
  isResizing.value = true;
  const startX = e.clientX;
  const startWidth = drawerWidth.value;

  function onMouseMove(ev: MouseEvent) {
    const delta = ev.clientX - startX;
    const newWidth = Math.max(
      props.minWidth,
      Math.min(props.maxWidth, startWidth + delta),
    );
    drawerWidth.value = newWidth;
  }

  function onMouseUp() {
    isResizing.value = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';
}

// ═══ 树事件 ═══
function onSelect(keys: string[]) {
  if (keys.length > 0) {
    emit('update:selectedKeys', keys);
    emit('select', keys[0]);
  }
}

function onExpand(keys: string[]) {
  emit('update:expandedKeys', keys);
}

  function setPin(value: boolean) {
    isPinned.value = value;
  }

  // ═══ 暴露方法给父组件 ═══
  defineExpose({
    collapse,
    expand,
    togglePin,
    setPin,
  });

  function defaultIconResolver(node: FileTreeNode): { icon: string; color: string } {
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

// 监听 defaultWidth 变化
watch(
  () => props.defaultWidth,
  (val) => {
    if (!isResizing.value) drawerWidth.value = val;
  },
);
</script>

<template>
  <div class="file-tree-drawer" :style="rootStyle">
    <!-- ═══ 收起状态：窄触发条 ═══ -->
    <div
      v-if="collapsed && !isHoverExpanded"
      class="drawer-trigger"
      @click="expand"
      @mouseenter="onTriggerHover"
    >
      <IconifyIcon
        icon="lucide:panel-left-open"
        style="font-size: 16px; color: #8c8c8c;"
      />
      <span class="trigger-label">目录</span>
    </div>

    <!-- ═══ 展开状态：抽屉面板 ═══ -->
    <div
      v-else
      class="drawer-panel"
      :class="{
        'is-overlay': !isPinned,
        'is-pinned': isPinned,
        'is-resizing': isResizing,
      }"
      :style="panelStyle"
      @mouseleave="onPanelMouseLeave"
    >
      <!-- 宽度拖拽条 -->
      <div
        class="resize-handle"
        :class="{ 'is-resizing': isResizing }"
        @mousedown="startResize"
      ></div>

      <!-- 面板头部 -->
      <div class="panel-header">
        <span class="panel-title">
          <IconifyIcon
            icon="lucide:folder-tree"
            style="font-size: 14px; color: #1677ff;"
          />
          文件目录
        </span>
        <div class="panel-actions">
          <Tooltip :title="isPinned ? '切换为悬浮模式' : '切换为固定模式'">
            <button
              class="action-btn"
              :class="{ active: isPinned }"
              @click="togglePin"
            >
              <IconifyIcon icon="lucide:pin" style="font-size: 13px;" />
            </button>
          </Tooltip>
          <Tooltip title="收起侧边栏">
            <button class="action-btn" @click="collapse">
              <IconifyIcon icon="lucide:panel-left-close" style="font-size: 13px;" />
            </button>
          </Tooltip>
        </div>
      </div>

      <!-- 树状内容区：支持横向+纵向滚动 -->
      <div class="panel-content">
        <Tree
          :tree-data="treeData"
          :selected-keys="selectedKeys"
          :expanded-keys="expandedKeys"
          :field-names="{ title: 'title', key: 'key', children: 'children' }"
          @update:selected-keys="onSelect"
          @update:expanded-keys="onExpand"
          class="file-tree"
          :show-line="showLine ? { showLeafIcon: false } : false"
        >
          <template #title="node">
            <span class="tree-node-title">
              <IconifyIcon
                :icon="resolveIcon(node).icon"
                :style="{ fontSize: '14px', color: resolveIcon(node).color, marginRight: '6px', flexShrink: 0 }"
              />
              <span class="tree-node-text" :title="node.title">{{ node.title }}</span>
            </span>
          </template>
        </Tree>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ═══ 抽屉根容器 ═══ */
.file-tree-drawer {
  position: relative;
  flex-shrink: 0;
  height: 100%;
  transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: visible;
}

/* ═══ 收起触发条 ═══ */
.drawer-trigger {
  width: 40px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 14px 0;
  background: #fff;
  border: none;
  border-right: 1px solid #f0f0f0;
  cursor: pointer;
  gap: 10px;
  transition: all 0.2s ease;
  user-select: none;
}

.drawer-trigger:hover {
  background: #f0f5ff;
}

.trigger-label {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  font-size: 11px;
  color: #8c8c8c;
  letter-spacing: 3px;
  font-weight: 500;
}

/* ═══ 展开面板 ═══ */
.drawer-panel {
  height: 100%;
  background: #fff;
  border: none;
  border-right: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.drawer-panel.is-overlay {
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.12);
  animation: drawerSlideIn 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes drawerSlideIn {
  from {
    opacity: 0;
    transform: translateX(-12px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* ═══ 宽度拖拽条 ═══ */
.resize-handle {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 5px;
  cursor: col-resize;
  z-index: 10;
  transition: background 0.15s;
  border-radius: 0 10px 10px 0;
}

.resize-handle:hover,
.resize-handle.is-resizing {
  background: rgba(22, 119, 255, 0.35);
}

/* ═══ 面板头部 ═══ */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px 10px 16px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
  user-select: none;
}

.panel-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #262626;
}

.panel-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-btn {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #8c8c8c;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #f0f5ff;
  color: #1677ff;
}

.action-btn.active {
  background: #e6f4ff;
  color: #1677ff;
}

/* ═══ 树状内容区：支持横向+纵向滚动 ═══ */
.panel-content {
  flex: 1;
  overflow: auto;
  padding: 20px;
  /* 隐藏滚动条但保留滚动能力 */
  scrollbar-width: thin;
  scrollbar-color: #d9d9d9 transparent;
}

.panel-content::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

.panel-content::-webkit-scrollbar-track {
  background: transparent;
}

.panel-content::-webkit-scrollbar-thumb {
  background: #d9d9d9;
  border-radius: 3px;
}

.panel-content::-webkit-scrollbar-thumb:hover {
  background: #bfbfbf;
}

/* ═══ 树组件样式 ═══ */
.file-tree {
  min-width: max-content;
}

.file-tree :deep(.ant-tree-treenode) {
  padding: 2px 0;
}

.file-tree :deep(.ant-tree-node-content-wrapper) {
  display: inline-flex;
  align-items: center;
  border-radius: 6px;
  transition: all 0.2s;
  padding: 4px 8px;
  min-width: max-content;
}

.file-tree :deep(.ant-tree-node-content-wrapper:hover) {
  background: #f0f5ff;
}

.file-tree :deep(.ant-tree-node-selected .ant-tree-node-content-wrapper) {
  background: #e6f4ff !important;
  color: #1677ff;
  font-weight: 500;
}

.file-tree :deep(.ant-tree-switcher-leaf-line::before) {
  display: none !important;
}

.file-tree :deep(.ant-tree-switcher-leaf-line::after) {
  display: none !important;
}

.tree-node-title {
  display: inline-flex;
  align-items: center;
  font-size: 13px;
  min-width: max-content;
}

.tree-node-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: none; /* 允许横向滚动查看完整名称 */
}

/* ═══ 响应式 ═══ */
@media (max-width: 768px) {
  .file-tree-drawer {
    width: 40px !important;
    min-width: 40px !important;
  }

  .drawer-panel.is-pinned {
    position: absolute !important;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 50;
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.12);
  }
}
</style>

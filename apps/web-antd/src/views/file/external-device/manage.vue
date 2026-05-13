<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import {
  FileTreePanel,
  FileManagerPanel,
} from '#/components/FileExplorer';
import type { FileTreeNode, FileItem, BreadcrumbItem } from '#/components/FileExplorer';
import {
  buildBreadcrumbPath,
  findParentKeys,
  findNodeInTree,
} from '#/components/FileExplorer';
import RenameModal from '#/components/common/RenameModal.vue';
import DeviceInfoHeader from './components/DeviceInfoHeader.vue';
import TransferConfirmModal from './components/TransferConfirmModal.vue';
import {
  devices as mockDevices,
  deviceFilesData,
  localTree,
  localFiles,
  buildDeviceTree,
  type ExternalDevice,
} from './components/mockData';

const route = useRoute();
const router = useRouter();

// 当前设备 ID
const deviceId = computed(() => route.params.deviceId as string);

const devices = ref<ExternalDevice[]>(mockDevices);

const currentDevice = computed(() =>
  devices.value.find((d) => d.id === deviceId.value),
);

// 设备节点类型
const treeData = computed<FileTreeNode[]>(() => buildDeviceTree(currentDevice.value));


// 状态
const showLocalPanel = ref(false);
const selectedKeys = ref<string[]>(['root']);
const expandedKeys = ref<string[]>(['root']);
const files = ref<FileItem[]>([]);
const searchText = ref('');
const viewMode = ref<'list' | 'grid'>('list');
const loading = ref(false);

const localTreeData = ref<FileTreeNode[]>(localTree);
const localSelectedKeys = ref<string[]>(['local:root']);
const localExpandedKeys = ref<string[]>(['local:root']);
const localFilesList = ref<FileItem[]>([]);
const localSearchText = ref('');
const localViewMode = ref<'list' | 'grid'>('list');
const localLoading = ref(false);

const deviceTreeRef = ref<InstanceType<typeof FileTreePanel> | null>(null);
const localTreeRef = ref<InstanceType<typeof FileTreePanel> | null>(null);

// 传输弹窗
const transferModalVisible = ref(false);
const transferFileName = ref('');
const transferDirection = ref<'to-local' | 'to-device'>('to-local');

// 重命名
const renameModalVisible = ref(false);
const renameFileName = ref('');
const editingFile = ref<FileItem | null>(null);

const filesMap = ref<Record<string, FileItem[]>>(JSON.parse(JSON.stringify(deviceFilesData)));

// 计算属性
const breadcrumbPath = computed(() => {
  const key = selectedKeys.value[0];
  if (!key || key === 'root') {
    return [{ title: currentDevice.value?.name || '外接设备', key: 'root' }];
  }
  return buildBreadcrumbPath(treeData.value, key, currentDevice.value?.name || '外接设备', 'root');
});

const localBreadcrumbPath = computed(() => {
  const key = localSelectedKeys.value[0];
  if (!key) return [{ title: '本地存储', key: 'root' }];
  return buildBreadcrumbPath(localTreeData.value, key, '本地存储', 'local:root');
});

// 方法
function loadFiles(key: string) {
  if (key === 'root') {
    const device = currentDevice.value;
    if (!device) {
      files.value = [];
      return;
    }
    const rootKey = `${device.id}:root`;
    files.value = filesMap.value[rootKey] || [];
    return;
  }
  loading.value = true;
  setTimeout(() => {
    files.value = filesMap.value[key] || [];
    loading.value = false;
  }, 150);
}

function loadLocalFiles(key: string) {
  localLoading.value = true;
  setTimeout(() => {
    localFilesList.value = localFiles[key] || [];
    localLoading.value = false;
  }, 150);
}

function onTreeSelect(key: string) {
  selectedKeys.value = [key];
  loadFiles(key);
}

function onLocalTreeSelect(key: string) {
  localSelectedKeys.value = [key];
  loadLocalFiles(key);
}

function onBreadcrumbClick(item: BreadcrumbItem) {
  if (item.key === 'root') {
    selectedKeys.value = ['root'];
    loadFiles('root');
    return;
  }
  selectedKeys.value = [item.key];
  const parentKeys = findParentKeys(treeData.value, item.key);
  expandedKeys.value = [...new Set([...expandedKeys.value, ...parentKeys])];
  loadFiles(item.key);
}

function onLocalBreadcrumbClick(item: BreadcrumbItem) {
  if (item.key === 'local:root') {
    localSelectedKeys.value = ['local:root'];
    localExpandedKeys.value = ['local:root'];
    loadLocalFiles('local:root');
    return;
  }
  localSelectedKeys.value = [item.key];
  const parentKeys = findParentKeys(localTreeData.value, item.key);
  localExpandedKeys.value = [...new Set([...localExpandedKeys.value, ...parentKeys])];
  loadLocalFiles(item.key);
}

function handleOpenFolder(file: FileItem) {
  if (file.type !== 'folder') return;
  const currentKey = selectedKeys.value[0];
  const newKey = findChildKey(treeData.value, currentKey, file.name);
  if (newKey) {
    selectedKeys.value = [newKey];
    expandedKeys.value = [...new Set([...expandedKeys.value, currentKey])];
    loadFiles(newKey);
  }
}

function handleLocalOpenFolder(file: FileItem) {
  if (file.type !== 'folder') return;
  const currentKey = localSelectedKeys.value[0];
  const newKey = findChildKey(localTreeData.value, currentKey, file.name);
  if (newKey) {
    localSelectedKeys.value = [newKey];
    localExpandedKeys.value = [...new Set([...localExpandedKeys.value, currentKey])];
    loadLocalFiles(newKey);
  }
}

function findChildKey(nodes: FileTreeNode[], parentKey: string, childName: string): string | null {
  const parent = findNodeInTree(nodes, parentKey);
  if (parent?.children) {
    const child = parent.children.find((c) => c.title === childName);
    if (child) return child.key;
  }
  return null;
}

// 拖拽传输
function onDeviceDrop(droppedFiles: FileItem[]) {
  if (droppedFiles.length === 0) return;
  const file = droppedFiles[0];
  transferFileName.value = file.name;
  transferDirection.value = 'to-device';
  transferModalVisible.value = true;
}

function onLocalDrop(droppedFiles: FileItem[]) {
  if (droppedFiles.length === 0) return;
  const file = droppedFiles[0];
  transferFileName.value = file.name;
  transferDirection.value = 'to-local';
  transferModalVisible.value = true;
}

function confirmTransfer() {
  const target = transferDirection.value === 'to-local' ? '本地存储' : currentDevice.value?.name || '外接设备';
  message.success(`"${transferFileName.value}" 已传输到 ${target}`);
  transferModalVisible.value = false;

  if (transferDirection.value === 'to-local') {
    const currentKey = localSelectedKeys.value[0];
    const newFile: FileItem = {
      id: `trans-${Date.now()}`,
      name: transferFileName.value,
      type: 'file',
      size: '未知',
      modifyTime: new Date().toLocaleString('zh-CN'),
      extension: transferFileName.value.split('.').pop(),
    };
    if (!localFiles[currentKey]) localFiles[currentKey] = [];
    localFiles[currentKey].push(newFile);
    loadLocalFiles(currentKey);
  } else {
    const currentKey = selectedKeys.value[0];
    const newFile: FileItem = {
      id: `trans-${Date.now()}`,
      name: transferFileName.value,
      type: 'file',
      size: '未知',
      modifyTime: new Date().toLocaleString('zh-CN'),
      extension: transferFileName.value.split('.').pop(),
    };
    if (!filesMap.value[currentKey]) filesMap.value[currentKey] = [];
    filesMap.value[currentKey].push(newFile);
    loadFiles(currentKey);
  }
}

// 重命名
function openRenameModal(file: FileItem) {
  editingFile.value = file;
  renameFileName.value = file.name;
  renameModalVisible.value = true;
}

function handleRename(newName: string) {
  if (editingFile.value) {
    editingFile.value.name = newName;
    message.success('重命名成功');
  }
  renameModalVisible.value = false;
}

// 删除
function handleDeleteFile(file: FileItem) {
  message.success(`"${file.name}" 已删除`);
  files.value = files.value.filter((f) => f.id !== file.id);
}

function handleDeleteLocalFile(file: FileItem) {
  message.success(`"${file.name}" 已删除`);
  localFilesList.value = localFilesList.value.filter((f) => f.id !== file.id);
}

// 刷新
function refreshFiles() {
  loadFiles(selectedKeys.value[0]);
  message.success('已刷新');
}

function refreshLocal() {
  loadLocalFiles(localSelectedKeys.value[0]);
  message.success('已刷新');
}

// 树节点图标
function nodeIconResolver(node: FileTreeNode) {
  const device = currentDevice.value;
  if (!device) return { icon: 'lucide:usb', color: '#1677ff' };
  if (node.type?.startsWith('device-')) {
    if (node.type === 'device-disconnected') {
      return { icon: 'lucide:usb', color: '#bfbfbf' };
    }
    return { icon: 'lucide:usb', color: '#1677ff' };
  }
  return { icon: 'lucide:folder', color: '#faad14' };
}

function localNodeIconResolver(node: FileTreeNode) {
  if (node.type === 'local-root') {
    return { icon: 'lucide:server', color: '#52c41a' };
  }
  return { icon: 'lucide:folder', color: '#faad14' };
}

// 返回列表
function goBack() {
  router.push('/file/external-device');
}

// 拷贝模式切换
function toggleCopyMode() {
  showLocalPanel.value = !showLocalPanel.value;
}

watch(showLocalPanel, (val) => {
  if (val) {
    deviceTreeRef.value?.setPin?.(false);
    deviceTreeRef.value?.collapse?.();
    localTreeRef.value?.setPin?.(false);
    localTreeRef.value?.collapse?.();
  } else {
    deviceTreeRef.value?.setPin?.(true);
    deviceTreeRef.value?.expand?.();
    localTreeRef.value?.setPin?.(true);
    localTreeRef.value?.expand?.();
  }
});

onMounted(() => {
  loadFiles('root');
  loadLocalFiles('local:root');
});
</script>

<template>
  <div class="external-device-manage">
    <!-- 统一头部栏 -->
    <DeviceInfoHeader
      :device="currentDevice"
      :show-copy-mode="showLocalPanel"
      @back="goBack"
      @toggle-copy-mode="toggleCopyMode"
    />

    <!-- 双栏文件管理器 -->
    <div class="dual-panel" :class="{ 'dual-panel--single': !showLocalPanel }">
      <!-- 左侧：外接设备 -->
      <div class="panel-wrapper panel-wrapper--device">
        <div class="panel-content">
          <FileTreePanel
            ref="deviceTreeRef"
            :tree-data="treeData"
            v-model:selected-keys="selectedKeys"
            v-model:expanded-keys="expandedKeys"
            :node-icon-resolver="nodeIconResolver"
            width="220px"
            @select="onTreeSelect"
          />
          <FileManagerPanel
            :files="files"
            :breadcrumb-path="breadcrumbPath"
            :loading="loading"
            v-model:search-text="searchText"
            v-model:view-mode="viewMode"
            :draggable="true"
            :drop-zone="true"
            drag-source-key="device-panel"
            drop-hint="释放以传输到本地存储"
            @breadcrumb-click="onBreadcrumbClick"
            @refresh="refreshFiles"
            @open-folder="handleOpenFolder"
            @rename="openRenameModal"
            @delete-file="handleDeleteFile"
            @drop="onDeviceDrop"
          />
        </div>
      </div>

      <!-- 中间拖拽分隔线 -->
      <div v-if="showLocalPanel" class="drag-divider">
        <div class="drag-divider__inner" />
      </div>

      <!-- 右侧：本地存储 -->
      <div v-show="showLocalPanel" class="panel-wrapper panel-wrapper--local">
        <div class="panel-content">
          <FileTreePanel
            ref="localTreeRef"
            :tree-data="localTreeData"
            v-model:selected-keys="localSelectedKeys"
            v-model:expanded-keys="localExpandedKeys"
            :node-icon-resolver="localNodeIconResolver"
            width="220px"
            @select="onLocalTreeSelect"
          />
          <FileManagerPanel
            :files="localFilesList"
            :breadcrumb-path="localBreadcrumbPath"
            :loading="localLoading"
            v-model:search-text="localSearchText"
            v-model:view-mode="localViewMode"
            :draggable="true"
            :drop-zone="true"
            drag-source-key="local-panel"
            drop-hint="释放以传输到外接设备"
            @breadcrumb-click="onLocalBreadcrumbClick"
            @refresh="refreshLocal"
            @open-folder="handleLocalOpenFolder"
            @rename="openRenameModal"
            @delete-file="handleDeleteLocalFile"
            @drop="onLocalDrop"
          />
        </div>
      </div>
    </div>

    <!-- 传输确认弹窗 -->
    <TransferConfirmModal
      v-model:visible="transferModalVisible"
      :file-name="transferFileName"
      :direction="transferDirection"
      :target-name="currentDevice?.name || '外接设备'"
      @confirm="confirmTransfer"
    />

    <!-- 重命名弹窗（复用全局组件） -->
    <RenameModal
      v-model:visible="renameModalVisible"
      :name="renameFileName"
      @confirm="handleRename"
    />
  </div>
</template>

<style scoped>
.external-device-manage {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f5f5f5;
  overflow: hidden;
}

/* 双栏布局 */
.dual-panel {
  display: flex;
  flex: 1;
  overflow: hidden;
  padding: 10px;
  gap: 4px;
}

.dual-panel--single .panel-wrapper--device {
  max-width: 100%;
}

.panel-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

.panel-content {
  display: flex;
  flex: 1;
  overflow: hidden;
  gap: 4px;
}

/* 中间拖拽分隔：短竖线 */
.drag-divider {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 4px;
  flex-shrink: 0;
  align-self: center;
}

.drag-divider__inner {
  width: 2px;
  height: 64px;
  border-radius: 2px;
  background: #d9d9d9;
  display: block;
}

/* 响应式 */
@media (max-width: 1024px) {
  .dual-panel {
    flex-direction: column;
  }

  .drag-divider {
    flex-direction: row;
    width: auto;
    height: 32px;
  }

  .panel-content {
    flex-direction: column;
  }

  .panel-content :deep(.file-tree-panel) {
    width: 100% !important;
    min-width: auto !important;
    max-height: 200px;
    border-radius: 0;
  }
}
</style>
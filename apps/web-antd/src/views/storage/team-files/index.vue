<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import {
  Button,
  Modal,
  Form,
  Input,
  message,
  Select,
  Checkbox,
  Radio as AntRadio,
  Dropdown,
  Menu,
} from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import {
  FileTreePanel,
  FileManagerPanel,
} from '#/components/FileExplorer';
import type { FileTreeNode, FileItem } from '#/components/FileExplorer';
import { buildBreadcrumbPath, findParentKeys, findNodeInTree } from '#/components/FileExplorer';

// ─── Mock 树数据 ───
const mockTree: FileTreeNode[] = [
  {
    key: 'tf-1',
    title: '文档',
    type: 'team-folder',
    path: '/share/team/文档',
    businessId: 'tf-1',
    children: [
      { key: 'tf-1/project', title: '项目文档', type: 'subfolder', path: '/share/team/文档/项目文档', businessId: 'tf-1', isLeaf: true },
      { key: 'tf-1/meeting', title: '会议纪要', type: 'subfolder', path: '/share/team/文档/会议纪要', businessId: 'tf-1', isLeaf: true },
    ],
  },
  {
    key: 'tf-2',
    title: '设计资源',
    type: 'team-folder',
    path: '/share/team/设计资源',
    businessId: 'tf-2',
    children: [
      { key: 'tf-2/ui', title: 'UI 设计', type: 'subfolder', path: '/share/team/设计资源/UI', businessId: 'tf-2', isLeaf: true },
      { key: 'tf-2/brand', title: '品牌素材', type: 'subfolder', path: '/share/team/设计资源/品牌', businessId: 'tf-2', isLeaf: true },
    ],
  },
  {
    key: 'tf-3',
    title: '财务资料',
    type: 'team-folder',
    path: '/share/team/财务资料',
    businessId: 'tf-3',
    children: [
      { key: 'tf-3/2024', title: '2024 年报', type: 'subfolder', path: '/share/team/财务资料/2024', businessId: 'tf-3', isLeaf: true },
      { key: 'tf-3/tax', title: '税务资料', type: 'subfolder', path: '/share/team/财务资料/税务', businessId: 'tf-3', isLeaf: true },
    ],
  },
];

// ─── Mock 文件数据 ───
const mockFiles: Record<string, FileItem[]> = {
  'tf-1': [
    { id: 'd1', name: '项目文档', type: 'folder', size: '--', modifyTime: '2024-05-06 10:30:00' },
    { id: 'd2', name: '会议纪要', type: 'folder', size: '--', modifyTime: '2024-05-05 14:20:00' },
    { id: 'f1', name: 'README.md', type: 'file', size: '12 KB', modifyTime: '2024-05-03 16:45:00', extension: 'md' },
    { id: 'f2', name: '需求文档.docx', type: 'file', size: '856 KB', modifyTime: '2024-04-20 10:10:00', extension: 'docx' },
    { id: 'f3', name: '流程图.png', type: 'file', size: '2.3 MB', modifyTime: '2024-04-15 09:30:00', extension: 'png' },
  ],
  'tf-1/project': [
    { id: 'p1', name: '产品需求', type: 'folder', size: '--', modifyTime: '2024-05-06 10:30:00' },
    { id: 'p2', name: '技术方案', type: 'folder', size: '--', modifyTime: '2024-05-05 14:20:00' },
    { id: 'pf1', name: 'PRD_v1.0.docx', type: 'file', size: '1.2 MB', modifyTime: '2024-05-01 10:00:00', extension: 'docx' },
    { id: 'pf2', name: 'API设计.json', type: 'file', size: '45 KB', modifyTime: '2024-04-28 14:00:00', extension: 'json' },
  ],
  'tf-1/meeting': [
    { id: 'm1', name: '周会-20240506.md', type: 'file', size: '8 KB', modifyTime: '2024-05-06 17:00:00', extension: 'md' },
    { id: 'm2', name: '月会-202404.docx', type: 'file', size: '120 KB', modifyTime: '2024-04-30 16:00:00', extension: 'docx' },
  ],
  'tf-2': [
    { id: 'd3', name: 'UI 设计', type: 'folder', size: '--', modifyTime: '2024-05-06 08:00:00' },
    { id: 'd4', name: '品牌素材', type: 'folder', size: '--', modifyTime: '2024-05-04 11:00:00' },
    { id: 'f4', name: 'logo.svg', type: 'file', size: '15 KB', modifyTime: '2024-05-01 14:00:00', extension: 'svg' },
    { id: 'f5', name: 'banner.psd', type: 'file', size: '45 MB', modifyTime: '2024-04-28 16:30:00', extension: 'psd' },
    { id: 'f6', name: '配色方案.xlsx', type: 'file', size: '120 KB', modifyTime: '2024-04-25 10:00:00', extension: 'xlsx' },
  ],
  'tf-2/ui': [
    { id: 'u1', name: '首页设计', type: 'folder', size: '--', modifyTime: '2024-05-06 08:00:00' },
    { id: 'u2', name: '设置页.fig', type: 'file', size: '12 MB', modifyTime: '2024-05-05 14:00:00', extension: 'fig' },
  ],
  'tf-2/brand': [
    { id: 'b1', name: '品牌手册.pdf', type: 'file', size: '25 MB', modifyTime: '2024-04-20 10:00:00', extension: 'pdf' },
    { id: 'b2', name: '字体包.zip', type: 'file', size: '120 MB', modifyTime: '2024-04-15 09:00:00', extension: 'zip' },
  ],
  'tf-3': [
    { id: 'd5', name: '2024 年报', type: 'folder', size: '--', modifyTime: '2024-05-05 09:00:00' },
    { id: 'd6', name: '税务资料', type: 'folder', size: '--', modifyTime: '2024-05-02 15:30:00' },
    { id: 'f7', name: '资产负债表.pdf', type: 'file', size: '1.2 MB', modifyTime: '2024-04-30 11:00:00', extension: 'pdf' },
    { id: 'f8', name: '利润表.xlsx', type: 'file', size: '340 KB', modifyTime: '2024-04-25 09:00:00', extension: 'xlsx' },
  ],
  'tf-3/2024': [
    { id: 'a1', name: 'Q1.xlsx', type: 'file', size: '200 KB', modifyTime: '2024-03-31 09:00:00', extension: 'xlsx' },
    { id: 'a2', name: 'Q2.xlsx', type: 'file', size: '220 KB', modifyTime: '2024-06-30 17:00:00', extension: 'xlsx' },
    { id: 'a3', name: '年报汇总.docx', type: 'file', size: '1.5 MB', modifyTime: '2024-12-31 10:00:00', extension: 'docx' },
  ],
  'tf-3/tax': [
    { id: 't1', name: '增值税.xlsx', type: 'file', size: '180 KB', modifyTime: '2024-04-15 09:00:00', extension: 'xlsx' },
    { id: 't2', name: '个税申报.pdf', type: 'file', size: '2.5 MB', modifyTime: '2024-04-10 10:00:00', extension: 'pdf' },
  ],
};

// ─── 状态 ───
const treeData = ref<FileTreeNode[]>(mockTree);
const selectedKeys = ref<string[]>(['tf-1']);
const expandedKeys = ref<string[]>(['tf-1']);
const loading = ref(false);
const searchText = ref('');
const viewMode = ref<'list' | 'grid'>('list');
const currentFiles = ref<FileItem[]>([]);
const selectedFileIds = ref<string[]>([]);

// 新建团队文件夹弹窗
const folderModalVisible = ref(false);
const folderModalTitle = ref('新建团队文件夹');
const isEdit = ref(false);
const editingFolderId = ref('');
const folderFormRef = ref();
const folderForm = ref({
  name: '',
  enableCapacityLimit: false,
  capacityLimit: undefined as number | undefined,
  capacityUnit: 'GB',
  allowShareProtocol: true,
  recyclePermission: 'admin' as 'admin' | 'all',
});

const capacityUnitOptions = [
  { label: 'GB', value: 'GB' },
  { label: 'TB', value: 'TB' },
];

// 重命名
const renameModalVisible = ref(false);
const renameFormRef = ref();
const renameForm = ref({ name: '' });
const editingFile = ref<FileItem | null>(null);

// ─── 计算属性 ───
const breadcrumbPath = computed(() => {
  const key = selectedKeys.value[0];
  if (!key) return [{ title: '团队文件', key: 'root' }];
  return buildBreadcrumbPath(treeData.value, key, '团队文件', 'root');
});

const overviewStats = computed(() => {
  const folderCount = treeData.value.length;
  let subFolderCount = 0;
  let fileCount = 0;
  Object.values(mockFiles).forEach((list) => {
    list.forEach((f) => {
      if (f.type === 'folder') subFolderCount++;
      else fileCount++;
    });
  });
  return {
    teamFolders: folderCount,
    subFolders: subFolderCount,
    files: fileCount,
  };
});

// ─── 方法 ───
function loadFiles(key: string) {
  loading.value = true;
  setTimeout(() => {
    currentFiles.value = mockFiles[key] || [];
    loading.value = false;
  }, 150);
}

function onSelectTree(key: string) {
  selectedKeys.value = [key];
  loadFiles(key);
}

function onBreadcrumbClick(item: { key: string }) {
  if (item.key === 'root') {
    selectedKeys.value = ['tf-1'];
    expandedKeys.value = ['tf-1'];
    loadFiles('tf-1');
    return;
  }
  selectedKeys.value = [item.key];
  const parentKeys = findParentKeys(treeData.value, item.key);
  expandedKeys.value = [...new Set([...expandedKeys.value, ...parentKeys])];
  loadFiles(item.key);
}

function handleOpenFolder(file: FileItem) {
  if (file.type !== 'folder') return;
  const currentKey = selectedKeys.value[0];
  const newKey = `${currentKey}/${file.name}`;
  const node = findNodeInTree(treeData.value, newKey);
  if (node) {
    selectedKeys.value = [newKey];
    expandedKeys.value = [...new Set([...expandedKeys.value, currentKey])];
    loadFiles(newKey);
  } else {
    message.info('该目录暂无数据');
  }
}

function openRenameModal(file: FileItem) {
  editingFile.value = file;
  renameForm.value = { name: file.name };
  renameModalVisible.value = true;
}

function handleRename() {
  renameFormRef.value?.validate().then(() => {
    if (editingFile.value) {
      editingFile.value.name = renameForm.value.name;
      message.success('重命名成功');
    }
    renameModalVisible.value = false;
  }).catch(() => {});
}

function handleDeleteFile(file: FileItem) {
  message.success(`"${file.name}" 已删除`);
  currentFiles.value = currentFiles.value.filter((f) => f.id !== file.id);
}

function refresh() {
  loadFiles(selectedKeys.value[0]);
  message.success('已刷新');
}

function openCreateModal() {
  isEdit.value = false;
  editingFolderId.value = '';
  folderModalTitle.value = '新建团队文件夹';
  folderForm.value = {
    name: '',
    enableCapacityLimit: false,
    capacityLimit: undefined,
    capacityUnit: 'GB',
    allowShareProtocol: true,
    recyclePermission: 'admin',
  };
  folderModalVisible.value = true;
}

function handleSaveFolder() {
  folderFormRef.value?.validate().then(() => {
    if (isEdit.value) {
      message.success(`团队文件夹 "${folderForm.value.name}" 已更新`);
    } else {
      message.success(`团队文件夹 "${folderForm.value.name}" 创建成功`);
    }
    folderModalVisible.value = false;
  }).catch(() => {});
}

// 树节点图标自定义
function nodeIconResolver(node: FileTreeNode) {
  if (node.type === 'team-folder') {
    return { icon: 'lucide:folder-heart', color: '#1677ff' };
  }
  if (node.isLeaf) {
    return { icon: 'lucide:folder-open', color: '#faad14' };
  }
  return { icon: 'lucide:folder', color: '#faad14' };
}

onMounted(() => {
  loadFiles('tf-1');
});
</script>

<template>
  <div class="file-manager-page">
    <!-- ═══════ 页面顶部概览 ═══════ -->
    <div class="page-header">
      <div class="page-header-left">
        <div class="page-icon-box">
          <IconifyIcon icon="lucide:users" style="font-size: 20px; color: #1677ff;" />
        </div>
        <div class="page-title-area">
          <h1 class="page-title">团队文件管理</h1>
          <p class="page-desc">在多个用户之间共享文件的团队文件夹</p>
        </div>
      </div>
      <div class="page-header-right">
        <div class="overview-card">
          <IconifyIcon icon="lucide:folder-heart" style="font-size: 16px; color: #1677ff;" />
          <div class="overview-info">
            <span class="overview-label">团队文件夹</span>
            <span class="overview-value">{{ overviewStats.teamFolders }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════ 操作栏 ═══════ -->
    <div class="team-toolbar">
      <div class="team-toolbar__left">
        <Button
          type="primary"
          size="small"
          class="team-toolbar__btn team-toolbar__btn--primary"
          @click="openCreateModal"
        >
          <IconifyIcon icon="lucide:folder-plus" style="font-size: 13px;" />
          新建
        </Button>
        <Button
          size="small"
          class="team-toolbar__btn"
          @click="message.info('用户管理功能开发中')"
        >
          <IconifyIcon icon="lucide:user-cog" style="font-size: 13px;" />
          用户管理
        </Button>
        <Dropdown placement="bottomRight">
          <Button size="small" class="team-toolbar__btn">
            <IconifyIcon icon="lucide:more-horizontal" style="font-size: 13px; display: inline-flex; align-items: center;" />
            <span style="display: inline-flex; align-items: center;">高级操作</span>
            <IconifyIcon icon="lucide:chevron-down" style="font-size: 12px; display: inline-flex; align-items: center;" />
          </Button>
          <template #overlay>
            <Menu>
              <Menu.Item key="batch-delete" danger @click="message.info('批量删除功能开发中')">
                <span class="menu-item-danger">
                  <IconifyIcon icon="lucide:trash-2" style="font-size: 13px; display: inline-flex; align-items: center;" />
                  <span style="display: inline-flex; align-items: center;">删除</span>
                </span>
              </Menu.Item>
            </Menu>
          </template>
        </Dropdown>
      </div>
      <div class="team-toolbar__right" />
    </div>

    <!-- ═══════ 主体区域 ═══════ -->
    <div class="fm-body">
      <!-- 左侧目录树 -->
      <FileTreePanel
        :tree-data="treeData"
        v-model:selected-keys="selectedKeys"
        v-model:expanded-keys="expandedKeys"
        :node-icon-resolver="nodeIconResolver"
        @select="onSelectTree"
      />

      <!-- 右侧文件区域 -->
      <FileManagerPanel
        :files="currentFiles"
        :breadcrumb-path="breadcrumbPath"
        :loading="loading"
        v-model:search-text="searchText"
        v-model:view-mode="viewMode"
        v-model:selected-file-ids="selectedFileIds"
        @breadcrumb-click="onBreadcrumbClick"
        @refresh="refresh"
        @open-folder="handleOpenFolder"
        @rename="openRenameModal"
        @delete-file="handleDeleteFile"
      />
    </div>

    <!-- 新建/编辑团队文件夹弹窗 -->
    <Modal
      v-model:open="folderModalVisible"
      :title="folderModalTitle"
      width="520px"
      @ok="handleSaveFolder"
      class="folder-modal"
    >
      <Form
        ref="folderFormRef"
        :model="folderForm"
        layout="vertical"
        :rules="{
          name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
        }"
      >
        <Form.Item label="名称" name="name">
          <Input v-model:value="folderForm.name" placeholder="请输入名称">
            <template #prefix>
              <IconifyIcon icon="lucide:folder-heart" style="font-size: 14px; color: #bfbfbf;" />
            </template>
          </Input>
        </Form.Item>

        <Form.Item>
          <Checkbox v-model:checked="folderForm.enableCapacityLimit">
            <span class="checkbox-label">
              <IconifyIcon icon="lucide:ruler" style="font-size: 12px;" />
              限制容量上限
            </span>
          </Checkbox>
          <div v-if="folderForm.enableCapacityLimit" class="capacity-input-row">
            <Input
              v-model:value="folderForm.capacityLimit"
              type="number"
              placeholder="不限制"
              class="capacity-input"
            >
              <template #prefix>
                <IconifyIcon icon="lucide:hard-drive" style="font-size: 12px; color: #bfbfbf;" />
              </template>
            </Input>
            <Select
              v-model:value="folderForm.capacityUnit"
              :options="capacityUnitOptions"
              class="capacity-unit-select"
            />
          </div>
        </Form.Item>

        <Form.Item>
          <Checkbox v-model:checked="folderForm.allowShareProtocol">
            <span class="checkbox-label">
              <IconifyIcon icon="lucide:share-2" style="font-size: 12px;" />
              允许通过文件共享协议挂载到其他设备上
            </span>
          </Checkbox>
        </Form.Item>

        <Form.Item label="回收站权限">
          <AntRadio.Group v-model:value="folderForm.recyclePermission">
            <AntRadio value="admin">
              <span class="radio-label">
                <IconifyIcon icon="lucide:shield" style="font-size: 12px;" />
                仅管理员
              </span>
            </AntRadio>
            <AntRadio value="all">
              <span class="radio-label">
                <IconifyIcon icon="lucide:users" style="font-size: 12px;" />
                团队文件夹所有成员
              </span>
            </AntRadio>
          </AntRadio.Group>
        </Form.Item>
      </Form>
    </Modal>

    <!-- 重命名弹窗 -->
    <Modal
      v-model:open="renameModalVisible"
      title="重命名"
      width="400px"
      @ok="handleRename"
    >
      <Form
        ref="renameFormRef"
        :model="renameForm"
        layout="vertical"
        :rules="{ name: [{ required: true, message: '请输入名称', trigger: 'blur' }] }"
      >
        <Form.Item label="新名称" name="name">
          <Input v-model:value="renameForm.name" placeholder="请输入新名称" />
        </Form.Item>
      </Form>
    </Modal>
  </div>
</template>

<style scoped>
.file-manager-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f5f5f5;
}

/* ═══ 页面顶部概览 ═══ */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #fff;
  gap: 16px;
  flex-shrink: 0;
}

.page-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #e6f4ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.page-title {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  margin: 0;
  line-height: 1.4;
}

.page-desc {
  font-size: 12px;
  color: #8c8c8c;
  margin: 2px 0 0;
}

.page-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.overview-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: #f5f5f5;
  border-radius: 8px;
  min-width: 90px;
}

.overview-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.overview-label {
  font-size: 11px;
  color: #8c8c8c;
}

.overview-value {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.page-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-left: 4px;
}

/* ═══ 主体区域 ═══ */
.fm-body {
  display: flex;
  flex: 1;
  overflow: hidden;
  padding: 12px;
  gap: 12px;
}

/* ═══ 弹窗样式 ═══ */
.folder-modal :deep(.ant-modal-title) {
  display: flex;
  align-items: center;
  gap: 8px;
}

.capacity-input-row {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.capacity-input {
  flex: 1;
}

.capacity-unit-select {
  width: 100px;
}

.checkbox-label,
.radio-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* ═══ 操作栏 ═══ */
.team-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  background: #fff;
  flex-shrink: 0;
  gap: 16px;
}

.team-toolbar__left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.team-toolbar__right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.team-toolbar__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.team-toolbar__btn--primary {
  font-weight: 500;
}

.menu-item-danger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #ff4d4f;
}

/* 修复 Dropdown Menu danger 项 hover 颜色 */
:global(.ant-dropdown-menu-item-danger:hover) {
  color: #ff4d4f !important;
  background: #fff1f0 !important;
}

:global(.ant-dropdown-menu-item-danger:hover .ant-dropdown-menu-title-content) {
  color: #ff4d4f !important;
}

:global(.ant-dropdown-menu-item-danger:hover .ant-dropdown-menu-item-icon) {
  color: #ff4d4f !important;
}

/* ═══ 响应式 ═══ */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .team-toolbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>

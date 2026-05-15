<script lang="ts" setup>
import { ref, computed } from 'vue';
import { Button, Card, Input, message } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import { ShareConfigModal } from '#/components/ShareConfigModal';
import type { ShareFormData } from '#/components/ShareConfigModal';
import { findNodeInTree } from '#/components/FileExplorer';

import ShareOverview from './components/ShareOverview.vue';
import ShareDirTable from './components/ShareDirTable.vue';
import EditUsersModal from './components/EditUsersModal.vue';
import LinkManageModal from './components/LinkManageModal.vue';
import type { SharedDir, ShareUser, LinkFormData } from './types';
import {
  myFilesTreeData,
  initialShareDirs,
  userOptions,
  buildPathFromTree,
} from './components/mockData';

/* ═══════ 共享数据 ═══════ */
const dirSearchText = ref('');
const shareDirs = ref<SharedDir[]>(initialShareDirs);

/* ═══════ 计算属性 ═══════ */
const filteredDirs = computed(() => {
  let result = shareDirs.value;
  if (dirSearchText.value) {
    const kw = dirSearchText.value.toLowerCase();
    result = result.filter(
      (d) =>
        d.name.toLowerCase().includes(kw) ||
        d.sourcePath.toLowerCase().includes(kw) ||
        d.shareUsers.some((u) => u.user.toLowerCase().includes(kw)) ||
        (d.linkUrl && d.linkUrl.toLowerCase().includes(kw)),
    );
  }
  return result;
});

const overviewStats = computed(() => {
  const activeDirs = shareDirs.value.filter((d) => d.status === 'active').length;
  const activeLinks = shareDirs.value.filter((d) => d.linkEnabled && d.linkStatus === 'active').length;
  const userSet = new Set<string>();
  shareDirs.value.forEach((d) => d.shareUsers.forEach((u) => userSet.add(u.user)));
  return {
    activeDirs,
    activeLinks,
    userCount: userSet.size,
    totalDirs: shareDirs.value.length,
  };
});

/* ═══════ 创建分享 ═══════ */
const createModalVisible = ref(false);
const createForm = ref({ sourceTreeKey: '' });
const createTreeExpandedKeys = ref<string[]>(['space-1']);
const createTreeSelectedKeys = ref<string[]>([]);

function openCreateModal() {
  createForm.value = { sourceTreeKey: '' };
  createTreeSelectedKeys.value = [];
  createTreeExpandedKeys.value = ['space-1'];
  createModalVisible.value = true;
}

function handleCreateFromModal(data: ShareFormData) {
  if (!data.sourceTreeKey) {
    message.warning('请从目录树中选择要共享的文件夹');
    return;
  }
  const node = findNodeInTree(myFilesTreeData, data.sourceTreeKey);
  const displayPath = node
    ? buildPathFromTree(myFilesTreeData, data.sourceTreeKey)
    : data.sourceTreeKey;
  const shareName = node ? (node.title as string) : data.sourceTreeKey;

  const expireText = data.expireType === 'forever'
    ? '永久'
    : data.expireType === 'preset'
      ? `${data.expirePreset}天后`
      : data.expireCustomDate
        ? new Date(data.expireCustomDate as any).toLocaleDateString('zh-CN')
        : '永久';

  const newDir: SharedDir = {
    id: `sd-${Date.now()}`,
    name: shareName,
    sourcePath: displayPath,
    shareUsers: data.shareUsers,
    shareTime: new Date().toLocaleString(),
    expireTime: expireText,
    status: 'active',
    linkEnabled: data.linkEnabled,
    linkUrl: data.linkEnabled
      ? `https://d.vivibit.com/s/${Date.now().toString(36)}`
      : '',
    linkAccessCount: 0,
    linkStatus: data.linkEnabled ? 'active' : 'expired',
  };
  shareDirs.value.push(newDir);
  message.success('分享创建成功');
  createModalVisible.value = false;
}


/* ═══════ 编辑共享用户 ═══════ */
const editUsersModalVisible = ref(false);
const editingDir = ref<SharedDir | null>(null);
const editUsersForm = ref<{ shareUsers: ShareUser[] }>({ shareUsers: [] });

function openEditUsersModal(dir: SharedDir) {
  editingDir.value = dir;
  editUsersForm.value = { shareUsers: [...dir.shareUsers] };
  editUsersModalVisible.value = true;
}

function handleSaveUsers(users: ShareUser[]) {
  if (editingDir.value) {
    editingDir.value.shareUsers = users;
    message.success('共享用户已更新');
  }
  editUsersModalVisible.value = false;
}

/* ═══════ 外链管理 ═══════ */
const linkModalVisible = ref(false);
const linkForm = ref<LinkFormData>({
  enabled: false,
  expireType: 'preset',
  expirePreset: '7',
  expireCustomDate: '',
  password: '',
});

function openLinkModal(dir: SharedDir) {
  editingDir.value = dir;
  linkForm.value = {
    enabled: dir.linkEnabled,
    expireType: 'preset',
    expirePreset: '7',
    expireCustomDate: '',
    password: dir.linkPassword || '',
  };
  linkModalVisible.value = true;
}

function handleSaveLink(data: LinkFormData) {
  if (editingDir.value) {
    editingDir.value.linkEnabled = data.enabled;
    editingDir.value.linkPassword = data.password || undefined;
    if (data.enabled) {
      editingDir.value.linkStatus = 'active';
      if (!editingDir.value.linkUrl) {
        editingDir.value.linkUrl = `https://d.vivibit.com/s/${Date.now().toString(36)}`;
      }
      message.success('外链设置已保存');
    } else {
      editingDir.value.linkStatus = 'expired';
      message.success('外链已关闭');
    }
  }
  linkModalVisible.value = false;
}

function handleCopyLink(url: string) {
  navigator.clipboard.writeText(url).then(() => {
    message.success('链接已复制到剪贴板');
  });
}

/* ═══════ 删除 ═══════ */
function handleDeleteDir(dir: SharedDir) {
  shareDirs.value = shareDirs.value.filter((d) => d.id !== dir.id);
  message.success(`"${dir.name}" 已删除`);
}
</script>

<template>
  <div class="shared-files-page">
    <!-- 页面顶部概览 -->
    <div class="page-header">
      <div class="page-header-left">
        <div class="page-icon-box">
          <IconifyIcon icon="lucide:link" style="font-size: 20px; color: #722ed1;" />
        </div>
        <div class="page-title-area">
          <h1 class="page-title">我的分享</h1>
          <p class="page-desc">管理当前用户对外分享的文件夹，可配置是否开启外链</p>
        </div>
      </div>
      <ShareOverview
        :active-dirs="overviewStats.activeDirs"
        :active-links="overviewStats.activeLinks"
        :user-count="overviewStats.userCount"
        :total-dirs="overviewStats.totalDirs"
      />
    </div>

    <!-- 动作栏 -->
    <div class="action-bar">
      <div class="action-bar-left">
        <Button type="primary" class="create-btn" @click="openCreateModal">
          <IconifyIcon icon="lucide:folder-plus" style="font-size: 13px;" />
          创建分享
        </Button>
      </div>
      <div class="action-bar-right">
        <Input
          v-model:value="dirSearchText"
          placeholder="搜索共享名称、路径或用户"
          class="search-input"
          allow-clear
        >
          <template #prefix>
            <IconifyIcon icon="lucide:search" style="font-size: 14px; color: #bfbfbf;" />
          </template>
        </Input>
      </div>
    </div>

    <!-- 表格 -->
    <div class="page-body">
      <Card class="shared-card" :bordered="false">
        <ShareDirTable
          :dirs="filteredDirs"
          @edit-users="openEditUsersModal"
          @link-manage="openLinkModal"
          @delete-dir="handleDeleteDir"
          @copy-link="handleCopyLink"
        />
      </Card>
    </div>

    <!-- 创建分享弹窗 -->
    <ShareConfigModal
      v-model:visible="createModalVisible"
      title="创建分享"
      :show-tree="true"
      :tree-data="myFilesTreeData"
      :tree-expanded-keys="createTreeExpandedKeys"
      :tree-selected-key="createForm.sourceTreeKey"
      confirm-text="创建"
      :user-options="userOptions"
      @update:tree-expanded-keys="createTreeExpandedKeys = $event"
      @update:tree-selected-key="(k: string) => { createForm.sourceTreeKey = k; createTreeSelectedKeys = k ? [k] : []; }"
      @ok="handleCreateFromModal"
    />

    <!-- 编辑共享用户弹窗 -->
    <EditUsersModal
      v-model:visible="editUsersModalVisible"
      :dir="editingDir"
      :user-options="userOptions"
      v-model:form="editUsersForm"
      @save="handleSaveUsers"
    />

    <!-- 外链管理弹窗 -->
    <LinkManageModal
      v-model:visible="linkModalVisible"
      :dir="editingDir"
      v-model:form="linkForm"
      @save="handleSaveLink"
      @copy-link="handleCopyLink"
    />
  </div>
</template>

<style scoped>
.shared-files-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
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
  background: #f9f0ff;
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

.action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  gap: 12px;
  flex-shrink: 0;
}

.action-bar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.action-bar-right {
  display: flex;
  align-items: center;
}

.create-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.search-input {
  width: 280px;
}

.page-body {
  flex: 1;
  overflow: auto;
}

.shared-card {
  background: #fff;
  border: none;
  box-shadow: none;
}

.shared-card :deep(.ant-card-body) {
  padding: 0;
}

/* ═══ 响应式 ═══ */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .action-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .search-input {
    width: 200px;
  }
}
</style>

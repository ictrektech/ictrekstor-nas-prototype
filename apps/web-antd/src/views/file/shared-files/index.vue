<script lang="ts" setup>
import { ref, computed } from 'vue';
import {
  Button,
  Card,
  Input,
  Table,
  Modal,
  Form,
  Select,
  Tag,
  message,
  Popconfirm,
  Empty,
  Radio,
  Tooltip,
  Badge,
  Switch,
  Divider,
  Checkbox,
  Tree,
  DatePicker,
} from 'ant-design-vue';
import type { FileTreeNode } from '#/components/FileExplorer';
import { findNodeInTree } from '#/components/FileExplorer';
import { IconifyIcon } from '@vben/icons';
import { ShareConfigModal } from '#/components/ShareConfigModal';
import type { ShareFormData } from '#/components/ShareConfigModal';

interface ShareUser {
  user: string;
  permission: 'readonly' | 'readwrite';
}

interface SharedDir {
  id: string;
  name: string;
  sourcePath: string;
  shareUsers: ShareUser[];
  shareTime: string;
  expireTime: string;
  status: 'active' | 'expired';
  // ── 外链相关 ──
  linkEnabled: boolean;
  linkUrl: string;
  linkAccessCount: number;
  linkStatus: 'active' | 'expired';
  linkPassword?: string;
}

/* ═══════ 共享文件夹数据 ═══════ */
const dirSearchText = ref('');
const shareDirs = ref<SharedDir[]>([
  {
    id: 'sd-1',
    name: 'test',
    sourcePath: '存储空间1 / 我的文件 / test',
    shareUsers: [
      { user: 'zhangsan', permission: 'readonly' },
      { user: 'lisi', permission: 'readwrite' },
    ],
    shareTime: '2024-05-06 10:30:00',
    expireTime: '2024-06-06 10:30:00',
    status: 'active',
    linkEnabled: true,
    linkUrl: 'https://d.vivibit.com/s/abc123',
    linkAccessCount: 128,
    linkStatus: 'active',
  },
  {
    id: 'sd-2',
    name: 'test4',
    sourcePath: '存储空间1 / 我的文件 / test4',
    shareUsers: [{ user: 'wangwu', permission: 'readonly' }],
    shareTime: '2024-05-05 14:20:00',
    expireTime: '永久',
    status: 'active',
    linkEnabled: false,
    linkUrl: '',
    linkAccessCount: 0,
    linkStatus: 'expired',
  },
  {
    id: 'sd-3',
    name: '项目资料',
    sourcePath: '存储空间2 / 团队文件 / 项目资料',
    shareUsers: [
      { user: 'zhangsan', permission: 'readwrite' },
      { user: 'lisi', permission: 'readonly' },
      { user: 'wangwu', permission: 'readonly' },
    ],
    shareTime: '2024-04-20 09:15:00',
    expireTime: '2024-05-20 09:15:00',
    status: 'expired',
    linkEnabled: true,
    linkUrl: 'https://d.vivibit.com/s/ghi789',
    linkAccessCount: 32,
    linkStatus: 'expired',
  },
  {
    id: 'sd-4',
    name: '设计资源',
    sourcePath: '存储空间1 / 图片 / 设计资源',
    shareUsers: [{ user: 'admin', permission: 'readwrite' }],
    shareTime: '2024-05-08 11:00:00',
    expireTime: '2024-08-08 11:00:00',
    status: 'active',
    linkEnabled: true,
    linkUrl: 'https://d.vivibit.com/s/def456',
    linkAccessCount: 56,
    linkStatus: 'active',
  },
  {
    id: 'sd-5',
    name: 'Q2 报表',
    sourcePath: '存储空间2 / 备份 / Q2 报表',
    shareUsers: [
      { user: 'zhangsan', permission: 'readonly' },
      { user: 'wangwu', permission: 'readwrite' },
    ],
    shareTime: '2024-05-01 09:00:00',
    expireTime: '永久',
    status: 'active',
    linkEnabled: true,
    linkUrl: 'https://d.vivibit.com/s/jkl012',
    linkAccessCount: 89,
    linkStatus: 'active',
  },
]);

/* ═══════ 目录树数据（复用 my-files 的树结构）═══════ */
const myFilesTreeData: FileTreeNode[] = [
  {
    key: 'space-1',
    title: '存储空间1',
    type: 'space',
    children: [
      {
        key: 'space-1/docs',
        title: '文档',
        type: 'folder',
        children: [
          {
            key: 'space-1/docs/2024',
            title: '2024年度',
            type: 'folder',
            children: [
              { key: 'space-1/docs/2024/q1', title: '第一季度', type: 'folder', isLeaf: true },
              { key: 'space-1/docs/2024/q2', title: '第二季度', type: 'folder', isLeaf: true },
            ],
          },
          { key: 'space-1/docs/archive', title: '历史归档', type: 'folder', isLeaf: true },
        ],
      },
      { key: 'space-1/images', title: '图片', type: 'folder', isLeaf: true },
      { key: 'space-1/videos', title: '视频', type: 'folder', isLeaf: true },
    ],
  },
  {
    key: 'space-2',
    title: '存储空间2',
    type: 'space',
    children: [
      { key: 'space-2/backup', title: '备份', type: 'folder', isLeaf: true },
      { key: 'space-2/download', title: '下载', type: 'folder', isLeaf: true },
    ],
  },
];

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

/* ═══════ 弹窗状态 ═══════ */
const createModalVisible = ref(false);
const createForm = ref({
  sourceTreeKey: '',
});
const createTreeExpandedKeys = ref<string[]>(['space-1']);
const createTreeSelectedKeys = ref<string[]>([]);

const editUsersModalVisible = ref(false);
const editUsersFormRef = ref();
const editingDir = ref<SharedDir | null>(null);
const editUsersForm = ref({
  shareUsers: [] as ShareUser[],
});

const linkModalVisible = ref(false);
const linkFormRef = ref();
const linkForm = ref({
  enabled: false,
  expireType: 'preset' as 'preset' | 'custom' | 'forever',
  expirePreset: '7',
  expireCustomDate: '',
  password: '',
});

const userOptions = [
  { label: 'zhangsan', value: 'zhangsan' },
  { label: 'lisi', value: 'lisi' },
  { label: 'wangwu', value: 'wangwu' },
  { label: 'admin', value: 'admin' },
];

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
  const expiredDirs = shareDirs.value.filter((d) => d.status === 'expired').length;
  const activeLinks = shareDirs.value.filter((d) => d.linkEnabled && d.linkStatus === 'active').length;
  const expiredLinks = shareDirs.value.filter((d) => d.linkEnabled && d.linkStatus === 'expired').length;
  const userSet = new Set<string>();
  shareDirs.value.forEach((d) => d.shareUsers.forEach((u) => userSet.add(u.user)));
  return {
    activeDirs,
    expiredDirs,
    activeLinks,
    expiredLinks,
    userCount: userSet.size,
    totalDirs: shareDirs.value.length,
    totalLinks: shareDirs.value.filter((d) => d.linkEnabled).length,
  };
});

/* ═══════ 表格列定义 ═══════ */
const dirColumns = [
  { title: '共享名称', dataIndex: 'name', key: 'name', width: 150 },
  { title: '原文件夹', dataIndex: 'sourcePath', key: 'sourcePath', ellipsis: true },
  { title: '共享用户', key: 'shareUsers', width: 200 },
  { title: '创建时间', key: 'shareTime', width: 110 },
  { title: '有效期', dataIndex: 'expireTime', key: 'expireTime', width: 110 },
  { title: '状态', key: 'status', width: 90, align: 'center' as const },
  { title: '外链', key: 'link', width: 100, align: 'center' as const },
  { title: '操作', key: 'action', width: 140, align: 'center' as const },
];

/* ═══════ 方法 ═══════ */
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

  // 以选中文件夹名称作为共享名称
  const shareName = node ? node.title : data.sourceTreeKey;

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

function openEditUsersModal(dir: SharedDir) {
  editingDir.value = dir;
  editUsersForm.value = {
    shareUsers: [...dir.shareUsers],
  };
  editUsersModalVisible.value = true;
}

/** 编辑弹窗：添加共享用户 */
function editAddShareUser(userValue: string) {
  if (!editUsersForm.value.shareUsers.find((u) => u.user === userValue)) {
    editUsersForm.value.shareUsers.push({ user: userValue, permission: 'readonly' });
  }
}

/** 编辑弹窗：移除共享用户 */
function editRemoveShareUser(userValue: string) {
  editUsersForm.value.shareUsers = editUsersForm.value.shareUsers.filter((u) => u.user !== userValue);
}

/** 编辑弹窗：切换用户权限 */
function editToggleUserPermission(userValue: string) {
  const user = editUsersForm.value.shareUsers.find((u) => u.user === userValue);
  if (user) {
    user.permission = user.permission === 'readonly' ? 'readwrite' : 'readonly';
  }
}

/** 编辑弹窗：已选用户 keys */
const editSelectedUserKeys = computed(() => editUsersForm.value.shareUsers.map((u) => u.user));

function handleSaveUsers() {
  if (editingDir.value) {
    editingDir.value.shareUsers = [...editUsersForm.value.shareUsers];
    message.success('共享用户已更新');
  }
  editUsersModalVisible.value = false;
}

function handleDeleteDir(dir: SharedDir) {
  shareDirs.value = shareDirs.value.filter((d) => d.id !== dir.id);
  message.success(`"${dir.name}" 已删除`);
}

function handleCopyLink(url: string) {
  navigator.clipboard.writeText(url).then(() => {
    message.success('链接已复制到剪贴板');
  });
}

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

function handleSaveLink() {
  if (editingDir.value) {
    editingDir.value.linkEnabled = linkForm.value.enabled;
    editingDir.value.linkPassword = linkForm.value.password || undefined;
    if (linkForm.value.enabled) {
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

function handleDeleteLink(dir: SharedDir) {
  dir.linkEnabled = false;
  dir.linkStatus = 'expired';
  message.success(`外链已取消`);
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

/* ═══════ 友好时间格式 ═══════ */
function formatFriendlyTime(timeStr: string): string {
  const now = new Date();
  const time = new Date(timeStr);
  const diffMs = now.getTime() - time.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) return '刚刚';
  if (diffMin < 60) return `${diffMin}分钟前`;
  if (diffHour < 24) return `${diffHour}小时前`;
  if (diffDay < 30) return `${diffDay}天前`;
  if (diffMonth < 12) return `${diffMonth}个月前`;
  return `${diffYear}年前`;
}

function formatExpireTime(expireTime: string, status: string): { text: string; color: string } {
  if (expireTime === '永久') {
    return { text: '永久', color: '#8c8c8c' };
  }
  const now = new Date();
  const time = new Date(expireTime);
  const diffMs = time.getTime() - now.getTime();
  const diffDay = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60 * 24));
  const isExpired = diffMs < 0;

  if (isExpired) {
    return { text: `已过期${diffDay}天`, color: '#ff4d4f' };
  }
  if (diffDay === 0) {
    return { text: '今天过期', color: '#faad14' };
  }
  if (diffDay <= 3) {
    return { text: `还剩${diffDay}天`, color: '#faad14' };
  }
  return { text: `还剩${diffDay}天`, color: '#8c8c8c' };
}
</script>

<template>
  <div class="shared-files-page">
    <!-- ═══════ 页面顶部概览 ═══════ -->
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
      <div class="page-header-right">
        <div class="overview-card">
          <div class="overview-icon-wrap" style="background: #f6ffed;">
            <IconifyIcon icon="lucide:folder-heart" style="font-size: 16px; color: #52c41a;" />
          </div>
          <div class="overview-info">
            <span class="overview-label">有效共享</span>
            <span class="overview-value">{{ overviewStats.activeDirs }}</span>
          </div>
        </div>
        <div class="overview-card">
          <div class="overview-icon-wrap" style="background: #e6f7ff;">
            <IconifyIcon icon="lucide:link" style="font-size: 16px; color: #1677ff;" />
          </div>
          <div class="overview-info">
            <span class="overview-label">有效外链</span>
            <span class="overview-value">{{ overviewStats.activeLinks }}</span>
          </div>
        </div>
        <div class="overview-card">
          <div class="overview-icon-wrap" style="background: #f9f0ff;">
            <IconifyIcon icon="lucide:users" style="font-size: 16px; color: #722ed1;" />
          </div>
          <div class="overview-info">
            <span class="overview-label">共享用户</span>
            <span class="overview-value">{{ overviewStats.userCount }}</span>
          </div>
        </div>
        <div class="overview-card">
          <div class="overview-icon-wrap" style="background: #fff7e6;">
            <IconifyIcon icon="lucide:folder-open" style="font-size: 16px; color: #fa8c16;" />
          </div>
          <div class="overview-info">
            <span class="overview-label">共享总数</span>
            <span class="overview-value">{{ overviewStats.totalDirs }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════ 第二行动作栏 ═══════ -->
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

    <!-- ═══════ 主体内容 ═══════ -->
    <div class="page-body">
      <Card class="shared-card" :bordered="false">
        <!-- 表格卡片 -->
        <div class="table-card">
          <Table
            :columns="dirColumns"
            :data-source="filteredDirs"
            row-key="id"
            size="small"
            :pagination="false"
            class="shared-table"
          >
            <template #bodyCell="{ column, record }">
              <!-- 共享名称 -->
              <template v-if="column.key === 'name'">
                <div class="name-cell">
                  <div
                    class="name-icon-box"
                    :class="{ 'name-icon-box--expired': record.status === 'expired' }"
                  >
                    <IconifyIcon icon="lucide:folder-open" style="font-size: 16px;" />
                  </div>
                  <div class="name-text-area">
                    <div class="name-title">{{ record.name }}</div>
                  </div>
                </div>
              </template>

              <!-- 创建时间 -->
              <template v-if="column.key === 'shareTime'">
                <Tooltip :title="record.shareTime">
                  <span class="time-text">{{ formatFriendlyTime(record.shareTime) }}</span>
                </Tooltip>
              </template>

              <!-- 原文件夹 -->
              <template v-if="column.key === 'sourcePath'">
                <div class="path-cell">
                  <IconifyIcon icon="lucide:folder" style="font-size: 12px; color: #bfbfbf; flex-shrink: 0;" />
                  <span class="path-text" :title="record.sourcePath">{{ record.sourcePath }}</span>
                </div>
              </template>

              <!-- 共享用户（带权限标识） -->
              <template v-if="column.key === 'shareUsers'">
                <div class="user-cell">
                  <Tooltip
                    v-for="su in record.shareUsers"
                    :key="su.user"
                    :title="`${su.user} — ${su.permission === 'readonly' ? '只读' : '读写'}`"
                  >
                    <div class="user-perm-tag">
                      <div
                        class="user-avatar"
                        :style="{ backgroundColor: getUserColor(su.user) + '18', color: getUserColor(su.user), borderColor: getUserColor(su.user) + '40' }"
                      >
                        {{ getUserInitial(su.user) }}
                      </div>
                      <span
                        class="perm-dot"
                        :class="su.permission === 'readonly' ? 'perm-dot--ro' : 'perm-dot--rw'"
                      />
                    </div>
                  </Tooltip>
                  <span v-if="record.shareUsers.length === 0" class="no-users">无</span>
                </div>
              </template>

              <!-- 有效期 -->
              <template v-if="column.key === 'expireTime'">
                <Tooltip :title="record.expireTime">
                  <span :style="{ color: formatExpireTime(record.expireTime, record.status).color, fontSize: '12px' }">
                    {{ formatExpireTime(record.expireTime, record.status).text }}
                  </span>
                </Tooltip>
              </template>

              <!-- 状态 -->
              <template v-if="column.key === 'status'">
                <div class="status-cell">
                  <span
                    class="status-dot"
                    :style="{ background: record.status === 'active' ? '#52c41a' : '#8c8c8c' }"
                  />
                  <span class="status-text" :class="{ 'status-text--expired': record.status === 'expired' }">
                    {{ record.status === 'active' ? '有效' : '已过期' }}
                  </span>
                </div>
              </template>

              <!-- 外链 -->
              <template v-if="column.key === 'link'">
                <div class="link-cell">
                  <template v-if="record.linkEnabled && record.linkStatus === 'active'">
                    <Tooltip title="点击复制外链">
                      <Tag
                        color="blue"
                        size="small"
                        class="link-tag link-tag--clickable"
                        @click="handleCopyLink(record.linkUrl)"
                      >
                        <IconifyIcon icon="lucide:link" style="font-size: 11px; margin-right: 2px;" />
                        已开启
                      </Tag>
                    </Tooltip>
                  </template>
                  <template v-else-if="record.linkEnabled && record.linkStatus === 'expired'">
                    <Tag
                      color="default"
                      size="small"
                      class="link-tag"
                    >
                      <IconifyIcon icon="lucide:link-break" style="font-size: 11px; margin-right: 2px;" />
                      已过期
                    </Tag>
                  </template>
                  <span v-else class="link-none">
                    <IconifyIcon icon="lucide:link-off" style="font-size: 11px; margin-right: 2px;" />
                    未开启
                  </span>
                </div>
              </template>

              <!-- 操作 -->
              <template v-if="column.key === 'action'">
                <div class="action-cell">
                  <Tooltip title="管理共享用户">
                    <Button
                      size="small"
                      type="text"
                      class="action-icon-btn"
                      @click="openEditUsersModal(record)"
                    >
                      <IconifyIcon icon="lucide:users" style="font-size: 14px; color: #595959;" />
                    </Button>
                  </Tooltip>
                  <Tooltip title="外链管理">
                    <Button
                      size="small"
                      type="text"
                      class="action-icon-btn"
                      @click="openLinkModal(record)"
                    >
                      <IconifyIcon icon="lucide:link" style="font-size: 14px; color: #595959;" />
                    </Button>
                  </Tooltip>
                  <Tooltip title="删除共享">
                    <Popconfirm
                      title="确认删除"
                      description="删除后该共享将失效，是否继续？"
                      ok-text="确认"
                      cancel-text="取消"
                      @confirm="handleDeleteDir(record)"
                    >
                      <Button size="small" type="text" danger class="action-icon-btn">
                        <IconifyIcon icon="lucide:trash-2" style="font-size: 14px; color: #ff4d4f;" />
                      </Button>
                    </Popconfirm>
                  </Tooltip>
                </div>
              </template>
            </template>

            <template #emptyText>
              <Empty description="暂无共享目录" class="table-empty">
                <template #image>
                  <div class="empty-image">
                    <IconifyIcon icon="lucide:folder-symlink" style="font-size: 48px; color: #d9d9d9;" />
                  </div>
                </template>
              </Empty>
            </template>
          </Table>
        </div>
      </Card>
    </div>

    <!-- ═══════ 创建分享弹窗（使用复用组件）═══════ -->
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
      @update:tree-selected-key="(k) => { createForm.sourceTreeKey = k; createTreeSelectedKeys = k ? [k] : []; }"
      @ok="handleCreateFromModal"
    />

    <!-- ═══════ 编辑共享用户弹窗 ═══════ -->
    <Modal
      v-model:open="editUsersModalVisible"
      :title="`共享用户 - ${editingDir?.name}`"
      width="520px"
      ok-text="保存"
      cancel-text="取消"
      @ok="handleSaveUsers"
    >
      <Form ref="editUsersFormRef" :model="editUsersForm" layout="vertical">
        <Form.Item label="共享用户">
          <Select
            :value="editSelectedUserKeys"
            mode="multiple"
            placeholder="选择用户并为其设置权限"
            :options="userOptions"
            @change="(vals: string[]) => {
              editUsersForm.shareUsers = editUsersForm.shareUsers.filter(u => vals.includes(u.user));
              vals.forEach(v => editAddShareUser(v));
            }"
          />
          <!-- 已选用户权限列表 -->
          <div v-if="editUsersForm.shareUsers.length > 0" class="user-perm-list">
            <div
              v-for="su in editUsersForm.shareUsers"
              :key="su.user"
              class="user-perm-row"
            >
              <div class="user-perm-info">
                <div
                  class="user-avatar-small"
                  :style="{ backgroundColor: getUserColor(su.user) + '18', color: getUserColor(su.user), borderColor: getUserColor(su.user) + '40' }"
                >
                  {{ getUserInitial(su.user) }}
                </div>
                <span class="user-perm-name">{{ su.user }}</span>
              </div>
              <Radio.Group
                :value="su.permission"
                size="small"
                @change="(e: any) => {
                  const u = editUsersForm.shareUsers.find(x => x.user === su.user);
                  if (u) u.permission = e.target.value;
                }"
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
                @click="editRemoveShareUser(su.user)"
              >
                <IconifyIcon icon="lucide:x" style="font-size: 12px;" />
              </Button>
            </div>
          </div>
        </Form.Item>
      </Form>
    </Modal>

    <!-- ═══════ 外链管理弹窗（简约现代风格）═══════ -->
    <Modal
      v-model:open="linkModalVisible"
      :title="`外链管理 - ${editingDir?.name}`"
      width="480px"
      ok-text="保存"
      cancel-text="取消"
      @ok="handleSaveLink"
      class="link-manage-modal"
    >
      <div class="link-modal-body">
        <!-- 文件夹信息卡片 -->
        <div class="link-folder-card">
          <IconifyIcon
            icon="lucide:folder-open"
            style="font-size: 18px; color: #d48806; flex-shrink: 0;"
          />
          <span class="link-folder-name">{{ editingDir?.name }}</span>
        </div>

        <!-- 启用外链开关 -->
        <div class="link-enable-row">
          <Checkbox v-model:checked="linkForm.enabled">
            <span class="link-enable-label">启用外链分享</span>
          </Checkbox>
          <Tooltip title="开启后，任何人可通过链接访问此文件夹">
            <IconifyIcon
              icon="lucide:circle-help"
              style="font-size: 13px; color: #bfbfbf; cursor: help;"
            />
          </Tooltip>
        </div>

        <template v-if="linkForm.enabled">
          <!-- 共享链接 -->
          <div class="link-section">
            <div class="link-section-title">共享链接</div>
            <div class="link-url-row">
              <Input
                v-model:value="editingDir!.linkUrl"
                readonly
                class="link-url-input"
              />
              <Button
                type="primary"
                size="small"
                @click="handleCopyLink(editingDir!.linkUrl)"
              >
                复制
              </Button>
            </div>
          </div>

          <!-- 访问次数 -->
          <div class="link-section">
            <div class="link-section-title">访问次数</div>
            <span class="link-stat-num">
              {{ editingDir?.linkAccessCount || 0 }}
            </span>
          </div>

          <!-- 有效期 -->
          <div class="link-section">
            <div class="link-section-title">有效期</div>
            <Radio.Group
              v-model:value="linkForm.expireType"
              size="small"
              class="link-expire-radio"
            >
              <Radio.Button value="preset">预设</Radio.Button>
              <Radio.Button value="custom">自定义</Radio.Button>
              <Radio.Button value="forever">永久</Radio.Button>
            </Radio.Group>
            <div
              v-if="linkForm.expireType === 'preset'"
              class="link-preset-days"
            >
              <Radio.Group
                v-model:value="linkForm.expirePreset"
                size="small"
              >
                <Radio.Button value="1">1天</Radio.Button>
                <Radio.Button value="7">7天</Radio.Button>
                <Radio.Button value="30">30天</Radio.Button>
              </Radio.Group>
            </div>
            <div
              v-else-if="linkForm.expireType === 'custom'"
              class="link-custom-date"
            >
              <DatePicker
                v-model:value="linkForm.expireCustomDate"
                placeholder="选择到期日期"
                size="small"
                style="width: 100%;"
              />
            </div>
          </div>

          <!-- 访问密码 -->
          <div class="link-section">
            <div class="link-section-title">访问密码（选填）</div>
            <Input
              v-model:value="linkForm.password"
              placeholder="不设置密码则公开访问"
            />
          </div>
        </template>

        <!-- 关闭状态提示 -->
        <div v-else class="link-disabled-hint">
          外链分享已关闭，开启后将生成共享链接
        </div>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
.shared-files-page {
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

.page-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.overview-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: #fff;
  border-radius: 10px;
  border: 1px solid #f0f0f0;
  min-width: 100px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;
}

.overview-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}

.overview-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
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

/* ═══ 第二行动作栏 ═══ */
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

/* ═══ 主体内容 ═══ */
.page-body {
  flex: 1;
  overflow: auto;
  padding: 12px;
}

/* ═══ 大卡片容器 ═══ */
.shared-card {
  border-radius: 12px;
  background: #fff;
  border: 1px solid #f0f0f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.shared-card :deep(.ant-card-body) {
  padding: 0;
}

/* ═══ 表格卡片 ═══ */
.table-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
}

.shared-table :deep(.ant-table-thead > tr > th) {
  background: #fafafa;
  font-weight: 600;
  font-size: 12px;
  color: #595959;
  padding: 10px 16px;
}

.shared-table :deep(.ant-table-tbody > tr > td) {
  padding: 12px 16px;
  font-size: 13px;
}

.shared-table :deep(.ant-table-tbody > tr:hover > td) {
  background: #f5f5f5;
}

/* ═══ 时间列 ═══ */
.time-cell {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #8c8c8c;
  font-size: 12px;
  cursor: default;
}

.time-text {
  color: #8c8c8c;
  font-size: 12px;
}

/* ═══ 名称列 ═══ */
.name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.name-icon-box {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(135deg, #e6f4ff 0%, #f0f5ff 100%);
  color: #1677ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.name-icon-box--expired {
  background: linear-gradient(135deg, #f5f5f5 0%, #f0f0f0 100%);
  color: #8c8c8c;
}

.name-text-area {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.name-title {
  font-size: 14px;
  font-weight: 500;
  color: #262626;
}

/* ═══ 路径列 ═══ */
.path-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #8c8c8c;
  font-size: 13px;
}

.path-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ═══ 用户列（带权限标识）═══ */
.user-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.user-perm-tag {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.user-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  border: 1.5px solid;
  cursor: default;
}

.perm-dot {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1.5px solid #fff;
}

.perm-dot--ro {
  background: #8c8c8c;
}

.perm-dot--rw {
  background: #52c41a;
}

.no-users {
  color: #bfbfbf;
  font-size: 13px;
}

/* ═══ 状态列 ═══ */
.status-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-text {
  font-size: 12px;
  font-weight: 500;
  color: #52c41a;
}

.status-text--expired {
  color: #8c8c8c;
}

/* ═══ 外链列 ═══ */
.link-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

.link-tag {
  display: inline-flex;
  align-items: center;
}

.link-tag--clickable {
  cursor: pointer;
  transition: all 0.2s ease;
}

.link-tag--clickable:hover {
  opacity: 0.85;
  transform: scale(1.02);
}

.link-none {
  display: inline-flex;
  align-items: center;
  color: #bfbfbf;
  font-size: 12px;
}

/* ═══ 操作列 ═══ */
.action-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.action-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.action-icon-btn:hover {
  background: #f0f0f0 !important;
}

/* ═══ 空状态 ═══ */
.table-empty {
  padding: 48px 0;
}

.empty-image {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

/* ═══ 创建分享弹窗 ═══ */
.create-share-modal :deep(.ant-modal-body) {
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
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
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

.create-tree-wrap {
  max-height: 180px;
  overflow: auto;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 6px 8px;
  background: #fafafa;
}

.create-dir-tree :deep(.ant-tree-treenode) {
  padding: 1px 0;
}

.create-dir-tree :deep(.ant-tree-node-content-wrapper) {
  display: inline-flex;
  align-items: center;
  border-radius: 6px;
  transition: all 0.2s;
  padding: 3px 8px;
}

.create-dir-tree :deep(.ant-tree-node-content-wrapper:hover) {
  background: #f0f5ff;
}

.create-dir-tree :deep(.ant-tree-node-selected .ant-tree-node-content-wrapper) {
  background: #e6f4ff !important;
  color: #1677ff;
  font-weight: 500;
}

.create-dir-tree .tree-node-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  white-space: nowrap;
}

.create-dir-tree .tree-node-text {
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

  /* 共享链接行 */
  .share-link-row {
    display: flex;
    gap: 8px;
  }

  .share-link-row :deep(.ant-input) {
    flex: 1;
  }

  /* ═══ 外链管理弹窗（简约现代风格）═══ */
  .link-manage-modal :deep(.ant-modal-content) {
    border-radius: 12px;
    overflow: hidden;
  }

  .link-modal-body {
    padding: 4px 4px 12px;
  }

  /* 文件夹信息卡片 */
  .link-folder-card {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    background: linear-gradient(135deg, #fffbe6 0%, #fff7e6 100%);
    border: 1px solid #ffd591;
    border-radius: 10px;
    margin-bottom: 16px;
  }

  .link-folder-name {
    font-size: 14px;
    font-weight: 600;
    color: #262626;
  }

  /* 启用外链开关 */
  .link-enable-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f0f0;
  }

  .link-enable-label {
    font-size: 14px;
    color: #262626;
  }

  /* 各区块 */
  .link-section {
    margin-bottom: 14px;
  }

  .link-section:last-of-type {
    margin-bottom: 0;
  }

  .link-section-title {
    font-size: 13px;
    font-weight: 500;
    color: #262626;
    margin-bottom: 6px;
  }

  /* 链接URL行 */
  .link-url-row {
    display: flex;
    gap: 8px;
  }

  .link-url-input {
    flex: 1;
  }

  .link-url-input :deep(.ant-input) {
    background: #fafafa;
    color: #595959;
  }

  /* 访问次数 */
  .link-stat-num {
    font-size: 20px;
    font-weight: 700;
    color: #262626;
    font-family: 'SF Mono', 'Fira Code', monospace;
  }

  /* 有效期选择 */
  .link-expire-radio {
    margin-bottom: 6px;
  }

  .link-preset-days {
    margin-top: 6px;
  }

  /* 关闭状态提示 */
  .link-disabled-hint {
    padding: 24px 0;
    text-align: center;
    font-size: 13px;
    color: #8c8c8c;
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

  .config-grid {
    grid-template-columns: 1fr;
  }
}
</style>
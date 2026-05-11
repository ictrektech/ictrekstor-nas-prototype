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
  Tabs,
  Divider,
} from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import {
  CalendarClock,
  Clock,
  Copy,
  ExternalLink,
  FolderHeart,
  FolderOpen,
  FolderPlus,
  FolderSymlink,
  FolderX,
  Infinity,
  Link,
  Search,
  Trash2,
  Users,
} from 'lucide-vue-next';

const TabPane = Tabs.TabPane;

interface SharedDir {
  id: string;
  name: string;
  sourcePath: string;
  shareUsers: string[];
  shareTime: string;
  expireTime: string;
  status: 'active' | 'expired';
}

interface ShareLink {
  id: string;
  name: string;
  targetPath: string;
  createTime: string;
  expireTime: string;
  accessCount: number;
  url: string;
  status: 'active' | 'expired';
}

/* ═══════ 标签页状态 ═══════ */
const activeTab = ref<'folders' | 'links'>('folders');

/* ═══════ 共享文件夹数据 ═══════ */
const dirSearchText = ref('');
const shareDirs = ref<SharedDir[]>([
  {
    id: 'sd-1',
    name: 'test',
    sourcePath: '存储空间1 / 我的文件 / test',
    shareUsers: ['zhangsan', 'lisi'],
    shareTime: '2024-05-06 10:30:00',
    expireTime: '2024-06-06 10:30:00',
    status: 'active',
  },
  {
    id: 'sd-2',
    name: 'test4',
    sourcePath: '存储空间1 / 我的文件 / test4',
    shareUsers: ['wangwu'],
    shareTime: '2024-05-05 14:20:00',
    expireTime: '永久',
    status: 'active',
  },
  {
    id: 'sd-3',
    name: '项目资料',
    sourcePath: '存储空间2 / 团队文件 / 项目资料',
    shareUsers: ['zhangsan', 'lisi', 'wangwu'],
    shareTime: '2024-04-20 09:15:00',
    expireTime: '2024-05-20 09:15:00',
    status: 'expired',
  },
  {
    id: 'sd-4',
    name: '设计资源',
    sourcePath: '存储空间1 / 图片 / 设计资源',
    shareUsers: ['admin'],
    shareTime: '2024-05-08 11:00:00',
    expireTime: '2024-08-08 11:00:00',
    status: 'active',
  },
  {
    id: 'sd-5',
    name: 'Q2 报表',
    sourcePath: '存储空间2 / 备份 / Q2 报表',
    shareUsers: ['zhangsan', 'wangwu'],
    shareTime: '2024-05-01 09:00:00',
    expireTime: '永久',
    status: 'active',
  },
]);

/* ═══════ 共享外链数据 ═══════ */
const linkSearchText = ref('');
const shareLinks = ref<ShareLink[]>([
  {
    id: 'link-1',
    name: '项目资料外链',
    targetPath: '/share/storage1/projects',
    createTime: '2024-07-25 09:00:00',
    expireTime: '2024-08-25 09:00:00',
    accessCount: 128,
    url: 'https://d.vivibit.com/s/abc123',
    status: 'active',
  },
  {
    id: 'link-2',
    name: '设计资源分享',
    targetPath: '/share/storage1/design',
    createTime: '2024-07-20 14:30:00',
    expireTime: '永久',
    accessCount: 56,
    url: 'https://d.vivibit.com/s/def456',
    status: 'active',
  },
  {
    id: 'link-3',
    name: 'Q2 财务报表',
    targetPath: '/share/storage2/reports/Q2',
    createTime: '2024-06-15 10:00:00',
    expireTime: '2024-07-15 10:00:00',
    accessCount: 32,
    url: 'https://d.vivibit.com/s/ghi789',
    status: 'expired',
  },
  {
    id: 'link-4',
    name: '团队文档合集',
    targetPath: '/share/team/docs',
    createTime: '2024-07-28 16:00:00',
    expireTime: '2024-08-28 16:00:00',
    accessCount: 89,
    url: 'https://d.vivibit.com/s/jkl012',
    status: 'active',
  },
]);

/* ═══════ 弹窗状态 ═══════ */
const createModalVisible = ref(false);
const createFormRef = ref();
const createForm = ref({
  name: '',
  sourcePath: '',
  shareUsers: [] as string[],
  expireTime: '7',
});

const editUsersModalVisible = ref(false);
const editUsersFormRef = ref();
const editingDir = ref<SharedDir | null>(null);
const editUsersForm = ref({
  shareUsers: [] as string[],
});

const userOptions = [
  { label: 'zhangsan', value: 'zhangsan' },
  { label: 'lisi', value: 'lisi' },
  { label: 'wangwu', value: 'wangwu' },
  { label: 'admin', value: 'admin' },
];

const folderOptions = [
  { label: '存储空间1 / 我的文件 / test', value: '存储空间1 / 我的文件 / test' },
  { label: '存储空间1 / 我的文件 / test4', value: '存储空间1 / 我的文件 / test4' },
  { label: '存储空间1 / 文档', value: '存储空间1 / 文档' },
  { label: '存储空间1 / 图片', value: '存储空间1 / 图片' },
  { label: '存储空间1 / 设计资源', value: '存储空间1 / 设计资源' },
  { label: '存储空间2 / 备份', value: '存储空间2 / 备份' },
  { label: '存储空间2 / 下载', value: '存储空间2 / 下载' },
  { label: '团队文件 / 文档', value: '团队文件 / 文档' },
  { label: '团队文件 / 设计资源', value: '团队文件 / 设计资源' },
  { label: '团队文件 / 财务资料', value: '团队文件 / 财务资料' },
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
        d.shareUsers.some((u) => u.toLowerCase().includes(kw)),
    );
  }
  return result;
});

const filteredLinks = computed(() => {
  let result = shareLinks.value;
  if (linkSearchText.value) {
    const kw = linkSearchText.value.toLowerCase();
    result = result.filter(
      (l) =>
        l.name.toLowerCase().includes(kw) ||
        l.targetPath.toLowerCase().includes(kw) ||
        l.url.toLowerCase().includes(kw),
    );
  }
  return result;
});

const overviewStats = computed(() => {
  const activeDirs = shareDirs.value.filter((d) => d.status === 'active').length;
  const expiredDirs = shareDirs.value.filter((d) => d.status === 'expired').length;
  const activeLinks = shareLinks.value.filter((l) => l.status === 'active').length;
  const expiredLinks = shareLinks.value.filter((l) => l.status === 'expired').length;
  const userSet = new Set<string>();
  shareDirs.value.forEach((d) => d.shareUsers.forEach((u) => userSet.add(u)));
  return {
    activeDirs,
    expiredDirs,
    activeLinks,
    expiredLinks,
    userCount: userSet.size,
    totalDirs: shareDirs.value.length,
    totalLinks: shareLinks.value.length,
    total: shareDirs.value.length + shareLinks.value.length,
  };
});

/* ═══════ 表格列定义 ═══════ */
const dirColumns = [
  { title: '共享名称', dataIndex: 'name', key: 'name', width: 140 },
  { title: '原文件夹', dataIndex: 'sourcePath', key: 'sourcePath', ellipsis: true },
  { title: '共享用户', key: 'shareUsers', width: 160 },
  { title: '创建时间', key: 'shareTime', width: 120 },
  { title: '有效期', dataIndex: 'expireTime', key: 'expireTime', width: 120 },
  { title: '状态', key: 'status', width: 90, align: 'center' as const },
  { title: '操作', key: 'action', width: 120, align: 'center' as const },
];

const linkColumns = [
  { title: '链接名称', dataIndex: 'name', key: 'name', width: 160 },
  { title: '对应文件/文件夹', dataIndex: 'targetPath', key: 'targetPath', ellipsis: true },
  { title: '链接地址', dataIndex: 'url', key: 'url', ellipsis: true },
  { title: '创建时间', key: 'createTime', width: 120 },
  { title: '访问次数', dataIndex: 'accessCount', key: 'accessCount', width: 90, align: 'center' as const },
  { title: '有效期', dataIndex: 'expireTime', key: 'expireTime', width: 120 },
  { title: '状态', key: 'status', width: 90, align: 'center' as const },
  { title: '操作', key: 'action', width: 130, align: 'center' as const },
];

/* ═══════ 方法 ═══════ */
function openCreateModal() {
  createForm.value = {
    name: '',
    sourcePath: '',
    shareUsers: [],
    expireTime: '7',
  };
  createModalVisible.value = true;
}

function handleCreate() {
  createFormRef.value
    .validate()
    .then(() => {
      const newDir: SharedDir = {
        id: `sd-${Date.now()}`,
        name: createForm.value.name,
        sourcePath: createForm.value.sourcePath,
        shareUsers: createForm.value.shareUsers,
        shareTime: new Date().toLocaleString(),
        expireTime:
          createForm.value.expireTime === '0'
            ? '永久'
            : `${createForm.value.expireTime}天后`,
        status: 'active',
      };
      shareDirs.value.push(newDir);
      message.success('共享目录创建成功');
      createModalVisible.value = false;
    })
    .catch(() => {});
}

function openEditUsersModal(dir: SharedDir) {
  editingDir.value = dir;
  editUsersForm.value = {
    shareUsers: [...dir.shareUsers],
  };
  editUsersModalVisible.value = true;
}

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

function handleDeleteLink(link: ShareLink) {
  shareLinks.value = shareLinks.value.filter((l) => l.id !== link.id);
  message.success(`"${link.name}" 已取消分享`);
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
          <Link style="font-size: 20px; color: #722ed1;" />
        </div>
        <div class="page-title-area">
          <h1 class="page-title">我的分享</h1>
          <p class="page-desc">管理当前用户对外分享的文件夹和链接</p>
        </div>
      </div>
      <div class="page-header-right">
        <div class="overview-card">
          <FolderHeart style="font-size: 16px; color: #52c41a;" />
          <div class="overview-info">
            <span class="overview-label">有效共享</span>
            <span class="overview-value">{{ overviewStats.activeDirs }}</span>
          </div>
        </div>
        <div class="overview-card">
          <Link style="font-size: 16px; color: #1677ff;" />
          <div class="overview-info">
            <span class="overview-label">有效外链</span>
            <span class="overview-value">{{ overviewStats.activeLinks }}</span>
          </div>
        </div>
        <div class="overview-card">
          <Users style="font-size: 16px; color: #722ed1;" />
          <div class="overview-info">
            <span class="overview-label">共享用户</span>
            <span class="overview-value">{{ overviewStats.userCount }}</span>
          </div>
        </div>
        <div class="overview-card">
          <FolderOpen style="font-size: 16px; color: #faad14;" />
          <div class="overview-info">
            <span class="overview-label">共享总数</span>
            <span class="overview-value">{{ overviewStats.total }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════ 主体内容 ═══════ -->
    <div class="page-body">
      <Card class="shared-card" :bordered="false">
        <Tabs v-model:activeKey="activeTab" class="shared-tabs">
        <!-- ═══════ 共享文件夹 Tab ═══════ -->
        <TabPane key="folders">
          <template #tab>
            <span class="tab-label">
              <FolderOpen style="font-size: 14px;" />
              共享文件夹
              <span class="tab-badge">{{ overviewStats.totalDirs }}</span>
            </span>
          </template>

          <!-- 工具栏 -->
          <div class="toolbar">
            <div class="toolbar-left">
              <Button type="primary" class="create-btn" @click="openCreateModal">
                <FolderPlus style="font-size: 13px;" />
                创建共享
              </Button>
            </div>
            <div class="toolbar-right">
              <Input
                v-model:value="dirSearchText"
                placeholder="搜索共享名称、路径或用户"
                class="search-input"
                allow-clear
              >
                <template #prefix>
                  <Search style="font-size: 14px; color: #bfbfbf;" />
                </template>
              </Input>
            </div>
          </div>

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
                      <FolderOpen style="font-size: 18px;" />
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
                    <span class="path-text" :title="record.sourcePath">{{ record.sourcePath }}</span>
                  </div>
                </template>

                <!-- 共享用户 -->
                <template v-if="column.key === 'shareUsers'">
                  <div class="user-cell">
                    <Tooltip
                      v-for="user in record.shareUsers"
                      :key="user"
                      :title="user"
                    >
                      <div
                        class="user-avatar"
                        :style="{ backgroundColor: getUserColor(user) + '20', color: getUserColor(user), borderColor: getUserColor(user) + '40' }"
                      >
                        {{ getUserInitial(user) }}
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
                  <Tag
                    :color="record.status === 'active' ? 'success' : 'default'"
                    size="small"
                    class="status-tag"
                  >
                    <Badge
                      :color="record.status === 'active' ? '#52c41a' : '#8c8c8c'"
                      style="margin-right: 4px;"
                    />
                    {{ record.status === 'active' ? '有效' : '已过期' }}
                  </Tag>
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
                        <Users style="font-size: 14px;" />
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
                          <Trash2 style="font-size: 14px;" />
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
                      <FolderSymlink style="font-size: 48px; color: #d9d9d9;" />
                    </div>
                  </template>
                </Empty>
              </template>
            </Table>
          </div>
        </TabPane>

        <!-- ═══════ 共享外链 Tab ═══════ -->
        <TabPane key="links">
          <template #tab>
            <span class="tab-label">
              <Link style="font-size: 14px;" />
              共享外链
              <span class="tab-badge">{{ overviewStats.totalLinks }}</span>
            </span>
          </template>

          <!-- 工具栏 -->
          <div class="toolbar">
            <div class="toolbar-left">
              <Button type="primary" class="create-btn" @click="() => message.info('创建外链功能开发中')">
                <Link style="font-size: 13px;" />
                创建外链
              </Button>
            </div>
            <div class="toolbar-right">
              <Input
                v-model:value="linkSearchText"
                placeholder="搜索链接名称、路径或地址"
                class="search-input"
                allow-clear
              >
                <template #prefix>
                  <Search style="font-size: 14px; color: #bfbfbf;" />
                </template>
              </Input>
            </div>
          </div>

          <!-- 表格卡片 -->
          <div class="table-card">
            <Table
              :columns="linkColumns"
              :data-source="filteredLinks"
              row-key="id"
              size="small"
              :pagination="false"
              class="shared-table"
            >
              <template #bodyCell="{ column, record }">
                <!-- 链接名称 -->
                <template v-if="column.key === 'name'">
                  <div class="name-cell">
                    <div
                      class="name-icon-box"
                      :class="{ 'name-icon-box--expired': record.status === 'expired' }"
                    >
                      <Link style="font-size: 18px;" />
                    </div>
                    <div class="name-text-area">
                      <div class="name-title">{{ record.name }}</div>
                    </div>
                  </div>
                </template>

                <!-- 创建时间 -->
                <template v-if="column.key === 'createTime'">
                  <Tooltip :title="record.createTime">
                    <span class="time-text">{{ formatFriendlyTime(record.createTime) }}</span>
                  </Tooltip>
                </template>

                <!-- 对应文件/文件夹 -->
                <template v-if="column.key === 'targetPath'">
                  <div class="path-cell">
                    <span class="path-text" :title="record.targetPath">{{ record.targetPath }}</span>
                  </div>
                </template>

                <!-- 链接地址 -->
                <template v-if="column.key === 'url'">
                  <div class="url-cell">
                    <Link style="font-size: 11px; color: #1677ff; flex-shrink: 0;" />
                    <span class="url-text" :title="record.url">{{ record.url }}</span>
                  </div>
                </template>

                <!-- 访问次数 -->
                <template v-if="column.key === 'accessCount'">
                  <span class="access-count">{{ record.accessCount }}</span>
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
                  <Tag
                    :color="record.status === 'active' ? 'success' : 'default'"
                    size="small"
                    class="status-tag"
                  >
                    <Badge
                      :color="record.status === 'active' ? '#52c41a' : '#8c8c8c'"
                      style="margin-right: 4px;"
                    />
                    {{ record.status === 'active' ? '有效' : '已过期' }}
                  </Tag>
                </template>

                <!-- 操作 -->
                <template v-if="column.key === 'action'">
                  <div class="action-cell">
                    <Tooltip title="复制链接">
                      <Button
                        size="small"
                        type="text"
                        class="action-icon-btn"
                        @click="handleCopyLink(record.url)"
                      >
                        <Copy style="font-size: 14px;" />
                      </Button>
                    </Tooltip>
                    <Tooltip title="访问链接">
                      <Button
                        size="small"
                        type="text"
                        class="action-icon-btn"
                        @click="() => window.open(record.url, '_blank')"
                      >
                        <ExternalLink style="font-size: 14px;" />
                      </Button>
                    </Tooltip>
                    <Tooltip title="取消分享">
                      <Popconfirm
                        title="确认取消"
                        description="取消后该外链将失效，是否继续？"
                        ok-text="确认"
                        cancel-text="取消"
                        @confirm="handleDeleteLink(record)"
                      >
                        <Button size="small" type="text" danger class="action-icon-btn">
                          <Trash2 style="font-size: 14px;" />
                        </Button>
                      </Popconfirm>
                    </Tooltip>
                  </div>
                </template>
              </template>

              <template #emptyText>
                <Empty description="暂无共享外链" class="table-empty">
                  <template #image>
                    <div class="empty-image">
                      <Link style="font-size: 48px; color: #d9d9d9;" />
                    </div>
                  </template>
                </Empty>
              </template>
            </Table>
          </div>
        </TabPane>
      </Tabs>
      </Card>
    </div>

    <!-- ═══════ 创建共享弹窗 ═══════ -->
    <Modal
      v-model:open="createModalVisible"
      title="创建共享"
      width="520px"
      ok-text="创建"
      cancel-text="取消"
      @ok="handleCreate"
    >
      <Form
        ref="createFormRef"
        :model="createForm"
        layout="vertical"
        :rules="{
          name: [{ required: true, message: '请输入共享名称', trigger: 'blur' }],
          sourcePath: [{ required: true, message: '请选择原文件夹', trigger: 'change' }],
        }"
      >
        <Form.Item label="共享名称" name="name">
          <Input v-model:value="createForm.name" placeholder="请输入共享名称">
            <template #prefix>
              <FolderOpen style="font-size: 14px; color: #bfbfbf;" />
            </template>
          </Input>
        </Form.Item>
        <Form.Item label="原文件夹" name="sourcePath">
          <Select
            v-model:value="createForm.sourcePath"
            placeholder="请选择要共享的文件夹"
            :options="folderOptions"
          />
        </Form.Item>
        <Form.Item label="共享用户">
          <Select
            v-model:value="createForm.shareUsers"
            mode="multiple"
            placeholder="请选择共享用户"
            :options="userOptions"
          />
        </Form.Item>
        <Form.Item label="有效期">
          <Radio.Group v-model:value="createForm.expireTime">
            <Radio value="1">1天</Radio>
            <Radio value="7">7天</Radio>
            <Radio value="30">30天</Radio>
            <Radio value="0">永久</Radio>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>

    <!-- ═══════ 编辑共享用户弹窗 ═══════ -->
    <Modal
      v-model:open="editUsersModalVisible"
      :title="`共享用户 - ${editingDir?.name}`"
      width="480px"
      ok-text="保存"
      cancel-text="取消"
      @ok="handleSaveUsers"
    >
      <Form ref="editUsersFormRef" :model="editUsersForm" layout="vertical">
        <Form.Item label="共享用户">
          <Select
            v-model:value="editUsersForm.shareUsers"
            mode="multiple"
            placeholder="请选择共享用户"
            :options="userOptions"
          />
        </Form.Item>
      </Form>
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

/* ═══ Tabs 样式 ═══ */
.shared-tabs :deep(.ant-tabs-nav) {
  margin-bottom: 0;
  background: transparent;
  border-radius: 0;
  padding: 0 16px;
  border: none;
  border-bottom: 1px solid #f0f0f0;
}

.shared-tabs :deep(.ant-tabs-tab) {
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #595959;
  transition: color 0.2s;
}

.shared-tabs :deep(.ant-tabs-tab-active) {
  color: #1677ff;
  font-weight: 600;
}

.shared-tabs :deep(.ant-tabs-ink-bar) {
  background: #1677ff;
  height: 2.5px;
  border-radius: 2px;
}

.tab-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: #f0f0f0;
  border-radius: 9px;
  font-size: 11px;
  font-weight: 600;
  color: #595959;
  margin-left: 4px;
}

.shared-tabs :deep(.ant-tabs-tab-active .tab-badge) {
  background: #1677ff;
  color: #fff;
}

.shared-tabs :deep(.ant-tabs-content) {
  padding: 16px;
}

/* ═══ 工具栏 ═══ */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  gap: 12px;
}

.toolbar-left {
  display: flex;
  align-items: center;
}

.create-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.toolbar-right {
  display: flex;
  align-items: center;
}

.search-input {
  width: 260px;
}

/* ═══ 表格卡片 ═══ */
.table-card {
  background: #fff;
  border-radius: 10px;
  border: 1px solid #f0f0f0;
  overflow: hidden;
}

.shared-table :deep(.ant-table-thead > tr > th) {
  background: #fafafa;
  font-weight: 600;
  font-size: 12px;
  color: #595959;
  padding: 10px 14px;
}

.shared-table :deep(.ant-table-tbody > tr > td) {
  padding: 12px 14px;
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
  color: #595959;
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
  background: #f0f5ff;
  color: #1677ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.name-icon-box--expired {
  background: #f5f5f5;
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

.name-time {
  font-size: 11px;
  color: #bfbfbf;
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

/* ═══ URL 列 ═══ */
.url-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.url-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #1677ff;
}

/* ═══ 访问次数 ═══ */
.access-count {
  font-weight: 600;
  color: #262626;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

/* ═══ 用户列 ═══ */
.user-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
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

.no-users {
  color: #bfbfbf;
  font-size: 13px;
}

/* ═══ 有效期列 ═══ */
.expire-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #595959;
  font-size: 13px;
}

.expire-expired {
  color: #ff4d4f;
}

/* ═══ 状态列 ═══ */
.status-tag {
  display: inline-flex;
  align-items: center;
}

/* ═══ 操作列 ═══ */
.action-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.action-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  width: 28px;
  height: 28px;
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

/* ═══ 响应式 ═══ */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .toolbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .search-input {
    width: 200px;
  }
}
</style>

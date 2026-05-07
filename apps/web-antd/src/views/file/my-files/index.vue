<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  Tree,
  Table,
  Input,
  Breadcrumb,
  Radio,
  Button,
  Modal,
  Form,
  message,
  Popconfirm,
  Dropdown,
  Tag,
  Checkbox,
} from 'ant-design-vue';

const router = useRouter();
const searchText = ref('');
const viewMode = ref<'list' | 'grid'>('list');
const currentKey = ref('root');
const expandedKeys = ref<(string | number)[]>(['root']);
const selectedKeys = ref<(string | number)[]>(['root']);
const selectedFile = ref<any>(null);

interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  size: string;
  modifyTime: string;
  extension?: string;
  isShared?: boolean;
}

const fileDataMap: Record<string, FileItem[]> = {
  root: [
    { id: 'spaces', name: '存储空间', type: 'folder', size: '--', modifyTime: '2024-05-06 10:00:00' },
    { id: 'team', name: '团队文件', type: 'folder', size: '--', modifyTime: '2024-05-06 10:00:00' },
    { id: 'shared', name: '共享文件', type: 'folder', size: '--', modifyTime: '2024-05-06 10:00:00' },
  ],
  spaces: [
    { id: 'space-1', name: '存储空间1', type: 'folder', size: '--', modifyTime: '2024-05-06 10:00:00' },
    { id: 'space-2', name: '存储空间2', type: 'folder', size: '--', modifyTime: '2024-05-06 10:00:00' },
  ],
  'space-1': [
    { id: 's1-doc', name: '文档', type: 'folder', size: '--', modifyTime: '2024-05-06 10:30:00' },
    { id: 's1-img', name: '图片', type: 'folder', size: '--', modifyTime: '2024-05-05 14:20:00' },
    { id: 's1-video', name: '视频', type: 'folder', size: '--', modifyTime: '2024-05-04 09:15:00' },
    { id: 's1-readme', name: 'README.md', type: 'file', size: '12 KB', modifyTime: '2024-05-03 16:45:00', extension: 'md' },
  ],
  'space-2': [
    { id: 's2-backup', name: '备份', type: 'folder', size: '--', modifyTime: '2024-05-06 08:00:00' },
    { id: 's2-download', name: '下载', type: 'folder', size: '--', modifyTime: '2024-05-05 11:00:00' },
  ],
  team: [
    { id: 'tf-1', name: '文档', type: 'folder', size: '--', modifyTime: '2024-05-06 14:00:00' },
    { id: 'tf-2', name: '设计资源', type: 'folder', size: '--', modifyTime: '2024-05-01 10:00:00' },
    { id: 'tf-3', name: '财务资料', type: 'folder', size: '--', modifyTime: '2024-04-20 16:00:00' },
  ],
  shared: [
    { id: 'shared-docs', name: '共享文档', type: 'folder', size: '--', modifyTime: '2024-05-06 10:00:00', isShared: true },
    { id: 'shared-design', name: '共享设计', type: 'folder', size: '--', modifyTime: '2024-05-05 14:00:00', isShared: true },
    { id: 'shared-media', name: '共享媒体', type: 'folder', size: '--', modifyTime: '2024-05-04 09:00:00', isShared: true },
  ],
  'shared-docs': [
    { id: 'sf-1', name: '项目计划书.pdf', type: 'file', size: '2.5 MB', modifyTime: '2024-05-06 10:30:00', extension: 'pdf', isShared: true },
    { id: 'sf-2', name: '设计规范.docx', type: 'file', size: '856 KB', modifyTime: '2024-05-05 14:20:00', extension: 'docx', isShared: true },
    { id: 'sf-3', name: 'Q1报表.xlsx', type: 'file', size: '340 KB', modifyTime: '2024-05-03 09:15:00', extension: 'xlsx', isShared: true },
    { id: 'sf-7', name: '接口文档.md', type: 'file', size: '28 KB', modifyTime: '2024-04-15 14:00:00', extension: 'md', isShared: true },
  ],
  'shared-design': [
    { id: 'sf-4', name: '产品原型.rp', type: 'file', size: '12 MB', modifyTime: '2024-04-28 16:00:00', extension: 'rp', isShared: true },
    { id: 'sf-6', name: '架构图.png', type: 'file', size: '3.2 MB', modifyTime: '2024-04-20 09:00:00', extension: 'png', isShared: true },
    { id: 't2-f1', name: 'logo.svg', type: 'file', size: '15 KB', modifyTime: '2024-05-01 14:00:00', extension: 'svg', isShared: true },
  ],
  'shared-media': [
    { id: 'sf-5', name: '会议录音.mp3', type: 'file', size: '45 MB', modifyTime: '2024-04-25 10:30:00', extension: 'mp3', isShared: true },
    { id: 'v1-f1', name: '演示视频.mp4', type: 'file', size: '256 MB', modifyTime: '2024-03-20 10:00:00', extension: 'mp4', isShared: true },
  ],
  's1-doc': [
    { id: 'd1-f1', name: '项目计划.docx', type: 'file', size: '856 KB', modifyTime: '2024-05-06 10:30:00', extension: 'docx' },
    { id: 'd1-f2', name: '需求分析.xlsx', type: 'file', size: '340 KB', modifyTime: '2024-05-05 09:00:00', extension: 'xlsx' },
  ],
  's1-img': [
    { id: 'i1-f1', name: 'logo.png', type: 'file', size: '2.3 MB', modifyTime: '2024-04-15 09:30:00', extension: 'png' },
    { id: 'i1-f2', name: 'banner.jpg', type: 'file', size: '1.5 MB', modifyTime: '2024-04-10 14:00:00', extension: 'jpg' },
  ],
  's1-video': [
    { id: 'v1-f1', name: '演示视频.mp4', type: 'file', size: '256 MB', modifyTime: '2024-03-20 10:00:00', extension: 'mp4' },
  ],
  's2-backup': [
    { id: 'b1-f1', name: '数据库备份.sql', type: 'file', size: '1.2 GB', modifyTime: '2024-05-01 02:00:00', extension: 'sql' },
  ],
  's2-download': [
    { id: 'dl-f1', name: '安装包.exe', type: 'file', size: '45 MB', modifyTime: '2024-04-28 16:30:00', extension: 'exe' },
  ],
  'tf-1': [
    { id: 't1-d1', name: '项目文档', type: 'folder', size: '--', modifyTime: '2024-05-06 10:30:00' },
    { id: 't1-d2', name: '会议纪要', type: 'folder', size: '--', modifyTime: '2024-05-05 14:20:00' },
    { id: 't1-f1', name: 'README.md', type: 'file', size: '12 KB', modifyTime: '2024-05-03 16:45:00', extension: 'md' },
  ],
  'tf-2': [
    { id: 't2-d1', name: 'UI 设计', type: 'folder', size: '--', modifyTime: '2024-05-06 08:00:00' },
    { id: 't2-f1', name: 'logo.svg', type: 'file', size: '15 KB', modifyTime: '2024-05-01 14:00:00', extension: 'svg' },
  ],
  'tf-3': [
    { id: 't3-f1', name: '资产负债表.pdf', type: 'file', size: '1.2 MB', modifyTime: '2024-04-30 11:00:00', extension: 'pdf' },
  ],
  trash: [
    { id: 'tr-1', name: '旧项目资料', type: 'folder', size: '--', modifyTime: '2024-05-01 10:00:00', extension: 'folder' },
    { id: 'tr-2', name: 'temp_backup.sql', type: 'file', size: '500 MB', modifyTime: '2024-04-20 09:00:00', extension: 'sql' },
    { id: 'tr-3', name: '废弃文档.docx', type: 'file', size: '120 KB', modifyTime: '2024-04-15 14:30:00', extension: 'docx' },
    { id: 'tr-4', name: '截图_20240410.png', type: 'file', size: '2.1 MB', modifyTime: '2024-04-10 08:00:00', extension: 'png' },
  ],
};

const treeData = [
  {
    title: '我的文件',
    key: 'root',
    icon: '📁',
    children: [
      {
        title: '存储空间',
        key: 'spaces',
        icon: '🖴',
        children: [
          {
            title: '存储空间1',
            key: 'space-1',
            icon: '🖴',
            children: [
              { title: '文档', key: 's1-doc', icon: '📁', isLeaf: true },
              { title: '图片', key: 's1-img', icon: '📁', isLeaf: true },
              { title: '视频', key: 's1-video', icon: '📁', isLeaf: true },
            ],
          },
          {
            title: '存储空间2',
            key: 'space-2',
            icon: '🖴',
            children: [
              { title: '备份', key: 's2-backup', icon: '📁', isLeaf: true },
              { title: '下载', key: 's2-download', icon: '📁', isLeaf: true },
            ],
          },
        ],
      },
      {
        title: '团队文件',
        key: 'team',
        icon: '👥',
        children: [
          { title: '文档', key: 'tf-1', icon: '👥', isLeaf: true },
          { title: '设计资源', key: 'tf-2', icon: '👥', isLeaf: true },
          { title: '财务资料', key: 'tf-3', icon: '👥', isLeaf: true },
        ],
      },
      {
        title: '共享文件',
        key: 'shared',
        icon: '🔗',
        children: [
          { title: '共享文档', key: 'shared-docs', icon: '🔗', isLeaf: true },
          { title: '共享设计', key: 'shared-design', icon: '🔗', isLeaf: true },
          { title: '共享媒体', key: 'shared-media', icon: '🔗', isLeaf: true },
        ],
      },
      {
        title: '回收站',
        key: 'trash',
        icon: '🗑️',
        isLeaf: true,
      },
    ],
  },
];

// 弹窗状态
const renameModalVisible = ref(false);
const renameFormRef = ref();
const renameForm = ref({ name: '' });

const shareModalVisible = ref(false);
const shareFormRef = ref();
const shareForm = ref({
  enableShare: true,
  shareLink: 'https://nas.example.com/s/abc123',
  expireDays: '7',
  password: '',
});

const moveModalVisible = ref(false);
const moveTarget = ref('');

const folderOptions = [
  { label: '存储空间1 / 文档', value: 's1-doc' },
  { label: '存储空间1 / 图片', value: 's1-img' },
  { label: '存储空间1 / 视频', value: 's1-video' },
  { label: '存储空间2 / 备份', value: 's2-backup' },
  { label: '存储空间2 / 下载', value: 's2-download' },
  { label: '团队文件 / 文档', value: 'tf-1' },
  { label: '团队文件 / 设计资源', value: 'tf-2' },
  { label: '团队文件 / 财务资料', value: 'tf-3' },
  { label: '共享文件 / 共享文档', value: 'shared-docs' },
  { label: '共享文件 / 共享设计', value: 'shared-design' },
  { label: '共享文件 / 共享媒体', value: 'shared-media' },
];

function findPath(nodes: any[], targetKey: string, path: { key: string; title: string }[] = []): { key: string; title: string }[] | null {
  for (const node of nodes) {
    const newPath = [...path, { key: String(node.key), title: String(node.title) }];
    if (node.key === targetKey) return newPath;
    if (node.children) {
      const result = findPath(node.children, targetKey, newPath);
      if (result) return result;
    }
  }
  return null;
}

const currentPath = computed(() => {
  return findPath(treeData, currentKey.value) || [{ key: 'root', title: '我的文件' }];
});

const currentFiles = computed(() => {
  return fileDataMap[currentKey.value] || [];
});

const filteredFiles = computed(() => {
  if (!searchText.value) return currentFiles.value;
  const kw = searchText.value.toLowerCase();
  return currentFiles.value.filter(f => f.name.toLowerCase().includes(kw));
});

function handleTreeSelect(keys: (string | number)[]) {
  if (keys.length > 0) {
    currentKey.value = String(keys[0]);
    selectedKeys.value = keys;
  }
}

function enterFolder(file: any) {
  if (file.type !== 'folder') return;
  currentKey.value = file.id;
  selectedKeys.value = [file.id];
  if (!expandedKeys.value.includes(file.id)) {
    expandedKeys.value = [...expandedKeys.value, file.id];
  }
}

function navigateTo(index: number) {
  const target = currentPath.value[index];
  if (!target) return;
  currentKey.value = target.key;
  selectedKeys.value = [target.key];
}

function getFileIcon(file: FileItem): string {
  if (file.type === 'folder') return '📁';
  switch (file.extension) {
    case 'md': case 'txt': return '📄';
    case 'json': case 'xml': case 'sh': return '⚙️';
    case 'zip': case 'rar': return '📦';
    case 'pdf': return '📕';
    case 'xlsx': case 'xls': case 'csv': return '📊';
    case 'doc': case 'docx': return '📝';
    case 'jpg': case 'jpeg': case 'png': case 'gif': case 'svg': return '🖼️';
    case 'mp4': case 'avi': return '🎬';
    case 'mp3': return '🎵';
    case 'exe': return '⚙️';
    case 'sql': return '🗃️';
    case 'rp': return '📐';
    default: return '📃';
  }
}

// 操作：上传
function handleUpload() {
  message.info('上传功能：请选择要上传的文件');
}

// 操作：下载
function handleDownload(file: any) {
  message.success(`开始下载：${file.name}`);
}

// 操作：删除
function handleDelete(file: any) {
  const list = fileDataMap[currentKey.value];
  if (list) {
    fileDataMap[currentKey.value] = list.filter(f => f.id !== file.id);
  }
  message.success(`"${file.name}" 已删除`);
}

// 操作：重命名
function openRenameModal(file: any) {
  selectedFile.value = file;
  renameForm.value = { name: file.name };
  renameModalVisible.value = true;
}

function handleRename() {
  renameFormRef.value?.validate().then(() => {
    if (selectedFile.value) {
      selectedFile.value.name = renameForm.value.name;
      message.success('重命名成功');
    }
    renameModalVisible.value = false;
  }).catch(() => {});
}

// 操作：移动
function openMoveModal(file: any) {
  selectedFile.value = file;
  moveTarget.value = '';
  moveModalVisible.value = true;
}

function handleMove() {
  if (!moveTarget.value || !selectedFile.value) return;
  // 从当前目录移除
  const srcList = fileDataMap[currentKey.value];
  if (srcList) {
    fileDataMap[currentKey.value] = srcList.filter(f => f.id !== selectedFile.value.id);
  }
  // 添加到目标目录
  const targetList = fileDataMap[moveTarget.value];
  if (targetList) {
    targetList.push({ ...selectedFile.value });
  }
  message.success(`"${selectedFile.value.name}" 已移动`);
  moveModalVisible.value = false;
}

// 操作：共享设置
function openShareModal(file: any) {
  selectedFile.value = file;
  shareForm.value = {
    enableShare: !!file.isShared,
    shareLink: `https://nas.example.com/s/${file.id}`,
    expireDays: '7',
    password: '',
  };
  shareModalVisible.value = true;
}

function handleSaveShare() {
  if (selectedFile.value) {
    selectedFile.value.isShared = shareForm.value.enableShare;
    message.success(shareForm.value.enableShare ? '共享设置已启用' : '共享已关闭');
  }
  shareModalVisible.value = false;
}

function copyShareLink() {
  message.success('链接已复制到剪贴板');
}

const columns = [
  { title: '名称', dataIndex: 'name', key: 'name', width: 280 },
  { title: '类型', dataIndex: 'type', key: 'type', width: 100 },
  { title: '大小', dataIndex: 'size', key: 'size', width: 100 },
  { title: '修改时间', dataIndex: 'modifyTime', key: 'modifyTime', width: 160 },
  { title: '状态', key: 'status', width: 80 },
  { title: '操作', key: 'action', width: 220 },
];
</script>

<template>
  <div class="my-files-explorer">
    <!-- 左侧树形导航 -->
    <div class="explorer-sidebar">
      <div class="sidebar-header">📁 我的文件</div>
      <Tree
        :tree-data="treeData"
        :selected-keys="selectedKeys"
        :expanded-keys="expandedKeys"
        @select="handleTreeSelect"
        @update:expanded-keys="(v: (string | number)[]) => expandedKeys = v"
      >
        <template #title="{ data }">
          <span class="tree-node">
            <span class="tree-icon">{{ data.icon }}</span>
            <span>{{ data.title }}</span>
          </span>
        </template>
      </Tree>
    </div>

    <!-- 右侧内容区 -->
    <div class="explorer-content">
      <!-- 工具栏 -->
      <div class="content-toolbar">
        <div class="breadcrumb-wrapper">
          <Breadcrumb>
            <Breadcrumb.Item
              v-for="(item, index) in currentPath"
              :key="item.key"
            >
              <a v-if="index < currentPath.length - 1" @click="navigateTo(index)">
                <span v-if="index === 0">📁</span>
                {{ item.title }}
              </a>
              <span v-else>
                <span v-if="index === 0">📁</span>
                {{ item.title }}
              </span>
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div class="toolbar-right">
          <Input
            v-model:value="searchText"
            placeholder="搜索"
            class="search-input"
            allow-clear
          />
          <Radio.Group v-model:value="viewMode" size="small">
            <Radio.Button value="list">☰</Radio.Button>
            <Radio.Button value="grid">▦</Radio.Button>
          </Radio.Group>
        </div>
      </div>

      <!-- 操作栏 -->
      <div class="action-bar">
        <div>
          <Button type="primary" @click="handleUpload">
            ⬆️ 上传
          </Button>
          <Button v-if="currentKey === 'trash'" style="margin-left: 8px;" @click="router.push('/file/recycle')">
            🗑️ 打开回收站页面
          </Button>
        </div>
      </div>

      <!-- 文件列表 -->
      <div class="file-list-wrapper">
        <!-- 列表视图 -->
        <Table
          v-if="viewMode === 'list'"
          :columns="columns"
          :data-source="filteredFiles"
          row-key="id"
          size="small"
          :pagination="false"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'name'">
              <div
                class="file-name-cell"
                :class="{ clickable: record.type === 'folder' }"
                @click="record.type === 'folder' && enterFolder(record)"
              >
                <span class="file-icon">{{ getFileIcon(record) }}</span>
                <span class="file-name">{{ record.name }}</span>
                <Tag v-if="record.isShared" color="blue" size="small" class="share-tag">共享中</Tag>
              </div>
            </template>
            <template v-if="column.key === 'type'">
              {{ record.type === 'folder' ? '文件夹' : (record.extension?.toUpperCase() || '文件') }}
            </template>
            <template v-if="column.key === 'status'">
              <Tag v-if="record.isShared" color="blue" size="small">共享</Tag>
              <span v-else>-</span>
            </template>
            <template v-if="column.key === 'action'">
              <div class="file-actions">
                <Button size="small" type="link" @click="handleDownload(record)">下载</Button>
                <Button size="small" type="link" @click="openRenameModal(record)">重命名</Button>
                <Dropdown :trigger="['click']">
                  <Button size="small" type="link">更多 ▼</Button>
                  <template #overlay>
                    <div class="dropdown-menu">
                      <div class="dropdown-item" @click="openMoveModal(record)">📂 移动</div>
                      <div v-if="record.type === 'folder'" class="dropdown-item" @click="openShareModal(record)">🔗 共享设置</div>
                      <div class="dropdown-divider" />
                      <Popconfirm
                        title="确认删除"
                        description="删除后无法恢复，是否继续？"
                        ok-text="确认"
                        cancel-text="取消"
                        @confirm="handleDelete(record)"
                      >
                        <div class="dropdown-item danger">🗑️ 删除</div>
                      </Popconfirm>
                    </div>
                  </template>
                </Dropdown>
              </div>
            </template>
          </template>
        </Table>

        <!-- 网格视图 -->
        <div v-else class="file-grid">
          <div
            v-for="file in filteredFiles"
            :key="file.id"
            class="file-grid-item"
            :class="{ clickable: file.type === 'folder' }"
          >
            <div @click="file.type === 'folder' && enterFolder(file)">
              <div class="file-grid-icon">{{ getFileIcon(file) }}</div>
              <div class="file-grid-name">
                {{ file.name }}
                <Tag v-if="file.isShared" color="blue" size="small">共</Tag>
              </div>
              <div class="file-grid-meta">{{ file.type === 'folder' ? '文件夹' : file.size }}</div>
            </div>
            <div class="file-grid-actions">
              <Button size="small" type="link" @click="handleDownload(file)">下载</Button>
              <Dropdown :trigger="['click']">
                <Button size="small" type="link">更多</Button>
                <template #overlay>
                  <div class="dropdown-menu">
                    <div class="dropdown-item" @click="openRenameModal(file)">✏️ 重命名</div>
                    <div class="dropdown-item" @click="openMoveModal(file)">📂 移动</div>
                    <div v-if="file.type === 'folder'" class="dropdown-item" @click="openShareModal(file)">🔗 共享设置</div>
                    <div class="dropdown-divider" />
                    <Popconfirm
                      title="确认删除"
                      description="删除后无法恢复，是否继续？"
                      ok-text="确认"
                      cancel-text="取消"
                      @confirm="handleDelete(file)"
                    >
                      <div class="dropdown-item danger">🗑️ 删除</div>
                    </Popconfirm>
                  </div>
                </template>
              </Dropdown>
            </div>
          </div>
          <div v-if="filteredFiles.length === 0" class="file-grid-empty">
            暂无文件
          </div>
        </div>
      </div>
    </div>

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

    <!-- 移动弹窗 -->
    <Modal
      v-model:open="moveModalVisible"
      title="移动到"
      width="400px"
      @ok="handleMove"
    >
      <Form layout="vertical">
        <Form.Item label="目标文件夹">
          <Input.Search
            v-model:value="moveTarget"
            placeholder="选择目标文件夹"
            readonly
          />
          <div class="move-folder-list">
            <div
              v-for="opt in folderOptions"
              :key="opt.value"
              class="move-folder-item"
              :class="{ active: moveTarget === opt.value }"
              @click="moveTarget = opt.value"
            >
              📁 {{ opt.label }}
            </div>
          </div>
        </Form.Item>
      </Form>
    </Modal>

    <!-- 共享设置弹窗 -->
    <Modal
      v-model:open="shareModalVisible"
      title="共享设置"
      width="480px"
      @ok="handleSaveShare"
    >
      <Form
        ref="shareFormRef"
        :model="shareForm"
        layout="vertical"
      >
        <Form.Item>
          <Checkbox v-model:checked="shareForm.enableShare">启用共享链接</Checkbox>
        </Form.Item>

        <template v-if="shareForm.enableShare">
          <Form.Item label="共享链接">
            <div class="share-link-row">
              <Input v-model:value="shareForm.shareLink" readonly />
              <Button @click="copyShareLink">复制</Button>
            </div>
          </Form.Item>

          <Form.Item label="有效期">
            <Radio.Group v-model:value="shareForm.expireDays">
              <Radio value="1">1天</Radio>
              <Radio value="7">7天</Radio>
              <Radio value="30">30天</Radio>
              <Radio value="0">永久</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item label="访问密码（选填）">
            <Input v-model:value="shareForm.password" placeholder="不设置密码则公开访问" />
          </Form.Item>
        </template>
      </Form>
    </Modal>
  </div>
</template>

<style scoped>
.my-files-explorer {
  display: flex;
  height: calc(100vh - 120px);
  background: #fff;
}

/* 左侧树形面板 */
.explorer-sidebar {
  width: 240px;
  border-right: 1px solid #f0f0f0;
  background: #fafafa;
  padding: 12px 0;
  overflow-y: auto;
  flex-shrink: 0;
}

.sidebar-header {
  padding: 0 16px 12px;
  font-size: 14px;
  font-weight: 600;
  color: #262626;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 8px;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tree-icon {
  font-size: 14px;
}

/* 右侧内容区 */
.explorer-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  gap: 12px;
}

.breadcrumb-wrapper {
  flex: 1;
  min-width: 0;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-input {
  width: 180px;
}

/* 操作栏 */
.action-bar {
  padding: 10px 16px;
  border-bottom: 1px solid #f0f0f0;
}

/* 文件列表 */
.file-list-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 8px 16px;
}

.file-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-name-cell.clickable {
  cursor: pointer;
  color: #1890ff;
}

.file-name-cell.clickable:hover {
  text-decoration: underline;
}

.file-icon {
  font-size: 18px;
}

.share-tag {
  margin-left: 4px;
}

.file-actions {
  display: flex;
  gap: 2px;
}

/* 下拉菜单 */
.dropdown-menu {
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08);
  padding: 4px 0;
  min-width: 120px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #262626;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background: #f5f5f5;
}

.dropdown-item.danger {
  color: #ff4d4f;
}

.dropdown-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 4px 0;
}

/* 网格视图 */
.file-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 16px;
  padding: 8px;
}

.file-grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border-radius: 6px;
  border: 1px solid transparent;
  transition: all 0.2s;
  text-align: center;
}

.file-grid-item.clickable {
  cursor: pointer;
}

.file-grid-item:hover {
  background: #f5f5f5;
  border-color: #d9d9d9;
}

.file-grid-icon {
  font-size: 36px;
  margin-bottom: 6px;
}

.file-grid-name {
  font-size: 12px;
  color: #262626;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  margin-bottom: 2px;
}

.file-grid-meta {
  font-size: 11px;
  color: #8c8c8c;
  margin-bottom: 6px;
}

.file-grid-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.file-grid-item:hover .file-grid-actions {
  opacity: 1;
}

.file-grid-empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: 48px 0;
  color: #bfbfbf;
}

/* 移动文件夹列表 */
.move-folder-list {
  margin-top: 8px;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
}

.move-folder-item {
  padding: 8px 12px;
  cursor: pointer;
  font-size: 13px;
  color: #262626;
  transition: background 0.2s;
}

.move-folder-item:hover {
  background: #f5f5f5;
}

.move-folder-item.active {
  background: #e6f7ff;
  color: #1890ff;
}

/* 共享链接 */
.share-link-row {
  display: flex;
  gap: 8px;
}

.share-link-row :deep(.ant-input) {
  flex: 1;
}
</style>

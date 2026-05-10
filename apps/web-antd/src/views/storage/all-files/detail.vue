<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  Button,
  Input,
  Table,
  Modal,
  Form,
  message,
  Popconfirm,
  Tag,
  Breadcrumb,
  Empty,
  Radio,
} from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';
import {
  getStorageSpaceFilesApi,
  getStorageSpacesApi,
  type StorageSpaceFile,
  type StorageSpace,
} from '#/api/storage';

const route = useRoute();
const router = useRouter();
const spaceId = computed(() => route.params.id as string);

const spaceInfo = ref<StorageSpace | null>(null);
const files = ref<StorageSpaceFile[]>([]);
const loading = ref(false);
const searchText = ref('');
const viewMode = ref<'list' | 'grid'>('list');

// 重命名弹窗
const renameModalVisible = ref(false);
const renameFormRef = ref();
const renameForm = ref({ name: '' });
const editingFile = ref<StorageSpaceFile | null>(null);

// 删除确认
const fileToDelete = ref<StorageSpaceFile | null>(null);

const filteredFiles = computed(() => {
  if (!searchText.value) return files.value;
  const kw = searchText.value.toLowerCase();
  return files.value.filter(
    (f) => f.name.toLowerCase().includes(kw),
  );
});

const sortedFiles = computed(() => {
  return [...filteredFiles.value].sort((a, b) => {
    // 文件夹排在前面
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
});

async function loadData() {
  loading.value = true;
  try {
    const [spacesRes, filesRes] = await Promise.all([
      getStorageSpacesApi(),
      getStorageSpaceFilesApi(spaceId.value),
    ]);
    spaceInfo.value = spacesRes.find((s) => s.id === spaceId.value) || null;
    files.value = filesRes;
  } finally {
    loading.value = false;
  }
}

function goBack() {
  router.push('/storage/all-files');
}

function getFileIcon(file: StorageSpaceFile): string {
  if (file.type === 'folder') return '📁';
  switch (file.extension) {
    case 'md':
    case 'txt':
      return '📄';
    case 'json':
    case 'xml':
      return '⚙️';
    case 'zip':
    case 'rar':
    case '7z':
      return '📦';
    case 'pdf':
      return '📕';
    case 'xlsx':
    case 'xls':
    case 'csv':
      return '📊';
    case 'doc':
    case 'docx':
      return '📝';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return '🖼️';
    case 'mp4':
    case 'avi':
    case 'mkv':
      return '🎬';
    case 'mp3':
    case 'wav':
    case 'flac':
      return '🎵';
    default:
      return '📃';
  }
}

function openRenameModal(file: any) {
  editingFile.value = file;
  renameForm.value = { name: file.name };
  renameModalVisible.value = true;
}

function handleRename() {
  renameFormRef.value
    .validate()
    .then(() => {
      if (editingFile.value) {
        editingFile.value.name = renameForm.value.name;
        message.success('重命名成功');
      }
      renameModalVisible.value = false;
    })
    .catch(() => {});
}

function handleDeleteFile(file: any) {
  message.success(`"${file.name}" 已删除`);
  files.value = files.value.filter((f) => f.id !== file.id);
}

const columns = [
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    width: 300,
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type',
    width: 100,
  },
  {
    title: '大小',
    dataIndex: 'size',
    key: 'size',
    width: 120,
  },
  {
    title: '修改时间',
    dataIndex: 'modifyTime',
    key: 'modifyTime',
    width: 180,
  },
  {
    title: '操作',
    key: 'action',
    width: 160,
  },
];

onMounted(loadData);
</script>

<template>
  <div class="space-detail-page">
    <!-- ═══════ 页面顶部概览 ═══════ -->
    <div class="page-header">
      <div class="page-header-left">
        <Button size="small" class="back-btn" @click="goBack">
          <IconifyIcon icon="lucide:arrow-left" style="font-size: 13px;" />
        </Button>
        <div class="page-icon-box">
          <IconifyIcon icon="lucide:folder-open" style="font-size: 20px; color: #1677ff;" />
        </div>
        <div class="page-title-area">
          <h1 class="page-title">{{ spaceInfo?.name || '加载中...' }}</h1>
          <p class="page-desc">设备全部文件 · {{ filteredFiles.length }} 个项目</p>
        </div>
      </div>
      <div class="page-header-right">
        <div class="overview-card">
          <IconifyIcon icon="lucide:files" style="font-size: 16px; color: #1677ff;" />
          <div class="overview-info">
            <span class="overview-label">文件</span>
            <span class="overview-value">{{ files.filter(f => f.type === 'file').length }}</span>
          </div>
        </div>
        <div class="overview-card">
          <IconifyIcon icon="lucide:folder" style="font-size: 16px; color: #52c41a;" />
          <div class="overview-info">
            <span class="overview-label">文件夹</span>
            <span class="overview-value">{{ files.filter(f => f.type === 'folder').length }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <Input
        v-model:value="searchText"
        placeholder="搜索文件"
        class="search-input"
        allow-clear
      />
      <Radio.Group v-model:value="viewMode" size="small">
        <Radio.Button value="list">☰ 列表</Radio.Button>
        <Radio.Button value="grid">▦ 网格</Radio.Button>
      </Radio.Group>
    </div>

    <!-- 文件列表 -->
    <div class="file-content">
      <!-- 列表视图 -->
      <Table
        v-if="viewMode === 'list'"
        :columns="columns"
        :data-source="sortedFiles"
        :loading="loading"
        row-key="id"
        size="small"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <div class="file-name-cell">
              <span class="file-icon">{{ getFileIcon(record) }}</span>
              <span class="file-name">{{ record.name }}</span>
            </div>
          </template>
          <template v-if="column.key === 'type'">
            <Tag :color="record.type === 'folder' ? 'blue' : 'default'" size="small">
              {{ record.type === 'folder' ? '文件夹' : '文件' }}
            </Tag>
          </template>
          <template v-if="column.key === 'action'">
            <div class="file-actions">
              <Button
                size="small"
                type="link"
                @click="openRenameModal(record)"
              >
                重命名
              </Button>
              <Popconfirm
                title="确认删除"
                description="确定要删除该文件吗？"
                ok-text="确认"
                cancel-text="取消"
                @confirm="handleDeleteFile(record)"
              >
                <Button size="small" type="link" danger>
                  删除
                </Button>
              </Popconfirm>
            </div>
          </template>
        </template>
      </Table>

      <!-- 网格视图 -->
      <div v-else class="file-grid">
        <div
          v-for="file in sortedFiles"
          :key="file.id"
          class="file-grid-item"
        >
          <div class="file-grid-icon">{{ getFileIcon(file) }}</div>
          <div class="file-grid-name">{{ file.name }}</div>
          <div class="file-grid-meta">
            <span v-if="file.type === 'file'">{{ file.size }}</span>
            <span v-else>文件夹</span>
          </div>
          <div class="file-grid-actions">
            <Button
              size="small"
              type="link"
              @click="openRenameModal(file)"
            >
              重命名
            </Button>
            <Popconfirm
              title="确认删除"
              description="确定要删除该文件吗？"
              ok-text="确认"
              cancel-text="取消"
              @confirm="handleDeleteFile(file)"
            >
              <Button size="small" type="link" danger>
                删除
              </Button>
            </Popconfirm>
          </div>
        </div>
        <Empty
          v-if="sortedFiles.length === 0"
          description="暂无文件"
          class="file-grid-empty"
        />
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
        :rules="{
          name: [
            { required: true, message: '请输入名称', trigger: 'blur' },
          ],
        }"
      >
        <Form.Item label="新名称" name="name">
          <Input v-model:value="renameForm.name" placeholder="请输入新名称" />
        </Form.Item>
      </Form>
    </Modal>
  </div>
</template>

<style scoped>
.space-detail-page {
  padding: 0 16px 16px;
  width: 100%;
}

/* ===== 页面顶部概览 ===== */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: #fff;
  gap: 16px;
  flex-shrink: 0;
}

.page-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-btn {
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: 6px;
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

/* 搜索栏 */
.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 10px 0;
}

.search-input {
  width: 240px;
}

/* 文件内容 */
.file-content {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  padding: 16px;
}

.file-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.file-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-actions {
  display: flex;
  gap: 4px;
}

/* 网格视图 */
.file-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
}

.file-grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px;
  border-radius: 8px;
  border: 1px solid transparent;
  transition: all 0.2s;
  cursor: pointer;
}

.file-grid-item:hover {
  background: #f5f5f5;
  border-color: #d9d9d9;
}

.file-grid-icon {
  font-size: 40px;
  margin-bottom: 8px;
}

.file-grid-name {
  font-size: 13px;
  color: #262626;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  margin-bottom: 4px;
}

.file-grid-meta {
  font-size: 11px;
  color: #8c8c8c;
  margin-bottom: 8px;
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
  padding: 48px 0;
}
</style>

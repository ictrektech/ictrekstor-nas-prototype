<script lang="ts" setup>
import { ref, computed, onMounted, h } from 'vue';
import {
  Button,
  Input,
  Table,
  Checkbox,
  Empty,
  message,
  Modal,
  Tree,
  Radio,
} from 'ant-design-vue';
import type { ColumnType } from 'ant-design-vue/es/table';

// ============ 类型定义 ============
interface RecycleBinItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  extension?: string;
  deleteTime: string;
  size: string;
  originalPath: string;
  children?: RecycleBinItem[];
}

// ============ Mock 数据 ============
const recycleData: RecycleBinItem[] = [
  {
    id: 'rec-1',
    name: 'qin1',
    type: 'folder',
    deleteTime: '2026-04-29 11:51',
    size: '-',
    originalPath: '存储空间1/我的文件/qin1',
    children: [
      {
        id: 'rec-1-1',
        name: '磁盘管理.png',
        type: 'file',
        extension: 'png',
        deleteTime: '2026-04-29 11:51',
        size: '91.9 KB',
        originalPath: '存储空间1/我的文件/qin1/磁盘管理.png',
      },
    ],
  },
  {
    id: 'rec-2',
    name: 'test2',
    type: 'folder',
    deleteTime: '2026-04-29 12:03',
    size: '-',
    originalPath: '存储空间1/我的文件/test2',
    children: [],
  },
  {
    id: 'rec-3',
    name: 'test3',
    type: 'folder',
    deleteTime: '2026-04-29 15:29',
    size: '-',
    originalPath: '存储空间1/我的文件/test3',
    children: [],
  },
  {
    id: 'rec-4',
    name: '旧文档.txt',
    type: 'file',
    extension: 'txt',
    deleteTime: '2026-04-28 14:30',
    size: '12 KB',
    originalPath: '存储空间1/我的文件/旧文档.txt',
  },
  {
    id: 'rec-5',
    name: '项目备份.zip',
    type: 'file',
    extension: 'zip',
    deleteTime: '2026-04-27 09:15',
    size: '256 MB',
    originalPath: '存储空间2/备份/项目备份.zip',
  },
];

// ============ 状态 ============
const items = ref<RecycleBinItem[]>([...recycleData]);
const loading = ref(false);
const searchText = ref('');
const viewMode = ref<'list' | 'grid'>('list');
const selectedRowKeys = ref<string[]>([]);
const expandedRowKeys = ref<string[]>([]);
const currentCategory = ref<'my-files' | 'team-files'>('my-files');

// ============ 树形导航数据 ============
const treeData = [
  {
    title: '我的文件',
    key: 'my-files',
    icon: () => h('span', { style: 'font-size: 16px;' }, '📁'),
  },
  {
    title: '团队文件',
    key: 'team-files',
    icon: () => h('span', { style: 'font-size: 16px;' }, '👥'),
  },
];

// ============ 计算属性 ============
const filteredItems = computed(() => {
  if (!searchText.value) return items.value;
  const kw = searchText.value.toLowerCase();
  return items.value.filter(
    (item) =>
      item.name.toLowerCase().includes(kw) ||
      item.originalPath.toLowerCase().includes(kw),
  );
});

const totalCount = computed(() => {
  let count = items.value.length;
  items.value.forEach((item) => {
    if (item.children) {
      count += item.children.length;
    }
  });
  return count;
});

const hasSelected = computed(() => selectedRowKeys.value.length > 0);

// ============ 方法 ============
function handleTreeSelect(keys: (string | number)[]) {
  if (keys.length > 0) {
    currentCategory.value = String(keys[0]) as 'my-files' | 'team-files';
    if (currentCategory.value === 'team-files') {
      items.value = [
        {
          id: 'team-rec-1',
          name: '会议纪要.docx',
          type: 'file',
          extension: 'docx',
          deleteTime: '2026-04-26 16:00',
          size: '45 KB',
          originalPath: '团队文件/文档/会议纪要.docx',
        },
        {
          id: 'team-rec-2',
          name: '设计稿',
          type: 'folder',
          deleteTime: '2026-04-25 10:20',
          size: '-',
          originalPath: '团队文件/设计资源/设计稿',
          children: [
            {
              id: 'team-rec-2-1',
              name: '首页.png',
              type: 'file',
              extension: 'png',
              deleteTime: '2026-04-25 10:20',
              size: '2.3 MB',
              originalPath: '团队文件/设计资源/设计稿/首页.png',
            },
          ],
        },
      ];
    } else {
      items.value = [...recycleData];
    }
    selectedRowKeys.value = [];
    expandedRowKeys.value = [];
  }
}

function handleSelectChange(keys: (string | number)[]) {
  selectedRowKeys.value = keys.map(String);
}

function handleExpand(expanded: boolean, record: RecycleBinItem) {
  if (expanded) {
    if (!expandedRowKeys.value.includes(record.id)) {
      expandedRowKeys.value.push(record.id);
    }
  } else {
    expandedRowKeys.value = expandedRowKeys.value.filter(
      (k) => k !== record.id,
    );
  }
}

function handleClearRecycleBin() {
  Modal.confirm({
    title: '清空回收站',
    content: '确定要清空回收站吗？清空后文件将无法恢复。',
    okText: '确定',
    cancelText: '取消',
    okType: 'danger',
    onOk: () => {
      items.value = [];
      selectedRowKeys.value = [];
      message.success('回收站已清空');
    },
  });
}

function handleRestore(record?: RecycleBinItem) {
  const targets = record ? [record] : getSelectedItems();
  if (targets.length === 0) {
    message.warning('请选择要还原的文件');
    return;
  }
  Modal.confirm({
    title: '还原文件',
    content: `确定要还原选中的 ${targets.length} 项吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: () => {
      const idsToRemove = new Set(targets.map((t) => t.id));
      items.value = items.value
        .map((item) => ({
          ...item,
          children: item.children?.filter((c) => !idsToRemove.has(c.id)),
        }))
        .filter((item) => !idsToRemove.has(item.id));
      selectedRowKeys.value = [];
      message.success('文件已还原');
    },
  });
}

function handlePermanentDelete(record?: RecycleBinItem) {
  const targets = record ? [record] : getSelectedItems();
  if (targets.length === 0) {
    message.warning('请选择要删除的文件');
    return;
  }
  Modal.confirm({
    title: '彻底删除',
    content: `确定要彻底删除选中的 ${targets.length} 项吗？删除后将无法恢复。`,
    okText: '确定',
    cancelText: '取消',
    okType: 'danger',
    onOk: () => {
      const idsToRemove = new Set(targets.map((t) => t.id));
      items.value = items.value
        .map((item) => ({
          ...item,
          children: item.children?.filter((c) => !idsToRemove.has(c.id)),
        }))
        .filter((item) => !idsToRemove.has(item.id));
      selectedRowKeys.value = [];
      message.success('文件已彻底删除');
    },
  });
}

function getSelectedItems(): RecycleBinItem[] {
  const result: RecycleBinItem[] = [];
  const allItems: RecycleBinItem[] = [...items.value];
  items.value.forEach((item) => {
    if (item.children) {
      allItems.push(...item.children);
    }
  });
  selectedRowKeys.value.forEach((key) => {
    const found = allItems.find((i) => i.id === key);
    if (found) result.push(found);
  });
  return result;
}

function getFileEmoji(record: RecycleBinItem): string {
  if (record.type === 'folder') return '📁';
  switch (record.extension) {
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
      return '🖼️';
    case 'pdf':
      return '📕';
    case 'doc':
    case 'docx':
      return '📝';
    case 'xls':
    case 'xlsx':
      return '📊';
    case 'txt':
    case 'md':
      return '📄';
    case 'zip':
    case 'rar':
      return '📦';
    case 'sql':
      return '🗃️';
    case 'mp4':
      return '🎬';
    case 'mp3':
      return '🎵';
    default:
      return '📃';
  }
}

function onRowClick(record: RecycleBinItem) {
  if (
    record.type === 'folder' &&
    record.children &&
    record.children.length > 0
  ) {
    const isExpanded = expandedRowKeys.value.includes(record.id);
    handleExpand(!isExpanded, record);
  }
}

function loadData() {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 300);
}

onMounted(loadData);

// ============ 表格列定义 ============
const columns: ColumnType<RecycleBinItem>[] = [
  {
    title: '文件名',
    dataIndex: 'name',
    key: 'name',
    width: 300,
  },
  {
    title: '删除时间',
    dataIndex: 'deleteTime',
    key: 'deleteTime',
    width: 160,
    sorter: (a: RecycleBinItem, b: RecycleBinItem) =>
      new Date(a.deleteTime).getTime() - new Date(b.deleteTime).getTime(),
  },
  {
    title: '大小',
    dataIndex: 'size',
    key: 'size',
    width: 100,
  },
  {
    title: '原始位置',
    dataIndex: 'originalPath',
    key: 'originalPath',
    ellipsis: true,
  },
  {
    title: '操作',
    key: 'action',
    width: 180,
    fixed: 'right',
  },
];

function handleChildCheck(checked: boolean, childId: string) {
  if (checked) {
    selectedRowKeys.value = [...selectedRowKeys.value, childId];
  } else {
    selectedRowKeys.value = selectedRowKeys.value.filter((k) => k !== childId);
  }
}

function handleGridCheck(checked: boolean, itemId: string) {
  if (checked) {
    selectedRowKeys.value = [...selectedRowKeys.value, itemId];
  } else {
    selectedRowKeys.value = selectedRowKeys.value.filter((k) => k !== itemId);
  }
}
</script>

<template>
  <div class="recycle-page">
    <!-- 左侧导航 -->
    <div class="recycle-sidebar">
      <div class="sidebar-header">
        <span style="font-size: 16px">🗑️</span>
        <span>回收站</span>
      </div>
      <Tree
        :tree-data="treeData"
        :selected-keys="[currentCategory]"
        @select="handleTreeSelect"
        :show-line="false"
        :show-icon="true"
      >
        <template #title="{ data }">
          <span class="tree-node-title">{{ data.title }}</span>
        </template>
      </Tree>
    </div>

    <!-- 右侧内容区 -->
    <div class="recycle-content">
      <!-- 顶部工具栏 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <div class="breadcrumb-bar">
            <span class="breadcrumb-icon">🗑️</span>
            <span class="breadcrumb-text">回收站</span>
          </div>
          <Button size="small" class="refresh-btn" @click="loadData">
            ⟳
          </Button>
        </div>
        <div class="toolbar-right">
          <Input
            v-model:value="searchText"
            placeholder="搜索"
            class="search-input"
            allow-clear
          />
        </div>
      </div>

      <!-- 操作栏 -->
      <div class="action-bar">
        <div class="action-btns-left">
          <Button :disabled="items.length === 0" @click="handleClearRecycleBin">
            🧹 清空回收站
          </Button>
          <Button
            type="primary"
            :disabled="!hasSelected"
            @click="handleRestore()"
          >
            ↩️ 还原
          </Button>
          <Button danger :disabled="!hasSelected" @click="handlePermanentDelete()">
            🗑️ 彻底删除
          </Button>
        </div>
        <div class="action-btns-right">
          <Radio.Group v-model:value="viewMode" size="small">
            <Radio.Button value="list"> ☰ </Radio.Button>
            <Radio.Button value="grid"> ▦ </Radio.Button>
          </Radio.Group>
        </div>
      </div>

      <!-- 文件列表区域 -->
      <div class="file-list-wrapper">
        <!-- 列表视图 -->
        <template v-if="viewMode === 'list'">
          <Table
            :columns="columns"
            :data-source="filteredItems"
            :loading="loading"
            row-key="id"
            size="small"
            :pagination="false"
            :row-selection="{
              selectedRowKeys: selectedRowKeys,
              onChange: handleSelectChange,
            }"
            :expanded-row-keys="expandedRowKeys"
            @expand="handleExpand"
          >
            <template #bodyCell="{ column, record }">
              <!-- 文件名列 -->
              <template v-if="column.key === 'name'">
                <div
                  class="file-name-cell"
                  :class="{
                    clickable:
                      record.type === 'folder' &&
                      record.children &&
                      record.children.length > 0,
                  }"
                  @click="onRowClick(record)"
                >
                  <span class="file-icon">{{ getFileEmoji(record) }}</span>
                  <span class="file-name">{{ record.name }}</span>
                </div>
              </template>

              <!-- 操作列 -->
              <template v-if="column.key === 'action'">
                <div class="row-actions">
                  <Button size="small" type="link" @click="handleRestore(record)">
                    还原
                  </Button>
                  <Button
                    size="small"
                    type="link"
                    danger
                    @click="handlePermanentDelete(record)"
                  >
                    彻底删除
                  </Button>
                </div>
              </template>
            </template>

            <!-- 展开子文件 -->
            <template #expandedRowRender="{ record }">
              <div
                v-if="record.children && record.children.length > 0"
                class="expanded-children"
              >
                <div
                  v-for="child in record.children"
                  :key="child.id"
                  class="child-row"
                >
                  <div class="child-cell child-name">
                    <Checkbox
                      :checked="selectedRowKeys.includes(child.id)"
                      @change="
                        (e: any) => handleChildCheck(e.target.checked, child.id)
                      "
                      style="margin-right: 12px"
                    />
                    <span class="file-icon">{{ getFileEmoji(child) }}</span>
                    <span>{{ child.name }}</span>
                  </div>
                  <div class="child-cell child-time">{{ child.deleteTime }}</div>
                  <div class="child-cell child-size">{{ child.size }}</div>
                  <div class="child-cell child-path">{{ child.originalPath }}</div>
                  <div class="child-cell child-action">
                    <Button
                      size="small"
                      type="link"
                      @click="handleRestore(child)"
                    >
                      还原
                    </Button>
                    <Button
                      size="small"
                      type="link"
                      danger
                      @click="handlePermanentDelete(child)"
                    >
                      彻底删除
                    </Button>
                  </div>
                </div>
              </div>
              <div v-else class="expanded-empty">文件夹为空</div>
            </template>
          </Table>
        </template>

        <!-- 网格视图 -->
        <template v-else>
          <div class="file-grid">
            <div
              v-for="item in filteredItems"
              :key="item.id"
              class="grid-item"
            >
              <div class="grid-checkbox">
                <Checkbox
                  :checked="selectedRowKeys.includes(item.id)"
                  @change="(e: any) => handleGridCheck(e.target.checked, item.id)"
                />
              </div>
              <div class="grid-icon">
                <span class="grid-emoji">
                  {{ item.type === 'folder' ? '📁' : getFileEmoji(item) }}
                </span>
              </div>
              <div class="grid-name" :title="item.name">{{ item.name }}</div>
              <div class="grid-meta">{{ item.size }}</div>
              <div class="grid-meta">{{ item.deleteTime }}</div>
              <div class="grid-actions">
                <Button size="small" type="link" @click="handleRestore(item)">
                  还原
                </Button>
                <Button
                  size="small"
                  type="link"
                  danger
                  @click="handlePermanentDelete(item)"
                >
                  删除
                </Button>
              </div>
            </div>
            <div v-if="filteredItems.length === 0" class="grid-empty">
              <Empty description="暂无回收站文件" />
            </div>
          </div>
        </template>

        <Empty
          v-if="filteredItems.length === 0 && viewMode === 'list'"
          description="暂无回收站文件"
        />
      </div>

      <!-- 底部统计 -->
      <div class="footer-bar">共 {{ totalCount }} 项</div>
    </div>
  </div>
</template>

<style scoped>
.recycle-page {
  display: flex;
  height: calc(100vh - 120px);
  background: #fff;
}

/* ========== 左侧导航 ========== */
.recycle-sidebar {
  width: 220px;
  border-right: 1px solid #f0f0f0;
  background: #fafafa;
  padding: 16px 0;
  flex-shrink: 0;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px 12px;
  font-size: 15px;
  font-weight: 600;
  color: #262626;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 8px;
}

.tree-node-title {
  font-size: 14px;
  color: #262626;
}

/* ========== 右侧内容区 ========== */
.recycle-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 工具栏 */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  gap: 12px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.breadcrumb-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 4px 12px;
}

.breadcrumb-icon {
  font-size: 14px;
}

.breadcrumb-text {
  font-size: 14px;
  color: #262626;
}

.refresh-btn {
  padding: 0 10px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-input {
  width: 220px;
}

/* 操作栏 */
.action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid #f0f0f0;
  background: #fff;
}

.action-btns-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btns-right {
  display: flex;
  align-items: center;
}

/* 文件列表 */
.file-list-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

/* 文件名单元格 */
.file-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-name-cell.clickable {
  cursor: pointer;
}

.file-name-cell.clickable:hover .file-name {
  color: #1890ff;
}

.file-icon {
  font-size: 18px;
}

.file-name {
  font-weight: 500;
  color: #262626;
}

/* 行操作按钮 */
.row-actions {
  display: flex;
  gap: 4px;
}

/* 展开的子文件行 */
.expanded-children {
  padding: 0;
}

.child-row {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-bottom: 1px solid #f5f5f5;
  transition: background 0.2s;
}

.child-row:last-child {
  border-bottom: none;
}

.child-row:hover {
  background: #fafafa;
}

.child-cell {
  padding: 0 8px;
  font-size: 13px;
  color: #595959;
}

.child-name {
  width: 300px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.child-time {
  width: 160px;
  flex-shrink: 0;
}

.child-size {
  width: 100px;
  flex-shrink: 0;
}

.child-path {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.child-action {
  width: 180px;
  flex-shrink: 0;
  display: flex;
  gap: 4px;
}

.expanded-empty {
  padding: 16px;
  text-align: center;
  color: #bfbfbf;
  font-size: 13px;
}

/* 网格视图 */
.file-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
  padding: 16px;
}

.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  transition: all 0.2s;
  position: relative;
}

.grid-item:hover {
  border-color: #d9d9d9;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.grid-checkbox {
  position: absolute;
  top: 8px;
  left: 8px;
}

.grid-icon {
  margin-bottom: 8px;
}

.grid-emoji {
  font-size: 48px;
}

.grid-name {
  font-size: 13px;
  color: #262626;
  font-weight: 500;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  margin-bottom: 4px;
}

.grid-meta {
  font-size: 11px;
  color: #8c8c8c;
  margin-bottom: 2px;
}

.grid-actions {
  display: flex;
  gap: 4px;
  margin-top: 6px;
  opacity: 0;
  transition: opacity 0.2s;
}

.grid-item:hover .grid-actions {
  opacity: 1;
}

.grid-empty {
  grid-column: 1 / -1;
  padding: 48px 0;
}

/* 底部统计 */
.footer-bar {
  padding: 10px 16px;
  border-top: 1px solid #f0f0f0;
  font-size: 13px;
  color: #8c8c8c;
  background: #fafafa;
}

/* Ant Design 覆盖 */
:deep(.ant-table-cell) {
  padding: 10px 16px !important;
}
</style>

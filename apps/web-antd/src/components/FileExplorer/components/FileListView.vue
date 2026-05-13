<script lang="ts" setup>
import { IconifyIcon } from '@vben/icons';
import { Empty, Table, Tag, Popconfirm, Dropdown, Menu } from 'ant-design-vue';
import { computed } from 'vue';

import type { FileItem } from '../types';
import { getFileIconClass } from '../utils';

interface Props {
  files: FileItem[];
  loading?: boolean;
  selectedIds: string[];
  draggable?: boolean;
  mode?: 'normal' | 'recycle';
  emptyDescription?: string;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  draggable: false,
  mode: 'normal',
  emptyDescription: '暂无文件',
});

const emit = defineEmits<{
  itemClick: [file: FileItem, event: MouseEvent];
  toggleSelect: [file: FileItem, event?: MouseEvent];
  contextMenu: [file: FileItem, event: MouseEvent];
  dragStart: [file: FileItem, event: DragEvent];
  rename: [file: FileItem];
  deleteFile: [file: FileItem];
  restore: [file: FileItem];
  share: [file: FileItem];
  copy: [file: FileItem];
  move: [file: FileItem];
}>();

const columns = computed(() => {
  if (props.mode === 'recycle') {
    return [
      { title: '名称', dataIndex: 'name', key: 'name', width: 280, ellipsis: true },
      { title: '类型', dataIndex: 'type', key: 'type', width: 80, align: 'center' as const },
      { title: '大小', dataIndex: 'size', key: 'size', width: 90, align: 'right' as const },
      { title: '删除时间', dataIndex: 'deletedTime', key: 'deletedTime', width: 150 },
      { title: '原路径', dataIndex: 'originalPath', key: 'originalPath', width: 220, ellipsis: true },
      { title: '操作', key: 'action', width: 140, align: 'center' as const },
    ];
  }
  return [
    { title: '名称', dataIndex: 'name', key: 'name', width: 320, ellipsis: true },
    { title: '类型', dataIndex: 'type', key: 'type', width: 90, align: 'center' as const },
    { title: '大小', dataIndex: 'size', key: 'size', width: 100, align: 'right' as const },
    { title: '修改时间', dataIndex: 'modifyTime', key: 'modifyTime', width: 170 },
    { title: '操作', key: 'action', width: 140, align: 'center' as const },
  ];
});

function isSelected(file: FileItem) {
  return props.selectedIds.includes(file.id);
}

function rowClassName(record: any) {
  return isSelected(record) ? 'file-list-row--selected' : '';
}

function customRow(record: any) {
  return {
    onContextmenu: (e: MouseEvent) => emit('contextMenu', record as FileItem, e),
  };
}
</script>

<template>
  <Table
    :columns="columns"
    :data-source="files"
    :loading="loading"
    row-key="id"
    size="small"
    :pagination="false"
    :row-class-name="rowClassName"
    :customRow="customRow"
    class="file-list-view"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'name'">
        <div
          class="name-cell"
          :class="{ 'name-cell--folder': record.type === 'folder', 'name-cell--draggable': draggable }"
          :draggable="draggable && record.type === 'file'"
          @click.stop="emit('itemClick', record as FileItem, $event)"
          @dragstart="emit('dragStart', record as FileItem, $event)"
        >
          <div class="checkbox" :class="{ 'checkbox--checked': isSelected(record) }" @click.stop="emit('toggleSelect', record as FileItem, $event)">
            <IconifyIcon v-if="isSelected(record)" icon="lucide:check" style="font-size: 10px; color: #fff;" />
          </div>
          <div class="icon-wrap">
            <div class="icon-box" :style="{ background: getFileIconClass(record).bg }">
              <IconifyIcon :icon="getFileIconClass(record).icon" :style="{ fontSize: '16px', color: getFileIconClass(record).color }" />
            </div>
            <div v-if="record.isShared" class="shared-badge" title="已分享">
              <IconifyIcon icon="lucide:link" style="font-size: 9px; color: #fff;" />
            </div>
          </div>
          <span class="name-text" :title="record.name">{{ record.name }}</span>
        </div>
      </template>
      <template v-if="column.key === 'type'">
        <Tag :color="record.type === 'folder' ? 'blue' : 'default'" size="small">
          {{ record.type === 'folder' ? '文件夹' : '文件' }}
        </Tag>
      </template>
      <template v-if="column.key === 'size'">
        <span class="size-text">{{ record.size }}</span>
      </template>
      <template v-if="column.key === 'modifyTime'">
        <span class="time-text">{{ record.modifyTime }}</span>
      </template>
      <template v-if="column.key === 'deletedTime'">
        <span class="time-text">{{ record.deletedTime || '--' }}</span>
      </template>
      <template v-if="column.key === 'originalPath'">
        <span class="path-text" :title="record.originalPath">{{ record.originalPath || '--' }}</span>
      </template>
      <template v-if="column.key === 'action'">
        <div class="action-cell" @click.stop>
          <template v-if="mode === 'recycle'">
            <a class="action-link" @click="emit('restore', record as FileItem)">
              <IconifyIcon icon="lucide:rotate-ccw" style="font-size: 13px; color: #1677ff;" />
              还原
            </a>
            <Popconfirm title="确定彻底删除吗？删除后无法恢复" @confirm="emit('deleteFile', record as FileItem)">
              <a class="action-link action-link--danger">
                <IconifyIcon icon="lucide:trash-2" style="font-size: 13px;" />
                删除
              </a>
            </Popconfirm>
          </template>
          <template v-else>
            <Dropdown placement="bottomRight">
              <a class="action-link">
                <IconifyIcon icon="lucide:more-horizontal" style="font-size: 13px;" />
                操作
              </a>
              <template #overlay>
                <Menu>
                  <Menu.Item key="rename" @click="emit('rename', record as FileItem)">
                    <span class="menu-item-inner">
                      <IconifyIcon icon="lucide:pencil" style="font-size: 13px;" />
                      重命名
                    </span>
                  </Menu.Item>
                  <Menu.Item key="share" v-if="record.type === 'folder'" @click="emit('share', record as FileItem)">
                    <span class="menu-item-inner">
                      <IconifyIcon icon="lucide:share-2" style="font-size: 13px; color: #1677ff;" />
                      分享
                    </span>
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item key="copy" @click="emit('copy', record as FileItem)">
                    <span class="menu-item-inner">
                      <IconifyIcon icon="lucide:copy" style="font-size: 13px; color: #1677ff;" />
                      复制
                    </span>
                  </Menu.Item>
                  <Menu.Item key="move" @click="emit('move', record as FileItem)">
                    <span class="menu-item-inner">
                      <IconifyIcon icon="lucide:move" style="font-size: 13px; color: #52c41a;" />
                      移动
                    </span>
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item key="delete" danger @click="emit('deleteFile', record as FileItem)">
                    <span class="menu-item-inner menu-item-inner--danger">
                      <IconifyIcon icon="lucide:trash-2" style="font-size: 13px;" />
                      删除
                    </span>
                  </Menu.Item>
                </Menu>
              </template>
            </Dropdown>
          </template>
        </div>
      </template>
    </template>
    <template #emptyText>
      <Empty :description="emptyDescription">
        <template #image>
          <div class="empty-image">
            <IconifyIcon icon="lucide:folder-open" style="font-size: 48px; color: #d9d9d9;" />
          </div>
        </template>
      </Empty>
    </template>
  </Table>
</template>

<style scoped>
/* 表格样式 */
.file-list-view {
  border-radius: 8px;
  overflow: hidden;
}
.file-list-view :deep(.ant-table-thead > tr > th) {
  background: #fafafa;
  font-weight: 600;
  font-size: 12px;
  color: #595959;
  padding: 10px 12px;
}
.file-list-view :deep(.ant-table-tbody > tr > td) {
  padding: 8px 12px;
  font-size: 13px;
}
.file-list-view :deep(.ant-table-tbody > tr:hover > td) {
  background: #f5f5f5;
}

/* 选中行 */
:deep(.file-list-row--selected) { background: #e6f4ff !important; }
:deep(.file-list-row--selected:hover) { background: #bae0ff !important; }

/* 名称单元格 */
.name-cell { display: inline-flex; align-items: center; gap: 8px; cursor: default; user-select: none; }
.name-cell--folder { cursor: pointer; }
.name-cell--draggable[draggable="true"] { cursor: grab; }
.name-cell--folder:hover .name-text { color: #1677ff; }

/* 复选框 */
.checkbox {
  width: 18px;
  height: 18px;
  border-radius: 5px;
  border: 1.5px solid #d9d9d9;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
  transition: all 0.15s;
  background: #fff;
  margin-right: 2px;
}
.checkbox:hover { border-color: #1677ff; }
.checkbox--checked { background: #1677ff; border-color: #1677ff; }

/* 图标 */
.icon-wrap { position: relative; display: inline-flex; flex-shrink: 0; }
.icon-box { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
.shared-badge { position: absolute; bottom: -2px; right: -2px; width: 14px; height: 14px; border-radius: 50%; background: #1677ff; display: flex; align-items: center; justify-content: center; border: 1.5px solid #fff; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15); }

/* 文字 */
.name-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #262626; transition: color 0.2s; }
.size-text, .time-text, .path-text { font-family: 'SF Mono', 'Fira Code', monospace; color: #8c8c8c; font-size: 12px; }

/* 操作列 */
.action-cell { display: flex; align-items: center; gap: 4px; justify-content: center; }
.action-link { display: inline-flex; align-items: center; gap: 4px; padding: 2px 6px; color: #1677ff; cursor: pointer; font-size: 12px; transition: all 0.2s; border-radius: 4px; }
.action-link:hover { background: rgba(22, 119, 255, 0.08); }
.action-link--danger { color: #ff4d4f; }
.action-link--danger:hover { background: #fff1f0; }

/* 菜单项 */
.menu-item-inner { display: inline-flex; align-items: center; gap: 6px; }
.menu-item-inner--danger { color: #ff4d4f; }

/* 空状态 */
.empty-image { display: flex; justify-content: center; align-items: center; margin-bottom: 12px; }
</style>
<script lang="ts" setup>
import { IconifyIcon } from '@vben/icons';
import { Menu } from 'ant-design-vue';
import type { FileItem } from '../types';

interface Props { visible: boolean; x: number; y: number; file: FileItem | null; mode?: 'normal' | 'recycle' }
withDefaults(defineProps<Props>(), { mode: 'normal' });
const emit = defineEmits<{ 'update:visible': [v: boolean]; action: [action: string, file: FileItem] }>();
function close() { emit('update:visible', false); }
function handle(action: string) { if (!props.file) return; emit('action', action, props.file); close(); }
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="ctx-menu-overlay" @click="close" @contextmenu.prevent="close">
      <div class="ctx-menu" :style="{ left: `${x}px`, top: `${y}px` }" @click.stop>
        <Menu>
          <template v-if="mode === 'recycle' && file">
            <Menu.Item key="restore" @click="handle('restore')"><span class="ctx-item"><IconifyIcon icon="lucide:rotate-ccw" style="font-size:13px;color:var(--ict-primary);" />还原</span></Menu.Item>
            <Menu.Divider />
            <Menu.Item key="delete" danger @click="handle('delete')"><span class="ctx-item ctx-item--danger"><IconifyIcon icon="lucide:trash-2" style="font-size:13px;" />彻底删除</span></Menu.Item>
          </template>
          <template v-else-if="file">
            <Menu.Item key="rename" @click="handle('rename')"><span class="ctx-item"><IconifyIcon icon="lucide:pencil" style="font-size:13px;" />重命名</span></Menu.Item>
            <Menu.Item key="copy" @click="handle('copy')"><span class="ctx-item"><IconifyIcon icon="lucide:copy" style="font-size:13px;color:var(--ict-primary);" />复制</span></Menu.Item>
            <Menu.Item key="move" @click="handle('move')"><span class="ctx-item"><IconifyIcon icon="lucide:move" style="font-size:13px;color:var(--ict-success);" />移动</span></Menu.Item>
          </template>
        </Menu>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.ctx-menu-overlay { position: fixed; inset: 0; z-index: 9998; }
.ctx-menu { position: fixed; z-index: 9999; background: var(--ict-bg-card); border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.12); border: 1px solid var(--ict-border-light); padding: 4px; min-width: 140px; }
.ctx-item { display: flex; align-items: center; gap: 8px; font-size: var(--ict-mark-medium); color: var(--ict-text-emphasis); }
.ctx-item--danger { color: var(--ict-danger); }
</style>
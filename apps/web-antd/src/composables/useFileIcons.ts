import { computed } from 'vue';

/**
 * 文件图标映射配置
 */
const FILE_ICON_MAP: Record<string, { icon: string; color: string }> = {
  // 图片
  jpg: { icon: 'lucide:image', color: '#52c41a' },
  jpeg: { icon: 'lucide:image', color: '#52c41a' },
  png: { icon: 'lucide:image', color: '#52c41a' },
  gif: { icon: 'lucide:image', color: '#52c41a' },
  svg: { icon: 'lucide:image', color: '#52c41a' },
  webp: { icon: 'lucide:image', color: '#52c41a' },
  // 视频
  mp4: { icon: 'lucide:video', color: '#eb2f96' },
  mkv: { icon: 'lucide:video', color: '#eb2f96' },
  avi: { icon: 'lucide:video', color: '#eb2f96' },
  mov: { icon: 'lucide:video', color: '#eb2f96' },
  // 音频
  mp3: { icon: 'lucide:music', color: '#722ed1' },
  wav: { icon: 'lucide:music', color: '#722ed1' },
  flac: { icon: 'lucide:music', color: '#722ed1' },
  // 文档
  pdf: { icon: 'lucide:file-text', color: '#ff4d4f' },
  doc: { icon: 'lucide:file-text', color: '#1677ff' },
  docx: { icon: 'lucide:file-text', color: '#1677ff' },
  xls: { icon: 'lucide:file-spreadsheet', color: '#52c41a' },
  xlsx: { icon: 'lucide:file-spreadsheet', color: '#52c41a' },
  ppt: { icon: 'lucide:presentation', color: '#faad14' },
  pptx: { icon: 'lucide:presentation', color: '#faad14' },
  txt: { icon: 'lucide:file-text', color: '#8c8c8c' },
  md: { icon: 'lucide:file-text', color: '#8c8c8c' },
  // 代码
  js: { icon: 'lucide:code', color: '#faad14' },
  ts: { icon: 'lucide:code', color: '#1677ff' },
  vue: { icon: 'lucide:code', color: '#52c41a' },
  html: { icon: 'lucide:code', color: '#eb2f96' },
  css: { icon: 'lucide:code', color: '#1677ff' },
  json: { icon: 'lucide:code', color: '#8c8c8c' },
  // 压缩包
  zip: { icon: 'lucide:archive', color: '#faad14' },
  rar: { icon: 'lucide:archive', color: '#faad14' },
  '7z': { icon: 'lucide:archive', color: '#faad14' },
  tar: { icon: 'lucide:archive', color: '#faad14' },
  gz: { icon: 'lucide:archive', color: '#faad14' },
};

/**
 * 文件夹图标配置
 */
const FOLDER_ICON = { icon: 'lucide:folder', color: '#faad14' };
const FOLDER_OPEN_ICON = { icon: 'lucide:folder-open', color: '#faad14' };

/**
 * 解析文件扩展名
 */
function getExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

/**
 * 根据文件名获取文件图标配置
 * @param filename - 文件名
 * @returns 图标名称和颜色
 */
export function getFileIcon(filename: string): { icon: string; color: string } {
  const ext = getExtension(filename);
  return FILE_ICON_MAP[ext] || { icon: 'lucide:file', color: '#8c8c8c' };
}

/**
 * 文件图标组合式函数
 * @returns 文件图标解析工具
 */
export function useFileIcons() {
  /**
   * 根据文件名获取图标配置
   */
  function resolveFileIcon(filename: string): { icon: string; color: string } {
    return getFileIcon(filename);
  }

  /**
   * 获取文件夹图标配置
   * @param isOpen - 是否展开状态
   */
  function resolveFolderIcon(isOpen = false): { icon: string; color: string } {
    return isOpen ? FOLDER_OPEN_ICON : FOLDER_ICON;
  }

  return {
    resolveFileIcon,
    resolveFolderIcon,
    getFileIcon,
  };
}
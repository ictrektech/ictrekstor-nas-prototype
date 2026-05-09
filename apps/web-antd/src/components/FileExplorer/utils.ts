/**
 * 文件浏览器通用工具函数
 */
import type { FileIconConfig, FileItem } from './types';

/**
 * 根据文件扩展名获取对应的图标、颜色和背景色
 */
export function getFileIconClass(file: FileItem): FileIconConfig {
  if (file.type === 'folder') {
    return { icon: 'lucide:folder', color: '#faad14', bg: '#fffbe6' };
  }
  const ext = (file.extension || '').toLowerCase();
  const iconMap: Record<string, FileIconConfig> = {
    md: { icon: 'lucide:file-text', color: '#1677ff', bg: '#e6f4ff' },
    txt: { icon: 'lucide:file-text', color: '#1677ff', bg: '#e6f4ff' },
    json: { icon: 'lucide:file-code', color: '#13c2c2', bg: '#e6fffb' },
    xml: { icon: 'lucide:file-code', color: '#13c2c2', bg: '#e6fffb' },
    zip: { icon: 'lucide:package', color: '#722ed1', bg: '#f9f0ff' },
    rar: { icon: 'lucide:package', color: '#722ed1', bg: '#f9f0ff' },
    '7z': { icon: 'lucide:package', color: '#722ed1', bg: '#f9f0ff' },
    'tar.gz': { icon: 'lucide:package', color: '#722ed1', bg: '#f9f0ff' },
    pdf: { icon: 'lucide:file-type', color: '#f5222d', bg: '#fff1f0' },
    xlsx: { icon: 'lucide:file-spreadsheet', color: '#52c41a', bg: '#f6ffed' },
    xls: { icon: 'lucide:file-spreadsheet', color: '#52c41a', bg: '#f6ffed' },
    csv: { icon: 'lucide:file-spreadsheet', color: '#52c41a', bg: '#f6ffed' },
    doc: { icon: 'lucide:file-text', color: '#1677ff', bg: '#e6f4ff' },
    docx: { icon: 'lucide:file-text', color: '#1677ff', bg: '#e6f4ff' },
    jpg: { icon: 'lucide:image', color: '#eb2f96', bg: '#fff0f6' },
    jpeg: { icon: 'lucide:image', color: '#eb2f96', bg: '#fff0f6' },
    png: { icon: 'lucide:image', color: '#eb2f96', bg: '#fff0f6' },
    gif: { icon: 'lucide:image', color: '#eb2f96', bg: '#fff0f6' },
    svg: { icon: 'lucide:image', color: '#eb2f96', bg: '#fff0f6' },
    psd: { icon: 'lucide:image', color: '#eb2f96', bg: '#fff0f6' },
    fig: { icon: 'lucide:figma', color: '#eb2f96', bg: '#fff0f6' },
    mp4: { icon: 'lucide:video', color: '#fa8c16', bg: '#fff7e6' },
    avi: { icon: 'lucide:video', color: '#fa8c16', bg: '#fff7e6' },
    mkv: { icon: 'lucide:video', color: '#fa8c16', bg: '#fff7e6' },
    mp3: { icon: 'lucide:music', color: '#fa8c16', bg: '#fff7e6' },
    wav: { icon: 'lucide:music', color: '#fa8c16', bg: '#fff7e6' },
    flac: { icon: 'lucide:music', color: '#fa8c16', bg: '#fff7e6' },
    exe: { icon: 'lucide:terminal', color: '#595959', bg: '#f5f5f5' },
    log: { icon: 'lucide:scroll-text', color: '#8c8c8c', bg: '#fafafa' },
    conf: { icon: 'lucide:settings', color: '#8c8c8c', bg: '#fafafa' },
    yml: { icon: 'lucide:file-code', color: '#13c2c2', bg: '#e6fffb' },
    sql: { icon: 'lucide:database', color: '#1677ff', bg: '#e6f4ff' },
  };
  return iconMap[ext] || { icon: 'lucide:file', color: '#8c8c8c', bg: '#f5f5f5' };
}

/**
 * 在树节点中查找目标节点的所有父节点 key
 */
export function findParentKeys<T extends { key: string; children?: T[] }>(
  nodes: T[],
  target: string,
): string[] {
  for (const node of nodes) {
    if (node.key === target) return [];
    if (node.children) {
      const child = findParentKeys(node.children, target);
      if (child.length >= 0 && node.children.some((c) => keyInSubtree(c, target))) {
        return [node.key, ...child];
      }
      const deeper = findParentKeys(node.children, target);
      if (deeper.length > 0) return [node.key, ...deeper];
    }
  }
  return [];
}

function keyInSubtree<T extends { key: string; children?: T[] }>(node: T, target: string): boolean {
  if (node.key === target) return true;
  if (node.children) {
    return node.children.some((c) => keyInSubtree(c, target));
  }
  return false;
}

/**
 * 在树节点中递归查找目标节点
 */
export function findNodeInTree<T extends { key: string; children?: T[] }>(
  nodes: T[],
  target: string,
): T | null {
  for (const n of nodes) {
    if (n.key === target) return n;
    if (n.children) {
      const found = findNodeInTree(n.children, target);
      if (found) return found;
    }
  }
  return null;
}

/**
 * 构建面包屑路径（递归查找）
 * @param rootTitle 根节点显示标题
 * @param rootKey 根节点 key
 */
export function buildBreadcrumbPath<T extends { key: string; title: string; children?: T[] }>(
  nodes: T[],
  target: string,
  rootTitle: string,
  rootKey = 'root',
): { title: string; key: string }[] {
  const parts: { title: string; key: string }[] = [{ title: rootTitle, key: rootKey }];

  function findPath(
    treeNodes: T[],
    t: string,
    current: { title: string; key: string }[],
  ): boolean {
    for (const node of treeNodes) {
      if (node.key === t) {
        parts.push(...current, { title: node.title, key: node.key });
        return true;
      }
      if (node.children) {
        const res = findPath(node.children, t, [
          ...current,
          { title: node.title, key: node.key },
        ]);
        if (res) return true;
      }
    }
    return false;
  }

  findPath(nodes, target, []);
  return parts;
}

/**
 * 表格默认列定义
 */
export function getDefaultFileColumns() {
  return [
    { title: '名称', dataIndex: 'name', key: 'name', width: 320, ellipsis: true },
    { title: '类型', dataIndex: 'type', key: 'type', width: 90, align: 'center' as const },
    { title: '大小', dataIndex: 'size', key: 'size', width: 100, align: 'right' as const },
    { title: '修改时间', dataIndex: 'modifyTime', key: 'modifyTime', width: 170 },
    { title: '操作', key: 'action', width: 140, align: 'center' as const },
  ];
}

/**
 * 文件树节点类型
 */
export interface FileTreeNode {
  type: 'space' | 'folder' | string;
  [key: string]: any;
}

/**
 * 解析文件树节点的图标配置
 * @param node - 树节点数据
 * @returns 图标名称和颜色
 */
export function treeNodeIconResolver(node: FileTreeNode) {
  switch (node.type) {
    case 'space':
      return { icon: 'lucide:hard-drive', color: '#1677ff' };
    case 'folder':
      return { icon: 'lucide:folder-open', color: '#faad14' };
    default:
      return { icon: 'lucide:folder', color: '#faad14' };
  }
}
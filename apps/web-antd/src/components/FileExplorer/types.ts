/**
 * 文件浏览器通用类型定义
 * 供 FileTreePanel 和 FileManagerPanel 使用
 */

/** 通用文件树节点 */
export interface FileTreeNode {
  key: string;
  title: string;
  type: string;
  path?: string;
  /** 节点关联的业务ID，如 spaceId / folderId */
  businessId?: string;
  children?: FileTreeNode[];
  isLeaf?: boolean;
}

/** 通用文件项 */
export interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  size: string;
  modifyTime: string;
  extension?: string;
  /** 回收站：删除时间 */
  deletedTime?: string;
  /** 回收站：原路径 */
  originalPath?: string;
}

/** 文件图标配置 */
export interface FileIconConfig {
  icon: string;
  color: string;
  bg: string;
}

/** 面包屑路径项 */
export interface BreadcrumbItem {
  title: string;
  key: string;
}

/** 概览统计项配置 */
export interface OverviewStatConfig {
  key: string;
  label: string;
  value: string | number;
  icon: string;
  color: string;
}

/** 树节点图标配置回调 */
export type TreeNodeIconResolver = (node: FileTreeNode) => { icon: string; color: string };

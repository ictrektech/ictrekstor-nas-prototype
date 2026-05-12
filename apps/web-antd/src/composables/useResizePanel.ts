import { ref, computed } from 'vue';

export interface UseResizePanelOptions {
  /** 默认宽度 */
  defaultWidth?: number;
  /** 最小宽度 */
  minWidth?: number;
  /** 最大宽度 */
  maxWidth?: number;
}

/**
 * 可拖拽调整宽度的面板组合式函数
 * @param options - 配置选项
 * @returns 面板宽度、拖拽状态、样式和拖拽启动方法
 */
export function useResizePanel(options: UseResizePanelOptions = {}) {
  const {
    defaultWidth = 220,
    minWidth = 160,
    maxWidth = 600,
  } = options;

  /** 当前面板宽度 */
  const width = ref(defaultWidth);
  /** 是否正在拖拽调整宽度 */
  const isResizing = ref(false);

  /** 启动拖拽调整 */
  function startResize(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    isResizing.value = true;
    const startX = e.clientX;
    const startWidth = width.value;

    function onMouseMove(ev: MouseEvent) {
      const delta = ev.clientX - startX;
      const newWidth = Math.max(
        minWidth,
        Math.min(maxWidth, startWidth + delta),
      );
      width.value = newWidth;
    }

    function onMouseUp() {
      isResizing.value = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }

  return {
    width,
    isResizing,
    startResize,
  };
}
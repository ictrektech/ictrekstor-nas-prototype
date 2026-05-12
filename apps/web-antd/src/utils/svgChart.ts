/**
 * 生成 SVG 折线路径（在 inner 区域内）
 * @param data - 数据点数组（0-100）
 * @param w - 内部宽度
 * @param h - 内部高度
 * @returns SVG path 字符串
 */
export function generateLinePath(data: number[], w: number, h: number): string {
  const max = 100;
  const min = 0;
  const range = max - min;
  const stepX = w / (data.length - 1);
  return data
    .map((val, i) => {
      const x = i * stepX;
      const y = h - ((val - min) / range) * h;
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    })
    .join(' ');
}

/**
 * 生成 SVG 面积路径（折线 + 底部闭合）
 * @param data - 数据点数组（0-100）
 * @param w - 内部宽度
 * @param h - 内部高度
 * @returns SVG path 字符串
 */
export function generateAreaPath(data: number[], w: number, h: number): string {
  const linePath = generateLinePath(data, w, h);
  return `${linePath} L${w},${h} L0,${h} Z`;
}
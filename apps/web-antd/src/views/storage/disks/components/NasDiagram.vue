<script lang="ts" setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { IconifyIcon } from '@vben/icons';
import type { DiskInfo } from '#/api/storage';

const props = defineProps<{
  disks: DiskInfo[];
  selectedDiskName?: string;
}>();

const emit = defineEmits<{
  (e: 'selectDisk', disk: DiskInfo | null): void;
  (e: 'locateDisk', deviceName: string): void;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const tooltipRef = ref<HTMLDivElement | null>(null);

// Canvas 尺寸（设备示意图的比例尺寸）
const CANVAS_WIDTH = 340;
const CANVAS_HEIGHT = 520;

// 设备布局参数
const DEVICE = {
  x: 40,
  y: 20,
  width: 260,
  height: 480,
  cornerRadius: 16,
  bodyColor: '#f5f5f5',
  borderColor: '#d9d9d9',
  shadowColor: 'rgba(0,0,0,0.08)',
};

// 左侧深色面板
const PANEL = {
  x: DEVICE.x + 12,
  y: DEVICE.y + 20,
  width: 48,
  height: 340,
  cornerRadius: 8,
  color: '#262626',
};

// 6个磁盘槽位参数（竖直排列）
const BAY = {
  startX: DEVICE.x + 72,
  startY: DEVICE.y + 24,
  width: 176,
  height: 52,
  gap: 8,
  cornerRadius: 8,
  borderColor: '#bfbfbf',
  filledColor: '#1677ff',
  filledBgColor: '#e6f4ff',
  emptyBgColor: '#fafafa',
  highlightColor: '#faad14',
};

// 底部接口区域
const BOTTOM = {
  x: DEVICE.x + 12,
  y: DEVICE.y + 406,
  width: 236,
  height: 54,
  cornerRadius: 8,
  bgColor: '#f0f0f0',
};

// 槽位信息（6个槽位）
interface BayInfo {
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
  disk?: DiskInfo;
}

// 计算每个槽位的位置
const bays = computed<BayInfo[]>(() => {
  const result: BayInfo[] = [];
  for (let i = 0; i < 6; i++) {
    const bayX = BAY.startX;
    const bayY = BAY.startY + i * (BAY.height + BAY.gap);
    // 查找该槽位的磁盘（简单映射：按顺序分配）
    const disk = props.disks[i] || undefined;
    result.push({
      index: i,
      x: bayX,
      y: bayY,
      width: BAY.width,
      height: BAY.height,
      disk,
    });
  }
  return result;
});

// Tooltip 状态
const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  disk: null as DiskInfo | null,
  bayIndex: -1,
});

// 绘制圆角矩形
function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.arcTo(x + width, y, x + width, y + radius, radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
  ctx.lineTo(x + radius, y + height);
  ctx.arcTo(x, y + height, x, y + height - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
}

// 主绘制函数
function draw() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 清空画布
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // 绘制设备外框阴影
  ctx.save();
  ctx.shadowColor = DEVICE.shadowColor;
  ctx.shadowBlur = 20;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 8;
  drawRoundRect(ctx, DEVICE.x, DEVICE.y, DEVICE.width, DEVICE.height, DEVICE.cornerRadius);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.restore();

  // 绘制设备边框
  drawRoundRect(ctx, DEVICE.x, DEVICE.y, DEVICE.width, DEVICE.height, DEVICE.cornerRadius);
  ctx.strokeStyle = DEVICE.borderColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 绘制设备内部背景
  drawRoundRect(ctx, DEVICE.x + 1, DEVICE.y + 1, DEVICE.width - 2, DEVICE.height - 2, DEVICE.cornerRadius - 1);
  ctx.fillStyle = DEVICE.bodyColor;
  ctx.fill();

  // 绘制左侧深色面板
  drawRoundRect(ctx, PANEL.x, PANEL.y, PANEL.width, PANEL.height, PANEL.cornerRadius);
  ctx.fillStyle = PANEL.color;
  ctx.fill();

  // 在面板上绘制品牌文字（竖排）
  ctx.save();
  ctx.translate(PANEL.x + PANEL.width / 2, PANEL.y + PANEL.height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.font = 'bold 16px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('VIVIBIT', 0, 0);
  ctx.restore();

  // 在面板底部绘制小显示屏
  const screenY = PANEL.y + PANEL.height + 12;
  drawRoundRect(ctx, PANEL.x + 4, screenY, PANEL.width - 8, 28, 4);
  ctx.fillStyle = '#1a1a1a';
  ctx.fill();
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 1;
  ctx.stroke();
  // 显示屏上的小指示灯
  ctx.beginPath();
  ctx.arc(PANEL.x + 16, screenY + 14, 3, 0, Math.PI * 2);
  ctx.fillStyle = '#52c41a';
  ctx.fill();
  ctx.font = '9px monospace';
  ctx.fillStyle = '#52c41a';
  ctx.textAlign = 'left';
  ctx.fillText('RUN', PANEL.x + 24, screenY + 17);

  // 绘制6个磁盘槽位
  bays.value.forEach((bay) => {
    const isSelected = props.selectedDiskName && bay.disk?.deviceName === props.selectedDiskName;
    const isFilled = !!bay.disk;

    // 槽位背景
    drawRoundRect(ctx, bay.x, bay.y, bay.width, bay.height, BAY.cornerRadius);
    if (isSelected) {
      // 高亮选中状态
      ctx.fillStyle = '#fff7e6';
      ctx.fill();
      ctx.strokeStyle = BAY.highlightColor;
      ctx.lineWidth = 2.5;
      ctx.stroke();
    } else if (isFilled) {
      ctx.fillStyle = BAY.filledBgColor;
      ctx.fill();
      ctx.strokeStyle = BAY.filledColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else {
      ctx.fillStyle = BAY.emptyBgColor;
      ctx.fill();
      ctx.strokeStyle = BAY.borderColor;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (isFilled && bay.disk) {
      // 绘制磁盘图标（小硬盘图标）
      const iconX = bay.x + 12;
      const iconY = bay.y + bay.height / 2;
      const iconSize = 20;

      // 硬盘外框
      drawRoundRect(ctx, iconX - iconSize / 2, iconY - iconSize / 2 + 2, iconSize, iconSize - 4, 3);
      ctx.fillStyle = isSelected ? BAY.highlightColor : BAY.filledColor;
      ctx.fill();

      // 硬盘指示灯
      ctx.beginPath();
      ctx.arc(iconX + 5, iconY + 4, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();

      // 磁盘名称
      ctx.font = 'bold 13px "SF Mono", "Fira Code", monospace';
      ctx.fillStyle = isSelected ? '#d46b08' : '#141414';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(bay.disk.deviceName, bay.x + 32, bay.y + 18);

      // 磁盘容量
      ctx.font = '11px "SF Mono", "Fira Code", monospace';
      ctx.fillStyle = isSelected ? '#d46b08' : '#1677ff';
      ctx.fillText(bay.disk.size || '', bay.x + 32, bay.y + 38);

      // 右侧状态点
      const dotColor = bay.disk.status === '运行中' ? '#52c41a' : bay.disk.status === '休眠' ? '#faad14' : '#bfbfbf';
      ctx.beginPath();
      ctx.arc(bay.x + bay.width - 14, bay.y + bay.height / 2, 5, 0, Math.PI * 2);
      ctx.fillStyle = dotColor;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(bay.x + bay.width - 14, bay.y + bay.height / 2, 5, 0, Math.PI * 2);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      // 空槽位显示
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#bfbfbf';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`槽位 ${bay.index + 1}`, bay.x + bay.width / 2, bay.y + bay.height / 2);
    }
  });

  // 绘制底部接口区域
  drawRoundRect(ctx, BOTTOM.x, BOTTOM.y, BOTTOM.width, BOTTOM.height, BOTTOM.cornerRadius);
  ctx.fillStyle = BOTTOM.bgColor;
  ctx.fill();
  ctx.strokeStyle = '#d9d9d9';
  ctx.lineWidth = 1;
  ctx.stroke();

  // 底部接口图标
  const portY = BOTTOM.y + BOTTOM.height / 2;
  const portColors = ['#1677ff', '#1677ff', '#52c41a', '#faad14'];
  const portLabels = ['LAN', 'LAN', 'USB', 'PWR'];
  for (let i = 0; i < 4; i++) {
    const portX = BOTTOM.x + 24 + i * 58;
    // 接口小矩形
    drawRoundRect(ctx, portX - 18, portY - 10, 36, 20, 4);
    ctx.fillStyle = '#e8e8e8';
    ctx.fill();
    ctx.strokeStyle = '#bfbfbf';
    ctx.lineWidth = 1;
    ctx.stroke();
    // 标签
    ctx.font = '9px sans-serif';
    ctx.fillStyle = '#8c8c8c';
    ctx.textAlign = 'center';
    ctx.fillText(portLabels[i], portX, portY + 18);
    // 指示灯
    ctx.beginPath();
    ctx.arc(portX + 12, portY - 14, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = portColors[i];
    ctx.fill();
  }
}

// 处理点击事件
function handleClick(event: MouseEvent) {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (event.clientX - rect.left) * scaleX;
  const y = (event.clientY - rect.top) * scaleY;

  // 检查点击了哪个槽位
  let clickedBay: BayInfo | null = null;
  for (const bay of bays.value) {
    if (
      x >= bay.x &&
      x <= bay.x + bay.width &&
      y >= bay.y &&
      y <= bay.y + bay.height
    ) {
      clickedBay = bay;
      break;
    }
  }

  if (clickedBay) {
    if (clickedBay.disk) {
      emit('selectDisk', clickedBay.disk);
      // 显示 tooltip
      tooltip.value = {
        visible: true,
        x: event.clientX - rect.left + 16,
        y: event.clientY - rect.top,
        disk: clickedBay.disk,
        bayIndex: clickedBay.index,
      };
    } else {
      emit('selectDisk', null);
      tooltip.value.visible = false;
    }
  } else {
    tooltip.value.visible = false;
  }

  // 重绘以更新高亮
  draw();
}

// 处理鼠标移动（用于cursor样式）
function handleMouseMove(event: MouseEvent) {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (event.clientX - rect.left) * scaleX;
  const y = (event.clientY - rect.top) * scaleY;

  let hoveringBay = false;
  for (const bay of bays.value) {
    if (
      x >= bay.x &&
      x <= bay.x + bay.width &&
      y >= bay.y &&
      y <= bay.y + bay.height
    ) {
      hoveringBay = true;
      break;
    }
  }

  canvas.style.cursor = hoveringBay ? 'pointer' : 'default';
}

// 隐藏 tooltip
function hideTooltip() {
  tooltip.value.visible = false;
}

// 监听数据变化重绘
watch(() => props.disks, draw, { deep: true });
watch(() => props.selectedDiskName, draw);

onMounted(() => {
  draw();
});

// 暴露方法给父组件
function highlightBay(deviceName: string) {
  emit('locateDisk', deviceName);
  draw();
}

defineExpose({ highlightBay });
</script>

<template>
  <div class="nas-diagram-container">
    <canvas
      ref="canvasRef"
      :width="CANVAS_WIDTH"
      :height="CANVAS_HEIGHT"
      class="nas-canvas"
      @click="handleClick"
      @mousemove="handleMouseMove"
      @mouseleave="hideTooltip"
    />

    <!-- Tooltip -->
    <div
      v-if="tooltip.visible && tooltip.disk"
      ref="tooltipRef"
      class="bay-tooltip"
      :style="{
        left: `${tooltip.x}px`,
        top: `${tooltip.y}px`,
      }"
    >
      <div class="tooltip-header">
        <IconifyIcon icon="lucide:hard-drive" class="tooltip-icon" />
        <span class="tooltip-title">{{ tooltip.disk.deviceName }}</span>
      </div>
      <div class="tooltip-body">
        <div class="tooltip-row">
          <span class="tooltip-label">槽位</span>
          <span class="tooltip-value">#{{ tooltip.bayIndex + 1 }}</span>
        </div>
        <div class="tooltip-row">
          <span class="tooltip-label">型号</span>
          <span class="tooltip-value">{{ tooltip.disk.model || '--' }}</span>
        </div>
        <div class="tooltip-row">
          <span class="tooltip-label">序列号</span>
          <span class="tooltip-value mono">{{ tooltip.disk.serial || '--' }}</span>
        </div>
        <div class="tooltip-row">
          <span class="tooltip-label">容量</span>
          <span class="tooltip-value">{{ tooltip.disk.size || '--' }}</span>
        </div>
        <div class="tooltip-row">
          <span class="tooltip-label">状态</span>
          <span
            class="tooltip-status"
            :style="{
              color: tooltip.disk.status === '运行中' ? '#52c41a' : tooltip.disk.status === '休眠' ? '#faad14' : '#bfbfbf',
            }"
          >
            {{ tooltip.disk.status || '--' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nas-diagram-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px;
}

.nas-canvas {
  width: 340px;
  height: 520px;
  /* 保持清晰 */
  image-rendering: crisp-edges;
}

.bay-tooltip {
  position: absolute;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  padding: 12px 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 100;
  min-width: 200px;
  pointer-events: none;
  animation: tooltip-in 0.2s ease;
}

@keyframes tooltip-in {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tooltip-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.tooltip-icon {
  font-size: 16px;
  color: #1677ff;
}

.tooltip-title {
  font-size: 14px;
  font-weight: 700;
  color: #141414;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.tooltip-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tooltip-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.tooltip-label {
  font-size: 12px;
  color: #8c8c8c;
  flex-shrink: 0;
}

.tooltip-value {
  font-size: 12px;
  color: #262626;
  font-weight: 500;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 130px;
}

.tooltip-value.mono {
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.tooltip-status {
  font-size: 12px;
  font-weight: 600;
}
</style>

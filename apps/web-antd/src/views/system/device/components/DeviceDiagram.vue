<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue';
import type { DiskInfo } from '#/api/storage';

const props = defineProps<{
  disks: DiskInfo[];
  selectedDiskName?: string;
  mode: 'front' | 'rear';
}>();

const emit = defineEmits<{
  (e: 'selectDisk', disk: DiskInfo | null): void;
  (e: 'locateDisk', deviceName: string): void;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);

// Canvas 尺寸
const CANVAS_WIDTH = 380;
const CANVAS_HEIGHT = 520;

// 设备布局参数
const DEVICE = {
  x: 40,
  y: 20,
  width: 300,
  height: 480,
  cornerRadius: 16,
  bodyColor: '#f5f5f5',
  borderColor: '#d9d9d9',
  shadowColor: 'rgba(0,0,0,0.08)',
};

// 前面板参数
const FRONT_PANEL = {
  x: DEVICE.x + 12,
  y: DEVICE.y + 20,
  width: 56,
  height: 340,
  cornerRadius: 8,
  color: '#262626',
};

// 6个磁盘槽位参数（前面板）
const BAY = {
  startX: DEVICE.x + 80,
  startY: DEVICE.y + 24,
  width: 200,
  height: 52,
  gap: 8,
  cornerRadius: 8,
  borderColor: '#bfbfbf',
  filledColor: '#1677ff',
  filledBgColor: '#e6f4ff',
  emptyBgColor: '#fafafa',
  highlightColor: '#faad14',
};

// 底部接口区域（前面板）
const FRONT_BOTTOM = {
  x: DEVICE.x + 12,
  y: DEVICE.y + 406,
  width: 276,
  height: 54,
  cornerRadius: 8,
  bgColor: '#f0f0f0',
};

// 后面板参数
const REAR_PANEL = {
  fanX: DEVICE.x + 20,
  fanY: DEVICE.y + 24,
  fanSize: 120,
};

interface BayInfo {
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
  disk?: DiskInfo;
}

const bays = computed<BayInfo[]>(() => {
  const result: BayInfo[] = [];
  for (let i = 0; i < 6; i++) {
    const bayX = BAY.startX;
    const bayY = BAY.startY + i * (BAY.height + BAY.gap);
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

// 内部高亮状态（支持直接高亮而不依赖 prop 异步更新）
const highlightedDisk = ref('');

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

function drawFan(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, rotation: number) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);

  // 风扇外框
  ctx.beginPath();
  ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
  ctx.fillStyle = '#e8e8e8';
  ctx.fill();
  ctx.strokeStyle = '#bfbfbf';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 风扇中心
  ctx.beginPath();
  ctx.arc(0, 0, size / 10, 0, Math.PI * 2);
  ctx.fillStyle = '#d9d9d9';
  ctx.fill();

  // 风扇叶片
  const bladeCount = 7;
  for (let i = 0; i < bladeCount; i++) {
    const angle = (i / bladeCount) * Math.PI * 2;
    ctx.save();
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.ellipse(0, -size / 3.5, size / 10, size / 3, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#c4c4c4';
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
}

function drawPort(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  color: string,
  ledColor?: string,
) {
  drawRoundRect(ctx, x, y, width, height, 4);
  ctx.fillStyle = '#e8e8e8';
  ctx.fill();
  ctx.strokeStyle = '#bfbfbf';
  ctx.lineWidth = 1;
  ctx.stroke();

  // 内部金属触点
  ctx.fillStyle = '#8c8c8c';
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(x + 4 + i * 4, y + 4, 2, height - 8);
  }

  // 标签
  ctx.font = '9px sans-serif';
  ctx.fillStyle = '#595959';
  ctx.textAlign = 'center';
  ctx.fillText(label, x + width / 2, y + height + 14);

  // LED指示灯
  if (ledColor) {
    ctx.beginPath();
    ctx.arc(x + width - 4, y - 6, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = ledColor;
    ctx.fill();
  }
}

function drawFrontPanel(ctx: CanvasRenderingContext2D) {
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
  drawRoundRect(ctx, FRONT_PANEL.x, FRONT_PANEL.y, FRONT_PANEL.width, FRONT_PANEL.height, FRONT_PANEL.cornerRadius);
  ctx.fillStyle = FRONT_PANEL.color;
  ctx.fill();

  // 品牌文字（竖排）
  ctx.save();
  ctx.translate(FRONT_PANEL.x + FRONT_PANEL.width / 2, FRONT_PANEL.y + FRONT_PANEL.height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.font = 'bold 16px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('VIVIBIT', 0, 0);
  ctx.restore();

  // 显示屏
  const screenY = FRONT_PANEL.y + FRONT_PANEL.height + 12;
  drawRoundRect(ctx, FRONT_PANEL.x + 4, screenY, FRONT_PANEL.width - 8, 28, 4);
  ctx.fillStyle = '#1a1a1a';
  ctx.fill();
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(FRONT_PANEL.x + 16, screenY + 14, 3, 0, Math.PI * 2);
  ctx.fillStyle = '#52c41a';
  ctx.fill();
  ctx.font = '9px monospace';
  ctx.fillStyle = '#52c41a';
  ctx.textAlign = 'left';
  ctx.fillText('RUN', FRONT_PANEL.x + 24, screenY + 17);

  // 绘制6个磁盘槽位
  bays.value.forEach((bay) => {
    const isSelected = (props.selectedDiskName && bay.disk?.deviceName === props.selectedDiskName) || bay.disk?.deviceName === highlightedDisk.value;
    const isFilled = !!bay.disk;

    drawRoundRect(ctx, bay.x, bay.y, bay.width, bay.height, BAY.cornerRadius);
    if (isSelected) {
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
      // 磁盘图标
      const iconX = bay.x + 14;
      const iconY = bay.y + bay.height / 2;
      const iconSize = 20;
      drawRoundRect(ctx, iconX - iconSize / 2, iconY - iconSize / 2 + 2, iconSize, iconSize - 4, 3);
      ctx.fillStyle = isSelected ? BAY.highlightColor : BAY.filledColor;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(iconX + 5, iconY + 4, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();

      // 磁盘名称
      ctx.font = 'bold 13px "SF Mono", "Fira Code", monospace';
      ctx.fillStyle = isSelected ? '#d46b08' : '#141414';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(bay.disk.deviceName, bay.x + 34, bay.y + 18);

      // 磁盘容量
      ctx.font = '11px "SF Mono", "Fira Code", monospace';
      ctx.fillStyle = isSelected ? '#d46b08' : '#1677ff';
      ctx.fillText(bay.disk.size || '', bay.x + 34, bay.y + 38);

      // 状态点
      const dotColor = bay.disk.status === '运行中' ? '#52c41a' : bay.disk.status === '休眠' ? '#faad14' : '#bfbfbf';
      ctx.beginPath();
      ctx.arc(bay.x + bay.width - 16, bay.y + bay.height / 2, 5, 0, Math.PI * 2);
      ctx.fillStyle = dotColor;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(bay.x + bay.width - 16, bay.y + bay.height / 2, 5, 0, Math.PI * 2);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#bfbfbf';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`槽位 ${bay.index + 1}`, bay.x + bay.width / 2, bay.y + bay.height / 2);
    }
  });

  // 底部接口区域
  drawRoundRect(ctx, FRONT_BOTTOM.x, FRONT_BOTTOM.y, FRONT_BOTTOM.width, FRONT_BOTTOM.height, FRONT_BOTTOM.cornerRadius);
  ctx.fillStyle = FRONT_BOTTOM.bgColor;
  ctx.fill();
  ctx.strokeStyle = '#d9d9d9';
  ctx.lineWidth = 1;
  ctx.stroke();

  // 底部接口
  const portY = FRONT_BOTTOM.y + FRONT_BOTTOM.height / 2;
  const portColors = ['#1677ff', '#1677ff', '#52c41a', '#faad14'];
  const portLabels = ['LAN', 'LAN', 'USB', 'PWR'];
  for (let i = 0; i < 4; i++) {
    const portX = FRONT_BOTTOM.x + 30 + i * 66;
    drawRoundRect(ctx, portX - 18, portY - 10, 36, 20, 4);
    ctx.fillStyle = '#e8e8e8';
    ctx.fill();
    ctx.strokeStyle = '#bfbfbf';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.font = '9px sans-serif';
    ctx.fillStyle = '#8c8c8c';
    ctx.textAlign = 'center';
    ctx.fillText(portLabels[i], portX, portY + 18);
    ctx.beginPath();
    ctx.arc(portX + 12, portY - 14, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = portColors[i];
    ctx.fill();
  }
}

function drawRearPanel(ctx: CanvasRenderingContext2D) {
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
  ctx.fillStyle = '#fafafa';
  ctx.fill();

  // 顶部标题区
  ctx.fillStyle = '#f0f0f0';
  drawRoundRect(ctx, DEVICE.x + 8, DEVICE.y + 8, DEVICE.width - 16, 32, 6);
  ctx.fill();
  ctx.font = 'bold 13px sans-serif';
  ctx.fillStyle = '#595959';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('VIVIBIT NAS - 后面板', DEVICE.x + DEVICE.width / 2, DEVICE.y + 24);

  // 散热风扇区域（两个大风扇）
  const fan1X = DEVICE.x + 80;
  const fan1Y = DEVICE.y + 70;
  const fan2X = DEVICE.x + 220;
  const fan2Y = DEVICE.y + 70;
  drawFan(ctx, fan1X, fan1Y, 90, 0);
  drawFan(ctx, fan2X, fan2Y, 90, Math.PI / 7);

  // 风扇标签
  ctx.font = '10px sans-serif';
  ctx.fillStyle = '#8c8c8c';
  ctx.textAlign = 'center';
  ctx.fillText('系统风扇 ×2', DEVICE.x + DEVICE.width / 2, fan1Y + 65);

  // 接口区域背景
  const ioAreaY = DEVICE.y + 170;
  drawRoundRect(ctx, DEVICE.x + 16, ioAreaY, DEVICE.width - 32, 280, 8);
  ctx.fillStyle = '#f5f5f5';
  ctx.fill();
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 1;
  ctx.stroke();

  // 区域标题
  ctx.font = 'bold 12px sans-serif';
  ctx.fillStyle = '#8c8c8c';
  ctx.textAlign = 'left';
  ctx.fillText('网络接口', DEVICE.x + 28, ioAreaY + 20);

  // 网口（2个千兆网口）
  drawPort(ctx, DEVICE.x + 28, ioAreaY + 30, 44, 32, 'LAN1', '#1677ff', '#52c41a');
  drawPort(ctx, DEVICE.x + 86, ioAreaY + 30, 44, 32, 'LAN2', '#1677ff', '#52c41a');

  // USB接口
  ctx.font = 'bold 12px sans-serif';
  ctx.fillStyle = '#8c8c8c';
  ctx.fillText('USB 接口', DEVICE.x + 28, ioAreaY + 90);

  for (let i = 0; i < 3; i++) {
    const usbX = DEVICE.x + 28 + i * 50;
    drawPort(ctx, usbX, ioAreaY + 100, 36, 24, `USB${i + 1}`, '#faad14');
  }

  // HDMI接口
  ctx.font = 'bold 12px sans-serif';
  ctx.fillStyle = '#8c8c8c';
  ctx.fillText('视频输出', DEVICE.x + 28, ioAreaY + 155);
  drawPort(ctx, DEVICE.x + 28, ioAreaY + 165, 40, 28, 'HDMI', '#eb2f96');

  // 电源接口
  ctx.font = 'bold 12px sans-serif';
  ctx.fillStyle = '#8c8c8c';
  ctx.fillText('电源', DEVICE.x + 180, ioAreaY + 155);
  drawRoundRect(ctx, DEVICE.x + 180, ioAreaY + 165, 50, 32, 4);
  ctx.fillStyle = '#595959';
  ctx.fill();
  ctx.font = '9px sans-serif';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.fillText('DC IN', DEVICE.x + 205, ioAreaY + 184);

  // 接地螺丝
  ctx.font = 'bold 12px sans-serif';
  ctx.fillStyle = '#8c8c8c';
  ctx.textAlign = 'left';
  ctx.fillText('扩展', DEVICE.x + 28, ioAreaY + 220);

  // PCIe扩展槽
  for (let i = 0; i < 2; i++) {
    const slotX = DEVICE.x + 28 + i * 130;
    drawRoundRect(ctx, slotX, ioAreaY + 230, 110, 24, 3);
    ctx.fillStyle = '#e0e0e0';
    ctx.fill();
    ctx.strokeStyle = '#bfbfbf';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.font = '9px sans-serif';
    ctx.fillStyle = '#8c8c8c';
    ctx.textAlign = 'center';
    ctx.fillText(`PCIe x4 插槽 ${i + 1}`, slotX + 55, ioAreaY + 245);
  }
}

function draw() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  if (props.mode === 'front') {
    drawFrontPanel(ctx);
  } else {
    drawRearPanel(ctx);
  }
}

function handleClick(event: MouseEvent) {
  if (props.mode !== 'front') {
    tooltip.value.visible = false;
    return;
  }

  const canvas = canvasRef.value;
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (event.clientX - rect.left) * scaleX;
  const y = (event.clientY - rect.top) * scaleY;

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

  draw();
}

function handleMouseMove(event: MouseEvent) {
  if (props.mode !== 'front') {
    const canvas = canvasRef.value;
    if (canvas) canvas.style.cursor = 'default';
    return;
  }

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

function hideTooltip() {
  tooltip.value.visible = false;
}

watch(() => props.disks, draw, { deep: true });
watch(() => props.selectedDiskName, () => { highlightedDisk.value = props.selectedDiskName || ''; draw(); });
watch(() => props.mode, draw);

onMounted(() => {
  draw();
});

function highlightBay(deviceName: string) {
  highlightedDisk.value = deviceName;
  emit('locateDisk', deviceName);
  draw();
}

defineExpose({ highlightBay });
</script>

<template>
  <div class="device-diagram-container">
    <canvas
      ref="canvasRef"
      :width="CANVAS_WIDTH"
      :height="CANVAS_HEIGHT"
      class="device-canvas"
      @click="handleClick"
      @mousemove="handleMouseMove"
      @mouseleave="hideTooltip"
    />

    <!-- Tooltip（仅前面板模式下显示） -->
    <div
      v-if="tooltip.visible && tooltip.disk && mode === 'front'"
      class="bay-tooltip"
      :style="{
        left: `${tooltip.x}px`,
        top: `${tooltip.y}px`,
      }"
    >
      <div class="tooltip-header">
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
.device-diagram-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px;
}

.device-canvas {
  width: 380px;
  height: 520px;
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

.tooltip-status {
  font-size: 12px;
  font-weight: 600;
}
</style>

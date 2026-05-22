<script lang="ts" setup>
import { computed, ref } from 'vue';
import { Popover } from 'ant-design-vue';
import type { DiskInfo } from '#/api/storage';

/**
 * 网口指示灯配置（背面板）。
 * 每个端口上方有 1 或多个小矩形 LED：
 *   - 'normal' → 绿（var(--ict-success)）
 *   - 'error'  → 红（var(--ict-danger)）
 *   - 'off'    → 灰（var(--ict-text-disabled)）
 */
export type RearLedStatus = 'normal' | 'error' | 'off';
export interface RearPortLed {
  /** LED 中心横坐标百分比 */
  left: string;
  /** LED 顶部纵坐标百分比 */
  top: string;
  status: RearLedStatus;
}

const props = withDefaults(
  defineProps<{
    disks: DiskInfo[];
    selectedDisk?: string;
    mode: 'front' | 'rear';
    /** 背面板网口指示灯列表 */
    rearLeds?: RearPortLed[];
  }>(),
  {
    rearLeds: () => [
      // 1G 网口：左绿 + 右红
      { left: '26.61%', top: '79.38%', status: 'normal' },
      { left: '36.15%', top: '79.38%', status: 'error' },
      // 10G 网口：左红 + 右绿
      { left: '48.43%', top: '79.38%', status: 'error' },
      { left: '57.96%', top: '79.38%', status: 'normal' },
      // 100G 端口：4 个绿色
      { left: '72.59%', top: '79.38%', status: 'normal' },
      { left: '78.40%', top: '79.38%', status: 'normal' },
      { left: '84.20%', top: '79.38%', status: 'normal' },
      { left: '90%', top: '79.38%', status: 'normal' },
    ],
  },
);

const emit = defineEmits<{
  (e: 'select', disk: DiskInfo | null): void;
  (e: 'locate', deviceName: string): void;
}>();

// 内部高亮（鼠标点击插槽 / 外部 highlightBay 调用时设置）
const highlightedDisk = ref('');

const imageSrc = computed(() =>
  props.mode === 'front'
    ? '/icons/E1001-front.png'
    : '/icons/E1001%20back.png',
);

const altText = computed(() =>
  props.mode === 'front' ? 'E1001 前面板' : 'E1001 后面板',
);

/**
 * 前面板硬盘槽位配置（基于 E1001 前面板设计图百分比定位）。
 * 3 个槽位水平并排，每个槽位下方有一个 LED 圆点指示硬盘状态：
 *   - 运行中 → 蓝色（var(--ict-primary)）
 *   - 休眠   → 橙色（var(--ict-warning)）
 *   - 无硬盘 → 灰色（var(--ict-text-disabled)）
 */
const BAY_COUNT_FRONT = 3;

interface BayHotspot {
  index: number;
  disk?: DiskInfo;
  /** 槽位矩形百分比定位（相对图片显示区域） */
  top: string;
  left: string;
  width: string;
  height: string;
  /** LED 圆点垂直位置（百分比） */
  ledTop: string;
}

// 槽位横向布局（百分比）—— 基于设计图 224×388 精确测量
// 槽位 1: left 20/224 ≈ 8.92%, width 40.5/224 ≈ 18.1%
// 槽位 2: left 110/224 ≈ 49.12%, width 40.5/224 ≈ 18.1%（居中）
// 槽位 3: left 158/224 ≈ 70.53%,   width 40.5/224 ≈ 18.1%
const BAY_LAYOUT = [
  { left: '8.92%', width: '18.1%' }, // 槽位 1
  { left: '49.12%', width: '18.1%' }, // 槽位 2
  { left: '70.53%', width: '18.1%' }, // 槽位 3
];

// 槽位与 LED 的纵向位置（百分比，基于设计图 224×388）
// 槽位 top 36/388 ≈ 9.3%, height 245/388 ≈ 63.14%
// LED top 286/388 ≈ 73.7%
const BAY_TOP = '9.3%';
const BAY_HEIGHT = '63.14%';
const LED_TOP = '73.7%';

const bays = computed<BayHotspot[]>(() => {
  return BAY_LAYOUT.map((layout, i) => ({
    index: i,
    disk: props.disks[i],
    top: BAY_TOP,
    left: layout.left,
    width: layout.width,
    height: BAY_HEIGHT,
    ledTop: LED_TOP,
  }));
});

/** LED 颜色映射：根据硬盘状态返回语义色（与槽位 hover/选中状态色一致） */
function getLedColor(disk?: DiskInfo): string {
  if (!disk) return 'var(--ict-text-disabled)'; // 灰：无硬盘
  switch (disk.status) {
    case '休眠':
      return 'var(--ict-warning)'; // 橙：休眠（warning）
    case '运行中':
    default:
      return 'var(--ict-success)'; // 绿：运行中（success）
  }
}

/** 槽位语义色配置：根据硬盘状态返回 hover/选中态需要的主色与浅色 */
function getBayStateColors(disk?: DiskInfo): {
  main: string;
  light: string;
} {
  if (!disk) {
    // 空槽位仍使用品牌主色（无状态语义）
    return { main: 'var(--ict-primary)', light: 'var(--ict-primary-light)' };
  }
  switch (disk.status) {
    case '休眠':
      return { main: 'var(--ict-warning)', light: 'var(--ict-warning-light)' };
    case '运行中':
    default:
      return { main: 'var(--ict-success)', light: 'var(--ict-success-light)' };
  }
}


function handleBayClick(bay: BayHotspot) {
  if (bay.disk) {
    highlightedDisk.value = bay.disk.deviceName;
    emit('select', bay.disk);
  } else {
    emit('select', null);
  }
}

function highlightBay(deviceName: string) {
  highlightedDisk.value = deviceName;
  emit('locate', deviceName);
}

defineExpose({ highlightBay });
</script>

<template>
  <div class="device-diagram-container">
    <div class="device-image-wrap">
      <img :src="imageSrc" :alt="altText" class="device-image" draggable="false" />

      <!-- 仅前面板显示可点击的硬盘插槽热区 + LED 指示灯 -->
      <template v-if="mode === 'front'">
        <!-- 白色遮罩：盖住原图中默认的单凹槽痕迹，使 3 个槽位独立可见 -->
        <div class="bay-bg-mask" />

        <!-- 槽位（可点击长矩形，点击弹出硬盘状态 Popover） -->
        <Popover
          v-for="bay in bays"
          :key="`popover-${bay.index}`"
          :trigger="bay.disk ? 'click' : ''"
          :visible="bay.disk && selectedDisk === bay.disk.deviceName && highlightedDisk === bay.disk.deviceName"
          placement="right"
          @visible-change="(val: boolean) => val || (highlightedDisk = '')"
        >
          <template #title>
            <span class="popover-title">
              {{ bay.disk?.deviceName || `槽位 ${bay.index + 1}` }}
            </span>
          </template>
          <template #content v-if="bay.disk">
            <div class="popover-content">
              <div class="popover-row">
                <span class="popover-label">槽位</span>
                <span class="popover-value">#{{ bay.index + 1 }}</span>
              </div>
              <div class="popover-row">
                <span class="popover-label">型号</span>
                <span class="popover-value">{{ bay.disk.model || '--' }}</span>
              </div>
              <div class="popover-row">
                <span class="popover-label">容量</span>
                <span class="popover-value">{{ bay.disk.size || '--' }}</span>
              </div>
              <div class="popover-row">
                <span class="popover-label">状态</span>
                <span
                  class="popover-value popover-status"
                  :style="{
                    color:
                      bay.disk.status === '运行中'
                        ? 'var(--ict-success)'
                        : bay.disk.status === '休眠'
                          ? 'var(--ict-warning)'
                          : 'var(--ict-text-disabled)',
                  }"
                >
                  {{ bay.disk.status || '--' }}
                </span>
              </div>
            </div>
          </template>

          <!-- 槽位按钮（作为 Popover 的 ref 插槽）
               通过 CSS 变量 --bay-main / --bay-light 将状态语义色注入到 hover 和选中态 -->
          <button
            type="button"
            class="bay-hotspot"
            :class="{
              'bay-hotspot--selected':
                bay.disk &&
                (selectedDisk === bay.disk.deviceName ||
                  highlightedDisk === bay.disk.deviceName),
            }"
            :style="{
              top: bay.top,
              left: bay.left,
              width: bay.width,
              height: bay.height,
              '--bay-main': getBayStateColors(bay.disk).main,
              '--bay-light': getBayStateColors(bay.disk).light,
            }"
            @click="handleBayClick(bay)"
          >
            <span class="bay-hotspot__index">{{ bay.index + 1 }}</span>
          </button>
        </Popover>

        <!-- LED 状态指示灯（圆点） -->
        <span
          v-for="bay in bays"
          :key="`led-${bay.index}`"
          class="bay-led"
          :style="{
            top: bay.ledTop,
            left: bay.left,
            width: bay.width,
            '--led-color': getLedColor(bay.disk),
          }"
          :title="bay.disk ? `${bay.disk.deviceName} · ${bay.disk.status || ''}` : '无硬盘'"
        />
      </template>

      <!-- 仅背面板显示网口指示灯（小矩形 LED） -->
      <template v-if="mode === 'rear'">
        <span
          v-for="(led, i) in rearLeds"
          :key="`rear-led-${i}`"
          class="rear-led"
          :class="`rear-led--${led.status}`"
          :style="{ top: led.top, left: led.left }"
        />
      </template>
    </div>
  </div>
</template>

<style scoped>
.device-diagram-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px;
}

.device-image-wrap {
  position: relative;
  width: 220px;
  /* 与图片原始比例一致 220:404 */
  aspect-ratio: 220 / 404;
}

.device-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
}

/* 硬盘槽位热区：默认浅灰边框，hover/选中态按硬盘状态语义着色
   --bay-main / --bay-light 由 inline style 注入：
     运行中 → success 绿 / success-light 浅绿
     休眠   → warning 橙 / warning-light 浅橙
     空槽位 → primary 蓝 / primary-light 浅蓝 */
.bay-hotspot {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: #F6F6F6;
  border: 2px solid var(--ict-border);
  border-radius: 4px;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;
}

.bay-hotspot:hover {
  background: var(--bay-light);
  border-color: var(--bay-main);
}

/* 选中态：语义浅色底 + 语义色实线边框 */
.bay-hotspot--selected,
.bay-hotspot--selected:hover {
  background: var(--bay-light);
  border-color: var(--bay-main);
  border-width: 2px;
}

.bay-hotspot__index {
  font-size: var(--ict-title-medium);
  font-weight: 500;
  color: var(--ict-text-disabled);
  pointer-events: none;
}

.bay-hotspot--selected .bay-hotspot__index {
  color: var(--bay-main);
}

/* LED 圆点：位于槽位下方，颜色映射硬盘状态。
   span 元素本身作为"对齐范围"（与所属槽位等宽），实际圆点由 ::before 居中绘制。 */
.bay-led {
  position: absolute;
  pointer-events: none;
  text-align: center;
  line-height: 0;
}

.bay-led::before {
  content: '';
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--led-color);
  box-shadow: 0 0 4px var(--led-color);
}

/* Popover 内容样式 */
.popover-title {
  font-size: var(--ict-title-small);
  font-weight: 600;
  color: var(--ict-text-emphasis);
}

.popover-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 180px;
  padding: 4px 0;
}

.popover-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  font-size: var(--ict-body-medium);
}

.popover-label {
  color: var(--ict-text-secondary);
}

.popover-value {
  color: var(--ict-text-primary);
  font-weight: 500;
}

.popover-status {
  font-weight: 600;
}

/* 背面板网口指示灯（小矩形 LED）：位于网口/100G 端口上方
   - normal → 绿（var(--ict-success)）
   - error  → 红（var(--ict-danger)）
   - off    → 灰（var(--ict-text-disabled)） */
.rear-led {
  position: absolute;
  width: 6px;
  height: 3px;
  /* 中心对齐 left 百分比 */
  transform: translateX(-50%);
  pointer-events: none;
}

.rear-led--normal {
  background: var(--ict-success);
}

.rear-led--error {
  background: var(--ict-danger);
}

.rear-led--off {
  background: var(--ict-text-disabled);
}
</style>

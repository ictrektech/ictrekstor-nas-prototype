<script lang="ts" setup>
import { computed } from 'vue';
import { Button } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';

interface Props {
  /** 页面主标题 */
  title: string;
  /** 副标题/描述（标题下方一行小字） */
  subtitle?: string;
  /** @deprecated 旧 prop，等同于 subtitle，向后兼容保留 */
  description?: string;
  /**
   * 返回按钮文本中的"上一级目录名"。
   * 设置后会在副标题下方渲染【← 返回{backLabel}】small 线框按钮。
   * 例如：传入 "磁盘管理" → 显示 "返回磁盘管理"
   */
  backLabel?: string;
  /** 是否显示底部边框（默认 true） */
  showBorder?: boolean;
  /** @deprecated 旧 prop，原图标已不再渲染，保留以避免破坏调用方 */
  icon?: string;
  /** @deprecated 旧 prop，已不再使用 */
  iconColor?: string;
}


const props = withDefaults(defineProps<Props>(), {
  showBorder: true,
});

const emit = defineEmits<{
  /** 点击返回按钮触发 */
  (e: 'back'): void;
}>();

const showBackBtn = computed(() => !!props.backLabel);

/** 副标题文本：优先 subtitle，向后兼容旧 description prop */
const subtitleText = computed(() => props.subtitle ?? props.description ?? '');

</script>

<script lang="ts">
export default { name: 'PageHeader' };
</script>

<template>
  <div
    class="page-header"
    :class="{ 'page-header-bordered': showBorder }"
  >
    <!-- 左侧：标题 + 副标题 + 返回按钮 -->
    <div class="page-header-left">
      <h1 class="page-title">{{ title }}</h1>
      <p v-if="subtitleText" class="page-subtitle">{{ subtitleText }}</p>
      <!-- 返回按钮：仅当传入 backLabel 时渲染 -->
      <Button
        v-if="showBackBtn"
        size="small"
        class="back-btn"
        @click="emit('back')"
      >
        <IconifyIcon icon="lucide:arrow-left" class="back-icon" />
        返回{{ backLabel }}
      </Button>
      <!-- 旧 actions 插槽：在副标题下方展示按钮区域（向后兼容） -->
      <div class="page-header-actions">
        <slot name="actions" />
      </div>
    </div>

    <!-- 右侧：概览卡片或自定义操作（通过 extra 插槽传入） -->
    <div class="page-header-right">
      <slot name="extra" />
    </div>
  </div>
</template>

<style scoped>
/* 头部容器：左右两栏布局，独立通栏（不受父容器水平 padding 影响） */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--ict-space-4) var(--ict-space-5);
  background: var(--ict-bg-card);
  gap: var(--ict-space-4);
  flex-shrink: 0;
  flex-wrap: wrap;
  /* 负 margin 抵消父容器（main）的水平 padding，实现通栏撑满 */

}

.page-header-bordered {
  border-bottom: 1px solid var(--ict-border-light);
}

/* 左侧：垂直堆叠 标题 / 副标题 / 返回按钮 */
.page-header-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.page-title {
  font-size: var(--ict-title-large);
  font-weight: 700;
  color: var(--ict-text-emphasis);
  margin: 0;
  line-height: 1.4;
}

.page-subtitle {
  font-size: var(--ict-body-small);
  color: var(--ict-text-secondary);
  margin: 0;
  line-height: 18px;
}

/* 返回按钮：放在副标题下方独立一行，宽度自适应 */
.back-btn {
  margin-top: var(--ict-space-2);
  display: inline-flex;
  align-items: center;
  gap: var(--ict-space-1);
  align-self: flex-start;
}

.back-icon {
  font-size: 14px;
}

/* 旧 actions 插槽按钮间距 */
.page-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: var(--ict-space-2);
}

/* 清除 Ant Design 按钮默认相邻间距，确保只由 gap 控制 */
.page-header-actions :deep(.ant-btn + .ant-btn) {
  margin-left: 0;
}

/* 右侧：概览卡片横向排列 */
.page-header-right {
  display: flex;
  align-items: center;
  gap: var(--ict-space-3);
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-header-right {
    width: 100%;
  }
}
</style>

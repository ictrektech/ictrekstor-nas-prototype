<script lang="ts" setup>
import PageIconBox from './PageIconBox.vue';

interface Props {
  /** 页面图标（Iconify 图标名） */
  icon: string;
  /** 图标颜色（默认主色 #006BE6） */
  iconColor?: string;
  /** 页面主标题 */
  title: string;
  /** 页面描述 */
  description?: string;
  /** 是否显示底部边框（默认 true） */
  showBorder?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  iconColor: 'var(--ict-primary)',
  showBorder: true,
});
</script>

<script lang="ts">
export default { name: 'PageHeader' };
</script>

<template>
  <div
    class="page-header"
    :class="{ 'page-header-bordered': showBorder }"
  >
    <div class="page-header-left">
      <PageIconBox :icon="icon" :color="iconColor" />
      <div class="page-header-meta">
        <h1 class="page-title">{{ title }}</h1>
        <p v-if="description" class="page-desc">{{ description }}</p>
        <div class="page-header-actions">
          <slot name="actions" />
        </div>
      </div>
    </div>
    <div class="page-header-right">
      <slot name="extra" />
    </div>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--ict-space-3) var(--ict-space-5);
  background: var(--ict-bg-card);
  gap: var(--ict-space-4);
  flex-shrink: 0;
  margin: 0 calc(-1 * var(--ict-space-5)) var(--ict-space-4);
}

.page-header-bordered {
  border-bottom: 1px solid var(--ict-border-light);
}

.page-header-left {
  display: flex;
  align-items: center;
  gap: var(--ict-space-3);
}

.page-header-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.page-title {
  font-size: var(--ict-text-xl);
  font-weight: 600;
  color: var(--ict-text-emphasis);
  margin: 0;
  line-height: 1.4;
}

.page-desc {
  font-size: var(--ict-text-sm);
  color: var(--ict-text-secondary);
  margin: 2px 0 0;
}

.page-header-actions {
  display: flex;
  align-items: center;
  gap: var(--ict-space-2);
  margin-top: var(--ict-space-2);
}

.page-header-right {
  display: flex;
  align-items: center;
  gap: var(--ict-space-3);
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

<script lang="ts" setup>
import { Card, Tag } from 'ant-design-vue';
import { IconifyIcon } from '@vben/icons';

interface Props {
  /** 区块图标（Iconify 图标名） */
  icon?: string;
  /** 图标颜色 */
  iconColor?: string;
  /** 区块标题 */
  title: string;
  /** 数量角标 */
  count?: number;
  /** 卡片 body 的 padding */
  bodyPadding?: string;
}

const props = withDefaults(defineProps<Props>(), {
  iconColor: 'var(--ict-primary)',
  bodyPadding: '16px',
});
</script>

<script lang="ts">
export default { name: 'SectionCard' };
</script>

<template>
  <Card
    class="section-card"
    :bordered="true"
    :body-style="{ padding: bodyPadding }"
  >
    <template v-if="icon || title" #title>
      <div class="section-title-bar">
        <div class="section-title-left">
          <IconifyIcon
            v-if="icon"
            :icon="icon"
            class="section-icon"
            :style="{ color: iconColor }"
          />
          <span class="section-title-text">{{ title }}</span>
          <Tag v-if="count !== undefined" size="small" class="count-tag">
            {{ count }}
          </Tag>
        </div>
        <div class="section-title-right">
          <slot name="title-extra" />
        </div>
      </div>
    </template>
    <slot />
  </Card>
</template>

<style scoped>
.section-card {
  margin-bottom: var(--ict-space-4);
  border-radius: var(--ict-radius-xl);
  box-shadow: var(--ict-shadow-1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.section-card:hover {
  box-shadow: var(--ict-shadow-3);
}

.section-title-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title-left {
  display: flex;
  align-items: center;
  gap: var(--ict-space-2);
}

.section-icon {
  font-size: var(--ict-title-medium);
}

.section-title-text {
  font-size: var(--ict-text-lg);
  font-weight: 600;
  color: var(--ict-text-emphasis);
}

.count-tag {
  font-size: var(--ict-text-xs);
  background: var(--ict-bg-page) !important;
  border-color: var(--ict-border) !important;
  color: var(--ict-text-secondary) !important;
}
</style>

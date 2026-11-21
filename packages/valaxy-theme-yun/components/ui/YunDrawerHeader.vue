<script setup lang="ts">
import { useTemplateRef } from 'vue'

defineProps<{
  title?: string
  closeLabel: string
  closeClass?: string
}>()

defineEmits<{
  close: []
}>()

const closeButton = useTemplateRef<HTMLButtonElement>('closeButton')

function focusClose() {
  closeButton.value?.focus({ preventScroll: true })
}

defineExpose({
  closeButton,
  focusClose,
})
</script>

<template>
  <div class="yun-drawer-header">
    <span class="yun-drawer-header-title">
      <slot>{{ title }}</slot>
    </span>
    <button
      ref="closeButton"
      type="button"
      class="yun-drawer-close yun-action-btn"
      :class="closeClass"
      :aria-label="closeLabel"
      @click="$emit('close')"
    >
      <span i-ri-close-line aria-hidden="true" />
    </button>
  </div>
</template>

<style lang="scss">
.yun-drawer-header {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  min-height: var(--yun-drawer-header-height, 56px);
  padding: 0 0.625rem 0 1.25rem;
  border-bottom: 1px solid var(--yun-surface-line);
  color: var(--va-c-text);
  font-size: 1rem;
  font-weight: 600;
  text-align: left;
}

.yun-drawer-header-title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

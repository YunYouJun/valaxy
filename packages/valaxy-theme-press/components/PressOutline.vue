<script setup lang="ts">
import {
  useActiveAnchor,
  useOutline,
} from 'valaxy'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

defineProps<{
  closable?: boolean
}>()

defineEmits<{
  (e: 'close'): void
}>()

const { t } = useI18n()

const container = ref()
const marker = ref()

const { headers, handleClick } = useOutline()
useActiveAnchor(container, marker)
</script>

<template>
  <div v-show="headers.length" ref="container">
    <div class="content">
      <div class="outline-heading" :class="{ closable }">
        <div class="outline-title">
          {{ t('theme.outlineTitle') }}
        </div>
        <button
          v-if="closable"
          type="button"
          class="outline-close"
          :aria-label="t('theme.closeOutline')"
          @click="$emit('close')"
        >
          <span i-ri-close-line aria-hidden="true" />
        </button>
      </div>

      <div ref="marker" class="outline-marker" />

      <nav :aria-label="t('theme.outlineAriaLabel')">
        <PressOutlineItem
          class="va-toc relative z-1 css-i18n-toc"
          :headers="headers"
          :on-click="handleClick"
          root
        />
      </nav>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.va-toc {
  text-align: left;

  .va-toc-item {
    color: var(--va-c-text-light);
  }
}

.content {
  position: relative;
  padding-left: 16px;
  font-size: 14px;
  text-align: left;
  border-left: 1px solid var(--pr-aside-divider);
  width: calc(100% - 16px);
}

.outline-marker {
  position: absolute;
  top: 32px;
  left: -1px;
  z-index: 0;
  opacity: 0;
  width: 1px;
  height: 18px;
  background-color: var(--va-c-brand);
  transition: top var(--va-transition-duration) cubic-bezier(0, 1, 0.5, 1), background-color var(--va-transition-duration-moderate), opacity var(--va-transition-duration);
  border-top-right-radius: 2px;
  border-bottom-right-radius: 2px;
}

.outline-title {
  letter-spacing: 0.4px;
  line-height: 28px;
  font-size: 14px;
  font-weight: 600;
  color: var(--pr-c-text-1);
}

.outline-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;

  &.closable {
    min-height: 44px;
  }
}

.outline-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  border-radius: 8px;
  width: 44px;
  height: 44px;
  color: var(--pr-c-text-2);
  transition: background-color var(--va-transition-duration), color var(--va-transition-duration);

  &:hover {
    color: var(--pr-c-text-1);
    background-color: var(--va-c-bg-mute);
  }

  &:focus-visible {
    outline: 2px solid var(--va-c-brand);
    outline-offset: -2px;
  }

  > span {
    width: 18px;
    height: 18px;
  }
}

.outline-link {
  display: block;
  line-height: 28px;
  font-size: 13px;
  color: var(--pr-aside-text-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color var(--va-transition-duration-moderate);
}

.outline-link:hover,
.outline-link.active {
  color: var(--pr-aside-text-1);
  transition: color var(--va-transition-duration);
}

@media (hover: none) {
  .outline-close:hover {
    color: var(--pr-c-text-2);
    background-color: transparent;
  }
}
</style>

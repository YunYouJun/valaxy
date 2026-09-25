<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineProps<{
  outlineOpen: boolean
  showOutline: boolean
  showMenu?: boolean
  menuOpen?: boolean
  menuControls?: string
  menuLabel?: string
  menuKind?: 'docs' | 'collection'
}>()

defineEmits<{
  toggleOutline: []
  toggleMenu: []
}>()

const { t } = useI18n()
</script>

<template>
  <div class="yun-local-outline-nav" :class="{ 'has-outline': showOutline }">
    <button
      v-if="showMenu"
      type="button"
      class="yun-local-nav-trigger yun-local-menu-trigger"
      :aria-expanded="menuOpen"
      :aria-controls="menuControls"
      @click="$emit('toggleMenu')"
    >
      <span v-if="menuKind === 'collection'" i-ri-list-check class="yun-local-nav-icon" aria-hidden="true" />
      <span v-else i-ri-side-bar-line class="yun-local-nav-icon" aria-hidden="true" />
      {{ menuLabel || t('menu.title') }}
    </button>
    <button
      v-if="showOutline"
      type="button"
      class="yun-local-nav-trigger yun-local-outline-trigger"
      :aria-expanded="outlineOpen"
      aria-controls="yun-page-outline"
      @click="$emit('toggleOutline')"
    >
      {{ t('sidebar.toc') }}
      <span i-ri-arrow-right-s-line class="yun-local-outline-chevron" aria-hidden="true" />
    </button>
  </div>
</template>

<style scoped>
.yun-local-outline-nav {
  position: sticky;
  top: var(--yun-nav-height);
  z-index: var(--yun-z-nav-menu);
  display: none;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--yun-nav-height);
  border-bottom: 1px solid var(--yun-surface-line);
  background: var(--va-c-bg);
}

.yun-local-nav-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  border: 0;
  color: var(--va-c-text);
  background: transparent;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.yun-local-menu-trigger {
  padding-right: 12px;
  padding-left: max(13px, env(safe-area-inset-left));
}

.yun-local-nav-icon {
  font-size: 18px;
  color: var(--va-c-primary);
}

.yun-local-outline-trigger {
  margin-left: auto;
  padding-right: max(12px, env(safe-area-inset-right));
  padding-left: 12px;
}

.yun-local-outline-chevron {
  font-size: 20px;
  color: var(--va-c-text-light);
  transition: transform var(--va-transition-duration);
}

.yun-local-outline-trigger[aria-expanded='true'] > .yun-local-outline-chevron {
  transform: rotate(90deg);
}

.yun-local-nav-trigger:hover,
.yun-local-nav-trigger[aria-expanded='true'] {
  background: rgb(var(--va-c-primary-rgb), 0.06);
}

.yun-local-nav-trigger:focus-visible {
  outline: 2px solid var(--yun-focus-color);
  outline-offset: -3px;
}

@media (width < 1280px) {
  .yun-local-outline-nav {
    display: flex;
  }
}

@media (width >= 1024px) {
  .yun-local-menu-trigger {
    display: none;
  }

  .yun-local-outline-nav:not(.has-outline) {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .yun-local-outline-chevron {
    transition: none;
  }
}
</style>

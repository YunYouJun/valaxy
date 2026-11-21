<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeConfig } from '../composables'
import { useYunAppStore } from '../stores'

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
const yunApp = useYunAppStore()
const themeConfig = useThemeConfig()
const playAnimation = computed(() => yunApp.scrollY > 10)
const isGlass = computed(() => themeConfig.value.navbar?.glass === 'always')
</script>

<template>
  <div
    class="yun-local-outline-nav"
    :class="{
      'has-outline': showOutline,
      'play': playAnimation,
      'is-glass': isGlass,
    }"
  >
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
  z-index: var(--yun-z-local-nav, 19);
  box-sizing: border-box;
  display: none;
  align-items: center;
  justify-content: space-between;
  min-height: var(--yun-local-nav-height, 40px);
  margin-top: var(--yun-nav-height);
  border-top: 1px solid var(--yun-surface-line);
  border-bottom: 1px solid var(--yun-surface-line);
  background-color: transparent;
  transition: background-color var(--va-transition-duration-moderate) var(--yun-ease-in),
    backdrop-filter var(--va-transition-duration-moderate) var(--yun-ease-in),
    box-shadow var(--va-transition-duration-moderate) var(--yun-ease-in);
}

.yun-local-outline-nav.play,
.yun-local-outline-nav.is-glass {
  background-color: var(--yun-nav-bg-color);
  /* stylelint-disable-next-line property-no-vendor-prefix */
  -webkit-backdrop-filter: blur(var(--yun-nav-blur));
  backdrop-filter: blur(var(--yun-nav-blur));
}

@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .yun-local-outline-nav.play,
  .yun-local-outline-nav.is-glass {
    background-color: var(--yun-nav-solid);
  }
}

.yun-local-outline-nav.play {
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.06);
}

:global(html.dark) .yun-local-outline-nav.play {
  box-shadow: 0 1px 4px rgb(0 0 0 / 0.28);
}

.yun-local-nav-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: calc(var(--yun-local-nav-height, 40px) - 2px);
  border: 0;
  color: var(--va-c-text-2);
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--va-transition-duration-fast, 180ms) ease, color var(--va-transition-duration-fast, 180ms) ease;
}

.yun-local-menu-trigger {
  padding-right: 12px;
  padding-left: max(13px, env(safe-area-inset-left));
}

.yun-local-nav-icon {
  font-size: 16px;
  color: var(--va-c-link);
}

.yun-local-outline-trigger {
  margin-left: auto;
  padding-right: max(12px, env(safe-area-inset-right));
  padding-left: 12px;
}

.yun-local-outline-chevron {
  font-size: 18px;
  color: currentcolor;
  opacity: 0.72;
  transition: transform var(--va-transition-duration);
}

.yun-local-outline-trigger[aria-expanded='true'] > .yun-local-outline-chevron {
  transform: rotate(90deg);
}

.yun-local-nav-trigger[aria-expanded='true'] {
  color: var(--va-c-text);
  background-color: var(--yun-action-btn-hover-bg);
}

@media (hover: hover) and (pointer: fine) {
  .yun-local-nav-trigger:hover {
    color: var(--va-c-text);
    background-color: var(--yun-action-btn-hover-bg);
  }
}

.yun-local-nav-trigger:active {
  color: var(--va-c-text);
  background-color: var(--yun-action-btn-active-bg);
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
  .yun-local-outline-nav,
  .yun-local-nav-trigger,
  .yun-local-outline-chevron {
    transition: none;
  }
}
</style>

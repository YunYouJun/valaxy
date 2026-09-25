<script setup lang="ts">
import { useEventListener, useMediaQuery } from '@vueuse/core'
import { computed, nextTick, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useThemeConfig } from '../composables'
import { hasYunDocsSidebarNavigation, resolveYunDocsSidebar } from '../utils/sidebar'

withDefaults(defineProps<{
  floatingTrigger?: boolean
}>(), {
  floatingTrigger: true,
})

const isOpen = defineModel<boolean>('open', { default: false })

const route = useRoute()
const themeConfig = useThemeConfig()
const { t } = useI18n()

const sidebarItems = computed(() => resolveYunDocsSidebar(themeConfig.value.sidebar, route.path))
const hasNavigation = computed(() => hasYunDocsSidebarNavigation(sidebarItems.value, route.path))
const isDesktop = useMediaQuery('(min-width: 1024px)', { ssrWidth: 1280 })
const closeButton = useTemplateRef<HTMLButtonElement>('closeButton')
const triggerRef = useTemplateRef<HTMLButtonElement>('trigger')

watch(isOpen, (open) => {
  if (open)
    nextTick(() => closeButton.value?.focus({ preventScroll: true }))
})

watch(
  () => route.fullPath,
  () => isOpen.value = false,
)
watch(isDesktop, (desktop) => {
  if (desktop)
    isOpen.value = false
})

useEventListener('keydown', (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value)
    close(true)
})

function close(restoreFocus = false) {
  isOpen.value = false
  if (restoreFocus)
    nextTick(() => (triggerRef.value || document.querySelector<HTMLElement>('[aria-controls="yun-docs-sidebar"][aria-expanded="false"]'))?.focus({ preventScroll: true }))
}
</script>

<template>
  <template v-if="hasNavigation">
    <button
      v-if="floatingTrigger"
      ref="trigger"
      type="button"
      class="yun-docs-sidebar-trigger yun-icon-btn lg:hidden"
      :aria-label="t('theme.docsSidebar')"
      :aria-expanded="isOpen"
      aria-controls="yun-docs-sidebar"
      @click="isOpen = !isOpen"
    >
      <span i-ri-side-bar-line aria-hidden="true" />
    </button>

    <YunOverlay :show="isOpen" @click="close(true)" />

    <aside
      id="yun-docs-sidebar-desktop"
      class="va-card yun-docs-sidebar yun-docs-sidebar-desktop"
    >
      <nav :aria-label="t('theme.docsSidebar')">
        <YunDocsSidebarNav :items="sidebarItems" @navigate="close()" />
      </nav>
    </aside>

    <aside
      v-if="isOpen"
      id="yun-docs-sidebar"
      class="va-card yun-docs-sidebar yun-docs-sidebar-mobile"
    >
      <div class="yun-docs-sidebar-mobile-header">
        <span>{{ t('theme.docsSidebar') }}</span>
        <button
          ref="closeButton"
          type="button"
          class="yun-icon-btn"
          :aria-label="t('theme.closeMenu')"
          @click="close(true)"
        >
          <span i-ri-close-line aria-hidden="true" />
        </button>
      </div>
      <nav :aria-label="t('theme.docsSidebar')">
        <YunDocsSidebarNav :items="sidebarItems" @navigate="close()" />
      </nav>
    </aside>
  </template>
</template>

<style scoped>
.yun-docs-sidebar {
  width: min(20rem, calc(100vw - 4rem));
  padding: 1rem;
  overflow: hidden auto;
}

.yun-docs-sidebar-desktop {
  display: none;
}

.yun-docs-sidebar-mobile {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: var(--yun-z-aside);
  border-radius: 0 0.5rem 0.5rem 0;
}

.yun-docs-sidebar-mobile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 56px;
  margin: -1rem -1rem 1rem;
  padding: 0 12px 0 20px;
  border-bottom: 1px solid var(--yun-surface-line);
  font-size: 16px;
  font-weight: 600;
}

.yun-docs-sidebar-trigger {
  position: fixed;
  bottom: 4.75rem;
  left: 1rem;
  z-index: var(--yun-z-toc-btn);
  width: 2.5rem;
  height: 2.5rem;
  color: var(--va-c-primary);
  background: var(--va-c-bg-soft);
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.12);
  opacity: 0.85;
}

@media (width >= 1024px) {
  .yun-docs-sidebar-desktop {
    display: block;
    position: sticky;
    top: var(--yun-margin-top);
    z-index: auto;
    flex: 0 0 20rem;
    max-height: calc(100vh - var(--yun-margin-top));
    border-radius: 0.5rem;
    transform: none;
  }
}
</style>

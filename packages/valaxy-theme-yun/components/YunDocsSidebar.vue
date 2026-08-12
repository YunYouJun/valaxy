<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import { computed, nextTick, shallowRef, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useThemeConfig } from '../composables'
import { resolveYunDocsSidebar } from '../utils/sidebar'

const route = useRoute()
const themeConfig = useThemeConfig()
const { t } = useI18n()

const sidebarItems = computed(() => resolveYunDocsSidebar(themeConfig.value.sidebar, route.path))
const isOpen = shallowRef(false)
const triggerRef = useTemplateRef<HTMLButtonElement>('trigger')

watch(
  () => route.fullPath,
  () => isOpen.value = false,
)

useEventListener('keydown', (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value)
    close(true)
})

function toggle() {
  isOpen.value = !isOpen.value
}

function close(restoreFocus = false) {
  isOpen.value = false
  if (restoreFocus)
    nextTick(() => triggerRef.value?.focus())
}
</script>

<template>
  <template v-if="sidebarItems.length">
    <button
      ref="trigger"
      type="button"
      class="yun-docs-sidebar-trigger yun-icon-btn lg:hidden"
      :aria-label="t('theme.docsSidebar')"
      :aria-expanded="isOpen"
      aria-controls="yun-docs-sidebar"
      @click="toggle"
    >
      <span i-ri-menu-2-line aria-hidden="true" />
    </button>

    <YunOverlay :show="isOpen" @click="close()" />

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

<script lang="ts" setup>
import { isClient, onKeyStroke, useMediaQuery, useScrollLock } from '@vueuse/core'
import { asAny, useLayout } from 'valaxy'
import { computed, nextTick, onScopeDispose, provide, watch } from 'vue'
import { useRoute } from 'vue-router'
import { usePressAppStore } from '../stores'

const press = usePressAppStore()
const route = useRoute()
const isSidebarOpen = computed(() => press.activePanel === 'sidebar')
const hasDesktopSidebar = useMediaQuery('(min-width: 960px)', { ssrWidth: 1280 })
const hasDesktopNav = useMediaQuery('(min-width: 1024px)', { ssrWidth: 1280 })
const hasDesktopOutline = useMediaQuery('(min-width: 1280px)', { ssrWidth: 1280 })
const isLocked = useScrollLock(isClient ? document.body : null)
let panelTrigger: HTMLElement | null = null

watch(() => press.activePanel, (panel) => {
  if (panel && isClient) {
    const selectors = {
      menu: '[aria-controls="pr-NavScreen"]',
      sidebar: '.press-local-nav .menu',
      outline: '.outline-trigger',
    }
    panelTrigger = document.querySelector<HTMLElement>(selectors[panel]) || document.activeElement as HTMLElement
  }
  isLocked.value = panel === 'menu' || panel === 'sidebar'
}, { flush: 'sync' })

function closePanel() {
  const trigger = panelTrigger
  press.closePanel()
  nextTick(() => trigger?.focus({ preventScroll: true }))
}

provide('close-navigation', closePanel)

onKeyStroke('Escape', (event) => {
  // The site menu handles Escape locally so portaled popovers can close independently.
  if (press.activePanel && press.activePanel !== 'menu' && !event.defaultPrevented) {
    event.preventDefault()
    closePanel()
  }
})

watch([hasDesktopSidebar, hasDesktopNav, hasDesktopOutline], ([sidebar, nav, outline]) => {
  if ((sidebar && press.activePanel === 'sidebar')
    || (nav && press.activePanel === 'menu')
    || (outline && press.activePanel === 'outline')) {
    press.closePanel()
  }
})
watch(() => route.fullPath, () => press.closePanel())
onScopeDispose(() => press.closePanel())
const layout = useLayout()
</script>

<template>
  <div class="layout press-layout antialiased">
    <PressNav />
    <PressLocalNav :open="isSidebarOpen" @open-menu="press.togglePanel('sidebar')" />
    <slot name="sidebar">
      <PressSidebar v-if="layout !== 'post'" :open="isSidebarOpen" @close="closePanel" />
    </slot>
    <PressBackdrop :show="isSidebarOpen" @click="closePanel" />

    <slot>
      <RouterView v-slot="{ Component }">
        <component :is="asAny(Component)">
          <template #main-header>
            <slot name="main-header" />
          </template>

          <template #main-header-after>
            <slot name="main-header-after" />
          </template>
          <template #main>
            <slot name="main" />
          </template>
          <template #main-content>
            <slot name="main-content" />
          </template>
          <template #main-content-after>
            <slot name="main-content-after" />
          </template>
          <template #main-nav-before>
            <slot name="main-nav-before" />
          </template>
          <template #main-nav-after>
            <slot name="main-nav-after" />
          </template>
          <template #aside>
            <slot name="aside" />
          </template>
          <template #aside-custom>
            <slot name="aside-custom" />
          </template>
          <template #footer>
            <slot name="footer" />
          </template>
        </component>
      </RouterView>
    </slot>

    <PressFooter />
  </div>
</template>

<script setup lang="ts">
import { isClient, useEventListener, useMediaQuery, useScrollLock } from '@vueuse/core'
import { useSiteConfig } from 'valaxy'
import { nextTick, onBeforeUnmount, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useThemeConfig } from '../composables'
import { useYunAppStore } from '../stores'

defineOptions({
  inheritAttrs: false,
})

const { t } = useI18n()
const route = useRoute()
const siteConfig = useSiteConfig()
const themeConfig = useThemeConfig()
const yunApp = useYunAppStore()
const isLocked = useScrollLock(isClient ? document.documentElement : null)
const isDesktop = useMediaQuery('(min-width: 1024px)', { ssrWidth: 1280 })

const dragX = shallowRef(0)
const isDragging = shallowRef(false)
let touchStartX = 0
let touchStartY = 0
let swipeTracking = false

function closeMenu(restoreFocus = false, keepDrag = false) {
  if (!yunApp.fullscreenMenu.isOpen)
    return
  if (!keepDrag)
    dragX.value = 0
  isDragging.value = false
  yunApp.fullscreenMenu.toggle()
  if (restoreFocus)
    nextTick(() => document.querySelector<HTMLElement>('.yun-nav-menu .vt-hamburger')?.focus({ preventScroll: true }))
}

function onAfterLeave() {
  dragX.value = 0
  isDragging.value = false
}

watch(
  () => yunApp.fullscreenMenu.isOpen,
  (open) => {
    isLocked.value = open
    if (open) {
      dragX.value = 0
      isDragging.value = false
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  isLocked.value = false
})

watch(() => route.fullPath, () => {
  if (yunApp.fullscreenMenu.isOpen)
    closeMenu()
})

watch(isDesktop, (desktop) => {
  if (desktop && yunApp.fullscreenMenu.isOpen)
    closeMenu()
})

useEventListener('keydown', (event: KeyboardEvent) => {
  if (event.key === 'Escape' && yunApp.fullscreenMenu.isOpen) {
    event.preventDefault()
    closeMenu(true)
  }
})

function onTouchStart(event: TouchEvent) {
  if (event.touches.length !== 1)
    return
  touchStartX = event.touches[0].clientX
  touchStartY = event.touches[0].clientY
  swipeTracking = true
  isDragging.value = false
}

function onTouchMove(event: TouchEvent) {
  if (!swipeTracking || event.touches.length !== 1)
    return
  const dx = event.touches[0].clientX - touchStartX
  const dy = event.touches[0].clientY - touchStartY
  if (!isDragging.value) {
    if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) {
      swipeTracking = false
      return
    }
    if (dx < -10 && Math.abs(dx) > Math.abs(dy))
      isDragging.value = true
  }
  if (isDragging.value)
    dragX.value = Math.min(0, dx)
}

function onTouchEnd() {
  if (!swipeTracking && !isDragging.value)
    return
  swipeTracking = false
  if (isDragging.value && dragX.value < -64) {
    closeMenu(true, true)
    return
  }
  isDragging.value = false
  dragX.value = 0
}
</script>

<template>
  <Transition name="yun-drawer-backdrop">
    <div
      v-if="yunApp.fullscreenMenu.isOpen"
      v-bind="$attrs"
      class="yun-fullscreen-backdrop fixed inset-0 z-$yun-z-fullscreen-menu"
      :style="isDragging ? { opacity: Math.max(0.2, 1 + dragX / 280), transition: 'none' } : undefined"
      aria-hidden="true"
      @click="closeMenu(true)"
    />
  </Transition>

  <Transition name="slide-left" @after-leave="onAfterLeave">
    <div
      v-if="yunApp.fullscreenMenu.isOpen"
      v-bind="$attrs"
      p="t-14 md:t-18"
      flex="~ col"
      role="dialog"
      :aria-label="t('sidebar.overview')"
      class="yun-fullscreen-menu fixed left-0 bottom-0 top-0 bg-$va-c-bg-soft z-$yun-z-fullscreen-menu overflow-auto shadow-2xl"
      :class="{ 'is-dragging': isDragging }"
      :style="dragX !== 0 ? { '--yun-drawer-drag': `${dragX}px` } : undefined"
      @touchstart.passive="onTouchStart"
      @touchmove.passive="onTouchMove"
      @touchend="onTouchEnd"
      @touchcancel="onTouchEnd"
    >
      <!-- <div v-if="app.isMobile" class="flex-center gap-2">
        <YunToggleDark transition />
        <YunToggleLocale v-if="app.showToggleLocale" />
      </div> -->

      <!-- <YunFullscreenMenuList /> -->
      <YunSiteInfo class="text-center" />
      <YunGradientDivider class="my-4" />
      <YunPostsInfo />
      <template v-if="siteConfig.social?.length">
        <YunGradientDivider class="my-4" />
        <YunSocialLinks />
      </template>
      <template v-if="themeConfig.pages?.length">
        <YunGradientDivider class="my-4" />
        <YunSidebarLinks />
      </template>

      <div class="mt-auto pt-4 flex-center">
        <YunConfig />
      </div>
    </div>
  </Transition>
</template>

<style lang="scss">
.yun-fullscreen-backdrop {
  background: rgb(250 251 253 / 0.45);
  /* stylelint-disable-next-line property-no-vendor-prefix */
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
}

html.dark .yun-fullscreen-backdrop {
  background: rgb(14 16 22 / 0.56);
}

.yun-fullscreen-menu {
  width: min(22rem, calc(100vw - 3.25rem));
  padding-inline: max(1.25rem, env(safe-area-inset-left));
  padding-bottom: calc(1.5rem + env(safe-area-inset-bottom));
  border-radius: 0 var(--yun-drawer-radius, 1rem) var(--yun-drawer-radius, 1rem) 0;
  touch-action: pan-y;
  transform: translateX(var(--yun-drawer-drag, 0));
  transition: transform 200ms cubic-bezier(0.22, 1, 0.36, 1);

  &.is-dragging {
    transition: none;
  }
}

@keyframes yun-drawer-stagger {
  from {
    opacity: 0;
    transform: translateX(-12px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.yun-fullscreen-menu > * {
  animation: yun-drawer-stagger 260ms cubic-bezier(0.22, 1, 0.36, 1) backwards;

  @for $i from 1 through 10 {
    &:nth-child(#{$i}) {
      animation-delay: #{($i - 1) * 32}ms;
    }
  }
}

.yun-drawer-backdrop-enter-active,
.yun-drawer-backdrop-leave-active {
  transition: opacity var(--va-transition-duration) var(--yun-ease-in-out);
}

.yun-drawer-backdrop-enter-from,
.yun-drawer-backdrop-leave-to {
  opacity: 0;
}

.slide-left-enter-active {
  transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity var(--va-transition-duration-fast) ease;
}

.slide-left-leave-active {
  transition: transform 180ms var(--yun-ease-in),
    opacity 180ms var(--yun-ease-in);
}

.slide-left-leave-from {
  transform: translateX(var(--yun-drawer-drag, 0));
}

.slide-left-enter-from,
.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

.slide-down-enter-active,
.slide-down-leave-active {
  opacity: 1;
  transition: transform var(--va-transition-duration) var(--yun-ease-in-out),
    opacity var(--va-transition-duration-fast) var(--yun-ease-in-out);
  transform: translateY(0);
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

@media (prefers-reduced-motion: reduce) {
  .yun-fullscreen-menu {
    transition: none;
  }

  .yun-fullscreen-menu > * {
    animation: none;
  }

  .yun-drawer-backdrop-enter-active,
  .yun-drawer-backdrop-leave-active,
  .slide-left-enter-active,
  .slide-left-leave-active,
  .slide-down-enter-active,
  .slide-down-leave-active {
    transition: none;
  }
}
</style>

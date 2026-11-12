<script lang="ts" setup>
import { useHead } from '@unhead/vue'
import { useEventListener } from '@vueuse/core'
import { TooltipProvider } from 'reka-ui'
import { useAppStore } from 'valaxy'
import { computed, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeConfig } from './composables'
import { useYunAppStore } from './stores'

const appStore = useAppStore()
const themeConfig = useThemeConfig()
const route = useRoute()

// Use a safe default for SSR; real themeColor is applied after mount
// to avoid hydration mismatch when user prefers dark mode.
const safeThemeColor = computed(() => appStore.themeColor)

const loadSerifFont = shallowRef(false)
const showSerifFont = computed(() => {
  const scope = themeConfig.value.serifFont
  return loadSerifFont.value && scope !== 'off' && (scope !== 'except-home' || route.meta.layout !== 'home')
})
function loadFonts() {
  loadSerifFont.value = true
}

// Use the fallback font for first paint, then load the optional web font.
useEventListener('load', loadFonts, { once: true })

useHead(() => ({
  link: showSerifFont.value
    ? [{
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@900&display=swap',
      }]
    : [],

  meta: [
    {
      name: 'theme-color',
      content: safeThemeColor,
    },
    {
      name: 'msapplication-TileColor',
      content: safeThemeColor,
    },
  ],
}))

const app = useAppStore()
const yun = useYunAppStore()

watch(
  () => route.meta.layout,
  () => {
    if (route.meta.layout === 'home' || app.isMobile)
      yun.leftSidebar.isOpen = false
    else
      yun.leftSidebar.isOpen = false
  },
  { immediate: true },
)

function updateViewportHeight() {
  document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`)
}

onMounted(() => {
  if (document.readyState === 'complete')
    loadFonts()

  // The viewport can be zero when an iframe mounts inside a hidden panel.
  updateViewportHeight()
  window.addEventListener('resize', updateViewportHeight)
  app.showLoading = false
})
onBeforeUnmount(() => window.removeEventListener('resize', updateViewportHeight))
</script>

<template>
  <TooltipProvider>
    <YunStratoApp v-if="yun.isStrato" />

    <YunPageHeaderGradient />
    <YunNavMenu />

    <YunFullscreenMenu v-if="yun.isNimbo" class="lg:hidden" />
    <YunStratoSidebar v-if="yun.isStrato" />

    <ClientOnly>
      <YunFireworks v-if="themeConfig.fireworks?.enable" />
    </ClientOnly>
    <slot name="bg">
      <YunBg v-if="themeConfig.bg_image?.enable" />
    </slot>
    <ClientOnly>
      <Transition name="fade">
        <YunLoading v-if="app.showLoading" />
      </Transition>
    </ClientOnly>
    <YunBackToTop />
  </TooltipProvider>
</template>

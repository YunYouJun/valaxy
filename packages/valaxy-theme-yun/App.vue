<script lang="ts" setup>
import { useHead } from '@unhead/vue'
import { TooltipProvider } from 'reka-ui'
import { useAppStore } from 'valaxy'
import { computed, onBeforeUnmount, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeConfig } from './composables'
import { useYunAppStore } from './stores'

const appStore = useAppStore()

// Use a safe default for SSR; real themeColor is applied after mount
// to avoid hydration mismatch when user prefers dark mode.
const safeThemeColor = computed(() => appStore.themeColor)

useHead({
  link: [
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@900&display=swap',
    },
  ],

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
})

const themeConfig = useThemeConfig()

const app = useAppStore()
const yun = useYunAppStore()
const route = useRoute()

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

<script lang="ts" setup>
import { useHead } from '@unhead/vue'
import { useAppStore } from 'valaxy'
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeConfig } from './composables'
import { useYunAppStore } from './stores'

const appStore = useAppStore()

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
      content: appStore.themeColor,
    },
    {
      name: 'msapplication-TileColor',
      content: appStore.themeColor,
    },
  ],
})

const themeConfig = useThemeConfig()

const app = useAppStore()
const yunStore = useYunAppStore()
const route = useRoute()

watch(
  () => route.meta.layout,
  () => {
    if (route.meta.layout === 'home' || app.isMobile)
      yunStore.leftSidebar.isOpen = false
    else
      yunStore.leftSidebar.isOpen = true
  },
  { immediate: true },
)

onMounted(() => {
  // for mobile vh
  document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`)
  app.showLoading = false
})

const isDev = import.meta.env.DEV
</script>

<template>
  <YunDebug v-if="isDev" />

  <YunPageHeaderGradient />
  <YunNavMenu />
  <YunFullscreenMenu />
  <YunFireworks v-if="themeConfig.fireworks.enable" />
  <slot name="bg">
    <YunBg v-if="themeConfig.bg_image.enable" />
  </slot>
  <Transition name="fade">
    <YunLoading v-if="app.showLoading" />
  </Transition>
  <YunBackToTop />

  <!-- TODO -->
  <!-- <YunDock /> -->
</template>

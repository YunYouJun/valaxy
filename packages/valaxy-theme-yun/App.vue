<script lang="ts" setup>
import { useHead } from '@unhead/vue'
import { useAppStore, useSiteConfig } from 'valaxy'
import { onMounted } from 'vue'
import { useThemeConfig } from './composables'

useHead({
  link: [
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@900&display=swap',
    },
  ],
})

const siteConfig = useSiteConfig()
const themeConfig = useThemeConfig()

const app = useAppStore()
onMounted(() => {
  app.showLoading = false
})
</script>

<template>
  <YunFireworks v-if="themeConfig.fireworks.enable" />
  <slot name="bg">
    <YunBg v-if="themeConfig.bg_image.enable" />
  </slot>
  <YunSearchTrigger v-if="siteConfig.search.enable" />
  <Transition name="fade">
    <YunLoading v-if="app.showLoading" />
  </Transition>
  <YunBackToTop />
</template>

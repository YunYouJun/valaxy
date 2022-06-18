<script setup lang="ts">
import { computed } from 'vue'
import { useHead } from '@vueuse/head'
import { useCssVar } from '@vueuse/core'
import { isDark } from './composables'

// https://github.com/vueuse/head
// you can use this to manipulate the document head in any components,
// they will be rendered correctly in the html results with vite-ssg
import { useConfig } from './config'

const config = useConfig()
useHead({
  title: config.value.title,
  link: [
    {
      rel: 'icon',
      href: config.value.favicon,
      type: config.value.favicon.endsWith('svg') ? 'image/svg+xml' : 'image/png',
    },
  ],
  meta: [
    { name: 'description', content: config.value.description },
    {
      name: 'theme-color',
      content: computed(() => isDark.value ? '#00aba9' : '#ffffff'),
    },
  ],
})

const bgImg = useCssVar('--yun-bg-img')
const bgImgUrl = computed(() => config.value.themeConfig.bg_image.url)
if (bgImgUrl.value)
  bgImg.value = config.value.themeConfig.bg_image.url
</script>

<template>
  <router-view />
</template>

<script lang="ts" setup>
import { useHead } from '@vueuse/head'
import { useSiteConfig } from 'valaxy'
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
</script>

<template>
  <slot name="bg">
    <YunBg v-if="themeConfig.bg_image.enable" />
  </slot>
  <YunSearch v-if="siteConfig.search.enable" />
</template>

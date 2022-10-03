<script setup lang="ts">
import { computed, provide, ref } from 'vue'
import { useHead } from '@vueuse/head'
// @ts-expect-error virtual module
import ValaxyUserApp from '/@valaxyjs/UserAppVue'
import { isDark } from './composables'

// https://github.com/vueuse/head
// you can use this to manipulate the document head in any components,
// they will be rendered correctly in the html results with vite-ssg
import { useConfig } from './config'

// <link rel="apple-touch-icon" href="/pwa-192x192.png">
// <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#00aba9">

const config = useConfig()
const themeColor = computed(() => isDark.value ? '#00aba9' : '#ffffff')
useHead({
  title: config.value.title,
  link: [
    {
      rel: 'icon',
      href: config.value.favicon,
      type: config.value.favicon?.endsWith('svg') ? 'image/svg+xml' : 'image/png',
    },
  ],
  meta: [
    { name: 'description', content: config.value.description },
    {
      name: 'theme-color',
      content: themeColor,
    },
    {
      name: 'msapplication-TileColor',
      content: themeColor,
    },
  ],
})

const onContentUpdated = ref()
provide('onContentUpdated', onContentUpdated)
</script>

<template>
  <ValaxyUserApp />
  <ValaxyAddons />
  <router-view />
</template>

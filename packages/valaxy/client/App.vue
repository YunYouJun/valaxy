<script setup lang="ts">
import { computed, provide, ref } from 'vue'
import { useHead, useSeoMeta } from '@vueuse/head'
// @ts-expect-error virtual module
import ValaxyUserApp from '/@valaxyjs/UserAppVue'
// @ts-expect-error virtual module
import ValaxyThemeApp from '/@valaxyjs/ThemeAppVue'
import pkg from 'valaxy/package.json'
import ValaxyAddons from './components/ValaxyAddons.vue'
import { isDark, useFrontmatter } from './composables'

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
    { name: 'description', content: computed(() => config.value.description) },
    {
      name: 'theme-color',
      content: themeColor,
    },
    {
      name: 'msapplication-TileColor',
      content: themeColor,
    },
    {
      name: 'generator',
      content: `Valaxy ${pkg.version}`,
    },
  ],
})

// seo
// todo: get first image url from markdown
const fm = useFrontmatter()
useSeoMeta({
  description: computed(() => fm.value.excerpt || config.value.description),
  ogDescription: computed(() => fm.value.excerpt || config.value.description),
  ogLocale: computed(() => fm.value.lang || config.value.lang),
  ogSiteName: computed(() => config.value.title),
  ogTitle: computed(() => fm.value.title || config.value.title),
  ogImage: computed(() => config.value.favicon),
  ogUrl: computed(() => fm.value.url || config.value.url),
})

const onContentUpdated = ref()
provide('onContentUpdated', onContentUpdated)
</script>

<template>
  <ValaxyThemeApp />
  <ValaxyAddons />
  <ValaxyUserApp />
  <router-view />
</template>

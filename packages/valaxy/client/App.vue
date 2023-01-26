<script setup lang="ts">
import { computed, onBeforeMount, provide, ref } from 'vue'
import { useHead, useSeoMeta } from '@vueuse/head'
// @ts-expect-error virtual module
import ValaxyUserApp from '/@valaxyjs/UserAppVue'
// @ts-expect-error virtual module
import ValaxyThemeApp from '/@valaxyjs/ThemeAppVue'
import pkg from 'valaxy/package.json'
import { useI18n } from 'vue-i18n'
import ValaxyAddons from './components/ValaxyAddons.vue'
import { isDark, useFrontmatter } from './composables'

// https://github.com/vueuse/head
// you can use this to manipulate the document head in any components,
// they will be rendered correctly in the html results with vite-ssg
import { useSiteConfig } from './config'

// <link rel="apple-touch-icon" href="/pwa-192x192.png">
// <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#00aba9">

const siteConfig = useSiteConfig()
// todo, allow user config
const themeColor = computed(() => isDark.value ? '#000' : '#ffffff')
const fm = useFrontmatter()

const { locale } = useI18n()

useHead({
  title: computed(() => fm.value[`title_${locale.value}`] || fm.value.title),
  titleTemplate: computed(() => fm.value.titleTemplate || ((title: string) => title ? `${title} - ${siteConfig.value.title}` : siteConfig.value.title)),
  link: [
    {
      rel: 'icon',
      href: siteConfig.value.favicon,
      type: siteConfig.value.favicon?.endsWith('svg') ? 'image/svg+xml' : 'image/png',
    },
  ],
  meta: [
    { name: 'description', content: computed(() => siteConfig.value.description) },
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
useSeoMeta({
  description: computed(() => fm.value.excerpt || siteConfig.value.description),
  ogDescription: computed(() => fm.value.excerpt || siteConfig.value.description),
  ogLocale: computed(() => fm.value.lang || siteConfig.value.lang),
  ogSiteName: computed(() => siteConfig.value.title),
  ogTitle: computed(() => fm.value.title || siteConfig.value.title),
  ogImage: computed(() => siteConfig.value.favicon),
  ogUrl: computed(() => fm.value.url || siteConfig.value.url),
})

const onContentUpdated = ref()
provide('onContentUpdated', onContentUpdated)

onBeforeMount(() => {
  // for browser with nav bar height
  document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`)
})
</script>

<template>
  <ValaxyThemeApp />
  <ValaxyAddons />
  <ValaxyUserApp />
  <router-view />
</template>

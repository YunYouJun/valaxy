<script setup lang="ts">
// TODO: add docs to override ValaxyApp
import { computed } from 'vue'
// import { useHead, useSeoMeta } from '@unhead/vue'
import { useSeoMeta } from '@unhead/vue'

// @ts-expect-error virtual module
import ValaxyUserApp from '/@valaxyjs/UserAppVue'
// @ts-expect-error virtual module
import ValaxyThemeApp from '/@valaxyjs/ThemeAppVue'

import { useI18n } from 'vue-i18n'
import { definePerson, defineWebPage, defineWebSite, useSchemaOrg } from '@unhead/schema-org'

// https://github.com/vueuse/head
// you can use this to manipulate the document head in any components,
// they will be rendered correctly in the html results with vite-ssg
import { useSiteConfig } from '../config'
import { useFrontmatter, useValaxyHead } from '../composables'
import { useTimezone } from '../composables/global'
import ValaxyAddons from './ValaxyAddons.vue'

// <link rel="apple-touch-icon" href="/pwa-192x192.png">
// <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#00aba9">

const siteConfig = useSiteConfig()
// todo, allow user config
const fm = useFrontmatter()

const { locale } = useI18n()

const title = computed(() => fm.value[`title_${locale.value}`] || fm.value.title)

// seo
// todo: get first image url from markdown
const siteUrl = computed(() => fm.value.url || siteConfig.value.url)
const description = computed(() => fm.value.excerpt || fm.value.description || siteConfig.value.description)

useSeoMeta({
  description,
  ogDescription: description,
  ogLocale: computed(() => locale.value || fm.value.lang || siteConfig.value.lang || 'en'),
  ogLocaleAlternate: computed(() => siteConfig.value.languages.filter(l => l !== locale.value)),
  ogSiteName: computed(() => siteConfig.value.title),
  ogTitle: computed(() => fm.value.title || siteConfig.value.title),
  ogImage: computed(() => fm.value.ogImage || fm.value.cover || siteConfig.value.favicon),
  ogType: 'website',
  ogUrl: siteUrl,
})

// for SEO
useSchemaOrg([
  // https://unhead.unjs.io/guide/guides/identity.html
  // Personal Website or Blog
  definePerson({
    name: siteConfig.value.author.name,
    url: siteUrl.value,
    image: siteConfig.value.author.avatar,
    sameAs: siteConfig.value.social.map(s => s.link),
  }),
  defineWebSite({
    name: title.value,
    datePublished: computed(() => fm.value.date),
    dateModified: computed(() => fm.value.updated),
  }),
  defineWebPage(),
])

useTimezone()

useValaxyHead()
</script>

<template>
  <ValaxyThemeApp />
  <ValaxyAddons />
  <ValaxyUserApp />
  <router-view />
</template>

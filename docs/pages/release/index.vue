<script setup lang="ts">
import { useHead } from '@unhead/vue'
import ReleaseV1Page from '../../components/release/ReleaseV1Page.vue'

useHead({
  htmlAttrs: { lang: 'en' },
  title: 'Valaxy 1.0 — Made for words. Built for freedom.',
  meta: [
    { name: 'description', content: 'Meet Valaxy 1.0, the release preview of the Vue and Markdown powered static blog framework.' },
    { property: 'og:title', content: 'Valaxy 1.0 — Made for words. Built for freedom.' },
    { property: 'og:description', content: 'Explore the next chapter of Valaxy: Markdown, Vue, themes, and a focused SSG engine.' },
    { property: 'og:image', content: 'https://valaxy.site/valaxy-logo.png' },
  ],
})
</script>

<template>
  <ReleaseV1Page locale="en" />
</template>

<route lang="yaml">
meta:
  layout: release
</route>

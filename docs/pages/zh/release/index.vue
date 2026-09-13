<script setup lang="ts">
import { useHead } from '@unhead/vue'
import ReleaseV1Page from '../../../components/release/ReleaseV1Page.vue'

useHead({
  title: 'Valaxy 1.0 — 为书写而生，向自由而进',
  htmlAttrs: { lang: 'zh-CN' },
  meta: [
    { name: 'description', content: '认识 Valaxy 1.0：由 Vue 与 Markdown 驱动的静态博客框架 1.0 发布预览。' },
    { property: 'og:title', content: 'Valaxy 1.0 — 为书写而生，向自由而进' },
    { property: 'og:description', content: '从 Markdown 到主题与内置 SSG，探索 Valaxy 1.0 发布预览。' },
    { property: 'og:image', content: 'https://valaxy.site/valaxy-logo.png' },
  ],
})
</script>

<template>
  <ReleaseV1Page locale="zh" />
</template>

<route lang="yaml">
meta:
  layout: release
</route>

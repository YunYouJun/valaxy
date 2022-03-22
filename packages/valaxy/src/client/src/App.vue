<script setup lang="ts">
// https://github.com/vueuse/head
// you can use this to manipulate the document head in any components,
// they will be rendered correctly in the html results with vite-ssg
import { useHead } from '@vueuse/head'
useHead({
  title: 'Theme Yun',
  meta: [
    { name: 'description', content: 'Theme Yun' },
  ],
  link: [
    { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/star-markdown-css@0.3.0/dist/yun/yun-markdown.min.css' },
  ],
})
</script>

<template>
  <router-view />
</template>

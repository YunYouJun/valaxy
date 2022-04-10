<script setup lang="ts">
// https://github.com/vueuse/head
// you can use this to manipulate the document head in any components,
// they will be rendered correctly in the html results with vite-ssg
import { useHead } from '@vueuse/head'
import { useConfig } from './config'

const config = useConfig()
useHead({
  title: config.value.title,
  meta: [
    { name: 'description', content: config.value.description },
  ],
})
</script>

<template>
  <router-view />
</template>

<script lang="ts" setup>
import { useHead } from '@vueuse/head'
import { useConfig } from 'valaxy'

useHead({
  link: [
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@900&display=swap',
    },
  ],
})

const config = useConfig()
</script>

<template>
  <slot name="bg">
    <YunBg v-if="config.themeConfig.bg_image.enable" />
  </slot>
  <YunSearch v-if="config.search.enable" />
</template>

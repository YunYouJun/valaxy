<template>
  <div id="banner">
    <div class="banner-line vertical-line-top" />
    <div class="banner-char-container" />
    <div class="banner-line vertical-line-bottom" />
  </div>
</template>

<script lang="ts" setup>
// import { useConfig } from '~/composables/config'
import { onMounted } from 'vue'
import { initBanner } from '~/utils'
// const { themeConfig } = useConfig()

onMounted(() => {
  // initBanner(themeConfig.banner.title)
  initBanner('云游君的小站')
})
</script>

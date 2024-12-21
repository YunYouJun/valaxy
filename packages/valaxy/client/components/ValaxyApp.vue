<script setup lang="ts">
import { useLayout, useValaxyApp } from '../composables'

import ValaxyAddons from './ValaxyAddons.vue'
// @ts-expect-error virtual module
import ValaxyThemeApp from '/@valaxyjs/ThemeAppVue'
// @ts-expect-error virtual module
import ValaxyUserApp from '/@valaxyjs/UserAppVue'

// <link rel="apple-touch-icon" href="/pwa-192x192.png">
// <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#00aba9">

const layout = useLayout()

if (layout.value !== 'empty') {
  useValaxyApp()
}
</script>

<template>
  <template v-if="layout !== 'empty'">
    <ValaxyThemeApp />
    <ValaxyAddons />
    <ValaxyUserApp />
  </template>
  <router-view />
</template>

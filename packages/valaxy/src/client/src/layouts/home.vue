<template>
  <main class="yun-main justify-center items-center" :class="(isHome && !app.isSidebarOpen) && 'pl-0'" flex="~ col" w="full">
    <ValaxySidebar />
    <YunBanner />
    <YunSay w="full" />

    <router-view />

    <ValaxyFooter>
      <slot name="footer" />
    </ValaxyFooter>
  </main>
</template>

<script lang="ts" setup>
import { useLayout } from '~/composables'

import { useAppStore } from '~/stores/app'
const app = useAppStore()

const isHome = useLayout('home')
</script>

<script lang="ts" setup>
import { useConfig } from 'valaxy'
import { useLayout } from '~/composables'

import { useAppStore } from '~/stores/app'
const app = useAppStore()

const config = useConfig()

const isHome = useLayout('home')
</script>

<template>
  <YunBg v-if="config.themeConfig.bg_image.enable" />

  <main class="yun-main justify-center items-center" :class="(isHome && !app.isSidebarOpen) && 'pl-0'" flex="~ col" w="full">
    <ValaxySidebar>
      <slot name="sidebar">
        <YunSidebar />
      </slot>
    </ValaxySidebar>

    <YunBanner />
    <YunSay w="full" />

    <slot name="board" />

    <slot>
      <router-view />
    </slot>

    <YunFooter>
      <slot name="footer" />
    </YunFooter>
  </main>

  <YunSearch v-if="config.search.enable" />
</template>

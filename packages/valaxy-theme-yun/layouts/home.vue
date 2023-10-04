<script lang="ts" setup>
import { useAppStore, useLayout } from 'valaxy'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeConfig } from '../composables'

const app = useAppStore()
const isHome = useLayout('home')
const themeConfig = useThemeConfig()

const route = useRoute()
const isPage = computed(() => route.path.startsWith('/page'))
</script>

<template>
  <main
    class="yun-main flex-center"
    :class="(isHome && !app.isSidebarOpen) ? 'pl-0' : 'md:pl-$va-sidebar-width'" flex="~ col" w="full"
  >
    <YunSidebar :show-hamburger="true" />

    <template v-if="!isPage">
      <YunBanner v-if="themeConfig.banner.enable" />
      <YunSay v-if="themeConfig.say.enable" w="full" />
    </template>

    <YunNotice
      v-if="themeConfig.notice.enable"
      :content="themeConfig.notice.content" mt="4"
    />

    <slot name="board" />

    <slot>
      <router-view />
    </slot>

    <YunFooter />
  </main>
</template>
